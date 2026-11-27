# ADR 0009: hot path용 `*XY` 스칼라 함수

상태: 승인

ADR 0003의 "숫자 나열 overload는 public input shape에 포함하지 않는다"에 예외를 하나 둔다.

## 배경

ADR 0003은 좌표 입력을 `{ x, y }`와 `[x, y]`로 받는다. 외부 데이터를 변환 없이 넘기려는 결정이다.
매 프레임 수천–수만 번 부르는 소비자에게는 이 결정이 반대로 작동한다.

- 소비자의 데이터 모양이 vectra shape와 다르다.
  - 물리 놀이터는 면을 `{ x1, y1, x2, y2 }`, 원을 `{ x, y, r }`로 둔다.
  - vectra는 `{ a: { x, y }, b: { x, y } }`, `{ center: { x, y }, radius }`를 요구한다.
  - 소비자는 shape 객체를 따로 만들어 두거나 호출마다 감싸야 한다.
- 공유 reader가 tuple과 object를 판별하고 중첩 객체를 따라간다. 계산식보다 읽기 비용이 크다.
- 물리 놀이터는 이 비용 때문에 vectra 대신 직접 계산을 골랐다.

측정(Node.js 24.21, 번들하지 않은 `dist`, 항목마다 별도 프로세스):

| 장면 | 직접 짠 코드 | 구조체 입력 함수 |
| --- | --- | --- |
| 원 163개의 모든 쌍 겹침 | 약 20µs | `intersectsCircleCircle` 약 170µs |
| 광선 2400개 × 면 40개 | 약 0.93ms | `raySegmentHitT` 약 1.39ms |
| 점 1만 개 × segment 거리 | 약 57µs | `distanceToPoint` 약 100µs |

## 결정

hot path 계산에 한해 좌표를 숫자로 받는 별도 함수를 공개한다.

- 이름은 대응 함수 이름에 `XY`를 붙인다. 예: `raySegmentHitT` → `raySegmentHitTXY`.
- 기존 함수에 overload를 더하지 않는다. 기존 함수의 시그니처는 그대로다.
- 결과는 같은 입력의 대응 함수와 `Object.is`로 같다. 시험이 난수 입력과 non-finite 입력으로 고정한다.
- 계산 본문은 비용에 따라 둔다.
  - 본문이 크면 대응 함수와 internal 계산을 공유한다. 예: `raySegmentHitTXY`, `rayCircleHitTXY`.
  - 본문이 몇 줄이면 `*XY` 함수에 직접 둔다. 예: `intersectsCircleCircleXY`, `segment/distanceToPointXY`.
  - 이유: 번들하지 않은 ESM에서 `dist` chunk 경계를 넘는 호출 한 겹이 원 쌍 장면을 약 2배 느리게 했다.
- 검증, 기본값, 경계 정책은 대응 함수와 같다. `*XY`라고 검증을 생략하지 않는다.
- 인자 순서는 대응 함수의 입력 순서를 펼친 것이다. shape 하나는 `x, y`, 반지름, 끝점 순서다.
- 추가 기준은 소비자 요구다. 실제 hot path 측정이 있을 때만 추가한다. 일괄 추가하지 않는다.

첫 묶음:

- `intersects/raySegmentHitTXY(ox, oy, dx, dy, ax, ay, bx, by, tMin = 0, epsilon?)`
- `intersects/rayCircleHitTXY(ox, oy, dx, dy, cx, cy, radius, tMin = 0, epsilon = 1e-9)`
- `intersects/intersectsCircleCircleXY(ax, ay, ar, bx, by, br)`
- `segment/distanceToPointXY(ax, ay, bx, by, px, py)`

## 결과

- 소비자는 자기 데이터 모양 그대로 vectra 계산을 쓴다.
- 같은 장면에서 `*XY`는 직접 짠 코드의 약 1.2–1.3배다. 구조체 입력 함수는 약 1.5–8.6배였다.
  - 원 쌍: `intersectsCircleCircleXY` 약 26µs.
  - 광선 × 면: `raySegmentHitTXY` 약 1.21ms.
  - 점–segment: `distanceToPointXY` 약 70µs.
- 같은 계산의 공개 함수가 둘이 된다. 본문을 직접 둔 함수는 식이 두 곳에 있다. 등가성 시험이 둘의 결과를 `Object.is`로 고정한다.
- `*XY` 함수는 결과를 반환하는 scalar·boolean 계산만 둔다. 점을 기록하는 `*XYInto`는 이 ADR의 범위가 아니다.
- 측정 장면은 `sub/vectra/scripts/bench/physics-kernels.mjs`다. `pnpm --filter @cp949/vectra bench`로 다시 잰다.
