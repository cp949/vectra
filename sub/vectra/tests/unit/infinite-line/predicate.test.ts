/**
 * infinite-line predicate 단위 테스트.
 *
 * containsPoint, isDegenerate의 기본/명시 epsilon 경계 판정과 degenerate 입력
 * 처리, tuple input 지원을 함께 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { containsPoint } from '../../../src/infinite-line/contains-point';
import { isDegenerate } from '../../../src/infinite-line/is-degenerate';

describe('infinite-line containment - containsPoint', () => {
  test('infinite-line 위 interior point를 포함한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    expect(containsPoint(line, { x: 2, y: 0 })).toBe(true);
  });

  test('origin point를 포함한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    expect(containsPoint(line, { x: 0, y: 0 })).toBe(true);
  });

  test('segment과 달리 segment 끝 너머 point도 포함한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    // (-10, 0)과 (10, 0) 모두 line 위에 있다
    expect(containsPoint(line, { x: -10, y: 0 })).toBe(true);
    expect(containsPoint(line, { x: 10, y: 0 })).toBe(true);
  });

  test('기본 epsilon 안 point를 포함한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    expect(containsPoint(line, { x: 2, y: 1e-10 })).toBe(true);
  });

  test('기본 epsilon 정확한 경계(dist = epsilon)에서 포함한다 (<=)', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    expect(containsPoint(line, { x: 2, y: 1e-9 })).toBe(true);
    expect(containsPoint(line, { x: 2, y: 2e-9 })).toBe(false);
  });

  test('기본 epsilon 밖 point는 포함하지 않는다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    expect(containsPoint(line, { x: 2, y: 1 })).toBe(false);
  });

  test('명시 epsilon 경계에서 올바르게 판별한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    expect(containsPoint(line, { x: 2, y: 0.5 }, 0.5)).toBe(true);
    expect(containsPoint(line, { x: 2, y: 0.5 }, 0.4)).toBe(false);
  });

  test('degenerate infinite-line은 origin과 일치하는 point만 포함한다', () => {
    const line = { origin: { x: 3, y: 4 }, direction: { x: 0, y: 0 } };
    expect(containsPoint(line, { x: 3, y: 4 })).toBe(true);
    // 다른 위치 point는 포함하지 않는다
    expect(containsPoint(line, { x: 3, y: 5 })).toBe(false);
  });

  test('degenerate infinite-line이 명시 epsilon 안 point를 포함한다', () => {
    const line = { origin: { x: 3, y: 4 }, direction: { x: 0, y: 0 } };
    // dist = 0.3, epsilon = 0.5 → 포함
    expect(containsPoint(line, { x: 3.3, y: 4 }, 0.5)).toBe(true);
  });
});

describe('infinite-line - isDegenerate', () => {
  test('direction = (0, 0)이면 true이다', () => {
    expect(isDegenerate({ origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } })).toBe(true);
  });

  test('non-zero direction은 false이다', () => {
    expect(isDegenerate({ origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } })).toBe(false);
  });

  test('기본 epsilon 안 length는 degenerate로 판정한다', () => {
    // length = 1e-10 < 1e-9 → degenerate
    expect(isDegenerate({ origin: { x: 0, y: 0 }, direction: { x: 1e-10, y: 0 } })).toBe(true);
  });

  test('기본 epsilon 경계(length = epsilon)에서 degenerate이다 (<=)', () => {
    // length = 1e-9 → degenerate (length² <= epsilon²)
    expect(isDegenerate({ origin: { x: 0, y: 0 }, direction: { x: 1e-9, y: 0 } })).toBe(true);
  });

  test('기본 epsilon 밖 length는 non-degenerate이다', () => {
    expect(isDegenerate({ origin: { x: 0, y: 0 }, direction: { x: 2e-9, y: 0 } })).toBe(false);
  });

  test('명시 epsilon으로 임계값을 조정한다', () => {
    // length = 0.5 → epsilon=0.5에서는 degenerate, epsilon=0.4에서는 non-degenerate
    const line = { origin: { x: 0, y: 0 }, direction: { x: 0.5, y: 0 } };
    expect(isDegenerate(line, 0.5)).toBe(true);
    expect(isDegenerate(line, 0.4)).toBe(false);
  });

  test('tuple infinite-line input을 읽는다', () => {
    expect(
      isDegenerate([
        [0, 0],
        [0, 0],
      ] as const)
    ).toBe(true);
    expect(
      isDegenerate([
        [0, 0],
        [1, 0],
      ] as const)
    ).toBe(false);
  });
});
