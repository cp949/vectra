/**
 * Math Ping Pong
 *
 * 가로 트랙의 scrubber로 입력 `raw`를 정하면 `pingPong(raw, L)`이 그 값을 닫힌 구간 `[0, L]`로
 * 접어(fold) 출력한다. raw가 L을 넘기면 출력이 0으로 점프하지 않고 **되돌아와** 0↔L 사이를 일정
 * 속도로 왕복하는 삼각파(triangle wave)를 그린다. "끝없이 커지는 입력을 한 구간으로 가두되, 상한에서
 * 되돌리는(ping-pong) 값을 만든다"는 작업 흐름을 보인다.
 *
 * - Mathx.pingPong: raw를 `[0, L]`로 reflect-fold한 scalar를 반환한다. 상한에서 wrap(점프)이 아니라
 *   reflect(되돌림)이라 결과가 연속 삼각파가 된다. 곡선 정점 precompute와 drag 시 marker 값에 모두
 *   같은 함수를 쓴다. scalar 반환이라 `*Into` companion이 없어 그대로 호출한다.
 */

import * as Mathx from '@cp949/vectra/math';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const AXIS_COLOR = 0x334155; // 플롯 축/테두리: 어두운 회청색
const GUIDE_COLOR = 0x1e293b; // 0·L 값 보조선: 더 어두운 회청색
const CURVE_COLOR = 0x38bdf8; // pingPong 삼각파 곡선: 하늘색
const DROP_COLOR = 0x64748b; // scrubber → 곡선 marker 수직 guide: 회색
const MARKER_COLOR = 0xa3e635; // 곡선 위 현재 출력 marker: 연두
const KNOB_COLOR = 0xfacc15; // scrubber knob(주 조작 대상): 노랑
const HIT_RADIUS = 22; // knob 잡기 판정 반경 (px)

// fold 구간 길이 L과 입력 raw 범위(고정). raw는 여러 주기 + 음수 일부를 포함해
// fold가 단순 clamp가 아니라 대칭 reflect임을 드러낸다. 음수 raw도 positive modulo로 접힌다.
const L = 12;
const RAW_MIN = -6;
const RAW_MAX = 54;

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

  // 플롯 영역: x축 = raw, y축 = fold 값 [0, L]
  const plotLeft = 90;
  const plotRight = size.width - 36;
  const plotTop = 90;
  const plotBottom = 320;
  const trackY = 388; // scrubber 트랙 baseline (플롯 아래)

  // raw ↔ 플롯 x 좌표
  const xAtRaw = (raw: number): number => plotLeft + ((raw - RAW_MIN) / (RAW_MAX - RAW_MIN)) * (plotRight - plotLeft);
  const rawAtX = (x: number): number => RAW_MIN + ((x - plotLeft) / (plotRight - plotLeft)) * (RAW_MAX - RAW_MIN);
  // fold 값(0..L) ↔ 플롯 y 좌표 (0은 아래, L은 위)
  const yAtVal = (v: number): number => plotBottom - (v / L) * (plotBottom - plotTop);

  // 삼각파 곡선 정점 precompute: raw·L이 고정이라 1회만. 정점마다 pingPong을 호출해
  // 곡선 자체가 함수 출력임을 드러낸다. fold corner는 raw=k*L에서 생기므로 정수 raw마다 sampling.
  const curve: XY[] = [];
  for (let raw = RAW_MIN; raw <= RAW_MAX; raw++) {
    curve.push({ x: xAtRaw(raw), y: yAtVal(Mathx.pingPong(raw, L)) });
  }

  let raw = 9; // 초기 입력 raw
  let pong = Mathx.pingPong(raw, L); // 현재 fold 출력 (drag 시에만 갱신)
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (size.width / rect.width),
      y: (e.clientY - rect.top) * (size.height / rect.height),
    };
  };

  // 단일 핵심 관계: raw → pingPong(raw, L) fold 출력
  const rebuild = (): void => {
    pong = Mathx.pingPong(raw, L);
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // knob 근처를 눌렀을 때만 잡는다 (scrubber가 유일한 조작 대상)
    grabbed = Math.hypot(xAtRaw(raw) - p.x, trackY - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    // 드래그 x를 raw로 환산하고 범위로 clamp → raw 항상 finite (비유한 입력 미발생)
    const p = getCanvasXY(e);
    raw = Math.max(RAW_MIN, Math.min(RAW_MAX, rawAtX(p.x)));
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

  const fmt = (n: number): string => n.toFixed(1).padStart(5);

  const render = (): void => {
    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG_COLOR });

    // 값 축 0·L 보조선 (단일 fold 관계의 좌표 분해)
    const y0 = yAtVal(0);
    const yL = yAtVal(L);
    g.moveTo(plotLeft, y0).lineTo(plotRight, y0).stroke({ color: GUIDE_COLOR, width: 1 });
    g.moveTo(plotLeft, yL).lineTo(plotRight, yL).stroke({ color: GUIDE_COLOR, width: 1 });
    // 왼쪽 값 축
    g.moveTo(plotLeft, plotTop).lineTo(plotLeft, plotBottom).stroke({ color: AXIS_COLOR, width: 2 });

    // pingPong 삼각파 곡선 (precompute한 정점만 그림 → 프레임당 vectra 할당 없음)
    g.moveTo(curve[0].x, curve[0].y);
    for (let i = 1; i < curve.length; i++) g.lineTo(curve[i].x, curve[i].y);
    g.stroke({ color: CURVE_COLOR, width: 2 });

    // raw=0 기준선(입력 원점): faint 세로선
    const xZero = xAtRaw(0);
    g.moveTo(xZero, plotTop).lineTo(xZero, trackY).stroke({ color: GUIDE_COLOR, width: 1 });

    // scrubber → 곡선 marker 수직 guide (raw가 어느 fold 값으로 가는지 잇는 분해 표시)
    const kx = xAtRaw(raw);
    const my = yAtVal(pong);
    g.moveTo(kx, trackY).lineTo(kx, my).stroke({ color: DROP_COLOR, width: 1 });

    // 곡선 위 현재 출력 marker
    g.circle(kx, my, 6).fill({ color: MARKER_COLOR });

    // scrubber 트랙 baseline + knob (유일한 조작 대상)
    g.moveTo(plotLeft, trackY).lineTo(plotRight, trackY).stroke({ color: AXIS_COLOR, width: 2 });
    g.circle(kx, trackY, grabbed ? 11 : 9).fill({ color: KNOB_COLOR });
    g.circle(kx, trackY, HIT_RADIUS).stroke({ color: KNOB_COLOR, width: 1, alpha: 0.16 });

    // diagnostics: 단일 fold 관계를 입력·출력·구간 파라미터로 읽는다 (3개)
    label.text = [
      `raw    : ${fmt(raw)}   drag scrubber`,
      `pong   : ${fmt(pong)}   fold [0, ${L}]`,
      `length : ${String(L).padStart(5)}   period 2L=${2 * L}`,
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
