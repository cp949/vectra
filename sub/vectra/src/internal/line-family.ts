/**
 * line-family (segment, ray, infinite-line) cross-domain relation 계산용 internal facade.
 *
 * 이 모듈은 internal 전용으로, public domain barrel이나 export surface에 노출되지 않는다.
 * 기존 caller import 경로를 유지하기 위해 세부 구현 module을 다시 export한다.
 */
export { lineFamilyIntersectionPoint, lineFamilyIntersects } from './line-family-core.internal';
/**
 * parametric range 종류.
 *
 * - `finite`: t ∈ [0, 1] — segment
 * - `ray`:    t ∈ [0, +Infinity) — ray
 * - `inf`:    t ∈ (-Infinity, +Infinity) — infinite-line
 */
export type { LineFamilyParam, LineFamilyRangeKind } from './line-family-param.internal';
export {
  infiniteLineToLineFamilyParam,
  rayToLineFamilyParam,
  segmentToLineFamilyParam,
} from './line-family-param-builders.internal';
export {
  lineFamilyBoxIntersectionPoint,
  lineFamilyBoxIntersects,
  lineFamilyCircleIntersectionPoint,
  lineFamilyCircleIntersects,
  lineFamilyTriangleIntersectionPoint,
  lineFamilyTriangleIntersects,
} from './line-family-shape.internal';
export { findSingleLineFamilySideIntersectionPoint } from './line-family-side.internal';
