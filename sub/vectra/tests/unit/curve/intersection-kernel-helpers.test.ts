/**
 * curve 교차 kernel의 공유 helper를 합성 evaluator로 직접 검증하는 테스트.
 *
 * 검증 항목:
 *  1. pushHitIfNewAB가 같은 교점의 kind를 touch 우선으로 합친다.
 *  2. refineIntersectionParams가 Newton step을 버리는 조건(범위 밖, 이동량 초과).
 *  3. resolveIntersectionParams가 끝점 투영 실패 뒤 box 중점으로 되돌아간다.
 *  4. classifyIntersectionKind가 tangent가 영벡터에 가까우면 cross로 본다.
 *
 * 설계 메모:
 *  - 공개 함수로는 만들기 어려운 경계(수렴 box가 끝점에 걸친 채 상대 curve가 평행)를 직선 evaluator로 만든다.
 */
import { describe, expect, test } from 'vitest';
import {
  type CurveEvaluator,
  classifyIntersectionKind,
  pushHitIfNewAB,
  refineIntersectionParams,
  resolveIntersectionParams,
} from '../../../src/curve/curve-intersections.internal';
import type { IntersectionHit } from '../../../src/types';

/** 점 (x, y)를 만드는 writable point factory. */
const makePoint = () => ({ x: 0, y: 0 });

/**
 * 수평선 A(t) = (t, 0)을 돌려주는 evaluator. tangent는 (1, 0)이다.
 */
const horizontal: CurveEvaluator = (t, out) => {
  out[0] = t;
  out[1] = 0;
  out[2] = 1;
  out[3] = 0;
};

/**
 * 수직선 B(u) = (x, u)를 돌려주는 evaluator를 만든다. tangent는 (0, 1)이다.
 * A와 (x, 0)에서 수직으로 만난다.
 */
function verticalAt(x: number): CurveEvaluator {
  return (u, out) => {
    out[0] = x;
    out[1] = u;
    out[2] = 0;
    out[3] = 1;
  };
}

describe('pushHitIfNewAB의 kind 병합', () => {
  /** (0.5, 0.5)에서 교점을 두 번 기록하고 결과를 돌려준다. */
  function pushTwice(first: 'cross' | 'touch', second: 'cross' | 'touch'): IntersectionHit[] {
    const hits: IntersectionHit[] = [];
    pushHitIfNewAB(hits, 1, 1, first, 0.5, 0.5, 1e-9, makePoint);
    pushHitIfNewAB(hits, 1, 1, second, 0.5, 0.5, 1e-9, makePoint);
    return hits;
  }

  test('cross 뒤에 같은 교점이 touch로 오면 touch로 승격한다', () => {
    const hits = pushTwice('cross', 'touch');
    expect(hits).toHaveLength(1);
    expect(hits[0].kind).toBe('touch');
  });

  test('touch 뒤에 같은 교점이 cross로 오면 touch를 유지한다', () => {
    expect(pushTwice('touch', 'cross')[0].kind).toBe('touch');
  });

  test('cross 뒤에 같은 교점이 cross로 오면 cross를 유지한다', () => {
    expect(pushTwice('cross', 'cross')[0].kind).toBe('cross');
  });
});

describe('refineIntersectionParams의 step 거부', () => {
  test('교점이 [0, 1] 안이고 가까우면 한 번에 교점으로 수렴한다', () => {
    expect(refineIntersectionParams(horizontal, verticalAt(0.5), 0.9, 0.1, 1)).toEqual([0.5, 0]);
  });

  test('교점이 [0, 1] 밖이면 입력 parameter를 그대로 돌려준다', () => {
    expect(refineIntersectionParams(horizontal, verticalAt(2), 0.9, 0.1, 1)).toEqual([0.9, 0.1]);
  });

  test('시작점에서 허용 이동량보다 멀면 입력 parameter를 그대로 돌려준다', () => {
    expect(refineIntersectionParams(horizontal, verticalAt(0.5), 0.9, 0.1, 1e-6)).toEqual([0.9, 0.1]);
  });

  test('tA만 허용 이동량보다 멀게 움직이면 입력 parameter를 그대로 돌려준다', () => {
    // 교점 (0.5, 0)까지 tA는 0.4 움직이고 tB는 움직이지 않는다.
    expect(refineIntersectionParams(horizontal, verticalAt(0.5), 0.9, 0, 1e-6)).toEqual([0.9, 0]);
  });

  test('tB만 허용 이동량보다 멀게 움직이면 입력 parameter를 그대로 돌려준다', () => {
    // 교점 (0.5, 0)까지 tB는 0.4 움직이고 tA는 움직이지 않는다.
    expect(refineIntersectionParams(horizontal, verticalAt(0.5), 0.5, 0.4, 1e-6)).toEqual([0.5, 0.4]);
  });
});

describe('resolveIntersectionParams의 끝점 투영 실패', () => {
  test('끝점을 투영한 parameter가 [0, 1] 밖이면 box 중점을 돌려준다', () => {
    // A의 시작점 (2, 0)을 B(u) = (u, 0)에 투영하면 u = 2라 범위를 벗어난다. 두 curve는 평행해 Newton도 건너뛴다.
    const evalA: CurveEvaluator = (t, out) => {
      out[0] = 2 + t;
      out[1] = 0;
      out[2] = 1;
      out[3] = 0;
    };
    expect(resolveIntersectionParams(evalA, horizontal, 0, 1e-3, 0.4, 0.401, 1e-9)).toEqual([0.0005, 0.4005]);
  });

  test('상대 curve의 속도가 0이면 투영하지 않고 box 중점을 돌려준다', () => {
    const evalA: CurveEvaluator = (t, out) => {
      out[0] = 5 + t;
      out[1] = 5;
      out[2] = 1;
      out[3] = 0;
    };
    const stationary: CurveEvaluator = (_u, out) => {
      out[0] = 5;
      out[1] = 5;
      out[2] = 0;
      out[3] = 0;
    };
    expect(resolveIntersectionParams(evalA, stationary, 0, 1e-3, 0.4, 0.401, 1e-9)).toEqual([0.0005, 0.4005]);
  });
});

describe('classifyIntersectionKind의 영벡터 tangent', () => {
  test('A의 tangent 길이만 epsilon 미만이면 평행이어도 cross로 본다', () => {
    expect(classifyIntersectionKind(1e-12, 0, 2, 0, 1e-9)).toBe('cross');
  });

  test('두 tangent 길이가 모두 epsilon 미만이어도 cross로 본다', () => {
    expect(classifyIntersectionKind(1e-12, 0, 2e-12, 0, 1e-9)).toBe('cross');
  });

  test('B의 tangent 길이만 epsilon 미만이어도 cross로 본다', () => {
    expect(classifyIntersectionKind(1, 0, 2e-12, 0, 1e-9)).toBe('cross');
  });

  test('tangent가 충분히 길고 평행하면 touch로 본다', () => {
    expect(classifyIntersectionKind(1, 0, 2, 0, 1e-9)).toBe('touch');
  });
});
