import { readPolygonPoints } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import type { PolygonLike, PolygonWritable, XYInput } from '../types';
import type { CreatePointListOptions } from './create-polygon';

/**
 * `PolygonLike` source의 point를 새 plain object로 복사해 반환한다.
 *
 * 기본값(`options.clonePoints !== false`)은 새 배열과 새 plain `{ x, y }` point들을 만든다.
 * `{ clonePoints: false }`를 넘기면 해석된 원본 point array 참조를 유지한다.
 *
 * @param polygon 복사할 source polygon 또는 point 배열
 * @param options point cloning 옵션
 */
export function polygonFrom(
  points: readonly XYInput[],
  options: { readonly clonePoints: false }
): PolygonWritable<XYInput>;
export function polygonFrom(polygon: PolygonLike, options: { readonly clonePoints: false }): PolygonWritable<XYInput>;
export function polygonFrom(points: readonly XYInput[], options?: CreatePointListOptions): PolygonWritable;
export function polygonFrom(polygon: PolygonLike, options?: CreatePointListOptions): PolygonWritable;
export function polygonFrom(polygon: PolygonLike, options: CreatePointListOptions = {}): PolygonWritable<XYInput> {
  const points = readPolygonPoints(polygon);
  if (options.clonePoints === false) return { points: points as XYInput[] };
  return { points: points.map((point) => ({ x: readX(point), y: readY(point) })) };
}
