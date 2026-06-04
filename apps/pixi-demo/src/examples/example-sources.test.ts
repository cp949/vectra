import { assertUniqueExampleIds } from '@repo/playground';
import { describe, expect, it } from 'vitest';
import {
  CATEGORIES,
  DEMOTE_EXAMPLE_IDS,
  EXAMPLE_TRIAGE,
  EXAMPLES,
  getVisibleExamples,
  MERGE_EXAMPLE_IDS,
  PRIMARY_EXAMPLES,
} from './catalog';

const EXAMPLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CATEGORY_ID_PATTERN =
  /^(math|vector|angle|transform|curve|path|line|ray|segment|rect|circle|ellipse|triangle|polygon)$/;

const sourceModules = import.meta.glob<string>('./*/source.exam.ts', {
  eager: true,
  import: 'default',
  query: '?raw',
});

const sourceCodeByExampleId = new Map(
  Object.entries(sourceModules).map(([path, source]) => [
    path.replace(/^\.\//, '').replace(/\/source\.exam\.ts$/, ''),
    source,
  ])
);

describe('pixi demo example sources', () => {
  it('catalog example id는 slug이며 중복되지 않는다', () => {
    expect(() => assertUniqueExampleIds(EXAMPLES)).not.toThrow();
    expect(EXAMPLES.map((example) => example.id)).toEqual(
      EXAMPLES.map((example) => expect.stringMatching(EXAMPLE_ID_PATTERN))
    );
  });

  it('canvas-demo처럼 domain 중심 카테고리로 예제를 그룹화한다', () => {
    expect(CATEGORIES).toEqual([
      { id: 'math', title: '수학', order: 0, defaultExpanded: true },
      { id: 'vector', title: '벡터', order: 1, defaultExpanded: true },
      { id: 'angle', title: '각도', order: 2, defaultExpanded: true },
      { id: 'transform', title: '변환', order: 3, defaultExpanded: true },
      { id: 'curve', title: '커브', order: 4, defaultExpanded: true },
      { id: 'path', title: '패스', order: 5 },
      { id: 'line', title: '직선', order: 6 },
      { id: 'ray', title: '레이', order: 7 },
      { id: 'segment', title: '선분', order: 8 },
      { id: 'rect', title: '사각형/Bounds', order: 9 },
      { id: 'circle', title: '원', order: 10 },
      { id: 'ellipse', title: '타원', order: 11 },
      { id: 'triangle', title: '삼각형', order: 12 },
      { id: 'polygon', title: '폴리곤', order: 13 },
    ]);

    const categoryIds = new Set(CATEGORIES.map((category) => category.id));

    expect(EXAMPLES.map((example) => [example.id, example.categoryId])).toEqual(
      EXAMPLES.map((example) => [example.id, expect.stringMatching(CATEGORY_ID_PATTERN)])
    );
    expect(EXAMPLES.filter((example) => !categoryIds.has(example.categoryId))).toEqual([]);
  });

  it('catalog에 등록된 모든 예제는 별도 exam 파일을 raw code로 사용한다', () => {
    expect(sourceCodeByExampleId.size).toBe(EXAMPLES.length);

    for (const example of EXAMPLES) {
      expect(sourceCodeByExampleId.has(example.id), example.id).toBe(true);
      expect(example.source).toEqual({
        language: 'ts',
        code: sourceCodeByExampleId.get(example.id),
      });
    }
  });

  it('등록되지 않은 exam source 파일을 남기지 않는다', () => {
    const exampleIds = new Set(EXAMPLES.map((example) => example.id));

    expect([...sourceCodeByExampleId.keys()].filter((id) => !exampleIds.has(id))).toEqual([]);
  });

  it('Pixi Graphics에 없는 text shorthand를 사용하지 않는다', () => {
    const offenders = [...sourceCodeByExampleId.entries()]
      .filter(([, source]) => /\bg\.text\(/.test(source))
      .map(([id]) => id);

    expect(offenders).toEqual([]);
  });

  it('content fit은 contain/cover를 단일 실제 작업 흐름으로 등록한다', () => {
    const exampleIds = EXAMPLES.map((example) => example.id);

    expect(exampleIds).toContain('content-fit-workbench');
    expect(exampleIds).not.toContain('frame-fit-content');
    expect(exampleIds).not.toContain('rect-cover-fit');
  });

  it('shape hitbox는 단일 실제 작업 흐름 예제로 등록한다', () => {
    const exampleIds = EXAMPLES.map((example) => example.id);
    const primaryExampleIds = PRIMARY_EXAMPLES.map((example) => example.id);

    expect(exampleIds).toContain('shape-hitbox-lab');
    expect(primaryExampleIds).toContain('shape-hitbox-lab');
    expect(primaryExampleIds).not.toContain('circle-rect-overlap');
    expect(primaryExampleIds).not.toContain('triangle-rect-overlap');
    expect(primaryExampleIds).not.toContain('segment-segment-cross');
  });

  it('clearance와 closest point는 단일 실제 작업 흐름 예제로 등록한다', () => {
    const exampleIds = EXAMPLES.map((example) => example.id);
    const primaryExampleIds = PRIMARY_EXAMPLES.map((example) => example.id);

    expect(exampleIds).toContain('clearance-closest-point-lab');
    expect(primaryExampleIds).toContain('clearance-closest-point-lab');
    expect(primaryExampleIds).not.toContain('bounds-closest-point');
    expect(primaryExampleIds).not.toContain('circle-point-clearance');
    expect(primaryExampleIds).not.toContain('triangle-closest-point');
    expect(primaryExampleIds).not.toContain('path-closest-point');
  });

  it('rect layout은 단일 실제 작업 흐름 예제로 등록한다', () => {
    const exampleIds = EXAMPLES.map((example) => example.id);
    const primaryExampleIds = PRIMARY_EXAMPLES.map((example) => example.id);

    expect(exampleIds).toContain('rect-layout-workbench');
    expect(primaryExampleIds).toContain('rect-layout-workbench');
    expect(primaryExampleIds).not.toContain('rect-expand-to-include-point');
    expect(primaryExampleIds).not.toContain('rect-uniform-inflate');
    expect(primaryExampleIds).not.toContain('rect-halves-split');
    expect(primaryExampleIds).not.toContain('bounds-union-box');
  });

  it('남은 merge target은 대표 workbench 예제로 등록한다', () => {
    const exampleIds = EXAMPLES.map((example) => example.id);
    const primaryExampleIds = PRIMARY_EXAMPLES.map((example) => example.id);

    const workbenchIds = [
      'rotation-control-dial',
      'circular-measurement-lab',
      'curve-sampling-workbench',
      'raycast-workbench',
      'vector-control-workbench',
      'vector-collision-response',
      'motion-interpolation-workbench',
      'segment-construction-lab',
      'triangle-construction-lab',
    ];

    for (const id of workbenchIds) {
      expect(exampleIds).toContain(id);
      expect(primaryExampleIds).toContain(id);
    }

    expect(primaryExampleIds).not.toContain('angle-snap-dial');
    expect(primaryExampleIds).not.toContain('circle-sagitta');
    expect(primaryExampleIds).not.toContain('arc-flatten');
    expect(primaryExampleIds).not.toContain('ray-circle-hit');
    expect(primaryExampleIds).not.toContain('vec-set-length');
    expect(primaryExampleIds).not.toContain('vec-wall-slide');
    expect(primaryExampleIds).not.toContain('vec-lerp-points');
    expect(primaryExampleIds).not.toContain('segment-from-circle');
    expect(primaryExampleIds).not.toContain('triangle-build-right');
  });

  it('모든 pixi 예제는 기본 탐색 노출 여부를 분류한다', () => {
    const exampleIds = EXAMPLES.map((example) => example.id).sort();
    const exampleIdSet = new Set(exampleIds);
    const triageIds = Object.keys(EXAMPLE_TRIAGE).sort();
    const triageCounts = Object.values(EXAMPLE_TRIAGE).reduce<Record<string, number>>((acc, decision) => {
      acc[decision] = (acc[decision] ?? 0) + 1;
      return acc;
    }, {});

    expect(triageIds).toEqual(exampleIds);
    expect([...MERGE_EXAMPLE_IDS].filter((id) => !exampleIdSet.has(id))).toEqual([]);
    expect([...DEMOTE_EXAMPLE_IDS].filter((id) => !exampleIdSet.has(id))).toEqual([]);
    expect(triageCounts).toEqual({ keep: 58, merge: 81, demote: 21 });
    expect(PRIMARY_EXAMPLES.every((example) => EXAMPLE_TRIAGE[example.id] === 'keep')).toBe(true);
    expect(PRIMARY_EXAMPLES.map((example) => example.id)).toContain('content-fit-workbench');
    expect(PRIMARY_EXAMPLES.map((example) => example.id)).not.toContain('rect-contains-point');
    expect(PRIMARY_EXAMPLES.map((example) => example.id)).not.toContain('angle-octant-dial');
  });

  it('advanced visibility가 꺼져 있으면 keep 예제만 탐색 대상으로 반환한다', () => {
    const visibleExampleIds = getVisibleExamples(false).map((example) => example.id);

    expect(visibleExampleIds).toEqual(PRIMARY_EXAMPLES.map((example) => example.id));
    expect(visibleExampleIds).toContain('shape-hitbox-lab');
    expect(visibleExampleIds).not.toContain('rect-contains-point');
    expect(visibleExampleIds).not.toContain('circle-rect-overlap');
    expect(visibleExampleIds).not.toContain('angle-snap-dial');
  });

  it('advanced visibility가 켜져 있으면 merge와 demote 예제도 탐색 대상으로 반환한다', () => {
    const visibleExampleIds = getVisibleExamples(true).map((example) => example.id);

    expect(visibleExampleIds).toEqual(EXAMPLES.map((example) => example.id));
    expect(visibleExampleIds).toContain('shape-hitbox-lab');
    expect(visibleExampleIds).toContain('rect-contains-point');
    expect(visibleExampleIds).toContain('circle-rect-overlap');
    expect(visibleExampleIds).toContain('angle-snap-dial');
    expect(visibleExampleIds).toContain('angle-octant-dial');
  });

  it('advanced visibility가 꺼져 있어도 직접 URL로 연 숨김 예제는 탐색 대상으로 유지한다', () => {
    const selectedHiddenExample = EXAMPLES.find((example) => example.id === 'rect-contains-point');
    expect(selectedHiddenExample).not.toBeUndefined();

    const visibleExampleIds = getVisibleExamples(false, selectedHiddenExample).map((example) => example.id);

    expect(visibleExampleIds).toContain('shape-hitbox-lab');
    expect(visibleExampleIds).toContain('rect-contains-point');
    expect(visibleExampleIds).not.toContain('circle-rect-overlap');
    expect(visibleExampleIds).not.toContain('angle-snap-dial');
  });
});
