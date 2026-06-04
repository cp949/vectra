import * as Bounds from '@cp949/vectra/bounds';
import * as Curve from '@cp949/vectra/curve';
import * as PIXI from 'pixi.js';

type Runtime = {
  app: PIXI.Application;
  size: { width: number; height: number };
  pointer: { x: number; y: number };
};

export async function setup({ app, size, pointer }: Runtime) {
  // 제어점 초기 배치
  const pts = [
    { x: size.width * 0.15, y: size.height * 0.7 },
    { x: size.width * 0.35, y: size.height * 0.2 },
    { x: size.width * 0.65, y: size.height * 0.2 },
    { x: size.width * 0.85, y: size.height * 0.7 },
  ];

  let dragging = -1;
  const HANDLE_R = 10;
  const gfx = new PIXI.Graphics();
  app.stage.addChild(gfx);
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;

  function hitHandle(x: number, y: number): number {
    for (let i = 0; i < pts.length; i++) {
      const dx = pts[i].x - x;
      const dy = pts[i].y - y;
      if (dx * dx + dy * dy <= HANDLE_R * HANDLE_R * 4) return i;
    }
    return -1;
  }

  function draw() {
    gfx.clear();
    const [p0, p1, p2, p3] = pts;

    // hull 보조선 (회색)
    gfx.moveTo(p0.x, p0.y).lineTo(p1.x, p1.y).stroke({ color: 0x94a3b8, width: 1, alpha: 0.5 });
    gfx.moveTo(p2.x, p2.y).lineTo(p3.x, p3.y).stroke({ color: 0x94a3b8, width: 1, alpha: 0.5 });

    // cubic 곡선 (80 샘플)
    const step = 1 / 80;
    const tmp = { x: 0, y: 0 };
    Curve.cubicPointAtTInto(tmp, p0, p1, p2, p3, 0);
    gfx.moveTo(tmp.x, tmp.y);
    for (let i = 1; i <= 80; i++) {
      Curve.cubicPointAtTInto(tmp, p0, p1, p2, p3, i * step);
      gfx.lineTo(tmp.x, tmp.y);
    }
    gfx.stroke({ color: 0x34d399, width: 2.5 });

    // tight bounds box
    const b = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    Curve.cubicBoundsInto(b, p0, p1, p2, p3);
    const w = Bounds.width(b);
    const h = Bounds.height(b);
    gfx.rect(b.min.x, b.min.y, w, h).stroke({ color: 0xfbbf24, width: 1, alpha: 0.6 });

    // 제어점 핸들
    for (let i = 0; i < pts.length; i++) {
      const color = i === 0 || i === 3 ? 0xf8fafc : 0xfbbf24;
      gfx.circle(pts[i].x, pts[i].y, HANDLE_R).fill({ color, alpha: 0.9 });
    }
  }

  app.stage.on('pointerdown', (e) => {
    dragging = hitHandle(e.global.x, e.global.y);
  });
  app.stage.on('pointermove', (e) => {
    if (dragging >= 0) {
      pts[dragging].x = e.global.x;
      pts[dragging].y = e.global.y;
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
