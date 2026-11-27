/**
 * 빌드한 dist에서 원 쌍, ray와 segment, 점과 segment 장면을 측정한다.
 * 각 장면은 일반 호출과 다른 API의 호출 모양을 섞은 상태를 별도 프로세스에서 잰다.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const cases = ['circle', 'circle-polluted', 'ray', 'ray-polluted', 'point', 'point-polluted'];
const groups = ['circle', 'ray', 'point', 'polygon', 'vec'];
const [, , root, profile = 'v1', name] = process.argv;
const flat = new Set(profile === 'v2' ? groups : profile === 'v1' ? [] : profile.split(','));

if (!root || [...flat].some((group) => !groups.includes(group)) || (name && !cases.includes(name))) {
  console.error('사용법: node dist-bench.mjs <dist 경로> <v1 | v2 | v2로 전환한 그룹 목록>');
  console.error(`그룹: ${groups.join(',')}`);
  process.exit(1);
}

/** 같은 seed로 같은 좌표를 만든다. */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** 형식이 바뀌어도 좌표와 난수 소비 순서를 유지한다. */
function makeScene() {
  const random = rng(949);
  const segment = (flatInput, x1, y1, x2, y2) =>
    flatInput ? { x1, y1, x2, y2 } : { a: { x: x1, y: y1 }, b: { x: x2, y: y2 } };
  const surfaces = Array.from({ length: 40 }, () => {
    const x = random() * 10;
    const y = random() * 10;
    return segment(flat.has('ray'), x, y, x + random() - 0.5, y + random() - 0.5);
  });
  const rays = Array.from({ length: 2400 }, () => {
    const angle = random() * Math.PI * 2;
    const ox = random() * 10;
    const oy = random() * 10;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    return flat.has('ray') ? { ox, oy, dx, dy } : { origin: { x: ox, y: oy }, direction: { x: dx, y: dy } };
  });
  const circles = Array.from({ length: 163 }, () => {
    const cx = random() * 20;
    const cy = random() * 20;
    const r = 0.1 + random() * 0.3;
    return flat.has('circle') ? { cx, cy, r } : { center: { x: cx, y: cy }, radius: r };
  });
  const points = [];
  for (let i = 0; i < 10000; i++) points.push({ x: random() * 1000, y: random() * 1000 });
  const line = segment(flat.has('point'), 100, 100, 900, 700);
  return { surfaces, rays, circles, points, line };
}

/** 다른 API에서 좌표 객체의 필드 구성과 순서를 섞어 호출한다. */
function prime(vec, polygon) {
  const objects = [
    { x: 1, y: 2 },
    { x: 1, y: 2, z: 3 },
    { y: 2, x: 1 },
    { x: 1, y: 2, id: 'a' },
    { a: 0, x: 1, y: 2 },
  ];
  const legacy = [[1, 2], ...objects];
  const vecPoints = flat.has('vec') ? objects : legacy;
  const flatPolygon = flat.has('polygon');
  const polygonPoints = flatPolygon ? objects : legacy;

  let sum = 0;
  for (let i = 0; i < 30000; i++) {
    const p = vecPoints[i % vecPoints.length];
    const q = vecPoints[(i + 1) % vecPoints.length];
    const a = polygonPoints[i % polygonPoints.length];
    const b = polygonPoints[(i + 1) % polygonPoints.length];
    const c = polygonPoints[(i + 2) % polygonPoints.length];
    sum += vec.length(p) + vec.dot(p, q);
    if (flatPolygon) {
      const ring = [a.x, a.y, b.x, b.y, c.x, c.y];
      sum += polygon.area(ring) + Number(polygon.containsPoint(ring, b));
    } else {
      sum += polygon.area([a, b, c]) + Number(polygon.containsPoint([a, b, c], b));
    }
  }
  return sum;
}

/** dist에 공개된 함수만 호출해 장면당 시간을 잰다. */
async function measure() {
  const load = (domain) => import(pathToFileURL(path.resolve(root, domain, 'index.js')).href);
  const [intersects, segment, polygon, vec] = await Promise.all(['intersects', 'segment', 'polygon', 'vec'].map(load));
  const { surfaces, rays, circles, points, line } = makeScene();
  const run = {
    ray: () => {
      let sum = 0;
      for (const ray of rays) {
        for (const surface of surfaces) {
          const t = intersects.raySegmentHitT(ray, surface);
          if (t < Infinity) sum += t;
        }
      }
      return sum;
    },
    circle: () => {
      let count = 0;
      for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
          if (intersects.intersectsCircleCircle(circles[i], circles[j])) count++;
        }
      }
      return count;
    },
    point: () => {
      let sum = 0;
      for (const point of points) sum += segment.distanceToPoint(line, point);
      return sum;
    },
  }[name.split('-')[0]];
  let sink = name.endsWith('polluted') ? prime(vec, polygon) : 0;
  const check = run();
  if (!Number.isFinite(check) || check <= 0) throw new Error(`장면 결과가 유효하지 않다. 항목 ${name}, 결과 ${check}`);

  sink += check;
  for (let i = 1; i < 30; i++) sink += run();
  let best = Infinity;
  for (let round = 0; round < 9; round++) {
    const start = performance.now();
    for (let i = 0; i < 50; i++) sink += run();
    best = Math.min(best, (performance.now() - start) / 50);
  }
  if (!Number.isFinite(sink)) throw new Error(`측정 결과 합이 유효하지 않다. 항목 ${name}`);
  process.stdout.write((best * 1000).toFixed(1));
}

if (name) {
  await measure();
} else {
  for (const scenario of cases) {
    const time = execFileSync(process.execPath, [fileURLToPath(import.meta.url), root, profile, scenario], {
      encoding: 'utf8',
    });
    console.log(scenario.padEnd(18), time.padStart(8), 'µs');
  }
}
