// Bank Data
const banks = [
    { id: 'bbl', name: 'BBL', color: '#1e4598' },
    { id: 'kbank', name: 'KBANK', color: '#138f2d' },
    { id: 'scb', name: 'SCB', color: '#4e2a84' },
    { id: 'ktb', name: 'KTB', color: '#00a5e3' },
    { id: 'bay', name: 'BAY', color: '#fec43b' },
    { id: 'ttb', name: 'TTB', color: '#0056b8' },
    { id: 'uob', name: 'UOB', color: '#0b2361' },
    { id: 'gsb', name: 'GSB', color: '#eb008b' },
    { id: 'other', name: 'Other', color: '#333333' }
];

// State Management
let state = {
    bank: banks[0],
    styleIndex: 0,
    customLogo: null, // holds DataURL of uploaded image
    logoSize: 100,
    textSize: 30,
    userColor: null // Overrides bank color if set
};

const canvas = document.getElementById('cardCanvas');
const ctx = canvas.getContext('2d');
const imgResult = document.getElementById('resultImage');

// --- INITIALIZATION ---
function init() {
    renderBankList();
    render();
}

function renderBankList() {
    const container = document.querySelector('.bank-scroll');
    container.innerHTML = '';
    
    banks.forEach(bank => {
        const div = document.createElement('div');
        div.className = `bank-badge ${state.bank.id === bank.id ? 'active' : ''}`;
        div.innerHTML = `<span>${bank.name}</span>`;
        // Create a simple colored circle as icon
        div.style.borderTop = `3px solid ${bank.color}`;
        
        div.onclick = () => {
            state.bank = bank;
            state.userColor = null; // Reset custom color on bank switch
            document.getElementById('colorPicker').value = bank.color;
            // Update UI Active State
            document.querySelectorAll('.bank-badge').forEach(b => b.classList.remove('active'));
            div.classList.add('active');
            render();
        };
        container.appendChild(div);
    });
}

// --- CONTROLS ---

function setStyle(index) {
    state.styleIndex = index;
    document.querySelectorAll('.style-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
    render();
}

function updateColor(color) {
    state.userColor = color;
    render();
}

function handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = () => {
                state.customLogo = img;
                render();
            };
            img.src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function resetAll() {
    document.getElementById('nameInput').value = '';
    document.getElementById('acctInput').value = '';
    state.customLogo = null;
    state.styleIndex = 0;
    state.userColor = null;
    state.logoSize = 100;
    state.textSize = 30;
    document.getElementById('logoSize').value = 100;
    document.getElementById('textSize').value = 30;
    document.getElementById('logoUpload').value = ''; // clear file
    
    // Reset Bank UI
    const firstBank = document.querySelector('.bank-badge');
    if(firstBank) firstBank.click();
    
    // Reset Style UI
    setStyle(0);
}

// --- RENDER ENGINE ---

function render() {
    // 1. Setup Variables
    const name = document.getElementById('nameInput').value || "ACCOUNT NAME";
    const acct = document.getElementById('acctInput').value || "000-000-0000";
    const primaryColor = state.userColor || state.bank.color;
    const logoScale = parseInt(document.getElementById('logoSize').value) / 100; // 0.5 to 2.5
    const textScale = parseInt(document.getElementById('textSize').value) / 30; 

    // Canvas Size
    canvas.width = 1000;
    canvas.height = 600;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Reset
    ctx.clearRect(0, 0, w, h);

    // 2. DRAW BACKGROUND based on Style
    switch(state.styleIndex) {
        case 0: // Clean
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0,0,w,h);
            ctx.fillStyle = primaryColor;
            ctx.fillRect(0,0,20,h); // Side bar
            break;
            
        case 1: // Dark
            ctx.fillStyle = "#1e1e1e";
            ctx.fillRect(0,0,w,h);
            // Gold accent
            ctx.strokeStyle = "#D4AF37";
            ctx.lineWidth = 2;
            ctx.strokeRect(30,30,w-60,h-60);
            break;

        case 2: // Gradient
            let grd = ctx.createLinearGradient(0,0,w,h);
            grd.addColorStop(0, primaryColor);
            grd.addColorStop(1, "#ffffff");
            ctx.fillStyle = grd;
            ctx.fillRect(0,0,w,h);
            break;

        case 3: // Glass
            // Image bg placeholder or color
            ctx.fillStyle = primaryColor;
            ctx.fillRect(0,0,w,h);
            ctx.fillStyle = "rgba(255,255,255,0.2)";
            ctx.beginPath(); ctx.arc(0,0,400,0,Math.PI*2); ctx.fill();
            // Glass Box
            ctx.fillStyle = "rgba(255,255,255,0.8)";
            ctx.shadowBlur = 20; ctx.shadowColor = "rgba(0,0,0,0.2)";
            ctx.roundRect(100, 100, w-200, h-200, 20);
            ctx.fill();
            ctx.shadowBlur = 0;
            break;

        case 4: // Social (Square-ish focus)
            ctx.fillStyle = "#f3f4f6";
            ctx.fillRect(0,0,w,h);
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#ddd"; ctx.shadowBlur = 10;
            ctx.roundRect(cx-300, 50, 600, h-100, 30);
            ctx.fill(); ctx.shadowBlur = 0;
            // Top Header
            ctx.fillStyle = primaryColor;
            ctx.beginPath();
            ctx.roundRect(cx-300, 50, 600, 150, [30,30,0,0]);
            ctx.fill();
            break;

        case 5: // Stripe
            ctx.fillStyle = "#fff";
            ctx.fillRect(0,0,w,h);
            ctx.fillStyle = primaryColor;
            ctx.transform(1, 0, -0.3, 1, 0, 0); // Skew
            ctx.fillRect(200, 0, 300, h);
            ctx.resetTransform();
            break;

        case 6: // Border
            ctx.fillStyle = "#fff";
            ctx.fillRect(0,0,w,h);
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 20;
            ctx.strokeRect(0,0,w,h);
            break;

        case 7: // Bold
            ctx.fillStyle = primaryColor;
            ctx.fillRect(0,0,w,h);
            ctx.fillStyle = "#fff";
            ctx.fillRect(50, 180, w-100, h-230);
            break;

        case 8: // Receipt
            ctx.fillStyle = "#eee";
            ctx.fillRect(0,0,w,h);
            ctx.fillStyle = "#fff";
            ctx.shadowColor="#ccc"; ctx.shadowBlur=5;
            // Zigzag bottom logic omitted for brevity, using simple rect
            ctx.fillRect(200, 50, 600, h-100);
            ctx.shadowBlur=0;
            ctx.strokeStyle = "#ddd";
            ctx.beginPath(); ctx.moveTo(250, 200); ctx.lineTo(750, 200); ctx.stroke();
            break;

        case 9: // Circle
            ctx.fillStyle = "#fff";
            ctx.fillRect(0,0,w,h);
            ctx.fillStyle = primaryColor;
            ctx.beginPath(); ctx.arc(w, 0, 400, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(0, h, 200, 0, Math.PI*2); ctx.fill();
            break;
    }

    // 3. TEXT & LOGO PLACEMENT CONFIG
    // We define text colors and positions based on style
    let txtColor = "#333";
    let labelColor = "#777";
    let align = "left";
    let baseX = 80; 
    let baseY = 250;
    
    if(state.styleIndex === 1) { txtColor = "#D4AF37"; labelColor = "#aaa"; } // Dark
    if(state.styleIndex === 4) { align = "center"; baseX = cx; baseY = 320; } // Social
    if(state.styleIndex === 7) { baseX = 80; baseY = 280; } // Bold
    if(state.styleIndex === 8) { align = "center"; baseX = cx; baseY = 300; } // Receipt

    // 4. DRAW LOGO
    const logoBaseSize = 100 * logoScale;
    let logoX = 80;
    let logoY = 50;

    if(align === "center") {
        logoX = cx - (logoBaseSize/2);
        logoY = (state.styleIndex === 4) ? 75 : 80;
    } else if (state.styleIndex === 3) {
        logoX = 140; logoY = 130; // Glass inner
    }

    if (state.customLogo) {
        // Draw Uploaded Image
        ctx.save();
        // Optional: Make it circular
        roundedImage(ctx, logoX, logoY, logoBaseSize, logoBaseSize, 10);
        ctx.drawImage(state.customLogo, logoX, logoY, logoBaseSize, logoBaseSize);
        ctx.restore();
    } else {
        // Draw Fallback Circle with Text (No more broken links!)
        ctx.fillStyle = (state.styleIndex === 4 || state.styleIndex === 7) ? "#fff" : primaryColor;
        
        // Adjust for Dark mode
        if(state.styleIndex === 1) ctx.fillStyle = "#D4AF37";

        ctx.beginPath();
        ctx.arc(logoX + logoBaseSize/2, logoY + logoBaseSize/2, logoBaseSize/2, 0, Math.PI*2);
        ctx.fill();
        
        ctx.fillStyle = (state.styleIndex === 4 || state.styleIndex === 7) ? primaryColor : "#fff";
        if(state.styleIndex === 1) ctx.fillStyle = "#000";

        ctx.font = `bold ${logoBaseSize * 0.4}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(state.bank.name, logoX + logoBaseSize/2, logoY + logoBaseSize/2);
    }

    // 5. DRAW TEXT
    ctx.textAlign = align;
    const fontBase = 30 * textScale;

    // Bank Name Label (Optional)
    if(state.styleIndex !== 4 && state.styleIndex !== 8) {
        ctx.fillStyle = txtColor;
        ctx.font = `bold ${fontBase * 1.5}px Arial`;
        // Position next to logo or below depending on layout
        if(align === 'left') ctx.fillText(state.bank.name, logoX + logoBaseSize + 20, logoY + (logoBaseSize/2) + 10);
    }

    // Account Name
    ctx.fillStyle = labelColor;
    ctx.font = `${fontBase * 0.8}px Padauk`;
    ctx.fillText("အကောင့်အမည် (Account Name)", baseX, baseY);

    ctx.fillStyle = txtColor;
    ctx.font = `bold ${fontBase * 1.2}px Padauk`;
    ctx.fillText(name, baseX, baseY + (fontBase * 1.5));

    // Account Number
    ctx.fillStyle = labelColor;
    ctx.font = `${fontBase * 0.8}px Padauk`;
    ctx.fillText("အကောင့်နံပါတ် (Account No)", baseX, baseY + (fontBase * 3.5));

    ctx.fillStyle = primaryColor;
    if(state.styleIndex === 1) ctx.fillStyle = "#fff"; // White num on dark
    if(state.styleIndex === 2) ctx.fillStyle = "#000"; // Black num on gradient
    
    ctx.font = `bold ${fontBase * 1.6}px Arial`;
    ctx.fillText(acct, baseX, baseY + (fontBase * 5));

    // 6. Output to Image
    imgResult.src = canvas.toDataURL("image/png");
}

// Helper for rounded images (optional)
function roundedImage(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.clip();
}

// Polyfill for roundRect if needed
if (!ctx.roundRect) {
    ctx.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x+r, y);
        this.arcTo(x+w, y, x+w, y+h, r);
        this.arcTo(x+w, y+h, x, y+h, r);
        this.arcTo(x, y+h, x, y, r);
        this.arcTo(x, y, x+w, y, r);
        this.closePath();
        return this;
    }
}

// Start
window.onload = init;
