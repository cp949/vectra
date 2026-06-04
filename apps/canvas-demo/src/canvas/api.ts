// Canvas runtime 타입 정의 (apps/canvas-demo 소유)
// TASK-05에서 실제 구현이 연결된다
import type { BoundsLike, CircleLike, PolygonLike, RectLike, SegmentLike, XYInput } from '@cp949/vectra/types';

/** draw 옵션: 점 */
export interface DrawPointOptions {
  color?: string;
  radius?: number;
}

/** draw 옵션: 선 */
export interface DrawStrokeOptions {
  color?: string;
  width?: number;
}

/** draw 옵션: 채우기 + 선 */
export interface DrawFillStrokeOptions {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

/** draw 옵션: 텍스트 */
export interface DrawTextOptions {
  color?: string;
  font?: string;
  align?: CanvasTextAlign;
}

/**
 * Canvas 그리기 API.
 *
 * 각 메서드는 CanvasRenderingContext2D를 직접 받아 렌더링한다.
 * TASK-05에서 구현체(draw.ts)가 완성된다.
 */
export interface CanvasDrawApi {
  clear(ctx: CanvasRenderingContext2D, color?: string): void;
  point(ctx: CanvasRenderingContext2D, point: XYInput, options?: DrawPointOptions): void;
  segment(ctx: CanvasRenderingContext2D, segment: SegmentLike, options?: DrawStrokeOptions): void;
  rect(ctx: CanvasRenderingContext2D, rect: RectLike, options?: DrawFillStrokeOptions): void;
  bounds(ctx: CanvasRenderingContext2D, bounds: BoundsLike, options?: DrawFillStrokeOptions): void;
  circle(ctx: CanvasRenderingContext2D, circle: CircleLike, options?: DrawFillStrokeOptions): void;
  polygon(ctx: CanvasRenderingContext2D, polygon: PolygonLike, options?: DrawFillStrokeOptions): void;
  polyline(ctx: CanvasRenderingContext2D, points: readonly XYInput[], options?: DrawStrokeOptions): void;
  label(ctx: CanvasRenderingContext2D, text: string, at: XYInput, options?: DrawTextOptions): void;
}

/**
 * 예제 함수에 주입되는 canvas 런타임 컨텍스트.
 *
 * 예제 코드는 이 객체를 통해 geometry 데이터와 draw API에 접근한다.
 */
export interface CanvasRuntime {
  readonly size: { readonly width: number; readonly height: number };
  readonly pointer: CanvasRuntimeSeed['pointer'];
  readonly segment: CanvasRuntimeSeed['segment'];
  readonly rect: CanvasRuntimeSeed['rect'];
  readonly bounds: CanvasRuntimeSeed['bounds'];
  readonly circle: CanvasRuntimeSeed['circle'];
  readonly polygon: CanvasRuntimeSeed['polygon'];
  readonly matrix: CanvasRuntimeSeed['matrix'];
  readonly rng: () => number;
  readonly draw: CanvasDrawApi;
}

/**
 * 예제 실행 시 CanvasRuntime을 초기화하는 시드 데이터.
 *
 * 각 예제가 `runtimeSeed` 필드에 이 타입의 값을 담는다.
 */
export interface CanvasRuntimeSeed {
  readonly size: { readonly width: number; readonly height: number };
  readonly pointer: { readonly x: number; readonly y: number };
  readonly segment: {
    readonly a: { readonly x: number; readonly y: number };
    readonly b: { readonly x: number; readonly y: number };
  };
  readonly rect: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
  readonly circle: { readonly center: { readonly x: number; readonly y: number }; readonly radius: number };
  readonly bounds: {
    readonly min: { readonly x: number; readonly y: number };
    readonly max: { readonly x: number; readonly y: number };
  };
  readonly polygon: readonly { readonly x: number; readonly y: number }[];
  readonly matrix: {
    readonly a: number;
    readonly b: number;
    readonly c: number;
    readonly d: number;
    readonly tx: number;
    readonly ty: number;
  };
  readonly randomSeed?: number;
}
