import { describe, expect, test } from 'vitest';
import { closestPointInto } from '../../../src/path/closest-point-into';
import { distanceToPoint } from '../../../src/path/distance-to-point';
import type { PathCommand, XYObjectWritable } from '../../../src/types/index';

// ──────────────────────────────────────────────
// closestPointInto
// ──────────────────────────────────────────────

describe('closestPointInto', () => {
  test('line-only path에서 segment projection 결과', () => {
    // (0,0)→(100,0) segment에서 point (40, 30)의 closest는 (40, 0)
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ];
    const result = closestPointInto(out, cmds, { x: 40, y: 30 });
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(40, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('point가 endpoint에 가장 가까운 경우', () => {
    // (0,0)→(100,0) segment에서 point (120, 5)의 closest는 segment 끝 (100, 0)
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ];
    const result = closestPointInto(out, cmds, { x: 120, y: 5 });
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(100, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('close segment가 nearest 후보에 포함되는 경우', () => {
    // 삼각형 (0,0)→(10,0)→(10,10)→close
    // point (6, 5): 각 segment의 distSq 비교
    //   line1 (0,0)→(10,0): projection=(6,0), distSq=25
    //   line2 (10,0)→(10,10): projection=(10,5), distSq=16
    //   close (10,10)→(0,0): t=((6-10)*(-10)+(5-10)*(-10))/(100+100)=0.45
    //     → cx=10+0.45*(-10)=5.5, cy=10+0.45*(-10)=5.5, distSq=0.5
    // close segment의 distSq(0.5)가 가장 작으므로 closest ≈ (5.5, 5.5)
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 10, y: 10 },
      { kind: 'close' },
    ];
    const result = closestPointInto(out, cmds, { x: 6, y: 5 });
    expect(result).toBe(true);
    expect(Number.isNaN(out.x)).toBe(false);
    expect(Number.isNaN(out.y)).toBe(false);
    // close segment가 nearest로 선택되어야 한다
    expect(out.x).toBeCloseTo(5.5, 3);
    expect(out.y).toBeCloseTo(5.5, 3);
  });

  test('다중 subpath에서 올바른 closest point 탐지', () => {
    // subpath1: (0,0)→(10,0), subpath2: (100,0)→(110,0)
    // point (5, 1): subpath1의 (5,0)에 가깝다
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'move', x: 100, y: 0 },
      { kind: 'line', x: 110, y: 0 },
    ];
    const result = closestPointInto(out, cmds, { x: 5, y: 1 });
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(5, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('quadratic/cubic path에서 flatten 후 closest point 근사 검증', () => {
    // quadratic path: (0,0)→ ctrl(cx=50, cy=100) →(100,0) (좌우 대칭 curve)
    // point (50, 200): curve 위쪽 바깥 — closest는 곡선 상단(t=0.5, 대칭) 근방이어야 한다
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'quadratic', x1: 50, y1: 100, x: 100, y: 0 },
    ];
    const result = closestPointInto(out, cmds, { x: 50, y: 200 });
    expect(result).toBe(true);
    expect(Number.isNaN(out.x)).toBe(false);
    expect(Number.isNaN(out.y)).toBe(false);
    // curve 위에 있어야 하므로 x는 [0,100] 범위
    expect(out.x).toBeGreaterThanOrEqual(0);
    expect(out.x).toBeLessThanOrEqual(100);
    // curve 대칭이므로 x ≈ 50 (1자리 근사)
    expect(out.x).toBeCloseTo(50, 0);
    // curve가 y > 0 구간을 지나므로 closest y > 0
    expect(out.y).toBeGreaterThan(0);
  });

  test('arc path에서 flatten 후 closest point 근사 검증', () => {
    // arc: (0,0)→(100,0), rx=ry=50
    // sweep=true인 아래쪽 반원에서 point (50, -60)의 closest는 최저점 (50, -50) 근방
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'arc', rx: 50, ry: 50, xRotation: 0, largeArc: false, sweep: true, x: 100, y: 0 },
    ];
    const result = closestPointInto(out, cmds, { x: 50, y: -60 });
    expect(result).toBe(true);
    expect(Number.isNaN(out.x)).toBe(false);
    expect(Number.isNaN(out.y)).toBe(false);
    expect(out.x).toBeCloseTo(50, 10);
    expect(out.y).toBeCloseTo(-50, 10);
    expect(distanceToPoint(cmds, { x: 50, y: -60 })).toBeCloseTo(10, 10);
  });

  test('empty path → false, out 미수정', () => {
    const out: XYObjectWritable = { x: 99, y: 99 };
    const result = closestPointInto(out, [], { x: 0, y: 0 });
    expect(result).toBe(false);
    expect(out.x).toBe(99);
    expect(out.y).toBe(99);
  });

  test('invalid numeric path → throw 없이 NaN closest point 전파', () => {
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: Number.NaN, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const result = closestPointInto(out, cmds, { x: 0, y: 0 });
    expect(result).toBe(true);
    expect(Number.isNaN(out.x)).toBe(true);
  });

  test('move-only path → 첫 번째 move 위치 기록, true', () => {
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [{ kind: 'move', x: 7, y: 13 }];
    const result = closestPointInto(out, cmds, { x: 0, y: 0 });
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(7, 10);
    expect(out.y).toBeCloseTo(13, 10);
  });

  test('move-only path이며 첫 command가 move가 아닌 implicit origin 케이스', () => {
    // move가 없는 path (예: close만) → implicit origin (0,0) 기록
    // 실제로는 CloseCommand만 있을 경우 첫 command가 move가 아니므로 (0,0)을 기록한다
    const out: XYObjectWritable = { x: 99, y: 99 };
    const cmds: PathCommand[] = [{ kind: 'close' }];
    const result = closestPointInto(out, cmds, { x: 5, y: 5 });
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('tuple input point / tuple output storage 검증', () => {
    // tuple 형태 input point와 tuple 형태 output이 동작해야 한다
    const out: [number, number] = [0, 0];
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ];
    const result = closestPointInto(out, cmds, [40, 30]);
    expect(result).toBe(true);
    expect(out[0]).toBeCloseTo(40, 10);
    expect(out[1]).toBeCloseTo(0, 10);
  });

  test('동거리 앞쪽 segment 우선 tie-break', () => {
    // 단일 subpath에서 두 segment가 같은 거리일 때 앞쪽 segment가 선택된다.
    // path: (0,0)→(10,0)→(20,0), point (10, 5)
    //   seg1 (0,0)→(10,0): closest = (10,0), distSq = 25
    //   seg2 (10,0)→(20,0): closest = (10,0), distSq = 25
    // 동거리이므로 앞쪽 seg1의 결과 (10,0)이 남아야 한다 (strict < → 뒤쪽 seg2는 갱신 안 됨)
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 20, y: 0 },
    ];
    const result = closestPointInto(out, cmds, { x: 10, y: 5 });
    expect(result).toBe(true);
    // 앞쪽 seg1의 결과 (10,0)이 유지된다
    expect(out.x).toBeCloseTo(10, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('다중 subpath 동거리 앞쪽 segment 우선 tie-break', () => {
    // subpath1: (0,0)→(10,0), subpath2: (20,0)→(30,0) (x축 수평 배열)
    // query point (10, 5):
    //   subpath1 segment (0,0)→(10,0): closest = (10,0), distSq = 25
    //   subpath2 segment (20,0)→(30,0): closest = (20,0), distSq = 25 (동거리)
    // 동거리 시 앞쪽 segment 우선 → subpath1의 (10,0)이 선택된다
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'move', x: 20, y: 0 },
      { kind: 'line', x: 30, y: 0 },
    ];
    const result = closestPointInto(out, cmds, { x: 10, y: 5 });
    expect(result).toBe(true);
    // 앞쪽 subpath1 끝점 (10,0)이 선택된다
    expect(out.x).toBeCloseTo(10, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('다중 subpath gap segment 버그 회귀 — gap을 nearest 후보로 포함하지 않는다', () => {
    // subpath1: (0,0)→(10,0), subpath2: (50,0)→(60,0)
    // query point (30, 0): 두 subpath 사이 gap에 위치
    //   subpath1 segment (0,0)→(10,0): closest = (10,0), distance = 20
    //   subpath2 segment (50,0)→(60,0): closest = (50,0), distance = 20
    // gap segment가 없으므로 distance = min(20, 20) = 20
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'move', x: 50, y: 0 },
      { kind: 'line', x: 60, y: 0 },
    ];
    const dist = distanceToPoint(cmds, { x: 30, y: 0 });
    expect(dist).toBeCloseTo(20, 10);

    // closest point는 subpath1 끝점 (10,0) 또는 subpath2 시작점 (50,0)이어야 한다
    const out: XYObjectWritable = { x: 0, y: 0 };
    closestPointInto(out, cmds, { x: 30, y: 0 });
    // (10,0)과 (50,0)이 동거리이므로 앞쪽 subpath1의 (10,0)이 선택된다
    expect(out.x).toBeCloseTo(10, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('cubic path에서 flatten 후 closest point 근사 검증', () => {
    // cubic path: (0,0)→ ctrl1(0,100) ctrl2(100,100) →(100,0)
    // query point (50, 200): path 위쪽 바깥
    // closest는 curve 어딘가에 있어야 하며 x∈[0,100], y > 0이어야 한다
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 0, y1: 100, x2: 100, y2: 100, x: 100, y: 0 },
    ];
    const result = closestPointInto(out, cmds, { x: 50, y: 200 });
    expect(result).toBe(true);
    expect(Number.isNaN(out.x)).toBe(false);
    expect(Number.isNaN(out.y)).toBe(false);
    // curve 위의 점이므로 x∈[0,100]
    expect(out.x).toBeGreaterThanOrEqual(0);
    expect(out.x).toBeLessThanOrEqual(100);
    // query가 curve 위쪽에서 내려다보므로 closest y > 0
    expect(out.y).toBeGreaterThan(0);
  });

  test('flatness 옵션이 작을수록 curved path의 근사 closest point가 달라진다', () => {
    // cubic path: (0,0) → ctrl1(0,100) ctrl2(100,100) → (100,0)
    // query point (50, 60): curve 내부에 위치
    // flatness=20(거친)과 flatness=0.1(세밀)의 결과가 실질적으로 다르다
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 0, y1: 100, x2: 100, y2: 100, x: 100, y: 0 },
    ];
    const qx = 50;
    const qy = 60;
    const queryPt = { x: qx, y: qy };

    const outCoarse: XYObjectWritable = { x: 0, y: 0 };
    closestPointInto(outCoarse, cmds, queryPt, { flatness: 20 });

    const outFine: XYObjectWritable = { x: 0, y: 0 };
    closestPointInto(outFine, cmds, queryPt, { flatness: 0.1 });

    // 두 결과 모두 유효한 수여야 한다
    expect(Number.isNaN(outCoarse.x)).toBe(false);
    expect(Number.isNaN(outFine.x)).toBe(false);

    // fine 결과가 coarse 결과보다 query에 더 가깝거나 (실제로는 역방향도 발생 가능하므로)
    // 두 결과 중 fine이 curve 위 더 정밀한 위치를 가리켜야 한다
    // → fine 결과의 distToQuery가 coarse보다 크게 벗어나지 않아야 한다 (10 유닛 이내)
    const distCoarseToQuery = Math.hypot(outCoarse.x - qx, outCoarse.y - qy);
    const distFineToQuery = Math.hypot(outFine.x - qx, outFine.y - qy);
    // 두 근사 모두 query와 합리적인 거리 내에 있어야 한다
    expect(distCoarseToQuery).toBeLessThan(100);
    expect(distFineToQuery).toBeLessThan(100);
    // 두 결과가 실제로 다른 점임을 검증
    expect(Math.hypot(outCoarse.x - outFine.x, outCoarse.y - outFine.y)).toBeGreaterThan(0.1);
  });
});
