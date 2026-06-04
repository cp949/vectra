/**
 * Ray Cubic Hits
 *
 * 화면 고정 emitter에서 쏜 forward ray(t ≥ 0)의 방향을 aim handle로 돌리면, 그 빔이 고정 cubic
 * Bezier 곡선과 만나는 지점을 매 프레임 교차점 marker로 다시 그린다. 빔이 곡선을 비껴가면 marker
 * 0개, S자 곡선을 가로지르면 최대 3개까지 나타나 "이 forward 빔이 곡선 path의 어디에 명중하는가?"
 * (raycast vs cubic curve)라는 작업 흐름을 보인다.
 *
 * - Intersects.rayCubicIntersections: ray와 cubic Bezier 곡선의 교차점을 IntersectionHit[]로 반환한다.
 *   tA >= 0(forward ray) hit만 남기므로 빔을 곡선 반대로 돌리면 backward 연장선이 곡선을 지나도
 *   교차점이 0개다. 각 hit의 point는 곡선 위 좌표, tA는 ray line parameter, tB는 곡선 parameter [0,1]다.
 *   배열을 새로 반환하므로 결과를 한 번만 쓰는 이 예제에서는 allocating companion을 그대로 호출한다.
 */

import * as Intersects from '@cp949/vectra/intersects';

type XY = { x: number; y: number };

const CLEAR_COLOR = 0x60a5fa; // 교차 없음: 파랑
const HIT_COLOR = 0xf87171; // 교차 있음: 빨강
const CURVE_COLOR = 0x94a3b8; // 고정 곡선: 회색
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

  // 빔을 쏘는 고정 emitter (조작 대상 아님). 곡선 왼쪽 멀리 둬 zero-direction degenerate를 피한다.
  const origin: XY = { x: 90, y: 320 };
  // 빔 방향을 정하는 주 drag 대상. direction = aim − origin.
  const aim: XY = { x: 470, y: 180 };
  // 고정 cubic Bezier 곡선 (조작 대상 아님). 빔이 여러 번 가로지르도록 S자로 둔다.
  const p0: XY = { x: 330, y: 380 };
  const p1: XY = { x: 470, y: 80 };
  const p2: XY = { x: 560, y: 420 };
  const p3: XY = { x: 660, y: 150 };

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

    // 핵심 호출: forward ray(t ≥ 0)와 cubic 곡선의 교차점들 (곡선 반대로 돌리면 빈 배열)
    const hits = Intersects.rayCubicIntersections(ray, p0, p1, p2, p3);
    const stateColor = hits.length > 0 ? HIT_COLOR : CLEAR_COLOR;

    // 빔 그리기용 단위벡터 (그리기 전용 inline 계산, vectra 관계 아님)
    const len = Math.hypot(dir.x, dir.y) || 1;
    const beamEnd: XY = { x: origin.x + (dir.x / len) * BEAM_LEN, y: origin.y + (dir.y / len) * BEAM_LEN };

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 고정 cubic 곡선: 입력 시각화 (renderer 책임, vectra 관계 아님)
    g.moveTo(p0.x, p0.y).bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y).stroke({ color: CURVE_COLOR, width: 3 });
    // 곡선 끝점 (시작=초록, 끝=주황)으로 곡선 진행 방향 표시
    g.circle(p0.x, p0.y, 4).fill({ color: 0x4ade80 });
    g.circle(p3.x, p3.y, 4).fill({ color: 0xfb923c });

    // forward 빔: origin → beamEnd (곡선 반대로 돌리면 이 선이 곡선을 지나도 hit=0)
    g.moveTo(origin.x, origin.y).lineTo(beamEnd.x, beamEnd.y).stroke({ color: stateColor, width: 2, alpha: 0.85 });

    // 교차점 marker: 곡선 위 명중점 (핵심 산출물)
    for (const hit of hits) {
      g.circle(hit.point.x, hit.point.y, 6).fill({ color: HIT_COLOR });
      g.circle(hit.point.x, hit.point.y, 6).stroke({ color: 0xffffff, width: 1.5 });
    }

    // emitter dot과 aim handle (잡으면 더 크게)
    g.circle(origin.x, origin.y, 6).fill({ color: 0xfacc15 });
    g.circle(aim.x, aim.y, grabbed ? 9 : 7).fill({ color: 0xe2e8f0 });

    // 빔 진행상 가장 먼저 닿는 점 = tA 최소 hit. 그 점의 곡선 parameter tB를 표시.
    let nearest = hits[0];
    for (const hit of hits) {
      if (hit.tA < nearest.tA) nearest = hit;
    }
    const aimDeg = (Math.atan2(dir.y, dir.x) * 180) / Math.PI;

    label.text = [
      `hits  : ${hits.length}`,
      `near t: ${nearest ? nearest.tB.toFixed(3) : '—'}`,
      `aim   : ${aimDeg.toFixed(1)}°`,
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
