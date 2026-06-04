/**
 * Star Polygon Spikes
 *
 * 위쪽 슬라이더로 inner 반지름 비율 `r/R`(0.10..0.95)을 정하면, 같은 외접원 반지름 R과 고정
 * 꼭짓점 수에서 `starPolygon`이 `outer, inner, outer, inner, ...` 교차 꼭짓점 `2*points`개로 별
 * 외곽선을 다시 구성한다. 비율을 줄이면 inner 꼭짓점이 중심으로 모여 더 뾰족한 별이 되고, 1.0에
 * 가까워지면 outer/inner 반지름이 비슷해져 정 2N각형에 가까워진다. "두 반지름의 교차에서 별
 * 꼭짓점을 구성한다"는 작업 흐름을 보인다.
 *
 * - Polygonx.starPolygon: center·inner 반지름·outer 반지름·points에서 별 꼭짓점 `{ points }`를
 *   구성해 반환한다. outer부터 시작해 inner와 교차하며 정확히 `2*points`개 꼭짓점을 만든다(close
 *   vertex 없음). inner 비율 변경 시에만 1회 호출하고, 단발 결과라 allocating companion을 그대로
 *   쓴다(`starPolygonInto` out-buffer scaffold 미사용).
 */

import * as Polygonx from '@cp949/vectra/polygon';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const OUTER_GUIDE = 0x334155; // 외접원(R) 보조선: 어두운 회청색
const INNER_GUIDE = 0x1e293b; // inner 원(r) 보조선: 더 어두운 청색
const CENTER_COLOR = 0x64748b; // 중심 dot: 회색
const STAR_STROKE = 0xfacc15; // 별 외곽선: 노랑
const STAR_FILL = 0x3b2f0a; // 별 채움: 어두운 황갈
const OUTER_VERTEX = 0xfde68a; // outer 꼭짓점 dot: 밝은 노랑
const INNER_VERTEX = 0x38bdf8; // inner 꼭짓점 dot: 하늘색
const TRACK_COLOR = 0x334155; // 슬라이더 트랙: 어두운 회청색
const KNOB_COLOR = 0xfacc15; // 슬라이더 knob(주 조작 대상): 노랑
const HIT_RADIUS = 22; // knob 잡기 판정 반경 (px)

// 별 구성 파라미터(고정). inner 비율만 슬라이더로 바뀐다.
const POINTS = 5; // 별 꼭짓점 수(정수 상수 → 빈 결과 미발생)
const OUTER_RADIUS = 130; // 외접원 반지름 (outer vertex 거리)
const START_ANGLE = -Math.PI / 2; // 위쪽 outer 꼭짓점에서 시작
const RATIO_MIN = 0.1; // inner/outer 비율 하한
const RATIO_MAX = 0.95; // inner/outer 비율 상한 (정 2N각형에 근접)

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

  // 별 중심: 화면 중앙(슬라이더 아래쪽 여백 고려).
  const center: XY = { x: size.width / 2, y: 250 };

  // 슬라이더 트랙: inner 비율을 1 DOF로 매핑한다.
  const trackLeft = 90;
  const trackRight = size.width - 60;
  const trackY = 80;

  // 슬라이더 x ↔ inner 비율 r/R
  const xAtRatio = (ratio: number): number =>
    trackLeft + ((ratio - RATIO_MIN) / (RATIO_MAX - RATIO_MIN)) * (trackRight - trackLeft);
  const ratioAtX = (x: number): number => {
    const t = (x - trackLeft) / (trackRight - trackLeft);
    const raw = RATIO_MIN + t * (RATIO_MAX - RATIO_MIN);
    return Math.max(RATIO_MIN, Math.min(RATIO_MAX, raw));
  };

  let ratio = 0.4; // 초기 inner 비율
  // 단일 핵심 관계: (center, r=R*ratio, R, POINTS) → outer/inner 교차 별 꼭짓점
  let poly: XY[] = Polygonx.starPolygon(center, OUTER_RADIUS * ratio, OUTER_RADIUS, POINTS, {
    startAngle: START_ANGLE,
  }).points;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (size.width / rect.width),
      y: (e.clientY - rect.top) * (size.height / rect.height),
    };
  };

  // 비율 변경 시에만 1회 재구성 → state 저장. ticker render는 저장 state만 그린다.
  const rebuild = (): void => {
    poly = Polygonx.starPolygon(center, OUTER_RADIUS * ratio, OUTER_RADIUS, POINTS, {
      startAngle: START_ANGLE,
    }).points;
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // knob 근처를 눌렀을 때만 잡는다 (슬라이더가 유일한 조작 대상)
    grabbed = Math.hypot(xAtRatio(ratio) - p.x, trackY - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // drag x를 inner 비율로 환산·clamp → ratio는 항상 0.10..0.95 (points는 상수라 빈 결과 미발생)
    ratio = ratioAtX(p.x);
    rebuild();
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(3).padStart(6);

  const render = (): void => {
    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG_COLOR });

    // 두 반지름 분해 표시: outer 꼭짓점은 R 원 위, inner 꼭짓점은 r 원 위에 놓인다
    g.circle(center.x, center.y, OUTER_RADIUS).stroke({ color: OUTER_GUIDE, width: 1 });
    g.circle(center.x, center.y, OUTER_RADIUS * ratio).stroke({ color: INNER_GUIDE, width: 1 });
    g.circle(center.x, center.y, 3).fill({ color: CENTER_COLOR });

    // 별 외곽선: 저장된 꼭짓점만 그림 → 프레임당 vectra 할당 없음
    g.moveTo(poly[0].x, poly[0].y);
    for (let i = 1; i < poly.length; i++) g.lineTo(poly[i].x, poly[i].y);
    g.closePath();
    g.fill({ color: STAR_FILL, alpha: 0.6 }).stroke({ color: STAR_STROKE, width: 2 });

    // 꼭짓점 dot: 짝수 index = outer, 홀수 index = inner (교차 순서를 색으로 구분)
    for (let i = 0; i < poly.length; i++) {
      g.circle(poly[i].x, poly[i].y, 4).fill({ color: i % 2 === 0 ? OUTER_VERTEX : INNER_VERTEX });
    }

    // 슬라이더 트랙 + knob (유일한 조작 대상)
    g.moveTo(trackLeft, trackY).lineTo(trackRight, trackY).stroke({ color: TRACK_COLOR, width: 2 });
    const kx = xAtRatio(ratio);
    g.circle(kx, trackY, grabbed ? 11 : 9).fill({ color: KNOB_COLOR });
    g.circle(kx, trackY, HIT_RADIUS).stroke({ color: KNOB_COLOR, width: 1, alpha: 0.16 });

    // diagnostics: 단일 구성 관계를 꼭짓점 수·inner 비율·총 vertex 수로 읽는다 (3개)
    label.text = [
      `points  : ${String(POINTS).padStart(6)}   drag slider for ratio`,
      `ratio   : ${fmt(ratio)}   inner r / outer R`,
      `vertices: ${String(poly.length).padStart(6)}   = 2 * points`,
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
