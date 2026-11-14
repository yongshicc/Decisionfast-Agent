import type { CSSProperties } from 'react';
import { ArrowDownRight, ArrowUpRight, GitBranch, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { benchmarks, validation } from './data';
import { researchSummary } from './research-data';
import { useLanguage } from './language';

export const validationDisclaimer = 'These are validation results from the same 1,000 records, not an independent final holdout. Performance does not establish production safety.';
type Benchmark = (typeof benchmarks)[number];

export function SpotlightMetrics() {
  const { t } = useLanguage();
  return <div className="research-spotlights">
    <article className="research-spotlight"><div className="spotlight-label">{t('F1 Improvement')}<ArrowUpRight size={20}/></div><strong>+{researchSummary.f1Relative}<span>%</span></strong><p>{t('relative improvement')}</p><div className="spotlight-baseline">{t('Original')}: {researchSummary.f1.original.toFixed(4)} <ArrowUpRight size={15}/> {t('Fine-tuned')}: {researchSummary.f1.tuned.toFixed(4)}</div></article>
    <article className="research-spotlight"><div className="spotlight-label">{t('Automated Coverage')}<GitBranch size={20}/></div><strong>{validation.coverage}<span>%</span></strong><p>{researchSummary.automatedCases} {t('of')} 1,000 {t('validation cases automatically routed')}</p><div className="spotlight-baseline">{validation.review}% · {t('Human Review')}</div></article>
    <article className="research-spotlight recall-spotlight"><div className="spotlight-label">{t('Recall Trade-off')}<ArrowDownRight size={20}/></div><strong>−{Math.abs(Number(researchSummary.recallPoints)).toFixed(2)}<span>pp</span></strong><p>{t('percentage points')} · {t('Recall decreased after fine-tuning.')}</p><div className="spotlight-baseline">{t('Original')}: {researchSummary.recall.original.toFixed(4)} <ArrowDownRight size={15}/> {t('Fine-tuned')}: {researchSummary.recall.tuned.toFixed(4)}</div></article>
  </div>;
}

export function ModelLegend() {
  const { t } = useLanguage();
  return <div className="research-legend"><span><i/>{t('Original Kev')}</span><span><i/>{t('Fine-tuned Kev')}</span></div>;
}

export function BenchmarkBars({ metrics, max }: { metrics: readonly Benchmark[]; max: number }) {
  const { t } = useLanguage();
  return <TooltipProvider delayDuration={150}><div className="research-bars">{metrics.map(metric => <div className="research-bar-row" key={metric.name}>
    <div className="research-bar-label">{t(metric.name)}</div>
    <div className="research-bar-pair">{(['original', 'tuned'] as const).map(model => {
      const label = `${t(model === 'original' ? 'Original Kev' : 'Fine-tuned Kev')} · ${t(metric.name)}: ${metric[model].toFixed(metric.unit ? 1 : 4)}${metric.unit ? ' ms' : ''}`;
      return <Tooltip key={model}><TooltipTrigger asChild><Button variant="ghost" className={`research-bar-button ${model}`} aria-label={label}>
        <span className="research-bar-track"><span className="research-bar-fill" style={{ '--bar-size': `${metric[model] / max * 100}%` } as CSSProperties}/></span>
        <span className="research-bar-number">{metric[model].toFixed(metric.unit ? 1 : 4)}{metric.unit && <small> ms</small>}</span>
      </Button></TooltipTrigger><TooltipContent className="research-tooltip"><p>{label}</p><p>{t(metric.higher ? 'Higher is better' : 'Lower is better')}</p></TooltipContent></Tooltip>;
    })}</div>
  </div>)}</div></TooltipProvider>;
}

export function SelectiveAutomation({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  return <section className={`research-automation ${compact ? 'compact' : ''}`}>
    <div className="research-section-heading"><div><span className="technical">02 / {t('HUMAN OVERSIGHT')}</span><h2>{t('Selective automation')}</h2></div><span className="research-human-note"><UserRound size={18}/>{t('Uncertain cases remain with people.')}</span></div>
    <div className="research-thresholds"><span>{t('Confidence thresholds')}</span><strong>AUTO_NO ≤ {validation.autoNoMax.toFixed(2)}</strong><strong>AUTO_YES ≥ {validation.autoYesMin.toFixed(2)}</strong></div>
    <div className="research-coverage" role="img" aria-label={`${validation.coverage}% ${t('Automated Routing')}, ${researchSummary.automatedCases} ${t('cases')}; ${validation.review}% ${t('Human Review')}, ${researchSummary.reviewCases} ${t('cases')}`}>
      <div className="coverage-automatic" style={{ '--segment-size': `${validation.coverage}%` } as CSSProperties}><GitBranch size={18}/><strong>{validation.coverage}%</strong></div>
      <div className="coverage-human" style={{ '--segment-size': `${validation.review}%` } as CSSProperties}><UserRound size={18}/><strong>{validation.review}%</strong></div>
    </div>
    <div className="research-coverage-labels"><span>{t('Automated Routing')}<small>{researchSummary.automatedCases} {t('cases')}</small></span><span>{t('Human Review')}<small>{researchSummary.reviewCases} {t('cases')}</small></span></div>
    <div className="research-error-evidence"><div><strong>≈ {validation.error}%</strong><span>{t('Observed auto-routing error')}</span></div><div><strong>{researchSummary.errors} / {researchSummary.automatedCases}</strong><span>{researchSummary.errors} {t('errors among')} {researchSummary.automatedCases} {t('automatically routed cases')}</span></div><div><strong>{validation.falseNegatives} <span>/</span> {validation.falsePositives}</strong><span>{validation.falseNegatives} {t('AUTO_NO false negatives')}<br/>{validation.falsePositives} {t('AUTO_YES false positives')}</span></div></div>
  </section>;
}
