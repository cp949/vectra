import { raySegmentHitTXY as raySegmentHitTKernel } from '../internal/ray-hit-t.internal';

/**
 * ray `(ox, oy) + t (dx, dy)`가 segment `(ax, ay)→(bx, by)`와 만나는 `t`를 반환한다.
 *
 * `raySegmentHitT`를 좌표 숫자로 받는 버전이다. 결과는 같은 입력의 `raySegmentHitT`와 같다.
 * 매 프레임 수천 번 부르는 hot path에서 ray·segment 객체를 만들거나 읽는 비용을 없앤다.
 * - hit이 없으면 `Infinity`다. 끝점 접촉은 hit이다. 평행·collinear는 `Infinity`다.
 * - `t`와 `tMin`은 direction 길이 단위다. direction을 정규화하지 않는다.
 * - non-finite 입력은 검증하지 않는다. 계산이 NaN이 되면 `Infinity`다.
 *
 * @param ox ray origin x
 * @param oy ray origin y
 * @param dx ray direction x
 * @param dy ray direction y
 * @param ax segment 시작점 x
 * @param ay segment 시작점 y
 * @param bx segment 끝점 x
 * @param by segment 끝점 y
 * @param tMin 허용하는 가장 작은 `t`. 생략하면 `0`이다.
 * @param epsilon 평행 판정 임계값. 생략하면 `sin θ <= 1e-9`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function raySegmentHitTXY(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  tMin = 0,
  epsilon?: number
): number {
  return raySegmentHitTKernel(ox, oy, dx, dy, ax, ay, bx, by, tMin, epsilon);
}
