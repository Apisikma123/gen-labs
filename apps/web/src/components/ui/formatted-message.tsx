'use client';

import React, { useMemo } from 'react';
import { MathView } from './math-view';

interface FormattedMessageProps {
  content: string;
  className?: string;
}

/**
 * Normalizes text so that compressed inline lists and equations
 * get proper block and line breaks for comfortable reading.
 */
function normalizeContent(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let text = raw.trim();

  // Fix accidental double carets (e.g. \log[\text{H}^^+])
  text = text.replace(/\^{2,}/g, '^');

  // Convert LaTeX display delimiters \[ ... \] to $$ ... $$
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, eq) => `\n\n$$${eq.trim()}$$\n\n`);

  // Convert LaTeX inline delimiters \( ... \) to $ ... $
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, eq) => `$${eq.trim()}$`);

  // Normalize list bullets that are smashed together without newlines
  text = text.replace(/([^\n])\s*\*\s+\*\*/g, '$1\n* **');
  text = text.replace(/([^\n])\s*-\s+\*\*/g, '$1\n- **');
  text = text.replace(/([^\n])\s+(\d+\.\s+\*\*)/g, '$1\n$2');

  // Auto-wrap naked inline LaTeX formulas that lack $ delimiters
  text = text.replace(
    /(?<![\$\w])(?:\\log\s*\[[^\n\]]+\](?:\s*=\s*-?\d+)?|\[\\text\{[^\n\}]+\}\^[^\]\s]+\](?:\s*=\s*10\^\{?-?\d+\}?(?:\s*mol\/L)?)?|\\frac\{[^\n\}]+\}\{[^\n\}]+\}|\\sqrt\{[^\n\}]+\}|10\^\{?-?\d+\})(?![\$\w])/g,
    (eq) => `$${eq}$`
  );

  // Remove empty block math delimiters
  text = text.replace(/\$\$\s*\$\$/g, '');

  return text;
}

/**
 * Parses inline formatting: bold, italic, inline code, and inline math ($...$).
 */
function renderInlineContent(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const pattern = /(\$[^$\n]+\$|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `inline-${match.index}`;

    if (token.startsWith('$') && token.endsWith('$') && token.length > 2) {
      const mathExpr = token.slice(1, -1).trim();
      tokens.push(
        <MathView key={key} math={mathExpr} displayMode={false} className="mx-0.5 text-[var(--color-primary-text)] font-semibold" />
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2);
      tokens.push(
        <strong key={key} className="font-bold text-[var(--color-text)]">
          {renderInlineContent(inner)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const inner = token.slice(1, -1);
      tokens.push(
        <code key={key} className="font-mono text-xs px-1.5 py-0.5 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-secondary)]">
          {inner}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const inner = token.slice(1, -1);
      tokens.push(
        <em key={key} className="italic text-[var(--color-text-secondary)]">
          {renderInlineContent(inner)}
        </em>
      );
    } else {
      tokens.push(token);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens;
}

export function FormattedMessage({ content, className = '' }: FormattedMessageProps) {
  const blocks = useMemo(() => {
    const normalized = normalizeContent(content || '');

    // Extract block math equations ($$...$$) safely without mangling delimiters
    const segments: Array<{ type: 'math' | 'text'; content: string }> = [];
    const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
    let lastIdx = 0;
    let m: RegExpExecArray | null;

    while ((m = blockMathRegex.exec(normalized)) !== null) {
      if (m.index > lastIdx) {
        const textPart = normalized.slice(lastIdx, m.index).trim();
        if (textPart) segments.push({ type: 'text', content: textPart });
      }
      const mathContent = m[1].trim();
      // Only push math block if it has non-empty equation
      if (mathContent) {
        segments.push({ type: 'math', content: mathContent });
      }
      lastIdx = blockMathRegex.lastIndex;
    }

    if (lastIdx < normalized.length) {
      const remaining = normalized.slice(lastIdx).trim();
      if (remaining) segments.push({ type: 'text', content: remaining });
    }

    return segments;
  }, [content]);

  return (
    <div className={`space-y-3 text-xs sm:text-sm leading-relaxed text-[var(--color-text)] ${className}`}>
      {blocks.map((segment, sIdx) => {
        if (segment.type === 'math') {
          return (
            <MathView key={`math-${sIdx}`} math={segment.content} displayMode={true} />
          );
        }

        // Split text segment into standard paragraphs by double newlines
        const paragraphs = segment.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

        return paragraphs.map((p, pIdx) => {
          // Detect naked LaTeX equation on its own line (e.g. \text{pH} = -\log_{10}[\text{H}^+])
          const isNakedMath =
            (p.startsWith('\\text{') || p.startsWith('\\frac{') || p.startsWith('\\log') || p.startsWith('pH =') || p.startsWith('R =')) &&
            (p.includes('=') || p.includes('\\times') || p.includes('\\cdot')) &&
            !p.includes(' adalah ') &&
            !p.includes(' yaitu ');

          if (isNakedMath) {
            return (
              <MathView key={`p-${sIdx}-${pIdx}`} math={p} displayMode={true} />
            );
          }

          // Check if list
          const lines = p.split('\n').map((l) => l.trim()).filter(Boolean);
          const isList = lines.some((l) => /^(\*|-|\d+\.)\s+/.test(l));

          if (isList) {
            return (
              <div key={`p-${sIdx}-${pIdx}`} className="space-y-1.5 my-2">
                {lines.map((line, lIdx) => {
                  const listMatch = line.match(/^(\*|-|\d+\.)\s+(.*)$/);
                  if (listMatch) {
                    const prefix = listMatch[1];
                    const itemContent = listMatch[2];
                    const isNumber = /^\d+\./.test(prefix);

                    return (
                      <div key={lIdx} className="flex items-start gap-2.5 pl-1">
                        {isNumber ? (
                          <span className="font-mono text-[11px] font-bold text-[var(--color-secondary)] bg-[var(--color-surface)] px-1.5 py-0.5 rounded-sm border border-[var(--color-border-subtle)] shrink-0 mt-0.5">
                            {prefix}
                          </span>
                        ) : (
                          <span className="w-1.5 h-0.5 bg-[var(--color-secondary)] shrink-0 mt-2.5 rounded-xs" />
                        )}
                        <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                          {renderInlineContent(itemContent)}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <p key={lIdx} className="leading-relaxed">
                      {renderInlineContent(line)}
                    </p>
                  );
                })}
              </div>
            );
          }

          return (
            <p key={`p-${sIdx}-${pIdx}`} className="leading-relaxed">
              {renderInlineContent(p)}
            </p>
          );
        });
      })}
    </div>
  );
}
