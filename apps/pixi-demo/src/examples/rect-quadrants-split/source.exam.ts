/**
 * Rect Quadrants Split
 *
 * 화면 고정 frame rect 위에서 split point 핸들 1개를 drag하면 `quadrants`가 frame을 4개
 * 사분면 cell(nw/ne/se/sw)로 다시 분할한다. split point가 곧 4 cell의 공통 corner이므로,
 * 점을 옮기면 네 cell 크기가 동시에 바뀐다. "quad-view splitter / 4-up 패널을 한 점으로
 * 나눈다"라는 레이아웃 분할 작업 흐름을 보인다.
 *
 * - Rects.quadrants: rect를 split point 기준 4개 사분면 rect로 분할해 새 nested object를
 *   반환한다. split point를 frame 안으로 clamp하므로 네 cell width/height가 항상 ≥ 0이다.
 *   drag당 1회 단발 결과라 allocating companion(`quadrants`)을 그대로 호출한다.
 */

import * as Rects from '@cp949/vectra/rect';

type XY = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };

const NW_COLOR = 0x60a5fa; // 좌상 cell: 파랑
const NE_COLOR = 0xf472b6; // 우상 cell: 분홍
const SE_COLOR = 0xfbbf24; // 우하 cell: 호박
const SW_COLOR = 0x34d399; // 좌하 cell: 초록
const SPLIT_COLOR = 0xe2e8f0; // 정상 분할선·핸들 색
const WARN_COLOR = 0xf87171; // 분할선이 변에 붙어 한 cell이 0으로 붕괴: 빨강
const DEGEN_EPS = 2; // cell width/height가 이 값 이하면 분할선 붕괴로 본다 (px)
const HANDLE_R = 7; // split point 핸들 반지름 (px)

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

  // 분할할 frame: 화면 고정 rect (조작 대상 아님). 항상 valid(width/height > 0)라 empty degenerate 미발생
  const frame: Rect = { x: 200, y: 90, width: 320, height: 250 };

  // split point: 주 drag 대상. quadrants의 분할 기준 center이자 4 cell의 공통 corner
  const split: XY = { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // pointer를 frame 안으로 clamp → 항상 finite + 네 cell width/height ≥ 0 (center가 rect 밖이면
  // quadrants는 negative dim을 그대로 내지만 clamp로 미발생, 변 위(=edge)는 valid 경계로 허용)
  const clampToFrame = (p: XY): void => {
    split.x = Math.max(frame.x, Math.min(frame.x + frame.width, p.x));
    split.y = Math.max(frame.y, Math.min(frame.y + frame.height, p.y));
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // frame 내부를 누르면 split point를 그 위치로 잡는다 (frame 전체가 split point의 drag 표면)
    grabbed = p.x >= frame.x && p.x <= frame.x + frame.width && p.y >= frame.y && p.y <= frame.y + frame.height;
    if (grabbed) clampToFrame(p);
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    clampToFrame(getCanvasXY(e));
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

  // cell 중앙에 사분면 라벨을 그린다 (cell이 0으로 붕괴하면 생략)
  const cellLabels: PIXI.Text[] = [];
  const drawCellLabel = (cx: number, cy: number, text: string, i: number): void => {
    let t = cellLabels[i];
    if (!t) {
      t = new PIXI.Text({ text, style: { fill: 0x0f172a, fontFamily: 'monospace', fontSize: 13 } });
      t.anchor.set(0.5);
      app.stage.addChild(t);
      cellLabels[i] = t;
    }
    t.text = text;
    t.position.set(cx, cy);
    t.visible = true;
  };

  const render = (): void => {
    // 핵심 호출: split point 기준으로 frame을 4 사분면 cell로 분할
    const q = Rects.quadrants(frame, split);

    // split point가 변에 붙어 한 column/row가 0으로 붕괴하는지 = 같은 partition의 inline 분해
    const colDegen = Math.min(q.nw.width, q.ne.width) <= DEGEN_EPS; // 세로 분할선 붕괴
    const rowDegen = Math.min(q.nw.height, q.sw.height) <= DEGEN_EPS; // 가로 분할선 붕괴

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 4 cell을 각자 색으로 채운다 (단일 partition의 출력을 그대로 그림)
    const cells: Array<{ r: Rect; color: number; name: string }> = [
      { r: q.nw, color: NW_COLOR, name: 'NW' },
      { r: q.ne, color: NE_COLOR, name: 'NE' },
      { r: q.se, color: SE_COLOR, name: 'SE' },
      { r: q.sw, color: SW_COLOR, name: 'SW' },
    ];
    cells.forEach((c, i) => {
      g.rect(c.r.x, c.r.y, c.r.width, c.r.height).fill({ color: c.color, alpha: 0.32 });
      // cell이 한 변으로 붕괴하면 라벨을 숨긴다
      if (c.r.width > DEGEN_EPS && c.r.height > DEGEN_EPS) {
        drawCellLabel(c.r.x + c.r.width / 2, c.r.y + c.r.height / 2, c.name, i);
      } else if (cellLabels[i]) {
        cellLabels[i].visible = false;
      }
    });

    // frame 외곽선
    g.rect(frame.x, frame.y, frame.width, frame.height).stroke({ color: SPLIT_COLOR, width: 2 });

    // 세로 분할선(split.x) + 가로 분할선(split.y): 붕괴하면 warn 색
    g.moveTo(split.x, frame.y)
      .lineTo(split.x, frame.y + frame.height)
      .stroke({ color: colDegen ? WARN_COLOR : SPLIT_COLOR, width: 2 });
    g.moveTo(frame.x, split.y)
      .lineTo(frame.x + frame.width, split.y)
      .stroke({ color: rowDegen ? WARN_COLOR : SPLIT_COLOR, width: 2 });

    // split point 핸들: 4 cell의 공통 corner
    const handleColor = colDegen || rowDegen ? WARN_COLOR : SPLIT_COLOR;
    g.circle(split.x, split.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: 0x0f172a })
      .stroke({ color: handleColor, width: grabbed ? 3 : 2 });

    // ratioX/ratioY: split point가 frame을 각 축에서 얼마나 나누는지 (같은 partition의 분해)
    const ratioX = q.nw.width / frame.width;
    const ratioY = q.nw.height / frame.height;

    label.text = [
      `split : ${pct(ratioX)}, ${pct(ratioY)}   drag split point`,
      `cols  : ${q.nw.width.toFixed(0)} | ${q.ne.width.toFixed(0)} px`,
      `rows  : ${q.nw.height.toFixed(0)} | ${q.sw.height.toFixed(0)} px`,
    ].join('\n');
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    for (const t of cellLabels) t?.destroy();
    label.destroy();
    g.destroy();
  };
}
