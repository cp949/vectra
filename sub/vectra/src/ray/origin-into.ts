import { readRayOrigin } from '../internal/ray';
import { readX, readY, writeXY } from '../internal/xy';
import type { RayLike, XYWritable } from '../types';

/** ray의 origin point를 `out`에 기록하고 `out`을 반환한다. */
export function originInto<Out extends XYWritable>(out: Out, ray: RayLike): Out {
  const o = readRayOrigin(ray);
  return writeXY(out, readX(o), readY(o));
}
