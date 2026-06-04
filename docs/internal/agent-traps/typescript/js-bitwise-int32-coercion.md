# JS 비트 연산자 int32 강제 변환: safe integer 전체 범위에서 비트 트릭 금지

태그: `bitwise`, `int32`, `safe-integer`, `power-of-two`

## 함정

JavaScript `&`, `|`, `^`, `~`, `<<`, `>>`, `>>>`는 양쪽 피연산자를 int32로 강제 변환한다.
입력이 `2^31` 이상인 safe integer일 수 있는 함수에서 비트 트릭을 그대로 쓰면 결과가
silently 잘못된다.

```ts
// 함정: int32로 잘려서 2^32 + 1이 1과 같게 취급된다
(value & (value - 1)) === 0
```

`while (p < value) p <<= 1` 같은 순회도 동일하게 위험하다. `p`가 `2^30`을 넘는 순간
`<<=`로 음수가 되어 루프가 일찍 끝나거나 fallback 분기가 필요해진다.

## 증상

```ts
isPowerOfTwo(2 ** 32 + 1)        // true (기대값 false)
isPowerOfTwo(3 * 2 ** 30)        // true (기대값 false)
isPowerOfTwo(Number.MAX_SAFE_INTEGER) // 잘못된 결과
nextPowerOfTwo(2 ** 32 + 1)      // 입력값 그대로 반환 (기대값 2^33)
```

기존 테스트가 1024 이하만 다루면 회귀가 드러나지 않는다.

## 방지

safe integer 전체 범위(최대 `2^53 - 1`)를 다루는 함수에서는 비트 연산자를 쓰지 않는다.

- 거듭제곱 판정: `value % 2 !== 0` 검사 + `value /= 2` 반복 분할.
  짝수 safe integer를 2로 나누는 것은 float 정밀도 손실이 없다.
- 거듭제곱 순회: `p *= 2`로 통일한다.

회귀 테스트에 32-bit 한계 이상 케이스를 반드시 포함한다.

```ts
const SAFE_RANGE_CASES = [
  2 ** 32, 2 ** 32 + 1, 3 * 2 ** 30,
  2 ** 40, 2 ** 52, Number.MAX_SAFE_INTEGER,
];
```

같은 함정이 한 함수에 적용되면 동일 의미의 모든 분기(예: "이미 거듭제곱이면 그대로 반환")에도
해당된다. 함정 메모에 "X에도 같은 케이스가 해당된다"고 적었다면 X 구현도 같은 커밋에서 수정한다.

## 관련 작업

- `_works/S3-RM-019/20260520-01-lightweight-construction-query-followups/함정.md`
