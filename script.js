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
const card=document.getElementById('id-card-3d');if(card&&!reduced){let pressed=false,startX=0,startY=0,moveX=0,moveY=0;const renderCard=(e)=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform='perspective(900px) translate('+moveX+'px,'+moveY+'px) rotateX('+(-y*(pressed?8:10))+'deg) rotateY('+(x*(pressed?10:12))+'deg) scale('+(pressed?'.975':'1')+')'};const resetCard=()=>{pressed=false;moveX=0;moveY=0;card.style.transform='perspective(900px) translate(0,0) rotateX(0deg) rotateY(0deg) scale(1)';card.style.transitionDuration='.28s'};card.addEventListener('pointerdown',e=>{pressed=true;startX=e.clientX-moveX;startY=e.clientY-moveY;card.style.transitionDuration='.06s';card.setPointerCapture(e.pointerId)});card.addEventListener('pointermove',e=>{if(pressed){moveX=Math.max(-65,Math.min(65,e.clientX-startX));moveY=Math.max(-38,Math.min(38,e.clientY-startY))}renderCard(e)});['pointerup','pointercancel','lostpointercapture'].forEach(evt=>card.addEventListener(evt,resetCard));card.addEventListener('pointerleave',()=>{if(!pressed)resetCard()})}
document.querySelectorAll('.filter-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter-btn').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.project-card').forEach(c=>c.hidden=b.dataset.filter!=='all'&&c.dataset.category!==b.dataset.filter)}));
})();