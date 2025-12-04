// --- 1. CONFIGURATION ---
// Default links included. If they fail, fallback text/shapes are used.
const banks = [
    { id: 'bbl', name: 'Bangkok Bank', short: 'BBL', color: '#1e4598', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/58/Bangkok_Bank_logo.svg/512px-Bangkok_Bank_logo.svg.png' },
    { id: 'kbank', name: 'Kasikorn Bank', short: 'KBANK', color: '#138f2d', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Kasikorn_Bank_Logo.svg/512px-Kasikorn_Bank_Logo.svg.png' },
    { id: 'scb', name: 'SCB Bank', short: 'SCB', color: '#4e2a84', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Siam_Commercial_Bank_%28logo%29.svg/512px-Siam_Commercial_Bank_%28logo%29.svg.png' },
    { id: 'ktb', name: 'Krungthai Bank', short: 'KTB', color: '#00a5e3', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Krung_Thai_Bank_logo.svg/512px-Krung_Thai_Bank_logo.svg.png' },
    { id: 'bay', name: 'Krungsri Bank', short: 'BAY', color: '#fec43b', txtColor: '#4e2a84', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Bank_of_Ayudhya_logo.svg/512px-Bank_of_Ayudhya_logo.svg.png' },
    { id: 'ttb', name: 'TTB Bank', short: 'TTB', color: '#0056b8', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/TMBThanachart_Bank_logo.jpg/512px-TMBThanachart_Bank_logo.jpg' },
    { id: 'uob', name: 'UOB Bank', short: 'UOB', color: '#0b2361', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/UOB_Logo.svg/512px-UOB_Logo.svg.png' },
    { id: 'gsb', name: 'GSB Bank', short: 'GSB', color: '#eb008b', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Government_Savings_Bank_%28Thailand%29_logo.svg/512px-Government_Savings_Bank_%28Thailand%29_logo.svg.png' },
    { id: 'cimbt', name: 'CIMB Thai', short: 'CIMBT', color: '#7e1a2d', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/CIMB_Group_Logo.svg/512px-CIMB_Group_Logo.svg.png' }
];

// State
let currentBank = banks[0];
let uploadedLogo = null;
let logoImgObj = new Image();
logoImgObj.crossOrigin = "Anonymous"; // Important for canvas

const canvas = document.getElementById('cardCanvas');
const ctx = canvas.getContext('2d');
const imgOutput = document.getElementById('resultImage');

// --- 2. INITIALIZATION ---
window.onload = function() {
    initBankGrid();
    loadBankLogo(currentBank); // Load default bank logo
};

function initBankGrid() {
    const grid = document.getElementById('bankGrid');
    grid.innerHTML = '';
    
    banks.forEach(bank => {
        const div = document.createElement('div');
        div.className = 'bank-item';
        if(bank.id === currentBank.id) div.classList.add('active');
        
        // We use a simple colored box if logo fails in grid, but try to load img
        div.innerHTML = `
            <div style="width:20px; height:20px; background:${bank.color}; border-radius:50%; margin-bottom:5px;"></div>
            <span>${bank.short}</span>
        `;
        
        div.onclick = () => selectBank(bank, div);
        grid.appendChild(div);
    });
}

function selectBank(bank, div) {
    currentBank = bank;
    
    // Update UI
    document.querySelectorAll('.bank-item').forEach(el => el.classList.remove('active'));
    div.classList.add('active');
    
    // Clear custom logo if user switches bank (optional preference)
    // uploadedLogo = null; 
    // document.getElementById('logoUpload').value = ""; 

    loadBankLogo(bank);
}

function loadBankLogo(bank) {
    logoImgObj.src = bank.logo;
    logoImgObj.onload = () => render();
    logoImgObj.onerror = () => render(); // Render anyway even if logo fails
}

function handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = () => {
                uploadedLogo = img;
                render();
            };
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

// --- 3. RENDER ENGINE ---
function render() {
    const style = document.getElementById('styleSelect').value;
    const name = document.getElementById('nameInput').value.toUpperCase();
    const acct = document.getElementById('acctInput').value;
    
    // Setup Canvas
    canvas.width = 1000;
    canvas.height = 600;
    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Route to Design Function
    if (style === 'layout_bbl') {
        drawBBLStyle(w, h, name, acct);
    } else if (style === 'layout_modern') {
        drawModern(w, h, name, acct);
    } else if (style === 'layout_social') {
        drawSocial(w, h, name, acct);
    } else if (style === 'layout_receipt') {
        drawReceipt(w, h, name, acct);
    } else {
        drawMinimal(w, h, name, acct);
    }

    // Output
    imgOutput.src = canvas.toDataURL("image/png");
}

// --- 4. DESIGN FUNCTIONS ---

// DESIGN 1: BBL ORIGINAL STYLE (Dynamic Colors)
function drawBBLStyle(w, h, name, acct) {
    const mainColor = currentBank.color;
    
    // 1. Header Area
    ctx.fillStyle = mainColor;
    ctx.font = "bold 130px Roboto, Arial";
    ctx.textAlign = "left";
    ctx.fillText(currentBank.short, 50, 130);

    // Separator
    ctx.fillStyle = "#ccc";
    ctx.fillRect(320, 40, 4, 120);

    // Bank Name Text
    ctx.fillStyle = mainColor;
    ctx.font = "bold 50px Roboto, Arial"; 
    ctx.fillText(currentBank.name, 350, 90);
    
    ctx.fillStyle = "#666";
    ctx.font = "bold 30px Roboto, Arial";
    ctx.fillText("BANKING SERVICE", 350, 140);

    // Color Line
    ctx.fillStyle = "#f97316"; // Orange accent
    ctx.fillRect(350, 105, 300, 5);

    // Draw Logo (Top Right)
    drawLogoHelper(w - 220, 30, 170);

    // 2. Account Number Box
    // Box Background
    ctx.fillStyle = mainColor;
    ctx.fillRect(50, 240, 320, 70);
    
    // "BANK NUMBER" Label
    ctx.fillStyle = (currentBank.id === 'bay') ? currentBank.txtColor : "#fff";
    ctx.font = "bold 32px Roboto, Arial";
    ctx.textAlign = "center";
    ctx.fillText("BANK NUMBER", 210, 285);

    // The Number Value
    ctx.fillStyle = "#333";
    ctx.font = "bold 80px Roboto, Arial";
    ctx.textAlign = "left";
    ctx.fillText(acct, 400, 300);

    // 3. Name Box
    // Full Width Box
    ctx.fillStyle = mainColor;
    ctx.fillRect(50, 380, w - 100, 120);

    // Name Value
    ctx.fillStyle = (currentBank.id === 'bay') ? currentBank.txtColor : "#fff";
    ctx.font = "bold 55px Padauk, Roboto";
    ctx.textAlign = "left";
    ctx.fillText(name, 90, 460);
}

// DESIGN 2: MODERN
function drawModern(w, h, name, acct) {
    // Gradient Background
    let grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, currentBank.color);
    grd.addColorStop(1, "#f8fafc");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // Glass Card
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.shadowColor = "rgba(0,0,0,0.1)"; ctx.shadowBlur = 20;
    ctx.fillRect(100, 100, w-200, h-200);
    ctx.shadowBlur = 0;

    // Logo Center
    drawLogoHelper(w/2 - 60, 50, 120);

    ctx.textAlign = "center";
    ctx.fillStyle = currentBank.color;
    ctx.font = "bold 40px Roboto";
    ctx.fillText(currentBank.name, w/2, 230);

    ctx.fillStyle = "#333";
    ctx.font = "bold 65px Roboto";
    ctx.fillText(acct, w/2, 320);

    ctx.fillStyle = "#555";
    ctx.font = "bold 45px Padauk";
    ctx.fillText(name, w/2, 400);
}

// DESIGN 3: SOCIAL POST (Square-ish vibe)
function drawSocial(w, h, name, acct) {
    // Split BG
    ctx.fillStyle = currentBank.color;
    ctx.fillRect(0, 0, w, 200);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 200, w, h-200);

    // Floating Card
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#ccc"; ctx.shadowBlur = 15;
    ctx.fillRect(150, 100, 700, 400);
    ctx.shadowBlur = 0;

    // Logo
    drawLogoHelper(w/2 - 50, 50, 100);

    ctx.textAlign = "center";
    ctx.fillStyle = "#333";
    ctx.font = "bold 60px Roboto";
    ctx.fillText(acct, w/2, 280);

    ctx.fillStyle = currentBank.color;
    ctx.font = "bold 50px Padauk";
    ctx.fillText(name, w/2, 380);

    // Footer decoration
    ctx.fillStyle = "#eee";
    ctx.fillRect(150, 420, 700, 80);
    ctx.fillStyle = "#888";
    ctx.font = "20px Roboto";
    ctx.fillText(currentBank.name + " - Verified Slip", w/2, 465);
}

// DESIGN 4: RECEIPT
function drawReceipt(w, h, name, acct) {
    ctx.fillStyle = "#eee";
    ctx.fillRect(0,0,w,h);
    
    // Receipt Paper
    ctx.fillStyle = "#fff";
    ctx.shadowColor="#aaa"; ctx.shadowBlur=5;
    ctx.fillRect(250, 20, 500, 560);
    ctx.shadowBlur=0;

    drawLogoHelper(w/2 - 40, 50, 80);

    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.font = "bold 30px Roboto";
    ctx.fillText("TRANSACTION SLIP", w/2, 160);
    
    // Dotted Line
    ctx.strokeStyle = "#ccc"; ctx.setLineDash([10, 10]);
    ctx.beginPath(); ctx.moveTo(280, 190); ctx.lineTo(720, 190); ctx.stroke();
    ctx.setLineDash([]);

    // Data
    ctx.textAlign = "left";
    ctx.font = "24px Roboto"; ctx.fillStyle = "#666";
    ctx.fillText("Account No:", 300, 250);
    ctx.textAlign = "right";
    ctx.font = "bold 35px Roboto"; ctx.fillStyle = "#000";
    ctx.fillText(acct, 700, 250);

    ctx.textAlign = "left";
    ctx.font = "24px Padauk"; ctx.fillStyle = "#666";
    ctx.fillText("Name:", 300, 320);
    ctx.textAlign = "right";
    ctx.font = "bold 30px Padauk"; ctx.fillStyle = "#000";
    ctx.fillText(name, 700, 320);
    
    // Success Badge
    ctx.fillStyle = "#dcfce7";
    ctx.fillRect(300, 400, 400, 60);
    ctx.fillStyle = "#16a34a";
    ctx.textAlign = "center";
    ctx.font = "bold 24px Roboto";
    ctx.fillText("SUCCESSFUL TRANSFER", w/2, 440);
}

// DESIGN 5: MINIMAL
function drawMinimal(w, h, name, acct) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = currentBank.color; ctx.lineWidth = 20;
    ctx.strokeRect(0,0,w,h);
    
    drawLogoHelper(60, 60, 120);
    
    ctx.textAlign = "left";
    ctx.fillStyle = currentBank.color;
    ctx.font = "bold 80px Roboto";
    ctx.fillText(currentBank.short, 200, 150);

    ctx.fillStyle = "#333";
    ctx.font = "bold 70px Roboto";
    ctx.fillText(acct, 100, 350);

    ctx.fillStyle = "#666";
    ctx.font = "bold 50px Padauk";
    ctx.fillText(name, 100, 450);
}

// --- HELPER: Draw Logo (Uploaded -> Network -> Fallback) ---
function drawLogoHelper(x, y, size) {
    // 1. Priority: Uploaded Custom Logo
    if (uploadedLogo) {
        ctx.drawImage(uploadedLogo, x, y, size, size);
        return;
    }

    // 2. Priority: Network Image (if loaded)
    if (logoImgObj.complete && logoImgObj.naturalHeight !== 0) {
        ctx.drawImage(logoImgObj, x, y, size, size);
        return;
    }

    // 3. Priority: Fallback Text/Shape
    ctx.fillStyle = currentBank.color;
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${size/3}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(currentBank.short, x + size/2, y + size/2);
}
