/**
 * Vector Direction Slerp
 *
 * 화면 중앙 center는 고정하고 방향 handle A·B 두 개를 drag한다. 매 프레임 t가 0↔1로 왕복하면
 * slerp로 보간된 단위 방향이 A 방향과 B 방향 사이 최단 호를 일정 각속도로 따라간다. handle을
 * 끌어 방향을 바꾸면 호의 양 끝과 호 각(omega)이 그대로 바뀐다.
 *
 * - Vectors.slerp: 두 unit 방향 사이 구면 보간. 호 위 현재 방향(probe).
 * - Vectors.normalize: handle 방향 벡터를 unit으로 만든다. slerp의 unit 전제를 만족시킨다.
 * - Vectors.angleBetween: A·B 방향 사이 호 각(omega). 보간이 덮는 전체 각.
 */

import * as Angles from '@cp949/vectra/angle';
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

  // center는 화면 중앙에 고정한다 (방향의 원점)
  const center: XY = { x: size.width / 2, y: size.height / 2 };
  // 호를 그릴 고정 반지름 (방향만 보여주므로 handle 거리와 무관하게 일정)
  const R = Math.min(size.width, size.height) * 0.32;

  // A·B는 사용자가 드래그하는 두 방향 handle (둘이 보간 구간을 정의한다)
  const handleA: XY = { x: center.x + 150, y: center.y - 40 };
  const handleB: XY = { x: center.x - 60, y: center.y + 150 };

  // t는 0↔1을 왕복한다 (일정 속도로 보간 위치를 구동)
  let t = 0;
  let dir = 1;
  const T_SPEED = 0.006;

  const HIT_RADIUS = 20;
  let grabbed: XY | null = null;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 더 가까운 handle 하나만 잡는다
    const da = Math.hypot(handleA.x - p.x, handleA.y - p.y);
    const db = Math.hypot(handleB.x - p.x, handleB.y - p.y);
    if (da <= HIT_RADIUS && da <= db) grabbed = handleA;
    else if (db <= HIT_RADIUS) grabbed = handleB;
    else grabbed = null;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // 잡은 handle을 화면 안으로 clamp
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

  // center 기준 handle 방향을 unit으로 만든다. degenerate(거리 0)면 기본 방향으로 대체한다
  const unitDir = (handle: XY): XY => {
    const v = Vectors.sub(handle, center);
    if (v.x === 0 && v.y === 0) return { x: 1, y: 0 };
    return Vectors.normalize(v);
  };

  // unit 방향을 center 기준 반지름 R 위 화면 좌표로 옮긴다
  const onArc = (d: XY): XY => ({ x: center.x + d.x * R, y: center.y + d.y * R });

  const render = (): void => {
    // t를 0↔1로 왕복시켜 보간 위치를 갱신한다
    t += dir * T_SPEED;
    if (t >= 1) {
      t = 1;
      dir = -1;
    } else if (t <= 0) {
      t = 0;
      dir = 1;
    }

    // 두 handle 방향을 unit 방향으로 변환 (slerp의 unit 전제)
    const dirA = unitDir(handleA);
    const dirB = unitDir(handleB);
    // 보간된 방향. fallback(정반대) 시 길이가 1이 아닐 수 있어 다시 normalize한다
    const probeDir = Vectors.normalize(Vectors.slerp(dirA, dirB, t));
    // A·B 사이 호 각 (보간이 덮는 전체 각)
    const omega = Angles.radToDeg(Vectors.angleBetween(dirA, dirB));
    // 현재 보간 방향의 heading (표시용)
    const heading = Angles.radToDeg(Angles.wrapRadiansPositive(Angles.fromVector(probeDir)));

    const arcA = onArc(dirA);
    const arcB = onArc(dirB);
    const probe = onArc(probeDir);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 반지름 R 가이드 원 (보간 방향 점이 항상 이 원 위에 있다)
    g.circle(center.x, center.y, R).stroke({ color: 0x1e293b, width: 1, alpha: 0.9 });

    // slerp 호를 잘게 샘플해 polyline으로 그린다 (A→B 보간 경로)
    let prev = arcA;
    for (let i = 1; i <= 48; i++) {
      const s = onArc(Vectors.normalize(Vectors.slerp(dirA, dirB, i / 48)));
      g.moveTo(prev.x, prev.y).lineTo(s.x, s.y).stroke({ color: 0x38bdf8, width: 2, alpha: 0.8 });
      prev = s;
    }

    // 등간격 t 샘플 dot (일정 각속도 → 호 위 등각 간격으로 나타난다)
    for (let i = 0; i <= 4; i++) {
      const s = onArc(Vectors.normalize(Vectors.slerp(dirA, dirB, i / 4)));
      g.circle(s.x, s.y, 3).fill({ color: 0x64748b });
    }

    // center→A, center→B 방향선 (보간 구간의 양 끝 방향)
    g.moveTo(center.x, center.y).lineTo(arcA.x, arcA.y).stroke({ color: 0x475569, width: 1 });
    g.moveTo(center.x, center.y).lineTo(arcB.x, arcB.y).stroke({ color: 0x475569, width: 1 });
    // center→probe 화살표 줄기 (현재 보간 방향)
    g.moveTo(center.x, center.y).lineTo(probe.x, probe.y).stroke({ color: 0xfacc15, width: 3 });

    // center 마커 (방향의 원점)
    g.circle(center.x, center.y, 5).fill({ color: 0xe2e8f0 });
    // A·B 끝 방향 마커
    g.circle(arcA.x, arcA.y, 6).fill({ color: 0x38bdf8 });
    g.circle(arcB.x, arcB.y, 6).fill({ color: 0x38bdf8 });
    // probe 마커 (호를 따라 움직이는 현재 방향)
    g.circle(probe.x, probe.y, 7).fill({ color: 0xfacc15 });

    // A·B drag handle (방향선보다 바깥, 실제 끌어서 방향을 바꾸는 점)
    g.circle(handleA.x, handleA.y, grabbed === handleA ? 9 : 7).fill({ color: 0x94a3b8 });
    g.circle(handleA.x, handleA.y, HIT_RADIUS).stroke({ color: 0x94a3b8, width: 1, alpha: 0.16 });
    g.circle(handleB.x, handleB.y, grabbed === handleB ? 9 : 7).fill({ color: 0x94a3b8 });
    g.circle(handleB.x, handleB.y, HIT_RADIUS).stroke({ color: 0x94a3b8, width: 1, alpha: 0.16 });

    label.text = [
      `t      : ${fmt(t)}        drag A / B`,
      `omega  : ${fmt(omega)} deg`,
      `heading: ${fmt(heading)} deg`,
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
