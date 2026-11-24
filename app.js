// Frontend starter: documents persist locally using IndexedDB.
// Later lessons will replace this local storage with a database on the server.
const subjectList=[
 {name:"Physiology",emoji:"🫀",color:"#f3e4e8"},
 {name:"Endocrinology",emoji:"🧬",color:"#ebe7f5"},
 {name:"HIV & Infectious Disease",emoji:"🦠",color:"#e6efe7"},
 {name:"Medical Ethics",emoji:"⚖️",color:"#f7eadb"},
 {name:"Communication Skills",emoji:"💬",color:"#e5ebf5"},
 {name:"Assignments",emoji:"✍️",color:"#f4e5ef"},
 {name:"Other",emoji:"📁",color:"#eee9e3"}
];
let items=[],filter="all",currentSubject=null,db;
const openDB=indexedDB.open("DrMigwamboDocs",1);
openDB.onupgradeneeded=e=>{const database=e.target.result;if(!database.objectStoreNames.contains("files"))database.createObjectStore("files",{keyPath:"id"})};
openDB.onsuccess=e=>{db=e.target.result;load()};
function load(){const request=db.transaction("files","readonly").objectStore("files").getAll();request.onsuccess=()=>{items=request.result;render()}}
function persist(item){const tx=db.transaction("files","readwrite");tx.objectStore("files").put(item);tx.oncomplete=load}
function removeItem(id){const tx=db.transaction("files","readwrite");tx.objectStore("files").delete(id);tx.oncomplete=load}
function safe(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function fileIcon(type){if(type.includes("pdf"))return"📕";if(type.includes("presentation")||type.includes("powerpoint"))return"📊";if(type.includes("word"))return"📝";if(type.includes("image"))return"🖼️";return"📄"}
function sizeLabel(n){return n<1024?n+" B":n<1048576?(n/1024).toFixed(1)+" KB":(n/1048576).toFixed(1)+" MB"}
function render(){
 document.querySelector("#total").textContent=items.length;
 document.querySelector("#favorites").textContent=items.filter(x=>x.favorite).length;
 document.querySelector("#collections").textContent=new Set(items.map(x=>x.subject)).size;
 document.querySelector("#categories").innerHTML=subjectList.map(s=>`<div class="category" data-subject="${safe(s.name)}"><div class="emoji">${s.emoji}</div><b>${safe(s.name)}</b><small>${items.filter(i=>i.subject===s.name).length} files</small></div>`).join("");
 document.querySelector("#categoryNav").innerHTML=subjectList.map(s=>`<button class="category-nav" data-subject="${safe(s.name)}">${s.emoji} &nbsp;${safe(s.name)}</button>`).join("");
 document.querySelectorAll("[data-subject]").forEach(el=>el.onclick=()=>{filter="subject";currentSubject=el.dataset.subject;renderList()});
 document.querySelectorAll("[data-filter]").forEach(el=>el.onclick=()=>{filter=el.dataset.filter;currentSubject=null;document.querySelectorAll(".nav").forEach(b=>b.classList.remove("active"));el.classList.add("active");renderList()});
 renderList();
}
function renderList(){
 let q=document.querySelector("#search").value.toLowerCase(),list=[...items];
 if(filter==="favorites")list=list.filter(i=>i.favorite);
 if(filter==="subject")list=list.filter(i=>i.subject===currentSubject);
 list=list.filter(i=>(i.title+" "+i.filename+" "+i.subject).toLowerCase().includes(q));
 if(document.querySelector("#sort").value==="name")list.sort((a,b)=>a.title.localeCompare(b.title));else list.sort((a,b)=>b.created-a.created);
 document.querySelector("#listTitle").textContent=filter==="favorites"?"Favorites":filter==="subject"?currentSubject:"My documents";
 const grid=document.querySelector("#documentGrid");
 if(!list.length){grid.innerHTML=`<div class="empty"><div style="font-size:36px">🌱</div><b>No documents here yet</b><p>Add a document or adjust your search.</p></div>`;return}
 grid.innerHTML=list.map(d=>`<article class="document"><div class="doc-top"><div class="file-icon">${fileIcon(d.type)}</div><button class="favorite ${d.favorite?"is-fav":""}" data-fav="${d.id}">${d.favorite?"★":"☆"}</button></div><h4>${safe(d.title)}</h4><div class="meta">${safe(d.filename)} · ${sizeLabel(d.size)}<br>${new Date(d.created).toLocaleDateString()}</div><div class="doc-actions"><span class="tag">${safe(d.subject)}</span><button data-open="${d.id}">Open ↗</button><button data-remove="${d.id}">Delete</button></div></article>`).join("");
 document.querySelectorAll("[data-fav]").forEach(b=>b.onclick=()=>{let item=items.find(x=>x.id===b.dataset.fav);item.favorite=!item.favorite;persist(item)});
 document.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{const item=items.find(x=>x.id===b.dataset.open);const url=URL.createObjectURL(item.fileBlob);const a=document.createElement("a");a.href=url;a.download=item.filename;a.target="_blank";a.click();setTimeout(()=>URL.revokeObjectURL(url),60000)});
 document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{if(confirm("Delete this document from your library?"))removeItem(b.dataset.remove)});
}
const dialog=document.querySelector("#uploadDialog");
document.querySelector("#docCategory").innerHTML=subjectList.map(s=>`<option>${safe(s.name)}</option>`).join("");
document.querySelector("#addBtn").onclick=()=>dialog.showModal();
document.querySelector("#cancel").onclick=()=>dialog.close();
document.querySelector("#search").oninput=renderList;
document.querySelector("#sort").onchange=renderList;
document.querySelector("#uploadForm").onsubmit=e=>{
 e.preventDefault();const file=document.querySelector("#docFile").files[0];if(!file)return;
 const title=document.querySelector("#docName").value.trim()||file.name;
 persist({id:crypto.randomUUID(),title,filename:file.name,type:file.type||"file",size:file.size,subject:document.querySelector("#docCategory").value,created:Date.now(),favorite:false,fileBlob:file});
 e.target.reset();dialog.close();
};
// A small API request to our Node server demonstrates frontend/backend communication.
fetch("/api/hello").then(r=>r.json()).then(data=>console.log(data.message)).catch(()=>console.log("Server API not connected yet."));
