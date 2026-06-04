# Release Readiness Checklist

publish 직전 무엇을 확인해야 하는가를 담는 체크리스트다.
실제 publish, version bump, tag 생성은 이 TASK 범위 밖이며 별도 작업으로 진행한다.

---

## 1. Package Metadata 점검

`sub/vectra/package.json` 현재 값 (2026-05-19 기준):

| 필드 | 현재 값 | 점검 항목 |
| --- | --- | --- |
| `name` | `"@cp949/vectra"` | npm scoped package (`@cp949` org 필요) |
| `version` | `"0.0.0"` | publish 전 적절한 semver로 bump 필요 (별도 작업) |
| `description` | `"TypeScript geometry/math function catalog"` | 정확하고 간결함 — 유지 |
| `keywords` | geometry / 2d / typescript / math | npm 검색 metadata — 유지 |
| `repository` | `git+https://github.com/cp949/vectra.git`, `directory: "sub/vectra"` | monorepo publish package 위치를 가리킨다 |
| `homepage` | `https://github.com/cp949/vectra#readme` | 공개 README 위치 |
| `bugs` | `https://github.com/cp949/vectra/issues` | issue tracker 위치 |
| `type` | `"module"` | ESM 전용 패키지 — 의도적 선택 |
| `sideEffects` | `false` | tree-shaking 최적화 선언 — 유지 |
| `files` | `["dist", "README.md"]` | 빌드 산출물과 README만 포함 — 유지 |

체크리스트:

- [ ] `version`이 `"0.0.0"`이 아닌 적절한 semver로 bump되었다
- [ ] `@cp949` npm org에 publish 권한이 있다
- [ ] `description`이 패키지 소비자 관점에서 정확하다
- [ ] `license` 필드가 확정되었다. 현재 root README의 `TBD`와 함께 publish blocker로 남아 있다
- [ ] `repository`, `homepage`, `bugs` 필드가 현재 공개 repository 위치와 일치한다

---

## 2. Support Matrix 점검

| 항목 | 공식 기준 | Release gate |
| --- | --- | --- |
| Runtime | Node.js `>=20.19.0` | `pnpm verify`와 package 단위 검증을 이 기준에서 실행 |
| Package format | ESM only | `package.json`의 `"type": "module"`, `exports` 유지 |
| Import surface | root / domain barrel / leaf subpath | contract test로 package import와 subpath import 확인 |
| Type declarations | `.d.ts` 포함 | `pnpm --filter @cp949/vectra build` 후 `dist/**/*.d.ts` 확인 |
| Bundler/browser | ESM package exports를 해석하는 bundler 환경 | bundle size gate 도입 전까지 README support statement와 contract test를 기준으로 확인 |
| Coordinate input | `{ x, y }` object 또는 readonly `[x, y]` tuple | typed-array / array-like coordinate를 공식 `XYInput`으로 문서화하지 않음 |

체크리스트:

- [ ] package README의 support matrix가 최신이다
- [ ] runtime support 기준과 root `package.json` `engines.node`가 충돌하지 않는다
- [ ] typed-array / array-like 좌표를 공식 coordinate input으로 문서화하지 않았다
- [ ] leaf package subpath를 공식 import 경로로 문서화하지 않았다

---

## 3. Exports / Build Entry 일치 확인

`package.json` root/domain barrel `exports`와 `build-entrypoints.ts`에서 파생되는 `tsup` entry가
충돌하지 않아야 한다.

- [ ] 공개 root/domain barrel build entry에 대응하는 `exports` 항목이 존재한다
- [ ] `exports`에 선언된 모든 경로가 build entry로 파생된다
- [ ] 새로 추가된 domain barrel이 두 파일 모두에 반영되어 있다

현재 domain barrel (23개):

```
.               (root index)
./types
./vec
./segment
./rect
./bounds
./circle
./ellipse
./matrix
./polyline
./polygon
./triangle
./random
./path
./math
./curve
./svg-path
./infinite-line
./ray
./intersects
./angle
./interpolation
./easing
```

leaf subpath: `vec` 39개, `segment` 39개, `rect` 32개, `bounds` 23개, `circle` 26개,
`ellipse` 30개, `matrix` 23개, `polyline` 20개, `polygon` 27개, `triangle` 24개, `random` 31개,
`path` 14개, `math` 25개, `curve` 29개, `svg-path` 2개, `ray` 27개, `infinite-line` 25개,
`intersects` 71개, `angle` 23개, `interpolation` 9개 파일(16개 함수), `easing` 18개 파일(40개 함수)

---

## 4. 빌드 / 테스트 / 타입체크 통과

- [ ] `pnpm build` 통과 — dist 산출물이 생성된다
- [ ] `pnpm test` 통과 — 모든 unit test와 contract test가 통과한다
- [ ] `pnpm typecheck` 통과 — TypeScript 타입 오류가 없다
- [ ] `pnpm lint` 통과 — biome lint 오류가 없다
- [ ] `pnpm format:check` 통과 — 포맷 오류가 없다
- [ ] `pnpm verify` (전체 검증 명령) 통과한다

CI release gate 후보:

```sh
pnpm release:check
```

`npm pack --dry-run`은 publish 직전 포함 파일 확인용이다. version bump, tag 생성, publish는 별도
release 작업에서 수행한다.

이 gate는 `.github/workflows/release-readiness.yml`에서 `pull_request`와 `main` push에 실행한다.
`npm pack --dry-run`은 포함 파일 확인용이며 publish를 수행하지 않는다.

contract test 범위:

- [ ] `tests/contract/package-imports.test.ts` — root / types / 각 domain barrel import 검증
- [ ] `tests/contract/vec-subpaths.test.ts`
- [ ] `tests/contract/segment-subpaths.test.ts`
- [ ] `tests/contract/rect-subpaths.test.ts`
- [ ] `tests/contract/bounds-subpaths.test.ts`
- [ ] `tests/contract/circle-subpaths.test.ts`
- [ ] `tests/contract/ellipse-subpaths.test.ts`
- [ ] `tests/contract/matrix-subpaths.test.ts`
- [ ] `tests/contract/polyline-subpaths.test.ts`
- [ ] `tests/contract/polygon-subpaths.test.ts`
- [ ] `tests/contract/triangle-subpaths.test.ts`
- [ ] `tests/contract/random-subpaths.test.ts`
- [ ] `tests/contract/path-subpaths.test.ts`
- [ ] `tests/contract/math-subpaths.test.ts`
- [ ] `tests/contract/curve-subpaths.test.ts`
- [ ] `tests/contract/svg-path-subpaths.test.ts`
- [ ] `tests/contract/ray-subpaths.test.ts`
- [ ] `tests/contract/infinite-line-subpaths.test.ts`
- [ ] `tests/contract/intersects-subpaths.test.ts`
- [ ] `tests/contract/angle-subpaths.test.ts`
- [ ] `tests/contract/interpolation-subpaths.test.ts`
- [ ] `tests/contract/easing-subpaths.test.ts`

---

## 5. dist 산출물 확인

- [ ] `dist/` 폴더가 존재하고 비어 있지 않다
- [ ] 각 domain barrel (`dist/<domain>/index.js`, `dist/<domain>/index.d.ts`) 파일이 존재한다
- [ ] 각 leaf subpath 파일이 존재한다
- [ ] `.d.ts` 타입 선언 파일이 모든 entry에 대해 생성된다
- [ ] `dist/index.js`가 존재한다 (root entry)

---

## 6. README 확인

- [ ] `sub/vectra/README.md`가 최신 구현 상태와 일치한다
- [ ] 모든 예제 코드가 현재 export API와 일치한다
- [ ] subpath import 예제가 실제 `package.json exports` 경로와 일치한다

---

## 7. Bundle Size Gate

현재 bundle size budget은 release blocker가 아니다. 현 release gate는 package contents 확인을 위한
`npm pack --dry-run`까지다.

현재 package contents baseline (2026-05-19, `cd sub/vectra && npm pack --dry-run`):

| 항목 | 값 | 의미 |
| --- | --- | --- |
| package size | `500.1 kB` | npm tarball size |
| unpacked size | `2.2 MB` | 설치 후 package contents size |
| total files | `2955` | `files: ["dist", "README.md"]` 기준 포함 파일 수 |

위 baseline은 consumer bundle size가 아니다. 정식 bundle gate로 승격하려면 다음 matrix를 별도
TASK에서 먼저 구현한다.

| 측정 축 | 후보 |
| --- | --- |
| Import fixture | root import, representative domain barrel |
| 대표 fixture | `vectra`, `@cp949/vectra/vec` |
| 측정 값 | raw, gzip, brotli |
| Baseline 위치 | repository에 commit되는 JSON 또는 markdown table |
| Threshold | fixture별 absolute limit 또는 baseline 대비 허용 증가율 |
| CI 실패 조건 | 측정 명령 실패 또는 threshold 초과 |

체크리스트:

- [ ] bundle size budget을 blocker로 둘지 release마다 명시했다
- [ ] blocker로 둔다면 측정 명령과 threshold가 문서화되어 있다
- [ ] blocker가 아니라면 release note 또는 작업 결과에 후속 항목으로 남겼다
- [ ] `npm pack --dry-run` package contents 확인과 consumer bundle size 측정을 혼동하지 않았다

---

## 8. pre-1.0 변경 정책

현재 package는 pre-1.0 단계다.

- `0.x`에서는 public API와 subpath가 바뀔 수 있다.
- breaking change는 changelog 또는 release note에 명시한다.
- 가능한 경우 deprecation 기간을 두지만, 잘못 노출된 초기 API는 다음 `0.x` release에서 정리할 수 있다.
- `1.0.0` 전까지 compatibility promise는 README와 release note에 적힌 범위로 제한한다.

체크리스트:

- [ ] 이번 release의 breaking change가 release note에 명시되었다
- [ ] deprecation을 둘 수 있는 변경과 즉시 제거할 변경을 구분했다
- [ ] README의 version policy가 현재 release 정책과 맞다

### 누적 breaking change 기록

#### S3-RM-015: `finite-line` → `segment` canonical rename (pre-1.0)

alias 없이 전면 rename. 이전 이름은 모두 제거됨.

- `@cp949/vectra/finite-line*` subpath 전체 → `@cp949/vectra/segment*`
- `FiniteLineLike` → `SegmentLike`
- `FiniteLineWritable` → `SegmentWritable`
- `FiniteLineTuple` → `SegmentTuple`
- `FiniteLineObjectLike` → `SegmentObjectLike`
- `createFiniteLine` → `createSegment`
- `intersectsFiniteLine` (segment same-domain) → `intersectsSegment`
- `intersects` domain cross-pair 함수: `intersectsFiniteLine*` / `intersectionPointFiniteLine*` → `intersectsSegment*` / `intersectionPointSegment*`
- `ray.fromFiniteLineInto` / `ray.fromFiniteLine` → `ray.fromSegmentInto` / `ray.fromSegment`
- `infinite-line.fromFiniteLineInto` / `infinite-line.fromFiniteLine` → `infinite-line.fromSegmentInto` / `infinite-line.fromSegment`

#### S3-RM-016: `copy` → `{shape}From` companion 함수 rename (pre-1.0)

alias 없이 전면 rename. 이전 이름은 모두 제거됨.

- `vec.copy` → `vecFrom`
- `circle.copy` → `circleFrom`
- `ellipse.copy` → `ellipseFrom`
- `segment.copy` → `segmentFrom`
- `infinite-line.copy` → `infiniteLineFrom`
- `ray.copy` → `rayFrom`
- `triangle.copy` → `triangleFrom`

`copyInto`는 변경되지 않았다.

---

## 9. publish 직전 단계별 확인 (참고)

실제 publish는 이 체크리스트를 모두 통과한 뒤 별도 작업으로 진행한다.

```sh
# 1. 전체 검증
pnpm verify

# 2. 빌드 산출물 확인
pnpm --filter @cp949/vectra build
ls sub/vectra/dist

# 3. pack dry-run으로 포함 파일 확인
cd sub/vectra && npm pack --dry-run

# 4. version bump (별도 작업)
# npm version patch  또는  minor  또는  major

# 5. git tag 생성 (별도 작업)
# git tag v<version>

# 6. publish (별도 작업)
# npm publish --access public
```

---

## 주의사항

- **version bump, tag 생성, npm publish는 이 TASK 범위 밖이다.**
  위 단계는 참고용으로만 기재하며, 실제 실행은 별도 릴리스 작업으로 진행한다.
- `pnpm verify`는 루트에서 실행한다.
- `devDependencies`의 `@repo/typescript-config`는 workspace 내부 패키지이며
  publish 시 포함되지 않는다. `files` 필드가 이를 제한한다.
