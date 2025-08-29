const { Omniscript } = require('./dist/index.js');

const omni = new Omniscript();

console.log('Testing simple typeof:');
(async () => {
  try {
    const result1 = await omni.execute(`typeof "hello"`);
    console.log('typeof "hello":', result1);
    
    const result2 = await omni.execute(`let f = () => 5; typeof f`);
    console.log('typeof function:', result2);
    
    const result3 = await omni.execute(`let obj = { prop: 42 }; typeof obj.prop`);
    console.log('typeof obj.prop:', result3);

    const result4 = await omni.execute(`let Database = { save: () => {} }; typeof Database.save`);
    console.log('typeof Database.save:', result4);
    
  } catch (e) {
    console.error('Error:', e.message);
  }
})();