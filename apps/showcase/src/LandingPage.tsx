import type { PlaygroundCategory, PlaygroundExample, PlaygroundExampleId } from '@repo/playground';
import type { ReactElement } from 'react';
import type { ShowcaseRuntimeSeed } from './pixi/api';

interface LandingPageProps {
  readonly categories: readonly PlaygroundCategory[];
  readonly examples: readonly PlaygroundExample<ShowcaseRuntimeSeed>[];
  readonly onSelectExample: (id: PlaygroundExampleId) => void;
}

/** showcase 루트 landing page */
export function LandingPage({ categories, examples, onSelectExample }: LandingPageProps): ReactElement {
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
          <h1 style={{ margin: '0 0 16px', maxWidth: 720, fontSize: 56, lineHeight: 1 }}>Vectra Showcase</h1>
          <p style={{ margin: 0, maxWidth: 680, color: '#cbd5e1', fontSize: 18, lineHeight: 1.6 }}>
            Geometry and math examples with editable source, Pixi preview, console output, and URL-addressable examples.
          </p>
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
                      <span style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>{example.title}</span>
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
