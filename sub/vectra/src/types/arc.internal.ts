/**
 * center form으로 표현하는 structural arc input.
 *
 * SVG endpoint form `ArcCommand`와 구분하기 위한 별도 type이다.
 * `rx`, `ry`는 양수여야 한다. zero 또는 음수일 경우 degenerate로 취급한다.
 * `sweep === true`는 시계 방향(clockwise) 진행을 뜻한다. 이 정책에서는
 * 각도가 증가하는 방향이 시계 방향이므로 `sweep === true`이면 `endAngle >= startAngle`이다.
 */
export interface CenterArcLike {
  /** 타원 중심 x */
  readonly cx: number;

  /** 타원 중심 y */
  readonly cy: number;

  /** x축 반지름 (양수) */
  readonly rx: number;

  /** y축 반지름 (양수) */
  readonly ry: number;

  /** x축 기울기, 단위 radian */
  readonly xRotation: number;

  /** 시작 각도, 단위 radian */
  readonly startAngle: number;

  /** 끝 각도, 단위 radian */
  readonly endAngle: number;

  /** true = 시계 방향(clockwise) */
  readonly sweep: boolean;
}

/**
 * `CenterArcLike`의 모든 field를 mutable로 가진 output type.
 *
 * `endpointArcToCenterInto`, `centerArcToEndpointInto`(endpoint form은 아님)
 * 등 center form 결과를 기록할 때 사용한다.
 */
export interface CenterArcWritable {
  /** 기록 가능한 타원 중심 x */
  cx: number;

  /** 기록 가능한 타원 중심 y */
  cy: number;

  /** 기록 가능한 x축 반지름 */
  rx: number;

  /** 기록 가능한 y축 반지름 */
  ry: number;

  /** 기록 가능한 x축 기울기 (radian) */
  xRotation: number;

  /** 기록 가능한 시작 각도 (radian) */
  startAngle: number;

  /** 기록 가능한 끝 각도 (radian) */
  endAngle: number;

  /** 기록 가능한 sweep flag (true = clockwise) */
  sweep: boolean;
}

/**
 * endpoint arc의 radius scale 보정 결과를 기록하는 output type.
 *
 * SVG 명세 F.6.6.3에 따라 from→to 거리가 ellipse가 표현 가능한 범위를
 * 벗어날 때 rx/ry를 동일 비율로 확대한 결과를 보관한다.
 */
export interface EndpointArcCorrectionWritable {
  /** 보정된 x축 반지름 */
  rx: number;

  /** 보정된 y축 반지름 */
  ry: number;
}

/**
 * center form arc를 SVG 호환 endpoint form으로 변환한 결과를 기록하는 output type.
 *
 * `ArcCommand`는 모든 field가 readonly이므로 직접 output으로 쓸 수 없다.
 * `kind`는 항상 `'arc'`로 고정되어 기록된다.
 * `centerArcToEndpointInto`의 output constraint로 사용한다.
 */
export interface ArcCommandWritable {
  /** 항상 `'arc'`로 기록된다 */
  kind: 'arc';

  /** 기록 가능한 x축 반지름 */
  rx: number;

  /** 기록 가능한 y축 반지름 */
  ry: number;

  /** 기록 가능한 x축 기울기 (radian) */
  xRotation: number;

  /** 기록 가능한 large-arc flag */
  largeArc: boolean;

  /** 기록 가능한 sweep flag (true = clockwise) */
  sweep: boolean;

  /** 기록 가능한 endpoint x */
  x: number;

  /** 기록 가능한 endpoint y */
  y: number;
}
