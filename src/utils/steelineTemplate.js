import JSZip from 'jszip'

const SHEET_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
const DRAW_NS = 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing'
const MAIN_DRAW_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main'
const TEMPLATE_URL = new URL('../templates/Steeline template.xlsx', import.meta.url).href

const normalizeText = (value) => String(value || '').replace(/\s+/g, ' ').trim().toLowerCase()

const findCell = (doc, ref) => Array.from(doc.getElementsByTagNameNS(SHEET_NS, 'c')).find((cell) => cell.getAttribute('r') === ref)

const setCellText = (doc, ref, value) => {
  const cell = findCell(doc, ref)
  if (!cell) return

  while (cell.firstChild) {
    cell.removeChild(cell.firstChild)
  }

  cell.setAttribute('t', 'inlineStr')
  const isNode = doc.createElementNS(SHEET_NS, 'is')
  const textNode = doc.createElementNS(SHEET_NS, 't')
  textNode.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve')
  textNode.textContent = String(value ?? '')
  isNode.appendChild(textNode)
  cell.appendChild(isNode)
}

const getSheetCellText = (cell) => {
  const textNodes = cell.getElementsByTagNameNS(SHEET_NS, 't')
  return Array.from(textNodes)
    .map((node) => node.textContent || '')
    .join('')
}

const setShapeText = (shape, value, doc) => {
  const textBody = shape.getElementsByTagNameNS(DRAW_NS, 'txBody')[0]
  if (!textBody) return

  const paragraphs = Array.from(textBody.getElementsByTagNameNS(MAIN_DRAW_NS, 'p'))
  const paragraph =
    paragraphs[0] ||
    (() => {
      const newParagraph = doc.createElementNS(MAIN_DRAW_NS, 'a:p')
      textBody.appendChild(newParagraph)
      return newParagraph
    })()

  Array.from(paragraph.childNodes).forEach((node) => {
    const localName = node?.localName
    if (localName && localName !== 'pPr') {
      paragraph.removeChild(node)
    }
  })

  const run = doc.createElementNS(MAIN_DRAW_NS, 'a:r')
  const textNode = doc.createElementNS(MAIN_DRAW_NS, 'a:t')
  textNode.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve')
  textNode.textContent = String(value ?? '')
  run.appendChild(textNode)
  paragraph.appendChild(run)
}

const fillHeader = (doc, jobNumber) => {
  const currentDate = new Date().toLocaleDateString('en-AU')
  setCellText(doc, 'B12', jobNumber || '')
  setCellText(doc, 'F12', currentDate)
}

const deriveKeyedDifferent = (keyedDifferent, keyedAlike) => {
  if (String(keyedDifferent || '').trim()) return keyedDifferent

  const value = String(keyedAlike || '').toLowerCase()
  if (value === 'yes') return 'No'
  if (value === 'no') return 'Yes'
  return ''
}

const fillDoorRows = (doc, details) => {
  const rowValues = {
    28: details.style,
    29: details.colour,
    30: details.doorHeight,
    31: details.doorWidth,
    32: details.woodGrainOrSmooth,
    33: details.fittings,
    34: details.locking,
    35: details.keyedAlike,
    36: deriveKeyedDifferent(details.keyedDifferent, details.keyedAlike),
    37: details.shootBolts,
    38: details.windowType,
    39: details.taperVilo,
    40: details.notched,
    41: details.jambs,
    42: details.pelmet,
    43: details.steelWrapForTransport,
    44: details.packForTransport,
    45: details.motor,
    46: details.other,
  }

  Object.entries(rowValues).forEach(([rowNumber, value]) => {
    setCellText(doc, `C${rowNumber}`, value || '')
  })
}

const setTaperTextboxValues = (shape, value, doc) => {
  setShapeText(shape, value, doc)
}

const fillTaperDiagram = (doc, details) => {
  const taperRequired = String(details.taperVilo || '').toLowerCase()
  const isRequired = taperRequired === 'yes' || taperRequired === 'y'
  if (!isRequired) return

  const side = String(details.taperViloSide || 'LHS Vilo').toLowerCase()
  const lhValue = details.lhTaperVilo ? `${details.lhTaperVilo}mm` : ''
  const rhValue = details.rhTaperVilo ? `${details.rhTaperVilo}mm` : ''

  const textBoxShapes = Array.from(doc.getElementsByTagNameNS(DRAW_NS, 'sp')).filter((shape) => {
    const cNvPr = shape.getElementsByTagNameNS(DRAW_NS, 'cNvPr')[0]
    if (!cNvPr) return false
    const name = String(cNvPr.getAttribute('name') || '')
    const title = String(cNvPr.getAttribute('title') || '')
    const hasText = normalizeText(Array.from(shape.getElementsByTagNameNS(MAIN_DRAW_NS, 't')).map((node) => node.textContent || '').join(''))
    return name.startsWith('TextBox') && !title && !hasText
  })

  textBoxShapes.sort((left, right) => {
    const leftAnchor = left.parentNode
    const rightAnchor = right.parentNode
    const leftCol = Number(leftAnchor?.getElementsByTagNameNS(DRAW_NS, 'from')[0]?.getElementsByTagNameNS(DRAW_NS, 'col')[0]?.textContent || 0)
    const rightCol = Number(rightAnchor?.getElementsByTagNameNS(DRAW_NS, 'from')[0]?.getElementsByTagNameNS(DRAW_NS, 'col')[0]?.textContent || 0)
    return leftCol - rightCol
  })

  const values = side.includes('rhs')
    ? ['', lhValue, rhValue]
    : [lhValue, rhValue, '']

  textBoxShapes.slice(0, 3).forEach((shape, index) => {
    setTaperTextboxValues(shape, values[index] || '', doc)
  })
}

const triggerDownload = (blob, fileName) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export async function downloadSteelineOrderTemplate({ manufacturerDetails, jobNumber }) {
  const response = await fetch(TEMPLATE_URL)
  if (!response.ok) {
    throw new Error('Failed to load Steeline template file.')
  }

  const templateBuffer = await response.arrayBuffer()
  const zip = await JSZip.loadAsync(templateBuffer)
  const sheetFile = zip.file('xl/worksheets/sheet1.xml')
  const drawingFile = zip.file('xl/drawings/drawing1.xml')
  if (!sheetFile || !drawingFile) {
    throw new Error('Template structure is invalid. Missing worksheet or drawing XML.')
  }

  const parser = new DOMParser()
  const serializer = new XMLSerializer()

  const sheetDoc = parser.parseFromString(await sheetFile.async('string'), 'application/xml')
  const drawingDoc = parser.parseFromString(await drawingFile.async('string'), 'application/xml')

  fillHeader(sheetDoc, jobNumber)
  fillDoorRows(sheetDoc, manufacturerDetails || {})
  fillTaperDiagram(drawingDoc, manufacturerDetails || {})

  zip.file('xl/worksheets/sheet1.xml', serializer.serializeToString(sheetDoc))
  zip.file('xl/drawings/drawing1.xml', serializer.serializeToString(drawingDoc))

  const outputBlob = await zip.generateAsync({ type: 'blob' })
  const stamp = new Date().toISOString().slice(0, 10)
  const safeJob = String(jobNumber || 'job').replace(/[^a-zA-Z0-9_-]/g, '-')
  triggerDownload(outputBlob, `Steeline-Order-${safeJob}-${stamp}.xlsx`)
}
