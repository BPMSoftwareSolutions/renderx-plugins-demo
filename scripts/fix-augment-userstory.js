import fs from 'fs/promises';
import path from 'path';

const file = path.resolve('packages/canvas-component/json-sequences/canvas-component/augment.json');
const backup = `${file}.bak-${Date.now()}`;

async function run(){
  try{
    const raw = await fs.readFile(file,'utf8');
    await fs.copyFile(file, backup);
    const json = JSON.parse(raw);
    const persona = 'Design Systems Engineer';

    function ensureStructured(us){
      if(!us) return { persona };
      if(typeof us === 'string') return { persona, goal: us };
      // if already object, ensure persona present and split long goal if includes leading 'As a'
      const out = { ...us };
      if(!out.persona) out.persona = persona;
      return out;
    }

    // top-level
    json.userStory = ensureStructured(json.userStory);

    // movements
    if(Array.isArray(json.movements)){
      for(const mv of json.movements){
        mv.userStory = ensureStructured(mv.userStory);
        if(Array.isArray(mv.beats)){
          for(const beat of mv.beats){
            beat.userStory = ensureStructured(beat.userStory);
          }
        }
      }
    }

    const out = JSON.stringify(json, null, 2) + '\n';
    await fs.writeFile(file, out, 'utf8');
    console.log('updated', file);
    console.log('backup saved to', backup);
  }catch(err){
    console.error('failed', err);
    process.exit(1);
  }
}

run();
