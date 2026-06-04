/**
 * Rotate Handle
 *
 * box 위쪽 rotate handle을 드래그하면 box가 center anchor를 pivot으로 회전한다.
 * 회전 각도가 15° 격자에 tolerance(±6°) 이내로 가까우면 그 격자 각도로 snap된다.
 *
 * - EditorGeometry.rotateHandlesInto: unrotated box의 rotate handle 기준 위치 산출
 * - EditorGeometry.anchorPoint: 회전 pivot이 될 center anchor 좌표
 * - EditorGeometry.constrainRotate: raw 각도를 step 격자에 tolerance 이내로 snap
 * - Matrix.rotationAroundPointInto: pivot 기준 회전 affine matrix 생성
 * - Matrix.transformPointInto: 회전 matrix를 box corner와 handle에 적용
 */

import * as EditorGeometry from '@cp949/vectra/editor-geometry';
import * as Matrix from '@cp949/vectra/matrix';

// editor-geometry barrel은 handle id 타입을 re-export하지 않으므로 예제에서 직접 둔다
type RotateHandle = { id: 'rotate'; point: { x: number; y: number } };

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

  // 회전 대상 box: unrotated AABB. 회전은 angle 상태로만 관리한다
  const bounds = { min: { x: 290, y: 170 }, max: { x: 470, y: 300 } };

  // 적용 중인 회전 각도(radian). snap 보정된 값을 누적 유지한다
  let angle = 0;
  // 라벨 표시용: 마지막 raw 각도와 snap 발동 여부
  let rawAngle = 0;
  let snapActive = false;

  const HANDLE_OFFSET = 44; // top edge 위로 handle을 띄우는 거리
  const SNAP_STEP = Math.PI / 12; // 15° 격자
  const SNAP_TOLERANCE = (6 * Math.PI) / 180; // 격자 ±6° 안에서 snap 발동
  const HIT_TOLERANCE = 16; // handle grab 허용 반경(px)
  const HANDLE_RADIUS = 7;

  // box가 고정이므로 pivot(center anchor)은 1회만 계산한다
  const pivot = EditorGeometry.anchorPoint(bounds, 'center') ?? { x: 0, y: 0 };

  // rotateHandlesInto 출력 buffer. 호출마다 내부에서 length=0으로 초기화된다
  const handles: RotateHandle[] = [];
  EditorGeometry.rotateHandlesInto(handles, bounds, () => ({ x: 0, y: 0 }), { offset: HANDLE_OFFSET });
  const handleRest = handles[0].point; // unrotated 기준 handle 좌표(top-center 위)
  const stemRest = { x: (bounds.min.x + bounds.max.x) / 2, y: bounds.min.y }; // top-center

  // raw 각도의 기준선: pivot에서 unrotated handle을 본 방향(보통 위쪽 -90°)
  const restAngle = Math.atan2(handleRest.y - pivot.y, handleRest.x - pivot.x);

  // 회전 matrix와 변환 결과 buffer (매 프레임 재기록)
  const matrix = Matrix.createMatrix();
  const worldHandle = { x: 0, y: 0 };
  const worldStem = { x: 0, y: 0 };
  const restCorners = [
    { x: bounds.min.x, y: bounds.min.y },
    { x: bounds.max.x, y: bounds.min.y },
    { x: bounds.max.x, y: bounds.max.y },
    { x: bounds.min.x, y: bounds.max.y },
  ];
  const worldCorners = restCorners.map(() => ({ x: 0, y: 0 }));

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): { x: number; y: number } => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // 현재 angle로 box corner, handle, stem 끝점을 world 좌표로 변환한다
  const rebuild = (): void => {
    Matrix.rotationAroundPointInto(matrix, pivot, angle);
    for (let i = 0; i < restCorners.length; i++) {
      Matrix.transformPointInto(worldCorners[i], matrix, restCorners[i]);
    }
    Matrix.transformPointInto(worldHandle, matrix, handleRest);
    Matrix.transformPointInto(worldStem, matrix, stemRest);
  };

  /** pointerdown: 커서가 회전된 handle 반경 안이면 grab한다. */
  const onPointerDown = (e: PointerEvent): void => {
    const cursor = getCanvasXY(e);
    const dx = cursor.x - worldHandle.x;
    const dy = cursor.y - worldHandle.y;
    grabbed = dx * dx + dy * dy <= HIT_TOLERANCE * HIT_TOLERANCE;
  };

  /** pointermove: pivot→cursor 방향과 기준선 차이로 회전 각도를 갱신한다. */
  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const cursor = getCanvasXY(e);

    // pivot 기준 cursor 방향에서 기준선을 빼 raw 회전량을 구하고 (-π, π]로 정규화
    const raw = Math.atan2(cursor.y - pivot.y, cursor.x - pivot.x) - restAngle;
    rawAngle = Math.atan2(Math.sin(raw), Math.cos(raw));

    // 15° 격자에 tolerance 이내로 가까우면 snap, 아니면 raw 그대로 반환
    const snapped = EditorGeometry.constrainRotate(rawAngle, {
      step: SNAP_STEP,
      tolerance: SNAP_TOLERANCE,
    });
    snapActive = snapped !== rawAngle;
    angle = snapped;
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

    // 회전된 box (반투명 채움 + 외곽선)
    g.moveTo(worldCorners[0].x, worldCorners[0].y);
    for (let i = 1; i < worldCorners.length; i++) {
      g.lineTo(worldCorners[i].x, worldCorners[i].y);
    }
    g.closePath().fill({ color: 0x38bdf8, alpha: 0.12 }).stroke({ color: 0x38bdf8, width: 2 });

    // pivot에서 handle로 이어지는 stem
    g.moveTo(worldStem.x, worldStem.y).lineTo(worldHandle.x, worldHandle.y).stroke({ color: 0x64748b, width: 1.5 });

    // pivot 점
    g.circle(pivot.x, pivot.y, 4).fill({ color: 0x94a3b8 });

    // rotate handle (snap 발동 시 강조)
    g.circle(worldHandle.x, worldHandle.y, HANDLE_RADIUS).fill({
      color: snapActive ? 0xf59e0b : 0xe2e8f0,
    });

    label.text = `raw ${toDeg(rawAngle)}°   applied ${toDeg(angle)}°   snap ${snapActive ? 'on' : 'off'}`;
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
