import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../main.js', import.meta.url), 'utf8');
function boot(search = '', cached) {
  const elements = Object.fromEntries(['skiDate','countdownContainer','countdown','shareBtn','shareMessage'].map(id => [id, { value:'', textContent:'', disabled:true, listeners:{}, classList:{ add(){}, remove(){} }, addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); } }]));
  const storage = new Map(cached ? [['skiDate', cached]] : []);
  const url = new URL(`https://skaljegpaski.dk/${search}`);
  const context = vm.createContext({ URL, URLSearchParams, Date, Math, String, navigator:{}, setInterval:()=>1, clearInterval(){}, setTimeout:()=>1, clearTimeout(){}, document:{ getElementById:id=>elements[id] }, localStorage:{getItem:key=>storage.get(key) ?? null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)}, window:{location:url,history:{replaceState(_state,_title,value){url.href=value;}}} });
  vm.runInContext(source, context);
  return { elements, storage, url, context };
}
test('existing date URL, local persistence, clearing and minute rounding stay intact', () => {
  const app = boot('?date=2027-02-01');
  assert.equal(app.elements.skiDate.value, '2027-02-01T17:00');
  assert.equal(app.storage.get('skiDate'), '2027-02-01T17:00');
  assert.equal(app.elements.shareBtn.disabled, false);
  const cached = boot('', '2027-02-02T09:30');
  assert.equal(cached.url.searchParams.get('date'), '2027-02-02T09:30');
  cached.elements.skiDate.value = '';
  cached.elements.skiDate.listeners.change.forEach(fn=>fn({target:cached.elements.skiDate}));
  assert.equal(cached.storage.has('skiDate'), false);
  assert.equal(cached.url.searchParams.has('date'), false);
  assert.equal(cached.elements.shareBtn.disabled, true);
  assert.match(vm.runInContext('formatTimeDifference(19660000)', app.context), /28/);
});
