# broad random fuzz는 epsilon-thin band를 놓친다

태그: `testing`, `fuzz`, `epsilon`, `geometry`, `near-parallel`

## 함정

geometry relation fuzz를 일반 random 좌표나 거친 grid로만 돌리면 `epsilon` 근처의 얇은
band를 거의 생성하지 못한다. `epsilon=1e-9`인데 좌표 grid가 `0.25` 단위이면, line distance가
`epsilon` 안팎으로 갈리는 케이스를 통과하지 않는다.

## 증상

- broad fuzz 수십만~수백만 건이 통과했는데, thin-band 집중 fuzz에서 대량 false positive가 나온다.
- `Math.abs(cross) > epsilon`인 non-parallel 분기를 `distance <= epsilon` 보정 분기가 가로채
  boolean helper와 detail helper parity가 깨진다.
- near-parallel, near-endpoint, degenerate 케이스는 나중 리뷰 라운드에서만 재현된다.

## 방지

geometry relation helper를 fuzz할 때 broad fuzz와 stratified fuzz를 분리한다.

- broad random: 일반 좌표와 여러 magnitude를 섞는다.
- epsilon-thin band: 한 segment의 직선에서 `±epsilon`, `±0.5epsilon`, `±2epsilon` offset을 만든다.
- near-parallel: 두 방향 벡터의 cross가 `epsilon` 근처가 되게 만든다.
- near-boundary parameter: `t = 0`, `1`, `-ulp`, `1 + ulp`, `epsilon` 근처를 직접 만든다.
- degenerate: point-vs-point, point-vs-segment, zero-length + huge segment 조합을 포함한다.
- parity fuzz만 믿지 않는다. 반환 detail이 있으면 좌표 invariant(line distance, endpoint agreement,
  overlap endpoint distinctness)를 같이 검증한다.
- 허용 divergence가 있으면 필터 조건을 문서화한다. 예: ill-conditioned near-parallel boundary.

## 관련 작업

- `_works/S10-RM-003/20260529-01-intersects-relation-detail-result-types/02-작업결과.md`
  - F14: broad fuzz가 놓친 scale 1 epsilon-thin band에서 false positive 94,584건/2,000,000 재현.
  - F12~F16: near-parallel / near-endpoint / epsilon boundary divergence triage.
