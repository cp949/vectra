import type { LineFamilyParam } from './line-family-param.internal';

/**
 * segment endpoint a/b 좌표를 LineFamilyParam으로 정규화한다.
 *
 * origin은 a, direction은 (b - a)로 계산한다. degenerate 체크는 하지 않는다.
 */
export function segmentToLineFamilyParam(ax: number, ay: number, bx: number, by: number): LineFamilyParam {
  return { ox: ax, oy: ay, dx: bx - ax, dy: by - ay, kind: 'finite' };
}

/**
 * ray origin/direction 좌표를 LineFamilyParam으로 정규화한다.
 *
 * degenerate 체크는 하지 않는다.
 */
export function rayToLineFamilyParam(ox: number, oy: number, dx: number, dy: number): LineFamilyParam {
  return { ox, oy, dx, dy, kind: 'ray' };
}

/**
 * infinite-line origin/direction 좌표를 LineFamilyParam으로 정규화한다.
 *
 * degenerate 체크는 하지 않는다.
 */
export function infiniteLineToLineFamilyParam(ox: number, oy: number, dx: number, dy: number): LineFamilyParam {
  return { ox, oy, dx, dy, kind: 'inf' };
}
