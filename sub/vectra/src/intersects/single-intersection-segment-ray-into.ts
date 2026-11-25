import { readRayDirection, readRayOrigin } from '../internal/ray';
import { segmentRayPointInto } from '../internal/segment-ray-point.internal';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { isRayObject, isSegmentObject, isXYObject } from '../internal/xy-object.internal';
import { readX, readY } from '../internal/xy';
import type { RayLike, SegmentLike, XYWritable } from '../types';

/**
 * segment와 ray의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 없거나 collinear/parallel이면 false를 반환하고 out을 수정하지 않는다.
 * zero-length segment는 점으로 환원한다. 그 점이 ray 위에 있으면 그 점을 기록하고 true, 아니면 false.
 *
 * @param out 교점 좌표를 기록할 writable output
 * @param line 교점을 구할 segment
 * @param ray 교점을 구할 ray
 * @param epsilon cross product 절대값 및 거리 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function singleIntersectionSegmentRayInto(
  out: XYWritable,
  line: SegmentLike,
  ray: RayLike,
  epsilon?: number
): boolean {
  // 모두 object 입력이면 좌표를 이 함수에서 직접 읽는다
  if (isSegmentObject(line) && isRayObject(ray)) {
    const a = line.a;
    const b = line.b;
    const origin = ray.origin;
    const dir = ray.direction;
    if (isXYObject(a) && isXYObject(b) && isXYObject(origin) && isXYObject(dir)) {
      return segmentRayPointInto(out, a.x, a.y, b.x, b.y, origin.x, origin.y, dir.x, dir.y, epsilon);
    }
  }

  return singleIntersectionSegmentRayIntoShared(out, line, ray, epsilon);
}

/** tuple 입력이 있을 때 공유 reader로 읽는 경로. */
function singleIntersectionSegmentRayIntoShared(
  out: XYWritable,
  line: SegmentLike,
  ray: RayLike,
  epsilon: number | undefined
): boolean {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const origin = readRayOrigin(ray);
  const dir = readRayDirection(ray);

  return segmentRayPointInto(
    out,
    readX(a),
    readY(a),
    readX(b),
    readY(b),
    readX(origin),
    readY(origin),
    readX(dir),
    readY(dir),
    epsilon
  );
}
