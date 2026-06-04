import { type ReactElement, useCallback, useEffect, useRef } from 'react';
import type { SandboxChildMessage, SandboxHostMessage } from './messages';

/** srcdoc sandbox iframe 권한. same-origin은 extension content script의 null origin 충돌을 피하기 위해 필요하다. */
export const PLAYGROUND_SANDBOX_PERMISSIONS = 'allow-scripts allow-same-origin';

/** `SandboxPreview` 컴포넌트 props */
export interface SandboxPreviewProps {
  /**
   * sandbox iframe에 로드할 HTML URL.
   * `srcdoc`과 함께 지정하면 `srcdoc`이 우선된다.
   */
  readonly src?: string;
  /**
   * sandbox iframe에 직접 삽입할 HTML 문자열 (srcdoc 속성).
   * 지정 시 `src`보다 우선한다.
   */
  readonly srcdoc?: string;
  /** host → child로 보낼 메시지. 변경 시 iframe으로 전송된다. */
  readonly pendingMessage?: SandboxHostMessage;
  /** child → host 메시지 수신 콜백 */
  readonly onMessage?: (msg: SandboxChildMessage) => void;
  /** iframe 너비 (CSS 값, 기본 '100%') */
  readonly width?: string;
  /** iframe 높이 (CSS 값, 기본 '100%') */
  readonly height?: string;
}

/**
 * sandbox iframe을 감싸는 최소 React 컴포넌트.
 *
 * `srcdoc`이 있으면 srcdoc 속성으로 HTML을 직접 주입하고,
 * 없으면 `src` URL을 사용한다.
 * `pendingMessage`가 변경되면 iframe contentWindow로 postMessage를 전송한다.
 * `onMessage`를 통해 child 메시지를 수신한다.
 */
export function SandboxPreview({
  src,
  srcdoc,
  pendingMessage,
  onMessage,
  width = '100%',
  height = '100%',
}: SandboxPreviewProps): ReactElement {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const portRef = useRef<MessagePort | null>(null);
  const onMessageRef = useRef<typeof onMessage>(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const closePort = useCallback((): void => {
    if (!portRef.current) return;
    portRef.current.close();
    portRef.current = null;
  }, []);

  const connectSandbox = useCallback((): void => {
    closePort();
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const channel = new MessageChannel();
    portRef.current = channel.port1;
    channel.port1.onmessage = (event: MessageEvent): void => {
      const raw = event.data as { protocol?: unknown } | null | undefined;
      if (!raw || raw.protocol !== 'vectra-playground/v1') return;
      onMessageRef.current?.(event.data as SandboxChildMessage);
    };

    iframe.contentWindow.postMessage(
      {
        protocol: 'vectra-playground/v1',
        kind: 'connect',
      },
      '*',
      [channel.port2]
    );
  }, [closePort]);

  // pendingMessage 변경 시 iframe으로 메시지 전송
  useEffect(() => {
    if (!pendingMessage) return;
    portRef.current?.postMessage(pendingMessage);
  }, [pendingMessage]);

  useEffect(() => {
    return closePort;
  }, [closePort]);

  // srcdoc 우선, 없으면 src 사용 (둘 다 없으면 about:blank)
  const iframeSrc = srcdoc ? undefined : (src ?? 'about:blank');

  return (
    <iframe
      ref={iframeRef}
      src={iframeSrc}
      srcDoc={srcdoc}
      onLoad={connectSandbox}
      sandbox={PLAYGROUND_SANDBOX_PERMISSIONS}
      style={{ border: 'none', width, height, display: 'block' }}
      title="playground sandbox"
    />
  );
}
