/**
 * ellipse arc crossing core의 분기 테스트.
 *
 * 대상:
 *  - segmentCrossesEllipse : segment와 ellipse 경계의 교차 판정
 *  - boxEdgesCrossEllipse : box 4변 중 하나라도 경계와 교차하는지 판정
 *
 * 검증 항목:
 *  1. 점 segment(길이 0)는 ellipse 위나 내부일 때만 true다.
 *  2. segment가 경계를 한 번 가로지르면 어느 root가 [0, 1]에 들어와도 true다.
 *  3. segment가 완전히 안쪽이거나 선 위의 바깥쪽이면 false다.
 *  4. box는 4변 각각이 유일한 교차 변일 때 true, 어느 변도 닿지 않으면 false다.
 *
 * 모든 좌표는 단위원이 아닌 ellipse(center (1, 2), rx 2, ry 1)로 잡아 정규화 경로를 함께 지난다.
 */
import { describe, expect, test } from 'vitest';
import { boxEdgesCrossEllipse, segmentCrossesEllipse } from '../../../src/ellipse/ellipse-arc-crossing.internal';

const CX = 1;
const CY = 2;
const RX = 2;
const RY = 1;

/** 고정 ellipse에 대해 segment 교차를 판정한다. 각 테스트가 segment 좌표만 넘기게 한다. */
function crosses(x0: number, y0: number, x1: number, y1: number): boolean {
  return segmentCrossesEllipse(x0, y0, x1, y1, CX, CY, RX, RY);
}

/** 고정 ellipse에 대해 box 4변 교차를 판정한다. */
function boxCrosses(minX: number, minY: number, maxX: number, maxY: number): boolean {
  return boxEdgesCrossEllipse(minX, minY, maxX, maxY, CX, CY, RX, RY);
}

describe('segmentCrossesEllipse', () => {
  test('점 segment가 ellipse 내부이면 true다', () => {
    expect(crosses(CX, CY, CX, CY)).toBe(true);
  });

  test('점 segment가 ellipse 경계 위이면 true다', () => {
    expect(crosses(CX + RX, CY, CX + RX, CY)).toBe(true);
  });

  test('점 segment가 ellipse 바깥이면 false다', () => {
    expect(crosses(CX + RX + 1, CY, CX + RX + 1, CY)).toBe(false);
  });

  test('바깥에서 안쪽으로 들어오면 true다', () => {
    // 작은 근 t1이 [0, 1]에 들어온다
    expect(crosses(CX - 5, CY, CX, CY)).toBe(true);
  });

  test('안쪽에서 바깥으로 나가면 true다', () => {
    // 작은 근 t1은 음수이고 큰 근 t2가 [0, 1]에 들어온다
    expect(crosses(CX, CY, CX + 5, CY)).toBe(true);
  });

  test('ellipse를 완전히 가로지르면 true다', () => {
    expect(crosses(CX - 5, CY, CX + 5, CY)).toBe(true);
  });

  test('경계에 접하는 segment는 true다', () => {
    // 위쪽 끝 y = CY + RY에 접하므로 discriminant가 0이다
    expect(crosses(CX - 1, CY + RY, CX + 1, CY + RY)).toBe(true);
  });

  test('ellipse 안쪽에 완전히 들어 있는 segment는 false다', () => {
    // 두 근이 모두 [0, 1] 밖이다 (t1 < 0, t2 > 1)
    expect(crosses(CX - 0.5, CY, CX + 0.5, CY)).toBe(false);
  });

  test('선은 지나지만 segment가 닿기 전에 끝나면 false다', () => {
    // 두 근이 모두 1보다 크다
    expect(crosses(CX - 10, CY, CX - 5, CY)).toBe(false);
  });

  test('선은 지나지만 segment가 지나간 뒤에 시작하면 false다', () => {
    // 두 근이 모두 0보다 작다
    expect(crosses(CX + 5, CY, CX + 10, CY)).toBe(false);
  });

  test('ellipse를 비껴가는 선이면 false다', () => {
    // discriminant가 음수다
    expect(crosses(CX - 5, CY + RY + 1, CX + 5, CY + RY + 1)).toBe(false);
  });
});

describe('boxEdgesCrossEllipse', () => {
  test('왼쪽 변만 교차하면 true다', () => {
    // 오른쪽 변 x = CX + 10, 위아래 변은 ellipse와 떨어져 있다
    expect(boxCrosses(CX, CY - 5, CX + 10, CY + 5)).toBe(true);
  });

  test('오른쪽 변만 교차하면 true다', () => {
    expect(boxCrosses(CX - 10, CY - 5, CX, CY + 5)).toBe(true);
  });

  test('위쪽 변만 교차하면 true다', () => {
    // 왼쪽·오른쪽 변은 ellipse 밖 x 위치에 있고 위쪽 변만 ellipse를 지난다
    expect(boxCrosses(CX - 10, CY, CX + 10, CY + 10)).toBe(true);
  });

  test('아래쪽 변만 교차하면 true다', () => {
    expect(boxCrosses(CX - 10, CY - 10, CX + 10, CY)).toBe(true);
  });

  test('ellipse를 완전히 감싸는 box는 변이 닿지 않아 false다', () => {
    expect(boxCrosses(CX - 10, CY - 10, CX + 10, CY + 10)).toBe(false);
  });

  test('ellipse에서 떨어진 box는 false다', () => {
    expect(boxCrosses(CX + 10, CY + 10, CX + 20, CY + 20)).toBe(false);
  });

  test('ellipse 안쪽에 들어 있는 box는 변이 닿지 않아 false다', () => {
    expect(boxCrosses(CX - 0.5, CY - 0.2, CX + 0.5, CY + 0.2)).toBe(false);
  });
});
