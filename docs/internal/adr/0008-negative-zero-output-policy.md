# ADR 0008: 출력 `-0` 정책

상태: 승인

## 배경

JS 산술은 `-0`을 만든다. `-x`, `-a / b`, `a % b`, `x * -1`이 입력 `0`에서 `-0`을 낸다.

`vectra`에는 `-0` 처리 방식이 둘로 나뉘어 있다.

- 정규화: 결과 `-0`을 `0`으로 canonicalize한다.
- 비정규화: JS 산술 결과를 그대로 기록한다.

전역 ADR(0003–0007)과 `docs/internal/*.md`에는 `-0` 정책이 없다. 지금은 함수마다 JSDoc이 정한다.

현황:

| 약속 | 규모 | 예 |
| --- | --- | --- |
| (a) `0`으로 canonicalize | `src` 약 195개 파일. statistics, linalg, calculus, motion, hex-grid 등 | `src/motion/acceleration.ts:9`, `src/hex-grid/hex-line-draw-into.ts:26` |
| (b) `-0` 그대로 기록 | `src` 15개 파일. polyline, vec, polygon, linalg, segment | `src/polyline/normals.ts:11`, `src/vec/snap-to-grid-into.ts:11` |

정규화 코드는 디렉터리마다 local helper로 따로 있다. 디렉터리를 넘어 공유되는 helper는 없다.

- `canonicalizeNegativeZero`: `src/statistics/order-statistics.internal.ts:88`. statistics 안에서만 쓴다.
- `canonicalizeZero`: `src/sdf/primitive.internal.ts:45`. sdf 안에서만 쓴다.

같은 입력이라도 도메인에 따라 결과가 다를 수 있다.

- `scaleVectorInto`(`src/linalg/scale-vector-into.ts:21`)는 `-0`을 `+0`으로 쓴다.
- `scaleInto`(`src/vec/scale-into.ts:13`)는 `-0`을 그대로 쓴다.
- 두 함수의 JSDoc은 `-0`에 침묵한다. 이런 불일치는 별도 이슈로 추적한다.

## 결정

leaf JSDoc의 `-0` 문장이 계약이다.

JSDoc에는 다음 두 약속 중 하나를 반드시 적는다.

| 약속 | 정의 |
| --- | --- |
| (a) 정규화 | 결과 `-0`을 `0`으로 canonicalize한다. |
| (b) 산술 결과 기록 | JS signed-zero 규칙에 따라 `-0`을 그대로 기록한다. |

규칙:

- 전역 기본값을 두지 않는다.
- 도메인 규칙을 두지 않는다.
- 함수마다 JSDoc이 정한다.
- 새 함수는 JSDoc에 (a) 또는 (b)를 적는다.
- `-0`이 새로 나올 수 있는 변경도 같다.
- 약속을 적지 않은 함수는 규칙 위반이다. 보강 대상이다.

테스트 규칙:

| 약속 | source | 테스트 |
| --- | --- | --- |
| (a) | 결과 `-0`을 `0`으로 바꾼다. | `Object.is(…, -0)`가 `false`임을 고정한다. |
| (b) | normalize하지 않는다. `+ 0` trick을 쓰지 않는다. | `Object.is(…, -0)`가 `true`임을 명시한다. |

(b)의 테스트 규칙은 [vitest toEqual은 +0과 -0을 구분한다](../agent-traps/testing/vitest-toequal-signed-zero.md)의 기존 규칙과 같다.

### 예시

(a) 정규화. `src/motion/acceleration.ts:9`.

```ts
/**
 * overflow로 결과가 non-finite면 `RangeError`. `-0` 결과는 `0`으로 반환한다.
 */
```

테스트는 `0`임을 고정한다.

```ts
expect(Object.is(result, -0)).toBe(false);
expect(result).toBe(0);
```

(b) 산술 결과 기록. `src/polyline/normals.ts:11`.

```ts
/**
 * 부호 반전 산술 `-ty`는 `ty`가 `0`일 때 JS signed-zero 규칙에 따라 `-0`을 그대로 기록한다.
 */
```

테스트는 `-0`을 명시한다.

```ts
expect(Object.is(normals[0].x, -0)).toBe(true);
```

(b) 변형. `src/vec/snap-to-grid-into.ts:11`.

- 문구: "결과 `-0`은 canonicalize하지 않는다."
- 의미는 (b)와 같다.

### 범위 밖

정규화 mechanism은 이 ADR의 범위가 아니다. 공유 helper로 통합하지 않는다.

- 이유: 출력 보존만으로는 정책이 늘지 않는다.
- 이유: local helper를 합치려면 여러 디렉터리의 파일 수십 개를 건드려야 한다.

## 기각한 대안

| 대안 | 기각 이유 |
| --- | --- |
| 도메인 규칙 | 예외가 많아 거짓 규칙이 된다. 예: linalg는 (a) 다수에 (b) 2개가 섞여 있다. |
| 전역 기본 정규화 | JSDoc 약속 약 195개 파일에 더해 polyline, vec의 (b) 약속을 뒤집는 breaking change다. |

## 결과

- `-0` 동작을 JSDoc 한 문장으로 확인할 수 있다.
- 기존 약속(a)와 (b)가 모두 계약으로 유지된다. 동작 변경이 없다.
- JSDoc에 `-0` 문장이 없는 함수는 보강 대상이다. 목록은 이 ADR에 넣지 않고 별도 이슈로 추적한다.
- 정규화 구현은 디렉터리별 local helper로 남는다.
