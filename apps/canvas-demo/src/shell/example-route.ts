import type { PlaygroundExample, PlaygroundExampleId } from '@repo/playground';
import { findExampleById, isExampleIdSlug } from '@repo/playground';
import type { CanvasRuntimeSeed } from '../canvas/api';

export type ExampleRoute =
  | { readonly kind: 'index' }
  | { readonly kind: 'example'; readonly example: PlaygroundExample<CanvasRuntimeSeed> }
  | { readonly kind: 'not-found'; readonly requestedId: PlaygroundExampleId };

export function getExampleIdFromPathname(pathname: string): PlaygroundExampleId | undefined {
  const normalized = pathname.replace(/^\/+|\/+$/g, '');
  if (normalized.length === 0) return undefined;
  if (normalized.includes('/')) return normalized;
  try {
    return decodeURIComponent(normalized);
  } catch {
    return normalized;
  }
}

export function toExamplePath(id: PlaygroundExampleId): string {
  return `/${encodeURIComponent(id)}`;
}

export function getExampleRoute(
  pathname: string,
  examples: readonly PlaygroundExample<CanvasRuntimeSeed>[]
): ExampleRoute {
  const id = getExampleIdFromPathname(pathname);
  if (id === undefined) return { kind: 'index' };
  if (!isExampleIdSlug(id)) return { kind: 'not-found', requestedId: id };

  const example = findExampleById(examples, id);
  if (!example) return { kind: 'not-found', requestedId: id };

  return { kind: 'example', example };
}
