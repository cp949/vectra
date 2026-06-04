# editor-geometry 예제 alias는 `EditorGeometryx`(canonical) — 기존 `EditorGeometry`는 drift

태그: `examples`, `pixi-demo`, `import`, `convention`

## 함정

예제 import 정책의 canonical Namespace import 컨벤션은 하이픈 domain alias를
"하이픈 제거 PascalCase + `x`"로 정한다(`infinite-line` → `InfiniteLinex`). 따라서
`editor-geometry` alias는 `EditorGeometryx`다.

그런데 기존 pixi 예제 8개가 canonical을 어기고 `import * as EditorGeometry`(x 없음)로 굳어 있다.
새 예제를 쓸 때 grep으로 기존 사용만 따라 하면 drift를 그대로 복제한다. 반대로 canonical을 따르면
같은 domain에 두 alias 형태가 공존하게 된다.

## 증상

- `grep "as EditorGeometry"`가 8건을 보여줘 새 예제도 무심코 `EditorGeometry`를 쓴다.
- 다른 하이픈 domain은 `InfiniteLinex`처럼 `x`를 쓰는데 `editor-geometry`만 `x`가 없어 일관성이 깨진다.

## 방지

- 새 예제 alias는 canonical 규칙을 따른다 → `EditorGeometryx`. 기존 drift를 근거로 삼지 않는다.
- alias 형태는 sibling grep이 아니라 Namespace import 컨벤션에서 확정한다.
- 기존 8개 `EditorGeometry`는 별도 정리 작업으로 일괄 rename 대상이다(예제 추가 작업 범위에 끼우지 않는다).

## 관련 작업

- `_works/S1-RM-013/20260526-149-pixel-grid-align-example/`:
  `editor-geometry/pixelAlign` 예제에서 canonical `EditorGeometryx`를 채택하고 drift를 함정으로 승격했다.
