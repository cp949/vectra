# vectra 아키텍처

이 문서는 `@cp949/vectra`의 계층 구조와 함수 호출 경로를 정의한다.
`api-design.md`가 "public API를 어떤 규칙으로 만드는가"를, `project-structure.md`가
"파일이 어디에 있는가"를 다룬다면, 이 문서는 "왜 이렇게 계층화됐고 호출이 어떻게
흐르는가"를 다룬다.

## 시스템 개요

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                  Consumers (apps/*, sub/playground)                       │
│  import { ... } from '@cp949/vectra' 또는 '@cp949/vectra/<domain>'         │
└──────────────────────────────────┬────────────────────────────────────────┘
                                    │ (subpath exports, tree-shakeable)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                Public API surface — sub/vectra/src                        │
│  root barrel  src/index.ts          (type 전용 re-export)                 │
│  domain barrel src/<domain>/index.ts (named function re-export)           │
│  leaf module  src/<domain>/<kebab>.ts (public 함수 1개/파일)              │
└──────────────────────────────────┬────────────────────────────────────────┘
                                    │ (depends on)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              Internal shared layer (non-public)                           │
│  src/internal/*.ts        — structural read/write 헬퍼 (readX, ...)       │
│  src/types/*.internal.ts  — structural 타입 (Like/Writable)               │
│  src/<domain>/*.internal.ts — 도메인 비공개 hot-path 헬퍼                 │
└───────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│   Build + Governance (런타임 없음; CI-time 계약)                          │
│  build-entrypoints.ts + tsup.config.ts → per-leaf dist entrypoint         │
│  scripts/*.mjs → governance / import-boundary / jsdoc-companion           │
│  tests/contract/* → public surface drift, subpath, dist import 검증       │
└───────────────────────────────────────────────────────────────────────────┘
```

## 전체 패턴

flat function catalog (도메인별 namespace) + dual-API (allocating / `*Into` mutating) +
structural typing.

- 클래스/인스턴스 없음. 모든 public API는 순수 함수다. `sideEffects: false`.
- 도메인(`vec`, `segment`, `rect`, `circle`, ...)별 폴더 1개. 각 도메인은 subpath
  export(`@cp949/vectra/vec`)로 독립 import 가능하다.
- public 함수 1개 = 파일 1개. 파일명 kebab-case, export camelCase.
- 입력은 structural(`XYLike = {x,y} | [x,y]`). renderer/DOM/scene graph/editor state를
  소유하지 않는다.
- object 결과 연산은 allocating companion(`bounds`)과 mutating variant(`boundsInto(out, ...)`)를
  쌍으로 제공한다.

## 계층

**Public API (leaf module):**
- 목적: 외부에 노출되는 순수 geometry/math 함수
- 위치: `src/<domain>/<name>.ts`
- 구성: 단일 export 함수 + 한국어 JSDoc
- 의존: `src/internal/*`, `src/types`, 같은 도메인 `*.internal.ts`

**Domain barrel:**
- 목적: 도메인 leaf를 한 진입점으로 모음
- 위치: `src/<domain>/index.ts`
- 구성: `export { name } from './name'` 라인만 (jsdoc-companion script가 이 패턴을 파싱)
- 사용처: tsup entrypoint, subpath export, contract test

**Internal shared layer:**
- 목적: structural input 좌표 read/write, hot-path 공유 로직
- 위치: `src/internal/*.ts`, `src/<domain>/*.internal.ts`
- 구성: `readX`/`readY`/`writeXY`/`readSegmentA` 등, 도메인 내부 헬퍼
- **public으로 노출되지 않는다.** `.internal.` 또는 `src/internal/`은 entrypoint 제외 규칙.

**Type contract layer:**
- 목적: structural shape 타입 정의
- 위치: `src/types/*.internal.ts`, 집약 barrel `src/types/index.ts`
- 구성: `SegmentLike`/`SegmentWritable`/`SegmentTuple` 등 (`xy.internal.ts` 기반 합성)

## 데이터 흐름

### 함수 호출 경로

1. consumer가 `import { length } from '@cp949/vectra/segment'`
2. subpath export가 `dist/segment/index.js`로 해석 (`sub/vectra/package.json` exports)
3. barrel이 leaf 함수 re-export (`src/segment/index.ts`)
4. leaf 함수가 internal helper로 좌표 read (`readSegmentB`/`readX`)
5. 순수 계산 결과 number/object 반환

### Allocating vs Into 경로

1. allocating companion 호출 → 새 object 할당 후 반환 (`src/segment/bounds.ts`)
2. `*Into` variant 호출 → 호출자가 제공한 `out`에 `writeXY`로 기록 후 동일 `out` 반환
   (`src/segment/bounds-into.ts`)
3. companion은 내부에서 `*Into`에 위임한다. governance가 위임 관계를 추적한다
   (`scripts/check-public-import-boundary.mjs`의 `companionDelegationAliases`).

**상태 관리:** 라이브러리 런타임 상태 없음. 유일한 명시적 상태 API는 `random-state`
(seedable RNG state object)이며 state는 호출자가 소유한다.

## 핵심 추상

**Structural input (`*Like`):**
- object와 tuple을 모두 받는 입력 계약. `type SegmentLike = SegmentObjectLike | SegmentTuple`.
  `readX`/`readSegmentA`로 분기 흡수.

**Writable output (`*Writable`):**
- `*Into` 함수의 out 인자 계약. generic으로 storage shape 보존. `writeXY(out, x, y)`가
  tuple/object 분기 후 동일 `out` 반환.

**Domain namespace:**
- 함수를 도메인별로 격리, subpath import 가능. 폴더 = 도메인 = subpath export.

## 진입점

| 진입점 | 위치 | trigger | 책임 |
| --- | --- | --- | --- |
| npm root export | `dist/index.js` ← `src/index.ts` | `import ... from '@cp949/vectra'` | type 전용 re-export (런타임 값 미노출) |
| domain subpath | `dist/<domain>/index.js` ← `src/<domain>/index.ts` | `import ... from '@cp949/vectra/<domain>'` | 도메인 함수 노출 (tree-shaking 친화) |
| build entrypoint 생성 | `sub/vectra/build-entrypoints.ts` | `tsup` build | `src` 재귀 스캔으로 public leaf/barrel을 per-file dist entry로 변환 |

`build-entrypoints.ts`의 `isPublicSourceFile`이 `.internal.`, `src/internal/`,
depth 4+ 파일을 entrypoint에서 제외한다.

## 아키텍처 제약

- **Threading:** 단일 스레드 순수 함수. worker/async 없음.
- **Global state:** module-level 가변 singleton 없음. `random-state`는 state object를
  호출자가 보유.
- **Public depth:** public source 파일은 `src/index.ts`(depth 2) 또는
  `src/<domain>/<file>.ts`(depth 3)만 허용. depth 4+ 또는 nested 폴더는 entrypoint에서 제외.
- **Internal 경계:** public leaf는 다른 도메인 public leaf를 직접 import하지 않는다. 공유
  로직은 `src/internal/` 또는 `*.internal.`을 통한다.
  `scripts/check-public-import-boundary.mjs`가 baseline JSON으로 강제.
- **Type-only root:** `src/index.ts`는 값 export를 피하고 type re-export만 한다
  (`VECTRA_PACKAGE_NAME` 메타 1건 예외).

## Anti-Pattern

### public leaf 간 cross-domain import

- **무엇:** `src/segment/foo.ts`가 `src/vec/distanceSq.ts`를 직접 import.
- **왜 잘못:** subpath tree-shaking과 import 경계 baseline을 깨고, hot path에 barrel 의존을 끌어온다.
- **대신:** 공유 좌표 로직은 `src/internal/xy.ts`의 `distanceSqXY` 등 internal helper를 쓴다.

### barrel 우회 또는 누락 export

- **무엇:** leaf 파일을 추가하고 도메인 `index.ts`에 re-export를 빠뜨림 / `.internal.` 파일을 barrel에 노출.
- **왜 잘못:** generated catalog와 source barrel이 drift → `tests/contract/source-surface-drift.test.ts`
  및 도메인 subpath 계약 실패.
- **대신:** public leaf 추가 시 `src/<domain>/index.ts`에 정렬된 위치로 named export 추가,
  internal helper는 `.internal.` 접미사로 비공개 유지.

### `*Into` 없는 allocating-only 또는 companion 없는 into-only

- **무엇:** allocating companion만 추가하고 `*Into` 누락 (또는 반대).
- **왜 잘못:** governance(`scripts/report-api-governance.mjs`)가 companion/into 쌍 규칙을 강제.
  into-only 허용은 `knownIntoOnlyLeafs`에 명시적 등록이 필요하다.
- **대신:** 새 연산은 allocating + `*Into` 쌍으로 추가하고 companion이 `*Into`에 위임한다.

## Error Handling

예외 throw 최소화. non-finite 입력은 IEEE 754 전파 규칙을 따른다(throw 대신 NaN/Infinity 전파).
결과 없음은 `null`/빈 결과/sentinel로 표현한다. 상세 규칙은 [정밀도 정책](./precision.md)과
[Degenerate와 Numeric Policy](../guides/degen-and-numeric-policy.md) 참고.

- degenerate geometry(zero-length segment, near-collinear triangle)는 명시적 guard로 수렴 결과 반환.
- circumcenter류는 guard와 denominator를 동일 float 전개로 묶어 near-collinear 모순
  (Infinity-with-success)을 방지한다.

## 관련 문서

- [API 설계](./api-design.md) — public API 규칙(API-001~014), `Into`, import boundary
- [프로젝트 구조](./project-structure.md) — 저장소/디렉터리 레이아웃
- [정밀도 정책](./precision.md) — epsilon, non-finite, degenerate, topology predicate
- [테스트 작성 지침](./testing-guidelines.md) / [테스트 메커니즘](./testing-mechanics.md)
</content>
</invoke>
