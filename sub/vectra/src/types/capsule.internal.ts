import type { XYInput, XYObjectWritable, XYWritable } from './xy.internal';

/** tuple 형태의 structural capsule input. */
export type CapsuleTuple = readonly [a: XYInput, b: XYInput, radius: number];

/** 두 endpoint와 radius로 표현하는 structural capsule object input. */
export interface CapsuleObjectLike {
  /** capsule axis 시작점 */
  readonly a: XYInput;

  /** capsule axis 끝점 */
  readonly b: XYInput;

  /** capsule 반지름. finite non-negative number를 기본 계약으로 둔다. */
  readonly radius: number;
}

/** 두 endpoint와 radius로 표현하는 structural capsule input. */
export type CapsuleLike = CapsuleObjectLike | CapsuleTuple;

/** writable endpoint와 radius에 결과를 기록할 수 있는 structural capsule output. */
export interface CapsuleWritable<A extends XYWritable = XYObjectWritable, B extends XYWritable = XYObjectWritable> {
  /** 기록 가능한 capsule axis 시작점 */
  a: A;

  /** 기록 가능한 capsule axis 끝점 */
  b: B;

  /** 기록 가능한 capsule 반지름 */
  radius: number;
}
