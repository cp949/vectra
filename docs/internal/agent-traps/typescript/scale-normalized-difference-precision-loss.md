# absolute coordinate를 normalize한 뒤 빼면 local offset이 사라진다

태그: `typescript`, `float64`, `precision`, `geometry`, `normalization`

## 함정

overflow를 피하려고 좌표를 먼저 global scale로 나눈 뒤 차분하면 작은 local offset이 사라진다.

```ts
// 함정: base가 크고 delta가 작으면 delta 정보가 normalization 과정에서 사라질 수 있다
const scale = Math.max(Math.abs(ax), Math.abs(bx));
const dx = ax / scale - bx / scale;
```

finite 좌표에서는 `ax - bx`가 더 정확한 경우가 많다. 같은 크기 좌표의 뺄셈은 Sterbenz lemma로
정확할 수 있고, normalize-first는 상대 ULP 손실을 만든다.

## 증상

- `pointPointDist`가 `epsilon` 경계에서 boolean 거리 판정과 갈린다.
- `pointLineDist`가 대좌표 segment의 residual을 잃어 point가 직선에서 멀리 떨어져도
  `epsilon` 이내로 통과시킨다.
- scale-normalized cross distance만 쓰면 dominant axis 방향의 작은 이탈이 0처럼 보인다.

## 방지

finite 차분 우선, scale fallback 후순위로 둔다.

```ts
const direct = Math.hypot(ax - bx, ay - by);
if (Number.isFinite(direct)) return direct;

// direct 경로가 overflow될 때만 scale fallback
const scale = Math.max(Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by));
return scale * Math.hypot(ax / scale - bx / scale, ay / scale - by / scale);
```

line distance에서는 normalized cross 하나만 믿지 않는다.

- finite 차분으로 local vector를 먼저 만든다.
- overflow나 non-finite가 날 때만 absolute-coordinate scale fallback을 쓴다.
- dominant-axis projection residual 같은 독립 검사를 추가해 cancellation을 잡는다.
- 회귀 테스트는 `base ± epsilon`, huge segment + small offset, endpoint parameter `0/1` 반올림을 포함한다.

## 관련 작업

- `_works/S10-RM-003/20260529-01-intersects-relation-detail-result-types/02-작업결과.md`
  - F9, F13: scale-normalized line distance / mapped interval이 local residual을 잃어 false positive 발생.
  - F16: `pointPointDist` normalize-first 경로가 epsilon 경계에서 boolean parity를 깨뜨림.
