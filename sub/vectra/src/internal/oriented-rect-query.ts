import type { OrientedRectLike, XYObjectWritable } from '../types';
import {
  readOrientedRectAngle,
  readOrientedRectCenter,
  readOrientedRectSize,
  validateOrientedRectSizeAndAngle,
} from './oriented-rect';
import { readX, readY } from './xy';

/**
 * oriented-rect local-space query에 필요한 값을 미리 계산한 frame.
 *
 * `containsPoint`, `closestPointInto`, corner 생성이 같은 local axis convention과 empty 판정을
 * 공유하도록 이 frame을 거친다. axis convention은 `xAxis=(cos, sin)`, `yAxis=(-sin, cos)`다.
 */
export interface OrientedRectQueryFrame {
  /** center x */
  cx: number;

  /** center y */
  cy: number;

  /** size width. `width <= 0`이면 empty 판정에 쓰인다. */
  width: number;

  /** size height. `height <= 0`이면 empty 판정에 쓰인다. */
  height: number;

  /** half width `width / 2`. local x extent. */
  hw: number;

  /** half height `height / 2`. local y extent. */
  hh: number;

  /** `Math.cos(angle)` */
  cos: number;

  /** `Math.sin(angle)` */
  sin: number;
}

/**
 * oriented rect input을 읽어 local-space query frame을 만든다.
 *
 * center/size/angle을 모두 먼저 읽으므로 caller가 frame을 받은 뒤 같은 input을 mutate해도 frame
 * 값은 영향을 받지 않는다 (aliasing 안전 기반). size 두 성분이나 angle이 non-finite이면
 * `RangeError`다. `width <= 0 || height <= 0` empty 판정은 caller가 `width`/`height`로 한다.
 * center 좌표 non-finite는 검증하지 않고 frame에 그대로 담는다.
 *
 * @param rect query frame을 만들 oriented rect
 */
export function readOrientedRectQueryFrame(rect: OrientedRectLike): OrientedRectQueryFrame {
  const center = readOrientedRectCenter(rect);
  const cx = readX(center);
  const cy = readY(center);
  const size = readOrientedRectSize(rect);
  const width = readX(size);
  const height = readY(size);
  const angle = readOrientedRectAngle(rect);
  validateOrientedRectSizeAndAngle(width, height, angle);

  return {
    cx,
    cy,
    width,
    height,
    hw: width / 2,
    hh: height / 2,
    cos: Math.cos(angle),
    sin: Math.sin(angle),
  };
}

/**
 * query frame의 4개 corner point를 새 `{ x, y }` object로 out 배열에 기록한다.
 *
 * `out.length = 0` 후 local `topLeft`, `topRight`, `bottomRight`, `bottomLeft` 순서로 push한다.
 * local corner는 center 기준 `(-hw, -hh)`, `(hw, -hh)`, `(hw, hh)`, `(-hw, hh)`이며
 * `world = (cx + lx*cos - ly*sin, cy + lx*sin + ly*cos)`로 회전·평행이동한다. empty/negative size
 * frame에서도 산술 결과 raw corner 4개를 그대로 기록한다. corner 생성을 `cornersInto`와 `toPolygon`이
 * 공유하도록 이 helper에 둔다.
 *
 * @param out corner point를 push할 writable array
 * @param frame corner를 생성할 query frame
 */
export function writeOrientedRectCorners(out: XYObjectWritable[], frame: OrientedRectQueryFrame): void {
  const { cx, cy, hw, hh, cos, sin } = frame;
  out.length = 0;
  out.push(
    { x: cx - hw * cos + hh * sin, y: cy - hw * sin - hh * cos }, // topLeft (-hw, -hh)
    { x: cx + hw * cos + hh * sin, y: cy + hw * sin - hh * cos }, // topRight (hw, -hh)
    { x: cx + hw * cos - hh * sin, y: cy + hw * sin + hh * cos }, // bottomRight (hw, hh)
    { x: cx - hw * cos - hh * sin, y: cy - hw * sin + hh * cos } // bottomLeft (-hw, hh)
  );
}
