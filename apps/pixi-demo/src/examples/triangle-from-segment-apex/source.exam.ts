/**
 * Triangle From Segment Apex
 *
 * 화면 고정 밑변(base segment) 위에서 apex 정점 handle 1개를 자유롭게(2 DOF) drag하면
 * fromSegmentApex가 base 두 끝점과 그 apex로 일반 삼각형을 다시 구성한다. apex를 어디로
 * 끌든 base 두 변(a,b)은 고정이라 "고정 밑변에 자유 꼭짓점을 얹어 임의 삼각형을 세운다"는
 * 구성 작업 흐름을 보인다.
 *
 * - Triangles.fromSegmentApex: base segment(a,b)와 apex point(c)로 삼각형을 만든다.
 *   a=base.a, b=base.b, c=apex. 세 변 길이 |AB|·|AC|·|BC|는 이 구성의 분해 표시이지
 *   두 번째 관계가 아니다. apex가 base 지지선 위에 오면 면적 0 flat 삼각형이 된다.
 */

import * as Triangles from '@cp949/vectra/triangle';

type XY = { x: number; y: number };

const BASE_COLOR = 0x60a5fa; // 고정 밑변: 파랑
const TRI_COLOR = 0x34d399; // 정상 삼각형: 초록
const WARN_COLOR = 0xf87171; // 면적 0 degenerate(apex가 base 지지선 위): 빨강
const LINE_COLOR = 0x475569; // base 지지선 guide(apex가 이 선에 오면 collinear): faint
const M = 16; // 화면 가장자리 margin (px) → apex 좌표를 항상 finite로 유지
const GRAB_R = 18; // apex handle 잡기 반경 (px)
const DEGEN_EPS = 2; // base 지지선까지 거리 ≤ 이 값이면 면적 0으로 보고 warn 처리 (px)

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

  // 고정 밑변 segment (조작 대상 아님). length가 finite positive라 구성은 항상 성공한다.
  const base = {
    a: { x: 230, y: 300 },
    b: { x: 490, y: 300 },
  };

  // base 길이 |AB|는 고정 상수라 setup에서 1회만 inline 계산한다(hot path 아님).
  const baseLen = Math.hypot(base.b.x - base.a.x, base.b.y - base.a.y);

  // base 방향 단위벡터: 지지선 guide를 양쪽으로 길게 뻗을 때 쓴다.
  const ux = (base.b.x - base.a.x) / baseLen;
  const uy = (base.b.y - base.a.y) / baseLen;

  // 자유 apex 정점 상태(유일 drag 대상). 시작은 base 위쪽.
  const apex: XY = { x: 360, y: 140 };

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // apex handle과의 거리로 잡기 판정
    grabbed = Math.hypot(apex.x - p.x, apex.y - p.y) <= GRAB_R;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // pointer를 화면 안으로 clamp → apex 좌표는 항상 finite (구성 입력이 NaN/Infinity가 되지 않음)
    apex.x = Math.max(M, Math.min(size.width - M, p.x));
    apex.y = Math.max(M, Math.min(size.height - M, p.y));
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
    // 핵심 호출: 고정 base + 자유 apex → 일반 삼각형. apex 하나만 입력으로 바뀐다.
    // drag당 1회 단발 결과라 allocating companion을 쓴다(ticker render는 state만 그림).
    const tri = Triangles.fromSegmentApex(base, apex);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // base 지지선 guide(양 끝점을 지나는 무한 직선). apex가 이 선 위로 오면 collinear → 면적 0.
    const far = 1000;
    g.moveTo(base.a.x - ux * far, base.a.y - uy * far)
      .lineTo(base.b.x + ux * far, base.b.y + uy * far)
      .stroke({ color: LINE_COLOR, width: 1, alpha: 0.7 });

    // 고정 base segment + 양 끝 marker(삼각형의 변 AB)
    g.moveTo(base.a.x, base.a.y).lineTo(base.b.x, base.b.y).stroke({ color: BASE_COLOR, width: 3 });
    g.circle(base.a.x, base.a.y, 5).fill({ color: BASE_COLOR });
    g.circle(base.b.x, base.b.y, 5).fill({ color: BASE_COLOR });

    // apex의 base 지지선까지 부호 거리: |cross|/baseLen. ≈0이면 collinear(면적 0).
    // cross = (B−A) × (apex−A). 별도 domain import 없이 inline 산술.
    const cross = (base.b.x - base.a.x) * (apex.y - base.a.y) - (base.b.y - base.a.y) * (apex.x - base.a.x);
    const distToLine = Math.abs(cross) / baseLen;
    const degenerate = distToLine <= DEGEN_EPS;
    const stateColor = degenerate ? WARN_COLOR : TRI_COLOR;

    // 삼각형 면 + 외곽선(세 변 AB·BC·CA가 곧 stroke edge)
    const poly = [tri.a.x, tri.a.y, tri.b.x, tri.b.y, tri.c.x, tri.c.y];
    g.poly(poly).fill({ color: stateColor, alpha: degenerate ? 0.12 : 0.22 });
    g.poly(poly).stroke({ color: stateColor, width: 2.5, alpha: 0.95 });

    // apex handle (유일 drag 대상)
    g.circle(tri.c.x, tri.c.y, grabbed ? 10 : 8).fill({ color: 0xf8fafc });
    g.circle(tri.c.x, tri.c.y, grabbed ? 10 : 8).stroke({ color: stateColor, width: 2 });

    // 세 변 길이: |AB|는 고정, |AC|·|BC|는 apex로 변한다(같은 구성의 분해 표시, Math.hypot inline).
    const sideAC = Math.hypot(tri.c.x - tri.a.x, tri.c.y - tri.a.y);
    const sideBC = Math.hypot(tri.c.x - tri.b.x, tri.c.y - tri.b.y);

    label.text = [
      'triangle from base + free apex   drag apex',
      `AB : ${fmt(baseLen)}  (fixed base)`,
      `AC : ${fmt(sideAC)}`,
      `BC : ${fmt(sideBC)}${degenerate ? '   (flat)' : ''}`,
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
