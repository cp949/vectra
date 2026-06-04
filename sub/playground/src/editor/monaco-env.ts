/// <reference path="./monaco-env.d.ts" />

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker&inline';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker&inline';

type MonacoWorkerLabel = 'typescript' | 'javascript' | string;

interface MonacoEnvironment {
  getWorker: (_workerId: string, label: MonacoWorkerLabel) => Worker;
}

const monacoEnvironment: MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === 'typescript' || label === 'javascript') {
      return new TsWorker();
    }
    return new EditorWorker();
  },
};

globalThis.MonacoEnvironment ??= monacoEnvironment;
