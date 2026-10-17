/**
 * isConvex의 collinear turn 판정 scale 불변성 테스트.
 *
 * cross product는 길이² 단위이고 epsilon은 길이 단위다. 이전 구현은 `|cross| <= epsilon`으로
 * 비교해 변 길이 1e-5 이하 polygon의 모든 turn을 collinear로 제외하고 false를 반환했다.
 * epsilon을 생략하면 `|cross| <= 1e-9·|in|·|out|`(turn 각의 sin 기준)로 판정한다.
 * epsilon을 명시하면 기존 절대 cross 비교를 유지한다.
 *
 * 좌표를 s배 해도 convex 여부는 같아야 한다.
 */

import { describe, expect, test } from 'vitest';
import { isConvex } from '../../../src/polygon/is-convex';
import type { PolygonLike } from '../../../src/types';

/** 좌표 scale 후보. 길이 임계값이 없어 아주 작은 scale도 다룬다. */
const SCALES = [1e-10, 1e-8, 1e-6, 1e-5, 1e-3, 1, 1e3, 1e8];

/** 단위 좌표 `[x, y]` 목록을 s배 해 polygon으로 만든다. */
function scaledPolygon(s: number, points: ReadonlyArray<readonly [number, number]>): PolygonLike {
  return { points: points.map(([x, y]) => ({ x: x * s, y: y * s })) };
}

/**
 * 한 변의 중간 vertex를 안쪽으로 `dent`만큼 들여 만든 정사각형(단위 4)을 s배 한다.
 * 중간 vertex의 turn은 sin θ ≈ dent다. dent가 임계(1e-9)보다 작으면 collinear로 본다.
 */
function dentedSquare(s: number, dent: number): PolygonLike {
  return scaledPolygon(s, [
    [0, 0],
    [2, dent],
    [4, 0],
    [4, 4],
    [0, 4],
  ]);
}

describe('isConvex scale 불변성', () => {
  test.each(SCALES)('scale %s의 정사각형은 true다', (s) => {
    expect(
      isConvex(
        scaledPolygon(s, [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ])
      )
    ).toBe(true);
  });

  test.each(SCALES)('scale %s의 CW 삼각형은 true다', (s) => {
    expect(
      isConvex(
        scaledPolygon(s, [
          [0, 0],
          [0, 3],
          [4, 0],
        ])
      )
    ).toBe(true);
  });

  test.each(SCALES)('scale %s의 concave arrow는 false다', (s) => {
    expect(
      isConvex(
        scaledPolygon(s, [
          [0, 0],
          [4, 2],
          [0, 4],
          [1, 2],
        ])
      )
    ).toBe(false);
  });

  test.each(SCALES)('scale %s의 bow-tie는 false다', (s) => {
    expect(
      isConvex(
        scaledPolygon(s, [
          [0, 0],
          [4, 4],
          [4, 0],
          [0, 4],
        ])
      )
    ).toBe(false);
  });

  test.each(SCALES)('scale %s의 collinear-only polygon은 false다', (s) => {
    expect(
      isConvex(
        scaledPolygon(s, [
          [0, 0],
          [1, 0],
          [2, 0],
        ])
      )
    ).toBe(false);
  });

  test.each(SCALES)('scale %s에서 collinear 중간 vertex는 convex 판정을 막지 않는다', (s) => {
    expect(isConvex(dentedSquare(s, 0))).toBe(true);
  });

  test.each(SCALES)('scale %s에서 sin θ 1e-6로 안쪽에 들어간 vertex는 concave로 본다', (s) => {
    expect(isConvex(dentedSquare(s, 1e-6))).toBe(false);
  });

  test.each(SCALES)('scale %s에서 sin θ 1e-12로 안쪽에 들어간 vertex는 collinear로 보고 true다', (s) => {
    expect(isConvex(dentedSquare(s, 1e-12))).toBe(true);
  });

  test('길이² 곱이 오버플로하는 scale 1e160에서도 정사각형은 true다', () => {
    expect(
      isConvex(
        scaledPolygon(1e160, [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ])
      )
    ).toBe(true);
  });
});

describe('isConvex 명시 epsilon', () => {
  test('epsilon을 명시하면 기존 절대 cross 비교를 유지한다', () => {
    // 변 길이 1e-5 정사각형의 cross는 1e-10이라 1e-9 이하다. 모든 turn이 collinear로 제외돼 false다.
    const tiny = scaledPolygon(1e-5, [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]);
    expect(isConvex(tiny, 1e-9)).toBe(false);
    expect(isConvex(tiny)).toBe(true);
  });

  test('epsilon 0을 명시하면 아주 작은 정사각형도 true다', () => {
    const tiny = scaledPolygon(1e-8, [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]);
    expect(isConvex(tiny, 0)).toBe(true);
  });

  test('큰 scale에서 epsilon을 명시하면 sin θ 1e-12 dent도 절대 cross로 concave로 본다', () => {
    // scale 1e3: dent의 cross는 약 4e-6으로 1e-9보다 커 turn으로 센다. 생략하면 sin θ 기준이라 collinear다.
    const dented = dentedSquare(1e3, 1e-12);
    expect(isConvex(dented, 1e-9)).toBe(false);
    expect(isConvex(dented)).toBe(true);
  });
});
