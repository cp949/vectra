/**
 * Triangle From Segment Height
 *
 * 고정 밑변(base segment) 위에서 apex handle 1개를 base에 수직인 축을 따라 drag하면
 * fromSegmentHeight가 base midpoint에서 그 높이만큼 떨어진 apex로 이등변 삼각형을 다시
 * 구성한다. "밑변 위에 높이 h인 이등변 삼각형 세우기(gable/tent 구성)" 작업 흐름을 보인다.
 *
 * - Triangles.fromSegmentHeight: base segment와 signed height로 이등변 삼각형을 만든다.
 *   a=base.a, b=base.b, apex(c)=base midpoint + height·(base normal). 음수 height는 base
 *   반대쪽 apex. 두 다리 |AC|=|BC| 등길이는 이 구성의 분해 표시이지 두 번째 관계가 아니다.
 */

import * as Triangles from '@cp949/vectra/triangle';

type XY = { x: number; y: number };

const BASE_COLOR = 0x60a5fa; // 고정 밑변: 파랑
const TRI_COLOR = 0x34d399; // 정상 이등변 삼각형: 초록
const WARN_COLOR = 0xf87171; // 면적 0 degenerate(apex가 밑변 위): 빨강
const AXIS_COLOR = 0x475569; // apex가 미끄러지는 normal 축 guide: faint
const HEIGHT_COLOR = 0xfbbf24; // M→apex 높이선: amber
const M = 16; // 화면 가장자리 margin (px) → height를 항상 finite로 유지
const GRAB_R = 18; // apex handle 잡기 반경 (px)
const DEGEN_EPS = 2; // |height| ≤ 이 값이면 면적 0으로 보고 warn 처리 (px)

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

  // 고정 수평 base segment (조작 대상 아님). length가 finite positive라 구성은 항상 성공한다.
  const base = {
    a: { x: 220, y: 250 },
    b: { x: 500, y: 250 },
  };

  // base midpoint M: apex가 이 점에서 normal 방향으로 height만큼 떨어진다.
  const mid: XY = { x: (base.a.x + base.b.x) / 2, y: (base.a.y + base.b.y) / 2 };

  // base 길이는 고정 상수라 setup에서 1회만 inline 계산한다(hot path 아님).
  const baseLen = Math.hypot(base.b.x - base.a.x, base.b.y - base.a.y);

  // base의 left normal 단위벡터: (-dy/len, dx/len). 수평 base라 (0, 1) = 화면 아래쪽.
  const nx = -(base.b.y - base.a.y) / baseLen;
  const ny = (base.b.x - base.a.x) / baseLen;

  // signed height 상태. 초기값 음수 → apex가 base 위쪽(지붕 모양)에서 시작.
  let height = -130;

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // 현재 height로 apex 화면 좌표를 구한다(handle 잡기 판정·렌더 공용).
  const apexAt = (h: number): XY => ({ x: mid.x + nx * h, y: mid.y + ny * h });

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    const apex = apexAt(height);
    // apex handle과의 거리로 잡기 판정
    grabbed = Math.hypot(apex.x - p.x, apex.y - p.y) <= GRAB_R;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // pointer를 화면 안으로 clamp → 좌표는 항상 finite → height도 finite
    const py = Math.max(M, Math.min(size.height - M, p.y));
    const px = Math.max(M, Math.min(size.width - M, p.x));
    // pointer를 normal 축으로 투영해 signed height를 얻는다(축 밖 성분은 버림 → apex는 축에 구속).
    // 부호가 곧 방향: 음수면 fromSegmentHeight가 base 반대쪽에 apex를 만든다.
    height = (px - mid.x) * nx + (py - mid.y) * ny;
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(1);

  const render = (): void => {
    // 핵심 호출: 밑변 + 높이 → 이등변 삼각형. drag로 정해진 height 하나만 입력한다.
    // drag당 1회 단발 결과라 allocating companion을 쓴다(ticker render는 state만 그림).
    const tri = Triangles.fromSegmentHeight(base, height);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // apex가 미끄러지는 normal 축 guide(M을 지나는 base 수직선)
    const far = 1000;
    g.moveTo(mid.x - nx * far, mid.y - ny * far)
      .lineTo(mid.x + nx * far, mid.y + ny * far)
      .stroke({ color: AXIS_COLOR, width: 1, alpha: 0.7 });

    // 고정 base segment + 양 끝 marker
    g.moveTo(base.a.x, base.a.y).lineTo(base.b.x, base.b.y).stroke({ color: BASE_COLOR, width: 3 });
    g.circle(base.a.x, base.a.y, 5).fill({ color: BASE_COLOR });
    g.circle(base.b.x, base.b.y, 5).fill({ color: BASE_COLOR });
    // base midpoint M
    g.circle(mid.x, mid.y, 4).fill({ color: BASE_COLOR });

    // base가 고정 positive라 tri는 항상 정의되지만, undefined 반환 계약을 가드로 노출한다.
    if (tri) {
      // |height| ≈ 0이면 apex가 base 위에 놓여 면적 0 collinear 삼각형 → warn 색으로 강조.
      const degenerate = Math.abs(height) <= DEGEN_EPS;
      const stateColor = degenerate ? WARN_COLOR : TRI_COLOR;

      // 높이선 M→apex(현재 height)
      g.moveTo(mid.x, mid.y).lineTo(tri.c.x, tri.c.y).stroke({ color: HEIGHT_COLOR, width: 1.5 });

      // 이등변 삼각형 면 + 외곽선(두 다리 AC·BC가 곧 stroke edge)
      const poly = [tri.a.x, tri.a.y, tri.b.x, tri.b.y, tri.c.x, tri.c.y];
      g.poly(poly).fill({ color: stateColor, alpha: degenerate ? 0.12 : 0.22 });
      g.poly(poly).stroke({ color: stateColor, width: 2.5, alpha: 0.95 });

      // apex handle (유일 drag 대상)
      g.circle(tri.c.x, tri.c.y, grabbed ? 10 : 8).fill({ color: 0xf8fafc });
      g.circle(tri.c.x, tri.c.y, grabbed ? 10 : 8).stroke({ color: stateColor, width: 2 });

      // 두 다리 길이: 이등변이라 항상 |AC| ≈ |BC|(같은 구성의 분해 표시, Math.hypot inline).
      const legAC = Math.hypot(tri.c.x - tri.a.x, tri.c.y - tri.a.y);
      const legBC = Math.hypot(tri.c.x - tri.b.x, tri.c.y - tri.b.y);

      label.text = [
        'isosceles from base + height   drag apex',
        `height : ${fmt(height)}${degenerate ? '  (flat)' : ''}`,
        `base   : ${fmt(baseLen)}`,
        `legs   : ${fmt(legAC)} = ${fmt(legBC)}`,
      ].join('\n');
    }
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
