declare var MonacoEnvironment:
  | {
      getWorker: (workerId: string, label: string) => Worker;
    }
  | undefined;

declare module '*?worker&inline' {
  const WorkerConstructor: new () => Worker;

  export { WorkerConstructor as default };
}
