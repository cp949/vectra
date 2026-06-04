/**
 * triangle nine-point circle 단위 테스트.
 *
 * ninePointCircleInto / ninePointCircle의 center(circumcenter-orthocenter midpoint),
 * radius(circumradius 절반), degenerate/non-finite 처리, output 계약, aliasing 안전성을 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { circumcenter } from '../../../src/triangle/circumcenter';
import { circumradius } from '../../../src/triangle/circumradius';
import { ninePointCircle } from '../../../src/triangle/nine-point-circle';
import { ninePointCircleInto } from '../../../src/triangle/nine-point-circle-into';
import { orthocenter } from '../../../src/triangle/orthocenter';

/** 직각삼각형. 외심 = 빗변 BC 중점 (2, 1.5), 수심 = 직각 꼭짓점 A (0,0) */
const right = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };

/** 예각삼각형 */
const acute = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 1, y: 3 } };

/** collinear(degenerate) triangle */
const collinear = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };

/** 세 vertex가 한 점인 triangle */
const singlePoint = { a: { x: 1, y: 1 }, b: { x: 1, y: 1 }, c: { x: 1, y: 1 } };

describe('ninePointCircleInto', () => {
  test('직각삼각형: center는 (1, 0.75), radius는 1.25다', () => {
    const out = { center: { x: 0, y: 0 }, radius: 0 };
    const result = ninePointCircleInto(out, right);
    expect(result).toBe(out);
    expect(out.center.x).toBeCloseTo(1, 10);
    expect(out.center.y).toBeCloseTo(0.75, 10);
    expect(out.radius).toBeCloseTo(1.25, 10);
  });

  test('예각삼각형: center는 circumcenter와 orthocenter의 midpoint다', () => {
    const u = circumcenter(acute);
    const h = orthocenter(acute);
    expect(u).not.toBeUndefined();
    expect(h).not.toBeUndefined();
    if (u === undefined || h === undefined) throw new Error('circumcenter/orthocenter가 정의되어야 한다');
    const out = { center: { x: 0, y: 0 }, radius: 0 };
    expect(ninePointCircleInto(out, acute)).not.toBe(false);
    // midpoint 동치를 conditional skip 없이 무조건 검증한다.
    expect(out.center.x).toBeCloseTo((u.x + h.x) / 2, 10);
    expect(out.center.y).toBeCloseTo((u.y + h.y) / 2, 10);
  });

  test('예각삼각형: radius는 circumradius의 절반이다', () => {
    const r = circumradius(acute);
    expect(r).not.toBeUndefined();
    if (r === undefined) throw new Error('circumradius가 정의되어야 한다');
    const out = { center: { x: 0, y: 0 }, radius: 0 };
    expect(ninePointCircleInto(out, acute)).not.toBe(false);
    // radius 동치를 conditional skip 없이 무조건 검증한다.
    expect(out.radius).toBeCloseTo(r / 2, 10);
  });

  test('tuple input도 처리한다', () => {
    const t = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
    ] as const;
    const out = { center: { x: 0, y: 0 }, radius: 0 };
    const result = ninePointCircleInto(out, t);
    expect(result).not.toBe(false);
    if (result !== false) {
      expect(result.center.x).toBeCloseTo(1, 10);
      expect(result.center.y).toBeCloseTo(0.75, 10);
      expect(result.radius).toBeCloseTo(1.25, 10);
    }
  });

  test('out.center가 input vertex storage와 aliasing되어도 올바른 결과를 기록한다', () => {
    const shared = { x: 0, y: 0 };
    // vertex a와 out.center가 같은 object다.
    const t = { a: shared, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };
    const out = { center: shared, radius: 0 };
    const result = ninePointCircleInto(out, t);
    expect(result).toBe(out);
    expect(out.center.x).toBeCloseTo(1, 10);
    expect(out.center.y).toBeCloseTo(0.75, 10);
    expect(out.radius).toBeCloseTo(1.25, 10);
  });

  test('collinear triangle: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { center: { x: 99, y: 99 }, radius: 99 };
    const result = ninePointCircleInto(out, collinear);
    expect(result).toBe(false);
    expect(out.center.x).toBe(99);
    expect(out.center.y).toBe(99);
    expect(out.radius).toBe(99);
  });

  test('single-point triangle: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { center: { x: 99, y: 99 }, radius: 99 };
    const result = ninePointCircleInto(out, singlePoint);
    expect(result).toBe(false);
    expect(out.center.x).toBe(99);
    expect(out.radius).toBe(99);
  });

  test('non-finite vertex(Infinity): false를 반환하고 out을 수정하지 않는다', () => {
    const t = { a: { x: Infinity, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };
    const out = { center: { x: 99, y: 99 }, radius: 99 };
    expect(ninePointCircleInto(out, t)).toBe(false);
    expect(out.center.x).toBe(99);
    expect(out.radius).toBe(99);
  });

  test('non-finite vertex(NaN): false를 반환하고 out을 수정하지 않는다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: NaN, y: 0 }, c: { x: 0, y: 3 } };
    const out = { center: { x: 99, y: 99 }, radius: 99 };
    expect(ninePointCircleInto(out, t)).toBe(false);
    expect(out.center.x).toBe(99);
    expect(out.center.y).toBe(99);
    expect(out.radius).toBe(99);
  });

  test('non-finite vertex(-Infinity): false를 반환하고 out을 수정하지 않는다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: -Infinity } };
    const out = { center: { x: 99, y: 99 }, radius: 99 };
    expect(ninePointCircleInto(out, t)).toBe(false);
    expect(out.center.x).toBe(99);
    expect(out.center.y).toBe(99);
    expect(out.radius).toBe(99);
  });

  test('near-collinear(signedArea2x≠0이지만 raw D 전개가 0): 성공 시 유한 center/radius·circumradius를 쓴다', () => {
    // signedArea2x = -1.42e-14(≠0, guard 통과)이지만 raw 좌표 전개 D = 2*(ax*(by-cy)+...)는 0이다.
    const t = {
      a: { x: 3.8400211035452747, y: 17.281933327867037 },
      b: { x: 8.156115648087077, y: 31.91817240438104 },
      c: { x: 9.039683586890016, y: 34.91442548901669 },
    };
    const out = { center: { x: 0, y: 0 }, radius: 0 };
    const result = ninePointCircleInto(out, t);
    // signedArea2x≠0이라 non-degenerate → 성공해야 한다. 성공 시 center/radius는 유한이어야 한다.
    expect(result).not.toBe(false);
    expect(Number.isFinite(out.center.x)).toBe(true);
    expect(Number.isFinite(out.center.y)).toBe(true);
    expect(Number.isFinite(out.radius)).toBe(true);
    const r = circumradius(t);
    expect(r).not.toBeUndefined();
    expect(Number.isFinite(r)).toBe(true);
  });
});

describe('ninePointCircle', () => {
  test('직각삼각형: nine-point circle을 새 plain object로 반환한다', () => {
    const result = ninePointCircle(right);
    expect(result).toEqual({ center: { x: 1, y: 0.75 }, radius: 1.25 });
  });

  test('성공 시 매번 새 object를 반환한다', () => {
    const r1 = ninePointCircle(right);
    const r2 = ninePointCircle(right);
    expect(r1).not.toBe(r2);
    expect(r1?.center).not.toBe(r2?.center);
  });

  test('collinear triangle: undefined를 반환한다', () => {
    expect(ninePointCircle(collinear)).toBeUndefined();
  });

  test('single-point triangle: undefined를 반환한다', () => {
    expect(ninePointCircle(singlePoint)).toBeUndefined();
  });

  test('non-finite vertex: undefined를 반환한다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: -Infinity } };
    expect(ninePointCircle(t)).toBeUndefined();
  });
});
