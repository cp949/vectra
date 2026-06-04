import { readRayDirection } from '../internal/ray';
import { readX, readY, writeXY } from '../internal/xy';
import type { RayLike, XYWritable } from '../types';

/** ray의 direction vector를 `out`에 기록하고 `out`을 반환한다. */
export function directionInto<Out extends XYWritable>(out: Out, ray: RayLike): Out {
  const d = readRayDirection(ray);
  return writeXY(out, readX(d), readY(d));
}
