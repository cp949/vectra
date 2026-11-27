import type { Point, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * origin에서 vec 방향으로 이동한 endpoint를 out에 기록하고 out을 반환한다.
 *
 * a = origin, b = origin + vec.
 * vec = (0, 0)이면 zero-length segment를 기록한다.
 * NaN/Infinity 입력은 별도 검증 없이 JavaScript 산술 결과를 따른다.
 * 시작점과 방향 벡터의 좌표를 모두 읽은 뒤 결과를 기록한다.
 *
 * @param out 결과를 기록할 선분 객체
 * @param origin 시작점
 * @param vec 방향 벡터. 끝점에 origin + vec를 기록한다
 */
export function fromPointVectorInto<Out extends SegmentWritable>(out: Out, origin: Point, vec: Point): Out {
  const ox = origin.x;
  const oy = origin.y;
  const vx = vec.x;
  const vy = vec.y;
  out.x1 = ox;
  out.y1 = oy;
  out.x2 = ox + vx;
  out.y2 = oy + vy;
  return out;
}
