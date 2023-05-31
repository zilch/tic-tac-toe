var o={type:"object",required:["startingPosition"],properties:{startingPosition:{description:"The best description that ever there was.",type:"array",minItems:3,maxItems:3,items:{type:"array",minItems:3,maxItems:3,items:{type:["string"],enum:["x","o","empty"]}}}}};Zilch.configSchema=o;Zilch.configPresets=[{name:"Standard",value:`{
  // 3x3 matrix with values "x", "o" and "empty"
  "startingPosition": [
    ["empty", "empty", "empty"],
    ["empty", "empty", "empty"],
    ["empty", "empty", "empty"]
  ]
}
`}];Zilch.parseConfig=t=>{let n=0,e=0,i=t.startingPosition.map(a=>a.map(r=>r==="x"?n++*2:r==="o"?e++*2+1:null));if(n-e!==0&&n-e!==1)throw new Error("There should be an even number of Xs and Os (or just one more X than O) in the starting position.");return{initialBoard:i,initialTurn:e+n}};Zilch.serializeConfig=t=>t.initialBoard.map(e=>e.map(i=>i===null?"empty":i%2===0?"x":"o")).map(e=>e.join(",")).join("|");Zilch.summarizeConfig=t=>t.initialTurn===0?"standard starting position":"custom starting position";
//# sourceMappingURL=config.js.map
