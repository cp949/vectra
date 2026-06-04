# vitest toEqual은 +0과 -0을 구분한다

태그: `testing`, `vitest`, `assertion`, `signed-zero`, `builder`

## 함정

builder/Into 함수가 `-b`, `-c/b`, `-component` 같은 부호 반전 산술을 거치면 입력이 `0`일 때
결과가 `-0`이 된다 (JS signed-zero 규칙).

```ts
// fromCoefficientsInto: direction = (-b, a)
writeXY(out.direction, -b, a); // b=0이면 direction.x = -0

// fromNormalInto: direction = (-normal.y, normal.x)
writeXY(out.direction, -ny, nx); // ny=0이면 direction.x = -0

// fromCoefficientsInto: origin = (0, -c/b)
writeXY(out.origin, 0, -c / b); // c=0이면 origin.y = -0
```

`vitest`의 `toEqual`은 primitive 비교에 `Object.is`를 사용하므로 `-0`과 `+0`을 다른 값으로 본다.
`Object.is(-0, 0) === false`. 따라서 다음은 실패한다.

```ts
expect(out.direction).toEqual({ x: 0, y: 1 });
// Expected: { x: 0, y: 1 }
// Received: { x: -0, y: 1 }
```

## 증상

- builder unit test가 명백히 의도된 값으로 `toEqual`을 적었는데 `Received: { x: -0 }`으로 실패한다.
- 실패 메시지의 expected와 received가 시각적으로 동일해 보여 (`+0` 표시가 없으면) 원인 파악이
  어렵다.
- 같은 함수의 다른 분기는 통과해 회귀를 의심하기 쉽지만 실제로는 처음부터 signed-zero가 발생하는
  분기다.

## 방지

builder/Into 함수에 "non-finite는 검증하지 않고 JS 산술 결과를 그대로 따른다" 정책이 있으면
signed-zero도 의도된 결과다. source를 normalize하지 말고 (`+ 0` trick으로 -0을 0으로 강제하는
분기 추가 금지) 테스트에서 명시적으로 -0을 acknowledge한다.

```ts
// 권장: component별 assert로 분해하고 Object.is로 -0을 명시
expect(out.origin).toEqual({ x: 0, y: 0 });
expect(Object.is(out.direction.x, -0)).toBe(true);
expect(out.direction.y).toBe(1);

// 피할: toEqual 한 줄로 묶기
expect(out).toEqual({ origin: { x: 0, y: 0 }, direction: { x: 0, y: 1 } });
```

signed-zero가 발생할 수 있는 builder 패턴:

- `-x`, `-y` 같은 부호 반전 (zero 입력 시 `-0`).
- `-a / b` 같은 나눗셈 (피제수가 0이면 `-0`).
- `-Math.sin(0)` 같은 trig 호출 (`Math.sin(0) === 0` → `-0`).

builder JSDoc에는 "부호 반전 산술은 입력이 `0`일 때 JS의 signed-zero 규칙에 따라 `-0`을 그대로
기록한다" 식의 한 줄 주석을 둔다. API surface 문서도 마찬가지.

## 관련 작업

- `_works/S3-RM-044/20260525-01-infinite-line-builder-follow-up/함정.md` (TASK-01).
  `fromNormalInto`, `fromCoefficientsInto`에서 7건 발견 → 테스트 분해와 `Object.is` 명시로 해결.
