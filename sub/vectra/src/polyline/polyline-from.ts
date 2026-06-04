import { readPolylinePoints } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import type { PolylineLike, PolylineWritable, XYInput } from '../types';
import type { CreatePointListOptions } from './create-polyline';

/**
 * `PolylineLike` source의 point를 새 plain object로 복사해 반환한다.
 *
 * 기본값(`options.clonePoints !== false`)은 새 배열과 새 plain `{ x, y }` point들을 만든다.
 * `{ clonePoints: false }`를 넘기면 해석된 원본 point array 참조를 유지한다.
 *
 * @param polyline 복사할 source polyline 또는 point 배열
 * @param options point cloning 옵션
 */
export function polylineFrom(
  points: readonly XYInput[],
  options: { readonly clonePoints: false }
): PolylineWritable<XYInput>;
export function polylineFrom(
  polyline: PolylineLike,
  options: { readonly clonePoints: false }
): PolylineWritable<XYInput>;
export function polylineFrom(points: readonly XYInput[], options?: CreatePointListOptions): PolylineWritable;
export function polylineFrom(polyline: PolylineLike, options?: CreatePointListOptions): PolylineWritable;
export function polylineFrom(polyline: PolylineLike, options: CreatePointListOptions = {}): PolylineWritable<XYInput> {
  const points = readPolylinePoints(polyline);
  if (options.clonePoints === false) return { points: points as XYInput[] };
  return { points: points.map((point) => ({ x: readX(point), y: readY(point) })) };
}
