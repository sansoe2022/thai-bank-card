// Bank Configurations
const banks = [
    { id: 'bbl', name: 'BBL', thName: 'ธนาคารกรุงเทพ', color: '#1e4598' },
    { id: 'kbank', name: 'KBANK', thName: 'ธนาคารกสิกรไทย', color: '#138f2d' },
    { id: 'scb', name: 'SCB', thName: 'ธนาคารไทยพาณิชย์', color: '#4e2a84' },
    { id: 'ktb', name: 'KTB', thName: 'ธนาคารกรุงไทย', color: '#00a5e3' },
    { id: 'bay', name: 'BAY', thName: 'ธนาคารกรุงศรี', color: '#fec43b', txt: '#4e2a84' },
    { id: 'ttb', name: 'TTB', thName: 'ทีเอ็มบีธนชาต', color: '#0056b8' },
    { id: 'uob', name: 'UOB', thName: 'ยูโอบี', color: '#0b2361' },
    { id: 'gsb', name: 'GSB', thName: 'ออมสิน', color: '#eb008b' }
];

// App State
let state = {
    bank: banks[0],
    style: 'bbl_classic',
    uploadedLogo: null,
    uploadedBg: null,
    // Custom positioning defaults
    custom: {
        active: false,
        nameX: 50, nameY: 450,
        acctX: 350, acctY: 280,
        scale: 1,
        color: '#000000'
    }
};

const canvas = document.getElementById('cardCanvas');
const ctx = canvas.getContext('2d');

// --- Initialization ---
function init() {
    renderBankList();
    render();
}

function renderBankList() {
    const list = document.getElementById('bankList');
    list.innerHTML = '';
    banks.forEach(bank => {
        const div = document.createElement('div');
        div.className = `bank-item ${state.bank.id === bank.id ? 'active' : ''}`;
        div.style.backgroundColor = bank.color;
        div.style.color = bank.txt || '#fff';
        div.innerText = bank.name;
        div.onclick = () => {
            state.bank = bank;
            document.querySelectorAll('.bank-item').forEach(b => b.classList.remove('active'));
            div.classList.add('active');
            render();
        };
        list.appendChild(div);
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    
    // Activate
    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).style.display = 'block';
    
    // Toggle custom mode state
    state.custom.active = (tabName === 'custom');
    render();
}

function updateStyle() {
    state.style = document.getElementById('styleSelect').value;
    render();
}

// --- File Handlers ---
function handleLogoUpload(input) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => { state.uploadedLogo = img; render(); };
        img.src = e.target.result;
    };
    if(input.files[0]) reader.readAsDataURL(input.files[0]);
}

function handleBgUpload(input) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => { state.uploadedBg = img; render(); };
        img.src = e.target.result;
    };
    if(input.files[0]) reader.readAsDataURL(input.files[0]);
}

// --- RENDER LOGIC ---
function render() {
    // Get Inputs
    const name = document.getElementById('nameInput').value.toUpperCase() || "NAME HERE";
    const acct = document.getElementById('acctInput').value || "000-000-0000";
    
    // Get Custom Sliders
    state.custom.nameX = parseInt(document.getElementById('nameX').value);
    state.custom.nameY = parseInt(document.getElementById('nameY').value);
    state.custom.acctX = parseInt(document.getElementById('acctX').value);
    state.custom.acctY = parseInt(document.getElementById('acctY').value);
    state.custom.scale = parseInt(document.getElementById('globalScale').value) / 100;
    state.custom.color = document.getElementById('customTextColor').value;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0,0,w,h);

    // 1. DRAW BACKGROUND
    if (state.uploadedBg && state.custom.active) {
        ctx.drawImage(state.uploadedBg, 0, 0, w, h);
    } else {
        drawBackground(w, h);
    }

    // 2. DRAW CONTENT BASED ON STYLE
    if (state.custom.active) {
        drawCustomContent(name, acct);
    } else {
        if (state.style === 'bbl_classic') drawBBLClassic(w, h, name, acct);
        else if (state.style === 'modern_clean') drawModern(w, h, name, acct);
        else if (state.style === 'social_post') drawSocial(w, h, name, acct);
        else drawMinimal(w, h, name, acct); // Default
    }

    // Output to Image
    document.getElementById('resultImage').src = canvas.toDataURL("image/png");
}

// --- STYLE DRAWING FUNCTIONS ---

function drawBBLClassic(w, h, name, acct) {
    // White BG
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,0,w,h);
    
    const blue = "#1e4598"; // Official BBL Blue
    const orange = "#f58220"; 

    // Header Left: "BBL"
    ctx.fillStyle = blue;
    ctx.font = "bold 130px Roboto";
    ctx.textAlign = "left";
    ctx.fillText(state.bank.name, 50, 160);

    // Vertical Divider
    ctx.fillStyle = "#cccccc";
    ctx.fillRect(320, 60, 5, 120);

    // Header Text: Thai & English
    ctx.fillStyle = blue;
    ctx.font = "bold 60px Kanit"; 
    ctx.fillText(state.bank.thName || "ธนาคาร", 350, 100);
    
    ctx.fillStyle = "#666";
    ctx.font = "bold 30px Roboto";
    ctx.fillText(state.bank.name + " BANK", 350, 150);
    
    // Underline accent
    ctx.fillStyle = orange;
    ctx.fillRect(350, 115, 330, 5);

    // Logo (Top Right)
    drawLogo(w-220, 50, 170);

    // --- ROW 1: Number ---
    // Blue Label Box "BANK NUMBER"
    ctx.fillStyle = blue;
    ctx.fillRect(50, 250, 320, 80);
    
    ctx.fillStyle = "#fff";
    ctx.font = "bold 35px Roboto";
    ctx.textAlign = "center";
    ctx.fillText("BANK NUMBER", 210, 303);

    // Account Number Text
    ctx.textAlign = "left";
    ctx.fillStyle = "#444";
    ctx.font = "bold 80px Roboto";
    ctx.fillText(acct, 400, 320);

    // --- ROW 2: Name ---
    // Full width blue box
    ctx.fillStyle = blue;
    ctx.fillRect(50, 400, w-100, 120);

    // Name Text inside box
    ctx.fillStyle = "#fff";
    ctx.font = "bold 60px Roboto";
    ctx.textAlign = "left";
    ctx.fillText(name, 90, 485);
}

function drawModern(w, h, name, acct) {
    // Gradient BG
    let grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, state.bank.color);
    grd.addColorStop(1, "#ffffff");
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,w,h);

    // White Card
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.roundRect(100, 100, w-200, h-200, 30);
    ctx.fill();

    drawLogo(w/2 - 50, 50, 100);

    ctx.fillStyle = state.bank.color;
    ctx.textAlign = "center";
    ctx.font = "bold 40px Kanit";
    ctx.fillText(state.bank.thName, w/2, 250);

    ctx.fillStyle = "#333";
    ctx.font = "bold 60px Roboto";
    ctx.fillText(acct, w/2, 350);

    ctx.fillStyle = "#666";
    ctx.font = "40px Padauk";
    ctx.fillText(name, w/2, 420);
}

function drawSocial(w, h, name, acct) {
    // Split BG
    ctx.fillStyle = state.bank.color;
    ctx.fillRect(0,0,w,250);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,250,w,h-250);

    // Card in Center
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 20;
    ctx.roundRect(150, 100, w-300, 400, 20);
    ctx.fill(); ctx.shadowBlur = 0;

    drawLogo(w/2 - 60, 50, 120);

    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.font = "bold 50px Roboto";
    ctx.fillText(acct, w/2, 280);
    
    ctx.fillStyle = state.bank.color;
    ctx.font = "bold 40px Padauk";
    ctx.fillText(name, w/2, 350);
}

function drawMinimal(w, h, name, acct) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = state.bank.color; ctx.lineWidth=30;
    ctx.strokeRect(0,0,w,h);

    drawLogo(80, 80, 100);
    
    ctx.fillStyle = state.bank.color;
    ctx.textAlign = "left";
    ctx.font = "bold 80px Roboto";
    ctx.fillText(acct, 80, 350);
    
    ctx.fillStyle = "#000";
    ctx.font = "50px Padauk";
    ctx.fillText(name, 80, 450);
}

// --- CUSTOM CONTENT DRAWER ---
function drawCustomContent(name, acct) {
    // If no BG uploaded, use white
    if(!state.uploadedBg) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }
    
    // Draw Logo if uploaded
    if(state.uploadedLogo) {
        ctx.drawImage(state.uploadedLogo, 50, 50, 150, 150);
    }

    ctx.fillStyle = state.custom.color;
    
    // Draw Name
    ctx.font = `bold ${60 * state.custom.scale}px Padauk`;
    ctx.textAlign = "left";
    ctx.fillText(name, state.custom.nameX, state.custom.nameY);

    // Draw Acct
    ctx.font = `bold ${80 * state.custom.scale}px Roboto`;
    ctx.fillText(acct, state.custom.acctX, state.custom.acctY);
}

// --- HELPER: Draw Logo or Fallback ---
function drawLogo(x, y, size) {
    if(state.uploadedLogo) {
        ctx.drawImage(state.uploadedLogo, x, y, size, size);
    } else {
        // Fallback Circle
        ctx.fillStyle = state.bank.color;
        ctx.beginPath(); ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${size/3}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(state.bank.name, x + size/2, y + size/2 + size/10);
    }
}

// Helpers
function resetAll() {
    location.reload(); // Simple reset
}
if (!ctx.roundRect) {
    ctx.roundRect = function(x, y, w, h, r) { ctx.rect(x,y,w,h); return this; }
}

window.onload = init;
