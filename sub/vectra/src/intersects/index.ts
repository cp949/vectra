/**
 * intersects domain barrel.
 *
 * cross-shape intersection 관계 함수를 모아두는 domain.
 *
 * 모든 intersects* relation의 canonical owner다.
 */

// bounds area overlap detail
export { boundsBoundsAreaOverlapDetail } from './bounds-bounds-area-overlap-detail';
// bounds sweep time-of-impact detail
export { boundsSweepBounds } from './bounds-sweep-bounds';
export { boundsSweepBoundsInto } from './bounds-sweep-bounds-into';
export { boundsSweepPoint } from './bounds-sweep-point';
export { boundsSweepPointInto } from './bounds-sweep-point-into';
// circle × bounds intersection point collection
export { circleBoundsIntersections } from './circle-bounds-intersections';
export { circleBoundsIntersectionsInto } from './circle-bounds-intersections-into';
// circle area overlap detail
export { circleCircleAreaOverlapDetail } from './circle-circle-area-overlap-detail';
// circle relation detail
export { circleCircleDetail } from './circle-circle-detail';
// circle-circle intersection point collection
export { circleCircleIntersections } from './circle-circle-intersections';
export { circleCircleIntersectionsInto } from './circle-circle-intersections-into';
// circle-circle lens overlap area
export { circleLensArea } from './circle-lens-area';
// circle × polyline intersection point collection
export { circlePolylineIntersections } from './circle-polyline-intersections';
export { circlePolylineIntersectionsInto } from './circle-polyline-intersections-into';
// circle × rect closest point
export { circleRectClosestPoint } from './circle-rect-closest-point';
export { circleRectClosestPointInto } from './circle-rect-closest-point-into';
// circle × rect intersection point collection
export { circleRectIntersections } from './circle-rect-intersections';
export { circleRectIntersectionsInto } from './circle-rect-intersections-into';
// circle × triangle intersection point collection
export { circleTriangleIntersections } from './circle-triangle-intersections';
export { circleTriangleIntersectionsInto } from './circle-triangle-intersections-into';
// closest line-family × polygon intersection
export { closestRayPolygonIntersection } from './closest-ray-polygon-intersection';
export { closestRayPolygonIntersectionInto } from './closest-ray-polygon-intersection-into';
export { closestSegmentPolygonIntersection } from './closest-segment-polygon-intersection';
export { closestSegmentPolygonIntersectionInto } from './closest-segment-polygon-intersection-into';
// generic curve relation facade
export { curveCurveIntersections } from './curve-curve-intersections';
export { curveCurveIntersectionsInto } from './curve-curve-intersections-into';
export { curveSelfIntersections } from './curve-self-intersections';
export { curveSelfIntersectionsInto } from './curve-self-intersections-into';
// ellipse × circle intersection point collection
export { ellipseCircleIntersections } from './ellipse-circle-intersections';
export { ellipseCircleIntersectionsInto } from './ellipse-circle-intersections-into';
// ellipse-ellipse relation detail
export { ellipseEllipseDetail } from './ellipse-ellipse-detail';
// ellipse-ellipse intersection point collection
export { ellipseEllipseIntersections } from './ellipse-ellipse-intersections';
export { ellipseEllipseIntersectionsInto } from './ellipse-ellipse-intersections-into';
// ellipse × triangle intersection point collection
export { ellipseTriangleIntersections } from './ellipse-triangle-intersections';
export { ellipseTriangleIntersectionsInto } from './ellipse-triangle-intersections-into';
// line-family × bounds intersection point collection
export { infiniteLineBoundsIntersections } from './infinite-line-bounds-intersections';
export { infiniteLineBoundsIntersectionsInto } from './infinite-line-bounds-intersections-into';
// line-family × circle intersection point collection
export { infiniteLineCircleIntersections } from './infinite-line-circle-intersections';
export { infiniteLineCircleIntersectionsInto } from './infinite-line-circle-intersections-into';
export { infiniteLineCubicIntersections } from './infinite-line-cubic-intersections';
export { infiniteLineCubicIntersectionsInto } from './infinite-line-cubic-intersections-into';
// line-family × ellipse intersection point collection
export { infiniteLineEllipseIntersections } from './infinite-line-ellipse-intersections';
export { infiniteLineEllipseIntersectionsInto } from './infinite-line-ellipse-intersections-into';
// line-family × polygon intersection point collection
export { infiniteLinePolygonIntersections } from './infinite-line-polygon-intersections';
export { infiniteLinePolygonIntersectionsInto } from './infinite-line-polygon-intersections-into';
// line-family × polygon collinear overlap interval collection
export { infiniteLinePolygonOverlapIntervals } from './infinite-line-polygon-overlap-intervals';
export { infiniteLinePolygonOverlapIntervalsInto } from './infinite-line-polygon-overlap-intervals-into';
export { infiniteLineQuadraticIntersections } from './infinite-line-quadratic-intersections';
export { infiniteLineQuadraticIntersectionsInto } from './infinite-line-quadratic-intersections-into';
// line-family × rect intersection point collection
export { infiniteLineRectIntersections } from './infinite-line-rect-intersections';
export { infiniteLineRectIntersectionsInto } from './infinite-line-rect-intersections-into';
// path × closed primitive relation
export { intersectsBoundsBounds } from './intersects-bounds-bounds';
export { intersectsBoundsInfiniteLine } from './intersects-bounds-infinite-line';
// ray cross-domain relation
export { intersectsBoundsRay } from './intersects-bounds-ray';
// line-family × bounds relation
export { intersectsBoundsSegment } from './intersects-bounds-segment';
export { intersectsBoundsTriangle } from './intersects-bounds-triangle';
// capsule relation
export { intersectsCapsuleCapsule } from './intersects-capsule-capsule';
export { intersectsCapsulePoint } from './intersects-capsule-point';
export { intersectsCapsuleSegment } from './intersects-capsule-segment';
export { intersectsCircleBounds } from './intersects-circle-bounds';
export { intersectsCircleCircle } from './intersects-circle-circle';
export { intersectsCircleInfiniteLine } from './intersects-circle-infinite-line';
export { intersectsCircleRay } from './intersects-circle-ray';
export { intersectsCircleRect } from './intersects-circle-rect';
// line-family × circle relation
export { intersectsCircleSegment } from './intersects-circle-segment';
export { intersectsCircleTriangle } from './intersects-circle-triangle';
// curve segment × closed primitive relation
export { intersectsCubicBounds } from './intersects-cubic-bounds';
export { intersectsCubicCircle } from './intersects-cubic-circle';
export { intersectsCubicEllipse } from './intersects-cubic-ellipse';
export { intersectsCubicRect } from './intersects-cubic-rect';
export { intersectsCubicTriangle } from './intersects-cubic-triangle';
export { intersectsEllipseBounds } from './intersects-ellipse-bounds';
export { intersectsEllipseCircle } from './intersects-ellipse-circle';
export { intersectsEllipseInfiniteLine } from './intersects-ellipse-infinite-line';
export { intersectsEllipseRay } from './intersects-ellipse-ray';
export { intersectsEllipseRect } from './intersects-ellipse-rect';
// line-family × ellipse relation
export { intersectsEllipseSegment } from './intersects-ellipse-segment';
export { intersectsEllipseTriangle } from './intersects-ellipse-triangle';
export { intersectsInfiniteLineInfiniteLine } from './intersects-infinite-line-infinite-line';
export { intersectsInfiniteLineRay } from './intersects-infinite-line-ray';
export { intersectsInfiniteLineSegment } from './intersects-infinite-line-segment';
// oriented-rect relation
export { intersectsOrientedRectOrientedRect } from './intersects-oriented-rect-oriented-rect';
export { intersectsOrientedRectPoint } from './intersects-oriented-rect-point';
export { intersectsPathBounds } from './intersects-path-bounds';
export { intersectsPathCircle } from './intersects-path-circle';
export { intersectsPathEllipse } from './intersects-path-ellipse';
export { intersectsPathInfiniteLine } from './intersects-path-infinite-line';
// path × polygon / path × polyline relation
export { intersectsPathPolygon } from './intersects-path-polygon';
export { intersectsPathPolyline } from './intersects-path-polyline';
// path × line-family relation (continued)
export { intersectsPathRay } from './intersects-path-ray';
export { intersectsPathRect } from './intersects-path-rect';
// path × line-family relation
export { intersectsPathSegment } from './intersects-path-segment';
export { intersectsPathTriangle } from './intersects-path-triangle';
export { intersectsPolygonBounds } from './intersects-polygon-bounds';
export { intersectsPolygonInfiniteLine } from './intersects-polygon-infinite-line';
// polygon × polyline relation
export { intersectsPolygonPolyline } from './intersects-polygon-polyline';
export { intersectsPolygonRay } from './intersects-polygon-ray';
export { intersectsPolygonRect } from './intersects-polygon-rect';
// line-family × polygon relation
export { intersectsPolygonSegment } from './intersects-polygon-segment';
export { intersectsPolylineInfiniteLine } from './intersects-polyline-infinite-line';
export { intersectsPolylineRay } from './intersects-polyline-ray';
// line-family × polyline relation
export { intersectsPolylineSegment } from './intersects-polyline-segment';
// curve segment × closed primitive relation
export { intersectsQuadraticBounds } from './intersects-quadratic-bounds';
export { intersectsQuadraticCircle } from './intersects-quadratic-circle';
export { intersectsQuadraticEllipse } from './intersects-quadratic-ellipse';
export { intersectsQuadraticRect } from './intersects-quadratic-rect';
export { intersectsQuadraticTriangle } from './intersects-quadratic-triangle';
export { intersectsRayRay } from './intersects-ray-ray';
// line-family cross-domain relation
export { intersectsRaySegment } from './intersects-ray-segment';
export { intersectsRectBounds } from './intersects-rect-bounds';
export { intersectsRectInfiniteLine } from './intersects-rect-infinite-line';
export { intersectsRectRay } from './intersects-rect-ray';
export { intersectsRectRect } from './intersects-rect-rect';
// line-family × rect relation
export { intersectsRectSegment } from './intersects-rect-segment';
export { intersectsRectTriangle } from './intersects-rect-triangle';
export { intersectsSegmentSegment } from './intersects-segment-segment';
export { intersectsTriangleInfiniteLine } from './intersects-triangle-infinite-line';
export { intersectsTriangleRay } from './intersects-triangle-ray';
// line-family × triangle relation
export { intersectsTriangleSegment } from './intersects-triangle-segment';
export { intersectsTriangleTriangle } from './intersects-triangle-triangle';
export { lineCurveIntersections } from './line-curve-intersections';
export { lineCurveIntersectionsInto } from './line-curve-intersections-into';
// polygon × polygon lightweight boolean relation
export { polygonPolygonIntersects } from './polygon-polygon-intersects';
// polyline × polyline intersection point collection
export { polylinePolylineIntersections } from './polyline-polyline-intersections';
export { polylinePolylineIntersectionsInto } from './polyline-polyline-intersections-into';
// line-family × bounds intersection point collection
export { rayBoundsIntersections } from './ray-bounds-intersections';
export { rayBoundsIntersectionsInto } from './ray-bounds-intersections-into';
export { rayCircleIntersections } from './ray-circle-intersections';
export { rayCircleIntersectionsInto } from './ray-circle-intersections-into';
export { rayCubicIntersections } from './ray-cubic-intersections';
export { rayCubicIntersectionsInto } from './ray-cubic-intersections-into';
export { rayEllipseIntersections } from './ray-ellipse-intersections';
export { rayEllipseIntersectionsInto } from './ray-ellipse-intersections-into';
// line-family × polygon intersection point collection
export { rayPolygonIntersections } from './ray-polygon-intersections';
export { rayPolygonIntersectionsInto } from './ray-polygon-intersections-into';
// line-family × polygon collinear overlap interval collection
export { rayPolygonOverlapIntervals } from './ray-polygon-overlap-intervals';
export { rayPolygonOverlapIntervalsInto } from './ray-polygon-overlap-intervals-into';
export { rayQuadraticIntersections } from './ray-quadratic-intersections';
export { rayQuadraticIntersectionsInto } from './ray-quadratic-intersections-into';
// line-family × rect intersection point collection
export { rayRectIntersections } from './ray-rect-intersections';
export { rayRectIntersectionsInto } from './ray-rect-intersections-into';
// visibility / ray casting
export { raysFromPointToPolygon } from './rays-from-point-to-polygon';
export { raysFromPointToPolygonInto } from './rays-from-point-to-polygon-into';
// rect area overlap detail
export { rectRectAreaOverlapDetail } from './rect-rect-area-overlap-detail';
// line-family × bounds intersection point collection
export { segmentBoundsIntersections } from './segment-bounds-intersections';
export { segmentBoundsIntersectionsInto } from './segment-bounds-intersections-into';
export { segmentCircleIntersections } from './segment-circle-intersections';
export { segmentCircleIntersectionsInto } from './segment-circle-intersections-into';
export { segmentCubicIntersections } from './segment-cubic-intersections';
export { segmentCubicIntersectionsInto } from './segment-cubic-intersections-into';
export { segmentCurveIntersections } from './segment-curve-intersections';
export { segmentCurveIntersectionsInto } from './segment-curve-intersections-into';
export { segmentEllipseIntersections } from './segment-ellipse-intersections';
export { segmentEllipseIntersectionsInto } from './segment-ellipse-intersections-into';
// line-family × polygon intersection point collection
export { segmentPolygonIntersections } from './segment-polygon-intersections';
export { segmentPolygonIntersectionsInto } from './segment-polygon-intersections-into';
// line-family × polygon collinear overlap interval collection
export { segmentPolygonOverlapIntervals } from './segment-polygon-overlap-intervals';
export { segmentPolygonOverlapIntervalsInto } from './segment-polygon-overlap-intervals-into';
// line-family × Bezier curve intersection
export { segmentQuadraticIntersections } from './segment-quadratic-intersections';
export { segmentQuadraticIntersectionsInto } from './segment-quadratic-intersections-into';
// line-family × rect intersection point collection
export { segmentRectIntersections } from './segment-rect-intersections';
export { segmentRectIntersectionsInto } from './segment-rect-intersections-into';
// segment relation detail
export { segmentSegmentDetail } from './segment-segment-detail';
// segment-segment intersection point collection
export { segmentSegmentIntersections } from './segment-segment-intersections';
export { segmentSegmentIntersectionsInto } from './segment-segment-intersections-into';
export { singleIntersectionInfiniteLineBounds } from './single-intersection-infinite-line-bounds';
export { singleIntersectionInfiniteLineBoundsInto } from './single-intersection-infinite-line-bounds-into';
export { singleIntersectionInfiniteLineCircle } from './single-intersection-infinite-line-circle';
export { singleIntersectionInfiniteLineCircleInto } from './single-intersection-infinite-line-circle-into';
export { singleIntersectionInfiniteLineEllipse } from './single-intersection-infinite-line-ellipse';
export { singleIntersectionInfiniteLineEllipseInto } from './single-intersection-infinite-line-ellipse-into';
export { singleIntersectionInfiniteLineRect } from './single-intersection-infinite-line-rect';
export { singleIntersectionInfiniteLineRectInto } from './single-intersection-infinite-line-rect-into';
export { singleIntersectionInfiniteLineTriangle } from './single-intersection-infinite-line-triangle';
export { singleIntersectionInfiniteLineTriangleInto } from './single-intersection-infinite-line-triangle-into';
export { singleIntersectionRayBounds } from './single-intersection-ray-bounds';
export { singleIntersectionRayBoundsInto } from './single-intersection-ray-bounds-into';
export { singleIntersectionRayCircle } from './single-intersection-ray-circle';
export { singleIntersectionRayCircleInto } from './single-intersection-ray-circle-into';
export { singleIntersectionRayEllipse } from './single-intersection-ray-ellipse';
export { singleIntersectionRayEllipseInto } from './single-intersection-ray-ellipse-into';
export { singleIntersectionRayInfiniteLine } from './single-intersection-ray-infinite-line';
export { singleIntersectionRayInfiniteLineInto } from './single-intersection-ray-infinite-line-into';
export { singleIntersectionRayRect } from './single-intersection-ray-rect';
export { singleIntersectionRayRectInto } from './single-intersection-ray-rect-into';
export { singleIntersectionRayTriangle } from './single-intersection-ray-triangle';
export { singleIntersectionRayTriangleInto } from './single-intersection-ray-triangle-into';
export { singleIntersectionSegmentBounds } from './single-intersection-segment-bounds';
export { singleIntersectionSegmentBoundsInto } from './single-intersection-segment-bounds-into';
export { singleIntersectionSegmentCircle } from './single-intersection-segment-circle';
export { singleIntersectionSegmentCircleInto } from './single-intersection-segment-circle-into';
export { singleIntersectionSegmentEllipse } from './single-intersection-segment-ellipse';
export { singleIntersectionSegmentEllipseInto } from './single-intersection-segment-ellipse-into';
export { singleIntersectionSegmentInfiniteLine } from './single-intersection-segment-infinite-line';
export { singleIntersectionSegmentInfiniteLineInto } from './single-intersection-segment-infinite-line-into';
export { singleIntersectionSegmentRay } from './single-intersection-segment-ray';
export { singleIntersectionSegmentRayInto } from './single-intersection-segment-ray-into';
export { singleIntersectionSegmentRect } from './single-intersection-segment-rect';
export { singleIntersectionSegmentRectInto } from './single-intersection-segment-rect-into';
export { singleIntersectionSegmentTriangle } from './single-intersection-segment-triangle';
export { singleIntersectionSegmentTriangleInto } from './single-intersection-segment-triangle-into';
// line-family × triangle intersection point collection
export { triangleInfiniteLineIntersections } from './triangle-infinite-line-intersections';
export { triangleInfiniteLineIntersectionsInto } from './triangle-infinite-line-intersections-into';
export { triangleRayIntersections } from './triangle-ray-intersections';
export { triangleRayIntersectionsInto } from './triangle-ray-intersections-into';
export { triangleSegmentIntersections } from './triangle-segment-intersections';
export { triangleSegmentIntersectionsInto } from './triangle-segment-intersections-into';
// triangle × triangle intersection point collection
export { triangleTriangleIntersections } from './triangle-triangle-intersections';
export { triangleTriangleIntersectionsInto } from './triangle-triangle-intersections-into';
// visibility / ray casting
export { visibilityPolygon } from './visibility-polygon';
export { visibilityPolygonInto } from './visibility-polygon-into';
