import { benchmarks, validation } from './data';

const f1 = benchmarks.find(metric => metric.name === 'F1 score');
const recall = benchmarks.find(metric => metric.name === 'Recall');
if (!f1 || !recall) throw new Error('Recorded F1 and recall benchmarks are required.');

export const researchSummary = {
  f1,
  recall,
  f1Relative: ((f1.tuned - f1.original) / f1.original * 100).toFixed(1),
  recallPoints: ((recall.tuned - recall.original) * 100).toFixed(2),
  automatedCases: Math.round(validation.records * validation.coverage / 100),
  reviewCases: Math.round(validation.records * validation.review / 100),
  errors: validation.falseNegatives + validation.falsePositives,
};

export const researchGroups = [
  { id: 'quality', title: 'Classification quality', note: 'Higher is better', max: 1, metrics: benchmarks.slice(0, 6) },
  { id: 'calibration', title: 'Calibration', note: 'Lower Brier score and ECE are better.', max: 1, metrics: benchmarks.slice(6, 8) },
  { id: 'latency', title: 'Inference latency', note: 'Lower is better', max: 700, metrics: benchmarks.slice(8) },
] as const;