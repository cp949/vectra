# 예제 추가 실행 프롬프트

/work/jjfive/vectra 에서 예제 하나를 추가하라.

목표:
- docs/internal/examples/README.md 를 진입점으로 읽고, 다음 예제 후보를 결정한다.
- 복잡도 gate를 통과하는 예제 1개만 구현한다.
- 한 예제에 여러 preview/diagnostics/API coverage를 억지로 묶지 않는다.
- gate를 통과하는 후보가 없으면 구현하지 말고 이유와 다음 후보를 보고한다.

작업 규칙:
- CLAUDE.md, docs/internal/examples/README.md, docs/internal/examples/recommended.md, docs/internal/examples/wishlist.md 를 확인한다.
- 예제는 S1-RM-013 아래에 계획서를 작성한다.
- 계획서에는 선택 이유, 화면 목적 1문장, 중심 API 5개 이하, diagnostics 3개 이하, 확인할 함정을 명시한다.
- 예제 import는 docs/internal/examples/README.md 의 “예제 import 정책”을 따른다.
- source.exam.ts 상단 주석과 중간 한 줄 한글 주석을 추가하되, 구현을 반복 설명하지 않는다.
- allocating companion이 있으면 단발성 object 결과에는 *Into보다 companion을 우선한다.
- Canvas demo는 더 이상 추가하지 않는다.

함정 처리:
- 구현 중 반복 가능한 실수를 발견하면 작업 폴더의 함정.md에 기록한다.
- 승격 가치가 있으면 docs/internal/agent-traps/와 index도 갱신한다.
- 새 함정이 없으면 02-작업결과.md에 “새 함정 없음”을 기록한다.

완료 조건:
- catalog/source test/docs/internal/examples/recommended.md 또는 coverage 문서를 필요한 만큼 갱신한다.
- 작업한 app의 test/build를 먼저 실행한다.
- examples:coverage:write, examples:coverage:test, pnpm run verify를 실행한다.
- git diff --check를 실행한다.
- 검증 통과 후 관련 파일만 명시적으로 stage하고 커밋한다.
- 묻지 말고 구현 완료 후 최종 보고한다.
