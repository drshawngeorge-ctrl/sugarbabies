import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function read(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

function extractAssetPath(html, kind) {
  const pattern = kind === 'js'
    ? /src="(\/sugarbabies\/assets\/index-[^"]+\.js)"/
    : /href="(\/sugarbabies\/assets\/index-[^"]+\.css)"/;
  const match = html.match(pattern);
  return match?.[1] ?? null;
}

describe('Deployment artifacts', () => {
  it('root and docs index files reference the same bundle names', () => {
    const rootHtml = read('index.html');
    const docsHtml = read('docs/index.html');
    expect(extractAssetPath(rootHtml, 'js')).toBe(extractAssetPath(docsHtml, 'js'));
    expect(extractAssetPath(rootHtml, 'css')).toBe(extractAssetPath(docsHtml, 'css'));
  });

  it('referenced JS bundle includes corrected male 39-week centiles', () => {
    const rootHtml = read('index.html');
    const jsPath = extractAssetPath(rootHtml, 'js');
    expect(jsPath).not.toBeNull();
    const relPath = jsPath.replace('/sugarbabies/', '');
    expect(existsSync(resolve(process.cwd(), relPath))).toBe(true);
    expect(existsSync(resolve(process.cwd(), `docs/${relPath}`))).toBe(true);

    const bundle = read(relPath);
    expect(bundle).toContain('39:{p3:2684,p5:2786,p10:2942,p50:3465,p90:4049,p95:4232,p97:4361}');
  });
});
