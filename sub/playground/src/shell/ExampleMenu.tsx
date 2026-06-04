import { Highlighter } from '@cp949/react-highlight-words';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useState } from 'react';
import type { PlaygroundCategory, PlaygroundExample, PlaygroundExampleId } from '../examples/types';
import { type GroupedExamples, groupExamplesByCategory, useExampleSearch } from './useExampleSearch';

export type { GroupedExamples };
export { groupExamplesByCategory };

/** `ExampleMenu` 컴포넌트 props */
export interface ExampleMenuProps<RuntimeSeed> {
  readonly categories: readonly PlaygroundCategory[];
  readonly examples: readonly PlaygroundExample<RuntimeSeed>[];
  readonly selectedExampleId: PlaygroundExampleId;
  readonly onSelectExample: (id: PlaygroundExampleId) => void;
  readonly homeLabel?: string;
  readonly onOpenHome?: () => void;
  /** 제공 시 Ctrl+/ 버튼이 표시되며, 클릭 시 호출된다 */
  readonly onOpenSearch?: () => void;
  readonly style?: CSSProperties;
  readonly showDescriptions?: boolean;
  readonly menuAction?: ReactNode;
  readonly renderExampleMeta?: (example: PlaygroundExample<RuntimeSeed>) => ReactNode;
}

/** 카테고리별 예제 목록을 표시하는 탐색 메뉴 */
export function ExampleMenu<RuntimeSeed>({
  categories,
  examples,
  selectedExampleId,
  onSelectExample,
  homeLabel,
  onOpenHome,
  onOpenSearch,
  style,
  showDescriptions = true,
  menuAction,
  renderExampleMeta,
}: ExampleMenuProps<RuntimeSeed>): ReactElement {
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>(() =>
    categories.filter((category) => category.defaultExpanded).map((category) => category.id)
  );
  const { filteredGroups } = useExampleSearch(query, examples, categories);

  function toggleCategory(categoryId: string): void {
    setExpandedIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  }

  return (
    <nav aria-label="Examples" style={{ overflow: 'auto', padding: 12, ...style }}>
      {homeLabel && onOpenHome ? (
        <button
          type="button"
          onClick={onOpenHome}
          style={{
            display: 'block',
            width: '100%',
            margin: '0 0 12px',
            padding: '10px',
            border: '1px solid #334155',
            borderRadius: 6,
            background: 'transparent',
            color: '#e5e7eb',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 800,
            textAlign: 'left',
          }}
        >
          {homeLabel}
        </button>
      ) : null}
      {menuAction ? <div style={{ margin: '0 0 12px' }}>{menuAction}</div> : null}
      <div style={{ marginBottom: 12 }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="예제 검색..."
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '7px 10px',
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 6,
            color: '#e5e7eb',
            fontSize: 13,
            outline: 'none',
          }}
        />
        {onOpenSearch ? (
          <button
            type="button"
            onClick={onOpenSearch}
            style={{
              display: 'block',
              marginTop: 6,
              padding: 0,
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Ctrl+/ 전체 검색 열기
          </button>
        ) : null}
      </div>
      {filteredGroups.map((group) => {
        const isExpanded = expandedIds.includes(group.category.id);
        const groupId = `example-menu-category-${group.category.id}`;

        return (
          <section key={group.category.id} style={{ marginBottom: 18 }}>
            <h2 style={{ margin: '0 0 8px' }}>
              <button
                type="button"
                aria-controls={groupId}
                aria-expanded={isExpanded}
                onClick={() => toggleCategory(group.category.id)}
                style={{
                  alignItems: 'center',
                  background: 'transparent',
                  border: 0,
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  fontSize: 12,
                  fontWeight: 700,
                  gap: 6,
                  margin: 0,
                  padding: '2px 0',
                  textAlign: 'left',
                  textTransform: 'uppercase',
                  width: '100%',
                }}
              >
                <span aria-hidden="true" style={{ width: 12 }}>
                  {isExpanded ? '▾' : '▸'}
                </span>
                <span>{group.category.title}</span>
              </button>
            </h2>
            {isExpanded ? (
              <div id={groupId}>
                {group.examples.map((example) => {
                  const selected = example.id === selectedExampleId;
                  const meta = renderExampleMeta?.(example);
                  return (
                    <button
                      type="button"
                      key={example.id}
                      onClick={() => onSelectExample(example.id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        margin: '0 0 6px',
                        padding: '8px 10px',
                        border: selected ? '1px solid #38bdf8' : '1px solid transparent',
                        borderRadius: 6,
                        background: selected ? '#0c2340' : 'transparent',
                        color: selected ? '#38bdf8' : '#e5e7eb',
                        cursor: 'pointer',
                        fontSize: 13,
                        textAlign: 'left',
                      }}
                    >
                      <Highlighter
                        text={example.title || example.id}
                        query={query}
                        autoEscape
                        highlight={{ style: { background: '#fbbf24', color: '#0f172a', borderRadius: 2 } }}
                      />
                      {meta ? <span style={{ display: 'block', marginTop: 4 }}>{meta}</span> : null}
                      {showDescriptions && example.description ? (
                        <span style={{ display: 'block', marginTop: 3, fontSize: 11, color: '#94a3b8' }}>
                          {example.description}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </section>
        );
      })}
    </nav>
  );
}
