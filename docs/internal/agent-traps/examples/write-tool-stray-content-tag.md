# Write로 생성한 예제 파일 끝에 `</content>` 닫는 태그가 새어 들어간다

태그: `examples`, `testing`, `tooling`

## 함정

새 예제 파일(`source.exam.ts`, `index.ts`)을 Write tool로 생성할 때, 파일 본문 마지막에
`</content>` 같은 닫는 태그 토큰이 그대로 파일에 기록되는 경우가 있다. TypeScript에서 이는
구문 오류라 oxc transform 단계에서 빌드/테스트가 깨진다.

```ts
// index.ts 끝
};
</content>   // ← 파일에 박힌 stray 토큰. TS 구문 오류
```

## 증상

`pnpm --filter @repo/pixi-demo test`에서 다수 test 파일이 transform 단계에서 실패한다.

```txt
╭─[ src/examples/<id>/index.ts:23:2 ]
 23 │ </content>
Plugin: vite:oxc
```

- 실패가 특정 it가 아니라 파일 transform 자체에서 난다(`Test Files N failed`이지만
  통과한 test 수는 정상으로 보여 혼동된다).
- 같은 패턴이 `source.exam.ts`와 계획서 `.md`에도 동시에 새어 들어갈 수 있다.

## 방지

- Write 직후 새 파일은 마지막 3줄을 확인하거나 `grep -n "</content>" <경로>`로 stray 닫는 태그
  잔존을 확인한다. 한 번 새면 같은 turn에 만든 다른 파일에도 함께 들어갔을 가능성이 높으므로
  생성한 파일 전부를 한 번에 grep한다.
- `.md` 계획서는 TS 오류로 드러나지 않으니 따로 확인한다.
