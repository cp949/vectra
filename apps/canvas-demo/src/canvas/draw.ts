// CanvasDrawApi 구현체
// structural type으로 좌표를 읽어 Canvas 2D API로 렌더링한다
import type {
  BoundsLike,
  BoundsTuple,
  CircleLike,
  CircleTuple,
  PolygonLike,
  RectLike,
  RectTuple,
  SegmentLike,
  SegmentTuple,
  XYInput,
} from '@cp949/vectra/types';
import type { CanvasDrawApi, DrawFillStrokeOptions, DrawPointOptions, DrawStrokeOptions, DrawTextOptions } from './api';

// ──────────────────────────────────────────────
// 내부 좌표 읽기 헬퍼
// ──────────────────────────────────────────────

/**
 * XYInput에서 x 좌표를 읽는다.
 *
 * tuple이면 index 0, object이면 .x를 반환한다.
 */
function rx(p: XYInput): number {
  // tuple XYInput은 index 0이 항상 존재하므로 0으로 fallback한다
  return Array.isArray(p) ? ((p as readonly number[])[0] ?? 0) : (p as { x: number }).x;
}

/**
 * XYInput에서 y 좌표를 읽는다.
 *
 * tuple이면 index 1, object이면 .y를 반환한다.
 */
function ry(p: XYInput): number {
  // tuple XYInput은 index 1이 항상 존재하므로 0으로 fallback한다
  return Array.isArray(p) ? ((p as readonly number[])[1] ?? 0) : (p as { y: number }).y;
}

function isSegmentTuple(segment: SegmentLike): segment is SegmentTuple {
  return Array.isArray(segment);
}

/** SegmentLike에서 시작 endpoint를 읽는다. */
function readSegmentA(segment: SegmentLike): XYInput {
  return isSegmentTuple(segment) ? segment[0] : segment.a;
}

/** SegmentLike에서 끝 endpoint를 읽는다. */
function readSegmentB(segment: SegmentLike): XYInput {
  return isSegmentTuple(segment) ? segment[1] : segment.b;
}

function isBoundsTuple(bounds: BoundsLike): bounds is BoundsTuple {
  return Array.isArray(bounds);
}

/** BoundsLike에서 min corner를 읽는다. */
function readBoundsMin(bounds: BoundsLike): XYInput {
  return isBoundsTuple(bounds) ? bounds[0] : bounds.min;
}

/** BoundsLike에서 max corner를 읽는다. */
function readBoundsMax(bounds: BoundsLike): XYInput {
  return isBoundsTuple(bounds) ? bounds[1] : bounds.max;
}

function isCircleTuple(circle: CircleLike): circle is CircleTuple {
  return Array.isArray(circle);
}

/** CircleLike에서 center를 읽는다. */
function readCircleCenter(circle: CircleLike): XYInput {
  return isCircleTuple(circle) ? circle[0] : circle.center;
}

/** CircleLike에서 radius를 읽는다. */
function readCircleRadius(circle: CircleLike): number {
  return isCircleTuple(circle) ? circle[1] : circle.radius;
}

function isRectTuple(rect: RectLike): rect is RectTuple {
  return Array.isArray(rect);
}

/** RectLike에서 x component를 읽는다. */
function readRectX(rect: RectLike): number {
  return isRectTuple(rect) ? rect[0] : rect.x;
}

/** RectLike에서 y component를 읽는다. */
function readRectY(rect: RectLike): number {
  return isRectTuple(rect) ? rect[1] : rect.y;
}

/** RectLike에서 width component를 읽는다. */
function readRectWidth(rect: RectLike): number {
  return isRectTuple(rect) ? rect[2] : rect.width;
}

/** RectLike에서 height component를 읽는다. */
function readRectHeight(rect: RectLike): number {
  return isRectTuple(rect) ? rect[3] : rect.height;
}

// ──────────────────────────────────────────────
// PolygonLike 포인트 추출 헬퍼
// ──────────────────────────────────────────────

/**
 * PolygonLike / PolylineLike에서 point 배열을 추출한다.
 *
 * 배열 형태이면 그대로 반환하고, `points` 속성이 있으면 그 배열을 반환한다.
 */
function readPoints(shape: PolygonLike | readonly XYInput[]): readonly XYInput[] {
  if (Array.isArray(shape)) return shape as readonly XYInput[];
  const obj = shape as { points?: readonly XYInput[] };
  return obj.points ?? [];
}

// ──────────────────────────────────────────────
// 기본값 상수
// ──────────────────────────────────────────────

const DEFAULT_STROKE_COLOR = '#e2e8f0';
const DEFAULT_FILL_COLOR = 'rgba(56, 189, 248, 0.15)';
const DEFAULT_POINT_COLOR = '#38bdf8';
const DEFAULT_POINT_RADIUS = 5;
const DEFAULT_STROKE_WIDTH = 1.5;

/**
 * CanvasDrawApi의 실제 구현체.
 *
 * vectra structural type(`XYInput`, `SegmentLike`, `BoundsLike` 등)을 읽어
 * CanvasRenderingContext2D로 렌더링한다.
 */
export const canvasDrawApi: CanvasDrawApi = {
  /**
   * 캔버스 전체를 단색으로 지운다.
   *
   * color가 없으면 기본 배경색(#1e1e1e)으로 채운다.
   */
  clear(ctx: CanvasRenderingContext2D, color?: string): void {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = color ?? '#1e1e1e';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  },

  /**
   * 점을 원으로 렌더링한다.
   */
  point(ctx: CanvasRenderingContext2D, point: XYInput, options?: DrawPointOptions): void {
    const x = rx(point);
    const y = ry(point);
    const radius = options?.radius ?? DEFAULT_POINT_RADIUS;
    const color = options?.color ?? DEFAULT_POINT_COLOR;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  },

  /**
   * 선분을 렌더링한다.
   *
   * segment.a에서 segment.b까지 선을 그린다.
   */
  segment(ctx: CanvasRenderingContext2D, segment: SegmentLike, options?: DrawStrokeOptions): void {
    const a = readSegmentA(segment);
    const b = readSegmentB(segment);
    const ax = rx(a);
    const ay = ry(a);
    const bx = rx(b);
    const by = ry(b);

    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = options?.color ?? DEFAULT_STROKE_COLOR;
    ctx.lineWidth = options?.width ?? DEFAULT_STROKE_WIDTH;
    ctx.stroke();
  },

  /**
   * 사각형을 렌더링한다.
   *
   * RectLike component를 읽어 fill/stroke한다.
   */
  rect(ctx: CanvasRenderingContext2D, rect: RectLike, options?: DrawFillStrokeOptions): void {
    ctx.beginPath();
    ctx.rect(readRectX(rect), readRectY(rect), readRectWidth(rect), readRectHeight(rect));

    // fill이 'none'이면 fillStyle 설정과 fill() 호출을 모두 건너뛴다
    if (options?.fill !== 'none') {
      ctx.fillStyle = options?.fill ?? DEFAULT_FILL_COLOR;
      ctx.fill();
    }
    if (options?.stroke !== 'none') {
      ctx.strokeStyle = options?.stroke ?? DEFAULT_STROKE_COLOR;
      ctx.lineWidth = options?.strokeWidth ?? DEFAULT_STROKE_WIDTH;
      ctx.stroke();
    }
  },

  /**
   * bounds 사각형을 렌더링한다.
   *
   * bounds min/max corner를 읽어 fill/stroke한다.
   */
  bounds(ctx: CanvasRenderingContext2D, bounds: BoundsLike, options?: DrawFillStrokeOptions): void {
    const minX = rx(readBoundsMin(bounds));
    const minY = ry(readBoundsMin(bounds));
    const maxX = rx(readBoundsMax(bounds));
    const maxY = ry(readBoundsMax(bounds));

    ctx.beginPath();
    ctx.rect(minX, minY, maxX - minX, maxY - minY);

    // fill이 'none'이면 fillStyle 설정과 fill() 호출을 모두 건너뛴다
    if (options?.fill !== 'none') {
      ctx.fillStyle = options?.fill ?? DEFAULT_FILL_COLOR;
      ctx.fill();
    }
    if (options?.stroke !== 'none') {
      ctx.strokeStyle = options?.stroke ?? DEFAULT_STROKE_COLOR;
      ctx.lineWidth = options?.strokeWidth ?? DEFAULT_STROKE_WIDTH;
      ctx.stroke();
    }
  },

  /**
   * 원을 렌더링한다.
   *
   * circle center와 radius를 읽어 fill/stroke한다.
   */
  circle(ctx: CanvasRenderingContext2D, circle: CircleLike, options?: DrawFillStrokeOptions): void {
    const cx = rx(readCircleCenter(circle));
    const cy = ry(readCircleCenter(circle));
    const radius = readCircleRadius(circle);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);

    // fill이 'none'이면 fillStyle 설정과 fill() 호출을 모두 건너뛴다
    if (options?.fill !== 'none') {
      ctx.fillStyle = options?.fill ?? DEFAULT_FILL_COLOR;
      ctx.fill();
    }
    if (options?.stroke !== 'none') {
      ctx.strokeStyle = options?.stroke ?? DEFAULT_STROKE_COLOR;
      ctx.lineWidth = options?.strokeWidth ?? DEFAULT_STROKE_WIDTH;
      ctx.stroke();
    }
  },

  /**
   * 다각형을 렌더링한다.
   *
   * PolygonLike의 point 배열을 순서대로 연결하여 closePath 후 fill/stroke한다.
   */
  polygon(ctx: CanvasRenderingContext2D, polygon: PolygonLike, options?: DrawFillStrokeOptions): void {
    const pts = readPoints(polygon);
    if (pts.length < 2) return;

    ctx.beginPath();
    // pts.length >= 2 검사를 통과했으므로 인덱스 접근은 항상 안전하다
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (p === undefined) continue;
      if (i === 0) ctx.moveTo(rx(p), ry(p));
      else ctx.lineTo(rx(p), ry(p));
    }
    ctx.closePath();

    // fill이 'none'이면 fillStyle 설정과 fill() 호출을 모두 건너뛴다
    if (options?.fill !== 'none') {
      ctx.fillStyle = options?.fill ?? DEFAULT_FILL_COLOR;
      ctx.fill();
    }
    if (options?.stroke !== 'none') {
      ctx.strokeStyle = options?.stroke ?? DEFAULT_STROKE_COLOR;
      ctx.lineWidth = options?.strokeWidth ?? DEFAULT_STROKE_WIDTH;
      ctx.stroke();
    }
  },

  /**
   * 폴리라인을 렌더링한다.
   *
   * point 배열을 순서대로 연결하여 열린 경로를 그린다.
   */
  polyline(ctx: CanvasRenderingContext2D, points: readonly XYInput[], options?: DrawStrokeOptions): void {
    if (points.length < 2) return;

    ctx.beginPath();
    // points.length >= 2 검사를 통과했으므로 인덱스 접근은 항상 안전하다
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p === undefined) continue;
      if (i === 0) ctx.moveTo(rx(p), ry(p));
      else ctx.lineTo(rx(p), ry(p));
    }
    ctx.strokeStyle = options?.color ?? DEFAULT_STROKE_COLOR;
    ctx.lineWidth = options?.width ?? DEFAULT_STROKE_WIDTH;
    ctx.stroke();
  },

  /**
   * 텍스트 라벨을 렌더링한다.
   *
   * `at` 위치에 텍스트를 그린다.
   */
  label(ctx: CanvasRenderingContext2D, text: string, at: XYInput, options?: DrawTextOptions): void {
    ctx.font = options?.font ?? '13px monospace';
    ctx.fillStyle = options?.color ?? '#e2e8f0';
    ctx.textAlign = options?.align ?? 'left';
    ctx.fillText(text, rx(at), ry(at));
  },
};
