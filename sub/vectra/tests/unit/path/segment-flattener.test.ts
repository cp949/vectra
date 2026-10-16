/**
 * createSegmentFlattener의 flatten 정책을 확인하는 테스트.
 *
 * 다음을 interface(`createSegmentFlattener`, `flatten`, `centerArc`)만으로 검증한다.
 * - 옵션 생략·부분 지정 시 기본값(flatness 0.5, maxRecursion 32)이 필드 단위로 채워진다.
 * - line, close, quadratic, cubic, arc 5분기가 curve flatten 함수와 같은 polyline을 낸다.
 * - 반환 배열은 재사용 buffer라서 다음 flatten 호출에서 덮어써진다.
 */
import { describe, expect, test } from 'vitest';
import { arcFlattenInto } from '../../../src/curve/arc-flatten-into';
import { cubicFlattenInto } from '../../../src/curve/cubic-flatten-into';
import { endpointArcToCenterInto } from '../../../src/curve/endpoint-arc-to-center-into';
import { quadraticFlattenInto } from '../../../src/curve/quadratic-flatten-into';
import type { DrawSegment } from '../../../src/path/path-segments.internal';
import { forEachDrawSegment } from '../../../src/path/path-segments.internal';
import { createSegmentFlattener } from '../../../src/path/segment-flattener.internal';
import type { CenterArcWritable, PathCommand, XYObjectWritable } from '../../../src/types/index';

/**
 * commands를 순회해 drawing segment를 순서대로 모은다.
 * flatten 대상 segment를 손으로 만들지 않고 실제 traversal이 만드는 값을 쓴다.
 */
function collectSegments(commands: readonly PathCommand[]): DrawSegment[] {
  const segments: DrawSegment[] = [];
  forEachDrawSegment(commands, (seg) => {
    segments.push(seg);
  });
  return segments;
}

/**
 * 한 곡선을 담은 path에서 첫 segment를 꺼낸다.
 * 각 테스트가 segment 하나만 필요할 때 쓴다.
 */
function firstSegment(commands: readonly PathCommand[]): DrawSegment {
  return collectSegments(commands)[0];
}

/** 반환 배열을 값 비교용 plain 배열로 복사한다. 재사용 buffer가 덮어써져도 이 사본은 유지된다. */
function snapshotOf(points: readonly XYObjectWritable[]): Array<{ x: number; y: number }> {
  return points.map((p) => ({ x: p.x, y: p.y }));
}

/** 모든 flatten 정책 비교에 쓰는 곡선. 기본 flatness에서 점이 여러 개 나오도록 크게 잡았다. */
const CUBIC_PATH: readonly PathCommand[] = [
  { kind: 'move', x: 0, y: 0 },
  { kind: 'cubic', x1: 30, y1: 120, x2: 70, y2: -80, x: 100, y: 20 },
];

describe('createSegmentFlattener 옵션 기본값', () => {
  const seg = firstSegment(CUBIC_PATH);
  const cmd = seg.command as Extract<PathCommand, { kind: 'cubic' }>;

  /** 기대값을 만든다. curve 함수에 옵션을 명시해서 직접 호출한 결과다. */
  function expectedCubic(flatness: number, maxRecursion: number): Array<{ x: number; y: number }> {
    const out: XYObjectWritable[] = [];
    cubicFlattenInto(
      out,
      { x: seg.fromX, y: seg.fromY },
      { x: cmd.x1, y: cmd.y1 },
      { x: cmd.x2, y: cmd.y2 },
      { x: cmd.x, y: cmd.y },
      { flatness, maxRecursion }
    );
    return snapshotOf(out);
  }

  test('옵션을 생략하면 flatness 0.5, maxRecursion 32를 쓴다', () => {
    const result = snapshotOf(createSegmentFlattener().flatten(seg));

    expect(result).toEqual(expectedCubic(0.5, 32));
    expect(result.length).toBeGreaterThan(2);
  });

  test('빈 객체를 주면 두 필드 모두 기본값을 쓴다', () => {
    expect(snapshotOf(createSegmentFlattener({}).flatten(seg))).toEqual(expectedCubic(0.5, 32));
  });

  test('flatness만 지정하면 maxRecursion은 32를 쓴다', () => {
    const result = snapshotOf(createSegmentFlattener({ flatness: 0.01 }).flatten(seg));

    expect(result).toEqual(expectedCubic(0.01, 32));
    expect(result.length).toBeGreaterThan(expectedCubic(0.5, 32).length);
  });

  test('maxRecursion만 지정하면 flatness는 0.5를 쓴다', () => {
    const result = snapshotOf(createSegmentFlattener({ maxRecursion: 1 }).flatten(seg));

    expect(result).toEqual(expectedCubic(0.5, 1));
    expect(result.length).toBeLessThan(expectedCubic(0.5, 32).length);
  });

  test('두 필드를 모두 지정하면 그 값을 그대로 쓴다', () => {
    const result = snapshotOf(createSegmentFlattener({ flatness: 5, maxRecursion: 3 }).flatten(seg));

    expect(result).toEqual(expectedCubic(5, 3));
  });

  test('0을 지정하면 기본값으로 바뀌지 않고 0 그대로 쓴다', () => {
    const result = snapshotOf(createSegmentFlattener({ maxRecursion: 0 }).flatten(seg));

    expect(result).toEqual(expectedCubic(0.5, 0));
    expect(result).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 20 },
    ]);
  });
});

describe('createSegmentFlattener segment 분기', () => {
  test('line은 시작점과 끝점 2개를 낸다', () => {
    const seg = firstSegment([
      { kind: 'move', x: 1, y: 2 },
      { kind: 'line', x: 30, y: 40 },
    ]);

    expect(snapshotOf(createSegmentFlattener().flatten(seg))).toEqual([
      { x: 1, y: 2 },
      { x: 30, y: 40 },
    ]);
  });

  test('close는 현재점과 subpath 시작점 2개를 낸다', () => {
    const segments = collectSegments([
      { kind: 'move', x: 5, y: 6 },
      { kind: 'line', x: 50, y: 6 },
      { kind: 'line', x: 50, y: 60 },
      { kind: 'close' },
    ]);
    const closeSeg = segments[2];

    expect(closeSeg.kind).toBe('close');
    expect(snapshotOf(createSegmentFlattener().flatten(closeSeg))).toEqual([
      { x: 50, y: 60 },
      { x: 5, y: 6 },
    ]);
  });

  test('line 점은 -0과 NaN을 그대로 보존한다', () => {
    const seg = firstSegment([
      { kind: 'move', x: -0, y: Number.NaN },
      { kind: 'line', x: Number.POSITIVE_INFINITY, y: -0 },
    ]);
    const [a, b] = createSegmentFlattener().flatten(seg);

    expect(Object.is(a.x, -0)).toBe(true);
    expect(Number.isNaN(a.y)).toBe(true);
    expect(b.x).toBe(Number.POSITIVE_INFINITY);
    expect(Object.is(b.y, -0)).toBe(true);
  });

  test('quadratic은 quadraticFlattenInto와 같은 polyline을 낸다', () => {
    const seg = firstSegment([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'quadratic', x1: 50, y1: 100, x: 100, y: 0 },
    ]);
    const expected: XYObjectWritable[] = [];
    quadraticFlattenInto(
      expected,
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 },
      { flatness: 0.5, maxRecursion: 32 }
    );

    const result = createSegmentFlattener().flatten(seg);

    expect(snapshotOf(result)).toEqual(snapshotOf(expected));
    expect(result.length).toBeGreaterThan(2);
  });

  test('cubic은 cubicFlattenInto와 같은 polyline을 낸다', () => {
    const seg = firstSegment(CUBIC_PATH);
    const expected: XYObjectWritable[] = [];
    cubicFlattenInto(
      expected,
      { x: 0, y: 0 },
      { x: 30, y: 120 },
      { x: 70, y: -80 },
      { x: 100, y: 20 },
      { flatness: 0.5, maxRecursion: 32 }
    );

    const result = createSegmentFlattener().flatten(seg);

    expect(snapshotOf(result)).toEqual(snapshotOf(expected));
    expect(result.length).toBeGreaterThan(2);
  });

  test('arc는 center form 변환 뒤 arcFlattenInto와 같은 polyline을 낸다', () => {
    const arcCommand = {
      kind: 'arc',
      rx: 50,
      ry: 30,
      xRotation: 0.4,
      largeArc: false,
      sweep: true,
      x: 100,
      y: 0,
    } as const;
    const seg = firstSegment([{ kind: 'move', x: 0, y: 0 }, arcCommand]);
    const expectedCenter: CenterArcWritable = {
      cx: 0,
      cy: 0,
      rx: 0,
      ry: 0,
      xRotation: 0,
      startAngle: 0,
      endAngle: 0,
      sweep: false,
    };
    endpointArcToCenterInto(expectedCenter, { x: 0, y: 0 }, arcCommand);
    const expected: XYObjectWritable[] = [];
    arcFlattenInto(expected, expectedCenter, { flatness: 0.5, maxRecursion: 32 });

    const result = createSegmentFlattener().flatten(seg);

    expect(snapshotOf(result)).toEqual(snapshotOf(expected));
    expect(result.length).toBeGreaterThan(2);
  });
});

describe('createSegmentFlattener centerArc', () => {
  test('arc를 flatten하면 centerArc에 endpoint→center 변환 결과가 남는다', () => {
    const arcCommand = {
      kind: 'arc',
      rx: 50,
      ry: 50,
      xRotation: 0,
      largeArc: false,
      sweep: true,
      x: 100,
      y: 0,
    } as const;
    const seg = firstSegment([{ kind: 'move', x: 0, y: 0 }, arcCommand]);
    const flattener = createSegmentFlattener();

    flattener.flatten(seg);

    expect(flattener.centerArc.cx).toBeCloseTo(50, 9);
    expect(flattener.centerArc.cy).toBeCloseTo(0, 9);
    expect(flattener.centerArc.rx).toBe(50);
    expect(flattener.centerArc.ry).toBe(50);
    expect(flattener.centerArc.sweep).toBe(true);
  });

  test('arc가 아닌 segment를 flatten해도 centerArc는 바뀌지 않는다', () => {
    const arcCommand = {
      kind: 'arc',
      rx: 50,
      ry: 50,
      xRotation: 0,
      largeArc: false,
      sweep: true,
      x: 100,
      y: 0,
    } as const;
    const arcSeg = firstSegment([{ kind: 'move', x: 0, y: 0 }, arcCommand]);
    const lineSeg = firstSegment([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 10 },
    ]);
    const flattener = createSegmentFlattener();
    flattener.flatten(arcSeg);
    const before = { ...flattener.centerArc };

    flattener.flatten(lineSeg);
    flattener.flatten(firstSegment(CUBIC_PATH));

    expect(flattener.centerArc).toEqual(before);
  });

  test('flattener마다 centerArc는 독립이다', () => {
    const a = createSegmentFlattener();
    const b = createSegmentFlattener();

    expect(a.centerArc).not.toBe(b.centerArc);
  });
});

describe('createSegmentFlattener 재사용 buffer 계약', () => {
  test('flatten은 호출마다 같은 배열을 반환한다', () => {
    const flattener = createSegmentFlattener();
    const line = firstSegment([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ]);

    expect(flattener.flatten(line)).toBe(flattener.flatten(firstSegment(CUBIC_PATH)));
  });

  test('다음 flatten 호출이 이전 반환 배열의 내용을 덮어쓴다', () => {
    const flattener = createSegmentFlattener();
    const cubicSeg = firstSegment(CUBIC_PATH);
    const lineSeg = firstSegment([
      { kind: 'move', x: 7, y: 8 },
      { kind: 'line', x: 9, y: 10 },
    ]);

    const first = flattener.flatten(cubicSeg);
    const firstLength = first.length;
    expect(firstLength).toBeGreaterThan(2);

    flattener.flatten(lineSeg);

    expect(first.length).toBe(2);
    expect(snapshotOf(first)).toEqual([
      { x: 7, y: 8 },
      { x: 9, y: 10 },
    ]);
  });

  test('같은 segment를 두 번 flatten하면 같은 값이 나온다', () => {
    const flattener = createSegmentFlattener();
    const seg = firstSegment(CUBIC_PATH);

    const first = snapshotOf(flattener.flatten(seg));
    const second = snapshotOf(flattener.flatten(seg));

    expect(second).toEqual(first);
  });

  test('flattener끼리 buffer를 공유하지 않는다', () => {
    const a = createSegmentFlattener();
    const b = createSegmentFlattener();
    const cubicSeg = firstSegment(CUBIC_PATH);
    const lineSeg = firstSegment([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 1, y: 1 },
    ]);

    const fromA = a.flatten(cubicSeg);
    const lengthBefore = fromA.length;
    b.flatten(lineSeg);

    expect(fromA).not.toBe(b.flatten(lineSeg));
    expect(fromA.length).toBe(lengthBefore);
  });
});
