import { describe, expect, it } from 'vitest';
import { researchGroups, researchSummary } from './research-data';

describe('Recorded research evidence', () => {
  it('reports 20.0% relative F1 improvement from 0.5101 to 0.6119', () => {
    expect(researchSummary.f1Relative).toBe('20.0');
    expect([researchSummary.f1.original, researchSummary.f1.tuned]).toEqual([0.5101, 0.6119]);
  });
  it('reports the recall decline as -6.13 percentage points', () => {
    expect(researchSummary.recallPoints).toBe('-6.13');
    expect([researchSummary.recall.original, researchSummary.recall.tuned]).toEqual([0.8980, 0.8367]);
  });
  it('counts 744 automated cases and 256 human reviews', () => {
    expect(researchSummary.automatedCases).toBe(744);
    expect(researchSummary.reviewCases).toBe(256);
  });
  it('counts ten errors among the automatically routed cases', () => {
    expect(researchSummary.errors).toBe(10);
    expect(Number((researchSummary.errors / researchSummary.automatedCases * 100).toFixed(2))).toBe(1.34);
  });
  it('keeps all ten metrics and separates milliseconds from 0–1 scores', () => {
    expect(researchGroups.map(group => group.metrics.length)).toEqual([6, 2, 2]);
    expect(researchGroups.map(group => group.max)).toEqual([1, 1, 700]);
    expect(researchGroups[2].metrics.map(metric => metric.unit)).toEqual(['ms', 'ms']);
    expect(researchGroups[1].metrics.map(metric => metric.higher)).toEqual([false, false]);
  });
});