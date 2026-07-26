export type MaybeArray<T> = T | T[];

export const normalizeMaybeArray = <T>(value: MaybeArray<T>): T[] => {
  if (Array.isArray(value)) {
    return value;
  }

  return [value];
};
