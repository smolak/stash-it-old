export function validateExtra(extra: any) {
  if (typeof extra !== 'object' || extra === null || Array.isArray(extra)) {
    throw new Error("'extra' must be an object.");
  }
}
