/**
 * bounds sweep time-of-impact helper 단위 테스트.
 *
 * S11-RM-026: boundsSweepPoint(Into)/boundsSweepBounds(Into)의
 * no-hit / proper hit / start-overlap / zero-velocity / corner tie / non-finite·empty 분기와
 * Into mutation, companion allocation을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { boundsSweepBounds } from '../../../src/intersects/bounds-sweep-bounds';
import { boundsSweepBoundsInto } from '../../../src/intersects/bounds-sweep-bounds-into';
import { boundsSweepPoint } from '../../../src/intersects/bounds-sweep-point';
import { boundsSweepPointInto } from '../../../src/intersects/bounds-sweep-point-into';
import type { BoundsLike, BoundsSweepDetail } from '../../../src/types';

const bounds = (minX: number, minY: number, maxX: number, maxY: number): BoundsLike => ({
  min: { x: minX, y: minY },
  max: { x: maxX, y: maxY },
});

/** 새 nested object를 가진 BoundsSweepDetail out을 만든다. */
function freshOut(): BoundsSweepDetail {
  return { hit: false, time: 0, normal: { x: 0, y: 0 }, contact: { x: 0, y: 0 }, startOverlap: false };
}

describe('boundsSweepPoint', () => {
  test('target에 진입하는 moving point는 hit/time/normal/contact를 반환한다', () => {
    const detail = boundsSweepPoint({ x: 0, y: 5 }, { x: 20, y: 0 }, bounds(10, 0, 20, 10));
    expect(detail.hit).toBe(true);
    expect(detail.startOverlap).toBe(false);
    expect(detail.time).toBeCloseTo(0.5, 12);
    expect(detail.normal).toEqual({ x: -1, y: 0 });
    expect(detail.contact.x).toBeCloseTo(10, 12);
    expect(detail.contact.y).toBeCloseTo(5, 12);
  });

  test('y축으로 진입하면 y face normal을 반환한다', () => {
    const detail = boundsSweepPoint({ x: 5, y: -10 }, { x: 0, y: 20 }, bounds(0, 0, 10, 10));
    expect(detail.hit).toBe(true);
    expect(detail.time).toBeCloseTo(0.5, 12);
    expect(detail.normal).toEqual({ x: 0, y: -1 });
    expect(detail.contact.x).toBeCloseTo(5, 12);
    expect(detail.contact.y).toBeCloseTo(0, 12);
  });

  test('음수 velocity로 오른쪽 face에 진입하면 +x normal을 반환한다', () => {
    const detail = boundsSweepPoint({ x: 30, y: 5 }, { x: -40, y: 0 }, bounds(10, 0, 20, 10));
    expect(detail.hit).toBe(true);
    expect(detail.time).toBeCloseTo(0.25, 12);
    expect(detail.normal).toEqual({ x: 1, y: 0 });
    expect(detail.contact.x).toBeCloseTo(20, 12);
    expect(detail.contact.y).toBeCloseTo(5, 12);
  });

  test('음수 velocity로 top face에 진입하면 +y normal을 반환한다', () => {
    const detail = boundsSweepPoint({ x: 5, y: 30 }, { x: 0, y: -40 }, bounds(0, 0, 10, 10));
    expect(detail.hit).toBe(true);
    expect(detail.time).toBeCloseTo(0.5, 12);
    expect(detail.normal).toEqual({ x: 0, y: 1 });
    expect(detail.contact.x).toBeCloseTo(5, 12);
    expect(detail.contact.y).toBeCloseTo(10, 12);
  });

  test('정확히 t = 1에서 닿는 sweep은 inclusive hit이다', () => {
    const detail = boundsSweepPoint({ x: 0, y: 5 }, { x: 10, y: 0 }, bounds(10, 0, 20, 10));
    expect(detail.hit).toBe(true);
    expect(detail.time).toBeCloseTo(1, 12);
    expect(detail.normal).toEqual({ x: -1, y: 0 });
  });

  test('target을 빗나가는 moving point는 no-hit이다', () => {
    const detail = boundsSweepPoint({ x: 0, y: 50 }, { x: 20, y: 0 }, bounds(10, 0, 20, 10));
    expect(detail.hit).toBe(false);
    expect(detail.time).toBe(Number.POSITIVE_INFINITY);
    expect(detail.normal).toEqual({ x: 0, y: 0 });
    expect(Number.isNaN(detail.contact.x)).toBe(true);
    expect(Number.isNaN(detail.contact.y)).toBe(true);
    expect(detail.startOverlap).toBe(false);
  });

  test('target 내부에서 시작하면 start-overlap이다', () => {
    const detail = boundsSweepPoint({ x: 5, y: 5 }, { x: 1, y: 1 }, bounds(0, 0, 10, 10));
    expect(detail.hit).toBe(true);
    expect(detail.startOverlap).toBe(true);
    expect(detail.time).toBe(0);
    expect(detail.normal).toEqual({ x: 0, y: 0 });
    expect(detail.contact).toEqual({ x: 5, y: 5 });
  });

  test('closed boundary 위에서 시작해도 start-overlap이다', () => {
    const detail = boundsSweepPoint({ x: 0, y: 5 }, { x: -1, y: 0 }, bounds(0, 0, 10, 10));
    expect(detail.hit).toBe(true);
    expect(detail.startOverlap).toBe(true);
    expect(detail.contact).toEqual({ x: 0, y: 5 });
  });

  test('zero velocity는 시작 overlap이면 start-overlap, 아니면 no-hit이다', () => {
    const inside = boundsSweepPoint({ x: 5, y: 5 }, { x: 0, y: 0 }, bounds(0, 0, 10, 10));
    expect(inside.hit).toBe(true);
    expect(inside.startOverlap).toBe(true);
    expect(inside.time).toBe(0);

    const outside = boundsSweepPoint({ x: 50, y: 50 }, { x: 0, y: 0 }, bounds(0, 0, 10, 10));
    expect(outside.hit).toBe(false);
    expect(outside.time).toBe(Number.POSITIVE_INFINITY);
  });

  test('t > 1에서 닿는 sweep은 no-hit이다', () => {
    const detail = boundsSweepPoint({ x: 0, y: 5 }, { x: 5, y: 0 }, bounds(10, 0, 20, 10));
    expect(detail.hit).toBe(false);
  });

  test('tuple point/velocity와 object bounds input을 지원한다', () => {
    const detail = boundsSweepPoint([0, 5], [20, 0], bounds(10, 0, 20, 10));
    expect(detail.hit).toBe(true);
    expect(detail.time).toBeCloseTo(0.5, 12);
  });

  test('non-finite input은 no-hit이다', () => {
    expect(boundsSweepPoint({ x: 0, y: 5 }, { x: Number.NaN, y: 0 }, bounds(10, 0, 20, 10)).hit).toBe(false);
    expect(boundsSweepPoint({ x: Number.POSITIVE_INFINITY, y: 5 }, { x: 20, y: 0 }, bounds(10, 0, 20, 10)).hit).toBe(
      false
    );
    expect(boundsSweepPoint({ x: Number.NEGATIVE_INFINITY, y: 5 }, { x: 20, y: 0 }, bounds(10, 0, 20, 10)).hit).toBe(
      false
    );
    expect(boundsSweepPoint({ x: 0, y: 5 }, { x: 20, y: 0 }, bounds(10, 0, Number.NEGATIVE_INFINITY, 10)).hit).toBe(
      false
    );
  });

  test('empty/inverted target bounds는 no-hit이다', () => {
    expect(boundsSweepPoint({ x: 0, y: 5 }, { x: 20, y: 0 }, bounds(10, 0, 10, 10)).hit).toBe(false);
    expect(boundsSweepPoint({ x: 0, y: 5 }, { x: 20, y: 0 }, bounds(20, 0, 10, 10)).hit).toBe(false);
  });
});

describe('boundsSweepBounds', () => {
  test('target에 진입하는 moving bounds는 time과 normal을 반환한다', () => {
    const detail = boundsSweepBounds(bounds(-1, -1, 1, 1), { x: 10, y: 0 }, bounds(9, -10, 19, 10));
    expect(detail.hit).toBe(true);
    expect(detail.time).toBeCloseTo(0.8, 12);
    expect(detail.normal).toEqual({ x: -1, y: 0 });
    expect(detail.contact.x).toBeCloseTo(8, 12);
    expect(detail.contact.y).toBeCloseTo(0, 12);
  });

  test('x/y slab 동시 hit corner는 x axis normal로 tie를 고정한다', () => {
    const detail = boundsSweepBounds(bounds(-1, -1, 1, 1), { x: 10, y: 10 }, bounds(6, 6, 28, 28));
    expect(detail.hit).toBe(true);
    expect(detail.time).toBeCloseTo(0.5, 12);
    expect(detail.normal).toEqual({ x: -1, y: 0 });
    expect(detail.contact.x).toBeCloseTo(5, 12);
    expect(detail.contact.y).toBeCloseTo(5, 12);
  });

  test('음수 velocity corner tie도 x axis normal(+x)로 고정한다', () => {
    // moving center (0,0)에서 음수 대각선 velocity로 expanded box corner에 동시 진입한다.
    const detail = boundsSweepBounds(bounds(-1, -1, 1, 1), { x: -10, y: -10 }, bounds(-28, -28, -6, -6));
    expect(detail.hit).toBe(true);
    expect(detail.time).toBeCloseTo(0.5, 12);
    expect(detail.normal).toEqual({ x: 1, y: 0 });
    expect(detail.contact.x).toBeCloseTo(-5, 12);
    expect(detail.contact.y).toBeCloseTo(-5, 12);
  });

  test('빗나가는 moving bounds는 no-hit full result를 반환한다', () => {
    const detail = boundsSweepBounds(bounds(-1, -1, 1, 1), { x: 0, y: 100 }, bounds(50, 0, 60, 10));
    expect(detail.hit).toBe(false);
    expect(detail.time).toBe(Number.POSITIVE_INFINITY);
    expect(detail.normal).toEqual({ x: 0, y: 0 });
    expect(Number.isNaN(detail.contact.x)).toBe(true);
    expect(Number.isNaN(detail.contact.y)).toBe(true);
    expect(detail.startOverlap).toBe(false);
  });

  test('target과 overlap 상태에서 시작하면 start-overlap이고 contact는 moving center다', () => {
    const detail = boundsSweepBounds(bounds(0, 0, 4, 4), { x: 1, y: 1 }, bounds(2, 2, 10, 10));
    expect(detail.hit).toBe(true);
    expect(detail.startOverlap).toBe(true);
    expect(detail.time).toBe(0);
    expect(detail.contact).toEqual({ x: 2, y: 2 });
  });

  test('empty/inverted moving bounds는 no-hit이다', () => {
    expect(boundsSweepBounds(bounds(2, 2, 2, 4), { x: 1, y: 0 }, bounds(5, 0, 10, 10)).hit).toBe(false);
    expect(boundsSweepBounds(bounds(4, 4, 2, 2), { x: 1, y: 0 }, bounds(5, 0, 10, 10)).hit).toBe(false);
  });

  test('non-finite input은 no-hit이다', () => {
    expect(boundsSweepBounds(bounds(-1, -1, 1, 1), { x: Number.NaN, y: 0 }, bounds(9, -10, 19, 10)).hit).toBe(false);
  });

  test('tuple velocity input을 지원한다', () => {
    const detail = boundsSweepBounds(bounds(-1, -1, 1, 1), [10, 0], bounds(9, -10, 19, 10));
    expect(detail.time).toBeCloseTo(0.8, 12);
  });
});

describe('boundsSweep Into / companion', () => {
  test('Into는 기존 nested normal/contact object에 기록하고 같은 out을 반환한다', () => {
    const out = freshOut();
    const normalRef = out.normal;
    const contactRef = out.contact;
    const result = boundsSweepPointInto(out, { x: 0, y: 5 }, { x: 20, y: 0 }, bounds(10, 0, 20, 10));
    expect(result).toBe(out);
    expect(result.normal).toBe(normalRef);
    expect(result.contact).toBe(contactRef);
    expect(result.hit).toBe(true);
    expect(result.normal).toEqual({ x: -1, y: 0 });
    expect(result.contact.x).toBeCloseTo(10, 12);
  });

  test('Into는 no-hit도 full result로 out에 기록한다', () => {
    const out = freshOut();
    const result = boundsSweepPointInto(out, { x: 0, y: 50 }, { x: 20, y: 0 }, bounds(10, 0, 20, 10));
    expect(result.hit).toBe(false);
    expect(result.time).toBe(Number.POSITIVE_INFINITY);
    expect(Number.isNaN(result.contact.x)).toBe(true);
  });

  test('boundsSweepBoundsInto도 같은 out과 nested object를 재사용한다', () => {
    const out = freshOut();
    const normalRef = out.normal;
    const result = boundsSweepBoundsInto(out, bounds(-1, -1, 1, 1), { x: 10, y: 0 }, bounds(9, -10, 19, 10));
    expect(result).toBe(out);
    expect(result.normal).toBe(normalRef);
    expect(result.hit).toBe(true);
  });

  test('companion은 새 detail object와 새 nested object를 반환한다', () => {
    const a = boundsSweepPoint({ x: 0, y: 5 }, { x: 20, y: 0 }, bounds(10, 0, 20, 10));
    const b = boundsSweepPoint({ x: 0, y: 5 }, { x: 20, y: 0 }, bounds(10, 0, 20, 10));
    expect(a).not.toBe(b);
    expect(a.normal).not.toBe(b.normal);
    expect(a.contact).not.toBe(b.contact);
  });
});
