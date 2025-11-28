import{_ as d,r as s,T as f}from"./index-V-x1CcZ_.js";let i=null;const g={apiKey:"AIzaSyBIh7DjPUYn8myMy5w6xsE7JugQJkF3AJE",authDomain:"chamcongkama.firebaseapp.com",databaseURL:"https://chamcongkama-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"chamcongkama",storageBucket:"chamcongkama.firebasestorage.app",messagingSenderId:"559157471261",appId:"1:559157471261:web:c35e4d776bab5a16cdbef4",measurementId:"G-CDKMV99F6X"};async function x(){if(i)return i;const{initializeApp:e}=await d(async()=>{const{initializeApp:c}=await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");return{initializeApp:c}},[]),t=await d(()=>import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"),[]),{getDatabase:a}=t,r=e(g),o={database:a(r),...t};return i=o,o}/**
 * @license lucide-react v0.552.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),C=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,a,r)=>r?r.toUpperCase():a.toLowerCase()),p=e=>{const t=C(e);return t.charAt(0).toUpperCase()+t.slice(1)},m=(...e)=>e.filter((t,a,r)=>!!t&&t.trim()!==""&&r.indexOf(t)===a).join(" ").trim(),_=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
 * @license lucide-react v0.552.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var k={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.552.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=s.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:a=2,absoluteStrokeWidth:r,className:n="",children:o,iconNode:c,...u},l)=>s.createElement("svg",{ref:l,...k,width:t,height:t,stroke:e,strokeWidth:r?Number(a)*24/Number(t):a,className:m("lucide",n),...!o&&!_(u)&&{"aria-hidden":"true"},...u},[...c.map(([b,h])=>s.createElement(b,h)),...Array.isArray(o)?o:[o]]));/**
 * @license lucide-react v0.552.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=(e,t)=>{const a=s.forwardRef(({className:r,...n},o)=>s.createElement(y,{ref:o,iconNode:t,className:m(`lucide-${w(p(e))}`,`lucide-${e}`,r),...n}));return a.displayName=p(e),a};/**
 * @license lucide-react v0.552.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],I=A("user",E);function D(){const e=s.useContext(f);if(!e)throw new Error("useToast must be used within ToastProvider");return e}export{I as U,A as c,x as g,D as u};
