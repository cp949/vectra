import { lerpTupleInto } from './lerp-tuple-into';

/**
 * number tuple/array a와 b를 원소별로 선형 보간하여 새 tuple/array로 반환한다.
 *
 * readonly tuple input(`as const` 또는 `const T` infer)을 넘기면 같은 길이의
 * mutable tuple result type을 돌려주므로 TypeScript tuple 길이 정보가 보존된다.
 *
 * @param a 보간 시작 tuple/array (t=0일 때의 값).
 * @param b 보간 끝 tuple/array (t=1일 때의 값). a와 길이가 같아야 한다.
 * @param t 보간 비율. clamp하지 않으므로 범위 밖 값도 허용한다 (extrapolation 가능).
 *
 * degenerate 처리:
 * - 빈 tuple/array(a=[], b=[])은 정상 처리하여 빈 배열을 반환한다.
 * - a.length !== b.length이면 RangeError를 던진다.
 * - t, a 원소, b 원소 중 finite하지 않은 값이 있으면 RangeError를 던진다.
 *
 * aliasing:
 * - 호출마다 새 배열을 할당해 반환하므로 a, b와 aliasing이 발생하지 않는다.
 *
 * 타입 정책:
 * - b 길이는 type-level에서 강제하지 않는다. 런타임 same-length validation이 canonical이다.
 */
export function lerpTuple<const T extends readonly number[]>(
  a: T,
  b: readonly number[],
  t: number
): { -readonly [K in keyof T]: number } {
  const out: number[] = [];
  lerpTupleInto(out, a, b, t);
  return out as unknown as { -readonly [K in keyof T]: number };
}
