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

// === URL Google Apps Script của bạn (ĐÃ ĐƯỢC CẬP NHẬT TỪ CODE CỦA BẠN) ===
const response = await fetch('https://script.google.com/macros/s/AKfycbzK5Cg_zVAmSemFpe1nbBKB8Zoi-fAijFbsp_OAkmvB2HRYbncSaHpG2dh-t4SJXRXTwA/exec', { // Thay thế bằng URL Google Apps Script của bạn

// Hàm để kiểm tra xem quà tặng unique còn hay không và người dùng đã nhận chưa
async function checkAndRecordPrize(prizeValue, userId) {
    console.log('--- checkAndRecordPrize function called ---');
    console.log('Prize Value:', prizeValue, 'User ID:', userId);

    // Nếu prize không phải unique, luôn cho phép
    if (!prizes.find(p => p.value === prizeValue && p.unique) && prizeValue !== 'check_spin_status') {
        console.log('Prize is not unique or is a status check. Skipping backend check.');
        return { success: true, message: 'Prize available.' };
    }

    try {
        if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL === 'YOUR_WEB_APP_URL_PLACEHOLDER') { // Dòng này sẽ giúp phát hiện nếu URL chưa được thay thế
            console.error('Google Apps Script URL is not configured!');
            return { success: false, message: 'Lỗi cấu hình: URL Google Apps Script chưa được thiết lập.' };
        }
        
        const payload = { action: (prizeValue === 'check_spin_status' ? 'check_spin_status' : 'checkAndRecord'), prize: prizeValue, userId: userId };
        console.log('Sending POST request to Apps Script with payload:', payload);

        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        
        console.log('Received response from Apps Script. Status:', response.status);
        const data = await response.json();
        console.log('Response data from Apps Script:', data);
        return data;
    } catch (error) {
        console.error('Error during checkAndRecordPrize fetch:', error);
        return { success: false, message: 'Lỗi hệ thống khi kiểm tra quà tặng. Vui lòng thử lại.' };
    }
}


// Hàm để lấy user ID từ URL nếu có (cho việc giới hạn quà tặng duy nhất)
// Ví dụ: yourwebsite.com?user_id=ABC123XYZ
function getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id');
    console.log('getUserIdFromUrl called. User ID found:', userId);
    return userId;
}

// Hàm quay vòng quay
async function spinWheel() {
    console.log('--- spinWheel function started ---');

    if (!canSpin()) {
        console.log('Condition: User cannot spin yet (24-hour limit).');
        updateCountdown();
        return;
    }
    console.log('Condition: User can spin (24-hour limit passed).');

    spinButton.disabled = true;
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    const userId = getUserIdFromUrl(); // Lấy userId từ URL
    if (!userId) {
        errorMessageP.textContent = 'Lỗi: Không tìm thấy ID người dùng. Vui lòng truy cập qua đường link Zalo OA chính thức.';
        errorDiv.classList.remove('hidden');
        spinButton.disabled = false;
        console.log('Condition: User ID is missing in URL.');
        return; // Dừng lại nếu không có userId
    }
    console.log('Condition: User ID is present in URL:', userId);
    
    // Kiểm tra xem userId này đã từng quay trúng quà tặng unique nào chưa
    console.log('Calling checkAndRecordPrize for initial spin status check...');
    const userSpinStatus = await checkAndRecordPrize('check_spin_status', userId); // Action đặc biệt để kiểm tra
    console.log('Result of initial spin status check:', userSpinStatus);

    if (userSpinStatus && userSpinStatus.hasSpunUniquePrize) {
        errorMessageP.textContent = 'Bạn đã quay và nhận quà tặng duy nhất rồi. Mỗi người chỉ được quay 1 lần với sản phẩm tặng.';
        errorDiv.classList.remove('hidden');
        spinButton.disabled = false;
        console.log('Condition: User has already received a unique prize.');
        return; // Dừng lại nếu đã nhận quà tặng unique
    }
    console.log('Condition: User has not received a unique prize yet.');

    // Chọn ngẫu nhiên một giải thưởng dựa trên trọng số
    const selectedPrize = getRandomPrize();
    console.log('Selected Prize:', selectedPrize);

    // Nếu là quà tặng duy nhất, kiểm tra và ghi lại vào Google Sheet
    if (selectedPrize.unique) {
        console.log('Selected prize is unique. Calling checkAndRecordPrize to record it...');
        const prizeStatus = await checkAndRecordPrize(selectedPrize.value, userId);
        console.log('Result of recording unique prize:', prizeStatus);
        if (!prizeStatus.success) {
            errorMessageP.textContent = prizeStatus.message;
            errorDiv.classList.remove('hidden');
            spinButton.disabled = false;
            console.log('Error: Failed to record unique prize.');
            return; // Dừng lại nếu ghi nhận quà tặng unique thất bại
        }
        console.log('Unique prize recorded successfully.');
    } else {
        console.log('Selected prize is not unique. No special backend recording needed for non-unique prizes.');
    }

    // Animation (đơn giản)
    let currentDegrees = parseFloat(wheelCanvas.style.transform.replace('rotate(', '').replace('deg)', '') || 0);
    const rotations = 5; // Quay ít nhất 5 vòng
    // Tính toán góc dừng cuối cùng của vòng quay để giải thưởng chọn ngẫu nhiên nằm ở vị trí nhất định
    let angleToStop = 0;
    let accumulatedAngle = 0;
    for (const prize of prizes) {
        const sliceAngle = (prize.weight / totalWeight) * 360; // Degrees
        if (prize === selectedPrize) {
            angleToStop = accumulatedAngle + sliceAngle / 2; // Dừng ở giữa phần quà
            break;
        }
        accumulatedAngle += sliceAngle;
    }
    
    // Đảm bảo dừng ở vị trí hợp lý sau nhiều vòng quay
    // Quay đến một vị trí tương đối, sau đó thêm góc để nhắm trúng phần quà
    const targetDegree = (360 * rotations) + (360 - angleToStop); // Adjust to land on top
    
    // Reset transform before animating to avoid cumulative rotations if spinning multiple times
    wheelCanvas.style.transition = 'none';
    wheelCanvas.style.transform = `rotate(${currentDegrees % 360}deg)`; // Normalize current rotation
    void wheelCanvas.offsetWidth; // Force reflow
    
    wheelCanvas.style.transition = 'transform 3s ease-out';
    wheelCanvas.style.transform = `rotate(${targetDegree}deg)`;


    // Handle spin end after animation
    setTimeout(() => {
        console.log('Spin animation ended. Displaying result.');
        localStorage.setItem('lastSpinTime', Date.now()); // Lưu thời điểm quay
        displayResult(selectedPrize);
        updateCountdown();
        spinButton.disabled = false;
    }, 3000); // 3 seconds for animation
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
