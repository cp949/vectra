import * as Curve from '@cp949/vectra/curve';
import * as Interp from '@cp949/vectra/interpolation';
import * as PIXI from 'pixi.js';

type Runtime = {
  app: PIXI.Application;
  size: { width: number; height: number };
  pointer: { x: number; y: number };
};

const CONTROL_COUNT = 6;
const TOTAL_STEPS = 200;

export async function setup({ app, size, pointer }: Runtime) {
  const cy = size.height / 2;

  // 제어점: 화면 너비에 균등 배치, y는 사인 곡선
  const controlPts: { x: number; y: number }[] = Array.from({ length: CONTROL_COUNT }, (_, i) => ({
    x: size.width * 0.1 + (size.width * 0.8 * i) / (CONTROL_COUNT - 1),
    y: cy + Math.sin((i / (CONTROL_COUNT - 1)) * Math.PI * 1.5) * size.height * 0.25,
  }));

  let dragging = -1;
  const HANDLE_R = 8;

  const gfx = new PIXI.Graphics();
  app.stage.addChild(gfx);
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;

  function hitHandle(x: number, y: number): number {
    for (let i = 0; i < controlPts.length; i++) {
      const dx = controlPts[i].x - x;
      const dy = controlPts[i].y - y;
      if (dx * dx + dy * dy <= HANDLE_R * HANDLE_R * 2.5) return i;
    }
    return -1;
  }

  function sampleCatmullRom(): { x: number; y: number }[] {
    const pts: { x: number; y: number }[] = [];
    const tmp = { x: 0, y: 0 };
    for (let s = 0; s <= TOTAL_STEPS; s++) {
      const t = s / TOTAL_STEPS;
      Curve.catmullRomPointAtTInto(tmp, controlPts, t, { alpha: 0.5 });
      pts.push({ ...tmp });
    }
    return pts;
  }

  function sampleCardinal(): { x: number; y: number }[] {
    const pts: { x: number; y: number }[] = [];
    const tmp = { x: 0, y: 0 };
    for (let s = 0; s <= TOTAL_STEPS; s++) {
      const t = s / TOTAL_STEPS;
      Curve.cardinalPointAtTInto(tmp, controlPts, t, 0.75);
      pts.push({ ...tmp });
    }
    return pts;
  }

  function sampleBspline(): { x: number; y: number }[] {
    const bsplinePts: { x: number; y: number }[] = [];
    Curve.bsplinePolylineInto(bsplinePts as any, controlPts, TOTAL_STEPS);
    return bsplinePts;
  }

  function drawSpline(pts: { x: number; y: number }[], color: number, label: string, labelY: number) {
    if (pts.length < 2) return;
    gfx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      gfx.lineTo(pts[i].x, pts[i].y);
    }
    gfx.stroke({ color, width: 2.5 });

    const t = new PIXI.Text({ text: label, style: { fontSize: 12, fill: color } });
    t.x = 20;
    t.y = labelY;
    app.stage.addChild(t);
  }

  function draw() {
    gfx.clear();
    for (const child of [...app.stage.children]) {
      if (child instanceof PIXI.Text) child.destroy();
    }

    // 제어점 연결선 (가이드)
    gfx.moveTo(controlPts[0].x, controlPts[0].y);
    for (let i = 1; i < controlPts.length; i++) {
      gfx.lineTo(controlPts[i].x, controlPts[i].y);
    }
    gfx.stroke({ color: 0x334155, width: 1 });

    // 세 스플라인 비교
    // interpolation.clampedLerp 사용: t를 [0,1]로 보장
    const t0 = Interp.clampedLerp(0, 1, 0);
    drawSpline(sampleCatmullRom(), 0x34d399, `Catmull-Rom (α=0.5)  t=${t0.toFixed(2)}`, 20);
    drawSpline(sampleCardinal(), 0x60a5fa, 'Cardinal (tension=0.75)', 38);
    drawSpline(sampleBspline(), 0xf472b6, 'B-Spline', 56);

    // 제어점 핸들
    for (const p of controlPts) {
      gfx.circle(p.x, p.y, HANDLE_R).fill({ color: 0xf8fafc, alpha: 0.9 }).stroke({ color: 0x94a3b8, width: 1.5 });
    }
  }

  app.stage.on('pointerdown', (e) => {
    dragging = hitHandle(e.global.x, e.global.y);
  });
  app.stage.on('pointermove', (e) => {
    if (dragging >= 0) {
      controlPts[dragging].x = e.global.x;
      controlPts[dragging].y = e.global.y;
      draw();
    }
  });
  app.stage.on('pointerup', () => {
    dragging = -1;
  });
  app.stage.on('pointerupoutside', () => {
    dragging = -1;
  });

  draw();
  return () => gfx.destroy();
}
