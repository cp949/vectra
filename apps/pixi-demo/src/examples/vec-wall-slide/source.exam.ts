/**
 * Vec Wall Slide
 *
 * 화면 고정 벽(충돌 표면) 위 anchor에서 velocity tip 핸들 1개를 drag하면 `slide`가 이동 벡터에서
 * 벽으로 파고드는 normal 성분을 제거한 slid 벡터를 다시 계산한다. 핸들을 어디로 끌든 slid는 항상
 * 벽 방향에 평행해, 벽에 부딪힌 오브젝트가 멈추지 않고 벽을 따라 미끄러지는 게임 충돌 응답
 * (wall-slide) 작업 흐름을 보인다.
 *
 * - Vectors.slide: (v, normal)에서 normal 성분을 제거한(v − dot(v,n)/|n|²·n) 벡터를 새 object로
 *   반환한다. drag당 1회 단발 결과라 allocating companion을 그대로 호출한다(out-buffer scaffold 미사용).
 */

import * as Vectors from '@cp949/vectra/vec';

type XY = { x: number; y: number };

const WALL_COLOR = 0x475569; // 고정 벽(충돌 표면): 회색 (조작 대상 아님)
const VELOCITY_COLOR = 0xa78bfa; // 입력 이동 벡터 v (anchor → handle): 보라
const SLIDE_COLOR = 0x38bdf8; // 미끄러진 결과 slid (벽 방향 평행): 하늘색
const NORMAL_COLOR = 0x334155; // 제거된 normal 성분(v − slid, 벽에 수직): 어두운 회색
const ANCHOR_COLOR = 0x94a3b8; // 벽 위 anchor(오브젝트 위치) marker: 연회색
const WARN_COLOR = 0xf97316; // 벽에 수직 입력 → slid 붕괴(head-on) warn: 주황
const HANDLE_R = 7; // velocity 핸들 반지름 (px)
const MARGIN = 24; // 핸들 화면 clamp margin (px)
const DEGEN_EPS = 2; // slid 길이 붕괴 판정 임계 (px)

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

  // 화면 고정 벽(충돌 표면). 양 끝점 모두 고정이라 벽 방향·normal은 항상 일정 (조작 대상 아님)
  const wallA: XY = { x: 200, y: 330 };
  const wallB: XY = { x: 560, y: 210 };
  // 오브젝트 위치 = 벽 중점. 이동 벡터 v는 이 anchor에서 시작한다 (고정)
  const anchor: XY = { x: (wallA.x + wallB.x) / 2, y: (wallA.y + wallB.y) / 2 };

  // 벽 normal: 벽 방향 d = (b−a)에 수직인 left normal (−d.y, d.x). slide는 임의 길이 normal을
  // 받으므로 정규화하지 않고 inline으로 둔다 (별도 import 없이 단일 vec domain 유지)
  const dx = wallB.x - wallA.x;
  const dy = wallB.y - wallA.y;
  const normal: XY = { x: -dy, y: dx };
  const normalLen = Math.hypot(normal.x, normal.y); // signed into-wall 거리 환산용 (벽 고정이라 1회만)

  // velocity tip 핸들: 주 drag 대상. 이동 벡터 v = handle − anchor 하나를 정한다
  const handle: XY = { x: 430, y: 120 };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let slid: XY = { x: 0, y: 0 }; // 미끄러진 결과 벡터
  let slideTip: XY = { x: 0, y: 0 }; // anchor + slid (slid 벡터의 끝점)
  let inDeg = 0; // 입력 벡터 v의 각 (도)
  let slideLen = 0; // |slid| (벽을 따라 이동하는 거리)
  let intoWall = 0; // 벽으로 파고드는 signed 거리 (= dot(v, n)/|n|)

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp → v가 항상 finite (non-finite pass-through 미발생)
  const clampToScreen = (p: XY): void => {
    handle.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    handle.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  // 입력 벡터 v에서 벽 normal 성분을 제거해 벽 따라 미끄러지는 slid를 다시 계산 (drag 1회마다 호출)
  const rebuild = (): void => {
    const v: XY = { x: handle.x - anchor.x, y: handle.y - anchor.y };
    inDeg = (Math.atan2(v.y, v.x) * 180) / Math.PI;
    // 핵심 호출: 벽으로 파고드는 normal 성분을 제거 → slid는 벽 방향에 평행한 성분만 남는다
    slid = Vectors.slide(v, normal) as XY;
    slideTip = { x: anchor.x + slid.x, y: anchor.y + slid.y };
    slideLen = Math.hypot(slid.x, slid.y);
    // 제거된 양: v를 단위 normal에 투영한 signed 거리. slid 벡터에는 이 성분이 없음을 inline 확인
    intoWall = (v.x * normal.x + v.y * normal.y) / normalLen;
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // velocity tip handle 근처를 누르면 잡는다 (handle이 유일한 조작 대상)
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

    // 고정 벽(충돌 표면)
    g.moveTo(wallA.x, wallA.y).lineTo(wallB.x, wallB.y).stroke({ color: WALL_COLOR, width: 3 });

    // 제거된 normal 성분: handle → slideTip (벽에 수직, 같은 slide 관계의 분해 표시)
    g.moveTo(handle.x, handle.y).lineTo(slideTip.x, slideTip.y).stroke({ color: NORMAL_COLOR, width: 2 });

    // 입력 이동 벡터 v: anchor → handle
    g.moveTo(anchor.x, anchor.y).lineTo(handle.x, handle.y).stroke({ color: VELOCITY_COLOR, width: 2 });

    // slid가 붕괴(head-on)면 warn 색: velocity가 벽에 수직 → 벽 따라 못 움직임
    const degenerate = slideLen <= DEGEN_EPS;
    const slideStroke = degenerate ? WARN_COLOR : SLIDE_COLOR;

    // 미끄러진 결과 slid: anchor → slideTip (항상 벽 방향에 평행)
    g.moveTo(anchor.x, anchor.y).lineTo(slideTip.x, slideTip.y).stroke({ color: slideStroke, width: 4 });

    // 벽 위 anchor(오브젝트 위치) marker
    g.circle(anchor.x, anchor.y, 5).fill({ color: ANCHOR_COLOR });

    // slid 끝점 marker (붕괴 시 warn)
    g.circle(slideTip.x, slideTip.y, 5).fill({ color: slideStroke });

    // velocity tip 핸들 (주 조작 대상)
    g.circle(handle.x, handle.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: 0x0f172a })
      .stroke({ color: VELOCITY_COLOR, width: grabbed ? 3 : 2 });

    label.text = [
      `in   : ${inDeg.toFixed(1)}°   drag tip`,
      `slide: ${slideLen.toFixed(0)} px${degenerate ? '  (head-on)' : '  (along wall)'}`,
      `into : ${intoWall.toFixed(0)} px  (removed)`,
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
