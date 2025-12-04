// Global State
let uploadedLogo = null;
const canvas = document.getElementById('cardCanvas');
const ctx = canvas.getContext('2d');
const imgOutput = document.getElementById('resultImage');

// Fonts might take time to load, so we wait or render repeatedly
document.fonts.ready.then(function() {
    render();
});

// Initial Render
window.onload = function() {
    setTimeout(render, 500); // Small delay to ensure DOM is ready
};

function forceUpdate() {
    render();
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

function render() {
    const style = document.getElementById('styleSelect').value;
    const name = document.getElementById('nameInput').value.toUpperCase();
    const acct = document.getElementById('acctInput').value;
    const color = document.getElementById('themeColor').value;

    const w = canvas.width;
    const h = canvas.height;

    // Clear Canvas
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    if (style === 'bbl_original') {
        drawBBLOriginal(w, h, name, acct, color);
    } else if (style === 'modern') {
        drawModern(w, h, name, acct, color);
    } else {
        drawMinimal(w, h, name, acct, color);
    }

    // Convert to Image
    try {
        const dataUrl = canvas.toDataURL("image/png");
        imgOutput.src = dataUrl;
    } catch (e) {
        console.error("Canvas Error:", e);
        alert("Error generating image.");
    }
}

// --- DRAWING FUNCTIONS ---

function drawBBLOriginal(w, h, name, acct, baseColor) {
    // 1. Top Section
    // "BBL" Text
    ctx.fillStyle = baseColor;
    ctx.font = "bold 130px Roboto, Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("BBL", 50, 50);

    // Divider Line
    ctx.fillStyle = "#d1d5db"; // Grey
    ctx.fillRect(320, 60, 4, 110);

    // Thai Text (Simulated if font missing, but tried to use Kanit)
    ctx.fillStyle = baseColor;
    ctx.font = "bold 55px Kanit, Arial";
    ctx.fillText("ธนาคารกรุงเทพ", 350, 60);

    // English Text
    ctx.fillStyle = "#6b7280"; // Grey
    ctx.font = "bold 30px Roboto, Arial";
    ctx.fillText("BANGKOK BANK", 350, 130);

    // Orange Line
    ctx.fillStyle = "#f97316"; // Orange
    ctx.fillRect(350, 115, 300, 5);

    // Draw Logo (Top Right)
    // If no upload, we draw the BBL Icon manually
    if (uploadedLogo) {
        ctx.drawImage(uploadedLogo, w - 220, 40, 170, 170);
    } else {
        drawDefaultBBLIcon(w - 220, 40, 170, baseColor);
    }

    // 2. Account Number Box
    // Blue Label Box
    ctx.fillStyle = baseColor;
    ctx.fillRect(50, 240, 320, 70);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("BANK NUMBER", 210, 275);

    // The Number
    ctx.fillStyle = "#374151"; // Dark Grey
    ctx.font = "bold 80px Roboto, Arial"; // Big Number
    ctx.textAlign = "left";
    ctx.fillText(acct, 400, 275);

    // 3. Name Box (Full Width Blue)
    ctx.fillStyle = baseColor;
    ctx.fillRect(50, 380, w - 100, 120);

    // Name Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 55px Padauk, Roboto";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(name, 90, 440);
}

function drawModern(w, h, name, acct, color) {
    // Gradient BG
    let grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, color);
    grd.addColorStop(1, "#eff6ff");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // White Card
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 20;
    ctx.fillRect(100, 100, w-200, h-200);
    ctx.shadowBlur = 0;

    // Logo Center
    if (uploadedLogo) {
        ctx.drawImage(uploadedLogo, w/2 - 50, 40, 100, 100);
    } else {
        drawDefaultBBLIcon(w/2 - 50, 40, 100, color);
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#333";
    ctx.font = "bold 60px Roboto";
    ctx.fillText(acct, w/2, 300);

    ctx.fillStyle = color;
    ctx.font = "bold 40px Padauk";
    ctx.fillText(name, w/2, 380);
}

function drawMinimal(w, h, name, acct, color) {
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,w,h);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 20;
    ctx.strokeRect(0,0,w,h);

    if (uploadedLogo) {
        ctx.drawImage(uploadedLogo, 50, 50, 100, 100);
    } else {
        drawDefaultBBLIcon(50, 50, 100, color);
    }

    ctx.textAlign = "right";
    ctx.fillStyle = color;
    ctx.font = "bold 80px Roboto";
    ctx.fillText(acct, w-50, 150);

    ctx.textAlign = "left";
    ctx.fillStyle = "#333";
    ctx.font = "bold 60px Padauk";
    ctx.fillText(name, 50, 400);
}

// Function to draw BBL Logo manually (No image file needed!)
function drawDefaultBBLIcon(x, y, size, color) {
    ctx.save();
    // Blue Box
    ctx.fillStyle = color;
    ctx.beginPath();
    let r = size * 0.2; // radius
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + size - r, y);
    ctx.quadraticCurveTo(x + size, y, x + size, y + r);
    ctx.lineTo(x + size, y + size - r);
    ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
    ctx.lineTo(x + r, y + size);
    ctx.quadraticCurveTo(x, y + size, x, y + size - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    // White Lotus/Diamond Shape (Simplified)
    ctx.fillStyle = "white";
    ctx.beginPath();
    const cx = x + size/2;
    const cy = y + size/2;
    const s = size * 0.6; // shape scale
    
    // Draw a stylized diamond/lotus
    ctx.moveTo(cx, cy - s/2); // Top
    ctx.quadraticCurveTo(cx + s/2, cy, cx, cy + s/2); // Right curve to bottom
    ctx.quadraticCurveTo(cx - s/2, cy, cx, cy - s/2); // Left curve to top
    
    // Inner details (Line)
    ctx.moveTo(cx, cy - s/4);
    ctx.lineTo(cx, cy + s/4);
    
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = size * 0.05;
    ctx.stroke();

    ctx.restore();
}
