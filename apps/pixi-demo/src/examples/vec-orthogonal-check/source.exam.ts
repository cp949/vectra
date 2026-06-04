/**
 * Vector Orthogonal Check
 *
 * 화면 중앙 고정 원점에서 뻗은 두 벡터의 끝점 handle A·B를 drag하면 두 벡터가 서로 직교(90°)
 * 하는지 판정한다. 직교일 때만 원점 코너에 직각 marker를 그리고 두 벡터를 강조색으로 칠한다.
 * isOrthogonal의 epsilon은 dot product 절대값 기준이라 입력 크기에 비례하므로, 단위 벡터로
 * 정규화한 뒤 sin(허용각)을 epsilon으로 넘겨 "90°에서 ±tol 이내"라는 각도 허용오차로 만든다.
 *
 * - Vectors.isOrthogonal: 두 벡터의 직교 여부 판정(dot=0 기준, epsilon은 dot 절대값 허용오차)
 * - Vectors.normalize: 단위 벡터화. epsilon을 각도 허용오차 sin(tol)로 해석하기 위한 전제
 * - Vectors.angleBetween: 표시용 사잇각(라디안 [0, π])
 * - Vectors.dot: 표시용 단위 벡터 내적(직교면 0에 근접)
 */

import * as Vectors from '@cp949/vectra/vec';

type XY = { x: number; y: number };

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

  // 원점은 화면 중앙 고정
  const origin: XY = { x: size.width / 2, y: size.height / 2 };
  // 두 벡터 끝점 (주 drag 대상). 초기에는 약 60°라 직교가 아니다
  const tipA: XY = { x: origin.x + 150, y: origin.y - 30 };
  const tipB: XY = { x: origin.x + 60, y: origin.y - 140 };

  // 90°에서 ±4° 이내면 직교로 본다. 단위 벡터 |dot| <= sin(4°)가 곧 각도 허용오차다
  const TOLERANCE_RAD = (4 * Math.PI) / 180;
  const eps = Math.sin(TOLERANCE_RAD);

  const HIT_RADIUS = 24;
  // 잡은 handle: 'a' | 'b' | null
  let grabbed: 'a' | 'b' | null = null;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 더 가까운 handle을 잡는다
    const dA = Math.hypot(tipA.x - p.x, tipA.y - p.y);
    const dB = Math.hypot(tipB.x - p.x, tipB.y - p.y);
    if (dA <= HIT_RADIUS && dA <= dB) grabbed = 'a';
    else if (dB <= HIT_RADIUS) grabbed = 'b';
    else grabbed = null;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // 잡은 handle을 화면 안으로 clamp
    const tip = grabbed === 'a' ? tipA : tipB;
    tip.x = Math.max(16, Math.min(size.width - 16, p.x));
    tip.y = Math.max(16, Math.min(size.height - 16, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = null;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  // 원점→끝점 벡터를 강조색/중립색으로 그리는 화살표 헬퍼
  const drawArrow = (tip: XY, color: number): void => {
    g.moveTo(origin.x, origin.y).lineTo(tip.x, tip.y).stroke({ color, width: 3 });
    const len = Math.hypot(tip.x - origin.x, tip.y - origin.y) || 1;
    const ux = (tip.x - origin.x) / len;
    const uy = (tip.y - origin.y) / len;
    const ah = 14;
    // 진행 방향에 수직인 벡터로 화살촉 양 날개를 만든다
    const nx = -uy;
    const ny = ux;
    const baseX = tip.x - ux * ah;
    const baseY = tip.y - uy * ah;
    g.moveTo(tip.x, tip.y)
      .lineTo(baseX + nx * (ah * 0.5), baseY + ny * (ah * 0.5))
      .lineTo(baseX - nx * (ah * 0.5), baseY - ny * (ah * 0.5))
      .closePath()
      .fill({ color });
  };

  const render = (): void => {
    // 원점→끝점 벡터. dot product는 y축 반전에 불변이라 화면 좌표 그대로 직교 판정이 성립한다
    const u = Vectors.sub(tipA, origin);
    const v = Vectors.sub(tipB, origin);

    // 단위 벡터로 정규화해 epsilon을 각도 허용오차로 해석한다(zero vector면 (0,0) 반환)
    const unitU = Vectors.normalize(u);
    const unitV = Vectors.normalize(v);
    // 직교 판정. 단위 벡터의 |dot| <= sin(tol)이면 90°에서 ±tol 이내
    const orthogonal = Vectors.isOrthogonal(unitU, unitV, eps);

    // 표시용 진단값. zero vector에서 angleBetween은 0, dot은 0을 반환해 NaN이 없다
    const angleDeg = (Vectors.angleBetween(u, v) * 180) / Math.PI;
    const unitDot = Vectors.dot(unitU, unitV);

    const hi = orthogonal ? 0x4ade80 : 0x38bdf8;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 보조 격자 축 (원점 통과)
    g.moveTo(0, origin.y).lineTo(size.width, origin.y).stroke({ color: 0x1e293b, width: 1 });
    g.moveTo(origin.x, 0).lineTo(origin.x, size.height).stroke({ color: 0x1e293b, width: 1 });

    // 직교일 때만 원점 코너에 직각 marker(정사각형)를 그린다
    if (orthogonal) {
      const s = 26;
      const p0 = origin;
      const p1 = { x: origin.x + unitU.x * s, y: origin.y + unitU.y * s };
      const p3 = { x: origin.x + unitV.x * s, y: origin.y + unitV.y * s };
      // 두 단위 방향이 만드는 평행사변형. 직교라 사각형이 된다
      const p2 = { x: origin.x + (unitU.x + unitV.x) * s, y: origin.y + (unitU.y + unitV.y) * s };
      g.moveTo(p0.x, p0.y)
        .lineTo(p1.x, p1.y)
        .lineTo(p2.x, p2.y)
        .lineTo(p3.x, p3.y)
        .closePath()
        .fill({ color: hi, alpha: 0.22 })
        .stroke({ color: hi, width: 2 });
    }

    // 두 벡터 화살표
    drawArrow(tipA, hi);
    drawArrow(tipB, hi);

    // 원점 marker
    g.circle(origin.x, origin.y, 5).fill({ color: 0xe2e8f0 });
    // 끝점 handle marker (주 대상)
    g.circle(tipA.x, tipA.y, grabbed === 'a' ? 11 : 9).fill({ color: hi });
    g.circle(tipB.x, tipB.y, grabbed === 'b' ? 11 : 9).fill({ color: hi });

    label.text = [
      `orthogonal : ${orthogonal ? 'yes (90 deg +/-4)' : 'no'}   drag A, B`,
      `angle      : ${angleDeg.toFixed(1)} deg`,
      `dot (unit) : ${unitDot.toFixed(3)}`,
    ].join('\n');
  };

  app.ticker.add(render);

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
