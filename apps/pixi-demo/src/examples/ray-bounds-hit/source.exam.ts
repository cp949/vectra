/**
 * Ray Bounds Hit
 *
 * 화면 고정 emitter에서 쏜 빔(forward ray, t ≥ 0)의 방향을 aim handle로 돌리면, 그 빔이 고정 사각
 * 영역(AABB / bounds)에 들어가는지 매 프레임 boolean으로 판정한다. 빔이 영역에 닿으면 hit 색,
 * 비껴가면 clear 색으로 바뀌어 "이 forward 빔이 사각 영역에 들어가는가?"(raycast vs AABB) 작업
 * 흐름을 보인다. ray는 forward(t ≥ 0)만 뻗으므로 빔을 영역 반대로 돌리면 backward 연장선이 영역을
 * 지나도 hit=no다.
 *
 * - Intersects.intersectsBoundsRay: bounds와 ray가 교차하거나 접하면 true를 반환한다. bounds 4변을
 *   segment로 보고 각 변과의 line-family intersection을 판정하며, closed boundary 포함(접점도 true),
 *   inverted bounds(min > max)는 false, direction이 zero-vector인 degenerate ray는 점으로 환원해
 *   bounds containment로 판정한다. boolean을 직접 반환해 *Into companion이 없으므로 그대로 호출한다.
 */

import * as Intersects from '@cp949/vectra/intersects';

type XY = { x: number; y: number };
type Bounds = { min: XY; max: XY };

const CLEAR_COLOR = 0x60a5fa; // 안 들어감: 파랑
const HIT_COLOR = 0xf87171; // 들어감: 빨강
const M = 16; // 화면 가장자리 margin (px)
const GRAB_R = 16; // aim handle 잡기 반경 (px)
const BEAM_LEN = 2000; // 빔을 화면 밖까지 늘리는 길이 (px)

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

  // 빔을 쏘는 고정 emitter (조작 대상 아님)
  const origin: XY = { x: 140, y: 250 };
  // 빔 방향을 정하는 주 drag 대상. direction = aim − origin.
  const aim: XY = { x: 470, y: 180 };
  // 고정 사각 영역 (조작 대상 아님). min < max인 valid box라 inverted bounds(false)는 미발생.
  const zone: Bounds = { min: { x: 430, y: 150 }, max: { x: 610, y: 340 } };

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // aim handle 근처를 누르면 잡는다
    const dx = p.x - aim.x;
    const dy = p.y - aim.y;
    grabbed = dx * dx + dy * dy <= GRAB_R * GRAB_R;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // aim을 화면 안으로 clamp → 항상 finite 입력 (NaN/Infinity 회피)
    aim.x = Math.max(M, Math.min(size.width - M, p.x));
    aim.y = Math.max(M, Math.min(size.height - M, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const render = (): void => {
    // ray 입력: origin에서 (aim − origin) 방향으로 뻗는 반직선
    const dir: XY = { x: aim.x - origin.x, y: aim.y - origin.y };
    const ray = { origin, direction: dir };

    // 핵심 호출: forward ray가 사각 영역에 들어가면 true (aim을 emitter에 겹치면
    // direction zero → 점으로 환원돼 bounds containment로 판정되는 degenerate)
    const hit = Intersects.intersectsBoundsRay(zone, ray);
    const stateColor = hit ? HIT_COLOR : CLEAR_COLOR;

    // 빔 그리기용 단위벡터 (그리기 전용 inline 계산, vectra 관계 아님)
    const len = Math.hypot(dir.x, dir.y) || 1;
    const beamEnd: XY = { x: origin.x + (dir.x / len) * BEAM_LEN, y: origin.y + (dir.y / len) * BEAM_LEN };

    // bounds → 그리기용 좌표/크기 inline 분해
    const zx = zone.min.x;
    const zy = zone.min.y;
    const zw = zone.max.x - zone.min.x;
    const zh = zone.max.y - zone.min.y;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 사각 영역: 옅은 fill + 테두리 stroke
    g.rect(zx, zy, zw, zh).fill({ color: stateColor, alpha: 0.12 });
    g.rect(zx, zy, zw, zh).stroke({ color: stateColor, width: 3, alpha: 0.95 });
    // 네 모서리 dot
    g.circle(zx, zy, 4).fill({ color: stateColor });
    g.circle(zx + zw, zy, 4).fill({ color: stateColor });
    g.circle(zx + zw, zy + zh, 4).fill({ color: stateColor });
    g.circle(zx, zy + zh, 4).fill({ color: stateColor });

    // forward 빔: origin → beamEnd (영역 반대로 돌리면 이 선이 영역을 지나지 않아 hit=no)
    g.moveTo(origin.x, origin.y).lineTo(beamEnd.x, beamEnd.y).stroke({ color: stateColor, width: 2, alpha: 0.85 });

    // emitter dot과 aim handle (잡으면 더 크게)
    g.circle(origin.x, origin.y, 6).fill({ color: 0xfacc15 });
    g.circle(aim.x, aim.y, grabbed ? 9 : 7).fill({ color: 0xe2e8f0 });

    // 방향 각도 (diagnostics 표시용 inline)
    const aimDeg = (Math.atan2(dir.y, dir.x) * 180) / Math.PI;

    label.text = [
      `hit : ${hit ? 'yes' : 'no '}`,
      `aim : ${aimDeg.toFixed(1)}°`,
      'drag the aim handle to sweep the beam',
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
