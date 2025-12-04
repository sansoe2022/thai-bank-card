// --- CONFIGURATION ---
// Logo Link တွေကို ဒီနေရာမှာ လိုက်ပြင်ပါ (img/kbank.png သို့မဟုတ် http link)
const banks = [
    { id: 'bbl', name: 'Bangkok Bank', short: 'BBL', thName: 'ธนาคารกรุงเทพ', color: '#1e4598', logo: 'img/bbl.png' },
    { id: 'kbank', name: 'Kasikorn Bank', short: 'KBANK', thName: 'ธนาคารกสิกรไทย', color: '#138f2d', logo: 'img/kbank.png' },
    { id: 'scb', name: 'SCB Bank', short: 'SCB', thName: 'ธนาคารไทยพาณิชย์', color: '#4e2a84', logo: 'img/scb.png' },
    { id: 'ktb', name: 'Krungthai Bank', short: 'KTB', thName: 'ธนาคารกรุงไทย', color: '#00a5e3', logo: 'img/ktb.png' },
    { id: 'bay', name: 'Krungsri Bank', short: 'BAY', thName: 'ธนาคารกรุงศรี', color: '#fec43b', txtColor: '#4e2a84', logo: 'img/bay.png' },
    { id: 'ttb', name: 'TTB Bank', short: 'TTB', thName: 'ทีเอ็มบีธนชาต', color: '#0056b8', logo: 'img/ttb.png' },
    { id: 'uob', name: 'UOB Bank', short: 'UOB', thName: 'ยูโอบี', color: '#0b2361', logo: 'img/uob.png' },
    { id: 'gsb', name: 'GSB Bank', short: 'GSB', thName: 'ธนาคารออมสิน', color: '#eb008b', logo: 'img/gsb.png' },
    { id: 'cimbt', name: 'CIMB Thai', short: 'CIMBT', thName: 'ซีไอเอ็มบี', color: '#7e1a2d', logo: 'img/cimbt.png' }
];

// State
let currentBank = banks[0];
let uploadedLogo = null;
let logoImgObj = new Image();
logoImgObj.crossOrigin = "Anonymous"; 

const canvas = document.getElementById('cardCanvas');
const ctx = canvas.getContext('2d');
const imgOutput = document.getElementById('resultImage');

// --- INITIALIZATION ---
window.onload = function() {
    initBankGrid();
    loadBankLogo(currentBank);
};

function initBankGrid() {
    const grid = document.getElementById('bankGrid');
    grid.innerHTML = '';
    
    banks.forEach(bank => {
        const div = document.createElement('div');
        div.className = 'bank-item';
        if(bank.id === currentBank.id) div.classList.add('active');
        
        div.innerHTML = `
            <img src="${bank.logo}" alt="${bank.short}" onerror="this.src='https://via.placeholder.com/40?text=${bank.short}'">
            <span>${bank.short}</span>
        `;
        
        div.onclick = () => selectBank(bank, div);
        grid.appendChild(div);
    });
}

function selectBank(bank, div) {
    currentBank = bank;
    document.querySelectorAll('.bank-item').forEach(el => el.classList.remove('active'));
    div.classList.add('active');
    loadBankLogo(bank);
}

function loadBankLogo(bank) {
    // If user hasn't uploaded a custom logo, use the bank's default logo
    if (!uploadedLogo) {
        logoImgObj.src = bank.logo;
        logoImgObj.onload = () => render();
        logoImgObj.onerror = () => render(); 
    } else {
        render();
    }
}

function handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => { uploadedLogo = img; render(); };
            img.src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function resetForm() {
    document.getElementById('nameInput').value = "";
    document.getElementById('acctInput').value = "";
    document.getElementById('logoUpload').value = "";
    uploadedLogo = null;
    selectBank(banks[0], document.querySelector('.bank-item'));
}

// --- RENDER ENGINE ---
function render() {
    const nameInput = document.getElementById('nameInput');
    const acctInput = document.getElementById('acctInput');
    
    const name = (nameInput.value || nameInput.placeholder).toUpperCase();
    const acct = acctInput.value || acctInput.placeholder;
    const style = document.getElementById('styleSelect').value;
    
    canvas.width = 1000;
    canvas.height = 600;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    if (style === 'layout_bbl') {
        drawBBLStyle(w, h, name, acct);
    } else if (style === 'layout_gradient') {
        drawGradient(w, h, name, acct);
    } else if (style === 'layout_material') {
        drawMaterial(w, h, name, acct);
    } else if (style === 'layout_modern') {
        drawModern(w, h, name, acct);
    } else {
        drawMinimal(w, h, name, acct);
    }

    imgOutput.src = canvas.toDataURL("image/png");
}

// --- DRAWING FUNCTIONS ---

function drawBBLStyle(w, h, name, acct) {
    const mainColor = currentBank.color;
    
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,w,h);

    // --- Header ---
    // Auto-resize font for long bank names (KBANK, CIMBT)
    let titleFontSize = 130;
    if (currentBank.short.length > 3) titleFontSize = 90; // Shrink for KBANK, CIMBT
    
    ctx.fillStyle = mainColor;
    ctx.font = `bold ${titleFontSize}px Roboto, Arial`;
    ctx.textAlign = "left";
    // Adjust Y position slightly if font is smaller to keep it centered
    let titleY = (currentBank.short.length > 3) ? 140 : 150;
    ctx.fillText(currentBank.short, 50, titleY);

    // Divider
    ctx.fillStyle = "#ccc";
    ctx.fillRect(320, 50, 4, 120);

    // Thai Name
    ctx.fillStyle = mainColor;
    ctx.font = "bold 55px Kanit, Arial"; 
    ctx.fillText(currentBank.thName || "ธนาคาร", 350, 100);
    
    // English Name
    ctx.fillStyle = "#666";
    ctx.font = "bold 35px Roboto, Arial";
    ctx.fillText(currentBank.name.toUpperCase(), 350, 150);

    // Orange Line
    ctx.fillStyle = "#f97316"; 
    ctx.fillRect(350, 115, 330, 5);

    // --- Right Logo Box (Updated to use Real Logo) ---
    const boxSize = 160;
    const boxX = w - 210;
    const boxY = 40;
    
    // 1. Colored Rounded Rect
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxSize, boxSize, 20);
    ctx.fill();
    
    // 2. White Border inside
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Draw REAL Logo Inside
    // Use uploaded logo if exists, otherwise use bank logo from link
    let drawImg = uploadedLogo ? uploadedLogo : logoImgObj;
    
    if (drawImg.complete && drawImg.naturalHeight !== 0) {
        ctx.save();
        ctx.clip(); // Clip images to the rounded box
        
        // Draw image with padding
        let padding = 20;
        ctx.drawImage(drawImg, boxX + padding, boxY + padding, boxSize - (padding*2), boxSize - (padding*2));
        
        ctx.restore();
    } else {
        // Fallback if image fails
        ctx.fillStyle = "#fff";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "center";
        ctx.fillText(currentBank.short, boxX + boxSize/2, boxY + boxSize/2 + 10);
    }

    // --- Bank Number Row ---
    ctx.fillStyle = mainColor;
    ctx.fillRect(50, 250, 320, 80);
    
    ctx.fillStyle = (currentBank.id === 'bay') ? currentBank.txtColor : "#fff";
    ctx.font = "bold 32px Roboto";
    ctx.textAlign = "center";
    ctx.fillText("BANK NUMBER", 210, 300);

    ctx.fillStyle = "#444";
    ctx.font = "bold 80px Roboto";
    ctx.textAlign = "left";
    ctx.fillText(acct, 400, 315);

    // --- Name Row ---
    ctx.fillStyle = mainColor;
    ctx.fillRect(50, 400, w - 100, 130);

    ctx.fillStyle = (currentBank.id === 'bay') ? currentBank.txtColor : "#fff";
    ctx.font = "bold 55px Roboto, Padauk";
    ctx.textAlign = "left";
    ctx.fillText(name, 90, 485);
}

// (Other drawing functions - Gradient, Modern, etc. remain the same as previous)
function drawGradient(w, h, name, acct) {
    let grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, currentBank.color);
    grd.addColorStop(1, "#f1f5f9");
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 30;
    ctx.beginPath(); ctx.roundRect(100, 100, w-200, h-200, 30); ctx.fill();
    ctx.shadowBlur = 0;

    drawLogoHelper(w/2 - 50, 50, 100);

    ctx.textAlign = "center";
    ctx.fillStyle = currentBank.color;
    ctx.font = "bold 60px Roboto";
    ctx.fillText(acct, w/2, 300);
    ctx.fillStyle = "#555"; ctx.font = "bold 40px Padauk";
    ctx.fillText(name, w/2, 380);
}

function drawMaterial(w, h, name, acct) {
    ctx.fillStyle = "#f5f5f5"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    ctx.beginPath(); ctx.roundRect(80, 80, w-160, h-160, 16); ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    ctx.fillStyle = currentBank.color;
    ctx.beginPath(); ctx.roundRect(80, 80, w-160, 20, [16,16,0,0]); ctx.fill();

    drawLogoHelper(120, 140, 80);
    ctx.textAlign = "left";
    ctx.fillStyle = "#202124"; ctx.font = "bold 40px Roboto";
    ctx.fillText(currentBank.name, 220, 180);
    
    ctx.fillStyle = currentBank.color; ctx.font = "bold 70px Roboto";
    ctx.fillText(acct, 120, 320);
    ctx.fillStyle = "#202124"; ctx.font = "35px Padauk";
    ctx.fillText(name, 120, 400);
}

function drawModern(w, h, name, acct) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = currentBank.color; ctx.fillRect(0,0, 30, h);
    drawLogoHelper(80, 50, 100);
    ctx.textAlign = "left"; ctx.fillStyle = "#000"; ctx.font = "bold 40px Roboto";
    ctx.fillText(currentBank.name, 200, 115);
    ctx.fillStyle = currentBank.color; ctx.font = "bold 80px Roboto";
    ctx.fillText(acct, 80, 320);
    ctx.fillStyle = "#000"; ctx.font = "bold 50px Padauk";
    ctx.fillText(name, 80, 470);
}

function drawMinimal(w, h, name, acct) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = currentBank.color; ctx.lineWidth = 10;
    ctx.strokeRect(20,20,w-40,h-40);
    drawLogoHelper(w/2 - 60, 60, 120);
    ctx.textAlign = "center"; ctx.fillStyle = "#000"; ctx.font = "bold 70px Roboto";
    ctx.fillText(acct, w/2, 300);
    ctx.fillStyle = currentBank.color; ctx.font = "bold 50px Padauk";
    ctx.fillText(name, w/2, 400);
}

function drawLogoHelper(x, y, size) {
    let drawImg = uploadedLogo ? uploadedLogo : logoImgObj;
    if (drawImg.complete && drawImg.naturalHeight !== 0) {
        ctx.drawImage(drawImg, x, y, size, size);
    } else {
        ctx.fillStyle = currentBank.color;
        ctx.beginPath(); ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = `bold ${size/3}px Arial`; ctx.textAlign = "center";
        ctx.fillText(currentBank.short, x + size/2, y + size/2 + size/10);
    }
}

if (!ctx.roundRect) {
    ctx.roundRect = function(x, y, w, h, r) { ctx.rect(x,y,w,h); return this; }
}
