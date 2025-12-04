// --- CONFIGURATION ---
const banks = [
    { id: 'bbl', name: 'Bangkok Bank', short: 'BBL', thName: 'ธนาคารกรุงเทพ', color: '#1e4598', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/58/Bangkok_Bank_logo.svg/512px-Bangkok_Bank_logo.svg.png' },
    { id: 'kbank', name: 'Kasikorn Bank', short: 'KBANK', thName: 'ธนาคารกสิกรไทย', color: '#138f2d', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Kasikorn_Bank_Logo.svg/512px-Kasikorn_Bank_Logo.svg.png' },
    { id: 'scb', name: 'SCB Bank', short: 'SCB', thName: 'ธนาคารไทยพาณิชย์', color: '#4e2a84', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Siam_Commercial_Bank_%28logo%29.svg/512px-Siam_Commercial_Bank_%28logo%29.svg.png' },
    { id: 'ktb', name: 'Krungthai Bank', short: 'KTB', thName: 'ธนาคารกรุงไทย', color: '#00a5e3', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Krung_Thai_Bank_logo.svg/512px-Krung_Thai_Bank_logo.svg.png' },
    { id: 'bay', name: 'Krungsri Bank', short: 'BAY', thName: 'ธนาคารกรุงศรี', color: '#fec43b', txtColor: '#4e2a84', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Bank_of_Ayudhya_logo.svg/512px-Bank_of_Ayudhya_logo.svg.png' },
    { id: 'ttb', name: 'TTB Bank', short: 'TTB', thName: 'ทีเอ็มบีธนชาต', color: '#0056b8', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/TMBThanachart_Bank_logo.jpg/512px-TMBThanachart_Bank_logo.jpg' },
    { id: 'uob', name: 'UOB Bank', short: 'UOB', thName: 'ยูโอบี', color: '#0b2361', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/UOB_Logo.svg/512px-UOB_Logo.svg.png' },
    { id: 'gsb', name: 'GSB Bank', short: 'GSB', thName: 'ธนาคารออมสิน', color: '#eb008b', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Government_Savings_Bank_%28Thailand%29_logo.svg/512px-Government_Savings_Bank_%28Thailand%29_logo.svg.png' },
    { id: 'cimbt', name: 'CIMB Thai', short: 'CIMBT', thName: 'ซีไอเอ็มบี', color: '#7e1a2d', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/CIMB_Group_Logo.svg/512px-CIMB_Group_Logo.svg.png' }
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
        
        // Show actual Logo image in selector
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
    logoImgObj.src = bank.logo;
    logoImgObj.onload = () => render();
    logoImgObj.onerror = () => render(); 
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
    // Get values OR Placeholders
    const nameInput = document.getElementById('nameInput');
    const acctInput = document.getElementById('acctInput');
    
    const name = (nameInput.value || nameInput.placeholder).toUpperCase();
    const acct = acctInput.value || acctInput.placeholder;
    const style = document.getElementById('styleSelect').value;
    
    canvas.width = 1000;
    canvas.height = 600;
    const w = canvas.width;
    const h = canvas.height;

    // Background Clear
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

// 1. BBL ORIGINAL STYLE (Pixel Perfect to Reference)
function drawBBLStyle(w, h, name, acct) {
    const mainColor = currentBank.color;
    
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,w,h);

    // --- Header ---
    // "BBL" Text
    ctx.fillStyle = mainColor;
    ctx.font = "bold 130px Roboto, Arial";
    ctx.textAlign = "left";
    ctx.fillText(currentBank.short, 50, 150);

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

    // --- Right Logo Box (The "Default" look) ---
    // We draw a square box with the lotus logo manually to match the reference exactly
    // Position: Right side
    const boxSize = 160;
    const boxX = w - 210;
    const boxY = 40;
    
    // 1. Blue Rounded Rect
    ctx.fillStyle = mainColor; // Force Blue for BBL feel or use currentBank color
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxSize, boxSize, 20);
    ctx.fill();
    
    // 2. White Border inside
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Draw Logo Inside
    if(uploadedLogo) {
        ctx.save();
        ctx.clip(); // Clip to the rounded rect
        ctx.drawImage(uploadedLogo, boxX, boxY, boxSize, boxSize);
        ctx.restore();
    } else {
        // Draw the Lotus/Diamond shape manually (vector style)
        drawManualLotus(boxX + boxSize/2, boxY + boxSize/2, boxSize * 0.6);
    }

    // --- Bank Number Row ---
    // Blue Box Label
    ctx.fillStyle = mainColor;
    ctx.fillRect(50, 250, 320, 80);
    
    ctx.fillStyle = (currentBank.id === 'bay') ? currentBank.txtColor : "#fff";
    ctx.font = "bold 32px Roboto";
    ctx.textAlign = "center";
    ctx.fillText("BANK NUMBER", 210, 300);

    // Account Number Value
    ctx.fillStyle = "#444";
    ctx.font = "bold 80px Roboto";
    ctx.textAlign = "left";
    ctx.fillText(acct, 400, 315);

    // --- Name Row ---
    // Full Blue Box
    ctx.fillStyle = mainColor;
    ctx.fillRect(50, 400, w - 100, 130);

    // Name Text
    ctx.fillStyle = (currentBank.id === 'bay') ? currentBank.txtColor : "#fff";
    ctx.font = "bold 55px Roboto, Padauk";
    ctx.textAlign = "left";
    ctx.fillText(name, 90, 485);
}

// 2. GRADIENT DESIGN (New)
function drawGradient(w, h, name, acct) {
    // Angled Gradient
    let grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, currentBank.color);
    grd.addColorStop(1, adjustColor(currentBank.color, 40)); // lighter
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // White Glassy Card
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 30;
    ctx.beginPath(); ctx.roundRect(100, 100, w-200, h-200, 30); ctx.fill();
    ctx.shadowBlur = 0;

    drawLogoHelper(w/2 - 50, 50, 100);

    ctx.textAlign = "center";
    ctx.fillStyle = currentBank.color;
    ctx.font = "bold 60px Roboto";
    ctx.fillText(acct, w/2, 300);

    ctx.fillStyle = "#555";
    ctx.font = "bold 40px Padauk";
    ctx.fillText(name, w/2, 380);

    // Footer
    ctx.fillStyle = "#888";
    ctx.font = "16px Roboto";
    ctx.fillText("Generated by Thai Bank Card Maker", w/2, 450);
}

// 3. GOOGLE MATERIAL DESIGN (New)
function drawMaterial(w, h, name, acct) {
    ctx.fillStyle = "#f5f5f5"; // Light Grey BG
    ctx.fillRect(0,0,w,h);

    // Card Surface
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.15)"; 
    ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    ctx.beginPath(); ctx.roundRect(80, 80, w-160, h-160, 16); ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    // Top Color Bar
    ctx.fillStyle = currentBank.color;
    ctx.beginPath(); ctx.roundRect(80, 80, w-160, 20, [16,16,0,0]); ctx.fill();

    // Logo & Bank Name
    drawLogoHelper(120, 140, 80);
    
    ctx.textAlign = "left";
    ctx.fillStyle = "#202124"; // Google Dark Grey
    ctx.font = "bold 40px Roboto";
    ctx.fillText(currentBank.name, 220, 180);
    
    ctx.fillStyle = "#5f6368"; // Google Med Grey
    ctx.font = "24px Roboto";
    ctx.fillText("Savings Account", 220, 215);

    // Account Number
    ctx.fillStyle = currentBank.color;
    ctx.font = "bold 70px Roboto";
    ctx.fillText(acct, 120, 320);

    // Name
    ctx.fillStyle = "#202124";
    ctx.font = "35px Padauk";
    ctx.fillText(name, 120, 400);

    // FAB (Floating Action Button style decoration)
    ctx.fillStyle = currentBank.color;
    ctx.beginPath(); ctx.arc(w-160, h-160, 30, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 24px Arial"; ctx.textAlign="center"; 
    ctx.fillText("฿", w-160, h-152);
}

// 4. MODERN CLEAN
function drawModern(w, h, name, acct) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h);
    
    // Left Sidebar
    ctx.fillStyle = currentBank.color;
    ctx.fillRect(0,0, 30, h);

    drawLogoHelper(80, 50, 100);
    
    ctx.fillStyle = "#000";
    ctx.textAlign = "left";
    ctx.font = "bold 40px Roboto";
    ctx.fillText(currentBank.name, 200, 115);

    ctx.fillStyle = "#555";
    ctx.font = "24px Roboto";
    ctx.fillText("Account No.", 80, 250);
    
    ctx.fillStyle = currentBank.color;
    ctx.font = "bold 80px Roboto";
    ctx.fillText(acct, 80, 320);

    ctx.fillStyle = "#555";
    ctx.font = "24px Padauk";
    ctx.fillText("Account Name", 80, 420);

    ctx.fillStyle = "#000";
    ctx.font = "bold 50px Padauk";
    ctx.fillText(name, 80, 470);
}

// 5. MINIMAL
function drawMinimal(w, h, name, acct) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = currentBank.color; ctx.lineWidth = 10;
    ctx.strokeRect(20,20,w-40,h-40);

    drawLogoHelper(w/2 - 60, 60, 120);
    
    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.font = "bold 70px Roboto";
    ctx.fillText(acct, w/2, 300);

    ctx.fillStyle = currentBank.color;
    ctx.font = "bold 50px Padauk";
    ctx.fillText(name, w/2, 400);
}

// --- HELPERS ---

// Helper to draw the BBL Lotus shape manually (Vector style)
function drawManualLotus(cx, cy, size) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    // Simplified Lotus/Diamond shape
    ctx.moveTo(cx, cy - size/2); // Top
    ctx.quadraticCurveTo(cx + size/2, cy, cx, cy + size/2); // Right to Bottom
    ctx.quadraticCurveTo(cx - size/2, cy, cx, cy - size/2); // Left to Top
    ctx.fill();
    
    // Inner cut
    ctx.strokeStyle = currentBank.color; 
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - size/4);
    ctx.lineTo(cx, cy + size/4);
    ctx.stroke();
}

function drawLogoHelper(x, y, size) {
    if (uploadedLogo) {
        ctx.drawImage(uploadedLogo, x, y, size, size);
    } else if (logoImgObj.complete && logoImgObj.naturalHeight !== 0) {
        ctx.drawImage(logoImgObj, x, y, size, size);
    } else {
        // Fallback Circle
        ctx.fillStyle = currentBank.color;
        ctx.beginPath(); ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = `bold ${size/3}px Arial`; ctx.textAlign = "center";
        ctx.fillText(currentBank.short, x + size/2, y + size/2 + size/10);
    }
}

// Helper to lighten color slightly for gradients
function adjustColor(color, amount) {
    return color; // Simplification
}

// Polyfill for roundRect
if (!ctx.roundRect) {
    ctx.roundRect = function(x, y, w, h, r) { ctx.rect(x,y,w,h); return this; }
}
