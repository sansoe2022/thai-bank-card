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

// Cropper
let cropper = null;
const imageToCrop = document.getElementById('imageToCrop');
const cropModal = document.getElementById('cropModalWrapper');

const canvas = document.getElementById('cardCanvas');
const ctx = canvas.getContext('2d');
const imgOutput = document.getElementById('resultImage');

// --- INIT ---
window.onload = function() {
    initBankGrid();
    loadBankLogo(currentBank);
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
        updateThemeIcon();
    }
};

// --- DETECT FACEBOOK BROWSER ---
function isFacebookBrowser() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1) || (ua.indexOf("Instagram") > -1);
}

// --- IMPROVED DOWNLOAD FUNCTION ---
function downloadImage() {
    // Check if in Facebook browser
    if (isFacebookBrowser()) {
        showFacebookBrowserDialog();
    } else {
        // Normal browser - direct download
        const fileName = `BankCard-${currentBank.short}-${Date.now()}.png`;
        canvas.toBlob(function(blob) {
            if (!blob) return;
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = fileName;
            link.href = url;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
        }, 'image/png');
    }
}

// --- SHOW FACEBOOK BROWSER DIALOG ---
function showFacebookBrowserDialog() {
    // Create modal backdrop
    const modalBackdrop = document.createElement('div');
    modalBackdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    // Create dialog box
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 24px;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        text-align: center;
    `;
    
    dialog.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <h3 style="margin: 0 0 0 12px; font-size: 20px; font-weight: 600; color: #1877F2;">Facebook Browser Detected</h3>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 16px 0;">
            <strong>Facebook</strong> တွင် တိုက်ရိုက် <strong>Download</strong> မရနိုင်ပါ
        </p>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 16px 0;">
            ဤ ဘော်ဇတွင်မှ ပြင်ပဘော်ဇာသို့ Download မှင် ကြိုးစားပေးပါ။ သက်လွန်ပြီးပါသလား?
        </p>
        
        <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button id="fbDialogBack" style="
                flex: 1;
                padding: 12px 24px;
                border: 2px solid #ddd;
                border-radius: 8px;
                background: white;
                color: #666;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            ">GO BACK</button>
            
            <button id="fbDialogContinue" style="
                flex: 1;
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                background: #1877F2;
                color: white;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            ">CONTINUE</button>
        </div>
    `;
    
    modalBackdrop.appendChild(dialog);
    document.body.appendChild(modalBackdrop);
    
    // Button hover effects
    const backBtn = dialog.querySelector('#fbDialogBack');
    const continueBtn = dialog.querySelector('#fbDialogContinue');
    
    backBtn.onmouseover = () => backBtn.style.background = '#f5f5f5';
    backBtn.onmouseout = () => backBtn.style.background = 'white';
    
    continueBtn.onmouseover = () => continueBtn.style.background = '#166FE5';
    continueBtn.onmouseout = () => continueBtn.style.background = '#1877F2';
    
    // Button actions
    backBtn.onclick = () => {
        document.body.removeChild(modalBackdrop);
    };
    
    continueBtn.onclick = () => {
        document.body.removeChild(modalBackdrop);
        openInExternalBrowser();
    };
    
    // Close on backdrop click
    modalBackdrop.onclick = (e) => {
        if (e.target === modalBackdrop) {
            document.body.removeChild(modalBackdrop);
        }
    };
}

// --- OPEN IN EXTERNAL BROWSER ---
function openInExternalBrowser() {
    const currentURL = window.location.href;
    
    // Try multiple methods to open external browser
    const methods = [
        // Method 1: Intent URL for Android
        () => {
            window.location.href = `intent://${currentURL.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
        },
        // Method 2: Direct window.open
        () => {
            window.open(currentURL, '_blank', 'noopener,noreferrer');
        },
        // Method 3: Create temp link
        () => {
            const link = document.createElement('a');
            link.href = currentURL;
            link.target = '_system';
            link.rel = 'external';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    ];
    
    // Try each method
    methods.forEach((method, index) => {
        setTimeout(() => {
            try {
                method();
            } catch (e) {
                console.log(`Method ${index + 1} failed:`, e);
            }
        }, index * 100);
    });
}



// --- CROP LOGIC ---
function handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageToCrop.src = e.target.result;
            cropModal.style.display = 'flex';
            if(cropper) { cropper.destroy(); }
            cropper = new Cropper(imageToCrop, {
                aspectRatio: 1, viewMode: 1, autoCropArea: 0.8,
            });
            input.value = '';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function confirmCrop() {
    if(cropper) {
        const croppedCanvas = cropper.getCroppedCanvas({ width: 300, height: 300 });
        const img = new Image();
        img.onload = () => {
            uploadedUserImg = img;
            render();
            closeCropModal();
        };
        img.src = croppedCanvas.toDataURL();
    }
}

function closeCropModal() {
    cropModal.style.display = 'none';
    if(cropper) { cropper.destroy(); cropper = null; }
}

// --- CORE APP LOGIC ---
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
    document.getElementById('logoUpload').value = "";
    uploadedUserImg = null;
    selectBank(banks[0], document.querySelector('.bank-item'));
}

function render() {
    const name = (document.getElementById('nameInput').value || "NAME HERE").toUpperCase();
    const acct = document.getElementById('acctInput').value || "000-000-0000";
    const style = document.getElementById('styleSelect').value;
    
    canvas.width = 1000; canvas.height = 600;
    const w = canvas.width; const h = canvas.height;

    ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);

    if (style === 'layout_bbl') { drawBBLStyle(w, h, name, acct); }
    else if (style === 'layout_gradient') { drawGradient(w, h, name, acct); }
    else if (style === 'layout_material') { drawMaterial(w, h, name, acct); }
    else { drawModern(w, h, name, acct); }
    imgOutput.src = canvas.toDataURL("image/png");
}

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
