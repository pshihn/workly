!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t=t||self).workly={})}(this,function(t){"use strict";function e(t,r){return r=r||[],new Proxy(function(){},{get(a,n,s){if("then"===n){if(0===r.length)return{then:()=>s};const e=t.remote({type:"GET",path:r});return e.then.bind(e)}return e(t,r.concat(n))},set:(e,a,n)=>t.remote({type:"SET",path:r.concat(a),value:n}),apply:(e,a,n)=>t.remote({type:"APPLY",path:r,args:n}),construct:(e,r)=>t.remote({type:"CONSTRUCT",args:r})})}class r{constructor(t,n){this.w=t,this.uid=n||`${Date.now()}-${a()}`,this.c=0,this.cbs={},t.addEventListener("message",a=>{if(this.w.oURL)try{URL.revokeObjectURL(this.w.oURL)}catch(t){}finally{delete this.w.oURL}let n=a.data&&a.data.id,s=n&&this.cbs[n];s&&(delete this.cbs[n],a.data.error?s[1](new Error(a.data.error)):s[0](a.data.targetId?e(new r(t,a.data.targetId)):a.data.value))})}remote(t){const e=t.args||[],r=`${this.uid}-${++this.c}`;return new Promise((a,n)=>{this.cbs[r]=[a,n],this.w.postMessage(Object.assign({},t,{id:r,args:e,target:this.uid}))})}}function a(){return Math.floor(Math.random()*Number.MAX_SAFE_INTEGER)}function n(t){const e=t,r={};self.addEventListener("message",async t=>{let n=t.data||{};n.path=n.path||[];let s=n.target&&r[n.target]||e;const o=t=>t.reduce((t,e)=>t?t[e]:t,s),i=n&&n.id;if(i&&n.type){const t={id:i},e=o(n.path),s=o(n.path.slice(0,-1));switch(n.type){case"GET":t.value=e;break;case"SET":let o=n.path.length&&n.path[n.path.length-1];o&&(s[o]=n.value),t.value=!!o;break;case"APPLY":try{t.value=await e.apply(s,n.args||[])}catch(e){t.error=e.toString()}break;case"CONSTRUCT":try{t.value=new e(...n.args),t.targetId=(t=>{const e=`${Date.now()}-${a()}`;return r[e]=t,e})(t.value)}catch(e){t.error=e.toString()}}self.postMessage(t)}})}t.proxy=function(t){let s,o;if("function"==typeof t){const e=Function.prototype.toString;s=o=URL.createObjectURL(new Blob([`${e.call(a)}\n(${e.call(n)})(${e.call(t)})`]))}else"string"==typeof t&&(s=t,0===t.indexOf("blob:")&&(o=s));if(s){let t=new Worker(s);return o&&(t.oURL=o),e(new r(t))}throw"Workly only supports functions, classes, urls"},t.expose=n,Object.defineProperty(t,"__esModule",{value:!0})});
