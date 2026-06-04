import type { PathCommand } from '../types';
import { pointOnPathInto } from './point-on-path-into';
import type { RandomSource } from './random';

/**
 * path 위의 무작위 점을 길이 균등 분포(length-uniform)로 새 object로 반환한다.
 *
 * 분포는 length-uniform이며 flatten 기본 정책(flatness=0.5)의 상한을 따른다.
 * 곡선이 심한 path에서는 perfect arc-length uniform과 약간 다를 수 있다.
 * `pointOnPathInto`에 위임하며, 내부적으로 `pointAtLengthInto`에 위임하여 결과를 계산한다.
 * RNG는 distance 계산에 1회 소비한다.
 *
 * degenerate 처리: `totalLength <= 0` 또는 `!Number.isFinite(totalLength)`이면
 * undefined를 반환하고 RNG를 소비하지 않는다.
 * — empty commands, drawing segment가 없는 move-only path, totalLength===0 모두 이 분기에서 처리된다.
 * — NaN/Infinity in commands는 `path/length`에서 전파되어 undefined를 반환한다.
 *
 * caller 책임: commands에 NaN/Infinity가 있으면 undefined를 반환한다.
 * RNG가 [0, 1) 범위를 벗어나는 값을 반환하면 결과는 정의되지 않는다.
 *
 * @param commands 대상 path command sequence. drawing segment가 없으면 undefined
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export function pointOnPath(
  commands: readonly PathCommand[],
  rng?: RandomSource
): { x: number; y: number } | undefined {
  const out = { x: 0, y: 0 };
  return pointOnPathInto(out, commands, rng) ? out : undefined;
}
