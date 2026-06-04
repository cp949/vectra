import type { PlaygroundCategory, PlaygroundExample, PlaygroundExampleId } from '@repo/playground';
import type { ReactElement } from 'react';
import type { PixiExampleTriage } from '../examples/catalog';
import type { PixiRuntimeSeed } from '../pixi/api';

interface ExampleIndexPageProps {
  categories: readonly PlaygroundCategory[];
  examples: readonly PlaygroundExample<PixiRuntimeSeed>[];
  exampleTriage?: Readonly<Record<string, PixiExampleTriage>>;
  onSelectExample: (id: PlaygroundExampleId) => void;
  showAdvancedExamples: boolean;
  onToggleAdvancedExamples: () => void;
}

export function ExampleIndexPage({
  categories,
  examples,
  exampleTriage,
  onSelectExample,
  showAdvancedExamples,
  onToggleAdvancedExamples,
}: ExampleIndexPageProps): ReactElement {
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <main
      style={{
        minHeight: '100vh',
        overflow: 'auto',
        background: '#020617',
        color: '#e5e7eb',
      }}
    >
      <section style={{ maxWidth: 1040, margin: '0 auto', padding: '48px 32px' }}>
        <header style={{ marginBottom: 40 }}>
          <p style={{ margin: '0 0 10px', color: '#38bdf8', fontSize: 13, fontWeight: 700 }}>Function catalog demos</p>
          <h1 style={{ margin: '0 0 16px', maxWidth: 720, fontSize: 56, lineHeight: 1 }}>Pixi Demo</h1>
          <p style={{ margin: 0, maxWidth: 680, color: '#cbd5e1', fontSize: 18, lineHeight: 1.6 }}>
            Geometry and math examples with editable source, Pixi preview, console output, and URL-addressable examples.
          </p>
          <button
            type="button"
            aria-pressed={showAdvancedExamples}
            onClick={onToggleAdvancedExamples}
            title="Include merged and API recipe examples"
            style={{
              marginTop: 20,
              padding: '8px 12px',
              border: showAdvancedExamples ? '1px solid #67e8f9' : '1px solid #334155',
              borderRadius: 6,
              background: showAdvancedExamples ? '#164e63' : '#0f172a',
              color: '#e5e7eb',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Advanced
          </button>
        </header>

        <div style={{ display: 'grid', gap: 32 }}>
          {sortedCategories.map((category) => {
            const categoryExamples = examples.filter((example) => example.categoryId === category.id);
            if (categoryExamples.length === 0) return null;

            return (
              <section key={category.id}>
                <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>{category.title}</h2>
                <div style={{ display: 'grid', gap: 10 }}>
                  {categoryExamples.map((example) => (
                    <button
                      type="button"
                      key={example.id}
                      onClick={() => onSelectExample(example.id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '14px 16px',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        background: '#0f172a',
                        color: '#e5e7eb',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{example.title}</span>
                        {renderTriageBadge(exampleTriage?.[example.id])}
                      </span>
                      {example.description ? (
                        <span style={{ display: 'block', marginTop: 6, color: '#94a3b8', fontSize: 13 }}>
                          {example.description}
                        </span>
                      ) : null}
                      <span style={{ display: 'block', marginTop: 8, color: '#38bdf8', fontSize: 12 }}>
                        /{example.id}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function renderTriageBadge(triage: PixiExampleTriage | undefined): ReactElement | null {
  if (!triage || triage === 'keep') return null;

  return (
    <span
      style={{
        padding: '2px 6px',
        border: '1px solid #475569',
        borderRadius: 999,
        color: triage === 'merge' ? '#bae6fd' : '#fef3c7',
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1.4,
        textTransform: 'uppercase',
      }}
    >
      {triage}
    </span>
  );
}
