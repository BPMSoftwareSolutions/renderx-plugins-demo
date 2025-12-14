const {generateMetricsBox} = require('./generate-ascii-metrics.cjs');

const result = generateMetricsBox({
  title: 'CONSISTENT WIDTH TEST',
  metrics: { 'A': '1', 'B': '2', 'C': '3' },
  width: 100
});

const lines = result.split('\n');
console.log('Width analysis:');
lines.forEach((line, i) => {
  console.log(`Line ${i}: length=${line.length}`);
});
console.log('\nActual output:');
console.log(result);
