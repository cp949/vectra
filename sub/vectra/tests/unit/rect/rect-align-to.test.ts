/**
 * rect.rectAlignToInto / rect.rectAlignTo — target 크기를 유지한 채 container anchor에 정렬한다.
 *
 * 검증: 9개 anchor 산식, default center, target 크기 보존, tuple rect 입력,
 * out===target / out===container aliasing, zero/negative dimension raw 산식,
 * non-finite pass-through(left/top 보존, center/right/bottom 전파), invalid anchor RangeError,
 * companion plain object 반환과 Into 일치.
 */
import { describe, expect, test } from 'vitest';
import { rectAlignTo } from '../../../src/rect/rect-align-to';
import { rectAlignToInto } from '../../../src/rect/rect-align-to-into';
import type { RectAlignAnchor, RectWritable } from '../../../src/types';

function makeRect(): RectWritable {
  return { x: 0, y: 0, width: 0, height: 0 };
}

// container 100x100 at (0,0), target 40x20 → anchor별 기대 위치
const CONTAINER = { x: 0, y: 0, width: 100, height: 100 };
const TARGET = { x: 7, y: 9, width: 40, height: 20 };

const ANCHOR_CASES: ReadonlyArray<readonly [RectAlignAnchor, number, number]> = [
  ['top-left', 0, 0],
  ['top', 30, 0],
  ['top-right', 60, 0],
  ['left', 0, 40],
  ['center', 30, 40],
  ['right', 60, 40],
  ['bottom-left', 0, 80],
  ['bottom', 30, 80],
  ['bottom-right', 60, 80],
];

describe('rect - rectAlignToInto', () => {
  test.each(ANCHOR_CASES)('anchor "%s" → x=%d, y=%d, target 크기 유지', (anchor, x, y) => {
    const out = makeRect();
    const result = rectAlignToInto(out, TARGET, CONTAINER, { anchor });
    expect(out).toEqual({ x, y, width: 40, height: 20 });
    expect(result).toBe(out);
  });

  test('options 생략 시 default anchor는 center', () => {
    const out = makeRect();
    rectAlignToInto(out, TARGET, CONTAINER);
    expect(out).toEqual({ x: 30, y: 40, width: 40, height: 20 });
  });

  test('anchor 생략(빈 options)도 center', () => {
    const out = makeRect();
    rectAlignToInto(out, TARGET, CONTAINER, {});
    expect(out).toEqual({ x: 30, y: 40, width: 40, height: 20 });
  });

  test('container 위치가 (0,0) 아닌 경우 anchor가 container 좌표 기준', () => {
    const out = makeRect();
    rectAlignToInto(out, TARGET, { x: 10, y: 20, width: 100, height: 100 }, { anchor: 'bottom-right' });
    // x = 10 + 100 - 40 = 70, y = 20 + 100 - 20 = 100
    expect(out).toEqual({ x: 70, y: 100, width: 40, height: 20 });
  });

  test('target이 container보다 큰 경우 center는 음수 offset', () => {
    const out = makeRect();
    rectAlignToInto(out, { x: 0, y: 0, width: 120, height: 140 }, CONTAINER, { anchor: 'center' });
    // x = 0 + (100 - 120)/2 = -10, y = 0 + (100 - 140)/2 = -20
    expect(out).toEqual({ x: -10, y: -20, width: 120, height: 140 });
  });

  test('tuple rect 입력도 처리한다', () => {
    const out = makeRect();
    rectAlignToInto(out, [7, 9, 40, 20], [0, 0, 100, 100], { anchor: 'bottom-right' });
    expect(out).toEqual({ x: 60, y: 80, width: 40, height: 20 });
  });

  test('aliasing: out === target', () => {
    const target: RectWritable = { x: 5, y: 5, width: 40, height: 20 };
    rectAlignToInto(target, target, CONTAINER, { anchor: 'center' });
    expect(target).toEqual({ x: 30, y: 40, width: 40, height: 20 });
  });

  test('aliasing: out === container', () => {
    const container: RectWritable = { x: 0, y: 0, width: 100, height: 100 };
    rectAlignToInto(container, TARGET, container, { anchor: 'bottom-right' });
    // 읽기 후 기록이므로 container 좌표/크기 snapshot 기준으로 정렬된다
    expect(container).toEqual({ x: 60, y: 80, width: 40, height: 20 });
  });

  test('zero width/height container: edge anchor는 raw 산식', () => {
    const out = makeRect();
    rectAlignToInto(
      out,
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 5, y: 6, width: 0, height: 0 },
      {
        anchor: 'center',
      }
    );
    // x = 5 + (0 - 10)/2 = 0, y = 6 + (0 - 10)/2 = 1
    expect(out).toEqual({ x: 0, y: 1, width: 10, height: 10 });
  });

  test('negative width/height rect: 정규화 없이 raw 산식', () => {
    const out = makeRect();
    rectAlignToInto(
      out,
      { x: 0, y: 0, width: -10, height: 10 },
      { x: 0, y: 0, width: -100, height: 100 },
      {
        anchor: 'right',
      }
    );
    // x = 0 + (-100) - (-10) = -90, y = 0 + (100 - 10)/2 = 45
    expect(out).toEqual({ x: -90, y: 45, width: -10, height: 10 });
  });

  test('Infinity pass-through: left/top anchor는 container 좌표 보존', () => {
    const out = makeRect();
    rectAlignToInto(
      out,
      { x: 0, y: 0, width: Infinity, height: Infinity },
      { x: 3, y: 4, width: Infinity, height: Infinity },
      {
        anchor: 'top-left',
      }
    );
    // left/top anchor는 cx/cy를 그대로 쓰므로 0*Infinity NaN이 없다
    expect(out.x).toBe(3);
    expect(out.y).toBe(4);
    expect(out.width).toBe(Infinity);
    expect(out.height).toBe(Infinity);
  });

  test('Infinity pass-through: center anchor는 NaN 전파', () => {
    const out = makeRect();
    rectAlignToInto(
      out,
      { x: 0, y: 0, width: Infinity, height: 20 },
      { x: 0, y: 0, width: Infinity, height: 100 },
      {
        anchor: 'center',
      }
    );
    // (Infinity - Infinity)/2 = NaN
    expect(out.x).toBeNaN();
    expect(out.y).toBe(40);
  });

  test('Infinity pass-through: right anchor는 Infinity-Infinity NaN 전파', () => {
    const out = makeRect();
    rectAlignToInto(
      out,
      { x: 0, y: 0, width: Infinity, height: 10 },
      { x: 3, y: 0, width: Infinity, height: 100 },
      {
        anchor: 'right',
      }
    );
    // x = 3 + Infinity - Infinity = NaN (right는 container 좌표만 쓰지 않는다)
    expect(out.x).toBeNaN();
  });

  test('-Infinity pass-through: right anchor 산술 전파', () => {
    const out = makeRect();
    rectAlignToInto(
      out,
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 0, y: 0, width: -Infinity, height: 100 },
      {
        anchor: 'right',
      }
    );
    // x = 0 + (-Infinity) - 10 = -Infinity
    expect(out.x).toBe(-Infinity);
  });

  test('NaN 좌표 pass-through', () => {
    const out = makeRect();
    rectAlignToInto(
      out,
      { x: 0, y: 0, width: 10, height: 10 },
      { x: NaN, y: 0, width: 100, height: 100 },
      {
        anchor: 'top-left',
      }
    );
    expect(out.x).toBeNaN();
    expect(out.y).toBe(0);
  });

  test('invalid anchor 문자열: RangeError', () => {
    const out = makeRect();
    expect(() => rectAlignToInto(out, TARGET, CONTAINER, { anchor: 'middle' as RectAlignAnchor })).toThrow(RangeError);
  });

  test('invalid anchor는 out을 수정하지 않는다', () => {
    const out = { x: 1, y: 2, width: 3, height: 4 };
    expect(() => rectAlignToInto(out, TARGET, CONTAINER, { anchor: 'TOP' as RectAlignAnchor })).toThrow(RangeError);
    expect(out).toEqual({ x: 1, y: 2, width: 3, height: 4 });
  });

  test('반환값은 out과 같은 참조', () => {
    const out = makeRect();
    const result = rectAlignToInto(out, TARGET, CONTAINER);
    expect(result).toBe(out);
  });
});

describe('rect - rectAlignTo (companion)', () => {
  test('새 plain object를 반환한다', () => {
    const result = rectAlignTo(TARGET, CONTAINER, { anchor: 'center' });
    expect(result).toEqual({ x: 30, y: 40, width: 40, height: 20 });
  });

  test('rectAlignToInto와 동일한 결과 - 모든 anchor', () => {
    for (const [anchor] of ANCHOR_CASES) {
      const expected = rectAlignToInto(makeRect(), TARGET, CONTAINER, { anchor });
      expect(rectAlignTo(TARGET, CONTAINER, { anchor })).toEqual(expected);
    }
  });

  test('options 생략 시 default center, Into와 일치', () => {
    const expected = rectAlignToInto(makeRect(), TARGET, CONTAINER);
    expect(rectAlignTo(TARGET, CONTAINER)).toEqual(expected);
  });

  test('input rect를 mutate하지 않는다', () => {
    const target = { x: 7, y: 9, width: 40, height: 20 };
    const container = { x: 0, y: 0, width: 100, height: 100 };
    rectAlignTo(target, container, { anchor: 'bottom-right' });
    expect(target).toEqual({ x: 7, y: 9, width: 40, height: 20 });
    expect(container).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });

  test('호출마다 새 object를 반환한다', () => {
    const a = rectAlignTo(TARGET, CONTAINER);
    const b = rectAlignTo(TARGET, CONTAINER);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  test('invalid anchor: RangeError', () => {
    expect(() => rectAlignTo(TARGET, CONTAINER, { anchor: 'center-left' as RectAlignAnchor })).toThrow(RangeError);
  });
});
