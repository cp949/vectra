/**
 * Path Closest Point
 *
 * 화면 고정 vector path(직선 + cubic 2개로 이루어진 open path)와 draggable probe 점을 두고, probe를
 * drag하면 path 위에서 probe에 가장 가까운 점을 찾아 marker로 snap한다. probe↔nearest 연결선이 path에
 * (거의) 수직으로 그려져, 그 점이 최근접점(perpendicular foot)임을 시각적으로 보인다. pen tool snap,
 * magnetic path 같은 편집기 작업 흐름이다.
 *
 * - Paths.closestPoint: commands 위에서 probe에 가장 가까운 새 point를 반환한다. 곡선은 내부에서
 *   flatten해 모든 draw segment를 비교한다. empty path면 undefined(여기선 고정 non-empty라 미발생).
 *   프레임당 1점 단발 결과라 allocating companion(`closestPoint`)을 쓴다(`closestPointInto` 미사용).
 */

import * as Paths from '@cp949/vectra/path';

type XY = { x: number; y: number };

const HIT_RADIUS = 22;

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

  // 고정 path. 직선 lead-in 1개 + cubic 2개로 곡선을 섞은 단일 open subpath (조작 대상 아님)
  // 단일 subpath라 subpath 간 gap segment(최근접 후보 제외) edge case는 발생하지 않는다
  const commands = [
    { kind: 'move', x: 120, y: 320 },
    { kind: 'line', x: 235, y: 320 },
    { kind: 'cubic', x1: 335, y1: 320, x2: 335, y2: 130, x: 435, y: 130 },
    { kind: 'cubic', x1: 535, y1: 130, x2: 545, y2: 320, x: 645, y: 300 },
  ] satisfies Paths.PathCommand[];

  // probe (유일 drag 대상). 초기 위치는 path에서 떨어진 위쪽
  const probe: XY = { x: 380, y: 70 };

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // probe와의 거리로 잡기 판정
    grabbed = Math.hypot(probe.x - p.x, probe.y - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // probe를 화면 안으로 clamp (자유 이동, 축 제약 없음)
    probe.x = Math.max(12, Math.min(size.width - 12, p.x));
    probe.y = Math.max(40, Math.min(size.height - 12, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const render = (): void => {
    // 핵심 호출: path 위에서 probe에 가장 가까운 점. 내부에서 cubic을 flatten해 비교한다
    // (nearest는 flatten 근사 polyline 위 점이라 연결선이 곡선에 "거의" 수직이다)
    const nearest = Paths.closestPoint(commands, probe);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 고정 path stroke. command kind에 맞춰 직선/cubic을 그대로 그린다
    g.moveTo(commands[0].x, commands[0].y);
    for (let i = 1; i < commands.length; i++) {
      const cmd = commands[i];
      if (cmd.kind === 'cubic') g.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
      else g.lineTo(cmd.x, cmd.y);
    }
    g.stroke({ color: 0x64748b, width: 2.5 });

    // nearest가 있으면(고정 path라 항상 있음) marker snap + 연결선
    if (nearest) {
      // 거리는 반환된 점에서 직접 잰다 (closestPoint는 점만 돌려준다)
      const dist = Math.hypot(probe.x - nearest.x, probe.y - nearest.y);

      // probe↔nearest 연결선: path에 (거의) 수직인 최단 경로
      g.moveTo(probe.x, probe.y).lineTo(nearest.x, nearest.y).stroke({ color: 0x38bdf8, width: 1.5 });
      // nearest marker (path 위로 snap된 점)
      g.circle(nearest.x, nearest.y, 6).fill({ color: 0x38bdf8 });

      label.text = [
        `probe    : (${probe.x.toFixed(0)}, ${probe.y.toFixed(0)})   drag probe`,
        `nearest  : (${nearest.x.toFixed(0)}, ${nearest.y.toFixed(0)})`,
        `distance : ${dist.toFixed(1)} px`,
      ].join('\n');
    }

    // probe (유일 drag 대상)
    g.circle(probe.x, probe.y, grabbed ? 9 : 7).fill({ color: 0xf8fafc });
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
