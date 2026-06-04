import { describe, expect, test } from 'vitest';
import { classifyPoint } from '../../../src/segment/classify-point';

const seg = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };

describe('classifyPoint — segment 위 point 분류', () => {
  test("segment 위 중간 point는 'on'을 반환한다", () => {
    expect(classifyPoint(seg, { x: 5, y: 0 })).toBe('on');
  });

  test("시작점과 끝점 정확히 위는 'on'을 반환한다", () => {
    expect(classifyPoint(seg, { x: 0, y: 0 })).toBe('on');
    expect(classifyPoint(seg, { x: 10, y: 0 })).toBe('on');
  });

  test("시작점 이전 연장선 위는 'before'를 반환한다", () => {
    expect(classifyPoint(seg, { x: -5, y: 0 })).toBe('before');
  });

  test("끝점 이후 연장선 위는 'after'를 반환한다", () => {
    expect(classifyPoint(seg, { x: 15, y: 0 })).toBe('after');
  });

  test("무한 직선 밖 point는 'off'를 반환한다", () => {
    expect(classifyPoint(seg, { x: 5, y: 3 })).toBe('off');
  });

  test('epsilon > 0이면 직선 근처 point를 허용한다', () => {
    expect(classifyPoint(seg, { x: 5, y: 0.5 }, 1)).toBe('on');
    expect(classifyPoint(seg, { x: -1, y: 0 }, 0)).toBe('before');
  });

  test('대각선 segment에서 projection이 올바르게 작동한다', () => {
    const diag = { a: { x: 0, y: 0 }, b: { x: 4, y: 4 } };
    expect(classifyPoint(diag, { x: 2, y: 2 })).toBe('on');
    expect(classifyPoint(diag, { x: -1, y: -1 })).toBe('before');
    expect(classifyPoint(diag, { x: 5, y: 5 })).toBe('after');
    expect(classifyPoint(diag, { x: 2, y: 0 })).toBe('off');
  });

  test('zero-length segment에서 endpoint와 같은 point는 on을 반환한다', () => {
    const pt = { a: { x: 3, y: 3 }, b: { x: 3, y: 3 } };
    expect(classifyPoint(pt, { x: 3, y: 3 })).toBe('on');
    expect(classifyPoint(pt, { x: 5, y: 5 })).toBe('off');
  });

  test('epsilon < 0이면 RangeError를 던진다', () => {
    expect(() => classifyPoint(seg, { x: 5, y: 0 }, -1)).toThrow(RangeError);
  });
});
