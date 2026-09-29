export const PDF_MAX_SIZE_MB = 5

/** Même contrôle que le backend (qui vérifie en plus la signature interne du fichier). */
export function pdfFileError(file: File | null, required = true): string | null {
  if (!file) return required ? 'Joignez une copie de votre certificat RCCM (PDF).' : null
  if (!file.name.toLowerCase().endsWith('.pdf') || (file.type && file.type !== 'application/pdf')) {
    return 'Le certificat doit être un fichier PDF.'
  }
  if (file.size > PDF_MAX_SIZE_MB * 1024 * 1024) return `Le fichier ne doit pas dépasser ${PDF_MAX_SIZE_MB} Mo.`
  return null
}
