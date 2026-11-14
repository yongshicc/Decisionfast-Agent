import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, FlaskConical, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from './language';
import { benchmarks, validation } from './data';
import { researchGroups, researchSummary } from './research-data';
import { PageHeader } from './layout';
import { BenchmarkBars, ModelLegend, SelectiveAutomation, SpotlightMetrics, validationDisclaimer } from './research-visuals';

export function Intelligence() {
  const { t, language } = useLanguage();
  const [presentation, setPresentation] = useState(false);
  const ownsFullscreen = useRef(false);
  const [groupId, setGroupId] = useState<(typeof researchGroups)[number]['id']>('quality');
  const group = researchGroups.find(item => item.id === groupId) ?? researchGroups[0];
  function changePresentation(open: boolean) {
    setPresentation(open);
    if (!open && ownsFullscreen.current) {
      ownsFullscreen.current = false;
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    }
  }
  function enterPresentation() {
    setPresentation(true);
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      void document.documentElement.requestFullscreen().then(() => { ownsFullscreen.current = true; }).catch(() => {});
    }
  }
  return <div className="research-page">
    <PageHeader eyebrow="EVIDENCE BEFORE AUTOMATION" title="Model Intelligence" description="The measured trade-offs behind fine-tuned Kev 0.8B." action={<Button variant="outline" className="research-presentation-button" onClick={enterPresentation}><Maximize2 size={16}/>{t('Presentation Mode')}</Button>}/>
    <section className="research-hero"><div className="research-hero-heading"><span className="technical"><FlaskConical size={14}/> {t('Benchmark spotlight')} / KEV 0.8B</span><h2>{t('Smaller Model. Measurable Progress.')}</h2><p>{t('Fine-tuning Kev 0.8B for offline automotive complaint classification.')}</p></div><SpotlightMetrics/></section>
    <section className="research-comparison">
      <div className="research-section-heading"><div><span className="technical">01 / {t('Recorded validation')}</span><h2>{t('Benchmark Comparison')}</h2></div><ModelLegend/></div>
      <div className="research-chart-toolbar"><div className="research-group-tabs" role="tablist" aria-label={t('Benchmark Comparison')}>{researchGroups.map(item => <Button key={item.id} variant="ghost" role="tab" id={`tab-${item.id}`} aria-selected={groupId === item.id} aria-controls="research-chart-panel" tabIndex={groupId === item.id ? 0 : -1} onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const index = researchGroups.findIndex(g => g.id === groupId);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
        const nextGroup = researchGroups[next];
        if (nextGroup) { setGroupId(nextGroup.id); document.getElementById(`tab-${nextGroup.id}`)?.focus(); }
      }} onClick={() => setGroupId(item.id)}>{t(item.title)}</Button>)}</div><span>{t(group.note)}</span></div>
      <div role="tabpanel" id="research-chart-panel" aria-labelledby={`tab-${group.id}`} tabIndex={0}><div className="research-chart-scale"><span>{group.id === 'latency' ? '0 ms' : '0.0'}</span><span>{group.id === 'latency' ? '700 ms' : '1.0'}</span></div><BenchmarkBars key={group.id} metrics={group.metrics} max={group.max}/></div>
    </section>
    <section className="research-results"><div className="research-table-title"><h3>{t('Complete benchmark results')}</h3><span>10 {t('VALIDATION METRIC').toLowerCase()}</span></div><div className="benchmark-table"><table><thead><tr><th>{t('VALIDATION METRIC')}</th><th>{t('ORIGINAL KEV')}</th><th>{t('FINE-TUNED KEV')}</th><th>{t('CHANGE')}</th></tr></thead><tbody>{benchmarks.map(metric => {
      const delta = metric.tuned - metric.original;
      const improved = metric.higher ? delta > 0 : delta < 0;
      const digits = metric.unit ? 1 : 4;
      return <tr key={metric.name}><td>{t(metric.name)}<small>{t(metric.higher ? 'Higher is better' : 'Lower is better')}</small></td><td className="mono">{metric.original.toFixed(digits)}{metric.unit && ' ms'}</td><td className="mono tuned-value">{metric.tuned.toFixed(digits)}{metric.unit && ' ms'}</td><td className={improved ? 'positive' : 'warning-text'}>{delta > 0 ? '+' : '−'}{Math.abs(delta).toFixed(digits)}{metric.unit && ' ms'}</td></tr>;
    })}</tbody></table></div></section>
    <SelectiveAutomation/>
    <section className="research-context"><div className="research-section-heading"><div><span className="technical">03 / {t('EVIDENCE BEFORE AUTOMATION')}</span><h2>{t('Experimental Context')}</h2></div><FlaskConical size={22}/></div><dl>{[
      [t('Model'), t('Kev 0.8B · braking-related complaint classification')],
      [t('Dataset'), t('NHTSA vehicle complaints')],
      [t('Benchmark'), `1,000 ${t('validation cases')} · ${validation.positives} ${t('positive cases')}`],
      [t('Inference'), t('MLX on Apple Silicon')],
      [t('Fine-tuning'), t('Kaggle experiment')],
    ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="research-validation-disclaimer"><FlaskConical size={17}/>{t(validationDisclaimer)}</p></section>
    <Dialog.Root open={presentation} onOpenChange={changePresentation}><Dialog.Portal><Dialog.Overlay className="research-presentation-overlay"/><Dialog.Content className="research-presentation" lang={language === 'zh' ? 'zh-CN' : language} aria-describedby="presentation-disclaimer"><header className="presentation-header"><span className="presentation-brand">DECIDEFAST <ArrowUpRight size={24}/></span><span>{t('Recorded validation')} / KEV 0.8B</span><Button variant="outline" onClick={() => changePresentation(false)}><X size={18}/>{t('Exit Presentation')}</Button></header><div className="presentation-title"><span className="technical">{t('Model Intelligence')}</span><Dialog.Title>{t('Smaller Model. Measurable Progress.')}</Dialog.Title><p>{t('Fine-tuning Kev 0.8B for offline automotive complaint classification.')}</p></div><SpotlightMetrics/><div className="presentation-evidence"><section className="presentation-f1"><div className="research-section-heading"><h2>{t('F1 Improvement')}</h2><ModelLegend/></div><BenchmarkBars metrics={[researchSummary.f1]} max={1}/></section><SelectiveAutomation compact/></div><Dialog.Description id="presentation-disclaimer" className="research-validation-disclaimer"><FlaskConical size={17}/>{t(validationDisclaimer)}</Dialog.Description></Dialog.Content></Dialog.Portal></Dialog.Root>
  </div>;
}
