/**
 * capsule과 점·선분·capsule 교차의 경계와 잘못된 반지름 처리를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { intersectsCapsuleCapsule } from '../../../src/intersects/intersects-capsule-capsule';
import { intersectsCapsulePoint } from '../../../src/intersects/intersects-capsule-point';
import { intersectsCapsuleSegment } from '../../../src/intersects/intersects-capsule-segment';
import type { Capsule, Segment } from '../../../src/types/flat-shapes.internal';

// a=(0,0), b=(10,0), r=2 인 수평 capsule
const horizontal: Capsule = { x1: 0, y1: 0, x2: 10, y2: 0, r: 2 };
// zero-axis capsule = center (0,0), radius 5 circle
const zeroAxis: Capsule = { x1: 0, y1: 0, x2: 0, y2: 0, r: 5 };

// ─── intersectsCapsulePoint ──────────────────────────────────────────────────────

describe('intersectsCapsulePoint - side region', () => {
  test('axis 위 point는 true', () => {
    expect(intersectsCapsulePoint(horizontal, { x: 5, y: 0 })).toBe(true);
  });

  test('side 내부 point는 true', () => {
    expect(intersectsCapsulePoint(horizontal, { x: 5, y: 1 })).toBe(true);
  });

  test('side boundary point(distance === radius)는 true', () => {
    expect(intersectsCapsulePoint(horizontal, { x: 5, y: 2 })).toBe(true);
  });

  test('side 외부 point는 false', () => {
    expect(intersectsCapsulePoint(horizontal, { x: 5, y: 5 })).toBe(false);
  });
});

describe('intersectsCapsulePoint - endpoint cap', () => {
  test('endpoint cap 내부 point는 true', () => {
    expect(intersectsCapsulePoint(horizontal, { x: -1, y: 0 })).toBe(true);
  });

  test('endpoint cap boundary point는 true', () => {
    expect(intersectsCapsulePoint(horizontal, { x: -2, y: 0 })).toBe(true);
  });

  test('endpoint cap 외부 point는 false', () => {
    expect(intersectsCapsulePoint(horizontal, { x: -3, y: 0 })).toBe(false);
  });
});

describe('intersectsCapsulePoint - zero-axis circle region', () => {
  test('내부 point는 true', () => {
    expect(intersectsCapsulePoint(zeroAxis, { x: 3, y: 0 })).toBe(true);
  });

  test('boundary point는 true', () => {
    expect(intersectsCapsulePoint(zeroAxis, { x: 5, y: 0 })).toBe(true);
  });

  test('외부 point는 false', () => {
    expect(intersectsCapsulePoint(zeroAxis, { x: 8, y: 0 })).toBe(false);
  });
});

describe('intersectsCapsulePoint - radius 0 axis segment region', () => {
  // a=(0,0), b=(10,0), r=0 → axis segment 자체
  const thin: Capsule = { x1: 0, y1: 0, x2: 10, y2: 0, r: 0 };

  test('axis 위 point는 true', () => {
    expect(intersectsCapsulePoint(thin, { x: 5, y: 0 })).toBe(true);
  });

  test('axis 밖 point는 false', () => {
    expect(intersectsCapsulePoint(thin, { x: 5, y: 0.001 })).toBe(false);
  });

  test('zero-axis radius 0(점 capsule)은 그 점에서만 true', () => {
    const dot: Capsule = { x1: 2, y1: 2, x2: 2, y2: 2, r: 0 };
    expect(intersectsCapsulePoint(dot, { x: 2, y: 2 })).toBe(true);
    expect(intersectsCapsulePoint(dot, { x: 2, y: 2.001 })).toBe(false);
  });
});

describe('intersectsCapsulePoint - invalid radius', () => {
  test.each([-1, NaN, Infinity, -Infinity])('radius %s는 RangeError', (radius) => {
    expect(() => intersectsCapsulePoint({ x1: 0, y1: 0, x2: 1, y2: 0, r: radius }, { x: 0, y: 0 })).toThrow(RangeError);
  });
});

// ─── intersectsCapsuleSegment ────────────────────────────────────────────────────

describe('intersectsCapsuleSegment - body crossing', () => {
  test('capsule body를 가로지르는 segment는 true', () => {
    const seg: Segment = { x1: 5, y1: -5, x2: 5, y2: 5 };
    expect(intersectsCapsuleSegment(horizontal, seg)).toBe(true);
  });

  test('양 끝점이 모두 멀어도 axis를 관통하면 true', () => {
    // (-5,-1)→(15,1)는 axis(y=0)를 x=5에서 관통한다. endpoint-only 거리로 환원하면 놓친다.
    const seg: Segment = { x1: -5, y1: -1, x2: 15, y2: 1 };
    expect(intersectsCapsuleSegment(horizontal, seg)).toBe(true);
  });
});

describe('intersectsCapsuleSegment - side boundary', () => {
  test('side boundary에 tangent인 segment는 true', () => {
    // y=2 수평 segment, axis까지 거리 2 === radius
    const seg: Segment = { x1: 0, y1: 2, x2: 10, y2: 2 };
    expect(intersectsCapsuleSegment(horizontal, seg)).toBe(true);
  });

  test('side boundary 바로 바깥 segment는 false', () => {
    const seg: Segment = { x1: 0, y1: 2.001, x2: 10, y2: 2.001 };
    expect(intersectsCapsuleSegment(horizontal, seg)).toBe(false);
  });
});

describe('intersectsCapsuleSegment - endpoint cap', () => {
  test('endpoint cap에 tangent인 segment는 true', () => {
    // x=12 수직 segment, axis 끝점 (10,0)까지 거리 2 === radius
    const seg: Segment = { x1: 12, y1: 0, x2: 12, y2: 5 };
    expect(intersectsCapsuleSegment(horizontal, seg)).toBe(true);
  });

  test('endpoint cap 바깥 separated segment는 false', () => {
    const seg: Segment = { x1: 14, y1: 0, x2: 14, y2: 5 };
    expect(intersectsCapsuleSegment(horizontal, seg)).toBe(false);
  });
});

describe('intersectsCapsuleSegment - zero-axis capsule', () => {
  // center (0,0), radius 5 circle region
  test('disk를 지나는 segment는 true', () => {
    const seg: Segment = { x1: 3, y1: 0, x2: 3, y2: 10 };
    expect(intersectsCapsuleSegment(zeroAxis, seg)).toBe(true);
  });

  test('disk 바깥 separated segment는 false', () => {
    const seg: Segment = { x1: 6, y1: 0, x2: 6, y2: 10 };
    expect(intersectsCapsuleSegment(zeroAxis, seg)).toBe(false);
  });

  test('disk boundary에 tangent인 segment는 true', () => {
    const seg: Segment = { x1: 5, y1: -5, x2: 5, y2: 5 };
    expect(intersectsCapsuleSegment(zeroAxis, seg)).toBe(true);
  });
});

describe('intersectsCapsuleSegment - zero-length segment', () => {
  test('내부 point segment는 true', () => {
    const seg: Segment = { x1: 5, y1: 1, x2: 5, y2: 1 };
    expect(intersectsCapsuleSegment(horizontal, seg)).toBe(true);
  });

  test('boundary point segment는 true', () => {
    const seg: Segment = { x1: 5, y1: 2, x2: 5, y2: 2 };
    expect(intersectsCapsuleSegment(horizontal, seg)).toBe(true);
  });

  test('외부 point segment는 false', () => {
    const seg: Segment = { x1: 5, y1: 5, x2: 5, y2: 5 };
    expect(intersectsCapsuleSegment(horizontal, seg)).toBe(false);
  });
});

describe('intersectsCapsuleSegment - radius 0 (axis segment vs segment)', () => {
  const thin: Capsule = { x1: 0, y1: 0, x2: 10, y2: 0, r: 0 };

  test('axis와 crossing하는 segment는 true', () => {
    const seg: Segment = { x1: 5, y1: -1, x2: 5, y2: 1 };
    expect(intersectsCapsuleSegment(thin, seg)).toBe(true);
  });

  test('axis와 collinear overlap segment는 true', () => {
    const seg: Segment = { x1: 3, y1: 0, x2: 7, y2: 0 };
    expect(intersectsCapsuleSegment(thin, seg)).toBe(true);
  });

  test('axis에 닿지 않는 separated segment는 false', () => {
    const seg: Segment = { x1: 0, y1: 1, x2: 10, y2: 1 };
    expect(intersectsCapsuleSegment(thin, seg)).toBe(false);
  });
});

describe('intersectsCapsuleSegment - skew segment endpoint clamp', () => {
  // 교차하지 않는 skew(non-parallel) segment. closest point가 input 끝점으로 clamp되는
  // kernel 분기(t<0 / t>1 재계산)를 public 경로로 실행한다.
  test('input 시작점으로 clamp되는 skew segment(거리 === radius)는 true', () => {
    // axis(0,0)-(10,0) r=2, input (3,-2)-(8,-10): closest는 input 시작점 (3,-2), 거리 2
    const seg: Segment = { x1: 3, y1: -2, x2: 8, y2: -10 };
    expect(intersectsCapsuleSegment(horizontal, seg)).toBe(true);
  });

  test('input 끝점으로 clamp되는 skew segment(거리 === radius)는 true', () => {
    // input (3,-10)-(8,-2): closest는 input 끝점 (8,-2), 거리 2
    const seg: Segment = { x1: 3, y1: -10, x2: 8, y2: -2 };
    expect(intersectsCapsuleSegment(horizontal, seg)).toBe(true);
  });

  test('clamp 후에도 분리된 skew segment는 false', () => {
    const seg: Segment = { x1: 3, y1: -3, x2: 8, y2: -11 };
    expect(intersectsCapsuleSegment(horizontal, seg)).toBe(false);
  });
});

describe('intersectsCapsuleSegment - zero-axis capsule × zero-length segment', () => {
  // 양쪽 모두 점으로 환원되는 결합 degenerate를 capsule×segment 경로로 실행한다.
  test('disk 내부 point segment는 true', () => {
    const seg: Segment = { x1: 3, y1: 0, x2: 3, y2: 0 };
    expect(intersectsCapsuleSegment(zeroAxis, seg)).toBe(true);
  });

  test('disk boundary point segment는 true', () => {
    const seg: Segment = { x1: 5, y1: 0, x2: 5, y2: 0 };
    expect(intersectsCapsuleSegment(zeroAxis, seg)).toBe(true);
  });

  test('disk 외부 point segment는 false', () => {
    const seg: Segment = { x1: 6, y1: 0, x2: 6, y2: 0 };
    expect(intersectsCapsuleSegment(zeroAxis, seg)).toBe(false);
  });
});

describe('intersectsCapsuleSegment - invalid radius', () => {
  test.each([-1, NaN, Infinity, -Infinity])('radius %s는 RangeError', (radius) => {
    const seg: Segment = { x1: 0, y1: 0, x2: 1, y2: 1 };
    expect(() => intersectsCapsuleSegment({ x1: 0, y1: 0, x2: 1, y2: 0, r: radius }, seg)).toThrow(RangeError);
  });
});

// ─── intersectsCapsuleCapsule ────────────────────────────────────────────────────

describe('intersectsCapsuleCapsule - parallel body', () => {
  // A: axis (0,0)-(10,0) r=2
  test('body가 겹치면 true', () => {
    const b: Capsule = { x1: 0, y1: 3, x2: 10, y2: 3, r: 2 };
    expect(intersectsCapsuleCapsule(horizontal, b)).toBe(true);
  });

  test('side tangent(axis 거리 === rA + rB)는 true', () => {
    // axis 거리 4 === 2 + 2
    const b: Capsule = { x1: 0, y1: 4, x2: 10, y2: 4, r: 2 };
    expect(intersectsCapsuleCapsule(horizontal, b)).toBe(true);
  });

  test('separated capsule은 false', () => {
    const b: Capsule = { x1: 0, y1: 5, x2: 10, y2: 5, r: 2 };
    expect(intersectsCapsuleCapsule(horizontal, b)).toBe(false);
  });
});

describe('intersectsCapsuleCapsule - axis crossing', () => {
  test('axis가 교차하면 true', () => {
    const b: Capsule = { x1: 5, y1: -5, x2: 5, y2: 5, r: 1 };
    expect(intersectsCapsuleCapsule(horizontal, b)).toBe(true);
  });
});

describe('intersectsCapsuleCapsule - endpoint cap', () => {
  test('endpoint cap끼리 tangent(거리 === rA + rB)는 true', () => {
    // A 끝점 (10,0), B 끝점 (14,0), 거리 4 === 2 + 2
    const b: Capsule = { x1: 14, y1: 0, x2: 20, y2: 0, r: 2 };
    expect(intersectsCapsuleCapsule(horizontal, b)).toBe(true);
  });

  test('endpoint cap끼리 separated는 false', () => {
    const b: Capsule = { x1: 15, y1: 0, x2: 20, y2: 0, r: 2 };
    expect(intersectsCapsuleCapsule(horizontal, b)).toBe(false);
  });
});

describe('intersectsCapsuleCapsule - 한쪽 zero-axis (circle vs capsule)', () => {
  test('circle이 capsule과 겹치면 true', () => {
    const circle: Capsule = { x1: 5, y1: 3, x2: 5, y2: 3, r: 2 };
    expect(intersectsCapsuleCapsule(horizontal, circle)).toBe(true);
  });

  test('circle이 capsule과 떨어져 있으면 false', () => {
    const circle: Capsule = { x1: 5, y1: 5, x2: 5, y2: 5, r: 2 };
    expect(intersectsCapsuleCapsule(horizontal, circle)).toBe(false);
  });
});

describe('intersectsCapsuleCapsule - 양쪽 zero-axis (circle vs circle)', () => {
  test('tangent(중심거리 === rA + rB)는 true', () => {
    const a: Capsule = { x1: 0, y1: 0, x2: 0, y2: 0, r: 3 };
    const b: Capsule = { x1: 5, y1: 0, x2: 5, y2: 0, r: 2 };
    expect(intersectsCapsuleCapsule(a, b)).toBe(true);
  });

  test('separated circle은 false', () => {
    const a: Capsule = { x1: 0, y1: 0, x2: 0, y2: 0, r: 3 };
    const b: Capsule = { x1: 6, y1: 0, x2: 6, y2: 0, r: 2 };
    expect(intersectsCapsuleCapsule(a, b)).toBe(false);
  });
});

describe('intersectsCapsuleCapsule - radius 0 양쪽 (segment vs segment)', () => {
  const a: Capsule = { x1: 0, y1: 0, x2: 10, y2: 0, r: 0 };

  test('axis끼리 crossing이면 true', () => {
    const b: Capsule = { x1: 5, y1: -5, x2: 5, y2: 5, r: 0 };
    expect(intersectsCapsuleCapsule(a, b)).toBe(true);
  });

  test('axis끼리 touch이면 true', () => {
    // b 끝점 (10,0)이 a axis 위에 닿는다
    const b: Capsule = { x1: 10, y1: 0, x2: 10, y2: 5, r: 0 };
    expect(intersectsCapsuleCapsule(a, b)).toBe(true);
  });

  test('axis끼리 떨어진 평행이면 false', () => {
    const b: Capsule = { x1: 0, y1: 1, x2: 10, y2: 1, r: 0 };
    expect(intersectsCapsuleCapsule(a, b)).toBe(false);
  });
});

describe('intersectsCapsuleCapsule - 평행 reversed axis 끝점 clamp', () => {
  // 방향이 반대인 평행 axis. closest pair가 far 끝점으로 clamp되는 kernel 분기(t>1 재계산)를
  // public 경로로 실행한다.
  test('떨어진 reversed 평행 capsule은 false', () => {
    // A axis(0,0)-(10,0), B axis(25,3)-(15,3) r=2. closest (10,0)-(15,3), 거리²=34 > 16
    const b: Capsule = { x1: 25, y1: 3, x2: 15, y2: 3, r: 2 };
    expect(intersectsCapsuleCapsule(horizontal, b)).toBe(false);
  });

  test('겹치는 reversed 평행 capsule은 true', () => {
    // B axis(23,1)-(13,1) r=2. closest (10,0)-(13,1), 거리²=10 ≤ 16
    const b: Capsule = { x1: 23, y1: 1, x2: 13, y2: 1, r: 2 };
    expect(intersectsCapsuleCapsule(horizontal, b)).toBe(true);
  });
});

describe('intersectsCapsuleCapsule - 인자 순서 대칭', () => {
  // kernel은 두 segment를 다른 코드 경로로 처리한다. 인자를 바꿔도 같은 결과여야 한다.
  test('skew clamp geometry는 (a,b)와 (b,a)가 일치한다', () => {
    const a: Capsule = { x1: 0, y1: 0, x2: 10, y2: 0, r: 1 };
    const b: Capsule = { x1: 3, y1: -3, x2: 8, y2: -11, r: 1 };
    expect(intersectsCapsuleCapsule(a, b)).toBe(intersectsCapsuleCapsule(b, a));
  });

  test('circle-vs-capsule은 (circle,capsule)과 (capsule,circle)이 일치한다', () => {
    const circle: Capsule = { x1: 5, y1: 3, x2: 5, y2: 3, r: 2 };
    expect(intersectsCapsuleCapsule(circle, horizontal)).toBe(intersectsCapsuleCapsule(horizontal, circle));
  });
});

describe('intersectsCapsuleCapsule - radius 합 overflow', () => {
  test('두 radius가 Number.MAX_VALUE면 rSum²가 Infinity로 overflow해 항상 true', () => {
    const a: Capsule = { x1: 0, y1: 0, x2: 0, y2: 0, r: Number.MAX_VALUE };
    const b: Capsule = { x1: 1e300, y1: 0, x2: 1e300, y2: 0, r: Number.MAX_VALUE };
    expect(intersectsCapsuleCapsule(a, b)).toBe(true);
  });
});

describe('intersectsCapsuleCapsule - invalid radius', () => {
  test.each([-1, NaN, Infinity, -Infinity])('a.radius %s는 RangeError', (radius) => {
    const b: Capsule = { x1: 0, y1: 0, x2: 1, y2: 0, r: 1 };
    expect(() => intersectsCapsuleCapsule({ x1: 0, y1: 0, x2: 1, y2: 0, r: radius }, b)).toThrow(RangeError);
  });

  test.each([-1, NaN, Infinity, -Infinity])('b.radius %s는 RangeError', (radius) => {
    const a: Capsule = { x1: 0, y1: 0, x2: 1, y2: 0, r: 1 };
    expect(() => intersectsCapsuleCapsule(a, { x1: 0, y1: 0, x2: 1, y2: 0, r: radius })).toThrow(RangeError);
  });
});
