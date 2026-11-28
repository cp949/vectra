/**
 * Types entry geometry type export 계약 테스트.
 */

import { describe, test } from 'vitest';
import type {
  GridCell,
  GridCellWritable,
  GridSpec,
  MatrixToPoseOptions,
  PointWritable,
  PolylineFrameWritable,
  PoseApproxEqualsOptions,
  PoseDistanceOptions,
  RectAlignAnchor,
  RectAlignOptions,
} from '../../src/types';

/** 공개 타입에 값을 할당할 수 있는지 확인한다. */
function expectAssignable<T>(value: T): T {
  return value;
}

describe('types entry geometry type exposure 계약', () => {
  test('types entry가 grid cell/spec type을 노출한다', () => {
    expectAssignable<GridCell>({ col: 1, row: 2 });
    expectAssignable<GridCellWritable>({ col: 0, row: 0 });
    expectAssignable<GridSpec>({ originX: 0, originY: 0, cellWidth: 10, cellHeight: 20 });
  });

  test('types entry가 rect alignment type을 노출한다', () => {
    const anchor = expectAssignable<RectAlignAnchor>('top-left');
    expectAssignable<RectAlignOptions>({ anchor });
    expectAssignable<RectAlignOptions>({});
  });

  test('types entry가 matrixToPose 옵션 type을 노출한다', () => {
    expectAssignable<MatrixToPoseOptions>({ epsilon: 1e-6 });
  });

  test('types entry가 poseApproxEquals 옵션 type을 노출한다', () => {
    expectAssignable<PoseApproxEqualsOptions>({ positionEpsilon: 1e-6, angleEpsilon: 1e-6 });
  });

  test('types entry가 poseDistance 옵션 type을 노출한다', () => {
    expectAssignable<PoseDistanceOptions>({ angularWeight: 2 });
  });

  test('types entry가 PolylineFrameWritable type을 노출한다', () => {
    const objectFrame = expectAssignable<PolylineFrameWritable<PointWritable>>({
      point: { x: 0, y: 0 },
      tangent: { x: 1, y: 0 },
      normal: { x: 0, y: 1 },
    });
    expectAssignable<PolylineFrameWritable>(objectFrame);
  });
});
