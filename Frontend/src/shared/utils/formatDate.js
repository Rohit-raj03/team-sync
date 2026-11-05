export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats any date value (ISO string, Date object, timestamp) into YYYY-MM-DD
 * strictly required by HTML5 date inputs (<input type="date" />).
 *
 * Preserves the exact date portion of ISO strings without timezone shifting.
 * Returns empty string for null, undefined, or invalid values.
 */
export function formatDateForInput(val) {
  if (!val) return '';

  // 1. If it's a string, preserve the date portion of ISO strings (YYYY-MM-DD)
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return match[1];
    }
    // Attempt fallback parsing for non-ISO strings (e.g. "MM/DD/YYYY")
    const parsed = new Date(trimmed);
    if (isNaN(parsed.getTime())) return '';
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 2. If it's a Date object
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 3. Fallback for timestamps (numbers)
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
