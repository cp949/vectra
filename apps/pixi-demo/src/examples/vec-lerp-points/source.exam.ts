/**
 * Vector Point Lerp
 *
 * 두 끝점 A·B를 drag해 보간 구간을 정한다. 매 프레임 t가 0↔1로 왕복하면 보간점이 직선 A→B를
 * 일정 속도로 따라간다. 등간격 t 샘플 dot은 직선 위에서 등거리로 놓여 "일정 t 간격 = 일정 거리
 * 간격"임을 보여준다(slerp의 호 위 등각 간격과 대비). 끝점 바깥 옅은 ghost 점은 lerp이 t를
 * clamp하지 않고 extrapolation을 허용하는 정책을 드러낸다.
 *
 * - Vectors.lerp: 두 점 사이 직선 보간점 a + t·(b - a). 보간점·샘플 dot·ghost 점을 계산한다.
 * - Vectors.distance: A→보간점 거리. t에 선형 비례함을 수치로 확인한다.
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

  // A·B는 사용자가 드래그하는 두 끝점 (보간 구간을 정의한다)
  const handleA: XY = { x: size.width * 0.24, y: size.height * 0.68 };
  const handleB: XY = { x: size.width * 0.76, y: size.height * 0.34 };

  // t는 0↔1을 왕복한다 (일정 속도로 보간점을 구동)
  let t = 0;
  let dir = 1;
  const T_SPEED = 0.005;

  const HIT_RADIUS = 20;
  let grabbed: XY | null = null;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 더 가까운 끝점 하나만 잡는다
    const da = Math.hypot(handleA.x - p.x, handleA.y - p.y);
    const db = Math.hypot(handleB.x - p.x, handleB.y - p.y);
    if (da <= HIT_RADIUS && da <= db) grabbed = handleA;
    else if (db <= HIT_RADIUS) grabbed = handleB;
    else grabbed = null;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // 잡은 끝점을 화면 안으로 clamp
    grabbed.x = Math.max(20, Math.min(size.width - 20, p.x));
    grabbed.y = Math.max(20, Math.min(size.height - 20, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = null;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(1).padStart(7);

  const render = (): void => {
    // t를 0↔1로 왕복시켜 보간점을 갱신한다
    t += dir * T_SPEED;
    if (t >= 1) {
      t = 1;
      dir = -1;
    } else if (t <= 0) {
      t = 0;
      dir = 1;
    }

    // 현재 보간점. clamp 없는 직선 보간 a + t·(b - a)
    const probe = Vectors.lerp(handleA, handleB, t);
    // A→보간점 거리 (t에 선형 비례 → 직선 위 균등성을 수치로 확인)
    const dist = Vectors.distance(handleA, probe);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 끝점 바깥으로 직선을 옅게 연장 (extrapolation 영역 = lerp의 no-clamp 정책 범위)
    const ext0 = Vectors.lerp(handleA, handleB, -0.25);
    const ext1 = Vectors.lerp(handleA, handleB, 1.25);
    g.moveTo(ext0.x, ext0.y).lineTo(ext1.x, ext1.y).stroke({ color: 0x1e293b, width: 1, alpha: 0.9 });

    // A→B 보간 구간 본선 (t ∈ [0, 1] 경로)
    g.moveTo(handleA.x, handleA.y).lineTo(handleB.x, handleB.y).stroke({ color: 0x475569, width: 2 });

    // 등간격 t 샘플 dot (등간격 t → 직선 위 등거리 간격)
    for (let i = 0; i <= 4; i++) {
      const s = Vectors.lerp(handleA, handleB, i / 4);
      g.circle(s.x, s.y, 3).fill({ color: 0x64748b });
    }

    // 끝점 바깥 ghost 점 (t < 0, t > 1 → extrapolation 허용)
    g.circle(ext0.x, ext0.y, 3).fill({ color: 0x334155 });
    g.circle(ext1.x, ext1.y, 3).fill({ color: 0x334155 });

    // 보간점 marker (직선을 따라 움직이는 현재 점)
    g.circle(probe.x, probe.y, 7).fill({ color: 0xfacc15 });

    // A·B 끝점 drag handle
    g.circle(handleA.x, handleA.y, grabbed === handleA ? 9 : 7).fill({ color: 0x38bdf8 });
    g.circle(handleA.x, handleA.y, HIT_RADIUS).stroke({ color: 0x38bdf8, width: 1, alpha: 0.16 });
    g.circle(handleB.x, handleB.y, grabbed === handleB ? 9 : 7).fill({ color: 0x38bdf8 });
    g.circle(handleB.x, handleB.y, HIT_RADIUS).stroke({ color: 0x38bdf8, width: 1, alpha: 0.16 });

    label.text = [
      `t    : ${fmt(t)}        drag A / B`,
      `point: ${fmt(probe.x)}, ${fmt(probe.y)}`,
      `dist : ${fmt(dist)} px`,
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
