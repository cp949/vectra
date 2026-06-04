import type { HexAxialLike, HexAxialWritable, HexCubeLike } from '../types';
import { hexLineDrawInto } from './hex-line-draw-into';

/**
 * start에서 end까지 hex line을 그려 inclusive cell 목록을 새 `{ q, r }[]` 배열로 반환한다.
 *
 * start/end는 axial 또는 cube shape을 자유롭게 섞는다. cube input은 `q + r + s === 0` invariant를
 * 검증한다. `n = hexDistance(start, end)`이면 결과 길이는 `n + 1`이고 order는 start → end다. same
 * coordinate(`n === 0`)는 start 한 개를 반환한다. 각 cell은 cube linear interpolation
 * `i / n` parameter 후 nearest hex rounding으로 구한다. rounding tie는 cube round correction(`Math.round`
 * 절반 올림 후 최대 delta 성분 재계산)으로 deterministic하게 깨진다. 같은 입력은 항상 같은 결과지만,
 * 동일 거리 tie에서 선택 cell이 진행 방향에 따라 갈려 start→end와 end→start 결과는 서로 대칭이 아니다
 * (no-nudge 정책).
 *
 * coordinate 성분이 safe integer가 아니거나(`NaN`, `Infinity`, non-integer, unsafe integer) cube
 * invariant를 위반하면 `RangeError`다. 계산된 distance나 어느 cell q/r이 safe integer 범위를 벗어나거나
 * 결과 길이(`n + 1`)가 safe array length(`0xffffffff`)를 넘으면 `RangeError`다. 결과 `-0`은 `0`으로
 * canonicalize한다.
 *
 * @param start line 시작 coordinate. axial 또는 cube
 * @param end line 끝 coordinate. axial 또는 cube
 */
export function hexLineDraw(start: HexAxialLike | HexCubeLike, end: HexAxialLike | HexCubeLike): HexAxialWritable[] {
  return hexLineDrawInto([], start, end);
}
