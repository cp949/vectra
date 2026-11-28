// CanvasDrawApi 구현체
// structural type으로 좌표를 읽어 Canvas 2D API로 렌더링한다
import type { Bounds, Circle, Point, Polygon, Rect, Segment } from '@cp949/vectra/types';
import type { CanvasDrawApi, DrawFillStrokeOptions, DrawPointOptions, DrawStrokeOptions, DrawTextOptions } from './api';

const DEFAULT_STROKE_COLOR = '#e2e8f0';
const DEFAULT_FILL_COLOR = 'rgba(56, 189, 248, 0.15)';
const DEFAULT_POINT_COLOR = '#38bdf8';
const DEFAULT_POINT_RADIUS = 5;
const DEFAULT_STROKE_WIDTH = 1.5;

/**
 * CanvasDrawApi의 실제 구현체.
 *
 * 평평한 도형 좌표를 CanvasRenderingContext2D로 렌더링한다.
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
  point(ctx: CanvasRenderingContext2D, point: Point, options?: DrawPointOptions): void {
    const x = point.x;
    const y = point.y;
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
   * 시작점에서 끝점까지 선을 그린다.
   */
  segment(ctx: CanvasRenderingContext2D, segment: Segment, options?: DrawStrokeOptions): void {
    ctx.beginPath();
    ctx.moveTo(segment.x1, segment.y1);
    ctx.lineTo(segment.x2, segment.y2);
    ctx.strokeStyle = options?.color ?? DEFAULT_STROKE_COLOR;
    ctx.lineWidth = options?.width ?? DEFAULT_STROKE_WIDTH;
    ctx.stroke();
  },

  /**
   * 사각형을 렌더링한다.
   *
   * Rect component를 읽어 fill/stroke한다.
   */
  rect(ctx: CanvasRenderingContext2D, rect: Rect, options?: DrawFillStrokeOptions): void {
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);

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
  bounds(ctx: CanvasRenderingContext2D, bounds: Bounds, options?: DrawFillStrokeOptions): void {
    const { minX, minY, maxX, maxY } = bounds;

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
  circle(ctx: CanvasRenderingContext2D, circle: Circle, options?: DrawFillStrokeOptions): void {
    const { cx, cy, r } = circle;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);

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
   * 다각형의 x, y가 번갈아 나오는 배열을 순서대로 연결하여 closePath 후 fill/stroke한다.
   */
  polygon(ctx: CanvasRenderingContext2D, polygon: Polygon, options?: DrawFillStrokeOptions): void {
    if (polygon.length < 4) return;

    ctx.beginPath();
    for (let i = 0; i + 1 < polygon.length; i += 2) {
      const x = polygon[i];
      const y = polygon[i + 1];
      if (x === undefined || y === undefined) continue;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
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
  polyline(ctx: CanvasRenderingContext2D, points: readonly Point[], options?: DrawStrokeOptions): void {
    if (points.length < 2) return;

    ctx.beginPath();
    // points.length >= 2 검사를 통과했으므로 인덱스 접근은 항상 안전하다
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p === undefined) continue;
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
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
  label(ctx: CanvasRenderingContext2D, text: string, at: Point, options?: DrawTextOptions): void {
    ctx.font = options?.font ?? '13px monospace';
    ctx.fillStyle = options?.color ?? '#e2e8f0';
    ctx.textAlign = options?.align ?? 'left';
    ctx.fillText(text, at.x, at.y);
  },
};
