/**
 * Bezier segment × closed primitive boolean relation 공용 internal helper (re-export 배럴).
 *
 * curve × circle/ellipse는 ellipse local 정규화로 implicit residual `f(t) = U(t)² + V(t)² - 1`을
 * 만들고 `[0, 1]` 최솟값이 0 이하인지로 closed disk 교차를 판정한다(probe helper). curve × rect/bounds/triangle은
 * primitive edge를 segment로 분해해 curve numeric kernel(probe)로 교차를 보고하고, primitive가 curve를
 * 둘러싸는 containment-only case는 endpoint containment fallback으로 잡는다(polygon helper).
 *
 * public leaf끼리 직접 import하지 않으려고 degree-agnostic 계산을 internal helper에 모은다.
 * quadratic/cubic public leaf는 power-basis 계수와 numeric kernel probe만 전달한다.
 *
 * 관계 case별 helper(probe factory + disk / segment·containment kernel / polygon-family relation)로
 * 분할하고, 이 모듈은 소비처 named import surface를 보존하는 re-export 배럴로 유지한다.
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

export {
  curveBoundsIntersects,
  curveRectIntersects,
  curveTriangleIntersects,
} from './curve-primitive-polygon.internal';
export {
  allFinite,
  type CurveLineProbe,
  curveEllipseDiskIntersects,
  makeCubicProbe,
  makeQuadraticProbe,
} from './curve-primitive-probe.internal';
