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

// --- STYLE CONFIGURATION ---
const styleOptions = [
    { id: 'layout_bbl', label: 'Default Style' }, // Updated Name
    { id: 'layout_gradient', label: 'Gradient Style' },
    { id: 'layout_material', label: 'Material Style' },
    { id: 'layout_modern', label: 'Modern Style' }
];
let currentStyleIndex = 0;

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
    initDots(); // Initialize Dots
    initSwipeGestures(); // Initialize Touch Swipe
    
    // Check URL Params for Data Transfer
    const urlParams = new URLSearchParams(window.location.search);
    const shouldDownload = urlParams.get('dl');
    const pBank = urlParams.get('b');
    const pName = urlParams.get('n');
    const pAcct = urlParams.get('a');

    // Fill Data if present
    if (pBank) {
        const targetBank = banks.find(b => b.id === pBank);
        if (targetBank) {
            currentBank = targetBank;
        }
    }
    
    updateStyleLabel();
    loadBankLogo(currentBank); // Load logo & Render
    
    if (pName) document.getElementById('nameInput').value = decodeURIComponent(pName);
    if (pAcct) document.getElementById('acctInput').value = decodeURIComponent(pAcct);
    
    // Theme Check
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
        updateThemeIcon();
    }

    // Auto Download Trigger (Wait for render)
    if (shouldDownload === '1' && !isFacebookBrowser()) {
        setTimeout(() => {
            render(); 
            setTimeout(downloadImage, 800); 
        }, 500);
    }
};

// --- DOTS LOGIC ---
function initDots() {
    const container = document.getElementById('styleDots');
    container.innerHTML = ''; // Clear existing
    
    styleOptions.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => jumpToStyle(index);
        container.appendChild(dot);
    });
}

function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        if (index === currentStyleIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// --- STYLE & SWIPE LOGIC ---
function jumpToStyle(index) {
    currentStyleIndex = index;
    updateUIAndRender();
}

function changeStyle(direction) {
    currentStyleIndex += direction;
    
    // Loop logic
    if (currentStyleIndex >= styleOptions.length) {
        currentStyleIndex = 0;
    } else if (currentStyleIndex < 0) {
        currentStyleIndex = styleOptions.length - 1;
    }
    
    updateUIAndRender();
}

function updateUIAndRender() {
    updateStyleLabel();
    updateDots();
    render();
}

function updateStyleLabel() {
    const labelEl = document.getElementById('currentStyleLabel');
    if(labelEl) {
        labelEl.innerText = styleOptions[currentStyleIndex].label;
    }
}

// --- SWIPE GESTURES (TOUCH) ---
function initSwipeGestures() {
    const swipeArea = document.getElementById('swipeArea');
    let startX = 0;
    let endX = 0;

    swipeArea.addEventListener('touchstart', (e) => {
        startX = e.changedTouches[0].screenX;
    }, {passive: true});

    swipeArea.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});

    function handleSwipe() {
        const threshold = 50; // Minimum distance to be considered a swipe
        
        if (endX < startX - threshold) {
            // Swiped Left -> Next
            changeStyle(1);
        } else if (endX > startX + threshold) {
            // Swiped Right -> Previous
            changeStyle(-1);
        }
    }
}

// --- DETECT FACEBOOK BROWSER ---
function isFacebookBrowser() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1) || (ua.indexOf("Instagram") > -1);
}

// --- DOWNLOAD FUNCTION ---
function downloadImage() {
    if (isFacebookBrowser()) {
        showFacebookBrowserDialog();
    } else {
        render(); // Ensure latest state
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

// --- FACEBOOK DIALOG ---
function showFacebookBrowserDialog() {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex; align-items: center; justify-content: center;
        z-index: 10000; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white; border-radius: 12px; padding: 24px;
        max-width: 340px; width: 100%;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        text-align: center; display: flex; flex-direction: column; align-items: center;
    `;
    
    dialog.innerHTML = `
        <div style="margin-bottom: 12px;">
            <svg width="48" height="48" viewBox="0 0 32 32">
                <path d="M32 16c0-8.837-7.163-16-16-16S0 7.163 0 16c0 7.98 5.85 14.604 13.5 15.803v-11.177h-4.063V16h4.063v-3.527c0-4.009 2.385-6.223 6.043-6.223 1.75 0 3.579.313 3.579.313v3.933h-2.016c-1.986 0-2.604 1.233-2.604 2.5v3h4.43l-.708 4.626h-3.722v11.177C26.15 30.604 32 23.98 32 16z" fill="#1877F2"/>
            </svg>
        </div>
        <h3 style="color: #1877F2; margin: 0 0 8px 0; font-size: 19px; font-weight: 700;">Facebook Browser Detected</h3>
        <p style="color: #000; font-weight: 600; font-size: 15px; margin: 0 0 8px 0; line-height: 1.4;">Facebook တွင် တိုက်ရိုက် Download များ<br>ပိတ်ထားသည်</p>
        <p style="color: #65676b; font-size: 14px; margin: 0 0 24px 0; line-height: 1.4;">ဤ ဝက်ဆိုက်မှ ပြုလုပ်ထားသော ပုံအား Download ဖွင့်<br>ရန် ကြိုးစားပေးပါ။ ဆက်လုပ်လိုပါသလား?</p>
        <div style="display: flex; gap: 12px; width: 100%;">
            <button id="fbDialogBack" style="flex: 1; padding: 12px 0; background: #fff; border: 1px solid #e4e6eb; border-radius: 6px; color: #4b4f56; font-weight: 600; font-size: 15px; cursor: pointer;">GO BACK</button>
            <button id="fbDialogContinue" style="flex: 1; padding: 12px 0; background: #fff; border: 1px solid #e4e6eb; border-radius: 6px; color: #1877F2; font-weight: 600; font-size: 15px; cursor: pointer;">CONTINUE</button>
        </div>
    `;
    
    modalBackdrop.appendChild(dialog);
    document.body.appendChild(modalBackdrop);
    
    const backBtn = dialog.querySelector('#fbDialogBack');
    const continueBtn = dialog.querySelector('#fbDialogContinue');
    
    backBtn.onclick = () => document.body.removeChild(modalBackdrop);
    continueBtn.onclick = () => {
        document.body.removeChild(modalBackdrop);
        openInExternalBrowser();
    };
    modalBackdrop.onclick = (e) => { if (e.target === modalBackdrop) document.body.removeChild(modalBackdrop); };
}

// --- OPEN IN EXTERNAL BROWSER ---
function openInExternalBrowser() {
    const currentURL = window.location.href.split('?')[0];
    const name = document.getElementById('nameInput').value;
    const acct = document.getElementById('acctInput').value;
    const bankId = currentBank.id;
    const fullURL = `${currentURL}?dl=1&b=${bankId}&n=${encodeURIComponent(name)}&a=${encodeURIComponent(acct)}`;
    
    const methods = [
        () => { window.location.href = `intent://${fullURL.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`; },
        () => { window.open(fullURL, '_blank', 'noopener,noreferrer'); },
        () => { window.location.href = fullURL; }
    ];
    
    setTimeout(() => { try { methods[0](); } catch(e) {} setTimeout(() => methods[1](), 500); }, 100);
}

// --- CROP LOGIC ---
function handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageToCrop.src = e.target.result;
            cropModal.style.display = 'flex';
            if(cropper) { cropper.destroy(); }
            cropper = new Cropper(imageToCrop, { aspectRatio: 1, viewMode: 1, autoCropArea: 0.8 });
            input.value = '';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function confirmCrop() {
    if(cropper) {
        const croppedCanvas = cropper.getCroppedCanvas({ width: 300, height: 300 });
        const img = new Image();
        img.onload = () => { uploadedUserImg = img; render(); closeCropModal(); };
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
        div.innerHTML = `<img src="${bank.logo}" alt="${bank.short}" onerror="this.src='https://via.placeholder.com/40?text=${bank.short}'"><span>${bank.short}</span>`;
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
    currentStyleIndex = 0; 
    updateUIAndRender();
    selectBank(banks[0], document.querySelector('.bank-item'));
}

// --- RENDER ---
function render() {
    const name = (document.getElementById('nameInput').value || "NAME HERE").toUpperCase();
    const acct = document.getElementById('acctInput').value || "000-000-0000";
    
    // Use Style Index
    const style = styleOptions[currentStyleIndex].id;
    
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
