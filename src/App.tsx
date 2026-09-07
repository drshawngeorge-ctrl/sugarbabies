import React, { useState } from 'react';
import { InfantFormState, initialFormState, toInfantInput } from './lib/form';
import { estimatePercentile } from './lib/percentiles';
import { detectRisks, computeSurveillanceDuration } from './lib/risk';
import { generateBriefNote, generateFullAssessment } from './utils/notes';
import './index.css';

export default function App() {
  const [input, setInput] = useState<InfantFormState>(initialFormState);

  const handle = <K extends keyof InfantFormState>(k: K, v: InfantFormState[K]) =>
    setInput(prev => ({ ...prev, [k]: v }));

  const infant = toInfantInput(input);

  const { pct: percentile, outOfRange, message: rangeMessage, classification: growth } = infant
    ? estimatePercentile(infant.birthweight, infant.gaWeeks, infant.gaDays, infant.sex)
    : { pct: null as number | null, outOfRange: false, message: undefined as string | undefined, classification: 'AGA' as const };
  const factors = infant ? detectRisks(infant, growth) : [];
  const duration = computeSurveillanceDuration(factors);

  const brief = infant ? generateBriefNote(infant, percentile, growth, duration, outOfRange, rangeMessage) : '';
  const full = infant ? generateFullAssessment(infant, percentile, growth, duration, factors, outOfRange, rangeMessage) : '';

  const excluded =
    input.symptomatic || input.persistent || input.nicu || input.metabolic;

  return (
    <div className="app-wrap">
      <header className="header">
        <div className="wrap">
          <span className="eyebrow">Bedside tool · Transitional period (0–72h)</span>
          <h1>Neonatal Glucose Surveillance</h1>
          <div className="subtitle">Estimated birthweight percentile derived from interpolation of Canadian Birth Weight for Gestational Age reference centiles. Not a substitute for clinical judgement.</div>
        </div>
      </header>

      <main className="wrap">
        <div className="card">
          <h2><span className="step">1</span>Clinical status</h2>
          <label className="check"><input type="checkbox" checked={input.symptomatic} onChange={e => handle('symptomatic', e.target.checked)} /> Infant is symptomatic</label>
          <label className="check"><input type="checkbox" checked={input.persistent} onChange={e => handle('persistent', e.target.checked)} /> Hypoglycemia persisting beyond 72 hours</label>
          <label className="check"><input type="checkbox" checked={input.nicu} onChange={e => handle('nicu', e.target.checked)} /> NICU / requires individualized management</label>
          <label className="check"><input type="checkbox" checked={input.metabolic} onChange={e => handle('metabolic', e.target.checked)} /> Known or suspected metabolic/endocrine disease</label>
        </div>

        {excluded ? (
          <div className="exclusion">
            <div className="tag">Outside tool scope</div>
            <p>This tool is intended for asymptomatic transitional hypoglycemia only. Follow institutional protocols for symptomatic or persistent hypoglycemia.</p>
          </div>
        ) : (
          <>
            <div className="card">
              <h2><span className="step">2</span>Infant</h2>
              <div className="row3">
                <div className="field">
                  <label>GA (weeks)</label>
                  <input type="number" min={22} max={43} value={input.gaWeeks} onChange={e => handle('gaWeeks', e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div className="field">
                  <label>GA (+days)</label>
                  <input type="number" min={0} max={6} value={input.gaDays} onChange={e => handle('gaDays', e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div className="field">
                  <label>Sex</label>
                  <select value={input.sex} onChange={e => handle('sex', e.target.value as any)}>
                    <option value="" disabled>Select…</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Birthweight (g)</label>
                <input type="number" min={200} max={6000} value={input.birthweight} onChange={e => handle('birthweight', e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
            </div>

            <div className="card">
              <h2><span className="step">3</span>Maternal</h2>
              <div className="field">
                <label>Diabetes</label>
                <select value={input.diabetes} onChange={e => handle('diabetes', e.target.value as any)}>
                  <option value="none">None</option>
                  <option value="gdm">Gestational (GDM)</option>
                  <option value="type1">Type 1</option>
                  <option value="type2">Type 2</option>
                </select>
              </div>
              <label className="check"><input type="checkbox" checked={input.maternalBetaBlocker} onChange={e => handle('maternalBetaBlocker', e.target.checked)} /> Labetalol / other beta-blocker exposure</label>
            </div>

            <div className="card">
              <h2><span className="step">4</span>Additional risk factors</h2>
              <label className="check"><input type="checkbox" checked={input.iugr} onChange={e => handle('iugr', e.target.checked)} /> Intrauterine growth restriction (IUGR)</label>
              <label className="check"><input type="checkbox" checked={input.perinatalAsphyxia} onChange={e => handle('perinatalAsphyxia', e.target.checked)} /> Perinatal asphyxia / abnormal cord gases</label>
              <label className="check"><input type="checkbox" checked={input.antenatalSteroids} onChange={e => handle('antenatalSteroids', e.target.checked)} /> Antenatal corticosteroid exposure</label>
            </div>

            <div className={`result-card ${!infant ? 'none' : factors.length ? 'indicated' : 'none'}`}>
              {!infant ? (
                <>
                  <div className="result-headline none">Enter infant details</div>
                  <div className="growth-summary">Enter gestational age and birthweight above to see the surveillance recommendation.</div>
                </>
              ) : factors.length === 0 ? (
                <>
                  <div className="result-headline none">No screening recommended</div>
                  <div className="growth-summary"><b>{input.gaWeeks}+{input.gaDays} weeks</b> · {input.sex} · {input.birthweight} g · {outOfRange ? <><b>{growth}</b> ({rangeMessage})</> : <><b>{(percentile as number).toFixed(1)}th percentile</b> ({growth})</>}</div>
                </>
              ) : (
                <>
                  <div className="result-headline indicated">Glucose surveillance indicated</div>
                  <div className="growth-summary"><b>{input.gaWeeks}+{input.gaDays} weeks</b> · {input.sex} · {input.birthweight} g · {outOfRange ? <><b>{growth}</b> ({rangeMessage})</> : <><b>{(percentile as number).toFixed(1)}th percentile</b> ({growth})</>}</div>
                  <div className="factor-list">
                    {factors.map(f => <span key={f.key} className={`factor-pill ${f.assumption ? 'assumption' : ''}`}>{f.label}</span>)}
                  </div>
                  <div className="timeline-wrap">
                    <div className="timeline-label">First check 2h · then every 3–6h · continue to {duration}h</div>
                    <div className="timeline-track">
                      <div className="timeline-fill" style={{ width: '100%' }} />
                      <div className="timeline-ticks">
                        {/* ticks rendered with CSS in this implementation */}
                        {Array.from([0, 2, duration]).map((t, i) => <div key={i} className="tick" style={{ left: `${(t / (duration||1)) * 100}%` }} />)}
                      </div>
                    </div>
                  </div>
                  <div className="stop-note">Stop when: minimum duration reached, feeding established, and all readings ≥2.6 mmol/L. If more than one reading &lt;2.6 mmol/L in the first 24h, consider 1–2 additional glucose checks and clinical review.</div>

                  <div style={{ marginTop: 12 }}>
                    <button onClick={() => navigator.clipboard.writeText(brief)}>Copy Brief Note</button>
                    <button style={{ marginLeft: 8 }} onClick={() => navigator.clipboard.writeText(full)}>Copy Full Assessment</button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="footer">CLS · no data leaves this device · not for symptomatic or persistent hypoglycemia</footer>
    </div>
  );
}
