/**
 * pose2 Into 함수가 외부 클래스 출력의 참조와 타입을 보존하는지 검증한다.
 */

import { expect, expectTypeOf, test } from 'vitest';
import {
  composePoseInto,
  invertPoseInto,
  relativePoseInto,
  lookAtPoseInto,
  poseFromTranslationRotationInto,
  matrixToPoseInto,
  poseToMatrixInto,
  transformPointByPoseInto,
  transformVectorByPoseInto,
  inverseTransformPointByPoseInto,
  inverseTransformVectorByPoseInto,
} from '../../../src/pose2';
import type { Pose2 } from '../../../src/types/flat-shapes.internal';

/** pose 필드 외에 `tag`를 더 가진 외부 클래스. Into가 이 구체 타입을 그대로 반환하는지 본다. */
class ExternalPose {
  px = 0;
  py = 0;
  angle = 0;
  tag = 'pose';
}

/** 점 필드 외에 `tag`를 더 가진 외부 클래스. 점 출력 Into의 반환 타입 보존을 본다. */
class ExternalPoint {
  x = 0;
  y = 0;
  tag = 'point';
}

/** 행렬 성분 외에 `tag`를 더 가진 외부 클래스. 행렬 입출력의 구체 타입 보존을 본다. */
class ExternalMatrix {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  tx = 0;
  ty = 0;
  tag = 'matrix';
}

const pose: Pose2 = { px: 2, py: 3, angle: 0.5 };
const point = { x: 2, y: 3 };
const matrix = new ExternalMatrix();

test('합성에 평평한 pose 입력을 받는다', () => {
  expectTypeOf(composePoseInto).parameter(1).toEqualTypeOf<Pose2>();
});

test('composePoseInto는 외부 클래스 출력 타입과 참조를 보존한다', () => {
  const out = new ExternalPose();
  const result = composePoseInto(out, pose, pose);
  expectTypeOf(result).toEqualTypeOf<ExternalPose>();
  expect(result).toBe(out);
});

test('invertPoseInto는 외부 클래스 출력 타입과 참조를 보존한다', () => {
  const out = new ExternalPose();
  const result = invertPoseInto(out, pose);
  expectTypeOf(result).toEqualTypeOf<ExternalPose>();
  expect(result).toBe(out);
});

test('relativePoseInto는 외부 클래스 출력 타입과 참조를 보존한다', () => {
  const out = new ExternalPose();
  const result = relativePoseInto(out, pose, pose);
  expectTypeOf(result).toEqualTypeOf<ExternalPose>();
  expect(result).toBe(out);
});

test('lookAtPoseInto는 외부 클래스 출력 타입과 참조를 보존한다', () => {
  const out = new ExternalPose();
  const result = lookAtPoseInto(out, point, { x: 4, y: 6 });
  expectTypeOf(result).toEqualTypeOf<ExternalPose>();
  expect(result).toBe(out);
});

test('poseFromTranslationRotationInto는 외부 클래스 출력 타입과 참조를 보존한다', () => {
  const out = new ExternalPose();
  const result = poseFromTranslationRotationInto(out, point, 1);
  expectTypeOf(result).toEqualTypeOf<ExternalPose>();
  expect(result).toBe(out);
});

test('matrixToPoseInto는 외부 클래스 출력 타입과 참조를 보존한다', () => {
  const out = new ExternalPose();
  const result = matrixToPoseInto(out, matrix);
  expectTypeOf(result).toEqualTypeOf<ExternalPose | false>();
  expect(result).toBe(out);
});

test('poseToMatrixInto는 외부 클래스 출력 타입과 참조를 보존한다', () => {
  const out = new ExternalMatrix();
  const result = poseToMatrixInto(out, pose);
  expectTypeOf(result).toEqualTypeOf<ExternalMatrix>();
  expect(result).toBe(out);
});

test('transformPointByPoseInto는 외부 클래스 출력 타입과 참조를 보존한다', () => {
  const out = new ExternalPoint();
  const result = transformPointByPoseInto(out, pose, point);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
  expect(result).toBe(out);
});

test('transformVectorByPoseInto는 외부 클래스 출력 타입과 참조를 보존한다', () => {
  const out = new ExternalPoint();
  const result = transformVectorByPoseInto(out, pose, point);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
  expect(result).toBe(out);
});

test('inverseTransformPointByPoseInto는 외부 클래스 출력 타입과 참조를 보존한다', () => {
  const out = new ExternalPoint();
  const result = inverseTransformPointByPoseInto(out, pose, point);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
  expect(result).toBe(out);
});

test('inverseTransformVectorByPoseInto는 외부 클래스 출력 타입과 참조를 보존한다', () => {
  const out = new ExternalPoint();
  const result = inverseTransformVectorByPoseInto(out, pose, point);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
  expect(result).toBe(out);
});
