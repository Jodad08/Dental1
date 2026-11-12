// Tiny HTML templating: html`...` escapes every interpolated value unless it
// is already markup (another html`` result, raw(), or an array of those).
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) => ESC[ch]);

export class Raw {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}
export const raw = (v) => new Raw(v == null ? '' : String(v));

const out = (v) => {
  if (v == null || v === false || v === true) return '';
  if (v instanceof Raw) return v.value;
  if (Array.isArray(v)) return v.map(out).join('');
  return esc(v);
};

export const html = (strings, ...values) =>
  new Raw(strings.reduce((acc, s, i) => acc + s + (i < values.length ? out(values[i]) : ''), ''));

/** Copy text → markup. Supports *emphasis* and line breaks (\n). */
export const rich = (text) =>
  raw(
    esc(text)
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>'),
  );

/** Copy text with the light markup removed (for <title>, alt, meta tags). */
export const plain = (text) =>
  String(text ?? '')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/\s*\n\s*/g, ' ')
    .trim();

/** Split a headline into its authored lines (for line-by-line entrances). */
export const lines = (text) => String(text ?? '').split('\n').filter((l) => l.trim());
