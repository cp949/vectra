import type { XYInput } from './xy.internal';

/**
 * `pathDataToString` 직렬화 옵션.
 *
 * `precision`이 유효한 정수(0 이상)일 때만 `toFixed`를 적용한다.
 * 음수, 소수, NaN이면 `String(number)` 기반으로 fallback한다.
 */
export interface SvgPathStringifyOptions {
  /**
   * 소수점 이하 자릿수. 유효한 값: 0 이상의 정수.
   * 미지정 또는 유효하지 않으면 `String(number)` 기반 formatting을 사용한다.
   */
  precision?: number;
}

/**
 * SVG `<line>` element attribute에 대응하는 structural shape input.
 *
 * DOM element가 아니라 attribute만 추출한 plain object를 받는다.
 * `shapeToPathCommandsInto`가 소비한다.
 */
export interface SvgLineShapeLike {
  /** discriminant */
  readonly kind: 'line';

  /** 시작점 x */
  readonly x1: number;

  /** 시작점 y */
  readonly y1: number;

  /** 끝점 x */
  readonly x2: number;

  /** 끝점 y */
  readonly y2: number;
}

/**
 * SVG `<rect>` element attribute에 대응하는 structural shape input.
 *
 * `rx`/`ry`는 선택. 한쪽만 주면 다른 한쪽도 같은 값으로 본다 (SVG spec).
 * 둘 다 없거나 `<= 0` 또는 NaN이면 sharp rect로 처리한다 (음수/NaN rx/ry도 sharp).
 * `width`/`height` 음수/NaN/Infinity는 validation 없이 그대로 사용한다.
 */
export interface SvgRectShapeLike {
  /** discriminant */
  readonly kind: 'rect';

  /** rect 왼쪽 x */
  readonly x: number;

  /** rect 위쪽 y */
  readonly y: number;

  /** rect 너비 */
  readonly width: number;

  /** rect 높이 */
  readonly height: number;

  /** corner x 반지름. 미지정 시 `ry`와 동일. 둘 다 미지정이면 sharp */
  readonly rx?: number;

  /** corner y 반지름. 미지정 시 `rx`와 동일. 둘 다 미지정이면 sharp */
  readonly ry?: number;
}

/**
 * SVG `<circle>` element attribute에 대응하는 structural shape input.
 *
 * `r <= 0` 또는 `r`이 NaN/Infinity여도 validation 없이 그대로 사용한다.
 * `shapeToPathCommandsInto`가 cubic 좌표에 raw `r`을 전파한다.
 */
export interface SvgCircleShapeLike {
  /** discriminant */
  readonly kind: 'circle';

  /** 중심 x */
  readonly cx: number;

  /** 중심 y */
  readonly cy: number;

  /** 반지름 */
  readonly r: number;
}

/**
 * SVG `<ellipse>` element attribute에 대응하는 structural shape input.
 *
 * `rx`, `ry`가 0/음수/NaN/Infinity여도 validation 없이 그대로 사용한다.
 * `shapeToPathCommandsInto`가 cubic 좌표에 raw 값을 전파한다.
 */
export interface SvgEllipseShapeLike {
  /** discriminant */
  readonly kind: 'ellipse';

  /** 중심 x */
  readonly cx: number;

  /** 중심 y */
  readonly cy: number;

  /** x축 반지름 */
  readonly rx: number;

  /** y축 반지름 */
  readonly ry: number;
}

/** SVG `<polyline>` element attribute에 대응하는 structural shape input. */
export interface SvgPolylineShapeLike {
  /** discriminant */
  readonly kind: 'polyline';

  /** polyline vertex 목록 */
  readonly points: readonly XYInput[];
}

/** SVG `<polygon>` element attribute에 대응하는 structural shape input. */
export interface SvgPolygonShapeLike {
  /** discriminant */
  readonly kind: 'polygon';

  /** polygon vertex 목록 */
  readonly points: readonly XYInput[];
}

/**
 * `shapeToPathCommandsInto`가 받는 structural SVG shape input의 닫힌 discriminated union.
 *
 * `kind` 분기로 narrowing한다. DOM element, `<path d="">` data string, transform/style
 * attribute는 포함하지 않는다.
 */
export type SvgShapeLike =
  | SvgLineShapeLike
  | SvgRectShapeLike
  | SvgCircleShapeLike
  | SvgEllipseShapeLike
  | SvgPolylineShapeLike
  | SvgPolygonShapeLike;
