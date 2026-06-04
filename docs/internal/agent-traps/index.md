# Agent 함정 인덱스

작업 계획서나 TASK 문서의 `확인할 함정` 섹션에서 필요한 항목만 연결한다.

## Package Surface

- [leaf export 알파벳 정렬은 ASCII 순서: 대문자가 소문자보다 앞](./package-surface/leaf-export-ascii-sort.md)
- [Package surface 문서 bookkeeping 누적: "보류/추가/삭제" 표에 implemented 행 누적 + Companion 분류 표 카테고리 혼합](./package-surface/api-surface-doc-bookkeeping.md)
- [이름이 다른 Into를 위임하는 companion은 import-boundary 자동 면제가 안 된다](./package-surface/companion-nonmatching-into-import-boundary.md)

## TypeScript

- [readonly tuple narrowing](./typescript/readonly-tuple-narrowing.md)
- [integer index guard: `Number.isInteger` 없이 `>= 0 && < n`만으로 가드하면 비정수 index가 통과한다](./typescript/integer-index-guard.md)
- [JS 비트 연산자 int32 강제 변환: safe integer 전체 범위에서 비트 트릭 금지](./typescript/js-bitwise-int32-coercion.md)
- [Math.atan2 signed zero 경계: `-0` 입력에서 `-π` 반환 — `(-π, π]` 범위 위반](./typescript/atan2-signed-zero-boundary.md)
- [float64 합산 overflow: 개별 finite 값도 합산하면 Infinity — aggregation 함수에서 누적 합계도 검증](./typescript/float64-sum-overflow.md)
- [Euclidean 거리/길이는 `Math.sqrt(dx * dx + dy * dy)` 대신 `Math.hypot(dx, dy)`를 쓴다](./typescript/euclidean-distance-hypot.md)
- [absolute coordinate를 normalize한 뒤 빼면 local offset이 사라진다](./typescript/scale-normalized-difference-precision-loss.md)
- [literal union 반환 타입 함수의 NaN 입력 처리 정책 누락: `-1 | 0 | 1` 타입에 NaN을 반환할 수 없으므로 정책을 명시한다](./typescript/literal-union-return-nan-input.md)
- [NaN 자기비교(`x !== x`)는 biome `suspicious/noSelfCompare` 오류: `Number.isNaN(x)` 사용](./typescript/nan-self-comparison-biome.md)
- [`Infinity * 0 = NaN`을 분기 진술 없이 JSDoc에 "pass-through"로 일반화: `r * (1 - cos(θ/2))` 같은 곱셈 수식에서 한 인수가 ±Infinity, 다른 인수가 0이면 결과는 NaN. 일반화 표현은 회귀 회로](./typescript/infinity-times-zero-nan-in-jsdoc.md)

## Testing / Verification

- [float64 ULP: Number.EPSILON을 절대 차이로 쓰지 않는다](./testing/float64-ulp.md)
- [pnpm script 인자 전달: Vitest 파일 필터 앞에 두 번째 `--`를 넣지 않는다](./testing/pnpm-vitest-file-filter.md)
- [built dist contract test: literal string import와 test 실행 순서](./testing/built-dist-contract-test.md)
- [개별 leaf 테스트 파일에 파일 overview 주석 누락: CI에서 걸리지 않아 절반만 적용되기 쉽다](./testing/test-file-overview-comment.md)
- [non-finite pass-through 테스트 NaN-only 편향: Infinity / zero degenerate 누락 (+ chord 차분 Infinity→NaN)](./testing/non-finite-pass-through-coverage.md)
- [arc-length spaced sampling이 uniform-t와 다름을 검증할 때 대칭 곡선을 쓰면 구분이 사라진다](./testing/arc-length-spaced-sampling-symmetric-curve.md)
- [vitest `toEqual`은 `+0`과 `-0`을 구분한다: builder의 부호 반전 산술이 `-0`을 만들 때 `Object.is`로 명시한다](./testing/vitest-toequal-signed-zero.md)
- [random helper의 rng 반환 boundary 테스트 누락: rng=0, rng→1 경계 검증을 빠뜨린다](./testing/random-rng-boundary-coverage.md)
- [예제 source 문자열 테스트는 함수명 접두어만 검사하지 않는다](./testing/example-source-string-prefix.md)
- [sandbox allowlist와 module map 분리 갱신: compile은 통과하고 iframe 런타임만 실패한다](./testing/sandbox-allowlist-module-map.md)
- [Sandbox 직렬화 함수의 클로저 helper 누락](./testing/sandbox-serialized-helper-closure.md)
- [Sandbox 예제 source의 barrel import allowlist 누락](./testing/sandbox-example-barrel-import.md)
- [Pixi 예제의 새 vectra domain import는 sandbox 등록과 source compile test를 같이 추가한다](./testing/pixi-new-domain-sandbox-registration.md)
- [PixiRuntimeSeed 필수 필드는 예제가 직접 쓰지 않아도 채운다](./testing/pixi-runtime-seed-required-fields.md)
- [broad random fuzz는 epsilon-thin band를 놓친다](./testing/fuzz-epsilon-thin-band.md)

## Examples

- [transformed rect: AABB와 rotated outline을 혼동하지 않는다](./examples/transformed-rect-aabb-vs-outline.md)
- [API inventory 예제는 사용자 작업 흐름이 없으면 실패한다](./examples/api-inventory-example-without-user-task.md)
- [예제 coverage는 leaf 파일 단위라 type export도 같이 covered로 보인다](./examples/coverage-leaf-level-type-export.md)
- [단일 흐름 가드 토큰을 예제 자기 주석이 먼저 포함한다](./examples/guard-token-in-own-comment.md)
- [Write로 생성한 예제 파일 끝에 `</content>` 닫는 태그가 새어 들어간다](./examples/write-tool-stray-content-tag.md)
- [예제 `source.exam.ts` 포맷은 `biome check`가 아니라 `biome format`으로 고친다 (`check`는 예제 경로를 ignore)](./examples/biome-format-exam-file-check-ignored.md)
- [uncovered alias leaf는 개념이 비어 있다는 뜻이 아니다](./examples/alias-leaf-duplicate-concept.md)
- [각도 → 벡터 구성 예제는 입력이 점이면 두 점 함수로 붕괴한다](./examples/from-angle-scalar-input-not-point.md)
- [`singleIntersection*`는 "첫 hit"가 아니라 "교점이 정확히 1개"일 때만 점을 준다](./examples/single-intersection-exactly-one-not-first-hit.md)
- [editor-geometry 예제 alias는 canonical `EditorGeometryx` — 기존 `EditorGeometry`는 drift](./examples/editor-geometry-alias-drift.md)

## Domain API

- [polygon empty 기준 이중성: pointCount === 0 vs pointCount < 3](./domain/polygon-empty-threshold.md)
- [Into/companion 함수 return type 일관성: 명명된 type 재사용과 barrel re-export](./domain/into-companion-return-type-consistency.md)
- [Numerical solver tolerance 분리: 분기 tolerance와 결과 dedupe tolerance를 같은 ε로 쓰지 않는다](./domain/numerical-solver-tolerance-split.md)
- [Circle tangent angle: degenerate case와 2π modulo angle dedupe](./domain/circle-tangent-degenerate-cases.md)
- [Into/companion JSDoc 비대칭: caller 책임 메모를 한쪽만 적는다](./domain/into-companion-jsdoc-symmetry.md)
- [signed distance 수식 절대값 오기: 분자에 `|...|`를 씌워 부호가 소거된다](./domain/signed-distance-formula-absolute-value.md)
- [arc-length sampling의 `distance === totalLength` 경계: trailing zero-length segment에 귀속되지 않게 strict `<`를 사용한다](./domain/arc-length-sampling-totallength-boundary.md)
- [Bezier 곡률 zero-magnitude 판정: 절대 threshold가 작은 비퇴화 curve를 degenerate로 오분류한다](./domain/bezier-curvature-zero-magnitude-threshold.md)
- [cubic through point: symmetric `2/3` handle 계수는 `t = 0.5`에서 through 점을 통과하지 않는다](./domain/cubic-through-control-point-coefficient.md)
- [relation detail은 parameter range만으로 point/overlap을 확정하지 않는다](./domain/relation-detail-parameter-coordinate-agreement.md)
- [normalized parameter tolerance에 거리-스케일 epsilon을 직접 쓰지 않는다](./domain/normalized-param-tolerance-distance-scale.md)
- [Matrix decomposition squared-norm branch: `Math.hypot(...) > 0`으로 contract 분기를 바꾸지 않는다](./domain/matrix-decomposition-squared-norm-branch.md)
- [circumcenter guard/denominator float-전개 mismatch: guard와 `D`를 같은 전개로 묶는다](./domain/circumcenter-guard-denominator-expansion-mismatch.md)

## Workflow

- [계획서 도메인 현황 작성 시 barrel 파일 미확인: 존재하지 않는 함수 포함 및 범위 표/구현 방향 시그니처 불일치](./workflow/plan-domain-survey-barrel-check.md)
- [`_works` 다음 seq 번호 선정 시 `tail` 잘림·비수치 정렬로 기존 seq와 충돌](./workflow/works-seq-number-collision.md)
- [사후 리뷰 사이클의 신규 trap promotion이 단일 결과 진입점에 누락](./workflow/trap-promotion-cycle-result-record.md)
- [Source 주석에 API/RM 정책 ID를 남기지 않는다](./workflow/source-comment-policy-ids.md)
- [위임 함수 JSDoc에 하위 위임이 이미 배제한 경로 기술 금지: strict sub-function이 거부하는 케이스를 상위 JSDoc에 "가능한 동작"으로 기술하면 오해 유발](./workflow/jsdoc-delegation-dead-branch.md)
- [Into 함수 JSDoc aliasing 안전성 문구 파라미터명 copy-paste 오류: 단일 입력 함수의 "input과 out이 같아도 안전" 문구를 다중 입력 함수에 복사할 때 파라미터 이름 미갱신](./workflow/jsdoc-aliasing-parameter-name-mismatch.md)
- [precondition 위반 케이스를 API 문서에 정의된 동작으로 기술: caller-ordered 제약 위반 시 결과를 구현 세부 사항 기반으로 기술하면 false contract 생성](./workflow/undefined-behavior-false-contract.md)
- [context-mode 명령은 저장소 cwd를 명시한다](./workflow/context-mode-explicit-cwd.md)
- [상태 대시보드 "최근 완료 작업" 맨 앞 추가 시 직전 top 항목 헤더 덮어쓰기로 detail orphan](./workflow/project-state-recent-list-prepend-orphan.md)

## Reference Analysis

- 아직 승격된 함정 없음
