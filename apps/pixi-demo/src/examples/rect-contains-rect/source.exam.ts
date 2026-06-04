/**
 * Rect Contains Rect
 *
 * 화면 고정 부모 프레임 A와 draggable 자식 박스 B를 두고, B를 drag하면 B가 A 안에 완전히 들어오는지
 * 매 프레임 판정한다. 완전히 포함되면 contained 색, 한 변이라도 삐져나오면 clear 색으로 바뀌어
 * "자식 박스가 부모 프레임(safe area) 안에 다 들어왔는가?"라는 레이아웃 / clip 작업 흐름을 보인다.
 * 완전 포함은 네 변 부등식(B.left≥A.left AND B.right≤A.right AND B.top≥A.top AND B.bottom≤A.bottom)이
 * 모두 성립함이므로, A의 네 변을 변별 만족 여부 색으로 칠해 어느 변이 포함을 깨는지 드러낸다.
 *
 * - Rects.containsRect: other rect가 rect의 closed boundary 안에 완전히 포함되면 true를 반환한다.
 *   변끼리 정확히 닿아도(slack 0) 포함이고, other가 한 변이라도 벗어나면 false다. boolean을 직접
 *   반환해 *Into companion이 없으므로 그대로 호출한다.
 */

import * as Rects from '@cp949/vectra/rect';

type XY = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };

const CLEAR_COLOR = 0xf87171; // 포함 안 됨: 빨강
const CONTAINED_COLOR = 0x4ade80; // 완전 포함: 초록
const EDGE_COLOR = 0xfbbf24; // 한 변이 정확히 닿음(slack ≈ 0): 노랑
const FRAME_BG = 0x1e293b; // 프레임 A 내부 옅은 채움
const M = 24; // 박스가 머무는 화면 margin (px)
const TOP = 70; // 박스 영역 상단(라벨 아래)
const EDGE_EPS = 1.5; // |slack| 이내면 변 접촉 경계로 본다 (px, 표시용)

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

  // 부모 프레임 A: 화면 고정 rect (조작 대상 아님). 항상 valid(width/height > 0)라 empty degenerate 미발생
  const a: Rect = { x: 230, y: 110, width: 300, height: 230 };
  // 자식 박스 B: 주 drag 대상. 위치만 옮기고 너비·높이는 고정
  const b: Rect = { x: 290, y: 160, width: 128, height: 88 };

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
    // B는 A가 아니라 화면 margin으로 clamp → A 밖으로 삐져나오는 상태가 도달 가능 + 항상 finite 입력
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

  const fmt = (n: number): string => (n >= 0 ? `+${n.toFixed(0)}` : n.toFixed(0)).padStart(5);

  // 한 변의 slack: 양수면 그 변 안쪽으로 여유, 음수면 그 변을 넘어 삐져나온 깊이
  // 네 slack이 모두 ≥ 0이면 곧 containsRect == true (같은 판정의 inline 분해)
  const edgeColor = (slack: number): number =>
    slack < -EDGE_EPS ? CLEAR_COLOR : slack <= EDGE_EPS ? EDGE_COLOR : CONTAINED_COLOR;

  const render = (): void => {
    // 핵심 호출: B가 A의 closed boundary 안에 완전히 포함되면 true
    const contained = Rects.containsRect(a, b);

    // 포함 판정을 표시용으로 네 변 부등식으로 inline 분해한다 (별도 domain import 없이 같은 비교를 드러냄)
    const sLeft = b.x - a.x; // B 왼쪽이 A 왼쪽 안쪽인가
    const sRight = a.x + a.width - (b.x + b.width); // B 오른쪽이 A 오른쪽 안쪽인가
    const sTop = b.y - a.y; // B 위쪽이 A 위쪽 안쪽인가
    const sBottom = a.y + a.height - (b.y + b.height); // B 아래쪽이 A 아래쪽 안쪽인가
    const minSlack = Math.min(sLeft, sRight, sTop, sBottom); // 가장 빡빡한(또는 가장 많이 벗어난) 변

    // 포함 판정을 가장 좌우하는 변(min slack)의 이름 = binding constraint
    const edges = [
      { name: 'left', s: sLeft },
      { name: 'right', s: sRight },
      { name: 'top', s: sTop },
      { name: 'bottom', s: sBottom },
    ];
    const tight = edges.reduce((m, e) => (e.s < m.s ? e : m)).name;

    // 변끼리 정확히 닿은 채로 포함된 경계 상태는 노랑으로 강조 (closed boundary: slack 0도 포함)
    const touching = contained && minSlack <= EDGE_EPS;
    const stateColor = touching ? EDGE_COLOR : contained ? CONTAINED_COLOR : CLEAR_COLOR;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 프레임 A 내부 옅은 채움 (포함 영역임을 보임)
    g.rect(a.x, a.y, a.width, a.height).fill({ color: FRAME_BG, alpha: 0.5 });

    // 프레임 A의 네 변을 변별 slack 색으로 칠한다: 어느 부등식이 포함을 깨는지 드러냄
    g.moveTo(a.x, a.y)
      .lineTo(a.x, a.y + a.height)
      .stroke({ color: edgeColor(sLeft), width: 4 }); // 왼쪽
    g.moveTo(a.x + a.width, a.y)
      .lineTo(a.x + a.width, a.y + a.height)
      .stroke({ color: edgeColor(sRight), width: 4 }); // 오른쪽
    g.moveTo(a.x, a.y)
      .lineTo(a.x + a.width, a.y)
      .stroke({ color: edgeColor(sTop), width: 4 }); // 위쪽
    g.moveTo(a.x, a.y + a.height)
      .lineTo(a.x + a.width, a.y + a.height)
      .stroke({ color: edgeColor(sBottom), width: 4 }); // 아래쪽

    // 자식 박스 B(drag 대상): 상태 색으로 채우고, 잡으면 stroke 굵게
    g.rect(b.x, b.y, b.width, b.height)
      .fill({ color: stateColor, alpha: 0.18 })
      .stroke({ color: stateColor, width: grabbed ? 3 : 2 });

    label.text = [
      `inside : ${contained ? 'yes' : 'no '}   drag box B`,
      `margin : ${fmt(minSlack)} px`,
      `tight  : ${tight}`,
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
