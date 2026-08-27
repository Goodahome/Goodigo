function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
}

export function keysToCamelCase<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => keysToCamelCase(item)) as T
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Blob)) {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        toCamelCase(key),
        keysToCamelCase(value),
      ]),
    ) as T
  }
  return obj as T
}

export function keysToSnakeCase(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map((item) => keysToSnakeCase(item))
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        toSnakeCase(key),
        keysToSnakeCase(value),
      ]),
    )
  }
  return obj
}
