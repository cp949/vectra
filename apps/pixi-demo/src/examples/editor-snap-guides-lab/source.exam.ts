/**
 * Editor Snap Guides Lab
 *
 * 점 handle을 드래그하면 vertex, segment, alignment guide 후보를 tolerance 안에서 비교하고,
 * hit가 없을 때 grid fallback으로 위치를 보정한다. 같은 후보 목록을 magneticSnap/snapPoint로도
 * 평가해 editor snapping dispatcher의 결과를 나란히 확인한다.
 *
 * - EditorGeometry.snapPointToGrid: grid fallback 좌표 계산
 * - EditorGeometry.snapPointToGuides: axis-aligned guide 후보 snap
 * - EditorGeometry.snapPointToVertices: object vertex 후보 snap
 * - EditorGeometry.snapPointToSegments: segment 위 가장 가까운 점으로 snap
 * - EditorGeometry.magneticSnap: point 후보에 대한 radius 기반 snap
 * - EditorGeometry.snapPoint: 후보 목록에서 가장 가까운 point snap
 * - EditorGeometry.alignmentGuidesInto: static bounds에서 alignment guide 산출
 */

import * as EditorGeometry from '@cp949/vectra/editor-geometry';

type Point = { x: number; y: number };
type Bounds = { min: Point; max: Point };
type Segment = { a: Point; b: Point };
type SnapSource = 'grid' | 'angle' | 'distance' | 'pixel' | 'segment' | 'vertex' | 'guide' | 'none';
type SnapResult = { snapped: boolean; x: number; y: number; distance: number; source: SnapSource };
type SnapCandidate = { x: number; y: number; source: SnapSource };
type Guide = { axis: 'x' | 'y'; value: number };
type AlignmentKind = 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom';
type AlignmentGuide = Guide & { kind: AlignmentKind; itemIndices: number[] };

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  const objects: Bounds[] = [
    { min: { x: 112, y: 118 }, max: { x: 232, y: 204 } },
    { min: { x: 404, y: 96 }, max: { x: 552, y: 184 } },
    { min: { x: 426, y: 284 }, max: { x: 610, y: 370 } },
  ];
  const handle: Point = { x: 356, y: 232 };
  const rawPointer: Point = { ...handle };
  const snappedPoint: Point = { ...handle };
  const magneticPoint: Point = { x: 0, y: 0 };
  const guides: AlignmentGuide[] = [];

  const GRID_SIZE = 40;
  const SNAP_TOLERANCE = 22;
  const HIT_RADIUS = 16;

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): Point => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const clampPoint = (point: Point): void => {
    point.x = Math.max(24, Math.min(size.width - 24, point.x));
    point.y = Math.max(64, Math.min(size.height - 24, point.y));
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = Math.hypot(p.x - handle.x, p.y - handle.y) <= HIT_RADIUS;
    if (grabbed) {
      rawPointer.x = p.x;
      rawPointer.y = p.y;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    rawPointer.x = p.x;
    rawPointer.y = p.y;
    clampPoint(rawPointer);
  };

  const onPointerUp = (): void => {
    grabbed = false;
    rawPointer.x = handle.x;
    rawPointer.y = handle.y;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const addBoundsGuides = (): void => {
    guides.length = 0;
    for (const kind of ['left', 'center-x', 'right', 'top', 'center-y', 'bottom'] as const) {
      const buffer: AlignmentGuide[] = [];
      EditorGeometry.alignmentGuidesInto(buffer, objects, kind);
      guides.push(...buffer);
    }
  };

  const getVertices = (): Point[] => {
    const vertices: Point[] = [];
    for (const box of objects) {
      vertices.push(
        { x: box.min.x, y: box.min.y },
        { x: box.max.x, y: box.min.y },
        { x: box.max.x, y: box.max.y },
        { x: box.min.x, y: box.max.y }
      );
    }
    return vertices;
  };

  const getSegments = (): Segment[] => {
    const segments: Segment[] = [];
    for (const box of objects) {
      const nw = { x: box.min.x, y: box.min.y };
      const ne = { x: box.max.x, y: box.min.y };
      const se = { x: box.max.x, y: box.max.y };
      const sw = { x: box.min.x, y: box.max.y };
      segments.push({ a: nw, b: ne }, { a: ne, b: se }, { a: se, b: sw }, { a: sw, b: nw });
    }
    return segments;
  };

  const chooseBest = (results: SnapResult[]): SnapResult | undefined => {
    let best: SnapResult | undefined;
    for (const result of results) {
      if (!result.snapped) continue;
      if (best === undefined || result.distance < best.distance) best = result;
    }
    return best;
  };

  const formatDistance = (result: SnapResult): string =>
    Number.isFinite(result.distance) ? result.distance.toFixed(1) : 'miss';

  const drawGrid = (): void => {
    for (let x = 40; x < size.width; x += GRID_SIZE) {
      g.moveTo(x, 64)
        .lineTo(x, size.height - 20)
        .stroke({ color: 0x334155, alpha: 0.45, width: 1 });
    }
    for (let y = 80; y < size.height; y += GRID_SIZE) {
      g.moveTo(24, y)
        .lineTo(size.width - 24, y)
        .stroke({ color: 0x334155, alpha: 0.45, width: 1 });
    }
  };

  const drawGuide = (guide: Guide, active: boolean): void => {
    const color = active ? 0xfacc15 : 0x64748b;
    const width = active ? 2 : 1;
    if (guide.axis === 'x') {
      g.moveTo(guide.value, 64)
        .lineTo(guide.value, size.height - 20)
        .stroke({ color, alpha: 0.75, width });
    } else {
      g.moveTo(24, guide.value)
        .lineTo(size.width - 24, guide.value)
        .stroke({ color, alpha: 0.75, width });
    }
  };

  const drawObjects = (): void => {
    for (const box of objects) {
      g.rect(box.min.x, box.min.y, box.max.x - box.min.x, box.max.y - box.min.y)
        .fill({ color: 0x38bdf8, alpha: 0.12 })
        .stroke({ color: 0x38bdf8, width: 2 });
    }
  };

  const drawVertices = (vertices: Point[], active: SnapResult): void => {
    for (const v of vertices) {
      const hit = active.source === 'vertex' && Math.hypot(active.x - v.x, active.y - v.y) < 0.001;
      g.circle(v.x, v.y, hit ? 6 : 4).fill({ color: hit ? 0xfacc15 : 0xe2e8f0, alpha: hit ? 1 : 0.8 });
    }
  };

  const drawHandle = (point: Point, color: number, radius: number): void => {
    g.circle(point.x, point.y, radius).fill({ color }).stroke({ color: 0x0f172a, width: 2 });
  };

  const isActiveGuide = (guide: Guide, snap: SnapResult): boolean =>
    snap.source === 'guide' && (guide.axis === 'x' ? snap.x === guide.value : snap.y === guide.value);

  const render = (): void => {
    addBoundsGuides();
    const vertices = getVertices();
    const segments = getSegments();
    const point = grabbed ? rawPointer : handle;

    const guideSnap = EditorGeometry.snapPointToGuides(point, guides, SNAP_TOLERANCE);
    const vertexSnap = EditorGeometry.snapPointToVertices(point, vertices, SNAP_TOLERANCE);
    const segmentSnap = EditorGeometry.snapPointToSegments(point, segments, SNAP_TOLERANCE);
    const gridSnap = EditorGeometry.snapPointToGrid(point, GRID_SIZE, { offset: { x: 0, y: 0 } });
    const bestSnap = chooseBest([vertexSnap, segmentSnap, guideSnap]) ?? gridSnap;

    const candidates: SnapCandidate[] = [
      ...vertices.map((v) => ({ x: v.x, y: v.y, source: 'vertex' as const })),
      ...guides.map((guide) => ({
        x: guide.axis === 'x' ? guide.value : point.x,
        y: guide.axis === 'y' ? guide.value : point.y,
        source: 'guide' as const,
      })),
      { x: gridSnap.x, y: gridSnap.y, source: 'grid' },
    ];
    const magneticSnap = EditorGeometry.magneticSnap(point, candidates, SNAP_TOLERANCE);
    const dispatcherSnap = EditorGeometry.snapPoint(point, candidates, { tolerance: SNAP_TOLERANCE });

    if (grabbed) {
      handle.x = bestSnap.x;
      handle.y = bestSnap.y;
    }
    snappedPoint.x = bestSnap.x;
    snappedPoint.y = bestSnap.y;
    magneticPoint.x = magneticSnap.x;
    magneticPoint.y = magneticSnap.y;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });
    drawGrid();
    for (const guide of guides) drawGuide(guide, isActiveGuide(guide, bestSnap));
    drawObjects();

    if (bestSnap.source === 'segment') {
      g.circle(bestSnap.x, bestSnap.y, 7).fill({ color: 0xfacc15 });
    }
    drawVertices(vertices, bestSnap);

    g.moveTo(point.x, point.y)
      .lineTo(snappedPoint.x, snappedPoint.y)
      .stroke({ color: 0xf97316, width: 2, alpha: 0.75 });
    drawHandle(point, 0xf97316, 5);
    drawHandle(snappedPoint, bestSnap.source === 'grid' ? 0x22c55e : 0xfacc15, 9);
    if (magneticSnap.snapped) drawHandle(magneticPoint, 0xa78bfa, 4);

    label.text =
      `drag point: (${point.x.toFixed(1)}, ${point.y.toFixed(1)})\n` +
      `best: ${bestSnap.source.padEnd(7)} (${bestSnap.x.toFixed(1)}, ${bestSnap.y.toFixed(1)}) d=${formatDistance(
        bestSnap
      )}\n` +
      `vertex=${formatDistance(vertexSnap)}  segment=${formatDistance(segmentSnap)}  guide=${formatDistance(
        guideSnap
      )}  grid=${formatDistance(gridSnap)}\n` +
      `magnetic=${magneticSnap.source}:${formatDistance(magneticSnap)}  snapPoint=${dispatcherSnap.source}:${formatDistance(
        dispatcherSnap
      )}`;
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
