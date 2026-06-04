/**
 * Vec Clamp Length Band
 *
 * 화면 중앙 고정 origin에서 velocity handle 1개를 자유롭게 drag하면 clampLengthInto가 그 벡터의
 * 방향은 그대로 두고 길이만 [min, max] band로 제한한 벡터를 보여준다. 길이가 band 안이면 그대로
 * 통과하고, band보다 길면 max 링으로 끌어당기며(pull-in), 짧으면 min 링으로 밀어낸다(push-out).
 * handle을 origin에 겹쳐 길이 0이 되면 방향이 없어 min으로 밀 수 없어 (0,0)에 머문다.
 *
 * - Vectors.clampLengthInto: raw 벡터 길이를 [R_MIN, R_MAX]로 clamp(방향 보존). 매 프레임 같은
 *   out-buffer에 기록하는 hot path라 allocating clampLength 대신 *Into를 쓴다.
 * - Vectors.length: raw·clamped 벡터 길이. band와의 대소(통과/pull-in/push-out) 판정에 쓰는,
 *   같은 clamp 관계의 분해 표시.
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

  // origin은 화면 중앙에 고정 (벡터의 꼬리, 두 링의 중심)
  const origin: XY = { x: size.width / 2, y: size.height / 2 };

  // 허용 band를 정하는 고정 상수. clampLength precondition: 0 <= R_MIN <= R_MAX, 둘 다 finite
  const R_MIN = 70; // 이보다 짧으면 이 링으로 밀어냄(push-out)
  const R_MAX = 190; // 이보다 길면 이 링으로 끌어당김(pull-in)

  // velocity handle은 사용자가 끄는 유일한 주 대상 (벡터의 머리). 초기값은 band 안(len≈131)
  const handle: XY = { x: origin.x + 95, y: origin.y - 90 };

  // clamp 결과를 매 프레임 기록할 out-buffer (hot path buffer 재사용, allocating clampLength 미사용)
  const clamped: XY = { x: 0, y: 0 };

  const HIT_RADIUS = 22;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = Math.hypot(handle.x - p.x, handle.y - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // handle을 화면 안으로만 clamp. origin에 정확히 겹치면 zero-length degenerate가 발생할 수 있다
    handle.x = Math.max(16, Math.min(size.width - 16, p.x));
    handle.y = Math.max(16, Math.min(size.height - 16, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(1).padStart(7);

  // origin → end 화살표 (머리 두 날개 포함)
  const drawArrow = (end: XY, color: number, width: number, alpha = 1): void => {
    const dx = end.x - origin.x;
    const dy = end.y - origin.y;
    const len = Math.hypot(dx, dy);
    if (len < 1) return; // 길이가 거의 0이면 화살표를 그리지 않는다
    g.moveTo(origin.x, origin.y).lineTo(end.x, end.y).stroke({ color, width, alpha });
    const ux = dx / len;
    const uy = dy / len;
    const head = 12;
    // 진행 방향 기준 ±150° 두 날개
    g.moveTo(end.x, end.y)
      .lineTo(end.x - ux * head - uy * head * 0.5, end.y - uy * head + ux * head * 0.5)
      .moveTo(end.x, end.y)
      .lineTo(end.x - ux * head + uy * head * 0.5, end.y - uy * head - ux * head * 0.5)
      .stroke({ color, width, alpha });
  };

  const render = (): void => {
    // raw 벡터 = origin → handle. 사용자가 정하는 입력 벡터
    const raw: XY = { x: handle.x - origin.x, y: handle.y - origin.y };
    const rawLen = Vectors.length(raw);

    // 핵심 호출: 방향 보존, 길이만 [R_MIN, R_MAX]로 clamp. zero-length면 (0,0) 기록(방향 없음)
    Vectors.clampLengthInto(clamped, raw, R_MIN, R_MAX);
    const clampedLen = Vectors.length(clamped);

    // marker = origin + clamped. zero면 origin과 같다
    const marker: XY = { x: origin.x + clamped.x, y: origin.y + clamped.y };

    // 상태 판정: 길이가 정확히 R_MIN/R_MAX면 통과(경계 포함), 그 밖만 clamp
    let state: string;
    let hi: number;
    if (rawLen === 0) {
      state = 'zero (no direction)'; // 방향이 없어 min으로 밀 수 없음 → (0,0)에 머묾
      hi = 0xf87171; // red
    } else if (rawLen < R_MIN) {
      state = 'below -> min'; // 너무 짧음 → R_MIN 링으로 push-out
      hi = 0xf59e0b; // amber
    } else if (rawLen > R_MAX) {
      state = 'above -> max'; // 너무 김 → R_MAX 링으로 pull-in
      hi = 0x38bdf8; // blue
    } else {
      state = 'in band'; // band 안 → 그대로 통과(raw == clamped)
      hi = 0x4ade80; // green
    }

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 허용 band를 나타내는 두 동심 링(고정 기준)
    g.circle(origin.x, origin.y, R_MIN).stroke({ color: 0x475569, width: 1 });
    g.circle(origin.x, origin.y, R_MAX).stroke({ color: 0x475569, width: 1 });

    // raw 벡터(faint white): 사용자가 끄는 원본 길이
    drawArrow(handle, 0x94a3b8, 1.5, 0.7);
    // clamped 벡터(state 색 bright): 같은 방향, 길이만 band로 제한된 결과
    drawArrow(marker, hi, 3);

    // marker 점(결과 벡터 머리). zero면 origin 위에 warn 점으로 붕괴
    g.circle(marker.x, marker.y, 5).fill({ color: hi });
    // handle 점(유일 drag 대상)
    g.circle(handle.x, handle.y, grabbed ? 11 : 9).fill({ color: 0xe2e8f0 });
    // origin 점(벡터 꼬리)
    g.circle(origin.x, origin.y, 4).fill({ color: 0x64748b });

    label.text = [
      `raw len    : ${fmt(rawLen)}   drag handle`,
      `clamped len: ${fmt(clampedLen)}   band [${R_MIN}, ${R_MAX}]`,
      `state      : ${state}`,
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
