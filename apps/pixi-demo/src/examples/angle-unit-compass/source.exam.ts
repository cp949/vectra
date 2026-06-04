/**
 * Angle Unit Compass
 *
 * compass pointer와 sector boundary handle을 드래그하면 heading의 degree/radian/turn 변환,
 * signed/positive wrap, sector 포함 여부, snap target 근접 여부, sin/cos 좌표가 갱신된다.
 *
 * - Angles.fromVector: 중심에서 pointer까지의 heading 계산
 * - Angles.radToDeg / radToTurn / degToRad / degToTurn / turnToRad / turnToDeg: 같은 각도의 단위 변환 비교
 * - Angles.wrapRadians / wrapRadiansPositive / wrapDegrees / wrapDegreesPositive: signed/positive wrap label 계산
 * - Angles.isAngleBetween: sector start/end 사이에 heading이 들어오는지 판정
 * - Angles.nearAngle: heading이 snap target에 가까운지 판정
 * - Angles.sinCos / sinCosInto: unit circle marker와 sin/cos projection 계산
 */

import * as Angles from '@cp949/vectra/angle';

type Point = { x: number; y: number };

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  const center: Point = { x: 360, y: 242 };
  const radius = 132;
  const pointer: Point = { x: center.x + 105, y: center.y - 64 };
  const sectorStart: Point = { x: center.x + 22, y: center.y - radius };
  const sectorEnd: Point = { x: center.x + 118, y: center.y + 60 };
  const snapTarget = Angles.degToRad(45);
  const sinCosBuffer = { sin: 0, cos: 0 };

  const HIT_RADIUS = 18;
  const SNAP_EPSILON = Angles.degToRad(8);
  let grabbed: Point | undefined;

  const canvas = app.canvas as HTMLCanvasElement;

  const getCanvasXY = (e: PointerEvent): Point => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);

  const angleOf = (point: Point): number => Angles.fromVector({ x: point.x - center.x, y: point.y - center.y });

  const pointOnCircle = (angle: number, r = radius): Point => {
    const unit = Angles.sinCos(angle);
    return { x: center.x + unit.cos * r, y: center.y + unit.sin * r };
  };

  const moveRadialHandle = (handle: Point, pointerPosition: Point, r = radius): void => {
    const angle = angleOf(pointerPosition);
    const next = pointOnCircle(angle, r);
    handle.x = next.x;
    handle.y = next.y;
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = [pointer, sectorStart, sectorEnd].find((handle) => distance(handle, p) <= HIT_RADIUS);
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    if (grabbed === pointer) {
      moveRadialHandle(pointer, p, radius * 0.92);
      return;
    }
    moveRadialHandle(grabbed, p);
  };

  const onPointerUp = (): void => {
    grabbed = undefined;
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const arcPoints = (start: number, end: number, r: number): number[] => {
    const sweep = Angles.wrapRadiansPositive(end - start);
    const steps = Math.max(6, Math.ceil(sweep / (Math.PI / 20)));
    const points: number[] = [];
    for (let i = 0; i <= steps; i++) {
      const p = pointOnCircle(start + (sweep * i) / steps, r);
      points.push(p.x, p.y);
    }
    return points;
  };

  const drawHandle = (point: Point, color: number): void => {
    g.circle(point.x, point.y, 8).fill(color);
  };

  const drawRadial = (angle: number, color: number, width = 2): void => {
    const p = pointOnCircle(angle, radius);
    g.moveTo(center.x, center.y).lineTo(p.x, p.y).stroke({ color, width });
  };

  const render = (): void => {
    const heading = angleOf(pointer);
    const startAngle = angleOf(sectorStart);
    const endAngle = angleOf(sectorEnd);
    const degrees = Angles.radToDeg(heading);
    const turns = Angles.radToTurn(heading);
    const degreesRoundTrip = Angles.turnToDeg(Angles.degToTurn(degrees));
    const radiansRoundTrip = Angles.turnToRad(turns);
    const headingFromDegrees = Angles.degToRad(degrees);
    const wrappedRadians = Angles.wrapRadians(heading);
    const wrappedRadiansPositive = Angles.wrapRadiansPositive(heading);
    const wrappedDegrees = Angles.wrapDegrees(degrees);
    const wrappedDegreesPositive = Angles.wrapDegreesPositive(degrees);
    const inSector = Angles.isAngleBetween(heading, startAngle, endAngle);
    const nearSnap = Angles.nearAngle(heading, snapTarget, SNAP_EPSILON);
    const unit = Angles.sinCos(heading);
    Angles.sinCosInto(sinCosBuffer, startAngle);

    const headingMarker = pointOnCircle(heading, radius * 0.92);
    const cosPoint = { x: center.x + unit.cos * radius, y: center.y };
    const sinPoint = { x: center.x, y: center.y + unit.sin * radius };
    const startUnitMarker = {
      x: center.x + sinCosBuffer.cos * (radius + 22),
      y: center.y + sinCosBuffer.sin * (radius + 22),
    };

    g.clear();

    g.circle(center.x, center.y, radius).stroke({ color: 0x475569, width: 2 });
    g.moveTo(center.x - radius - 18, center.y)
      .lineTo(center.x + radius + 18, center.y)
      .stroke({ color: 0x334155, width: 1 });
    g.moveTo(center.x, center.y - radius - 18)
      .lineTo(center.x, center.y + radius + 18)
      .stroke({ color: 0x334155, width: 1 });

    const sector = arcPoints(startAngle, endAngle, radius + 10);
    g.moveTo(center.x, center.y).lineTo(sector[0], sector[1]).stroke({ color: 0x64748b, width: 1 });
    g.poly(sector).stroke({ color: inSector ? 0x4ade80 : 0xf59e0b, width: 5 });
    drawRadial(startAngle, 0x38bdf8);
    drawRadial(endAngle, 0xf472b6);
    drawRadial(snapTarget, nearSnap ? 0xfacc15 : 0x64748b, nearSnap ? 3 : 1.5);

    g.moveTo(center.x, center.y)
      .lineTo(headingMarker.x, headingMarker.y)
      .stroke({
        color: inSector ? 0x4ade80 : 0xe2e8f0,
        width: 3,
      });
    g.moveTo(headingMarker.x, headingMarker.y).lineTo(cosPoint.x, cosPoint.y).stroke({ color: 0x38bdf8, width: 1.5 });
    g.moveTo(headingMarker.x, headingMarker.y).lineTo(sinPoint.x, sinPoint.y).stroke({ color: 0xf472b6, width: 1.5 });
    g.circle(headingMarker.x, headingMarker.y, 6).fill(inSector ? 0x4ade80 : 0xe2e8f0);
    g.circle(startUnitMarker.x, startUnitMarker.y, 4).fill(0x38bdf8);

    drawHandle(pointer, grabbed === pointer ? 0xfacc15 : 0xe2e8f0);
    drawHandle(sectorStart, grabbed === sectorStart ? 0xfacc15 : 0x38bdf8);
    drawHandle(sectorEnd, grabbed === sectorEnd ? 0xfacc15 : 0xf472b6);
    g.circle(center.x, center.y, 5).fill(0xe2e8f0);

    label.text = [
      `rad=${wrappedRadians.toFixed(3)} pos=${wrappedRadiansPositive.toFixed(3)} turn=${turns.toFixed(3)}`,
      `deg=${wrappedDegrees.toFixed(1)} pos=${wrappedDegreesPositive.toFixed(1)} round=${degreesRoundTrip.toFixed(1)}`,
      `sector=${inSector ? 'inside' : 'outside'} snap45=${nearSnap ? 'near' : 'far'} sin=${unit.sin.toFixed(3)} cos=${unit.cos.toFixed(3)}`,
      `deg->rad drift=${Math.abs(headingFromDegrees - heading).toExponential(1)} turn->rad drift=${Math.abs(
        radiansRoundTrip - heading
      ).toExponential(1)}`,
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
