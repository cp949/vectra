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

const point = { x: 7, y: -1 };

/** wrapper 결과와 대응 `*Into` 결과를 같은 입력으로 만드는 case. */
type Case = {
  name: string;
  actual: () => unknown;
  expected: () => unknown;
};

/** 아직 전환하지 않은 start와 vector가 읽을 선분을 만든다. */
function makeLegacyLine() {
  return { a: { x: 1, y: 2 }, b: { x: 4, y: 6 } };
}

/** 평평한 선분을 새로 만든다. */
function makeFlatLine() {
  return { x1: 1, y1: 2, x2: 4, y2: 6 };
}

const cases: Case[] = [
  {
    name: 'closestPoint',
    actual: () => closestPoint(makeFlatLine(), point),
    expected: () => closestPointInto({ x: 0, y: 0 }, makeFlatLine(), point),
  },
  {
    name: 'end',
    actual: () => end(makeFlatLine()),
    expected: () => endInto({ x: 0, y: 0 }, makeFlatLine()),
  },
  {
    name: 'fromAngle',
    actual: () => fromAngle({ x: 1, y: 2 }, Math.PI / 3, 5),
    expected: () => fromAngleInto(createSegment(), { x: 1, y: 2 }, Math.PI / 3, 5),
  },
  {
    name: 'normal (기본 side)',
    actual: () => normal(makeFlatLine()),
    expected: () => normalInto({ x: 0, y: 0 }, makeFlatLine()),
  },
  {
    name: 'normal (right)',
    actual: () => normal(makeFlatLine(), 'right'),
    expected: () => normalInto({ x: 0, y: 0 }, makeFlatLine(), 'right'),
  },
  {
    name: 'pointAtT',
    actual: () => pointAtT(makeFlatLine(), 1.5),
    expected: () => pointAtTInto({ x: 0, y: 0 }, makeFlatLine(), 1.5),
  },
  {
    name: 'projectPoint',
    actual: () => projectPoint(makeFlatLine(), point),
    expected: () => projectPointInto({ x: 0, y: 0 }, makeFlatLine(), point),
  },
  {
    name: 'reverse',
    actual: () => reverse(makeFlatLine()),
    expected: () => reverseInto(createSegment(), makeFlatLine()),
  },
  {
    name: 'rotateAround',
    actual: () => rotateAround(makeFlatLine(), { x: 2, y: -3 }, Math.PI / 5),
    expected: () => rotateAroundInto(createSegment(), makeFlatLine(), { x: 2, y: -3 }, Math.PI / 5),
  },
  {
    name: 'start',
    actual: () => start(makeLegacyLine()),
    expected: () => startInto({ x: 0, y: 0 }, makeLegacyLine()),
  },
  {
    name: 'vector',
    actual: () => vector(makeLegacyLine()),
    expected: () => vectorInto({ x: 0, y: 0 }, makeLegacyLine()),
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
    expect(start(makeLegacyLine())).toEqual({ x: 1, y: 2 });
    expect(end(makeFlatLine())).toEqual({ x: 4, y: 6 });
  });

  test('vector는 b - a를 반환한다', () => {
    expect(vector(makeLegacyLine())).toEqual({ x: 3, y: 4 });
  });

  test('normal은 side에 따라 단위 법선의 방향이 반대다', () => {
    const left = normal(makeFlatLine());
    const right = normal(makeFlatLine(), 'right');
    expect(left.x).toBeCloseTo(-0.8, 12);
    expect(left.y).toBeCloseTo(0.6, 12);
    expect(right.x).toBeCloseTo(0.8, 12);
    expect(right.y).toBeCloseTo(-0.6, 12);
  });

  test('reverse는 입력을 바꾸지 않고 endpoint를 교환한 segment를 반환한다', () => {
    const line = makeFlatLine();
    const result = reverse(line);
    expect(result).toEqual({ x1: 4, y1: 6, x2: 1, y2: 2 });
    expect(line).toEqual(makeFlatLine());
    expect(result).not.toBe(line);
  });

  test('반환한 시작점을 바꿔도 입력 선분은 바뀌지 않는다', () => {
    const line = makeLegacyLine();
    const result = start(line);
    result.x = 99;
    expect(line).toEqual(makeLegacyLine());
  });
});

describe('segmentFrom', () => {
  test('두 끝점의 좌표를 새 선분에 복사한다', () => {
    const line = makeFlatLine();
    const result = segmentFrom(line);
    expect(result).toEqual(line);
    expect(result).not.toBe(line);
  });
});
