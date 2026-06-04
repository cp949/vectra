/**
 * Vector Projection Reflection Lab
 *
 * incident vector 끝점과 surface normal handle을 드래그하면 tangent projection,
 * normal rejection, reflected vector, angle/dot/cross 진단이 실시간으로 갱신된다.
 *
 * - Vectors.normalize: normal handle을 unit normal로 정규화
 * - Vectors.perpendicular: unit normal에서 tangent axis 계산
 * - Vectors.projectOn: incident vector를 tangent axis에 투영
 * - Vectors.sub: incident vector에서 projection을 빼 rejection 계산
 * - Vectors.reflectAcrossNormal: unit normal 기준 reflection vector 계산
 * - Vectors.angleBetween: incident/reflection 사이의 각도 측정
 * - Vectors.toPolar: incident vector의 polar 길이와 각도 표시
 */

import * as Vectors from '@cp949/vectra/vec';

type XY = { x: number; y: number };

const ORIGIN: XY = { x: 360, y: 245 };
const HIT_TOLERANCE = 18;
const MIN_NORMAL_LENGTH = 24;

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

  const incidentEnd: XY = { x: 520, y: 330 };
  const normalHandle: XY = { x: 360, y: 120 };
  const polar = { r: 0, theta: 0 };
  let grabbed: XY | undefined;

  const canvas = app.canvas as HTMLCanvasElement;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (app.screen.width / rect.width),
      y: (e.clientY - rect.top) * (app.screen.height / rect.height),
    };
  };

  const distance = (a: XY, b: XY): number => Math.hypot(a.x - b.x, a.y - b.y);

  const clampHandle = (p: XY): void => {
    p.x = Math.max(44, Math.min(676, p.x));
    p.y = Math.max(84, Math.min(408, p.y));
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = [incidentEnd, normalHandle].find((h) => distance(h, p) <= HIT_TOLERANCE);
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    grabbed.x = p.x;
    grabbed.y = p.y;
    clampHandle(grabbed);
  };

  const onPointerUp = (): void => {
    grabbed = undefined;
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawHandle = (p: XY, color: number): void => {
    g.circle(p.x, p.y, 7).fill(color);
  };

  const drawArrow = (start: XY, vector: XY, color: number, width = 3): void => {
    const end = { x: start.x + vector.x, y: start.y + vector.y };
    const len = Math.hypot(vector.x, vector.y);
    g.moveTo(start.x, start.y).lineTo(end.x, end.y).stroke({ color, width });
    if (len <= 0.001) return;

    const unit = { x: vector.x / len, y: vector.y / len };
    const side = Vectors.perpendicular(unit);
    const head = Math.min(14, Math.max(8, len * 0.12));
    g.moveTo(end.x, end.y)
      .lineTo(end.x - unit.x * head + side.x * head * 0.45, end.y - unit.y * head + side.y * head * 0.45)
      .lineTo(end.x - unit.x * head - side.x * head * 0.45, end.y - unit.y * head - side.y * head * 0.45)
      .closePath()
      .fill(color);
  };

  const render = (): void => {
    const incident = { x: incidentEnd.x - ORIGIN.x, y: incidentEnd.y - ORIGIN.y };
    const rawNormal = { x: normalHandle.x - ORIGIN.x, y: normalHandle.y - ORIGIN.y };
    const normalLength = Math.hypot(rawNormal.x, rawNormal.y);
    const unitNormal = normalLength < MIN_NORMAL_LENGTH ? { x: 0, y: -1 } : Vectors.normalize(rawNormal);
    const tangent = Vectors.perpendicular(unitNormal);
    const projection = Vectors.projectOn(incident, tangent);
    const rejection = Vectors.sub(incident, projection);
    const reflection = Vectors.reflectAcrossNormal(incident, unitNormal);
    const projectedEnd = { x: ORIGIN.x + projection.x, y: ORIGIN.y + projection.y };
    const rejectedEnd = { x: projectedEnd.x + rejection.x, y: projectedEnd.y + rejection.y };
    const reflectedEnd = { x: ORIGIN.x + reflection.x, y: ORIGIN.y + reflection.y };
    const incidenceDeg = (Vectors.angleBetween(incident, unitNormal) * 180) / Math.PI;
    const reflectionDeg = (Vectors.angleBetween(reflection, unitNormal) * 180) / Math.PI;
    const signedTurnDeg = (Vectors.directedAngle(incident, reflection) * 180) / Math.PI;
    const dot = Vectors.dot(incident, unitNormal);
    const cross = Vectors.cross(incident, unitNormal);
    Vectors.toPolarInto(polar, incident);

    g.clear();

    // tangent baseline과 normal guide
    drawArrow(ORIGIN, { x: tangent.x * 250, y: tangent.y * 250 }, 0x475569, 1.5);
    drawArrow(ORIGIN, { x: -tangent.x * 250, y: -tangent.y * 250 }, 0x475569, 1.5);
    drawArrow(ORIGIN, { x: unitNormal.x * 96, y: unitNormal.y * 96 }, 0x22c55e, 2);

    // projection과 rejection의 직각 분해
    drawArrow(ORIGIN, projection, 0x38bdf8, 3);
    g.moveTo(projectedEnd.x, projectedEnd.y).lineTo(rejectedEnd.x, rejectedEnd.y).stroke({
      color: 0xf59e0b,
      width: 2,
    });
    g.circle(projectedEnd.x, projectedEnd.y, 5).fill(0x38bdf8);

    // incident와 reflection 비교
    drawArrow(ORIGIN, incident, 0xf8fafc, 3);
    drawArrow(ORIGIN, reflection, 0xf472b6, 3);
    g.circle(reflectedEnd.x, reflectedEnd.y, 5).fill(0xf472b6);

    drawHandle(incidentEnd, grabbed === incidentEnd ? 0xf472b6 : 0xe2e8f0);
    drawHandle(normalHandle, grabbed === normalHandle ? 0xf472b6 : 0x22c55e);
    g.circle(ORIGIN.x, ORIGIN.y, 5).fill(0x94a3b8);

    const length = Math.round(polar.r);
    const thetaDeg = Math.round((polar.theta * 180) / Math.PI);
    label.text = [
      `incident length ${length}px theta ${thetaDeg}deg`,
      `projection (${Math.round(projection.x)}, ${Math.round(projection.y)}) | rejection (${Math.round(
        rejection.x
      )}, ${Math.round(rejection.y)})`,
      `dot normal ${dot.toFixed(1)} | cross normal ${cross.toFixed(1)}`,
      `angle in ${incidenceDeg.toFixed(1)}deg | reflected ${reflectionDeg.toFixed(1)}deg | turn ${signedTurnDeg.toFixed(
        1
      )}deg`,
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
