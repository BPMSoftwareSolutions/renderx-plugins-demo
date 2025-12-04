const fs = require('fs');
const create = JSON.parse(fs.readFileSync('packages/canvas-component/json-sequences/canvas-component/create.json', 'utf8'));

let totalACs = 0;
create.movements.forEach(movement => {
  movement.beats.forEach(beat => {
    const acCount = beat.acceptanceCriteriaStructured?.length || 0;
    totalACs += acCount;
    console.log(`Beat ${beat.beat} (${beat.handler}): ${acCount} ACs`);
  });
});
console.log(`\nTotal ACs in create symphony: ${totalACs}`);
