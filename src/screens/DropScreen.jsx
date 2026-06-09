import { useState, useRef, useCallback } from 'react'
import { fileKeyFromName, REQUIRED_KEYS } from '../utils/parseCSVs'
import BrandLogo, { BrandLabel } from '../components/BrandLogo'
import { brand } from '../brand/tokens'

function GridIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="20" height="20" rx="3" stroke={brand.blue} strokeWidth="1.8" />
      <rect x="29" y="3" width="20" height="20" rx="3" stroke={brand.blue} strokeWidth="1.8" />
      <rect x="3" y="29" width="20" height="20" rx="3" stroke={brand.blue} strokeWidth="1.8" />
      <rect x="29" y="29" width="20" height="20" rx="3" stroke={brand.blue} strokeWidth="1.8" />
      <line x1="13" y1="7" x2="13" y2="19" stroke={brand.blue} strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="7" y1="13" x2="19" y2="13" stroke={brand.blue} strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="39" y1="7" x2="39" y2="19" stroke={brand.blue} strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="33" y1="13" x2="45" y2="13" stroke={brand.blue} strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="13" y1="33" x2="13" y2="45" stroke={brand.blue} strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="7" y1="39" x2="19" y2="39" stroke={brand.blue} strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="39" y1="33" x2="39" y2="45" stroke={brand.blue} strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="33" y1="39" x2="45" y2="39" stroke={brand.blue} strokeWidth="1.2" strokeOpacity="0.5" />
    </svg>
  )
}

export default function DropScreen({ onReady }) {
  const [files, setFiles] = useState({})
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const addFiles = useCallback((fileList) => {
    const next = { ...files }
    for (const file of fileList) {
      const key = fileKeyFromName(file.name)
      if (key) next[key] = file
    }
    setFiles(next)
  }, [files])

  const allPresent = REQUIRED_KEYS.every(k => !!files[k])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)
  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const onInputChange = (e) => addFiles(e.target.files)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: brand.ink }}>
      <header className="px-6 pt-6 pb-2">
        <BrandLogo size="sm" theme="dark" />
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="mb-8 text-center">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-5"
              style={{ borderColor: 'rgba(22,82,240,0.25)', background: 'rgba(22,82,240,0.08)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: brand.blue, boxShadow: '0 0 0 4px rgba(22,82,240,0.16)' }} />
              <BrandLabel accent>Analisis Perilaku · Indonesia</BrandLabel>
            </div>
            <h1 className="text-white font-extrabold tracking-tight" style={{ fontSize: 'clamp(28px, 5vw, 40px)', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              Intelligence yang <span style={{ color: brand.blue }}>menghubungkan</span> data pelanggan.
            </h1>
            <p className="mt-3 text-sm max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Unggah file CSV untuk membangun dashboard analitik lengkap dengan AI Analis.
            </p>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className="flex flex-col items-center justify-center gap-4 px-8 py-14 cursor-pointer transition-all duration-200 select-none"
            style={{
              borderRadius: 20,
              border: `2px dashed ${dragging ? brand.blue : 'rgba(22,82,240,0.35)'}`,
              background: dragging ? 'rgba(22,82,240,0.06)' : 'rgba(255,255,255,0.02)',
              boxShadow: dragging ? '0 0 32px rgba(22,82,240,0.15)' : 'none',
            }}
          >
            <GridIcon />
            <div className="text-center">
              <p className="text-white font-semibold" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>
                Letakkan file CSV kamu di sini
              </p>
              <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Masukkan semua file sekaligus — semakin lengkap, semakin kaya analisisnya
              </p>
            </div>
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Klik · seret &amp; lepas
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            multiple
            className="hidden"
            onChange={onInputChange}
          />

          {Object.keys(files).length > 0 && (
            <div className="mt-6 space-y-2 px-2">
              {Object.entries(files).map(([key, file]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm font-mono flex-shrink-0 w-4 text-center" style={{ color: brand.blue }}>
                    ✓
                  </span>
                  <span className="text-sm font-mono flex-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {file.name}
                  </span>
                  <span className="text-xs tabular-nums font-mono" style={{ color: 'rgba(22,82,240,0.7)' }}>
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8">
            {allPresent ? (
              <button
                onClick={() => onReady(files)}
                className="w-full py-3.5 rounded-full text-white font-semibold text-sm btn-pulse transition-all"
                style={{ background: brand.ink, border: `1px solid ${brand.blue}`, boxShadow: '0 0 0 1px rgba(22,82,240,0.2)' }}
              >
                Analisis Data →
              </button>
            ) : (
              <div className="w-full py-3.5 rounded-full text-center text-sm font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {Object.keys(files).length === 0
                  ? 'Letakkan file CSV di atas untuk memulai'
                  : `${Object.keys(files).length} file terdeteksi — butuh: customers, orders, order_items, sessions, cohort_retention, monthly_summary`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
