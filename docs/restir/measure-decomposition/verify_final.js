'use strict';
const E = require('./engine.js');
const { V, makeRng, Scene, lightPoint, pHat, reference,
  canonicalSampleOmegaPdf, sharpnessFromRoughness, resampleAt, shiftJacobian } = E;
const NP=96; const baseX=(i)=>(i+0.5)/NP*0.8+0.1; const xvAt=(i,d)=>V(baseX(i)+d,0);
function temporalResidual(a,b,y,s){const ps=pHat(a,y,s),pd=pHat(b,y,s),J=shiftJacobian(a,b,y);
  return Math.log(Math.max(pd,1e-30))+Math.log(Math.max(J,1e-30))-Math.log(Math.max(ps,1e-30));}
function run(rough){
  const s=sharpnessFromRoughness(rough);
  Scene.camera=V(0.5,0.35); Scene.occluder.x0=0.40;Scene.occluder.x1=0.52;Scene.occluder.y=0.20;
  const R=4,FRAMES=80,cCap=10; const rng=makeRng(2024); let prev=new Array(NP).fill(null);
  let lumMax=0;
  const lumByPix=Array.from({length:NP},()=>[]);
  const resByPix=Array.from({length:NP},()=>[]);
  for(let f=0;f<FRAMES;f++){
    const drift=0.16*(f/FRAMES); const xv=[];
    for(let i=0;i<NP;i++)xv.push(xvAt(i,drift));
    const canon=[];for(let i=0;i<NP;i++){const y=lightPoint(rng());const pdf=canonicalSampleOmegaPdf(xv[i],y);canon.push({xv:xv[i],c:1,y,Wsrc:pdf>0?1/pdf:0});}
    const next=new Array(NP);
    for(let i=0;i<NP;i++){
      const w=[];let iL=0;for(let k=-R;k<=R;k++){const j=i+k;if(j<0||j>=NP)continue;if(j===i)iL=w.length;w.push(canon[j]);}
      let rT=0; if(prev[i]&&prev[i].y){rT=temporalResidual(prev[i].xv,xv[i],prev[i].y,s);w.push({xv:prev[i].xv,c:Math.min(prev[i].c,cCap),y:prev[i].y,Wsrc:prev[i].W});}
      const res=resampleAt(iL,w,s,rng); const lum=res.y!==null?pHat(xv[i],res.y,s)*res.W:0;
      next[i]={y:res.y,W:res.W,c:Math.min((prev[i]?Math.min(prev[i].c,cCap):0)+1,cCap),xv:xv[i]};
      lumMax=Math.max(lumMax,lum);
      if(f>8){lumByPix[i].push(lum);resByPix[i].push(Math.abs(rT));}
    }
    prev=next;
  }
  // build ALIGNED flat arrays in identical (pixel-major) order
  const cellR=[],cellFF=[];
  for(let i=0;i<NP;i++){
    const Ls=[...lumByPix[i]].sort((a,b)=>a-b); const med=Ls[Math.floor(Ls.length/2)]||0;
    for(let k=0;k<lumByPix[i].length;k++){
      cellR.push(resByPix[i][k]);
      cellFF.push(lumByPix[i][k]>Math.max(0.05,4*med)?1:0);
    }
  }
  const N=cellR.length; const baseRate=cellFF.reduce((a,b)=>a+b,0)/N;
  const order=[...Array(N).keys()].sort((a,b)=>cellR[b]-cellR[a]);
  const top=Math.floor(N*0.05); let topFF=0; for(let k=0;k<top;k++)topFF+=cellFF[order[k]];
  const topRate=topFF/top; const lift=topRate/(baseRate+1e-9);
  let ffS=0,ffN=0,nfS=0,nfN=0; for(let k=0;k<N;k++){if(cellFF[k]){ffS+=cellR[k];ffN++;}else{nfS+=cellR[k];nfN++;}}
  return {s,lumMax,baseRate,topRate,lift,sep:(ffS/ffN)/((nfS/nfN)+1e-9)};
}
console.log('HEADLINE METRICS — does |lens residual| predict fireflies? (aligned)\n');
console.log('rough   s    maxLum  baseFF%  top5%resid_FF%  LIFT    resid_sep');
for(const r of [1.0,0.5,0.3,0.18,0.12]){
  const x=run(r);
  console.log(`${r.toFixed(2)}  ${x.s.toFixed(0).padStart(4)}   ${x.lumMax.toFixed(1).padStart(5)}    ${(x.baseRate*100).toFixed(1).padStart(4)}      ${(x.topRate*100).toFixed(1).padStart(5)}       ${x.lift.toFixed(1).padStart(4)}x    ${x.sep.toFixed(1)}x`);
}
console.log('\nLIFT = P(firefly | top-5% residual) / P(firefly).  >1 means residual is predictive.');
console.log('resid_sep = mean|r| at fireflies / mean|r| at clean pixels.');
