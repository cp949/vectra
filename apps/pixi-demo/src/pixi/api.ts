import type * as PIXI from 'pixi.js';

/** Pixi 예제 함수에 주입되는 runtime 컨텍스트. */
export interface PixiRuntime {
  readonly PIXI: typeof PIXI;
  readonly app: PIXI.Application;
  readonly size: { readonly width: number; readonly height: number };
  readonly pointer: PixiRuntimeSeed['pointer'];
  readonly segment: PixiRuntimeSeed['segment'];
  readonly circle: PixiRuntimeSeed['circle'];
  readonly rng: () => number;
}

/** 예제 실행 시 PixiRuntime을 초기화하는 시드 데이터. */
export interface PixiRuntimeSeed {
  readonly size: { readonly width: number; readonly height: number };
  readonly pointer: { readonly x: number; readonly y: number };
  readonly segment: {
    readonly a: { readonly x: number; readonly y: number };
    readonly b: { readonly x: number; readonly y: number };
  };
  readonly circle: { readonly center: { readonly x: number; readonly y: number }; readonly radius: number };
  readonly randomSeed?: number;
}
