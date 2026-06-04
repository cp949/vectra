/**
 * constrainDrawingBoundsInto — drag origin과 pointer에서 drawing bounds를 산출해 out에 기록한다.
 */

import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsWritable, XYInput, XYWritable } from '../types';
import type { DrawingBoundsOptions } from './types';

/**
 * drag 시작점 origin과 현재 pointer에서 drawing bounds를 산출해 out에 기록하고 out을 반환한다.
 *
 * 결과는 항상 normalized bounds(`min.x <= max.x`, `min.y <= max.y`)다.
 * `fromCenter` 기본값 false: origin은 corner, pointer는 opposite corner.
 * `fromCenter` true: origin은 center, pointer는 half-extent 방향을 정한다.
 * `aspectLocked` 기본값 false: true면 size를 `max(abs(dx), abs(dy))`로 맞춰 square로 보정하고
 * pointer 방향 sign을 유지한다. `Math.sign(0) === 0`이므로 해당 축 delta가 0이면 그 축은 origin으로 collapse한다.
 * `shape`는 call-site 의미 태그일 뿐 산식에 영향을 주지 않는다.
 * NaN/Infinity 입력은 silent propagation. throw 없음.
 * out.min / out.max가 origin / pointer와 같은 object여도 안전하다. 입력 x/y를 모두 읽은 뒤 기록한다.
 *
 * @param out bounds를 기록할 writable output
 * @param origin drag 시작 좌표. fromCenter=false면 corner, true면 center
 * @param pointer 현재 pointer 좌표. opposite corner 또는 half-extent 방향
 * @param options shape, aspectLocked, fromCenter 옵션
 */
export function constrainDrawingBoundsInto<Out extends BoundsWritable<XYWritable, XYWritable>>(
  out: Out,
  origin: XYInput,
  pointer: XYInput,
  options?: DrawingBoundsOptions
): Out {
  const ox = readX(origin);
  const oy = readY(origin);
  const px = readX(pointer);
  const py = readY(pointer);

  const dx = px - ox;
  const dy = py - oy;

  const aspectLocked = options?.aspectLocked === true;
  const fromCenter = options?.fromCenter === true;

  let minX: number;
  let minY: number;
  let maxX: number;
  let maxY: number;

  if (fromCenter) {
    // origin을 center로 보고 half-extent로 대칭 bounds를 만든다.
    // aspectLocked면 양 축 half를 max(abs(dx), abs(dy))로 통일한다.
    const halfX = aspectLocked ? Math.max(Math.abs(dx), Math.abs(dy)) : Math.abs(dx);
    const halfY = aspectLocked ? halfX : Math.abs(dy);
    minX = ox - halfX;
    maxX = ox + halfX;
    minY = oy - halfY;
    maxY = oy + halfY;
  } else {
    // origin을 corner로 보고 opposite corner를 정한다.
    // aspectLocked면 max(abs(dx), abs(dy)) 크기를 pointer 방향 sign으로 적용한다.
    let oppX = px;
    let oppY = py;
    if (aspectLocked) {
      const s = Math.max(Math.abs(dx), Math.abs(dy));
      oppX = ox + Math.sign(dx) * s;
      oppY = oy + Math.sign(dy) * s;
    }
    minX = Math.min(ox, oppX);
    maxX = Math.max(ox, oppX);
    minY = Math.min(oy, oppY);
    maxY = Math.max(oy, oppY);
  }

  writeXY(out.min, minX, minY);
  writeXY(out.max, maxX, maxY);
  return out;
}
