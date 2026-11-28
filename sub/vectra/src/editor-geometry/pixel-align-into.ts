import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * point를 device pixel에 맞게 정렬하여 out에 기록하고 out을 반환한다.
 *
 * `out === point` aliasing은 안전하다. point의 x/y를 모두 읽은 뒤 기록하므로
 * 중간 상태 오염이 발생하지 않는다.
 *
 * devicePixelRatio가 양의 유한수가 아니면(0, 음수, NaN, Infinity) NaN을 기록한다. 음수 dpr의 silent
 * 부호 반전을 막기 위함이다. throw하지 않는다 (editor hot path 정책).
 *
 * @param out 결과 좌표를 기록할 출력 { x, y }
 * @param point 정렬할 입력 좌표
 * @param options.devicePixelRatio 장치 픽셀 비율 (옵션을 생략하면 1, 양의 유한수만 유효)
 */
export function pixelAlignInto<Out extends PointWritable>(
  out: Out,
  point: Point,
  options?: { devicePixelRatio: number }
): Out {
  const dpr = options === undefined ? 1 : options.devicePixelRatio;
  if (!(dpr > 0)) {
    out.x = Number.NaN;
    out.y = Number.NaN;
    return out;
  }
  const x = Math.round(point.x * dpr) / dpr;
  const y = Math.round(point.y * dpr) / dpr;
  out.x = x;
  out.y = y;
  return out;
}
