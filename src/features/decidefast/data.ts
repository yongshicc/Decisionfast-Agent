export const benchmarks = [
  { name: 'Accuracy', original: .8310, tuned: .8960, higher: true },
  { name: 'Precision', original: .3563, tuned: .4824, higher: true },
  { name: 'Recall', original: .8980, tuned: .8367, higher: true },
  { name: 'F1 score', original: .5101, tuned: .6119, higher: true },
  { name: 'Average precision', original: .5006, tuned: .6521, higher: true },
  { name: 'ROC-AUC', original: .9164, tuned: .9318, higher: true },
  { name: 'Brier score', original: .1566, tuned: .0879, higher: false },
  { name: 'Calibration · ECE', original: .2977, tuned: .0905, higher: false },
  { name: 'Server p50 latency', original: 206.1, tuned: 237.1, higher: false, unit: 'ms' },
  { name: 'Server p95 latency', original: 528.0, tuned: 601.3, higher: false, unit: 'ms' },
];
export const validation = { records: 1000, positives: 98, autoNoMax: .01, autoYesMin: .99, coverage: 74.4, review: 25.6, error: 1.34, falseNegatives: 7, falsePositives: 3 };
