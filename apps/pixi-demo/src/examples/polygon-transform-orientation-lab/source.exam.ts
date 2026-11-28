/**
 * Polygon Transform Orientation Lab
 *
 * 파란 source polygon의 꼭짓점과 보라 transform 핸들을 드래그하면 오른쪽 복제 polygon의 이동,
 * pivot 기준 회전/스케일, mirror 후 reverse winding preview가 함께 갱신된다. edge 방향 marker와
 * signed area 진단으로 point order가 transform과 reverse에서 어떻게 바뀌는지 비교한다.
 *
 * - Polygons.translatePoints: source polygon을 오른쪽 작업 영역으로 복제
 * - Polygons.transformPoints: pivot 기준 affine transform과 mirror preview 계산
 * - Polygons.reversePoints: mirror로 뒤집힌 winding을 다시 반전한 preview 계산
 * - Polygons.signedArea: point order와 winding 방향을 나타내는 signed area 계산
 * - Polygons.edgeAtInto: 현재 polygon의 닫힌 edge 방향 marker 계산
 * - Matrix.rotationAroundPoint / scaleAroundPoint: polygon point list에 적용할 affine matrix 생성
 */

import * as Matrix from '@cp949/vectra/matrix';
import * as Polygons from '@cp949/vectra/polygon';

type Point = { x: number; y: number };

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 14);
  app.stage.addChild(label);

  const source = Polygons.polygonFrom([110, 150, 245, 105, 320, 205, 255, 325, 125, 285]);
  const pivot: Point = { x: 570, y: 235 };
  const handle: Point = { x: 680, y: 140 };
  const offset: Point = { x: 330, y: 0 };

  const edge = { x1: 0, y1: 0, x2: 0, y2: 0 };
  const HIT_RADIUS = 18;
  const VERTEX_RADIUS = 8;

  let grabbed: number | undefined;

  const getCanvasXY = (e: PointerEvent): Point => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const clampPoint = (point: Point, minX: number, maxX: number): void => {
    point.x = Math.max(minX, Math.min(maxX, point.x));
    point.y = Math.max(58, Math.min(size.height - 28, point.y));
  };

  const onPointerDown = (e: PointerEvent): void => {
    const pointer = getCanvasXY(e);
    if (Math.hypot(handle.x - pointer.x, handle.y - pointer.y) <= HIT_RADIUS) {
      grabbed = -1;
      return;
    }

    for (let i = 0; i < source.length; i += 2) {
      if (Math.hypot(source[i] - pointer.x, source[i + 1] - pointer.y) <= HIT_RADIUS) {
        grabbed = i;
        return;
      }
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (grabbed === undefined) return;
    const pointer = getCanvasXY(e);
    if (grabbed === -1) {
      clampPoint(pointer, pivot.x + 36, size.width - 36);
      handle.x = pointer.x;
      handle.y = pointer.y;
    } else {
      clampPoint(pointer, 48, 340);
      source[grabbed] = pointer.x;
      source[grabbed + 1] = pointer.y;
    }
  };

  const onPointerUp = (): void => {
    grabbed = undefined;
  };

  const drawPolygon = (points: number[], stroke: number, fill: number, alpha: number, width = 2.5): void => {
    g.poly(points).fill({ color: fill, alpha }).stroke({ color: stroke, width });
  };

  const drawHandles = (points: readonly number[], color: number): void => {
    for (let i = 0; i < points.length; i += 2) {
      g.circle(points[i], points[i + 1], VERTEX_RADIUS).fill({ color });
    }
  };

  const drawEdgeDirection = (polygon: readonly number[], color: number): void => {
    const count = Polygons.edgeCount(polygon);
    if (count === 0) return;
    const index = Math.floor((app.ticker.lastTime / 700) % count);
    if (!Polygons.edgeAtInto(edge, polygon, index)) return;
    const mid = Polygons.pointAtIndex(polygon, index);
    if (!mid) return;

    const dx = edge.x2 - edge.x1;
    const dy = edge.y2 - edge.y1;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const markerX = edge.x1 + dx * 0.62;
    const markerY = edge.y1 + dy * 0.62;

    g.moveTo(edge.x1, edge.y1).lineTo(edge.x2, edge.y2).stroke({ color, width: 3 });
    g.moveTo(markerX, markerY)
      .lineTo(markerX - ux * 14 - uy * 6, markerY - uy * 14 + ux * 6)
      .lineTo(markerX - ux * 14 + uy * 6, markerY - uy * 14 - ux * 6)
      .lineTo(markerX, markerY)
      .fill({ color, alpha: 0.9 });
    g.circle(mid.x, mid.y, 3).fill({ color });
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const render = (): void => {
    const base = Polygons.translatePoints(source, offset);
    const dx = handle.x - pivot.x;
    const dy = handle.y - pivot.y;
    const angle = Math.atan2(dy, dx);
    const scale = Math.max(0.45, Math.min(1.7, Math.hypot(dx, dy) / 130));
    const rotation = Matrix.rotationAroundPoint(pivot, angle);
    const scaling = Matrix.scaleAroundPoint(pivot, { x: scale, y: scale });
    const transform = Matrix.multiply(rotation, scaling);
    const transformed = Polygons.transformPoints(base, transform);
    const mirror = Matrix.scaleAroundPoint(pivot, { x: -1, y: 1 });
    const mirrored = Polygons.transformPoints(transformed, mirror);
    const reversedMirror = Polygons.reversePoints(mirrored);

    const sourceArea = Polygons.signedArea(source);
    const transformedArea = Polygons.signedArea(transformed);
    const mirroredArea = Polygons.signedArea(mirrored);
    const restoredArea = Polygons.signedArea(reversedMirror);
    const winding = Polygons.isCounterClockwise(source) ? 'ccw' : Polygons.isClockwise(source) ? 'cw' : 'flat';

    g.clear();

    g.moveTo(390, 56)
      .lineTo(390, size.height - 24)
      .stroke({ color: 0x334155, width: 1 });

    drawPolygon(source, 0x38bdf8, 0x0f172a, 0.48);
    drawHandles(source, 0x38bdf8);
    drawEdgeDirection(source, 0xfacc15);

    drawPolygon(base, 0x64748b, 0x334155, 0.14, 1.5);
    drawPolygon(transformed, 0xa78bfa, 0x4c1d95, 0.2);
    drawPolygon(mirrored, 0xfb7185, 0x7f1d1d, 0.12, 1.5);
    drawPolygon(reversedMirror, 0x4ade80, 0x14532d, 0.16, 2);
    drawEdgeDirection(transformed, 0xfacc15);
    drawEdgeDirection(mirrored, 0xfb7185);
    drawEdgeDirection(reversedMirror, 0x4ade80);

    g.circle(pivot.x, pivot.y, 6).fill({ color: 0xe2e8f0 });
    g.moveTo(pivot.x, pivot.y).lineTo(handle.x, handle.y).stroke({ color: 0xa78bfa, width: 2 });
    g.circle(handle.x, handle.y, 10).fill({ color: 0xa78bfa });

    label.text = [
      `source vertices=${Polygons.pointCount(source)} edges=${Polygons.edgeCount(source)} winding=${winding}`,
      `area=${sourceArea.toFixed(1)} perimeter=${Polygons.perimeter(source).toFixed(1)}`,
      `transform area=${transformedArea.toFixed(1)} mirror=${mirroredArea.toFixed(1)} reverse=${restoredArea.toFixed(1)}`,
    ].join('\n');
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
