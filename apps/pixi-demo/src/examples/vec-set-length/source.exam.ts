/**
 * Vec Set Length
 *
 * 화면 중앙 고정 origin에서 velocity handle 1개를 자유롭게 drag하면 setLengthInto가 그 벡터의
 * 방향은 그대로 두고 길이만 고정 SPEED로 덮어쓴 벡터를 보여준다. 결과 marker는 입력 길이가 길든
 * 짧든 항상 반지름 SPEED 링 위에 놓여, 스틱을 얼마나 기울이든 항상 같은 속력으로 움직이는
 * "일정 속도 방향 제어"(twin-stick 이동) 작업 흐름을 보인다. handle을 origin에 겹쳐 길이 0이 되면
 * 방향이 없어 (0,0)에 머문다.
 *
 * - Vectors.setLengthInto: raw 벡터 방향을 보존하고 길이만 정확히 SPEED로 set. 매 프레임 같은
 *   out-buffer에 기록하는 hot path라 allocating setLength 대신 *Into를 쓴다.
 * - Vectors.length: raw 벡터 길이. 결과를 늘렸는지(scaled up)·줄였는지(scaled down) 판정에 쓰는,
 *   같은 set 관계의 scale factor 분해 표시.
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

  // origin은 화면 중앙에 고정 (벡터의 꼬리, target 링의 중심)
  const origin: XY = { x: size.width / 2, y: size.height / 2 };

  // 결과 길이를 고정하는 target 상수. setLength precondition: finite non-negative (고정 양수라 항상 충족)
  const SPEED = 140; // 결과 벡터는 입력 길이와 무관하게 항상 이 길이가 된다

  // velocity handle은 사용자가 끄는 유일한 주 대상 (벡터의 머리). 초기값은 SPEED보다 짧음(len≈131)
  const handle: XY = { x: origin.x + 95, y: origin.y - 90 };

  // set 결과를 매 프레임 기록할 out-buffer (hot path buffer 재사용, allocating setLength 미사용)
  const result: XY = { x: 0, y: 0 };

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

    // 핵심 호출: 방향 보존, 길이만 정확히 SPEED로 set. zero-length면 (0,0) 기록(방향 없음)
    Vectors.setLengthInto(result, raw, SPEED);

    // marker = origin + result. zero면 origin과 같다. 그 밖엔 항상 SPEED 링 위
    const marker: XY = { x: origin.x + result.x, y: origin.y + result.y };

    // 상태 판정: scale factor(SPEED / rawLen)가 1보다 큰지 작은지 = 결과를 늘렸는지 줄였는지
    let state: string;
    let hi: number;
    if (rawLen === 0) {
      state = 'zero (no direction)'; // 방향이 없어 길이를 줄 수 없음 → (0,0)에 머묾
      hi = 0xf87171; // red
    } else if (rawLen < SPEED) {
      state = 'scaled up -> ring'; // 입력이 짧음 → 링 바깥으로 늘림
      hi = 0xf59e0b; // amber
    } else if (rawLen > SPEED) {
      state = 'scaled down -> ring'; // 입력이 김 → 링 안쪽으로 줄임
      hi = 0x38bdf8; // blue
    } else {
      state = 'at target'; // rawLen == SPEED → 그대로(scale 1, 경계 포함)
      hi = 0x4ade80; // green
    }

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // target 길이를 나타내는 단일 링(고정 기준). 결과 marker는 항상 이 위에 놓인다
    g.circle(origin.x, origin.y, SPEED).stroke({ color: 0x475569, width: 1 });

    // raw 벡터(faint white): 사용자가 끄는 원본 길이
    drawArrow(handle, 0x94a3b8, 1.5, 0.7);
    // result 벡터(state 색 bright): 같은 방향, 길이는 정확히 SPEED
    drawArrow(marker, hi, 3);

    // marker 점(결과 벡터 머리). zero면 origin 위에 warn 점으로 붕괴
    g.circle(marker.x, marker.y, 5).fill({ color: hi });
    // handle 점(유일 drag 대상)
    g.circle(handle.x, handle.y, grabbed ? 11 : 9).fill({ color: 0xe2e8f0 });
    // origin 점(벡터 꼬리)
    g.circle(origin.x, origin.y, 4).fill({ color: 0x64748b });

    label.text = [
      `raw len: ${fmt(rawLen)}   drag handle`,
      `out len: ${fmt(rawLen === 0 ? 0 : SPEED)}   target ${SPEED}`,
      `dir    : ${fmt((Math.atan2(raw.y, raw.x) * 180) / Math.PI)} deg`,
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
