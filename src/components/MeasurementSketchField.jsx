import { useEffect, useRef, useState } from 'react'

function MeasurementSketchField({ value, onChange, disabled = false }) {
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)
  const [tool, setTool] = useState('pen')

  const getContext = () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.lineWidth = tool === 'eraser' ? 20 : 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#0f172a'
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    return ctx
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = getContext()
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const drawFromValue = (sketchData) => {
    const canvas = canvasRef.current
    const ctx = getContext()
    if (!canvas || !ctx) return

    clearCanvas()
    if (!sketchData) return

    const image = new Image()
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    }
    image.src = sketchData
  }

  useEffect(() => {
    drawFromValue(value)
  }, [value])

  const getPosition = (event) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const point = event.touches ? event.touches[0] : event
    if (!point) return null

    return {
      x: ((point.clientX - rect.left) / rect.width) * canvas.width,
      y: ((point.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const startDrawing = (event) => {
    if (disabled) return
    const ctx = getContext()
    const position = getPosition(event)
    if (!ctx || !position) return

    drawingRef.current = true
    ctx.beginPath()
    ctx.moveTo(position.x, position.y)
  }

  const draw = (event) => {
    if (disabled || !drawingRef.current) return
    const ctx = getContext()
    const position = getPosition(event)
    if (!ctx || !position) return

    ctx.lineTo(position.x, position.y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    const canvas = canvasRef.current
    if (!canvas) return
    onChange(canvas.toDataURL('image/png'))
  }

  const clearSketch = () => {
    if (disabled) return
    clearCanvas()
    onChange('')
  }

  return (
    <div className="signature-field measurement-sketch-field">
      <label className="field-label">Measurement Sketch</label>
      <div className="signature-pad measurement-sketch-pad">
        <canvas
          ref={canvasRef}
          className="signature-canvas measurement-sketch-canvas"
          width={1200}
          height={420}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="signature-actions">
        {!disabled ? (
          <div className="sketch-tool-group" role="group" aria-label="Sketch tools">
            <button
              type="button"
              className={`modal-secondary sketch-tool-btn ${tool === 'pen' ? 'is-active' : ''}`}
              onClick={() => setTool('pen')}
              title="Pen"
              aria-label="Pen"
              aria-pressed={tool === 'pen'}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.46 1.46 3.75 3.75 1.63-1.29z" />
              </svg>
              <span>Pen</span>
            </button>
            <button
              type="button"
              className={`modal-secondary sketch-tool-btn ${tool === 'eraser' ? 'is-active' : ''}`}
              onClick={() => setTool('eraser')}
              title="Eraser"
              aria-label="Eraser"
              aria-pressed={tool === 'eraser'}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="m15.14 3.86 5 5a2 2 0 0 1 0 2.83l-7.67 7.67a2 2 0 0 1-1.41.58H4a1 1 0 1 1 0-2h2.59l8.55-8.55-3.59-3.59-7.1 7.1a1 1 0 0 1-1.42-1.42l7.81-7.81a2 2 0 0 1 2.83 0Zm1.41 4.41 2.17 2.17.71-.71-2.17-2.17-.71.71Z" />
              </svg>
              <span>Eraser</span>
            </button>
          </div>
        ) : null}
        {!disabled ? (
          <button type="button" className="modal-secondary" onClick={clearSketch}>
            Clear sketch
          </button>
        ) : null}
        <span className="field-note">Draw layout notes, strut placement, and special install requirements.</span>
      </div>
    </div>
  )
}

export default MeasurementSketchField
