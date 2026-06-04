import type { LineFamilyParam, LineFamilyRangeKind } from './line-family-param.internal';

export interface LineFamilyRangeInterval {
  lo: number;
  hi: number;
}

/**
 * t가 kind의 range 안에 있는지 정확 비교한다.
 *
 * non-finite t(NaN/±Infinity)는 어느 range에도 속하지 않는다. `finite`/`ray`는 비교 연산이
 * 이미 NaN을 배제하지만 `ray`의 +Infinity와 `infinite`의 모든 t는 명시적으로 finite를 요구한다.
 */
export function lineFamilyRangeContains(t: number, kind: LineFamilyRangeKind): boolean {
  if (kind === 'finite') return t >= 0 && t <= 1;
  if (kind === 'ray') return Number.isFinite(t) && t >= 0;
  return Number.isFinite(t);
}

/** base line-family의 parameter 축에서 자기 range interval을 반환한다. */
export function getLineFamilyOwnRangeInterval(kind: LineFamilyRangeKind): LineFamilyRangeInterval {
  if (kind === 'finite') return { lo: 0, hi: 1 };
  if (kind === 'ray') return { lo: 0, hi: Number.POSITIVE_INFINITY };
  return { lo: Number.NEGATIVE_INFINITY, hi: Number.POSITIVE_INFINITY };
}

/**
 * target line-family range를 base line-family의 parameter 축 interval로 매핑한다.
 *
 * 전제: base/target은 collinear non-degenerate이고, `targetOriginT`는 base 축에서 target origin의 t,
 * `targetDirectionScale`은 base direction 대비 target direction scale이다.
 */
export function getMappedLineFamilyRangeInterval(
  target: LineFamilyParam,
  targetOriginT: number,
  targetDirectionScale: number
): LineFamilyRangeInterval {
  if (target.kind === 'finite') {
    const endpointT = targetOriginT + targetDirectionScale;
    return { lo: Math.min(targetOriginT, endpointT), hi: Math.max(targetOriginT, endpointT) };
  }

  if (target.kind === 'ray') {
    if (targetDirectionScale > 0) return { lo: targetOriginT, hi: Number.POSITIVE_INFINITY };
    return { lo: Number.NEGATIVE_INFINITY, hi: targetOriginT };
  }

  return { lo: Number.NEGATIVE_INFINITY, hi: Number.POSITIVE_INFINITY };
}
