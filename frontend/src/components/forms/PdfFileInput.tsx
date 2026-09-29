import { FileText, UploadCloud, X } from 'lucide-react'
import { useId, useRef } from 'react'
import { cn } from '../../utils/cn'
import { PDF_MAX_SIZE_MB } from '../../utils/pdfFile'

export interface PdfFileInputProps {
  label: string
  value: File | null
  onChange: (file: File | null) => void
  error?: string | null
  hint?: string
}

/**
 * Zone de dépôt d'un PDF unique (clic ou glisser-déposer).
 */
export function PdfFileInput({ label, value, onChange, error, hint }: PdfFileInputProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const clear = () => {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {value ? (
        <div className={cn('flex items-center gap-3 rounded-lg border-2 bg-surface px-3 py-2.5', error ? 'border-error' : 'border-primary')}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-error/10 text-error">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{value.name}</p>
            <p className="text-xs text-muted">{(value.size / 1024 / 1024).toFixed(2)} Mo</p>
          </div>
          <button type="button" onClick={clear} aria-label="Retirer le fichier" className="rounded-full p-1.5 text-muted hover:bg-field hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            onChange(event.dataTransfer.files?.[0] ?? null)
          }}
          className={cn(
            'flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 text-sm transition-colors hover:bg-primary-light/30',
            error ? 'border-error' : 'border-primary/30 hover:border-primary/60',
          )}
        >
          <UploadCloud className="h-5 w-5 shrink-0 text-primary" />
          <span className="text-muted">
            <span className="font-medium text-primary">Choisir un PDF</span> ou le glisser ici ({PDF_MAX_SIZE_MB} Mo max.)
          </span>
        </label>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      {error ? <p className="text-xs text-error">{error}</p> : hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}
