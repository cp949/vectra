/**
 * Segment Angle Builder
 *
 * 방향 handle을 드래그하면 시작점, angle, length로 만든 segment와 midpoint anchor에 정렬한 segment가
 * 함께 갱신된다. label은 angle, length, midpoint error만 표시한다.
 *
 * - Segments.fromAngle: 시작점, angle, length에서 source segment 생성
 * - Segments.fromAngleInto: 같은 계산을 재사용 buffer에 기록
 * - Segments.centerOn: source segment의 midpoint를 anchor에 맞춘 preview 생성
 * - Segments.centerOnInto: 같은 정렬 계산을 재사용 buffer에 기록
 * - Segments.midpoint: 정렬 결과가 anchor에 맞는지 확인
 */

import * as Segments from '@cp949/vectra/segment';

type XY = { x: number; y: number };
type Segment = { a: XY; b: XY };

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 14 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  const origin: XY = { x: 160, y: size.height / 2 };
  const anchor: XY = { x: size.width / 2 + 110, y: size.height / 2 };
  const directionHandle: XY = { x: origin.x + 220, y: origin.y - 80 };
  const sourceBuffer: Segment = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
  const centeredBuffer: Segment = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };

  const HIT_TOLERANCE = 20;
  let dragging = false;

  const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
  const distance = (a: XY, b: XY): number => Math.hypot(a.x - b.x, a.y - b.y);

  /** canvas pointer 이벤트에서 canvas 상대 좌표를 반환한다. */
  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    dragging = distance(getCanvasXY(e), directionHandle) <= HIT_TOLERANCE;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const p = getCanvasXY(e);
    directionHandle.x = clamp(p.x, 32, size.width - 32);
    directionHandle.y = clamp(p.y, 56, size.height - 32);
  };

  const onPointerUp = (): void => {
    dragging = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawSegment = (line: Segment, color: number, width: number): void => {
    g.moveTo(line.a.x, line.a.y).lineTo(line.b.x, line.b.y).stroke({ color, width });
  };

  const drawHandle = (point: XY, color: number, radius = 8): void => {
    g.circle(point.x, point.y, radius).fill(color);
  };

  const render = (): void => {
    const dx = directionHandle.x - origin.x;
    const dy = directionHandle.y - origin.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    const sourceSegment = Segments.fromAngle(origin, angle, length);
    Segments.fromAngleInto(sourceBuffer, origin, angle, length);
    const centeredSegment = Segments.centerOn(sourceSegment, anchor);
    Segments.centerOnInto(centeredBuffer, sourceBuffer, anchor);
    const midpoint = Segments.midpoint(centeredBuffer);
    const midpointError = distance(midpoint, anchor);

    g.clear();

    g.moveTo(32, origin.y)
      .lineTo(size.width - 32, origin.y)
      .stroke({ color: 0x1e293b, width: 1 });

    g.moveTo(origin.x, origin.y).lineTo(directionHandle.x, directionHandle.y).stroke({
      color: 0x64748b,
      width: 1.5,
    });

    drawSegment(sourceSegment, 0x94a3b8, 2);
    drawSegment(centeredSegment, 0x38bdf8, 4);

    g.circle(anchor.x, anchor.y, 13).stroke({ color: 0xfacc15, width: 2 });
    drawHandle(origin, 0xe2e8f0, 7);
    drawHandle(directionHandle, dragging ? 0xf472b6 : 0xf97316);
    drawHandle(midpoint, 0xfacc15, 5);

    label.text = [
      `angle: ${Math.round((angle * 180) / Math.PI)}deg`,
      `length: ${length.toFixed(1)}px`,
      `midpoint error: ${midpointError.toFixed(4)}px`,
    ].join('\n');
  };

  app.ticker.add(render);
  render();

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    label.destroy();
    g.destroy();
  };
}
