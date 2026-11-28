import type { PointWritable } from './flat-shapes.internal';

/**
 * matrix로 변환한 rect/bounds의 oriented outline corner를 기록하는 writable output type.
 *
 * AABB와 달리 변환된 네 corner 좌표를 그대로 보존한다. 회전 변환이 있으면 corner가 회전된
 * 평행사변형을 이룬다. corner 이름은 source rect/bounds의 corner를 가리키며 transform 후 화면상
 * 위치를 뜻하지 않는다. caller가 호출 전에 네 corner storage를 초기화한다.
 *
 * corner 순서는 `rect.cornersInto`와 같다: `topLeft` → `topRight` → `bottomRight` → `bottomLeft`.
 */
export interface OrientedBoundsWritable {
  /** 기록 가능한 source 좌상단 corner */
  topLeft: PointWritable;

  /** 기록 가능한 source 우상단 corner */
  topRight: PointWritable;

  /** 기록 가능한 source 우하단 corner */
  bottomRight: PointWritable;

  /** 기록 가능한 source 좌하단 corner */
  bottomLeft: PointWritable;
}

/**
 * 2D affine matrix decomposition 결과를 기록하는 writable output type.
 *
 * 분해식 `M = T(translation) * R(rotation) * S(scaling) * K(skewing.x)` (단일 skewX
 * convention)의 component를 nested writable로 기록한다. caller가 각 nested storage를
 * 호출 전에 초기화해 둔다.
 */
export interface MatrixDecompositionWritable {
  /** 기록 가능한 translation `(tx, ty)` */
  translation: PointWritable;

  /** 기록 가능한 scaling. reflection은 `scaling.y < 0`으로 인코딩된다. */
  scaling: PointWritable;

  /** 기록 가능한 skewing. radian 단위. 단일 skewX convention에서 `skewing.y`는 항상 0. */
  skewing: PointWritable;

  /** 기록 가능한 rotation. radian 단위. (-π, π] 범위로 정규화된다. */
  rotation: number;
}
