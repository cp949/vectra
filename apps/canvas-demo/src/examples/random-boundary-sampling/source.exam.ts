/**
 * Random Boundary Sampling
 *
 * triangle/ellipse 내부 area-uniform scatter와 polyline/path 위 length-uniform boundary marker를
 * 같은 seeded RNG 흐름으로 비교한다. 각 패널은 같은 seed에서 항상 같은 샘플 위치를 재현한다.
 *
 * - Random.createRng: 패널별 결정적 RNG 생성
 * - Random.pointInTriangle: triangle 내부 barycentric area-uniform 샘플
 * - Random.pointInEllipse: ellipse 내부 area-uniform 샘플
 * - Random.pointOnPolyline: 열린 polyline 위 length-uniform 샘플
 * - Random.pointOnPath: path command sequence 위 length-uniform 샘플
 */
import * as Random from '@cp949/vectra/random';
import type { CanvasRuntime } from '../../canvas/api';

export function draw(ctx: CanvasRenderingContext2D, runtime: CanvasRuntime): void {
  const { draw: d } = runtime;

  d.clear(ctx, '#1e1e1e');

  const triangle = [
    { x: 92, y: 68 },
    { x: 226, y: 156 },
    { x: 54, y: 178 },
  ];
  const ellipse = { center: { x: 566, y: 122 }, radiusX: 120, radiusY: 58 };
  const polyline = [
    { x: 68, y: 350 },
    { x: 118, y: 276 },
    { x: 188, y: 338 },
    { x: 254, y: 278 },
    { x: 318, y: 362 },
  ];
  const pathCommands = [
    { kind: 'move', x: 456, y: 352 },
    { kind: 'cubic', x1: 492, y1: 260, x2: 620, y2: 260, x: 654, y: 352 },
    { kind: 'line', x: 710, y: 300 },
  ] as const;

  drawPanelBackground(ctx, 26, 32, 318, 164);
  drawPanelBackground(ctx, 396, 32, 318, 164);
  drawPanelBackground(ctx, 26, 236, 318, 164);
  drawPanelBackground(ctx, 396, 236, 318, 164);

  d.label(ctx, 'pointInTriangle', { x: 42, y: 58 }, { color: '#38bdf8', font: '12px monospace' });
  d.label(ctx, '180pt · area uniform', { x: 42, y: 74 }, { color: '#64748b', font: '11px monospace' });
  d.polygon(ctx, triangle, { fill: 'rgba(56,189,248,0.06)', stroke: '#334155', strokeWidth: 1 });
  const triangleRng = Random.createRng('random-boundary-sampling-triangle');
  for (let i = 0; i < 180; i++) {
    const pt = Random.pointInTriangle(triangle[0], triangle[1], triangle[2], triangleRng);
    d.point(ctx, pt, { color: '#38bdf8', radius: 1.6 });
  }

  d.label(ctx, 'pointInEllipse', { x: 412, y: 58 }, { color: '#fb923c', font: '12px monospace' });
  d.label(ctx, '180pt · area uniform', { x: 412, y: 74 }, { color: '#64748b', font: '11px monospace' });
  strokeEllipseApprox(ctx, ellipse.center.x, ellipse.center.y, ellipse.radiusX, ellipse.radiusY, '#334155');
  const ellipseRng = Random.createRng('random-boundary-sampling-ellipse');
  for (let i = 0; i < 180; i++) {
    const pt = Random.pointInEllipse(ellipse, ellipseRng);
    if (pt !== undefined) d.point(ctx, pt, { color: '#fb923c', radius: 1.6 });
  }

  d.label(ctx, 'pointOnPolyline', { x: 42, y: 262 }, { color: '#4ade80', font: '12px monospace' });
  d.label(ctx, '80pt · length uniform', { x: 42, y: 278 }, { color: '#64748b', font: '11px monospace' });
  d.polyline(ctx, polyline, { color: '#334155', width: 2 });
  const polylineRng = Random.createRng('random-boundary-sampling-polyline');
  for (let i = 0; i < 80; i++) {
    const pt = Random.pointOnPolyline(polyline, polylineRng);
    if (pt !== undefined) d.point(ctx, pt, { color: '#4ade80', radius: 2.4 });
  }

  d.label(ctx, 'pointOnPath', { x: 412, y: 262 }, { color: '#a78bfa', font: '12px monospace' });
  d.label(ctx, '80pt · flattened length uniform', { x: 412, y: 278 }, { color: '#64748b', font: '11px monospace' });
  strokePath(ctx, pathCommands, '#334155');
  const pathRng = Random.createRng('random-boundary-sampling-path');
  for (let i = 0; i < 80; i++) {
    const pt = Random.pointOnPath(pathCommands, pathRng);
    if (pt !== undefined) d.point(ctx, pt, { color: '#a78bfa', radius: 2.4 });
  }
}

function drawPanelBackground(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
  ctx.fillStyle = '#262626';
  ctx.fillRect(x, y, width, height);
}

function strokeEllipseApprox(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radiusX: number,
  radiusY: number,
  color: string
): void {
  ctx.beginPath();
  for (let i = 0; i <= 64; i++) {
    const a = (Math.PI * 2 * i) / 64;
    const x = cx + Math.cos(a) * radiusX;
    const y = cy + Math.sin(a) * radiusY;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function strokePath(
  ctx: CanvasRenderingContext2D,
  commands: readonly (
    | { readonly kind: 'move'; readonly x: number; readonly y: number }
    | { readonly kind: 'line'; readonly x: number; readonly y: number }
    | {
        readonly kind: 'cubic';
        readonly x1: number;
        readonly y1: number;
        readonly x2: number;
        readonly y2: number;
        readonly x: number;
        readonly y: number;
      }
  )[],
  color: string
): void {
  ctx.beginPath();
  for (const command of commands) {
    if (command.kind === 'move') {
      ctx.moveTo(command.x, command.y);
    } else if (command.kind === 'line') {
      ctx.lineTo(command.x, command.y);
    } else {
      ctx.bezierCurveTo(command.x1, command.y1, command.x2, command.y2, command.x, command.y);
    }
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}
