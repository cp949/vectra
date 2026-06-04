# Bezier 곡률 zero-magnitude 판정: 절대 threshold가 작은 비퇴화 curve를 degenerate로 오분류한다

태그: `bezier`, `curvature`, `degenerate`, `threshold`, `numerical`

## 함정

Bezier curvature 공식 `κ = (B' × B'') / |B'|^3`에서 zero magnitude `|B'|`만을 degenerate로
정의한 정책 위에서, denominator의 절대 threshold(`|B′|^3 < 1e-10` 등)로 degenerate를 판정하면
좌표 scale이 작은 비퇴화 curve가 `NaN` 또는 `0`으로 잘못 분류된다.

```ts
// 함정: 절대 threshold로 degenerate 판정
const denom = Math.pow(speed, 3);
if (denom < 1e-10) return Number.NaN; // 작은 비퇴화 curve도 NaN으로 분류
return cross / denom;
```

비교: `curve/quadraticCurvatureAt`, `curve/cubicCurvatureAt`처럼 zero magnitude를 `0` fallback으로
처리하는 helper도 있다. policy가 zero magnitude → `NaN`이라면 fallback이 `0`인 sibling helper의
결과를 그대로 public path 정책으로 노출하지 않는다.

## 증상

- 좌표 scale `1e-4` 정도의 정상 quadratic/cubic path에서 `curvatureAtLength`가 큰 유한
  curvature 대신 `NaN` 또는 `0`을 반환한다.
- "zero magnitude → NaN"으로 단언된 contract test가 작은 scale 케이스에서 잘못 통과한다.
- curve domain의 동일 이름 helper와 path 공개 함수의 동작이 다른데 reviewer가 둘을 같다고
  가정하면 review-fix 라운드가 늘어난다.

## 방지

- policy가 zero `|B'|`만 degenerate로 정의했다면 denominator가 정확히 `0`일 때만 `NaN`을
  반환한다. 작은 비퇴화 값은 공식 그대로 계산한다.

```ts
// 올바른 형태
const speed = Math.hypot(dx, dy);
if (speed === 0) return Number.NaN;
const denom = speed * speed * speed;
return (dx * ddy - dy * ddx) / denom;
```

- sibling curve helper(`quadraticCurvatureAt`, `cubicCurvatureAt`)가 degenerate에 `0`을 반환
  한다면 path leaf에서 결과를 그대로 신뢰하지 말고 magnitude를 선검사한다. degenerate fallback이
  서로 다른 두 도메인을 결합할 때마다 둘 중 어느 contract가 public 표면인지 확정한다.
- 작은 좌표 scale + 비퇴화 input에서 expected curvature를 계산한 회귀 테스트를 둔다. 입력 scale은
  `1e-2`, `1e-4`, `1e-6` 정도까지 늘리고 결과 magnitude의 reciprocal scale을 검증한다.

## 관련 작업

- `_works/S3-RM-028/20260522-01-path-follow-up/` TASK-04 리뷰-수정 B1 / B3.
  `curvatureAtLength`가 zero `|B′|`에서 `0`을 반환한 회귀와, 이후 `|B′|^3 < 1e-10` 절대
  threshold로 작은 비퇴화 curve를 NaN으로 잘못 분류한 회귀를 분리해 수정.
