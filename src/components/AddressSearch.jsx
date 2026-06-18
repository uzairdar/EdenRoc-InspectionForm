import React, { useEffect, useRef } from 'react'

function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'))
    if (window.google && window.google.maps && window.google.maps.places) return resolve(window.google)

    const existing = document.getElementById('google-maps-script')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google))
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps script')))
      return
    }

    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.google)
    script.onerror = () => reject(new Error('Failed to load Google Maps script'))
    document.head.appendChild(script)
  })
}

export default function AddressSearch({ value, onChange, placeholder = 'Search address...', disabled = false }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const inputRef = useRef(null)
  const autoRef = useRef(null)

  useEffect(() => {
    let mounted = true
    if (disabled || !apiKey) return

    loadGoogleMapsScript(apiKey)
      .then((google) => {
        if (!mounted) return
        try {
          autoRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
          })
          autoRef.current.setFields(['formatted_address', 'address_components', 'geometry'])
          autoRef.current.addListener('place_changed', () => {
            const place = autoRef.current.getPlace()
            if (place && place.formatted_address) onChange(place.formatted_address)
          })
        } catch (err) {
          console.error('Autocomplete init error', err)
        }
      })
      .catch((err) => {
        console.error('Failed to load Google Maps script', err)
      })

    return () => {
      mounted = false
      try {
        if (autoRef.current && window.google && window.google.maps && window.google.maps.event) {
          window.google.maps.event.clearInstanceListeners(autoRef.current)
        }
      } catch (e) {}
    }
  }, [apiKey, onChange, disabled])

  if (!apiKey) {
    return (
      <div className="address-search-error">
        <p style={{ color: '#dc2626', fontSize: '0.9rem' }}>
          ⚠️ Google Maps API key not configured. Add VITE_GOOGLE_MAPS_API_KEY to .env file.
        </p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="form-field-input-fallback"
          style={{
            width: '100%',
            minHeight: '52px',
            borderRadius: '22px',
            border: '1px solid #dbeafe',
            background: '#f8fafc',
            padding: '16px 18px',
            font: 'inherit',
            color: '#111827',
          }}
        />
      </div>
    )
  }

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="google-autocomplete-input"
      style={{
        width: '100%',
        minHeight: '52px',
        borderRadius: '22px',
        border: '1px solid #dbeafe',
        background: '#f8fafc',
        padding: '16px 18px',
        font: 'inherit',
        color: '#111827',
        fontSize: 'inherit',
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
      }}
    />
  )
}
