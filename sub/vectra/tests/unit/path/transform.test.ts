import { describe, expect, test } from 'vitest';
import { equalizeSegmentsInto } from '../../../src/path/equalize-segments-into';
import { transformCommandsInto } from '../../../src/path/transform-commands-into';
import type { MatrixLike, PathCommand } from '../../../src/types/index';

// 그리는 segment 수를 세는 테스트 보조. forEachDrawSegment와 동일 축을 직접 재현하지 않고
// kind 기준으로 line/quadratic/cubic/arc/close 명령 개수를 센다.
function drawCount(commands: readonly PathCommand[]): number {
  let n = 0;
  for (const cmd of commands) {
    if (cmd.kind !== 'move') {
      n += 1;
    }
  }
  return n;
}

// ──────────────────────────────────────────────
// transformCommandsInto
// ──────────────────────────────────────────────
describe('transformCommandsInto', () => {
  const identity: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

  test('commands가 비어 있으면 out을 clear만 한다', () => {
    const out: PathCommand[] = [{ kind: 'close' }];
    const result = transformCommandsInto(out, [], identity);
    expect(result).toBe(out);
    expect(result).toHaveLength(0);
  });

  test('identity matrix는 좌표를 그대로 둔다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 1, y: 2 },
      { kind: 'line', x: 3, y: 4 },
      { kind: 'quadratic', x1: 5, y1: 6, x: 7, y: 8 },
      { kind: 'cubic', x1: 9, y1: 10, x2: 11, y2: 12, x: 13, y: 14 },
      { kind: 'close' },
    ];
    const out: PathCommand[] = [];
    transformCommandsInto(out, cmds, identity);
    expect(out).toEqual(cmds);
  });

  test('translation matrix는 모든 endpoint와 control point를 이동한다', () => {
    const translate: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'quadratic', x1: 1, y1: 2, x: 3, y: 4 },
      { kind: 'cubic', x1: 1, y1: 1, x2: 2, y2: 2, x: 3, y: 3 },
    ];
    const out: PathCommand[] = [];
    transformCommandsInto(out, cmds, translate);
    expect(out).toEqual([
      { kind: 'move', x: 10, y: 20 },
      { kind: 'line', x: 15, y: 25 },
      { kind: 'quadratic', x1: 11, y1: 22, x: 13, y: 24 },
      { kind: 'cubic', x1: 11, y1: 21, x2: 12, y2: 22, x: 13, y: 23 },
    ]);
  });

  test('uniform scale matrix는 좌표를 비례 확대한다', () => {
    const scale: MatrixLike = { a: 2, b: 0, c: 0, d: 2, tx: 0, ty: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 1, y: 2 },
      { kind: 'line', x: 3, y: 4 },
    ];
    const out: PathCommand[] = [];
    transformCommandsInto(out, cmds, scale);
    expect(out).toEqual([
      { kind: 'move', x: 2, y: 4 },
      { kind: 'line', x: 6, y: 8 },
    ]);
  });

  test('MatrixTuple 형식도 동일하게 처리한다', () => {
    const tuple: MatrixLike = [1, 0, 0, 1, 10, 20];
    const cmds: PathCommand[] = [{ kind: 'move', x: 1, y: 1 }];
    const out: PathCommand[] = [];
    transformCommandsInto(out, cmds, tuple);
    expect(out).toEqual([{ kind: 'move', x: 11, y: 21 }]);
  });

  test('arcHandling 기본값(keep)은 endpoint만 변환하고 rx/ry/xRotation은 보존한다', () => {
    const translate: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'arc', rx: 5, ry: 3, xRotation: 0.2, largeArc: true, sweep: false, x: 8, y: 9 },
    ];
    const out: PathCommand[] = [];
    transformCommandsInto(out, cmds, translate);
    expect(out).toEqual([
      { kind: 'move', x: 10, y: 20 },
      { kind: 'arc', rx: 5, ry: 3, xRotation: 0.2, largeArc: true, sweep: false, x: 18, y: 29 },
    ]);
  });

  test("arcHandling: 'error'는 ArcCommand 발견 시 throw한다", () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'arc', rx: 5, ry: 3, xRotation: 0, largeArc: false, sweep: true, x: 8, y: 9 },
    ];
    const out: PathCommand[] = [];
    expect(() => transformCommandsInto(out, cmds, identity, { arcHandling: 'error' })).toThrow(
      /transformCommandsInto.*arcHandling/
    );
  });

  test("arcHandling: 'error'라도 arc가 없으면 throw하지 않는다", () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 1, y: 1 },
    ];
    const out: PathCommand[] = [];
    expect(() => transformCommandsInto(out, cmds, identity, { arcHandling: 'error' })).not.toThrow();
  });

  test('out과 commands가 같은 배열이어도 안전하다 (aliasing)', () => {
    const arr: PathCommand[] = [
      { kind: 'move', x: 1, y: 1 },
      { kind: 'line', x: 2, y: 2 },
    ];
    const translate: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 1, ty: 1 };
    transformCommandsInto(arr, arr, translate);
    expect(arr).toEqual([
      { kind: 'move', x: 2, y: 2 },
      { kind: 'line', x: 3, y: 3 },
    ]);
  });

  test('생성된 generic Out 참조를 반환한다 (ADR 0006)', () => {
    const out: PathCommand[] = [];
    const result = transformCommandsInto(out, [{ kind: 'move', x: 0, y: 0 }], identity);
    expect(result).toBe(out);
  });
});

// ──────────────────────────────────────────────
// equalizeSegmentsInto
// ──────────────────────────────────────────────
describe('equalizeSegmentsInto', () => {
  test('양쪽 모두 비어 있으면 out1, out2를 clear만 한다', () => {
    const out1: PathCommand[] = [{ kind: 'close' }];
    const out2: PathCommand[] = [{ kind: 'close' }];
    const result = equalizeSegmentsInto(out1, out2, [], []);
    expect(result).toBeUndefined();
    expect(out1).toHaveLength(0);
    expect(out2).toHaveLength(0);
  });

  test('draw segment 수가 같으면 양쪽 모두 그대로 복사한다', () => {
    const a: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const b: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 0, y: 5 },
      { kind: 'line', x: 0, y: 10 },
    ];
    const out1: PathCommand[] = [];
    const out2: PathCommand[] = [];
    equalizeSegmentsInto(out1, out2, a, b);
    expect(out1).toEqual(a);
    expect(out2).toEqual(b);
    expect(drawCount(out1)).toBe(drawCount(out2));
  });

  test('짧은 쪽에 zero-length segment를 삽입해 draw 수를 맞춘다', () => {
    const longPath: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 1, y: 0 },
      { kind: 'line', x: 2, y: 0 },
      { kind: 'line', x: 3, y: 0 },
      { kind: 'line', x: 4, y: 0 },
    ];
    const shortPath: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const out1: PathCommand[] = [];
    const out2: PathCommand[] = [];
    equalizeSegmentsInto(out1, out2, longPath, shortPath);
    expect(drawCount(out1)).toBe(drawCount(out2));
    expect(drawCount(out1)).toBe(4);
    // 긴 쪽은 변경 없음
    expect(out1).toEqual(longPath);
    // 짧은 쪽 마지막 endpoint는 보존된다
    const last = out2[out2.length - 1];
    expect(last).toMatchObject({ x: 10, y: 0 });
  });

  test('인자 순서와 무관하게 짧은 쪽이 채워진다', () => {
    const longPath: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 1, y: 0 },
      { kind: 'line', x: 2, y: 0 },
      { kind: 'line', x: 3, y: 0 },
    ];
    const shortPath: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 9, y: 0 },
    ];
    const out1: PathCommand[] = [];
    const out2: PathCommand[] = [];
    equalizeSegmentsInto(out1, out2, shortPath, longPath);
    expect(drawCount(out1)).toBe(drawCount(out2));
    expect(out2).toEqual(longPath);
  });

  test('한쪽이 비어 있으면 다른 쪽 길이만큼 zero-length segment로 채운다', () => {
    const b: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const out1: PathCommand[] = [];
    const out2: PathCommand[] = [];
    equalizeSegmentsInto(out1, out2, [], b);
    expect(out2).toEqual(b);
    expect(drawCount(out1)).toBe(drawCount(out2));
    expect(drawCount(out1)).toBe(2);
  });

  test('삽입된 segment는 zero-length cubic이다 (시작점에 머무름)', () => {
    const longPath: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 1, y: 0 },
      { kind: 'line', x: 2, y: 0 },
    ];
    const shortPath: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 7, y: 3 },
    ];
    const out1: PathCommand[] = [];
    const out2: PathCommand[] = [];
    equalizeSegmentsInto(out1, out2, longPath, shortPath);
    const inserted = out2.filter((c) => c.kind === 'cubic');
    expect(inserted.length).toBeGreaterThan(0);
    for (const seg of inserted) {
      if (seg.kind === 'cubic') {
        // zero-length: 모든 control/endpoint가 한 점에 모인다
        expect(seg.x1).toBe(seg.x);
        expect(seg.y1).toBe(seg.y);
        expect(seg.x2).toBe(seg.x);
        expect(seg.y2).toBe(seg.y);
      }
    }
  });

  test('void를 반환한다 (multi-output, generic Out 반환 없음)', () => {
    const out1: PathCommand[] = [];
    const out2: PathCommand[] = [];
    const r = equalizeSegmentsInto(out1, out2, [{ kind: 'move', x: 0, y: 0 }], [{ kind: 'move', x: 0, y: 0 }]);
    expect(r).toBeUndefined();
  });
});
