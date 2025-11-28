import{u as i,a as c,j as e}from"./index-V-x1CcZ_.js";import{c as o,U as d}from"./useToast-C0bm4l8s.js";/**
 * @license lucide-react v0.552.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=[["path",{d:"M12 6v6l4 2",key:"mmk7yg"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],h=o("clock",p);/**
 * @license lucide-react v0.552.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]],m=o("house",x);function v(){const s=i(),n=c(),r=[{path:"/",icon:m,label:"Check-in"},{path:"/ot-registration",icon:h,label:"OT"},{path:"/employee-profile",icon:d,label:"Profile"}];return e.jsx("div",{className:"fixed bottom-0 left-0 right-0 z-50 pb-safe",children:e.jsx("div",{className:"mx-auto max-w-md px-4 pb-4",children:e.jsxs("nav",{className:"relative backdrop-blur-xl bg-white/70 border border-white/20 rounded-[2rem] shadow-2xl overflow-hidden",children:[e.jsx("div",{className:"absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 pointer-events-none"}),e.jsx("div",{className:"relative flex justify-around items-center px-6 py-3",children:r.map(t=>{const l=t.icon,a=n.pathname===t.path;return e.jsxs("button",{onClick:()=>s(t.path),className:`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${a?"bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110":"text-gray-600 hover:bg-white/50"}`,children:[e.jsx(l,{size:24,strokeWidth:a?2.5:2}),e.jsx("span",{className:`text-xs font-medium ${a?"font-bold":""}`,children:t.label})]},t.path)})})]})})})}export{v as B,h as C};
