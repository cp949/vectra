/**
 * Rect Halves Split
 *
 * 화면 고정 frame rect 위에서 divider 핸들 1개를 좌우로 drag하면 `halves`가 frame을 좌/우 두
 * 패널(first/second)로 다시 분할한다. divider의 x가 곧 분할 ratio이자 두 패널의 공통 변이므로,
 * divider를 옮기면 두 패널 width가 동시에 바뀐다. "split-pane / divider를 끌어 두 패널 비율을
 * 조절한다"라는 레이아웃 분할 작업 흐름을 보인다.
 *
 * - Rects.halves: rect를 axis 'x'(좌/우) ratio 기준 두 패널 rect로 분할해 새 nested object를
 *   반환한다. divider x를 frame 안으로 clamp해 ratio를 [0,1]로 강제하므로 두 패널 width가 항상
 *   ≥ 0이고 RangeError가 나지 않는다. drag당 1회 단발 결과라 allocating companion(`halves`)을
 *   그대로 호출한다.
 */

import * as Rects from '@cp949/vectra/rect';

type XY = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };

const FIRST_COLOR = 0x60a5fa; // 좌측 패널(first): 파랑
const SECOND_COLOR = 0xfbbf24; // 우측 패널(second): 호박
const SPLIT_COLOR = 0xe2e8f0; // 정상 divider·핸들 색
const WARN_COLOR = 0xf87171; // divider가 변에 붙어 한 패널이 0으로 붕괴: 빨강
const DEGEN_EPS = 2; // 패널 width가 이 값 이하면 divider 붕괴로 본다 (px)
const HANDLE_R = 7; // divider 핸들 반지름 (px)

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

  // 분할할 frame: 화면 고정 rect (조작 대상 아님). 항상 valid(width/height > 0)라 negative-dim 미발생
  const frame: Rect = { x: 200, y: 90, width: 320, height: 250 };

  // divider x: 주 drag 대상. halves의 분할 ratio를 정하며 두 패널의 공통 변이다
  let dividerX = frame.x + frame.width / 2;

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // divider x를 frame 좌/우 변 사이로 clamp → ratio가 항상 [0,1] finite (밖이면 halves가 RangeError를
  // 내지만 clamp로 미발생, 변 위(ratio 0/1)는 valid 경계로 허용)
  const clampToFrame = (x: number): void => {
    dividerX = Math.max(frame.x, Math.min(frame.x + frame.width, x));
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // frame 내부를 누르면 divider를 그 x로 잡는다 (frame 전체가 divider의 drag 표면)
    grabbed = p.x >= frame.x && p.x <= frame.x + frame.width && p.y >= frame.y && p.y <= frame.y + frame.height;
    if (grabbed) clampToFrame(p.x);
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    clampToFrame(getCanvasXY(e).x);
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const pct = (n: number): string => `${(n * 100).toFixed(0)}%`;

  // 패널 중앙에 라벨을 그린다 (패널이 0으로 붕괴하면 생략)
  const panelLabels: PIXI.Text[] = [];
  const drawPanelLabel = (cx: number, cy: number, text: string, i: number): void => {
    let t = panelLabels[i];
    if (!t) {
      t = new PIXI.Text({ text, style: { fill: 0x0f172a, fontFamily: 'monospace', fontSize: 13 } });
      t.anchor.set(0.5);
      app.stage.addChild(t);
      panelLabels[i] = t;
    }
    t.text = text;
    t.position.set(cx, cy);
    t.visible = true;
  };

  const render = (): void => {
    // divider x를 frame 대비 ratio로 환산 (clamp되어 항상 [0,1])
    const ratio = (dividerX - frame.x) / frame.width;

    // 핵심 호출: ratio 기준으로 frame을 좌/우 두 패널로 분할 (axis 기본값 'x')
    const h = Rects.halves(frame, { ratio });

    // divider가 변에 붙어 한 패널이 0 width로 붕괴하는지 = 같은 split의 inline 분해
    const degen = Math.min(h.first.width, h.second.width) <= DEGEN_EPS;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 두 패널을 각자 색으로 채운다 (단일 split의 출력을 그대로 그림)
    const panels: Array<{ r: Rect; color: number; name: string }> = [
      { r: h.first, color: FIRST_COLOR, name: 'first' },
      { r: h.second, color: SECOND_COLOR, name: 'second' },
    ];
    panels.forEach((p, i) => {
      g.rect(p.r.x, p.r.y, p.r.width, p.r.height).fill({ color: p.color, alpha: 0.32 });
      // 패널이 0으로 붕괴하면 라벨을 숨긴다
      if (p.r.width > DEGEN_EPS) {
        drawPanelLabel(p.r.x + p.r.width / 2, p.r.y + p.r.height / 2, p.name, i);
      } else if (panelLabels[i]) {
        panelLabels[i].visible = false;
      }
    });

    // frame 외곽선
    g.rect(frame.x, frame.y, frame.width, frame.height).stroke({ color: SPLIT_COLOR, width: 2 });

    // divider(수직 분할선): 패널이 붕괴하면 warn 색
    g.moveTo(dividerX, frame.y)
      .lineTo(dividerX, frame.y + frame.height)
      .stroke({ color: degen ? WARN_COLOR : SPLIT_COLOR, width: 2 });

    // divider 핸들: frame 세로 중앙에 두며 두 패널의 공통 변 위에 놓인다
    const handleColor = degen ? WARN_COLOR : SPLIT_COLOR;
    g.circle(dividerX, frame.y + frame.height / 2, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: 0x0f172a })
      .stroke({ color: handleColor, width: grabbed ? 3 : 2 });

    label.text = [
      `split : ${pct(ratio)}   drag divider`,
      `left  : ${h.first.width.toFixed(0)} px`,
      `right : ${h.second.width.toFixed(0)} px`,
    ].join('\n');
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    for (const t of panelLabels) t?.destroy();
    label.destroy();
    g.destroy();
  };
}
