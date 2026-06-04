/**
 * Pixel Grid Align
 *
 * 확대한 device pixel 격자 위에서 raw point를 드래그하면, 그 좌표를 가장 가까운 device pixel에 맞춰
 * 정렬한 점(crisp rendering용)을 매 프레임 다시 계산해 격자 교점 위 marker로 그린다. 아래 dpr knob으로
 * devicePixelRatio(1·2·3)를 바꾸면 격자 간격이 1/dpr logical 픽셀로 촘촘해지고, 정렬 결과도 그 격자에
 * 다시 붙는다. "에디터 좌표를 device pixel 격자에 스냅한다"(pixel snapping for crisp rendering)는 작업
 * 흐름을 보인다.
 *
 * - EditorGeometry.pixelAlign: 좌표를 `round(coord * dpr) / dpr`로 device pixel에 정렬해 새 점을 반환한다.
 *   즉 device pixel 격자 간격은 `1/dpr` logical 단위이고, dpr이 커질수록 더 미세하게 snap된다. raw point를
 *   드래그할 때마다, dpr knob을 바꿀 때마다 이 함수 하나가 aligned point를 다시 정한다. 단발성 결과라
 *   allocating companion을 매 프레임 직접 호출한다(*Into out-object scaffold 불필요).
 */

import * as EditorGeometryx from '@cp949/vectra/editor-geometry';

type XY = { x: number; y: number };

const RAW_COLOR = 0xe2e8f0; // raw point(드래그 대상): 밝은 회색
const ALIGN_COLOR = 0x34d399; // device pixel에 정렬된 점: 초록
const GRAB_R = 16; // raw handle 잡기 반경 (px)

// logical pixel 공간을 화면에 확대해 그리기 위한 격자 영역과 배율.
const GX = 120; // 격자 영역 좌상단 x (screen px)
const GY = 70; // 격자 영역 좌상단 y (screen px)
const ZOOM = 40; // logical pixel 1개당 screen px (확대 배율)
const COLS = 12; // 가로 logical pixel 칸 수
const ROWS = 8; // 세로 logical pixel 칸 수

// dpr 선택 track (보조 control). 1·2·3 중 하나를 고른다.
const DPR_VALUES = [1, 2, 3] as const;
const TX = 150; // track 좌측 x
const TW = 300; // track 길이
const TY = 420; // track y

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

  // raw point: logical 좌표로 저장하는 주 drag 대상. 격자 교점과 어긋난 초기값으로 둔다.
  const raw: XY = { x: 4.37, y: 3.12 };
  let dpr: (typeof DPR_VALUES)[number] = 2; // 시작 dpr (retina)

  let grabRaw = false; // raw handle 잡힘
  let grabTrack = false; // dpr track 잡힘

  // logical → screen 좌표 변환
  const toScreen = (p: XY): XY => ({ x: GX + p.x * ZOOM, y: GY + p.y * ZOOM });

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // track x 위치를 dpr 인덱스(0..2)로 환산
  const dprFromTrackX = (sx: number): (typeof DPR_VALUES)[number] => {
    const t = Math.max(0, Math.min(1, (sx - TX) / TW));
    return DPR_VALUES[Math.round(t * (DPR_VALUES.length - 1))];
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    const rawScreen = toScreen(raw);
    const dx = p.x - rawScreen.x;
    const dy = p.y - rawScreen.y;
    // raw handle 근처면 raw를 잡고, 아니면 track band 안일 때 dpr을 잡는다.
    if (dx * dx + dy * dy <= GRAB_R * GRAB_R) {
      grabRaw = true;
    } else if (p.y >= TY - 20 && p.y <= TY + 20 && p.x >= TX - 20 && p.x <= TX + TW + 20) {
      grabTrack = true;
      dpr = dprFromTrackX(p.x);
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    if (grabRaw) {
      // screen → logical 후 가시 격자 범위로 clamp → 항상 finite 입력
      raw.x = Math.max(0, Math.min(COLS, (p.x - GX) / ZOOM));
      raw.y = Math.max(0, Math.min(ROWS, (p.y - GY) / ZOOM));
    } else if (grabTrack) {
      dpr = dprFromTrackX(p.x);
    }
  };

  const onPointerUp = (): void => {
    grabRaw = false;
    grabTrack = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const render = (): void => {
    // 핵심 호출: raw 좌표를 device pixel(간격 1/dpr)에 정렬. dpr ∈ {1,2,3}라 NaN 분기 미발생.
    const aligned = EditorGeometryx.pixelAlign(raw, { devicePixelRatio: dpr });

    const rawScreen = toScreen(raw);
    const alignedScreen = toScreen(aligned);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // device pixel 격자: logical 1/dpr 간격(연한 선), CSS 정수 픽셀 경계(진한 선)
    const stepsX = COLS * dpr;
    for (let i = 0; i <= stepsX; i++) {
      const lx = i / dpr;
      const sx = GX + lx * ZOOM;
      const bold = i % dpr === 0; // 정수 logical 픽셀 경계
      g.moveTo(sx, GY)
        .lineTo(sx, GY + ROWS * ZOOM)
        .stroke({ color: bold ? 0x475569 : 0x1e293b, width: 1, alpha: bold ? 0.9 : 0.8 });
    }
    const stepsY = ROWS * dpr;
    for (let i = 0; i <= stepsY; i++) {
      const ly = i / dpr;
      const sy = GY + ly * ZOOM;
      const bold = i % dpr === 0;
      g.moveTo(GX, sy)
        .lineTo(GX + COLS * ZOOM, sy)
        .stroke({ color: bold ? 0x475569 : 0x1e293b, width: 1, alpha: bold ? 0.9 : 0.8 });
    }

    // raw → aligned snap offset: 정렬이 점을 얼마나 옮겼는지
    g.moveTo(rawScreen.x, rawScreen.y)
      .lineTo(alignedScreen.x, alignedScreen.y)
      .stroke({ color: ALIGN_COLOR, width: 2, alpha: 0.7 });

    // aligned point: 항상 device pixel 격자 교점 위 (핵심 출력)
    g.circle(alignedScreen.x, alignedScreen.y, 6).fill({ color: ALIGN_COLOR });
    g.circle(alignedScreen.x, alignedScreen.y, 11).stroke({ color: ALIGN_COLOR, width: 2, alpha: 0.6 });

    // raw point handle (주 drag 대상)
    g.circle(rawScreen.x, rawScreen.y, grabRaw ? 8 : 6).fill({ color: RAW_COLOR });

    // dpr track + 눈금 + knob (보조 control)
    g.moveTo(TX, TY)
      .lineTo(TX + TW, TY)
      .stroke({ color: 0x475569, width: 3, alpha: 0.8 });
    for (let i = 0; i < DPR_VALUES.length; i++) {
      const tx = TX + (TW * i) / (DPR_VALUES.length - 1);
      g.circle(tx, TY, 3).fill({ color: 0x64748b });
    }
    const knobX = TX + (TW * DPR_VALUES.indexOf(dpr)) / (DPR_VALUES.length - 1);
    g.circle(knobX, TY, grabTrack ? 9 : 7).fill({ color: 0xfacc15 });

    label.text = [
      `dpr     : ${dpr}  (격자 간격 1/${dpr} px)`,
      `raw     : (${raw.x.toFixed(3)}, ${raw.y.toFixed(3)})`,
      `aligned : (${aligned.x.toFixed(3)}, ${aligned.y.toFixed(3)})`,
      'drag the point; use the bottom knob to change dpr',
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
