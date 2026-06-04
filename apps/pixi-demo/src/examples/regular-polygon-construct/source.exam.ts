/**
 * Regular Polygon Construct
 *
 * 위쪽 슬라이더로 변 수 `N`(3..12)을 정하면 `regularPolygon(center, R, N)`이 고정 외접원 위에 정 N각형
 * (regular polygon) 꼭짓점을 구성해 다시 그린다. 슬라이더를 끌면 같은 외접원 위에서 변 수만 바뀌며
 * 삼각형→사각형→…으로 정다각형이 새로 구성돼, "파라미터(center·반지름·변 수)에서 정다각형 꼭짓점을
 * 구성한다"는 작업 흐름을 보인다.
 *
 * - Polygonx.regularPolygon: center·외접원 반지름·sides에서 정 N각형 꼭짓점 `{ points }`를 구성해
 *   반환한다. close vertex 없이 정확히 N개 꼭짓점만 만든다. N 변경 시에만 1회 호출하고, 단발 결과라
 *   allocating companion을 그대로 쓴다(`regularPolygonInto` out-buffer scaffold 미사용).
 */

import * as Polygonx from '@cp949/vectra/polygon';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const GUIDE_COLOR = 0x334155; // 외접원 보조선: 어두운 회청색
const CENTER_COLOR = 0x64748b; // 중심 dot: 회색
const POLY_STROKE = 0x38bdf8; // 정다각형 변: 하늘색
const POLY_FILL = 0x0e2a3a; // 정다각형 채움: 어두운 청록
const VERTEX_COLOR = 0xa3e635; // 꼭짓점 dot: 연두
const FIRST_COLOR = 0xfacc15; // 첫 꼭짓점(startAngle 기준) 강조: 노랑
const TRACK_COLOR = 0x334155; // 슬라이더 트랙: 어두운 회청색
const KNOB_COLOR = 0xfacc15; // 슬라이더 knob(주 조작 대상): 노랑
const HIT_RADIUS = 22; // knob 잡기 판정 반경 (px)

// 정다각형 구성 파라미터(고정). sides만 슬라이더로 바뀐다.
const SIDES_MIN = 3;
const SIDES_MAX = 12;
const RADIUS = 130; // 외접원 반지름 (circumradius)
const START_ANGLE = -Math.PI / 2; // 위쪽 꼭짓점에서 시작

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  // 정다각형 중심: 화면 중앙(슬라이더 아래쪽 여백 고려).
  const center: XY = { x: size.width / 2, y: 250 };

  // 슬라이더 트랙: 변 수 N을 1 DOF로 매핑한다.
  const trackLeft = 90;
  const trackRight = size.width - 60;
  const trackY = 80;

  // 슬라이더 x ↔ 정수 변 수 N
  const xAtSides = (n: number): number =>
    trackLeft + ((n - SIDES_MIN) / (SIDES_MAX - SIDES_MIN)) * (trackRight - trackLeft);
  const sidesAtX = (x: number): number => {
    const t = (x - trackLeft) / (trackRight - trackLeft);
    const raw = SIDES_MIN + t * (SIDES_MAX - SIDES_MIN);
    return Math.max(SIDES_MIN, Math.min(SIDES_MAX, Math.round(raw)));
  };

  let sides = 6; // 초기 변 수
  // 단일 핵심 관계: (center, RADIUS, sides) → 정 N각형 꼭짓점
  let poly: XY[] = Polygonx.regularPolygon(center, RADIUS, sides, { startAngle: START_ANGLE }).points;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (size.width / rect.width),
      y: (e.clientY - rect.top) * (size.height / rect.height),
    };
  };

  // N 변경 시에만 1회 재구성 → state 저장. ticker render는 저장 state만 그린다.
  const rebuild = (): void => {
    poly = Polygonx.regularPolygon(center, RADIUS, sides, { startAngle: START_ANGLE }).points;
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // knob 근처를 눌렀을 때만 잡는다 (슬라이더가 유일한 조작 대상)
    grabbed = Math.hypot(xAtSides(sides) - p.x, trackY - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // drag x를 정수 변 수로 환산·clamp → sides는 항상 3..12 정수 (빈 points 미발생)
    const next = sidesAtX(p.x);
    if (next !== sides) {
      sides = next;
      rebuild();
    }
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(1).padStart(6);

  const render = (): void => {
    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG_COLOR });

    // 외접원: 꼭짓점이 이 원 위에 놓임을 보이는 분해 표시 (단일 구성 관계의 일부)
    g.circle(center.x, center.y, RADIUS).stroke({ color: GUIDE_COLOR, width: 1 });
    g.circle(center.x, center.y, 3).fill({ color: CENTER_COLOR });

    // 정 N각형: 저장된 꼭짓점만 그림 → 프레임당 vectra 할당 없음
    g.moveTo(poly[0].x, poly[0].y);
    for (let i = 1; i < poly.length; i++) g.lineTo(poly[i].x, poly[i].y);
    g.closePath();
    g.fill({ color: POLY_FILL, alpha: 0.55 }).stroke({ color: POLY_STROKE, width: 2 });

    // 꼭짓점 dot + 첫 꼭짓점(startAngle 기준) 강조
    for (let i = 0; i < poly.length; i++) {
      g.circle(poly[i].x, poly[i].y, 4).fill({ color: i === 0 ? FIRST_COLOR : VERTEX_COLOR });
    }

    // 슬라이더 트랙 + 정수 눈금 + knob (유일한 조작 대상)
    g.moveTo(trackLeft, trackY).lineTo(trackRight, trackY).stroke({ color: TRACK_COLOR, width: 2 });
    for (let n = SIDES_MIN; n <= SIDES_MAX; n++) {
      g.circle(xAtSides(n), trackY, 2).fill({ color: TRACK_COLOR });
    }
    const kx = xAtSides(sides);
    g.circle(kx, trackY, grabbed ? 11 : 9).fill({ color: KNOB_COLOR });
    g.circle(kx, trackY, HIT_RADIUS).stroke({ color: KNOB_COLOR, width: 1, alpha: 0.16 });

    // 변 길이: 반환된 꼭짓점 0·1 사이 거리를 inline으로 잰다 (등간격 출력 확인, 두 번째 API 아님)
    const edge = Math.hypot(poly[1].x - poly[0].x, poly[1].y - poly[0].y);

    // diagnostics: 단일 구성 관계를 변 수·외접원 반지름·출력 변 길이로 읽는다 (3개)
    label.text = [
      `sides   : ${String(sides).padStart(6)}   drag slider`,
      `circumR : ${fmt(RADIUS)}   circumscribed`,
      `edge    : ${fmt(edge)}   from vertices`,
    ].join('\n');
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    label.destroy();
    g.destroy();
  };
}
