/**
 * @param {string} filename
 * @param {BlobPart} content
 * @param {string} mimeType
 */
export function downloadBlob(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** @param {string} text */
export async function copyText(text) {
  await navigator.clipboard.writeText(text);
}
