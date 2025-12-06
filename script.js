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

    // Auto Download if opened from Intent
    if (shouldDownload === '1' && !isFacebookBrowser()) {
        setTimeout(() => { 
            render(); 
            setTimeout(downloadImage, 800); 
        }, 500);
    }
};

// --- THEME SAVING ---
function initTheme() {
    const saved = localStorage.getItem('appTheme');
    if (saved === 'dark') document.body.classList.add('dark-mode');
    else if (saved === 'light') document.body.classList.remove('dark-mode');
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    }
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

// --- SLIDER & ANIMATION ---
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
    img.classList.remove('zoom-animate');
    void img.offsetWidth; // Trigger Reflow
    img.classList.add('zoom-animate');
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
        const w = 1000, h = 600;
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
    } catch(e) { console.error("Render error:", e); }
}

// --- QR BOX DRAWER ---
function drawQrBox(x, y, size, borderColor="#ccc") {
    if (uploadedUserImg) {
        ctx.save(); ctx.beginPath(); roundRectPath(ctx, x, y, size, size, 20); ctx.closePath(); ctx.clip();
        ctx.drawImage(uploadedUserImg, x, y, size, size); ctx.restore();
    } else {
        ctx.fillStyle = "#f8f9fa"; ctx.beginPath(); roundRectPath(ctx, x, y, size, size, 20); ctx.fill();
        ctx.fillStyle = "#ccc"; ctx.font = "bold 20px Arial"; ctx.textAlign = "center"; ctx.fillText("QR", x+size/2, y+size/2+7);
    }
    ctx.strokeStyle = borderColor; ctx.lineWidth = 4; ctx.beginPath(); roundRectPath(ctx, x, y, size, size, 20); ctx.stroke();
}

// --- DRAWING STYLES ---
function drawBBLStyle(w, h, name, acct) {
    const mainColor = currentBank.color;
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h);
    if (bankLogoImg.complete && bankLogoImg.naturalHeight!==0) ctx.drawImage(bankLogoImg, 50, 40, 150, 150);
    else { ctx.fillStyle=mainColor; ctx.beginPath(); ctx.arc(125,115,70,0,Math.PI*2); ctx.fill(); }
    
    ctx.fillStyle = "#ccc"; ctx.fillRect(230, 50, 4, 120);
    ctx.fillStyle = mainColor; ctx.font = "bold 50px Roboto, Arial"; ctx.textAlign = "left"; 
    ctx.fillText(currentBank.name, 260, 110);
    ctx.fillStyle = "#555"; ctx.font = "bold 40px Kanit"; ctx.fillText(currentBank.thName||"Bank", 260, 160);
    ctx.fillStyle = "#f97316"; ctx.fillRect(260, 125, 300, 4);

    drawQrBox(w - 210, 40, 160, mainColor);

    ctx.fillStyle = mainColor; ctx.fillRect(50, 250, 320, 80);
    ctx.fillStyle = (currentBank.id==='bay')?currentBank.txtColor:"#fff";
    ctx.font = "bold 45px Roboto"; ctx.textAlign="center"; ctx.fillText(currentBank.short, 210, 305);
    
    ctx.fillStyle = "#444"; ctx.font = "bold 80px Roboto"; ctx.textAlign="left"; ctx.fillText(acct, 400, 315);
    ctx.fillStyle = mainColor; ctx.fillRect(50, 400, w-100, 130);
    ctx.fillStyle = (currentBank.id==='bay')?currentBank.txtColor:"#fff";
    ctx.font = "bold 55px Roboto, Padauk"; ctx.textAlign = "left"; ctx.fillText(name, 90, 485);
}

function drawGradient(w, h, name, acct) {
    let grd = ctx.createLinearGradient(0,0,w,h);
    grd.addColorStop(0, currentBank.color); grd.addColorStop(1, "#f1f5f9");
    ctx.fillStyle=grd; ctx.fillRect(0,0,w,h);
    ctx.fillStyle="rgba(255,255,255,0.95)"; ctx.shadowBlur=30; ctx.shadowColor="rgba(0,0,0,0.2)";
    ctx.beginPath(); roundRectPath(ctx,100,100,w-200,h-200,30); ctx.fill(); ctx.shadowBlur=0;
    
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 130,130,80,80);
    ctx.fillStyle=currentBank.color; ctx.font="bold 40px Roboto"; ctx.textAlign="left"; ctx.fillText(currentBank.short, 230,185);
    
    if(uploadedUserImg) {
        ctx.save(); ctx.beginPath(); ctx.arc(w/2,230,60,0,Math.PI*2); ctx.clip();
        ctx.drawImage(uploadedUserImg, w/2-60,170,120,120); ctx.restore();
    } else {
        ctx.fillStyle="#eee"; ctx.beginPath(); ctx.arc(w/2,230,60,0,Math.PI*2); ctx.fill();
        ctx.fillStyle="#ccc"; ctx.font="bold 16px Arial"; ctx.textAlign="center"; ctx.fillText("QR", w/2, 235);
    }
    ctx.beginPath(); ctx.arc(w/2,230,60,0,Math.PI*2); ctx.strokeStyle=currentBank.color; ctx.lineWidth=4; ctx.stroke();
    
    ctx.textAlign="center"; ctx.fillStyle=currentBank.color; ctx.font="bold 60px Roboto"; ctx.fillText(acct, w/2,350);
    ctx.fillStyle="#555"; ctx.font="bold 40px Padauk"; ctx.fillText(name, w/2,420);
}

function drawMaterial(w, h, name, acct) {
    ctx.fillStyle="#f5f5f5"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle="#fff"; ctx.shadowBlur=10; ctx.shadowColor="rgba(0,0,0,0.1)";
    ctx.beginPath(); roundRectPath(ctx,80,80,w-160,h-160,16); ctx.fill(); ctx.shadowBlur=0;
    
    ctx.fillStyle=currentBank.color; ctx.beginPath();
    const x=80,y=80,rw=w-160,rh=20,r=16; 
    ctx.moveTo(x+r,y); ctx.lineTo(x+rw-r,y); ctx.quadraticCurveTo(x+rw,y,x+rw,y+r);
    ctx.lineTo(x+rw,y+rh); ctx.lineTo(x,y+rh); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.fill();
    
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 120,140,80,80);
    drawQrBox(w-240, 140, 80, currentBank.color);

    ctx.textAlign="left"; ctx.fillStyle="#202124"; ctx.font="bold 40px Roboto"; ctx.fillText(currentBank.name, 220,180);
    ctx.fillStyle=currentBank.color; ctx.font="bold 70px Roboto"; ctx.fillText(acct, 120,320);
    ctx.fillStyle="#202124"; ctx.font="35px Padauk"; ctx.fillText(name, 120,400);
}

function drawModern(w, h, name, acct) {
    ctx.fillStyle="#fff"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle=currentBank.color; ctx.fillRect(0,0,30,h);
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 60,50,100,100);
    drawQrBox(w-180, 50, 120, currentBank.color);
    ctx.textAlign="left"; ctx.fillStyle="#000"; ctx.font="bold 40px Roboto"; ctx.fillText(currentBank.name, 190,115);
    ctx.fillStyle=currentBank.color; ctx.font="bold 80px Roboto"; ctx.fillText(acct, 80,320);
    ctx.fillStyle="#000"; ctx.font="bold 50px Padauk"; ctx.fillText(name, 80,470);
}

function drawMidnight(w, h, name, acct) {
    let grd=ctx.createLinearGradient(0,0,0,h); grd.addColorStop(0,"#1a1a1a"); grd.addColorStop(1,"#000");
    ctx.fillStyle=grd; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle=currentBank.color; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(50,180); ctx.lineTo(w-50,180); ctx.stroke();
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 50,50,100,100);
    ctx.textAlign="left"; ctx.fillStyle="#fff"; ctx.font="bold 50px Roboto"; ctx.fillText(currentBank.name, 180,120);
    ctx.fillStyle="#888"; ctx.font="30px Roboto"; ctx.fillText("Account Number", 50,250);
    ctx.fillStyle="#fff"; ctx.font="bold 80px Roboto"; ctx.fillText(acct, 50,330);
    ctx.fillStyle="#888"; ctx.font="30px Roboto"; ctx.fillText("Account Name", 50,450);
    ctx.fillStyle="#ffffff"; ctx.font="bold 60px Padauk"; ctx.fillText(name, 50,520);
    drawQrBox(w-220, 40, 120, "#fff");
}

function drawGolden(w, h, name, acct) {
    let grd=ctx.createLinearGradient(0,0,w,h); grd.addColorStop(0,"#BF953F"); grd.addColorStop(0.5,"#FCF6BA"); grd.addColorStop(1,"#B38728");
    ctx.fillStyle=grd; ctx.fillRect(0,0,w,h);
    ctx.fillStyle="#000"; ctx.beginPath(); roundRectPath(ctx,50,50,w-100,h-100,30); ctx.fill();
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 100,100,80,80);
    drawQrBox(w-200, 100, 100, "#BF953F");
    ctx.textAlign="left"; ctx.fillStyle="#BF953F"; ctx.font="bold 40px Roboto"; ctx.fillText(currentBank.short, 200,155);
    ctx.fillStyle="#fff"; ctx.font="bold 70px Roboto"; ctx.textAlign="center"; ctx.fillText(acct, w/2,300);
    ctx.fillStyle="#BF953F"; ctx.font="bold 50px Padauk"; ctx.fillText(name, w/2,450);
}

function drawCyber(w, h, name, acct) {
    ctx.fillStyle="#050505"; ctx.fillRect(0,0,w,h);
    ctx.shadowColor=currentBank.color; ctx.shadowBlur=20; ctx.strokeStyle=currentBank.color; ctx.lineWidth=5;
    ctx.strokeRect(50,50,w-100,h-100); ctx.shadowBlur=0;
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 80,80,100,100);
    drawQrBox(200, 80, 100, currentBank.color);
    ctx.textAlign="right"; ctx.fillStyle="#fff"; ctx.font="bold 40px Roboto"; ctx.fillText(currentBank.name, w-80,140);
    ctx.textAlign="left"; ctx.shadowColor=currentBank.color; ctx.shadowBlur=10;
    ctx.fillStyle="#fff"; ctx.font="bold 90px Roboto"; ctx.fillText(acct, 80,350); ctx.shadowBlur=0;
    ctx.fillStyle="#ffffff"; ctx.font="bold 60px Padauk"; ctx.fillText(name, 80,500);
}

function drawNature(w, h, name, acct) {
    let grd=ctx.createLinearGradient(0,0,0,h); grd.addColorStop(0,"#a8e063"); grd.addColorStop(1,"#56ab2f");
    ctx.fillStyle=grd; ctx.fillRect(0,0,w,h);
    ctx.fillStyle="rgba(255,255,255,0.2)"; ctx.beginPath(); ctx.arc(0,0,300,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(w,h,400,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#fff"; ctx.beginPath(); roundRectPath(ctx,80,120,w-160,h-240,20); ctx.fill();
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 120,150,80,80);
    drawQrBox(w-220, 150, 80, "#56ab2f");
    ctx.textAlign="left"; ctx.fillStyle="#2c3e50"; ctx.font="bold 40px Roboto"; ctx.fillText(currentBank.name, 230,200);
    ctx.fillStyle="#2c3e50"; ctx.font="bold 80px Roboto"; ctx.textAlign="center"; ctx.fillText(acct, w/2,340);
    ctx.fillStyle="#56ab2f"; ctx.font="bold 45px Padauk"; ctx.fillText(name, w/2,420);
}

function drawGlass(w, h, name, acct) {
    let grd=ctx.createLinearGradient(0,0,w,h); grd.addColorStop(0,"#FF3CAC"); grd.addColorStop(0.5,"#784BA0"); grd.addColorStop(1,"#2B86C5");
    ctx.fillStyle=grd; ctx.fillRect(0,0,w,h);
    ctx.fillStyle="rgba(255,255,255,0.25)"; ctx.beginPath(); roundRectPath(ctx,100,100,w-200,h-200,30); ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,0.5)"; ctx.lineWidth=2; ctx.stroke();
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 140,140,80,80);
    drawQrBox(w-240, 140, 80, "#fff");
    ctx.textAlign="left"; ctx.fillStyle="#fff"; ctx.font="bold 40px Roboto"; ctx.fillText(currentBank.short, 250,195);
    ctx.fillStyle="#fff"; ctx.font="bold 70px Roboto"; ctx.textAlign="center"; ctx.fillText(acct, w/2,320);
    ctx.fillStyle="#fff"; ctx.font="bold 50px Padauk"; ctx.fillText(name, w/2,420);
}

function drawMinimal(w, h, name, acct) {
    ctx.fillStyle="#fff"; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle="#000"; ctx.lineWidth=4; ctx.strokeRect(30,30,w-60,h-60);
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, w/2-50,80,100,100);
    drawQrBox(w-160, 50, 100, "#000");
    ctx.fillStyle="#000"; ctx.textAlign="center"; ctx.font="30px Roboto"; ctx.fillText("ACCOUNT DETAILS", w/2,250);
    ctx.font="bold 90px Roboto"; ctx.fillText(acct, w/2,350);
    ctx.fillRect(w/2-100,400,200,2); ctx.font="40px Padauk"; ctx.fillText(name, w/2,480);
}

function drawGeometric(w, h, name, acct) {
    ctx.fillStyle="#2C3E50"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle="#E74C3C"; ctx.beginPath(); ctx.arc(100,100,150,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#F1C40F"; ctx.beginPath(); ctx.moveTo(w,0); ctx.lineTo(w-300,0); ctx.lineTo(w,300); ctx.fill();
    ctx.fillStyle="#3498DB"; ctx.beginPath(); ctx.rect(100,h-200,200,200); ctx.fill();
    ctx.fillStyle="rgba(255,255,255,0.9)"; ctx.beginPath(); roundRectPath(ctx,150,150,w-300,h-300,20); ctx.fill();
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, w/2-40,180,80,80);
    drawQrBox(w-150, 50, 120, "#333");
    ctx.fillStyle="#000"; ctx.textAlign="center"; ctx.font="bold 70px Roboto"; ctx.fillText(acct, w/2,330);
    ctx.font="bold 45px Padauk"; ctx.fillText(name, w/2,410);
}

function drawSplit(w, h, name, acct) {
    ctx.fillStyle="#fff"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle=currentBank.color; ctx.fillRect(0,0,w*0.4,h);
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 80,50,120,120);
    ctx.fillStyle="#fff"; ctx.textAlign="left"; ctx.font="bold 60px Roboto"; ctx.fillText(currentBank.short, 80,220);
    drawQrBox(80, 260, 120, "#fff");
    ctx.fillStyle="#000"; ctx.textAlign="center";
    ctx.font="bold 70px Roboto"; ctx.fillText(acct, 700,250);
    ctx.fillStyle="#666"; ctx.font="bold 50px Padauk"; ctx.fillText(name, 700,350);
}

function drawOcean(w, h, name, acct) {
    ctx.fillStyle="#fff"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle=currentBank.color; ctx.beginPath(); ctx.moveTo(0,h); ctx.lineTo(0,300); 
    ctx.bezierCurveTo(300,400,700,200,w,300); ctx.lineTo(w,h); ctx.fill();
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, 50,50,100,100);
    drawQrBox(180, 50, 100, currentBank.color);
    ctx.fillStyle=currentBank.color; ctx.textAlign="right"; ctx.font="bold 60px Roboto"; ctx.fillText(acct, w-50,150);
    ctx.fillStyle="#fff"; ctx.textAlign="left"; ctx.font="bold 60px Padauk"; ctx.fillText(name, 50,500);
}

function drawRuby(w, h, name, acct) {
    let grd=ctx.createRadialGradient(w/2,h/2,50,w/2,h/2,500); grd.addColorStop(0,"#D32F2F"); grd.addColorStop(1,"#880E4F");
    ctx.fillStyle=grd; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle="#FFCDD2"; ctx.lineWidth=10; ctx.strokeRect(50,50,w-100,h-100);
    if(bankLogoImg.complete) ctx.drawImage(bankLogoImg, w/2-50,100,100,100);
    drawQrBox(w-200, 100, 100, "#fff");
    ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.font="bold 80px Roboto"; ctx.fillText(acct, w/2,320);
    ctx.font="40px Padauk"; ctx.fillText(name, w/2,420);
}

// --- UTIL ---
function isFacebookBrowser() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1) || (ua.indexOf("Instagram") > -1);
}

function downloadImage() {
    // Check if user is in Facebook/Instagram/Messenger Browser
    if (isFacebookBrowser()) {
        showFacebookBrowserDialog();
    } else {
        render(); 
        const link = document.createElement('a');
        link.download = `BankCard-${currentBank.short}-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link); 
        link.click(); 
        document.body.removeChild(link);
    }
}

// --- CUSTOM DIALOG FOR FACEBOOK ---
function showFacebookBrowserDialog() {
    // Remove existing if any
    const existing = document.getElementById('fb-modal-backdrop');
    if(existing) document.body.removeChild(existing);

    // Create Modal Backdrop
    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'fb-modal-backdrop';
    modalBackdrop.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex; align-items: center; justify-content: center;
        z-index: 10000; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    
    // Create Dialog Box
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
        
        <p style="color: #000; font-weight: 600; font-size: 15px; margin: 0 0 8px 0; line-height: 1.4;">
            Facebook တွင် တိုက်ရိုက် Download မရနိုင်ပါ
        </p>
        
        <p style="color: #65676b; font-size: 14px; margin: 0 0 24px 0; line-height: 1.4;">
            Chrome (သို့) ပြင်ပ Browser ဖြင့် ဖွင့်ရန် Continue ကို နှိပ်ပါ
        </p>
        
        <div style="display: flex; gap: 12px; width: 100%;">
            <button id="fbDialogBack" style="
                flex: 1; padding: 12px 0;
                background: #fff; border: 1px solid #e4e6eb; border-radius: 6px;
                color: #4b4f56; font-weight: 600; font-size: 15px; cursor: pointer;
            ">GO BACK</button>
            
            <button id="fbDialogContinue" style="
                flex: 1; padding: 12px 0;
                background: #1877F2; border: none; border-radius: 6px;
                color: #fff; font-weight: 600; font-size: 15px; cursor: pointer;
            ">CONTINUE</button>
        </div>
    `;
    
    modalBackdrop.appendChild(dialog);
    document.body.appendChild(modalBackdrop);
    
    // Bind Events
    document.getElementById('fbDialogBack').onclick = () => document.body.removeChild(modalBackdrop);
    document.getElementById('fbDialogContinue').onclick = () => {
        document.body.removeChild(modalBackdrop);
        openInExternalBrowser();
    };
    
    modalBackdrop.onclick = (e) => {
        if (e.target === modalBackdrop) document.body.removeChild(modalBackdrop);
    };
}

function openInExternalBrowser() {
    const currentURL = window.location.href.split('?')[0];
    const name = document.getElementById('nameInput').value;
    const acct = document.getElementById('acctInput').value;
    const bankId = currentBank.id;
    
    // Add dl=1 to trigger auto download on next load
    const fullURL = `${currentURL}?dl=1&b=${bankId}&n=${encodeURIComponent(name)}&a=${encodeURIComponent(acct)}`;
    
    // Android Intent to Force Open Chrome
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
function initBankGrid() {
    const grid = document.getElementById('bankGrid');
    grid.innerHTML = '';
    banks.forEach(bank => {
        const div = document.createElement('div');
        div.className = 'bank-item';
        if(bank.id === currentBank.id) div.classList.add('active');
        div.innerHTML = `<img src="${bank.logo}" onerror="this.src='https://via.placeholder.com/40'"><span>${bank.short}</span>`;
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
    uploadedUserImg = null;
    currentStyleIndex = 0; 
    updateUIAndRender();
    selectBank(banks[0], document.querySelector('.bank-item'));
}
