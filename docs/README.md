# vectra 문서

`@cp949/vectra`는 TypeScript geometry/math function catalog다.
외부 사용자는 이 문서에서 시작한다.

## 시작하기

| 문서 | 읽는 때 |
| --- | --- |
| [Package README](../sub/vectra/README.md) | 설치, 빠른 시작, 핵심 규칙을 빠르게 확인할 때 |
| [시작하기](./guides/getting-started.md) | 첫 import와 첫 계산을 실행할 때 |

## 사용 가이드

| 문서 | 읽는 때 |
| --- | --- |
| [Import 방식](./guides/imports.md) | root import와 domain barrel import를 선택할 때 |
| [Output과 Into](./guides/outputs-and-into.md) | allocation과 caller-owned output 재사용을 선택할 때 |
| [Input과 Shape](./guides/inputs-and-shapes.md) | `{ x, y }`, tuple, shape input 규칙을 확인할 때 |
| [Degenerate와 Numeric Policy](./guides/degen-and-numeric-policy.md) | sentinel, `RangeError`, epsilon 처리를 확인할 때 |
| [Adapter](./guides/adapters.md) | SVG points/path 같은 외부 format 변환을 사용할 때 |

## Reference

| 문서 | 읽는 때 |
| --- | --- |
| [Domain 지도](./reference/domains.md) | 필요한 기능이 어느 domain에 있는지 찾을 때 |
| [Import Map](./reference/import-map.md) | public import path를 확인할 때 |

## 내부 문서

내부 문서는 외부 사용자 첫 흐름이 아니다.
기여, release, agent 작업, numeric regression 방지에 필요할 때 읽는다.

| 문서 | 읽는 때 |
| --- | --- |
| [내부 문서 허브](./internal/README.md) | 내부 문서 목록을 볼 때 |
| [API 설계](./internal/api-design.md) | public API 설계 규칙을 확인할 때 |
| [정밀도 정책](./internal/precision.md) | numeric tolerance와 degenerate policy를 확인할 때 |
| [Agent 함정](./internal/agent-traps/) | 반복 회귀를 피할 때 |
