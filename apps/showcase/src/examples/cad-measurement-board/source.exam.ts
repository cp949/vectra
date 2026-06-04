import * as Bounds from '@cp949/vectra/bounds';
import * as Circle from '@cp949/vectra/circle';
import * as Curve from '@cp949/vectra/curve';
import * as Segment from '@cp949/vectra/segment';
import * as PIXI from 'pixi.js';

type Runtime = {
  app: PIXI.Application;
  size: { width: number; height: number };
};

export async function setup({ app, size }: Runtime) {
  const cx = size.width / 2;
  const cy = size.height / 2;

  // 측정 대상 도형들
  const seg = { a: { x: cx - 160, y: cy - 60 }, b: { x: cx + 80, y: cy - 60 } };
  const circ = { center: { x: cx + 10, y: cy + 60 }, radius: 55 };

  // cubic bezier (bounds 측정용)
  const p0 = { x: cx - 180, y: cy + 120 };
  const p1 = { x: cx - 60, y: cy - 40 };
  const p2 = { x: cx + 80, y: cy + 40 };
  const p3 = { x: cx + 180, y: cy + 100 };

  const gfx = new PIXI.Graphics();
  app.stage.addChild(gfx);

  function drawDimensionLine(ax: number, ay: number, bx: number, by: number, label: string, offset = 24) {
    // 수직 방향으로 offset
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy);
    const nx = -dy / len;
    const ny = dx / len;
    const oax = ax + nx * offset;
    const oay = ay + ny * offset;
    const obx = bx + nx * offset;
    const oby = by + ny * offset;

    gfx.moveTo(oax, oay).lineTo(obx, oby).stroke({ color: 0xfbbf24, width: 1.5 });
    gfx.moveTo(ax, ay).lineTo(oax, oay).stroke({ color: 0xfbbf24, width: 1, alpha: 0.5 });
    gfx.moveTo(bx, by).lineTo(obx, oby).stroke({ color: 0xfbbf24, width: 1, alpha: 0.5 });

    const mx = (oax + obx) / 2;
    const my = (oay + oby) / 2;
    const t = new PIXI.Text({ text: label, style: { fontSize: 11, fill: 0xfbbf24 } });
    t.anchor.set(0.5);
    t.x = mx;
    t.y = my - 10;
    app.stage.addChild(t);
  }

  function draw() {
    gfx.clear();
    // 기존 텍스트 제거
    for (const child of [...app.stage.children]) {
      if (child instanceof PIXI.Text) child.destroy();
    }

    // segment
    gfx.moveTo(seg.a.x, seg.a.y).lineTo(seg.b.x, seg.b.y).stroke({ color: 0xe2e8f0, width: 2 });
    const segLen = Segment.length(seg);
    drawDimensionLine(seg.a.x, seg.a.y, seg.b.x, seg.b.y, `${Math.round(segLen)}px`, -22);

    // midpoint 마커
    const mid = Segment.midpoint(seg);
    gfx.circle(mid.x, mid.y, 4).fill(0xfbbf24);

    // circle
    gfx.circle(circ.center.x, circ.center.y, circ.radius).stroke({ color: 0x60a5fa, width: 2 });
    const cArea = Circle.area(circ);
    const areaText = new PIXI.Text({
      text: `r=${circ.radius}  A=${Math.round(cArea)}`,
      style: { fontSize: 11, fill: 0x60a5fa },
    });
    areaText.x = circ.center.x - circ.radius;
    areaText.y = circ.center.y + circ.radius + 6;
    app.stage.addChild(areaText);

    // cubic bezier
    const tmp = { x: 0, y: 0 };
    Curve.cubicPointAtTInto(tmp, p0, p1, p2, p3, 0);
    gfx.moveTo(tmp.x, tmp.y);
    for (let i = 1; i <= 60; i++) {
      Curve.cubicPointAtTInto(tmp, p0, p1, p2, p3, i / 60);
      gfx.lineTo(tmp.x, tmp.y);
    }
    gfx.stroke({ color: 0x34d399, width: 2 });

    // bezier tight bounds
    const bb = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    Curve.cubicBoundsInto(bb, p0, p1, p2, p3);
    const bw = Bounds.width(bb);
    const bh = Bounds.height(bb);
    gfx.rect(bb.min.x, bb.min.y, bw, bh).stroke({ color: 0x34d399, width: 1, alpha: 0.4 });

    const boundsText = new PIXI.Text({
      text: `bbox ${Math.round(bw)}\xd7${Math.round(bh)}`,
      style: { fontSize: 11, fill: 0x34d399 },
    });
    boundsText.x = bb.min.x;
    boundsText.y = bb.min.y - 16;
    app.stage.addChild(boundsText);
  }

  draw();
  return () => gfx.destroy();
}
