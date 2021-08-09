export function validateKey(key: any) {
  if (typeof key !== 'string') {
    throw new Error("'key' must be a string.");
  }
}
