# Changelog

이 프로젝트의 주요 변경 사항을 기록한다.

형식은 [Keep a Changelog](https://keepachangelog.com/)를 따른다.
배포하는 패키지 `@cp949/vectra`는 Semantic Versioning을 따른다.

## [Unreleased]

- `solveCubic`의 3차 경로가 `eps`를 생략하면 상대 판정을 쓴다. 판별식은 p, q의 반올림 잡음이 전파되는 양 `16·ε·(|q|·S³ + p²·S²)` 이하일 때 중근으로 본다(S는 근 scale). 근 dedupe는 `1e-12·S`이다. 이전에는 판별식 `1e-18`, 근 dedupe `1e-9` 절대값이라 붙은 근을 합쳤다. 예를 들어 근 (0.5, 0.5001, 0.5002)가 `[0.5001]` 하나로 나왔다. `eps`를 생략한 호출만 결과가 바뀌고, `eps`를 명시한 호출은 이전과 같다. 근 간격이 S의 약 1e-5배 이하이거나 켤레 복소근의 허수부가 약 1e-6배 이하이면 중근으로 합친다.
- `solveCubic`이 근 0을 `-0`으로 반환하던 문제를 고친다. `b = c = d = 0`이나 `a = 0` fallback에서 나오던 `-0`이 `+0`이 된다. 값은 같고 `Object.is`로 비교하는 코드만 영향을 받는다.
- `solveLinear`와 `solveQuadratic`이 해 0을 `-0`으로 반환하던 문제를 고친다. `solveLinear(1, 0)`, `solveQuadratic(0, 1, 0)`, `eps`를 명시한 중복근 `solveQuadratic(1, 0, 0, 1e-9)`가 `+0`을 반환한다. 값은 같고 `Object.is`로 비교하는 코드만 영향을 받는다.
- curve×curve 교차(`quadraticQuadraticIntersectionsInto`, `quadraticCubicIntersectionsInto`, `cubicCubicIntersectionsInto`, `curveCurveIntersections(Into)`)가 같은 기하 위에서 겹치는 두 곡선을 처리한다. 겹침 구간 양 끝점을 `kind: 'overlap'` hit 2건으로 기록한다. 이전에는 hit가 최대 16384건 나오고 계산이 10초 이상 걸렸다.
- `CurveIntersectionKind`에 `'overlap'`을 추가한다. `kind`를 exhaustive하게 분기하던 코드는 `'overlap'` 분기를 추가해야 한다.
- curve×curve 교차(`quadraticQuadraticIntersectionsInto`, `quadraticCubicIntersectionsInto`, `cubicCubicIntersectionsInto`, `cubicSelfIntersectionsInto`, `curveCurveIntersections(Into)`)의 `tA`, `tB`, `point` 정밀도를 높인다. subdivision이 `maxDepth`에서 멈춰 약 1.5e-5에 머물던 오차를 수렴 지점의 Newton refinement로 1e-9 수준까지 줄인다. 한 곡선의 끝점이 상대 곡선 위에 있으면(이음매, 공유 끝점, 끝점이 내부에 닿는 경우) `tA` 또는 `tB`를 정확히 0, 1로 snap한다. 내부에서 접선이 평행하게 닿는 접촉은 보정 없이 기존 값을 쓴다. 한 근을 여러 hit로 나누던 중복도 줄어든다. `kind`는 보정한 parameter의 tangent로 판정해 근 주변 stray box 때문에 `cross`가 `touch`로 바뀌는 오분류가 줄어든다.
- curve×curve 교차와 `cubicSelfIntersectionsInto`가 거의 평행한 두 곡선에서 가짜 hit를 남기지 않는다. 이전에는 얕은 각도(0.2°) 교차 한 건이 hit 68건으로 나왔다. 1e-4 간격으로 나란히 지나가는 두 곡선은 만나지 않는데도 hit 14302건이 나왔다. subdivision에 fat line 검사를 더해 이런 box 쌍을 일찍 버린다. 일반 입력의 교차 계산도 18–40% 빨라진다.
- 2차방정식 풀이를 수치 안정 공식으로 바꾼다(`solveQuadratic`, `solveCubic`의 `a === 0` 분기, `cubicBounds(Into)`, `cubicExtrema`, `cubicInflections`, `cubicIsSimple`, `quadraticLineIntersectionsInto`). `x² + 1e8·x + 1`의 작은 근은 오차 25%에서 1e-15 수준으로 줄고, 계수나 좌표 scale이 1e-8이어도 결과가 같다. 이전에는 scale 1e-7 cubic의 `cubicBoundsInto`가 곡선을 포함하지 못했고, scale 1e-5 quadratic과 직선의 교차 2건이 touch 1건이 됐다. `solveQuadratic`과 `solveCubic`은 `eps`를 생략하면 계수 scale 기준 상대 판정(`|D| <= 1e-12·(b² + |4ac|)`이면 중복근)을 쓴다. `eps`를 명시한 호출은 이전과 같은 판별식 절대 판정을 쓰므로 결과가 바뀌지 않는다. `eps`를 생략한 호출만 결과가 바뀐다. 두 함수의 `eps` 타입은 `eps?: number`가 된다. `quadraticLineIntersectionsInto`는 `epsilon`을 판별식이 아니라 정점과 직선 사이 거리와 비교한다.
- cubic과 직선의 교차(`cubicLineIntersectionsInto`와 이를 쓰는 segment·ray·infinite-line×cubic, line·segment×curve 교차)가 좌표 scale과 direction 길이에 상관없이 같은 결과를 낸다. 이전에는 근 간격이 1e-2 이하로 붙은 세 교차점을 둘로 합쳤다. 좌표가 작으면(scale 1e-8 이하) 곡선 전체를 직선 위 overlap으로 보고 hit를 버렸다. direction 길이가 1000이면 epsilon 이내 끝점 touch를 놓쳤다. 무작위 5만 건에서 scale·direction 변형 불일치가 475건에서 0건으로 준다. 직선이 곡선에 3중으로 닿는 접점(3중근)은 오차 약 7e-6에서 1e-16 수준으로 정확해진다.
- ellipse 교차(`ellipseEllipseDetail`, `ellipseEllipseIntersections(Into)`, `ellipseCircleIntersectionsInto`)가 크기 1 미만 ellipse도 정규화한다. 이전에는 scale 1e-6 이하에서 교점 4개를 1개 이하로 반환했다. 무작위 3만 건에서 scale 변형 불일치가 10097건에서 0건으로 준다.
- linalg `rowEchelonForm`과 `rowEchelonFormInto`가 `-0` 입력에서 `-0`을 남기던 문제를 고친다. JSDoc 약속대로 `0`을 반환한다.
- curve GL5 적분 상수를 소수 10자리에서 double 정밀도의 정확한 값으로 고친다. 곡선 길이와 `tAtLength` 결과가 약 1e-10 달라진다. 직선 곡선의 길이가 chord와 일치한다.

## [1.1.0] - 2026-10-17

- Node.js 최소 지원 버전을 24.18로 상향한다. 런타임 코드는 바뀌지 않는다.
- 빌드 도구를 tsup에서 tsdown으로 교체한다. 공개 entry와 export는 그대로다.
- dist를 root와 domain barrel 단위로만 만든다. leaf 단위 dist 파일은 없어진다. 패키지 파일은 6,079개에서 212개로, 압축 크기는 2.3 MB에서 1.6 MB로 줄어든다. `exports`를 우회해 `dist/<domain>/<leaf>.js`를 직접 import하던 코드는 domain subpath(`@cp949/vectra/<domain>`)로 바꿔야 한다.
- 개발 의존성을 같은 메이저 안에서 갱신한다. vitest는 5로 올린다.
- 배포에 `release-it`을 도입한다. [RELEASING.md](RELEASING.md)를 본다.
