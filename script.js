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
const card=document.getElementById('id-card-3d');
if(card){
  const stage=card.closest('.hero');
  const ns='http://www.w3.org/2000/svg';
  const rope=document.createElementNS(ns,'svg');
  rope.setAttribute('class','lanyard-rope');rope.setAttribute('aria-hidden','true');
  rope.innerHTML='<path class="rope-shadow"/><path class="rope-main"/><path class="rope-highlight"/>';
  stage.insertBefore(rope,card);
  const shadow=rope.querySelector('.rope-shadow'),main=rope.querySelector('.rope-main'),highlight=rope.querySelector('.rope-highlight');
  let anchor=null,dragging=false,startX=0,startY=0,baseX=0,baseY=0,offsetX=0,offsetY=0;
  function updateRope(){
    const sr=stage.getBoundingClientRect(),cr=card.getBoundingClientRect();
    rope.setAttribute('viewBox','0 0 '+sr.width+' '+sr.height);
    rope.setAttribute('width',sr.width);rope.setAttribute('height',sr.height);
    const end={x:cr.left-sr.left+cr.width*.5,y:cr.top-sr.top+5};
    if(!anchor)anchor={x:end.x,y:end.y-112};
    const dx=end.x-anchor.x,dy=end.y-anchor.y;
    const sway=Math.max(-65,Math.min(65,dx*.48));
    const d='M '+anchor.x+' '+anchor.y+' C '+(anchor.x+sway)+' '+(anchor.y+Math.max(20,dy*.35))+' '+(end.x-sway*.35)+' '+(end.y-Math.max(12,dy*.2))+' '+end.x+' '+end.y;
    shadow.setAttribute('d',d);main.setAttribute('d',d);highlight.setAttribute('d',d);
  }
  const render=(tiltX=0,tiltY=0)=>{card.style.transform='translate3d('+offsetX+'px,'+offsetY+'px,0) perspective(900px) rotateX('+tiltX+'deg) rotateY('+tiltY+'deg)';requestAnimationFrame(updateRope)};
  requestAnimationFrame(updateRope);
  card.addEventListener('pointerdown',e=>{
    if(e.button!==0 && e.pointerType==='mouse')return;
    dragging=true;startX=e.clientX;startY=e.clientY;baseX=offsetX;baseY=offsetY;
    card.classList.add('is-dragging');card.setPointerCapture(e.pointerId);
  });
  card.addEventListener('pointermove',e=>{
    if(dragging){
      offsetX=Math.max(-240,Math.min(240,baseX+e.clientX-startX));
      offsetY=Math.max(-150,Math.min(150,baseY+e.clientY-startY));
      render(0,0);
    }else if(!reduced){
      const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      render(-y*7,x*9);
    }
  });
  const release=e=>{if(!dragging)return;dragging=false;card.classList.remove('is-dragging');if(card.hasPointerCapture(e.pointerId))card.releasePointerCapture(e.pointerId);render()};
  card.addEventListener('pointerup',release);card.addEventListener('pointercancel',release);
  window.addEventListener('resize',()=>{anchor=null;updateRope()});
}
document.querySelectorAll('.filter-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter-btn').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.project-card').forEach(c=>c.hidden=b.dataset.filter!=='all'&&c.dataset.category!==b.dataset.filter)}));
})();

// Mobile navigation
(function(){const toggle=document.querySelector('.nav-menu-toggle');const nav=document.getElementById('primary-navigation');if(!toggle||!nav)return;toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Tutup navigasi':'Buka navigasi');toggle.textContent=open?'✕':'☰'});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Buka navigasi');toggle.textContent='☰'}));})();


// Lightweight scroll choreography: depth layers and a bespoke journey progress line.
(function(){
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero=document.querySelector('.depth-hero');
  const journey=document.querySelector('.journey-section');
  if(reduce){if(journey)journey.style.setProperty('--journey-progress','100%');return}
  let ticking=false;
  function paint(){
    ticking=false;
    const y=window.scrollY||0;
    if(hero){
      const rect=hero.getBoundingClientRect();
      const travel=Math.max(-80,Math.min(80,-rect.top*.12));
      hero.style.setProperty('--hero-back-y',(travel*.45)+'px');
      hero.style.setProperty('--hero-front-y',(travel*-.75)+'px');
      hero.style.setProperty('--hero-card-y',(travel*.18)+'px');
    }
    if(journey){
      const r=journey.getBoundingClientRect();
      const vh=window.innerHeight||1;
      const progress=Math.max(0,Math.min(1,(vh*.78-r.top)/(r.height+vh*.18)));
      journey.style.setProperty('--journey-progress',(progress*100).toFixed(1)+'%');
    }
  }
  function requestPaint(){if(!ticking){ticking=true;requestAnimationFrame(paint)}}
  window.addEventListener('scroll',requestPaint,{passive:true});
  window.addEventListener('resize',requestPaint,{passive:true});
  paint();
})();
