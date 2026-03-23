import sanitizeHtml from 'sanitize-html'

// ── Strip all HTML tags from a string ─────────────────────────────
export const sanitizeString = (input: string): string => {
  return sanitizeHtml(input, {
    allowedTags: [],        // no HTML tags allowed
    allowedAttributes: {},  // no attributes allowed
  }).trim()
}

// ── Sanitise an object's string fields ────────────────────────────
export const sanitizeFields = (
  obj: Record<string, any>,
  fields: string[]
): Record<string, any> => {
  const sanitized = { ...obj }
  fields.forEach((field) => {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeString(sanitized[field])
    }
  })
  return sanitized
}