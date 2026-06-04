/**
 * cardinalPathInto 테스트.
 * degenerate 입력, open n=4 구조, closed 구조, cubicPointAtTInto 수치 일치를 검증한다.
 */
import { describe, expect, it } from 'vitest';
import { cardinalPathInto } from '../../src/curve/cardinal-path-into';
import { cardinalPointAtTInto } from '../../src/curve/cardinal-point-at-t-into';
import { cubicPointAtTInto } from '../../src/curve/cubic-point-at-t-into';
import type { CubicCommand, MoveCommand, PathCommand } from '../../src/types';
import { expectClose } from './_cardinal-test-helpers';

const pathPts4 = [
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 3, y: 1 },
  { x: 4, y: 3 },
];

describe('cardinalPathInto — degenerate', () => {
  it('n=0이면 out.length=0', () => {
    const out: PathCommand[] = [];
    cardinalPathInto(out, []);
    expect(out.length).toBe(0);
  });

  it('n=1이면 out.length=0', () => {
    const out: PathCommand[] = [];
    cardinalPathInto(out, [{ x: 1, y: 2 }]);
    expect(out.length).toBe(0);
  });

  it('기존 out에 stale command가 있어도 degenerate 호출 후 비운다', () => {
    const out: PathCommand[] = [{ kind: 'move', x: 99, y: 99 }, { kind: 'close' }];
    cardinalPathInto(out, []);
    expect(out.length).toBe(0);
  });

  it('non-degenerate 호출은 stale command를 제거하고 새 결과로 채운다', () => {
    const out: PathCommand[] = [{ kind: 'move', x: 99, y: 99 }, { kind: 'close' }];
    cardinalPathInto(out, pathPts4);
    expect(out.map((c) => c.kind)).toEqual(['move', 'cubic', 'cubic', 'cubic']);
  });
});

describe('cardinalPathInto — open n=4 구조', () => {
  it('move 1개 + cubic 3개로 구성된다', () => {
    const out: PathCommand[] = [];
    cardinalPathInto(out, pathPts4);
    expect(out.map((c) => c.kind)).toEqual(['move', 'cubic', 'cubic', 'cubic']);
  });

  it('첫 command는 입력 첫 점으로 move한다', () => {
    const out: PathCommand[] = [];
    cardinalPathInto(out, pathPts4);
    const move = out[0] as MoveCommand;
    expectClose(move.x, pathPts4[0].x);
    expectClose(move.y, pathPts4[0].y);
  });

  it('각 cubic endpoint는 다음 입력 점과 일치한다', () => {
    const out: PathCommand[] = [];
    cardinalPathInto(out, pathPts4);
    for (let si = 0; si < 3; si++) {
      const cmd = out[si + 1] as CubicCommand;
      expectClose(cmd.x, pathPts4[si + 1].x);
      expectClose(cmd.y, pathPts4[si + 1].y);
    }
  });

  it('전달한 out을 그대로 반환한다', () => {
    const out: PathCommand[] = [];
    expect(cardinalPathInto(out, pathPts4)).toBe(out);
  });
});

describe('cardinalPathInto — 수치 일치 (open n=4, si=1 midpoint)', () => {
  // si=1의 globalT = (1 + 0.5) / 3 = 0.5
  // cubic(si=1)의 시작점은 out[1].x/y (= pts[1])
  it('si=1 Bezier midpoint가 cardinalPointAtTInto(t=0.5)와 1e-10 이내 일치한다', () => {
    const options = { tension: 0.3 };
    const out: PathCommand[] = [];
    cardinalPathInto(out, pathPts4, options);

    const prevCubic = out[1] as CubicCommand;
    const cubic = out[2] as CubicCommand;

    const bezMid = { x: 0, y: 0 };
    cubicPointAtTInto(
      bezMid,
      { x: prevCubic.x, y: prevCubic.y },
      { x: cubic.x1, y: cubic.y1 },
      { x: cubic.x2, y: cubic.y2 },
      { x: cubic.x, y: cubic.y },
      0.5
    );

    const ref = { x: 0, y: 0 };
    cardinalPointAtTInto(ref, pathPts4, 0.5, options);

    expectClose(bezMid.x, ref.x);
    expectClose(bezMid.y, ref.y);
  });
});

describe('cardinalPathInto — closed n=4 구조', () => {
  const square = [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 2 },
    { x: 0, y: 2 },
  ];

  it('move 1개 + cubic 4개 + close 1개로 구성된다', () => {
    const out: PathCommand[] = [];
    cardinalPathInto(out, square, { closed: true });
    expect(out.map((c) => c.kind)).toEqual(['move', 'cubic', 'cubic', 'cubic', 'cubic', 'close']);
  });

  it('마지막 cubic endpoint는 move point와 일치한다', () => {
    const out: PathCommand[] = [];
    cardinalPathInto(out, square, { closed: true });
    const move = out[0] as MoveCommand;
    const lastCubic = out[4] as CubicCommand;
    expectClose(lastCubic.x, move.x);
    expectClose(lastCubic.y, move.y);
  });
});
