/**
 * Infinite Line Diagnostics Lab
 *
 * 두 무한선의 origin/direction handle과 probe point를 드래그하면 projection foot,
 * signed distance, side, 단일 교점, parallel/collinear/degenerate 상태가 갱신된다.
 *
 * - InfiniteLines.fromSegment / fromSegmentInto: handle segment를 infinite-line으로 변환
 * - InfiniteLines.projectPoint / projectPointInto: probe point의 수선 foot 계산
 * - InfiniteLines.signedDistanceToPoint / side: probe point의 방향성 있는 거리와 side 판정
 * - InfiniteLines.singleIntersection / singleIntersectionInto: 두 infinite-line의 단일 교점 계산
 * - InfiniteLines.reverse / reverseInto: 같은 직선의 반대 방향 preview 계산
 */

import * as InfiniteLines from '@cp949/vectra/infinite-line';

type XY = { x: number; y: number };
type Handle = XY & { role: string; color: number };
type Segment = { a: Handle; b: Handle };
type LineShape = ReturnType<typeof InfiniteLines.createInfiniteLine>;

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

  const lineAHandles: Segment = {
    a: { x: 105, y: 315, role: 'A origin', color: 0x38bdf8 },
    b: { x: 430, y: 140, role: 'A direction', color: 0x38bdf8 },
  };
  const lineBHandles: Segment = {
    a: { x: 135, y: 125, role: 'B origin', color: 0xfb7185 },
    b: { x: 615, y: 355, role: 'B direction', color: 0xfb7185 },
  };
  const probe: Handle = { x: 560, y: 250, role: 'probe', color: 0xfacc15 };

  const lineB = InfiniteLines.createInfiniteLine();
  const lineACopy = InfiniteLines.createInfiniteLine();
  const reversedA = InfiniteLines.createInfiniteLine();
  const projectionInto = { x: 0, y: 0 };
  const intersectionInto = { x: 0, y: 0 };
  const lineStart = { x: 0, y: 0 };
  const lineEnd = { x: 0, y: 0 };
  const directionInto = { x: 0, y: 0 };
  const originInto = { x: 0, y: 0 };

  const HIT_RADIUS = 18;
  let grabbed: Handle | undefined;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const clampToStage = (point: XY): void => {
    point.x = Math.max(28, Math.min(size.width - 28, point.x));
    point.y = Math.max(60, Math.min(size.height - 28, point.y));
  };

  const distance = (a: XY, b: XY): number => Math.hypot(a.x - b.x, a.y - b.y);

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    const handles = [lineAHandles.a, lineAHandles.b, lineBHandles.a, lineBHandles.b, probe];
    grabbed = handles.find((handle) => distance(handle, p) <= HIT_RADIUS);
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    grabbed.x = p.x;
    grabbed.y = p.y;
    clampToStage(grabbed);
  };

  const onPointerUp = (): void => {
    grabbed = undefined;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawHandle = (handle: Handle): void => {
    g.circle(handle.x, handle.y, grabbed === handle ? 9 : 7).fill({ color: handle.color });
    g.circle(handle.x, handle.y, HIT_RADIUS).stroke({ color: handle.color, width: 1, alpha: 0.16 });
  };

  const drawHandleSegment = (segment: Segment): void => {
    g.moveTo(segment.a.x, segment.a.y).lineTo(segment.b.x, segment.b.y).stroke({
      color: segment.a.color,
      width: 1,
      alpha: 0.45,
    });
    drawHandle(segment.a);
    drawHandle(segment.b);
  };

  const drawInfiniteLine = (line: LineShape, color: number, width = 2): void => {
    InfiniteLines.pointAtTInto(lineStart, line, -1.2);
    InfiniteLines.pointAtTInto(lineEnd, line, 1.9);
    g.moveTo(lineStart.x, lineStart.y).lineTo(lineEnd.x, lineEnd.y).stroke({ color, width, alpha: 0.78 });
  };

  const sideLabel = (value: -1 | 0 | 1): string => {
    if (value > 0) return 'left';
    if (value < 0) return 'right';
    return 'on-line';
  };

  const render = (): void => {
    const lineA = InfiniteLines.fromSegment(lineAHandles);
    InfiniteLines.fromSegmentInto(lineB, lineBHandles);
    InfiniteLines.copyInto(lineACopy, lineA);
    InfiniteLines.reverseInto(reversedA, lineACopy);
    const reversedPreview = InfiniteLines.reverse(lineB);

    const projection = InfiniteLines.projectPoint(lineACopy, probe);
    InfiniteLines.projectPointInto(projectionInto, lineACopy, probe);
    const t = InfiniteLines.projectionT(lineACopy, probe);
    const signedDistance = InfiniteLines.signedDistanceToPoint(lineACopy, probe);
    const distanceSq = InfiniteLines.distanceToPointSq(lineACopy, probe);
    const side = InfiniteLines.side(lineACopy, probe, 0.5);
    const onLine = InfiniteLines.containsPoint(lineACopy, projectionInto, 0.5);
    const hasIntersection = InfiniteLines.singleIntersectionInto(intersectionInto, lineACopy, lineB);
    const intersection = InfiniteLines.singleIntersection(lineACopy, lineB);
    const parallel = InfiniteLines.isParallel(lineACopy, lineB);
    const collinear = InfiniteLines.isCollinear(lineACopy, lineB);
    const aDegenerate = InfiniteLines.isDegenerate(lineACopy, 0.5);
    const bDegenerate = InfiniteLines.isDegenerate(lineB, 0.5);
    const aDirection = InfiniteLines.direction(lineACopy);
    InfiniteLines.directionInto(directionInto, lineACopy);
    const aOrigin = InfiniteLines.origin(lineACopy);
    InfiniteLines.originInto(originInto, lineACopy);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    drawInfiniteLine(lineACopy, 0x38bdf8, 3);
    drawInfiniteLine(lineB, 0xfb7185, 3);

    InfiniteLines.pointAtTInto(lineStart, reversedA, 0.32);
    g.moveTo(originInto.x, originInto.y).lineTo(lineStart.x, lineStart.y).stroke({
      color: 0xa78bfa,
      width: 2,
      alpha: 0.7,
    });
    InfiniteLines.pointAtTInto(lineEnd, reversedPreview, 0.22);
    g.moveTo(lineB.origin.x, lineB.origin.y).lineTo(lineEnd.x, lineEnd.y).stroke({
      color: 0xf9a8d4,
      width: 2,
      alpha: 0.55,
    });

    drawHandleSegment(lineAHandles);
    drawHandleSegment(lineBHandles);
    drawHandle(probe);

    g.moveTo(probe.x, probe.y).lineTo(projection.x, projection.y).stroke({ color: 0xfacc15, width: 2 });
    g.circle(projectionInto.x, projectionInto.y, onLine ? 6 : 4).fill({ color: 0xfacc15 });

    if (hasIntersection && intersection) {
      g.circle(intersectionInto.x, intersectionInto.y, 12).fill({ color: 0x4ade80, alpha: 0.2 });
      g.circle(intersection.x, intersection.y, 6).fill({ color: 0x4ade80 });
    }

    InfiniteLines.pointAtTInto(lineStart, lineACopy, t);
    g.circle(lineStart.x, lineStart.y, 10).stroke({ color: 0xfacc15, width: 1, alpha: 0.55 });

    const status = hasIntersection ? 'single intersection' : parallel ? (collinear ? 'collinear' : 'parallel') : 'none';
    label.text =
      `A origin=(${aOrigin.x.toFixed(0)}, ${aOrigin.y.toFixed(0)}) dir=(${aDirection.x.toFixed(0)}, ${aDirection.y.toFixed(
        0
      )})` +
      ` | directionInto=(${directionInto.x.toFixed(0)}, ${directionInto.y.toFixed(0)})` +
      `\nprobe t=${t.toFixed(2)} side=${sideLabel(side)} signed=${signedDistance.toFixed(1)}px distSq=${distanceSq.toFixed(
        1
      )}` +
      `\nintersection=${status} | A degenerate=${aDegenerate} B degenerate=${bDegenerate} | drag line/probe handles`;
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
