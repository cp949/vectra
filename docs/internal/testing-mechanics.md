# 테스트 메커니즘

이 문서는 `vectra` 테스트의 **기계적 작성 방법**을 정의한다. 무엇을 테스트할지(회귀 신호
품질)는 [테스트 작성 지침](./testing-guidelines.md)을 본다. 이 문서는 runner, 파일 조직,
표준 검증 시나리오, 반복 함정을 다룬다.

## 프레임워크

- **Runner:** `vitest` v4. config는 `sub/vectra/vitest.config.ts`. `environment: 'node'`.
- `globals: true`이지만 실제 테스트는 `import { describe, expect, test } from 'vitest'`를
  명시적으로 import한다.
- **Assertion:** vitest built-in `expect`. 타입 레벨은 `expectTypeOf`
  (`expectTypeOf(result).toEqualTypeOf<[number, number]>()`).

## 실행 명령

```bash
pnpm test                                  # 전체 (turbo run test)
pnpm --filter @cp949/vectra test           # vectra package 전체
pnpm --filter @cp949/vectra test tests/unit/vec/arithmetic.test.ts   # 단일 파일 (package root 기준 경로)
pnpm --filter @cp949/vectra test:coverage  # v8 coverage
pnpm test:contract                         # build 후 dist 계약 테스트
pnpm --filter @cp949/vectra surface:check  # source-surface drift 검사
pnpm verify:vectra                         # typecheck + lint + test
```

**함정 — 이중 `--` 금지** (`agent-traps/testing/pnpm-vitest-file-filter.md`): focused 실행 시
`pnpm --filter <pkg> test -- <path>`처럼 두 번째 `--`를 넣지 않는다. 전체 suite가 반복 실행돼
검증 결과를 잘못 기록한다. 경로를 script 뒤에 바로 붙인다.

## 파일 조직

테스트는 source와 분리된 `sub/vectra/tests/` 아래에 둔다. `src/` 안에는 테스트 파일이 0개다.
vitest `include: ['tests/**/*.test.ts']`.

```
sub/vectra/tests/
├── unit/            # 도메인별 단위 테스트 (대부분)
├── curve/           # curve domain 집중 테스트
├── recipes/         # 조합 사용 시나리오
└── contract/        # public surface / subpath export 계약
    ├── _fixtures/   # <domain>-leaf-exports.ts (도메인별 leaf export 목록)
    └── _helpers/    # domain-subpath-contract.ts, source-surface.ts
```

**파일 명명:** kebab-case + `.test.ts`. source 파일과 1:1이 아니라 **주제별로 묶는다**
(`arithmetic.test.ts`가 add/sub/scale companion을 함께). 공유 helper는 `_` prefix 또는
`-test-utils.ts`/`-test-helpers.ts` suffix로 명명해 runner 수집에서 제외한다.

## 파일 overview 주석 (필수)

모든 테스트 파일은 imports 위에 `/** ... */` overview 블록을 둔다
(`agent-traps/testing/test-file-overview-comment.md`).

```ts
/**
 * cornerBisector helper 단위 테스트.
 *
 * 대상 함수:
 *  - cornerBisectorInto : corner vertex b의 내각 이등분 단위 벡터를 out에 기록 (boolean-primary)
 *  - cornerBisector     : allocating companion, 실패 시 undefined
 */
```

첫 줄은 `<domain>.<fnName> — 한 줄 요약`. 둘째 단락은 `검증:` 또는 `대상 함수:`로 핵심
시나리오를 열거한다. 기존 파일 수정 시 overview가 없으면 같은 커밋에서 추가한다.

## Suite 구조

```ts
import { describe, expect, expectTypeOf, test } from 'vitest';
import type { XYWritable } from '../../../src/types';
import { add } from '../../../src/vec/add';
import { addInto } from '../../../src/vec/add-into';

describe('vec arithmetic - addInto', () => {
  test('object 입력과 tuple 입력을 더해 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = addInto(out, { x: 1, y: 2 }, [3, 4]);
    expect(result).toBe(out);          // 같은 reference 반환 검증
    expect(out).toEqual({ x: 4, y: 6 });
  });
});
```

- `describe('<domain> <group> - <fn>')` 그룹핑.
- test 제목은 **한국어** 행위 서술: "caller가 제공한 out 객체를 재사용하고 같은 객체를 반환한다".
- import는 barrel이 아니라 **leaf 파일을 source 상대 경로로** 직접 가져온다 (`../../../src/vec/add`).
- 각 test 의도를 1줄 주석으로 설명.

## `*Into` 표준 검증 시나리오

object 결과 `*Into` 함수는 다음 7개를 표준으로 검증한다.

1. object 입력 / tuple 입력 / 혼합 입력 처리.
2. `expect(result).toBe(out)` — 같은 reference 반환.
3. mutable tuple out에 기록 후 tuple reference 보존
   (`expectTypeOf(result).toEqualTypeOf<[number, number]>()`).
4. 외부 class instance out 반환 타입 보존 + method chaining (ADR 0006).
5. aliasing: `input === out` 안전성.
6. degenerate / sentinel (실패 시 `false` / companion `undefined`).
7. non-finite pass-through (NaN, Infinity, -Infinity).

## Mocking

거의 쓰지 않는다. pure geometry/math라 외부 의존성이 없다. random helper는 mock 대신
deterministic `RandomSource` 주입으로 검증한다: `rng?: RandomSource`에
`sequence([0.5, 0.2, 0.8])` 같은 고정 시퀀스를 넣는다. 좌표 read/write·수학 연산은 실제 값으로
검증한다.

## Fixtures

- contract leaf export 목록: `tests/contract/_fixtures/<domain>-leaf-exports.ts`.
- 공유 helper: `tests/contract/_helpers/domain-subpath-contract.ts`, `source-surface.ts`.
- 테스트 내부 inline fixture가 기본. 좌표는 의도가 드러나는 구체값 (`{ x: 1, y: 2 }`, `[3, 4]`).

## Coverage

provider `v8`. reporter `text`/`json`/`html`. **명시적 threshold는 vitest config에 없다.**
대신 example coverage를 governance script로 강제한다: `pnpm examples:coverage:strict`,
`pnpm examples:coverage:test`.

## 계약 테스트와 함정

- `<domain>-subpaths.test.ts`: source barrel과 leaf export 목록을 대조
  (`assertFunctionDomainSubpathExports`).
- `package-imports.test.ts`: **built dist**(`dist/<domain>/index.js`)를 dynamic import로 검증
  → `pnpm build` 선행 필요. 그래서 `test:contract`로 분리(`pnpm build && vitest run tests/contract`)되고
  turbo가 build 의존을 보장한다.
- `source-surface-drift.test.ts`: source surface와 catalog 문서/baseline drift 검사.

**dist dynamic import 함정** (`agent-traps/testing/built-dist-contract-test.md`): dist import는
literal string이 아니라 변수/template literal + `/* @vite-ignore */`로 작성한다. literal이면
`dist`가 tsconfig exclude/gitignore라 clean state에서 `TS2307` typecheck 실패.

## Numeric 테스트 함정

| 함정 | 요지 | trap 문서 |
| --- | --- | --- |
| signed-zero | `toEqual`은 `Object.is`로 `+0`/`-0` 구분. `-0` 결과 builder는 `toEqual({x:0})` 실패 | `vitest-toequal-signed-zero.md` |
| float64 ULP | `Number.EPSILON`을 절대 차이로 쓰지 않는다 (`2 + Number.EPSILON === 2`). 구간 ULP를 곱한다 | `float64-ulp.md` |
| non-finite pass-through | NaN뿐 아니라 `Infinity`/`-Infinity`, degenerate, read/write 양방향, parameter 위치별 모두 검증 | `non-finite-pass-through-coverage.md` |
| fuzz thin band | broad random fuzz와 epsilon-thin band stratified fuzz를 분리한다 | `fuzz-epsilon-thin-band.md` |
| arc-length sampling | spaced≠uniform 검증은 대칭 곡선이면 `~1e-8`로 실패. 비대칭 곡선을 쓴다 | `arc-length-spaced-sampling-symmetric-curve.md` |
| random rng boundary | `rng?: RandomSource`는 중간값뿐 아니라 `rng=0` 경계도 검증 (`Math.log(0)`, `Math.floor(0*n)` 분기) | `random-rng-boundary-coverage.md` |

## 에러 / 근사 비교

```ts
expect(() => Trianglex.isDegenerate(triangle, -1)).toThrow(RangeError);  // 잘못된 option
expect(out.x).toBeCloseTo(Math.SQRT1_2);                                 // float 결과
expect(Math.hypot(out.x, out.y)).toBeCloseTo(1);                         // 단위 벡터
```

비동기 테스트는 contract dist dynamic import(`await import(...)`)에만 등장한다. geometry 함수는
모두 동기다.

## 관련 문서

- [테스트 작성 지침](./testing-guidelines.md) — 무엇을 테스트할지, 회귀 신호 품질
- [Agent 함정 / testing](./agent-traps/) — 개별 numeric/contract 회귀 사례
- [주석 작성 규칙](./comment-style.md) — 테스트 주석과 overview 블록
</content>
