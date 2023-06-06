var a={type:"object",required:["startingPosition"],properties:{startingPosition:{description:"The best description that ever there was.",type:"array",minItems:3,maxItems:3,items:{type:"array",minItems:3,maxItems:3,items:{type:["string"],enum:["x","o","empty"]}}}}};Zilch.configSchema=a;Zilch.configPresets=[{name:"Standard",value:`{
  // 3x3 matrix with values "x", "o" and "empty"
  "startingPosition": [
    ["empty", "empty", "empty"],
    ["empty", "empty", "empty"],
    ["empty", "empty", "empty"]
  ]
}
`}];Zilch.parseConfig=e=>{let t=0,i=0,r=e.startingPosition.map(o=>o.map(n=>n==="x"?(t++,"x"):n==="o"?(i++,"o"):"empty"));if(t-i!==0&&t-i!==1)throw new Error("There should be an even number of Xs and Os (or just one more X than O) in the starting position.");return{initialBoard:r,initialTurn:i+t}};Zilch.serializeConfig=e=>e.initialBoard.map(t=>t.join(",")).join("|");Zilch.summarizeConfig=e=>e.initialTurn===0?"standard starting position":"custom starting position";
//# sourceMappingURL=config.js.map
