import type { PlaygroundExample, PlaygroundExampleId } from './types';

const EXAMPLE_ID_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isExampleIdSlug(id: PlaygroundExampleId): boolean {
  return EXAMPLE_ID_SLUG_PATTERN.test(id);
}

export function findExampleById<RuntimeSeed>(
  examples: readonly PlaygroundExample<RuntimeSeed>[],
  id: PlaygroundExampleId
): PlaygroundExample<RuntimeSeed> | undefined {
  return examples.find((example) => example.id === id);
}

export function assertUniqueExampleIds(examples: readonly PlaygroundExample[]): void {
  const seen = new Set<PlaygroundExampleId>();

  for (const example of examples) {
    if (!isExampleIdSlug(example.id)) {
      throw new Error(`Invalid example id slug: ${example.id}`);
    }

    if (seen.has(example.id)) {
      throw new Error(`Duplicate example id: ${example.id}`);
    }

    seen.add(example.id);
  }
}
