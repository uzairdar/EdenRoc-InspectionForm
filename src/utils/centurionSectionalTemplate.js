import JSZip from 'jszip'

const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
const WP_NS = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
const TEMPLATE_URL = new URL('../templates/Centurion sectional template.docx', import.meta.url).href

const normalizeText = (value) => String(value || '').replace(/\s+/g, ' ').trim().toLowerCase()

const getCellText = (cell) => {
  const textNodes = cell.getElementsByTagNameNS(WORD_NS, 't')
  return Array.from(textNodes)
    .map((node) => node.textContent || '')
    .join('')
}

const setCellText = (cell, value, doc) => {
  const paragraphs = cell.getElementsByTagNameNS(WORD_NS, 'p')
  const paragraph =
    paragraphs[0] ||
    (() => {
      const newParagraph = doc.createElementNS(WORD_NS, 'w:p')
      cell.appendChild(newParagraph)
      return newParagraph
    })()

  const paragraphChildren = Array.from(paragraph.childNodes)
  paragraphChildren.forEach((node) => {
    const localName = node?.localName
    if (localName && localName !== 'pPr') {
      paragraph.removeChild(node)
    }
  })

  const run = doc.createElementNS(WORD_NS, 'w:r')
  const textNode = doc.createElementNS(WORD_NS, 'w:t')
  textNode.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve')
  textNode.textContent = String(value ?? '')
  run.appendChild(textNode)
  paragraph.appendChild(run)
}

const setFirstParagraphText = (paragraph, value, doc) => {
  if (!paragraph) return

  const paragraphChildren = Array.from(paragraph.childNodes)
  paragraphChildren.forEach((node) => {
    const localName = node?.localName
    if (localName && localName !== 'pPr') {
      paragraph.removeChild(node)
    }
  })

  const run = doc.createElementNS(WORD_NS, 'w:r')
  const textNode = doc.createElementNS(WORD_NS, 'w:t')
  textNode.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve')
  textNode.textContent = String(value ?? '')
  run.appendChild(textNode)
  paragraph.appendChild(run)
}

const fillTopHeaderValues = (doc, jobNumber) => {
  const rows = doc.getElementsByTagNameNS(WORD_NS, 'tr')
  const currentDate = new Date().toLocaleDateString('en-AU')

  Array.from(rows).forEach((row) => {
    const cells = row.getElementsByTagNameNS(WORD_NS, 'tc')
    if (!cells.length) return

    Array.from(cells).forEach((cell) => {
      const label = normalizeText(getCellText(cell))
      if (!label) return

      if (label.startsWith('order date')) {
        setCellText(cell, `Order Date: ${currentDate}`, doc)
      } else if (label.startsWith('order number')) {
        setCellText(cell, `Order Number: ${jobNumber || ''}`, doc)
      } else if (label.startsWith('date required')) {
        setCellText(cell, 'Date Required: 4 weeks', doc)
      }
    })
  })
}

const getDoor1ValueMap = (details) => ({
  'door profile': details.style,
  'taper req': details.taperRequired,
  'finished door height': details.finishedDoorHeight,
  'finished door width': details.finishedDoorWidth,
  colour: details.colour,
  'window design': details.windowDesign,
  'g4 lhr / g4 std': details.g4LhrOrStd,
  'panels only': details.panelsOnly,
  opener: details.opener,
  'rail size': details.railSize,
  'fit thermoguard insulation': details.fitThermoGuardInsulation,
  'wind struts on all panels': details.windStrutsOnAllPanels,
  'oversize weather seal': details.oversizeWeatherSeal,
  'pelmet size': details.pelmet,
  'jamb size': details.jambs,
  'cover colour': details.coverColour,
  'woodgrain or smooth': details.woodgrainOrSmooth,
  'steel wrap for transport': details.steelWrapForTransport,
})

const fillDoor1TableValues = (doc, details) => {
  const rows = doc.getElementsByTagNameNS(WORD_NS, 'tr')
  const valueMap = getDoor1ValueMap(details)

  Array.from(rows).forEach((row) => {
    const cells = row.getElementsByTagNameNS(WORD_NS, 'tc')
    if (cells.length < 2) return

    const rowLabel = normalizeText(getCellText(cells[0]))
    if (!rowLabel) return

    const mapEntry = Object.entries(valueMap).find(([labelPrefix]) => rowLabel.startsWith(labelPrefix))
    if (!mapEntry) return

    const [, fieldValue] = mapEntry
    setCellText(cells[1], fieldValue || '', doc)
  })
}

const fillTaperDiagramValues = (doc, details) => {
  const taperRequired = String(details.taperRequired || '').toLowerCase()
  const isRequired = taperRequired === 'yes' || taperRequired === 'y'
  if (!isRequired) return

  const diagramValues = {
    12: details.lhsHight ? `${details.lhsHight}mm` : '',
    5: details.rhsHight ? `${details.rhsHight}mm` : '',
    8: details.finishedDoorWidth ? `${details.finishedDoorWidth}mm` : '',
  }

  const anchorNodes = doc.getElementsByTagNameNS(WP_NS, 'anchor')
  Array.from(anchorNodes).forEach((anchor) => {
    const docPr = anchor.getElementsByTagNameNS(WP_NS, 'docPr')[0]
    if (!docPr) return

    const id = Number(docPr.getAttribute('id'))
    if (!(id in diagramValues)) return

    const paragraph = anchor.getElementsByTagNameNS(WORD_NS, 'p')[0]
    if (!paragraph) return
    setFirstParagraphText(paragraph, diagramValues[id], doc)
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

export async function downloadCenturionSectionalOrderTemplate({ manufacturerDetails, jobNumber }) {
  const response = await fetch(TEMPLATE_URL)
  if (!response.ok) {
    throw new Error('Failed to load Centurion sectional template file.')
  }

  const templateBuffer = await response.arrayBuffer()
  const zip = await JSZip.loadAsync(templateBuffer)
  const documentFile = zip.file('word/document.xml')
  if (!documentFile) {
    throw new Error('Template structure is invalid. Missing word/document.xml.')
  }

  let xmlString = await documentFile.async('string')
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml')

  fillTopHeaderValues(xmlDoc, jobNumber)
  fillDoor1TableValues(xmlDoc, manufacturerDetails || {})
  fillTaperDiagramValues(xmlDoc, manufacturerDetails || {})
  xmlString = new XMLSerializer().serializeToString(xmlDoc)

  zip.file('word/document.xml', xmlString)

  const outputBlob = await zip.generateAsync({ type: 'blob' })
  const stamp = new Date().toISOString().slice(0, 10)
  const safeJob = String(jobNumber || 'job').replace(/[^a-zA-Z0-9_-]/g, '-')
  triggerDownload(outputBlob, `Centurion-Sectional-Order-${safeJob}-${stamp}.docx`)
}
