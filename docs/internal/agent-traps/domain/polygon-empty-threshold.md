# polygon empty 기준 이중성: pointCount === 0 vs pointCount < 3

태그: `polygon`, `empty`, `boundary`, `guard`

## 함정

polygon domain 함수마다 "빈 polygon" 기준이 다르다.

| 함수 | empty 기준 |
| --- | --- |
| `boundsInto`, `closestPointInto`, `distanceToPoint`, `centroidInto` | `points.length === 0` |
| `containsPoint`, `intersectsSegment`, `intersectsRect`, `intersectsBounds` | `points.length < 3` |

`isEmpty` 공식 정의는 `points.length < 3`이다.

## 증상

1-point나 2-point polygon을 입력하면 함수마다 동작이 갈린다. 어떤 함수는 정상 처리를
시도하고, 어떤 함수는 early-return한다. 일관성 없는 결과가 나온다.

## 방지

새 polygon 함수를 구현할 때 empty guard를 작성하기 전에 결정한다.

- **geometric 의미 있는 polygon**: `points.length < 3` — `isEmpty`와 일치
- **단순 데이터 유무**: `points.length === 0`

결정을 함수 주석에 명시한다. cross-domain wrapper에서 사용할 때도 wrapper 내 기준을 명시한다.

## 관련 작업

- `_works/S3-RM-004D/20260518-01-polygon-polyline-relation-boundary/함정.md`
