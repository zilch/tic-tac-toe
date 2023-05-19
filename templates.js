"use strict";var GameEngineComponent=(()=>{var v=Object.create;var i=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var h=Object.getOwnPropertyNames;var w=Object.getPrototypeOf,_=Object.prototype.hasOwnProperty;var x=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),P=(t,e)=>{for(var r in e)i(t,r,{get:e[r],enumerable:!0})},m=(t,e,r,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of h(e))!_.call(t,o)&&o!==r&&i(t,o,{get:()=>e[o],enumerable:!(a=b(e,o))||a.enumerable});return t};var O=(t,e,r)=>(r=t!=null?v(w(t)):{},m(e||!t||!t.__esModule?i(r,"default",{value:t,enumerable:!0}):r,t)),S=t=>m(i({},"__esModule",{value:!0}),t);var g=x((L,u)=>{"use strict";var c=Object.defineProperty,C=Object.getOwnPropertyDescriptor,j=Object.getOwnPropertyNames,B=Object.prototype.hasOwnProperty,T=(t,e)=>{for(var r in e)c(t,r,{get:e[r],enumerable:!0})},D=(t,e,r,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of j(e))!B.call(t,o)&&o!==r&&c(t,o,{get:()=>e[o],enumerable:!(a=C(e,o))||a.enumerable});return t},N=t=>D(c({},"__esModule",{value:!0}),t),f={};T(f,{BotOutcome:()=>z,GameSpeed:()=>F,createTemplate:()=>G,file:()=>p});u.exports=N(f);var z={Victory:"victory",Defeat:"defeat",Draw:"draw",Error:"error",None:"none"},F={Fast:"fast",Normal:"normal",Paused:"paused"};function l(t=644){return(e,...r)=>{let a="";e.forEach((s,y)=>{a+=s+(r[y]??"")});let o=a.split(`
`);for(;o[0]?.trim()==="";)o.shift();let d=o[0]?.match(/^\s+/)?.[0]??"";return{contents:o.map(s=>s.startsWith(d)?s.slice(d.length):s).join(`
`),mode:t}}}var p=l();p.mode=t=>l(t);p.executable=l(755);function G(t){return t}});var E={};P(E,{templates:()=>M});var n=O(g()),M=[(0,n.createTemplate)({id:"javascript.node",run:"node main.js",files:{"bot.js":n.file`
        class Bot {
          constructor(config) {
            this.config = config;
            console.log(this.config);
          }
        
          move(board) {
            console.log(board);
        
            const availableSpots = [];
        
            for (let x = 0; x < 3; x++) {
              for (let y = 0; y < 3; y++) {
                if (board[x][y] === "empty") {
                  availableSpots.push({ x, y });
                }
              }
            }
        
            return availableSpots[Math.floor(Math.random() * availableSpots.length)];
          }
        }
        
        module.exports.Bot = Bot;
      `,"main.js":n.file`
        const { Bot } = require("./bot");

        let bot;
        
        process.stdin.on("data", async (data) => {
          const input = data.toString();
          const command = input.slice(0, 1);
          const payload = input.slice(1);
        
          // "s" for "start"
          if (command === "s") {
            const standardCustomConfigSplit = payload.indexOf(".");
            const standardConfigParts = payload
              .slice(0, standardCustomConfigSplit)
              .split(",");
        
            const config = {
              gameTimeLimit: parseInt(standardConfigParts[0]),
              turnTimeLimit: parseInt(standardConfigParts[1]),
              player: standardConfigParts[2] === "0" ? "x" : "o",
              startingPosition: payload
                .slice(standardCustomConfigSplit + 1)
                .split("|")
                .map((row) => row.split(",")),
            };
        
            bot = new Bot(config);
        
            process.stderr.write("<<zilch:started>>");
        
            return;
          }
        
          // "m" for "move"
          if (command === "m") {
            const move = await bot.move(
              payload.split("|").map((row) => row.split(","))
            );
            process.stderr.write(\`<<zilch:move\${move.x},\${move.y}>>\`);
            return;
          }
        });
        
        process.stderr.write("<<zilch:ready>>");
      `}})];return S(E);})();
