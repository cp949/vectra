/**
 * flat coordinate adapter 함수 barrel.
 *
 * XYInput 배열 ↔ flat number[]/Float32Array 변환 함수를 re-export한다.
 * zero-allocation buffer reuse와 렌더러 파이프라인 연동을 위한 함수군이다.
 */

export { decodeFlatCoords } from './decode-flat-coords';
export { decodeFlatCoordsInto } from './decode-flat-coords-into';
export { fromFloat32Array } from './from-float32-array';
export { fromFloat32ArrayInto } from './from-float32-array-into';
export { toFlatCoords } from './to-flat-coords';
export { toFlatCoordsInto } from './to-flat-coords-into';
export { toFloat32Array } from './to-float32-array';
export { toFloat32ArrayInto } from './to-float32-array-into';
export { transformFlatCoords } from './transform-flat-coords';
export { transformFlatCoordsInto } from './transform-flat-coords-into';
