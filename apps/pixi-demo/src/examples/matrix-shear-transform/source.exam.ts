/**
 * Matrix Shear Transform
 *
 * 사각형 상단 edge handle을 좌우로 드래그하면 base 행을 pivot 축으로 사각형이 수평 shear되어
 * 평행사변형이 된다. base는 고정되고 상단만 미끄러진다.
 *
 * - Matrix.skewXInto: shear 각도 θ로 c=tan(θ)만 채운 수평 skew matrix 기록
 * - Matrix.translationMatrixInto: base 행을 pivot 축으로 만드는 보정 translation 기록
 * - Matrix.multiplyInto: translation ∘ skew를 합성해 pivot 기준 shear matrix 생성
 * - Matrix.transformPointInto: 합성 matrix를 사각형 corner와 handle에 적용
 * - Matrix.createMatrix: 매 프레임 재기록할 matrix buffer 확보
 */

import * as Matrix from '@cp949/vectra/matrix';

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  // diagnostics readout 라벨
  const label = new PIXI.Text({
    text: '',
    style: { fill: 0x94a3b8, fontFamily: 'monospace', fontSize: 13 },
  });
  app.stage.addChild(label);

  // shear 대상 사각형: unsheared AABB. shear는 angle 상태로만 관리한다
  const left = 280;
  const right = 440;
  const topY = 150;
  const bottomY = 330;
  const cx = (left + right) / 2; // 상단 edge 중앙 x (handle rest x)
  const pivotY = bottomY; // base 행을 pivot 축으로 둔다 → base는 shear에도 고정

  // 적용 중인 shear 각도(radian). 처음에 mild shear로 효과를 바로 보인다
  let shearAngle = (20 * Math.PI) / 180;

  const MAX_ANGLE = (70 * Math.PI) / 180; // tan 발산을 막는 clamp 한계
  const HIT_TOLERANCE = 16; // handle grab 허용 반경(px)
  const HANDLE_RADIUS = 8;

  // unsheared 사각형 corner: TL, TR, BR, BL 순서. base edge는 BR-BL(2-3)
  const restCorners = [
    { x: left, y: topY },
    { x: right, y: topY },
    { x: right, y: bottomY },
    { x: left, y: bottomY },
  ];
  const handleRest = { x: cx, y: topY }; // 상단 edge 중앙

  // 매 프레임 재기록하는 held buffer (allocation-free hot path)
  const shear = Matrix.createMatrix(); // skewX component
  const tpre = Matrix.createMatrix(); // pivot 보정 translation
  const matrix = Matrix.createMatrix(); // 합성 결과 M = tpre ∘ shear
  const worldCorners = restCorners.map(() => ({ x: 0, y: 0 }));
  const worldHandle = { x: 0, y: 0 };

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): { x: number; y: number } => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // 현재 shearAngle로 pivot 기준 shear matrix를 만들고 corner/handle을 world 좌표로 변환한다
  const rebuild = (): void => {
    // skewX(θ): a=1,b=0,c=tan(θ),d=1 → x' = x + c·y
    Matrix.skewXInto(shear, shearAngle);
    // 화면 원점 기준 shear는 도형을 통째로 민다. base 행 y=pivotY를 축으로 만들려면
    // x' = x + c·(y - pivotY)가 필요하므로 -c·pivotY 만큼 x를 보정한다
    Matrix.translationMatrixInto(tpre, { x: -shear.c * pivotY, y: 0 });
    // multiplyInto(out, left, right)는 point 기준 right 먼저, left 나중 → tpre ∘ shear
    Matrix.multiplyInto(matrix, tpre, shear);

    for (let i = 0; i < restCorners.length; i++) {
      Matrix.transformPointInto(worldCorners[i], matrix, restCorners[i]);
    }
    Matrix.transformPointInto(worldHandle, matrix, handleRest);
  };

  /** pointerdown: 커서가 shear handle 반경 안이면 grab한다. */
  const onPointerDown = (e: PointerEvent): void => {
    const cursor = getCanvasXY(e);
    const dx = cursor.x - worldHandle.x;
    const dy = cursor.y - worldHandle.y;
    grabbed = dx * dx + dy * dy <= HIT_TOLERANCE * HIT_TOLERANCE;
  };

  /** pointermove: 상단 행의 가로 변위에서 shear 각도를 역산한다(y는 무시 → 수평 shear 단일 축). */
  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const cursor = getCanvasXY(e);

    // 상단 행 변위 = c·(topY - pivotY) = (cursor.x - cx) → tan(θ) = 변위 / (topY - pivotY)
    const tan = (cursor.x - cx) / (topY - pivotY);
    // atan으로 각도 역산 후 ±70°로 clamp해 tan 발산을 막는다
    shearAngle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, Math.atan(tan)));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const toDeg = (r: number): number => Math.round((r * 180) / Math.PI);

  const render = (): void => {
    rebuild();

    g.clear();

    // unsheared 기준 사각형 (점선 느낌의 흐린 외곽선)
    g.rect(left, topY, right - left, bottomY - topY).stroke({ color: 0x475569, width: 1 });

    // sheared 평행사변형 (반투명 채움 + 외곽선)
    g.moveTo(worldCorners[0].x, worldCorners[0].y);
    for (let i = 1; i < worldCorners.length; i++) {
      g.lineTo(worldCorners[i].x, worldCorners[i].y);
    }
    g.closePath().fill({ color: 0x38bdf8, alpha: 0.12 }).stroke({ color: 0x38bdf8, width: 2 });

    // 고정 base 행(pivot 축)을 강조
    g.moveTo(worldCorners[3].x, worldCorners[3].y)
      .lineTo(worldCorners[2].x, worldCorners[2].y)
      .stroke({ color: 0xf59e0b, width: 3 });

    // 상단 edge가 미끄러진 거리를 보여주는 guide (rest 중앙 → 현재 handle)
    g.moveTo(cx, topY).lineTo(worldHandle.x, worldHandle.y).stroke({ color: 0x64748b, width: 1 });

    // shear handle
    g.circle(worldHandle.x, worldHandle.y, HANDLE_RADIUS).fill({ color: 0xe2e8f0 });

    // diagnostics: shear 각도, matrix c(=tan) component, 상단 변위
    const topOffset = Math.round(worldHandle.x - cx);
    label.text = `skewX ${toDeg(shearAngle)}°   c ${shear.c.toFixed(3)}   topOffset ${topOffset}px`;
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
