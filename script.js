const wheelCanvas = document.getElementById('wheelCanvas');
const spinButton = document.getElementById('spinButton');
const resultDiv = document.getElementById('result');
const prizeText = document.getElementById('prizeText');
const instructionsText = document.getElementById('instructions');
const countdownDiv = document.getElementById('countdown');
const countdownTimeSpan = document.getElementById('countdownTime');
const errorDiv = document.getElementById('error');
const errorMessageP = document.getElementById('errorMessage');
const ctx = wheelCanvas.getContext('2d');

// Dữ liệu vòng quay dựa trên bảng bạn cung cấp
// Tỷ lệ được chuyển đổi thành phần trăm
const prizes = [
    { type: 'Voucher', value: '10% giảm giá giày', weight: 10 },
    { type: 'Voucher', value: '25% giảm giá giày', weight: 25 },
    { type: 'Voucher', value: '40% giảm giá giày', weight: 40 },
    { type: 'Voucher', value: '10% giảm giá thắt lưng', weight: 15 },
    { type: 'Voucher', value: '20% giảm giá thắt lưng', weight: 12 },
    { type: 'Voucher', value: '25% giảm giá thắt lưng', weight: 10 },
    { type: 'Voucher', value: '40% giảm giá thắt lưng', weight: 6 },
    { type: 'Voucher', value: '10% giảm giá Ví', weight: 15 },
    { type: 'Voucher', value: '20% giảm giá Ví', weight: 12 },
    { type: 'Voucher', value: '25% giảm giá Ví', weight: 10 },
    { type: 'Voucher', value: '40% giảm giá Ví', weight: 6 },
    { type: 'Tặng', value: 'Ví', weight: 1, unique: true }, // unique: true cho quà tặng chỉ nhận 1 lần
    { type: 'Tặng', value: 'Thắt lưng', weight: 1, unique: true },
];

// Tính tổng trọng số để xác định tỷ lệ cho từng phần
const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);

// Colors for the wheel segments
const colors = ['#FFDDC1', '#FFABAB', '#FFC3A0', '#FFDAC1', '#FFFFB5', '#E0FFFF', '#ADD8E6', '#90EE90', '#F08080', '#DDA0DD', '#FFE4B5', '#87CEEB', '#B0C4DE'];

// Function to draw the wheel
function drawWheel() {
    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    let startAngle = 0;
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = wheelCanvas.width / 2 - 10;

    prizes.forEach((prize, index) => {
        const sliceAngle = (prize.weight / totalWeight) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.fillText(prize.value, radius - 20, 0);
        ctx.restore();

        startAngle += sliceAngle;
    });
}

// Function to get a random prize based on weights
function getRandomPrize() {
    let randomNumber = Math.random() * totalWeight;
    let accumulatedWeight = 0;
    for (const prize of prizes) {
        accumulatedWeight += prize.weight;
        if (randomNumber <= accumulatedWeight) {
            return prize;
        }
    }
    return prizes[prizes.length - 1]; // Fallback in case of rounding errors
}

// Check if user can spin (24-hour limit using Local Storage)
function canSpin() {
    const lastSpinTime = localStorage.getItem('lastSpinTime');
    if (!lastSpinTime) {
        return true;
    }
    const twentyFourHours = 24 * 60 * 60 * 1000; // milliseconds
    const timeElapsed = Date.now() - parseInt(lastSpinTime);
    return timeElapsed >= twentyFourHours;
}

// Get remaining time until next spin
function getRemainingTime() {
    const lastSpinTime = localStorage.getItem('lastSpinTime');
    if (!lastSpinTime) {
        return 0;
    }
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const timeElapsed = Date.now() - parseInt(lastSpinTime);
    const timeLeft = twentyFourHours - timeElapsed;
    return timeLeft > 0 ? timeLeft : 0;
}

// Update countdown display
function updateCountdown() {
    const remaining = getRemainingTime();
    if (remaining > 0) {
        countdownDiv.classList.remove('hidden');
        spinButton.disabled = true;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        countdownTimeSpan.textContent = `${hours}h ${minutes}m ${seconds}s`;
        setTimeout(updateCountdown, 1000);
    } else {
        countdownDiv.classList.add('hidden');
        spinButton.disabled = false;
    }
}

// --- Phần xử lý quà tặng duy nhất (sử dụng Google Apps Script làm "backend") ---
// Hướng dẫn chi tiết về cách thiết lập Google Apps Script sẽ ở bước 3.
// Phần này chỉ là placeholder cho logic giao tiếp.

// Hàm để kiểm tra xem quà tặng unique còn hay không và người dùng đã nhận chưa
// (Cần thay đổi YOUR_WEB_APP_URL bằng URL Google Apps Script của bạn)
async function checkAndRecordPrize(prizeValue, userId) {
    // Nếu prize không phải unique, luôn cho phép
    if (!prizes.find(p => p.value === prizeValue && p.unique)) {
        return { success: true, message: 'Prize available.' };
    }

    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbzdMj4DHrZyFoSz8vDydxdfQnzNeAS_iAxSMF0OgB0elX4zqp76TMKuBdHx8TM-TF81-w/exec', { // Thay thế bằng URL Google Apps Script của bạn
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'checkAndRecord', prize: prizeValue, userId: userId }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking/recording prize:', error);
        return { success: false, message: 'Lỗi hệ thống khi kiểm tra quà tặng.' };
    }
}


// Hàm để lấy user ID từ URL nếu có (cho việc giới hạn quà tặng duy nhất)
// Ví dụ: yourwebsite.com?user_id=ABC123XYZ
function getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('user_id');
}

// Hàm quay vòng quay
async function spinWheel() {
    if (!canSpin()) {
        updateCountdown();
        return;
    }

    spinButton.disabled = true;
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    const userId = getUserIdFromUrl(); // Lấy userId từ URL
    if (!userId) {
        errorMessageP.textContent = 'Lỗi: Không tìm thấy ID người dùng. Vui lòng truy cập qua đường link Zalo OA chính thức.';
        errorDiv.classList.remove('hidden');
        spinButton.disabled = false;
        return;
    }
    
    // Kiểm tra xem userId này đã từng quay trúng quà tặng unique nào chưa
    // (Cần gọi Google Apps Script để kiểm tra)
    const userSpinStatus = await checkAndRecordPrize('check_spin_status', userId); // Action đặc biệt để kiểm tra
    if (userSpinStatus && userSpinStatus.hasSpunUniquePrize) {
        errorMessageP.textContent = 'Bạn đã quay và nhận quà tặng duy nhất rồi. Mỗi người chỉ được quay 1 lần với sản phẩm tặng.';
        errorDiv.classList.remove('hidden');
        spinButton.disabled = false;
        return;
    }

    // Chọn ngẫu nhiên một giải thưởng dựa trên trọng số
    const selectedPrize = getRandomPrize();

    // Nếu là quà tặng duy nhất, kiểm tra và ghi lại vào Google Sheet
    if (selectedPrize.unique) {
        const prizeStatus = await checkAndRecordPrize(selectedPrize.value, userId);
        if (!prizeStatus.success) {
            errorMessageP.textContent = prizeStatus.message;
            errorDiv.classList.remove('hidden');
            spinButton.disabled = false;
            return;
        }
    }

    // Animation (đơn giản)
    let degrees = 0;
    let rotations = 5; // Quay ít nhất 5 vòng
    const targetDegree = 360 * rotations + Math.random() * 360; // Thêm một góc ngẫu nhiên để dừng

    function animateSpin() {
        if (degrees < targetDegree) {
            degrees += 10; // Tăng dần độ quay
            wheelCanvas.style.transform = `rotate(${degrees}deg)`;
            requestAnimationFrame(animateSpin);
        } else {
            // Dừng vòng quay và hiển thị kết quả
            localStorage.setItem('lastSpinTime', Date.now()); // Lưu thời điểm quay
            displayResult(selectedPrize);
            updateCountdown();
            spinButton.disabled = false;
        }
    }
    animateSpin();
}

function displayResult(prize) {
    resultDiv.classList.remove('hidden');
    prizeText.textContent = prize.value;
    if (prize.type === 'Voucher') {
        instructionsText.textContent = `Vui lòng đưa màn hình này cho nhân viên để áp dụng ${prize.value}.`;
    } else if (prize.type === 'Tặng') {
        instructionsText.textContent = `Chúc mừng bạn đã nhận được 1 ${prize.value}! Vui lòng liên hệ nhân viên để nhận quà.`;
    }
}

// Initial draw
drawWheel();
updateCountdown(); // Kiểm tra trạng thái ngay khi tải trang

spinButton.addEventListener('click', spinWheel);