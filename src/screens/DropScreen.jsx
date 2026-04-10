import { useState, useRef, useCallback } from 'react'
import { fileKeyFromName, REQUIRED_KEYS } from '../utils/parseCSVs'

function GridIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="20" height="20" rx="3" stroke="#7F77DD" strokeWidth="1.8" />
      <rect x="29" y="3" width="20" height="20" rx="3" stroke="#7F77DD" strokeWidth="1.8" />
      <rect x="3" y="29" width="20" height="20" rx="3" stroke="#7F77DD" strokeWidth="1.8" />
      <rect x="29" y="29" width="20" height="20" rx="3" stroke="#7F77DD" strokeWidth="1.8" />
      <line x1="13" y1="7" x2="13" y2="19" stroke="#7F77DD" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="7" y1="13" x2="19" y2="13" stroke="#7F77DD" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="39" y1="7" x2="39" y2="19" stroke="#7F77DD" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="33" y1="13" x2="45" y2="13" stroke="#7F77DD" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="13" y1="33" x2="13" y2="45" stroke="#7F77DD" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="7" y1="39" x2="19" y2="39" stroke="#7F77DD" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="39" y1="33" x2="39" y2="45" stroke="#7F77DD" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="33" y1="39" x2="45" y2="39" stroke="#7F77DD" strokeWidth="1.2" strokeOpacity="0.5" />
    </svg>
  )
}

export default function DropScreen({ onReady }) {
  const [files, setFiles] = useState({})   // { key: File }
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

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)
  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const onInputChange = (e) => addFiles(e.target.files)

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0a0a0f' }}
    >
      {/* Wordmark */}
      <div className="px-6 pt-6">
        <span style={{ color: '#7F77DD', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>
          ConextLab
        </span>
      </div>

      {/* Center content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">

          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 px-8 py-14 cursor-pointer transition-all duration-200 select-none"
            style={{
              borderColor: dragging ? '#7F77DD' : 'rgba(127,119,221,0.3)',
              background: dragging ? 'rgba(127,119,221,0.06)' : 'rgba(255,255,255,0.02)',
              boxShadow: dragging ? '0 0 32px rgba(127,119,221,0.15)' : 'none',
            }}
          >
            <GridIcon />
            <div className="text-center">
              <p className="text-white font-medium" style={{ fontSize: 26 }}>
                Letakkan file CSV kamu di sini
              </p>
              <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Masukkan semua file sekaligus — semakin lengkap, semakin kaya analisisnya
              </p>
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Klik untuk pilih file · atau seret &amp; lepas
            </p>
          </div>

          {/* Hidden input */}
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            multiple
            className="hidden"
            onChange={onInputChange}
          />

          {/* Detected files — dynamic list */}
          {Object.keys(files).length > 0 && (
            <div className="mt-6 space-y-2 px-2">
              {Object.entries(files).map(([key, file]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm font-mono flex-shrink-0 w-4 text-center" style={{ color: '#1D9E75' }}>
                    ✓
                  </span>
                  <span className="text-sm font-mono flex-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {file.name}
                  </span>
                  <span className="text-xs tabular-nums" style={{ color: 'rgba(29,158,117,0.7)' }}>
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Analyze button */}
          <div className="mt-8">
            {allPresent ? (
              <button
                onClick={() => onReady(files)}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm btn-pulse transition-all"
                style={{ background: '#7F77DD' }}
              >
                Analisis Data →
              </button>
            ) : (
              <div className="w-full py-3.5 rounded-xl text-center text-sm" style={{ color: 'rgba(255,255,255,0.15)' }}>
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
