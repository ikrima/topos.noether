'use strict';
const E = require('./engine.js');
const {
  V, makeRng, Scene, lightPoint, pHat, dAtoDOmega, reference,
  canonicalSampleOmegaPdf, sharpnessFromRoughness, resampleAt, shiftJacobian,
} = E;

const NP = 96;
const baseX = (i) => (i + 0.5) / NP * 0.8 + 0.1;
function xvAt(i, drift) { return V(baseX(i) + drift, 0); }

function pearson(a, b) {
  const n = a.length; let ma=0, mb=0;
  for (let i=0;i<n;i++){ma+=a[i];mb+=b[i];} ma/=n; mb/=n;
  let cov=0,va=0,vb=0;
  for (let i=0;i<n;i++){const da=a[i]-ma,db=b[i]-mb;cov+=da*db;va+=da*da;vb+=db*db;}
  return cov/(Math.sqrt(va*vb)+1e-30);
}
function temporalResidual(xvSrc, xvDst, y, s) {
  const pSrc = pHat(xvSrc, y, s);
  const pDst = pHat(xvDst, y, s);
  const J = shiftJacobian(xvSrc, xvDst, y);
  return Math.log(Math.max(pDst,1e-30)) + Math.log(Math.max(J,1e-30)) - Math.log(Math.max(pSrc,1e-30));
}
function run(rough, label, diag) {
  const s = sharpnessFromRoughness(rough);
  Scene.camera = V(0.5, 0.35);
  Scene.occluder.x0 = 0.40; Scene.occluder.x1 = 0.52; Scene.occluder.y = 0.20;
  const R = 4, FRAMES = 80, cCap = 10;
  const rng = makeRng(2024);
  let prev = new Array(NP).fill(null);
  const lumSeries = Array.from({length:NP},()=>[]);
  const residSeries = Array.from({length:NP},()=>[]);
  let lumMin=1e9,lumMax=-1e9,refMax=-1e9,residMax=-1e9;
  for (let f=0; f<FRAMES; f++) {
    const drift = 0.16 * (f/FRAMES);
    const xv=[]; const ref=new Float64Array(NP);
    for(let i=0;i<NP;i++){xv.push(xvAt(i,drift)); ref[i]=reference(xv[i],s); refMax=Math.max(refMax,ref[i]);}
    const canon=[];
    for(let i=0;i<NP;i++){const y=lightPoint(rng());const pdf=canonicalSampleOmegaPdf(xv[i],y);canon.push({xv:xv[i],c:1,y,Wsrc:pdf>0?1/pdf:0});}
    const next=new Array(NP);
    for(let i=0;i<NP;i++){
      const window=[]; let iLocal=0;
      for(let k=-R;k<=R;k++){const j=i+k;if(j<0||j>=NP)continue;if(j===i)iLocal=window.length;window.push(canon[j]);}
      let rTemporal = 0;
      if(prev[i]&&prev[i].y){
        rTemporal = temporalResidual(prev[i].xv, xv[i], prev[i].y, s);
        window.push({xv:prev[i].xv,c:Math.min(prev[i].c,cCap),y:prev[i].y,Wsrc:prev[i].W});
      }
      const res=resampleAt(iLocal,window,s,rng);
      const lum=res.y!==null?pHat(xv[i],res.y,s)*res.W:0;
      next[i]={y:res.y,W:res.W,c:Math.min((prev[i]?Math.min(prev[i].c,cCap):0)+1,cCap),xv:xv[i]};
      if(f>8){ lumSeries[i].push(lum); residSeries[i].push(Math.abs(rTemporal)); }
      lumMin=Math.min(lumMin,lum); lumMax=Math.max(lumMax,lum); residMax=Math.max(residMax,Math.abs(rTemporal));
    }
    prev=next;
  }
  const tVar=new Float64Array(NP), mResid=new Float64Array(NP), tFlicker=new Float64Array(NP);
  for(let i=0;i<NP;i++){
    const L=lumSeries[i], Rr=residSeries[i]; const n=L.length||1;
    let m=0; for(const v of L)m+=v; m/=n;
    let vv=0; for(const v of L)vv+=(v-m)*(v-m); tVar[i]=vv/n;
    let fl=0; for(let k=1;k<L.length;k++)fl+=Math.abs(L[k]-L[k-1]); tFlicker[i]=fl/Math.max(1,L.length-1);
    let rm=0; for(const v of Rr)rm+=v; mResid[i]=rm/n;
  }
  const cVar=pearson(Array.from(mResid),Array.from(tVar));
  const cFlk=pearson(Array.from(mResid),Array.from(tFlicker));
  const cellResid=[], cellFF=[];
  for(let i=0;i<NP;i++){
    const L=[...lumSeries[i]].sort((a,b)=>a-b); const med=L[Math.floor(L.length/2)]||0;
    for(let k=0;k<lumSeries[i].length;k++){
      cellResid.push(residSeries[i][k]);
      cellFF.push(lumSeries[i][k] > Math.max(0.05, 4*med) ? 1:0);
    }
  }
  let ffS=0,ffN=0,nfS=0,nfN=0;
  for(let i=0;i<cellFF.length;i++){if(cellFF[i]){ffS+=cellResid[i];ffN++;}else{nfS+=cellResid[i];nfN++;}}
  const ffM=ffN?ffS/ffN:0,nfM=nfN?nfS/nfN:0;
  console.log(`[${label}] rough=${rough} s=${s.toFixed(0)}`);
  if(diag) console.log(`   diag: lum[${lumMin.toFixed(3)},${lumMax.toFixed(2)}] refMax=${refMax.toFixed(2)} |r|max=${residMax.toFixed(2)}`);
  console.log(`   corr(mean|r|, temporalVar)    = ${cVar.toFixed(3)}`);
  console.log(`   corr(mean|r|, temporalFlicker)= ${cFlk.toFixed(3)}`);
  console.log(`   mean|r| @ firefly=${ffM.toFixed(2)} clean=${nfM.toFixed(2)} ratio=${(ffM/(nfM+1e-9)).toFixed(2)}x (ff=${ffN})`);
  return {cVar,cFlk,ratio:ffM/(nfM+1e-9)};
}
console.log('TEST 3 (instrumented): near camera, temporal residual vs instability\n');
const d=run(1.0,'diffuse  ',true);
const g=run(0.30,'glossy   ',true);
const n=run(0.12,'near-sing',true);
console.log('');
const ok=n.cVar>0.3 && g.cVar>0.2 && n.cVar>d.cVar;
console.log(`verdict: ${ok?'PASS — residual tracks temporal instability; grows with lobe sharpness':'diagnose further'}`);
