/**
 * Ellipse From Rect
 *
 * 박스(사각형)의 두 코너 핸들을 drag하면 그 박스에 내접하는 axis-aligned ellipse가 갱신된다.
 * ellipse는 박스 중심을 중심으로 박스 절반 크기를 두 반지름으로 삼아 네 변의 중점에서 박스에
 * 접한다. 한 코너를 반대쪽 코너 너머로 끌어 너비나 높이가 0 이하가 되면 해당 축 반지름이 0으로
 * 접혀(ellipse가 선으로 붕괴) fromRect의 부호 민감 degenerate 정책을 드러낸다.
 *
 * - Ellipses.fromRect: rect(x, y, width, height)에서 내접 ellipse를 만든다. center = 박스 중심,
 *   radiusX = width/2, radiusY = height/2. width<=0이면 radiusX=0, height<=0이면 radiusY=0(독립).
 */

import * as Ellipses from '@cp949/vectra/ellipse';

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

  // 박스 1개를 정의하는 두 코너 핸들(주 drag 대상). raw rect의 부호는 둘의 상대 위치로 정해진다
  const cornerA: XY = { x: 250, y: 150 };
  const cornerB: XY = { x: 470, y: 300 };

  const HIT_RADIUS = 24;
  // 잡은 핸들: 0=cornerA, 1=cornerB, -1=없음
  let grabbed = -1;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 두 코너 중 더 가까운 쪽을 hit 반경 안에서 잡는다
    const dA = Math.hypot(cornerA.x - p.x, cornerA.y - p.y);
    const dB = Math.hypot(cornerB.x - p.x, cornerB.y - p.y);
    if (dA <= HIT_RADIUS && dA <= dB) grabbed = 0;
    else if (dB <= HIT_RADIUS) grabbed = 1;
    else grabbed = -1;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (grabbed < 0) return;
    const p = getCanvasXY(e);
    // 잡은 코너를 화면 안으로 clamp. 코너 교차를 막지 않아 degenerate가 나타날 수 있다
    const target = grabbed === 0 ? cornerA : cornerB;
    target.x = Math.max(16, Math.min(size.width - 16, p.x));
    target.y = Math.max(16, Math.min(size.height - 16, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = -1;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(1);

  const render = (): void => {
    // fromRect는 rect를 정규화하지 않으므로 부호 있는 width/height를 그대로 넘긴다
    const rect = {
      x: cornerA.x,
      y: cornerA.y,
      width: cornerB.x - cornerA.x,
      height: cornerB.y - cornerA.y,
    };
    // 박스에 내접하는 ellipse. center=박스 중심, radiusX=|width|/2, radiusY=|height|/2
    const e = Ellipses.fromRect(rect);
    // width<=0이면 radiusX=0, height<=0이면 radiusY=0으로 접힌다
    const degenerate = e.radiusX === 0 || e.radiusY === 0;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 박스 외곽은 4코너로 그려 부호와 무관하게 항상 사각형으로 보이게 한다
    const corners: XY[] = [
      { x: cornerA.x, y: cornerA.y },
      { x: cornerB.x, y: cornerA.y },
      { x: cornerB.x, y: cornerB.y },
      { x: cornerA.x, y: cornerB.y },
    ];
    g.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) g.lineTo(corners[i].x, corners[i].y);
    g.closePath().stroke({ color: 0x38bdf8, width: 1.5 });

    if (degenerate) {
      // 접힌 축을 경고색 선으로 그려 degenerate 정책을 드러낸다
      const x0 = e.center.x - e.radiusX;
      const y0 = e.center.y - e.radiusY;
      const x1 = e.center.x + e.radiusX;
      const y1 = e.center.y + e.radiusY;
      g.moveTo(x0, y0).lineTo(x1, y1).stroke({ color: 0xfacc15, width: 3 });
    } else {
      // 내접 ellipse 채우기 + 외곽선
      g.ellipse(e.center.x, e.center.y, e.radiusX, e.radiusY)
        .fill({ color: 0xa78bfa, alpha: 0.22 })
        .stroke({ color: 0xa78bfa, width: 2 });
      // 네 변 중점 = ellipse가 박스에 접하는 점. "내접"을 시각화한다
      const touches: XY[] = [
        { x: e.center.x, y: e.center.y - e.radiusY }, // 위
        { x: e.center.x, y: e.center.y + e.radiusY }, // 아래
        { x: e.center.x - e.radiusX, y: e.center.y }, // 왼
        { x: e.center.x + e.radiusX, y: e.center.y }, // 오른
      ];
      for (const t of touches) g.circle(t.x, t.y, 4).fill({ color: 0xfbbf24 });
    }

    // center marker
    g.circle(e.center.x, e.center.y, 4).fill({ color: 0xe2e8f0 });

    // 코너 핸들 marker. 잡은 핸들을 크게 그린다
    g.circle(cornerA.x, cornerA.y, grabbed === 0 ? 11 : 9).fill({ color: 0x38bdf8 });
    g.circle(cornerB.x, cornerB.y, grabbed === 1 ? 11 : 9).fill({ color: 0x38bdf8 });

    label.text = [
      `inscribed ellipse${degenerate ? '  (degenerate: radius 0)' : ''}   drag corners`,
      `center   : (${fmt(e.center.x)}, ${fmt(e.center.y)})`,
      `radiusX  : ${fmt(e.radiusX)}`,
      `radiusY  : ${fmt(e.radiusY)}`,
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
