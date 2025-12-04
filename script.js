// Bank Data with Logo URLs (Using Wikimedia/Online Sources for stability)
// You can replace these URLs with local paths (e.g., 'images/bbl.png') if you host images.
const banks = [
    { id: 'bbl', name: 'Bangkok Bank', color: '#1e4598', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/58/Bangkok_Bank_logo.svg/1200px-Bangkok_Bank_logo.svg.png' },
    { id: 'kbank', name: 'KBank (Kasikorn)', color: '#138f2d', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Kasikorn_Bank_Logo.svg/1200px-Kasikorn_Bank_Logo.svg.png' },
    { id: 'scb', name: 'SCB (Siam Comm)', color: '#4e2a84', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Siam_Commercial_Bank_%28logo%29.svg/1200px-Siam_Commercial_Bank_%28logo%29.svg.png' },
    { id: 'ktb', name: 'Krungthai Bank', color: '#00a5e3', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Krung_Thai_Bank_logo.svg/1200px-Krung_Thai_Bank_logo.svg.png' },
    { id: 'bay', name: 'Krungsri (BAY)', color: '#fec43b', text_color:'#4e2a84', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Bank_of_Ayudhya_logo.svg/1200px-Bank_of_Ayudhya_logo.svg.png' },
    { id: 'ttb', name: 'TTB Bank', color: '#0056b8', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/TMBThanachart_Bank_logo.jpg/640px-TMBThanachart_Bank_logo.jpg' },
    { id: 'cimbt', name: 'CIMB Thai', color: '#7e1a2d', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/CIMB_Group_Logo.svg/1200px-CIMB_Group_Logo.svg.png' },
    { id: 'uob', name: 'UOB Thailand', color: '#0b2361', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/UOB_Logo.svg/2560px-UOB_Logo.svg.png' },
    { id: 'gsb', name: 'GSB (Gov Savings)', color: '#eb008b', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Government_Savings_Bank_%28Thailand%29_logo.svg/1200px-Government_Savings_Bank_%28Thailand%29_logo.svg.png' }
];

let selectedBank = banks[0];
let logoImageObj = new Image();
logoImageObj.crossOrigin = "Anonymous"; // Crucial for using online images on canvas

const canvas = document.getElementById('cardCanvas');
const ctx = canvas.getContext('2d');

// 1. Initialize Bank Grid
function initBankGrid() {
    const grid = document.getElementById('bankGrid');
    grid.innerHTML = '';
    banks.forEach(bank => {
        const div = document.createElement('div');
        div.className = 'bank-item';
        if(bank.id === selectedBank.id) div.classList.add('active');
        
        div.innerHTML = `
            <img src="${bank.logo}" alt="${bank.name}">
            <span>${bank.id.toUpperCase()}</span>
        `;
        div.onclick = () => selectBank(bank, div);
        grid.appendChild(div);
    });
    // Load default logo
    logoImageObj.src = selectedBank.logo;
}

// 2. Select Bank Logic
function selectBank(bank, divElement) {
    selectedBank = bank;
    
    // UI Update
    document.querySelectorAll('.bank-item').forEach(el => el.classList.remove('active'));
    divElement.classList.add('active');

    // Load Logo & Redraw
    logoImageObj.src = bank.logo;
    // We wait for image to load inside the draw function, but triggering here helps
    logoImageObj.onload = () => { triggerUpdate(); };
}

// 3. Reset Function
function resetForm() {
    document.getElementById('nameInput').value = '';
    document.getElementById('acctInput').value = '';
    document.getElementById('themeSelect').value = 'modern_card';
    document.getElementById('resultImage').style.display = 'none';
    document.getElementById('placeholderText').style.display = 'block';
    document.getElementById('downloadSection').style.display = 'none';
    
    // Reset to first bank
    const firstBankDiv = document.querySelector('.bank-item');
    if(firstBankDiv) firstBankDiv.click();
}

// 4. Trigger Update (Debounce could be added here if needed)
function triggerUpdate() {
    // If we are in "Generated" mode, update the preview image in real-time
    if(document.getElementById('resultImage').style.display === 'block'){
        generateImage();
    }
}

// 5. Draw Card Logic (The Brain)
function drawCard() {
    return new Promise((resolve) => {
        const name = document.getElementById('nameInput').value.toUpperCase() || "YOUR NAME";
        const account = document.getElementById('acctInput').value || "000-000-0000";
        const theme = document.getElementById('themeSelect').value;

        // Set Dimensions based on Theme
        if(theme === 'social_post') {
            canvas.width = 1080; canvas.height = 1080; // Square
        } else if (theme === 'business_cover') {
            canvas.width = 1200; canvas.height = 630; // Wide
        } else {
            canvas.width = 800; canvas.height = 500; // Standard Card
        }

        const w = canvas.width;
        const h = canvas.height;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // --- BACKGROUND DESIGNS ---
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0,0,w,h);

        if (theme === 'modern_card') {
            // Gradient Background
            let grd = ctx.createLinearGradient(0, 0, w, h);
            grd.addColorStop(0, selectedBank.color);
            grd.addColorStop(1, adjustColor(selectedBank.color, 40)); // Lighter version
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, w, h);
            
            // Decorative Circles
            ctx.globalAlpha = 0.1;
            ctx.beginPath(); ctx.arc(w, 0, 300, 0, 2*Math.PI); ctx.fill();
            ctx.beginPath(); ctx.arc(0, h, 200, 0, 2*Math.PI); ctx.fill();
            ctx.globalAlpha = 1.0;

            // White Card Container inside
            ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            ctx.shadowColor = "rgba(0,0,0,0.3)";
            ctx.shadowBlur = 20;
            ctx.roundRect(50, 50, w-100, h-100, 20);
            ctx.fill();
            ctx.shadowBlur = 0;

        } else if (theme === 'social_post') {
            // Solid Color Top Half
            ctx.fillStyle = selectedBank.color;
            ctx.fillRect(0, 0, w, h/2);
            
            // White Bottom Half
            ctx.fillStyle = "#f8f9fa";
            ctx.fillRect(0, h/2, w, h/2);

            // Center White Box
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "rgba(0,0,0,0.2)";
            ctx.shadowBlur = 30;
            ctx.roundRect(100, 200, w-200, h-400, 30);
            ctx.fill();
            ctx.shadowBlur = 0;

        } else if (theme === 'minimalist') {
             // Just a clean border and simple text
             ctx.strokeStyle = selectedBank.color;
             ctx.lineWidth = 20;
             ctx.strokeRect(0, 0, w, h);
        } else {
            // Business Cover
            ctx.fillStyle = selectedBank.color;
            ctx.fillRect(0, 0, 150, h); // Side bar
            
            // Top Bar
            ctx.fillStyle = selectedBank.color;
            ctx.globalAlpha = 0.1;
            ctx.fillRect(150, 0, w-150, 100);
            ctx.globalAlpha = 1.0;
        }

        // --- CONTENT DRAWING ---
        
        // Helper to center text
        const centerX = w / 2;
        
        // 1. Draw Logo
        const logoSize = (theme === 'social_post') ? 150 : 100;
        let logoX, logoY;

        if(theme === 'modern_card') { logoX = 90; logoY = 90; }
        else if(theme === 'social_post') { logoX = centerX - (logoSize/2); logoY = 250; }
        else if(theme === 'minimalist') { logoX = 60; logoY = 60; }
        else { logoX = 180; logoY = 50; }

        // Draw Image (Check if loaded)
        if(logoImageObj.complete && logoImageObj.naturalHeight !== 0) {
            ctx.drawImage(logoImageObj, logoX, logoY, logoSize, logoSize);
        }

        // 2. Draw Text
        ctx.textAlign = (theme === 'social_post') ? "center" : "left";
        const textColor = (theme === 'minimalist') ? "#333" : (selectedBank.text_color || selectedBank.color); // Use dark text for clean look
        
        // Bank Name
        ctx.fillStyle = textColor;
        ctx.font = "bold 40px Arial";
        let bankNameX = (theme === 'social_post') ? centerX : logoX + logoSize + 20;
        let bankNameY = (theme === 'social_post') ? logoY + logoSize + 50 : logoY + (logoSize/2) + 15;
        ctx.fillText(selectedBank.name, bankNameX, bankNameY);

        // Account Details Position
        let infoY = (theme === 'social_post') ? bankNameY + 100 : bankNameY + 100;
        let infoX = (theme === 'social_post') ? centerX : (theme === 'modern_card' ? 90 : 60);
        if(theme === 'business_cover') infoX = 180;

        // Label: Name
        ctx.fillStyle = "#888";
        ctx.font = "bold 24px Padauk";
        ctx.fillText("အကောင့်အမည် (Name)", infoX, infoY);

        // Value: Name
        ctx.fillStyle = "#000";
        ctx.font = "bold 45px Padauk";
        ctx.fillText(name, infoX, infoY + 50);

        // Label: Account
        ctx.fillStyle = "#888";
        ctx.font = "bold 24px Arial";
        ctx.fillText("အကောင့်နံပါတ် (Account No)", infoX, infoY + 110);

        // Value: Account
        ctx.fillStyle = selectedBank.color;
        ctx.font = "bold 60px Arial";
        ctx.fillText(account, infoX, infoY + 170);

        resolve();
    });
}

// Helper to lighten colors
function adjustColor(color, amount) {
    return color; // Simplified for this demo, usually requires HEX to RGB conversion
}

// 6. Generate Function
async function generateImage() {
    await drawCard(); // Wait for draw
    const dataURL = canvas.toDataURL("image/png");
    
    const imgObj = document.getElementById('resultImage');
    imgObj.src = dataURL;
    imgObj.style.display = 'block';
    
    document.getElementById('placeholderText').style.display = 'none';
    document.getElementById('downloadSection').style.display = 'block';
}

// Extend Canvas RoundRect support for older browsers just in case
if (CanvasRenderingContext2D.prototype.roundRect === undefined) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

// Init
window.onload = initBankGrid;
