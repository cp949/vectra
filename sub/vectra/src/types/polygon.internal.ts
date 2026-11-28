/** polygon 내 point 위치 분류. inside=내부, boundary=경계, outside=외부. */
export type PointContainment = 'inside' | 'boundary' | 'outside';

/**
 * radial vertex 생성 함수의 공유 옵션.
 *
 * `regularPolygonCommandsInto` / `regularPolygonInto` / `fromCircleApproximationInto` / `fromEllipseApproximationInto` 등에서
 * 동일한 의미로 사용한다. polygon vertex 분포 또는 circle/ellipse approximation 분포에 모두 적용된다.
 * `startAngle`은 첫 vertex의 각도 (기본 `-Math.PI / 2`, 즉 위쪽 vertex 시작).
 * `clockwise`는 진행 방향 (기본 `true`, SVG y-down clockwise).
 */
export interface RegularPolygonOptions {
  /** 첫 vertex의 각도. radian. 기본값 `-Math.PI / 2`. */
  startAngle?: number;

  /** true면 SVG y-down clockwise. 기본값 `true`. */
  clockwise?: boolean;
}

/**
 * star vertex 생성 함수의 공유 옵션.
 *
 * `starCommandsInto` / `starPolygonInto` 등에서 동일한 의미로 사용한다.
 * `startAngle`은 첫(outer) vertex의 각도 (기본 `-Math.PI / 2`).
 * `clockwise`는 진행 방향 (기본 `true`).
 * `RegularPolygonOptions`와 표면은 동일하지만 별도 정의 (builder별 첫 vertex가 가리키는 의미가 다름).
 */
export interface StarOptions {
  /** 첫 outer vertex의 각도. radian. 기본값 `-Math.PI / 2`. */
  startAngle?: number;

  /** true면 SVG y-down clockwise. 기본값 `true`. */
  clockwise?: boolean;
}
