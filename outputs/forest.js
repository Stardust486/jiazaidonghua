'use strict';
const byId = id => document.getElementById(id);
const ctx = byId('forest').getContext('2d');
const slider = byId('progress'), actor = byId('gardener'), play = byId('play');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = x => Math.max(0, Math.min(1, x));
const seed = n => { const v = Math.sin(n * 78.233 + 37.72) * 43758.5453; return v - Math.floor(v); };
function rect(x,y,w,h,color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
}
// Raster ellipses keep leaf edges crisp at every display size.
function oval(x,y,rx,ry,color) {
  for(let dy=-ry;dy<=ry;dy++){
    const span=Math.floor(rx*Math.sqrt(1-(dy/(ry+.4))**2));
    rect(x-span,y+dy,span*2+1,1,color);
  }
}
function sky(t) {
  const gradient=ctx.createLinearGradient(0,0,0,80);
  gradient.addColorStop(0,'#b9d9c9'); gradient.addColorStop(1,'#e8eac9');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,400,100);
  oval(81,15,8,8,'#fff2bd');
  for(let i=0;i<5;i++){
    const x=((25+i*96+t*.55)%465)-25,y=12+seed(i)*14;
    oval(x,y,10,2,'#edf1d8');oval(x+4,y-2,6,3,'#edf1d8');rect(x+9,y-2,6,3,'#edf1d8');
  }
  for(let x=0;x<400;x++){
    const h=51+11*Math.sin(x*.028)+5*Math.cos(x*.073);
    rect(x,h,1,82-h,'#b3cdaf');
    const near=62+8*Math.sin(x*.042+1)+4*Math.cos(x*.081);
    rect(x,near,1,82-near,'#9ebc9d');
  }
  for(let i=0;i<32;i++){
    const x=i*14+seed(i)*7,h=6+seed(i+44)*18;
    for(let j=0;j<h;j++) rect(x-j*.27,73-h+j,1+j*.54,1,'#91ae90');
  }
  rect(0,74,400,3,'#b9c790');rect(0,77,400,3,'#aab67d');
  rect(0,80,400,5,'#d5c899');rect(0,85,400,15,'#a88e6c');
  for(let i=0;i<200;i++) rect(seed(i)*400,86+seed(i+900)*13,1+seed(i+322)*2,1,'#b8a07b');
}
const trees=Array.from({length:34},(_,i)=>({
  x:4+(i%17)*24+seed(i)*10-(i<17?8:1),
  y:i<17?73:79,h:31+seed(i+67)*18+(i<17?4:0),id:i
}));
function tree({x,y,h,id},growth,bloom){
  if(growth<=0)return;
  ctx.save();ctx.translate(Math.round(x),y);ctx.scale(growth,growth);
  const rear=id<17, crown=rear?'#799b61':'#62884a',mid=rear?'#8aa967':'#7da153';
  rect(-2,-h,5,h,'#785e43');rect(0,-h,2,h,'#a58151');
  for(let k=0;k<8;k++){rect(-k,-h*.44-k,3,3,'#896c47');rect(k,-h*.56-k,3,3,'#866a47');}
  const cy=-Math.round(h),r=10+Math.floor(seed(id+83)*4);
  oval(1,cy+4,r+2,r,crown);oval(-6,cy,r,r-1,mid);oval(5,cy-4,r,r,mid);
  oval(-4,cy-6,r-2,r-3,rear?'#94af6f':'#94b35e');
  for(let k=0;k<18;k++){
    const lx=seed(id*36+k)*22-11,ly=cy-9+seed(id*18+k+83)*16;
    rect(lx,ly,1+seed(k)*2,1,k%3?'#a5bd70':crown);
    if(bloom>seed(k+10)&&k%2===0){rect(lx,ly,3,2,'#edafb1');rect(lx+1,ly-1,1,2,'#f9d8c5');}
  }
  ctx.restore();
}
const rabbit=['..a.a....','..a.a....','..aaaa...','..aaab...','.aaaaaa..','aaaaaaa..','..aa.aa..'];
const fox=['......a.a.','......aaa.','wc...aaab.','.caaaaaaw.','..aaaaaa..','...b..b...'];
const gardener=['....hhhh....','...hggggh...','..hhhhhhhh..','....bfbb....','....ffaf....','.....ff.....','...gllg.....','...gddgff...','....ddd.....','....ddd.....'];
const digits=['111101101101111','010110010010111','111001111100111','111001011001111','101101111001001','111100111001111','111100111101111','111001010010010','111101111101111','111101111001111'];
function pixelLabel(label,cx,y){
  const start=Math.round(cx-(label.length*4-1)/2);
  [...label].forEach((char,i)=>{
    const glyph=char==='%'?'101001010100101':digits[Number(char)];
    [...glyph].forEach((bit,k)=>{if(bit==='1')rect(start+i*4+k%3,y+Math.floor(k/3),1,1,'#405437');});
  });
}
function sprite(rows,x,y,palette){
  rows.forEach((row,j)=>[...row].forEach((key,i)=>{if(key!=='.')rect(x+i,y+j,1,1,palette[key]);}));
}
let progress=0,running=!reducedMotion,prev=performance.now(),jumpAt=-2000,bloomAt=-2000;
function render(now) {
  const t=reducedMotion?0:now/1000;
  const walker=23+progress*3.54;
  const front=progress===0?-18:walker;
  const bloom=progress===100?(reducedMotion?1:clamp((now-bloomAt)/850)):0;
  sky(t);
  const growthAt=x=>clamp((front-x)/24) + (1-clamp((front-x)/24))*bloom;
  for(const item of trees) tree(item,growthAt(item.x),bloom);
  rect(0,83,Math.max(0,front+20*bloom),2,'#70904e');
  for(let i=0;i<365;i++){
    const x=seed(i+500)*400,y=75+seed(i+1000)*6,g=growthAt(x);
    if(!g)continue;
    const h=Math.ceil((2+seed(i)*4)*g);
    rect(x,y-h,1,h,i%2?'#608146':'#8ba455');rect(x-1,y-2,1,1,'#90ad64');
    if(i%5===0 || (bloom>seed(i+222)&&i%2===0)){
      const color=['#e2adac','#efcf83','#c8b7d3','#f4e6c9'][i%4];
      rect(x-1,y-h-1,3,2,color);rect(x,y-h-2,1,3,color);rect(x,y-h,1,1,'#ffdc88');
    }
  }
  for(let i=0;i<5;i++){
    if(progress<17+i*17)continue;
    const x=35+i*65+Math.sin(t*.7+i)*5,y=78+i%2-Math.max(0,Math.round(Math.sin(t*3+i)*2));
    sprite(i%2?fox:rabbit,x,y,i%2?{a:'#b57045',b:'#514c36',c:'#cd9057',w:'#efe1bc'}:{a:'#f5ecd2',b:'#5c6049'});
  }
  const jump=clamp((now-jumpAt)/540),lift=Math.round(9*Math.sin(Math.PI*jump));
  const step=running&&!reducedMotion?Math.floor(t*5)%2:0;
  oval(walker,83,8,1,'#8f966b');
  ctx.save();ctx.translate(Math.round(walker),83-lift-step);ctx.scale(1.4,1.4);
  const x=-6,y=-13;
  sprite(gardener,x,y,{h:'#856a42',g:'#81965b',f:'#e3b27d',b:'#584e3c',a:'#3d4634',l:'#ead6a1',d:'#4e675c'});
  rect(x+4-step,y+10,2,3,'#68543f');rect(x+7+step,y+10,2,3,'#68543f');
  rect(x+10,y+7,5,4,'#60979a');rect(x+11,y+6,3,1,'#b2d2c0');rect(x+15,y+8,3,1,'#558080');rect(x+17,y+7,2,1,'#80afb0');
  if(progress<100&&progress>0)for(let i=0;i<4;i++){
    const phase=(t*1.7+i/4)%1;
    rect(x+19+phase*4,y+8+phase*phase*6,1,1,'#e2f4db');
  }
  if(lift>2){rect(-1,y-5,1,3,'#f5d274');rect(-2,y-4,3,1,'#f5d274');}
  ctx.restore();
  const bx=Math.max(39,Math.min(361,walker));
  rect(bx-14,9,29,11,'#6b7153');rect(bx-13,10,27,9,'#f6ebc6');rect(bx-1,20,3,2,'#6b7153');
  const label=Math.floor(progress)+'%';
  pixelLabel(label,bx,12);
  actor.style.left=walker/4+'%';
  actor.style.bottom=(12+lift)+'%';
  const value=Math.floor(progress);slider.value=value;byId('value').value=value+'%';
  play.textContent=running?'暂停':'播放';play.disabled=progress===100;
  const status=progress===100?'全林盛放':running?'正在浇水':'已暂停';
  if(byId('status').textContent!==status)byId('status').textContent=status;
}
function setProgress(value,now) {
  if(value>=100 && progress<100)bloomAt=now;
  progress=Math.max(0,Math.min(100,value));
  if(progress===100)running=false;
}
function frame(now){
  if(running)setProgress(progress+Math.min(now-prev,100)/160,now);
  prev=now;render(now);requestAnimationFrame(frame);
}
slider.addEventListener('pointerdown',()=>{running=false;});
slider.addEventListener('input',()=>{running=false;setProgress(Number(slider.value),performance.now());render(performance.now());});
play.onclick=()=>{running=!running;prev=performance.now();render(prev);};
byId('replay').onclick=()=>{progress=0;running=true;jumpAt=-2000;prev=performance.now();render(prev);};
actor.onclick=()=>{jumpAt=performance.now();};
render(prev);requestAnimationFrame(frame);
