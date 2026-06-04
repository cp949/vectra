import * as Curves from '@cp949/vectra/curve';
import * as Matrices from '@cp949/vectra/matrix';
import * as Random from '@cp949/vectra/random';
import { assertUniqueExampleIds, compileForSandbox } from '@repo/playground';
import { describe, expect, it } from 'vitest';
import { VECTRA_ALLOWED_SPECIFIERS } from '../sandbox/canvas-runner-html';
import { adapterInteropExample } from './adapter-interop';
import adapterInteropCode from './adapter-interop/source.exam.ts?raw';
import { arcLengthProbeExample } from './arc-length-probe';
import arcLengthProbeCode from './arc-length-probe/source.exam.ts?raw';
import { EXAMPLES } from './catalog';
import { matrixTransformExample } from './matrix-transform';
import matrixTransformCode from './matrix-transform/source.exam.ts?raw';
import { matrixViewportFitExample } from './matrix-viewport-fit';
import matrixViewportFitCode from './matrix-viewport-fit/source.exam.ts?raw';
import { polygonHitTestExample } from './polygon-hit-test';
import polygonHitTestCode from './polygon-hit-test/source.exam.ts?raw';
import { quickStartExample } from './quick-start';
import quickStartCode from './quick-start/source.exam.ts?raw';
import { randomBoundarySamplingExample } from './random-boundary-sampling';
import randomBoundarySamplingCode from './random-boundary-sampling/source.exam.ts?raw';
import { randomDistributionSamplingExample } from './random-distribution-sampling';
import randomDistributionSamplingCode from './random-distribution-sampling/source.exam.ts?raw';
import { randomSamplingExample } from './random-sampling';
import randomSamplingCode from './random-sampling/source.exam.ts?raw';
import { segmentSnapExample } from './segment-snap';
import segmentSnapCode from './segment-snap/source.exam.ts?raw';
import { selectionBoundsExample } from './selection-bounds';
import selectionBoundsCode from './selection-bounds/source.exam.ts?raw';

describe('canvas demo example sources', () => {
  it('catalog example id는 slug이며 중복되지 않는다', () => {
    expect(() => assertUniqueExampleIds(EXAMPLES)).not.toThrow();
  });

  it('별도 TypeScript exam 파일을 raw code로 사용한다', () => {
    expect(quickStartExample.source.code).toBe(quickStartCode);
    expect(adapterInteropExample.source.code).toBe(adapterInteropCode);
    expect(segmentSnapExample.source.code).toBe(segmentSnapCode);
    expect(selectionBoundsExample.source.code).toBe(selectionBoundsCode);
    expect(polygonHitTestExample.source.code).toBe(polygonHitTestCode);
    expect(matrixTransformExample.source.code).toBe(matrixTransformCode);
    expect(randomSamplingExample.source.code).toBe(randomSamplingCode);
    expect(randomDistributionSamplingExample.source.code).toBe(randomDistributionSamplingCode);
    expect(randomBoundarySamplingExample.source.code).toBe(randomBoundarySamplingCode);
    expect(matrixViewportFitExample.source.code).toBe(matrixViewportFitCode);
    expect(arcLengthProbeExample.source.code).toBe(arcLengthProbeCode);
  });

  it('모든 예제 source는 Canvas sandbox allowlist로 컴파일된다', () => {
    for (const example of EXAMPLES) {
      const result = compileForSandbox(example.source.code, { allowedSpecifiers: VECTRA_ALLOWED_SPECIFIERS });

      expect(result.diagnostics, example.id).toEqual([]);
    }
  });

  it('단발성 object 결과는 allocating companion API를 사용한다', () => {
    const forbiddenIntoCallsBySource = [
      {
        id: 'quick-start',
        code: quickStartCode,
        calls: ['Vectors.addInto(sum', 'Vectors.scaleInto(mid'],
      },
      {
        id: 'polygon-hit-test',
        code: polygonHitTestCode,
        calls: ['Polygons.closestPointInto'],
      },
    ];

    for (const { id, code, calls } of forbiddenIntoCallsBySource) {
      for (const call of calls) {
        expect(code, `${id} should not contain ${call}`).not.toContain(call);
      }
    }
  });

  it('matrix-transform 예제는 유한한 TRS translation 값을 표시한다', () => {
    const result = compileForSandbox(matrixTransformExample.source.code, {
      allowedSpecifiers: VECTRA_ALLOWED_SPECIFIERS,
    });
    const labels: string[] = [];
    const runtime = {
      ...matrixTransformExample.runtimeSeed,
      rng: () => 0,
      draw: {
        clear: () => undefined,
        rect: () => undefined,
        polygon: () => undefined,
        point: () => undefined,
        label: (_ctx: CanvasRenderingContext2D, text: string) => labels.push(text),
      },
    };
    const runDraw = new Function('__modules__', 'ctx', 'runtime', `${result.compiledJs}; draw(ctx, runtime);`) as (
      modules: Record<string, unknown>,
      ctx: CanvasRenderingContext2D,
      runtime: unknown
    ) => void;

    runDraw({ '@cp949/vectra/matrix': Matrices }, {} as CanvasRenderingContext2D, runtime);

    expect(labels).toContain('TRS.tx=300.0  .ty=200.0');
  });

  it('matrix-transform 예제는 30도 회전된 rect outline을 그린다', () => {
    const result = compileForSandbox(matrixTransformExample.source.code, {
      allowedSpecifiers: VECTRA_ALLOWED_SPECIFIERS,
    });
    const polygons: { points: { x: number; y: number }[] }[] = [];
    const runtime = {
      ...matrixTransformExample.runtimeSeed,
      rng: () => 0,
      draw: {
        clear: () => undefined,
        rect: () => undefined,
        bounds: () => undefined,
        circle: () => undefined,
        segment: () => undefined,
        point: () => undefined,
        polygon: (_ctx: CanvasRenderingContext2D, polygon: { points: { x: number; y: number }[] }) =>
          polygons.push(polygon),
        polyline: () => undefined,
        label: () => undefined,
      },
    };
    const runDraw = new Function('__modules__', 'ctx', 'runtime', `${result.compiledJs}; draw(ctx, runtime);`) as (
      modules: Record<string, unknown>,
      ctx: CanvasRenderingContext2D,
      runtime: unknown
    ) => void;

    runDraw({ '@cp949/vectra/matrix': Matrices }, {} as CanvasRenderingContext2D, runtime);

    expect(polygons).toHaveLength(1);
    expect(polygons[0]?.points).toEqual([
      { x: 245.25386608210715, y: 126.82308546376021 },
      { x: 390.74613391789285, y: 210.8230854637602 },
      { x: 354.74613391789285, y: 273.1769145362398 },
      { x: 209.25386608210715, y: 189.1769145362398 },
    ]);
  });

  it('matrix-viewport-fit 예제는 world bounds를 viewport로 맞추고 screen marker를 world 좌표로 되돌린다', () => {
    const result = compileForSandbox(matrixViewportFitExample.source.code, {
      allowedSpecifiers: VECTRA_ALLOWED_SPECIFIERS,
    });
    const labels: string[] = [];
    const points: { x: number; y: number }[] = [];
    const runtime = {
      ...matrixViewportFitExample.runtimeSeed,
      rng: () => 0,
      draw: {
        clear: () => undefined,
        rect: () => undefined,
        bounds: () => undefined,
        circle: () => undefined,
        segment: () => undefined,
        point: (_ctx: CanvasRenderingContext2D, point: { x: number; y: number }) => points.push(point),
        polygon: () => undefined,
        polyline: () => undefined,
        label: (_ctx: CanvasRenderingContext2D, text: string) => labels.push(text),
      },
    };
    const runDraw = new Function('__modules__', 'ctx', 'runtime', `${result.compiledJs}; draw(ctx, runtime);`) as (
      modules: Record<string, unknown>,
      ctx: CanvasRenderingContext2D,
      runtime: unknown
    ) => void;

    runDraw({ '@cp949/vectra/matrix': Matrices }, {} as CanvasRenderingContext2D, runtime);

    expect(labels).toContain('fitBounds contain');
    expect(labels).toContain('inverse ok=true');
    expect(labels.some((text) => text.startsWith('screen(620,120) -> world('))).toBe(true);
    expect(points.length).toBeGreaterThanOrEqual(4);
  });

  it('random-boundary-sampling 예제는 area sample과 boundary sample을 함께 그린다', () => {
    const result = compileForSandbox(randomBoundarySamplingExample.source.code, {
      allowedSpecifiers: VECTRA_ALLOWED_SPECIFIERS,
    });
    const labels: string[] = [];
    const points: { x: number; y: number }[] = [];
    const runtime = {
      ...randomBoundarySamplingExample.runtimeSeed,
      rng: () => 0,
      draw: {
        clear: () => undefined,
        rect: () => undefined,
        bounds: () => undefined,
        circle: () => undefined,
        segment: () => undefined,
        point: (_ctx: CanvasRenderingContext2D, point: { x: number; y: number }) => points.push(point),
        polygon: () => undefined,
        polyline: () => undefined,
        label: (_ctx: CanvasRenderingContext2D, text: string) => labels.push(text),
      },
    };
    const ctx = {
      beginPath: () => undefined,
      moveTo: () => undefined,
      lineTo: () => undefined,
      quadraticCurveTo: () => undefined,
      bezierCurveTo: () => undefined,
      closePath: () => undefined,
      fillRect: () => undefined,
      stroke: () => undefined,
      lineWidth: 0,
      strokeStyle: '',
      fillStyle: '',
    } as unknown as CanvasRenderingContext2D;
    const runDraw = new Function('__modules__', 'ctx', 'runtime', `${result.compiledJs}; draw(ctx, runtime);`) as (
      modules: Record<string, unknown>,
      ctx: CanvasRenderingContext2D,
      runtime: unknown
    ) => void;

    runDraw({ '@cp949/vectra/random': Random }, ctx, runtime);

    expect(labels).toContain('pointInTriangle');
    expect(labels).toContain('pointInEllipse');
    expect(labels).toContain('pointOnPolyline');
    expect(labels).toContain('pointOnPath');
    expect(points.length).toBeGreaterThanOrEqual(400);
  });

  it('arc-length-probe 예제는 arc 길이 probe와 tangent/normal 결과를 표시한다', () => {
    const result = compileForSandbox(arcLengthProbeExample.source.code, {
      allowedSpecifiers: VECTRA_ALLOWED_SPECIFIERS,
    });
    const labels: string[] = [];
    const points: { x: number; y: number }[] = [];
    const segments: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
    const polylines: { x: number; y: number }[][] = [];
    const runtime = {
      ...arcLengthProbeExample.runtimeSeed,
      rng: () => 0,
      draw: {
        clear: () => undefined,
        rect: () => undefined,
        bounds: () => undefined,
        circle: () => undefined,
        segment: (
          _ctx: CanvasRenderingContext2D,
          segment: { a: { x: number; y: number }; b: { x: number; y: number } }
        ) => segments.push(segment),
        point: (_ctx: CanvasRenderingContext2D, point: { x: number; y: number }) => points.push(point),
        polygon: () => undefined,
        polyline: (_ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) => polylines.push(points),
        label: (_ctx: CanvasRenderingContext2D, text: string) => labels.push(text),
      },
    };
    const runDraw = new Function('__modules__', 'ctx', 'runtime', `${result.compiledJs}; draw(ctx, runtime);`) as (
      modules: Record<string, unknown>,
      ctx: CanvasRenderingContext2D,
      runtime: unknown
    ) => void;

    runDraw({ '@cp949/vectra/curve': Curves }, {} as CanvasRenderingContext2D, runtime);

    expect(labels).toContain('arc length probe');
    expect(labels.some((text) => text.startsWith('length@t=0.65'))).toBe(true);
    expect(labels.some((text) => text.startsWith('closest delta='))).toBe(true);
    expect(points.length).toBeGreaterThanOrEqual(5);
    expect(segments.length).toBeGreaterThanOrEqual(4);
    expect(polylines.some((points) => points.length >= 49)).toBe(true);
  });
});
