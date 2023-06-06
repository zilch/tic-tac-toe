import{a as J,b as Z}from"./chunk-ON5OQYWL.js";var P=J((me,R)=>{"use strict";var B=Object.defineProperty,q=Object.getOwnPropertyDescriptor,z=Object.getOwnPropertyNames,H=Object.prototype.hasOwnProperty,Q=(t,e)=>{for(var o in e)B(t,o,{get:e[o],enumerable:!0})},X=(t,e,o,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of z(e))!H.call(t,n)&&n!==o&&B(t,n,{get:()=>e[n],enumerable:!(r=q(e,n))||r.enumerable});return t},ee=t=>X(B({},"__esModule",{value:!0}),t),T={};Q(T,{BotOutcome:()=>te,GameSpeed:()=>oe});R.exports=ee(T);var te={Victory:"victory",Defeat:"defeat",Draw:"draw",Error:"error",None:"none"},oe={Fast:"fast",Normal:"normal",Paused:"paused"}});var u=Z(P());var F=(t=0)=>e=>`\x1B[${e+t}m`,_=(t=0)=>e=>`\x1B[${38+t};5;${e}m`,E=(t=0)=>(e,o,r)=>`\x1B[${38+t};2;${e};${o};${r}m`,s={modifier:{reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],overline:[53,55],inverse:[7,27],hidden:[8,28],strikethrough:[9,29]},color:{black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],blackBright:[90,39],gray:[90,39],grey:[90,39],redBright:[91,39],greenBright:[92,39],yellowBright:[93,39],blueBright:[94,39],magentaBright:[95,39],cyanBright:[96,39],whiteBright:[97,39]},bgColor:{bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],bgBlackBright:[100,49],bgGray:[100,49],bgGrey:[100,49],bgRedBright:[101,49],bgGreenBright:[102,49],bgYellowBright:[103,49],bgBlueBright:[104,49],bgMagentaBright:[105,49],bgCyanBright:[106,49],bgWhiteBright:[107,49]}},k=Object.keys(s.modifier),C=Object.keys(s.color),A=Object.keys(s.bgColor),I=[...C,...A];function re(){let t=new Map;for(let[e,o]of Object.entries(s)){for(let[r,n]of Object.entries(o))s[r]={open:`\x1B[${n[0]}m`,close:`\x1B[${n[1]}m`},o[r]=s[r],t.set(n[0],n[1]);Object.defineProperty(s,e,{value:o,enumerable:!1})}return Object.defineProperty(s,"codes",{value:t,enumerable:!1}),s.color.close="\x1B[39m",s.bgColor.close="\x1B[49m",s.color.ansi=F(),s.color.ansi256=_(),s.color.ansi16m=E(),s.bgColor.ansi=F(10),s.bgColor.ansi256=_(10),s.bgColor.ansi16m=E(10),Object.defineProperties(s,{rgbToAnsi256:{value(e,o,r){return e===o&&o===r?e<8?16:e>248?231:Math.round((e-8)/247*24)+232:16+36*Math.round(e/255*5)+6*Math.round(o/255*5)+Math.round(r/255*5)},enumerable:!1},hexToRgb:{value(e){let o=/[a-f\d]{6}|[a-f\d]{3}/i.exec(e.toString(16));if(!o)return[0,0,0];let[r]=o;r.length===3&&(r=[...r].map(l=>l+l).join(""));let n=Number.parseInt(r,16);return[n>>16&255,n>>8&255,n&255]},enumerable:!1},hexToAnsi256:{value:e=>s.rgbToAnsi256(...s.hexToRgb(e)),enumerable:!1},ansi256ToAnsi:{value(e){if(e<8)return 30+e;if(e<16)return 90+(e-8);let o,r,n;if(e>=232)o=((e-232)*10+8)/255,r=o,n=o;else{e-=16;let i=e%36;o=Math.floor(e/36)/5,r=Math.floor(i/6)/5,n=i%6/5}let l=Math.max(o,r,n)*2;if(l===0)return 30;let a=30+(Math.round(n)<<2|Math.round(r)<<1|Math.round(o));return l===2&&(a+=60),a},enumerable:!1},rgbToAnsi:{value:(e,o,r)=>s.ansi256ToAnsi(s.rgbToAnsi256(e,o,r)),enumerable:!1},hexToAnsi:{value:e=>s.ansi256ToAnsi(s.hexToAnsi256(e)),enumerable:!1}}),s}var ne=re(),c=ne;var h=(()=>{if(navigator.userAgentData){let t=navigator.userAgentData.brands.find(({brand:e})=>e==="Chromium");if(t&&t.version>93)return 3}return/\b(Chrome|Chromium)\//.test(navigator.userAgent)?1:0})(),D=h!==0&&{level:h,hasBasic:!0,has256:h>=2,has16m:h>=3},le={stdout:D,stderr:D},G=le;function $(t,e,o){let r=t.indexOf(e);if(r===-1)return t;let n=e.length,l=0,a="";do a+=t.slice(l,r)+e+o,l=r+n,r=t.indexOf(e,l);while(r!==-1);return a+=t.slice(l),a}function L(t,e,o,r){let n=0,l="";do{let a=t[r-1]==="\r";l+=t.slice(n,a?r-1:r)+e+(a?`\r
`:`
`)+o,n=r+1,r=t.indexOf(`
`,n)}while(r!==-1);return l+=t.slice(n),l}var{stdout:V,stderr:Y}=G,w=Symbol("GENERATOR"),d=Symbol("STYLER"),m=Symbol("IS_EMPTY"),U=["ansi","ansi","ansi256","ansi16m"],p=Object.create(null),se=(t,e={})=>{if(e.level&&!(Number.isInteger(e.level)&&e.level>=0&&e.level<=3))throw new Error("The `level` option should be an integer from 0 to 3");let o=V?V.level:0;t.level=e.level===void 0?o:e.level};var ie=t=>{let e=(...o)=>o.join(" ");return se(e,t),Object.setPrototypeOf(e,g.prototype),e};function g(t){return ie(t)}Object.setPrototypeOf(g.prototype,Function.prototype);for(let[t,e]of Object.entries(c))p[t]={get(){let o=y(this,S(e.open,e.close,this[d]),this[m]);return Object.defineProperty(this,t,{value:o}),o}};p.visible={get(){let t=y(this,this[d],!0);return Object.defineProperty(this,"visible",{value:t}),t}};var M=(t,e,o,...r)=>t==="rgb"?e==="ansi16m"?c[o].ansi16m(...r):e==="ansi256"?c[o].ansi256(c.rgbToAnsi256(...r)):c[o].ansi(c.rgbToAnsi(...r)):t==="hex"?M("rgb",e,o,...c.hexToRgb(...r)):c[o][t](...r),ae=["rgb","hex","ansi256"];for(let t of ae){p[t]={get(){let{level:o}=this;return function(...r){let n=S(M(t,U[o],"color",...r),c.color.close,this[d]);return y(this,n,this[m])}}};let e="bg"+t[0].toUpperCase()+t.slice(1);p[e]={get(){let{level:o}=this;return function(...r){let n=S(M(t,U[o],"bgColor",...r),c.bgColor.close,this[d]);return y(this,n,this[m])}}}}var ce=Object.defineProperties(()=>{},{...p,level:{enumerable:!0,get(){return this[w].level},set(t){this[w].level=t}}}),S=(t,e,o)=>{let r,n;return o===void 0?(r=t,n=e):(r=o.openAll+t,n=e+o.closeAll),{open:t,close:e,openAll:r,closeAll:n,parent:o}},y=(t,e,o)=>{let r=(...n)=>ue(r,n.length===1?""+n[0]:n.join(" "));return Object.setPrototypeOf(r,ce),r[w]=t,r[d]=e,r[m]=o,r},ue=(t,e)=>{if(t.level<=0||!e)return t[m]?"":e;let o=t[d];if(o===void 0)return e;let{openAll:r,closeAll:n}=o;if(e.includes("\x1B"))for(;o!==void 0;)e=$(e,o.close,o.open),o=o.parent;let l=e.indexOf(`
`);return l!==-1&&(e=L(e,n,r,l)),r+e+n};Object.defineProperties(g.prototype,p);var fe=g(),Be=g({level:Y?Y.level:0});var v=fe;Zilch.play=async function*(t){let e=t.config.initialTurn,o={board:t.config.initialBoard};for(;;){let r=pe(o)?.outcome??null;if(r!==null)return r;let n=e%2===0?0:1,l=t.bots[n],a=de(o);l.writeln(v.dim("Start turn"));let i=await l.move(a).then(be);if(l.writeln(v.dim(`\u2937 x=${i.x} y=${i.y}`)),o.board[i.x][i.y]!=="empty")return l.writeln(v.red(`
Spot { x: ${i.x}, y: ${i.y} } already occupied.`)),yield o,[n===0?u.BotOutcome.Error:u.BotOutcome.None,n===1?u.BotOutcome.Error:u.BotOutcome.None];o.board[i.x][i.y]=e%2===0?"x":"o",yield o,e++}};function be(t){let[e,o]=t.split(",").map(r=>{if(/(0|1|2)/.test(r))return parseInt(r)});if(e===void 0||o===void 0)throw new Error(`Response invalid: "${t}"`);return{x:e,y:o}}function de(t){return t.board.map(e=>e.join(",")).join("|")}function pe(t){let e={x:0,y:0},o={x:0,y:1},r={x:0,y:2},n={x:1,y:0},l={x:1,y:1},a={x:1,y:2},i={x:2,y:0},x={x:2,y:1},O={x:2,y:2},W=[[e,o,r],[n,l,a],[i,x,O],[e,n,i],[o,l,x],[r,a,O],[e,l,O],[i,l,r]];for(let f of["x","o"]){let b=W.find(K=>K.every(N=>{let j=t.board[N.x]?.[N.y];return j==="empty"?!1:j===f}));if(b)return{winningLine:b,outcome:[f==="x"?u.BotOutcome.Victory:u.BotOutcome.Defeat,f==="o"?u.BotOutcome.Victory:u.BotOutcome.Defeat]}}for(let f=0;f<3;f++)for(let b=0;b<3;b++)if(t.board[f][b]==="empty")return null;return{outcome:[u.BotOutcome.Draw,u.BotOutcome.Draw]}}
//# sourceMappingURL=play.js.map