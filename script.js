// Tahun otomatis di footer
document.getElementById("year").textContent = new Date().getFullYear();

// Animasi reveal saat scroll
const revealEls = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => observer.observe(el));

// Efek ketik ringan untuk nama di hero
const typedEl = document.getElementById("typed-name");
const fullText = typedEl.textContent;
let charIndex = 0;
typedEl.textContent = "";

function typeLoop() {
  if (charIndex <= fullText.length) {
    typedEl.textContent = fullText.slice(0, charIndex);
    charIndex++;
    setTimeout(typeLoop, 90);
  } else {
    setTimeout(() => {
      charIndex = 0;
      typedEl.textContent = "";
      setTimeout(typeLoop, 400);
    }, 3500);
  }
}
typeLoop();
(function(){const screen=document.getElementById('loading-screen'),bar=document.getElementById('loader-bar'),pct=document.getElementById('loader-percent');let n=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;function load(){n=Math.min(100,n+(reduced?100:3));bar.style.width=n+'%';pct.textContent=n+'%';if(n<100)setTimeout(load,35);else setTimeout(()=>screen.classList.add('done'),250)}load();
const c=document.getElementById('starfield'),ctx=c&&c.getContext('2d');if(ctx&&!reduced){let w,h,stars=[];function resize(){w=c.width=innerWidth*devicePixelRatio;h=c.height=innerHeight*devicePixelRatio;stars=Array.from({length:Math.min(130,Math.floor(innerWidth/8))},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.2+.3,a:Math.random(),v:Math.random()*.006+.001}))}function draw(){ctx.clearRect(0,0,w,h);stars.forEach(p=>{p.a+=p.v;if(p.a>1||p.a<.15)p.v*=-1;ctx.globalAlpha=p.a;ctx.fillStyle='#dbeafe';ctx.beginPath();ctx.arc(p.x,p.y,p.r*devicePixelRatio,0,7);ctx.fill()});requestAnimationFrame(draw)}resize();addEventListener('resize',resize);draw()}
const card=document.getElementById('id-card-3d');if(card&&!reduced){let pressed=false,startX=0,startY=0,moveX=0,moveY=0;const nav=document.querySelector('.nav');const rope=document.createElementNS('http://www.w3.org/2000/svg','svg');rope.id='id-card-rope';rope.setAttribute('aria-hidden','true');rope.innerHTML='<defs><linearGradient id="ropeColor" x1="0" x2="1"><stop offset="0" stop-color="#312e81"/><stop offset=".5" stop-color="#a5b4fc"/><stop offset="1" stop-color="#4338ca"/></linearGradient></defs><path id="rope-shadow" fill="none" stroke="#050816" stroke-width="13" stroke-linecap="round" opacity=".65"/><path id="rope-main" fill="none" stroke="url(#ropeColor)" stroke-width="9" stroke-linecap="round"/><path id="rope-shine" fill="none" stroke="#c7d2fe" stroke-width="2" stroke-linecap="round" opacity=".75"/>';document.body.appendChild(rope);const shadow=rope.querySelector('#rope-shadow'),main=rope.querySelector('#rope-main'),shine=rope.querySelector('#rope-shine');let anchorX=0,anchorY=0;const setAnchor=()=>{const r=card.getBoundingClientRect(),n=nav?nav.getBoundingClientRect():{bottom:12};anchorX=r.left+r.width/2;anchorY=Math.max(0,n.bottom+2)};const updateRope=()=>{const r=card.getBoundingClientRect(),endX=r.left+r.width/2,endY=r.top+3,dx=endX-anchorX,dy=endY-anchorY,sag=Math.min(190,Math.max(75,Math.abs(dx)*.42+Math.abs(dy)*.28+45)),cx=(anchorX+endX)/2,cy=(anchorY+endY)/2+sag,d='M '+anchorX+' '+anchorY+' Q '+cx+' '+cy+' '+endX+' '+endY;[shadow,main,shine].forEach(p=>p.setAttribute('d',d))};setAnchor();const renderCard=(e)=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform='perspective(900px) translate('+moveX+'px,'+moveY+'px) rotateX('+(-y*(pressed?8:10))+'deg) rotateY('+(x*(pressed?10:12))+'deg) scale('+(pressed?'.975':'1')+')';requestAnimationFrame(updateRope)};let ropeReturnFrame=0;const resetCard=()=>{pressed=false;moveX=0;moveY=0;card.style.transform='perspective(900px) translate(0,0) rotateX(0deg) rotateY(0deg) scale(1)';card.style.transitionDuration='.28s';cancelAnimationFrame(ropeReturnFrame);const started=performance.now();const followReturn=now=>{updateRope();if(now-started<320)ropeReturnFrame=requestAnimationFrame(followReturn)};ropeReturnFrame=requestAnimationFrame(followReturn)};card.addEventListener('pointerdown',e=>{pressed=true;startX=e.clientX-moveX;startY=e.clientY-moveY;card.style.transitionDuration='.06s';card.setPointerCapture(e.pointerId)});card.addEventListener('pointermove',e=>{if(pressed){moveX=Math.max(-85,Math.min(85,e.clientX-startX));moveY=Math.max(-55,Math.min(55,e.clientY-startY))}renderCard(e)});['pointerup','pointercancel','lostpointercapture'].forEach(evt=>card.addEventListener(evt,resetCard));card.addEventListener('pointerleave',()=>{if(!pressed)resetCard()});addEventListener('scroll',updateRope,{passive:true});addEventListener('resize',()=>{setAnchor();updateRope()});setTimeout(()=>{setAnchor();updateRope()},500)}
document.querySelectorAll('.filter-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter-btn').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.project-card').forEach(c=>c.hidden=b.dataset.filter!=='all'&&c.dataset.category!==b.dataset.filter)}));
})();