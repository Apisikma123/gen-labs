/**
 * Markdown Simulator Parser & Serializer for Gen Labs Super Canvas.
 * 
 * Requirement #15 & #16:
 * Admin can define simulators in simple Markdown format.
 * MD -> SimulatorDefinition -> Super Canvas.
 * Both AI and MD produce the exact same structured specification.
 */

import { UnifiedSimulatorSpec, DifficultyLevel } from './simulator-schema';

export function parseSimulatorMarkdown(mdText: string): UnifiedSimulatorSpec {
  const lines = mdText.split('\n');

  let title = 'Simulasi Baru';
  let discipline = 'Umum';
  let topic = 'Konsep Dasar';
  let difficulty: DifficultyLevel = 'basic';
  let description = '';
  let estimatedTime = '10–15 menit';

  const parameters: UnifiedSimulatorSpec['parameters'] = {};
  const calculations: UnifiedSimulatorSpec['calculations'] = {};
  const results: UnifiedSimulatorSpec['results'] = [];
  const experiments: UnifiedSimulatorSpec['experiments'] = [];
  const insight: UnifiedSimulatorSpec['insight'] = {
    summary: '',
    causeAndEffect: '',
    whatIf: '',
  };

  let currentSection: 'header' | 'parameters' | 'calculations' | 'results' | 'experiments' | 'insight' = 'header';

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) continue;

    // Detect Top Heading # Title
    if (line.startsWith('# ') && currentSection === 'header') {
      title = line.replace(/^#\s+/, '').trim();
      continue;
    }

    // Detect Section Headings ## Section
    if (line.startsWith('## ')) {
      const heading = line.replace(/^##\s+/, '').toLowerCase();
      if (heading.includes('param')) currentSection = 'parameters';
      else if (heading.includes('hitung') || heading.includes('rumus') || heading.includes('formula')) currentSection = 'calculations';
      else if (heading.includes('hasil') || heading.includes('result')) currentSection = 'results';
      else if (heading.includes('eksperimen') || heading.includes('experiment') || heading.includes('tantangan')) currentSection = 'experiments';
      else if (heading.includes('insight') || heading.includes('wawasan')) currentSection = 'insight';
      continue;
    }

    // Header metadata parsing (e.g. Bidang: Fisika, Topik: Dinamika)
    if (currentSection === 'header') {
      if (
        line.toLowerCase().startsWith('bidang:') ||
        line.toLowerCase().startsWith('kategori:') ||
        line.toLowerCase().startsWith('category:') ||
        line.toLowerCase().startsWith('program studi:') ||
        line.toLowerCase().startsWith('prodi:')
      ) {
        discipline = line.split(':')[1]?.trim() || discipline;
      } else if (line.toLowerCase().startsWith('topik:')) {
        topic = line.split(':')[1]?.trim() || topic;
      } else if (line.toLowerCase().startsWith('tingkat:') || line.toLowerCase().startsWith('difficulty:')) {
        const diff = line.split(':')[1]?.trim().toLowerCase();
        if (diff === 'intermediate' || diff === 'menengah') difficulty = 'intermediate';
        else if (diff === 'advanced' || diff === 'mahir') difficulty = 'advanced';
        else difficulty = 'basic';
      } else if (line.toLowerCase().startsWith('waktu:') || line.toLowerCase().startsWith('estimasi:')) {
        estimatedTime = line.split(':')[1]?.trim() || estimatedTime;
      } else if (line.toLowerCase().startsWith('deskripsi:')) {
        description = line.split(':')[1]?.trim() || description;
      } else if (!description && !line.startsWith('#')) {
        description = line;
      }
      continue;
    }

    // Parameter parsing:
    // Format: - mass: Massa Balok (1 s.d. 20 kg, default 5)
    // or: - force: Gaya Dorong (min: 0, max: 100, default: 25, unit: N)
    if (currentSection === 'parameters') {
      const clean = line.replace(/^[-*]\s+/, '');
      const colonIdx = clean.indexOf(':');
      if (colonIdx > -1) {
        const key = clean.slice(0, colonIdx).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        const rest = clean.slice(colonIdx + 1).trim();

        // Extract label (everything before parentheses or numbers)
        let label = rest.replace(/\(.*?\)/g, '').trim();
        let min = 0;
        let max = 100;
        let defaultVal = 50;
        let step = 1;
        let unit = '';

        // Extract numbers inside brackets or text
        const parenMatch = rest.match(/\((.*?)\)/);
        if (parenMatch) {
          const inner = parenMatch[1];
          // e.g. "1 s.d. 20 kg, default 5" or "0 - 100 N"
          const rangeMatch = inner.match(/([0-9.]+)\s*(?:-|s\.?d\.?|to)\s*([0-9.]+)/i);
          if (rangeMatch) {
            min = Number(rangeMatch[1]);
            max = Number(rangeMatch[2]);
          }
          const defMatch = inner.match(/default\s*[:=]?\s*([0-9.]+)/i);
          if (defMatch) {
            defaultVal = Number(defMatch[1]);
          } else {
            defaultVal = min + (max - min) / 2;
          }
          const unitMatch = inner.match(/[0-9.]+\s*([a-zA-Z%°/²]+)/);
          if (unitMatch && !['s', 'sd'].includes(unitMatch[1].toLowerCase())) {
            unit = unitMatch[1];
          }
        }

        if (!label) label = key;

        parameters[key] = {
          key,
          label,
          min,
          max,
          step,
          defaultVal,
          unit,
        };
      }
      continue;
    }

    // Calculations parsing:
    // Format: - netForce = force - friction
    // or: - acceleration: netForce / mass
    if (currentSection === 'calculations') {
      const clean = line.replace(/^[-*]\s+/, '');
      const eqIdx = clean.indexOf('=') > -1 ? clean.indexOf('=') : clean.indexOf(':');
      if (eqIdx > -1) {
        const key = clean.slice(0, eqIdx).trim().replace(/[^a-zA-Z0-9_]/g, '');
        const formula = clean.slice(eqIdx + 1).trim();
        calculations[key] = {
          key,
          label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
          formula,
        };
      }
      continue;
    }

    // Results parsing:
    // Format: - Percepatan (a): acceleration m/s²
    // or: - Hasil: netForce N
    if (currentSection === 'results') {
      const clean = line.replace(/^[-*]\s+/, '');
      const colonIdx = clean.indexOf(':');
      if (colonIdx > -1) {
        const left = clean.slice(0, colonIdx).trim();
        const right = clean.slice(colonIdx + 1).trim();

        // Symbol in parentheses e.g. "Percepatan (a)"
        let label = left;
        let symbol: string | undefined;
        const symMatch = left.match(/\((.*?)\)/);
        if (symMatch) {
          symbol = symMatch[1];
          label = left.replace(/\(.*?\)/, '').trim();
        }

        // Calculation key and optional unit e.g. "acceleration m/s²"
        const parts = right.split(/\s+/);
        const calculationKey = parts[0];
        const unit = parts.slice(1).join(' ') || undefined;

        results.push({
          key: calculationKey,
          label,
          symbol,
          calculationKey,
          unit,
          highlight: results.length === 0,
        });
      }
      continue;
    }

    // Experiments parsing:
    // Format: Target: acceleration = 8 (toleransi 0.1 m/s²)
    // Pesan: Berhasil mencapai percepatan target!
    if (currentSection === 'experiments') {
      const clean = line.replace(/^[-*]\s+/, '');
      if (clean.toLowerCase().includes('target:')) {
        const targetStr = clean.replace(/target:/i, '').trim();
        const match = targetStr.match(/([a-zA-Z0-9_]+)\s*=\s*([0-9.]+)/);
        if (match) {
          const targetMetric = match[1];
          const targetValue = Number(match[2]);
          let tolerance = 0.1;
          let unit = '';

          const tolMatch = targetStr.match(/toleransi\s*([0-9.]+)\s*([a-zA-Z%°/²]*)/i);
          if (tolMatch) {
            tolerance = Number(tolMatch[1]);
            unit = tolMatch[2] || '';
          }

          experiments.push({
            id: `exp-${experiments.length + 1}`,
            title: `Tantangan Eksperimen #${experiments.length + 1}`,
            objective: `Atur variabel kendali hingga ${targetMetric} mencapai target ${targetValue}${unit ? ' ' + unit : ''}.`,
            targetMetric,
            targetValue,
            tolerance,
            unit,
            successMessage: `Selamat! Kamu berhasil mencapai target ${targetMetric} = ${targetValue}.`,
          });
        }
      } else if (clean.toLowerCase().includes('pesan:') && experiments.length > 0) {
        experiments[experiments.length - 1].successMessage = clean.replace(/pesan:/i, '').trim();
      }
      continue;
    }

    // Insight parsing:
    if (currentSection === 'insight') {
      const clean = line.replace(/^[-*]\s+/, '');
      if (clean.toLowerCase().startsWith('ringkasan:') || clean.toLowerCase().startsWith('summary:')) {
        insight.summary = clean.split(':')[1]?.trim() || '';
      } else if (clean.toLowerCase().startsWith('sebab akibat:') || clean.toLowerCase().startsWith('cause:')) {
        insight.causeAndEffect = clean.split(':')[1]?.trim() || '';
      } else if (clean.toLowerCase().startsWith('what if:') || clean.toLowerCase().startsWith('bagaimana jika:')) {
        insight.whatIf = clean.split(':')[1]?.trim() || '';
      } else if (!insight.summary) {
        insight.summary = clean;
      }
      continue;
    }
  }

  // Generate fallback visual elements if none specified
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'simulasi-baru';

  // If no calculations were parsed, provide simple defaults based on first parameter
  if (Object.keys(calculations).length === 0) {
    const firstParam = Object.keys(parameters)[0] || 'val';
    calculations['output'] = {
      key: 'output',
      label: 'Hasil Respons',
      formula: firstParam,
    };
    if (results.length === 0) {
      results.push({
        key: 'output',
        label: 'Nilai Terkini',
        calculationKey: 'output',
        highlight: true,
      });
    }
  }

  // If no experiment was defined, create a default goal
  if (experiments.length === 0) {
    const targetKey = Object.keys(calculations)[0] || Object.keys(parameters)[0] || 'output';
    experiments.push({
      id: 'exp-1',
      title: 'Eksperimen Interaktif',
      objective: `Sesuaikan parameter untuk menemukan kondisi optimal pada ${title}.`,
      targetMetric: targetKey,
      targetValue: 10,
      tolerance: 1,
      successMessage: 'Target eksperimen berhasil dicapai!',
    });
  }

  return {
    id: `sim-${slug}`,
    slug,
    info: {
      title,
      description: description || `Simulasi interaktif untuk mempelajari konsep ${title}.`,
      discipline,
      topic,
      difficulty,
      estimatedTime,
      status: 'draft',
      version: 1,
    },
    parameters,
    calculations,
    visual: {
      viewBox: { width: 640, height: 360 },
      groundPlane: true,
      elements: [],
    },
    results,
    insight: {
      summary: insight.summary || `Simulasi ${title} merespon perubahan parameter secara deterministik.`,
      causeAndEffect: insight.causeAndEffect || 'Setiap perubahan variabel input mempengaruhi hasil perhitungan secara langsung.',
      whatIf: insight.whatIf || 'Eksplorasi batas ekstrem nilai untuk menguji stabilitas sistem.',
    },
    experiments,
  };
}

export function exportSimulatorToMarkdown(spec: UnifiedSimulatorSpec): string {
  const parts: string[] = [];

  parts.push(`# ${spec.info.title}`);
  parts.push(`Bidang: ${spec.info.discipline}`);
  parts.push(`Topik: ${spec.info.topic}`);
  parts.push(`Tingkat: ${spec.info.difficulty}`);
  parts.push(`Waktu: ${spec.info.estimatedTime || '10–15 menit'}`);
  parts.push(`Deskripsi: ${spec.info.description}`);
  parts.push('');

  parts.push('## Parameter');
  for (const [, p] of Object.entries(spec.parameters)) {
    const unitPart = p.unit ? ` ${p.unit}` : '';
    parts.push(`- ${p.key}: ${p.label} (${p.min} s.d. ${p.max}${unitPart}, default ${p.defaultVal})`);
  }
  parts.push('');

  parts.push('## Perhitungan');
  for (const [, c] of Object.entries(spec.calculations)) {
    parts.push(`- ${c.key} = ${c.formula}`);
  }
  parts.push('');

  parts.push('## Hasil');
  for (const r of spec.results) {
    const sym = r.symbol ? ` (${r.symbol})` : '';
    const unit = r.unit ? ` ${r.unit}` : '';
    parts.push(`- ${r.label}${sym}: ${r.calculationKey}${unit}`);
  }
  parts.push('');

  parts.push('## Eksperimen');
  for (const exp of spec.experiments) {
    const tol = exp.tolerance ? ` (toleransi ${exp.tolerance}${exp.unit ? ' ' + exp.unit : ''})` : '';
    parts.push(`- Target: ${exp.targetMetric} = ${exp.targetValue}${tol}`);
    if (exp.successMessage) {
      parts.push(`  Pesan: ${exp.successMessage}`);
    }
  }
  parts.push('');

  parts.push('## Insight');
  parts.push(`Ringkasan: ${spec.insight.summary}`);
  parts.push(`Sebab Akibat: ${spec.insight.causeAndEffect}`);
  if (spec.insight.whatIf) {
    parts.push(`What If: ${spec.insight.whatIf}`);
  }

  return parts.join('\n');
}
