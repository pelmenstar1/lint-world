export type MaybeArray<T> = T | T[];

export const normalizeMaybeArray = <T>(value: MaybeArray<T>): T[] => {
  return Array.isArray(value) ? value : [value];
};
