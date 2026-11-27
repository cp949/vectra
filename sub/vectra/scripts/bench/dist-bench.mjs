/**
 * 빌드한 dist에서 원 쌍, ray와 segment, 점과 segment 장면을 측정한다.
 * 각 장면은 일반 호출과 다른 API의 호출 모양을 섞은 상태를 별도 프로세스에서 잰다.
 * 같은 장면을 직접 짠 코드(hand)로도 잰다. hand 값으로 기계 부하를 확인하고 API 결과를 대조한다.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const cases = [
  'circle-hand',
  'circle',
  'circle-polluted',
  'ray-hand',
  'ray',
  'ray-polluted',
  'point-hand',
  'point',
  'point-polluted',
];
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

/** 형식이 바뀌어도 좌표와 난수 소비 순서를 유지한다. hand 장면은 `raw`의 평평한 좌표를 읽는다. */
function makeScene() {
  const random = rng(949);
  const toSegment = (s) => (flat.has('ray') ? s : { a: { x: s.x1, y: s.y1 }, b: { x: s.x2, y: s.y2 } });
  const rawSurfaces = Array.from({ length: 40 }, () => {
    const x = random() * 10;
    const y = random() * 10;
    return { x1: x, y1: y, x2: x + random() - 0.5, y2: y + random() - 0.5 };
  });
  const rawRays = Array.from({ length: 2400 }, () => {
    const angle = random() * Math.PI * 2;
    return { ox: random() * 10, oy: random() * 10, dx: Math.cos(angle), dy: Math.sin(angle) };
  });
  const rawCircles = Array.from({ length: 163 }, () => ({
    cx: random() * 20,
    cy: random() * 20,
    r: 0.1 + random() * 0.3,
  }));
  const points = [];
  for (let i = 0; i < 10000; i++) points.push({ x: random() * 1000, y: random() * 1000 });
  const surfaces = rawSurfaces.map(toSegment);
  const rays = flat.has('ray')
    ? rawRays
    : rawRays.map((r) => ({ origin: { x: r.ox, y: r.oy }, direction: { x: r.dx, y: r.dy } }));
  const circles = flat.has('circle')
    ? rawCircles
    : rawCircles.map((c) => ({ center: { x: c.cx, y: c.cy }, radius: c.r }));
  const line = flat.has('point')
    ? { x1: 100, y1: 100, x2: 900, y2: 700 }
    : { a: { x: 100, y: 100 }, b: { x: 900, y: 700 } };
  return { raw: { surfaces: rawSurfaces, rays: rawRays, circles: rawCircles }, surfaces, rays, circles, points, line };
}

/** 직접 짠 ray × segment 교점 t. `physics-kernels.mjs`와 같은 식이다. */
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

/** API 장면과 같은 계산을 직접 짠 코드로 한다. */
function makeHand({ raw, points }) {
  return {
    ray: () => {
      let sum = 0;
      for (const r of raw.rays) {
        for (const s of raw.surfaces) {
          const t = handRaySegment(s, r.ox, r.oy, r.dx, r.dy);
          if (t < Infinity) sum += t;
        }
      }
      return sum;
    },
    circle: () => {
      let count = 0;
      for (let i = 0; i < raw.circles.length; i++) {
        for (let j = i + 1; j < raw.circles.length; j++) {
          const a = raw.circles[i];
          const b = raw.circles[j];
          const dx = b.cx - a.cx;
          const dy = b.cy - a.cy;
          const rSum = a.r + b.r;
          if (dx * dx + dy * dy <= rSum * rSum) count++;
        }
      }
      return count;
    },
    point: () => {
      let sum = 0;
      for (const p of points) sum += handSegmentDistance(100, 100, 900, 700, p.x, p.y);
      return sum;
    },
  };
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
  const scene = makeScene();
  const { surfaces, rays, circles, points, line } = scene;
  const [kind, variant] = name.split('-');
  const hand = makeHand(scene)[kind];
  const api = {
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
  }[kind];
  const run = variant === 'hand' ? hand : api;
  let sink = variant === 'polluted' ? prime(vec, polygon) : 0;
  if (!Number.isFinite(sink)) throw new Error(`오염 호출 결과가 유효하지 않다. 프로필 ${profile}`);
  const check = run();
  if (!Number.isFinite(check) || check <= 0) throw new Error(`장면 결과가 유효하지 않다. 항목 ${name}, 결과 ${check}`);
  // 입력 형식을 잘못 고르면 결과가 finite여도 틀린다. hand 결과와 대조한다.
  const expected = hand();
  if (Math.abs(check - expected) > 1e-9 * Math.max(1, Math.abs(expected))) {
    throw new Error(`hand 결과와 다르다. 항목 ${name}, 결과 ${check}, hand ${expected}`);
  }

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
