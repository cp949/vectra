import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, BoundsWritable } from '../types';

/**
 * a와 b의 union bounds를 out에 기록한다.
 *
 * 한쪽이 empty이면 다른 쪽을 복사하고, 둘 다 empty이면 a를 복사한다. 비-empty 입력끼리는 raw
 * min/max 자연식으로 합친다. input과 out이 같은 object여도 안전하다.
 *
 * @param out union bounds를 기록할 writable output
 * @param a 합칠 첫 번째 bounds
 * @param b 합칠 두 번째 bounds
 */
export function unionInto<Out extends BoundsWritable>(out: Out, a: BoundsLike, b: BoundsLike): Out {
  const aMinX = readX(readBoundsMin(a));
  const aMinY = readY(readBoundsMin(a));
  const aMaxX = readX(readBoundsMax(a));
  const aMaxY = readY(readBoundsMax(a));
  const aEmpty = aMaxX < aMinX || aMaxY < aMinY;

  const bMinX = readX(readBoundsMin(b));
  const bMinY = readY(readBoundsMin(b));
  const bMaxX = readX(readBoundsMax(b));
  const bMaxY = readY(readBoundsMax(b));
  const bEmpty = bMaxX < bMinX || bMaxY < bMinY;

  if (aEmpty && bEmpty) {
    // 둘 다 empty → a를 복사 (sentinel 유지)
    writeXY(out.min, aMinX, aMinY);
    writeXY(out.max, aMaxX, aMaxY);
  } else if (aEmpty) {
    // a만 empty → b를 복사
    writeXY(out.min, bMinX, bMinY);
    writeXY(out.max, bMaxX, bMaxY);
  } else if (bEmpty) {
    // b만 empty → a를 복사
    writeXY(out.min, aMinX, aMinY);
    writeXY(out.max, aMaxX, aMaxY);
  } else {
    // aliasing 안전 - 결과를 먼저 local에 계산한 뒤 기록한다
    const newMinX = aMinX < bMinX ? aMinX : bMinX;
    const newMinY = aMinY < bMinY ? aMinY : bMinY;
    const newMaxX = aMaxX > bMaxX ? aMaxX : bMaxX;
    const newMaxY = aMaxY > bMaxY ? aMaxY : bMaxY;
    writeXY(out.min, newMinX, newMinY);
    writeXY(out.max, newMaxX, newMaxY);
  }
  return out;
}
