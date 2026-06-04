/**
 * Segment Point At Length
 *
 * 하단 distance 트랙의 scrubber 1개를 drag해 거리 d(px)를 정하면, 고정 segment 위
 * pointAtLength(seg, d) marker가 시작점에서 d만큼 떨어진 위치를 가리킨다. d가 [0, length] 안이면
 * marker가 segment 위에 놓이고, 범위 밖이면 기본 clamp marker는 가까운 끝점에 멈추는 반면
 * {clamp:false} ghost marker는 supporting line(segment를 무한히 연장한 직선)을 따라 끝점 너머로
 * 나간다. dash offset이나 시작점 기준 눈금 배치처럼 "선을 따라 고정 거리 위치"를 잡는 작업 흐름이다.
 *
 * - Segments.pointAtLengthInto: 거리 d → segment 위 점. clamp marker와 extrapolate ghost 2개를
 *   매 프레임 갱신하는 hot path라 allocating 대신 *Into out-buffer 2개를 재사용한다.
 * - Segments.pointAtLength: supporting line guide의 양 끝점. 거리 범위가 고정이라 setup에서 1회만
 *   allocating으로 계산한다(같은 관계의 정적 분해 표시).
 * - Segments.length: segment 길이. 트랙의 in-range zone [0, length] 경계와 진단 표시에 쓴다.
 */

import * as Segments from '@cp949/vectra/segment';

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

  // 고정 segment(비수평이라 방향이 자명하지 않게). 시작점 a가 거리 0의 기준이다
  const seg = { a: { x: 180, y: 300 }, b: { x: 560, y: 150 } };
  const segLen = Segments.length(seg); // ≈ 408.5

  // distance 트랙(하단 가로 막대). 트랙 x ↔ 거리 d를 선형 매핑한다
  const TRACK_X0 = 70;
  const TRACK_X1 = 650;
  const TRACK_Y = 392;
  const D_MIN = -120; // 시작점 너머(음수 거리)까지 끌 수 있다
  const D_MAX = segLen + 120; // 끝점 너머까지 끌 수 있다

  // 거리 ↔ 트랙 x 변환 (선형)
  const dToX = (d: number): number => TRACK_X0 + ((d - D_MIN) / (D_MAX - D_MIN)) * (TRACK_X1 - TRACK_X0);
  const xToD = (x: number): number => D_MIN + ((x - TRACK_X0) / (TRACK_X1 - TRACK_X0)) * (D_MAX - D_MIN);

  // 사용자가 끄는 유일한 주 대상: 거리 d. 초기값은 범위 안(segLen의 30%)
  let distance = segLen * 0.3;

  // supporting line guide 양 끝점: 거리 범위가 고정이라 setup에서 1회만 allocating으로 계산한다
  const guideStart = Segments.pointAtLength(seg, D_MIN, { clamp: false });
  const guideEnd = Segments.pointAtLength(seg, D_MAX, { clamp: false });

  // 매 프레임 재기록할 out-buffer 2개 (hot path buffer 재사용)
  const clampPt: XY = { x: 0, y: 0 }; // 기본 clamp 결과
  const extraPt: XY = { x: 0, y: 0 }; // {clamp:false} extrapolate 결과

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // scrubber 또는 트랙 근처를 누르면 잡는다
    grabbed = Math.abs(p.y - TRACK_Y) <= 26 && p.x >= TRACK_X0 - 14 && p.x <= TRACK_X1 + 14;
    if (grabbed) distance = xToD(Math.max(TRACK_X0, Math.min(TRACK_X1, p.x)));
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // 트랙 x를 거리로 환산. 트랙 폭으로 clamp해 d는 항상 [D_MIN, D_MAX] finite → non-finite 미발생
    distance = xToD(Math.max(TRACK_X0, Math.min(TRACK_X1, p.x)));
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

  const render = (): void => {
    // 핵심 호출 1: 기본 clamp. d<=0이면 시작점, d>=length이면 끝점에 멈춘다
    Segments.pointAtLengthInto(clampPt, seg, distance);
    // 핵심 호출 2: extrapolate. 범위 밖이면 supporting line을 따라 끝점 너머로 나간다
    Segments.pointAtLengthInto(extraPt, seg, distance, { clamp: false });

    // mode 판정: 같은 함수의 clamp 정책이 어느 분기를 타는지
    let mode: string;
    let accent: number;
    if (distance < 0) {
      mode = 'clamp -> start'; // 음수 거리 → 시작점 고정, ghost는 시작점 너머
      accent = 0xf59e0b; // amber
    } else if (distance > segLen) {
      mode = 'clamp -> end'; // length 초과 → 끝점 고정, ghost는 끝점 너머
      accent = 0xf59e0b; // amber
    } else {
      mode = 'in range'; // [0, length] 안 → clamp == extrapolate, marker가 segment 위
      accent = 0x4ade80; // green
    }

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // supporting line guide(faint): segment를 무한 연장한 직선. extrapolate ghost가 이 위에 놓인다
    g.moveTo(guideStart.x, guideStart.y).lineTo(guideEnd.x, guideEnd.y).stroke({ color: 0x334155, width: 1 });

    // segment 본체(밝게): 거리 [0, length] 구간
    g.moveTo(seg.a.x, seg.a.y).lineTo(seg.b.x, seg.b.y).stroke({ color: 0x94a3b8, width: 3 });

    // 시작점 a(거리 0 기준)·끝점 b(거리 length)
    g.circle(seg.a.x, seg.a.y, 5).fill({ color: 0x64748b });
    g.circle(seg.b.x, seg.b.y, 5).fill({ color: 0x64748b });

    // extrapolate ghost marker: 범위 밖일 때만 clamp marker와 갈라져 보인다
    g.circle(extraPt.x, extraPt.y, 7).stroke({ color: 0xf59e0b, width: 1.5 });
    // clamp marker(state 색): 실제 거리 위치(범위 밖이면 끝점에 멈춤)
    g.circle(clampPt.x, clampPt.y, 6).fill({ color: accent });

    // distance 트랙: 전체 범위 막대 + in-range zone [0, length] 강조 + scrubber
    g.moveTo(TRACK_X0, TRACK_Y).lineTo(TRACK_X1, TRACK_Y).stroke({ color: 0x475569, width: 2 });
    // in-range zone: 이 구간 안에서만 marker가 segment 위에 놓인다
    g.moveTo(dToX(0), TRACK_Y).lineTo(dToX(segLen), TRACK_Y).stroke({ color: 0x4ade80, width: 4, alpha: 0.5 });
    // zone 끝 눈금(0, length)
    g.moveTo(dToX(0), TRACK_Y - 7)
      .lineTo(dToX(0), TRACK_Y + 7)
      .stroke({ color: 0x64748b, width: 1 });
    g.moveTo(dToX(segLen), TRACK_Y - 7)
      .lineTo(dToX(segLen), TRACK_Y + 7)
      .stroke({ color: 0x64748b, width: 1 });
    // scrubber(유일 drag 대상)
    const sx = dToX(distance);
    g.circle(sx, TRACK_Y, grabbed ? 10 : 8).fill({ color: 0xe2e8f0 });

    label.text = [
      `distance: ${fmt(distance)}   drag scrubber`,
      `length  : ${fmt(segLen)}   in-range [0, length]`,
      `mode    : ${mode}`,
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
