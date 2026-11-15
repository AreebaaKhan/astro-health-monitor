/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS verification script. */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), ts = require('typescript');
const cache = new Map();
function load(name) {
 const file = path.resolve(__dirname, '..', 'lib', `${name}.ts`);
 if (cache.has(file)) return cache.get(file);
 const loaded = {exports:{}};
 const code = ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 new Function('exports','require','module',code)(loaded.exports,id=>load(id.replace('./','')),loaded);
 cache.set(file,loaded.exports); return loaded.exports;
}
const h=load('health'), c=load('checkin'), v=load('validation');
let history=c.saveEntry([],c.EMPTY_VALUES,'2026-11-15');
history=c.saveEntry(history,{...c.EMPTY_VALUES,bp:150},'2026-11-15');
assert.equal(history.length,1); assert.equal(history[0].bp,150);
assert.equal(h.statusAt(history,h.analyze(history).z,'bp',0).status,'alert');
history=c.saveEntry(history,c.EMPTY_VALUES,'2026-11-16'); assert.equal(history[1].day,2);
assert.deepEqual(c.parseHistory(JSON.stringify(history)),history);
assert.throws(()=>c.saveEntry(history,{...c.EMPTY_VALUES,hr:NaN},'2026-11-17'));
assert.throws(()=>c.saveEntry(history,{...c.EMPTY_VALUES,sleep:25},'2026-11-17'));
assert.throws(()=>c.parseHistory('{"not":"history"}'));
const mission=h.simulate(), a=h.analyze(mission), b=v.benchmark();
assert.equal(h.validate(mission,a.z).summary.meanEarlier,8.2);
assert.equal(b.mean.toFixed(1),'4.7'); assert.equal(b.baselineRate.toFixed(1),'4.2');
assert.equal(b.baselineCaught,240); assert.equal(b.fixedCaught,200);
const p=h.analyze(mission.slice(0,30));
for(const k of h.KEYS) assert.equal(p.z[k][29],a.z[k][29]);
console.log('Passed: check-in validation, same-day updates, history format, calibration alerts, causal baseline and benchmark.');
console.log(JSON.stringify(b,null,2));
