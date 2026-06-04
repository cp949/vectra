# 예제 커버리지

이 파일은 스크립트로 생성한다. 커버리지 누락은 에러가 아니다.

생성 명령:

```sh
pnpm examples:coverage:write
```

## 요약

- 전체 public leaf: 1516
- covered: 642
- excepted: 0
- uncovered: 874
- 예제 수: 171

## 표

| Public leaf | Export name | 사용 예제 ID | 예외 | 상태 |
| --- | --- | --- | --- | --- |
| `@cp949/vectra/adapter/flat/decode-flat-coords` | `decodeFlatCoords` | `canvas:adapter-interop` |  | covered |
| `@cp949/vectra/adapter/flat/decode-flat-coords-into` | `decodeFlatCoordsInto` | `canvas:adapter-interop` |  | covered |
| `@cp949/vectra/adapter/flat/from-float32-array` | `fromFloat32Array` | `canvas:adapter-interop` |  | covered |
| `@cp949/vectra/adapter/flat/from-float32-array-into` | `fromFloat32ArrayInto` | `canvas:adapter-interop` |  | covered |
| `@cp949/vectra/adapter/flat/to-flat-coords` | `toFlatCoords` | `pixi:svg-points-roundtrip-editor` |  | covered |
| `@cp949/vectra/adapter/flat/to-flat-coords-into` | `toFlatCoordsInto` | `pixi:svg-points-roundtrip-editor` |  | covered |
| `@cp949/vectra/adapter/flat/to-float32-array` | `toFloat32Array` | `canvas:adapter-interop` |  | covered |
| `@cp949/vectra/adapter/flat/to-float32-array-into` | `toFloat32ArrayInto` | `canvas:adapter-interop` |  | covered |
| `@cp949/vectra/adapter/flat/transform-flat-coords` | `transformFlatCoords` | `canvas:adapter-interop` |  | covered |
| `@cp949/vectra/adapter/flat/transform-flat-coords-into` | `transformFlatCoordsInto` | `canvas:adapter-interop` |  | covered |
| `@cp949/vectra/adapter/parse-point-array` | `parsePointArray` | `pixi:svg-points-roundtrip-editor` |  | covered |
| `@cp949/vectra/adapter/parse-point-array-into` | `parsePointArrayInto` | `pixi:svg-points-roundtrip-editor` |  | covered |
| `@cp949/vectra/adapter/parse-svg-points` | `parseSvgPoints` | `canvas:adapter-interop` |  | covered |
| `@cp949/vectra/adapter/parse-svg-points-into` | `parseSvgPointsInto` | `canvas:adapter-interop` |  | covered |
| `@cp949/vectra/adapter/parse-svg-polygon` | `parseSvgPolygon` | `pixi:svg-points-roundtrip-editor` |  | covered |
| `@cp949/vectra/adapter/parse-svg-polygon-into` | `parseSvgPolygonInto` | `pixi:svg-points-roundtrip-editor` |  | covered |
| `@cp949/vectra/adapter/parse-svg-polyline` | `parseSvgPolyline` | `pixi:svg-points-roundtrip-editor` |  | covered |
| `@cp949/vectra/adapter/parse-svg-polyline-into` | `parseSvgPolylineInto` | `pixi:svg-points-roundtrip-editor` |  | covered |
| `@cp949/vectra/adapter/points-to-string` | `pointsToString` | `canvas:adapter-interop`, `pixi:svg-points-roundtrip-editor` |  | covered |
| `@cp949/vectra/adapter/svg-polygon-to-string` | `svgPolygonToString` | `pixi:svg-points-roundtrip-editor` |  | covered |
| `@cp949/vectra/adapter/svg-polyline-to-string` | `svgPolylineToString` | `pixi:svg-points-roundtrip-editor` |  | covered |
| `@cp949/vectra/angle/angle-delta` | `angleDelta` | `pixi:angle-heading-turn` |  | covered |
| `@cp949/vectra/angle/angle-from-sin-cos` | `angleFromSinCos` |  |  | uncovered |
| `@cp949/vectra/angle/average-angle` | `averageAngle` | `pixi:angle-average-direction`, `pixi:rotation-control-dial` |  | covered |
| `@cp949/vectra/angle/bisect-angle` | `bisectAngle` | `pixi:angle-bisect-shortest`, `pixi:rotation-control-dial` |  | covered |
| `@cp949/vectra/angle/clamp-angle` | `clampAngle` | `pixi:angle-clamp-range`, `pixi:rotation-control-dial` |  | covered |
| `@cp949/vectra/angle/clockwise-sweep` | `clockwiseSweep` |  |  | uncovered |
| `@cp949/vectra/angle/complement` | `complement` |  |  | uncovered |
| `@cp949/vectra/angle/counter-clockwise-sweep` | `counterClockwiseSweep` |  |  | uncovered |
| `@cp949/vectra/angle/deg-to-rad` | `degToRad` | `pixi:angle-unit-compass` |  | covered |
| `@cp949/vectra/angle/deg-to-turn` | `degToTurn` | `pixi:angle-unit-compass` |  | covered |
| `@cp949/vectra/angle/directed-angle-delta` | `directedAngleDelta` | `pixi:angle-heading-turn` |  | covered |
| `@cp949/vectra/angle/from-vector` | `fromVector` | `pixi:angle-average-direction`, `pixi:angle-heading-turn`, `pixi:angle-unit-compass`, `pixi:rotation-control-dial`, `pixi:vec-slerp-direction`, `pixi:vector-steering-field` |  | covered |
| `@cp949/vectra/angle/is-angle-between` | `isAngleBetween` | `pixi:angle-unit-compass` |  | covered |
| `@cp949/vectra/angle/is-reflex` | `isReflex` |  |  | uncovered |
| `@cp949/vectra/angle/is-reflex-sweep` | `isReflexSweep` | `pixi:angle-directed-sweep`, `pixi:rotation-control-dial` |  | covered |
| `@cp949/vectra/angle/lerp-angle` | `lerpAngle` | `pixi:angle-heading-turn` |  | covered |
| `@cp949/vectra/angle/move-toward-angle` | `moveTowardAngle` | `pixi:angle-heading-turn`, `pixi:vector-steering-field` |  | covered |
| `@cp949/vectra/angle/near-angle` | `nearAngle` | `pixi:angle-unit-compass` |  | covered |
| `@cp949/vectra/angle/octant` | `octant` | `pixi:angle-octant-dial`, `pixi:rotation-control-dial` |  | covered |
| `@cp949/vectra/angle/quadrant` | `quadrant` |  |  | uncovered |
| `@cp949/vectra/angle/rad-to-deg` | `radToDeg` | `pixi:angle-heading-turn`, `pixi:angle-unit-compass`, `pixi:arc-to-cubic`, `pixi:polar-coordinate-plot`, `pixi:vec-rotate-around`, `pixi:vec-slerp-direction` |  | covered |
| `@cp949/vectra/angle/rad-to-turn` | `radToTurn` | `pixi:angle-unit-compass` |  | covered |
| `@cp949/vectra/angle/reflect-angle` | `reflectAngle` |  |  | uncovered |
| `@cp949/vectra/angle/shortest-lerp-angle` | `shortestLerpAngle` | `pixi:angle-heading-turn` |  | covered |
| `@cp949/vectra/angle/sin-cos` | `sinCos` | `pixi:angle-unit-compass` |  | covered |
| `@cp949/vectra/angle/sin-cos-into` | `sinCosInto` | `pixi:angle-unit-compass` |  | covered |
| `@cp949/vectra/angle/supplement` | `supplement` |  |  | uncovered |
| `@cp949/vectra/angle/sweep-angle` | `sweepAngle` | `pixi:angle-directed-sweep`, `pixi:rotation-control-dial` |  | covered |
| `@cp949/vectra/angle/to-unit-vector` | `toUnitVector` | `pixi:angle-heading-turn` |  | covered |
| `@cp949/vectra/angle/to-unit-vector-into` | `toUnitVectorInto` | `pixi:angle-heading-turn` |  | covered |
| `@cp949/vectra/angle/turn-direction` | `turnDirection` | `pixi:angle-heading-turn` |  | covered |
| `@cp949/vectra/angle/turn-to-deg` | `turnToDeg` | `pixi:angle-unit-compass` |  | covered |
| `@cp949/vectra/angle/turn-to-rad` | `turnToRad` | `pixi:angle-unit-compass` |  | covered |
| `@cp949/vectra/angle/wrap-degrees` | `wrapDegrees` | `pixi:angle-unit-compass` |  | covered |
| `@cp949/vectra/angle/wrap-degrees-positive` | `wrapDegreesPositive` | `pixi:angle-unit-compass` |  | covered |
| `@cp949/vectra/angle/wrap-radians` | `wrapRadians` | `pixi:angle-heading-turn`, `pixi:angle-unit-compass` |  | covered |
| `@cp949/vectra/angle/wrap-radians-positive` | `wrapRadiansPositive` | `pixi:angle-unit-compass`, `pixi:vec-rotate-around`, `pixi:vec-slerp-direction` |  | covered |
| `@cp949/vectra/bounds/bounds-from` | `boundsFrom` |  |  | uncovered |
| `@cp949/vectra/bounds/center-into` | `centerInto` | `canvas:selection-bounds` |  | covered |
| `@cp949/vectra/bounds/closest-point` | `closestPoint` | `pixi:bounds-closest-point`, `pixi:clearance-closest-point-lab` |  | covered |
| `@cp949/vectra/bounds/closest-point-into` | `closestPointInto` | `pixi:bounds-closest-point`, `pixi:clearance-closest-point-lab` |  | covered |
| `@cp949/vectra/bounds/contains-bounds` | `containsBounds` |  |  | uncovered |
| `@cp949/vectra/bounds/contains-point` | `containsPoint` |  |  | uncovered |
| `@cp949/vectra/bounds/copy-into` | `copyInto` |  |  | uncovered |
| `@cp949/vectra/bounds/corners` | `corners` |  |  | uncovered |
| `@cp949/vectra/bounds/corners-into` | `cornersInto` |  |  | uncovered |
| `@cp949/vectra/bounds/create-bounds` | `createBounds` |  |  | uncovered |
| `@cp949/vectra/bounds/distance-to-point` | `distanceToPoint` | `pixi:bounds-point-clearance` |  | covered |
| `@cp949/vectra/bounds/empty-into` | `emptyInto` |  |  | uncovered |
| `@cp949/vectra/bounds/expand-by-into` | `expandByInto` |  |  | uncovered |
| `@cp949/vectra/bounds/expand-by-sides` | `expandBySides` |  |  | uncovered |
| `@cp949/vectra/bounds/expand-by-sides-into` | `expandBySidesInto` |  |  | uncovered |
| `@cp949/vectra/bounds/expand-to-include-bounds-into` | `expandToIncludeBoundsInto` | `pixi:bounds-union-box`, `pixi:rect-layout-workbench` |  | covered |
| `@cp949/vectra/bounds/expand-to-include-point-into` | `expandToIncludePointInto` |  |  | uncovered |
| `@cp949/vectra/bounds/from-center` | `fromCenter` |  |  | uncovered |
| `@cp949/vectra/bounds/from-center-into` | `fromCenterInto` |  |  | uncovered |
| `@cp949/vectra/bounds/from-points` | `fromPoints` | `canvas:selection-bounds` |  | covered |
| `@cp949/vectra/bounds/from-points-into` | `fromPointsInto` | `canvas:selection-bounds` |  | covered |
| `@cp949/vectra/bounds/from-rect` | `fromRect` |  |  | uncovered |
| `@cp949/vectra/bounds/from-rect-into` | `fromRectInto` |  |  | uncovered |
| `@cp949/vectra/bounds/height` | `height` | `canvas:selection-bounds` |  | covered |
| `@cp949/vectra/bounds/high-into` | `highInto` |  |  | uncovered |
| `@cp949/vectra/bounds/intersection` | `intersection` |  |  | uncovered |
| `@cp949/vectra/bounds/intersection-into` | `intersectionInto` |  |  | uncovered |
| `@cp949/vectra/bounds/is-empty` | `isEmpty` |  |  | uncovered |
| `@cp949/vectra/bounds/low-into` | `lowInto` |  |  | uncovered |
| `@cp949/vectra/bounds/sides` | `sides` |  |  | uncovered |
| `@cp949/vectra/bounds/sides-into` | `sidesInto` |  |  | uncovered |
| `@cp949/vectra/bounds/to-rect` | `toRect` | `canvas:selection-bounds` |  | covered |
| `@cp949/vectra/bounds/to-rect-into` | `toRectInto` | `canvas:selection-bounds` |  | covered |
| `@cp949/vectra/bounds/transform` | `transform` | `pixi:bounds-rotated-aabb` |  | covered |
| `@cp949/vectra/bounds/transform-into` | `transformInto` | `pixi:bounds-rotated-aabb` |  | covered |
| `@cp949/vectra/bounds/translate-into` | `translateInto` |  |  | uncovered |
| `@cp949/vectra/bounds/union` | `union` |  |  | uncovered |
| `@cp949/vectra/bounds/union-into` | `unionInto` |  |  | uncovered |
| `@cp949/vectra/bounds/width` | `width` | `canvas:selection-bounds` |  | covered |
| `@cp949/vectra/calculus/backward-difference-matrix` | `backwardDifferenceMatrix` |  |  | uncovered |
| `@cp949/vectra/calculus/backward-difference-matrix-into` | `backwardDifferenceMatrixInto` |  |  | uncovered |
| `@cp949/vectra/calculus/central-difference-matrix` | `centralDifferenceMatrix` |  |  | uncovered |
| `@cp949/vectra/calculus/central-difference-matrix-into` | `centralDifferenceMatrixInto` |  |  | uncovered |
| `@cp949/vectra/calculus/cumulative-sum` | `cumulativeSum` |  |  | uncovered |
| `@cp949/vectra/calculus/cumulative-sum-into` | `cumulativeSumInto` |  |  | uncovered |
| `@cp949/vectra/calculus/cumulative-trapezoid` | `cumulativeTrapezoid` |  |  | uncovered |
| `@cp949/vectra/calculus/cumulative-trapezoid-into` | `cumulativeTrapezoidInto` |  |  | uncovered |
| `@cp949/vectra/calculus/derivative` | `derivative` |  |  | uncovered |
| `@cp949/vectra/calculus/derivative-into` | `derivativeInto` |  |  | uncovered |
| `@cp949/vectra/calculus/diff` | `diff` |  |  | uncovered |
| `@cp949/vectra/calculus/diff-into` | `diffInto` |  |  | uncovered |
| `@cp949/vectra/calculus/forward-difference-matrix` | `forwardDifferenceMatrix` |  |  | uncovered |
| `@cp949/vectra/calculus/forward-difference-matrix-into` | `forwardDifferenceMatrixInto` |  |  | uncovered |
| `@cp949/vectra/calculus/gradient` | `gradient` |  |  | uncovered |
| `@cp949/vectra/calculus/gradient-into` | `gradientInto` |  |  | uncovered |
| `@cp949/vectra/calculus/hessian` | `hessian` |  |  | uncovered |
| `@cp949/vectra/calculus/hessian-into` | `hessianInto` |  |  | uncovered |
| `@cp949/vectra/calculus/jacobian` | `jacobian` |  |  | uncovered |
| `@cp949/vectra/calculus/jacobian-into` | `jacobianInto` |  |  | uncovered |
| `@cp949/vectra/calculus/linspace` | `linspace` |  |  | uncovered |
| `@cp949/vectra/calculus/linspace-into` | `linspaceInto` |  |  | uncovered |
| `@cp949/vectra/calculus/range` | `range` |  |  | uncovered |
| `@cp949/vectra/calculus/range-into` | `rangeInto` |  |  | uncovered |
| `@cp949/vectra/calculus/second-derivative` | `secondDerivative` |  |  | uncovered |
| `@cp949/vectra/calculus/second-derivative-into` | `secondDerivativeInto` |  |  | uncovered |
| `@cp949/vectra/calculus/simpson-integral` | `simpsonIntegral` |  |  | uncovered |
| `@cp949/vectra/calculus/steps` | `steps` |  |  | uncovered |
| `@cp949/vectra/calculus/steps-into` | `stepsInto` |  |  | uncovered |
| `@cp949/vectra/calculus/trapezoidal-integral` | `trapezoidalIntegral` |  |  | uncovered |
| `@cp949/vectra/circle/area` | `area` | `pixi:circle-tank-fill` |  | covered |
| `@cp949/vectra/circle/bounds` | `bounds` |  |  | uncovered |
| `@cp949/vectra/circle/bounds-into` | `boundsInto` |  |  | uncovered |
| `@cp949/vectra/circle/chord-length` | `chordLength` |  |  | uncovered |
| `@cp949/vectra/circle/circle-from` | `circleFrom` |  |  | uncovered |
| `@cp949/vectra/circle/circumference` | `circumference` |  |  | uncovered |
| `@cp949/vectra/circle/closest-point` | `closestPoint` | `pixi:circular-measurement-lab`, `pixi:orbit-segment` |  | covered |
| `@cp949/vectra/circle/closest-point-into` | `closestPointInto` | `pixi:circular-measurement-lab`, `pixi:orbit-segment` |  | covered |
| `@cp949/vectra/circle/contains-circle` | `containsCircle` |  |  | uncovered |
| `@cp949/vectra/circle/contains-point` | `containsPoint` |  |  | uncovered |
| `@cp949/vectra/circle/contains-rect` | `containsRect` |  |  | uncovered |
| `@cp949/vectra/circle/copy-into` | `copyInto` |  |  | uncovered |
| `@cp949/vectra/circle/create-circle` | `createCircle` |  |  | uncovered |
| `@cp949/vectra/circle/distance-to-circle` | `distanceToCircle` | `pixi:circle-circle-clearance` |  | covered |
| `@cp949/vectra/circle/distance-to-point` | `distanceToPoint` | `pixi:circle-point-clearance`, `pixi:clearance-closest-point-lab` |  | covered |
| `@cp949/vectra/circle/expand-by` | `expandBy` |  |  | uncovered |
| `@cp949/vectra/circle/expand-by-into` | `expandByInto` |  |  | uncovered |
| `@cp949/vectra/circle/external-tangents` | `externalTangents` |  |  | uncovered |
| `@cp949/vectra/circle/external-tangents-into` | `externalTangentsInto` |  |  | uncovered |
| `@cp949/vectra/circle/from-bounds` | `fromBounds` |  |  | uncovered |
| `@cp949/vectra/circle/from-bounds-into` | `fromBoundsInto` |  |  | uncovered |
| `@cp949/vectra/circle/from-three-points` | `fromThreePoints` | `pixi:circle-from-three-points` |  | covered |
| `@cp949/vectra/circle/from-three-points-into` | `fromThreePointsInto` | `pixi:circle-from-three-points` |  | covered |
| `@cp949/vectra/circle/internal-tangents` | `internalTangents` |  |  | uncovered |
| `@cp949/vectra/circle/internal-tangents-into` | `internalTangentsInto` |  |  | uncovered |
| `@cp949/vectra/circle/point-at-angle` | `pointAtAngle` | `pixi:circle-tangent-construction`, `pixi:circular-measurement-lab`, `pixi:orbit-segment` |  | covered |
| `@cp949/vectra/circle/point-at-angle-into` | `pointAtAngleInto` | `pixi:circle-tangent-construction`, `pixi:circular-measurement-lab`, `pixi:orbit-segment` |  | covered |
| `@cp949/vectra/circle/point-at-turn` | `pointAtTurn` | `pixi:circle-turn-progress`, `pixi:circular-measurement-lab` |  | covered |
| `@cp949/vectra/circle/point-at-turn-into` | `pointAtTurnInto` | `pixi:circle-turn-progress`, `pixi:circular-measurement-lab` |  | covered |
| `@cp949/vectra/circle/sagitta` | `sagitta` | `pixi:circle-sagitta`, `pixi:circular-measurement-lab` |  | covered |
| `@cp949/vectra/circle/scale` | `scale` |  |  | uncovered |
| `@cp949/vectra/circle/scale-into` | `scaleInto` |  |  | uncovered |
| `@cp949/vectra/circle/sector-area` | `sectorArea` | `pixi:circle-sector-area`, `pixi:circular-measurement-lab` |  | covered |
| `@cp949/vectra/circle/segment-area` | `segmentArea` | `pixi:circle-tank-fill` |  | covered |
| `@cp949/vectra/circle/shrink-by` | `shrinkBy` |  |  | uncovered |
| `@cp949/vectra/circle/shrink-by-into` | `shrinkByInto` |  |  | uncovered |
| `@cp949/vectra/circle/tangent-angles` | `tangentAngles` | `pixi:circle-tangent-construction` |  | covered |
| `@cp949/vectra/circle/tangent-angles-into` | `tangentAnglesInto` | `pixi:circle-tangent-construction` |  | covered |
| `@cp949/vectra/circle/tangent-points-from-external` | `tangentPointsFromExternal` | `pixi:circle-tangent-construction` |  | covered |
| `@cp949/vectra/circle/tangent-points-from-external-into` | `tangentPointsFromExternalInto` | `pixi:circle-tangent-construction` |  | covered |
| `@cp949/vectra/circle/translate` | `translate` |  |  | uncovered |
| `@cp949/vectra/circle/translate-into` | `translateInto` |  |  | uncovered |
| `@cp949/vectra/curve/arc-bounds-into` | `arcBoundsInto` | `canvas:arc-length-probe` |  | covered |
| `@cp949/vectra/curve/arc-closest-point` | `arcClosestPoint` | `canvas:arc-length-probe` |  | covered |
| `@cp949/vectra/curve/arc-closest-point-into` | `arcClosestPointInto` | `canvas:arc-length-probe` |  | covered |
| `@cp949/vectra/curve/arc-flatten` | `arcFlatten` | `pixi:arc-flatten`, `pixi:curve-sampling-workbench` |  | covered |
| `@cp949/vectra/curve/arc-flatten-into` | `arcFlattenInto` | `pixi:arc-flatten`, `pixi:curve-sampling-workbench` |  | covered |
| `@cp949/vectra/curve/arc-length` | `arcLength` |  |  | uncovered |
| `@cp949/vectra/curve/arc-length-at-t` | `arcLengthAtT` | `canvas:arc-length-probe`, `pixi:arc-length-parameterize`, `pixi:curve-sampling-workbench` |  | covered |
| `@cp949/vectra/curve/arc-middle` | `arcMiddle` |  |  | uncovered |
| `@cp949/vectra/curve/arc-middle-into` | `arcMiddleInto` |  |  | uncovered |
| `@cp949/vectra/curve/arc-normal-at` | `arcNormalAt` | `canvas:arc-length-probe` |  | covered |
| `@cp949/vectra/curve/arc-normal-at-into` | `arcNormalAtInto` | `canvas:arc-length-probe` |  | covered |
| `@cp949/vectra/curve/arc-point-at-length` | `arcPointAtLength` | `canvas:arc-length-probe` |  | covered |
| `@cp949/vectra/curve/arc-point-at-length-into` | `arcPointAtLengthInto` | `canvas:arc-length-probe` |  | covered |
| `@cp949/vectra/curve/arc-point-at-t-into` | `arcPointAtTInto` | `canvas:arc-length-probe`, `pixi:arc-length-parameterize`, `pixi:curve-sampling-workbench` |  | covered |
| `@cp949/vectra/curve/arc-sample` | `arcSample` | `canvas:arc-length-probe`, `pixi:arc-to-cubic` |  | covered |
| `@cp949/vectra/curve/arc-sample-into` | `arcSampleInto` | `canvas:arc-length-probe`, `pixi:arc-to-cubic` |  | covered |
| `@cp949/vectra/curve/arc-split-at` | `arcSplitAt` |  |  | uncovered |
| `@cp949/vectra/curve/arc-split-at-into` | `arcSplitAtInto` |  |  | uncovered |
| `@cp949/vectra/curve/arc-t-at-length` | `arcTAtLength` | `pixi:arc-length-parameterize`, `pixi:curve-sampling-workbench` |  | covered |
| `@cp949/vectra/curve/arc-tangent-at-into` | `arcTangentAtInto` | `canvas:arc-length-probe` |  | covered |
| `@cp949/vectra/curve/arc-to-cubic` | `arcToCubic` | `pixi:arc-to-cubic` |  | covered |
| `@cp949/vectra/curve/arc-to-cubic-into` | `arcToCubicInto` | `pixi:arc-to-cubic` |  | covered |
| `@cp949/vectra/curve/bspline-path` | `bsplinePath` | `pixi:spline-path-comparison-lab` |  | covered |
| `@cp949/vectra/curve/bspline-path-into` | `bsplinePathInto` | `pixi:spline-path-comparison-lab` |  | covered |
| `@cp949/vectra/curve/bspline-point-at-t` | `bsplinePointAtT` | `pixi:spline-path-comparison-lab` |  | covered |
| `@cp949/vectra/curve/bspline-point-at-t-into` | `bsplinePointAtTInto` | `pixi:spline-path-comparison-lab` |  | covered |
| `@cp949/vectra/curve/bspline-polyline` | `bsplinePolyline` |  |  | uncovered |
| `@cp949/vectra/curve/bspline-polyline-into` | `bsplinePolylineInto` |  |  | uncovered |
| `@cp949/vectra/curve/bump-x-path` | `bumpXPath` |  |  | uncovered |
| `@cp949/vectra/curve/bump-x-path-into` | `bumpXPathInto` |  |  | uncovered |
| `@cp949/vectra/curve/bump-y-path` | `bumpYPath` |  |  | uncovered |
| `@cp949/vectra/curve/bump-y-path-into` | `bumpYPathInto` |  |  | uncovered |
| `@cp949/vectra/curve/cardinal-path` | `cardinalPath` | `pixi:spline-path-comparison-lab` |  | covered |
| `@cp949/vectra/curve/cardinal-path-into` | `cardinalPathInto` | `pixi:spline-path-comparison-lab` |  | covered |
| `@cp949/vectra/curve/cardinal-point-at-t` | `cardinalPointAtT` | `pixi:spline-path-comparison-lab` |  | covered |
| `@cp949/vectra/curve/cardinal-point-at-t-into` | `cardinalPointAtTInto` | `pixi:spline-path-comparison-lab` |  | covered |
| `@cp949/vectra/curve/cardinal-polyline` | `cardinalPolyline` |  |  | uncovered |
| `@cp949/vectra/curve/cardinal-polyline-into` | `cardinalPolylineInto` |  |  | uncovered |
| `@cp949/vectra/curve/catmull-rom-path` | `catmullRomPath` | `pixi:spline-path-comparison-lab` |  | covered |
| `@cp949/vectra/curve/catmull-rom-path-into` | `catmullRomPathInto` | `pixi:spline-path-comparison-lab` |  | covered |
| `@cp949/vectra/curve/catmull-rom-point-at-t` | `catmullRomPointAtT` | `pixi:spline-path-comparison-lab` |  | covered |
| `@cp949/vectra/curve/catmull-rom-point-at-t-into` | `catmullRomPointAtTInto` | `pixi:spline-path-comparison-lab` |  | covered |
| `@cp949/vectra/curve/catmull-rom-polyline` | `catmullRomPolyline` |  |  | uncovered |
| `@cp949/vectra/curve/catmull-rom-polyline-into` | `catmullRomPolylineInto` |  |  | uncovered |
| `@cp949/vectra/curve/center-arc-to-endpoint` | `centerArcToEndpoint` |  |  | uncovered |
| `@cp949/vectra/curve/center-arc-to-endpoint-into` | `centerArcToEndpointInto` |  |  | uncovered |
| `@cp949/vectra/curve/control-points` | `controlPoints` |  |  | uncovered |
| `@cp949/vectra/curve/control-points-into` | `controlPointsInto` |  |  | uncovered |
| `@cp949/vectra/curve/correct-endpoint-arc-radii` | `correctEndpointArcRadii` |  |  | uncovered |
| `@cp949/vectra/curve/correct-endpoint-arc-radii-into` | `correctEndpointArcRadiiInto` |  |  | uncovered |
| `@cp949/vectra/curve/cubic-bounds-into` | `cubicBoundsInto` | `pixi:cubic-bezier-inspector` |  | covered |
| `@cp949/vectra/curve/cubic-chain-flatten` | `cubicChainFlatten` |  |  | uncovered |
| `@cp949/vectra/curve/cubic-chain-flatten-into` | `cubicChainFlattenInto` |  |  | uncovered |
| `@cp949/vectra/curve/cubic-classify` | `cubicClassify` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-closest-location` | `cubicClosestLocation` |  |  | uncovered |
| `@cp949/vectra/curve/cubic-closest-point` | `cubicClosestPoint` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-closest-point-into` | `cubicClosestPointInto` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-cubic-intersections-into` | `cubicCubicIntersectionsInto` | `pixi:bezier-intersection-workbench` |  | covered |
| `@cp949/vectra/curve/cubic-curvature-at` | `cubicCurvatureAt` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-derivative-at-into` | `cubicDerivativeAtInto` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-extrema` | `cubicExtrema` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-flatten` | `cubicFlatten` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-flatten-into` | `cubicFlattenInto` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-hull` | `cubicHull` | `pixi:cubic-bezier-inspector` |  | covered |
| `@cp949/vectra/curve/cubic-hull-into` | `cubicHullInto` | `pixi:cubic-bezier-inspector` |  | covered |
| `@cp949/vectra/curve/cubic-inflections` | `cubicInflections` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-is-flat-enough` | `cubicIsFlatEnough` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-is-linear` | `cubicIsLinear` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-is-simple` | `cubicIsSimple` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-is-straight` | `cubicIsStraight` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-length` | `cubicLength` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-length-at-t` | `cubicLengthAtT` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-line-intersections-into` | `cubicLineIntersectionsInto` | `pixi:bezier-intersection-workbench` |  | covered |
| `@cp949/vectra/curve/cubic-lookup-table` | `cubicLookupTable` |  |  | uncovered |
| `@cp949/vectra/curve/cubic-lookup-table-into` | `cubicLookupTableInto` |  |  | uncovered |
| `@cp949/vectra/curve/cubic-normal-at-into` | `cubicNormalAtInto` | `pixi:cubic-bezier-inspector` |  | covered |
| `@cp949/vectra/curve/cubic-part` | `cubicPart` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-part-into` | `cubicPartInto` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-point-at-t-into` | `cubicPointAtTInto` | `pixi:cubic-bezier-inspector`, `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-sample` | `cubicSample` | `pixi:bezier-intersection-workbench` |  | covered |
| `@cp949/vectra/curve/cubic-sample-into` | `cubicSampleInto` | `pixi:bezier-intersection-workbench` |  | covered |
| `@cp949/vectra/curve/cubic-second-derivative-at-into` | `cubicSecondDerivativeAtInto` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-self-intersections-into` | `cubicSelfIntersectionsInto` | `pixi:bezier-intersection-workbench` |  | covered |
| `@cp949/vectra/curve/cubic-spaced-points` | `cubicSpacedPoints` |  |  | uncovered |
| `@cp949/vectra/curve/cubic-spaced-points-into` | `cubicSpacedPointsInto` |  |  | uncovered |
| `@cp949/vectra/curve/cubic-split` | `type CubicSplit` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-split` | `cubicSplit` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-split-into` | `cubicSplitInto` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-t-at-length` | `cubicTAtLength` | `pixi:cubic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/cubic-tangent-at-into` | `cubicTangentAtInto` | `pixi:cubic-bezier-inspector` |  | covered |
| `@cp949/vectra/curve/cubic-to-arcs` | `cubicToArcs` |  |  | uncovered |
| `@cp949/vectra/curve/cubic-to-arcs-into` | `cubicToArcsInto` |  |  | uncovered |
| `@cp949/vectra/curve/endpoint-arc-to-center` | `endpointArcToCenter` |  |  | uncovered |
| `@cp949/vectra/curve/endpoint-arc-to-center-into` | `endpointArcToCenterInto` |  |  | uncovered |
| `@cp949/vectra/curve/monotone-x-path` | `monotoneXPath` |  |  | uncovered |
| `@cp949/vectra/curve/monotone-x-path-into` | `monotoneXPathInto` |  |  | uncovered |
| `@cp949/vectra/curve/monotone-x-polyline` | `monotoneXPolyline` |  |  | uncovered |
| `@cp949/vectra/curve/monotone-x-polyline-into` | `monotoneXPolylineInto` |  |  | uncovered |
| `@cp949/vectra/curve/monotone-y-path` | `monotoneYPath` |  |  | uncovered |
| `@cp949/vectra/curve/monotone-y-path-into` | `monotoneYPathInto` |  |  | uncovered |
| `@cp949/vectra/curve/monotone-y-polyline` | `monotoneYPolyline` |  |  | uncovered |
| `@cp949/vectra/curve/monotone-y-polyline-into` | `monotoneYPolylineInto` |  |  | uncovered |
| `@cp949/vectra/curve/natural-spline-path` | `naturalSplinePath` |  |  | uncovered |
| `@cp949/vectra/curve/natural-spline-path-into` | `naturalSplinePathInto` |  |  | uncovered |
| `@cp949/vectra/curve/natural-spline-polyline` | `naturalSplinePolyline` |  |  | uncovered |
| `@cp949/vectra/curve/natural-spline-polyline-into` | `naturalSplinePolylineInto` |  |  | uncovered |
| `@cp949/vectra/curve/quadratic-bounds` | `quadraticBounds` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-bounds-into` | `quadraticBoundsInto` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-closest-location` | `quadraticClosestLocation` |  |  | uncovered |
| `@cp949/vectra/curve/quadratic-closest-point` | `quadraticClosestPoint` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-closest-point-into` | `quadraticClosestPointInto` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-cubic-intersections-into` | `quadraticCubicIntersectionsInto` | `pixi:bezier-intersection-workbench` |  | covered |
| `@cp949/vectra/curve/quadratic-curvature-at` | `quadraticCurvatureAt` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-derivative-at-into` | `quadraticDerivativeAtInto` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-elevate-to-cubic` | `quadraticElevateToCubic` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-elevate-to-cubic-into` | `quadraticElevateToCubicInto` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-extrema` | `quadraticExtrema` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-flatten` | `quadraticFlatten` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-flatten-into` | `quadraticFlattenInto` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-hull` | `quadraticHull` | `pixi:bezier-control-inspector` |  | covered |
| `@cp949/vectra/curve/quadratic-hull-into` | `quadraticHullInto` | `pixi:bezier-control-inspector` |  | covered |
| `@cp949/vectra/curve/quadratic-length` | `quadraticLength` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-length-at-t` | `quadraticLengthAtT` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-line-intersections-into` | `quadraticLineIntersectionsInto` | `pixi:bezier-intersection-workbench` |  | covered |
| `@cp949/vectra/curve/quadratic-lookup-table` | `quadraticLookupTable` |  |  | uncovered |
| `@cp949/vectra/curve/quadratic-lookup-table-into` | `quadraticLookupTableInto` |  |  | uncovered |
| `@cp949/vectra/curve/quadratic-normal-at-into` | `quadraticNormalAtInto` | `pixi:bezier-control-inspector` |  | covered |
| `@cp949/vectra/curve/quadratic-part` | `quadraticPart` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-part-into` | `quadraticPartInto` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-point-at-t` | `quadraticPointAtT` | `pixi:bezier-control-inspector`, `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-point-at-t-into` | `quadraticPointAtTInto` | `pixi:bezier-control-inspector`, `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-quadratic-intersections-into` | `quadraticQuadraticIntersectionsInto` | `pixi:bezier-intersection-workbench` |  | covered |
| `@cp949/vectra/curve/quadratic-sample` | `quadraticSample` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-sample-into` | `quadraticSampleInto` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-spaced-points` | `quadraticSpacedPoints` |  |  | uncovered |
| `@cp949/vectra/curve/quadratic-spaced-points-into` | `quadraticSpacedPointsInto` |  |  | uncovered |
| `@cp949/vectra/curve/quadratic-split` | `type QuadraticSplit` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-split` | `quadraticSplit` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-split-into` | `quadraticSplitInto` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-t-at-length` | `quadraticTAtLength` | `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/quadratic-tangent-at-into` | `quadraticTangentAtInto` | `pixi:bezier-control-inspector`, `pixi:quadratic-curve-analysis-lab` |  | covered |
| `@cp949/vectra/curve/step-after-path` | `stepAfterPath` |  |  | uncovered |
| `@cp949/vectra/curve/step-after-path-into` | `stepAfterPathInto` |  |  | uncovered |
| `@cp949/vectra/curve/step-before-path` | `stepBeforePath` |  |  | uncovered |
| `@cp949/vectra/curve/step-before-path-into` | `stepBeforePathInto` |  |  | uncovered |
| `@cp949/vectra/curve/step-path` | `stepPath` |  |  | uncovered |
| `@cp949/vectra/curve/step-path-into` | `stepPathInto` |  |  | uncovered |
| `@cp949/vectra/curve/step-polyline` | `stepPolyline` |  |  | uncovered |
| `@cp949/vectra/curve/step-polyline-into` | `stepPolylineInto` |  |  | uncovered |
| `@cp949/vectra/easing/almost-identity` | `almostIdentity` |  |  | uncovered |
| `@cp949/vectra/easing/back` | `backIn` |  |  | uncovered |
| `@cp949/vectra/easing/back` | `backInOut` |  |  | uncovered |
| `@cp949/vectra/easing/back` | `backOut` |  |  | uncovered |
| `@cp949/vectra/easing/bezier-scalar` | `bezierScalar` |  |  | uncovered |
| `@cp949/vectra/easing/bias` | `bias` | `pixi:easing-bias-curve` |  | covered |
| `@cp949/vectra/easing/bounce` | `bounceIn` |  |  | uncovered |
| `@cp949/vectra/easing/bounce` | `bounceInOut` |  |  | uncovered |
| `@cp949/vectra/easing/bounce` | `bounceOut` |  |  | uncovered |
| `@cp949/vectra/easing/circ` | `circIn` |  |  | uncovered |
| `@cp949/vectra/easing/circ` | `circInOut` |  |  | uncovered |
| `@cp949/vectra/easing/circ` | `circOut` |  |  | uncovered |
| `@cp949/vectra/easing/constant` | `constant` |  |  | uncovered |
| `@cp949/vectra/easing/css` | `easeCss` |  |  | uncovered |
| `@cp949/vectra/easing/css` | `easeInCss` |  |  | uncovered |
| `@cp949/vectra/easing/css` | `easeInOutCss` |  |  | uncovered |
| `@cp949/vectra/easing/css` | `easeOutCss` |  |  | uncovered |
| `@cp949/vectra/easing/cubic` | `cubicIn` | `pixi:path-morph` |  | covered |
| `@cp949/vectra/easing/cubic` | `cubicInOut` | `pixi:path-morph` |  | covered |
| `@cp949/vectra/easing/cubic` | `cubicOut` | `pixi:path-morph` |  | covered |
| `@cp949/vectra/easing/cubic-bezier` | `cubicBezier` |  |  | uncovered |
| `@cp949/vectra/easing/elastic` | `elasticIn` |  |  | uncovered |
| `@cp949/vectra/easing/elastic` | `elasticInOut` |  |  | uncovered |
| `@cp949/vectra/easing/elastic` | `elasticOut` |  |  | uncovered |
| `@cp949/vectra/easing/exp-step` | `expStep` |  |  | uncovered |
| `@cp949/vectra/easing/expo` | `expoIn` |  |  | uncovered |
| `@cp949/vectra/easing/expo` | `expoInOut` |  |  | uncovered |
| `@cp949/vectra/easing/expo` | `expoOut` |  |  | uncovered |
| `@cp949/vectra/easing/gain` | `gain` |  |  | uncovered |
| `@cp949/vectra/easing/hold` | `hold` |  |  | uncovered |
| `@cp949/vectra/easing/impulse` | `impulse` |  |  | uncovered |
| `@cp949/vectra/easing/linear` | `linear` |  |  | uncovered |
| `@cp949/vectra/easing/parabola` | `parabola` |  |  | uncovered |
| `@cp949/vectra/easing/power` | `powerIn` |  |  | uncovered |
| `@cp949/vectra/easing/power` | `powerInOut` |  |  | uncovered |
| `@cp949/vectra/easing/power` | `powerOut` |  |  | uncovered |
| `@cp949/vectra/easing/quad` | `quadIn` |  |  | uncovered |
| `@cp949/vectra/easing/quad` | `quadInOut` |  |  | uncovered |
| `@cp949/vectra/easing/quad` | `quadOut` |  |  | uncovered |
| `@cp949/vectra/easing/quadratic-bezier` | `quadraticBezier` |  |  | uncovered |
| `@cp949/vectra/easing/quart` | `quartIn` |  |  | uncovered |
| `@cp949/vectra/easing/quart` | `quartInOut` |  |  | uncovered |
| `@cp949/vectra/easing/quart` | `quartOut` |  |  | uncovered |
| `@cp949/vectra/easing/quint` | `quintIn` |  |  | uncovered |
| `@cp949/vectra/easing/quint` | `quintInOut` |  |  | uncovered |
| `@cp949/vectra/easing/quint` | `quintOut` |  |  | uncovered |
| `@cp949/vectra/easing/sigmoid` | `sigmoid` |  |  | uncovered |
| `@cp949/vectra/easing/sine` | `sineIn` |  |  | uncovered |
| `@cp949/vectra/easing/sine` | `sineInOut` |  |  | uncovered |
| `@cp949/vectra/easing/sine` | `sineOut` |  |  | uncovered |
| `@cp949/vectra/easing/smootherstep` | `smootherstep` |  |  | uncovered |
| `@cp949/vectra/easing/smoothstep` | `smoothstep` |  |  | uncovered |
| `@cp949/vectra/easing/step` | `step` |  |  | uncovered |
| `@cp949/vectra/easing/steps` | `steps` | `pixi:stepped-timing-track` |  | covered |
| `@cp949/vectra/easing/with-clamp01` | `withClamp01` |  |  | uncovered |
| `@cp949/vectra/easing/with-in-out` | `withInOut` |  |  | uncovered |
| `@cp949/vectra/easing/with-mirror` | `withMirror` |  |  | uncovered |
| `@cp949/vectra/easing/with-reverse` | `withReverse` |  |  | uncovered |
| `@cp949/vectra/editor-geometry/alignment-guides-into` | `alignmentGuidesInto` | `pixi:editor-snap-guides-lab` |  | covered |
| `@cp949/vectra/editor-geometry/anchor-point` | `anchorPoint` | `pixi:rotate-handle` |  | covered |
| `@cp949/vectra/editor-geometry/anchor-point-into` | `anchorPointInto` | `pixi:rotate-handle` |  | covered |
| `@cp949/vectra/editor-geometry/connector-line` | `connectorLine` |  |  | uncovered |
| `@cp949/vectra/editor-geometry/connector-line-into` | `connectorLineInto` |  |  | uncovered |
| `@cp949/vectra/editor-geometry/constrain-drag` | `constrainDrag` | `pixi:constrain-drag-axis-lock` |  | covered |
| `@cp949/vectra/editor-geometry/constrain-drag-into` | `constrainDragInto` | `pixi:constrain-drag-axis-lock` |  | covered |
| `@cp949/vectra/editor-geometry/constrain-drawing-bounds` | `constrainDrawingBounds` |  |  | uncovered |
| `@cp949/vectra/editor-geometry/constrain-drawing-bounds-into` | `constrainDrawingBoundsInto` |  |  | uncovered |
| `@cp949/vectra/editor-geometry/constrain-resize` | `constrainResize` | `pixi:transform-handles` |  | covered |
| `@cp949/vectra/editor-geometry/constrain-resize-into` | `constrainResizeInto` | `pixi:transform-handles` |  | covered |
| `@cp949/vectra/editor-geometry/constrain-rotate` | `constrainRotate` | `pixi:rotate-handle` |  | covered |
| `@cp949/vectra/editor-geometry/distribute-equally-into` | `distributeEquallyInto` | `pixi:distribute-equal-gaps` |  | covered |
| `@cp949/vectra/editor-geometry/distribute-guides-into` | `distributeGuidesInto` |  |  | uncovered |
| `@cp949/vectra/editor-geometry/group-bounds` | `groupBounds` | `pixi:group-bounds` |  | covered |
| `@cp949/vectra/editor-geometry/group-bounds-into` | `groupBoundsInto` | `pixi:group-bounds` |  | covered |
| `@cp949/vectra/editor-geometry/handle-at-point` | `handleAtPoint` | `pixi:transform-handles` |  | covered |
| `@cp949/vectra/editor-geometry/magnetic-snap` | `magneticSnap` | `pixi:editor-snap-guides-lab` |  | covered |
| `@cp949/vectra/editor-geometry/magnetic-snap-into` | `magneticSnapInto` | `pixi:editor-snap-guides-lab` |  | covered |
| `@cp949/vectra/editor-geometry/pixel-align` | `pixelAlign` | `pixi:pixel-grid-align` |  | covered |
| `@cp949/vectra/editor-geometry/pixel-align-into` | `pixelAlignInto` | `pixi:pixel-grid-align` |  | covered |
| `@cp949/vectra/editor-geometry/resize-handles-into` | `resizeHandlesInto` | `pixi:transform-handles` |  | covered |
| `@cp949/vectra/editor-geometry/rotate-handles-into` | `rotateHandlesInto` | `pixi:rotate-handle` |  | covered |
| `@cp949/vectra/editor-geometry/snap-angle` | `snapAngle` | `pixi:angle-snap-dial`, `pixi:rotation-control-dial` |  | covered |
| `@cp949/vectra/editor-geometry/snap-distance` | `snapDistance` | `pixi:snap-distance-ruler` |  | covered |
| `@cp949/vectra/editor-geometry/snap-grid` | `snapPointToGrid` | `pixi:editor-snap-guides-lab` |  | covered |
| `@cp949/vectra/editor-geometry/snap-grid-into` | `snapPointToGridInto` | `pixi:editor-snap-guides-lab` |  | covered |
| `@cp949/vectra/editor-geometry/snap-point` | `snapPoint` | `pixi:editor-snap-guides-lab` |  | covered |
| `@cp949/vectra/editor-geometry/snap-to-guides` | `snapPointToGuides` | `pixi:editor-snap-guides-lab` |  | covered |
| `@cp949/vectra/editor-geometry/snap-to-segments` | `snapPointToSegments` | `pixi:editor-snap-guides-lab` |  | covered |
| `@cp949/vectra/editor-geometry/snap-to-vertices` | `snapPointToVertices` | `pixi:editor-snap-guides-lab` |  | covered |
| `@cp949/vectra/editor-geometry/transform-from-handles` | `transformFromHandles` | `pixi:transform-handles` |  | covered |
| `@cp949/vectra/editor-geometry/transform-from-handles-into` | `transformFromHandlesInto` | `pixi:transform-handles` |  | covered |
| `@cp949/vectra/editor-geometry/zoom-aware-tolerance` | `zoomAwareTolerance` |  |  | uncovered |
| `@cp949/vectra/ellipse/area` | `area` |  |  | uncovered |
| `@cp949/vectra/ellipse/bounds` | `bounds` | `pixi:ellipse-inspector` |  | covered |
| `@cp949/vectra/ellipse/bounds-into` | `boundsInto` | `pixi:ellipse-inspector` |  | covered |
| `@cp949/vectra/ellipse/circumference` | `circumference` |  |  | uncovered |
| `@cp949/vectra/ellipse/closest-point` | `closestPoint` | `pixi:ellipse-closest-point`, `pixi:ellipse-inspector` |  | covered |
| `@cp949/vectra/ellipse/closest-point-into` | `closestPointInto` | `pixi:ellipse-closest-point`, `pixi:ellipse-inspector` |  | covered |
| `@cp949/vectra/ellipse/contains-circle` | `containsCircle` |  |  | uncovered |
| `@cp949/vectra/ellipse/contains-point` | `containsPoint` | `pixi:ellipse-foci-sum`, `pixi:ellipse-inspector` |  | covered |
| `@cp949/vectra/ellipse/contains-rect` | `containsRect` |  |  | uncovered |
| `@cp949/vectra/ellipse/copy-into` | `copyInto` |  |  | uncovered |
| `@cp949/vectra/ellipse/create-ellipse` | `createEllipse` |  |  | uncovered |
| `@cp949/vectra/ellipse/distance-to-point` | `distanceToPoint` | `pixi:ellipse-foci-sum` |  | covered |
| `@cp949/vectra/ellipse/eccentricity` | `eccentricity` | `pixi:ellipse-foci-sum` |  | covered |
| `@cp949/vectra/ellipse/ellipse-from` | `ellipseFrom` |  |  | uncovered |
| `@cp949/vectra/ellipse/equals` | `equals` |  |  | uncovered |
| `@cp949/vectra/ellipse/expand-by` | `expandBy` | `pixi:ellipse-uniform-expand` |  | covered |
| `@cp949/vectra/ellipse/expand-by-into` | `expandByInto` | `pixi:ellipse-uniform-expand` |  | covered |
| `@cp949/vectra/ellipse/foci` | `foci` | `pixi:ellipse-inspector` |  | covered |
| `@cp949/vectra/ellipse/foci-into` | `fociInto` | `pixi:ellipse-inspector` |  | covered |
| `@cp949/vectra/ellipse/from-bounds` | `fromBounds` |  |  | uncovered |
| `@cp949/vectra/ellipse/from-bounds-into` | `fromBoundsInto` |  |  | uncovered |
| `@cp949/vectra/ellipse/from-circle` | `fromCircle` |  |  | uncovered |
| `@cp949/vectra/ellipse/from-circle-into` | `fromCircleInto` |  |  | uncovered |
| `@cp949/vectra/ellipse/from-foci` | `fromFoci` | `pixi:ellipse-foci-sum` |  | covered |
| `@cp949/vectra/ellipse/from-foci-into` | `fromFociInto` | `pixi:ellipse-foci-sum` |  | covered |
| `@cp949/vectra/ellipse/from-rect` | `fromRect` | `pixi:ellipse-from-rect` |  | covered |
| `@cp949/vectra/ellipse/from-rect-into` | `fromRectInto` | `pixi:ellipse-from-rect` |  | covered |
| `@cp949/vectra/ellipse/is-empty` | `isEmpty` |  |  | uncovered |
| `@cp949/vectra/ellipse/near-equals` | `nearEquals` |  |  | uncovered |
| `@cp949/vectra/ellipse/normal-at` | `normalAt` | `pixi:ellipse-inspector` |  | covered |
| `@cp949/vectra/ellipse/normal-at-into` | `normalAtInto` | `pixi:ellipse-inspector` |  | covered |
| `@cp949/vectra/ellipse/point-at-angle` | `pointAtAngle` | `pixi:ellipse-inspector` |  | covered |
| `@cp949/vectra/ellipse/point-at-angle-into` | `pointAtAngleInto` | `pixi:ellipse-inspector` |  | covered |
| `@cp949/vectra/ellipse/point-at-turn` | `pointAtTurn` | `pixi:ellipse-foci-sum` |  | covered |
| `@cp949/vectra/ellipse/point-at-turn-into` | `pointAtTurnInto` | `pixi:ellipse-foci-sum` |  | covered |
| `@cp949/vectra/ellipse/points` | `points` |  |  | uncovered |
| `@cp949/vectra/ellipse/points-into` | `type EllipsePointsOptions` |  |  | uncovered |
| `@cp949/vectra/ellipse/points-into` | `pointsInto` |  |  | uncovered |
| `@cp949/vectra/ellipse/project-point` | `projectPoint` |  |  | uncovered |
| `@cp949/vectra/ellipse/project-point-into` | `projectPointInto` |  |  | uncovered |
| `@cp949/vectra/ellipse/scale` | `scale` |  |  | uncovered |
| `@cp949/vectra/ellipse/scale-into` | `scaleInto` |  |  | uncovered |
| `@cp949/vectra/ellipse/tangent-at` | `tangentAt` | `pixi:ellipse-inspector` |  | covered |
| `@cp949/vectra/ellipse/tangent-at-into` | `tangentAtInto` | `pixi:ellipse-inspector` |  | covered |
| `@cp949/vectra/ellipse/to-circle` | `toCircle` |  |  | uncovered |
| `@cp949/vectra/ellipse/to-circle-into` | `toCircleInto` |  |  | uncovered |
| `@cp949/vectra/ellipse/transform` | `transform` |  |  | uncovered |
| `@cp949/vectra/ellipse/transform-into` | `transformInto` |  |  | uncovered |
| `@cp949/vectra/ellipse/translate` | `translate` |  |  | uncovered |
| `@cp949/vectra/ellipse/translate-into` | `translateInto` |  |  | uncovered |
| `@cp949/vectra/infinite-line/contains-point` | `containsPoint` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/copy-into` | `copyInto` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/create-infinite-line` | `createInfiniteLine` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/direction` | `direction` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/direction-into` | `directionInto` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/distance-to-point` | `distanceToPoint` | `pixi:infinite-line-point-distance` |  | covered |
| `@cp949/vectra/infinite-line/distance-to-point-sq` | `distanceToPointSq` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/from-angle` | `fromAngle` |  |  | uncovered |
| `@cp949/vectra/infinite-line/from-angle-into` | `fromAngleInto` |  |  | uncovered |
| `@cp949/vectra/infinite-line/from-coefficients` | `fromCoefficients` |  |  | uncovered |
| `@cp949/vectra/infinite-line/from-coefficients-into` | `fromCoefficientsInto` |  |  | uncovered |
| `@cp949/vectra/infinite-line/from-normal` | `fromNormal` |  |  | uncovered |
| `@cp949/vectra/infinite-line/from-normal-into` | `fromNormalInto` |  |  | uncovered |
| `@cp949/vectra/infinite-line/from-points` | `fromPoints` |  |  | uncovered |
| `@cp949/vectra/infinite-line/from-points-into` | `fromPointsInto` |  |  | uncovered |
| `@cp949/vectra/infinite-line/from-segment` | `fromSegment` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/from-segment-into` | `fromSegmentInto` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/from-slope` | `fromSlope` |  |  | uncovered |
| `@cp949/vectra/infinite-line/from-slope-into` | `fromSlopeInto` |  |  | uncovered |
| `@cp949/vectra/infinite-line/infinite-line-from` | `infiniteLineFrom` |  |  | uncovered |
| `@cp949/vectra/infinite-line/is-collinear` | `isCollinear` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/is-degenerate` | `isDegenerate` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/is-parallel` | `isParallel` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/origin` | `origin` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/origin-into` | `originInto` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/point-at-t` | `pointAtT` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/point-at-t-into` | `pointAtTInto` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/project-point` | `projectPoint` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/project-point-into` | `projectPointInto` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/projection-t` | `projectionT` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/reverse` | `reverse` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/reverse-into` | `reverseInto` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/side` | `side` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/signed-distance-to-point` | `signedDistanceToPoint` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/single-intersection` | `singleIntersection` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/infinite-line/single-intersection-into` | `singleIntersectionInto` | `pixi:infinite-line-diagnostics-lab` |  | covered |
| `@cp949/vectra/interpolation/bilerp-point` | `bilerpPoint` | `pixi:bilinear-warp-grid` |  | covered |
| `@cp949/vectra/interpolation/bilerp-point-into` | `bilerpPointInto` | `pixi:bilinear-warp-grid` |  | covered |
| `@cp949/vectra/interpolation/clamped-lerp` | `clampedLerp` |  |  | uncovered |
| `@cp949/vectra/interpolation/cubic` | `cubic` |  |  | uncovered |
| `@cp949/vectra/interpolation/cubic` | `cubicClamped` |  |  | uncovered |
| `@cp949/vectra/interpolation/inverse-lerp` | `inverseLerp` | `pixi:inverse-lerp-track` |  | covered |
| `@cp949/vectra/interpolation/inverse-lerp` | `inverseLerpClamped` | `pixi:inverse-lerp-track` |  | covered |
| `@cp949/vectra/interpolation/lerp-array` | `lerpArray` |  |  | uncovered |
| `@cp949/vectra/interpolation/lerp-array-into` | `lerpArrayInto` |  |  | uncovered |
| `@cp949/vectra/interpolation/lerp-point` | `lerpPoint` | `pixi:path-morph` |  | covered |
| `@cp949/vectra/interpolation/lerp-point-into` | `lerpPointInto` | `pixi:path-morph` |  | covered |
| `@cp949/vectra/interpolation/lerp-tuple` | `lerpTuple` |  |  | uncovered |
| `@cp949/vectra/interpolation/lerp-tuple-into` | `lerpTupleInto` |  |  | uncovered |
| `@cp949/vectra/interpolation/midpoint` | `midpoint` |  |  | uncovered |
| `@cp949/vectra/interpolation/midpoint-into` | `midpointInto` |  |  | uncovered |
| `@cp949/vectra/interpolation/move-toward` | `moveToward` |  |  | uncovered |
| `@cp949/vectra/interpolation/move-toward-point` | `moveTowardPoint` | `pixi:cursor-chase` |  | covered |
| `@cp949/vectra/interpolation/move-toward-point-into` | `moveTowardPointInto` | `pixi:cursor-chase` |  | covered |
| `@cp949/vectra/interpolation/quadratic` | `quadratic` |  |  | uncovered |
| `@cp949/vectra/interpolation/quadratic` | `quadraticClamped` |  |  | uncovered |
| `@cp949/vectra/interpolation/remap` | `remap` | `pixi:easing-bias-curve`, `pixi:easing-motion-timing`, `pixi:stepped-timing-track` |  | covered |
| `@cp949/vectra/interpolation/remap` | `remapClamped` | `pixi:easing-bias-curve`, `pixi:easing-motion-timing`, `pixi:stepped-timing-track` |  | covered |
| `@cp949/vectra/interpolation/sample-parameters` | `sampleParameters` | `pixi:hermite-spline-builder` |  | covered |
| `@cp949/vectra/interpolation/sample-parameters-into` | `sampleParametersInto` | `pixi:hermite-spline-builder` |  | covered |
| `@cp949/vectra/interpolation/sample-table-at` | `sampleTableAt` | `pixi:sample-table-lookup` |  | covered |
| `@cp949/vectra/interpolation/unclamped-lerp` | `mix` |  |  | uncovered |
| `@cp949/vectra/interpolation/unclamped-lerp` | `unclampedLerp` |  |  | uncovered |
| `@cp949/vectra/intersects/curve-curve-intersections` | `curveCurveIntersections` |  |  | uncovered |
| `@cp949/vectra/intersects/curve-curve-intersections-into` | `curveCurveIntersectionsInto` |  |  | uncovered |
| `@cp949/vectra/intersects/curve-self-intersections` | `curveSelfIntersections` |  |  | uncovered |
| `@cp949/vectra/intersects/curve-self-intersections-into` | `curveSelfIntersectionsInto` |  |  | uncovered |
| `@cp949/vectra/intersects/infinite-line-cubic-intersections` | `infiniteLineCubicIntersections` |  |  | uncovered |
| `@cp949/vectra/intersects/infinite-line-cubic-intersections-into` | `infiniteLineCubicIntersectionsInto` |  |  | uncovered |
| `@cp949/vectra/intersects/infinite-line-quadratic-intersections` | `infiniteLineQuadraticIntersections` |  |  | uncovered |
| `@cp949/vectra/intersects/infinite-line-quadratic-intersections-into` | `infiniteLineQuadraticIntersectionsInto` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-bounds-bounds` | `intersectsBoundsBounds` | `pixi:bounds-bounds-overlap` |  | covered |
| `@cp949/vectra/intersects/intersects-bounds-infinite-line` | `intersectsBoundsInfiniteLine` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-bounds-ray` | `intersectsBoundsRay` | `pixi:ray-bounds-hit`, `pixi:raycast-workbench` |  | covered |
| `@cp949/vectra/intersects/intersects-bounds-segment` | `intersectsBoundsSegment` | `pixi:segment-contact-gates-lab` |  | covered |
| `@cp949/vectra/intersects/intersects-bounds-triangle` | `intersectsBoundsTriangle` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-circle-bounds` | `intersectsCircleBounds` | `pixi:segment-contact-gates-lab` |  | covered |
| `@cp949/vectra/intersects/intersects-circle-circle` | `intersectsCircleCircle` | `pixi:circle-circle-overlap` |  | covered |
| `@cp949/vectra/intersects/intersects-circle-infinite-line` | `intersectsCircleInfiniteLine` | `pixi:circle-infinite-line-hit` |  | covered |
| `@cp949/vectra/intersects/intersects-circle-ray` | `intersectsCircleRay` | `pixi:ray-circle-hit`, `pixi:raycast-workbench` |  | covered |
| `@cp949/vectra/intersects/intersects-circle-rect` | `intersectsCircleRect` | `pixi:circle-rect-overlap`, `pixi:shape-hitbox-lab` |  | covered |
| `@cp949/vectra/intersects/intersects-circle-segment` | `intersectsCircleSegment` | `pixi:circular-measurement-lab`, `pixi:orbit-segment`, `pixi:segment-contact-gates-lab` |  | covered |
| `@cp949/vectra/intersects/intersects-circle-triangle` | `intersectsCircleTriangle` | `pixi:segment-contact-gates-lab` |  | covered |
| `@cp949/vectra/intersects/intersects-ellipse-bounds` | `intersectsEllipseBounds` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-ellipse-circle` | `intersectsEllipseCircle` | `pixi:ellipse-circle-overlap` |  | covered |
| `@cp949/vectra/intersects/intersects-ellipse-infinite-line` | `intersectsEllipseInfiniteLine` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-ellipse-ray` | `intersectsEllipseRay` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-ellipse-rect` | `intersectsEllipseRect` | `pixi:ellipse-rect-overlap` |  | covered |
| `@cp949/vectra/intersects/intersects-ellipse-segment` | `intersectsEllipseSegment` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-ellipse-triangle` | `intersectsEllipseTriangle` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-infinite-line-infinite-line` | `intersectsInfiniteLineInfiniteLine` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-infinite-line-ray` | `intersectsInfiniteLineRay` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-infinite-line-segment` | `intersectsInfiniteLineSegment` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-path-bounds` | `intersectsPathBounds` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-path-circle` | `intersectsPathCircle` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-path-infinite-line` | `intersectsPathInfiniteLine` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-path-polygon` | `intersectsPathPolygon` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-path-polyline` | `intersectsPathPolyline` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-path-ray` | `intersectsPathRay` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-path-rect` | `intersectsPathRect` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-path-segment` | `intersectsPathSegment` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-path-triangle` | `intersectsPathTriangle` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-polygon-bounds` | `intersectsPolygonBounds` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-polygon-infinite-line` | `intersectsPolygonInfiniteLine` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-polygon-polyline` | `intersectsPolygonPolyline` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-polygon-ray` | `intersectsPolygonRay` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-polygon-rect` | `intersectsPolygonRect` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-polygon-segment` | `intersectsPolygonSegment` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-polyline-infinite-line` | `intersectsPolylineInfiniteLine` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-polyline-ray` | `intersectsPolylineRay` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-polyline-segment` | `intersectsPolylineSegment` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-ray-ray` | `intersectsRayRay` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-ray-segment` | `intersectsRaySegment` | `pixi:ray-segment-hit`, `pixi:raycast-workbench` |  | covered |
| `@cp949/vectra/intersects/intersects-rect-bounds` | `intersectsRectBounds` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-rect-infinite-line` | `intersectsRectInfiniteLine` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-rect-ray` | `intersectsRectRay` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-rect-rect` | `intersectsRectRect` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-rect-segment` | `intersectsRectSegment` | `pixi:rect-segment-cross` |  | covered |
| `@cp949/vectra/intersects/intersects-rect-triangle` | `intersectsRectTriangle` | `pixi:shape-hitbox-lab`, `pixi:triangle-rect-overlap` |  | covered |
| `@cp949/vectra/intersects/intersects-segment-segment` | `intersectsSegmentSegment` | `pixi:segment-segment-cross`, `pixi:shape-hitbox-lab` |  | covered |
| `@cp949/vectra/intersects/intersects-triangle-infinite-line` | `intersectsTriangleInfiniteLine` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-triangle-ray` | `intersectsTriangleRay` |  |  | uncovered |
| `@cp949/vectra/intersects/intersects-triangle-segment` | `intersectsTriangleSegment` | `pixi:segment-contact-gates-lab` |  | covered |
| `@cp949/vectra/intersects/intersects-triangle-triangle` | `intersectsTriangleTriangle` | `pixi:triangle-triangle-overlap` |  | covered |
| `@cp949/vectra/intersects/line-curve-intersections` | `lineCurveIntersections` |  |  | uncovered |
| `@cp949/vectra/intersects/line-curve-intersections-into` | `lineCurveIntersectionsInto` |  |  | uncovered |
| `@cp949/vectra/intersects/ray-cubic-intersections` | `rayCubicIntersections` | `pixi:ray-cubic-hits`, `pixi:raycast-workbench` |  | covered |
| `@cp949/vectra/intersects/ray-cubic-intersections-into` | `rayCubicIntersectionsInto` | `pixi:ray-cubic-hits`, `pixi:raycast-workbench` |  | covered |
| `@cp949/vectra/intersects/ray-quadratic-intersections` | `rayQuadraticIntersections` |  |  | uncovered |
| `@cp949/vectra/intersects/ray-quadratic-intersections-into` | `rayQuadraticIntersectionsInto` |  |  | uncovered |
| `@cp949/vectra/intersects/segment-cubic-intersections` | `segmentCubicIntersections` |  |  | uncovered |
| `@cp949/vectra/intersects/segment-cubic-intersections-into` | `segmentCubicIntersectionsInto` |  |  | uncovered |
| `@cp949/vectra/intersects/segment-curve-intersections` | `segmentCurveIntersections` |  |  | uncovered |
| `@cp949/vectra/intersects/segment-curve-intersections-into` | `segmentCurveIntersectionsInto` |  |  | uncovered |
| `@cp949/vectra/intersects/segment-quadratic-intersections` | `segmentQuadraticIntersections` |  |  | uncovered |
| `@cp949/vectra/intersects/segment-quadratic-intersections-into` | `segmentQuadraticIntersectionsInto` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-infinite-line-bounds` | `singleIntersectionInfiniteLineBounds` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-infinite-line-bounds-into` | `singleIntersectionInfiniteLineBoundsInto` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-infinite-line-circle` | `singleIntersectionInfiniteLineCircle` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-infinite-line-circle-into` | `singleIntersectionInfiniteLineCircleInto` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-infinite-line-ellipse` | `singleIntersectionInfiniteLineEllipse` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-infinite-line-ellipse-into` | `singleIntersectionInfiniteLineEllipseInto` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-infinite-line-rect` | `singleIntersectionInfiniteLineRect` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-infinite-line-rect-into` | `singleIntersectionInfiniteLineRectInto` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-infinite-line-triangle` | `singleIntersectionInfiniteLineTriangle` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-infinite-line-triangle-into` | `singleIntersectionInfiniteLineTriangleInto` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-ray-bounds` | `singleIntersectionRayBounds` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-ray-bounds-into` | `singleIntersectionRayBoundsInto` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-ray-circle` | `singleIntersectionRayCircle` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-ray-circle-into` | `singleIntersectionRayCircleInto` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-ray-ellipse` | `singleIntersectionRayEllipse` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-ray-ellipse-into` | `singleIntersectionRayEllipseInto` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-ray-infinite-line` | `singleIntersectionRayInfiniteLine` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-ray-infinite-line-into` | `singleIntersectionRayInfiniteLineInto` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-ray-rect` | `singleIntersectionRayRect` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-ray-rect-into` | `singleIntersectionRayRectInto` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-ray-triangle` | `singleIntersectionRayTriangle` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-ray-triangle-into` | `singleIntersectionRayTriangleInto` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-segment-bounds` | `singleIntersectionSegmentBounds` | `pixi:segment-contact-gates-lab` |  | covered |
| `@cp949/vectra/intersects/single-intersection-segment-bounds-into` | `singleIntersectionSegmentBoundsInto` | `pixi:segment-contact-gates-lab` |  | covered |
| `@cp949/vectra/intersects/single-intersection-segment-circle` | `singleIntersectionSegmentCircle` | `pixi:segment-contact-gates-lab` |  | covered |
| `@cp949/vectra/intersects/single-intersection-segment-circle-into` | `singleIntersectionSegmentCircleInto` | `pixi:segment-contact-gates-lab` |  | covered |
| `@cp949/vectra/intersects/single-intersection-segment-ellipse` | `singleIntersectionSegmentEllipse` | `pixi:segment-ellipse-exit` |  | covered |
| `@cp949/vectra/intersects/single-intersection-segment-ellipse-into` | `singleIntersectionSegmentEllipseInto` | `pixi:segment-ellipse-exit` |  | covered |
| `@cp949/vectra/intersects/single-intersection-segment-infinite-line` | `singleIntersectionSegmentInfiniteLine` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-segment-infinite-line-into` | `singleIntersectionSegmentInfiniteLineInto` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-segment-ray` | `singleIntersectionSegmentRay` | `pixi:ray-cast` |  | covered |
| `@cp949/vectra/intersects/single-intersection-segment-ray-into` | `singleIntersectionSegmentRayInto` | `pixi:ray-cast` |  | covered |
| `@cp949/vectra/intersects/single-intersection-segment-rect` | `singleIntersectionSegmentRect` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-segment-rect-into` | `singleIntersectionSegmentRectInto` |  |  | uncovered |
| `@cp949/vectra/intersects/single-intersection-segment-triangle` | `singleIntersectionSegmentTriangle` | `pixi:segment-contact-gates-lab` |  | covered |
| `@cp949/vectra/intersects/single-intersection-segment-triangle-into` | `singleIntersectionSegmentTriangleInto` | `pixi:segment-contact-gates-lab` |  | covered |
| `@cp949/vectra/linalg/add-matrices` | `addMatrices` |  |  | uncovered |
| `@cp949/vectra/linalg/add-matrices-into` | `addMatricesInto` |  |  | uncovered |
| `@cp949/vectra/linalg/add-row-to-row` | `addRowToRow` |  |  | uncovered |
| `@cp949/vectra/linalg/add-row-to-row-into` | `addRowToRowInto` |  |  | uncovered |
| `@cp949/vectra/linalg/add-scalar-multiple-of-row-to-row` | `addScalarMultipleOfRowToRow` |  |  | uncovered |
| `@cp949/vectra/linalg/add-scalar-multiple-of-row-to-row-into` | `addScalarMultipleOfRowToRowInto` |  |  | uncovered |
| `@cp949/vectra/linalg/add-vectors` | `addVectors` |  |  | uncovered |
| `@cp949/vectra/linalg/add-vectors-into` | `addVectorsInto` |  |  | uncovered |
| `@cp949/vectra/linalg/apply-matrix` | `applyMatrix` |  |  | uncovered |
| `@cp949/vectra/linalg/apply-matrix-into` | `applyMatrixInto` |  |  | uncovered |
| `@cp949/vectra/linalg/augment` | `augment` |  |  | uncovered |
| `@cp949/vectra/linalg/augment-into` | `augmentInto` |  |  | uncovered |
| `@cp949/vectra/linalg/backward-substitute-augmented-matrix` | `backwardSubstituteAugmentedMatrix` |  |  | uncovered |
| `@cp949/vectra/linalg/block-matrix` | `blockMatrix` |  |  | uncovered |
| `@cp949/vectra/linalg/block-matrix-into` | `blockMatrixInto` |  |  | uncovered |
| `@cp949/vectra/linalg/calculate-eigenvalues` | `calculateEigenvalues` |  |  | uncovered |
| `@cp949/vectra/linalg/chain-product` | `chainProduct` |  |  | uncovered |
| `@cp949/vectra/linalg/chain-product-into` | `chainProductInto` |  |  | uncovered |
| `@cp949/vectra/linalg/chebyshev-distance` | `chebyshevDistance` |  |  | uncovered |
| `@cp949/vectra/linalg/cholesky-decomposition` | `choleskyDecomposition` |  |  | uncovered |
| `@cp949/vectra/linalg/column` | `column` |  |  | uncovered |
| `@cp949/vectra/linalg/column-into` | `columnInto` |  |  | uncovered |
| `@cp949/vectra/linalg/column-space` | `columnSpace` |  |  | uncovered |
| `@cp949/vectra/linalg/column-space-into` | `columnSpaceInto` |  |  | uncovered |
| `@cp949/vectra/linalg/column-sum-supremum-norm` | `columnSumSupremumNorm` |  |  | uncovered |
| `@cp949/vectra/linalg/combine-matrices` | `combineMatrices` |  |  | uncovered |
| `@cp949/vectra/linalg/combine-matrices-into` | `combineMatricesInto` |  |  | uncovered |
| `@cp949/vectra/linalg/combine-vectors` | `combineVectors` |  |  | uncovered |
| `@cp949/vectra/linalg/combine-vectors-into` | `combineVectorsInto` |  |  | uncovered |
| `@cp949/vectra/linalg/condition-number` | `conditionNumber` |  |  | uncovered |
| `@cp949/vectra/linalg/cross-product` | `crossProduct` |  |  | uncovered |
| `@cp949/vectra/linalg/cross-product-into` | `crossProductInto` |  |  | uncovered |
| `@cp949/vectra/linalg/determinant` | `determinant` |  |  | uncovered |
| `@cp949/vectra/linalg/diagonal` | `diagonal` |  |  | uncovered |
| `@cp949/vectra/linalg/diagonal-into` | `diagonalInto` |  |  | uncovered |
| `@cp949/vectra/linalg/diagonal-matrix` | `diagonalMatrix` |  |  | uncovered |
| `@cp949/vectra/linalg/diagonal-matrix-into` | `diagonalMatrixInto` |  |  | uncovered |
| `@cp949/vectra/linalg/distance` | `distance` |  |  | uncovered |
| `@cp949/vectra/linalg/dot-product` | `dotProduct` |  |  | uncovered |
| `@cp949/vectra/linalg/eig` | `eig` |  |  | uncovered |
| `@cp949/vectra/linalg/eigenvector-for-eigenvalue` | `eigenvectorForEigenvalue` |  |  | uncovered |
| `@cp949/vectra/linalg/equals` | `equals` |  |  | uncovered |
| `@cp949/vectra/linalg/euclidean-norm` | `euclideanNorm` |  |  | uncovered |
| `@cp949/vectra/linalg/exchange-rows` | `exchangeRows` |  |  | uncovered |
| `@cp949/vectra/linalg/exchange-rows-into` | `exchangeRowsInto` |  |  | uncovered |
| `@cp949/vectra/linalg/exp` | `exp` |  |  | uncovered |
| `@cp949/vectra/linalg/exp-into` | `expInto` |  |  | uncovered |
| `@cp949/vectra/linalg/extract-solution-from-rref-augmented-matrix` | `extractSolutionFromRrefAugmentedMatrix` |  |  | uncovered |
| `@cp949/vectra/linalg/fill` | `fill` |  |  | uncovered |
| `@cp949/vectra/linalg/fill-into` | `fillInto` |  |  | uncovered |
| `@cp949/vectra/linalg/forward-substitute-augmented-matrix` | `forwardSubstituteAugmentedMatrix` |  |  | uncovered |
| `@cp949/vectra/linalg/frobenius-norm` | `frobeniusNorm` |  |  | uncovered |
| `@cp949/vectra/linalg/from-columns` | `fromColumns` |  |  | uncovered |
| `@cp949/vectra/linalg/from-index-function` | `fromIndexFunction` |  |  | uncovered |
| `@cp949/vectra/linalg/from-index-function-into` | `fromIndexFunctionInto` |  |  | uncovered |
| `@cp949/vectra/linalg/from-rows` | `fromRows` |  |  | uncovered |
| `@cp949/vectra/linalg/gauss-jordan` | `gaussJordan` |  |  | uncovered |
| `@cp949/vectra/linalg/gauss-jordan-into` | `gaussJordanInto` |  |  | uncovered |
| `@cp949/vectra/linalg/hadamard-matrix-product` | `hadamardMatrixProduct` |  |  | uncovered |
| `@cp949/vectra/linalg/hadamard-matrix-product-into` | `hadamardMatrixProductInto` |  |  | uncovered |
| `@cp949/vectra/linalg/hadamard-product` | `hadamardProduct` |  |  | uncovered |
| `@cp949/vectra/linalg/hadamard-product-into` | `hadamardProductInto` |  |  | uncovered |
| `@cp949/vectra/linalg/identity` | `identity` |  |  | uncovered |
| `@cp949/vectra/linalg/identity-into` | `identityInto` |  |  | uncovered |
| `@cp949/vectra/linalg/inverse` | `inverse` |  |  | uncovered |
| `@cp949/vectra/linalg/inverse-into` | `inverseInto` |  |  | uncovered |
| `@cp949/vectra/linalg/kronecker-product` | `kroneckerProduct` |  |  | uncovered |
| `@cp949/vectra/linalg/kronecker-product-into` | `kroneckerProductInto` |  |  | uncovered |
| `@cp949/vectra/linalg/lu-decomposition` | `luDecomposition` |  |  | uncovered |
| `@cp949/vectra/linalg/magic-square` | `magicSquare` |  |  | uncovered |
| `@cp949/vectra/linalg/magic-square-into` | `magicSquareInto` |  |  | uncovered |
| `@cp949/vectra/linalg/manhattan-distance` | `manhattanDistance` |  |  | uncovered |
| `@cp949/vectra/linalg/matrix-from-sparse-entries` | `matrixFromSparseEntries` |  |  | uncovered |
| `@cp949/vectra/linalg/matrix-from-sparse-entries-into` | `matrixFromSparseEntriesInto` |  |  | uncovered |
| `@cp949/vectra/linalg/matrix-sparse-entries` | `matrixSparseEntries` |  |  | uncovered |
| `@cp949/vectra/linalg/matrix-sparse-entries-into` | `matrixSparseEntriesInto` |  |  | uncovered |
| `@cp949/vectra/linalg/multiply-matrices` | `multiplyMatrices` |  |  | uncovered |
| `@cp949/vectra/linalg/multiply-matrices-into` | `multiplyMatricesInto` |  |  | uncovered |
| `@cp949/vectra/linalg/multiply-row-by-scalar` | `multiplyRowByScalar` |  |  | uncovered |
| `@cp949/vectra/linalg/multiply-row-by-scalar-into` | `multiplyRowByScalarInto` |  |  | uncovered |
| `@cp949/vectra/linalg/near-equals` | `nearEquals` |  |  | uncovered |
| `@cp949/vectra/linalg/normalize` | `normalize` |  |  | uncovered |
| `@cp949/vectra/linalg/normalize-into` | `normalizeInto` |  |  | uncovered |
| `@cp949/vectra/linalg/nuclear-norm` | `nuclearNorm` |  |  | uncovered |
| `@cp949/vectra/linalg/null-space` | `nullSpace` |  |  | uncovered |
| `@cp949/vectra/linalg/null-space-into` | `nullSpaceInto` |  |  | uncovered |
| `@cp949/vectra/linalg/ones` | `ones` |  |  | uncovered |
| `@cp949/vectra/linalg/ones-into` | `onesInto` |  |  | uncovered |
| `@cp949/vectra/linalg/outer-product` | `outerProduct` |  |  | uncovered |
| `@cp949/vectra/linalg/outer-product-into` | `outerProductInto` |  |  | uncovered |
| `@cp949/vectra/linalg/p-norm` | `pNorm` |  |  | uncovered |
| `@cp949/vectra/linalg/pivot` | `pivot` |  |  | uncovered |
| `@cp949/vectra/linalg/pivot-into` | `pivotInto` |  |  | uncovered |
| `@cp949/vectra/linalg/pow` | `pow` |  |  | uncovered |
| `@cp949/vectra/linalg/pow-into` | `powInto` |  |  | uncovered |
| `@cp949/vectra/linalg/pseudo-inverse` | `pseudoInverse` |  |  | uncovered |
| `@cp949/vectra/linalg/pseudo-inverse-into` | `pseudoInverseInto` |  |  | uncovered |
| `@cp949/vectra/linalg/qr-decomposition` | `qrDecomposition` |  |  | uncovered |
| `@cp949/vectra/linalg/rank` | `rank` |  |  | uncovered |
| `@cp949/vectra/linalg/rank-basis` | `rankBasis` |  |  | uncovered |
| `@cp949/vectra/linalg/rank-basis-into` | `rankBasisInto` |  |  | uncovered |
| `@cp949/vectra/linalg/reduced-row-echelon-form` | `reducedRowEchelonForm` |  |  | uncovered |
| `@cp949/vectra/linalg/reduced-row-echelon-form-into` | `reducedRowEchelonFormInto` |  |  | uncovered |
| `@cp949/vectra/linalg/row` | `row` |  |  | uncovered |
| `@cp949/vectra/linalg/row-echelon-form` | `rowEchelonForm` |  |  | uncovered |
| `@cp949/vectra/linalg/row-echelon-form-into` | `rowEchelonFormInto` |  |  | uncovered |
| `@cp949/vectra/linalg/row-into` | `rowInto` |  |  | uncovered |
| `@cp949/vectra/linalg/row-sum-supremum-norm` | `rowSumSupremumNorm` |  |  | uncovered |
| `@cp949/vectra/linalg/scale-matrix` | `scaleMatrix` |  |  | uncovered |
| `@cp949/vectra/linalg/scale-matrix-into` | `scaleMatrixInto` |  |  | uncovered |
| `@cp949/vectra/linalg/scale-vector` | `scaleVector` |  |  | uncovered |
| `@cp949/vectra/linalg/scale-vector-into` | `scaleVectorInto` |  |  | uncovered |
| `@cp949/vectra/linalg/shape` | `shape` |  |  | uncovered |
| `@cp949/vectra/linalg/singular-value-decomposition` | `singularValueDecomposition` |  |  | uncovered |
| `@cp949/vectra/linalg/slog-det` | `slogDet` |  |  | uncovered |
| `@cp949/vectra/linalg/solve-by-backward-substitution` | `solveByBackwardSubstitution` |  |  | uncovered |
| `@cp949/vectra/linalg/solve-by-forward-substitution` | `solveByForwardSubstitution` |  |  | uncovered |
| `@cp949/vectra/linalg/solve-by-gaussian-elimination` | `solveByGaussianElimination` |  |  | uncovered |
| `@cp949/vectra/linalg/solve-triangular-matrix` | `solveTriangularMatrix` |  |  | uncovered |
| `@cp949/vectra/linalg/solve-underdetermined-system` | `solveUnderdeterminedSystem` |  |  | uncovered |
| `@cp949/vectra/linalg/solve-with-cholesky-decomposition` | `solveWithCholeskyDecomposition` |  |  | uncovered |
| `@cp949/vectra/linalg/solve-with-lu-factorization` | `solveWithLuFactorization` |  |  | uncovered |
| `@cp949/vectra/linalg/solve-with-qr-decomposition` | `solveWithQrDecomposition` |  |  | uncovered |
| `@cp949/vectra/linalg/spectral-norm` | `spectralNorm` |  |  | uncovered |
| `@cp949/vectra/linalg/squared-distance` | `squaredDistance` |  |  | uncovered |
| `@cp949/vectra/linalg/subtract-vectors` | `subtractVectors` |  |  | uncovered |
| `@cp949/vectra/linalg/subtract-vectors-into` | `subtractVectorsInto` |  |  | uncovered |
| `@cp949/vectra/linalg/sum-norm` | `sumNorm` |  |  | uncovered |
| `@cp949/vectra/linalg/supremum-norm` | `supremumNorm` |  |  | uncovered |
| `@cp949/vectra/linalg/trace` | `trace` |  |  | uncovered |
| `@cp949/vectra/linalg/transpose` | `transpose` |  |  | uncovered |
| `@cp949/vectra/linalg/transpose-into` | `transposeInto` |  |  | uncovered |
| `@cp949/vectra/linalg/tridiagonal` | `tridiagonal` |  |  | uncovered |
| `@cp949/vectra/linalg/tridiagonal-into` | `tridiagonalInto` |  |  | uncovered |
| `@cp949/vectra/linalg/triple-product` | `tripleProduct` |  |  | uncovered |
| `@cp949/vectra/linalg/vector-from-sparse-entries` | `vectorFromSparseEntries` |  |  | uncovered |
| `@cp949/vectra/linalg/vector-from-sparse-entries-into` | `vectorFromSparseEntriesInto` |  |  | uncovered |
| `@cp949/vectra/linalg/vector-sparse-entries` | `vectorSparseEntries` |  |  | uncovered |
| `@cp949/vectra/linalg/vector-sparse-entries-into` | `vectorSparseEntriesInto` |  |  | uncovered |
| `@cp949/vectra/linalg/zeros` | `zeros` |  |  | uncovered |
| `@cp949/vectra/linalg/zeros-into` | `zerosInto` |  |  | uncovered |
| `@cp949/vectra/math/abs` | `abs` |  |  | uncovered |
| `@cp949/vectra/math/ceil-to` | `ceilTo` |  |  | uncovered |
| `@cp949/vectra/math/clamp` | `clamp` | `pixi:remap-gauge-needle` |  | covered |
| `@cp949/vectra/math/copy-sign` | `copySign` |  |  | uncovered |
| `@cp949/vectra/math/cos-pi` | `cosPi` |  |  | uncovered |
| `@cp949/vectra/math/cycle` | `cycle` | `pixi:vector-steering-field` |  | covered |
| `@cp949/vectra/math/difference` | `difference` |  |  | uncovered |
| `@cp949/vectra/math/floor-to` | `floorTo` |  |  | uncovered |
| `@cp949/vectra/math/fract` | `fract` |  |  | uncovered |
| `@cp949/vectra/math/from-percent` | `fromPercent` |  |  | uncovered |
| `@cp949/vectra/math/fuzzy-ceil` | `fuzzyCeil` |  |  | uncovered |
| `@cp949/vectra/math/fuzzy-equal` | `fuzzyEqual` |  |  | uncovered |
| `@cp949/vectra/math/fuzzy-equal-scaled` | `fuzzyEqualScaled` |  |  | uncovered |
| `@cp949/vectra/math/fuzzy-floor` | `fuzzyFloor` |  |  | uncovered |
| `@cp949/vectra/math/fuzzy-greater-than` | `fuzzyGreaterThan` |  |  | uncovered |
| `@cp949/vectra/math/fuzzy-less-than` | `fuzzyLessThan` |  |  | uncovered |
| `@cp949/vectra/math/gcd` | `gcd` |  |  | uncovered |
| `@cp949/vectra/math/inverse-lerp` | `inverseLerp` |  |  | uncovered |
| `@cp949/vectra/math/is-negative-zero` | `isNegativeZero` |  |  | uncovered |
| `@cp949/vectra/math/is-positive-zero` | `isPositiveZero` |  |  | uncovered |
| `@cp949/vectra/math/is-power-of-two` | `isPowerOfTwo` |  |  | uncovered |
| `@cp949/vectra/math/is-same-sign` | `isSameSign` |  |  | uncovered |
| `@cp949/vectra/math/lcm` | `lcm` |  |  | uncovered |
| `@cp949/vectra/math/lerp` | `lerp` |  |  | uncovered |
| `@cp949/vectra/math/max-add` | `maxAdd` |  |  | uncovered |
| `@cp949/vectra/math/min-sub` | `minSub` |  |  | uncovered |
| `@cp949/vectra/math/next-power-of-two` | `nextPowerOfTwo` |  |  | uncovered |
| `@cp949/vectra/math/percent` | `percent` |  |  | uncovered |
| `@cp949/vectra/math/ping-pong` | `pingPong` | `pixi:math-ping-pong` |  | covered |
| `@cp949/vectra/math/prev-power-of-two` | `prevPowerOfTwo` |  |  | uncovered |
| `@cp949/vectra/math/remap` | `remap` | `pixi:remap-gauge-needle` |  | covered |
| `@cp949/vectra/math/round-away-from-zero` | `roundAwayFromZero` |  |  | uncovered |
| `@cp949/vectra/math/round-to` | `roundTo` |  |  | uncovered |
| `@cp949/vectra/math/sawtooth-wave` | `sawtoothWave` |  |  | uncovered |
| `@cp949/vectra/math/sign` | `sign` |  |  | uncovered |
| `@cp949/vectra/math/sin-pi` | `sinPi` |  |  | uncovered |
| `@cp949/vectra/math/sinc` | `sinc` |  |  | uncovered |
| `@cp949/vectra/math/snap-ceil` | `snapCeil` | `pixi:grid-snap-bracket` |  | covered |
| `@cp949/vectra/math/snap-floor` | `snapFloor` | `pixi:grid-snap-bracket` |  | covered |
| `@cp949/vectra/math/snap-to` | `snapTo` | `pixi:grid-snap-bracket` |  | covered |
| `@cp949/vectra/math/solve-cubic` | `solveCubic` |  |  | uncovered |
| `@cp949/vectra/math/solve-linear` | `solveLinear` |  |  | uncovered |
| `@cp949/vectra/math/solve-quadratic` | `solveQuadratic` |  |  | uncovered |
| `@cp949/vectra/math/sqrt1pm1` | `sqrt1pm1` |  |  | uncovered |
| `@cp949/vectra/math/square-wave` | `squareWave` |  |  | uncovered |
| `@cp949/vectra/math/to-fixed-precision` | `toFixedPrecision` |  |  | uncovered |
| `@cp949/vectra/math/triangle-wave` | `triangleWave` |  |  | uncovered |
| `@cp949/vectra/math/trunc` | `trunc` |  |  | uncovered |
| `@cp949/vectra/math/within` | `within` |  |  | uncovered |
| `@cp949/vectra/math/wrap-float-half-open` | `wrapFloatHalfOpen` |  |  | uncovered |
| `@cp949/vectra/math/wrap-int-half-open` | `wrapIntHalfOpen` | `pixi:wrap-int-ring` |  | covered |
| `@cp949/vectra/math/wrap-int-inclusive` | `wrapIntInclusive` | `pixi:wrap-int-ring` |  | covered |
| `@cp949/vectra/math/wrap-range` | `wrapRange` |  |  | uncovered |
| `@cp949/vectra/matrix/append-rotate-into` | `appendRotateInto` | `pixi:matrix-lerp-blend` |  | covered |
| `@cp949/vectra/matrix/append-scale-into` | `appendScaleInto` | `pixi:matrix-lerp-blend` |  | covered |
| `@cp949/vectra/matrix/append-translate-into` | `appendTranslateInto` | `pixi:matrix-lerp-blend` |  | covered |
| `@cp949/vectra/matrix/clamp-viewport-bounds` | `clampViewportBounds` |  |  | uncovered |
| `@cp949/vectra/matrix/clamp-viewport-bounds-into` | `clampViewportBoundsInto` |  |  | uncovered |
| `@cp949/vectra/matrix/copy-into` | `copyInto` |  |  | uncovered |
| `@cp949/vectra/matrix/create-matrix` | `createMatrix` | `pixi:matrix-lerp-blend`, `pixi:matrix-mirror-reflection`, `pixi:matrix-shear-transform`, `pixi:rotate-handle`, `pixi:transform-handles` |  | covered |
| `@cp949/vectra/matrix/decompose` | `decompose` |  |  | uncovered |
| `@cp949/vectra/matrix/decompose-into` | `decomposeInto` |  |  | uncovered |
| `@cp949/vectra/matrix/decompose-scaling` | `decomposeScaling` |  |  | uncovered |
| `@cp949/vectra/matrix/decompose-scaling-into` | `decomposeScalingInto` |  |  | uncovered |
| `@cp949/vectra/matrix/decompose-translation` | `decomposeTranslation` |  |  | uncovered |
| `@cp949/vectra/matrix/decompose-translation-into` | `decomposeTranslationInto` |  |  | uncovered |
| `@cp949/vectra/matrix/deg-to-rad` | `degToRad` | `canvas:adapter-interop`, `canvas:matrix-transform` |  | covered |
| `@cp949/vectra/matrix/determinant` | `determinant` | `pixi:matrix-lerp-blend`, `pixi:matrix-mirror-reflection` |  | covered |
| `@cp949/vectra/matrix/equals` | `equals` |  |  | uncovered |
| `@cp949/vectra/matrix/fit-bounds` | `fitBounds` | `canvas:matrix-viewport-fit` |  | covered |
| `@cp949/vectra/matrix/fit-bounds-into` | `fitBoundsInto` | `canvas:matrix-viewport-fit` |  | covered |
| `@cp949/vectra/matrix/fit-rect` | `fitRect` | `pixi:content-fit-workbench` |  | covered |
| `@cp949/vectra/matrix/fit-rect-into` | `fitRectInto` | `pixi:content-fit-workbench` |  | covered |
| `@cp949/vectra/matrix/from-array-6` | `fromArray6` |  |  | uncovered |
| `@cp949/vectra/matrix/from-array-6-into` | `fromArray6Into` |  |  | uncovered |
| `@cp949/vectra/matrix/from-array-9` | `fromArray9` |  |  | uncovered |
| `@cp949/vectra/matrix/from-array-9-into` | `fromArray9Into` |  |  | uncovered |
| `@cp949/vectra/matrix/identity-into` | `identityInto` |  |  | uncovered |
| `@cp949/vectra/matrix/invert` | `invert` | `canvas:matrix-viewport-fit` |  | covered |
| `@cp949/vectra/matrix/invert-into` | `invertInto` | `canvas:matrix-viewport-fit` |  | covered |
| `@cp949/vectra/matrix/is-identity` | `isIdentity` |  |  | uncovered |
| `@cp949/vectra/matrix/is-invertible` | `isInvertible` | `canvas:matrix-viewport-fit` |  | covered |
| `@cp949/vectra/matrix/lerp` | `lerp` | `pixi:matrix-lerp-blend` |  | covered |
| `@cp949/vectra/matrix/lerp-into` | `lerpInto` | `pixi:matrix-lerp-blend` |  | covered |
| `@cp949/vectra/matrix/matrix-from` | `matrixFrom` |  |  | uncovered |
| `@cp949/vectra/matrix/multiply` | `multiply` | `canvas:adapter-interop`, `canvas:matrix-transform`, `pixi:matrix-mirror-reflection`, `pixi:matrix-shear-transform`, `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/matrix/multiply-into` | `multiplyInto` | `canvas:adapter-interop`, `canvas:matrix-transform`, `pixi:matrix-mirror-reflection`, `pixi:matrix-shear-transform`, `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/matrix/near-equals` | `nearEquals` |  |  | uncovered |
| `@cp949/vectra/matrix/pre-multiply-into` | `preMultiplyInto` |  |  | uncovered |
| `@cp949/vectra/matrix/rad-to-deg` | `radToDeg` |  |  | uncovered |
| `@cp949/vectra/matrix/reflection` | `reflection` | `pixi:matrix-mirror-reflection` |  | covered |
| `@cp949/vectra/matrix/reflection-into` | `reflectionInto` | `pixi:matrix-mirror-reflection` |  | covered |
| `@cp949/vectra/matrix/rotation` | `rotation` |  |  | uncovered |
| `@cp949/vectra/matrix/rotation-around-point` | `rotationAroundPoint` | `pixi:bounds-rotated-aabb`, `pixi:polygon-transform-orientation-lab`, `pixi:rotate-handle` |  | covered |
| `@cp949/vectra/matrix/rotation-around-point-into` | `rotationAroundPointInto` | `pixi:bounds-rotated-aabb`, `pixi:polygon-transform-orientation-lab`, `pixi:rotate-handle` |  | covered |
| `@cp949/vectra/matrix/rotation-matrix-into` | `rotationMatrixInto` | `canvas:adapter-interop`, `canvas:matrix-transform` |  | covered |
| `@cp949/vectra/matrix/scale-around-point` | `scaleAroundPoint` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/matrix/scale-around-point-into` | `scaleAroundPointInto` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/matrix/scaling-matrix-into` | `scalingMatrixInto` | `canvas:adapter-interop`, `canvas:matrix-transform` |  | covered |
| `@cp949/vectra/matrix/skew-x` | `skewX` | `pixi:matrix-shear-transform` |  | covered |
| `@cp949/vectra/matrix/skew-x-into` | `skewXInto` | `pixi:matrix-shear-transform` |  | covered |
| `@cp949/vectra/matrix/skew-y` | `skewY` |  |  | uncovered |
| `@cp949/vectra/matrix/skew-y-into` | `skewYInto` |  |  | uncovered |
| `@cp949/vectra/matrix/skewing` | `skewing` |  |  | uncovered |
| `@cp949/vectra/matrix/skewing-into` | `skewingInto` |  |  | uncovered |
| `@cp949/vectra/matrix/to-array-6` | `toArray6` |  |  | uncovered |
| `@cp949/vectra/matrix/to-array-6-into` | `toArray6Into` |  |  | uncovered |
| `@cp949/vectra/matrix/to-array-9` | `toArray9` |  |  | uncovered |
| `@cp949/vectra/matrix/to-array-9-into` | `toArray9Into` |  |  | uncovered |
| `@cp949/vectra/matrix/transform-bounds` | `transformBounds` | `canvas:matrix-viewport-fit`, `pixi:content-fit-workbench`, `pixi:transform-handles` |  | covered |
| `@cp949/vectra/matrix/transform-bounds-into` | `transformBoundsInto` | `canvas:matrix-viewport-fit`, `pixi:content-fit-workbench`, `pixi:transform-handles` |  | covered |
| `@cp949/vectra/matrix/transform-point` | `transformPoint` | `canvas:matrix-transform`, `canvas:matrix-viewport-fit`, `pixi:content-fit-workbench`, `pixi:matrix-lerp-blend`, `pixi:matrix-mirror-reflection`, `pixi:matrix-shear-transform`, `pixi:rotate-handle` |  | covered |
| `@cp949/vectra/matrix/transform-point-into` | `transformPointInto` | `canvas:matrix-transform`, `canvas:matrix-viewport-fit`, `pixi:content-fit-workbench`, `pixi:matrix-lerp-blend`, `pixi:matrix-mirror-reflection`, `pixi:matrix-shear-transform`, `pixi:rotate-handle` |  | covered |
| `@cp949/vectra/matrix/transform-points` | `transformPoints` | `pixi:bounds-rotated-aabb` |  | covered |
| `@cp949/vectra/matrix/transform-points-into` | `transformPointsInto` | `pixi:bounds-rotated-aabb` |  | covered |
| `@cp949/vectra/matrix/transform-rect` | `transformRect` | `canvas:matrix-transform` |  | covered |
| `@cp949/vectra/matrix/transform-rect-into` | `transformRectInto` | `canvas:matrix-transform` |  | covered |
| `@cp949/vectra/matrix/transform-vector` | `transformVector` | `canvas:matrix-viewport-fit` |  | covered |
| `@cp949/vectra/matrix/transform-vector-into` | `transformVectorInto` | `canvas:matrix-viewport-fit` |  | covered |
| `@cp949/vectra/matrix/translation-matrix-into` | `translationMatrixInto` | `canvas:adapter-interop`, `canvas:matrix-transform`, `pixi:matrix-mirror-reflection`, `pixi:matrix-shear-transform` |  | covered |
| `@cp949/vectra/matrix/zoom-at-point` | `zoomAtPoint` |  |  | uncovered |
| `@cp949/vectra/matrix/zoom-at-point-into` | `zoomAtPointInto` |  |  | uncovered |
| `@cp949/vectra/matrix/zoom-to-fit` | `zoomToFit` |  |  | uncovered |
| `@cp949/vectra/matrix/zoom-to-fit-into` | `zoomToFitInto` |  |  | uncovered |
| `@cp949/vectra/path/arc-by-endpoint-commands` | `arcByEndpointCommands` |  |  | uncovered |
| `@cp949/vectra/path/arc-by-endpoint-commands-into` | `arcByEndpointCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/arc-through-commands` | `arcThroughCommands` |  |  | uncovered |
| `@cp949/vectra/path/arc-through-commands-into` | `arcThroughCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/area` | `area` |  |  | uncovered |
| `@cp949/vectra/path/bounds` | `bounds` |  |  | uncovered |
| `@cp949/vectra/path/bounds-into` | `boundsInto` |  |  | uncovered |
| `@cp949/vectra/path/circle-commands` | `circleCommands` |  |  | uncovered |
| `@cp949/vectra/path/circle-commands-into` | `circleCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/classify-point` | `classifyPoint` |  |  | uncovered |
| `@cp949/vectra/path/closest-point` | `closestPoint` | `pixi:clearance-closest-point-lab`, `pixi:curve-sampling-workbench`, `pixi:path-closest-point` |  | covered |
| `@cp949/vectra/path/closest-point-into` | `closestPointInto` | `pixi:clearance-closest-point-lab`, `pixi:curve-sampling-workbench`, `pixi:path-closest-point` |  | covered |
| `@cp949/vectra/path/command-at` | `commandAt` |  |  | uncovered |
| `@cp949/vectra/path/command-count` | `commandCount` |  |  | uncovered |
| `@cp949/vectra/path/contains-point` | `containsPoint` | `pixi:path-fill-hit-test` |  | covered |
| `@cp949/vectra/path/cubic-through-commands` | `cubicThroughCommands` |  |  | uncovered |
| `@cp949/vectra/path/cubic-through-commands-into` | `cubicThroughCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/curvature-at-length` | `curvatureAtLength` |  |  | uncovered |
| `@cp949/vectra/path/distance-to-point` | `distanceToPoint` | `pixi:curve-sampling-workbench` |  | covered |
| `@cp949/vectra/path/draw-direction` | `drawDirection` |  |  | uncovered |
| `@cp949/vectra/path/ellipse-commands` | `ellipseCommands` |  |  | uncovered |
| `@cp949/vectra/path/ellipse-commands-into` | `ellipseCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/equalize-segments` | `type EqualizedSegments` | `pixi:path-morph` |  | covered |
| `@cp949/vectra/path/equalize-segments` | `equalizeSegments` | `pixi:path-morph` |  | covered |
| `@cp949/vectra/path/equalize-segments-into` | `equalizeSegmentsInto` | `pixi:path-morph` |  | covered |
| `@cp949/vectra/path/flatten` | `flatten` | `pixi:path-morph` |  | covered |
| `@cp949/vectra/path/flatten-into` | `flattenInto` | `pixi:path-morph` |  | covered |
| `@cp949/vectra/path/for-each-command` | `forEachCommand` |  |  | uncovered |
| `@cp949/vectra/path/for-each-segment` | `forEachSegment` |  |  | uncovered |
| `@cp949/vectra/path/from-ellipse` | `fromEllipse` |  |  | uncovered |
| `@cp949/vectra/path/from-ellipse-into` | `fromEllipseInto` |  |  | uncovered |
| `@cp949/vectra/path/is-clockwise` | `isClockwise` |  |  | uncovered |
| `@cp949/vectra/path/is-path-command` | `isPathCommand` |  |  | uncovered |
| `@cp949/vectra/path/is-path-command-list` | `isPathCommandList` |  |  | uncovered |
| `@cp949/vectra/path/length` | `length` |  |  | uncovered |
| `@cp949/vectra/path/length-at-location` | `lengthAtLocation` |  |  | uncovered |
| `@cp949/vectra/path/line-commands` | `lineCommands` |  |  | uncovered |
| `@cp949/vectra/path/line-commands-into` | `lineCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/location-at-length` | `locationAtLength` |  |  | uncovered |
| `@cp949/vectra/path/normal-at-length` | `normalAtLength` |  |  | uncovered |
| `@cp949/vectra/path/normal-at-length-into` | `normalAtLengthInto` |  |  | uncovered |
| `@cp949/vectra/path/normalize-commands` | `normalizeCommands` | `pixi:path-morph` |  | covered |
| `@cp949/vectra/path/normalize-commands-into` | `normalizeCommandsInto` | `pixi:path-morph` |  | covered |
| `@cp949/vectra/path/orient-commands` | `orientCommands` |  |  | uncovered |
| `@cp949/vectra/path/orient-commands-into` | `orientCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/partial` | `partial` |  |  | uncovered |
| `@cp949/vectra/path/partial-into` | `partialInto` |  |  | uncovered |
| `@cp949/vectra/path/point-at-length` | `pointAtLength` |  |  | uncovered |
| `@cp949/vectra/path/point-at-length-into` | `pointAtLengthInto` |  |  | uncovered |
| `@cp949/vectra/path/point-at-length-ratio` | `pointAtLengthRatio` |  |  | uncovered |
| `@cp949/vectra/path/point-at-length-ratio-into` | `pointAtLengthRatioInto` |  |  | uncovered |
| `@cp949/vectra/path/polygon-commands` | `polygonCommands` |  |  | uncovered |
| `@cp949/vectra/path/polygon-commands-into` | `polygonCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/polyline-commands` | `polylineCommands` |  |  | uncovered |
| `@cp949/vectra/path/polyline-commands-into` | `polylineCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/properties-at-length` | `propertiesAtLength` |  |  | uncovered |
| `@cp949/vectra/path/quadratic-through-commands` | `quadraticThroughCommands` |  |  | uncovered |
| `@cp949/vectra/path/quadratic-through-commands-into` | `quadraticThroughCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/rect-commands` | `rectCommands` |  |  | uncovered |
| `@cp949/vectra/path/rect-commands-into` | `rectCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/regular-polygon-commands` | `regularPolygonCommands` |  |  | uncovered |
| `@cp949/vectra/path/regular-polygon-commands-into` | `regularPolygonCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/remove-collinear-commands` | `removeCollinearCommands` |  |  | uncovered |
| `@cp949/vectra/path/remove-collinear-commands-into` | `removeCollinearCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/reverse-commands` | `reverseCommands` |  |  | uncovered |
| `@cp949/vectra/path/reverse-commands-into` | `reverseCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/rounded-rect-commands` | `roundedRectCommands` |  |  | uncovered |
| `@cp949/vectra/path/rounded-rect-commands-into` | `roundedRectCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/sanitize-commands` | `sanitizeCommands` |  |  | uncovered |
| `@cp949/vectra/path/sanitize-commands-into` | `sanitizeCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/segment-commands` | `segmentCommands` |  |  | uncovered |
| `@cp949/vectra/path/segment-commands-into` | `segmentCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/signed-area` | `signedArea` |  |  | uncovered |
| `@cp949/vectra/path/split-at-length` | `type PathSplitResult` |  |  | uncovered |
| `@cp949/vectra/path/split-at-length` | `splitAtLength` |  |  | uncovered |
| `@cp949/vectra/path/split-at-length-into` | `splitAtLengthInto` |  |  | uncovered |
| `@cp949/vectra/path/split-subpaths` | `splitSubpaths` |  |  | uncovered |
| `@cp949/vectra/path/split-subpaths-into` | `splitSubpathsInto` |  |  | uncovered |
| `@cp949/vectra/path/star-commands` | `starCommands` |  |  | uncovered |
| `@cp949/vectra/path/star-commands-into` | `starCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/subpath-at` | `subpathAt` |  |  | uncovered |
| `@cp949/vectra/path/subpath-bounds` | `subpathBounds` |  |  | uncovered |
| `@cp949/vectra/path/subpath-bounds-into` | `subpathBoundsInto` |  |  | uncovered |
| `@cp949/vectra/path/subpath-count` | `subpathCount` |  |  | uncovered |
| `@cp949/vectra/path/tangent-at-length` | `tangentAtLength` |  |  | uncovered |
| `@cp949/vectra/path/tangent-at-length-into` | `tangentAtLengthInto` |  |  | uncovered |
| `@cp949/vectra/path/transform-commands` | `transformCommands` |  |  | uncovered |
| `@cp949/vectra/path/transform-commands-into` | `transformCommandsInto` |  |  | uncovered |
| `@cp949/vectra/path/winding` | `winding` |  |  | uncovered |
| `@cp949/vectra/polygon/area` | `area` | `canvas:polygon-hit-test`, `canvas:random-sampling` |  | covered |
| `@cp949/vectra/polygon/bounding-circle` | `boundingCircle` | `pixi:polygon-metrics-workbench` |  | covered |
| `@cp949/vectra/polygon/bounding-circle-into` | `boundingCircleInto` | `pixi:polygon-metrics-workbench` |  | covered |
| `@cp949/vectra/polygon/bounds` | `bounds` | `canvas:polygon-hit-test`, `canvas:random-sampling` |  | covered |
| `@cp949/vectra/polygon/bounds-into` | `boundsInto` | `canvas:polygon-hit-test`, `canvas:random-sampling` |  | covered |
| `@cp949/vectra/polygon/centroid` | `centroid` | `pixi:polygon-metrics-workbench` |  | covered |
| `@cp949/vectra/polygon/centroid-into` | `centroidInto` | `pixi:polygon-metrics-workbench` |  | covered |
| `@cp949/vectra/polygon/classify-point` | `classifyPoint` | `pixi:polygon-metrics-workbench` |  | covered |
| `@cp949/vectra/polygon/closest-point` | `closestPoint` | `canvas:polygon-hit-test` |  | covered |
| `@cp949/vectra/polygon/closest-point-into` | `closestPointInto` | `canvas:polygon-hit-test` |  | covered |
| `@cp949/vectra/polygon/contains-point` | `containsPoint` | `canvas:polygon-hit-test`, `canvas:random-sampling` |  | covered |
| `@cp949/vectra/polygon/create-polygon` | `createPolygon` |  |  | uncovered |
| `@cp949/vectra/polygon/distance-to-point` | `distanceToPoint` | `canvas:polygon-hit-test` |  | covered |
| `@cp949/vectra/polygon/edge-at` | `edgeAt` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polygon/edge-at-into` | `edgeAtInto` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polygon/edge-count` | `edgeCount` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polygon/from-bounds` | `fromBounds` |  |  | uncovered |
| `@cp949/vectra/polygon/from-bounds-into` | `fromBoundsInto` |  |  | uncovered |
| `@cp949/vectra/polygon/from-circle-approximation` | `fromCircleApproximation` |  |  | uncovered |
| `@cp949/vectra/polygon/from-circle-approximation-into` | `fromCircleApproximationInto` |  |  | uncovered |
| `@cp949/vectra/polygon/from-ellipse-approximation` | `fromEllipseApproximation` |  |  | uncovered |
| `@cp949/vectra/polygon/from-ellipse-approximation-into` | `fromEllipseApproximationInto` |  |  | uncovered |
| `@cp949/vectra/polygon/from-rect` | `fromRect` |  |  | uncovered |
| `@cp949/vectra/polygon/from-rect-into` | `fromRectInto` |  |  | uncovered |
| `@cp949/vectra/polygon/from-triangle` | `fromTriangle` |  |  | uncovered |
| `@cp949/vectra/polygon/from-triangle-into` | `fromTriangleInto` |  |  | uncovered |
| `@cp949/vectra/polygon/is-clockwise` | `isClockwise` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polygon/is-counter-clockwise` | `isCounterClockwise` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polygon/is-empty` | `isEmpty` |  |  | uncovered |
| `@cp949/vectra/polygon/perimeter` | `perimeter` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polygon/point-at-index` | `pointAtIndex` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polygon/point-at-index-into` | `pointAtIndexInto` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polygon/point-count` | `pointCount` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polygon/polygon-from` | `polygonFrom` | `pixi:polygon-metrics-workbench`, `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polygon/regular-polygon` | `regularPolygon` | `pixi:regular-polygon-construct` |  | covered |
| `@cp949/vectra/polygon/regular-polygon-into` | `regularPolygonInto` | `pixi:regular-polygon-construct` |  | covered |
| `@cp949/vectra/polygon/reverse-points` | `reversePoints` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polygon/reverse-points-into` | `reversePointsInto` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polygon/signed-area` | `signedArea` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polygon/star-polygon` | `starPolygon` | `pixi:star-polygon-spikes` |  | covered |
| `@cp949/vectra/polygon/star-polygon-into` | `starPolygonInto` | `pixi:star-polygon-spikes` |  | covered |
| `@cp949/vectra/polygon/transform-points` | `transformPoints` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polygon/transform-points-into` | `transformPointsInto` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polygon/translate-points` | `translatePoints` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polygon/translate-points-into` | `translatePointsInto` | `pixi:polygon-transform-orientation-lab` |  | covered |
| `@cp949/vectra/polyline/bounds` | `bounds` |  |  | uncovered |
| `@cp949/vectra/polyline/bounds-into` | `boundsInto` |  |  | uncovered |
| `@cp949/vectra/polyline/closest-point` | `closestPoint` | `pixi:polyline-path-walk` |  | covered |
| `@cp949/vectra/polyline/closest-point-into` | `closestPointInto` | `pixi:polyline-path-walk` |  | covered |
| `@cp949/vectra/polyline/create-polyline` | `createPolyline` |  |  | uncovered |
| `@cp949/vectra/polyline/distance-to-point` | `distanceToPoint` | `pixi:curve-sampling-workbench`, `pixi:polyline-distance-probe` |  | covered |
| `@cp949/vectra/polyline/has-segments` | `hasSegments` |  |  | uncovered |
| `@cp949/vectra/polyline/length` | `length` | `pixi:polyline-length-ratio`, `pixi:polyline-path-walk` |  | covered |
| `@cp949/vectra/polyline/point-at-index` | `pointAtIndex` |  |  | uncovered |
| `@cp949/vectra/polyline/point-at-index-into` | `pointAtIndexInto` |  |  | uncovered |
| `@cp949/vectra/polyline/point-at-length` | `pointAtLength` | `pixi:polyline-path-walk` |  | covered |
| `@cp949/vectra/polyline/point-at-length-into` | `pointAtLengthInto` | `pixi:polyline-path-walk` |  | covered |
| `@cp949/vectra/polyline/point-at-length-ratio` | `pointAtLengthRatio` | `pixi:curve-sampling-workbench`, `pixi:polyline-length-ratio` |  | covered |
| `@cp949/vectra/polyline/point-at-length-ratio-into` | `pointAtLengthRatioInto` | `pixi:curve-sampling-workbench`, `pixi:polyline-length-ratio` |  | covered |
| `@cp949/vectra/polyline/polyline-from` | `polylineFrom` |  |  | uncovered |
| `@cp949/vectra/polyline/reverse-points` | `reversePoints` |  |  | uncovered |
| `@cp949/vectra/polyline/reverse-points-into` | `reversePointsInto` |  |  | uncovered |
| `@cp949/vectra/polyline/sample-fixed-count` | `sampleFixedCount` | `pixi:polyline-path-walk` |  | covered |
| `@cp949/vectra/polyline/sample-fixed-count-into` | `sampleFixedCountInto` | `pixi:polyline-path-walk` |  | covered |
| `@cp949/vectra/polyline/sample-uniform` | `sampleUniform` | `pixi:polyline-path-walk` |  | covered |
| `@cp949/vectra/polyline/sample-uniform-into` | `sampleUniformInto` | `pixi:polyline-path-walk` |  | covered |
| `@cp949/vectra/polyline/segment-at` | `segmentAt` |  |  | uncovered |
| `@cp949/vectra/polyline/segment-at-into` | `segmentAtInto` |  |  | uncovered |
| `@cp949/vectra/polyline/segment-count` | `segmentCount` |  |  | uncovered |
| `@cp949/vectra/polyline/simplify` | `simplify` | `pixi:polyline-path-walk` |  | covered |
| `@cp949/vectra/polyline/simplify-into` | `simplifyInto` | `pixi:polyline-path-walk` |  | covered |
| `@cp949/vectra/polyline/tangent-at-index` | `tangentAtIndex` | `pixi:polyline-path-walk` |  | covered |
| `@cp949/vectra/polyline/tangent-at-index-into` | `tangentAtIndexInto` | `pixi:polyline-path-walk` |  | covered |
| `@cp949/vectra/polyline/tangents` | `tangents` | `pixi:curve-sampling-workbench`, `pixi:polyline-vertex-tangents` |  | covered |
| `@cp949/vectra/polyline/tangents-into` | `tangentsInto` | `pixi:curve-sampling-workbench`, `pixi:polyline-vertex-tangents` |  | covered |
| `@cp949/vectra/polyline/transform-points` | `transformPoints` |  |  | uncovered |
| `@cp949/vectra/polyline/transform-points-into` | `transformPointsInto` |  |  | uncovered |
| `@cp949/vectra/polyline/translate-points` | `translatePoints` |  |  | uncovered |
| `@cp949/vectra/polyline/translate-points-into` | `translatePointsInto` |  |  | uncovered |
| `@cp949/vectra/random-state/create-random-state` | `createRandomState` |  |  | uncovered |
| `@cp949/vectra/random-state/create-random-state` | `type RandomState` |  |  | uncovered |
| `@cp949/vectra/random-state/rand` | `rand` |  |  | uncovered |
| `@cp949/vectra/random/angle` | `angle` |  |  | uncovered |
| `@cp949/vectra/random/bernoulli` | `bernoulli` | `pixi:bernoulli-trial-tally` |  | covered |
| `@cp949/vectra/random/binomial` | `binomial` |  |  | uncovered |
| `@cp949/vectra/random/choice` | `choice` |  |  | uncovered |
| `@cp949/vectra/random/create-rng` | `createRng` | `canvas:random-boundary-sampling`, `canvas:random-distribution-sampling`, `pixi:bernoulli-trial-tally`, `pixi:normal-distribution-histogram`, `pixi:weighted-loot-table` |  | covered |
| `@cp949/vectra/random/create-rng` | `type RandomSeed` | `canvas:random-boundary-sampling`, `canvas:random-distribution-sampling`, `pixi:bernoulli-trial-tally`, `pixi:normal-distribution-histogram`, `pixi:weighted-loot-table` |  | covered |
| `@cp949/vectra/random/direction` | `direction` | `canvas:random-distribution-sampling`, `pixi:vector-steering-field` |  | covered |
| `@cp949/vectra/random/direction-into` | `directionInto` | `canvas:random-distribution-sampling`, `pixi:vector-steering-field` |  | covered |
| `@cp949/vectra/random/exponential` | `exponential` |  |  | uncovered |
| `@cp949/vectra/random/float` | `float` | `pixi:vector-steering-field` |  | covered |
| `@cp949/vectra/random/geometric` | `geometric` |  |  | uncovered |
| `@cp949/vectra/random/int` | `int` |  |  | uncovered |
| `@cp949/vectra/random/log-normal` | `logNormal` |  |  | uncovered |
| `@cp949/vectra/random/normal` | `normal` | `pixi:normal-distribution-histogram` |  | covered |
| `@cp949/vectra/random/permutation` | `permutation` |  |  | uncovered |
| `@cp949/vectra/random/pick-unique` | `pickUnique` |  |  | uncovered |
| `@cp949/vectra/random/pick-unique-into` | `pickUniqueInto` |  |  | uncovered |
| `@cp949/vectra/random/point-in-bounds` | `pointInBounds` | `canvas:random-sampling` |  | covered |
| `@cp949/vectra/random/point-in-bounds-into` | `pointInBoundsInto` | `canvas:random-sampling` |  | covered |
| `@cp949/vectra/random/point-in-circle` | `pointInCircle` | `canvas:random-distribution-sampling` |  | covered |
| `@cp949/vectra/random/point-in-circle-into` | `pointInCircleInto` | `canvas:random-distribution-sampling` |  | covered |
| `@cp949/vectra/random/point-in-ellipse` | `pointInEllipse` | `canvas:random-boundary-sampling` |  | covered |
| `@cp949/vectra/random/point-in-ellipse-into` | `pointInEllipseInto` | `canvas:random-boundary-sampling` |  | covered |
| `@cp949/vectra/random/point-in-polygon` | `pointInPolygon` | `canvas:random-distribution-sampling` |  | covered |
| `@cp949/vectra/random/point-in-polygon-into` | `pointInPolygonInto` | `canvas:random-distribution-sampling` |  | covered |
| `@cp949/vectra/random/point-in-rect` | `pointInRect` | `canvas:random-distribution-sampling` |  | covered |
| `@cp949/vectra/random/point-in-rect-into` | `pointInRectInto` | `canvas:random-distribution-sampling` |  | covered |
| `@cp949/vectra/random/point-in-triangle` | `pointInTriangle` | `canvas:random-boundary-sampling` |  | covered |
| `@cp949/vectra/random/point-in-triangle-into` | `pointInTriangleInto` | `canvas:random-boundary-sampling` |  | covered |
| `@cp949/vectra/random/point-on-circle` | `pointOnCircle` | `canvas:random-distribution-sampling` |  | covered |
| `@cp949/vectra/random/point-on-circle-into` | `pointOnCircleInto` | `canvas:random-distribution-sampling` |  | covered |
| `@cp949/vectra/random/point-on-path` | `pointOnPath` | `canvas:random-boundary-sampling` |  | covered |
| `@cp949/vectra/random/point-on-path-into` | `pointOnPathInto` | `canvas:random-boundary-sampling` |  | covered |
| `@cp949/vectra/random/point-on-polyline` | `pointOnPolyline` | `canvas:random-boundary-sampling` |  | covered |
| `@cp949/vectra/random/point-on-polyline-into` | `pointOnPolylineInto` | `canvas:random-boundary-sampling` |  | covered |
| `@cp949/vectra/random/point-on-segment` | `pointOnSegment` | `pixi:random-point-on-segment` |  | covered |
| `@cp949/vectra/random/point-on-segment-into` | `pointOnSegmentInto` | `pixi:random-point-on-segment` |  | covered |
| `@cp949/vectra/random/poisson` | `poisson` |  |  | uncovered |
| `@cp949/vectra/random/random` | `type RandomSource` |  |  | uncovered |
| `@cp949/vectra/random/random` | `random` |  |  | uncovered |
| `@cp949/vectra/random/random-index` | `randomIndex` |  |  | uncovered |
| `@cp949/vectra/random/random-uint32` | `randomUint32` |  |  | uncovered |
| `@cp949/vectra/random/range-permutation` | `rangePermutation` |  |  | uncovered |
| `@cp949/vectra/random/range-permutation-into` | `rangePermutationInto` |  |  | uncovered |
| `@cp949/vectra/random/sample` | `sample` |  |  | uncovered |
| `@cp949/vectra/random/sample-into` | `sampleInto` |  |  | uncovered |
| `@cp949/vectra/random/secure-random-source` | `secureRandomSource` |  |  | uncovered |
| `@cp949/vectra/random/shuffle` | `shuffle` |  |  | uncovered |
| `@cp949/vectra/random/shuffle-in-place` | `shuffleInPlace` |  |  | uncovered |
| `@cp949/vectra/random/shuffle-into` | `shuffleInto` |  |  | uncovered |
| `@cp949/vectra/random/sign` | `sign` |  |  | uncovered |
| `@cp949/vectra/random/standard-normal` | `standardNormal` |  |  | uncovered |
| `@cp949/vectra/random/triangular` | `triangular` |  |  | uncovered |
| `@cp949/vectra/random/uniform` | `uniform` |  |  | uncovered |
| `@cp949/vectra/random/unique-indices` | `uniqueIndices` |  |  | uncovered |
| `@cp949/vectra/random/unique-indices-into` | `uniqueIndicesInto` |  |  | uncovered |
| `@cp949/vectra/random/weighted-choice` | `weightedChoice` | `pixi:weighted-loot-table` |  | covered |
| `@cp949/vectra/random/weighted-probability` | `type WeightedProbabilitySample` |  |  | uncovered |
| `@cp949/vectra/random/weighted-probability` | `weightedProbability` |  |  | uncovered |
| `@cp949/vectra/random/weighted-random-index` | `weightedRandomIndex` |  |  | uncovered |
| `@cp949/vectra/random/weighted-shuffle` | `weightedShuffle` |  |  | uncovered |
| `@cp949/vectra/ray/closest-point` | `closestPoint` | `pixi:ray-closest-point` |  | covered |
| `@cp949/vectra/ray/closest-point-into` | `closestPointInto` | `pixi:ray-closest-point` |  | covered |
| `@cp949/vectra/ray/contains-point` | `containsPoint` | `pixi:ray-contains-point` |  | covered |
| `@cp949/vectra/ray/copy-into` | `copyInto` | `pixi:ray-intersection-lab` |  | covered |
| `@cp949/vectra/ray/create-ray` | `createRay` | `pixi:ray-intersection-lab` |  | covered |
| `@cp949/vectra/ray/direction` | `direction` |  |  | uncovered |
| `@cp949/vectra/ray/direction-into` | `directionInto` |  |  | uncovered |
| `@cp949/vectra/ray/distance-to-point` | `distanceToPoint` | `pixi:ray-closest-point` |  | covered |
| `@cp949/vectra/ray/distance-to-point-sq` | `distanceToPointSq` | `pixi:ray-intersection-lab` |  | covered |
| `@cp949/vectra/ray/from-angle` | `fromAngle` | `pixi:ray-cast` |  | covered |
| `@cp949/vectra/ray/from-angle-into` | `fromAngleInto` | `pixi:ray-cast` |  | covered |
| `@cp949/vectra/ray/from-segment` | `fromSegment` |  |  | uncovered |
| `@cp949/vectra/ray/from-segment-into` | `fromSegmentInto` |  |  | uncovered |
| `@cp949/vectra/ray/is-degenerate` | `isDegenerate` | `pixi:ray-intersection-lab` |  | covered |
| `@cp949/vectra/ray/origin` | `origin` |  |  | uncovered |
| `@cp949/vectra/ray/origin-into` | `originInto` |  |  | uncovered |
| `@cp949/vectra/ray/point-at-t` | `pointAtT` | `pixi:ray-intersection-lab` |  | covered |
| `@cp949/vectra/ray/point-at-t-into` | `pointAtTInto` | `pixi:ray-intersection-lab` |  | covered |
| `@cp949/vectra/ray/project-point` | `projectPoint` |  |  | uncovered |
| `@cp949/vectra/ray/project-point-into` | `projectPointInto` |  |  | uncovered |
| `@cp949/vectra/ray/projection-t` | `projectionT` | `pixi:ray-closest-point` |  | covered |
| `@cp949/vectra/ray/ray-from` | `rayFrom` | `pixi:ray-intersection-lab` |  | covered |
| `@cp949/vectra/ray/reverse` | `reverse` | `pixi:ray-intersection-lab` |  | covered |
| `@cp949/vectra/ray/reverse-into` | `reverseInto` | `pixi:ray-intersection-lab` |  | covered |
| `@cp949/vectra/ray/single-intersection` | `singleIntersection` | `pixi:ray-intersection-lab` |  | covered |
| `@cp949/vectra/ray/single-intersection-into` | `singleIntersectionInto` | `pixi:ray-intersection-lab` |  | covered |
| `@cp949/vectra/rect/area` | `area` | `pixi:rect-intersection-clip` |  | covered |
| `@cp949/vectra/rect/bottom` | `bottom` |  |  | uncovered |
| `@cp949/vectra/rect/bottom-left-into` | `bottomLeftInto` |  |  | uncovered |
| `@cp949/vectra/rect/bottom-right-into` | `bottomRightInto` |  |  | uncovered |
| `@cp949/vectra/rect/center-into` | `centerInto` |  |  | uncovered |
| `@cp949/vectra/rect/contains-point` | `containsPoint` | `pixi:rect-contains-point`, `pixi:shape-hitbox-lab` |  | covered |
| `@cp949/vectra/rect/contains-rect` | `containsRect` | `pixi:rect-contains-rect` |  | covered |
| `@cp949/vectra/rect/copy-into` | `copyInto` |  |  | uncovered |
| `@cp949/vectra/rect/corners` | `corners` |  |  | uncovered |
| `@cp949/vectra/rect/corners-into` | `cornersInto` |  |  | uncovered |
| `@cp949/vectra/rect/create-rect` | `createRect` |  |  | uncovered |
| `@cp949/vectra/rect/expand-to-include-point-into` | `expandToIncludePointInto` | `pixi:rect-expand-to-include-point`, `pixi:rect-layout-workbench` |  | covered |
| `@cp949/vectra/rect/expand-to-include-rect-into` | `expandToIncludeRectInto` |  |  | uncovered |
| `@cp949/vectra/rect/fit-inside` | `fitInside` | `pixi:content-fit-workbench` |  | covered |
| `@cp949/vectra/rect/fit-inside-into` | `fitInsideInto` | `pixi:content-fit-workbench` |  | covered |
| `@cp949/vectra/rect/fit-outside` | `fitOutside` | `pixi:content-fit-workbench` |  | covered |
| `@cp949/vectra/rect/fit-outside-into` | `fitOutsideInto` | `pixi:content-fit-workbench` |  | covered |
| `@cp949/vectra/rect/from-bounds` | `fromBounds` |  |  | uncovered |
| `@cp949/vectra/rect/from-bounds-into` | `fromBoundsInto` |  |  | uncovered |
| `@cp949/vectra/rect/from-center-into` | `fromCenterInto` |  |  | uncovered |
| `@cp949/vectra/rect/from-points-into` | `fromPointsInto` |  |  | uncovered |
| `@cp949/vectra/rect/halves` | `halves` | `pixi:rect-halves-split`, `pixi:rect-layout-workbench` |  | covered |
| `@cp949/vectra/rect/halves-into` | `halvesInto` | `pixi:rect-halves-split`, `pixi:rect-layout-workbench` |  | covered |
| `@cp949/vectra/rect/inflate-into` | `inflateInto` | `pixi:rect-layout-workbench`, `pixi:rect-uniform-inflate` |  | covered |
| `@cp949/vectra/rect/intersection` | `intersection` | `pixi:rect-intersection-clip` |  | covered |
| `@cp949/vectra/rect/intersection-into` | `intersectionInto` | `pixi:rect-intersection-clip` |  | covered |
| `@cp949/vectra/rect/is-empty` | `isEmpty` |  |  | uncovered |
| `@cp949/vectra/rect/left` | `left` |  |  | uncovered |
| `@cp949/vectra/rect/perimeter-point` | `perimeterPoint` | `pixi:rect-perimeter-walk` |  | covered |
| `@cp949/vectra/rect/perimeter-point-into` | `perimeterPointInto` | `pixi:rect-perimeter-walk` |  | covered |
| `@cp949/vectra/rect/perimeter-points` | `perimeterPoints` | `pixi:rect-perimeter-walk` |  | covered |
| `@cp949/vectra/rect/perimeter-points-into` | `perimeterPointsInto` | `pixi:rect-perimeter-walk` |  | covered |
| `@cp949/vectra/rect/quadrants` | `quadrants` | `pixi:rect-quadrants-split` |  | covered |
| `@cp949/vectra/rect/quadrants-into` | `quadrantsInto` | `pixi:rect-quadrants-split` |  | covered |
| `@cp949/vectra/rect/rect-from` | `rectFrom` |  |  | uncovered |
| `@cp949/vectra/rect/right` | `right` |  |  | uncovered |
| `@cp949/vectra/rect/same-dimensions` | `sameDimensions` |  |  | uncovered |
| `@cp949/vectra/rect/scale-into` | `scaleInto` |  |  | uncovered |
| `@cp949/vectra/rect/sides` | `sides` |  |  | uncovered |
| `@cp949/vectra/rect/sides-into` | `sidesInto` |  |  | uncovered |
| `@cp949/vectra/rect/size-into` | `sizeInto` |  |  | uncovered |
| `@cp949/vectra/rect/to-bounds-into` | `toBoundsInto` |  |  | uncovered |
| `@cp949/vectra/rect/to-square` | `toSquare` |  |  | uncovered |
| `@cp949/vectra/rect/to-square-into` | `toSquareInto` |  |  | uncovered |
| `@cp949/vectra/rect/top` | `top` |  |  | uncovered |
| `@cp949/vectra/rect/top-left-into` | `topLeftInto` |  |  | uncovered |
| `@cp949/vectra/rect/top-right-into` | `topRightInto` |  |  | uncovered |
| `@cp949/vectra/rect/translate-into` | `translateInto` |  |  | uncovered |
| `@cp949/vectra/rect/union` | `union` |  |  | uncovered |
| `@cp949/vectra/rect/union-into` | `unionInto` |  |  | uncovered |
| `@cp949/vectra/segment/angle` | `angle` |  |  | uncovered |
| `@cp949/vectra/segment/bounds-into` | `boundsInto` | `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/center-on` | `centerOn` | `pixi:segment-angle-builder` |  | covered |
| `@cp949/vectra/segment/center-on-into` | `centerOnInto` | `pixi:segment-angle-builder` |  | covered |
| `@cp949/vectra/segment/classify-point` | `classifyPoint` | `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/closest-point` | `closestPoint` | `canvas:segment-snap` |  | covered |
| `@cp949/vectra/segment/closest-point-into` | `closestPointInto` | `canvas:segment-snap` |  | covered |
| `@cp949/vectra/segment/contains-point` | `containsPoint` | `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/copy-into` | `copyInto` |  |  | uncovered |
| `@cp949/vectra/segment/create-segment` | `createSegment` |  |  | uncovered |
| `@cp949/vectra/segment/distance-to-point` | `distanceToPoint` | `canvas:segment-snap` |  | covered |
| `@cp949/vectra/segment/distance-to-point-sq` | `distanceToPointSq` | `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/end` | `end` |  |  | uncovered |
| `@cp949/vectra/segment/end-into` | `endInto` |  |  | uncovered |
| `@cp949/vectra/segment/extend` | `extend` | `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/extend-into` | `extendInto` | `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/from-angle` | `fromAngle` | `pixi:segment-angle-builder`, `pixi:segment-construction-lab` |  | covered |
| `@cp949/vectra/segment/from-angle-into` | `fromAngleInto` | `pixi:segment-angle-builder`, `pixi:segment-construction-lab` |  | covered |
| `@cp949/vectra/segment/from-circle` | `fromCircle` | `pixi:segment-construction-lab`, `pixi:segment-from-circle` |  | covered |
| `@cp949/vectra/segment/from-circle-into` | `fromCircleInto` | `pixi:segment-construction-lab`, `pixi:segment-from-circle` |  | covered |
| `@cp949/vectra/segment/from-midpoint-angle-length` | `fromMidpointAngleLength` | `pixi:segment-construction-lab`, `pixi:segment-from-midpoint` |  | covered |
| `@cp949/vectra/segment/from-midpoint-angle-length-into` | `fromMidpointAngleLengthInto` | `pixi:segment-construction-lab`, `pixi:segment-from-midpoint` |  | covered |
| `@cp949/vectra/segment/from-normal` | `fromNormal` | `pixi:segment-construction-lab`, `pixi:segment-from-normal` |  | covered |
| `@cp949/vectra/segment/from-normal-into` | `fromNormalInto` | `pixi:segment-construction-lab`, `pixi:segment-from-normal` |  | covered |
| `@cp949/vectra/segment/from-point-vector` | `fromPointVector` |  |  | uncovered |
| `@cp949/vectra/segment/from-point-vector-into` | `fromPointVectorInto` |  |  | uncovered |
| `@cp949/vectra/segment/height` | `height` |  |  | uncovered |
| `@cp949/vectra/segment/is-zero-length` | `isZeroLength` |  |  | uncovered |
| `@cp949/vectra/segment/length` | `length` | `canvas:segment-snap`, `pixi:curve-sampling-workbench`, `pixi:segment-point-at-length`, `pixi:segment-rotate-origin`, `pixi:triangle-construction-lab` |  | covered |
| `@cp949/vectra/segment/length-sq` | `lengthSq` |  |  | uncovered |
| `@cp949/vectra/segment/midpoint` | `midpoint` | `pixi:segment-angle-builder`, `pixi:segment-construction-lab`, `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/midpoint-into` | `midpointInto` | `pixi:segment-angle-builder`, `pixi:segment-construction-lab`, `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/nearest-point-on-supporting-line` | `nearestPointOnSupportingLine` | `pixi:segment-supporting-line-foot` |  | covered |
| `@cp949/vectra/segment/nearest-point-on-supporting-line-into` | `nearestPointOnSupportingLineInto` | `pixi:segment-supporting-line-foot` |  | covered |
| `@cp949/vectra/segment/normal` | `normal` | `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/normal-angle` | `normalAngle` | `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/normal-into` | `normalInto` | `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/perp-slope` | `perpSlope` |  |  | uncovered |
| `@cp949/vectra/segment/point-at-length` | `pointAtLength` | `pixi:curve-sampling-workbench`, `pixi:segment-point-at-length` |  | covered |
| `@cp949/vectra/segment/point-at-length-into` | `pointAtLengthInto` | `pixi:curve-sampling-workbench`, `pixi:segment-point-at-length` |  | covered |
| `@cp949/vectra/segment/point-at-t` | `pointAtT` | `pixi:circular-measurement-lab`, `pixi:easing-bias-curve`, `pixi:easing-motion-timing`, `pixi:orbit-segment`, `pixi:stepped-timing-track` |  | covered |
| `@cp949/vectra/segment/point-at-t-into` | `pointAtTInto` | `pixi:circular-measurement-lab`, `pixi:easing-bias-curve`, `pixi:easing-motion-timing`, `pixi:orbit-segment`, `pixi:stepped-timing-track` |  | covered |
| `@cp949/vectra/segment/project-point` | `projectPoint` | `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/project-point-into` | `projectPointInto` | `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/projection-t` | `projectionT` | `canvas:segment-snap`, `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/reverse` | `reverse` |  |  | uncovered |
| `@cp949/vectra/segment/reverse-into` | `reverseInto` |  |  | uncovered |
| `@cp949/vectra/segment/rotate` | `rotate` | `pixi:segment-rotate-origin` |  | covered |
| `@cp949/vectra/segment/rotate-around` | `rotateAround` | `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/rotate-around-into` | `rotateAroundInto` | `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/rotate-into` | `rotateInto` | `pixi:segment-rotate-origin` |  | covered |
| `@cp949/vectra/segment/segment-from` | `segmentFrom` |  |  | uncovered |
| `@cp949/vectra/segment/side-of-supporting-line` | `sideOfSupportingLine` | `pixi:segment-supporting-line-foot` |  | covered |
| `@cp949/vectra/segment/signed-distance-to-supporting-line` | `signedDistanceToSupportingLine` | `pixi:segment-supporting-line-foot` |  | covered |
| `@cp949/vectra/segment/single-intersection` | `singleIntersection` | `pixi:segment-intersection-point` |  | covered |
| `@cp949/vectra/segment/single-intersection-into` | `singleIntersectionInto` | `pixi:segment-intersection-point` |  | covered |
| `@cp949/vectra/segment/slope` | `slope` |  |  | uncovered |
| `@cp949/vectra/segment/start` | `start` |  |  | uncovered |
| `@cp949/vectra/segment/start-into` | `startInto` |  |  | uncovered |
| `@cp949/vectra/segment/transform` | `transform` |  |  | uncovered |
| `@cp949/vectra/segment/transform-into` | `transformInto` |  |  | uncovered |
| `@cp949/vectra/segment/translate` | `translate` | `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/translate-into` | `translateInto` | `pixi:segment-offset-normal-lab` |  | covered |
| `@cp949/vectra/segment/vector` | `vector` |  |  | uncovered |
| `@cp949/vectra/segment/vector-into` | `vectorInto` |  |  | uncovered |
| `@cp949/vectra/segment/width` | `width` |  |  | uncovered |
| `@cp949/vectra/statistics/bincount` | `bincount` |  |  | uncovered |
| `@cp949/vectra/statistics/bincount-into` | `bincountInto` |  |  | uncovered |
| `@cp949/vectra/statistics/calculate-linear-least-squares` | `calculateLinearLeastSquares` |  |  | uncovered |
| `@cp949/vectra/statistics/center` | `center` |  |  | uncovered |
| `@cp949/vectra/statistics/center-into` | `centerInto` |  |  | uncovered |
| `@cp949/vectra/statistics/correlation` | `correlation` |  |  | uncovered |
| `@cp949/vectra/statistics/correlation-matrix` | `correlationMatrix` |  |  | uncovered |
| `@cp949/vectra/statistics/correlation-matrix-into` | `correlationMatrixInto` |  |  | uncovered |
| `@cp949/vectra/statistics/covariance` | `covariance` |  |  | uncovered |
| `@cp949/vectra/statistics/covariance-matrix` | `covarianceMatrix` |  |  | uncovered |
| `@cp949/vectra/statistics/covariance-matrix-into` | `covarianceMatrixInto` |  |  | uncovered |
| `@cp949/vectra/statistics/digitize` | `digitize` |  |  | uncovered |
| `@cp949/vectra/statistics/digitize-into` | `digitizeInto` |  |  | uncovered |
| `@cp949/vectra/statistics/histogram` | `histogram` |  |  | uncovered |
| `@cp949/vectra/statistics/histogram-bin-edges` | `histogramBinEdges` |  |  | uncovered |
| `@cp949/vectra/statistics/histogram-into` | `histogramInto` |  |  | uncovered |
| `@cp949/vectra/statistics/kurtosis` | `kurtosis` |  |  | uncovered |
| `@cp949/vectra/statistics/mahalanobis-distance` | `mahalanobisDistance` |  |  | uncovered |
| `@cp949/vectra/statistics/max` | `max` |  |  | uncovered |
| `@cp949/vectra/statistics/mean` | `mean` |  |  | uncovered |
| `@cp949/vectra/statistics/median` | `median` |  |  | uncovered |
| `@cp949/vectra/statistics/median-absolute-deviation` | `medianAbsoluteDeviation` |  |  | uncovered |
| `@cp949/vectra/statistics/min` | `min` |  |  | uncovered |
| `@cp949/vectra/statistics/mode` | `mode` |  |  | uncovered |
| `@cp949/vectra/statistics/normalize-min-max` | `normalizeMinMax` |  |  | uncovered |
| `@cp949/vectra/statistics/normalize-min-max-into` | `normalizeMinMaxInto` |  |  | uncovered |
| `@cp949/vectra/statistics/pca` | `pca` |  |  | uncovered |
| `@cp949/vectra/statistics/percentile` | `percentile` |  |  | uncovered |
| `@cp949/vectra/statistics/product` | `product` |  |  | uncovered |
| `@cp949/vectra/statistics/quantile` | `quantile` |  |  | uncovered |
| `@cp949/vectra/statistics/range` | `range` |  |  | uncovered |
| `@cp949/vectra/statistics/reduce-dimensions` | `reduceDimensions` |  |  | uncovered |
| `@cp949/vectra/statistics/reduce-dimensions-into` | `reduceDimensionsInto` |  |  | uncovered |
| `@cp949/vectra/statistics/skewness` | `skewness` |  |  | uncovered |
| `@cp949/vectra/statistics/solve-overdetermined-system` | `solveOverdeterminedSystem` |  |  | uncovered |
| `@cp949/vectra/statistics/standard-deviation` | `standardDeviation` |  |  | uncovered |
| `@cp949/vectra/statistics/standardize` | `standardize` |  |  | uncovered |
| `@cp949/vectra/statistics/standardize-into` | `standardizeInto` |  |  | uncovered |
| `@cp949/vectra/statistics/sum` | `sum` |  |  | uncovered |
| `@cp949/vectra/statistics/variance` | `variance` |  |  | uncovered |
| `@cp949/vectra/statistics/weighted-mean` | `weightedMean` |  |  | uncovered |
| `@cp949/vectra/statistics/weighted-variance` | `weightedVariance` |  |  | uncovered |
| `@cp949/vectra/statistics/whiten` | `whiten` |  |  | uncovered |
| `@cp949/vectra/statistics/whiten-into` | `whitenInto` |  |  | uncovered |
| `@cp949/vectra/svg-path/is-valid-path-data` | `isValidPathData` |  |  | uncovered |
| `@cp949/vectra/svg-path/optimize-path-data-string` | `optimizePathDataString` |  |  | uncovered |
| `@cp949/vectra/svg-path/parse-path-data` | `parsePathData` |  |  | uncovered |
| `@cp949/vectra/svg-path/parse-path-data-into` | `parsePathDataInto` |  |  | uncovered |
| `@cp949/vectra/svg-path/parse-path-data-loose` | `parsePathDataLoose` |  |  | uncovered |
| `@cp949/vectra/svg-path/parse-path-data-loose-into` | `parsePathDataLooseInto` |  |  | uncovered |
| `@cp949/vectra/svg-path/parse-subpaths` | `parseSubpaths` |  |  | uncovered |
| `@cp949/vectra/svg-path/parse-subpaths-into` | `parseSubpathsInto` |  |  | uncovered |
| `@cp949/vectra/svg-path/path-data-to-compact-string` | `pathDataToCompactString` |  |  | uncovered |
| `@cp949/vectra/svg-path/path-data-to-relative-string` | `pathDataToRelativeString` |  |  | uncovered |
| `@cp949/vectra/svg-path/path-data-to-string` | `pathDataToString` |  |  | uncovered |
| `@cp949/vectra/svg-path/shape-to-path-commands` | `shapeToPathCommands` |  |  | uncovered |
| `@cp949/vectra/svg-path/shape-to-path-commands-into` | `shapeToPathCommandsInto` |  |  | uncovered |
| `@cp949/vectra/triangle/altitude` | `altitude` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/altitude-into` | `altitudeInto` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/area` | `area` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/barycentric` | `barycentric` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/barycentric-into` | `type BarycentricWritable` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/barycentric-into` | `barycentricInto` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/bounds` | `bounds` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/bounds-into` | `boundsInto` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/build-equilateral` | `buildEquilateral` | `pixi:triangle-build-equilateral`, `pixi:triangle-construction-lab` |  | covered |
| `@cp949/vectra/triangle/build-equilateral-into` | `buildEquilateralInto` | `pixi:triangle-build-equilateral`, `pixi:triangle-construction-lab` |  | covered |
| `@cp949/vectra/triangle/build-right` | `buildRight` | `pixi:triangle-build-right`, `pixi:triangle-construction-lab` |  | covered |
| `@cp949/vectra/triangle/build-right-into` | `buildRightInto` | `pixi:triangle-build-right`, `pixi:triangle-construction-lab` |  | covered |
| `@cp949/vectra/triangle/centroid` | `centroid` | `pixi:triangle-centers`, `pixi:triangle-construction-lab`, `pixi:triangle-medians-concurrency` |  | covered |
| `@cp949/vectra/triangle/centroid-into` | `centroidInto` | `pixi:triangle-centers`, `pixi:triangle-construction-lab`, `pixi:triangle-medians-concurrency` |  | covered |
| `@cp949/vectra/triangle/circumcenter` | `circumcenter` | `pixi:triangle-centers`, `pixi:triangle-construction-lab` |  | covered |
| `@cp949/vectra/triangle/circumcenter-into` | `circumcenterInto` | `pixi:triangle-centers`, `pixi:triangle-construction-lab` |  | covered |
| `@cp949/vectra/triangle/circumcircle` | `circumcircle` | `pixi:triangle-centers` |  | covered |
| `@cp949/vectra/triangle/circumcircle-into` | `circumcircleInto` | `pixi:triangle-centers` |  | covered |
| `@cp949/vectra/triangle/classify-point` | `classifyPoint` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/closest-point` | `closestPoint` | `pixi:clearance-closest-point-lab`, `pixi:triangle-closest-point` |  | covered |
| `@cp949/vectra/triangle/closest-point-into` | `closestPointInto` | `pixi:clearance-closest-point-lab`, `pixi:triangle-closest-point` |  | covered |
| `@cp949/vectra/triangle/contains-point` | `containsPoint` | `pixi:triangle-contains-point` |  | covered |
| `@cp949/vectra/triangle/contains-points` | `containsPoints` |  |  | uncovered |
| `@cp949/vectra/triangle/copy-into` | `copyInto` |  |  | uncovered |
| `@cp949/vectra/triangle/create-triangle` | `createTriangle` |  |  | uncovered |
| `@cp949/vectra/triangle/distance-to-point` | `distanceToPoint` | `pixi:triangle-point-clearance` |  | covered |
| `@cp949/vectra/triangle/equilateral-altitude` | `equilateralAltitude` |  |  | uncovered |
| `@cp949/vectra/triangle/equilateral-side` | `equilateralSide` |  |  | uncovered |
| `@cp949/vectra/triangle/excenters` | `excenters` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/excenters-into` | `excentersInto` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/excircles` | `excircles` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/excircles-into` | `excirclesInto` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/from-segment-apex` | `fromSegmentApex` | `pixi:triangle-construction-lab`, `pixi:triangle-from-segment-apex` |  | covered |
| `@cp949/vectra/triangle/from-segment-apex-into` | `fromSegmentApexInto` | `pixi:triangle-construction-lab`, `pixi:triangle-from-segment-apex` |  | covered |
| `@cp949/vectra/triangle/from-segment-height` | `fromSegmentHeight` | `pixi:triangle-construction-lab`, `pixi:triangle-from-segment-height` |  | covered |
| `@cp949/vectra/triangle/from-segment-height-into` | `fromSegmentHeightInto` | `pixi:triangle-construction-lab`, `pixi:triangle-from-segment-height` |  | covered |
| `@cp949/vectra/triangle/incenter` | `incenter` | `pixi:triangle-centers`, `pixi:triangle-construction-lab` |  | covered |
| `@cp949/vectra/triangle/incenter-into` | `incenterInto` | `pixi:triangle-centers`, `pixi:triangle-construction-lab` |  | covered |
| `@cp949/vectra/triangle/incircle` | `incircle` | `pixi:triangle-centers` |  | covered |
| `@cp949/vectra/triangle/incircle-into` | `incircleInto` | `pixi:triangle-centers` |  | covered |
| `@cp949/vectra/triangle/interior-angles` | `interiorAngles` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/interior-angles-into` | `interiorAnglesInto` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/is-acute` | `isAcute` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/is-clockwise` | `isClockwise` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/is-counter-clockwise` | `isCounterClockwise` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/is-degenerate` | `isDegenerate` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/is-equilateral` | `isEquilateral` | `pixi:triangle-construction-lab`, `pixi:triangle-side-classification` |  | covered |
| `@cp949/vectra/triangle/is-isosceles` | `isIsosceles` | `pixi:triangle-construction-lab`, `pixi:triangle-side-classification` |  | covered |
| `@cp949/vectra/triangle/is-obtuse` | `isObtuse` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/is-right` | `isRight` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/medial-triangle` | `medialTriangle` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/medial-triangle-into` | `medialTriangleInto` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/median` | `median` |  |  | uncovered |
| `@cp949/vectra/triangle/median-into` | `medianInto` |  |  | uncovered |
| `@cp949/vectra/triangle/median-into` | `type TriangleVertexKey` |  |  | uncovered |
| `@cp949/vectra/triangle/medians` | `medians` | `pixi:triangle-medians-concurrency` |  | covered |
| `@cp949/vectra/triangle/medians-into` | `mediansInto` | `pixi:triangle-medians-concurrency` |  | covered |
| `@cp949/vectra/triangle/medians-into` | `type TriangleMediansWritable` | `pixi:triangle-medians-concurrency` |  | covered |
| `@cp949/vectra/triangle/orthocenter` | `orthocenter` | `pixi:triangle-barycentric-lab`, `pixi:triangle-construction-lab` |  | covered |
| `@cp949/vectra/triangle/orthocenter-into` | `orthocenterInto` | `pixi:triangle-barycentric-lab`, `pixi:triangle-construction-lab` |  | covered |
| `@cp949/vectra/triangle/perimeter` | `perimeter` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/point-at-index` | `pointAtIndex` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/point-at-index-into` | `pointAtIndexInto` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/side-at` | `sideAt` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/side-at-into` | `sideAtInto` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/signed-area` | `signedArea` | `pixi:triangle-barycentric-lab` |  | covered |
| `@cp949/vectra/triangle/solve-asa` | `solveAsa` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/solve-asa-into` | `type SideSet` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/solve-asa-into` | `solveAsaInto` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/solve-sss` | `solveSss` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/solve-sss-into` | `type AngleSet` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/solve-sss-into` | `solveSssInto` | `pixi:triangle-solver-excircles-lab` |  | covered |
| `@cp949/vectra/triangle/triangle-from` | `triangleFrom` | `pixi:triangle-construction-lab`, `pixi:triangle-side-classification` |  | covered |
| `@cp949/vectra/vec/abs` | `abs` |  |  | uncovered |
| `@cp949/vectra/vec/abs-into` | `absInto` |  |  | uncovered |
| `@cp949/vectra/vec/add` | `add` | `canvas:quick-start` |  | covered |
| `@cp949/vectra/vec/add-into` | `addInto` | `canvas:quick-start` |  | covered |
| `@cp949/vectra/vec/add-scaled` | `addScaled` | `pixi:vector-steering-field` |  | covered |
| `@cp949/vectra/vec/add-scaled-into` | `addScaledInto` | `pixi:vector-steering-field` |  | covered |
| `@cp949/vectra/vec/angle` | `angle` |  |  | uncovered |
| `@cp949/vectra/vec/angle-between` | `angleBetween` | `pixi:vec-orthogonal-check`, `pixi:vec-slerp-direction`, `pixi:vector-projection-reflection-lab` |  | covered |
| `@cp949/vectra/vec/average` | `average` |  |  | uncovered |
| `@cp949/vectra/vec/average-into` | `averageInto` |  |  | uncovered |
| `@cp949/vectra/vec/ceil` | `ceil` |  |  | uncovered |
| `@cp949/vectra/vec/ceil-into` | `ceilInto` |  |  | uncovered |
| `@cp949/vectra/vec/chebyshev-distance` | `chebyshevDistance` | `pixi:distance-metrics` |  | covered |
| `@cp949/vectra/vec/chebyshev-length` | `chebyshevLength` |  |  | uncovered |
| `@cp949/vectra/vec/clamp` | `clamp` | `pixi:vec-clamp-region` |  | covered |
| `@cp949/vectra/vec/clamp-into` | `clampInto` | `pixi:vec-clamp-region` |  | covered |
| `@cp949/vectra/vec/clamp-length` | `clampLength` | `pixi:vec-clamp-length-band`, `pixi:vector-control-workbench` |  | covered |
| `@cp949/vectra/vec/clamp-length-into` | `clampLengthInto` | `pixi:vec-clamp-length-band`, `pixi:vector-control-workbench` |  | covered |
| `@cp949/vectra/vec/component-max` | `componentMax` |  |  | uncovered |
| `@cp949/vectra/vec/component-min` | `componentMin` |  |  | uncovered |
| `@cp949/vectra/vec/component-product` | `componentProduct` |  |  | uncovered |
| `@cp949/vectra/vec/component-sum` | `componentSum` |  |  | uncovered |
| `@cp949/vectra/vec/copy-into` | `copyInto` |  |  | uncovered |
| `@cp949/vectra/vec/cross` | `cross` | `pixi:vector-projection-reflection-lab` |  | covered |
| `@cp949/vectra/vec/cross3` | `cross3` |  |  | uncovered |
| `@cp949/vectra/vec/directed-angle` | `directedAngle` | `pixi:vector-projection-reflection-lab` |  | covered |
| `@cp949/vectra/vec/direction-to` | `directionTo` | `pixi:vec-aim-direction`, `pixi:vector-control-workbench` |  | covered |
| `@cp949/vectra/vec/direction-to-into` | `directionToInto` | `pixi:vec-aim-direction`, `pixi:vector-control-workbench` |  | covered |
| `@cp949/vectra/vec/distance` | `distance` | `canvas:quick-start`, `pixi:cursor-chase`, `pixi:distance-metrics`, `pixi:triangle-construction-lab`, `pixi:triangle-side-classification`, `pixi:vec-lerp-points`, `pixi:vec-rotate-around` |  | covered |
| `@cp949/vectra/vec/distance-sq` | `distanceSq` | `pixi:distance-metrics` |  | covered |
| `@cp949/vectra/vec/divide` | `divide` |  |  | uncovered |
| `@cp949/vectra/vec/divide-into` | `divideInto` |  |  | uncovered |
| `@cp949/vectra/vec/dot` | `dot` | `pixi:vec-orthogonal-check`, `pixi:vector-projection-reflection-lab` |  | covered |
| `@cp949/vectra/vec/equals` | `equals` |  |  | uncovered |
| `@cp949/vectra/vec/floor` | `floor` |  |  | uncovered |
| `@cp949/vectra/vec/floor-into` | `floorInto` |  |  | uncovered |
| `@cp949/vectra/vec/from-angle` | `fromAngle` | `pixi:remap-gauge-needle`, `pixi:vec-from-angle` |  | covered |
| `@cp949/vectra/vec/from-angle-into` | `fromAngleInto` | `pixi:remap-gauge-needle`, `pixi:vec-from-angle` |  | covered |
| `@cp949/vectra/vec/from-polar` | `fromPolar` | `pixi:polar-coordinate-plot` |  | covered |
| `@cp949/vectra/vec/from-polar-into` | `fromPolarInto` | `pixi:polar-coordinate-plot` |  | covered |
| `@cp949/vectra/vec/has-nan` | `hasNan` |  |  | uncovered |
| `@cp949/vectra/vec/heading` | `heading` |  |  | uncovered |
| `@cp949/vectra/vec/heading-segment` | `headingSegment` |  |  | uncovered |
| `@cp949/vectra/vec/is-collinear` | `isCollinear` | `pixi:orientation-predicate` |  | covered |
| `@cp949/vectra/vec/is-finite` | `isFinite` |  |  | uncovered |
| `@cp949/vectra/vec/is-orthogonal` | `isOrthogonal` | `pixi:vec-orthogonal-check` |  | covered |
| `@cp949/vectra/vec/is-unit` | `isUnit` |  |  | uncovered |
| `@cp949/vectra/vec/is-zero` | `isZero` |  |  | uncovered |
| `@cp949/vectra/vec/length` | `length` | `pixi:cross-track-deviation`, `pixi:vec-clamp-length-band`, `pixi:vec-set-length`, `pixi:vector-collision-response`, `pixi:vector-control-workbench` |  | covered |
| `@cp949/vectra/vec/length-sq` | `lengthSq` |  |  | uncovered |
| `@cp949/vectra/vec/lerp` | `lerp` | `pixi:motion-interpolation-workbench`, `pixi:vec-lerp-points` |  | covered |
| `@cp949/vectra/vec/lerp-into` | `lerpInto` | `pixi:motion-interpolation-workbench`, `pixi:vec-lerp-points` |  | covered |
| `@cp949/vectra/vec/manhattan-distance` | `manhattanDistance` | `pixi:distance-metrics` |  | covered |
| `@cp949/vectra/vec/manhattan-length` | `manhattanLength` |  |  | uncovered |
| `@cp949/vectra/vec/max` | `max` |  |  | uncovered |
| `@cp949/vectra/vec/max-into` | `maxInto` |  |  | uncovered |
| `@cp949/vectra/vec/midpoint` | `midpoint` | `pixi:vec-midpoint` |  | covered |
| `@cp949/vectra/vec/midpoint-into` | `midpointInto` | `pixi:vec-midpoint` |  | covered |
| `@cp949/vectra/vec/min` | `min` |  |  | uncovered |
| `@cp949/vectra/vec/min-into` | `minInto` |  |  | uncovered |
| `@cp949/vectra/vec/move-toward` | `moveToward` |  |  | uncovered |
| `@cp949/vectra/vec/move-toward-into` | `moveTowardInto` |  |  | uncovered |
| `@cp949/vectra/vec/multiply` | `multiply` |  |  | uncovered |
| `@cp949/vectra/vec/multiply-into` | `multiplyInto` |  |  | uncovered |
| `@cp949/vectra/vec/near-equals` | `nearEquals` |  |  | uncovered |
| `@cp949/vectra/vec/negate` | `negate` |  |  | uncovered |
| `@cp949/vectra/vec/negate-into` | `negateInto` |  |  | uncovered |
| `@cp949/vectra/vec/normal-left` | `normalLeft` | `pixi:vec-surface-normal` |  | covered |
| `@cp949/vectra/vec/normal-left-into` | `normalLeftInto` | `pixi:vec-surface-normal` |  | covered |
| `@cp949/vectra/vec/normal-right` | `normalRight` |  |  | uncovered |
| `@cp949/vectra/vec/normal-right-into` | `normalRightInto` |  |  | uncovered |
| `@cp949/vectra/vec/normalize` | `normalize` | `pixi:vec-orthogonal-check`, `pixi:vec-point-on-ray`, `pixi:vec-slerp-direction`, `pixi:vector-projection-reflection-lab`, `pixi:vector-steering-field` |  | covered |
| `@cp949/vectra/vec/normalize-into` | `normalizeInto` | `pixi:vec-orthogonal-check`, `pixi:vec-point-on-ray`, `pixi:vec-slerp-direction`, `pixi:vector-projection-reflection-lab`, `pixi:vector-steering-field` |  | covered |
| `@cp949/vectra/vec/one` | `one` |  |  | uncovered |
| `@cp949/vectra/vec/one-into` | `oneInto` |  |  | uncovered |
| `@cp949/vectra/vec/orientation` | `orientation` | `pixi:orientation-predicate` |  | covered |
| `@cp949/vectra/vec/perpendicular` | `perpendicular` | `pixi:vector-projection-reflection-lab` |  | covered |
| `@cp949/vectra/vec/perpendicular-into` | `perpendicularInto` | `pixi:vector-projection-reflection-lab` |  | covered |
| `@cp949/vectra/vec/point-on-ray` | `pointOnRay` | `pixi:vec-point-on-ray`, `pixi:vector-control-workbench` |  | covered |
| `@cp949/vectra/vec/point-on-ray-into` | `pointOnRayInto` | `pixi:vec-point-on-ray`, `pixi:vector-control-workbench` |  | covered |
| `@cp949/vectra/vec/project-on` | `projectOn` | `pixi:vector-collision-response`, `pixi:vector-projection-reflection-lab` |  | covered |
| `@cp949/vectra/vec/project-on-into` | `projectOnInto` | `pixi:vector-collision-response`, `pixi:vector-projection-reflection-lab` |  | covered |
| `@cp949/vectra/vec/project-scalar` | `projectScalar` | `pixi:vec-scalar-projection` |  | covered |
| `@cp949/vectra/vec/quadrant` | `quadrant` | `pixi:vec-quadrant` |  | covered |
| `@cp949/vectra/vec/reflect` | `reflect` | `pixi:vec-wall-bounce`, `pixi:vector-collision-response` |  | covered |
| `@cp949/vectra/vec/reflect-across-normal` | `reflectAcrossNormal` | `pixi:vector-collision-response`, `pixi:vector-projection-reflection-lab` |  | covered |
| `@cp949/vectra/vec/reflect-across-normal-into` | `reflectAcrossNormalInto` | `pixi:vector-collision-response`, `pixi:vector-projection-reflection-lab` |  | covered |
| `@cp949/vectra/vec/reflect-into` | `reflectInto` | `pixi:vec-wall-bounce`, `pixi:vector-collision-response` |  | covered |
| `@cp949/vectra/vec/reject-from` | `rejectFrom` | `pixi:cross-track-deviation` |  | covered |
| `@cp949/vectra/vec/reject-from-into` | `rejectFromInto` | `pixi:cross-track-deviation` |  | covered |
| `@cp949/vectra/vec/rotate` | `rotate` |  |  | uncovered |
| `@cp949/vectra/vec/rotate-around` | `rotateAround` | `pixi:motion-interpolation-workbench`, `pixi:vec-rotate-around` |  | covered |
| `@cp949/vectra/vec/rotate-around-into` | `rotateAroundInto` | `pixi:motion-interpolation-workbench`, `pixi:vec-rotate-around` |  | covered |
| `@cp949/vectra/vec/rotate-into` | `rotateInto` |  |  | uncovered |
| `@cp949/vectra/vec/round` | `round` |  |  | uncovered |
| `@cp949/vectra/vec/round-into` | `roundInto` |  |  | uncovered |
| `@cp949/vectra/vec/scale` | `scale` | `canvas:quick-start` |  | covered |
| `@cp949/vectra/vec/scale-into` | `scaleInto` | `canvas:quick-start` |  | covered |
| `@cp949/vectra/vec/set-length` | `setLength` | `pixi:vec-set-length`, `pixi:vector-control-workbench` |  | covered |
| `@cp949/vectra/vec/set-length-into` | `setLengthInto` | `pixi:vec-set-length`, `pixi:vector-control-workbench` |  | covered |
| `@cp949/vectra/vec/slerp` | `slerp` | `pixi:motion-interpolation-workbench`, `pixi:vec-slerp-direction` |  | covered |
| `@cp949/vectra/vec/slerp-into` | `slerpInto` | `pixi:motion-interpolation-workbench`, `pixi:vec-slerp-direction` |  | covered |
| `@cp949/vectra/vec/slide` | `slide` | `pixi:vec-wall-slide`, `pixi:vector-collision-response` |  | covered |
| `@cp949/vectra/vec/slide-into` | `slideInto` | `pixi:vec-wall-slide`, `pixi:vector-collision-response` |  | covered |
| `@cp949/vectra/vec/sub` | `sub` | `pixi:cross-track-deviation`, `pixi:vec-orthogonal-check`, `pixi:vec-slerp-direction`, `pixi:vector-projection-reflection-lab` |  | covered |
| `@cp949/vectra/vec/sub-into` | `subInto` | `pixi:cross-track-deviation`, `pixi:vec-orthogonal-check`, `pixi:vec-slerp-direction`, `pixi:vector-projection-reflection-lab` |  | covered |
| `@cp949/vectra/vec/subtract-scaled` | `subtractScaled` |  |  | uncovered |
| `@cp949/vectra/vec/subtract-scaled-into` | `subtractScaledInto` |  |  | uncovered |
| `@cp949/vectra/vec/to-polar` | `toPolar` | `pixi:polar-coordinate-plot`, `pixi:vector-projection-reflection-lab` |  | covered |
| `@cp949/vectra/vec/to-polar-into` | `toPolarInto` | `pixi:polar-coordinate-plot`, `pixi:vector-projection-reflection-lab` |  | covered |
| `@cp949/vectra/vec/transform` | `transform` |  |  | uncovered |
| `@cp949/vectra/vec/transform-into` | `transformInto` |  |  | uncovered |
| `@cp949/vectra/vec/vec-from` | `vecFrom` |  |  | uncovered |
| `@cp949/vectra/vec/zero` | `zero` |  |  | uncovered |
| `@cp949/vectra/vec/zero-into` | `zeroInto` |  |  | uncovered |

