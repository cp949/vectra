/**
 * Path Fill Hit Test
 *
 * 화면 고정 closed path(직선 + cubic 2개로 곡선을 섞은 단일 subpath)와 draggable probe 점을 두고,
 * probe를 drag하면 점이 채워진 path 내부에 있는지 매 프레임 판정한다. 내부면 path fill이 hit 색,
 * 외부면 clear 색으로 바뀌어 "이 채워진 vector 도형 안을 가리키는가?"라는 picking / selection hit-test
 * 작업 흐름을 보인다.
 *
 * - Paths.containsPoint: commands가 만드는 면을 even-odd fill rule로 보고 point 포함 여부를 boolean으로
 *   반환한다. 곡선은 내부에서 flatten해 비교하므로 boundary 근처 결과는 flatness 값에 따라 달라질 수 있다.
 *   close 없는 open subpath는 닫힌 면적이 없어 false, empty path도 false(여기선 고정 non-empty closed라
 *   미발생), edge 위(boundary) 점은 true다(boundary를 별 상태로 나누려면 classifyPoint를 쓴다). boolean을
 *   직접 반환해 *Into companion이 없으므로 그대로 호출한다.
 */

import * as Paths from '@cp949/vectra/path';

type XY = { x: number; y: number };

const CLEAR_COLOR = 0x60a5fa; // 외부: 파랑
const HIT_COLOR = 0xf87171; // 내부: 빨강
const M = 16; // 화면 가장자리 margin (px) → probe 입력을 항상 finite로 유지
const GRAB_R = 18; // probe 잡기 반경 (px)

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

  // 고정 closed path. 직선 변 1개 + cubic 2개로 곡선을 섞은 단일 closed subpath (조작 대상 아님).
  // close가 있어 닫힌 면적이 생기고, 곡선이 섞여 polygon point-in-polygon과 구분된다.
  // 단일 subpath라 even-odd 홀(다중 subpath 합산) edge case는 발생하지 않는다.
  const startCommand = { kind: 'move', x: 250, y: 150 } as const; // 시작점 (좌상단)
  const commands = [
    startCommand,
    { kind: 'line', x: 470, y: 175 }, // 직선 변 (위쪽)
    { kind: 'cubic', x1: 600, y1: 200, x2: 560, y2: 335, x: 425, y: 350 }, // 오른쪽 곡선 변
    { kind: 'cubic', x1: 320, y1: 362, x2: 205, y2: 300, x: 250, y: 150 }, // 왼쪽 아래 곡선 변 (시작점으로 복귀)
    { kind: 'close' }, // subpath 닫기 → 채워진 면적 형성
  ] satisfies Paths.PathCommand[];

  // probe (유일 drag 대상). 초기 위치는 도형 밖 위쪽
  const probe: XY = { x: 360, y: 70 };

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // probe와의 거리로 잡기 판정
    grabbed = Math.hypot(probe.x - p.x, probe.y - p.y) <= GRAB_R;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // probe를 화면 안으로 clamp (자유 이동, 축 제약 없음)
    probe.x = Math.max(M, Math.min(size.width - M, p.x));
    probe.y = Math.max(M + 28, Math.min(size.height - M, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  // 고정 path의 outline geometry를 PIXI Graphics에 한 번 정의한다 (fill·stroke 공용).
  const tracePath = (): void => {
    g.moveTo(startCommand.x, startCommand.y);
    for (let i = 1; i < commands.length; i++) {
      const cmd = commands[i];
      // cubic은 그대로 bezier로, line은 직선으로, close는 경로 닫기로 그린다
      if (cmd.kind === 'cubic') g.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
      else if (cmd.kind === 'line') g.lineTo(cmd.x, cmd.y);
      else if (cmd.kind === 'close') g.closePath();
    }
  };

  const render = (): void => {
    // 핵심 호출: probe가 채워진 path 내부인지 even-odd fill rule로 판정 (곡선은 내부에서 flatten)
    const inside = Paths.containsPoint(commands, probe);

    // 내부면 hit(빨강), 외부면 clear(파랑)
    const stateColor = inside ? HIT_COLOR : CLEAR_COLOR;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // path 면을 채우고(판정 결과 색) 같은 outline에 stroke를 덧그린다
    tracePath();
    g.fill({ color: stateColor, alpha: inside ? 0.32 : 0.14 });
    tracePath();
    g.stroke({ color: stateColor, width: 2.5, alpha: 0.95 });

    // probe (유일 drag 대상). 내부 판정 색으로 칠해 fill과 상태를 일치시킨다
    g.circle(probe.x, probe.y, grabbed ? 9 : 7).fill({ color: 0xf8fafc });
    g.circle(probe.x, probe.y, grabbed ? 9 : 7).stroke({ color: stateColor, width: 2 });

    label.text = [
      `inside : ${inside ? 'yes' : 'no '}`,
      `probe  : (${probe.x.toFixed(0)}, ${probe.y.toFixed(0)})`,
      'drag the probe in and out of the filled path',
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
