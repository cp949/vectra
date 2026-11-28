/**
 * Triangle Solver Excircles Lab
 *
 * 원본 삼각형의 꼭짓점을 드래그하면 SSS로 계산한 내각과 ASA로 재구성한 preview 삼각형이
 * 실시간으로 바뀐다. 원본 삼각형 바깥에는 방심과 방접원을 표시하고, 안쪽에는 medial
 * triangle을 겹쳐 side/vertex 파생 helper가 어떤 geometry를 읽는지 보여준다.
 *
 * - Triangles.solveSss / solveSssInto: 세 변 길이에서 원본 삼각형의 내각 계산
 * - Triangles.solveAsa / solveAsaInto: 두 내각과 끼인 변 AB로 preview 삼각형 재구성
 * - Triangles.excenters / excentersInto: 방접원 중심 marker 계산
 * - Triangles.excircles / excirclesInto: 세 방접원 계산
 * - Triangles.interiorAngles / interiorAnglesInto: 실제 좌표 기반 내각 diagnostics
 * - Triangles.sideAt / sideAtInto: opposite side 추출
 * - Triangles.medialTriangle / medialTriangleInto: 세 변 중점 삼각형 계산
 */

import * as Triangles from '@cp949/vectra/triangle';

type Point = { x: number; y: number };
type MutableTriangle = { a: Point; b: Point; c: Point };
type TriangleAngleBuffer = { a: number; b: number; c: number };
type TriangleSideBuffer = { a: number; b: number; c: number };

const SOURCE_COLOR = 0xf8fafc;
const PREVIEW_COLOR = 0x38bdf8;
const MEDIAL_COLOR = 0xa78bfa;
const EXCIRCLE_COLORS = [0xfb7185, 0xfacc15, 0x4ade80] as const;

const distance = (a: Point, b: Point): number => Math.hypot(b.x - a.x, b.y - a.y);
const radToDeg = (radian: number): number => (radian * 180) / Math.PI;

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 12 },
  });
  label.position.set(16, 14);
  app.stage.addChild(label);

  const handles: MutableTriangle = {
    a: { x: 135, y: 320 },
    b: { x: 345, y: 320 },
    c: { x: 220, y: 105 },
  };
  const vertices = [handles.a, handles.b, handles.c];

  const sssAngles: TriangleAngleBuffer = { a: 0, b: 0, c: 0 };
  const asaSides: TriangleSideBuffer = { a: 0, b: 0, c: 0 };
  const rawAngles: number[] = [];
  const rawAnglesBuffer: number[] = [];
  const excentersBuffer: Point[] = [];
  const excirclesBuffer: ReturnType<typeof Triangles.excircles> = [];
  const medialBuffer = { x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 };
  const sideBuffer = { x1: 0, y1: 0, x2: 0, y2: 0 };
  const vertexBuffer: Point = { x: 0, y: 0 };

  const VERTEX_RADIUS = 8;
  const HIT_TOLERANCE = 18;
  const previewOrigin = { x: 450, y: 322 };

  let grabbed: Point | undefined;

  const getCanvasXY = (e: PointerEvent): Point => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const point = getCanvasXY(e);
    for (const vertex of vertices) {
      if (distance(vertex, point) <= HIT_TOLERANCE) {
        grabbed = vertex;
        return;
      }
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const point = getCanvasXY(e);
    grabbed.x = Math.max(40, Math.min(380, point.x));
    grabbed.y = Math.max(72, Math.min(size.height - 42, point.y));
  };

  const onPointerUp = (): void => {
    grabbed = undefined;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawTriangle = (
    target: Parameters<typeof Triangles.area>[0],
    color: number,
    width: number,
    alpha = 1
  ): void => {
    g.poly([target.x1, target.y1, target.x2, target.y2, target.x3, target.y3]).stroke({
      color,
      width,
      alpha,
    });
  };

  const drawPoint = (point: Point, color: number, radius = 5): void => {
    g.circle(point.x, point.y, radius).fill(color);
  };

  const buildTriangleFromSides = (sideA: number, sideB: number, sideC: number, origin: Point): MutableTriangle => {
    const scale = Math.min(1, 230 / Math.max(sideA, sideB, sideC));
    const a = sideA * scale;
    const b = sideB * scale;
    const c = sideC * scale;
    const cx = (b * b + c * c - a * a) / (2 * c);
    const cy = -Math.sqrt(Math.max(0, b * b - cx * cx));
    return {
      a: { x: origin.x, y: origin.y },
      b: { x: origin.x + c, y: origin.y },
      c: { x: origin.x + cx, y: origin.y + cy },
    };
  };

  const clampCircleRadius = (radius: number): number => Math.min(520, Math.max(0, radius));

  const render = (): void => {
    const triangle = {
      x1: handles.a.x,
      y1: handles.a.y,
      x2: handles.b.x,
      y2: handles.b.y,
      x3: handles.c.x,
      y3: handles.c.y,
    };
    const sideA = distance(handles.b, handles.c);
    const sideB = distance(handles.c, handles.a);
    const sideC = distance(handles.a, handles.b);

    const sss = Triangles.solveSss(sideA, sideB, sideC);
    const hasSSSInto = Triangles.solveSssInto(sssAngles, sideA, sideB, sideC) !== false;

    rawAngles.length = 0;
    rawAngles.push(...Triangles.interiorAngles(triangle));
    Triangles.interiorAnglesInto(rawAnglesBuffer, triangle);

    const asa = sss ? Triangles.solveAsa(sss.a, sideC, sss.b) : undefined;
    const hasASAInto = sss ? Triangles.solveAsaInto(asaSides, sss.a, sideC, sss.b) !== false : false;
    const preview = asa ? buildTriangleFromSides(asa.a, asa.b, asa.c, previewOrigin) : undefined;

    const medial = Triangles.medialTriangle(triangle);
    Triangles.medialTriangleInto(medialBuffer, triangle);

    const excenters = Triangles.excenters(triangle);
    Triangles.excentersInto(excentersBuffer, triangle);
    const excircles = Triangles.excircles(triangle);
    Triangles.excirclesInto(excirclesBuffer, triangle);

    const sideFromCompanion = Triangles.sideAt(triangle, 0);
    const hasSideInto = Triangles.sideAtInto(sideBuffer, triangle, 0);
    Triangles.pointAtIndexInto(vertexBuffer, triangle, 2);
    const vertexFromCompanion = Triangles.pointAtIndex(triangle, 2);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    for (let i = 0; i < excircles.length; i++) {
      const circle = excircles[i];
      if (!circle) continue;
      g.circle(circle.cx, circle.cy, clampCircleRadius(circle.r)).stroke({
        color: EXCIRCLE_COLORS[i] ?? 0x94a3b8,
        width: 1,
        alpha: 0.32,
      });
    }

    drawTriangle(triangle, SOURCE_COLOR, 3);
    drawTriangle(medial, MEDIAL_COLOR, 2, 0.75);
    drawTriangle(medialBuffer, MEDIAL_COLOR, 1, 0.35);

    if (hasSideInto) {
      g.moveTo(sideBuffer.x1, sideBuffer.y1).lineTo(sideBuffer.x2, sideBuffer.y2).stroke({
        color: 0xfb7185,
        width: 4,
        alpha: 0.65,
      });
    }
    if (sideFromCompanion) {
      g.moveTo(sideFromCompanion.x1, sideFromCompanion.y1).lineTo(sideFromCompanion.x2, sideFromCompanion.y2).stroke({
        color: 0xfacc15,
        width: 1.5,
      });
    }

    for (let i = 0; i < excenters.length; i++) {
      const point = excenters[i];
      if (!point) continue;
      drawPoint(point, EXCIRCLE_COLORS[i] ?? 0x94a3b8, 5);
    }
    for (const vertex of vertices) drawPoint(vertex, vertex === grabbed ? 0xfacc15 : 0xf472b6, VERTEX_RADIUS);
    drawPoint(vertexBuffer, 0x22d3ee, 4);
    if (vertexFromCompanion) drawPoint(vertexFromCompanion, 0xffffff, 2.5);

    if (preview) {
      drawTriangle(
        { x1: preview.a.x, y1: preview.a.y, x2: preview.b.x, y2: preview.b.y, x3: preview.c.x, y3: preview.c.y },
        PREVIEW_COLOR,
        3
      );
      drawPoint(preview.a, PREVIEW_COLOR, 5);
      drawPoint(preview.b, PREVIEW_COLOR, 5);
      drawPoint(preview.c, PREVIEW_COLOR, 5);
    }

    const sssText = hasSSSInto
      ? `SSS angles ${radToDeg(sssAngles.a).toFixed(1)} / ${radToDeg(sssAngles.b).toFixed(1)} / ${radToDeg(sssAngles.c).toFixed(1)} deg`
      : 'SSS invalid triangle';
    const asaText =
      hasASAInto && asa
        ? `ASA sides ${asaSides.a.toFixed(1)} / ${asaSides.b.toFixed(1)} / ${asaSides.c.toFixed(1)}`
        : 'ASA preview unavailable';
    const rawText =
      rawAngles.length === 3 && rawAnglesBuffer.length === 3
        ? `raw interior ${rawAngles.map((angle) => radToDeg(angle).toFixed(1)).join(' / ')} deg` +
          `  buffer ${rawAnglesBuffer.map((angle) => radToDeg(angle).toFixed(1)).join(' / ')}`
        : 'raw interior unavailable';
    const excircleText = `excenters ${excenters.length}/${excentersBuffer.length}  excircles ${excircles.length}/${excirclesBuffer.length}`;

    label.text =
      'drag A/B/C on the left   blue = ASA reconstruction   purple = medial triangle\n' +
      `sides a/b/c ${sideA.toFixed(1)} / ${sideB.toFixed(1)} / ${sideC.toFixed(1)}\n` +
      `${sssText}\n${asaText}\n${rawText}\n${excircleText}`;
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
