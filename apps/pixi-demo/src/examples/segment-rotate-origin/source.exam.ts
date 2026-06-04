/**
 * Segment Rotate Origin
 *
 * 화면 원점 marker O 둘레의 angle handle을 drag하면, O에서 떨어진 고정 base segment가 그 각도만큼
 * 원점 기준으로 강체 회전한다. segment는 O를 중심으로 통째로 "궤도"를 돌고, 길이는 그대로 유지된다.
 *
 * - Segments.rotate: segment의 두 끝점에 회전행렬을 곱해 월드 원점(0,0) 기준으로 CCW 회전한 새 segment를
 *   반환한다. 회전 중심 파라미터가 없어 항상 원점 기준이며(임의 center 기준 회전은 rotateAround), 원점에서
 *   떨어진 segment는 방향뿐 아니라 위치까지 함께 돈다. radian·CCW(화면 y-down이라 시각적으로는 CW).
 *   boolean/scalar가 아닌 object 결과지만 drag당 1회 단발 계산이라 allocating companion을 그대로 쓴다.
 * - Segments.length: 회전된 segment의 |b - a|를 반환해 강체 회전이 길이를 보존함을 라이브로 증명한다.
 */

import * as Segments from '@cp949/vectra/segment';

type XY = { x: number; y: number };
type Seg = { a: XY; b: XY };

const SEG_COLOR = 0x38bdf8; // 회전된 segment: 하늘색
const GHOST_COLOR = 0x475569; // θ=0 base ghost: 회색
const HANDLE_COLOR = 0xfbbf24; // angle handle: 노랑
const RADIUS_COLOR = 0x64748b; // O→끝점 radius line: 흐린 회색
const GRAB_R = 18; // handle 잡기 반경 (px)
const ORBIT_R = 185; // angle handle 궤도 반지름 (px)

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

  // 화면 원점 O. 라이브러리 (0,0)이 이 위치에 대응한다 → rotate는 이 점을 중심으로 돈다.
  const origin: XY = { x: 330, y: 235 };

  // base segment (원점 상대 좌표). 두 끝점 모두 O에서 떨어져 있어 회전 시 위치까지 도는 게 보인다.
  const base: Seg = { a: { x: 70, y: -95 }, b: { x: 150, y: -25 } };

  // 회전 상태. angle은 회전각(radian), world는 화면 좌표로 옮긴 회전 결과, segLength는 불변량 증거.
  let angle = 0;
  const world: Seg = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
  let segLength = 0;
  let grabbed = false;

  // 회전각이 바뀔 때만 1회 계산한다 (drag당 단발 → allocating rotate).
  const recompute = (): void => {
    // 핵심 호출: base를 원점 기준으로 angle만큼 회전한 새 segment
    const rotated = Segments.rotate(base, angle);
    // 회전 결과는 원점 상대 좌표 → 화면 원점 O를 더해 월드 좌표로 옮긴다
    world.a.x = origin.x + rotated.a.x;
    world.a.y = origin.y + rotated.a.y;
    world.b.x = origin.x + rotated.b.x;
    world.b.y = origin.y + rotated.b.y;
    // 강체 회전이라 길이는 angle과 무관하게 상수 (offset과도 무관)
    segLength = Segments.length(rotated);
  };
  recompute();

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // handle의 현재 월드 위치 (궤도 반지름 R, 각도 angle)
  const handleAt = (): XY => ({
    x: origin.x + ORBIT_R * Math.cos(angle),
    y: origin.y + ORBIT_R * Math.sin(angle),
  });

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    const h = handleAt();
    grabbed = Math.hypot(h.x - p.x, h.y - p.y) <= GRAB_R;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // handle을 궤도(반지름 R)로 투영 → 위치가 아닌 "각도"만 조절한다
    angle = Math.atan2(p.y - origin.y, p.x - origin.x);
    recompute();
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const TAU = Math.PI * 2;
  // angle을 [0, 360) deg로 정규화해 라벨에 표시
  const deg = (): number => {
    const d = ((angle % TAU) + TAU) % TAU;
    return (d * 180) / Math.PI;
  };

  const render = (): void => {
    const h = handleAt();

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // handle 궤도 원 (각도 조작 범위)
    g.circle(origin.x, origin.y, ORBIT_R).stroke({ color: 0x1e293b, width: 1 });

    // +x축 기준선과 현재 각도 호 → 회전각 θ를 시각화
    g.moveTo(origin.x, origin.y)
      .lineTo(origin.x + ORBIT_R, origin.y)
      .stroke({
        color: 0x334155,
        width: 1,
      });
    g.moveTo(origin.x, origin.y)
      .arc(origin.x, origin.y, 40, 0, angle, angle < 0)
      .stroke({ color: HANDLE_COLOR, width: 2, alpha: 0.7 });

    // θ=0 base ghost: 회전 시작 위치를 흐리게 깔아 회전 전/후 대비를 보인다
    g.moveTo(origin.x + base.a.x, origin.y + base.a.y)
      .lineTo(origin.x + base.b.x, origin.y + base.b.y)
      .stroke({ color: GHOST_COLOR, width: 2, alpha: 0.6 });

    // O→끝점 radius line 2개: 두 끝점이 원점에서 같은 반지름으로 도는("원점 기준") 증거
    g.moveTo(origin.x, origin.y).lineTo(world.a.x, world.a.y).stroke({
      color: RADIUS_COLOR,
      width: 1,
      alpha: 0.5,
    });
    g.moveTo(origin.x, origin.y).lineTo(world.b.x, world.b.y).stroke({
      color: RADIUS_COLOR,
      width: 1,
      alpha: 0.5,
    });

    // 회전된 segment (핵심 결과)
    g.moveTo(world.a.x, world.a.y).lineTo(world.b.x, world.b.y).stroke({
      color: SEG_COLOR,
      width: 3,
    });
    g.circle(world.a.x, world.a.y, 5).fill({ color: SEG_COLOR });
    g.circle(world.b.x, world.b.y, 5).fill({ color: SEG_COLOR });

    // 원점 marker O
    g.circle(origin.x, origin.y, 4).fill({ color: 0xf8fafc });

    // angle handle (유일 drag 대상)
    g.circle(h.x, h.y, grabbed ? 9 : 7).fill({ color: HANDLE_COLOR });
    g.circle(h.x, h.y, grabbed ? 9 : 7).stroke({ color: 0x0f172a, width: 2 });

    label.text = [
      `angle  : ${deg().toFixed(1)}°`,
      `length : ${segLength.toFixed(1)} px (rigid → constant)`,
      'drag the handle to rotate the segment about the origin (O)',
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
