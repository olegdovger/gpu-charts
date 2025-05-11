export function tryGet<T>(value: T, message: string): NonNullable<T> {
  if (!value) {
    throw new Error(message);
  }

  return value;
}