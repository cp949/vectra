/**
 * Ray-Cast Visibility
 *
 * 광원을 드래그하면 그 지점에서 사방으로 광선을 쏘아 벽에 가장 먼저 닿는 지점을
 * 잇는 가시 영역(밝은 다각형)이 실시간으로 다시 그려진다. 광원을 벽 모서리 뒤로
 * 옮기면 가려진 영역이 어두워진다.
 *
 * - Rays.fromAngleInto: 각도별 단위 광선을 buffer 하나에 반복 기록 (sweep hot loop)
 * - Intersects.singleIntersectionSegmentRayInto: 광선과 벽 segment의 교점을 구해
 *   광원에서 가장 가까운 hit을 선택
 */

import * as Intersects from '@cp949/vectra/intersects';
import * as Rays from '@cp949/vectra/ray';

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app } = runtime;

  // light 다각형과 벽을 그리는 Graphics 레이어
  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  // 광원 위치 (드래그 대상)
  const origin = { x: 360, y: 330 };

  // 벽 segment 집합: 바깥 테두리 + 사각 장애물 2개 + 삼각 장애물 1개
  const walls: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [
    // 바깥 테두리
    { a: { x: 20, y: 20 }, b: { x: 700, y: 20 } },
    { a: { x: 700, y: 20 }, b: { x: 700, y: 420 } },
    { a: { x: 700, y: 420 }, b: { x: 20, y: 420 } },
    { a: { x: 20, y: 420 }, b: { x: 20, y: 20 } },
    // 사각 장애물 A
    { a: { x: 180, y: 120 }, b: { x: 280, y: 120 } },
    { a: { x: 280, y: 120 }, b: { x: 280, y: 220 } },
    { a: { x: 280, y: 220 }, b: { x: 180, y: 220 } },
    { a: { x: 180, y: 220 }, b: { x: 180, y: 120 } },
    // 사각 장애물 B
    { a: { x: 440, y: 250 }, b: { x: 560, y: 250 } },
    { a: { x: 560, y: 250 }, b: { x: 560, y: 360 } },
    { a: { x: 560, y: 360 }, b: { x: 440, y: 360 } },
    { a: { x: 440, y: 360 }, b: { x: 440, y: 250 } },
    // 삼각 장애물
    { a: { x: 360, y: 80 }, b: { x: 430, y: 200 } },
    { a: { x: 430, y: 200 }, b: { x: 300, y: 200 } },
    { a: { x: 300, y: 200 }, b: { x: 360, y: 80 } },
  ];

  // sweep 광선 수
  const RAY_COUNT = 240;

  // fromAngleInto 출력 buffer (매 광선마다 재기록)
  const ray = { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };

  // singleIntersectionSegmentRayInto 출력 buffer (매 벽마다 재기록)
  const hit = { x: 0, y: 0 };

  // light 다각형 평면 좌표 배열 (매 프레임 length 0으로 reset 후 push)
  const polygon: number[] = [];

  // 드래그 상태
  let dragging = false;

  /** canvas pointer 이벤트에서 canvas 상대 좌표를 반환한다. */
  const getCanvasXY = (e: PointerEvent): { x: number; y: number } => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  /** pointerdown: 광원 hit radius 안이면 드래그 시작 */
  const onPointerDown = (e: PointerEvent): void => {
    const { x, y } = getCanvasXY(e);
    if (Math.hypot(origin.x - x, origin.y - y) < 24) {
      dragging = true;
    }
  };

  /** pointermove: 드래그 중이면 광원을 화면 안으로 clamp 하여 이동 */
  const onPointerMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const { x, y } = getCanvasXY(e);
    origin.x = Math.max(24, Math.min(696, x));
    origin.y = Math.max(24, Math.min(416, y));
  };

  /** pointerup / pointerleave: 드래그 해제 */
  const onPointerUp = (): void => {
    dragging = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  /** 매 ticker 프레임 렌더링. */
  const render = (): void => {
    polygon.length = 0;

    // 광원을 중심으로 한 바퀴 sweep
    for (let i = 0; i < RAY_COUNT; i++) {
      const angle = (i / RAY_COUNT) * Math.PI * 2;
      Rays.fromAngleInto(ray, origin, angle);

      // 이 광선이 벽에 닿는 가장 가까운 hit 선택
      let bestX = 0;
      let bestY = 0;
      let bestDistSq = Number.POSITIVE_INFINITY;
      for (const wall of walls) {
        if (!Intersects.singleIntersectionSegmentRayInto(hit, wall, ray)) continue;
        const dx = hit.x - origin.x;
        const dy = hit.y - origin.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < bestDistSq) {
          bestDistSq = distSq;
          bestX = hit.x;
          bestY = hit.y;
        }
      }

      if (bestDistSq !== Number.POSITIVE_INFINITY) {
        polygon.push(bestX, bestY);
      }
    }

    g.clear();

    // 가시 영역: hit을 이은 light 다각형 (따뜻한 반투명)
    if (polygon.length >= 6) {
      g.poly(polygon).fill({ color: 0xfde68a, alpha: 0.28 });
    }

    // 벽 segment (짙은 회색)
    for (const wall of walls) {
      g.moveTo(wall.a.x, wall.a.y).lineTo(wall.b.x, wall.b.y).stroke({ color: 0x334155, width: 3 });
    }

    // 광원 마커 (주황)
    g.circle(origin.x, origin.y, 7).fill({ color: 0xf59e0b });
  };

  app.ticker.add(render);

  // cleanup: ticker 제거, 이벤트 제거, Graphics 제거
  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    g.destroy();
  };
}
