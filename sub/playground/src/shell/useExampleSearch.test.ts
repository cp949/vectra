import { describe, expect, it } from 'vitest';
import { filterExamples, groupExamplesByCategory } from './useExampleSearch';

const CAT_MATH = { id: 'math', title: '수학', order: 0 };
const CAT_GEO = { id: 'geo', title: '기하', order: 1 };
const EX_LERP = {
  id: 'vec-lerp',
  title: 'Vec Lerp',
  categoryId: 'math',
  source: { language: 'ts' as const, code: '' },
};
const EX_ROTATE = {
  id: 'vec-rotate',
  title: 'Vec Rotate',
  categoryId: 'math',
  source: { language: 'ts' as const, code: '' },
};
const EX_TRI = {
  id: 'triangle-centers',
  title: 'Triangle Centers',
  categoryId: 'geo',
  source: { language: 'ts' as const, code: '' },
};

const CATEGORIES = [CAT_MATH, CAT_GEO];
const EXAMPLES = [EX_LERP, EX_ROTATE, EX_TRI];

describe('groupExamplesByCategory', () => {
  it('카테고리 order 순으로 정렬하고 예제를 묶는다', () => {
    const groups = groupExamplesByCategory([CAT_GEO, CAT_MATH], [EX_TRI, EX_LERP, EX_ROTATE]);
    expect(groups.map((g) => g.category.id)).toEqual(['math', 'geo']);
    expect(groups[0]?.examples.map((e) => e.id)).toEqual(['vec-lerp', 'vec-rotate']);
    expect(groups[1]?.examples.map((e) => e.id)).toEqual(['triangle-centers']);
  });

  it('예제가 없는 카테고리는 제외한다', () => {
    const groups = groupExamplesByCategory(CATEGORIES, [EX_TRI]);
    expect(groups.map((g) => g.category.id)).toEqual(['geo']);
  });
});

describe('filterExamples', () => {
  it('빈 쿼리이면 전체 그룹을 반환한다', () => {
    const groups = filterExamples('', EXAMPLES, CATEGORIES);
    expect(groups.flatMap((g) => g.examples).map((e) => e.id)).toEqual(['vec-lerp', 'vec-rotate', 'triangle-centers']);
  });

  it('공백만 있는 쿼리는 빈 쿼리로 처리한다', () => {
    const groups = filterExamples('   ', EXAMPLES, CATEGORIES);
    expect(groups.flatMap((g) => g.examples)).toHaveLength(3);
  });

  it('id 부분 일치로 필터링한다', () => {
    const groups = filterExamples('vec-lerp', EXAMPLES, CATEGORIES);
    expect(groups.flatMap((g) => g.examples).map((e) => e.id)).toEqual(['vec-lerp']);
  });

  it('title 부분 일치로 필터링한다', () => {
    const groups = filterExamples('triangle', EXAMPLES, CATEGORIES);
    expect(groups.flatMap((g) => g.examples).map((e) => e.id)).toEqual(['triangle-centers']);
  });

  it('대소문자를 무시한다', () => {
    const groups = filterExamples('VEC', EXAMPLES, CATEGORIES);
    expect(groups.flatMap((g) => g.examples)).toHaveLength(2);
  });

  it('매칭 예제가 없는 카테고리는 결과에서 제외한다', () => {
    const groups = filterExamples('vec', EXAMPLES, CATEGORIES);
    expect(groups.map((g) => g.category.id)).toEqual(['math']);
  });

  it('아무것도 매칭 안 되면 빈 배열을 반환한다', () => {
    const groups = filterExamples('xxxxxxxxxxx', EXAMPLES, CATEGORIES);
    expect(groups).toEqual([]);
  });
});
