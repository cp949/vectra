/**
 * Matrix Lerp Blend
 *
 * 하단 slider t를 드래그하면 고정 keyframe transform A·B를 component-wise 보간한 matrix로 변환된
 * 도형이 갱신된다. translation(tx,ty)은 직선으로 선형 이동하지만 회전+스케일 성분은 따로 보간되지
 * 않아, 중간 t에서 도형이 비강체로 수축하고 det가 endpoint det의 선형 보간보다 낮게 떨어진다.
 *
 * - Matrix.lerpInto: 두 keyframe matrix A·B를 t로 component-wise(a,b,c,d,tx,ty 독립) 선형 보간
 * - Matrix.transformPointInto: 보간 matrix를 로컬 도형 정점에 적용
 * - Matrix.determinant: 보간 matrix의 면적 배율(det) → 비강체 dip 진단
 * - Matrix.appendTranslateInto/appendRotateInto/appendScaleInto: keyframe A·B를 setup에서 TRS로 1회 구성
 */

import * as Matrix from '@cp949/vectra/matrix';

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  // diagnostics readout 라벨 (g.text 미사용)
  const label = new PIXI.Text({
    text: '',
    style: { fill: 0x94a3b8, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  // 변환 대상 로컬 도형: 원점 기준 비대칭 arrow (회전·반사를 눈으로 식별)
  const shape = [
    { x: -42, y: -14 },
    { x: 14, y: -14 },
    { x: 14, y: -30 },
    { x: 46, y: 0 },
    { x: 14, y: 30 },
    { x: 14, y: 14 },
    { x: -42, y: 14 },
  ];

  // 한 keyframe transform을 TRS(translate ∘ rotate ∘ scale)로 구성한다 (setup 1회, hot path 아님)
  const buildKeyframe = (cx: number, cy: number, deg: number, scale: number) => {
    const m = Matrix.createMatrix();
    Matrix.appendTranslateInto(m, m, { x: cx, y: cy }); // 위치
    Matrix.appendRotateInto(m, m, (deg * Math.PI) / 180); // 회전
    Matrix.appendScaleInto(m, m, scale, scale); // 균일 스케일
    return m;
  };

  // 고정 keyframe A(t=0)·B(t=1). B는 회전차를 크게(150°) 잡아 중간 t의 det dip을 또렷이 보인다
  const A = buildKeyframe(220, 210, 0, 0.9);
  const B = buildKeyframe(520, 210, 150, 1.5);

  // endpoint det: 선형 보간선의 기준값 (회전은 det에 영향 없음 → scale²)
  const detA = Matrix.determinant(A);
  const detB = Matrix.determinant(B);

  // slider 범위: lerp는 t를 clamp하지 않으므로 [0,1] 밖 extrapolation도 보인다
  const T_MIN = -0.2;
  const T_MAX = 1.2;
  let t = 0.5; // 시작은 중간 → 비강체 수축을 바로 보인다

  // slider track 좌표
  const trackY = 392;
  const trackLeft = 150;
  const trackRight = 570;
  const trackW = trackRight - trackLeft;
  const HIT_TOLERANCE = 18; // scrubber grab 허용 반경(px)
  const KNOB_R = 9;

  // 매 프레임 재기록하는 held buffer (allocation-free hot path)
  const blend = Matrix.createMatrix(); // 보간 결과 matrix
  const world = shape.map(() => ({ x: 0, y: 0 })); // blended 도형 정점
  const worldA = shape.map(() => ({ x: 0, y: 0 })); // A ghost 정점 (1회 계산)
  const worldB = shape.map(() => ({ x: 0, y: 0 })); // B ghost 정점 (1회 계산)
  const center = { x: 0, y: 0 }; // blended center(tx,ty 시각화)

  // ghost 도형은 keyframe이 고정이라 setup에서 1회만 변환한다
  for (let i = 0; i < shape.length; i++) {
    Matrix.transformPointInto(worldA[i], A, shape[i]);
    Matrix.transformPointInto(worldB[i], B, shape[i]);
  }

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): { x: number; y: number } => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // scrubber x 위치(world)를 현재 t로 환산
  const knobX = (): number => trackLeft + ((t - T_MIN) / (T_MAX - T_MIN)) * trackW;

  /** pointerdown: 커서가 scrubber 반경 안이면 grab한다. */
  const onPointerDown = (e: PointerEvent): void => {
    const c = getCanvasXY(e);
    const dx = c.x - knobX();
    const dy = c.y - trackY;
    grabbed = dx * dx + dy * dy <= HIT_TOLERANCE * HIT_TOLERANCE;
  };

  /** pointermove: scrubber x를 track 비율로 환산해 t로 역산한다. */
  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const c = getCanvasXY(e);
    // track 폭으로 clamp한 비율을 [T_MIN,T_MAX]로 매핑 (finite t만 생성)
    const ratio = Math.max(0, Math.min(1, (c.x - trackLeft) / trackW));
    t = T_MIN + ratio * (T_MAX - T_MIN);
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  // 정점 배열로 닫힌 polygon path를 그린다
  const drawPoly = (pts: { x: number; y: number }[]): void => {
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
    g.closePath();
  };

  const render = (): void => {
    // component-wise 보간: out.* = A.* + (B.* - A.*) * t (6개 성분 독립)
    Matrix.lerpInto(blend, A, B, t);
    for (let i = 0; i < shape.length; i++) {
      Matrix.transformPointInto(world[i], blend, shape[i]);
    }
    // 보간 matrix의 translation = blended center (tx,ty)
    center.x = blend.tx;
    center.y = blend.ty;

    const det = Matrix.determinant(blend);

    g.clear();

    // keyframe center를 잇는 직선: tx,ty가 선형(직선)으로 보간됨을 보인다
    g.moveTo(A.tx, A.ty).lineTo(B.tx, B.ty).stroke({ color: 0x334155, width: 1 });

    // keyframe A·B ghost 도형 (보간의 두 endpoint, 같은 관계)
    drawPoly(worldA);
    g.stroke({ color: 0x64748b, width: 1.5 });
    drawPoly(worldB);
    g.stroke({ color: 0xf59e0b, width: 1.5 });

    // blended 도형: det가 0에 근접하면 near-degenerate라 채움 alpha를 낮춰 수축을 강조
    const nearDegenerate = Math.abs(det) < 0.2;
    drawPoly(world);
    g.fill({ color: nearDegenerate ? 0xf87171 : 0x38bdf8, alpha: 0.18 }).stroke({
      color: nearDegenerate ? 0xf87171 : 0x38bdf8,
      width: 2,
    });

    // blended center marker (직선 경로 위에서 선형 이동)
    g.circle(center.x, center.y, 4).fill({ color: 0xe2e8f0 });

    // slider track + [0,1] in-range zone band
    const zoneL = trackLeft + ((0 - T_MIN) / (T_MAX - T_MIN)) * trackW;
    const zoneR = trackLeft + ((1 - T_MIN) / (T_MAX - T_MIN)) * trackW;
    g.rect(zoneL, trackY - 4, zoneR - zoneL, 8).fill({ color: 0x1e293b });
    g.moveTo(trackLeft, trackY).lineTo(trackRight, trackY).stroke({ color: 0x475569, width: 2 });
    // scrubber knob
    g.circle(knobX(), trackY, KNOB_R).fill({ color: 0xe2e8f0 });

    // diagnostics: t, 보간 matrix det, blended center(tx,ty)
    label.text =
      `t ${t.toFixed(2)}   det ${det.toFixed(2)} (A ${detA.toFixed(2)} → B ${detB.toFixed(2)})` +
      `   center (${Math.round(center.x)}, ${Math.round(center.y)})`;
    label.x = 16;
    label.y = 16;
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    g.destroy();
    label.destroy();
  };
}
