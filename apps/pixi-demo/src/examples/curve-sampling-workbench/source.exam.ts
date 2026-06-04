/**
 * Curve Sampling Workbench
 *
 * path editor에서 필요한 flatten tolerance, arclength scrub, segment ruler, polyline walker, proximity
 * probe를 한 작업판에서 비교한다.
 */

import * as Curves from '@cp949/vectra/curve';
import * as Paths from '@cp949/vectra/path';
import * as Polylines from '@cp949/vectra/polyline';
import * as Segmentx from '@cp949/vectra/segment';

type XY = { x: number; y: number };

const BG = 0x0f172a;
const LABEL = 0xe2e8f0;
const GUIDE = 0x64748b;
const RESULT = 0x4ade80;
const HANDLE = 0xf97316;
export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;
  const g = new PIXI.Graphics();
  app.stage.addChild(g);
  const label = new PIXI.Text({ text: '', style: { fill: LABEL, fontFamily: 'monospace', fontSize: 13 } });
  label.position.set(16, 14);
  app.stage.addChild(label);

  const arc = {
    cx: 180,
    cy: 128,
    rx: 82,
    ry: 82,
    xRotation: 0,
    startAngle: Math.PI,
    endAngle: 2 * Math.PI,
    sweep: true,
  };
  const segment = { a: { x: 104, y: 236 }, b: { x: 315, y: 194 } };
  const polyline: XY[] = [
    { x: 88, y: 330 },
    { x: 170, y: 285 },
    { x: 245, y: 350 },
    { x: 360, y: 292 },
  ];
  const commands = [
    { kind: 'move', x: 420, y: 390 },
    { kind: 'line', x: 505, y: 330 },
    { kind: 'cubic', x1: 560, y1: 230, x2: 660, y2: 440, x: 705, y: 315 },
  ] satisfies Paths.PathCommand[];
  const probe: XY = { x: 620, y: 390 };
  const flatOut: XY[] = [];
  const arcMarker: XY = { x: 0, y: 0 };
  const segmentMarker: XY = { x: 0, y: 0 };
  const polyMarker: XY = { x: 0, y: 0 };
  const tangent = Polylines.tangents(polyline);
  let knobX = 590;
  let dragTarget: 'knob' | 'probe' | null = null;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    if (Math.hypot(p.x - knobX, p.y - 80) <= 22) {
      dragTarget = 'knob';
    } else if (Math.hypot(p.x - probe.x, p.y - probe.y) <= 22) {
      dragTarget = 'probe';
    }
  };
  const onPointerMove = (e: PointerEvent): void => {
    if (dragTarget === null) return;
    const p = getCanvasXY(e);
    if (dragTarget === 'knob') {
      knobX = Math.max(430, Math.min(720, p.x));
    } else {
      probe.x = Math.max(390, Math.min(size.width - 16, p.x));
      probe.y = Math.max(250, Math.min(size.height - 16, p.y));
    }
  };
  const onPointerUp = (): void => {
    dragTarget = null;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawPolyline = (points: readonly XY[], color: number, width = 2): void => {
    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) g.lineTo(points[i].x, points[i].y);
    g.stroke({ color, width });
  };

  const render = (): void => {
    const t = (knobX - 430) / 290;
    const flatness = 1 + t * 60;
    Curves.arcFlattenInto(flatOut, arc, { flatness });
    const arcT = Curves.arcTAtLength(arc, Curves.arcLengthAtT(arc, 1) * t);
    Curves.arcPointAtTInto(arcMarker, arc, arcT);
    Segmentx.pointAtLengthInto(segmentMarker, segment, Segmentx.length(segment) * t);
    Polylines.pointAtLengthRatioInto(polyMarker, polyline, t);
    const nearest = Paths.closestPoint(commands, probe);
    const pathDistance = Paths.distanceToPoint(commands, probe);
    const polyDistance = Polylines.distanceToPoint(polyline, probe);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG });
    drawPolyline(flatOut, RESULT, 2);
    g.circle(arcMarker.x, arcMarker.y, 6).fill({ color: HANDLE });
    g.moveTo(segment.a.x, segment.a.y).lineTo(segment.b.x, segment.b.y).stroke({ color: GUIDE, width: 3 });
    g.circle(segmentMarker.x, segmentMarker.y, 6).fill({ color: RESULT });
    drawPolyline(polyline, GUIDE, 3);
    g.circle(polyMarker.x, polyMarker.y, 6).fill({ color: RESULT });
    for (let i = 0; i < polyline.length; i++) {
      g.moveTo(polyline[i].x, polyline[i].y)
        .lineTo(polyline[i].x + tangent[i].x * 24, polyline[i].y + tangent[i].y * 24)
        .stroke({ color: 0xfbbf24, width: 2 });
    }
    g.moveTo(commands[0].x, commands[0].y).lineTo(commands[1].x, commands[1].y);
    g.bezierCurveTo(560, 230, 660, 440, 705, 315).stroke({ color: GUIDE, width: 3 });
    if (nearest) {
      g.moveTo(probe.x, probe.y).lineTo(nearest.x, nearest.y).stroke({ color: 0x38bdf8, width: 2 });
      g.circle(nearest.x, nearest.y, 6).fill({ color: 0x38bdf8 });
    }
    g.circle(probe.x, probe.y, dragTarget === 'probe' ? 8 : 6).fill({ color: HANDLE });
    g.circle(knobX, 80, dragTarget === 'knob' ? 8 : 6).fill({ color: HANDLE });
    g.moveTo(430, 80).lineTo(720, 80).stroke({ color: GUIDE, width: 2 });
    label.text = `Curve Sampling Workbench\nflatness ${flatness.toFixed(1)}  t ${t.toFixed(2)}  path d ${pathDistance.toFixed(1)}  poly d ${polyDistance.toFixed(1)}`;
  };

  app.ticker.add(render);
  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    g.destroy();
    label.destroy();
  };
}
