# vectra 프로젝트 구조

이 문서는 과거 상태 대시보드에서 분리한 저장소 구조와 package subpath scaffold 현황이다.
현재 작업 위치는 작업 계획 또는 상태 대시보드를 먼저 확인한다.

## Workspace

현재 구현 workspace:

```txt
package.json
pnpm-workspace.yaml
turbo.json
biome.json
sub/
  typescript-config/
  vectra/
    package.json
    src/
    tests/
      contract/
      unit/
      recipes/          <- S1-RM-013에서 추가
  playground/           <- S1-RM-013에서 추가 (private)
apps/
  canvas-demo/          <- S1-RM-013에서 추가 (private demo)
  pixi-demo/            <- Pixi 기반 interaction / animation demo
```

`sub/vectra`가 실제 publish package이다.

## 예제 위치

예제 추가와 coverage 운영은 [examples/README.md](./examples/README.md)를 먼저 따른다.

현재 예제 app:

- `apps/canvas-demo`: 정적 geometry 계산 결과 시각화
- `apps/pixi-demo`: interaction, animation, scene state가 필요한 예제

각 app의 예제는 `src/examples/<example-id>/index.ts`와 `src/examples/<example-id>/source.exam.ts`
쌍으로 둔다.

## Package Subpaths

현재 scaffold된 package subpath:

- `vectra`
- `vectra/types`
- `vectra/vec`
- `vectra/finite-line`
- `vectra/rect`
- `vectra/bounds`
- `vectra/circle`
- `vectra/ellipse`
- `vectra/matrix`
- `vectra/polyline`
- `vectra/polygon`
- `vectra/random`
- `vectra/path`
- `vectra/math`
- `vectra/curve`
- `vectra/svg-path`
- `vectra/triangle`

정확한 최신 export/count gate는 [checklists/release-readiness.md](./checklists/release-readiness.md)의
Exports / Build Entry 섹션을 따른다.

## 주요 문서 위치

- API 방향: [api-design.md](./api-design.md)
- 제품 범위: [product-scope.md](./product-scope.md)
- API surface catalog: package metadata와 generated entrypoint 목록
- Release readiness: [checklists/release-readiness.md](./checklists/release-readiness.md)
- 작업 완료 체크리스트: [checklists/work-completion.md](./checklists/work-completion.md)
