/**
 * Vec Clamp Region
 *
 * 화면 중앙 고정 사각 영역(play-area / viewport) 위에서 handle 1개를 자유롭게 drag하면
 * clampInto가 handle 좌표를 region의 min/max로 성분별 clamp한 marker를 매 프레임 갱신한다.
 * handle을 region 밖으로 끌어도 marker는 항상 region 안(경계 포함)에 머물러, "오브젝트를
 * 재생 영역/뷰포트 안에 가둔다"는 위치 clamp 작업 흐름을 보인다.
 *
 * - Vectors.clampInto: handle을 region [min, max] box로 성분별 clamp. 매 프레임 같은 out-buffer에
 *   기록하는 hot path라 allocating clamp 대신 *Into를 쓴다. 어느 축이 clamp됐는지(변에 붙음)는
 *   marker와 handle 좌표를 inline 비교한 같은 clamp 관계의 분해 표시다.
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

  // 화면 중앙. region box의 중심
  const cx = size.width / 2;
  const cy = size.height / 2;

  // clamp 영역(box)의 두 모서리. 고정 valid box라 precondition min <= max는 항상 충족한다.
  // (min > max면 결과 undefined, zero-area면 한 축이 점으로 붕괴 — 고정 box라 둘 다 미발생)
  const min: XY = { x: cx - 180, y: cy - 120 };
  const max: XY = { x: cx + 180, y: cy + 120 };

  // handle은 사용자가 끄는 유일한 주 대상. 초기값은 region 안.
  const handle: XY = { x: cx + 90, y: cy - 60 };

  // clamp 결과를 매 프레임 기록할 out-buffer (hot path buffer 재사용, allocating clamp 미사용)
  const marker: XY = { x: 0, y: 0 };

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
    // handle은 화면 안으로만 clamp. region 밖으로도 끌 수 있어야 clamp 효과가 보인다(항상 finite)
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

  const fmt = (n: number): string => n.toFixed(0).padStart(4);

  const render = (): void => {
    // 핵심 호출: handle을 region [min, max] box로 성분별 clamp. 각 축 독립으로 [min,max]에 가둔다
    Vectors.clampInto(marker, handle, min, max);

    // 어느 축이 clamp됐는지 = handle이 그 축에서 region을 벗어났는지. 같은 clamp 관계의 inline 분해
    const clampedX = marker.x !== handle.x;
    const clampedY = marker.y !== handle.y;

    // state: clamp된 축 개수(0/1/2) 분해. inside(안) / edge(한 변) / corner(두 변 동시)
    let state: string;
    let hi: number;
    if (!clampedX && !clampedY) {
      state = 'inside'; // 두 축 모두 region 안 → marker == handle
      hi = 0x4ade80; // green
    } else if (clampedX && clampedY) {
      state = 'corner'; // 두 축 모두 벗어남 → region 모서리로 clamp
      hi = 0x38bdf8; // blue
    } else {
      state = 'edge'; // 한 축만 벗어남 → region 변으로 clamp
      hi = 0xf59e0b; // amber
    }

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    const w = max.x - min.x;
    const h = max.y - min.y;

    // clamp 영역(box) 채움 + 기본 외곽선
    g.rect(min.x, min.y, w, h).fill({ color: 0x1e293b }).stroke({ color: 0x475569, width: 1 });

    // 변 강조: clamp된 축의 어느 변에 marker가 붙었는지 밝게 그린다(축별 clamp 분해)
    if (clampedX) {
      // x가 min에 붙으면 왼쪽 변, max면 오른쪽 변
      const ex = marker.x === min.x ? min.x : max.x;
      g.moveTo(ex, min.y).lineTo(ex, max.y).stroke({ color: hi, width: 3 });
    }
    if (clampedY) {
      // y가 min에 붙으면 위쪽 변, max면 아래쪽 변
      const ey = marker.y === min.y ? min.y : max.y;
      g.moveTo(min.x, ey).lineTo(max.x, ey).stroke({ color: hi, width: 3 });
    }

    // leash line: handle → marker. clamp로 밀린 변위. inside면 길이 0이라 점으로 붕괴
    g.moveTo(handle.x, handle.y).lineTo(marker.x, marker.y).stroke({ color: 0x94a3b8, width: 1.5, alpha: 0.7 });

    // marker 점(clamp 결과). 항상 region 안(경계 포함). state 색으로 표시
    g.circle(marker.x, marker.y, 6).fill({ color: hi });
    // handle 점(유일 drag 대상). region 밖으로 끌 수 있다
    g.circle(handle.x, handle.y, grabbed ? 11 : 9).fill({ color: 0xe2e8f0 });

    label.text = [
      `raw   : ${fmt(handle.x)}, ${fmt(handle.y)}   drag handle`,
      `clamp : ${fmt(marker.x)}, ${fmt(marker.y)}`,
      `state : ${state}`,
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
