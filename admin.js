(() => {
"use strict";
const URL="https://qkexfgadhtnkgzdfbcnf.supabase.co";
const KEY="sb_publishable_1PvhkF6IY3Ls3jsE7zF7Aw_yKCLg1h-";
const OWNER="rizkiamalludin99@gmail.com";
const STORE="profile-admin-session";
const $=s=>document.querySelector(s);
const status=(id,msg,error=false)=>{const n=$("#"+id);if(n){n.textContent=msg;n.classList.toggle("error",error);}};
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let session=null;

function store(s){session=s;sessionStorage.setItem(STORE,JSON.stringify(s));}
function loadStored(){try{session=JSON.parse(sessionStorage.getItem(STORE)||"null");}catch{session=null;}}
function authHeaders(){return {apikey:KEY,Authorization:"Bearer "+session.access_token,"Content-Type":"application/json"};}
async function refreshSession(){
 if(!session?.refresh_token)return false;
 const r=await fetch(URL+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{apikey:KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:session.refresh_token})});
 if(!r.ok){sessionStorage.removeItem(STORE);session=null;return false;}
 const refreshed=await r.json();store({...refreshed,expires_at:Math.floor(Date.now()/1000)+(refreshed.expires_in||3600)});return true;
}
async function ensureSession(){
 if(!session?.access_token)return false;
 if(session.expires_at&&Date.now()/1000>session.expires_at-120)return await refreshSession();
 return true;
}
async function api(path,options={}){
 if(!await ensureSession())throw new Error("Sesi login berakhir. Silakan masuk kembali.");
 const r=await fetch(URL+"/rest/v1/"+path,{...options,headers:{...authHeaders(),...(options.headers||{})}});
 if(!r.ok){const t=await r.text();throw new Error("Database: "+t.slice(0,180));}
 return r.status===204?null:r.json().catch(()=>null);
}
async function sendOtp(email){
 const r=await fetch(URL+"/auth/v1/otp",{method:"POST",headers:{apikey:KEY,"Content-Type":"application/json"},body:JSON.stringify({email,create_user:true})});
 if(!r.ok)throw new Error((await r.text()).slice(0,220));
}
async function verifyOtp(email,token){
 const r=await fetch(URL+"/auth/v1/verify",{method:"POST",headers:{apikey:KEY,"Content-Type":"application/json"},body:JSON.stringify({email,token,type:"email"})});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(data.msg||data.message||"Kode verifikasi tidak valid.");
 if((data.user?.email||"").toLowerCase()!==OWNER){await fetch(URL+"/auth/v1/logout",{method:"POST",headers:{apikey:KEY,Authorization:"Bearer "+data.access_token}});throw new Error("Akun ini bukan pemilik website.");}
 store({...data,expires_at:Math.floor(Date.now()/1000)+(data.expires_in||3600)});
}
function setDashboard(visible){
 $("#auth-panel").classList.toggle("hidden",visible);
 $("#dashboard").classList.toggle("hidden",!visible);
 if(visible){$("#session-email").textContent="Login sebagai "+(session.user?.email||OWNER);loadAll();}
}
function parseHashSession(){
 if(!location.hash.includes("access_token="))return;
 const hash=new URLSearchParams(location.hash.slice(1));
 const access=hash.get("access_token");if(!access)return;
 const expires=Number(hash.get("expires_in")||3600);
 store({access_token:access,refresh_token:hash.get("refresh_token"),expires_at:Math.floor(Date.now()/1000)+expires,user:{}});
 history.replaceState(null,"",location.pathname+location.search);
}
async function exchangeAuthCode(){
 const code=new URLSearchParams(location.search).get("code");
 if(!code)return false;
 const verifier=sessionStorage.getItem("profile-admin-pkce-verifier");
 if(!verifier)throw new Error("Sesi OAuth tidak ditemukan. Coba login kembali.");
 const response=await fetch(URL+"/auth/v1/token?grant_type=pkce",{
  method:"POST",headers:{apikey:KEY,"Content-Type":"application/json"},
  body:JSON.stringify({auth_code:code,code_verifier:verifier})
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.msg||data.message||"Login Google gagal.");
 store({...data,expires_at:Math.floor(Date.now()/1000)+(data.expires_in||3600)});
 sessionStorage.removeItem("profile-admin-pkce-verifier");
 history.replaceState(null,"",location.pathname+location.hash);
 return true;
}
async function validateCurrentUser(){
 if(!await ensureSession())return false;
 const response=await fetch(URL+"/auth/v1/user",{headers:{apikey:KEY,Authorization:"Bearer "+session.access_token}});
 if(!response.ok)return false;
 const user=await response.json().catch(()=>null);
 if(!user || (user.email||"").toLowerCase()!==OWNER)return false;
 session.user=user;
 store(session);
 return true;
}
async function beginGoogleLogin(){
 const random=new Uint8Array(32);crypto.getRandomValues(random);
 const verifier=[...random].map(b=>b.toString(16).padStart(2,"0")).join("");
 const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(verifier));
 const bytes=String.fromCharCode(...new Uint8Array(digest));
 const challenge=btoa(bytes).replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=+$/,"");
 sessionStorage.setItem("profile-admin-pkce-verifier",verifier);
 const redirect=location.origin+location.pathname;
 const url=new URL(URL+"/auth/v1/authorize");
 url.searchParams.set("provider","google");
 url.searchParams.set("redirect_to",redirect);
 url.searchParams.set("code_challenge",challenge);
 url.searchParams.set("code_challenge_method","s256");
 location.assign(url.toString());
}
async function signOut(){try{if(session?.access_token)await fetch(URL+"/auth/v1/logout",{method:"POST",headers:authHeaders()});}catch{}sessionStorage.removeItem(STORE);session=null;setDashboard(false);}

async function loadAll(){await Promise.allSettled([loadStats(),loadContent(),loadInbox(),loadModeration("guestbook_entries","guestbook-admin-list"),loadModeration("comments","comments-admin-list")]);}
async function count(path){const rows=await api(path);return rows.length;}
async function loadStats(){
 const [content,inbox,guest,comments]=await Promise.all([
  count("profile_content?select=id"),
  count("contact_messages?select=id&status=eq.unread"),
  count("guestbook_entries?select=id&status=eq.pending"),
  count("comments?select=id&status=eq.pending")
 ]);
 $("#stat-content").textContent=content;$("#stat-inbox").textContent=inbox;$("#stat-guestbook").textContent=guest;$("#stat-comments").textContent=comments;
}
async function loadContent(){
 const rows=await api("profile_content?select=id,content_type,slug,title_id,title_en,body_id,body_en,data,status,sort_order&order=sort_order.asc");
 const list=$("#content-list");
 list.innerHTML=rows.length?rows.map(row=>'<article class="list-item"><strong>'+esc(row.title_id||row.slug)+'</strong><small>'+esc(row.content_type)+' · '+esc(row.status)+' · <span class="code">'+esc(row.slug)+'</span></small><div class="item-actions"><button data-edit="'+esc(row.id)+'">Edit</button></div></article>').join(''):'<div class="empty">Belum ada konten.</div>';
 list.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>fillContent(rows.find(r=>r.id===b.dataset.edit))));
}
function fillContent(row){
 $("#content-id").value=row?.id||"";$("#content-type").value=row?.content_type||"project";$("#content-slug").value=row?.slug||"";
 $("#title-id").value=row?.title_id||"";$("#title-en").value=row?.title_en||"";$("#body-id").value=row?.body_id||"";$("#body-en").value=row?.body_en||"";
 $("#content-data").value=JSON.stringify(row?.data||{},null,2);$("#content-status").value=row?.status||"draft";
 $("#content-status-message").textContent=row?"Mengedit "+row.slug:"Buat konten baru.";
}
async function saveContent(event){
 event.preventDefault();
 let data;try{data=JSON.parse($("#content-data").value||"{}");if(!data||Array.isArray(data)||typeof data!=="object")throw new Error();}catch{status("content-status-message","Data tambahan harus berupa objek JSON.",true);return;}
 const id=$("#content-id").value;
 const row={content_type:$("#content-type").value,slug:$("#content-slug").value.trim(),title_id:$("#title-id").value.trim(),title_en:$("#title-en").value.trim(),body_id:$("#body-id").value,body_en:$("#body-en").value,data,status:$("#content-status").value};
 try{
  const r=await api(id?"profile_content?id=eq."+encodeURIComponent(id):"profile_content",{method:id?"PATCH":"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify(row)});
  status("content-status-message","Konten tersimpan. Preview website akan memakai konten Published.");
  fillContent(null);await loadContent();await loadStats();
 }catch(e){status("content-status-message",e.message,true);}
}
async function loadInbox(){
 const rows=await api("contact_messages?select=id,sender_name,sender_email,subject,message,status,created_at&order=created_at.desc&limit=100");
 $("#inbox-list").innerHTML=rows.length?rows.map(row=>'<article class="list-item"><div class="row"><strong>'+esc(row.subject)+'</strong><small>'+esc(row.status)+'</small></div><small>'+esc(row.sender_name)+' · '+esc(row.sender_email)+' · '+new Date(row.created_at).toLocaleString("id-ID")+'</small><p class="message-body">'+esc(row.message)+'</p><div class="item-actions"><button data-mail="'+esc(row.id)+'">Balas via email</button><button data-status="read" data-id="'+esc(row.id)+'">Tandai dibaca</button><button data-status="archived" data-id="'+esc(row.id)+'">Arsipkan</button></div></article>').join(''):'<div class="empty">Inbox masih kosong.</div>';
 $("#inbox-list").querySelectorAll("[data-mail]").forEach(b=>b.addEventListener("click",()=>{const row=rows.find(x=>x.id===b.dataset.mail);location.href="mailto:"+encodeURIComponent(row.sender_email)+"?subject="+encodeURIComponent("Re: "+row.subject);}));
 $("#inbox-list").querySelectorAll("[data-status]").forEach(b=>b.addEventListener("click",async()=>{await api("contact_messages?id=eq."+encodeURIComponent(b.dataset.id),{method:"PATCH",headers:{"Prefer":"return=minimal"},body:JSON.stringify({status:b.dataset.status})});await loadInbox();await loadStats();}));
}
async function loadModeration(table,target){
 const rows=await api(table+"?select=id,nickname,message,status,created_at"+(table==="comments"?",content_slug":"")+"&order=created_at.desc&limit=100");
 $("#"+target).innerHTML=rows.length?rows.map(row=>'<article class="list-item"><div class="row"><strong>'+esc(row.nickname)+'</strong><small>'+esc(row.status)+'</small></div><small>'+new Date(row.created_at).toLocaleString("id-ID")+(row.content_slug?" · "+esc(row.content_slug):"")+'</small><p class="message-body">'+esc(row.message)+'</p><div class="item-actions"><button class="approve" data-action="approved" data-id="'+esc(row.id)+'">Setujui</button><button class="hide" data-action="hidden" data-id="'+esc(row.id)+'">Sembunyikan</button><button class="delete" data-action="delete" data-id="'+esc(row.id)+'">Hapus</button></div></article>').join(''):'<div class="empty">Belum ada kiriman.</div>';
 $("#"+target).querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",async()=>{
  const action=b.dataset.action;
  const url=table+"?id=eq."+encodeURIComponent(b.dataset.id);
  await api(url,{method:action==="delete"?"DELETE":"PATCH",headers:{"Prefer":"return=minimal"},body:action==="delete"?undefined:JSON.stringify({status:action})});
  await loadModeration(table,target);await loadStats();
 }));
}
async function githubSync(){
 const button=$("#github-sync");button.disabled=true;status("github-status","Mengambil daftar repository publik GitHub...");
 try{
  const response=await fetch("https://api.github.com/users/rizkiamalludin/repos?per_page=100&sort=updated");
  if(!response.ok)throw new Error("GitHub API tidak bisa diakses saat ini.");
  const repos=await response.json();
  const current=await api("profile_content?select=slug&content_type=eq.project");
  const known=new Set(current.map(x=>x.slug));
  const drafts=repos.filter(r=>!r.fork&&!known.has("github-"+r.name.toLowerCase().replace(/[^a-z0-9-]/g,"-"))).map(r=>({
   content_type:"project",slug:"github-"+r.name.toLowerCase().replace(/[^a-z0-9-]/g,"-").slice(0,65),
   title_id:r.name,title_en:r.name,body_id:r.description||"Repository GitHub.",body_en:r.description||"GitHub repository.",
   data:{url:r.html_url,category:"web",label:"GITHUB REPOSITORY",stars:r.stargazers_count,forks:r.forks_count,language:r.language,default_branch:r.default_branch,updated_at:r.updated_at},
   status:"draft",sort_order:1000
  }));
  if(drafts.length)await api("profile_content?on_conflict=slug",{method:"POST",headers:{"Prefer":"resolution=ignore-duplicates,return=minimal"},body:JSON.stringify(drafts)});
  const log={repository:"rizkiamalludin/*",branch:null,commit_sha:null,sync_status:"success",summary:"Fetched "+repos.length+" public repositories; saved "+drafts.length+" new entries as drafts."};
  await api("github_sync_log",{method:"POST",body:JSON.stringify(log)});
  $("#github-results").innerHTML=repos.slice(0,30).map(r=>'<div class="github-row"><span>'+esc(r.name)+'</span><small>★ '+r.stargazers_count+' · '+esc(r.language||"—")+'</small></div>').join("");
  status("github-status","Selesai: "+repos.length+" repository terbaca, "+drafts.length+" entry baru tersimpan sebagai draft.");
  await loadContent();await loadStats();
 }catch(e){status("github-status",e.message,true);}
 finally{button.disabled=false;}
}
function initTabs(){
 document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));
  document.querySelectorAll(".tab-panel").forEach(p=>p.classList.toggle("hidden",p.id!=="tab-"+b.dataset.tab));
 }));
}
async function init(){
 try{
  await exchangeAuthCode();
  parseHashSession();
  loadStored();
  if(session?.access_token){
   if(await validateCurrentUser())setDashboard(true);
   else {await signOut();status("auth-status","Akses ditolak. Gunakan email pemilik yang terverifikasi.",true);}
  }
 }catch(error){status("auth-status",error.message,true);sessionStorage.removeItem(STORE);session=null;}
 $("#otp-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const email=$("#admin-email").value.trim().toLowerCase();
  if(email!==OWNER){status("auth-status","Email tidak masuk daftar pemilik.",true);return;}
  $("#send-otp").disabled=true;
  try{await sendOtp(email);$("#verify-form").classList.remove("hidden");status("auth-status","Kode OTP dikirim. Periksa inbox dan folder spam.");}
  catch(err){status("auth-status",err.message,true);}
  finally{$("#send-otp").disabled=false;}
 });
 $("#verify-form").addEventListener("submit",async e=>{
  e.preventDefault();
  try{
   await verifyOtp($("#admin-email").value.trim().toLowerCase(),$("#admin-otp").value.trim());
   if(await validateCurrentUser()){status("auth-status","Login berhasil.");setDashboard(true);}
   else {await signOut();throw new Error("Akun tidak lolos verifikasi pemilik.");}
  }catch(err){status("auth-status",err.message,true);}
 });
 $("#google-login").addEventListener("click",async()=>{
  const button=$("#google-login");button.disabled=true;
  try{await beginGoogleLogin();}catch(err){status("auth-status",err.message,true);button.disabled=false;}
 });
 $("#sign-out").addEventListener("click",signOut);
 $("#new-content").addEventListener("click",()=>fillContent(null));
 $("#content-form").addEventListener("submit",saveContent);
 $("#github-sync").addEventListener("click",githubSync);
 initTabs();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{init().catch(e=>status("auth-status",e.message,true));});else init().catch(e=>status("auth-status",e.message,true));
})();