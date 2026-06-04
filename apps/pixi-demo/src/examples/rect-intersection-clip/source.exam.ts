/**
 * Rect Intersection Clip
 *
 * 화면 고정 프레임 A와 draggable 박스 B를 두고, B를 drag하면 두 사각형이 겹치는 영역(클립
 * 사각형)을 매 프레임 계산해 노란 채움으로 강조한다. 두 박스가 떨어지거나 모서리·변만 닿으면
 * 겹친 area가 0이라 클립 영역이 사라지고 "no overlap"으로 바뀐다. "두 rect의 겹친 부분만 잘라
 * 그린다"라는 clip-rect / dirty-rect 작업 흐름을 보인다.
 *
 * - Rectx.intersection: 두 rect의 양수-area 교집합 사각형을 새 rect로 반환한다. 겹침이 없거나
 *   변/모서리 접촉처럼 area가 0이면 undefined를 반환하므로, 그 반환값이 그대로 "겹침 없음"
 *   분기를 만든다. 클립 결과를 프레임당 한 번 읽고 버리므로 allocating companion을 쓴다.
 * - Rectx.area: 클립 사각형의 면적을 구해 diagnostics에 표시한다. 겹친 영역 크기를 수치로 확인한다.
 */

import * as Rectx from '@cp949/vectra/rect';

type XY = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };

const FRAME_COLOR = 0x64748b; // 고정 프레임 A
const BOX_COLOR = 0x38bdf8; // draggable 박스 B
const CLIP_COLOR = 0xfbbf24; // 겹친 클립 영역 강조: 노랑
const M = 24; // 박스가 머무는 화면 margin (px)
const TOP = 70; // 박스 영역 상단(라벨 아래)

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

  // 프레임 A: 화면 고정 rect (조작 대상 아님). 항상 valid(width/height > 0)
  const a: Rect = { x: 250, y: 120, width: 300, height: 220 };
  // 박스 B: 주 drag 대상. 위치만 옮기고 너비·높이는 고정
  const b: Rect = { x: 300, y: 200, width: 180, height: 150 };

  let grabbed = false;
  let grabDX = 0; // pointer와 b.x의 오프셋 (drag 중 유지)
  let grabDY = 0;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 박스 B 내부를 누르면 잡는다
    grabbed = p.x >= b.x && p.x <= b.x + b.width && p.y >= b.y && p.y <= b.y + b.height;
    if (grabbed) {
      grabDX = p.x - b.x;
      grabDY = p.y - b.y;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // B는 화면 margin으로 clamp → A와 완전히 떨어진 상태도 도달 가능 + 항상 finite 입력
    b.x = Math.max(M, Math.min(size.width - M - b.width, p.x - grabDX));
    b.y = Math.max(TOP, Math.min(size.height - M - b.height, p.y - grabDY));
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
    // 핵심 호출: 두 rect의 양수-area 교집합. 겹침이 없으면 undefined
    const clip = Rectx.intersection(a, b);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 프레임 A: 옅은 채움 + 외곽선
    g.rect(a.x, a.y, a.width, a.height)
      .fill({ color: FRAME_COLOR, alpha: 0.12 })
      .stroke({ color: FRAME_COLOR, width: 2 });

    // 박스 B(drag 대상): 외곽선만, 잡으면 굵게
    g.rect(b.x, b.y, b.width, b.height).stroke({ color: BOX_COLOR, width: grabbed ? 3 : 2 });

    if (clip) {
      // 겹친 영역만 잘라 노란 채움으로 강조 (clip-rect)
      g.rect(clip.x, clip.y, clip.width, clip.height)
        .fill({ color: CLIP_COLOR, alpha: 0.4 })
        .stroke({ color: CLIP_COLOR, width: 2 });
    }

    // 클립 면적: 겹침이 없으면 0
    const area = clip ? Rectx.area(clip) : 0;
    label.text = clip
      ? [
          `overlap: yes   drag box B`,
          `clip   : ${clip.width.toFixed(0)} x ${clip.height.toFixed(0)} px`,
          `area   : ${area.toFixed(0)} px²`,
        ].join('\n')
      : ['overlap: no    drag box B', 'clip   : -', 'area   : 0 px²'].join('\n');
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
