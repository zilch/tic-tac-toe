"use strict";var GameEngineComponent=(()=>{var o=Object.defineProperty;var s=Object.getOwnPropertyDescriptor;var m=Object.getOwnPropertyNames;var p=Object.prototype.hasOwnProperty;var u=(e,t)=>{for(var n in t)o(e,n,{get:t[n],enumerable:!0})},f=(e,t,n,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of m(t))!p.call(e,r)&&r!==n&&o(e,r,{get:()=>t[r],enumerable:!(i=s(t,r))||i.enumerable});return e};var y=e=>f(o({},"__esModule",{value:!0}),e);var d={};u(d,{configPresets:()=>c,configSchema:()=>g,parseConfig:()=>l,serializeConfig:()=>h,summarizeConfig:()=>x});var g={type:"object",required:["startingPosition"],properties:{startingPosition:{description:"The best description that ever there was.",type:"array",minItems:3,maxItems:3,items:{type:"array",minItems:3,maxItems:3,items:{type:["string"],enum:["x","o","empty"]}}}}},c=[{name:"Standard",value:`{
  // 3x3 matrix with values "x", "o" and "empty"
  "startingPosition": [
    ["empty", "empty", "empty"],
    ["empty", "empty", "empty"],
    ["empty", "empty", "empty"]
  ]
}
`}];function l(e){let t=0,n=0,i=e.startingPosition.map(r=>r.map(a=>a==="x"?t++*2:a==="o"?n++*2+1:null));if(t-n!==0&&t-n!==1)throw new Error("There should be an even number of Xs and Os (or just one more X than O) in the starting position.");return{initialBoard:i,initialTurn:n+t}}function h(e){return e.initialBoard.map(n=>n.map(i=>i===null?"empty":i%2===0?"x":"o")).map(n=>n.join(",")).join("|")}function x(e){return e.initialTurn===0?"standard starting position":"custom starting position"}return y(d);})();
