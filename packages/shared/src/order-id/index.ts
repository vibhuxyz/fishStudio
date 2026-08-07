
export function formatOrderId(id: string): string {
  return `FS${id.replace(/[^0-9A-Za-z]/g, "").slice(-10).toUpperCase()}`;
}
