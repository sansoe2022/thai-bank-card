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

let currentBank = banks[0];
let uploadedUserImg = null;
let bankLogoImg = new Image();

// Cropper Variables
let cropper = null;
const imageToCrop = document.getElementById('imageToCrop');
const cropModal = document.getElementById('cropModalWrapper');

const canvas = document.getElementById('cardCanvas');
const ctx = canvas.getContext('2d');
const imgOutput = document.getElementById('resultImage');

// --- INIT ---
window.onload = function() {
    // 1. Inject Save Modal (Fixed for Long Press)
    injectModalSystem();
    
    // 2. Init App
    initBankGrid();
    loadBankLogo(currentBank);
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
        updateThemeIcon();
    }
};

// --- CROP SYSTEM LOGIC ---
function handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Set image source for cropper
            imageToCrop.src = e.target.result;
            // Open Modal
            cropModal.style.display = 'flex';
            
            // Destroy old cropper if exists
            if(cropper) { cropper.destroy(); }
            
            // Initialize Cropper (Square aspect ratio for best fit)
            cropper = new Cropper(imageToCrop, {
                aspectRatio: 1, // 1:1 Square
                viewMode: 1,
                autoCropArea: 0.8,
            });
            // Reset input so same file can be selected again
            input.value = '';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function confirmCrop() {
    if(cropper) {
        // Get cropped canvas
        const croppedCanvas = cropper.getCroppedCanvas({
            width: 300, height: 300 // Resize for performance
        });
        
        // Convert to Image Object for drawing
        const img = new Image();
        img.onload = () => {
            uploadedUserImg = img;
            render(); // Redraw card
            closeCropModal();
        };
        img.src = croppedCanvas.toDataURL();
    }
}

function closeCropModal() {
    cropModal.style.display = 'none';
    if(cropper) { cropper.destroy(); cropper = null; }
}

// --- AUTOMATIC MODAL INJECTION (FIXED) ---
function injectModalSystem() {
    const style = document.createElement('style');
    // Removed user-select: none from .js-modal-img
    style.innerHTML = `
        .js-image-modal {
            display: none; position: fixed; z-index: 10000; left: 0; top: 0;
            width: 100%; height: 100%; overflow: auto;
            background-color: rgba(0,0,0,0.95);
            flex-direction: column; align-items: center; justify-content: center;
            backdrop-filter: blur(5px); animation: fadeIn 0.3s;
        }
        .js-modal-content {
            position: relative; width: 90%; max-width: 500px;
            display: flex; flex-direction: column; align-items: center;
        }
        .js-modal-img {
            width: 100%; border-radius: 12px;
            box-shadow: 0 4px 20px rgba(255,255,255,0.2);
            /* CRITICAL: Allow interaction */
            pointer-events: auto; 
            touch-action: auto;
        }
        .js-hint-badge {
            background: #fff; color: #000; padding: 10px 20px;
            border-radius: 50px; font-weight: bold; font-size: 14px;
            margin-bottom: 20px; text-align: center;
            box-shadow: 0 0 10px rgba(255,255,255,0.5);
            animation: pulse 2s infinite;
        }
        .js-close-btn {
            margin-top: 20px; padding: 12px 30px; border-radius: 50px;
            border: none; background: #ef4444; color: white;
            font-weight: bold; cursor: pointer; font-size: 16px;
        }
        @keyframes fadeIn { from {opacity:0} to {opacity:1} }
        @keyframes pulse { 0% {transform:scale(1);} 50% {transform:scale(1.05);} 100% {transform:scale(1);} }
    `;
    document.head.appendChild(style);

    const modalHTML = `
        <div id="jsSaveModal" class="js-image-modal">
            <div class="js-modal-content">
                <div class="js-hint-badge">ပုံကို ဖိနှိပ်ပြီး Save ပါ (Long Press Image)</div>
                <img id="jsModalImg" class="js-modal-img" src="" alt="Save Image">
                <button class="js-close-btn" onclick="closeJsModal()">ပိတ်မည် (Close)</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// --- DOWNLOAD FUNCTION ---
function downloadImage() {
    try {
        const dataUrl = canvas.toDataURL("image/png");
        
        // Open Modal
        const modal = document.getElementById('jsSaveModal');
        const modalImg = document.getElementById('jsModalImg');
        
        if(modal && modalImg) {
            modalImg.src = dataUrl;
            modal.style.display = "flex";
        }
        
        // Also try direct download
        const link = document.createElement('a');
        link.download = `BankCard-${currentBank.short}-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (e) {
        alert("Image Error: " + e.message);
    }
}

function closeJsModal() {
    document.getElementById('jsSaveModal').style.display = "none";
}

// --- CORE (Bank Logic) ---
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
    bankLogoImg.src = bank.logo;
    bankLogoImg.onload = () => render();
    bankLogoImg.onerror = () => render();
}

function resetForm() {
    document.getElementById('nameInput').value = "";
    document.getElementById('acctInput').value = "";
    document.getElementById('logoUpload').value = ""; // Clear file input
    uploadedUserImg = null;
    selectBank(banks[0], document.querySelector('.bank-item'));
}

// --- RENDER ---
function render() {
    const name = (document.getElementById('nameInput').value || "NAME HERE").toUpperCase();
    const acct = document.getElementById('acctInput').value || "000-000-0000";
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

// --- DRAW FUNCTIONS ---
function drawBBLStyle(w, h, name, acct) {
    const mainColor = currentBank.color;
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h);

    if (bankLogoImg.complete && bankLogoImg.naturalHeight !== 0) {
        ctx.drawImage(bankLogoImg, 50, 40, 150, 150);
    } else {
        ctx.fillStyle = mainColor; ctx.beginPath(); ctx.arc(125, 115, 70, 0, Math.PI*2); ctx.fill();
    }
    ctx.fillStyle = "#ccc"; ctx.fillRect(230, 50, 4, 120);

    let textX = 260;
    ctx.fillStyle = mainColor; ctx.font = "bold 80px Roboto, Arial"; ctx.textAlign = "left";
    ctx.fillText(currentBank.short, textX, 110);
    ctx.fillStyle = "#555"; ctx.font = "bold 40px Kanit, Arial";
    ctx.fillText(currentBank.thName || "ธนาคาร", textX, 160);
    ctx.fillStyle = "#f97316"; ctx.fillRect(textX, 125, 300, 4);

    const boxSize = 160; const boxX = w - 210; const boxY = 40;
    ctx.fillStyle = "#f8f9fa"; ctx.beginPath(); ctx.roundRect(boxX, boxY, boxSize, boxSize, 20); ctx.fill();
    ctx.strokeStyle = mainColor; ctx.lineWidth = 4; ctx.stroke();
    if (uploadedUserImg) {
        ctx.save(); ctx.clip(); ctx.drawImage(uploadedUserImg, boxX, boxY, boxSize, boxSize); ctx.restore();
    } else {
        ctx.fillStyle = "#ccc"; ctx.font = "bold 20px Arial"; ctx.textAlign = "center";
        ctx.fillText("QR/PHOTO", boxX + boxSize/2, boxY + boxSize/2);
    }

    ctx.fillStyle = mainColor; ctx.fillRect(50, 250, 320, 80);
    ctx.fillStyle = (currentBank.id === 'bay') ? currentBank.txtColor : "#fff";
    ctx.font = "bold 32px Roboto"; ctx.textAlign = "center"; ctx.fillText("BANK NUMBER", 210, 300);
    ctx.fillStyle = "#444"; ctx.font = "bold 80px Roboto"; ctx.textAlign = "left"; ctx.fillText(acct, 400, 315);
    ctx.fillStyle = mainColor; ctx.fillRect(50, 400, w - 100, 130);
    ctx.fillStyle = (currentBank.id === 'bay') ? currentBank.txtColor : "#fff";
    ctx.font = "bold 55px Roboto, Padauk"; ctx.textAlign = "left"; ctx.fillText(name, 90, 485);
}

function drawGradient(w, h, name, acct) {
    let grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, currentBank.color); grd.addColorStop(1, "#f1f5f9");
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 30;
    ctx.beginPath(); ctx.roundRect(100, 100, w-200, h-200, 30); ctx.fill(); ctx.shadowBlur = 0;

    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 130, 130, 80, 80);
    ctx.textAlign = "left"; ctx.fillStyle = currentBank.color; ctx.font = "bold 40px Roboto";
    ctx.fillText(currentBank.short, 230, 185);

    if(uploadedUserImg) {
        ctx.save(); ctx.beginPath(); ctx.arc(w/2, 230, 60, 0, Math.PI*2); ctx.clip();
        ctx.drawImage(uploadedUserImg, w/2 - 60, 170, 120, 120); ctx.restore();
        ctx.beginPath(); ctx.arc(w/2, 230, 60, 0, Math.PI*2);
        ctx.strokeStyle = currentBank.color; ctx.lineWidth = 4; ctx.stroke();
    } else {
        ctx.fillStyle = "#eee"; ctx.beginPath(); ctx.arc(w/2, 230, 50, 0, Math.PI*2); ctx.fill();
    }
    ctx.textAlign = "center"; ctx.fillStyle = currentBank.color; ctx.font = "bold 60px Roboto"; ctx.fillText(acct, w/2, 350);
    ctx.fillStyle = "#555"; ctx.font = "bold 40px Padauk"; ctx.fillText(name, w/2, 420);
}

function drawMaterial(w, h, name, acct) {
    ctx.fillStyle = "#f5f5f5"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    ctx.beginPath(); ctx.roundRect(80, 80, w-160, h-160, 16); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle = currentBank.color; ctx.beginPath(); ctx.roundRect(80, 80, w-160, 20, [16,16,0,0]); ctx.fill();
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 120, 140, 80, 80);
    if(uploadedUserImg) {
        ctx.save(); ctx.beginPath(); ctx.arc(w-160, 180, 40, 0, Math.PI*2); ctx.clip();
        ctx.drawImage(uploadedUserImg, w-200, 140, 80, 80); ctx.restore();
    }
    ctx.textAlign = "left"; ctx.fillStyle = "#202124"; ctx.font = "bold 40px Roboto"; ctx.fillText(currentBank.name, 220, 180);
    ctx.fillStyle = currentBank.color; ctx.font = "bold 70px Roboto"; ctx.fillText(acct, 120, 320);
    ctx.fillStyle = "#202124"; ctx.font = "35px Padauk"; ctx.fillText(name, 120, 400);
}

function drawModern(w, h, name, acct) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = currentBank.color; ctx.fillRect(0,0, 30, h);
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 60, 50, 100, 100);
    if(uploadedUserImg) ctx.drawImage(uploadedUserImg, w-180, 50, 120, 120);
    ctx.textAlign = "left"; ctx.fillStyle = "#000"; ctx.font = "bold 40px Roboto";
    ctx.fillText(currentBank.name, 190, 115);
    ctx.fillStyle = currentBank.color; ctx.font = "bold 80px Roboto";
    ctx.fillText(acct, 80, 320);
    ctx.fillStyle = "#000"; ctx.font = "bold 50px Padauk";
    ctx.fillText(name, 80, 470);
}

function toggleTheme() { document.body.classList.toggle('dark-mode'); updateThemeIcon(); }
function updateThemeIcon() {
    const btn = document.getElementById('themeBtn');
    const isDark = document.body.classList.contains('dark-mode');
    btn.innerHTML = `<span class="material-symbols-outlined">${isDark ? 'light_mode' : 'dark_mode'}</span>`;
}
if (!ctx.roundRect) ctx.roundRect = function(x, y, w, h, r) { ctx.rect(x,y,w,h); return this; }
