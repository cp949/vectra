/**
 * Snap Distance Ruler
 *
 * 화면 좌측 고정 anchor에서 end handle 1개를 drag하면 snapDistance가 anchor→handle 측정 길이를
 * 가장 가까운 step 눈금(여기선 40px)으로 snap한 marker를 anchor→handle 방향 자(ruler) 위에 놓는다.
 * handle을 부드럽게 끌어도 snap marker는 40px 눈금 사이를 건너뛰며 딸깍 떨어지듯 움직인다.
 * 에디터/CAD에서 치수·리사이즈 길이를 일정 간격으로 스냅하는 작업 흐름이다.
 *
 * - EditorGeometry.snapDistance: 연속 측정 길이(px)를 STEP 단위로 snap한 길이를 돌려준다.
 *   scalar 반환이라 *Into companion이 없어 그대로 쓴다. 화면의 유일한 핵심 관계.
 *
 * faint raw line·bright snap line·자 위 step 눈금·snap된 눈금 강조는 모두 같은 snap 관계의
 * 분해 표시이지 두 번째 관계가 아니다. snap 대상이 위치(grid-snap-bracket)·각도(angle-snap-dial)가
 * 아니라 거리(길이)인 점만 다르다.
 */

import * as EditorGeometry from '@cp949/vectra/editor-geometry';

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

  // anchor(자의 0 눈금)는 화면 좌측 세로 중앙에 고정. 측정 길이와 자의 시작점.
  const anchor: XY = { x: 120, y: size.height / 2 };

  // snap 간격. snapDistance precondition(finite, !=0)을 항상 만족하는 고정 양수 상수.
  const STEP = 40;

  // 자에 그릴 최대 눈금 개수(화면을 넉넉히 덮는 길이까지)
  const MAX_TICKS = 14;

  // handle을 anchor에 겹쳐 측정 길이가 0으로 붕괴했다고 볼 임계(2px)
  const DEGEN_EPS = 2;

  // end handle은 사용자가 끄는 유일한 주 대상. 초기 길이를 눈금 사이(≈150px)로 둬 snap을 바로 보인다
  const handle: XY = { x: anchor.x + 150, y: anchor.y - 60 };

  const HIT_RADIUS = 24;
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
    // handle을 화면 안으로만 clamp. hypot/atan2라 좌표가 finite면 길이·방향도 항상 finite다
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

  // anchor에서 (단위 방향 dir) 위로 거리 len 만큼 뻗은 점
  const along = (dir: XY, len: number): XY => ({
    x: anchor.x + dir.x * len,
    y: anchor.y + dir.y * len,
  });

  const render = (): void => {
    // 측정 길이 = anchor → handle 거리. hypot이라 항상 finite·non-negative
    const rawLen = Math.hypot(handle.x - anchor.x, handle.y - anchor.y);

    // 방향. rawLen이 0에 가까우면 방향이 미정이라 fallback을 쓰지만, snappedLen=0이라 marker 위치엔 영향 없음
    const degenerate = rawLen <= DEGEN_EPS;
    const dir: XY = degenerate
      ? { x: 1, y: 0 }
      : { x: (handle.x - anchor.x) / rawLen, y: (handle.y - anchor.y) / rawLen };

    // 핵심 호출: 연속 측정 길이를 STEP 단위 눈금으로 snap. tie(정확히 중간)는 +방향으로 올림
    const snappedLen = EditorGeometry.snapDistance(rawLen, STEP);

    // snap된 길이가 몇 번째 눈금인지(강조용)
    const snappedIndex = Math.round(snappedLen / STEP);

    const snapEnd = along(dir, snappedLen);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 자(ruler) 베이스 라인: anchor에서 dir 방향으로 길게. snap 눈금이 놓이는 기준선
    const rulerEnd = along(dir, MAX_TICKS * STEP);
    g.moveTo(anchor.x, anchor.y).lineTo(rulerEnd.x, rulerEnd.y).stroke({ color: 0x334155, width: 1 });

    // 자 눈금: 0..MAX_TICKS step 간격. snap된 눈금만 밝게·길게 강조해 marker가 어느 눈금에 떨어졌는지 보인다
    // tick은 자 진행 방향(dir)에 수직(법선)으로 그린다
    const normal: XY = { x: -dir.y, y: dir.x };
    for (let i = 0; i <= MAX_TICKS; i += 1) {
      const isSnapped = i === snappedIndex;
      const base = along(dir, i * STEP);
      const half = isSnapped ? 16 : 8;
      const a = { x: base.x + normal.x * half, y: base.y + normal.y * half };
      const b = { x: base.x - normal.x * half, y: base.y - normal.y * half };
      g.moveTo(a.x, a.y)
        .lineTo(b.x, b.y)
        .stroke({ color: isSnapped ? 0x4ade80 : 0x475569, width: isSnapped ? 3 : 1 });
    }

    // raw line(faint white): anchor → handle 연속 측정 길이
    g.moveTo(anchor.x, anchor.y).lineTo(handle.x, handle.y).stroke({ color: 0x94a3b8, width: 1.5, alpha: 0.7 });

    // snap line(bright green): anchor → snap된 길이 위치. degenerate면 anchor에 붕괴하므로 warn 색
    g.moveTo(anchor.x, anchor.y)
      .lineTo(snapEnd.x, snapEnd.y)
      .stroke({ color: degenerate ? 0xf87171 : 0x4ade80, width: 3 });

    // snap marker. zero-length 측정 degenerate면 warn(red), 아니면 정상(green)
    g.circle(snapEnd.x, snapEnd.y, 6).fill({ color: degenerate ? 0xf87171 : 0x4ade80 });

    // handle 점(유일 drag 대상)
    g.circle(handle.x, handle.y, grabbed ? 11 : 9).fill({ color: 0xe2e8f0 });
    // anchor 점(자의 0 눈금)
    g.circle(anchor.x, anchor.y, 4).fill({ color: 0x64748b });

    label.text = [
      `raw    : ${fmt(rawLen)} px   drag handle`,
      `snapped: ${fmt(snappedLen)} px`,
      `step   : ${fmt(STEP)} px`,
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
