/**
 * Orientation Predicate
 *
 * 방향 직선 A→B를 기준으로 점 C가 어느 쪽에 있는지 판정한다. probe C를 drag하면 orientation
 * 부호로 ccw(한쪽) / cw(반대쪽) / on(직선 위)을 분류하고, 같은 부호로 삼각형 ABC를 칠해
 * "orientation 값 = 삼각형 ABC 부호 면적의 2배"임을 한 장면에 묶는다. A·B handle을 끌면 판정
 * 기준 직선이 바뀐다.
 *
 * - Vectors.orientation: 세 점 a, b, c의 부호 있는 값(>0 ccw, 0 일직선, <0 cw)을 반환해 C가
 *   직선 A→B의 어느 쪽인지 결정한다.
 * - Vectors.isCollinear: 같은 cross product의 절댓값이 epsilon 이하인지로 "직선 위" 여부를 판정한다.
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

  // 직선을 정의하는 두 끝점 (보조 handle, drag 가능)
  const a: XY = { x: 170, y: 320 };
  const b: XY = { x: 560, y: 150 };
  // 판정 대상 probe C (주 drag 대상)
  const c: XY = { x: 380, y: 330 };

  // 세 점을 한 배열로 두고 가장 가까운 것을 잡는다 (C를 마지막에 둬 겹칠 때 우선 선택)
  const handles: XY[] = [a, b, c];

  // cross product(px²) 기준 tolerance. 화면 좌표라 면적 단위이므로 0이 아닌 픽셀 값을 쓴다
  const COLLINEAR_EPS = 90;
  const HIT_RADIUS = 20;
  let grabbed: XY | null = null;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 가장 가까운 점을 HIT_RADIUS 안에서 선택
    let best: XY | null = null;
    let bestDist = HIT_RADIUS;
    for (const h of handles) {
      const d = Math.hypot(h.x - p.x, h.y - p.y);
      if (d <= bestDist) {
        best = h;
        bestDist = d;
      }
    }
    grabbed = best;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // 잡은 점을 화면 안으로 clamp
    grabbed.x = Math.max(16, Math.min(size.width - 16, p.x));
    grabbed.y = Math.max(16, Math.min(size.height - 16, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = null;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(0).padStart(9);

  const render = (): void => {
    // 부호 있는 값: >0 ccw, 0 collinear, <0 cw (삼각형 ABC 면적의 2배)
    const orient = Vectors.orientation(a, b, c);
    // 직선 근처면 on으로 본다 (epsilon은 cross product 절댓값 기준)
    const onLine = Vectors.isCollinear(a, b, c, COLLINEAR_EPS);
    // 같은 부호로 색을 정하면 화면 영역과 turn 라벨이 항상 일관된다
    const sideColor = onLine ? 0xfacc15 : orient > 0 ? 0x38bdf8 : 0xf472b6;
    const turn = onLine ? 'on ' : orient > 0 ? 'ccw' : 'cw ';

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 직선 A→B를 화면 끝까지 옅게 연장 (선분이 아니라 직선 기준 판정임을 보인다)
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const far = size.width + size.height;
    g.moveTo(a.x - ux * far, a.y - uy * far)
      .lineTo(b.x + ux * far, b.y + uy * far)
      .stroke({ color: 0x334155, width: 1, alpha: 0.7 });

    // 삼각형 ABC를 winding 색으로 채운다 (채운 면적 = |orient| / 2)
    g.moveTo(a.x, a.y).lineTo(b.x, b.y).lineTo(c.x, c.y).closePath().fill({ color: sideColor, alpha: 0.16 });

    // 방향 선분 A→B (좌/우 판정 기준 방향)
    g.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ color: 0x94a3b8, width: 3 });
    // B 끝 화살촉 (진행 방향 표시)
    const ah = 14;
    const baseX = b.x - ux * ah;
    const baseY = b.y - uy * ah;
    // 진행 방향에 수직인 벡터로 화살촉 양 날개를 만든다
    const nx = -uy;
    const ny = ux;
    g.moveTo(b.x, b.y)
      .lineTo(baseX + nx * (ah * 0.5), baseY + ny * (ah * 0.5))
      .lineTo(baseX - nx * (ah * 0.5), baseY - ny * (ah * 0.5))
      .closePath()
      .fill({ color: 0x94a3b8 });

    // A, B handle (직선 정의, 회색)
    for (const h of [a, b]) {
      g.circle(h.x, h.y, grabbed === h ? 8 : 6).fill({ color: 0xcbd5e1 });
    }
    // probe C (주 대상, side 색으로 크게)
    g.circle(c.x, c.y, grabbed === c ? 11 : 9).fill({ color: sideColor });
    g.circle(c.x, c.y, 16).stroke({ color: sideColor, width: 2, alpha: 0.5 });

    label.text = [
      `orient    : ${fmt(orient)}   drag C (or A,B)`,
      `turn      : ${turn}`,
      `collinear : ${onLine ? 'yes' : 'no '}`,
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
