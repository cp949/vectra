import * as Circle from '@cp949/vectra/circle';
import * as Intersects from '@cp949/vectra/intersects';
import * as Rect from '@cp949/vectra/rect';
import * as Segment from '@cp949/vectra/segment';
import * as PIXI from 'pixi.js';

type Runtime = {
  app: PIXI.Application;
  size: { width: number; height: number };
  pointer: { x: number; y: number };
};

export async function setup({ app, size, pointer }: Runtime) {
  // 고정 도형들
  const fixedRect = { x: size.width * 0.55, y: size.height * 0.3, width: 120, height: 80 };
  const fixedCircle = { center: { x: size.width * 0.25, y: size.height * 0.65 }, radius: 50 };
  const fixedSeg = {
    a: { x: size.width * 0.6, y: size.height * 0.65 },
    b: { x: size.width * 0.85, y: size.height * 0.8 },
  };

  // 포인터를 따라다니는 이동 원
  const movingCircle = { center: { x: size.width / 2, y: size.height / 2 }, radius: 30 };

  const gfx = new PIXI.Graphics();
  app.stage.addChild(gfx);
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;

  app.stage.on('pointermove', (e) => {
    pointer.x = e.global.x;
    pointer.y = e.global.y;
  });

  function draw() {
    gfx.clear();
    // 이전 텍스트 제거
    for (const child of [...app.stage.children]) {
      if (child instanceof PIXI.Text) child.destroy();
    }

    movingCircle.center.x = pointer.x;
    movingCircle.center.y = pointer.y;

    // 충돌 검사
    const hitRect = Intersects.intersectsCircleRect(movingCircle, fixedRect);
    const hitCircle = Intersects.intersectsCircleCircle(movingCircle, fixedCircle);
    const hitSeg = Intersects.intersectsCircleSegment(movingCircle, fixedSeg);

    // 고정 사각형
    const rectColor = hitRect ? 0xf87171 : 0x60a5fa;
    gfx
      .rect(fixedRect.x, fixedRect.y, fixedRect.width, fixedRect.height)
      .fill({ color: rectColor, alpha: 0.3 })
      .stroke({ color: rectColor, width: 2 });

    // rect 중심 계산 및 표시
    const rectCenter = Rect.centerInto({ x: 0, y: 0 }, fixedRect);
    gfx.circle(rectCenter.x, rectCenter.y, 3).fill({ color: rectColor, alpha: 0.6 });

    // 고정 원
    const circleColor = hitCircle ? 0xf87171 : 0x34d399;
    gfx
      .circle(fixedCircle.center.x, fixedCircle.center.y, fixedCircle.radius)
      .fill({ color: circleColor, alpha: 0.3 })
      .stroke({ color: circleColor, width: 2 });

    // 고정 segment
    const segColor = hitSeg ? 0xf87171 : 0xfbbf24;
    gfx.moveTo(fixedSeg.a.x, fixedSeg.a.y).lineTo(fixedSeg.b.x, fixedSeg.b.y).stroke({ color: segColor, width: 3 });
    gfx.circle(fixedSeg.a.x, fixedSeg.a.y, 4).fill(segColor);
    gfx.circle(fixedSeg.b.x, fixedSeg.b.y, 4).fill(segColor);

    // 이동 원
    gfx
      .circle(movingCircle.center.x, movingCircle.center.y, movingCircle.radius)
      .fill({ color: 0xf8fafc, alpha: 0.15 })
      .stroke({ color: 0xf8fafc, width: 2 });

    // circle에서 movingCircle까지 closest point
    const closestOnCircle = Circle.closestPointInto({ x: 0, y: 0 }, fixedCircle, movingCircle.center);
    gfx
      .moveTo(movingCircle.center.x, movingCircle.center.y)
      .lineTo(closestOnCircle.x, closestOnCircle.y)
      .stroke({ color: 0x94a3b8, width: 1, alpha: 0.5 });
    gfx.circle(closestOnCircle.x, closestOnCircle.y, 3).fill(0x94a3b8);

    // segment 위의 closest point
    const closestOnSeg = Segment.closestPointInto({ x: 0, y: 0 }, fixedSeg, movingCircle.center);
    gfx
      .moveTo(movingCircle.center.x, movingCircle.center.y)
      .lineTo(closestOnSeg.x, closestOnSeg.y)
      .stroke({ color: 0x94a3b8, width: 1, alpha: 0.5 });
    gfx.circle(closestOnSeg.x, closestOnSeg.y, 3).fill(0x94a3b8);

    // 상태 레이블
    const label = new PIXI.Text({
      text: [
        hitRect ? 'RECT HIT' : 'rect: clear',
        hitCircle ? 'CIRCLE HIT' : 'circle: clear',
        hitSeg ? 'SEGMENT HIT' : 'segment: clear',
      ].join('   '),
      style: { fontSize: 13, fill: 0xe2e8f0 },
    });
    label.x = 16;
    label.y = 16;
    app.stage.addChild(label);
  }

  app.ticker.add(draw);
  draw();
  return () => {
    app.ticker.remove(draw);
    gfx.destroy();
  };
}
