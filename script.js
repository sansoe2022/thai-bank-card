// --- CONFIGURATION ---
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
let uploadedUserImg = null; // Changed: This is now the QR/Profile image
let bankLogoImg = new Image();
bankLogoImg.crossOrigin = "Anonymous";

const canvas = document.getElementById('cardCanvas');
const ctx = canvas.getContext('2d');
const imgOutput = document.getElementById('resultImage');

// --- INITIALIZATION ---
window.onload = function() {
    initBankGrid();
    loadBankLogo(currentBank);
    
    // Check System Dark Mode Preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
        updateThemeIcon();
    }
};

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    updateThemeIcon();
}

function updateThemeIcon() {
    const btn = document.getElementById('themeBtn');
    const isDark = document.body.classList.contains('dark-mode');
    btn.innerHTML = `<span class="material-symbols-outlined">${isDark ? 'light_mode' : 'dark_mode'}</span>`;
}

function initBankGrid() {
    const grid = document.getElementById('bankGrid');
    grid.innerHTML = '';
    
    banks.forEach(bank => {
        const div = document.createElement('div');
        div.className = 'bank-item';
        if(bank.id === currentBank.id) div.classList.add('active');
        
        div.innerHTML = `
            <img src="${bank.logo}" alt="${bank.short}" onerror="this.src='https://via.placeholder.com/40'">
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
    bankLogoImg.src = bank.logo;
    bankLogoImg.onload = () => render();
    bankLogoImg.onerror = () => render();
}

function handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => { uploadedUserImg = img; render(); };
            img.src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function resetForm() {
    document.getElementById('nameInput').value = "";
    document.getElementById('acctInput').value = "";
    document.getElementById('logoUpload').value = "";
    uploadedUserImg = null;
    selectBank(banks[0], document.querySelector('.bank-item'));
}

// --- RENDER ENGINE ---
function render() {
    const nameInput = document.getElementById('nameInput');
    const acctInput = document.getElementById('acctInput');
    
    // Use user input, if empty use placeholders from HTML for PREVIEW, 
    // but visually it's cleaner to use placeholder text if empty.
    const name = (nameInput.value) ? nameInput.value.toUpperCase() : "NAME HERE";
    const acct = (acctInput.value) ? acctInput.value : "000-000-0000";
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
    } else {
        drawModern(w, h, name, acct);
    }

    imgOutput.src = canvas.toDataURL("image/png");
}

// --- DRAWING FUNCTIONS ---

function drawBBLStyle(w, h, name, acct) {
    const mainColor = currentBank.color;
    
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,w,h);

    // --- Header ---
    
    // 1. LEFT SIDE: Bank Logo (Replaced "BBL" text)
    // Draw Bank Logo Large
    if (bankLogoImg.complete && bankLogoImg.naturalHeight !== 0) {
        ctx.drawImage(bankLogoImg, 50, 40, 150, 150);
    } else {
        // Fallback Circle
        ctx.fillStyle = mainColor;
        ctx.beginPath(); ctx.arc(125, 115, 70, 0, Math.PI*2); ctx.fill();
    }

    // Divider
    ctx.fillStyle = "#ccc";
    ctx.fillRect(230, 50, 4, 120);

    // Bank Names (Shifted slightly right)
    let textX = 260;
    
    ctx.fillStyle = mainColor;
    ctx.font = "bold 55px Kanit, Arial"; 
    ctx.textAlign = "left";
    ctx.fillText(currentBank.thName || "ธนาคาร", textX, 100);
    
    ctx.fillStyle = "#666";
    ctx.font = "bold 35px Roboto, Arial";
    ctx.fillText(currentBank.name.toUpperCase(), textX, 150);

    // Orange Line
    ctx.fillStyle = "#f97316"; 
    ctx.fillRect(textX, 115, 330, 5);

    // --- RIGHT SIDE: User Upload Box (QR / Profile) ---
    const boxSize = 160;
    const boxX = w - 210;
    const boxY = 40;
    
    // 1. Box Container
    ctx.fillStyle = "#f8f9fa"; // Very light grey bg for placeholder
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxSize, boxSize, 20);
    ctx.fill();
    
    // 2. Border
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    // 3. Draw User Image (QR/Profile)
    if (uploadedUserImg) {
        ctx.save();
        ctx.clip(); // Clip to box
        ctx.drawImage(uploadedUserImg, boxX, boxY, boxSize, boxSize);
        ctx.restore();
    } else {
        // Placeholder Icon (QR style)
        ctx.fillStyle = "#ccc";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("QR/PHOTO", boxX + boxSize/2, boxY + boxSize/2);
        // Simple QR mock
        ctx.fillStyle = mainColor;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(boxX+40, boxY+40, boxSize-80, boxSize-80);
        ctx.globalAlpha = 1.0;
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

// Other styles adapt to use the new User Image logic
function drawGradient(w, h, name, acct) {
    let grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, currentBank.color);
    grd.addColorStop(1, "#f1f5f9");
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 30;
    ctx.beginPath(); ctx.roundRect(100, 100, w-200, h-200, 30); ctx.fill();
    ctx.shadowBlur = 0;

    // Center: User Image or Bank Logo if no user image
    let centerImg = uploadedUserImg ? uploadedUserImg : bankLogoImg;
    drawCenteredImg(centerImg, w/2 - 60, 40, 120);

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

    // Left Logo: Bank Logo
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 120, 140, 80, 80);
    
    // Right: QR/Photo if available
    if(uploadedUserImg) {
        ctx.save();
        ctx.beginPath(); ctx.arc(w-160, 180, 40, 0, Math.PI*2); ctx.clip();
        ctx.drawImage(uploadedUserImg, w-200, 140, 80, 80);
        ctx.restore();
    }

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
    
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 60, 50, 100, 100);

    // QR Box
    if(uploadedUserImg) {
        ctx.drawImage(uploadedUserImg, w-180, 50, 120, 120);
    }

    ctx.textAlign = "left"; ctx.fillStyle = "#000"; ctx.font = "bold 40px Roboto";
    ctx.fillText(currentBank.name, 190, 115);
    ctx.fillStyle = currentBank.color; ctx.font = "bold 80px Roboto";
    ctx.fillText(acct, 80, 320);
    ctx.fillStyle = "#000"; ctx.font = "bold 50px Padauk";
    ctx.fillText(name, 80, 470);
}

function drawCenteredImg(img, x, y, size) {
    if(img && img.complete && img.naturalHeight !== 0) {
        ctx.drawImage(img, x, y, size, size);
    }
}

// Polyfill
if (!ctx.roundRect) {
    ctx.roundRect = function(x, y, w, h, r) { ctx.rect(x,y,w,h); return this; }
}
