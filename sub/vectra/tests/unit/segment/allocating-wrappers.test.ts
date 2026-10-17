/**
 * segment 할당형 wrapper 11개를 검증하는 테스트.
 * 대상: closestPoint, end, fromAngle, normal, pointAtT, projectPoint, reverse,
 * rotateAround, segmentFrom, start, vector.
 * 각 wrapper가 대응하는 `*Into`와 같은 값을 만드는지 본다.
 * 호출마다 새 객체를 반환하는지도 본다.
 * unit 테스트가 `*Into`만 import하던 공백을 메운다.
 */
import { describe, expect, test } from 'vitest';
import { closestPoint } from '../../../src/segment/closest-point';
import { closestPointInto } from '../../../src/segment/closest-point-into';
import { createSegment } from '../../../src/segment/create-segment';
import { end } from '../../../src/segment/end';
import { endInto } from '../../../src/segment/end-into';
import { fromAngle } from '../../../src/segment/from-angle';
import { fromAngleInto } from '../../../src/segment/from-angle-into';
import { normal } from '../../../src/segment/normal';
import { normalInto } from '../../../src/segment/normal-into';
import { pointAtT } from '../../../src/segment/point-at-t';
import { pointAtTInto } from '../../../src/segment/point-at-t-into';
import { projectPoint } from '../../../src/segment/project-point';
import { projectPointInto } from '../../../src/segment/project-point-into';
import { reverse } from '../../../src/segment/reverse';
import { reverseInto } from '../../../src/segment/reverse-into';
import { rotateAround } from '../../../src/segment/rotate-around';
import { rotateAroundInto } from '../../../src/segment/rotate-around-into';
import { segmentFrom } from '../../../src/segment/segment-from';
import { start } from '../../../src/segment/start';
import { startInto } from '../../../src/segment/start-into';
import { vector } from '../../../src/segment/vector';
import { vectorInto } from '../../../src/segment/vector-into';

/**
 * 각 case가 공유하는 입력을 만든다.
 * 호출마다 새 객체를 줘서 wrapper가 입력을 바꾸지 않았는지 case 사이에서 구분한다.
 * 길이 5(3-4-5)인 비대칭 segment라 a/b 뒤바뀜과 left/right 뒤바뀜이 값에 드러난다.
 */
function makeLine() {
  return { a: { x: 1, y: 2 }, b: { x: 4, y: 6 } };
}

const point = { x: 7, y: -1 };

/** wrapper 결과와 대응 `*Into` 결과를 같은 입력으로 만드는 case. */
type Case = {
  name: string;
  actual: () => unknown;
  expected: () => unknown;
};

const cases: Case[] = [
  {
    name: 'closestPoint',
    actual: () => closestPoint(makeLine(), point),
    expected: () => closestPointInto({ x: 0, y: 0 }, makeLine(), point),
  },
  {
    name: 'end',
    actual: () => end(makeLine()),
    expected: () => endInto({ x: 0, y: 0 }, makeLine()),
  },
  {
    name: 'fromAngle',
    actual: () => fromAngle({ x: 1, y: 2 }, Math.PI / 3, 5),
    expected: () => fromAngleInto(createSegment(), { x: 1, y: 2 }, Math.PI / 3, 5),
  },
  {
    name: 'normal (기본 side)',
    actual: () => normal(makeLine()),
    expected: () => normalInto({ x: 0, y: 0 }, makeLine()),
  },
  {
    name: 'normal (right)',
    actual: () => normal(makeLine(), 'right'),
    expected: () => normalInto({ x: 0, y: 0 }, makeLine(), 'right'),
  },
  {
    name: 'pointAtT',
    actual: () => pointAtT(makeLine(), 1.5),
    expected: () => pointAtTInto({ x: 0, y: 0 }, makeLine(), 1.5),
  },
  {
    name: 'projectPoint',
    actual: () => projectPoint(makeLine(), point),
    expected: () => projectPointInto({ x: 0, y: 0 }, makeLine(), point),
  },
  {
    name: 'reverse',
    actual: () => reverse(makeLine()),
    expected: () => reverseInto(createSegment(), makeLine()),
  },
  {
    name: 'rotateAround',
    actual: () => rotateAround(makeLine(), { x: 2, y: -3 }, Math.PI / 5),
    expected: () => rotateAroundInto(createSegment(), makeLine(), { x: 2, y: -3 }, Math.PI / 5),
  },
  {
    name: 'start',
    actual: () => start(makeLine()),
    expected: () => startInto({ x: 0, y: 0 }, makeLine()),
  },
  {
    name: 'vector',
    actual: () => vector(makeLine()),
    expected: () => vectorInto({ x: 0, y: 0 }, makeLine()),
  },
];

describe('segment 할당형 wrapper - 대응 Into와의 동치', () => {
  test.each(cases)('$name은 대응 Into와 같은 값을 반환한다', ({ actual, expected }) => {
    expect(actual()).toEqual(expected());
  });

  test.each(cases)('$name은 호출마다 새 객체를 반환한다', ({ actual }) => {
    const first = actual();
    const second = actual();
    expect(first).not.toBe(second);
  });
});

describe('segment 할당형 wrapper - 값 확인', () => {
  test('start와 end는 서로 다른 endpoint를 반환한다', () => {
    expect(start(makeLine())).toEqual({ x: 1, y: 2 });
    expect(end(makeLine())).toEqual({ x: 4, y: 6 });
  });

  test('vector는 b - a를 반환한다', () => {
    expect(vector(makeLine())).toEqual({ x: 3, y: 4 });
  });

  test('normal은 side에 따라 단위 법선의 방향이 반대다', () => {
    const left = normal(makeLine());
    const right = normal(makeLine(), 'right');
    expect(left.x).toBeCloseTo(-0.8, 12);
    expect(left.y).toBeCloseTo(0.6, 12);
    expect(right.x).toBeCloseTo(0.8, 12);
    expect(right.y).toBeCloseTo(-0.6, 12);
  });

  test('reverse는 입력을 바꾸지 않고 endpoint를 교환한 segment를 반환한다', () => {
    const line = makeLine();
    const result = reverse(line);
    expect(result).toEqual({ a: { x: 4, y: 6 }, b: { x: 1, y: 2 } });
    expect(line).toEqual(makeLine());
    expect(result).not.toBe(line);
    expect(result.a).not.toBe(line.b);
    expect(result.b).not.toBe(line.a);
  });

  test('반환한 point를 바꿔도 입력 segment는 바뀌지 않는다', () => {
    const line = makeLine();
    const result = start(line);
    result.x = 99;
    expect(line).toEqual(makeLine());
  });
});

describe('segment 할당형 wrapper - segmentFrom', () => {
  test('SegmentLike 하나를 받으면 endpoint를 복사한 새 segment를 반환한다', () => {
    const line = makeLine();
    const result = segmentFrom(line);
    expect(result).toEqual({ a: { x: 1, y: 2 }, b: { x: 4, y: 6 } });
    expect(result).not.toBe(line);
    expect(result.a).not.toBe(line.a);
    expect(result.b).not.toBe(line.b);
  });

  test('tuple endpoint를 가진 SegmentLike도 plain object로 복사한다', () => {
    const result = segmentFrom({ a: [1, 2] as const, b: [4, 6] as const });
    expect(result).toEqual({ a: { x: 1, y: 2 }, b: { x: 4, y: 6 } });
  });

  test('두 endpoint를 받으면 a, b 순서대로 새 segment를 만든다', () => {
    const a = { x: 1, y: 2 };
    const b = { x: 4, y: 6 };
    const result = segmentFrom(a, b);
    expect(result).toEqual({ a: { x: 1, y: 2 }, b: { x: 4, y: 6 } });
    expect(result.a).not.toBe(a);
    expect(result.b).not.toBe(b);
  });

  test('tuple endpoint 두 개로도 segment를 만든다', () => {
    expect(segmentFrom([1, 2], [4, 6])).toEqual({ a: { x: 1, y: 2 }, b: { x: 4, y: 6 } });
  });
});
