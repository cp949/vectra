import type { OrientedRect, PointWritable } from '../types/flat-shapes.internal';
import { validateOrientedRectSizeAndAngle } from './oriented-rect';

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

/** 평평한 회전 사각형의 치수와 각도를 검증하고 local-space query frame을 만든다. */
export function createOrientedRectQueryFrame(rect: OrientedRect): OrientedRectQueryFrame {
  const { cx, cy, width, height, angle } = rect;
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
 * frame에서도 산술 결과 raw corner 4개를 그대로 기록한다.
 *
 * @param out corner point를 push할 writable array
 * @param frame corner를 생성할 query frame
 */
export function writeOrientedRectCorners(out: PointWritable[], frame: OrientedRectQueryFrame): void {
  const { cx, cy, hw, hh, cos, sin } = frame;
  out.length = 0;
  out.push(
    { x: cx - hw * cos + hh * sin, y: cy - hw * sin - hh * cos }, // topLeft (-hw, -hh)
    { x: cx + hw * cos + hh * sin, y: cy + hw * sin - hh * cos }, // topRight (hw, -hh)
    { x: cx + hw * cos - hh * sin, y: cy + hw * sin + hh * cos }, // bottomRight (hw, hh)
    { x: cx - hw * cos - hh * sin, y: cy - hw * sin + hh * cos } // bottomLeft (-hw, hh)
  );
}

/**
 * query frame의 4개 corner 좌표를 교차 배치 숫자 배열로 out에 기록한다.
 *
 * `out.length = 0` 후 `writeOrientedRectCorners`와 같은 순서와 식으로 x, y를 번갈아 push한다.
 * 점 객체를 만들지 않으므로 polygon 출력에 쓴다.
 *
 * @param out corner 좌표를 push할 숫자 배열
 * @param frame corner를 생성할 query frame
 */
export function writeOrientedRectCornerCoords(out: number[], frame: OrientedRectQueryFrame): void {
  const { cx, cy, hw, hh, cos, sin } = frame;
  out.length = 0;
  out.push(
    cx - hw * cos + hh * sin,
    cy - hw * sin - hh * cos, // topLeft (-hw, -hh)
    cx + hw * cos + hh * sin,
    cy + hw * sin - hh * cos, // topRight (hw, -hh)
    cx + hw * cos - hh * sin,
    cy + hw * sin + hh * cos, // bottomRight (hw, hh)
    cx - hw * cos - hh * sin,
    cy - hw * sin + hh * cos // bottomLeft (-hw, hh)
  );
}
