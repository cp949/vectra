/**
 * GL5 상수 정밀도 테스트.
 *
 * 5점 Gauss-Legendre node와 weight가 double 정밀도의 정확한 값인지 검증한다.
 * 상수가 소수 10자리로 잘리면 가중치 합이 2에서 약 1e-10 벗어나고, 직선 곡선 길이가 chord와 어긋난다.
 *
 * 검증 방법:
 * - 가중치 합이 2와 1e-15 안에서 같다.
 * - node가 5차 Legendre 다항식의 근이다.
 * - 8차 단항식 적분이 해석해 2/9와 일치한다. 5점 GL은 9차까지 정확하다.
 * - 직선 cubic, quadratic 길이가 chord와 1e-14 안에서 같다.
 */
import { describe, expect, it } from 'vitest';
import { cubicLength } from '../../../src/curve/cubic-length';
import { quadraticLength } from '../../../src/curve/quadratic-length';
import { GL5_NODES, GL5_WEIGHTS } from '../../../src/curve/speed-length.internal';

/** 5차 Legendre 다항식 P5(x) */
function legendreP5(x: number): number {
  return (63 * x ** 5 - 70 * x ** 3 + 15 * x) / 8;
}

describe('GL5 상수', () => {
  it('가중치 합이 2와 1e-15 안에서 같다', () => {
    const sum = GL5_WEIGHTS.reduce((acc, w) => acc + w, 0);
    expect(Math.abs(sum - 2)).toBeLessThan(1e-15);
  });

  it('node가 P5의 근이다', () => {
    for (const x of GL5_NODES) {
      expect(Math.abs(legendreP5(x))).toBeLessThan(1e-15);
    }
  });

  it('8차 단항식 적분이 해석해 2/9와 1e-15 안에서 같다', () => {
    let sum = 0;
    for (let i = 0; i < GL5_NODES.length; i++) {
      sum += GL5_WEIGHTS[i] * GL5_NODES[i] ** 8;
    }
    expect(Math.abs(sum - 2 / 9)).toBeLessThan(1e-15);
  });
});

describe('직선 곡선 길이', () => {
  it('균등 매개 직선 cubic의 길이가 chord와 1e-14 안에서 같다', () => {
    const len = cubicLength({ x: 0, y: 0 }, { x: 10 / 3, y: 0 }, { x: 20 / 3, y: 0 }, { x: 10, y: 0 });
    expect(Math.abs(len - 10) / 10).toBeLessThan(1e-14);
  });

  it('비균등 매개 직선 cubic의 길이가 chord와 1e-14 안에서 같다', () => {
    // (3, 4) 방향 직선. 제어점이 끝점 사이에 있고 매개 속력이 균등하지 않다. chord = 5 * 3.
    const len = cubicLength({ x: 0, y: 0 }, { x: 0.6, y: 0.8 }, { x: 1.8, y: 2.4 }, { x: 9, y: 12 });
    expect(Math.abs(len - 15) / 15).toBeLessThan(1e-14);
  });

  it('직선 quadratic의 길이가 chord와 1e-14 안에서 같다', () => {
    const len = quadraticLength({ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 4, y: 4 });
    const chord = 3 * Math.SQRT2;
    expect(Math.abs(len - chord) / chord).toBeLessThan(1e-14);
  });
});
