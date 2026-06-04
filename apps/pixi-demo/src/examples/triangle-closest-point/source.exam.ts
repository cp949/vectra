/**
 * Triangle Closest Point
 *
 * draggable probe를 drag하면 고정 삼각형 위에서 probe에 가장 가까운 점을 marker로 스냅하고,
 * probe↔최근접점 연결선이 최단 거리를 보인다. probe가 삼각형 안이면 최근접점은 probe 자신(거리 0),
 * 밖이면 가장 가까운 변 위 점으로 투영된다. "점을 도형 표면으로 밀어내기(push-out) / 표면 스냅"이라는
 * collision 해소·snapping 작업 흐름을 보인다.
 *
 * - Triangles.closestPoint: 삼각형 위에서 주어진 point에 가장 가까운 점을 새 point로 반환한다.
 *   내부/경계 point는 그 좌표 그대로(거리 0), 외부 point는 세 변 AB·BC·CA의 clamped 최근접점 중
 *   거리가 가장 짧은 점으로 투영한다. inside/edge 구분과 연결선 거리는 같은 최근접 관계의 분해다.
 */

import * as Triangles from '@cp949/vectra/triangle';

type XY = { x: number; y: number };

const INSIDE_COLOR = 0x34d399; // 내부(거리 0): 초록
const EDGE_COLOR = 0xfbbf24; // 외부(변에 투영): amber
const M = 16; // 화면 가장자리 margin (px) → probe를 항상 finite로 유지
const GRAB_R = 18; // probe 잡기 반경 (px)
const EPS = 1e-6; // inside 판정 거리 임계(부동소수 여유)

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

  // 고정 scalene triangle (조작 대상 아님). 세 변 길이가 모두 달라 어느 변에 투영되는지 또렷하다.
  // non-degenerate(세 점이 한 직선 위 아님)라 edge 환원·세 vertex 동일 분기는 발생하지 않는다.
  const triangle = {
    a: { x: 250, y: 120 }, // 위쪽 꼭짓점
    b: { x: 560, y: 250 }, // 오른쪽 아래 꼭짓점
    c: { x: 230, y: 360 }, // 왼쪽 아래 꼭짓점
  };

  // probe (유일 drag 대상). 초기 위치는 삼각형 밖 오른쪽 위
  const probe: XY = { x: 620, y: 90 };

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // probe와의 거리로 잡기 판정
    grabbed = Math.hypot(probe.x - p.x, probe.y - p.y) <= GRAB_R;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // probe를 화면 안으로 clamp (자유 이동, 축 제약 없음) → 입력은 항상 finite
    probe.x = Math.max(M, Math.min(size.width - M, p.x));
    probe.y = Math.max(M + 40, Math.min(size.height - M, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(1);

  const render = (): void => {
    // 핵심 호출: 삼각형 위 최근접점. pointermove당 1회 단발이라 allocating companion을 쓴다.
    const nearest = Triangles.closestPoint(triangle, probe);

    // probe↔최근접점 최단 거리. 내부면 nearest===probe라 거리 0이 된다.
    const distance = Math.hypot(probe.x - nearest.x, probe.y - nearest.y);
    // inside/edge는 같은 최근접 관계의 분해: 거리 0이면 내부, 아니면 변 위로 투영된 것이다.
    const inside = distance <= EPS;
    const stateColor = inside ? INSIDE_COLOR : EDGE_COLOR;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 고정 triangle 면 + 외곽선. 면 색은 현재 상태(inside/edge)를 따라간다.
    const tri = [triangle.a.x, triangle.a.y, triangle.b.x, triangle.b.y, triangle.c.x, triangle.c.y];
    g.poly(tri).fill({ color: stateColor, alpha: inside ? 0.28 : 0.12 });
    g.poly(tri).stroke({ color: stateColor, width: 2.5, alpha: 0.95 });

    // probe↔최근접점 연결선(최단 거리). 외부일 때만 의미가 있어 그린다.
    if (!inside) {
      g.moveTo(probe.x, probe.y).lineTo(nearest.x, nearest.y).stroke({ color: 0x94a3b8, width: 1.5 });
    }

    // 최근접 marker (삼각형 위 점)
    g.circle(nearest.x, nearest.y, 6).fill({ color: stateColor });

    // probe (유일 drag 대상)
    g.circle(probe.x, probe.y, grabbed ? 10 : 8).fill({ color: 0xf8fafc });
    g.circle(probe.x, probe.y, grabbed ? 10 : 8).stroke({ color: stateColor, width: 2 });

    label.text = [
      'closest point on triangle   drag probe',
      `distance : ${fmt(distance)}`,
      `nearest  : (${nearest.x.toFixed(0)}, ${nearest.y.toFixed(0)})`,
      `region   : ${inside ? 'inside' : 'edge'}`,
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
