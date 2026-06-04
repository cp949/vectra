import { Highlighter } from '@cp949/react-highlight-words';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Box, Dialog, DialogContent, Typography } from '@mui/material';
import type { KeyboardEvent, ReactElement, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { PlaygroundCategory, PlaygroundExample, PlaygroundExampleId } from '../examples/types';
import { filterExamples } from './useExampleSearch';

/** ExampleSearchPopup 컴포넌트 props */
export interface ExampleSearchPopupProps<RuntimeSeed = unknown> {
  readonly open: boolean;
  readonly examples: readonly PlaygroundExample<RuntimeSeed>[];
  readonly categories: readonly PlaygroundCategory[];
  readonly selectedExampleId: PlaygroundExampleId;
  readonly onSelectExample: (id: PlaygroundExampleId) => void;
  readonly onClose: () => void;
  readonly renderExampleMeta?: (example: PlaygroundExample<RuntimeSeed>) => ReactNode;
}

/** Ctrl+/ 전체 예제 검색 팝업. open=false이면 null을 반환한다. */
export function ExampleSearchPopup<RuntimeSeed>({
  open,
  examples,
  categories,
  selectedExampleId,
  onSelectExample,
  onClose,
  renderExampleMeta,
}: ExampleSearchPopupProps<RuntimeSeed>): ReactElement | null {
  const [query, setQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const filteredGroups = useMemo(() => filterExamples(query, examples, categories), [query, examples, categories]);

  const flatExamples = useMemo(() => filteredGroups.flatMap((g) => g.examples), [filteredGroups]);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.title])), [categories]);

  // query 변경 시 포커스 첫 항목으로 리셋
  // biome-ignore lint/correctness/useExhaustiveDependencies: query가 변경될 때만 포커스 리셋
  useEffect(() => {
    setFocusedIndex(0);
  }, [query]);

  // 팝업 닫힐 때 검색어 초기화
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  if (!open) return null;

  function handleSelect(id: PlaygroundExampleId): void {
    onSelectExample(id);
    onClose();
  }

  function handleInputKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, flatExamples.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      const example = flatExamples[focusedIndex];
      if (example) handleSelect(example.id);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          style: {
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 10,
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* 검색 입력 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderBottom: '1px solid #1e293b',
          }}
        >
          <SearchRoundedIcon sx={{ color: '#64748b', fontSize: 20, flexShrink: 0 }} />
          <input
            // 팝업 열릴 때 즉시 타이핑 가능해야 함
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="예제 검색... (이름, ID)"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: '#e5e7eb',
              fontSize: 15,
              outline: 'none',
            }}
          />
        </Box>
        {/* 결과 수 */}
        <Box sx={{ px: 2, py: 0.75, borderBottom: '1px solid #1e293b' }}>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {flatExamples.length}개 매칭
          </Typography>
        </Box>
        {/* 예제 그리드 */}
        <Box
          sx={{
            p: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            maxHeight: 400,
            overflowY: 'auto',
          }}
        >
          {flatExamples.length === 0 ? (
            <Box sx={{ gridColumn: '1 / -1', py: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                매칭 예제 없음
              </Typography>
            </Box>
          ) : (
            flatExamples.map((example, idx) => {
              const isFocused = idx === focusedIndex;
              const isSelected = example.id === selectedExampleId;
              const meta = renderExampleMeta?.(example);
              return (
                <button
                  key={example.id}
                  type="button"
                  onClick={() => handleSelect(example.id)}
                  style={{
                    background: isFocused ? '#1e293b' : 'transparent',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid #1e293b',
                    borderRadius: 6,
                    padding: '10px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#e5e7eb',
                  }}
                >
                  <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 3 }}>
                    {categoryMap.get(example.categoryId) ?? example.categoryId}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, wordBreak: 'break-all' }}>
                    <Highlighter
                      text={example.title || example.id}
                      query={query}
                      autoEscape
                      highlight={{ style: { background: '#fbbf24', color: '#0f172a', borderRadius: 2 } }}
                    />
                  </div>
                  {meta ? <div style={{ marginTop: 5 }}>{meta}</div> : null}
                </button>
              );
            })
          )}
        </Box>
        {/* 키보드 힌트 */}
        <Box
          sx={{
            borderTop: '1px solid #1e293b',
            px: 2,
            py: 0.75,
            display: 'flex',
            gap: 2,
          }}
        >
          {(['↑↓ 탐색', 'Enter 선택', 'ESC 닫기'] as const).map((hint) => (
            <Typography key={hint} variant="caption" sx={{ color: '#475569' }}>
              {hint}
            </Typography>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
