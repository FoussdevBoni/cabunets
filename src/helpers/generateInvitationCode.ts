export function generateGenerateCode(): string {
  return Date.now().toString(36).toUpperCase().padEnd(8, "X").substring(0, 8);
}
