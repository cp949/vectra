# 내부 문서

이 영역은 `vectra` 유지보수자와 agent가 읽는 내부 문서다.
외부 사용자 문서는 이후 docs/README.md에서 시작한다.

## 설계와 제품 경계

| 문서 | 읽는 때 |
| --- | --- |
| [API 설계](./api-design.md) | public API 형태, `Into`, import boundary를 확인할 때 |
| [제품 범위](./product-scope.md) | 구현할 범위와 비범위를 확인할 때 |
| [정밀도 정책](./precision.md) | epsilon, non-finite, degenerate 처리를 확인할 때 |

## 개발 운영

| 문서 | 읽는 때 |
| --- | --- |
| [프로젝트 구조](./project-structure.md) | 저장소 구조를 확인할 때 |
| [프로젝트 운영](./project-operations.md) | 작업/검증 흐름을 확인할 때 |
| [주석 작성 규칙](./comment-style.md) | public JSDoc과 테스트 주석을 작성할 때 |
| [ADR](./adr/) | 과거 결정 이유를 확인할 때 |
| [체크리스트](./checklists/) | release 또는 작업 완료 전 확인할 때 |

## 회귀 방지 자료

| 문서 | 읽는 때 |
| --- | --- |
| [Agent 함정](./agent-traps/) | numeric, package surface, workflow 회귀를 피할 때 |
| [예제 운영](./examples/) | demo/example 추가 기준을 확인할 때 |
