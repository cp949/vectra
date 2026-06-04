/**
 * rect.fitOutsideInto — target aspect ratio를 유지하면서 container를 완전히 덮는 rect를 out에 기록한다.
 *
 * 검증: cover 기본 동작(가로/세로/정사각형), empty target/container pass-through,
 * container 외부 오버플로우 정상 동작, out===target/container aliasing, 반환값.
 */
import { describe, expect, test } from 'vitest';
import { fitOutsideInto } from '../../../src/rect/fit-outside-into';
import type { RectWritable } from '../../../src/types';

function makeRect(): RectWritable {
  return { x: 0, y: 0, width: 0, height: 0 };
}

describe('rect - fitOutsideInto (cover)', () => {
  test('정사각형 target과 정사각형 container: container 전체를 채운다', () => {
    const out = makeRect();
    const target = { x: 0, y: 0, width: 100, height: 100 };
    const container = { x: 0, y: 0, width: 200, height: 200 };
    const result = fitOutsideInto(out, target, container);
    expect(out).toEqual({ x: 0, y: 0, width: 200, height: 200 });
    expect(result).toBe(out);
  });

  test('세로가 더 긴 target, 정사각형 container: width=container.width, height>container.height, y center 음수', () => {
    // target 1x2, container 2x2: cover scale=2, scaled=2x4, x=container.x, y=container.y-1
    const out = makeRect();
    const target = { x: 0, y: 0, width: 1, height: 2 };
    const container = { x: 0, y: 0, width: 2, height: 2 };
    fitOutsideInto(out, target, container);
    expect(out).toEqual({ x: 0, y: -1, width: 2, height: 4 });
  });

  test('가로가 더 긴 target, 정사각형 container: height=container.height, width>container.width, x center 음수', () => {
    const out = makeRect();
    const target = { x: 0, y: 0, width: 200, height: 100 };
    const container = { x: 0, y: 0, width: 100, height: 100 };
    fitOutsideInto(out, target, container);
    // scale = max(100/200, 100/100) → targetRatio=2 > containerRatio=1, so scale = ch/th = 1
    // scaledW=200, scaledH=100, x=0+(100-200)/2=-50, y=0
    expect(out).toEqual({ x: -50, y: 0, width: 200, height: 100 });
  });

  test('동일 aspect ratio: 결과가 container 전체를 채운다', () => {
    const out = makeRect();
    const target = { x: 0, y: 0, width: 4, height: 2 };
    const container = { x: 10, y: 20, width: 200, height: 100 };
    fitOutsideInto(out, target, container);
    expect(out).toEqual({ x: 10, y: 20, width: 200, height: 100 });
  });

  test('container 위치가 (0,0) 아닌 경우: 결과 좌표가 container 위치 기준', () => {
    const out = makeRect();
    const target = { x: 999, y: 999, width: 1, height: 2 };
    const container = { x: 10, y: 20, width: 2, height: 2 };
    fitOutsideInto(out, target, container);
    expect(out).toEqual({ x: 10, y: 19, width: 2, height: 4 });
  });

  test('한 축은 container와 같고 다른 축은 더 크다', () => {
    const out = makeRect();
    fitOutsideInto(out, { x: 0, y: 0, width: 1, height: 4 }, { x: 0, y: 0, width: 10, height: 10 });
    // cover scale = max(cw/tw, ch/th) = 10. scaledW=10, scaledH=40. center y=-15.
    expect(out).toEqual({ x: 0, y: -15, width: 10, height: 40 });
  });

  test('tuple rect 입력도 처리한다', () => {
    const out = makeRect();
    fitOutsideInto(out, [0, 0, 1, 2], [0, 0, 2, 2]);
    expect(out).toEqual({ x: 0, y: -1, width: 2, height: 4 });
  });

  test('empty target (width=0): container 복사', () => {
    const out = makeRect();
    const container = { x: 5, y: 6, width: 10, height: 20 };
    fitOutsideInto(out, { x: 0, y: 0, width: 0, height: 100 }, container);
    expect(out).toEqual({ x: 5, y: 6, width: 10, height: 20 });
  });

  test('empty target (height=0): container 복사', () => {
    const out = makeRect();
    const container = { x: 5, y: 6, width: 10, height: 20 };
    fitOutsideInto(out, { x: 0, y: 0, width: 100, height: 0 }, container);
    expect(out).toEqual({ x: 5, y: 6, width: 10, height: 20 });
  });

  test('empty container (width=0): container 복사', () => {
    const out = makeRect();
    const container = { x: 5, y: 6, width: 0, height: 20 };
    fitOutsideInto(out, { x: 0, y: 0, width: 100, height: 100 }, container);
    expect(out).toEqual({ x: 5, y: 6, width: 0, height: 20 });
  });

  test('empty container (height=0): container 복사', () => {
    const out = makeRect();
    const container = { x: 5, y: 6, width: 10, height: 0 };
    fitOutsideInto(out, { x: 0, y: 0, width: 100, height: 100 }, container);
    expect(out).toEqual({ x: 5, y: 6, width: 10, height: 0 });
  });

  test('aliasing: out === target', () => {
    const target: RectWritable = { x: 99, y: 99, width: 1, height: 2 };
    const container = { x: 0, y: 0, width: 2, height: 2 };
    fitOutsideInto(target, target, container);
    expect(target).toEqual({ x: 0, y: -1, width: 2, height: 4 });
  });

  test('aliasing: out === container', () => {
    const target = { x: 0, y: 0, width: 1, height: 2 };
    const container: RectWritable = { x: 0, y: 0, width: 2, height: 2 };
    fitOutsideInto(container, target, container);
    expect(container).toEqual({ x: 0, y: -1, width: 2, height: 4 });
  });

  test('반환값은 out과 같은 참조', () => {
    const out = makeRect();
    const result = fitOutsideInto(
      out,
      { x: 0, y: 0, width: 100, height: 100 },
      { x: 0, y: 0, width: 100, height: 100 }
    );
    expect(result).toBe(out);
  });
});
