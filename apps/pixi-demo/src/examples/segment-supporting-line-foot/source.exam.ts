/**
 * Segment Supporting Line Foot
 *
 * 화면 고정 선분(edge)에서 point 핸들 1개를 drag하면 `nearestPointOnSupportingLine`이 그 점을
 * 선분의 **supporting infinite line**(끝점 너머로 무한 연장된 직선)에 투영한 수선의 발(foot of
 * perpendicular)을 다시 계산한다. 점을 선분 끝점 바깥으로 끌면 발은 선분을 벗어나 연장선(faint)
 * 위에 놓여, endpoint에 갇히는 clamp형 최근점과 달리 "점을 선분의 지지직선에 unclamped로
 * 투영한다"는 작업 흐름을 보인다.
 *
 * - Segments.nearestPointOnSupportingLine: 점을 지지직선에 투영한 수선의 발을 새 object로 반환한다.
 *   endpoint clamp가 없어 발이 선분 밖으로 나갈 수 있다. drag당 1회 단발 결과라 allocating
 *   companion을 그대로 호출한다(out-buffer scaffold 미사용).
 * - Segments.signedDistanceToSupportingLine: 점에서 지지직선까지 부호 거리(좌+/우−) diagnostics.
 * - Segments.sideOfSupportingLine: 점이 지지직선 어느 쪽인지 -1/0/1 diagnostics.
 *   세 값은 모두 같은 "점 vs 지지직선" 관계를 점·scalar·부호 형태로 읽은 한 관계의 분해다.
 */

import * as Segments from '@cp949/vectra/segment';

type XY = { x: number; y: number };

const SEG_COLOR = 0x38bdf8; // 고정 선분(edge): 밝은 하늘색 (조작 대상 아님)
const LINE_COLOR = 0x334155; // 지지직선 연장(끝점 너머): 어두운 회색 — 발이 여기로 나갈 수 있음
const FOOT_COLOR = 0x34d399; // 수선의 발 + 점→발 수선: 청록 (핵심 관계)
const ENDPOINT_COLOR = 0x94a3b8; // 선분 끝점 marker: 연회색
const HANDLE_COLOR = 0xa78bfa; // point 핸들(주 조작 대상): 보라
const HANDLE_R = 7; // 핸들 반지름 (px)
const MARGIN = 24; // 핸들 화면 clamp margin (px)
const LINE_EXT = 1400; // 지지직선을 양끝으로 연장해 그릴 길이 (px) — Pixi가 화면 밖은 잘라냄
const ON_EPS = 0.6; // 점이 직선 위(side=0)라 수선을 생략할 거리 임계 (px)

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

  // 고정 선분(edge). 지지직선의 기준이며 조작 대상이 아니다 (기울여 직선 방향을 드러낸다)
  const seg = { a: { x: 220, y: 308 } as XY, b: { x: 512, y: 168 } as XY };

  // point 핸들: 유일한 drag 대상. 지지직선에 투영할 점 하나를 정한다
  const handle: XY = { x: 392, y: 318 };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let foot: XY = { x: 0, y: 0 }; // 점을 지지직선에 투영한 수선의 발 (unclamped)
  let dist = 0; // 점→지지직선 부호 거리 (좌+ / 우−)
  let side: -1 | 0 | 1 = 0; // 점이 직선 어느 쪽인지

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp → 점이 항상 finite (non-finite pass-through 미발생)
  const clampToScreen = (p: XY): void => {
    handle.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    handle.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  const rebuild = (): void => {
    // 단일 핵심 관계: 점을 지지직선에 투영한 수선의 발. endpoint clamp가 없다
    foot = Segments.nearestPointOnSupportingLine(seg, handle);

    // 같은 관계의 scalar·부호 분해 (선분 고정 non-zero라 zero-length degenerate는 미발생)
    dist = Segments.signedDistanceToSupportingLine(seg, handle);
    side = Segments.sideOfSupportingLine(seg, handle);
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // point 핸들 근처를 누르면 잡는다 (핸들이 유일한 조작 대상)
    grabbed = Math.hypot(p.x - handle.x, p.y - handle.y) <= HANDLE_R + 16;
    if (grabbed) {
      clampToScreen(p);
      rebuild();
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    clampToScreen(getCanvasXY(e));
    rebuild();
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  rebuild(); // 초기 state 1회 계산

  const render = (): void => {
    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 지지직선 단위 방향 (선분이 고정 non-zero라 분모 0 미발생)
    const dx = seg.b.x - seg.a.x;
    const dy = seg.b.y - seg.a.y;
    const segLen = Math.hypot(dx, dy);
    const ux = dx / segLen;
    const uy = dy / segLen;

    // 지지직선 연장: 끝점 너머로 양쪽 LINE_EXT만큼 faint하게 그린다 (발이 나갈 수 있는 영역)
    g.moveTo(seg.a.x - ux * LINE_EXT, seg.a.y - uy * LINE_EXT)
      .lineTo(seg.b.x + ux * LINE_EXT, seg.b.y + uy * LINE_EXT)
      .stroke({ color: LINE_COLOR, width: 1 });

    // 고정 선분 본체 (밝게): 발이 이 위에 있으면 segment 안, 벗어나면 연장선 위
    g.moveTo(seg.a.x, seg.a.y).lineTo(seg.b.x, seg.b.y).stroke({ color: SEG_COLOR, width: 3 });

    // 점 → 수선의 발 수선 (점이 직선 위라 거리≈0이면 생략)
    const onLine = Math.abs(dist) <= ON_EPS;
    if (!onLine) {
      g.moveTo(handle.x, handle.y).lineTo(foot.x, foot.y).stroke({ color: FOOT_COLOR, width: 2 });

      // 직각(⟂) 표식: 발에서 직선 방향·수선 방향 두 축으로 작은 정사각형을 그려 90°를 보인다
      const q = 12; // 직각 표식 변 길이 (px)
      const px = (handle.x - foot.x) / Math.abs(dist); // 발→점 단위 벡터 (수선 방향)
      const py = (handle.y - foot.y) / Math.abs(dist);
      const c1x = foot.x + ux * q;
      const c1y = foot.y + uy * q;
      const c2x = foot.x + px * q;
      const c2y = foot.y + py * q;
      g.moveTo(c1x, c1y)
        .lineTo(c1x + px * q, c1y + py * q)
        .lineTo(c2x, c2y)
        .stroke({ color: 0x475569, width: 1 });
    }

    // 선분 끝점 marker (조작 대상 아님)
    g.circle(seg.a.x, seg.a.y, 5).fill({ color: ENDPOINT_COLOR });
    g.circle(seg.b.x, seg.b.y, 5).fill({ color: ENDPOINT_COLOR });

    // 수선의 발 marker (핵심 관계의 결과)
    g.circle(foot.x, foot.y, 6).fill({ color: FOOT_COLOR });

    // point 핸들 (주 조작 대상)
    g.circle(handle.x, handle.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: 0x0f172a })
      .stroke({ color: HANDLE_COLOR, width: grabbed ? 3 : 2 });

    // side: 1=좌(left), -1=우(right), 0=직선 위 (signedDistance 부호와 일치)
    const sideText = side === 1 ? 'L (left)' : side === -1 ? 'R (right)' : 'on line';

    label.text = [
      `foot : (${foot.x.toFixed(1)}, ${foot.y.toFixed(1)})   drag the point`,
      `dist : ${dist.toFixed(1)} px`,
      `side : ${sideText}`,
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
