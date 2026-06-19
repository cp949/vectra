# 테스트 작성 지침

이 문서는 `vectra` 테스트가 커버리지 숫자보다 회귀 신호 품질을 우선하도록 하는 내부 기준이다.
테스트는 "코드가 실행됐다"를 증명하는 장치가 아니다.
깨졌을 때 실제 public contract, 도메인 정책, 경계 조건의 회귀를 빠르게 알려야 한다.

## 핵심 원칙

좋은 테스트:

- public API의 관찰 가능한 동작을 검증한다.
- geometry, math, random, interpolation, SDF 같은 도메인 계약을 검증한다.
- degenerate, non-finite, epsilon, aliasing, mutation 정책을 검증한다.
- `Into` 함수의 out 재사용, clear, alias-safety 계약을 검증한다.
- package surface, import boundary, build entry 같은 명시적 계약을 검증한다.
- 과거 버그나 깨지기 쉬운 경계 조건을 고정한다.

나쁜 테스트:

- 함수나 barrel export가 존재한다는 사실만 검증한다.
- 같은 계약을 여러 테스트 파일에서 반복한다.
- 내부 helper 이름, 내부 호출 순서, source 문자열, 구현 표현을 고정한다.
- 결과 동작과 무관한 object prototype 같은 내부 표현을 반복 고정한다.
- `toBeDefined()`만 있고 결과의 의미를 검증하지 않는다.

## 테스트할 것

### Public behavior

leaf 함수는 입력과 결과로 검증한다.

```ts
expect(linear(0.25)).toBe(0.25);
expect(sdfCircle({ center: { x: 0, y: 0 }, radius: 5 }, { x: 8, y: 0 })).toBe(3);
```

barrel import가 중요하더라도 leaf 함수의 동작 검증이 이미 있으면 별도 `typeof === 'function'` 테스트를 추가하지 않는다.
public surface 자체가 테스트 대상이면 contract test로 분리한다.

### Domain policy

수치/기하 정책은 명시적으로 검증한다.

- non-finite pass-through 또는 throw 정책
- degenerate shape 처리
- epsilon threshold
- closed/open primitive relation
- output mutation 여부
- alias-safe input/output 처리

### `Into` contract

`Into` 함수는 다음을 우선 검증한다.

- 반환값이 caller-provided `out`과 같은 참조인지
- 기존 `out` 내용을 clear하거나 append하는 정책이 맞는지
- input과 output이 alias될 때 source 좌표가 보존되는지
- companion 함수가 새 result container를 반환하는지

## 피할 것

### Export-only 테스트

함수가 존재하는지만 확인하지 않는다.

나쁨:

```ts
expect(typeof easing.linear).toBe('function');
```

좋음:

```ts
expect(linear(0.25)).toBe(0.25);
```

예외:

- public surface 자체가 테스트 대상인 contract test
- generated export catalog와 실제 barrel의 동기화를 검증하는 테스트

### 내부 표현 고정

동작과 무관한 object prototype, helper 이름, 내부 호출 순서를 고정하지 않는다.

나쁨:

```ts
expect(Object.getPrototypeOf(result.points[0])).toBe(Object.prototype);
```

좋음:

```ts
expect(result.points[0]).toEqual({ x: 0, y: 1 });
expect(result.points[0]).not.toBe(other.points[0]);
```

예외:

- plain object가 문서화된 public contract인 경우
- 단, 반복하지 말고 contract를 대표하는 한 곳에서만 검증한다.

### 낮은 신호 assertion

`toBeDefined()`만 있는 테스트를 만들지 않는다.

나쁨:

```ts
expect(result).toBeDefined();
```

좋음:

```ts
expect(result).toBeDefined();
if (result === undefined) return;
expect(result.values).toEqual([1, 2]);
```

예외:

- `toBeDefined()`가 이후 수치/구조 검증을 위한 type guard인 경우
- failure mode가 `undefined` 반환 자체인 경우에는 `toBeUndefined()`로 직접 검증한다.

### 중복 테스트

같은 계약을 leaf unit test, barrel test, contract test에서 반복하지 않는다.

정리 기준:

- leaf 함수 테스트가 동작을 검증하면 barrel의 callable-only 테스트는 제거한다.
- barrel 노출 목록이 중요하면 public surface contract test로 합친다.
- package export path가 중요하면 build entry 또는 import boundary contract test로 둔다.

### Mock 중심 테스트

mock 호출 횟수만 보고 결과 계약을 보지 않는 테스트를 피한다.

예외:

- 콜백 호출 횟수 자체가 sampling, integration, traversal contract인 경우
- forbidden callback이 호출되지 않아야 하는 short-circuit contract인 경우

## 리뷰 체크리스트

새 테스트를 추가하거나 리뷰할 때 다음을 확인한다.

- 실패하면 실제 회귀를 알려주는가?
- 구현을 바꾸고 동작이 같아도 깨지는가?
- 같은 계약을 이미 다른 테스트가 검증하는가?
- assertion이 결과를 검증하는가, 존재만 검증하는가?
- unit behavior test와 public surface contract test가 섞여 있지 않은가?
- `toBeDefined()`가 type guard 이후 meaningful assertion으로 이어지는가?
- prototype, source string, helper 이름 같은 내부 표현을 고정하지 않는가?
- 예외라면 테스트명이나 주변 문맥에서 왜 예외인지 드러나는가?

## 삭제 우선순위

과도한 테스트를 정리할 때는 다음 순서로 삭제하거나 축소한다.

1. callable-only / import-only 테스트
2. leaf 동작 테스트와 중복되는 barrel export 테스트
3. 반복되는 object prototype 검증
4. 의미 있는 assertion 없이 `toBeDefined()`만 남은 테스트
5. 결과 계약보다 mock 호출 세부사항에 의존하는 테스트

삭제 후에는 수정한 package의 focused test를 먼저 실행하고, 영향이 넓으면 package 전체 test를 실행한다.

## 관련 문서

테스트를 어떻게 작성하는가(runner, 파일 조직, 표준 `*Into` 검증 시나리오, numeric 함정)는
[테스트 메커니즘](./testing-mechanics.md)을 본다.
