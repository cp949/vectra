/**
 * triangle type query 단위 테스트.
 *
 * isEquilateral, isIsosceles, isRight, isObtuse, isAcute의 분류 정확도와
 * epsilon 허용 범위, tuple input 처리를 함께 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { isAcute } from '../../../src/triangle/is-acute';
import { isEquilateral } from '../../../src/triangle/is-equilateral';
import { isIsosceles } from '../../../src/triangle/is-isosceles';
import { isObtuse } from '../../../src/triangle/is-obtuse';
import { isRight } from '../../../src/triangle/is-right';

/** 3-4-5 직각삼각형: a(0,0) b(3,0) c(0,4) — CCW */
const right345 = { a: { x: 0, y: 0 }, b: { x: 3, y: 0 }, c: { x: 0, y: 4 } };

/** 변이 1인 정삼각형 */
const equilateral = {
  a: { x: 0, y: 0 },
  b: { x: 1, y: 0 },
  c: { x: 0.5, y: Math.sqrt(3) / 2 },
};

/** 예각삼각형: a(0,0) b(4,0) c(2,4) */
const acute = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 4 } };

/** 둔각삼각형: a(0,0) b(10,0) c(1,1) */
const obtuse = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 1, y: 1 } };

describe('isEquilateral', () => {
  test('정삼각형: float 좌표 오차를 포함하므로 작은 epsilon으로 true를 반환한다', () => {
    // equilateral fixture 변 길이 차이가 ~1e-16이므로 epsilon=1e-10이면 true
    expect(isEquilateral(equilateral, 1e-10)).toBe(true);
  });

  test('정확한 정삼각형이 아닌 경우 epsilon=0이면 false를 반환한다', () => {
    // epsilon=0, 변 길이가 하나라도 다르면 false
    const iso = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 1, y: 2 } };
    expect(isEquilateral(iso, 0)).toBe(false);
  });

  test('직각삼각형(3-4-5): false를 반환한다', () => {
    expect(isEquilateral(right345)).toBe(false);
  });

  test('이등변삼각형(두 변만 같음): false를 반환한다', () => {
    // a(0,0) b(2,0) c(1,2): ab=2, bc=√5, ca=√5 → isosceles, not equilateral
    const iso = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 1, y: 2 } };
    expect(isEquilateral(iso)).toBe(false);
  });

  test('epsilon 허용 범위 내: true를 반환한다', () => {
    // 약간 변형된 정삼각형
    const almostEq = {
      a: { x: 0, y: 0 },
      b: { x: 1.001, y: 0 },
      c: { x: 0.5, y: Math.sqrt(3) / 2 },
    };
    expect(isEquilateral(almostEq, 0.01)).toBe(true);
  });

  test('epsilon 범위 초과: false를 반환한다', () => {
    const almostEq = {
      a: { x: 0, y: 0 },
      b: { x: 1.1, y: 0 },
      c: { x: 0.5, y: Math.sqrt(3) / 2 },
    };
    expect(isEquilateral(almostEq, 0.001)).toBe(false);
  });

  test('tuple input도 처리한다', () => {
    const t = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0.5, y: Math.sqrt(3) / 2 },
    ] as const;
    expect(isEquilateral(t, 1e-10)).toBe(true);
  });
});

describe('isIsosceles', () => {
  test('이등변삼각형: true를 반환한다', () => {
    // a(0,0) b(2,0) c(1,2): bc=ca=√5
    const iso = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 1, y: 2 } };
    expect(isIsosceles(iso)).toBe(true);
  });

  test('정삼각형도 isosceles이다', () => {
    expect(isIsosceles(equilateral)).toBe(true);
  });

  test('직각삼각형(3-4-5): 변이 모두 다르므로 false를 반환한다', () => {
    expect(isIsosceles(right345)).toBe(false);
  });

  test('epsilon 허용 범위 내: true를 반환한다', () => {
    // a(0,0) b(2,0) c(1.002, 2): ca≈cb이지만 약간 다름
    // ca = √(1.002²+4) ≈ 2.0002, cb = √(0.998²+4) ≈ 1.9998
    // |ca-cb| ≈ 0.0004, epsilon=0.01이면 true
    const almostIso = {
      a: { x: 0, y: 0 },
      b: { x: 2, y: 0 },
      c: { x: 1.002, y: 2 },
    };
    expect(isIsosceles(almostIso, 0.01)).toBe(true);
  });

  test('tuple input도 처리한다', () => {
    const t = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 2 },
    ] as const;
    expect(isIsosceles(t)).toBe(true);
  });
});

describe('isRight', () => {
  test('3-4-5 직각삼각형: true를 반환한다', () => {
    expect(isRight(right345)).toBe(true);
  });

  test('예각삼각형: false를 반환한다', () => {
    expect(isRight(acute)).toBe(false);
  });

  test('둔각삼각형: false를 반환한다', () => {
    expect(isRight(obtuse)).toBe(false);
  });

  test('정삼각형: false를 반환한다', () => {
    expect(isRight(equilateral)).toBe(false);
  });

  test('epsilon을 지정하면 거의 직각인 삼각형을 허용한다', () => {
    // 직각에서 약간 변형
    const almostRight = { a: { x: 0, y: 0 }, b: { x: 3, y: 0 }, c: { x: 0.01, y: 4 } };
    expect(isRight(almostRight, 0.1)).toBe(true);
  });

  test('tuple input도 처리한다', () => {
    const t = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 0, y: 4 },
    ] as const;
    expect(isRight(t)).toBe(true);
  });
});

describe('isObtuse', () => {
  test('둔각삼각형: true를 반환한다', () => {
    expect(isObtuse(obtuse)).toBe(true);
  });

  test('예각삼각형: false를 반환한다', () => {
    expect(isObtuse(acute)).toBe(false);
  });

  test('정삼각형: false를 반환한다', () => {
    expect(isObtuse(equilateral)).toBe(false);
  });

  test('3-4-5 직각삼각형: false를 반환한다', () => {
    // 직각은 > π/2가 아니므로 false
    expect(isObtuse(right345)).toBe(false);
  });

  test('tuple input도 처리한다', () => {
    const t = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 1, y: 1 },
    ] as const;
    expect(isObtuse(t)).toBe(true);
  });
});

describe('isAcute', () => {
  test('예각삼각형: true를 반환한다', () => {
    expect(isAcute(acute)).toBe(true);
  });

  test('둔각삼각형: false를 반환한다', () => {
    expect(isAcute(obtuse)).toBe(false);
  });

  test('정삼각형: true를 반환한다', () => {
    expect(isAcute(equilateral)).toBe(true);
  });

  test('3-4-5 직각삼각형: false를 반환한다', () => {
    // 직각은 < π/2가 아니므로 false
    expect(isAcute(right345)).toBe(false);
  });

  test('isObtuse와 isAcute는 동시에 true일 수 없다', () => {
    expect(isObtuse(acute) && isAcute(acute)).toBe(false);
    expect(isObtuse(obtuse) && isAcute(obtuse)).toBe(false);
  });

  test('tuple input도 처리한다', () => {
    const t = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 2, y: 4 },
    ] as const;
    expect(isAcute(t)).toBe(true);
  });
});
