export const clamp = (value: number, low: number, high: number) => {
  return Math.max(Math.min(value, high), low);
};

export const mix = (a: number, b: number, t: number) => {
  return a + (b - a) * t;
};

export const normalizeInRange = (a: number, low: number, high: number) => {
  return (clamp(a, low, high) - low) / (high - low);
};
/// returns a value in range [outLow, outHigh] for a value \a in range [inLow, outLow]
export const remap = (a: number, inLow: number, inHigh: number, outLow: number, outHigh: number) => {
  return mix(outLow, outHigh, normalizeInRange(a, inLow, inHigh));
};
