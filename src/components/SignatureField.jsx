import { useEffect, useRef } from 'react'

function SignatureField({ value, onChange, disabled = false }) {
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)

  const getContext = () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#0f172a'
    return ctx
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = getContext()
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const drawFromValue = (signatureData) => {
    const canvas = canvasRef.current
    const ctx = getContext()
    if (!canvas || !ctx) return

    clearCanvas()
    if (!signatureData) return

    const image = new Image()
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    }
    image.src = signatureData
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

  const clearSignature = () => {
    if (disabled) return
    clearCanvas()
    onChange('')
  }

  return (
    <div className="signature-field">
      <label className="field-label">Customer Signature</label>
      <div className="signature-pad">
        <canvas
          ref={canvasRef}
          className="signature-canvas"
          width={900}
          height={220}
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
          <button type="button" className="modal-secondary" onClick={clearSignature}>
            Clear signature
          </button>
        ) : null}
        {!value ? <span className="field-note">Signature required before submission.</span> : null}
      </div>
    </div>
  )
}

export default SignatureField
