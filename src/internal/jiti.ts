import type { Jiti, JitiResolveOptions } from 'jiti';

export async function importOneOf<T>(
  jiti: Jiti,
  moduleNames: readonly string[],
  options: JitiResolveOptions & { default?: true },
): Promise<T> {
  const tryOptions = { ...options, try: true };

  for (const moduleName of moduleNames) {
    const result = await jiti.import<T | undefined>(moduleName, tryOptions);
    if (result !== undefined) {
      return result;
    }
  }

  throw new Error(
    `None of the modules could be imported: ${moduleNames.join(', ')}`,
  );
}
