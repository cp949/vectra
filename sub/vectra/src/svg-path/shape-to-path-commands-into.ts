/**
 * structural SVG shape attribute object → canonical absolute PathCommand[] bridge.
 *
 * domain barrel(./index)을 import하지 않는다.
 */

import { readX, readY } from '../internal/xy';
import { ellipseArcInto, KAPPA } from '../path/path-ellipse-arc.internal';
import type {
  PathCommand,
  SvgCircleShapeLike,
  SvgEllipseShapeLike,
  SvgLineShapeLike,
  SvgPolygonShapeLike,
  SvgPolylineShapeLike,
  SvgRectShapeLike,
  SvgShapeLike,
  XYInput,
} from '../types/index';

/**
 * structural SVG shape attribute object를 canonical absolute `PathCommand[]`로 기록하고 out을 반환한다.
 *
 * `out.length = 0` 후 push 방식으로 채운다. caller가 `out`에 누적해 둔 기존 element는
 * 호출 시점에 제거된다. discriminated union `SvgShapeLike`만 받으며 DOM element,
 * `<path d="">` data string, `<text>`, `<image>`, `<use>`, `<symbol>`, `<marker>`,
 * transform/style attribute는 받지 않는다.
 *
 * 각 shape별 동작:
 *
 * - `line`: `move(x1, y1) + line(x2, y2)` 2 command.
 * - `rect` (sharp): `rx`/`ry`가 둘 다 없거나 한 쪽이라도 `<= 0`이면 sharp.
 *   `move + line × 3 + close` 5 command. 음수 width/height는 validation 없이 그대로 사용한다.
 * - `rect` (rounded): `rx`/`ry` 중 하나만 주면 다른 한쪽도 같은 값으로 본다 (SVG spec).
 *   `rx <= width / 2`, `ry <= height / 2`로 clamp한다. `move + (line + cubic) × 4 + close`
 *   10 command. corner cubic handle은 `rx * KAPPA`, `ry * KAPPA`로 비대칭 가능.
 * - `circle`: `move(cx + r, cy) + cubic × 4 + close` 6 command. clockwise (SVG y-down).
 * - `ellipse`: `move(cx + rx, cy) + cubic × 4 + close` 6 command. clockwise.
 * - `polyline`: 점 0개 → 빈 out. 점 1개 → `move`만. 점 N개 → `move + line × (N - 1)`.
 * - `polygon`: 점 0개 → 빈 out. 점 1개 이상 → `move + line × (N - 1) + close`.
 *
 * invalid numeric(NaN, Infinity, ±0 degenerate)은 throw 없이 그대로 전파한다.
 *
 * 예외 정책 (rect):
 *
 * - `rect.rx`/`rect.ry`가 NaN 또는 음수이면 `> 0` 비교가 false라 sharp rect로 fallback된다.
 *   sharp는 rx/ry를 사용하지 않으므로 NaN/음수 rx/ry는 cubic 좌표에 전파되지 않는다.
 *   `path/rounded-rect-commands-into.ts`의 음수 → 0 clamp 정책과 다르다 (svg-path bridge는
 *   SVG attribute pass-through 우선).
 * - 음수 `width`/`height`는 validation 없이 그대로 사용한다. rounded 분기(`rx > 0 && ry > 0`)에서
 *   음수 width/height와 양의 rx/ry를 함께 주면 `Math.min(rx, w/2)`가 음수가 되어 cubic 좌표가
 *   망가진다 (caller 책임).
 *
 * input `shape`와 `shape.points`(polyline/polygon)는 함수가 mutate하지 않는다.
 * polyline/polygon의 점이 invalid `XYInput`(예: `as any`로 우회한 `null`)이면 internal
 * `readX`/`readY` 동작에 위임된다.
 *
 * `SvgShapeLike`는 닫힌 union이라 default fallback이 없다. 미정의 kind를 type 단언으로 우회해
 * 호출하면 runtime exception이 난다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param shape 변환할 structural SVG shape input
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function shapeToPathCommandsInto<Out extends PathCommand[]>(out: Out, shape: SvgShapeLike): Out {
  switch (shape.kind) {
    case 'line':
      return writeLine(out, shape);
    case 'rect':
      return writeRect(out, shape);
    case 'circle':
      return writeCircle(out, shape);
    case 'ellipse':
      return writeEllipse(out, shape);
    case 'polyline':
      return writePolyline(out, shape);
    case 'polygon':
      return writePolygon(out, shape);
  }
}

/** line shape를 move + line 2 command로 기록한다. */
function writeLine<Out extends PathCommand[]>(out: Out, shape: SvgLineShapeLike): Out {
  out.length = 0;
  out.push({ kind: 'move', x: shape.x1, y: shape.y1 } as Out[number]);
  out.push({ kind: 'line', x: shape.x2, y: shape.y2 } as Out[number]);
  return out;
}

/** rect shape를 sharp 또는 rounded rect command sequence로 기록한다. */
function writeRect<Out extends PathCommand[]>(out: Out, shape: SvgRectShapeLike): Out {
  const x = shape.x;
  const y = shape.y;
  const w = shape.width;
  const h = shape.height;

  // SVG spec: rx/ry 중 한 쪽만 주면 다른 쪽은 같은 값. 둘 다 없으면 undefined를 그대로 이어받는다.
  const rxRaw = shape.rx ?? shape.ry;
  const ryRaw = shape.ry ?? shape.rx;

  // 둘 다 없거나 한 쪽이라도 <= 0 또는 NaN이면 sharp. NaN은 비교가 false라 `!(NaN > 0)`이 true가
  // 되어 sharp 경로로 fallback되며, sharp는 rx/ry를 사용하지 않으므로 corner cubic에 NaN이
  // 전파되지 않는다. 음수도 같은 이유로 sharp로 fallback된다 (path domain의 음수 → 0 clamp와 다름).
  const isSharp = rxRaw === undefined || ryRaw === undefined || !(rxRaw > 0) || !(ryRaw > 0);
  if (isSharp) {
    return writeSharpRect(out, x, y, w, h);
  }

  // finite w/h에서는 rx <= w/2, ry <= h/2로 clamp. Infinity rx/ry는 finite w/h에서
  // `Math.min(Infinity, w/2) = w/2`로 clamp되어 정상 cubic을 만든다.
  // NaN w/h는 NaN cubic으로 전파. 음수 w/h는 음수 cubic 좌표를 만든다 (invalid SVG path).
  const rx = Math.min(rxRaw, w / 2);
  const ry = Math.min(ryRaw, h / 2);

  return writeRoundedRect(out, x, y, w, h, rx, ry);
}

/** sharp rect를 move + 3 line + close 5 command로 기록한다. */
function writeSharpRect<Out extends PathCommand[]>(out: Out, x: number, y: number, w: number, h: number): Out {
  out.length = 0;
  out.push({ kind: 'move', x, y } as Out[number]);
  out.push({ kind: 'line', x: x + w, y } as Out[number]);
  out.push({ kind: 'line', x: x + w, y: y + h } as Out[number]);
  out.push({ kind: 'line', x, y: y + h } as Out[number]);
  out.push({ kind: 'close' } as Out[number]);
  return out;
}

/**
 * rounded rect를 move + (line + cubic) × 4 + close 10 command로 기록한다.
 *
 * corner 순서는 path domain `roundedRectCommandsInto`와 동일: 시작 (x+rx, y) → 위쪽 edge →
 * 우상 corner → 오른쪽 edge → 우하 corner → 아래쪽 edge → 좌하 corner → 왼쪽 edge → 좌상 corner → close.
 * corner cubic handle 길이는 `Kx = rx * KAPPA`, `Ky = ry * KAPPA`로 비대칭 가능하다.
 */
function writeRoundedRect<Out extends PathCommand[]>(
  out: Out,
  x: number,
  y: number,
  w: number,
  h: number,
  rx: number,
  ry: number
): Out {
  const kx = KAPPA * rx;
  const ky = KAPPA * ry;
  const x0 = x;
  const x1 = x + w;
  const y0 = y;
  const y1 = y + h;

  out.length = 0;
  // 시작점: 위쪽 edge 시작 (x0 + rx, y0)
  out.push({ kind: 'move', x: x0 + rx, y: y0 } as Out[number]);
  // 위쪽 edge → (x1 - rx, y0)
  out.push({ kind: 'line', x: x1 - rx, y: y0 } as Out[number]);
  // right-top corner: (x1 - rx, y0) → (x1, y0 + ry)
  out.push({
    kind: 'cubic',
    x1: x1 - rx + kx,
    y1: y0,
    x2: x1,
    y2: y0 + ry - ky,
    x: x1,
    y: y0 + ry,
  } as Out[number]);
  // 오른쪽 edge → (x1, y1 - ry)
  out.push({ kind: 'line', x: x1, y: y1 - ry } as Out[number]);
  // right-bottom corner: (x1, y1 - ry) → (x1 - rx, y1)
  out.push({
    kind: 'cubic',
    x1: x1,
    y1: y1 - ry + ky,
    x2: x1 - rx + kx,
    y2: y1,
    x: x1 - rx,
    y: y1,
  } as Out[number]);
  // 아래쪽 edge → (x0 + rx, y1)
  out.push({ kind: 'line', x: x0 + rx, y: y1 } as Out[number]);
  // left-bottom corner: (x0 + rx, y1) → (x0, y1 - ry)
  out.push({
    kind: 'cubic',
    x1: x0 + rx - kx,
    y1: y1,
    x2: x0,
    y2: y1 - ry + ky,
    x: x0,
    y: y1 - ry,
  } as Out[number]);
  // 왼쪽 edge → (x0, y0 + ry)
  out.push({ kind: 'line', x: x0, y: y0 + ry } as Out[number]);
  // left-top corner: (x0, y0 + ry) → (x0 + rx, y0)
  out.push({
    kind: 'cubic',
    x1: x0,
    y1: y0 + ry - ky,
    x2: x0 + rx - kx,
    y2: y0,
    x: x0 + rx,
    y: y0,
  } as Out[number]);
  out.push({ kind: 'close' } as Out[number]);
  return out;
}

/** circle shape를 move + 4 cubic + close 6 command로 기록한다 (clockwise). */
function writeCircle<Out extends PathCommand[]>(out: Out, shape: SvgCircleShapeLike): Out {
  return ellipseArcInto(out, shape.cx, shape.cy, shape.r, shape.r, true);
}

/** ellipse shape를 move + 4 cubic + close 6 command로 기록한다 (clockwise). */
function writeEllipse<Out extends PathCommand[]>(out: Out, shape: SvgEllipseShapeLike): Out {
  return ellipseArcInto(out, shape.cx, shape.cy, shape.rx, shape.ry, true);
}

/** polyline shape를 move + line × (N - 1) command로 기록한다. */
function writePolyline<Out extends PathCommand[]>(out: Out, shape: SvgPolylineShapeLike): Out {
  return writePolylinePoints(out, shape.points, false);
}

/** polygon shape를 move + line × (N - 1) + close command로 기록한다. */
function writePolygon<Out extends PathCommand[]>(out: Out, shape: SvgPolygonShapeLike): Out {
  return writePolylinePoints(out, shape.points, true);
}

/**
 * point 배열을 move + line N-1로 기록한다. `close` 인자가 true이고 point가 1개 이상이면 끝에 close.
 *
 * 점 0개는 빈 out으로 둔다 (close 추가 없음).
 */
function writePolylinePoints<Out extends PathCommand[]>(out: Out, points: readonly XYInput[], close: boolean): Out {
  out.length = 0;
  if (points.length === 0) {
    return out;
  }
  out.push({ kind: 'move', x: readX(points[0]), y: readY(points[0]) } as Out[number]);
  for (let i = 1; i < points.length; i++) {
    out.push({ kind: 'line', x: readX(points[i]), y: readY(points[i]) } as Out[number]);
  }
  if (close) {
    out.push({ kind: 'close' } as Out[number]);
  }
  return out;
}
