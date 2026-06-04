/**
 * Types entry geometry type export 계약 테스트.
 */

import { describe, test } from 'vitest';
import type {
  GridCellLike,
  GridCellObjectLike,
  GridCellTuple,
  GridCellWritable,
  GridSpecLike,
  MatrixToPoseOptions,
  PolylineFrameWritable,
  PoseApproxEqualsOptions,
  PoseDistanceOptions,
  RectAlignAnchor,
  RectAlignOptions,
  XYObjectWritable,
  XYWritable,
} from '../../src/types';

function expectAssignable<T>(value: T): T {
  return value;
}

describe('types entry geometry type exposure 계약', () => {
  test('types entry가 grid cell/spec type을 노출한다', () => {
    const cellObject = expectAssignable<GridCellObjectLike>({ col: 1, row: 2 });
    expectAssignable<GridCellLike>(cellObject);
    expectAssignable<GridCellTuple>([1, 2] as const);
    expectAssignable<GridCellWritable>({ col: 0, row: 0 });
    expectAssignable<GridSpecLike>({ cellSize: 10 });
    expectAssignable<GridSpecLike>({ origin: { x: 0, y: 0 }, cellSize: [10, 20] as const });
  });

  test('types entry가 rect alignment type을 노출한다', () => {
    const anchor = expectAssignable<RectAlignAnchor>('top-left');
    expectAssignable<RectAlignOptions>({ anchor });
    expectAssignable<RectAlignOptions>({});
  });

  test('types entry가 matrixToPose 옵션 type을 노출한다', () => {
    expectAssignable<MatrixToPoseOptions>({ epsilon: 1e-6 });
    expectAssignable<MatrixToPoseOptions>({});
  });

  test('types entry가 poseApproxEquals 옵션 type을 노출한다', () => {
    expectAssignable<PoseApproxEqualsOptions>({ positionEpsilon: 1e-6, angleEpsilon: 1e-6 });
    expectAssignable<PoseApproxEqualsOptions>({});
  });

  test('types entry가 poseDistance 옵션 type을 노출한다', () => {
    expectAssignable<PoseDistanceOptions>({ angularWeight: 2 });
    expectAssignable<PoseDistanceOptions>({});
  });

  test('types entry가 PolylineFrameWritable type을 노출한다', () => {
    const objectFrame = expectAssignable<PolylineFrameWritable<XYObjectWritable>>({
      point: { x: 0, y: 0 },
      tangent: { x: 1, y: 0 },
      normal: { x: 0, y: 1 },
    });
    expectAssignable<PolylineFrameWritable>(objectFrame);

    expectAssignable<PolylineFrameWritable<XYWritable>>({
      point: [0, 0],
      tangent: { x: 1, y: 0 },
      normal: [0, 1],
    });
  });
});
