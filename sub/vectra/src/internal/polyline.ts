/**
 * polyline 계산용 internal facade.
 *
 * 이 모듈은 internal 전용으로, public domain barrel이나 export surface에 노출되지 않는다.
 * 기존 caller import 경로를 유지하기 위해 세부 구현 module을 다시 export한다.
 */

export { pointDist, segClampedT, segDistSq } from './polyline-distance-primitive.internal';
export {
  polylineSegmentTangentAtLengthInto,
  polylineTotalLength,
  polylineVertexTangentInto,
} from './polyline-length-tangent.internal';
export { readPolylinePoints } from './polyline-read.internal';
export { polylineSampleAtLengthInto } from './polyline-sampling.internal';
