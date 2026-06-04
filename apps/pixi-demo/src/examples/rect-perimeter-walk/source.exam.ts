/**
 * Rect Perimeter Walk
 *
 * ticker가 t를 0→1로 연속 순환시키면 marker가 rect 경계를 clockwise로 균등 거리씩 이동한다.
 * 8개 ghost dot이 등간격 t 위치에 분포해 비정방형 rect에서 ghost dot이 꼭짓점이 아닌 위치에
 * 놓이는 것을 드러낸다. 이로써 "t = 둘레 전체 대비 누적 거리 비율(균등 arclength)"을 보인다.
 *
 * - Rects.perimeterPointInto: t∈[0,1]을 둘레 normalized parameter로 환산해 boundary 위 point를
 *   out에 기록한다. ticker hot path에서 buffer를 재사용해 프레임당 재할당을 피한다.
 * - Rects.perimeterPoints: 동일 parameterization으로 count개 등간격 점을 배열로 반환한다.
 *   rect 고정이라 setup에서 1회만 호출해 ghost dot을 미리 계산한다.
 */

import * as Rects from '@cp949/vectra/rect';

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

  // 비정방형 rect: 가로(320)가 세로(170)보다 길어 ghost dot이 꼭짓점이 아닌 위치에 분포함을 보인다
  const rect = {
    x: Math.round((size.width - 320) / 2),
    y: Math.round((size.height - 170) / 2),
    width: 320,
    height: 170,
  };

  // ghost dot 위치를 setup에서 1회만 계산 (rect 고정 → 매 프레임 재계산 불필요)
  // perimeterPoints의 count는 양의 정수여야 한다. 위반 시 RangeError.
  const ghostDots = Rects.perimeterPoints(rect, { count: 8 });

  // ticker hot path용 out buffer: 매 프레임 재사용해 재할당을 피한다
  const markerOut = { x: 0, y: 0 };

  // t 상태: 0→1 연속 순환(clockwise walk, wrap-around)
  // t=0은 top-left, t=0.5는 bottom-right(width+height = perimeter/2이므로 항상), t=1은 top-left로 복귀
  // t=NaN|Infinity는 ticker가 항상 finite를 생성하므로 미발생(JS 산술 전파 정책 주석만)
  let t = 0;
  const SPEED = 0.22; // 초당 t 증가량 (약 4.5초에 한 바퀴)

  const render = (): void => {
    const dt = app.ticker.deltaMS / 1000;

    // t를 등속으로 전진시키고 1.0 도달 시 wrap해 연속 순환
    t += SPEED * dt;
    if (t >= 1.0) t -= 1.0;

    // 핵심 호출: 현재 t의 경계 위 점을 markerOut에 기록
    // empty rect(width≤0 || height≤0)이면 top-left raw 좌표를 반환하지만 고정 양수라 미발생
    Rects.perimeterPointInto(markerOut, rect, t);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // rect 경계 (연회색 stroke)
    g.rect(rect.x, rect.y, rect.width, rect.height).stroke({ color: 0x475569, width: 2 });

    // ghost dot(faint amber): 등간격 t 위치
    // 비정방형이라 t=0.25가 top-right 꼭짓점이 아닌 top edge 위에 놓임을 시각적으로 드러낸다
    for (const pt of ghostDots) {
      g.circle(pt.x, pt.y, 4).fill({ color: 0xf59e0b, alpha: 0.4 });
    }

    // 꼭짓점 참조점(faint blue): ghost dot과 위치가 다름을 강조
    // perimeterPoint API 없이 rect 좌표 산술만으로 계산 (추가 domain import 안 함)
    g.circle(rect.x, rect.y, 4).fill({ color: 0x38bdf8, alpha: 0.5 });
    g.circle(rect.x + rect.width, rect.y, 4).fill({ color: 0x38bdf8, alpha: 0.5 });
    g.circle(rect.x + rect.width, rect.y + rect.height, 4).fill({ color: 0x38bdf8, alpha: 0.5 });
    g.circle(rect.x, rect.y + rect.height, 4).fill({ color: 0x38bdf8, alpha: 0.5 });

    // animated marker (밝은 초록): 현재 t 위치
    g.circle(markerOut.x, markerOut.y, 7).fill({ color: 0x4ade80 });

    label.text = [`t : ${t.toFixed(3)}`, `x : ${markerOut.x.toFixed(1)}`, `y : ${markerOut.y.toFixed(1)}`].join('\n');
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    label.destroy();
    g.destroy();
  };
}
