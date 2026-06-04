import type { XYInput, XYObjectWritable, XYWritable } from './xy.internal';

/** canonical object shape로 표현하는 structural polyline input. */
export interface PolylineObjectLike {
  /** polyline vertex 목록 */
  readonly points: readonly XYInput[];
}

/** ordered point 배열 또는 canonical object shape로 표현하는 structural polyline input. */
export type PolylineLike = readonly XYInput[] | PolylineObjectLike;

/** writable point 배열에 결과를 기록할 수 있는 structural polyline output. */
export interface PolylineWritable<Point extends XYInput = XYObjectWritable> {
  /** 기록 가능한 polyline vertex 목록 */
  points: Point[];
}

/** `frameAtLengthInto` / `frameAtLength`의 arc-length point/tangent/normal frame output. */
export interface PolylineFrameWritable<Point extends XYWritable = XYObjectWritable> {
  /** arc-length target 위치의 sampled point storage */
  point: Point;

  /** target 위치를 포함하는 non-zero segment의 단위 tangent storage */
  tangent: Point;

  /** tangent의 left normal `(-ty, tx)` storage */
  normal: Point;
}

/** `concatInto` / `concat`의 인접 source polyline 접합 endpoint dedupe 옵션. */
export interface PolylineConcatOptions {
  /**
   * 인접 source polyline의 접합 endpoint를 dedupe할 거리 임계값. `>= 0`인 finite number여야 한다.
   * 기본값 `0`. `0`이면 exact equality로 비교하고, 양수이면 인접 endpoint 사이 `Math.hypot` 거리가
   * 이 값 이하일 때 현재 source의 첫 point를 제거한다. 음수 / `NaN` / `±Infinity`는 `RangeError`다.
   */
  weldTolerance?: number;
}

/** `subdivideInto` / `subdivide`의 segment 분할 옵션. */
export interface PolylineSubdivideOptions {
  /**
   * 각 source segment를 나눌 등분 개수. positive integer여야 한다.
   * 기본값 `2`. `1`이면 원본 point 복제와 같다.
   */
  segmentsPerSegment?: number;
}

/**
 * `monotonicAxis`가 반환하는 축별 단조 판정 결과.
 *
 * x 좌표열과 y 좌표열을 독립적으로 본다. `'both'`는 두 축 모두, `'none'`은 두 축 모두
 * 단조가 아님을 뜻한다.
 */
export type PolylineMonotonicAxis = 'x' | 'y' | 'both' | 'none';

/** `monotonicAxis`의 단조 판정 옵션. */
export interface PolylineMonotonicAxisOptions {
  /**
   * `true`면 같은 축의 consecutive delta가 모두 `> 0`이거나 모두 `< 0`이어야 단조다.
   * delta `0`(repeated 좌표, signed-zero `-0` 포함)이 하나라도 있으면 해당 축은 탈락한다.
   * 기본값 `false`(non-strict): delta `0`을 허용한다.
   */
  strict?: boolean;
}
