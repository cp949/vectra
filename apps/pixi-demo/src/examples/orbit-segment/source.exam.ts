/**
 * Orbit Segment
 *
 * 한 점(분홍)이 circle 둘레를 돌고, 그 점에서 circle 경계까지의 closest point(하늘색)와
 * segment 중간점(노랑)이 매 프레임 함께 표시된다. circle과 segment가 닿으면 segment 색이
 * 회색에서 초록으로 바뀐다.
 *
 * - Circles.pointAtAngleInto: 각도에 따라 circle 둘레 위 orbit 점 계산
 * - Circles.closestPointInto: orbit 점에서 circle 경계까지 closest point 계산
 * - Segments.pointAtTInto: 비율 0.5로 segment 중간점 계산
 * - Intersects.intersectsCircleSegment: circle과 segment 교차 여부 boolean 반환
 */

import * as Circles from '@cp949/vectra/circle';
import * as Intersects from '@cp949/vectra/intersects';
import * as Segments from '@cp949/vectra/segment';

/**
 * circle과 segment 관계를 계산해 시각화하는 예제 진입점이다.
 *
 * 각 프레임에서는 vectra 함수가 caller-provided output 객체에 좌표를 기록하고,
 * boolean 관계 함수는 렌더링 색상을 결정하는 값으로 직접 사용된다.
 */
export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, circle, segment } = runtime;
  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const orbit = { x: 0, y: 0 };
  const closest = { x: 0, y: 0 };
  const midpoint = { x: 0, y: 0 };

  const render = (ticker: PIXI.Ticker): void => {
    const angle = ticker.lastTime / 900;

    // pointAtAngleInto는 circle 중심과 반지름, 각도를 이용해 원 위의 점을 계산한다.
    // 결과는 새 객체를 만들지 않고 orbit output에 기록된다.
    Circles.pointAtAngleInto(orbit, circle, angle);

    // closestPointInto는 입력 점에서 circle 경계까지 가장 가까운 점을 계산한다.
    // 여기서는 orbit 점이 이미 원 위에 있으므로, closest는 orbit과 같은 위치가 된다.
    // 예제에서는 두 점을 선으로 이어 Into output 패턴을 눈으로 확인할 수 있게 둔다.
    Circles.closestPointInto(closest, circle, orbit);

    // pointAtTInto는 segment 위의 parameter t 위치를 샘플링한다.
    // 0.5를 넣으면 segment 양 끝점의 정확한 중간점이 midpoint에 기록된다.
    Segments.pointAtTInto(midpoint, segment, 0.5);

    // intersectsCircleSegment은 circle과 segment가 닿거나 겹치는지 boolean으로 반환한다.
    // object output이 아닌 scalar/boolean 결과는 직접 반환한다는 vectra API 규칙을 보여준다.
    const hit = Intersects.intersectsCircleSegment(circle, segment);

    g.clear();
    g.circle(circle.center.x, circle.center.y, circle.radius).stroke({ color: 0x38bdf8, width: 2 });
    g.moveTo(segment.a.x, segment.a.y)
      .lineTo(segment.b.x, segment.b.y)
      .stroke({
        color: hit ? 0x4ade80 : 0x94a3b8,
        width: 4,
      });
    g.moveTo(orbit.x, orbit.y).lineTo(closest.x, closest.y).stroke({ color: 0x475569, width: 1 });
    g.circle(orbit.x, orbit.y, 8).fill(0xf472b6);
    g.circle(closest.x, closest.y, 6).fill(0x38bdf8);
    g.circle(midpoint.x, midpoint.y, 5).fill(0xfacc15);
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    g.destroy();
  };
}
