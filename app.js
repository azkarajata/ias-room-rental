const rooms = [
  {id:1,name:"Meeting Room A",capacity:12,price:350000,facility:"AC • Wi-Fi • TV",desc:"Ruangan meeting nyaman untuk rapat internal, koordinasi, dan diskusi tim."},
  {id:2,name:"Meeting Room B",capacity:20,price:500000,facility:"AC • Wi-Fi • Projector",desc:"Ruang berkapasitas lebih besar untuk meeting dan presentasi perusahaan."},
  {id:3,name:"Training Room",capacity:40,price:850000,facility:"AC • Wi-Fi • Projector • Sound",desc:"Ruang luas untuk training, workshop, sosialisasi, dan kegiatan kelompok."},
  {id:4,name:"Executive Room",capacity:8,price:450000,facility:"AC • Wi-Fi • TV • Pantry",desc:"Ruangan privat dengan suasana profesional untuk pertemuan terbatas."},
  {id:5,name:"Multipurpose Hall",capacity:80,price:1500000,facility:"AC • Sound • Projector",desc:"Area serbaguna untuk acara perusahaan, gathering, dan kegiatan skala besar."},
  {id:6,name:"Co-working Room",capacity:16,price:300000,facility:"AC • Wi-Fi • Whiteboard",desc:"Ruang fleksibel untuk kerja tim, brainstorming, dan collaborative session."}
];

const users = {
  customer:{username:"customer",password:"customer123",role:"customer",name:"Customer Demo"},
  admin:{username:"admin",password:"admin123",role:"admin",name:"Administrator"}
};

function getSession(){return JSON.parse(localStorage.getItem("iasSession") || "null")}
function getBookings(){return JSON.parse(localStorage.getItem("iasBookings") || "[]")}
function saveBookings(data){localStorage.setItem("iasBookings",JSON.stringify(data))}
function money(n){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n)}
function showToast(msg){const el=document.getElementById("toast");if(!el)return;el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2500)}

function roomCard(room){
  const session=getSession();
  return `<article class="room-card">
    <div class="room-visual">IAS • ${room.capacity} Pax</div>
    <div class="room-body">
      <h3>${room.name}</h3>
      <p>${room.desc}</p>
      <div class="room-meta"><span class="tag">Kapasitas ${room.capacity}</span><span class="tag">${room.facility}</span></div>
      <div class="price">${money(room.price)} <small>/ sesi</small></div>
      ${session?.role==="customer" ? `<button class="btn btn-primary btn-full book-btn" data-id="${room.id}">Pesan Ruangan</button>` : ""}
    </div>
  </article>`
}

function renderRooms(){
  document.getElementById("roomCount").textContent=rooms.length;
  document.getElementById("featuredRooms").innerHTML=rooms.slice(0,3).map(roomCard).join("");
  document.getElementById("allRooms").innerHTML=rooms.map(roomCard).join("");
  document.querySelectorAll(".book-btn").forEach(btn=>btn.addEventListener("click",()=>openBooking(Number(btn.dataset.id))));
}

function statusBadge(status){
  const cls=status==="Disetujui"?"approved":status==="Ditolak"?"rejected":"pending";
  return `<span class="status status-${cls}">${status}</span>`;
}

function renderBookings(){
  const session=getSession(), all=getBookings();
  document.getElementById("bookingCount").textContent=all.filter(b=>b.status!=="Ditolak").length;
  if(session?.role==="customer"){
    const mine=all.filter(b=>b.username===session.username);
    document.getElementById("myBookings").innerHTML=mine.length?`<div class="table-wrap"><table>
      <thead><tr><th>Ruangan</th><th>Tanggal</th><th>Waktu</th><th>Keperluan</th><th>Status</th></tr></thead>
      <tbody>${mine.map(b=>`<tr><td>${b.roomName}</td><td>${b.date}</td><td>${b.start} - ${b.end}</td><td>${b.purpose}</td><td>${statusBadge(b.status)}</td></tr>`).join("")}</tbody>
    </table></div>`:`<div class="empty">Belum ada pemesanan. Silakan pilih ruangan yang tersedia.</div>`;
  }
  if(session?.role==="admin"){
    document.getElementById("adminBookings").innerHTML=all.length?`<div class="table-wrap"><table>
      <thead><tr><th>Customer</th><th>Ruangan</th><th>Tanggal</th><th>Waktu</th><th>Keperluan</th><th>Status</th><th>Aksi</th></tr></thead>
      <tbody>${all.map(b=>`<tr><td>${b.name}<br><small>${b.username}</small></td><td>${b.roomName}</td><td>${b.date}</td><td>${b.start} - ${b.end}</td><td>${b.purpose}</td><td>${statusBadge(b.status)}</td><td><div class="action-row">${b.status==="Menunggu"?`<button class="btn btn-primary btn-sm approve-btn" data-id="${b.id}">Setujui</button><button class="btn btn-outline btn-sm reject-btn" data-id="${b.id}">Tolak</button>`:"-"}</div></td></tr>`).join("")}</tbody>
    </table></div>`:`<div class="empty">Belum ada pemesanan masuk.</div>`;
    document.querySelectorAll(".approve-btn").forEach(x=>x.onclick=()=>updateBooking(x.dataset.id,"Disetujui"));
    document.querySelectorAll(".reject-btn").forEach(x=>x.onclick=()=>updateBooking(x.dataset.id,"Ditolak"));
  }
}

function updateBooking(id,status){
  const data=getBookings(); const item=data.find(b=>String(b.id)===String(id)); if(!item)return;
  item.status=status; saveBookings(data); renderBookings(); showToast(`Pemesanan ${status.toLowerCase()}.`);
}

function openBooking(id){
  const room=rooms.find(r=>r.id===id); if(!room)return;
  document.getElementById("roomId").value=id;
  document.getElementById("modalRoomName").textContent=`Pesan ${room.name}`;
  document.getElementById("bookingDate").min=new Date().toISOString().split("T")[0];
  document.getElementById("bookingModal").classList.remove("hidden");
}
function closeBooking(){document.getElementById("bookingModal").classList.add("hidden")}

function setupLogin(){
  const form=document.getElementById("loginForm"); if(!form)return;
  form.addEventListener("submit",e=>{
    e.preventDefault();
    const u=form.username.value.trim(), p=form.password.value;
    const user=Object.values(users).find(x=>x.username===u && x.password===p);
    if(!user){document.getElementById("loginMessage").textContent="Username atau password salah.";return}
    localStorage.setItem("iasSession",JSON.stringify(user)); location.href="app.html";
  });
}
function setupApp(){
  const session=getSession(); if(!session){location.href="index.html";return}
  document.getElementById("roleBadge").textContent=session.role==="admin"?"ADMIN":"CUSTOMER";
  document.querySelectorAll(".admin-only").forEach(x=>x.style.display=session.role==="admin"?"":"none");
  document.querySelectorAll(".customer-only").forEach(x=>x.style.display=session.role==="customer"?"":"none");
  document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>showSection(btn.dataset.section)));
  document.querySelectorAll("[data-go]").forEach(btn=>btn.addEventListener("click",()=>showSection(btn.dataset.go)));
  document.getElementById("logoutBtn").onclick=()=>{localStorage.removeItem("iasSession");location.href="index.html"};
  document.getElementById("closeModal").onclick=closeBooking;
  document.getElementById("bookingModal").addEventListener("click",e=>{if(e.target.id==="bookingModal")closeBooking()});
  document.getElementById("bookingForm").addEventListener("submit",e=>{
    e.preventDefault();
    const room=rooms.find(r=>r.id===Number(document.getElementById("roomId").value));
    const date=document.getElementById("bookingDate").value,start=document.getElementById("startTime").value,end=document.getElementById("endTime").value,purpose=document.getElementById("purpose").value.trim();
    if(start>=end){showToast("Jam selesai harus lebih besar dari jam mulai.");return}
    const data=getBookings();
    data.push({id:Date.now(),username:session.username,name:session.name,roomId:room.id,roomName:room.name,date,start,end,purpose,status:"Menunggu"});
    saveBookings(data); e.target.reset(); closeBooking(); renderBookings(); showToast("Pemesanan berhasil diajukan.");
  });
  renderRooms();renderBookings();
}
function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
  document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.section===id));
  renderBookings();
}
setupLogin();
if(document.querySelector(".layout")) setupApp();
