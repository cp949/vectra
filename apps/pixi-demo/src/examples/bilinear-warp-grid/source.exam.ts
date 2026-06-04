/**
 * Bilinear Warp Grid
 *
 * 4개의 corner handle로 임의의 quad를 만든다. unit square 안의 파라미터 `(tx, ty) ∈ [0,1]²`가
 * 그 quad 안으로 bilinear interpolation으로 매핑되는 모습을 격자선으로 보여준다. 애니메이션 probe가
 * `(tx, ty)`를 따라 움직이며 quad 위에서의 위치를 추적한다. label은 현재 `tx`, `ty`, probe 좌표만
 * 표시한다.
 *
 * - Interpolation.bilerpPointInto: 격자선 sample을 같은 buffer에 매 프레임 반복 기록한다.
 *   corner가 4개라 동일 점 수십 개를 채우는 hot path이므로 buffer 재사용 form을 쓴다.
 * - Interpolation.bilerpPoint: probe 위치를 매 프레임 한 번 계산한다. 결과를 한 번만 쓰는 단발성
 *   point라 allocating companion을 쓴다.
 */

import * as Interpolation from '@cp949/vectra/interpolation';

type XY = { x: number; y: number };
type Corner = 'p00' | 'p10' | 'p01' | 'p11';

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

  // quad corner. p00=(tx0,ty0), p10=(tx1,ty0), p01=(tx0,ty1), p11=(tx1,ty1).
  // 일부러 직사각형이 아닌 사다리꼴로 둬 bilinear 매핑의 비균등 간격이 드러나게 한다.
  const corners: Record<Corner, XY> = {
    p00: { x: size.width * 0.22, y: size.height * 0.28 },
    p10: { x: size.width * 0.82, y: size.height * 0.2 },
    p01: { x: size.width * 0.3, y: size.height * 0.82 },
    p11: { x: size.width * 0.7, y: size.height * 0.78 },
  };

  const DIV = 6; // 격자 분할 수 (DIV+1개의 iso-line)
  // 격자선 한 줄을 그릴 때 재사용하는 sample buffer 1개 (hot path).
  const sample: XY = { x: 0, y: 0 };

  let dragTarget: Corner | null = null;
  let phase = 0;

  const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
  const distance = (a: XY, b: XY): number => Math.hypot(a.x - b.x, a.y - b.y);

  /** canvas pointer 이벤트에서 canvas 상대 좌표를 반환한다. */
  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 가장 가까운 corner를 잡는다 (20px 안일 때만).
    const order: Corner[] = ['p00', 'p10', 'p01', 'p11'];
    dragTarget = order.find((key) => distance(p, corners[key]) <= 20) ?? null;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (dragTarget === null) return;
    const p = getCanvasXY(e);
    corners[dragTarget].x = clamp(p.x, 24, size.width - 24);
    corners[dragTarget].y = clamp(p.y, 48, size.height - 24);
  };

  const onPointerUp = (): void => {
    dragTarget = null;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(3).padStart(7);

  const render = (): void => {
    const { p00, p10, p01, p11 } = corners;

    // probe의 (tx, ty)는 서로 다른 주기로 진동해 quad 전체를 훑는다.
    phase += Math.min(app.ticker.deltaTime, 2) * 0.018;
    const tx = 0.5 + 0.5 * Math.sin(phase);
    const ty = 0.5 + 0.5 * Math.sin(phase * 0.41);

    g.clear();

    // ty 고정, tx 0→1 격자선 (가로 방향 iso-line)
    for (let r = 0; r <= DIV; r++) {
      const lineTy = r / DIV;
      for (let c = 0; c <= DIV; c++) {
        Interpolation.bilerpPointInto(sample, p00, p10, p01, p11, c / DIV, lineTy);
        if (c === 0) g.moveTo(sample.x, sample.y);
        else g.lineTo(sample.x, sample.y);
      }
      g.stroke({ color: 0x334155, width: 1 });
    }

    // tx 고정, ty 0→1 격자선 (세로 방향 iso-line)
    for (let c = 0; c <= DIV; c++) {
      const lineTx = c / DIV;
      for (let r = 0; r <= DIV; r++) {
        Interpolation.bilerpPointInto(sample, p00, p10, p01, p11, lineTx, r / DIV);
        if (r === 0) g.moveTo(sample.x, sample.y);
        else g.lineTo(sample.x, sample.y);
      }
      g.stroke({ color: 0x334155, width: 1 });
    }

    // quad 외곽선 강조 (tx/ty가 0 또는 1인 경계)
    g.moveTo(p00.x, p00.y).lineTo(p10.x, p10.y).lineTo(p11.x, p11.y).lineTo(p01.x, p01.y).closePath();
    g.stroke({ color: 0x38bdf8, width: 2 });

    // probe: (tx, ty)를 quad 안 좌표로 매핑한 단발성 결과
    const probe = Interpolation.bilerpPoint(p00, p10, p01, p11, tx, ty);
    g.circle(probe.x, probe.y, 7).fill({ color: 0xfacc15 });

    // corner handle
    g.circle(p00.x, p00.y, 8).fill({ color: 0xf97316 });
    g.circle(p10.x, p10.y, 8).fill({ color: 0xf97316 });
    g.circle(p01.x, p01.y, 8).fill({ color: 0xf97316 });
    g.circle(p11.x, p11.y, 8).fill({ color: 0xf97316 });

    label.text = [
      `tx   : ${fmt(tx)}`,
      `ty   : ${fmt(ty)}`,
      `probe: (${probe.x.toFixed(1)}, ${probe.y.toFixed(1)})`,
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
