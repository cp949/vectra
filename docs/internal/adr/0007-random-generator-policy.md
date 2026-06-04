# ADR 0007: Random Generator 정책

상태: 승인

## 배경

`S1-RM-013` 작업에서 canvas demo의 `runtimeSeed.randomSeed` 필드가 실제 `Math.random`을
고정하는 데 사용되지 않는 friction이 발견되었다. 이 문제를 해결하려면 `vectra`가
seedable RNG factory를 공개 API로 제공해야 한다.

동시에 `S1-RM-014`에서 collection sampling(selection/permutation)과 probability distribution
함수를 추가하는 계획이 확정되었다. 이 함수들이 공통 `rng` 파라미터를 통해 seedable
generator와 연결될 수 있으려면, generator 객체 설계보다 먼저 factory function의 signature와
정책을 고정해야 한다.

기존 `random` domain은 `rng?: () => number` 주입 패턴을 사용하며, 이 패턴은 단순하고
tree-shaking 친화적이다. seedable generator를 추가할 때 이 패턴과 자연스럽게 합성되도록
설계해야 한다.

## 결정

### `createRng(seed)` — seedable RNG factory

```ts
export const createRng: (seed: number | string) => RandomSource;
```

`createRng`는 seed를 받아 `RandomSource` 함수(`() => number`)를 반환한다.

반환된 `RandomSource`는 `[0, 1)` 범위의 float를 결정론적으로 생성한다. 이미 모든
public random 함수가 `rng?: RandomSource`를 마지막 인자로 받으므로, 별도 generator
객체 없이 자연스럽게 합성된다.

### public generator object를 만들지 않는다

`vectra`의 public API는 function catalog이다. `RandomGenerator`, `SeededRng` 같은
generator 객체 모델을 public surface에 두지 않는다.

generator 객체를 만들면 state 접근, child generator 생성, iterator protocol 같은
추가 API가 요구된다. 이는 function catalog 원칙과 충돌하고 surface를 불필요하게
넓힌다.

### 전역 default RNG 설정 API를 만들지 않는다

`@cp949/vectra/random` core는 `setDefaultRng`, `configureRandom` 같은 module-level mutable state API를
제공하지 않는다. `random()`, `float()`, geometry sampling helper의 `rng` 생략 경로는 계속 내부
default entropy source를 사용한다.

결정론적 흐름이 필요한 caller는 `createRng(seed)`로 `RandomSource`를 만든 뒤, 랜덤이 필요한
함수의 마지막 인자로 명시적으로 전달한다.

### seed 정책

- `number` seed: finite number만 허용한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`를 던진다.
- `string` seed: 빈 문자열(`""`)을 포함한 모든 문자열을 유효한 seed로 허용한다.

### algorithm

dependency 없는 internal string hash + `sfc32` 계열 32-bit state generator를 사용한다.

- string seed는 내부 hash 함수로 32-bit state 초기값으로 변환한다.
- number seed는 IEEE 754 bit pattern 또는 직접 변환으로 state를 초기화한다.
- 구현 세부 사항은 internal module에 캡슐화하고 public API에 노출하지 않는다.

### sequence compatibility

같은 package version 안에서 같은 seed의 출력 sequence는 stable해야 한다. 이것은 best
effort가 아니라 observable behavior로 취급한다.

version 사이 sequence compatibility도 observable behavior로 취급한다. 단, algorithm 안정성
향상이나 정확도 개선이 필요한 경우에는 ADR/API surface/release note에 명시적으로 기록한 뒤에만
변경한다.

## 결과

### canvas demo 연결

`apps/canvas-demo/src/canvas/api.ts`의 `readonly randomSeed?: number` 필드가 현재
`Math.random`을 고정하는 데 실제로 사용되지 않는다. `S1-RM-014 TASK-05`에서
`createRng(seed)`를 사용해 이 friction을 해소한다.

canvas demo recipe에서 `runtimeSeed.randomSeed`를 `createRng(runtimeSeed.randomSeed)`로
변환해 seed 기반 결정론적 sampling을 구현할 수 있다.

### 사용 예시

```ts
import * as Randomx from "@cp949/vectra/random";

const rng = Randomx.createRng("demo-seed");
const point = { x: 0, y: 0 };
Randomx.pointInBoundsInto(point, { minX: 0, minY: 0, maxX: 100, maxY: 100 }, rng);
```

```ts
import * as Randomx from "@cp949/vectra/random";

const rng = Randomx.createRng(42);
const item = Randomx.choice(["apple", "banana", "cherry"], rng);
```

### tree-shaking

`createRng`는 `@cp949/vectra/random` domain barrel에서 제공한다. package leaf subpath는 공개하지 않는다.

## 보류

다음 항목은 function catalog 원칙 유지, scope 제한, 또는 설계 복잡도를 이유로
이번 작업 범위에서 제외한다.

### state export/import

generator state를 직렬화해 재현 가능한 snapshot을 만드는 기능은 보류한다.

보류 이유: state 구조를 public surface로 고정하면 algorithm 변경 유연성을 잃는다.
먼저 algorithm을 안정화한 뒤 필요성이 확인되면 추가한다.

### secureRandomSource / randomUint32

crypto-backed source를 public 함수로 직접 노출하는 것은 보류한다.

보류 이유: 보안 요구사항이 있는 사용자는 `globalThis.crypto.getRandomValues`를 직접
사용하는 것이 더 명확하다. `vectra`가 crypto API를 wrapping하면 보안 책임 범위가
불명확해진다.

### independent child generator 생성

seed에서 독립적인 child generator stream을 파생하는 기능(예: `splitRng`, `deriveRng`)은 보류한다.

보류 이유: 사용 사례가 현재 roadmap에서 명확하지 않다. 필요성이 확인되면 ADR로 재검토한다.

### stateful generator object

`{ next, seed, state }` 같은 generator object를 public surface에 두는 것은 보류한다.

보류 이유: function catalog 원칙과 충돌한다. `RandomSource`가 함수이므로 추가 래퍼
없이 모든 random 함수와 합성된다.

### `random-state` opt-in facade

전역 default RNG를 원하는 caller가 있을 수 있으므로, 후속 모듈 또는 별도 package로
`random-state`를 검토한다.

보류 이유: `random-state`는 `setDefaultRng`, `getDefaultRng`, `resetDefaultRng`와 core random
helper wrapper를 함께 제공해야 효과가 있다. 이는 core `@cp949/vectra/random` 안정화 이후 별도
surface로 설계하는 편이 낫다. core package는 `random-state`에 의존하지 않으며, caller는 import
path로 stateless core와 stateful facade 중 하나를 명시적으로 선택한다.
