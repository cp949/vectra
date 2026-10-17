/**
 * fitting 방어 분기 경계 테스트.
 *
 * pivot 교환, 극단 좌표의 overflow, `epsilon`이 크거나 0일 때의 degenerate 판정,
 * 부호 정규화의 `x === 0` 경계를 확인한다. 각 테스트는 같은 모양의 정상 입력을 짝으로 두어
 * 결과가 `undefined`인 원인이 해당 가드임을 보인다.
 */

import { describe, expect, test } from 'vitest';
import { fitCircleToPoints } from '../../../src/fitting/fit-circle-to-points';
import { fitLineToPoints } from '../../../src/fitting/fit-line-to-points';
import { fitMinimumAreaRect } from '../../../src/fitting/fit-minimum-area-rect';
import { principalDirections } from '../../../src/fitting/principal-directions';

/**
 * 중심 `(cx, cy)`, 반지름 `r`인 원 위에서 각도 구간 `[from, to]`를 `count`개로 나눈 점을 만든다.
 * 각도는 도(degree) 단위다.
 */
function arcPoints(cx: number, cy: number, r: number, from: number, to: number, count: number) {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = ((from + ((to - from) * i) / (count - 1)) * Math.PI) / 180;
    points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return points;
}

describe('fitCircleToPoints — 3x3 solver', () => {
  test('거의 수직인 짧은 호는 pivot 행을 교환해야 원을 복원한다', () => {
    // 호가 x 방향으로 거의 퍼지지 않아 첫 열에서 |sxy| >> |sxx|다. pivot을 교환하지 않으면 singular로 판정된다.
    const fit = fitCircleToPoints(arcPoints(1, -1, 2, 180, 180 + (0.004 * 180) / Math.PI, 6));
    expect(fit?.center.x).toBeCloseTo(1, 6);
    expect(fit?.center.y).toBeCloseTo(-1, 6);
    expect(fit?.radius).toBeCloseTo(2, 6);
  });

  test('pivot 교환을 거치면 세 점의 외접원 중심이 정확히 representable한 값으로 나온다', () => {
    // 외접원 중심은 (55/16, 35/8)이다. pivot을 교환하지 않으면 마지막 비트가 어긋난다.
    const fit = fitCircleToPoints(
      [
        { x: 6, y: 7 },
        { x: 4, y: 8 },
        { x: 2, y: 1 },
      ],
      { epsilon: 0 }
    );
    expect(fit?.center).toEqual({ x: 3.4375, y: 4.375 });
  });

  test('좌표가 너무 커서 normal equation이 overflow하면 undefined를 돌려준다', () => {
    const big = [
      { x: 1e200, y: 0 },
      { x: -1e200, y: 0 },
      { x: 0, y: 1e200 },
    ];
    expect(fitCircleToPoints(big)).toBeUndefined();
    expect(fitCircleToPoints(big.map((p) => ({ x: p.x / 1e190, y: p.y / 1e190 })))).toBeDefined();
  });

  test('해가 overflow하면 undefined를 돌려준다', () => {
    // x 퍼짐이 1e-161이라 d = rhs / pivot이 Infinity가 된다. epsilon 0이 아니면 pivot 검사가 먼저 막는다.
    const points = [
      { x: 0, y: -1e100 },
      { x: 1e-161, y: 0 },
      { x: 0, y: 1e100 },
    ];
    expect(fitCircleToPoints(points, { epsilon: 0 })).toBeUndefined();
    expect(fitCircleToPoints(points, { epsilon: 1e-300 })).toBeUndefined();
  });

  test('반지름 제곱이 overflow하면 undefined를 돌려준다', () => {
    // 거의 수직선이라 중심이 1e161 밖으로 나가고 center^2가 overflow한다.
    const points = [
      { x: 0, y: -1e10 },
      { x: 1e-161, y: 0 },
      { x: 0, y: 1e10 },
    ];
    expect(fitCircleToPoints(points, { epsilon: 0 })).toBeUndefined();
  });

  test('반지름 제곱이 epsilon 이하이면 undefined를 돌려준다', () => {
    const points = arcPoints(0, 0, 1, 0, 315, 8);
    expect(fitCircleToPoints(points, { epsilon: 1 })).toBeUndefined();
    expect(fitCircleToPoints(points, { epsilon: 0.5 })?.radius).toBeCloseTo(1, 9);
  });
});

describe('principalDirections·fitLineToPoints — 공분산 검증', () => {
  test('분산이 overflow하면 undefined를 돌려준다', () => {
    const big = [
      { x: 1e200, y: 0 },
      { x: -1e200, y: 0 },
      { x: 0, y: 1e200 },
    ];
    expect(principalDirections(big)).toBeUndefined();
    expect(principalDirections(big.map((p) => ({ x: p.x / 1e190, y: p.y / 1e190 })))).toBeDefined();
  });

  test('분산이 overflow하면 공분산이 0이어도 undefined를 돌려준다', () => {
    // sxy === 0이면 축 정렬 경로라 overflow 검사가 없어도 (1, 0)을 돌려주므로 이 가드가 결과를 가른다.
    const axis = [
      { x: 1e200, y: 0 },
      { x: -1e200, y: 0 },
    ];
    expect(principalDirections(axis)).toBeUndefined();
    expect(principalDirections(axis.map((p) => ({ x: p.x / 1e190, y: p.y })))?.primary).toEqual({ x: 1, y: 0 });
  });

  test('고유값 계산이 overflow하면 undefined를 돌려준다', () => {
    // sxx, syy, sxy는 각각 유한하지만 (sxx + syy + s) / 2에서 합이 넘친다.
    const c = 9.4e153;
    const diagonal = [
      { x: -c, y: -c },
      { x: c, y: c },
      { x: 0, y: 0 },
    ];
    expect(principalDirections(diagonal)).toBeUndefined();
    expect(fitLineToPoints(diagonal)).toBeUndefined();
    expect(principalDirections(diagonal.map((p) => ({ x: p.x / 1e100, y: p.y / 1e100 })))).toBeDefined();
  });

  test('primary x가 0이고 y가 음수로 계산되면 부호를 뒤집어 (0, 1)로 정규화한다', () => {
    // sxy < 0이 매우 작아 lambda1 - syy가 정확히 0이 되고 primary는 (0, sxy)가 된다.
    const result = principalDirections([
      { x: 1e-10, y: -1 },
      { x: -1e-10, y: 1 },
      { x: 0, y: 0 },
    ]);
    expect(result?.primary).toEqual({ x: 0, y: 1 });
    expect(result?.secondary).toEqual({ x: 1, y: 0 });
  });
});

describe('fitMinimumAreaRect — degenerate 판정', () => {
  test('hull 면적이 epsilon 이하이면 undefined를 돌려준다', () => {
    // cross 1.8은 epsilon 1을 넘어 hull에 남고 edge와 투영 폭도 모두 1을 넘지만, 면적 0.9가 epsilon 이하다.
    const triangle = [
      { x: 0, y: 0 },
      { x: 1.5, y: 0 },
      { x: 0, y: 1.2 },
    ];
    expect(fitMinimumAreaRect(triangle, { epsilon: 1 })).toBeUndefined();
    expect(fitMinimumAreaRect(triangle, { epsilon: 0.5 })).toBeDefined();
  });

  test('길이가 epsilon 이하인 hull edge는 candidate에서 제외한다', () => {
    // 짧은 edge (3,6)-(4,7)을 축으로 한 candidate만 살아남을 수 있어 epsilon 3에서는 결과가 없다.
    const points = [
      { x: 5, y: 1 },
      { x: 3, y: 6 },
      { x: 4, y: 7 },
    ];
    expect(fitMinimumAreaRect(points, { epsilon: 3 })).toBeUndefined();
    expect(fitMinimumAreaRect(points, { epsilon: 1 })).toBeDefined();
  });

  test('projection 폭이 epsilon 이하인 얇은 삼각형은 undefined를 돌려준다', () => {
    const sliver = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 0.02 },
    ];
    expect(fitMinimumAreaRect(sliver, { epsilon: 0.5 })).toBeUndefined();
    expect(fitMinimumAreaRect(sliver)).toBeDefined();
  });

  test('projection 폭이 overflow하면 undefined를 돌려준다', () => {
    const wide = [
      { x: -1e308, y: 0 },
      { x: 1e308, y: 0 },
      { x: 0, y: 1e308 },
    ];
    expect(fitMinimumAreaRect(wide)).toBeUndefined();
  });

  test('중점 계산이 overflow하면 해당 candidate를 버리고 undefined를 돌려준다', () => {
    // 폭 1e307은 유한하지만 minU + maxU가 Infinity가 되어 center가 non-finite다.
    const far = [
      { x: 1.2e308, y: 0 },
      { x: 1.3e308, y: 0 },
      { x: 1.25e308, y: 1 },
    ];
    expect(fitMinimumAreaRect(far)).toBeUndefined();
    expect(fitMinimumAreaRect(far.map((p) => ({ x: p.x / 4, y: p.y })))).toBeDefined();
  });
});
