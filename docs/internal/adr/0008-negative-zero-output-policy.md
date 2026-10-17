# ADR 0008: 출력 `-0` 정책

상태: 승인

2026-10-17 개정: 침묵한 함수는 (b)로 본다.

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
| JSDoc 침묵 | linalg, matrix, vec의 `-0`을 낼 수 있는 파일 중 약 232개. 218개가 raw, 14개가 정규화였다 | `src/vec/scale-into.ts:13` |

- (a)와 (b) 행은 개정 전 기준이다. 침묵 행은 linalg, matrix, vec만 조사했다.
- 침묵+정규화 14개는 이번 개정에서 JSDoc에 (a)를 명시했다.
- 다른 도메인의 침묵+정규화 함수는 조사하지 않았다.

정규화 코드는 디렉터리마다 local helper로 따로 있다. 디렉터리를 넘어 공유되는 helper는 없다.

- `canonicalizeNegativeZero`: `src/statistics/order-statistics.internal.ts:88`. statistics 안에서만 쓴다.
- `canonicalizeZero`: `src/sdf/primitive.internal.ts:45`. sdf 안에서만 쓴다.

같은 입력이라도 도메인에 따라 결과가 다를 수 있다.

- `scaleVectorInto`(`src/linalg/scale-vector-into.ts:22`)는 `-0`을 `+0`으로 쓴다. JSDoc이 (a)를 명시한다.
- `scaleInto`(`src/vec/scale-into.ts:13`)는 `-0`을 그대로 쓴다. JSDoc이 침묵하므로 (b)다.
- 도메인 간 차이는 JSDoc 계약 안에서 허용한다.

## 결정

leaf JSDoc의 `-0` 문장이 계약이다. `-0`에 침묵한 JSDoc은 (b)로 본다.

`-0`에 대한 약속은 다음 둘 중 하나다.

| 약속 | 정의 |
| --- | --- |
| (a) 정규화 | 결과 `-0`을 `0`으로 canonicalize한다. |
| (b) 산술 결과 기록 | JS signed-zero 규칙에 따라 `-0`을 그대로 기록한다. |

규칙:

- 침묵한 함수의 기본값은 (b)다. 도메인 규칙은 두지 않는다.
- (a)는 JSDoc에 반드시 적는다. (b)는 적지 않아도 된다.
- 함수마다 JSDoc이 정한다.
- JSDoc이 (a)를 약속하면 코드가 지켜야 한다. 어긋나면 계약 위반이다.
- 새 함수가 `-0`을 정규화하면 JSDoc에 (a)를 적는다.
- 정규화를 더하거나 빼는 변경은 JSDoc의 (a)도 함께 바꾼다.

테스트 규칙:

| 약속 | source | 테스트 |
| --- | --- | --- |
| (a) | 결과 `-0`을 `0`으로 바꾼다. | `Object.is(…, -0)`가 `false`임을 고정한다. 필수다. |
| (b) 명시 | normalize하지 않는다. `+ 0` trick을 쓰지 않는다. | `Object.is(…, -0)`가 `true`임을 고정한다. |
| (b) 침묵 | normalize하지 않는다. `+ 0` trick을 쓰지 않는다. | pin을 요구하지 않는다. |

명시한 (b)의 테스트 규칙은 [vitest toEqual은 +0과 -0을 구분한다](../agent-traps/testing/vitest-toequal-signed-zero.md)의 기존 규칙과 같다.

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
| 침묵은 위반(모든 함수에 문장 추가) | (a)만 명시해도 계약을 알 수 있어 침묵 raw 218개를 포함한 약 232개 파일을 건드릴 필요가 없다. |

## 결과

- (a)는 JSDoc 한 문장으로 확인한다. 문장이 없으면 (b)다.
- 기존 약속 (a)와 (b)가 모두 계약으로 유지된다. 침묵한 함수의 동작은 바뀌지 않는다.
- JSDoc에 `-0` 문장이 없는 함수는 보강 대상이 아니다. 정규화하는 함수만 (a)를 명시한다.
- JSDoc 약속을 어기던 `rowEchelonForm`과 `rowEchelonFormInto`는 코드를 고쳤다. `-0` 입력에서만 출력이 `0`으로 바뀐다.
- 정규화 구현은 디렉터리별 local helper로 남는다.
