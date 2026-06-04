import * as Intersects from '@cp949/vectra/intersects';
import * as Rays from '@cp949/vectra/ray';
import * as Segments from '@cp949/vectra/segment';
import * as PIXI from 'pixi.js';

type Runtime = {
  app: PIXI.Application;
  size: { width: number; height: number };
};

const walls = [
  { a: { x: 120, y: 90 }, b: { x: 520, y: 120 } },
  { a: { x: 520, y: 120 }, b: { x: 610, y: 360 } },
  { a: { x: 610, y: 360 }, b: { x: 180, y: 430 } },
  { a: { x: 180, y: 430 }, b: { x: 120, y: 90 } },
  { a: { x: 270, y: 190 }, b: { x: 430, y: 310 } },
];

export async function setup({ app, size }: Runtime) {
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;

  const origin = { x: size.width * 0.48, y: size.height * 0.42 };
  const ray = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };

  function nearestHit(angle: number) {
    Rays.fromAngleInto(ray, origin, angle);
    let best = { x: origin.x + Math.cos(angle) * 1200, y: origin.y + Math.sin(angle) * 1200 };
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const wall of walls) {
      const hit = Intersects.singleIntersectionSegmentRay(wall, ray);
      if (!hit) continue;
      const distance = Segments.length({ a: origin, b: hit });
      if (distance < bestDistance) {
        bestDistance = distance;
        best = hit;
      }
    }

    return best;
  }

  function draw() {
    graphics.clear();
    const points = [];
    for (let i = 0; i < 180; i += 1) {
      points.push(nearestHit((Math.PI * 2 * i) / 180));
    }

    graphics.poly(points).fill({ color: 0xfacc15, alpha: 0.18 });
    for (const wall of walls) {
      graphics.moveTo(wall.a.x, wall.a.y).lineTo(wall.b.x, wall.b.y).stroke({ color: 0xe2e8f0, width: 3 });
    }
    graphics.circle(origin.x, origin.y, 7).fill(0xffffff);
  }

  app.stage.on('pointermove', (event) => {
    origin.x = event.global.x;
    origin.y = event.global.y;
    draw();
  });

  draw();
  return () => graphics.destroy();
}
