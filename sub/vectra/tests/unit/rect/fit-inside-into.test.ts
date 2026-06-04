/**
 * rect.fitInsideInto — target aspect ratio를 유지하면서 container 내부에 fit한 rect를 out에 기록한다.
 *
 * 검증: contain 기본 동작(가로/세로/정사각형), empty target/container pass-through,
 * container 위치 기준 center 정렬, out===target/container aliasing, 반환값.
 */
import { describe, expect, test } from 'vitest';
import { fitInsideInto } from '../../../src/rect/fit-inside-into';
import type { RectWritable } from '../../../src/types';

function makeRect(): RectWritable {
  return { x: 0, y: 0, width: 0, height: 0 };
}

describe('rect - fitInsideInto (contain)', () => {
  test('정사각형 target과 정사각형 container: container 전체를 채운다', () => {
    const out = makeRect();
    const target = { x: 0, y: 0, width: 100, height: 100 };
    const container = { x: 0, y: 0, width: 200, height: 200 };
    const result = fitInsideInto(out, target, container);
    expect(out).toEqual({ x: 0, y: 0, width: 200, height: 200 });
    expect(result).toBe(out);
  });

  test('가로가 더 긴 target, 정사각형 container: width=container.width, height<container.height, y center', () => {
    const out = makeRect();
    const target = { x: 0, y: 0, width: 200, height: 100 };
    const container = { x: 0, y: 0, width: 100, height: 100 };
    fitInsideInto(out, target, container);
    expect(out).toEqual({ x: 0, y: 25, width: 100, height: 50 });
  });

  test('세로가 더 긴 target, 정사각형 container: height=container.height, width<container.width, x center', () => {
    const out = makeRect();
    const target = { x: 0, y: 0, width: 100, height: 200 };
    const container = { x: 0, y: 0, width: 100, height: 100 };
    fitInsideInto(out, target, container);
    expect(out).toEqual({ x: 25, y: 0, width: 50, height: 100 });
  });

  test('동일 aspect ratio: 결과가 container 전체를 채운다', () => {
    const out = makeRect();
    const target = { x: 0, y: 0, width: 4, height: 2 };
    const container = { x: 10, y: 20, width: 200, height: 100 };
    fitInsideInto(out, target, container);
    expect(out).toEqual({ x: 10, y: 20, width: 200, height: 100 });
  });

  test('container 위치가 (0,0) 아닌 경우: 결과 x/y가 container 좌표 기준 center', () => {
    const out = makeRect();
    const target = { x: 999, y: 999, width: 200, height: 100 };
    const container = { x: 10, y: 20, width: 100, height: 100 };
    fitInsideInto(out, target, container);
    expect(out).toEqual({ x: 10, y: 45, width: 100, height: 50 });
  });

  test('target 위치(x/y)는 결과에 반영되지 않는다', () => {
    const outA = makeRect();
    const outB = makeRect();
    const container = { x: 0, y: 0, width: 100, height: 100 };
    fitInsideInto(outA, { x: 0, y: 0, width: 200, height: 100 }, container);
    fitInsideInto(outB, { x: 500, y: -500, width: 200, height: 100 }, container);
    expect(outA).toEqual(outB);
  });

  test('tuple rect 입력도 처리한다', () => {
    const out = makeRect();
    fitInsideInto(out, [0, 0, 200, 100], [0, 0, 100, 100]);
    expect(out).toEqual({ x: 0, y: 25, width: 100, height: 50 });
  });

  test('empty target (width=0): container 복사', () => {
    const out = makeRect();
    const container = { x: 5, y: 6, width: 10, height: 20 };
    fitInsideInto(out, { x: 0, y: 0, width: 0, height: 100 }, container);
    expect(out).toEqual({ x: 5, y: 6, width: 10, height: 20 });
  });

  test('empty target (height=0): container 복사', () => {
    const out = makeRect();
    const container = { x: 5, y: 6, width: 10, height: 20 };
    fitInsideInto(out, { x: 0, y: 0, width: 100, height: 0 }, container);
    expect(out).toEqual({ x: 5, y: 6, width: 10, height: 20 });
  });

  test('negative target width: container 복사', () => {
    const out = makeRect();
    const container = { x: 5, y: 6, width: 10, height: 20 };
    fitInsideInto(out, { x: 0, y: 0, width: -1, height: 100 }, container);
    expect(out).toEqual({ x: 5, y: 6, width: 10, height: 20 });
  });

  test('empty container (width=0): container 복사', () => {
    const out = makeRect();
    const container = { x: 5, y: 6, width: 0, height: 20 };
    fitInsideInto(out, { x: 0, y: 0, width: 100, height: 100 }, container);
    expect(out).toEqual({ x: 5, y: 6, width: 0, height: 20 });
  });

  test('empty container (height=0): container 복사', () => {
    const out = makeRect();
    const container = { x: 5, y: 6, width: 10, height: 0 };
    fitInsideInto(out, { x: 0, y: 0, width: 100, height: 100 }, container);
    expect(out).toEqual({ x: 5, y: 6, width: 10, height: 0 });
  });

  test('aliasing: out === target', () => {
    const target: RectWritable = { x: 99, y: 99, width: 200, height: 100 };
    const container = { x: 0, y: 0, width: 100, height: 100 };
    fitInsideInto(target, target, container);
    expect(target).toEqual({ x: 0, y: 25, width: 100, height: 50 });
  });

  test('aliasing: out === container', () => {
    const target = { x: 0, y: 0, width: 200, height: 100 };
    const container: RectWritable = { x: 0, y: 0, width: 100, height: 100 };
    fitInsideInto(container, target, container);
    expect(container).toEqual({ x: 0, y: 25, width: 100, height: 50 });
  });

  test('aliasing empty container: out === container', () => {
    const target = { x: 0, y: 0, width: 100, height: 100 };
    const container: RectWritable = { x: 5, y: 6, width: 0, height: 20 };
    fitInsideInto(container, target, container);
    expect(container).toEqual({ x: 5, y: 6, width: 0, height: 20 });
  });

  test('반환값은 out과 같은 참조', () => {
    const out = makeRect();
    const result = fitInsideInto(out, { x: 0, y: 0, width: 100, height: 100 }, { x: 0, y: 0, width: 100, height: 100 });
    expect(result).toBe(out);
  });
});
