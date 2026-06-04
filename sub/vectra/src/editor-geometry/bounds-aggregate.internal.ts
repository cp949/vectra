import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, BoundsWritable } from '../types';

/**
 * bounds 배열의 union AABB를 계산해 out에 기록하고 true를 반환한다.
 *
 * 빈 배열이면 false를 반환하고 out을 수정하지 않는다.
 * NaN/Infinity 좌표는 IEEE-754 산술 결과 그대로 기록한다.
 * inverted bounds(min > max)는 caller가 정규화한다고 가정하고 그대로 사용한다.
 * inverted bounds와 정상 bounds가 혼합된 입력의 union 결과는 정의되지 않는다(caller 정규화 책임).
 * out이 items 배열 원소 중 하나인 경우(aliasing)도 안전하다 — 모든 읽기가 쓰기 전에 완료된다.
 *
 * @param out union bounds를 기록할 writable output
 * @param items union을 계산할 bounds 입력 배열
 */
export function aggregateBoundsInto<Out extends BoundsWritable>(out: Out, items: readonly BoundsLike[]): boolean {
  if (items.length === 0) {
    return false;
  }

  const first = items[0];
  let minX = readX(readBoundsMin(first));
  let minY = readY(readBoundsMin(first));
  let maxX = readX(readBoundsMax(first));
  let maxY = readY(readBoundsMax(first));

  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    const iMinX = readX(readBoundsMin(item));
    const iMinY = readY(readBoundsMin(item));
    const iMaxX = readX(readBoundsMax(item));
    const iMaxY = readY(readBoundsMax(item));

    if (iMinX < minX) minX = iMinX;
    if (iMinY < minY) minY = iMinY;
    if (iMaxX > maxX) maxX = iMaxX;
    if (iMaxY > maxY) maxY = iMaxY;
  }

  writeXY(out.min, minX, minY);
  writeXY(out.max, maxX, maxY);

  return true;
}
