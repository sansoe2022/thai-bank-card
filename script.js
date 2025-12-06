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

// --- STYLE CONFIGURATION (14 STYLES) ---
const styleOptions = [
    { id: 'layout_bbl', label: 'Default Style' }, 
    { id: 'layout_gradient', label: 'Gradient Style' },
    { id: 'layout_material', label: 'Material Style' },
    { id: 'layout_modern', label: 'Modern Style' },
    { id: 'layout_midnight', label: 'Midnight Pro' },        
    { id: 'layout_golden', label: 'Royal Gold' },            
    { id: 'layout_cyber', label: 'Cyberpunk Neon' },         
    { id: 'layout_nature', label: 'Nature Fresh' },          
    { id: 'layout_glass', label: 'Glassmorphism' },          
    { id: 'layout_minimal', label: 'Minimalist White' },     
    { id: 'layout_geometric', label: 'Geometric Fun' },      
    { id: 'layout_split', label: 'Vertical Split' },         
    { id: 'layout_ocean', label: 'Ocean Waves' },            
    { id: 'layout_ruby', label: 'Ruby Red' }                 
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

// --- HELPER: SAFE ROUND RECT PATH ---
function roundRectPath(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// --- INIT ---
window.onload = function() {
    initBankGrid();
    initDots(); 
    initSwipeGestures(); 
    initTheme(); 
    
    // Check URL Params
    const urlParams = new URLSearchParams(window.location.search);
    const shouldDownload = urlParams.get('dl');
    const pBank = urlParams.get('b');
    const pName = urlParams.get('n');
    const pAcct = urlParams.get('a');

    if (pBank) {
        const targetBank = banks.find(b => b.id === pBank);
        if (targetBank) currentBank = targetBank;
    }
    
    updateStyleLabel();
    loadBankLogo(currentBank);
    
    if (pName) document.getElementById('nameInput').value = decodeURIComponent(pName);
    if (pAcct) document.getElementById('acctInput').value = decodeURIComponent(pAcct);

    if (shouldDownload === '1' && !isFacebookBrowser()) {
        setTimeout(() => { render(); setTimeout(downloadImage, 800); }, 500);
    }
};

// --- THEME MANAGEMENT ---
function initTheme() {
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme === 'dark') document.body.classList.add('dark-mode');
    else if (savedTheme === 'light') document.body.classList.remove('dark-mode');
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.body.classList.add('dark-mode');
    updateThemeIcon();
}
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('appTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    updateThemeIcon();
}
function updateThemeIcon() {
    document.getElementById('themeBtn').innerHTML = `<span class="material-symbols-outlined">${document.body.classList.contains('dark-mode') ? 'light_mode' : 'dark_mode'}</span>`;
}

// --- DOTS & SLIDER LOGIC ---
function initDots() {
    const container = document.getElementById('styleDots');
    container.innerHTML = '';
    styleOptions.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => jumpToStyle(index);
        container.appendChild(dot);
    });
}

function updateDots() {
    document.querySelectorAll('.dot').forEach((dot, index) => {
        if (index === currentStyleIndex) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}

function jumpToStyle(index) {
    if (index === currentStyleIndex) return;
    currentStyleIndex = index;
    triggerAnimation();
    updateUIAndRender();
}

function changeStyle(direction) {
    currentStyleIndex += direction;
    if (currentStyleIndex >= styleOptions.length) currentStyleIndex = 0;
    else if (currentStyleIndex < 0) currentStyleIndex = styleOptions.length - 1;
    triggerAnimation();
    updateUIAndRender();
}

function triggerAnimation() {
    const img = document.getElementById('resultImage');
    img.classList.remove('slide-animate');
    void img.offsetWidth; 
    img.classList.add('slide-animate');
}

function updateUIAndRender() {
    updateStyleLabel();
    updateDots();
    render();
}

function updateStyleLabel() {
    const labelEl = document.getElementById('currentStyleLabel');
    if(labelEl) labelEl.innerText = styleOptions[currentStyleIndex].label;
}

function initSwipeGestures() {
    const swipeArea = document.getElementById('swipeArea');
    let startX = 0; let endX = 0;
    swipeArea.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].screenX; }, {passive: true});
    swipeArea.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].screenX;
        if (endX < startX - 50) changeStyle(1);
        else if (endX > startX + 50) changeStyle(-1);
    }, {passive: true});
}

// --- RENDER FUNCTION ---
function render() {
    try {
        const name = document.getElementById('nameInput').value || "Name Here";
        const acct = document.getElementById('acctInput').value || "000-000-0000";
        const style = styleOptions[currentStyleIndex].id;
        
        canvas.width = 1000; canvas.height = 600;
        const w = canvas.width; const h = canvas.height;

        ctx.clearRect(0, 0, w, h);
        
        switch(style) {
            case 'layout_bbl': drawBBLStyle(w, h, name, acct); break;
            case 'layout_gradient': drawGradient(w, h, name, acct); break;
            case 'layout_material': drawMaterial(w, h, name, acct); break;
            case 'layout_modern': drawModern(w, h, name, acct); break;
            case 'layout_midnight': drawMidnight(w, h, name, acct); break;
            case 'layout_golden': drawGolden(w, h, name, acct); break;
            case 'layout_cyber': drawCyber(w, h, name, acct); break;
            case 'layout_nature': drawNature(w, h, name, acct); break;
            case 'layout_glass': drawGlass(w, h, name, acct); break;
            case 'layout_minimal': drawMinimal(w, h, name, acct); break;
            case 'layout_geometric': drawGeometric(w, h, name, acct); break;
            case 'layout_split': drawSplit(w, h, name, acct); break;
            case 'layout_ocean': drawOcean(w, h, name, acct); break;
            case 'layout_ruby': drawRuby(w, h, name, acct); break;
            default: drawBBLStyle(w, h, name, acct);
        }
        
        imgOutput.src = canvas.toDataURL("image/png");
    } catch (e) {
        console.error("Render error:", e);
    }
}

// --- QR DRAWER ---
function drawQrBox(x, y, size, borderColor = "#ccc") {
    if (uploadedUserImg) {
        ctx.save(); 
        ctx.beginPath(); roundRectPath(ctx, x, y, size, size, 20); ctx.closePath(); ctx.clip();
        ctx.drawImage(uploadedUserImg, x, y, size, size); 
        ctx.restore();
    } else {
        ctx.fillStyle = "#f8f9fa";
        ctx.beginPath(); roundRectPath(ctx, x, y, size, size, 20); ctx.fill();
        ctx.fillStyle = "#ccc"; ctx.font = "bold 20px Arial"; ctx.textAlign = "center";
        ctx.fillText("QR", x + size/2, y + size/2 + 7);
    }
    ctx.strokeStyle = borderColor; ctx.lineWidth = 4;
    ctx.beginPath(); roundRectPath(ctx, x, y, size, size, 20); ctx.stroke();
}

// --- DRAWING FUNCTIONS ---

// 1. DEFAULT (Updated: Name & Short Code)
function drawBBLStyle(w, h, name, acct) {
    const mainColor = currentBank.color;
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h);
    if (bankLogoImg.complete && bankLogoImg.naturalHeight !== 0) ctx.drawImage(bankLogoImg, 50, 40, 150, 150);
    else { ctx.fillStyle = mainColor; ctx.beginPath(); ctx.arc(125, 115, 70, 0, Math.PI*2); ctx.fill(); }
    
    ctx.fillStyle = "#ccc"; ctx.fillRect(230, 50, 4, 120);
    let textX = 260;
    
    // UPDATED: Show Full Name
    ctx.fillStyle = mainColor; ctx.font = "bold 50px Roboto, Arial"; ctx.textAlign = "left";
    ctx.fillText(currentBank.name, textX, 110);
    
    ctx.fillStyle = "#555"; ctx.font = "bold 40px Kanit, Arial";
    ctx.fillText(currentBank.thName || "ธนาคาร", textX, 160);
    ctx.fillStyle = "#f97316"; ctx.fillRect(textX, 125, 300, 4);

    drawQrBox(w - 210, 40, 160, mainColor);

    ctx.fillStyle = mainColor; ctx.fillRect(50, 250, 320, 80);
    ctx.fillStyle = (currentBank.id === 'bay') ? currentBank.txtColor : "#fff";
    
    // UPDATED: Show Short Code instead of "BANK NUMBER"
    ctx.font = "bold 45px Roboto"; ctx.textAlign = "center"; 
    ctx.fillText(currentBank.short, 210, 305);
    
    ctx.fillStyle = "#444"; ctx.font = "bold 80px Roboto"; ctx.textAlign = "left"; ctx.fillText(acct, 400, 315);
    
    ctx.fillStyle = mainColor; ctx.fillRect(50, 400, w - 100, 130);
    ctx.fillStyle = (currentBank.id === 'bay') ? currentBank.txtColor : "#fff";
    ctx.font = "bold 55px Roboto, Padauk"; ctx.textAlign = "left"; ctx.fillText(name, 90, 485);
}

// 2. GRADIENT
function drawGradient(w, h, name, acct) {
    let grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, currentBank.color); grd.addColorStop(1, "#f1f5f9");
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 30;
    ctx.beginPath(); roundRectPath(ctx, 100, 100, w-200, h-200, 30); ctx.fill(); ctx.shadowBlur = 0;
    
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 130, 130, 80, 80);
    ctx.textAlign = "left"; ctx.fillStyle = currentBank.color; ctx.font = "bold 40px Roboto";
    ctx.fillText(currentBank.short, 230, 185);
    
    if(uploadedUserImg) {
        ctx.save(); ctx.beginPath(); ctx.arc(w/2, 230, 60, 0, Math.PI*2); ctx.clip();
        ctx.drawImage(uploadedUserImg, w/2 - 60, 170, 120, 120); ctx.restore();
    } else {
        ctx.fillStyle = "#eee"; ctx.beginPath(); ctx.arc(w/2, 230, 60, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#ccc"; ctx.font = "bold 16px Arial"; ctx.textAlign = "center"; ctx.fillText("QR", w/2, 235);
    }
    ctx.beginPath(); ctx.arc(w/2, 230, 60, 0, Math.PI*2); ctx.strokeStyle = currentBank.color; ctx.lineWidth = 4; ctx.stroke();
    
    ctx.textAlign = "center"; ctx.fillStyle = currentBank.color; ctx.font = "bold 60px Roboto"; ctx.fillText(acct, w/2, 350);
    ctx.fillStyle = "#555"; ctx.font = "bold 40px Padauk"; ctx.fillText(name, w/2, 420);
}

// 3. MATERIAL
function drawMaterial(w, h, name, acct) {
    ctx.fillStyle = "#f5f5f5"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    ctx.beginPath(); roundRectPath(ctx, 80, 80, w-160, h-160, 16); ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    
    ctx.fillStyle = currentBank.color; ctx.beginPath();
    const hx=80, hy=80, hw=w-160, hh=20, rad=16;
    ctx.moveTo(hx + rad, hy); ctx.lineTo(hx + hw - rad, hy);
    ctx.quadraticCurveTo(hx + hw, hy, hx + hw, hy + rad);
    ctx.lineTo(hx + hw, hy + hh); ctx.lineTo(hx, hy + hh);
    ctx.lineTo(hx, hy + rad); ctx.quadraticCurveTo(hx, hy, hx + rad, hy);
    ctx.fill();
    
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 120, 140, 80, 80);
    drawQrBox(w-240, 140, 80, currentBank.color);

    ctx.textAlign = "left"; ctx.fillStyle = "#202124"; ctx.font = "bold 40px Roboto"; ctx.fillText(currentBank.name, 220, 180);
    ctx.fillStyle = currentBank.color; ctx.font = "bold 70px Roboto"; ctx.fillText(acct, 120, 320);
    ctx.fillStyle = "#202124"; ctx.font = "35px Padauk"; ctx.fillText(name, 120, 400);
}

// 4. MODERN
function drawModern(w, h, name, acct) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = currentBank.color; ctx.fillRect(0,0, 30, h);
    
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 60, 50, 100, 100);
    drawQrBox(w-180, 50, 120, currentBank.color);
    
    ctx.textAlign = "left"; ctx.fillStyle = "#000"; ctx.font = "bold 40px Roboto"; ctx.fillText(currentBank.name, 190, 115);
    ctx.fillStyle = currentBank.color; ctx.font = "bold 80px Roboto"; ctx.fillText(acct, 80, 320);
    ctx.fillStyle = "#000"; ctx.font = "bold 50px Padauk"; ctx.fillText(name, 80, 470);
}

// 5. MIDNIGHT PRO
function drawMidnight(w, h, name, acct) {
    let grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#1a1a1a"); grd.addColorStop(1, "#000000");
    ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);
    
    ctx.strokeStyle = currentBank.color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(50, 180); ctx.lineTo(w-50, 180); ctx.stroke();
    
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 50, 50, 100, 100);
    
    ctx.textAlign = "left"; ctx.fillStyle = "#fff"; ctx.font = "bold 50px Roboto"; ctx.fillText(currentBank.name, 180, 120);
    ctx.fillStyle = "#888"; ctx.font = "30px Roboto"; ctx.fillText("Account Number", 50, 250);
    ctx.fillStyle = "#fff"; ctx.font = "bold 80px Roboto"; ctx.fillText(acct, 50, 330);
    ctx.fillStyle = "#888"; ctx.font = "30px Roboto"; ctx.fillText("Account Name", 50, 450);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 60px Padauk"; ctx.fillText(name, 50, 520);
    
    drawQrBox(w-220, 40, 120, "#fff");
}

// 6. ROYAL GOLD
function drawGolden(w, h, name, acct) {
    let grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, "#BF953F"); grd.addColorStop(0.3, "#FCF6BA");
    grd.addColorStop(0.6, "#B38728"); grd.addColorStop(1, "#FBF5B7");
    ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);
    
    ctx.fillStyle = "#000"; 
    ctx.beginPath(); roundRectPath(ctx, 50, 50, w-100, h-100, 30); ctx.fill();
    
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 100, 100, 80, 80);
    drawQrBox(w-200, 100, 100, "#BF953F");

    ctx.textAlign = "left"; ctx.fillStyle = "#BF953F"; ctx.font = "bold 40px Roboto"; ctx.fillText(currentBank.short, 200, 155);
    ctx.fillStyle = "#fff"; ctx.font = "bold 70px Roboto"; ctx.textAlign = "center"; ctx.fillText(acct, w/2, 300);
    ctx.fillStyle = "#BF953F"; ctx.font = "bold 50px Padauk"; ctx.fillText(name, w/2, 450);
}

// 7. CYBERPUNK (Updated: QR Beside Logo)
function drawCyber(w, h, name, acct) {
    ctx.fillStyle = "#050505"; ctx.fillRect(0,0,w,h);
    ctx.shadowColor = currentBank.color; ctx.shadowBlur = 20;
    ctx.strokeStyle = currentBank.color; ctx.lineWidth = 5;
    ctx.strokeRect(50, 50, w-100, h-100); ctx.shadowBlur = 0;
    
    // Logo Left
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 80, 80, 100, 100);
    
    // UPDATED: QR Beside Logo
    drawQrBox(200, 80, 100, currentBank.color);

    ctx.textAlign = "right"; ctx.fillStyle = "#fff"; ctx.font = "bold 40px Roboto"; 
    ctx.fillText(currentBank.name, w-80, 140);
    
    ctx.textAlign = "left"; 
    ctx.shadowColor = currentBank.color; ctx.shadowBlur = 10;
    ctx.fillStyle = "#fff"; ctx.font = "bold 90px Roboto"; ctx.fillText(acct, 80, 350); ctx.shadowBlur = 0;
    
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 60px Padauk"; ctx.fillText(name, 80, 500);
}

// 8. NATURE FRESH
function drawNature(w, h, name, acct) {
    let grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#a8e063"); grd.addColorStop(1, "#56ab2f");
    ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);
    
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath(); ctx.arc(0, 0, 300, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(w, h, 400, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = "#fff"; ctx.beginPath(); roundRectPath(ctx, 80, 120, w-160, h-240, 20); ctx.fill();
    
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 120, 150, 80, 80);
    drawQrBox(w-220, 150, 80, "#56ab2f");

    ctx.textAlign = "left"; ctx.fillStyle = "#2c3e50"; ctx.font = "bold 40px Roboto"; ctx.fillText(currentBank.name, 230, 200);
    ctx.fillStyle = "#2c3e50"; ctx.font = "bold 80px Roboto"; ctx.textAlign = "center"; ctx.fillText(acct, w/2, 340);
    ctx.fillStyle = "#56ab2f"; ctx.font = "bold 45px Padauk"; ctx.fillText(name, w/2, 420);
}

// 9. GLASSMORPHISM
function drawGlass(w, h, name, acct) {
    let grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, "#FF3CAC"); grd.addColorStop(0.5, "#784BA0"); grd.addColorStop(1, "#2B86C5");
    ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.beginPath(); roundRectPath(ctx, 100, 100, w-200, h-200, 30); ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"; ctx.lineWidth = 2; ctx.stroke();
    
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 140, 140, 80, 80);
    drawQrBox(w-240, 140, 80, "#fff");

    ctx.textAlign = "left"; ctx.fillStyle = "#fff"; ctx.font = "bold 40px Roboto"; ctx.fillText(currentBank.short, 250, 195);
    ctx.fillStyle = "#fff"; ctx.font = "bold 70px Roboto"; ctx.textAlign = "center"; ctx.fillText(acct, w/2, 320);
    ctx.fillStyle = "#fff"; ctx.font = "bold 50px Padauk"; ctx.fillText(name, w/2, 420);
}

// 10. MINIMALIST WHITE
function drawMinimal(w, h, name, acct) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = "#000"; ctx.lineWidth = 4; ctx.strokeRect(30,30,w-60,h-60);
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, w/2-50, 80, 100, 100);
    
    drawQrBox(w-160, 50, 100, "#000");

    ctx.fillStyle = "#000"; ctx.textAlign = "center"; ctx.font = "30px Roboto"; ctx.fillText("ACCOUNT DETAILS", w/2, 250);
    ctx.font = "bold 90px Roboto"; ctx.fillText(acct, w/2, 350);
    ctx.fillRect(w/2-100, 400, 200, 2); ctx.font = "40px Padauk"; ctx.fillText(name, w/2, 480);
}

// 11. GEOMETRIC FUN
function drawGeometric(w, h, name, acct) {
    ctx.fillStyle = "#2C3E50"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = "#E74C3C"; ctx.beginPath(); ctx.arc(100, 100, 150, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#F1C40F"; ctx.beginPath(); ctx.moveTo(w, 0); ctx.lineTo(w-300, 0); ctx.lineTo(w, 300); ctx.fill();
    ctx.fillStyle = "#3498DB"; ctx.beginPath(); ctx.rect(100, h-200, 200, 200); ctx.fill();
    
    ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.beginPath(); roundRectPath(ctx, 150, 150, w-300, h-300, 20); ctx.fill();
    
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, w/2-40, 180, 80, 80);
    drawQrBox(w-250, 170, 60, "#333");

    ctx.fillStyle = "#000"; ctx.textAlign = "center";
    ctx.font = "bold 70px Roboto"; ctx.fillText(acct, w/2, 330);
    ctx.font = "bold 45px Padauk"; ctx.fillText(name, w/2, 410);
}

// 12. VERTICAL SPLIT (Updated: QR Under BBL)
function drawSplit(w, h, name, acct) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h);
    
    ctx.fillStyle = currentBank.color; ctx.fillRect(0,0, w*0.4, h);
    
    // Logo moved up
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 80, 50, 120, 120);
    
    // Text moved up
    ctx.fillStyle = "#fff"; ctx.textAlign = "left"; 
    ctx.font = "bold 60px Roboto"; ctx.fillText(currentBank.short, 80, 220);
    
    // UPDATED: QR Below Text
    drawQrBox(80, 260, 120, "#fff");

    ctx.fillStyle = "#000";
    ctx.font = "bold 70px Roboto"; ctx.fillText(acct, w*0.45, 250);
    ctx.fillStyle = "#666";
    ctx.font = "bold 50px Padauk"; ctx.fillText(name, w*0.45, 350);
}

// 13. OCEAN WAVES
function drawOcean(w, h, name, acct) {
    ctx.fillStyle = "#E0F7FA"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = "#0288D1"; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, 300); ctx.bezierCurveTo(300, 400, 700, 200, w, 300); ctx.lineTo(w, h); ctx.fill();
    
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 50, 50, 100, 100);
    drawQrBox(180, 50, 100, "#01579B");

    ctx.fillStyle = "#01579B"; ctx.textAlign = "right"; ctx.font = "bold 60px Roboto"; ctx.fillText(acct, w-50, 150);
    ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.font = "bold 60px Padauk"; ctx.fillText(name, 50, 500);
}

// 14. RUBY RED
function drawRuby(w, h, name, acct) {
    let grd = ctx.createRadialGradient(w/2, h/2, 50, w/2, h/2, 500);
    grd.addColorStop(0, "#D32F2F"); grd.addColorStop(1, "#880E4F");
    ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);
    
    ctx.strokeStyle = "#FFCDD2"; ctx.lineWidth = 10; ctx.strokeRect(50,50,w-100,h-100);
    
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, w/2-50, 100, 100, 100);
    drawQrBox(w-200, 100, 100, "#fff");

    ctx.fillStyle = "#fff"; ctx.textAlign = "center"; 
    ctx.font = "bold 80px Roboto"; ctx.fillText(acct, w/2, 320);
    ctx.font = "40px Padauk"; ctx.fillText(name, w/2, 420);
}

// --- FACEBOOK BROWSER DETECT ---
function isFacebookBrowser() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1) || (ua.indexOf("Instagram") > -1);
}

// --- DOWNLOAD FUNCTION ---
function downloadImage() {
    if (isFacebookBrowser()) {
        showFacebookBrowserDialog();
    } else {
        render(); 
        const fileName = `BankCard-${currentBank.short}-${Date.now()}.png`;
        canvas.toBlob(function(blob) {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = fileName; link.href = url;
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }, 'image/png');
    }
}

function showFacebookBrowserDialog() {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px; font-family: sans-serif;`;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `background: white; border-radius: 12px; padding: 24px; max-width: 340px; width: 100%; text-align: center;`;
    
    dialog.innerHTML = `<h3 style="color: #1877F2;">Facebook Browser Detected</h3><p>Please open in Chrome/Safari to download.</p>
    <div style="display: flex; gap: 10px; margin-top: 15px;"><button id="fbBack" style="flex:1; padding: 10px;">Back</button><button id="fbOpen" style="flex:1; padding: 10px;">Open External</button></div>`;
    
    modalBackdrop.appendChild(dialog);
    document.body.appendChild(modalBackdrop);
    
    document.getElementById('fbBack').onclick = () => document.body.removeChild(modalBackdrop);
    document.getElementById('fbOpen').onclick = () => { document.body.removeChild(modalBackdrop); openInExternalBrowser(); };
}

function openInExternalBrowser() {
    const fullURL = window.location.href;
    window.location.href = `intent://${fullURL.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
}

// --- CROP HANDLERS ---
function handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageToCrop.src = e.target.result;
            cropModal.style.display = 'flex';
            if(cropper) cropper.destroy();
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
