/** 타원 변환 및 경계 상자 시험용 객체를 만든다. */
import type { EllipseWritable } from '../../../src/types';
import type { BoundsWritable } from '../../../src/types/flat-shapes.internal';

/** 전환 전 타원 생성 함수가 기록할 빈 객체를 만든다. */
export function makeEllipse(cx = 0, cy = 0, rx = 0, ry = 0): EllipseWritable {
  return { center: { x: cx, y: cy }, radiusX: rx, radiusY: ry };
}

/** 평평한 경계 상자 출력 객체를 만든다. */
export function makeBoundsOut(): BoundsWritable {
  return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
}
