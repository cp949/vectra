import * as Intersects from '@cp949/vectra/intersects';
import * as Rays from '@cp949/vectra/ray';
import * as Segments from '@cp949/vectra/segment';
import * as PIXI from 'pixi.js';

type Runtime = {
  app: PIXI.Application;
  size: { width: number; height: number };
};

const walls = [
  { x1: 120, y1: 90, x2: 520, y2: 120 },
  { x1: 520, y1: 120, x2: 610, y2: 360 },
  { x1: 610, y1: 360, x2: 180, y2: 430 },
  { x1: 180, y1: 430, x2: 120, y2: 90 },
  { x1: 270, y1: 190, x2: 430, y2: 310 },
];

export async function setup({ app, size }: Runtime) {
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;

  const origin = { x: size.width * 0.48, y: size.height * 0.42 };
  const ray = Rays.createRay();

  function nearestHit(angle: number) {
    Rays.fromAngleInto(ray, origin, angle);
    let best = { x: origin.x + Math.cos(angle) * 1200, y: origin.y + Math.sin(angle) * 1200 };
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const wall of walls) {
      const hit = Intersects.singleIntersectionSegmentRay(wall, ray);
      if (!hit) continue;
      const distance = Segments.length({ x1: origin.x, y1: origin.y, x2: hit.x, y2: hit.y });
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
      graphics.moveTo(wall.x1, wall.y1).lineTo(wall.x2, wall.y2).stroke({ color: 0xe2e8f0, width: 3 });
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
