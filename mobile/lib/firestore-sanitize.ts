/** Remove `undefined` de objetos antes de gravar no Firestore (que rejeita undefined). */
export function omitUndefinedFields<T extends Record<string, unknown>>(value: T): T {
  const sanitized = Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined),
  ) as T

  return sanitized
}
