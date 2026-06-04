/**
 * Random Point On Segment
 *
 * 고정 spawn edge(선분) 위에 매 프레임 균일 난수 점을 흩뿌린다. 선분의 한 끝점 핸들을 drag하면
 * spawn edge가 바뀌고, 새 점들은 항상 live 선분을 따라 균일하게 뿌려져 "한 선분을 따라
 * 파티클을 균일하게 emit한다"는 작업 흐름을 보인다. 핵심 관계는 선분 → 선분 위 균일 난수 점
 * 하나뿐이다.
 *
 * - Random.pointOnSegment: 선분 두 끝점 a,b를 t∈[0,1) linear interpolation으로 샘플한 균일 난수
 *   점을 새 object로 반환한다(rng 생략 시 default entropy source). 점마다 retain되는 distinct
 *   결과라 allocating companion을 그대로 호출한다(pointOnSegmentInto out-buffer 재사용 hot path가
 *   아님). t∈[0,1) 반열림이라 b 끝점은 정확히 샘플되지 않는다. a===b(끝점 겹침)면 endpoint를
 *   반환하고 throw하지 않아, 점들이 한 점으로 모이는 게 자체로 드러나므로 라이브 warn을 만들지
 *   않는다. 끝점은 화면 clamp라 좌표가 항상 finite다.
 */

import * as Random from '@cp949/vectra/random';

type XY = { x: number; y: number };

const EDGE_COLOR = 0x334155; // spawn edge 선분(고정 host): 어두운 회색
const FIXED_COLOR = 0x94a3b8; // 고정 끝점 marker: 회색
const HANDLE_COLOR = 0xa78bfa; // draggable 끝점 핸들(주 조작 대상): 보라
const DOT_COLOR = 0x38bdf8; // emit된 난수 점: 하늘색

const MAX_POINTS = 260; // 화면에 유지할 점 상한 (초과 시 가장 오래된 점부터 제거)
const SPAWN_PER_FRAME = 2; // 프레임당 새로 emit하는 점 수
const DOT_R = 2.4; // 점 반지름 (px)
const HANDLE_R = 9; // draggable 끝점 핸들 반지름 (px)
const GRAB_R = 18; // 핸들 잡기 허용 반경 (px)

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

  // 선분 한 끝점은 고정, 다른 끝점만 drag한다. 이 둘이 spawn edge를 정한다
  const a: XY = { x: size.width * 0.18, y: size.height * 0.68 };
  const b: XY = { x: size.width * 0.82, y: size.height * 0.34 };

  // emit된 점들의 ring. 최신이 배열 끝, FIFO로 오래된 점부터 버린다
  const points: XY[] = [];

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 끝점을 화면 안으로 clamp → 좌표가 항상 finite (non-finite 점 미발생)
  const clampToScreen = (p: XY): void => {
    b.x = Math.max(0, Math.min(size.width, p.x));
    b.y = Math.max(0, Math.min(size.height, p.y));
  };

  const onPointerDown = (e: PointerEvent): void => {
    const pt = getCanvasXY(e);
    // draggable 끝점 근처를 누르면 잡는다
    grabbed = Math.hypot(pt.x - b.x, pt.y - b.y) <= GRAB_R;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    clampToScreen(getCanvasXY(e));
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
    // 단일 핵심 관계: live 선분 {a,b} → 선분 위 균일 난수 점. 매 프레임 소수를 emit한다
    for (let i = 0; i < SPAWN_PER_FRAME; i += 1) {
      points.push(Random.pointOnSegment({ a, b }));
    }
    // 상한 초과분은 가장 오래된 점부터 제거 (흐르는 emit 효과)
    while (points.length > MAX_POINTS) points.shift();

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // spawn edge 선분(고정 host)
    g.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ color: EDGE_COLOR, width: 2 });

    // emit된 점들: 최신일수록 진하게(alpha 램프) 그려 흐름을 보인다
    for (let i = 0; i < points.length; i += 1) {
      const p = points[i];
      const recency = (i + 1) / points.length; // 0(오래됨)~1(최신)
      g.circle(p.x, p.y, DOT_R).fill({ color: DOT_COLOR, alpha: 0.12 + recency * 0.88 });
    }

    // 고정 끝점 marker + draggable 끝점 핸들(주 조작 대상)
    g.circle(a.x, a.y, 5).fill({ color: FIXED_COLOR });
    g.circle(b.x, b.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: 0x0f172a })
      .stroke({ color: HANDLE_COLOR, width: grabbed ? 3 : 2 });

    const edgeLen = Math.hypot(b.x - a.x, b.y - a.y); // spawn edge 길이 (분포 폭)
    label.text = [
      `points : ${points.length}/${MAX_POINTS}`,
      `edge len: ${edgeLen.toFixed(0)} px`,
      'drag endpoint',
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
