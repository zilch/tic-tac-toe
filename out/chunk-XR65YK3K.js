var Q=Object.create;var R=Object.defineProperty;var X=Object.getOwnPropertyDescriptor;var ee=Object.getOwnPropertyNames;var te=Object.getPrototypeOf,oe=Object.prototype.hasOwnProperty;var re=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports);var ne=(t,e,o,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of ee(e))!oe.call(t,n)&&n!==o&&R(t,n,{get:()=>e[n],enumerable:!(r=X(e,n))||r.enumerable});return t};var le=(t,e,o)=>(o=t!=null?Q(te(t)):{},ne(e||!t||!t.__esModule?R(o,"default",{value:t,enumerable:!0}):o,t));var F=re((Be,_)=>{"use strict";var A=Object.defineProperty,se=Object.getOwnPropertyDescriptor,ie=Object.getOwnPropertyNames,ae=Object.prototype.hasOwnProperty,ce=(t,e)=>{for(var o in e)A(t,o,{get:e[o],enumerable:!0})},ue=(t,e,o,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of ie(e))!ae.call(t,n)&&n!==o&&A(t,n,{get:()=>e[n],enumerable:!(r=se(e,n))||r.enumerable});return t},fe=t=>ue(A({},"__esModule",{value:!0}),t),P={};ce(P,{BotOutcome:()=>be});_.exports=fe(P);var be={Victory:"victory",Defeat:"defeat",Draw:"draw",Error:"error",None:"none"}});var a=le(F());var k=(t=0)=>e=>`\x1B[${e+t}m`,I=(t=0)=>e=>`\x1B[${38+t};5;${e}m`,$=(t=0)=>(e,o,r)=>`\x1B[${38+t};2;${e};${o};${r}m`,s={modifier:{reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],overline:[53,55],inverse:[7,27],hidden:[8,28],strikethrough:[9,29]},color:{black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],blackBright:[90,39],gray:[90,39],grey:[90,39],redBright:[91,39],greenBright:[92,39],yellowBright:[93,39],blueBright:[94,39],magentaBright:[95,39],cyanBright:[96,39],whiteBright:[97,39]},bgColor:{bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],bgBlackBright:[100,49],bgGray:[100,49],bgGrey:[100,49],bgRedBright:[101,49],bgGreenBright:[102,49],bgYellowBright:[103,49],bgBlueBright:[104,49],bgMagentaBright:[105,49],bgCyanBright:[106,49],bgWhiteBright:[107,49]}},D=Object.keys(s.modifier),w=Object.keys(s.color),M=Object.keys(s.bgColor),L=[...w,...M];function de(){let t=new Map;for(let[e,o]of Object.entries(s)){for(let[r,n]of Object.entries(o))s[r]={open:`\x1B[${n[0]}m`,close:`\x1B[${n[1]}m`},o[r]=s[r],t.set(n[0],n[1]);Object.defineProperty(s,e,{value:o,enumerable:!1})}return Object.defineProperty(s,"codes",{value:t,enumerable:!1}),s.color.close="\x1B[39m",s.bgColor.close="\x1B[49m",s.color.ansi=k(),s.color.ansi256=I(),s.color.ansi16m=$(),s.bgColor.ansi=k(10),s.bgColor.ansi256=I(10),s.bgColor.ansi16m=$(10),Object.defineProperties(s,{rgbToAnsi256:{value(e,o,r){return e===o&&o===r?e<8?16:e>248?231:Math.round((e-8)/247*24)+232:16+36*Math.round(e/255*5)+6*Math.round(o/255*5)+Math.round(r/255*5)},enumerable:!1},hexToRgb:{value(e){let o=/[a-f\d]{6}|[a-f\d]{3}/i.exec(e.toString(16));if(!o)return[0,0,0];let[r]=o;r.length===3&&(r=[...r].map(l=>l+l).join(""));let n=Number.parseInt(r,16);return[n>>16&255,n>>8&255,n&255]},enumerable:!1},hexToAnsi256:{value:e=>s.rgbToAnsi256(...s.hexToRgb(e)),enumerable:!1},ansi256ToAnsi:{value(e){if(e<8)return 30+e;if(e<16)return 90+(e-8);let o,r,n;if(e>=232)o=((e-232)*10+8)/255,r=o,n=o;else{e-=16;let i=e%36;o=Math.floor(e/36)/5,r=Math.floor(i/6)/5,n=i%6/5}let l=Math.max(o,r,n)*2;if(l===0)return 30;let c=30+(Math.round(n)<<2|Math.round(r)<<1|Math.round(o));return l===2&&(c+=60),c},enumerable:!1},rgbToAnsi:{value:(e,o,r)=>s.ansi256ToAnsi(s.rgbToAnsi256(e,o,r)),enumerable:!1},hexToAnsi:{value:e=>s.ansi256ToAnsi(s.hexToAnsi256(e)),enumerable:!1}}),s}var me=de(),u=me;var v=(()=>{if(navigator.userAgentData){let t=navigator.userAgentData.brands.find(({brand:e})=>e==="Chromium");if(t&&t.version>93)return 3}return/\b(Chrome|Chromium)\//.test(navigator.userAgent)?1:0})(),G=v!==0&&{level:v,hasBasic:!0,has256:v>=2,has16m:v>=3},pe={stdout:G,stderr:G},U=pe;function V(t,e,o){let r=t.indexOf(e);if(r===-1)return t;let n=e.length,l=0,c="";do c+=t.slice(l,r)+e+o,l=r+n,r=t.indexOf(e,l);while(r!==-1);return c+=t.slice(l),c}function Y(t,e,o,r){let n=0,l="";do{let c=t[r-1]==="\r";l+=t.slice(n,c?r-1:r)+e+(c?`\r
`:`
`)+o,n=r+1,r=t.indexOf(`
`,n)}while(r!==-1);return l+=t.slice(n),l}var{stdout:W,stderr:K}=U,N=Symbol("GENERATOR"),m=Symbol("STYLER"),g=Symbol("IS_EMPTY"),J=["ansi","ansi","ansi256","ansi16m"],p=Object.create(null),ge=(t,e={})=>{if(e.level&&!(Number.isInteger(e.level)&&e.level>=0&&e.level<=3))throw new Error("The `level` option should be an integer from 0 to 3");let o=W?W.level:0;t.level=e.level===void 0?o:e.level},x=class{constructor(e){return Z(e)}},Z=t=>{let e=(...o)=>o.join(" ");return ge(e,t),Object.setPrototypeOf(e,h.prototype),e};function h(t){return Z(t)}Object.setPrototypeOf(h.prototype,Function.prototype);for(let[t,e]of Object.entries(u))p[t]={get(){let o=O(this,j(e.open,e.close,this[m]),this[g]);return Object.defineProperty(this,t,{value:o}),o}};p.visible={get(){let t=O(this,this[m],!0);return Object.defineProperty(this,"visible",{value:t}),t}};var S=(t,e,o,...r)=>t==="rgb"?e==="ansi16m"?u[o].ansi16m(...r):e==="ansi256"?u[o].ansi256(u.rgbToAnsi256(...r)):u[o].ansi(u.rgbToAnsi(...r)):t==="hex"?S("rgb",e,o,...u.hexToRgb(...r)):u[o][t](...r),he=["rgb","hex","ansi256"];for(let t of he){p[t]={get(){let{level:o}=this;return function(...r){let n=j(S(t,J[o],"color",...r),u.color.close,this[m]);return O(this,n,this[g])}}};let e="bg"+t[0].toUpperCase()+t.slice(1);p[e]={get(){let{level:o}=this;return function(...r){let n=j(S(t,J[o],"bgColor",...r),u.bgColor.close,this[m]);return O(this,n,this[g])}}}}var ye=Object.defineProperties(()=>{},{...p,level:{enumerable:!0,get(){return this[N].level},set(t){this[N].level=t}}}),j=(t,e,o)=>{let r,n;return o===void 0?(r=t,n=e):(r=o.openAll+t,n=e+o.closeAll),{open:t,close:e,openAll:r,closeAll:n,parent:o}},O=(t,e,o)=>{let r=(...n)=>ve(r,n.length===1?""+n[0]:n.join(" "));return Object.setPrototypeOf(r,ye),r[N]=t,r[m]=e,r[g]=o,r},ve=(t,e)=>{if(t.level<=0||!e)return t[g]?"":e;let o=t[m];if(o===void 0)return e;let{openAll:r,closeAll:n}=o;if(e.includes("\x1B"))for(;o!==void 0;)e=V(e,o.close,o.open),o=o.parent;let l=e.indexOf(`
`);return l!==-1&&(e=Y(e,n,r,l)),r+e+n};Object.defineProperties(h.prototype,p);var je=h(),Te=h({level:K?K.level:0});var B=new x({level:3});Zilch.play=async function*(t){let e=t.config.initialTurn,o={board:t.config.initialBoard,errorEmphasisSpot:null},r=z(o)?.outcome??null;for(r!==null&&(yield{outcome:r,state:o});;){let n=e%2===0?0:1,l=t.bots[n],c=q(o);l.writeln(B.dim("Start turn"));let i=await l.move(c).then(xe);if(i instanceof Error){l.writeln(B.red(`Unable to parse move. ${i.message}`)),yield{outcome:[n===0?a.BotOutcome.Error:a.BotOutcome.None,n===1?a.BotOutcome.Error:a.BotOutcome.None],state:o};continue}l.writeln(B.dim(`\u2937 x=${i.x} y=${i.y}`));let y=o.board[i.x][i.y],f=null;y!=="empty"?(l.writeln(B.red(`
Spot { x: ${i.x}, y: ${i.y} } already occupied.`)),o.errorEmphasisSpot=i,f=[n===0?a.BotOutcome.Error:a.BotOutcome.None,n===1?a.BotOutcome.Error:a.BotOutcome.None]):(o.board[i.x][i.y]=e%2===0?"x":"o",f=z(o)?.outcome??null),f!==null&&await Promise.all(t.bots.map(C=>C.end(q(o)))),yield{state:o,outcome:f},e++}};function xe(t){let[e,o]=t.split(",").map(r=>{if(/(0|1|2)/.test(r))return parseInt(r)});return e===void 0||o===void 0?new Error(`Move invalid: "${t}"`):{x:e,y:o}}function q(t){return t.board.map(e=>e.join(",")).join("|")}function z(t){let e={x:0,y:0},o={x:0,y:1},r={x:0,y:2},n={x:1,y:0},l={x:1,y:1},c={x:1,y:2},i={x:2,y:0},y={x:2,y:1},f={x:2,y:2},C=[[e,o,r],[n,l,c],[i,y,f],[e,n,i],[o,l,y],[r,c,f],[e,l,f],[i,l,r]];for(let b of["x","o"]){let d=C.find(H=>H.every(T=>{let E=t.board[T.x]?.[T.y];return E==="empty"?!1:E===b}));if(d)return{winningLine:d,outcome:[b==="x"?a.BotOutcome.Victory:a.BotOutcome.Defeat,b==="o"?a.BotOutcome.Victory:a.BotOutcome.Defeat]}}for(let b=0;b<3;b++)for(let d=0;d<3;d++)if(t.board[b][d]==="empty")return null;return{outcome:[a.BotOutcome.Draw,a.BotOutcome.Draw]}}export{z as a};
//# sourceMappingURL=chunk-XR65YK3K.js.map