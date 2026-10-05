export function isDefined(value) {
  return value !== null && value !== undefined;
}
export function clamp(value, minimum, maximum) {
  if (minimum > maximum) {
    throw new RangeError("minimum cannot be greater than maximum");
  }
  return Math.min(Math.max(value, minimum), maximum);
}
export function assertNever(value, message = "Unexpected value") {
  throw new Error(`${message}: ${String(value)}`);
}
