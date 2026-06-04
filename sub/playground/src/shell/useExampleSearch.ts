import { useMemo } from 'react';
import type { PlaygroundCategory, PlaygroundExample } from '../examples/types';

/** 카테고리와 해당 예제 목록을 묶은 그룹 */
export interface GroupedExamples<RuntimeSeed = unknown> {
  readonly category: PlaygroundCategory;
  readonly examples: readonly PlaygroundExample<RuntimeSeed>[];
}

/** 예제 목록을 카테고리 order 순으로 그룹화한다. 예제가 없는 카테고리는 제외한다. */
export function groupExamplesByCategory<RuntimeSeed>(
  categories: readonly PlaygroundCategory[],
  examples: readonly PlaygroundExample<RuntimeSeed>[]
): readonly GroupedExamples<RuntimeSeed>[] {
  return [...categories]
    .sort((a, b) => a.order - b.order)
    .map((category) => ({
      category,
      examples: examples.filter((e) => e.categoryId === category.id),
    }))
    .filter((group) => group.examples.length > 0);
}

/**
 * 쿼리로 예제를 필터링하고 카테고리별로 그룹화한다.
 * 빈 쿼리이면 전체 그룹을 반환한다.
 * id와 title 모두 대소문자 무시 부분 일치 검색한다.
 */
export function filterExamples<RuntimeSeed>(
  query: string,
  examples: readonly PlaygroundExample<RuntimeSeed>[],
  categories: readonly PlaygroundCategory[]
): readonly GroupedExamples<RuntimeSeed>[] {
  const q = query.trim().toLowerCase();
  if (!q) return groupExamplesByCategory(categories, examples);
  const matched = examples.filter((e) => e.id.toLowerCase().includes(q) || e.title.toLowerCase().includes(q));
  return groupExamplesByCategory(categories, matched);
}

/** 쿼리로 예제를 필터링하는 hook. filteredGroups는 useMemo로 메모이제이션된다. */
export function useExampleSearch<RuntimeSeed>(
  query: string,
  examples: readonly PlaygroundExample<RuntimeSeed>[],
  categories: readonly PlaygroundCategory[]
): { filteredGroups: readonly GroupedExamples<RuntimeSeed>[]; hasQuery: boolean } {
  const filteredGroups = useMemo(() => filterExamples(query, examples, categories), [query, examples, categories]);
  return { filteredGroups, hasQuery: query.trim() !== '' };
}
