# 예제 작업 진입점

새 에이전트나 개발자가 `vectra` 예제를 추가하거나 정리할 때 이 문서를 먼저 읽는다.
반복 실행용 프롬프트는 [예제 추가 실행 프롬프트](./add-example-prompt.md)에 보관한다.

## 빠른 결론

예제를 추가할 때는 먼저 산출물 위치를 고른다.

| 목적 | 위치 | 기준 |
| --- | --- | --- |
| 정적 계산 결과 시각화 | `apps/canvas-demo/src/examples/<example-id>/` | 한 장면을 그리면 충분함 |
| interaction / animation / scene state | `apps/pixi-demo/src/examples/<example-id>/` | pointer, drag, ticker, scene state가 필요함 |
| 짧은 설명과 코드 조각 | `docs/internal/examples/` 또는 package README | 실행 demo보다 문서 recipe가 적합함 |

`<example-id>`는 `PlaygroundExample.id`와 URL slug가 모두 같은 값이다. 형식은
`^[a-z0-9]+(?:-[a-z0-9]+)*$`다.

예제 추가 계획서는 기본적으로 `S1-RM-013` 아래에 둔다. 예제가 특정 domain API를 보여주더라도
roadmap 연결은 API 구현 item보다 `S1-RM-013: MVP usability recipes and examples`를 우선한다.

```txt
_works/S1-RM-013/<yyyyMMdd>-<seq>-<example-id>-example/01-계획.md
```

## 새 예제 추가 체크리스트

예제 복잡도 gate:

1. 화면 목적을 한 문장으로 쓴다.
2. 그 문장이 `A, B, C를 함께 비교한다` 형태이면 예제를 쪼갠다.
3. 사용자가 조작하는 주 대상은 1개만 둔다. 보조 handle은 그 대상의 조작을 설명할 때만 허용한다.
4. 화면의 핵심 geometry 관계는 1개만 둔다. `fit + crop + rotate + safe area`처럼 관계가 여러 개면 실패다.
5. diagnostics label은 핵심 관계를 설명하는 값 3개 이하로 제한한다.
6. 중심 API는 상단 주석 기준 5개 이하로 시작한다. 6개 이상 필요하면 문서 recipe나 별도 예제로 나눈다.

위 gate를 통과하지 못하면 구현하지 않는다. coverage gap은 예제 분할 이유가 될 수 있지만, 복잡한
실행 예제를 합리화하는 이유가 될 수 없다.

Canvas 예제:

1. `apps/canvas-demo/src/examples/<example-id>/index.ts`를 추가한다.
2. `apps/canvas-demo/src/examples/<example-id>/source.exam.ts`를 추가한다.
3. `apps/canvas-demo/src/examples/catalog.ts`에 import와 `EXAMPLES` 항목을 추가한다.
4. `apps/canvas-demo/src/examples/example-sources.test.ts`에 raw source 검증을 추가한다.
5. 필요하면 `docs/internal/examples/recommended.md`의 후보를 `Done`으로 옮기고 연결을 기록한다.

Pixi 예제:

1. `apps/pixi-demo/src/examples/<example-id>/index.ts`를 추가한다.
2. `apps/pixi-demo/src/examples/<example-id>/source.exam.ts`를 추가한다.
3. `apps/pixi-demo/src/examples/catalog.ts`에 import와 `EXAMPLES` 항목을 추가한다.
4. `apps/pixi-demo/src/examples/example-sources.test.ts`에 raw source 검증을 추가한다.
5. 새 `@cp949/vectra/<domain>` namespace import가 있으면 `apps/pixi-demo/src/sandbox/pixi-module-specifiers.ts`의
   allowlist와 runtime module specifier를 함께 갱신한다.
6. 필요하면 `docs/internal/examples/recommended.md`의 후보를 `Done`으로 옮기고 연결을 기록한다.

예제 파일 역할:

| 파일 | 역할 |
| --- | --- |
| `index.ts` | `PlaygroundExample` metadata, category, `runtimeSeed` 등록 |
| `source.exam.ts` | playground에서 raw code로 보여주고 실행하는 예제 본문 |
| `catalog.ts` | app 내부 정적 예제 registry |
| `example-sources.test.ts` | catalog ID 중복과 raw source 연결 검증 |

## 예제 코드 상단 주석

`source.exam.ts`는 파일 상단에 예제 의도를 설명하는 `/** ... */` 주석을 둔다.

상단 주석에는 다음을 적는다.

- 예제 제목
- 사용자가 화면에서 보게 되는 동작
- 예제의 중심 `vectra` API와 각 API가 맡는 역할

형식:

```ts
/**
 * Example Title
 *
 * 화면에서 관찰할 수 있는 작업 흐름을 한두 문장으로 설명한다.
 *
 * - Domain.function: 예제 안에서 맡는 계산 역할
 * - OtherDomain.otherFunction: 예제 안에서 맡는 계산 역할
 */
```

규칙:

- 예제 코드에 한정한다. library source의 public API 주석은
  [주석 작성 규칙](../comment-style.md)을 따른다.
- 함수 전체 목록이나 coverage 목록을 나열하지 않는다. 예제 이해에 필요한 중심 API만 적는다.
- 구현 한 줄을 반복하지 않는다. 화면 동작과 geometry 계산 흐름을 연결한다.
- renderer, scene graph, editor state를 `vectra` 책임처럼 설명하지 않는다.

구현 후 검증:

```sh
pnpm --filter @repo/canvas-demo test
pnpm --filter @repo/canvas-demo build
pnpm --filter @repo/pixi-demo test
pnpm --filter @repo/pixi-demo build
pnpm examples:coverage:write
pnpm examples:coverage:test
pnpm verify
```

작업한 app만 빠른 검증을 먼저 실행하고, 완료 전에는 `pnpm verify`를 실행한다.

## 예제 import 정책

예제 source의 기본 import는 domain barrel namespace import다. Canonical 정책은 public
package export surface와 domain barrel import boundary를 따른다.

```ts
import * as Anglex from '@cp949/vectra/angle';
import * as Vectorx from '@cp949/vectra/vec';

Anglex.fromVector(velocity);
Vectorx.addScaledInto(position, position, velocity, dt);
```

- alias는 caller local 변수명과 충돌하기 쉬운 복수형을 피하고, domain 의미를 드러내는
  PascalCase 단수 의미 + `x` 접미사(`Anglex`, `Vectorx`, `Segmentx`, `Circlex`,
  `Randomx`)를 사용한다. 하이픈 domain은 하이픈을 제거한 PascalCase 뒤에 `x`를 붙인다
  (`InfiniteLinex`).
- 예제에서 새 domain namespace import를 쓰면 sandbox allowlist에도 같은 `@cp949/vectra/<domain>`을
  추가한다.
- leaf package subpath import는 쓰지 않는다. 공식 import 경로는 root/domain barrel이다.
- sandbox allowlist 오류 때문에 leaf import로 우회하지 않는다. allowlist를 domain barrel에 맞춘다.

## 예제 API 형식 선택 (`*Into` vs allocating companion)

예제에서 출력 object를 한 번만 쓰고 buffer를 재사용하지 않으면 allocating companion을
선호한다. allocating companion이 있는데도 `*Into`를 쓰면 불필요한 out-object scaffold가
생겨 예제가 복잡해지고, 사용자에게 API가 쓰기 불편하다는 인상을 준다.

```ts
// 권장: 결과를 한 번만 쓰는 경우
const b = Paths.bounds(commands);

// 비권장: out-object scaffold가 예제 흐름을 가린다
const b = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
Paths.boundsInto(b, commands);
```

`*Into`를 쓰는 경우는 다음으로 제한한다.

- 동일 buffer를 loop 안에서 반복 기록하는 hot path (예: 등거리 샘플링에서 marker point 1개를
  재사용).
- output buffer 소유와 재사용 흐름 자체가 예제 주제일 때.
- allocating companion이 없는 함수 (예: `svg-path/parsePathDataInto`).

규칙:

- allocating companion 유무는 domain barrel에서 확인한다 (`bounds`/`boundsInto` 쌍 등).
- companion이 없으면 `*Into`를 그대로 쓴다. companion을 만들려고 public API를 늘리지 않는다.
- companion이 없어 `*Into`를 유지한 단발성 object 결과는 루트 `TODO.md`에 companion 후보로 기록한다.
- `*Into` 시연을 위해 buffer 재사용이 필요 없는 곳에 억지 loop를 넣지 않는다.

## 읽는 순서

1. [예제 운영 전략](./strategy.md)
   - 예제를 왜 추가하는지, 무엇을 피해야 하는지 확인한다.
   - 제품 비범위 제외 규칙을 확인한다.
   - 커버리지가 에러가 아니라 backlog 신호라는 점을 확인한다.
2. [참고 프로젝트 예제 방향](./reference-seeds.md)
   - 어떤 reference project를 먼저 볼지 확인한다.
   - reference project를 port하지 않고 핵심 작업 흐름만 가져온다는 원칙을 확인한다.
3. [추천 예제 후보](./recommended.md)
   - 이미 구체화된 예제 후보와 구현된 연결을 확인한다.
4. [예제 Wishlist](./wishlist.md)
   - 사용자가 예제가 필요하다고 남긴 source file path inbox를 확인한다.

필요하면 함께 읽는다.

- 과거 프로젝트 상태 문서: 현재 작업 queue와 제품 비범위 상태를 추적하던 내부 문서. 현재 이 문서 트리에는 없다.
- [제품 범위](../product-scope.md): 구현하지 않는 geometry 범위의 canonical source
- API surface 운영 정보: public leaf module과 domain map. 현재 별도 문서 파일은 없다.
- Reference learning 운영 정보: 로컬 reference project 위치. 현재 별도 문서 파일은 없다.

## 핵심 규칙

- 예제는 실제 프로젝트에서 쓰일 수 있는 geometry 작업 흐름을 보여준다.
- 커버리지를 위해 의미 없는 함수 호출을 추가하지 않는다.
- coverage 대상은 public leaf module이다.
- coverage 누락은 에러가 아니다.
- `apps/canvas-demo`는 정적 예제에 사용한다.
- `apps/pixi-demo`는 interaction, animation, scene state가 필요한 예제에 사용한다.
- 제품 비범위 API나 작업 흐름은 예제에서 제외한다.
- reference project는 예제 씨앗이다. 그대로 port하지 않는다.

## Example ID

`PlaygroundExample.id`가 canonical example ID다.

- ID는 URL slug와 동일하다.
- ID는 app 안에서 unique하다.
- ID 형식은 `^[a-z0-9]+(?:-[a-z0-9]+)*$`다.
- 문서에서는 app 이름과 ID를 함께 쓴다.

예:

- `canvas-demo:segment-snap`
- `pixi-demo:orbit-segment`

`연결` 필드는 app+ID를 먼저 쓰고, 필요하면 source path를 괄호에 둔다.

```md
- 연결: `canvas-demo:segment-snap` (`apps/canvas-demo/src/examples/segment-snap`)
```

## 커버리지 체크

예제 커버리지는 상태 확인용이다. 누락은 에러가 아니다.

현재 상태를 stdout으로 출력한다.

```sh
pnpm examples:coverage
```

[coverage.md](./coverage.md)를 갱신한다.

```sh
pnpm examples:coverage:write
```

스크립트 자체를 검증한다.

```sh
pnpm examples:coverage:test
```

엄격 모드는 uncovered public leaf가 있으면 실패한다. 기본 운영에서는 사용하지 않는다.

```sh
pnpm examples:coverage:strict
```

예외는 [coverage-exceptions.json](./coverage-exceptions.json)에 기록한다.

## 작업 시작 절차

1. 예제 후보가 이미 있으면 [recommended.md](./recommended.md)에서 상태를 확인한다.
2. 사용자가 파일 path를 남겼으면 [wishlist.md](./wishlist.md)의 `Needed` 항목을 분석한다.
3. 새 후보를 고를 때는 [reference-seeds.md](./reference-seeds.md)의 우선순위를 따른다.
4. 후보가 제품 비범위 성격이면 추가하지 않는다.
5. 산출물을 선택한다.
   - 정적 한 장면: `apps/canvas-demo`
   - drag, hover, animation, editor-like state: `apps/pixi-demo`
   - 짧은 설명과 코드 조각: 문서 recipe
6. 계획서를 작성한다면 `_works/S1-RM-013/<yyyyMMdd>-<seq>-<example-id>-example/01-계획.md`에 둔다.
7. Canvas/Pixi sandbox 예제에서 새 domain namespace import를 쓰면
   [sandbox allowlist와 module map 분리 갱신](../agent-traps/testing/sandbox-allowlist-module-map.md)을
   계획서의 `확인할 함정`에 연결한다.
8. 구현 후 사용된 public leaf와 연결을 `recommended.md` 또는 후속 coverage 문서에 기록한다.

## 새 후보 기록 형식

`recommended.md`에 구체 후보를 추가할 때 아래 형식을 사용한다.

```md
- reference: `paper.js`
- 작업 흐름: Bezier control point inspector
- 권장 산출물: `pixi-demo`
- 관련 domain: `curve`, `bounds`, `vec`
- 대표 함수: `curve/quadraticPointAtInto`, `curve/quadraticTangentAtInto`
- 제품 비범위 포함 여부: 없음
- 설명: draggable control point에서 point/tangent/normal/bounds를 보여준다.
```

대표 함수는 전체 coverage 목록이 아니다. 예제의 중심 API만 적는다.

## 금지

- 제품 비범위 예제 추가
- coverage-only 함수 호출 추가
- return value만 화면에 찍는 단순 호출 예제
- reference project의 renderer, scene graph, editor state를 `vectra` 책임처럼 옮기는 구현
- 원본 예제의 substantial copy
