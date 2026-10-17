/**
 * `ringSelfIntersects`의 sweep 가속이 O(n²) 전수 비교와 같은 결과를 내는지 확인하는 동치 테스트.
 *
 * sweep은 성능 변경이라 모든 입력에서 반환값이 같아야 한다. oracle은 sweep 도입 전의 이중 루프를
 * 그대로 옮긴 함수다. 가속 효과는 이 파일에서 재지 않는다(시간 임계값은 flaky하다).
 *
 * 입력 구성:
 * - 근평행 chain: AABB 가지치기 오류를 잡는 핵심 입력이다. 랜덤 polygon은 거의 다 true라 오류를 못 잡는다.
 * - 고정 회귀 입력: pad 부족, 인자 순서 비대칭, 길이 곱 overflow 반례.
 * - 폴백 경계: non-finite 좌표, edge 길이 한계, 명시 epsilon, `SWEEP_MIN_VERTEX_COUNT` 전후의 n.
 * - 일반 입력: star-shaped, 같은 점 반복, collinear overlap, endpoint touch, 큰·작은·음수 좌표.
 */
import { describe, expect, test } from 'vitest';
import { lineFamilyIntersects, segmentToLineFamilyParam } from '../../../src/internal/line-family';
import { isSelfIntersecting } from '../../../src/polygon/is-self-intersecting';
import { isSimple } from '../../../src/polygon/is-simple';
import { ringSelfIntersects } from '../../../src/polygon/self-intersection.internal';
import { SWEEP_MIN_VERTEX_COUNT, sweepRingSelfIntersects } from '../../../src/polygon/self-intersection-sweep.internal';

type Pt = [number, number];

// 카테고리 하나가 수만 건을 oracle과 비교한다. 느린 CI에서도 기본 5초 제한을 넘지 않게 넉넉히 둔다.
const LONG_TIMEOUT_MS = 60_000;

// 이 길이를 넘는 edge가 하나라도 있으면 sweep을 쓰지 않는다. `Math.sqrt(Math.sqrt(Number.MAX_VALUE))`다.
const MAX_SAFE_EDGE_LENGTH = Math.sqrt(Math.sqrt(Number.MAX_VALUE));

/** 카테고리별 비교 건수와 oracle이 true를 낸 건수. 마지막 테스트가 분포를 확인한다. */
const stats = new Map<string, { cases: number; trueCases: number }>();

/**
 * 시드 고정 xorshift32 난수 생성기를 만든다.
 * 같은 시드는 항상 같은 입력열을 내므로 실패를 재현할 수 있다.
 */
function createRng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

/**
 * sweep 도입 전의 `ringSelfIntersects` 이중 루프다.
 * 판정 의미를 바꾸지 않으려고 원본을 그대로 옮겼다. 인자 순서는 항상 (작은 index, 큰 index)다.
 */
function oracleRingSelfIntersects(pts: readonly Pt[], epsilon: number | undefined): boolean {
  const n = pts.length;
  if (n < 4) return false;
  const edges = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    edges.push(segmentToLineFamilyParam(pts[i][0], pts[i][1], pts[j][0], pts[j][1]));
  }
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      if (lineFamilyIntersects(edges[i], edges[j], epsilon)) return true;
    }
  }
  return false;
}

/**
 * 입력 하나를 oracle과 비교하고 카테고리 통계를 쌓는다.
 * 불일치하면 입력을 담은 설명 문자열을 반환한다. caller는 모아서 한 번에 단언한다.
 */
function compareCase(category: string, label: string, pts: readonly Pt[], epsilon?: number): string | undefined {
  const expected = oracleRingSelfIntersects(pts, epsilon);
  const actual = ringSelfIntersects(pts, epsilon);
  const entry = stats.get(category) ?? { cases: 0, trueCases: 0 };
  entry.cases++;
  if (expected) entry.trueCases++;
  stats.set(category, entry);
  if (expected === actual) return undefined;
  return `${label}: n=${pts.length} oracle=${expected} actual=${actual} pts=${JSON.stringify(pts).slice(0, 400)}`;
}

/**
 * 생성기가 만든 입력을 `count`건 비교하고 불일치 목록을 반환한다.
 * `epsilon`을 주면 모든 입력에 같은 명시 epsilon을 쓴다.
 */
function runCategory(category: string, count: number, generate: (index: number) => Pt[], epsilon?: number): string[] {
  const mismatches: string[] = [];
  for (let k = 0; k < count; k++) {
    const m = compareCase(category, `${category}#${k}`, generate(k), epsilon);
    if (m !== undefined) mismatches.push(m);
  }
  return mismatches;
}

/**
 * 정다각형(원형) ring을 만든다. 모든 vertex가 반지름 `radius` 원 위에 있다.
 */
function createCircle(n: number, radius = 1, cx = 0, cy = 0): Pt[] {
  return Array.from({ length: n }, (_, k) => [
    cx + radius * Math.cos((2 * Math.PI * k) / n),
    cy + radius * Math.sin((2 * Math.PI * k) / n),
  ]);
}

/**
 * 원점 기준 star-shaped polygon을 만든다. 각도는 단조 증가하고 반지름만 흔들려 대개 simple이다.
 * sweep이 true를 낼 일이 없는 입력에서 가지치기가 쌍을 잘못 버리지 않는지 보는 기본 입력이다.
 */
function createStarShaped(rnd: () => number, n: number, scale: number, cx: number, cy: number): Pt[] {
  return Array.from({ length: n }, (_, k) => {
    const angle = (2 * Math.PI * (k + (rnd() - 0.5) * 0.6)) / n;
    const radius = scale * (0.3 + 0.7 * rnd());
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  });
}

/**
 * 두 vertex를 맞바꿔 ring 중간에 교차를 만든다.
 * star-shaped 입력에서 true 비율을 끌어올리는 데 쓴다.
 */
function swapTwoVertices(rnd: () => number, pts: Pt[]): Pt[] {
  const out = pts.map((p): Pt => [p[0], p[1]]);
  const a = Math.floor(rnd() * out.length);
  const b = Math.floor(rnd() * out.length);
  [out[a], out[b]] = [out[b], out[a]];
  return out;
}

/**
 * 점 `from`에서 `to`로 이어지는 반원 위의 등간격 점 `segments - 1`개를 반환한다. 양 끝점은 포함하지 않는다.
 * 반원이 중심을 두 점의 중점에 두므로 근평행 edge 쌍을 만든 뒤 ring을 닫는 데 쓴다.
 */
function semicircleBetween(from: Pt, to: Pt, segments: number): Pt[] {
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2;
  const radius = Math.hypot(from[0] - mx, from[1] - my);
  const start = Math.atan2(from[1] - my, from[0] - mx);
  const out: Pt[] = [];
  for (let k = 1; k < segments; k++) {
    const angle = start + (Math.PI * k) / segments;
    out.push([mx + radius * Math.cos(angle), my + radius * Math.sin(angle)]);
  }
  return out;
}

/**
 * 거의 일직선인 edge 2–7개를 작은 gap으로 이어 붙이고 반원으로 닫는다.
 * edge 사이 각도 sin θ는 1e-9 바로 위·아래(≤ 5e-9)이고 gap은 edge 길이의 1e-9–1e-6배다.
 * 근평행 crossing 경로는 t, u 오차가 `Number.EPSILON / sin θ`배로 증폭된다.
 * pad가 부족하면 true인 쌍이 AABB 가지치기로 사라진다. 이 입력이 그 오류를 잡는다.
 * 총 vertex 수는 항상 `SWEEP_MIN_VERTEX_COUNT` 이상이다.
 * `hugeScale`이면 edge 길이를 1e78–1e150으로, sin θ를 1e-30–1e-14로 잡는다. 길이² 곱이 overflow해
 * 평행 임계가 절대값으로 바뀌는 구간이다. 이때 sin θ 하한이 없어 거리 상한을 정할 수 없고,
 * 길이 게이트가 없으면 sweep이 true인 쌍을 버린다.
 */
function createNearParallelChain(rnd: () => number, hugeScale = false): Pt[] {
  const segmentCount = 2 + Math.floor(rnd() * 6);
  const length = hugeScale ? 10 ** (78 + rnd() * 72) : 10 ** (rnd() * 6 - 3);
  const theta = rnd() * 2 * Math.PI;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const ox = (rnd() - 0.5) * length * 10 ** (rnd() * 3);
  const oy = (rnd() - 0.5) * length * 10 ** (rnd() * 3);
  const place = (x: number, y: number): Pt => [ox + cos * x - sin * y, oy + sin * x + cos * y];

  const pts: Pt[] = [];
  let x = 0;
  let y = 0;
  let heading = 0;
  for (let k = 0; k < segmentCount; k++) {
    const edgeLength = length * (0.2 + rnd());
    pts.push(place(x, y));
    x += edgeLength * Math.cos(heading);
    y += edgeLength * Math.sin(heading);
    pts.push(place(x, y));
    const sinMagnitude = hugeScale ? 10 ** (-30 + rnd() * 16) : 1e-9 * (1 + rnd() ** 3 * 4);
    const sinTurn = sinMagnitude * (rnd() < 0.5 ? -1 : 1);
    const gap = edgeLength * 10 ** (-9 + rnd() * 3);
    const lateral = sinTurn * gap * rnd() * (rnd() < 0.5 ? -1 : 1);
    x += gap * Math.cos(heading) - lateral * Math.sin(heading);
    y += gap * Math.sin(heading) + lateral * Math.cos(heading);
    heading += Math.asin(sinTurn);
  }
  pts.push(place(x, y));

  const last = pts[pts.length - 1];
  const needed = SWEEP_MIN_VERTEX_COUNT - pts.length + 1;
  const arcSegments = Math.max(4 + Math.floor(rnd() * 100), needed);
  pts.push(...semicircleBetween(last, pts[0], arcSegments));
  return pts;
}

/**
 * 직선 위에서 거의 겹치는 두 edge A, B를 만들고 반원으로 닫는다.
 * B의 origin은 A의 직선에서 0–3e-9, B의 기울기 sin은 ±3e-9 안에서 흔든다.
 * collinear 경로는 B의 origin만 거리로 재므로 `lineFamilyIntersects`가 인자 순서에 비대칭이다.
 * `reversed`면 B를 먼저 두어 작은 index가 B가 되게 한다. 인자 순서를 바꾸는 구현을 잡는다.
 */
function createNearCollinearPair(rnd: () => number, reversed: boolean): Pt[] {
  const length = 10 ** (rnd() * 6 - 3);
  const theta = rnd() * 2 * Math.PI;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const place = (x: number, y: number): Pt => [cos * x - sin * y, sin * x + cos * y];

  const a0 = place(0, 0);
  const a1 = place(length, 0);
  const offset = (rnd() < 0.5 ? -1 : 1) * rnd() * 3e-9;
  const startAt = length * (0.3 + 0.7 * rnd());
  const bLength = length * (0.3 + rnd());
  const slope = (rnd() < 0.5 ? -1 : 1) * rnd() * 3e-9;
  const b0 = place(startAt, offset);
  const b1 = place(startAt + bLength, offset + slope * bLength);

  const first = reversed ? [b0, b1] : [a0, a1];
  const second = reversed ? [a0, a1] : [b0, b1];
  const head = first[first.length - 1];
  const tail = second[0];
  const needed = SWEEP_MIN_VERTEX_COUNT - 4 + 1;
  const arcSegments = Math.max(4 + Math.floor(rnd() * 60), needed);
  return [...first, ...semicircleBetween(head, tail, arcSegments), ...second];
}

/**
 * 좌표 변환 `(x, y) → (ox + s·x, oy + s·y)`를 적용한다. 큰·작은·음수 좌표와 큰 offset 입력을 만든다.
 */
function transformPoints(pts: readonly Pt[], scale: number, ox: number, oy: number): Pt[] {
  return pts.map((p): Pt => [ox + scale * p[0], oy + scale * p[1]]);
}

describe('ringSelfIntersects sweep 동치', { timeout: LONG_TIMEOUT_MS }, () => {
  test('SWEEP_MIN_VERTEX_COUNT는 4 이상의 정수다', () => {
    expect(Number.isInteger(SWEEP_MIN_VERTEX_COUNT)).toBe(true);
    expect(SWEEP_MIN_VERTEX_COUNT).toBeGreaterThanOrEqual(4);
  });

  test('근평행 chain은 oracle과 같은 결과를 낸다', () => {
    const rnd = createRng(2024);
    const mismatches = runCategory('근평행 chain', 12000, () => createNearParallelChain(rnd));
    expect(mismatches).toEqual([]);
  });

  test('직선 위에서 거의 겹치는 edge 쌍은 인자 순서와 상관없이 oracle과 같은 결과를 낸다', () => {
    const rnd = createRng(31);
    const mismatches = runCategory('근접 collinear 쌍', 4000, (k) => createNearCollinearPair(rnd, k % 2 === 1));
    expect(mismatches).toEqual([]);
  });

  test('star-shaped polygon은 scale, offset, 부호가 달라도 oracle과 같은 결과를 낸다', () => {
    const rnd = createRng(7);
    const frames: Array<[number, number, number]> = [
      [1, 0, 0],
      [1e-6, 0, 0],
      [1e6, 0, 0],
      [1e12, 3e12, -2e12],
      [-1, 0, 0],
      [-250, -9e5, 4e5],
      [1e-3, 1e12, 1e12],
      [1e-9, -5, 7],
    ];
    const mismatches = runCategory('star-shaped', 2400, (k) => {
      const base = createStarShaped(rnd, 64 + Math.floor(rnd() * 80), 1, 0, 0);
      const pts = k % 4 === 0 ? swapTwoVertices(rnd, base) : base;
      const [scale, ox, oy] = frames[k % frames.length];
      return transformPoints(pts, scale, ox, oy);
    });
    expect(mismatches).toEqual([]);
  });

  test('무작위 polygon은 oracle과 같은 결과를 낸다', () => {
    const rnd = createRng(99);
    const mismatches = runCategory('무작위', 1500, () => {
      const n = SWEEP_MIN_VERTEX_COUNT + Math.floor(rnd() * 100);
      const scale = 10 ** (rnd() * 16 - 6);
      return Array.from({ length: n }, (): Pt => [(rnd() - 0.5) * scale, (rnd() - 0.5) * scale]);
    });
    expect(mismatches).toEqual([]);
  });

  test('정수 격자 위 vertex(같은 점·collinear·touch가 흔한 입력)는 oracle과 같은 결과를 낸다', () => {
    const rnd = createRng(5);
    const mismatches = runCategory('정수 격자', 1000, () => {
      const n = SWEEP_MIN_VERTEX_COUNT + Math.floor(rnd() * 60);
      return Array.from({ length: n }, (): Pt => [Math.floor(rnd() * 12), Math.floor(rnd() * 12)]);
    });
    expect(mismatches).toEqual([]);
  });

  test('같은 점 반복과 첫 점 반복(explicit closed)은 oracle과 같은 결과를 낸다', () => {
    const rnd = createRng(11);
    const mismatches = runCategory('같은 점 반복', 1500, (k) => {
      const pts = createStarShaped(rnd, SWEEP_MIN_VERTEX_COUNT + Math.floor(rnd() * 60), 1, 0, 0);
      const at = Math.floor(rnd() * pts.length);
      if (k % 3 === 0) {
        pts.splice(at, 0, [pts[at][0], pts[at][1]]);
      } else if (k % 3 === 1) {
        pts.push([pts[0][0], pts[0][1]]);
      } else {
        pts.splice(at, 0, [pts[at][0], pts[at][1]], [pts[at][0], pts[at][1]]);
        pts.push([pts[0][0], pts[0][1]]);
      }
      return pts;
    });
    expect(mismatches).toEqual([]);
  });

  test('endpoint touch는 직선까지 거리가 1e-9 근처여도 oracle과 같은 결과를 낸다', () => {
    const rnd = createRng(13);
    const lateral = [0, 1e-12, -1e-12, 5e-10, -5e-10, 1e-9, -1e-9, 2e-9, -2e-9, 1e-6];
    const along = [0, 0.25, 0.5, 0.75, 1];
    const mismatches = runCategory('endpoint touch', 3000, (k) => {
      const pts = createStarShaped(rnd, SWEEP_MIN_VERTEX_COUNT + Math.floor(rnd() * 40), 1, 0, 0);
      const n = pts.length;
      const vertex = Math.floor(rnd() * n);
      // 접촉 대상 edge는 vertex에 인접하지 않은 edge로 고른다.
      const edge = (vertex + 2 + Math.floor(rnd() * (n - 3))) % n;
      const p = pts[edge];
      const q = pts[(edge + 1) % n];
      const t = along[k % along.length];
      const d = lateral[Math.floor(k / along.length) % lateral.length];
      const ex = q[0] - p[0];
      const ey = q[1] - p[1];
      const len = Math.hypot(ex, ey) || 1;
      pts[vertex] = [p[0] + t * ex - (ey / len) * d, p[1] + t * ey + (ex / len) * d];
      return pts;
    });
    expect(mismatches).toEqual([]);
  });

  test('collinear overlap은 oracle과 같은 결과를 낸다', () => {
    const rnd = createRng(17);
    const lengths = [0.1, 0.5, 1, 2];
    const mismatches = runCategory('collinear overlap', 1500, (k) => {
      const pts = createStarShaped(rnd, SWEEP_MIN_VERTEX_COUNT + 6 + Math.floor(rnd() * 40), 1, 0, 0);
      const n = pts.length;
      const i = Math.floor(rnd() * (n - 6));
      const j = i + 3 + Math.floor(rnd() * (n - i - 4));
      const sign = k % 2 === 0 ? 1 : -1;
      const base = pts[i];
      const length = 0.3 * sign;
      pts[i + 1] = [base[0] + length, base[1]];
      // 둘째 edge는 같은 수평선 위에서 첫 edge와 겹치거나 끝점만 닿는다.
      const startFraction = k % 5 === 0 ? 1 : 0.2 + 0.6 * rnd();
      pts[j] = [base[0] + startFraction * length, base[1]];
      pts[j + 1] = [pts[j][0] + lengths[k % lengths.length] * sign * 0.3, base[1]];
      return pts;
    });
    expect(mismatches).toEqual([]);
  });

  test('n이 SWEEP_MIN_VERTEX_COUNT 전후와 큰 값이어도 oracle과 같은 결과를 낸다', () => {
    const rnd = createRng(23);
    const sizes = [4, 5, 16, SWEEP_MIN_VERTEX_COUNT - 1, SWEEP_MIN_VERTEX_COUNT, SWEEP_MIN_VERTEX_COUNT + 1, 300, 400];
    const mismatches = runCategory('n 경계', 800, (k) => {
      const n = sizes[k % sizes.length];
      const base = k % 2 === 0 ? createCircle(n) : createStarShaped(rnd, n, 1, 0, 0);
      return k % 3 === 0 ? swapTwoVertices(rnd, base) : base;
    });
    expect(mismatches).toEqual([]);
  });

  test('명시 epsilon은 O(n²) 루프로 폴백해 oracle과 같은 결과를 낸다', () => {
    const epsilons = [0, 1e-12, 1e-9, 1e-6, 1e-3, 1, 1e6];
    const mismatches: string[] = [];
    for (const epsilon of epsilons) {
      const rnd = createRng(Math.floor(epsilon * 1e12) + 41);
      mismatches.push(
        ...runCategory(
          '명시 epsilon',
          300,
          (k) =>
            k % 2 === 0 ? createNearParallelChain(rnd) : createStarShaped(rnd, SWEEP_MIN_VERTEX_COUNT + 20, 1, 0, 0),
          epsilon
        )
      );
    }
    expect(mismatches).toEqual([]);
  });

  test('NaN, Infinity 좌표는 O(n²) 루프로 폴백해 oracle과 같은 결과를 낸다', () => {
    const rnd = createRng(53);
    const bad = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
    const mismatches = runCategory('non-finite', 900, (k) => {
      const base = createStarShaped(rnd, SWEEP_MIN_VERTEX_COUNT + Math.floor(rnd() * 40), 1, 0, 0);
      // 절반은 non-finite edge와 무관한 교차를 함께 둔다. NaN이 정렬을 흐트러 이 교차를 놓치면 불일치다.
      const pts = k % 2 === 0 ? swapTwoVertices(rnd, base) : base;
      const hits = 1 + (k % 3 === 2 ? 1 : 0);
      for (let h = 0; h < hits; h++) {
        pts[Math.floor(rnd() * pts.length)][Math.floor(rnd() * 2)] = bad[(k + h) % bad.length];
      }
      return pts;
    });
    expect(mismatches).toEqual([]);
  });

  test('NaN, Infinity 좌표가 있어도 true가 되는 쌍은 oracle처럼 true를 낸다', () => {
    // (0,0)→(1,1)과 (0,0)→(Infinity,Infinity)는 oracle이 true를 낸다. AABB 비교는 NaN에서 false라 sweep이 놓칠 수 있다.
    const pts: Pt[] = [
      [0, 0],
      [1, 1],
      [0, 0],
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
      ...createCircle(SWEEP_MIN_VERTEX_COUNT, 5, 100, 100),
    ];
    expect(oracleRingSelfIntersects(pts, undefined)).toBe(true);
    expect(ringSelfIntersects(pts, undefined)).toBe(true);
  });

  test('edge 길이가 한계(약 1.16e77) 전후여도 oracle과 같은 결과를 낸다', () => {
    const rnd = createRng(61);
    const factors = [1e-3, 0.5, 0.99, 0.999999, 1.000001, 1.01, 2, 1e3];
    const mismatches = runCategory('edge 길이 한계', 800, (k) => {
      const n = SWEEP_MIN_VERTEX_COUNT + (k % 3) * 20;
      const radius = (factors[k % factors.length] * MAX_SAFE_EDGE_LENGTH) / (2 * Math.sin(Math.PI / n));
      const base = k % 2 === 0 ? createCircle(n, radius) : createStarShaped(rnd, n, radius, 0, 0);
      return k % 4 === 0 ? swapTwoVertices(rnd, base) : base;
    });
    expect(mismatches).toEqual([]);
  });

  test('극단 scale(1e-320–1e307)과 큰 offset도 oracle과 같은 결과를 낸다', () => {
    const rnd = createRng(67);
    const exponents = [-320, -300, -200, -160, -80, 80, 150, 154, 160, 200, 300, 307];
    const mismatches = runCategory('극단 scale', 1200, (k) => {
      const scale = 10 ** exponents[k % exponents.length];
      const n = SWEEP_MIN_VERTEX_COUNT + Math.floor(rnd() * 80);
      const base = createStarShaped(rnd, n, 1, 0, 0);
      return transformPoints(k % 5 === 0 ? swapTwoVertices(rnd, base) : base, scale, 0, 0);
    });
    mismatches.push(
      ...runCategory('큰 offset', 800, (k) => {
        const [offset, radius] = [
          [1e12, 1],
          [1e12, 1e-3],
          [1e300, 1e290],
          [-1e300, 1e295],
        ][k % 4];
        const n = SWEEP_MIN_VERTEX_COUNT + Math.floor(rnd() * 60);
        return createCircle(n, radius, offset, offset);
      })
    );
    expect(mismatches).toEqual([]);
  });

  test('큰 offset 위의 근평행 chain은 oracle과 같은 결과를 낸다', () => {
    const rnd = createRng(73);
    const scales = [1e-3, 1e-2, 1e-1, 1];
    const offsets = [1e2, 1e3, 1e5, 1e7];
    const mismatches = runCategory('offset chain', 3000, (k) => {
      const sign = k % 2 === 0 ? 1 : -1;
      return transformPoints(
        createNearParallelChain(rnd),
        scales[k % scales.length],
        sign * offsets[Math.floor(k / 2) % offsets.length],
        -sign * offsets[Math.floor(k / 8) % offsets.length]
      );
    });
    expect(mismatches).toEqual([]);
  });

  test('길이² 곱이 overflow하는 거대 scale의 근평행 chain은 oracle과 같은 결과를 낸다', () => {
    const rnd = createRng(79);
    const mismatches = runCategory('거대 scale chain', 2000, () => createNearParallelChain(rnd, true));
    expect(mismatches).toEqual([]);
  });

  describe('고정 회귀 입력', () => {
    /**
     * pad 부족 반례(79 vertex)를 만든다. 판정이 true인 쌍은 edge (0, 2) 하나다.
     * 두 edge의 AABB는 X로 4.7e-8, Y로 6.2e-8 떨어져 있다. 고정 pad 1e-9는 이 쌍을 버린다.
     * 근평행 crossing은 t, u 오차가 `Number.EPSILON / sin θ`배로 커져 이만큼 떨어져도 true가 된다.
     */
    function createPadShortfallRing(): Pt[] {
      const a0: Pt = [-0.44125194416313074, -0.41396092862744915];
      const a1: Pt = [0.16348209977149963, 0.38246655464172363];
      const b0: Pt = [0.16348214699478922, 0.3824666168342298];
      const b1: Pt = [0.5865217469988656, 0.9396046979891072];
      return [a0, a1, b0, b1, ...semicircleBetween(b1, a0, 76)];
    }

    /**
     * 인자 순서 비대칭 반례를 만든다. 작은 index의 edge가 B, 큰 index의 edge가 A다.
     * `lineFamilyIntersects(A, B)`는 true, `(B, A)`는 false다. oracle은 (B, A)로 부른다.
     * sweep이 X 정렬 순서(A가 먼저)로 넘기면 true가 되어 결과가 어긋난다.
     */
    function createArgumentOrderRing(): Pt[] {
      const a0: Pt = [0, 0];
      const a1: Pt = [1, 0];
      const b0: Pt = [0.9, 0.5e-9];
      const b1: Pt = [1.9, 0.5e-9 - 0.9e-9];
      return [b0, b1, ...semicircleBetween(b1, a0, SWEEP_MIN_VERTEX_COUNT), a0, a1];
    }

    /**
     * 길이 곱 overflow 반례를 만든다. 좌표 scale이 1e154라 두 edge의 길이² 곱이 Infinity가 된다.
     * 이때 평행 임계가 절대값 1e-9로 바뀌어 sin θ 하한이 사라진다. oracle은 AABB가 멀리 떨어진 이 쌍을 true로 본다.
     * edge 1(`a0 → a1`)과 마지막 edge(`b0 → b1`)가 그 쌍이다. 이 쌍이 유일한 true다.
     * a1에서 b0까지 이어지는 반원은 n을 맞추는 padding이며 다른 edge와 만나지 않는다.
     */
    function createLengthProductOverflowRing(): Pt[] {
      const b1: Pt = [1.2518434770170041e154, 2.0592082298742382e153];
      const a0: Pt = [1.0531961926656516e153, 2.2766256785313366e153];
      const a1: Pt = [-1.0503593283057378e154, 5.536864498038856e153];
      const b0: Pt = [6.526886630425066e153, -1.2013080426680649e154];
      return [b1, a0, a1, ...semicircleBetween(a1, b0, SWEEP_MIN_VERTEX_COUNT), b0];
    }

    test('pad 부족 반례는 oracle과 같이 true이고 isSimple은 false다', () => {
      const ring = createPadShortfallRing();
      expect(ring.length).toBeGreaterThanOrEqual(SWEEP_MIN_VERTEX_COUNT);
      expect(oracleRingSelfIntersects(ring, undefined)).toBe(true);
      expect(ringSelfIntersects(ring, undefined)).toBe(true);
      expect(isSelfIntersecting(ring)).toBe(true);
      expect(isSimple(ring)).toBe(false);
    });

    test('인자 순서 비대칭 반례는 oracle과 같이 false다', () => {
      const ring = createArgumentOrderRing();
      expect(ring.length).toBeGreaterThanOrEqual(SWEEP_MIN_VERTEX_COUNT);
      const a = segmentToLineFamilyParam(0, 0, 1, 0);
      const b = segmentToLineFamilyParam(0.9, 0.5e-9, 1.9, 0.5e-9 - 0.9e-9);
      // 전제: 두 인자 순서의 결과가 실제로 다르다.
      expect(lineFamilyIntersects(a, b, undefined)).toBe(true);
      expect(lineFamilyIntersects(b, a, undefined)).toBe(false);
      expect(ringSelfIntersects(ring, undefined)).toBe(oracleRingSelfIntersects(ring, undefined));
      expect(ringSelfIntersects(ring, undefined)).toBe(false);
    });

    test('길이 곱 overflow 반례는 oracle과 같이 true이고 폴백한다', () => {
      const ring = createLengthProductOverflowRing();
      expect(ring.length).toBeGreaterThanOrEqual(SWEEP_MIN_VERTEX_COUNT);
      const a = segmentToLineFamilyParam(ring[1][0], ring[1][1], ring[2][0], ring[2][1]);
      const b = segmentToLineFamilyParam(ring[ring.length - 1][0], ring[ring.length - 1][1], ring[0][0], ring[0][1]);
      // 전제: 이 쌍의 길이² 곱은 overflow이고, 판정은 true다.
      expect((a.dx * a.dx + a.dy * a.dy) * (b.dx * b.dx + b.dy * b.dy)).toBe(Number.POSITIVE_INFINITY);
      expect(lineFamilyIntersects(a, b, undefined)).toBe(true);
      // 길이 게이트가 sweep을 거절해야 한다. 거절하지 않으면 이 쌍을 AABB 가지치기로 버린다.
      const edges = ring.map((p, i) => {
        const q = ring[(i + 1) % ring.length];
        return segmentToLineFamilyParam(p[0], p[1], q[0], q[1]);
      });
      expect(sweepRingSelfIntersects(edges)).toBeUndefined();
      expect(oracleRingSelfIntersects(ring, undefined)).toBe(true);
      expect(ringSelfIntersects(ring, undefined)).toBe(true);
    });
  });

  test('카테고리마다 충분한 건수를 비교했고 필요한 곳은 true와 false가 섞여 있다', () => {
    const mixed = ['근평행 chain', '근접 collinear 쌍', 'star-shaped', 'endpoint touch', 'n 경계', '극단 scale'];
    const minCases: Record<string, number> = {
      '근평행 chain': 12000,
      '근접 collinear 쌍': 4000,
      'star-shaped': 2400,
      무작위: 1500,
      '정수 격자': 1000,
      '같은 점 반복': 1500,
      'endpoint touch': 3000,
      'collinear overlap': 1500,
      'n 경계': 800,
      '명시 epsilon': 2100,
      'non-finite': 900,
      'edge 길이 한계': 800,
      '극단 scale': 1200,
      '큰 offset': 800,
      'offset chain': 3000,
      '거대 scale chain': 2000,
    };
    for (const [category, min] of Object.entries(minCases)) {
      const entry = stats.get(category);
      expect(entry?.cases ?? 0, category).toBeGreaterThanOrEqual(min);
    }
    for (const category of mixed) {
      const entry = stats.get(category);
      expect(entry?.trueCases ?? 0, `${category} true`).toBeGreaterThan(0);
      expect((entry?.cases ?? 0) - (entry?.trueCases ?? 0), `${category} false`).toBeGreaterThan(0);
    }
  });
});
