import assert from 'node:assert/strict';
import {readFileSync,statSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname ?? dirname(new URL(import.meta.url).pathname),'..');
const readme=readFileSync(resolve(root,'README.md'),'utf8');
for(const match of readme.matchAll(/\]\(([^)]+)\)/g)){
 const target=match[1];if(/^(https?:|#)/.test(target))continue;
 assert(statSync(resolve(root,target.split('#')[0])).size>0,`Missing or empty README target: ${target}`);
}
const manifest=JSON.parse(readFileSync(resolve(root,'assets/media/manifest.json')));
assert(manifest.video.durationSeconds>=60 && manifest.video.durationSeconds<=90);
assert.equal(manifest.assets.filter(a=>/^0[1-5]-/.test(a.file)).length,5);
for(const asset of manifest.assets){
 const bytes=readFileSync(resolve(root,'assets/media',asset.file));
 assert.equal(bytes.length,asset.bytes,asset.file+' size');
 assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.file+' hash');
 if(asset.file.endsWith('.png'))assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 else assert.equal(bytes.subarray(0,4).toString('hex'),'1a45dfa3');
 assert(readme.includes('assets/media/'+asset.file),asset.file+' not referenced');
}
const intro=readme.split('## Follow the decision')[0];
for(const term of ['direct-to-consumer','₹1,00,000','₹32,000','₹16,000','₹52,000','geography','synthetic','live demo','What the engine changes'])assert(intro.includes(term),`Missing introductory story element: ${term}`);
function inspect(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){if(entry.name==='.git')continue;const path=resolve(dir,entry.name);if(entry.isDirectory())inspect(path);else if(/\.(md|html|css|js|json)$/.test(path)){const text=readFileSync(path,'utf8');assert(!/PB-00\d|portfolio|PM judgment|Gate [123]|P-0[1-8]/i.test(text),`Internal language: ${path}`);}}}
inspect(root);
console.log('Packaging QA: PASS — README targets, five screenshots, cover, video bounds, file signatures, SHA-256 manifest, introductory story elements and standalone language. Human comprehension and video playback require the documented visual review.');
