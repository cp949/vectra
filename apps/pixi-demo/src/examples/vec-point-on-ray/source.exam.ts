/**
 * Vec Point On Ray
 *
 * 화면 중앙 고정 origin에서 방향 handle 1개를 drag하면 ray 각도가 바뀐다. 매 프레임 distance가
 * 일정 속도로 음수↔양수를 왕복하면 marker가 그 ray 위를 부호 있는 거리만큼 미끄러진다. distance가
 * 음수가 되면 marker는 origin을 지나 ray 반대편으로 간다. 방향은 내부에서 정규화되므로 handle을
 * origin에서 멀리/가까이 끌어도 marker가 도달하는 거리(= |distance|)는 바뀌지 않는다.
 *
 * - Vectors.pointOnRay: origin + normalize(direction) × distance 위치의 점. marker 위치.
 *   direction이 zero-length면 undefined를 반환한다(handle을 origin에 겹친 degenerate).
 * - Vectors.normalize: direction의 단위 벡터. origin 위 unit direction tick과 ray line 작도에 쓴다.
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

  // origin은 화면 중앙에 고정 (ray 기준점)
  const origin: XY = { x: size.width / 2, y: size.height / 2 };
  // 방향 handle은 사용자가 끄는 유일한 주 대상 (ray 각도를 정한다. origin과의 거리는 무시됨)
  const handle: XY = { x: size.width / 2 + 170, y: size.height / 2 - 70 };

  // distance는 ticker가 자동으로 sin 왕복시키는 부호 있는 거리 (음수면 반대편으로)
  let phase = 0;
  const DISTANCE_RANGE = 190; // ping-pong 진폭 (px)
  const UNIT_LEN = 44; // unit direction tick의 화면 길이 (px)
  const RAY_LEN = 320; // ray line을 그릴 화면 길이 (px)

  const HIT_RADIUS = 20;
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
    // handle을 화면 안으로 clamp (origin에 겹치면 zero-length direction degenerate)
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

  const render = (): void => {
    // distance를 sin으로 -RANGE↔+RANGE 등속 왕복시킨다 (0을 지나 부호가 바뀜)
    phase += 0.02;
    const distance = DISTANCE_RANGE * Math.sin(phase);

    // direction = origin → handle 벡터. handle 거리(dir len)는 normalize로 곧 무시된다
    const dir: XY = { x: handle.x - origin.x, y: handle.y - origin.y };
    const dirLen = Math.hypot(dir.x, dir.y);

    // 핵심 호출: origin + normalize(dir) × distance. zero-length dir이면 undefined
    const marker = Vectors.pointOnRay(origin, dir, distance);
    // unit direction (작도용). zero-length면 (0,0)이 되어 ray가 사라진다
    const unit = Vectors.normalize(dir);
    // handle을 origin에 겹친 degenerate (ray 방향이 정의되지 않음)
    const degenerate = marker === undefined;

    // distance 부호로 forward(+)/backward(-) marker 색 구분
    const markerColor = distance >= 0 ? 0x4ade80 : 0xf472b6;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    if (!degenerate) {
      // ray line: forward(+unit, solid)와 backward(-unit, faint)로 부호 축을 보인다
      g.moveTo(origin.x, origin.y)
        .lineTo(origin.x + unit.x * RAY_LEN, origin.y + unit.y * RAY_LEN)
        .stroke({ color: 0x334155, width: 1.5 });
      g.moveTo(origin.x, origin.y)
        .lineTo(origin.x - unit.x * RAY_LEN, origin.y - unit.y * RAY_LEN)
        .stroke({ color: 0x1e293b, width: 1 });

      // unit direction tick: handle 거리와 무관하게 항상 같은 길이 (정규화 강조)
      g.moveTo(origin.x, origin.y)
        .lineTo(origin.x + unit.x * UNIT_LEN, origin.y + unit.y * UNIT_LEN)
        .stroke({ color: 0x94a3b8, width: 3 });
    }

    // origin → handle 기준선 (drag한 방향. 길이는 무시됨을 점선 느낌의 faint로)
    g.moveTo(origin.x, origin.y).lineTo(handle.x, handle.y).stroke({ color: 0x475569, width: 1, alpha: 0.5 });

    // origin 마커 (고정 기준점, distance=0 위치)
    g.circle(origin.x, origin.y, 5).fill({ color: 0xe2e8f0 });

    // 방향 handle (주 drag 대상)
    g.circle(handle.x, handle.y, grabbed ? 9 : 7).fill({ color: degenerate ? 0xf87171 : 0x94a3b8 });
    g.circle(handle.x, handle.y, HIT_RADIUS).stroke({ color: 0x94a3b8, width: 1, alpha: 0.16 });

    // marker (ray 위 부호 거리 위치). degenerate면 그리지 않는다
    if (!degenerate && marker) {
      // origin → marker 거리선 (현재 부호 거리 위치를 가리킨다)
      g.moveTo(origin.x, origin.y).lineTo(marker.x, marker.y).stroke({ color: markerColor, width: 2 });
      g.circle(marker.x, marker.y, 7).fill({ color: markerColor });
    }

    // marker의 origin 거리 (정규화 덕분에 항상 |distance|와 같다)
    const markerDist = degenerate || !marker ? 0 : Math.hypot(marker.x - origin.x, marker.y - origin.y);

    label.text = [
      `distance: ${fmt(distance)} px   drag direction`,
      degenerate ? 'marker  :   (degenerate: zero-length direction)' : `marker  : ${fmt(markerDist)} px from origin`,
      `dir len : ${fmt(dirLen)} px   (ignored: normalized)`,
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
