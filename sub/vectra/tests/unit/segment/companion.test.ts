import { describe, expect, test } from 'vitest';
import { closestPoint } from '../../../src/segment/closest-point';
import { closestPointInto } from '../../../src/segment/closest-point-into';
import { copyInto } from '../../../src/segment/copy-into';
import { end } from '../../../src/segment/end';
import { endInto } from '../../../src/segment/end-into';
import { fromAngle } from '../../../src/segment/from-angle';
import { fromAngleInto } from '../../../src/segment/from-angle-into';
import { midpoint } from '../../../src/segment/midpoint';
import { midpointInto } from '../../../src/segment/midpoint-into';
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
import { singleIntersection } from '../../../src/segment/single-intersection';
import { singleIntersectionInto } from '../../../src/segment/single-intersection-into';
import { start } from '../../../src/segment/start';
import { startInto } from '../../../src/segment/start-into';
import { translate } from '../../../src/segment/translate';
import { translateInto } from '../../../src/segment/translate-into';
import { vector } from '../../../src/segment/vector';
import { vectorInto } from '../../../src/segment/vector-into';
import type { SegmentWritable, XYWritable } from '../../../src/types';

function makeLine(ax = 0, ay = 0, bx = 4, by = 0): SegmentWritable {
  return { a: { x: ax, y: ay }, b: { x: bx, y: by } };
}

// ─── start / end / vector ────────────────────────────────────────────────────

describe('segment companion - start', () => {
  test('시작점을 새 object로 반환한다', () => {
    const result = start(makeLine(1, 2, 3, 4));

    expect(result).toEqual({ x: 1, y: 2 });
  });

  test('startInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    startInto(out, makeLine(5, 6, 7, 8));
    const result = start(makeLine(5, 6, 7, 8));

    expect(result.x).toBe((out as { x: number; y: number }).x);
    expect(result.y).toBe((out as { x: number; y: number }).y);
  });
});

describe('segment companion - end', () => {
  test('끝점을 새 object로 반환한다', () => {
    const result = end(makeLine(1, 2, 3, 4));

    expect(result).toEqual({ x: 3, y: 4 });
  });

  test('endInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    endInto(out, makeLine(5, 6, 7, 8));
    const result = end(makeLine(5, 6, 7, 8));

    expect(result.x).toBe((out as { x: number; y: number }).x);
    expect(result.y).toBe((out as { x: number; y: number }).y);
  });
});

describe('segment companion - vector', () => {
  test('b - a 벡터를 새 object로 반환한다', () => {
    const result = vector(makeLine(1, 2, 5, 6));

    expect(result).toEqual({ x: 4, y: 4 });
  });

  test('vectorInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    vectorInto(out, makeLine(3, 1, 7, 5));
    const result = vector(makeLine(3, 1, 7, 5));

    expect(result.x).toBe((out as { x: number; y: number }).x);
    expect(result.y).toBe((out as { x: number; y: number }).y);
  });
});

// ─── midpoint ────────────────────────────────────────────────────────────────

describe('segment companion - midpoint', () => {
  test('중점을 새 object로 반환한다', () => {
    const result = midpoint(makeLine(0, 0, 4, 4));

    expect(result).toEqual({ x: 2, y: 2 });
  });

  test('midpointInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    midpointInto(out, makeLine(1, 3, 5, 7));
    const result = midpoint(makeLine(1, 3, 5, 7));

    expect(result.x).toBe((out as { x: number; y: number }).x);
    expect(result.y).toBe((out as { x: number; y: number }).y);
  });
});

// ─── pointAtT ────────────────────────────────────────────────────────────────

describe('segment companion - pointAtT', () => {
  test('t=0.5에서 중점을 새 object로 반환한다', () => {
    const result = pointAtT(makeLine(0, 0, 4, 4), 0.5);

    expect(result).toEqual({ x: 2, y: 2 });
  });

  test('t 범위 밖에서도 unclamped로 계산한다', () => {
    const result = pointAtT(makeLine(0, 0, 4, 0), 2);

    expect(result).toEqual({ x: 8, y: 0 });
  });

  test('pointAtTInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    pointAtTInto(out, makeLine(0, 0, 6, 0), 0.75);
    const result = pointAtT(makeLine(0, 0, 6, 0), 0.75);

    expect(result.x).toBe((out as { x: number; y: number }).x);
    expect(result.y).toBe((out as { x: number; y: number }).y);
  });
});

// ─── projectPoint ────────────────────────────────────────────────────────────

describe('segment companion - projectPoint', () => {
  test('점을 unclamped로 무한 직선에 투영한 결과를 새 object로 반환한다', () => {
    // line=(0,0)→(4,0), point=(2,3): projection=(2,0)
    const result = projectPoint(makeLine(0, 0, 4, 0), { x: 2, y: 3 });

    expect(result).toEqual({ x: 2, y: 0 });
  });

  test('zero-length segment은 시작점을 반환한다', () => {
    const result = projectPoint(makeLine(3, 4, 3, 4), { x: 10, y: 10 });

    expect(result).toEqual({ x: 3, y: 4 });
  });

  test('projectPointInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    projectPointInto(out, makeLine(0, 0, 4, 0), { x: 5, y: 3 });
    const result = projectPoint(makeLine(0, 0, 4, 0), { x: 5, y: 3 });

    expect(result.x).toBe((out as { x: number; y: number }).x);
    expect(result.y).toBe((out as { x: number; y: number }).y);
  });
});

// ─── closestPoint ────────────────────────────────────────────────────────────

describe('segment companion - closestPoint', () => {
  test('유한 구간 안 점을 새 object로 반환한다', () => {
    // line=(0,0)→(4,0), point=(2,3): closest=(2,0)
    const result = closestPoint(makeLine(0, 0, 4, 0), { x: 2, y: 3 });

    expect(result).toEqual({ x: 2, y: 0 });
  });

  test('t 초과 점은 끝점에 clamp된다', () => {
    // line=(0,0)→(4,0), point=(10,0): closest=(4,0)
    const result = closestPoint(makeLine(0, 0, 4, 0), { x: 10, y: 0 });

    expect(result).toEqual({ x: 4, y: 0 });
  });

  test('zero-length segment은 시작점을 반환한다', () => {
    const result = closestPoint(makeLine(3, 4, 3, 4), { x: 10, y: 10 });

    expect(result).toEqual({ x: 3, y: 4 });
  });

  test('closestPointInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    closestPointInto(out, makeLine(0, 0, 4, 0), { x: 2, y: 5 });
    const result = closestPoint(makeLine(0, 0, 4, 0), { x: 2, y: 5 });

    expect(result.x).toBe((out as { x: number; y: number }).x);
    expect(result.y).toBe((out as { x: number; y: number }).y);
  });
});

// ─── normal ──────────────────────────────────────────────────────────────────

describe('segment companion - normal', () => {
  test('기본 left(CCW) 단위 법선벡터를 새 object로 반환한다', () => {
    // line=(0,0)→(4,0): dx=4, dy=0 → left=(-0, 4)/4 = (0, 1)
    const result = normal(makeLine(0, 0, 4, 0));

    expect(result.x).toBeCloseTo(0, 10);
    expect(result.y).toBeCloseTo(1, 10);
  });

  test('right(CW) 단위 법선벡터를 새 object로 반환한다', () => {
    // line=(0,0)→(4,0): right=(0, -4)/4 = (0, -1)
    const result = normal(makeLine(0, 0, 4, 0), 'right');

    expect(result.x).toBeCloseTo(0, 10);
    expect(result.y).toBeCloseTo(-1, 10);
  });

  test('zero-length에서 (0, 0)을 반환한다', () => {
    const result = normal(makeLine(3, 4, 3, 4));

    expect(result).toEqual({ x: 0, y: 0 });
  });

  test('normalInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    normalInto(out, makeLine(0, 0, 3, 4), 'left');
    const result = normal(makeLine(0, 0, 3, 4), 'left');

    expect(result.x).toBeCloseTo((out as { x: number; y: number }).x, 10);
    expect(result.y).toBeCloseTo((out as { x: number; y: number }).y, 10);
  });
});

// ─── singleIntersection ───────────────────────────────────────────────────────

describe('segment companion - singleIntersection', () => {
  test('두 segment이 교차하면 교점을 새 object로 반환한다', () => {
    // (+), (x): (0,0)→(4,0) × (2,-2)→(2,2)
    const a = makeLine(0, 0, 4, 0);
    const b = makeLine(2, -2, 2, 2);
    const result = singleIntersection(a, b);

    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(2, 10);
    expect(result?.y).toBeCloseTo(0, 10);
  });

  test('singleIntersectionInto가 true를 반환할 때 동일한 좌표를 반환한다', () => {
    const a = makeLine(0, 0, 4, 0);
    const b = makeLine(2, -2, 2, 2);
    const out: XYWritable = { x: 0, y: 0 };
    const hit = singleIntersectionInto(out, a, b);
    const result = singleIntersection(a, b);

    expect(hit).toBe(true);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo((out as { x: number; y: number }).x, 10);
    expect(result?.y).toBeCloseTo((out as { x: number; y: number }).y, 10);
  });

  test('교차하지 않으면 undefined를 반환한다', () => {
    // 평행 수평선: (0,0)→(4,0) vs (0,1)→(4,1)
    const result = singleIntersection(makeLine(0, 0, 4, 0), makeLine(0, 1, 4, 1));

    expect(result).toBeUndefined();
  });

  test('collinear에서 undefined를 반환한다', () => {
    // 같은 직선 위 겹치는 두 선분
    const result = singleIntersection(makeLine(0, 0, 4, 0), makeLine(2, 0, 6, 0));

    expect(result).toBeUndefined();
  });
});

// ─── segmentFrom ─────────────────────────────────────────────────────────────

describe('segment companion - segmentFrom', () => {
  test('endpoint를 새 plain object로 반환한다', () => {
    const result = segmentFrom(makeLine(1, 2, 3, 4));

    expect(result.a).toEqual({ x: 1, y: 2 });
    expect(result.b).toEqual({ x: 3, y: 4 });
  });

  test('copyInto와 동일한 결과를 반환한다', () => {
    const out: SegmentWritable = makeLine();
    copyInto(out, makeLine(5, 6, 7, 8));
    const result = segmentFrom(makeLine(5, 6, 7, 8));

    expect(result.a.x).toBe(out.a.x);
    expect(result.a.y).toBe(out.a.y);
    expect(result.b.x).toBe(out.b.x);
    expect(result.b.y).toBe(out.b.y);
  });

  test('새 object를 반환하고 입력을 수정하지 않는다', () => {
    const line = makeLine(1, 2, 3, 4);
    const result = segmentFrom(line);

    expect(result).not.toBe(line);
    expect(result.a).not.toBe(line.a);
    expect(result.b).not.toBe(line.b);
  });
});

// ─── reverse ─────────────────────────────────────────────────────────────────

describe('segment companion - reverse', () => {
  test('endpoint를 교환한 새 plain object를 반환한다', () => {
    const result = reverse(makeLine(1, 2, 3, 4));

    expect(result.a).toEqual({ x: 3, y: 4 });
    expect(result.b).toEqual({ x: 1, y: 2 });
  });

  test('reverseInto와 동일한 결과를 반환한다', () => {
    const out: SegmentWritable = makeLine();
    reverseInto(out, makeLine(1, 2, 3, 4));
    const result = reverse(makeLine(1, 2, 3, 4));

    expect(result.a.x).toBe(out.a.x);
    expect(result.a.y).toBe(out.a.y);
    expect(result.b.x).toBe(out.b.x);
    expect(result.b.y).toBe(out.b.y);
  });
});

// ─── fromAngle ───────────────────────────────────────────────────────────────

describe('segment companion - fromAngle', () => {
  test('origin에서 angle 방향으로 length인 segment을 새 plain object로 반환한다', () => {
    const result = fromAngle({ x: 0, y: 0 }, 0, 5);

    expect(result.a).toEqual({ x: 0, y: 0 });
    expect(result.b.x).toBeCloseTo(5, 10);
    expect(result.b.y).toBeCloseTo(0, 10);
  });

  test('fromAngleInto와 동일한 결과를 반환한다', () => {
    const out: SegmentWritable = makeLine();
    fromAngleInto(out, { x: 1, y: 2 }, Math.PI / 4, 4);
    const result = fromAngle({ x: 1, y: 2 }, Math.PI / 4, 4);

    expect(result.a.x).toBeCloseTo(out.a.x, 10);
    expect(result.a.y).toBeCloseTo(out.a.y, 10);
    expect(result.b.x).toBeCloseTo(out.b.x, 10);
    expect(result.b.y).toBeCloseTo(out.b.y, 10);
  });

  test('length=0이면 zero-length segment을 반환한다', () => {
    const result = fromAngle({ x: 3, y: 4 }, 0, 0);

    expect(result.a).toEqual({ x: 3, y: 4 });
    expect(result.b).toEqual({ x: 3, y: 4 });
  });
});

// ─── translate ───────────────────────────────────────────────────────────────

describe('segment companion - translate', () => {
  test('endpoint를 offset만큼 이동한 새 plain object를 반환한다', () => {
    const result = translate(makeLine(0, 0, 4, 0), { x: 1, y: 2 });

    expect(result.a).toEqual({ x: 1, y: 2 });
    expect(result.b).toEqual({ x: 5, y: 2 });
  });

  test('translateInto와 동일한 결과를 반환한다', () => {
    const out: SegmentWritable = makeLine();
    translateInto(out, makeLine(0, 0, 4, 0), { x: 2, y: -1 });
    const result = translate(makeLine(0, 0, 4, 0), { x: 2, y: -1 });

    expect(result.a.x).toBe(out.a.x);
    expect(result.a.y).toBe(out.a.y);
    expect(result.b.x).toBe(out.b.x);
    expect(result.b.y).toBe(out.b.y);
  });
});

// ─── rotateAround ────────────────────────────────────────────────────────────

describe('segment companion - rotateAround', () => {
  test('center 기준 CCW 90도 회전한 새 plain object를 반환한다', () => {
    // line=(1,0)→(3,0), center=(0,0), angle=π/2
    // a=(1,0) → (0,1), b=(3,0) → (0,3)
    const result = rotateAround(makeLine(1, 0, 3, 0), { x: 0, y: 0 }, Math.PI / 2);

    expect(result.a.x).toBeCloseTo(0, 10);
    expect(result.a.y).toBeCloseTo(1, 10);
    expect(result.b.x).toBeCloseTo(0, 10);
    expect(result.b.y).toBeCloseTo(3, 10);
  });

  test('rotateAroundInto와 동일한 결과를 반환한다', () => {
    const out: SegmentWritable = makeLine();
    rotateAroundInto(out, makeLine(1, 0, 3, 0), { x: 1, y: 1 }, Math.PI / 4);
    const result = rotateAround(makeLine(1, 0, 3, 0), { x: 1, y: 1 }, Math.PI / 4);

    expect(result.a.x).toBeCloseTo(out.a.x, 10);
    expect(result.a.y).toBeCloseTo(out.a.y, 10);
    expect(result.b.x).toBeCloseTo(out.b.x, 10);
    expect(result.b.y).toBeCloseTo(out.b.y, 10);
  });
});
