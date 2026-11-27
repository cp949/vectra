/**
 * 물리 시뮬레이션 모양의 hot path를 직접 짠 코드와 vectra 함수로 잰다.
 *
 * - 대상은 빌드한 `dist`다. 먼저 `pnpm build`를 실행한다.
 * - 장면 크기는 물리 놀이터 데모에서 가져왔다.
 *   - 광선 2400개(150 가지 × 16색) × 면 40개.
 *   - 원 163개의 모든 쌍(13203쌍).
 *   - 점 1만 개 × segment 하나.
 * - 각 항목은 9번 잰 값 중 가장 작은 값이다. 단위는 장면 한 번당 µs다.
 * - 항목마다 프로세스를 새로 띄운다. 한 프로세스에서 이어 재면 앞 항목의 JIT feedback이 뒤 항목을 바꾼다.
 * - 번들하지 않은 Node.js ESM 소비자 기준이다.
 *   - `dist`의 chunk 경계를 넘는 호출은 inlining이 덜 된다.
 *   - 번들러가 scope hoisting으로 합친 앱에서는 차이가 더 작다.
 *
 * 실행: `pnpm --filter @cp949/vectra bench`
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const distRoot = path.resolve(path.dirname(__filename), '../../dist');

/** 재현 가능한 난수. 항목 프로세스마다 같은 장면을 만든다. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 장면 하나를 만든다. 데이터 모양은 물리 데모처럼 납작한 object다. */
function makeScene() {
  const rng = mulberry32(949);
  const surfaces = [];
  for (let i = 0; i < 40; i++) {
    const x = rng() * 10;
    const y = rng() * 10;
    surfaces.push({ x1: x, y1: y, x2: x + rng() - 0.5, y2: y + rng() - 0.5 });
  }
  const rays = [];
  for (let i = 0; i < 2400; i++) {
    const angle = rng() * Math.PI * 2;
    rays.push({ x: rng() * 10, y: rng() * 10, dx: Math.cos(angle), dy: Math.sin(angle) });
  }
  const circles = [];
  for (let i = 0; i < 163; i++) circles.push({ x: rng() * 20, y: rng() * 20, r: 0.1 + rng() * 0.3 });
  const points = [];
  for (let i = 0; i < 10000; i++) points.push({ x: rng() * 1000, y: rng() * 1000 });
  return { surfaces, rays, circles, points };
}

/** 직접 짠 ray × segment 교점 t. 물리 데모 `kit/sim/rays.ts`의 곧은 면 계산과 같은 식이다. */
function handRaySegment(s, x, y, dx, dy) {
  const ex = s.x2 - s.x1;
  const ey = s.y2 - s.y1;
  const d = dx * ey - dy * ex;
  if (Math.abs(d) < 1e-12) return Infinity;
  const t = ((s.x1 - x) * ey - (s.y1 - y) * ex) / d;
  const u = ((s.x1 - x) * dy - (s.y1 - y) * dx) / d;
  return u >= 0 && u <= 1 && t >= 0 ? t : Infinity;
}

/** 직접 짠 점–segment 거리. */
function handSegmentDistance(ax, ay, bx, by, px, py) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq > 0 ? ((px - ax) * dx + (py - ay) * dy) / lenSq : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const ex = ax + t * dx - px;
  const ey = ay + t * dy - py;
  return Math.sqrt(ex * ex + ey * ey);
}

/**
 * 항목 이름에서 장면 한 번을 실행하는 함수를 만든다.
 * 반환 함수는 결과 합을 돌려준다. 호출자가 합을 써서 계산이 지워지지 않게 한다.
 */
async function makeCase(name) {
  const intersects = await import(pathToFileURL(path.join(distRoot, 'intersects/index.js')).href);
  const segment = await import(pathToFileURL(path.join(distRoot, 'segment/index.js')).href);
  const { surfaces, rays, circles, points } = makeScene();
  const segmentShapes = surfaces.map((s) => ({ a: { x: s.x1, y: s.y1 }, b: { x: s.x2, y: s.y2 } }));
  const circleShapes = circles.map((c) => ({ center: { x: c.x, y: c.y }, radius: c.r }));
  const line = { x1: 100, y1: 100, x2: 900, y2: 700 };

  const cases = {
    'ray×segment hand': () => {
      let sum = 0;
      for (const r of rays)
        for (const s of surfaces) {
          const t = handRaySegment(s, r.x, r.y, r.dx, r.dy);
          if (t < Infinity) sum += t;
        }
      return sum;
    },
    'ray×segment raySegmentHitT': () => {
      let sum = 0;
      for (const r of rays) {
        const ray = { origin: { x: r.x, y: r.y }, direction: { x: r.dx, y: r.dy } };
        for (const s of segmentShapes) {
          const t = intersects.raySegmentHitT(ray, s);
          if (t < Infinity) sum += t;
        }
      }
      return sum;
    },
    'circle pairs hand': () => {
      let count = 0;
      for (let i = 0; i < circles.length; i++)
        for (let j = i + 1; j < circles.length; j++) {
          const a = circles[i];
          const b = circles[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const rSum = a.r + b.r;
          if (dx * dx + dy * dy <= rSum * rSum) count++;
        }
      return count;
    },
    'circle pairs intersectsCircleCircle': () => {
      let count = 0;
      for (let i = 0; i < circleShapes.length; i++)
        for (let j = i + 1; j < circleShapes.length; j++)
          if (intersects.intersectsCircleCircle(circleShapes[i], circleShapes[j])) count++;
      return count;
    },
    'point–segment hand': () => {
      let sum = 0;
      for (const p of points) sum += handSegmentDistance(100, 100, 900, 700, p.x, p.y);
      return sum;
    },
    'point–segment distanceToPoint': () => {
      let sum = 0;
      for (const p of points) sum += segment.distanceToPoint(line, p);
      return sum;
    },
  };
  return { names: Object.keys(cases), run: cases[name] };
}

/** 항목 하나를 재서 µs를 출력한다. 자식 프로세스에서만 부른다. */
async function measure(name) {
  const { run } = await makeCase(name);
  if (!run) throw new Error(`알 수 없는 항목: ${name}`);
  let sink = 0;
  for (let i = 0; i < 30; i++) sink += run();
  const iterations = 50;
  let best = Infinity;
  for (let round = 0; round < 9; round++) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) sink += run();
    best = Math.min(best, (performance.now() - start) / iterations);
  }
  if (!Number.isFinite(sink)) throw new Error('결과 합이 finite가 아니다');
  process.stdout.write(String(best * 1000));
}

const target = process.argv[2];
if (target) {
  await measure(target);
} else {
  const { names } = await makeCase('ray×segment hand');
  const results = new Map();
  for (const name of names) {
    const out = execFileSync(process.execPath, [__filename, name], { encoding: 'utf8' });
    results.set(name, Number(out));
  }
  console.log(`Node.js ${process.version}`);
  for (const name of names) {
    const us = results.get(name);
    const hand = results.get(`${name.slice(0, name.lastIndexOf(' '))} hand`);
    const ratio = (us / hand).toFixed(2);
    console.log(`${name.padEnd(40)} ${us.toFixed(1).padStart(9)} µs  hand 대비 ${ratio}배`);
  }
}
