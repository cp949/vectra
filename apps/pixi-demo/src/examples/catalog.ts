import type { PlaygroundCategory, PlaygroundExample } from '@repo/playground';
import type { PixiRuntimeSeed } from '../pixi/api';
import { angleAverageDirectionExample } from './angle-average-direction';
import { angleBisectShortestExample } from './angle-bisect-shortest';
import { angleClampRangeExample } from './angle-clamp-range';
import { angleDirectedSweepExample } from './angle-directed-sweep';
import { angleHeadingTurnExample } from './angle-heading-turn';
import { angleOctantDialExample } from './angle-octant-dial';
import { angleSnapDialExample } from './angle-snap-dial';
import { angleUnitCompassExample } from './angle-unit-compass';
import { arcFlattenExample } from './arc-flatten';
import { arcLengthParameterizeExample } from './arc-length-parameterize';
import { arcToCubicExample } from './arc-to-cubic';
import { bernoulliTrialTallyExample } from './bernoulli-trial-tally';
import { bezierControlInspectorExample } from './bezier-control-inspector';
import { bezierIntersectionWorkbenchExample } from './bezier-intersection-workbench';
import { bilinearWarpGridExample } from './bilinear-warp-grid';
import { boundsBoundsOverlapExample } from './bounds-bounds-overlap';
import { boundsClosestPointExample } from './bounds-closest-point';
import { boundsPointClearanceExample } from './bounds-point-clearance';
import { boundsRotatedAabbExample } from './bounds-rotated-aabb';
import { boundsUnionBoxExample } from './bounds-union-box';
import { circleCircleClearanceExample } from './circle-circle-clearance';
import { circleCircleOverlapExample } from './circle-circle-overlap';
import { circleFromThreePointsExample } from './circle-from-three-points';
import { circleInfiniteLineHitExample } from './circle-infinite-line-hit';
import { circlePointClearanceExample } from './circle-point-clearance';
import { circleRectOverlapExample } from './circle-rect-overlap';
import { circleSagittaExample } from './circle-sagitta';
import { circleSectorAreaExample } from './circle-sector-area';
import { circleTangentConstructionExample } from './circle-tangent-construction';
import { circleTankFillExample } from './circle-tank-fill';
import { circleTurnProgressExample } from './circle-turn-progress';
import { circularMeasurementLabExample } from './circular-measurement-lab';
import { clearanceClosestPointLabExample } from './clearance-closest-point-lab';
import { constrainDragAxisLockExample } from './constrain-drag-axis-lock';
import { contentFitWorkbenchExample } from './content-fit-workbench';
import { crossTrackDeviationExample } from './cross-track-deviation';
import { cubicBezierInspectorExample } from './cubic-bezier-inspector';
import { cubicCurveAnalysisLabExample } from './cubic-curve-analysis-lab';
import { cursorChaseExample } from './cursor-chase';
import { curveSamplingWorkbenchExample } from './curve-sampling-workbench';
import { distanceMetricsExample } from './distance-metrics';
import { distributeEqualGapsExample } from './distribute-equal-gaps';
import { easingBiasCurveExample } from './easing-bias-curve';
import { easingMotionTimingExample } from './easing-motion-timing';
import { editorSnapGuidesLabExample } from './editor-snap-guides-lab';
import { ellipseCircleOverlapExample } from './ellipse-circle-overlap';
import { ellipseClosestPointExample } from './ellipse-closest-point';
import { ellipseFociSumExample } from './ellipse-foci-sum';
import { ellipseFromRectExample } from './ellipse-from-rect';
import { ellipseInspectorExample } from './ellipse-inspector';
import { ellipseRectOverlapExample } from './ellipse-rect-overlap';
import { ellipseUniformExpandExample } from './ellipse-uniform-expand';
import { gridSnapBracketExample } from './grid-snap-bracket';
import { groupBoundsExample } from './group-bounds';
import { hermiteSplineBuilderExample } from './hermite-spline-builder';
import { infiniteLineDiagnosticsLabExample } from './infinite-line-diagnostics-lab';
import { infiniteLinePointDistanceExample } from './infinite-line-point-distance';
import { inverseLerpTrackExample } from './inverse-lerp-track';
import { mathPingPongExample } from './math-ping-pong';
import { matrixLerpBlendExample } from './matrix-lerp-blend';
import { matrixMirrorReflectionExample } from './matrix-mirror-reflection';
import { matrixShearTransformExample } from './matrix-shear-transform';
import { motionInterpolationWorkbenchExample } from './motion-interpolation-workbench';
import { normalDistributionHistogramExample } from './normal-distribution-histogram';
import { orbitSegmentExample } from './orbit-segment';
import { orientationPredicateExample } from './orientation-predicate';
import { pathClosestPointExample } from './path-closest-point';
import { pathFillHitTestExample } from './path-fill-hit-test';
import { pathMorphExample } from './path-morph';
import { pixelGridAlignExample } from './pixel-grid-align';
import { polarCoordinatePlotExample } from './polar-coordinate-plot';
import { polygonMetricsWorkbenchExample } from './polygon-metrics-workbench';
import { polygonTransformOrientationLabExample } from './polygon-transform-orientation-lab';
import { polylineDistanceProbeExample } from './polyline-distance-probe';
import { polylineLengthRatioExample } from './polyline-length-ratio';
import { polylinePathWalkExample } from './polyline-path-walk';
import { polylineVertexTangentsExample } from './polyline-vertex-tangents';
import { quadraticCurveAnalysisLabExample } from './quadratic-curve-analysis-lab';
import { randomPointOnSegmentExample } from './random-point-on-segment';
import { rayBoundsHitExample } from './ray-bounds-hit';
import { rayCastExample } from './ray-cast';
import { rayCircleHitExample } from './ray-circle-hit';
import { rayClosestPointExample } from './ray-closest-point';
import { rayContainsPointExample } from './ray-contains-point';
import { rayCubicHitsExample } from './ray-cubic-hits';
import { rayIntersectionLabExample } from './ray-intersection-lab';
import { raySegmentHitExample } from './ray-segment-hit';
import { raycastWorkbenchExample } from './raycast-workbench';
import { rectContainsPointExample } from './rect-contains-point';
import { rectContainsRectExample } from './rect-contains-rect';
import { rectExpandToIncludePointExample } from './rect-expand-to-include-point';
import { rectHalvesSplitExample } from './rect-halves-split';
import { rectIntersectionClipExample } from './rect-intersection-clip';
import { rectLayoutWorkbenchExample } from './rect-layout-workbench';
import { rectPerimeterWalkExample } from './rect-perimeter-walk';
import { rectQuadrantsSplitExample } from './rect-quadrants-split';
import { rectSegmentCrossExample } from './rect-segment-cross';
import { rectUniformInflateExample } from './rect-uniform-inflate';
import { regularPolygonConstructExample } from './regular-polygon-construct';
import { remapGaugeNeedleExample } from './remap-gauge-needle';
import { rotateHandleExample } from './rotate-handle';
import { rotationControlDialExample } from './rotation-control-dial';
import { sampleTableLookupExample } from './sample-table-lookup';
import { segmentAngleBuilderExample } from './segment-angle-builder';
import { segmentConstructionLabExample } from './segment-construction-lab';
import { segmentContactGatesLabExample } from './segment-contact-gates-lab';
import { segmentEllipseExitExample } from './segment-ellipse-exit';
import { segmentFromCircleExample } from './segment-from-circle';
import { segmentFromMidpointExample } from './segment-from-midpoint';
import { segmentFromNormalExample } from './segment-from-normal';
import { segmentIntersectionPointExample } from './segment-intersection-point';
import { segmentOffsetNormalLabExample } from './segment-offset-normal-lab';
import { segmentPointAtLengthExample } from './segment-point-at-length';
import { segmentRotateOriginExample } from './segment-rotate-origin';
import { segmentSegmentCrossExample } from './segment-segment-cross';
import { segmentSupportingLineFootExample } from './segment-supporting-line-foot';
import { shapeHitboxLabExample } from './shape-hitbox-lab';
import { snapDistanceRulerExample } from './snap-distance-ruler';
import { splinePathComparisonLabExample } from './spline-path-comparison-lab';
import { starPolygonSpikesExample } from './star-polygon-spikes';
import { steppedTimingTrackExample } from './stepped-timing-track';
import { svgPointsRoundtripEditorExample } from './svg-points-roundtrip-editor';
import { transformHandlesExample } from './transform-handles';
import { triangleBarycentricLabExample } from './triangle-barycentric-lab';
import { triangleBuildEquilateralExample } from './triangle-build-equilateral';
import { triangleBuildRightExample } from './triangle-build-right';
import { triangleCentersExample } from './triangle-centers';
import { triangleClosestPointExample } from './triangle-closest-point';
import { triangleConstructionLabExample } from './triangle-construction-lab';
import { triangleContainsPointExample } from './triangle-contains-point';
import { triangleFromSegmentApexExample } from './triangle-from-segment-apex';
import { triangleFromSegmentHeightExample } from './triangle-from-segment-height';
import { triangleMediansConcurrencyExample } from './triangle-medians-concurrency';
import { trianglePointClearanceExample } from './triangle-point-clearance';
import { triangleRectOverlapExample } from './triangle-rect-overlap';
import { triangleSideClassificationExample } from './triangle-side-classification';
import { triangleSolverExcirclesLabExample } from './triangle-solver-excircles-lab';
import { triangleTriangleOverlapExample } from './triangle-triangle-overlap';
import { vecAimDirectionExample } from './vec-aim-direction';
import { vecClampLengthBandExample } from './vec-clamp-length-band';
import { vecClampRegionExample } from './vec-clamp-region';
import { vecFromAngleExample } from './vec-from-angle';
import { vecLerpPointsExample } from './vec-lerp-points';
import { vecMidpointExample } from './vec-midpoint';
import { vecOrthogonalCheckExample } from './vec-orthogonal-check';
import { vecPointOnRayExample } from './vec-point-on-ray';
import { vecQuadrantExample } from './vec-quadrant';
import { vecRotateAroundExample } from './vec-rotate-around';
import { vecScalarProjectionExample } from './vec-scalar-projection';
import { vecSetLengthExample } from './vec-set-length';
import { vecSlerpDirectionExample } from './vec-slerp-direction';
import { vecSurfaceNormalExample } from './vec-surface-normal';
import { vecWallBounceExample } from './vec-wall-bounce';
import { vecWallSlideExample } from './vec-wall-slide';
import { vectorCollisionResponseExample } from './vector-collision-response';
import { vectorControlWorkbenchExample } from './vector-control-workbench';
import { vectorProjectionReflectionLabExample } from './vector-projection-reflection-lab';
import { vectorSteeringFieldExample } from './vector-steering-field';
import { weightedLootTableExample } from './weighted-loot-table';
import { wrapIntRingExample } from './wrap-int-ring';

/** 예제 카테고리 목록 */
export const CATEGORIES: PlaygroundCategory[] = [
  { id: 'math', title: '수학', order: 0, defaultExpanded: true },
  { id: 'vector', title: '벡터', order: 1, defaultExpanded: true },
  { id: 'angle', title: '각도', order: 2, defaultExpanded: true },
  { id: 'transform', title: '변환', order: 3, defaultExpanded: true },
  { id: 'curve', title: '커브', order: 4, defaultExpanded: true },
  { id: 'path', title: '패스', order: 5 },
  { id: 'line', title: '직선', order: 6 },
  { id: 'ray', title: '레이', order: 7 },
  { id: 'segment', title: '선분', order: 8 },
  { id: 'rect', title: '사각형/Bounds', order: 9 },
  { id: 'circle', title: '원', order: 10 },
  { id: 'ellipse', title: '타원', order: 11 },
  { id: 'triangle', title: '삼각형', order: 12 },
  { id: 'polygon', title: '폴리곤', order: 13 },
];

/** 예제 목록 */
export const EXAMPLES: PlaygroundExample<PixiRuntimeSeed>[] = [
  angleHeadingTurnExample,
  angleUnitCompassExample,
  rotationControlDialExample,
  vectorSteeringFieldExample,
  vectorProjectionReflectionLabExample,
  vectorControlWorkbenchExample,
  vectorCollisionResponseExample,
  motionInterpolationWorkbenchExample,
  easingBiasCurveExample,
  easingMotionTimingExample,
  cursorChaseExample,
  distanceMetricsExample,
  vecSlerpDirectionExample,
  polarCoordinatePlotExample,
  bilinearWarpGridExample,
  orientationPredicateExample,
  vecLerpPointsExample,
  vecQuadrantExample,
  vecOrthogonalCheckExample,
  inverseLerpTrackExample,
  normalDistributionHistogramExample,
  bernoulliTrialTallyExample,
  gridSnapBracketExample,
  steppedTimingTrackExample,
  sampleTableLookupExample,
  wrapIntRingExample,
  vecClampLengthBandExample,
  transformHandlesExample,
  editorSnapGuidesLabExample,
  contentFitWorkbenchExample,
  clearanceClosestPointLabExample,
  rotateHandleExample,
  matrixShearTransformExample,
  matrixMirrorReflectionExample,
  vecRotateAroundExample,
  constrainDragAxisLockExample,
  distributeEqualGapsExample,
  matrixLerpBlendExample,
  bezierControlInspectorExample,
  bezierIntersectionWorkbenchExample,
  curveSamplingWorkbenchExample,
  cubicBezierInspectorExample,
  cubicCurveAnalysisLabExample,
  quadraticCurveAnalysisLabExample,
  hermiteSplineBuilderExample,
  splinePathComparisonLabExample,
  arcToCubicExample,
  arcFlattenExample,
  arcLengthParameterizeExample,
  polylineLengthRatioExample,
  polylinePathWalkExample,
  polylineDistanceProbeExample,
  polylineVertexTangentsExample,
  pathMorphExample,
  pathClosestPointExample,
  polygonMetricsWorkbenchExample,
  polygonTransformOrientationLabExample,
  rayCastExample,
  raycastWorkbenchExample,
  rayIntersectionLabExample,
  raySegmentHitExample,
  vecPointOnRayExample,
  infiniteLineDiagnosticsLabExample,
  infiniteLinePointDistanceExample,
  segmentConstructionLabExample,
  segmentAngleBuilderExample,
  segmentOffsetNormalLabExample,
  segmentContactGatesLabExample,
  segmentIntersectionPointExample,
  orbitSegmentExample,
  ellipseInspectorExample,
  ellipseFociSumExample,
  ellipseFromRectExample,
  triangleCentersExample,
  triangleConstructionLabExample,
  triangleBarycentricLabExample,
  triangleSolverExcirclesLabExample,
  triangleSideClassificationExample,
  circleTangentConstructionExample,
  circularMeasurementLabExample,
  svgPointsRoundtripEditorExample,
  shapeHitboxLabExample,
  rectUniformInflateExample,
  rectLayoutWorkbenchExample,
  rectExpandToIncludePointExample,
  rectPerimeterWalkExample,
  ellipseClosestPointExample,
  ellipseUniformExpandExample,
  boundsUnionBoxExample,
  circleCircleOverlapExample,
  circleRectOverlapExample,
  ellipseCircleOverlapExample,
  ellipseRectOverlapExample,
  segmentEllipseExitExample,
  segmentSegmentCrossExample,
  pathFillHitTestExample,
  segmentRotateOriginExample,
  triangleContainsPointExample,
  angleSnapDialExample,
  segmentPointAtLengthExample,
  boundsBoundsOverlapExample,
  vecSetLengthExample,
  triangleClosestPointExample,
  triangleMediansConcurrencyExample,
  triangleFromSegmentHeightExample,
  triangleTriangleOverlapExample,
  rectContainsRectExample,
  triangleBuildEquilateralExample,
  triangleBuildRightExample,
  rectQuadrantsSplitExample,
  segmentFromMidpointExample,
  rectHalvesSplitExample,
  segmentFromNormalExample,
  snapDistanceRulerExample,
  vecClampRegionExample,
  groupBoundsExample,
  segmentFromCircleExample,
  vecWallSlideExample,
  vecAimDirectionExample,
  rayBoundsHitExample,
  triangleFromSegmentApexExample,
  vecWallBounceExample,
  rectContainsPointExample,
  vecSurfaceNormalExample,
  rayCircleHitExample,
  segmentSupportingLineFootExample,
  vecFromAngleExample,
  randomPointOnSegmentExample,
  triangleRectOverlapExample,
  vecMidpointExample,
  rectSegmentCrossExample,
  circleInfiniteLineHitExample,
  vecScalarProjectionExample,
  angleClampRangeExample,
  circlePointClearanceExample,
  circleFromThreePointsExample,
  circleCircleClearanceExample,
  rayClosestPointExample,
  mathPingPongExample,
  regularPolygonConstructExample,
  circleSagittaExample,
  boundsClosestPointExample,
  boundsPointClearanceExample,
  boundsRotatedAabbExample,
  angleBisectShortestExample,
  angleOctantDialExample,
  circleSectorAreaExample,
  trianglePointClearanceExample,
  rayContainsPointExample,
  angleDirectedSweepExample,
  angleAverageDirectionExample,
  circleTankFillExample,
  remapGaugeNeedleExample,
  crossTrackDeviationExample,
  rectIntersectionClipExample,
  circleTurnProgressExample,
  weightedLootTableExample,
  starPolygonSpikesExample,
  rayCubicHitsExample,
  pixelGridAlignExample,
];

/** pixi-demo 예제의 기본 탐색 노출 분류 */
export type PixiExampleTriage = 'keep' | 'merge' | 'demote';

export const MERGE_EXAMPLE_IDS = new Set<string>([
  'angle-average-direction',
  'angle-bisect-shortest',
  'angle-clamp-range',
  'angle-directed-sweep',
  'angle-snap-dial',
  'arc-flatten',
  'arc-length-parameterize',
  'bounds-bounds-overlap',
  'bounds-closest-point',
  'bounds-point-clearance',
  'bounds-union-box',
  'circle-circle-clearance',
  'circle-circle-overlap',
  'circle-infinite-line-hit',
  'circle-point-clearance',
  'circle-rect-overlap',
  'circle-sagitta',
  'circle-sector-area',
  'circle-turn-progress',
  'cubic-bezier-inspector',
  'ellipse-circle-overlap',
  'ellipse-closest-point',
  'ellipse-from-rect',
  'ellipse-rect-overlap',
  'grid-snap-bracket',
  'group-bounds',
  'infinite-line-point-distance',
  'orbit-segment',
  'orientation-predicate',
  'path-closest-point',
  'polyline-distance-probe',
  'polyline-length-ratio',
  'polyline-vertex-tangents',
  'quadratic-curve-analysis-lab',
  'ray-bounds-hit',
  'ray-circle-hit',
  'ray-closest-point',
  'ray-cubic-hits',
  'ray-segment-hit',
  'rect-contains-point',
  'rect-contains-rect',
  'rect-expand-to-include-point',
  'rect-halves-split',
  'rect-intersection-clip',
  'rect-quadrants-split',
  'rect-segment-cross',
  'rect-uniform-inflate',
  'regular-polygon-construct',
  'segment-angle-builder',
  'segment-ellipse-exit',
  'segment-from-circle',
  'segment-from-midpoint',
  'segment-from-normal',
  'segment-intersection-point',
  'segment-point-at-length',
  'segment-segment-cross',
  'segment-supporting-line-foot',
  'triangle-build-equilateral',
  'triangle-build-right',
  'triangle-centers',
  'triangle-closest-point',
  'triangle-contains-point',
  'triangle-from-segment-apex',
  'triangle-from-segment-height',
  'triangle-point-clearance',
  'triangle-rect-overlap',
  'triangle-side-classification',
  'triangle-triangle-overlap',
  'vec-aim-direction',
  'vec-clamp-length-band',
  'vec-clamp-region',
  'vec-lerp-points',
  'vec-orthogonal-check',
  'vec-point-on-ray',
  'vec-rotate-around',
  'vec-scalar-projection',
  'vec-set-length',
  'vec-slerp-direction',
  'vec-surface-normal',
  'vec-wall-bounce',
  'vec-wall-slide',
]);

export const DEMOTE_EXAMPLE_IDS = new Set<string>([
  'arc-to-cubic',
  'angle-octant-dial',
  'bernoulli-trial-tally',
  'distance-metrics',
  'ellipse-foci-sum',
  'ellipse-uniform-expand',
  'inverse-lerp-track',
  'math-ping-pong',
  'normal-distribution-histogram',
  'polar-coordinate-plot',
  'ray-contains-point',
  'rect-perimeter-walk',
  'sample-table-lookup',
  'segment-rotate-origin',
  'star-polygon-spikes',
  'stepped-timing-track',
  'triangle-medians-concurrency',
  'vec-from-angle',
  'vec-midpoint',
  'vec-quadrant',
  'wrap-int-ring',
]);

/** 예제 ID별 triage 결과. `keep`만 기본 탐색에 노출한다. */
export const EXAMPLE_TRIAGE: Record<string, PixiExampleTriage> = Object.fromEntries(
  EXAMPLES.map((example) => [
    example.id,
    DEMOTE_EXAMPLE_IDS.has(example.id) ? 'demote' : MERGE_EXAMPLE_IDS.has(example.id) ? 'merge' : 'keep',
  ])
);

/** 사용자가 실제 사용 맥락을 먼저 훑도록 기본 탐색에 노출하는 예제 목록 */
export const PRIMARY_EXAMPLES: PlaygroundExample<PixiRuntimeSeed>[] = EXAMPLES.filter(
  (example) => EXAMPLE_TRIAGE[example.id] === 'keep'
);

/** advanced mode 여부와 직접 URL 선택 예외에 맞는 탐색/search 대상 예제 목록을 반환한다. */
export function getVisibleExamples(
  showAdvancedExamples: boolean,
  selectedExample?: PlaygroundExample<PixiRuntimeSeed>
): readonly PlaygroundExample<PixiRuntimeSeed>[] {
  if (showAdvancedExamples || !selectedExample || EXAMPLE_TRIAGE[selectedExample.id] === 'keep') {
    return showAdvancedExamples ? EXAMPLES : PRIMARY_EXAMPLES;
  }

  return [...PRIMARY_EXAMPLES, selectedExample];
}
