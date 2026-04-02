/**
 * CSV generation and download composable.
 * Generates RFC-compliant CSV content and triggers a browser download.
 *
 * Usage:
 * ```ts
 * const { exportCsv } = useCsvExport()
 * exportCsv('users.csv', ['Name', 'Email'], [['Alice', 'alice@example.com']])
 * ```
 */

export interface UseCsvExportReturn {
  /** Generate and download a CSV file */
  exportCsv: (filename: string, headers: string[], rows: string[][]) => void
  /** Generate CSV content string (without triggering download) */
  buildCsv: (headers: string[], rows: string[][]) => string
}

/**
 * Escape a cell value for CSV: wrap in double quotes, escape internal quotes.
 */
function escapeCell(value: unknown): string {
  const str = String(value ?? '').replace(/"/g, '""')
  return `"${str}"`
}

/**
 * Build a CSV content string from headers and rows.
 */
function buildCsvContent(headers: string[], rows: string[][]): string {
  const headerLine = headers.join(',')
  const dataLines = rows.map((row) =>
    row.map((cell) => escapeCell(cell)).join(','),
  )
  return [headerLine, ...dataLines].join('\n')
}

/**
 * Trigger a file download in the browser.
 */
function downloadFile(filename: string, content: string): void {
  if (typeof document === 'undefined') return

  // BOM for Excel compatibility with UTF-8
  const bom = '\uFEFF'
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

export function useCsvExport(): UseCsvExportReturn {
  function exportCsv(filename: string, headers: string[], rows: string[][]): void {
    const content = buildCsvContent(headers, rows)
    downloadFile(filename, content)
  }

  function buildCsv(headers: string[], rows: string[][]): string {
    return buildCsvContent(headers, rows)
  }

  return { exportCsv, buildCsv }
}
