import type { BoundsLike, MatrixWritable } from '../types';
import { type FitBoundsOptions, fitBoundsInto } from './fit-bounds-into';

/**
 * srcBounds를 destBounds에 fit하는 transform matrix를 새 object로 반환한다.
 *
 * src 또는 dest가 empty(`min >= max`)이면 identity matrix를 반환한다.
 * mode가 유효하지 않으면 `RangeError`를 던진다. scalar component가 finite하지 않으면 `RangeError`를 던진다.
 *
 * @param srcBounds 변환할 source bounds
 * @param destBounds 목적지 bounds
 * @param options fit 옵션
 */
export function fitBounds(srcBounds: BoundsLike, destBounds: BoundsLike, options?: FitBoundsOptions): MatrixWritable {
  return fitBoundsInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, srcBounds, destBounds, options);
}
