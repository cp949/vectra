# Numerical solver tolerance 분리: 분기 tolerance와 결과 dedupe tolerance를 같은 ε로 쓰지 않는다

태그: `numerical`, `tolerance`, `epsilon`, `solver`, `dedupe`

## 함정

cubic/quartic 같은 polynomial root solver에서 root dedupe용 `eps`를 discriminant 분기
tolerance로 그대로 사용하면 작은 계수 방정식에서 분기를 잘못 선택한다.

discriminant scale은 입력 계수의 제곱 차수에 비례하지만 root scale은 1차 차수이므로
두 tolerance는 의미상 다른 차원이다.

## 증상

```ts
solveCubic(1, 0, -0.001, 0)
// 기대: [-sqrt(0.001), 0, sqrt(0.001)] (3 real roots)
// 실제: [-0] (중근으로 오판되어 1 root만 반환)
```

작은 3실근 방정식이 discriminant 비교에서 "중근"으로 분류된다.

## 방지

- discriminant 분기 tolerance는 root tolerance와 별도 scale로 처리한다.
  예: `eps * eps` 또는 입력 계수 magnitude에 비례한 별도 상수.
- root dedupe tolerance는 root 값 사이 거리에만 적용한다.
- 작은 계수 + 3실근 regression test를 반드시 추가한다.
- 같은 원칙이 quartic, quintic, generic numeric kernel에도 적용된다.

## 관련 작업

- `_works/S3-RM-019/20260520-01-lightweight-construction-query-followups/함정.md`
