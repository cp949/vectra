/**
 * polyline 누적 길이 표 조회 함수 unit test.
 *
 * 대상 함수:
 *  - pointAtLengthByTableInto / pointAtLengthByTable
 *  - pointAtLengthRatioByTableInto / pointAtLengthRatioByTable
 *  - tangentAtLengthByTableInto / tangentAtLengthByTable
 *  - frameAtLengthByTableInto / frameAtLengthByTable
 *
 * 검증:
 *  - 표 없이 순회하는 기존 함수(`pointAtLengthInto` 등)와 같은 결과를 낸다. 반복점, zero-length 구간,
 *    1점, 2점, 객체/튜플 혼합, length 범위 밖 clamp, NaN, 무한대를 함께 비교한다.
 *  - 표 개수가 vertex 개수와 다르면 RangeError를 던지고 out을 수정하지 않는다.
 *  - 표 내용(비단조, NaN)은 검증하지 않으며 throw하지 않는다.
 *  - out 재사용, aliasing, companion 반환 형태를 확인한다.
 *
 * 성능은 단위 테스트에서 재지 않는다.
 */

import { describe, expect, test } from 'vitest';
import { cumulativeLengthsInto } from '../../../src/polyline/cumulative-lengths-into';
import { frameAtLengthByTable } from '../../../src/polyline/frame-at-length-by-table';
import { frameAtLengthByTableInto } from '../../../src/polyline/frame-at-length-by-table-into';
import { frameAtLengthInto } from '../../../src/polyline/frame-at-length-into';
import { pointAtLengthByTable } from '../../../src/polyline/point-at-length-by-table';
import { pointAtLengthByTableInto } from '../../../src/polyline/point-at-length-by-table-into';
import { pointAtLengthInto } from '../../../src/polyline/point-at-length-into';
import { pointAtLengthRatioByTable } from '../../../src/polyline/point-at-length-ratio-by-table';
import { pointAtLengthRatioByTableInto } from '../../../src/polyline/point-at-length-ratio-by-table-into';
import { pointAtLengthRatioInto } from '../../../src/polyline/point-at-length-ratio-into';
import { tangentAtLengthByTable } from '../../../src/polyline/tangent-at-length-by-table';
import { tangentAtLengthByTableInto } from '../../../src/polyline/tangent-at-length-by-table-into';
import { tangentAtLengthInto } from '../../../src/polyline/tangent-at-length-into';
import { createRng } from '../../../src/random/create-rng';
import type { PolylineFrameWritable } from '../../../src/types';
import type { Polyline, PointWritable } from '../../../src/types/flat-shapes.internal';

const TOLERANCE = 1e-12;

/**
 * seed 고정 난수로 만든 point 목록을 반환한다.
 * 일부 vertex는 직전 vertex를 반복해 zero-length segment를 만든다.
 */
function createRandomPoints(seed: string, count: number): Polyline {
  const rng = createRng(seed);
  const points: PointWritable[] = [];
  let x = 0;
  let y = 0;
  for (let i = 0; i < count; i++) {
    // 4번에 1번은 제자리에 머물러 zero-length segment를 만든다.
    if (rng() >= 0.25) {
      x += (rng() - 0.5) * 20;
      y += (rng() - 0.5) * 20;
    }
    points.push({ x, y });
  }
  return points;
}

const FIXTURES: ReadonlyArray<readonly [string, Polyline]> = [
  ['empty', []],
  ['single', [{ x: 1, y: 2 }]],
  [
    '2점',
    [
      { x: 0, y: 0 },
      { x: 3, y: 4 },
    ],
  ],
  [
    '전체 반복점',
    [
      { x: 3, y: 5 },
      { x: 3, y: 5 },
      { x: 3, y: 5 },
    ],
  ],
  [
    '시작 zero-length 구간',
    [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
    ],
  ],
  [
    '중간 zero-length 구간',
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ],
  ],
  [
    '끝 zero-length 구간',
    [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 0 },
    ],
  ],
  [
    '되돌아가는 경로',
    [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 5 },
      { x: 0, y: 5 },
      { x: 0, y: 0 },
    ],
  ],
  ['난수 60점', createRandomPoints('length-by-table-60', 60)],
  ['난수 301점', createRandomPoints('length-by-table-301', 301)],
];

/**
 * polyline 하나에 대한 조회 length 목록을 만든다.
 * 범위 밖 값, 모든 vertex 누적 길이, 각 segment 중간, NaN, 무한대를 포함한다.
 */
function createLengths(table: readonly number[]): number[] {
  const total = table.length > 0 ? table[table.length - 1] : 0;
  const lengths = [-5, -Number.MIN_VALUE, 0, Number.MIN_VALUE, total, total + 7];
  for (let i = 0; i < table.length; i++) {
    lengths.push(table[i]);
    if (i > 0) lengths.push((table[i - 1] + table[i]) / 2);
  }
  lengths.push(Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY);
  return lengths;
}

/** 같은 길이의 ratio 목록을 만든다. */
const RATIOS = [-1, 0, 0.001, 0.25, 0.5, 0.75, 1 - 1e-12, 1, 2, Number.NaN, Number.POSITIVE_INFINITY];

/**
 * 두 수가 ±1e-12 안에서 같은지 비교한다.
 * NaN끼리, 같은 부호의 무한대끼리는 같다고 본다.
 */
function expectNear(actual: number, expected: number): void {
  if (Number.isNaN(expected)) {
    expect(actual).toBeNaN();
    return;
  }
  if (!Number.isFinite(expected)) {
    expect(actual).toBe(expected);
    return;
  }
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(TOLERANCE);
}

/** 두 {x, y}를 component별로 비교한다. */
function expectPointNear(actual: PointWritable, expected: PointWritable): void {
  expectNear(actual.x, expected.x);
  expectNear(actual.y, expected.y);
}

/** out 수정 여부를 확인하기 위한 sentinel 좌표를 만든다. */
function sentinel(): PointWritable {
  return { x: -777, y: -888 };
}

/** 표를 만든다. */
function tableOf(polyline: Polyline): number[] {
  return cumulativeLengthsInto([], polyline);
}

describe('polyline 누적 길이 표 조회 — 기존 함수와의 동등성', () => {
  for (const [name, polyline] of FIXTURES) {
    const table = tableOf(polyline);
    const lengths = createLengths(table);

    test(`${name}: pointAtLengthByTableInto가 pointAtLengthInto와 같은 point와 반환값을 낸다`, () => {
      for (const length of lengths) {
        const expected = sentinel();
        const actual = sentinel();
        const expectedOk = pointAtLengthInto(expected, polyline, length);
        const actualOk = pointAtLengthByTableInto(actual, polyline, table, length);

        expect(actualOk, `length=${length}`).toBe(expectedOk);
        expectPointNear(actual, expected);
      }
    });

    test(`${name}: pointAtLengthRatioByTableInto가 pointAtLengthRatioInto와 같은 point와 반환값을 낸다`, () => {
      for (const ratio of RATIOS) {
        const expected = sentinel();
        const actual = sentinel();
        const expectedOk = pointAtLengthRatioInto(expected, polyline, ratio);
        const actualOk = pointAtLengthRatioByTableInto(actual, polyline, table, ratio);

        expect(actualOk, `ratio=${ratio}`).toBe(expectedOk);
        expectPointNear(actual, expected);
      }
    });

    test(`${name}: tangentAtLengthByTableInto가 tangentAtLengthInto와 같은 tangent와 반환값을 낸다`, () => {
      for (const length of lengths) {
        const expected = sentinel();
        const actual = sentinel();
        const expectedOk = tangentAtLengthInto(expected, polyline, length);
        const actualOk = tangentAtLengthByTableInto(actual, polyline, table, length);

        expect(actualOk, `length=${length}`).toBe(expectedOk);
        expectPointNear(actual, expected);
      }
    });

    test(`${name}: frameAtLengthByTableInto가 frameAtLengthInto와 같은 frame과 반환값을 낸다`, () => {
      for (const length of lengths) {
        const expected: PolylineFrameWritable = { point: sentinel(), tangent: sentinel(), normal: sentinel() };
        const actual: PolylineFrameWritable = { point: sentinel(), tangent: sentinel(), normal: sentinel() };
        const expectedOk = frameAtLengthInto(expected, polyline, length);
        const actualOk = frameAtLengthByTableInto(actual, polyline, table, length);

        expect(actualOk, `length=${length}`).toBe(expectedOk);
        expectPointNear(actual.point, expected.point);
        expectPointNear(actual.tangent, expected.tangent);
        expectPointNear(actual.normal, expected.normal);
      }
    });
  }
});

describe('polyline 누적 길이 표 조회 — 손으로 계산한 값', () => {
  // L자: (0,0)→(1,0)→(1,2). segment 길이 1, 2. 누적 [0, 1, 3].
  const L: Polyline = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 2 },
  ];
  const table = [0, 1, 3];

  test('segment 안쪽 length는 그 segment 위의 point를 낸다', () => {
    expect(pointAtLengthByTable(L, table, 0.5)).toEqual({ x: 0.5, y: 0 });
    expect(pointAtLengthByTable(L, table, 2)).toEqual({ x: 1, y: 1 });
  });

  test('length가 범위 밖이면 양 끝 point로 clamp한다', () => {
    expect(pointAtLengthByTable(L, table, -10)).toEqual({ x: 0, y: 0 });
    expect(pointAtLengthByTable(L, table, 10)).toEqual({ x: 1, y: 2 });
  });

  test('ratio 0.5는 전체 길이의 절반 위치 point를 낸다', () => {
    expect(pointAtLengthRatioByTable(L, table, 0.5)).toEqual({ x: 1, y: 0.5 });
  });

  test('boundary length의 tangent는 앞쪽 segment 방향이고 frame point는 boundary point다', () => {
    expect(tangentAtLengthByTable(L, table, 1)).toEqual({ x: 1, y: 0 });

    const frame = frameAtLengthByTable(L, table, 1);
    expect(frame?.point).toEqual({ x: 1, y: 0 });
    expect(frame?.tangent).toEqual({ x: 1, y: 0 });
    expect(frame?.normal).toEqual({ x: -0, y: 1 });
  });
});

describe('polyline 누적 길이 표 조회 — 표 불일치 입력', () => {
  const polyline: Polyline = [
    { x: 0, y: 0 },
    { x: 3, y: 4 },
    { x: 3, y: 10 },
  ];
  const table = tableOf(polyline);

  test('표 개수가 vertex 개수보다 적거나 많으면 모든 Into가 RangeError를 던진다', () => {
    for (const wrong of [table.slice(0, 2), [...table, 99], []]) {
      expect(() => pointAtLengthByTableInto(sentinel(), polyline, wrong, 1)).toThrow(RangeError);
      expect(() => pointAtLengthRatioByTableInto(sentinel(), polyline, wrong, 0.5)).toThrow(RangeError);
      expect(() => tangentAtLengthByTableInto(sentinel(), polyline, wrong, 1)).toThrow(RangeError);
      expect(() =>
        frameAtLengthByTableInto({ point: sentinel(), tangent: sentinel(), normal: sentinel() }, polyline, wrong, 1)
      ).toThrow(RangeError);
    }
  });

  test('표 개수가 맞지 않으면 companion도 RangeError를 던진다', () => {
    const wrong = table.slice(0, 2);
    expect(() => pointAtLengthByTable(polyline, wrong, 1)).toThrow(RangeError);
    expect(() => pointAtLengthRatioByTable(polyline, wrong, 0.5)).toThrow(RangeError);
    expect(() => tangentAtLengthByTable(polyline, wrong, 1)).toThrow(RangeError);
    expect(() => frameAtLengthByTable(polyline, wrong, 1)).toThrow(RangeError);
  });

  test('RangeError를 던질 때 out을 수정하지 않는다', () => {
    const out = sentinel();
    expect(() => pointAtLengthByTableInto(out, polyline, [0], 1)).toThrow(RangeError);
    expect(out).toEqual(sentinel());
  });

  test('empty polyline은 빈 표에서만 false를 반환하고 표가 비어 있지 않으면 RangeError를 던진다', () => {
    const out = sentinel();
    expect(pointAtLengthByTableInto(out, [], [], 1)).toBe(false);
    expect(out).toEqual(sentinel());
    expect(pointAtLengthByTable([], [], 1)).toBeUndefined();
    expect(() => pointAtLengthByTableInto(out, [], [0], 1)).toThrow(RangeError);
  });

  test('표 내용이 비단조이거나 NaN을 포함해도 throw하지 않는다', () => {
    for (const broken of [
      [0, 9, 5],
      [0, Number.NaN, 12],
      [5, 0, 0],
    ]) {
      expect(() => pointAtLengthByTableInto(sentinel(), polyline, broken, 4)).not.toThrow();
      expect(() => pointAtLengthRatioByTableInto(sentinel(), polyline, broken, 0.4)).not.toThrow();
      expect(() => tangentAtLengthByTableInto(sentinel(), polyline, broken, 4)).not.toThrow();
      expect(() =>
        frameAtLengthByTableInto({ point: sentinel(), tangent: sentinel(), normal: sentinel() }, polyline, broken, 4)
      ).not.toThrow();
    }
  });
});

describe('polyline 누적 길이 표 조회 — out 계약', () => {
  const polyline: Polyline = [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 4, y: 4 },
  ];
  const table = tableOf(polyline);

  test('degenerate polyline에서 false를 반환하고 out을 수정하지 않는다', () => {
    const single: Polyline = [{ x: 1, y: 2 }];
    const repeated: Polyline = [
      { x: 3, y: 3 },
      { x: 3, y: 3 },
    ];
    const frame = { point: sentinel(), tangent: sentinel(), normal: sentinel() };

    expect(tangentAtLengthByTableInto(sentinel(), single, [0], 0)).toBe(false);
    expect(tangentAtLengthByTableInto(sentinel(), repeated, [0, 0], 0)).toBe(false);
    expect(frameAtLengthByTableInto(frame, single, [0], 0)).toBe(false);
    expect(frameAtLengthByTableInto(frame, repeated, [0, 0], 0)).toBe(false);
    expect(frame).toEqual({ point: sentinel(), tangent: sentinel(), normal: sentinel() });
    expect(tangentAtLengthByTable(repeated, [0, 0], 0)).toBeUndefined();
    expect(frameAtLengthByTable(single, [0], 0)).toBeUndefined();
  });

  test('single-point와 repeated-point polyline의 point 조회는 첫 point를 기록한다', () => {
    expect(pointAtLengthByTable([{ x: 1, y: 2 }], [0], 5)).toEqual({ x: 1, y: 2 });
    expect(
      pointAtLengthByTable(
        [
          { x: 3, y: 3 },
          { x: 3, y: 3 },
        ],
        [0, 0],
        5
      )
    ).toEqual({ x: 3, y: 3 });
  });

  test('out이 polyline point와 alias되어도 같은 결과를 낸다', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 4 },
    ];
    const expected = { x: 0, y: 0 };
    pointAtLengthByTableInto(expected, points, table, 6);

    // 보간에 쓰이는 segment 양 끝 point를 각각 out으로 넘긴다.
    for (const index of [1, 2]) {
      const copy = points.map((p) => ({ ...p }));
      expect(pointAtLengthByTableInto(copy[index], copy, table, 6)).toBe(true);
      expect(copy[index]).toEqual(expected);
    }

    const tangentCopy = points.map((p) => ({ ...p }));
    expect(tangentAtLengthByTableInto(tangentCopy[2], tangentCopy, table, 6)).toBe(true);
    expect(tangentCopy[2]).toEqual({ x: 0, y: 1 });

    const frameCopy = points.map((p) => ({ ...p }));
    const frame = { point: frameCopy[1], tangent: frameCopy[2], normal: { x: 0, y: 0 } };
    expect(frameAtLengthByTableInto(frame, frameCopy, table, 6)).toBe(true);
    expect(frame.point).toEqual({ x: 4, y: 2 });
    expect(frame.tangent).toEqual({ x: 0, y: 1 });
    expect(frame.normal).toEqual({ x: -1, y: 0 });
  });

  test('companion은 새 plain object를 호출마다 반환한다', () => {
    const a = pointAtLengthByTable(polyline, table, 2);
    const b = pointAtLengthByTable(polyline, table, 2);
    expect(a).toEqual({ x: 2, y: 0 });
    expect(a).not.toBe(b);

    const f = frameAtLengthByTable(polyline, table, 2);
    expect(f).toEqual({ point: { x: 2, y: 0 }, tangent: { x: 1, y: 0 }, normal: { x: -0, y: 1 } });
  });

  test('같은 표를 여러 번 조회해도 표를 수정하지 않는다', () => {
    const before = [...table];
    for (let i = 0; i < 5; i++) {
      pointAtLengthByTable(polyline, table, i);
      tangentAtLengthByTable(polyline, table, i);
    }
    expect(table).toEqual(before);
  });
});
