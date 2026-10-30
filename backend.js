(() => {
  "use strict";
  const SUPABASE_URL = "https://qkexfgadhtnkgzdfbcnf.supabase.co";
  const PUBLIC_KEY = "sb_publishable_1PvhkF6IY3Ls3jsE7zF7Aw_yKCLg1h-";
  const PUBLIC_API = SUPABASE_URL + "/functions/v1/profile-public-api";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const headers = { apikey: PUBLIC_KEY, Authorization: "Bearer " + PUBLIC_KEY };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
  const showStatus = (selector, message, error=false) => {
    const node = $(selector);
    if (!node) return;
    node.textContent = message;
    node.style.color = error ? "#fca5a5" : "#93c5fd";
  };
  async function readTable(path) {
    const response = await fetch(SUPABASE_URL + "/rest/v1/" + path, { headers, cache:"no-store" });
    if (!response.ok) throw new Error("Database request failed");
    return response.json();
  }
  async function sendPublic(payload) {
    const response = await fetch(PUBLIC_API, {
      method:"POST",
      headers:{ ...headers, "Content-Type":"application/json" },
      body:JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Pengiriman gagal. Coba lagi nanti.");
    return result;
  }

  const language = {
    id: {
      nav:["Beranda","Tentang","Proyek","Pengalaman","Pencapaian","Teknologi","Musik","Kontak"],
      badge:"👋 Halo, kenalin", role:"Technology Enthusiast • Multidisciplinary Creator • Student",
      lead:"Saya senang mempelajari teknologi, membangun proyek digital, dan mengeksplorasi ide lintas bidang. Saya percaya gagasan menjadi berarti ketika mulai diwujudkan.",
      about:"Kenali Saya", work:"Lihat Karya",
      titles:["Proyek <span>Unggulan</span>","Sertifikat &amp; <span>Pencapaian</span>","Pengalaman &amp; <span>Perjalanan</span>","Tech <span>Stack</span>","Music <span>Corner</span>","Tentang <span>Saya</span>","Kebiasaan &amp; <span>Hobi</span>","Skill &amp; <span>Minat</span>","Arah yang <span>Ingin Dituju</span>","Mari <span>Terhubung</span>","Ruang <span>Interaksi</span>"],
      intros:["Karya digital yang sedang dan pernah saya kembangkan.","Bertumbuh lewat tanggung jawab, berbagi, dan mencoba hal baru."],
      filters:["Semua","Website","Aplikasi","Komunitas"],
      contactTitle:"Kirim pesan", contactIntro:"Pesan akan masuk ke inbox pribadi pemilik website.",
      guestTitle:"Guestbook", guestIntro:"Tinggalkan salam singkat. Pesan ditampilkan setelah moderasi.",
      reactionTitle:"Apa pendapatmu tentang website ini?", commentTitle:"Komentar pengunjung",
      nickname:"Nama panggilan", message:"Pesan", name:"Nama", email:"Email", subject:"Subjek",
      submit:"Kirim pesan", sendGreeting:"Kirim salam", sendComment:"Kirim komentar",
      waiting:"Memuat...", noEntries:"Belum ada pesan yang ditampilkan.", commentHint:"Komentar akan ditinjau sebelum tampil.",
      reactionLabels:["Suka","Keren","Menginspirasi","Menarik"], thanks:"Terima kasih atas reaksinya.",
      sentContact:"Pesan berhasil dikirim ke inbox pemilik.", pending:"Pesan masuk antrean moderasi.",
      limit:"Terlalu banyak percobaan. Coba lagi nanti.", footer:"Dibuat dengan ☕ & semangat."
    },
    en: {
      nav:["Home","About","Projects","Experience","Achievements","Technology","Music","Contact"],
      badge:"👋 Hello there", role:"Technology Enthusiast • Multidisciplinary Creator • Student",
      lead:"I enjoy learning technology, building digital projects, and exploring ideas across different fields. I believe ideas matter when we start turning them into action.",
      about:"About Me", work:"View Projects",
      titles:["Featured <span>Projects</span>","Certificates &amp; <span>Achievements</span>","Experience &amp; <span>Journey</span>","Tech <span>Stack</span>","Music <span>Corner</span>","About <span>Me</span>","Habits &amp; <span>Hobbies</span>","Skills &amp; <span>Interests</span>","Where I <span>Want to Go</span>","Let's <span>Connect</span>","Community <span>Space</span>"],
      intros:["Digital work I am currently developing or have explored.","Growing through responsibility, sharing, and trying new things."],
      filters:["All","Websites","Apps","Community"],
      contactTitle:"Send a message", contactIntro:"Messages are delivered to the website owner's private inbox.",
      guestTitle:"Guestbook", guestIntro:"Leave a short greeting. Messages appear after moderation.",
      reactionTitle:"What do you think about this website?", commentTitle:"Visitor comments",
      nickname:"Nickname", message:"Message", name:"Name", email:"Email", subject:"Subject",
      submit:"Send message", sendGreeting:"Send greeting", sendComment:"Send comment",
      waiting:"Loading...", noEntries:"No messages to display yet.", commentHint:"Comments are reviewed before appearing.",
      reactionLabels:["Like","Cool","Inspiring","Interesting"], thanks:"Thanks for your reaction.",
      sentContact:"Your message has reached the owner's inbox.", pending:"Your message is in the moderation queue.",
      limit:"Too many attempts. Please try again later.", footer:"Made with ☕ & determination."
    }
  };

  const setLanguage = (value) => {
    const lang = value === "en" ? "en" : "id";
    const d = language[lang];
    document.documentElement.lang = lang;
    localStorage.setItem("profile-language", lang);
    const toggle = $("#language-toggle");
    if (toggle) toggle.textContent = lang === "id" ? "EN" : "ID";
    $$(".nav-links a").forEach((node,i)=>{ if(d.nav[i])node.textContent=d.nav[i]; });
    const badge=$(".hero .badge"), role=$(".hero .role"), lead=$(".hero .lead");
    if(badge)badge.textContent=d.badge;
    if(role)role.textContent=d.role;
    if(lead)lead.textContent=d.lead;
    const heroButtons=$$(".hero-cta a");
    if(heroButtons[0])heroButtons[0].textContent=d.about;
    if(heroButtons[1])heroButtons[1].textContent=d.work;
    $$(".section-title").forEach((node,i)=>{ if(d.titles[i])node.innerHTML=d.titles[i]; });
    const introNodes=$$(".section-intro");
    introNodes.forEach((node,i)=>{if(d.intros[i])node.textContent=d.intros[i];});
    $$(".filter-btn").forEach((node,i)=>{if(d.filters[i])node.textContent=d.filters[i];});
    const ids=["contact-card-title","guestbook-card-title","reaction-card-title","comment-card-title"];
    const vals=[d.contactTitle,d.guestTitle,d.reactionTitle,d.commentTitle];
    ids.forEach((id,i)=>{const n=$("#"+id);if(n)n.textContent=vals[i];});
    $$(".i18n-nickname").forEach(n=>n.textContent=d.nickname);
    $$(".i18n-message").forEach(n=>n.textContent=d.message);
    $$(".i18n-name").forEach(n=>n.textContent=d.name);
    $$(".i18n-email").forEach(n=>n.textContent=d.email);
    $$(".i18n-subject").forEach(n=>n.textContent=d.subject);
    const button=$("#contact-submit");if(button)button.textContent=d.submit;
    const gb=$("#guestbook-submit");if(gb)gb.textContent=d.sendGreeting;
    const cm=$("#comment-submit");if(cm)cm.textContent=d.sendComment;
    const guestDesc=$("#guestbook-intro");if(guestDesc)guestDesc.textContent=d.guestIntro;
    const contactDesc=$("#contact-intro");if(contactDesc)contactDesc.textContent=d.contactIntro;
    const commentHint=$("#comment-hint");if(commentHint)commentHint.textContent=d.commentHint;
    const footer=$(".footer p");if(footer)footer.lastChild.textContent=" "+d.footer;
    if(window.renderDynamicProjects)window.renderDynamicProjects(lang);
    if(window.renderReactionButtons)window.renderReactionButtons(lang);
    const t=(selector,values)=>{$(selector).forEach((node,i)=>{if(values[i]!==undefined)node.textContent=values[i];});};
    if(lang==="en"){
      t(".empty-certificate h3",["The journey is still unfolding"]);
      t(".empty-certificate p",["Certificates will be added as they become available."]);
      t(".journey-stop small",["LEADERSHIP","CONTRIBUTION","EXPERIMENTATION"]);
      t(".journey-stop h3",["Learning to take responsibility","Sharing knowledge","Turning ideas into projects"]);
      t(".journey-stop p",[
        "Experience as an organization secretary, chairperson, and community initiator. Organization names are omitted for privacy.",
        "Supporting younger students in learning and taking part in social and community activities.",
        "Building digital projects as a space for practice, experimentation, and continuous learning."
      ]);
      t(".music-card small",["SPOTIFY FEATURED TRACK"]);
      t(".music-card h3",["Carol of the Bells"]);
      t(".music-card p",["An orchestral atmosphere to accompany creative work."]);
      t(".music-card a",["Open playlist on Spotify ↗"]);
      t(".quote blockquote",["“Do not just dream of becoming great. Prove it through action, even when the steps are small and difficult.”"]);
      t(".quote cite",["— My life motto"]);
      t(".about-grid .card h3",["🧑‍💻 Who I am","🎮 Everyday life","✍️ Creative side"]);
      t(".about-grid .card p",[
        "My name is M. Rizki Amalludin, a student enthusiastic about technology. I enjoy experimenting with new things, especially programming and artificial intelligence.",
        "My days include coding while learning new things, playing games for fun, and watching films or series to unwind.",
        "Beyond technology, I also enjoy writing poetry and short stories. Writing is a quiet way to preserve ideas and feelings."
      ]);
      t(".values-title",["Values I believe in"]);
      t(".values-grid span",["📚 Keep learning","✍️ Dare to create","🌱 Keep growing","🤝 Be helpful"]);
      t(".habit-grid .habit h3",["Coding","Gaming","Watching films","Technology & AI","Design","Writing","Reading & learning"]);
      t(".habit-grid .habit p",[
        "Trying new ideas, building small projects, and learning about technology.",
        "A way to have fun while practicing strategy and focus.",
        "Spending free time with favourite films and series.",
        "Following AI developments and exploring its possibilities.",
        "Designing interfaces with Figma, Canva, and other visual experiments.",
        "Writing poetry and short stories as a creative outlet.",
        "Gathering new knowledge to see things from different perspectives."
      ]);
      t(".skill-wrap .card h3",["🎨 Design","⌨️ Technology","✍️ Creative"]);
      t(".dream-grid .dream h3",["Keep developing myself","Make a positive impact"]);
      t(".dream-grid .dream p",[
        "Building discipline, knowledge, and skills one step at a time.",
        "Using the abilities I have to help others."
      ]);
      t(".dream-tagline",["“I do not have to be great right away. What matters is to keep moving.”"]);
      const contact=$("#kontak .contact > p");
      if(contact)contact.textContent="Have an idea, a collaboration offer, or just want to talk? Feel free to reach out.";
    }else{
      t(".empty-certificate h3",["Perjalanan masih berjalan"]);
      t(".empty-certificate p",["Sertifikat akan ditambahkan saat sudah tersedia."]);
      t(".journey-stop small",["KEPEMIMPINAN","KONTRIBUSI","EKSPERIMEN"]);
      t(".journey-stop h3",["Belajar memegang tanggung jawab","Berbagi pengetahuan","Mewujudkan ide menjadi proyek"]);
      t(".journey-stop p",[
        "Pengalaman sebagai sekretaris organisasi, ketua, dan penggagas komunitas. Nama organisasi tidak ditampilkan untuk menjaga privasi.",
        "Mendampingi adik tingkat belajar dan ikut dalam kegiatan sosial serta komunitas.",
        "Mengembangkan proyek digital sebagai ruang latihan, eksperimen, dan pembelajaran berkelanjutan."
      ]);
      t(".music-card small",["SPOTIFY FEATURED TRACK"]);
      t(".music-card h3",["Carol of the Bells"]);
      t(".music-card p",["Nuansa orkestra yang megah untuk menemani waktu berkarya."]);
      t(".music-card a",["Buka playlist di Spotify ↗"]);
      t(".quote blockquote",["“Jangan cuma bermimpi menjadi orang hebat. Buktikan lewat tindakan, meski kecil dan melelahkan.”"]);
      t(".quote cite",["— Moto hidup saya"]);
      t(".about-grid .card h3",["🧑‍💻 Siapa saya","🎮 Kebiasaan sehari-hari","✍️ Sisi kreatif"]);
      t(".about-grid .card p",[
        "Nama saya M. Rizki Amalludin, seorang pelajar yang antusias di dunia teknologi. Saya suka bereksperimen dengan hal-hal baru, terutama yang berhubungan dengan pemrograman dan kecerdasan buatan.",
        "Hari-hari saya diisi ngoding sambil belajar hal baru, main game untuk mengisi waktu, dan nonton film atau serial buat melepas penat.",
        "Selain teknologi, saya juga senang menciptakan puisi dan cerpen. Menulis bagi saya cara tenang menyimpan ide dan perasaan."
      ]);
      t(".values-title",["Nilai yang saya pegang"]);
      t(".values-grid span",["📚 Terus belajar","✍️ Berani berkarya","🌱 Bertumbuh","🤝 Bermanfaat"]);
      t(".habit-grid .habit h3",["Ngoding","Main Game","Nonton Film","Teknologi & AI","Desain","Menulis","Membaca & belajar"]);
      t(".habit-grid .habit p",[
        "Mencoba ide baru, bikin proyek kecil, dan terus belajar teknologi terbaru.",
        "Tempat saya bersenang-senang sekaligus melatih strategi dan fokus.",
        "Mengisi waktu luang dengan film dan serial favorit.",
        "Mengikuti perkembangan AI dan membayangkan seperti apa masa depannya.",
        "Mendesain tampilan dengan Figma, Canva, dan eksperimen visual lainnya.",
        "Menciptakan puisi dan cerpen sebagai ruang kreativitas.",
        "Mengumpulkan pengetahuan baru agar bisa melihat sesuatu dari sudut pandang berbeda."
      ]);
      t(".skill-wrap .card h3",["🎨 Desain","⌨️ Teknologi","✍️ Kreatif"]);
      t(".dream-grid .dream h3",["Terus mengembangkan diri","Memberi manfaat"]);
      t(".dream-grid .dream p",[
        "Melatih disiplin, pengetahuan, dan keterampilan sedikit demi sedikit.",
        "Menggunakan kemampuan yang saya punya untuk membantu sesama."
      ]);
      t(".dream-tagline",["“Tidak harus langsung hebat. Yang penting, terus melangkah.”"]);
      const contact=$("#kontak .contact > p");
      if(contact)contact.textContent="Punya ide, tawaran kolaborasi, atau sekadar mau ngobrol? Silakan hubungi saya.";
    }
    loadReactions();
  };

  const projectState = { id:[], en:[] };
  window.renderDynamicProjects = (lang="id") => {
    const grid=$(".project-grid");
    if(!grid || !projectState.id.length)return;
    const rows=projectState.id;
    const html=rows.map(row=>{
      const title=lang==="en"?(row.title_en||row.title_id):row.title_id;
      const body=lang==="en"?(row.body_en||row.body_id):row.body_id;
      const data=row.data||{};
      const category=["web","app","community"].includes(data.category)?data.category:"web";
      const label=escapeHtml(data.label||"PROJECT");
      const url=typeof data.url==="string"&&/^https:\/\//i.test(data.url)?data.url:null;
      const link=url?'<a href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">'+(lang==="en"?"Visit project ↗":"Kunjungi proyek ↗")+'</a>':'<span class="project-status">'+escapeHtml(data.statusLabel||"Konsep")+'</span>';
      return '<article class="project-card reveal visible" data-category="'+category+'"><span class="project-icon">✦</span><small>'+label+'</small><h3>'+escapeHtml(title)+'</h3><p>'+escapeHtml(body)+'</p>'+link+'</article>';
    }).join("");
    grid.innerHTML=html;
  };

  async function loadProjects(){
    try{
      const rows=await readTable("profile_content?select=slug,title_id,title_en,body_id,body_en,data,sort_order&content_type=eq.project&status=eq.published&order=sort_order.asc");
      if(Array.isArray(rows)&&rows.length){
        projectState.id=rows;
        projectState.en=rows;
        window.renderDynamicProjects(document.documentElement.lang||"id");
      }
    }catch(error){console.warn("Project content is using the static fallback.",error);}
  }

  function getVisitorToken(){
    let token=localStorage.getItem("profile-visitor-token");
    if(!token){token=crypto.randomUUID();localStorage.setItem("profile-visitor-token",token);}
    return token;
  }

  const reactionTypes=["like","cool","inspiring","interesting"];
  window.renderReactionButtons=(lang="id")=>{
    const wrap=$("#reaction-buttons");if(!wrap)return;
    const labels=language[lang].reactionLabels;
    const icons=["♡","✦","✧","◎"];
    wrap.innerHTML=reactionTypes.map((type,i)=>'<button class="reaction-button" type="button" data-reaction="'+type+'">'+icons[i]+' '+labels[i]+' <span id="count-'+type+'">0</span></button>').join("");
    wrap.querySelectorAll("[data-reaction]").forEach(button=>button.addEventListener("click",async()=>{
      button.disabled=true;
      try{
        await sendPublic({type:"reaction",content_slug:"home",reaction_type:button.dataset.reaction,visitor_token:getVisitorToken()});
        showStatus("#reaction-status",language[document.documentElement.lang==="en"?"en":"id"].thanks);
        await loadReactions();
      }catch(error){showStatus("#reaction-status",error.message,true);}
      finally{button.disabled=false;}
    }));
  };

  async function loadReactions(){
    try{
      const rows=await readTable("reactions?select=reaction_type&content_slug=eq.home");
      const counts=Object.fromEntries(reactionTypes.map(t=>[t,0]));
      rows.forEach(row=>{if(counts[row.reaction_type]!==undefined)counts[row.reaction_type]++;});
      Object.entries(counts).forEach(([type,count])=>{const n=$("#count-"+type);if(n)n.textContent=String(count);});
    }catch(error){console.warn("Reaction counts unavailable.",error);}
  }

  function renderEntries(selector,rows){
    const node=$(selector);if(!node)return;
    const lang=document.documentElement.lang==="en"?"en":"id";
    if(!rows.length){node.innerHTML='<p class="empty-state">'+language[lang].noEntries+'</p>';return;}
    node.innerHTML=rows.map(row=>'<article class="public-entry"><strong>'+escapeHtml(row.nickname)+'</strong><p>'+escapeHtml(row.message)+'</p><time>'+new Date(row.created_at).toLocaleDateString(lang==="en"?"en-US":"id-ID")+'</time></article>').join("");
  }
  async function loadGuestbook(){
    const node=$("#guestbook-list");if(node)node.innerHTML='<p class="empty-state">'+language[document.documentElement.lang==="en"?"en":"id"].waiting+'</p>';
    try{renderEntries("#guestbook-list",await readTable("guestbook_entries?select=nickname,message,created_at&status=eq.approved&order=created_at.desc&limit=20"));}
    catch(error){if(node)node.innerHTML='<p class="empty-state">Guestbook belum bisa dimuat.</p>';console.warn(error);}
  }
  async function loadComments(){
    const node=$("#comments-list");if(node)node.innerHTML='<p class="empty-state">'+language[document.documentElement.lang==="en"?"en":"id"].waiting+'</p>';
    try{renderEntries("#comments-list",await readTable("comments?select=nickname,message,created_at&content_slug=eq.home&status=eq.approved&order=created_at.desc&limit=30"));}
    catch(error){if(node)node.innerHTML='<p class="empty-state">Komentar belum bisa dimuat.</p>';console.warn(error);}
  }

  function bindForm(id,kind,buildPayload,statusSelector){
    const form=$("#"+id);if(!form)return;
    form.addEventListener("submit",async(event)=>{
      event.preventDefault();
      const button=form.querySelector("button[type=submit]");if(button)button.disabled=true;
      showStatus(statusSelector,"Mengirim...");
      try{
        const result=await sendPublic({type:kind,...buildPayload(new FormData(form))});
        form.reset();
        const lang=document.documentElement.lang==="en"?"en":"id";
        const message=kind==="contact"?language[lang].sentContact:(result.status==="approved"?(lang==="en"?"Your message is now visible.":"Pesan berhasil ditampilkan."):(lang==="en"?"Your message is awaiting review.":"Pesan menunggu pemeriksaan."));
        showStatus(statusSelector,message);
        if(kind==="guestbook")await loadGuestbook();
        if(kind==="comment")await loadComments();
      }catch(error){showStatus(statusSelector,error.message,true);}
      finally{if(button)button.disabled=false;}
    });
  }

  function init(){
    const saved=localStorage.getItem("profile-language")||"id";
    setLanguage(saved);
    const toggle=$("#language-toggle");
    if(toggle)toggle.addEventListener("click",()=>setLanguage(document.documentElement.lang==="id"?"en":"id"));
    bindForm("contact-form","contact",f=>({name:f.get("name"),email:f.get("email"),subject:f.get("subject"),message:f.get("message"),website:f.get("website")}),"#contact-status");
    bindForm("guestbook-form","guestbook",f=>({nickname:f.get("nickname"),message:f.get("message"),website:f.get("website")}),"#guestbook-status");
    bindForm("comment-form","comment",f=>({content_slug:"home",nickname:f.get("nickname"),message:f.get("message"),website:f.get("website")}),"#comment-status");
    window.renderReactionButtons(saved);
    loadProjects();loadGuestbook();loadComments();loadReactions();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();