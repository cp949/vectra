/**
 * path의 경계·aliasing·암묵 시작점 분기 테스트.
 *
 * 검증 항목:
 *  1. 호 방향과 non-finite 시작점 처리.
 *  2. 여러 segment 경로에서 찾은 뒤의 순회 종료, 길이 0 segment의 t.
 *  3. `out`과 입력이 같은 배열인 aliasing.
 *  4. 아무것도 그리지 않는 close와 close 뒤 암묵 시작점.
 *  5. winding·containsPoint·distanceToPoint의 방향별 교차 판정.
 *  6. 알 수 없는 command kind를 타입을 검사하지 않는 JS 호출자가 넘겼을 때의 동작.
 *
 * 설계 메모:
 *  - 6번은 `as never`로 타입을 우회한다. 현재 동작을 고정한다.
 */
import { describe, expect, test } from 'vitest';
import { arcThroughCommandsInto } from '../../../src/path/arc-through-commands-into';
import { containsPoint } from '../../../src/path/contains-point';
import { distanceToPoint } from '../../../src/path/distance-to-point';
import { drawingSegmentLengths } from '../../../src/path/drawing-segment-lengths.internal';
import { equalizeSegmentsInto } from '../../../src/path/equalize-segments-into';
import { lengthAtLocation } from '../../../src/path/length-at-location';
import { locationAtLength } from '../../../src/path/location-at-length';
import { orientCommandsInto } from '../../../src/path/orient-commands-into';
import { type DrawSegment, forEachDrawSegment } from '../../../src/path/path-segments.internal';
import { splitCommandsAtLength } from '../../../src/path/path-slice.internal';
import { sanitizeCommandsInto } from '../../../src/path/sanitize-commands-into';
import { signedArea } from '../../../src/path/signed-area';
import { winding } from '../../../src/path/winding';
import type { PathCommand } from '../../../src/types';

const move = (x: number, y: number): PathCommand => ({ kind: 'move', x, y });
const line = (x: number, y: number): PathCommand => ({ kind: 'line', x, y });
const close: PathCommand = { kind: 'close' };

/** 알 수 없는 kind의 command를 만든다. 타입을 검사하지 않는 호출자를 흉내 낸다. */
const unknownCommand = (x: number, y: number): PathCommand => ({ kind: 'bogus', x, y }) as never;

describe('arcThroughCommandsInto 방향', () => {
  test('반시계 방향 호가 ±π 경계를 넘으면 sweep을 양수로 보정한다', () => {
    // (-1, 0) → (0, -1) → (1, 0)은 반시계다. 시작 각도 π, 끝 각도 0이라 차이가 음수다.
    const out: PathCommand[] = [];
    arcThroughCommandsInto(out, { x: -1, y: 0 }, { x: 0, y: -1 }, { x: 1, y: 0 });
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual(move(-1, 0));
    const first = out[1] as Extract<PathCommand, { kind: 'cubic' }>;
    const last = out[2] as Extract<PathCommand, { kind: 'cubic' }>;
    expect(first.x).toBeCloseTo(0, 12);
    expect(first.y).toBeCloseTo(-1, 12);
    expect(last.x).toBeCloseTo(1, 12);
    expect(last.y).toBeCloseTo(0, 12);
  });
});

describe('drawingSegmentLengths non-finite 시작점', () => {
  test('시작점 x가 NaN이면 그 segment 길이는 NaN이다', () => {
    expect(drawingSegmentLengths([move(Number.NaN, 0), line(1, 1)])).toEqual([Number.NaN]);
  });

  test('시작점 y가 Infinity이면 그 segment 길이는 NaN이다', () => {
    expect(drawingSegmentLengths([move(0, Number.POSITIVE_INFINITY), line(1, 1)])).toEqual([Number.NaN]);
  });
});

describe('길이·위치 변환', () => {
  const twoLines = [move(0, 0), line(10, 0), line(10, 10)];

  test('lengthAtLocation은 첫 segment를 찾은 뒤 나머지 segment를 건너뛴다', () => {
    expect(lengthAtLocation(twoLines, { segmentIndex: 0, t: 0.5 })).toBe(5);
  });

  test('locationAtLength는 첫 segment 안의 거리를 찾은 뒤 나머지 segment를 건너뛴다', () => {
    expect(locationAtLength(twoLines, 4)).toEqual({ segmentIndex: 0, t: 0.4 });
  });

  test('locationAtLength는 길이 0 segment에서 거리 0이면 t = 0을 돌려준다', () => {
    expect(locationAtLength([move(0, 0), line(0, 0), line(10, 0)], 0)).toEqual({ segmentIndex: 0, t: 0 });
  });

  test('splitCommandsAtLength는 길이 0 line을 음수 거리로 나누면 t = 0에서 나눈다', () => {
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    expect(splitCommandsAtLength(outA, outB, [move(0, 0), line(0, 0), line(10, 0)], -1)).toBe(true);
    expect(outA[0]).toEqual(move(0, 0));
    expect(outB[0]).toEqual(move(0, 0));
    expect(outB[outB.length - 1]).toEqual(line(10, 0));
  });
});

describe('aliasing', () => {
  const square = [move(0, 0), line(10, 0), line(10, 10), line(0, 10), close];

  test('orientCommandsInto는 방향이 이미 맞으면 out이 입력과 같아도 그대로 둔다', () => {
    const original = structuredClone(square);
    const cw = [...original];
    const ccw = [...original];
    orientCommandsInto(cw, cw, true);
    orientCommandsInto(ccw, ccw, false);
    // 두 방향 중 하나는 이미 맞아 복사만 하고, 다른 하나는 뒤집힌다.
    const unchanged = [cw, ccw].filter((r) => JSON.stringify(r) === JSON.stringify(original));
    expect(unchanged).toHaveLength(1);
  });

  test('equalizeSegmentsInto는 out이 입력과 같아도 안전하게 padding한다', () => {
    const a: PathCommand[] = [move(0, 0), line(1, 0)];
    const b: PathCommand[] = [move(0, 0), line(1, 0), line(2, 0)];
    equalizeSegmentsInto(a, b, a, b);
    expect(a).toHaveLength(3);
    expect(a[0]).toEqual(move(0, 0));
    expect(a[1]).toEqual(line(1, 0));
    expect(a[2].kind).toBe('cubic');
    expect(b).toHaveLength(3);
  });
});

describe('equalizeSegmentsInto padding 위치', () => {
  test('그리는 segment가 없고 move와 close만 있으면 move 좌표에 zero-length cubic을 붙인다', () => {
    const a: PathCommand[] = [];
    const b: PathCommand[] = [];
    equalizeSegmentsInto(a, b, [move(3, 4), close], [move(0, 0), line(1, 1)]);
    expect(a).toEqual([move(3, 4), close, { kind: 'cubic', x1: 3, y1: 4, x2: 3, y2: 4, x: 3, y: 4 }]);
  });

  test('아무것도 그리지 않는 close는 그대로 두고 segment로 세지 않는다', () => {
    const a: PathCommand[] = [];
    const b: PathCommand[] = [];
    // a의 두 번째 close는 이미 닫힌 뒤라 segment가 아니다. segment는 line과 close 2개다.
    equalizeSegmentsInto(
      a,
      b,
      [move(0, 0), line(1, 0), close, close],
      [move(0, 0), line(1, 0), line(2, 0), line(3, 0)]
    );
    expect(a.filter((c) => c.kind === 'close')).toHaveLength(2);
    expect(a.filter((c) => c.kind === 'cubic')).toHaveLength(1);
    expect(b).toHaveLength(4);
  });
});

describe('close와 암묵 시작점', () => {
  // (5,5) → (15,5) → (15,15) → close 뒤 move 없이 (25,5) → (25,25)로 이어진다.
  // 둘째 subpath는 원점이 아니라 첫 subpath 시작점 (5,5)에서 시작한다.
  const implicitRestart = [move(5, 5), line(15, 5), line(15, 15), close, line(25, 5), line(25, 25), close];

  test('signedArea는 close 뒤 move가 없으면 subpath 시작점에서 이어 합산한다', () => {
    // 첫 삼각형 50, 둘째 삼각형 (5,5)-(25,5)-(25,25) 200. 원점에서 이었다면 둘째가 250이 된다.
    expect(signedArea(implicitRestart)).toBeCloseTo(250, 9);
  });

  test('signedArea는 move 바로 뒤의 close를 무시한다', () => {
    expect(signedArea([move(5, 5), close])).toBe(0);
  });

  test('winding은 close 뒤 move가 없으면 subpath 시작점에서 이어 센다', () => {
    // (22, 4.5)는 원점에서 이은 삼각형 안이지만 (5,5) 시작 삼각형 밖이다.
    expect(winding(implicitRestart, { x: 22, y: 4.5 })).toBe(0);
    expect(winding(implicitRestart, { x: 24, y: 10 })).toBe(1);
  });

  test('winding은 move 바로 뒤의 close를 무시한다', () => {
    expect(winding([move(5, 5), close], { x: 5, y: 5 })).toBe(0);
  });

  test('containsPoint는 close 뒤 move가 없으면 subpath 시작점에서 이어 센다', () => {
    expect(containsPoint(implicitRestart, { x: 22, y: 4.5 })).toBe(false);
    expect(containsPoint(implicitRestart, { x: 24, y: 10 })).toBe(true);
  });

  test('containsPoint는 move 바로 뒤의 close를 무시한다', () => {
    expect(containsPoint([move(5, 5), close], { x: 5, y: 5 })).toBe(false);
  });
});

describe('방향별 교차 판정', () => {
  const ccwSquare = [move(0, 0), line(10, 0), line(10, 10), line(0, 10), close];
  const cwSquare = [move(0, 0), line(0, 10), line(10, 10), line(10, 0), close];

  test('winding은 시계 방향 사각형 안의 점을 -1로 센다', () => {
    expect(winding(cwSquare, { x: 5, y: 5 })).toBe(-1);
  });

  test('winding은 반시계 방향 사각형 안의 점을 +1로 센다', () => {
    expect(winding(ccwSquare, { x: 5, y: 5 })).toBe(1);
  });

  test('winding은 사각형 오른쪽 바깥의 점을 0으로 센다', () => {
    expect(winding(ccwSquare, { x: 15, y: 5 })).toBe(0);
    expect(winding(cwSquare, { x: 15, y: 5 })).toBe(0);
  });

  test('containsPoint는 시계 방향 사각형 안의 점을 포함한다고 본다', () => {
    expect(containsPoint(cwSquare, { x: 5, y: 5 })).toBe(true);
  });

  test('containsPoint는 첫 subpath 경계에서 확정되면 뒤 command를 보지 않는다', () => {
    const commands = [...ccwSquare, move(100, 100), line(110, 100), line(110, 110), close];
    expect(containsPoint(commands, { x: 0, y: 5 })).toBe(true);
  });

  test('distanceToPoint는 close 변이 가장 가까우면 그 거리를 돌려준다', () => {
    // 삼각형 (0,0) → (10,0) → (10,10) → close. 점 (2, 4)에서 대각선까지 √2, 아래 변까지 4, 오른쪽 변까지 8.
    const triangle = [move(0, 0), line(10, 0), line(10, 10), close];
    expect(distanceToPoint(triangle, { x: 2, y: 4 })).toBeCloseTo(Math.SQRT2, 12);
  });
});

describe('알 수 없는 command kind', () => {
  test('forEachDrawSegment는 그리지 않고 current point만 옮긴다', () => {
    const seen: DrawSegment[] = [];
    forEachDrawSegment([move(0, 0), unknownCommand(5, 5), line(6, 5)], (seg) => seen.push(seg));
    expect(seen).toHaveLength(1);
    expect(seen[0].kind).toBe('line');
    expect(seen[0].fromX).toBe(5);
    expect(seen[0].fromY).toBe(5);
  });

  test('sanitizeCommandsInto는 끝점을 읽을 수 없어 중복으로 보지 않고 남긴다', () => {
    const unknown = unknownCommand(0, 0);
    const out: PathCommand[] = [];
    sanitizeCommandsInto(out, [move(0, 0), unknown], { removeDuplicates: true });
    expect(out).toEqual([move(0, 0), unknown]);
  });

  test('sanitizeCommandsInto는 move 바로 뒤의 close를 쓰고도 current point를 옮기지 않는다', () => {
    const out: PathCommand[] = [];
    sanitizeCommandsInto(out, [move(5, 5), close, line(5, 5)], { removeDuplicates: true });
    expect(out).toEqual([move(5, 5), close]);
  });

  test('signedArea는 알 수 없는 command뿐이면 flatten 결과가 비어 면적 0이다', () => {
    expect(signedArea([unknownCommand(3, 4)])).toBe(0);
  });
});
