# ADR 0004: MVP 경계 결정

상태: 승인

## 배경

MVP 구현 전에 rectangle, bounds, polygon, angle, package 형태를 명확히 한다.
이 결정들은 구현 자체는 아니지만, API 모양과 테스트 기준에 직접 영향을 준다.

## 결정

- `rect`와 `bounds` domain은 둘 다 제공한다.
- `RectLike`는 `x`, `y`, `width`, `height` 기반 rectangle이다.
- `BoundsLike`는 `min`, `max` point 기반 extent이다.
- `rect`와 `bounds`는 별도 structural shape로 둔다.
- `polygon`은 MVP에서 hole을 지원하지 않는다.
- angle은 radian을 기본 단위로 사용한다.
- degree 변환을 위해 `degToRad`, `radToDeg` helper를 제공한다.
- package는 단일 `vectra` package이다.

## 결과

- rectangle과 extent 개념이 API에서 명확히 분리된다.
- polygon hole, boolean operation, SVG path 같은 복잡한 영역은 MVP 범위에 포함하지
  않는다.
- 수학 연산은 JavaScript의 `Math` API와 같은 radian 기준을 따른다.
- package 구조가 단순해져 구현 범위가 작게 유지된다.
