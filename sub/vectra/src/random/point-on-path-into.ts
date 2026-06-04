import { length } from '../path/length';
import { pointAtLengthInto } from '../path/point-at-length-into';
import type { PathCommand, XYWritable } from '../types';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * path 위의 무작위 점을 길이 균등 분포(length-uniform)로 기록한다.
 *
 * 분포는 length-uniform이며 flatten 기본 정책(flatness=0.5)의 상한을 따른다.
 * 곡선이 심한 path에서는 perfect arc-length uniform과 약간 다를 수 있다.
 * `pointAtLengthInto`에 위임하여 결과를 기록한다. RNG는 distance 계산에 1회 소비한다.
 *
 * degenerate 처리: `totalLength <= 0` 또는 `!Number.isFinite(totalLength)`이면
 * false를 반환하고 out을 수정하지 않으며 RNG를 소비하지 않는다.
 * — empty commands, drawing segment가 없는 move-only path, totalLength===0 모두 이 분기에서 처리된다.
 * — NaN/Infinity in commands는 `path/length`에서 전파되어 false를 반환한다.
 *
 * RNG sequence는 same-version 한정 stable이며 알고리즘 변경 시 회귀가 아니다.
 *
 * caller 책임: commands에 NaN/Infinity가 있으면 false를 반환한다.
 * RNG가 [0, 1) 범위를 벗어나는 값을 반환하면 결과는 정의되지 않는다.
 *
 * @param out 결과를 기록할 writable 좌표 output
 * @param commands 대상 path command sequence. drawing segment가 없으면 false
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const pointOnPathInto = <Out extends XYWritable>(
  out: Out,
  commands: readonly PathCommand[],
  rng?: RandomSource
): boolean => {
  const totalLength = length(commands);

  if (!Number.isFinite(totalLength) || totalLength <= 0) {
    return false;
  }

  const distance = random(rng) * totalLength;
  return pointAtLengthInto(out, commands, distance);
};
