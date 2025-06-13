// JavaScript cho phần Cờ bạc
// Định nghĩa dữ liệu mẫu ở phạm vi toàn cục để có thể truy cập từ bất kỳ hàm nào
const sampleGamblingTypes = [
    {
        type: "Cờ Bạc Truyền Thống",
        description: "Các hình thức cờ bạc phổ biến trong văn hóa truyền thống Việt Nam",
        image: "https://media.istockphoto.com/id/1418717723/vi/anh/s%C3%B2ng-b%E1%BA%A1c.jpg?s=612x612&w=0&k=20&c=l1c-lbENSwADFw7K3HuOSIPLD-30840TZNJiL_TZzj4=",
        risks: ["Thua lỗ tài chính", "Ảnh hưởng đến gia đình", "Phạm tội hình sự", "Nghiện cờ bạc"],
        examples: ["Đánh bài", "Tài xỉu", "Lô đề", "Cá độ thể thao", "Xổ số"]
    },
    {
        type: "Cờ Bạc Trực Tuyến",
        description: "Các hoạt động cờ bạc diễn ra trên internet, dễ tiếp cận 24/7",
        image: "https://cdn-images.vtv.vn/thumb_w/640/66349b6076cb4dee98746cf1/2024/08/29/29082024--co-bac-truc-tuyen-indo-2-62393234859193999502510.png",
        risks: ["Dễ nghiện do tiếp cận 24/7", "Khó kiểm soát chi tiêu", "Bẫy lừa đảo", "Thông tin cá nhân bị đánh cắp"],
        examples: ["Casino trực tuyến", "Cá cược thể thao online", "Poker online", "Lô đề qua app", "Game bài đổi thưởng"]
    },
    {
        type: "Game Có Yếu Tố Cờ Bạc",
        description: "Các trò chơi điện tử có tính năng may rủi, cá cược tiền thật",
        image: "https://image.baophapluat.vn/w840/Uploaded/2025/athlrainaghat/2023_02_06/anh-minh-hoa-7973.png",
        risks: ["Thu hút giới trẻ", "Ranh giới mờ nhạt với game thường", "Rủi ro tài chính", "Cơ chế gây nghiện cao"],
        examples: ["Loot box", "Game quay thưởng", "Game bắn cá", "Game mạng xã hội", "NFT Gaming"]
    },
    {
        type: "Đầu Tư Rủi Ro Cao",
        description: "Các hoạt động đầu tư có tính chất đánh bạc, đầu cơ",
        image: "https://dntt.mediacdn.vn/zoom/452_283/197608888129458176/2020/11/5/thumb-game-doi-thuong-1604547762843101463978-1604547808702351249420-0-0-374-598-crop-1604547811431224482608.jpg",
        risks: ["Mất vốn cao", "Tâm lý FOMO", "Hệ thống Ponzi", "Đầu tư không hiểu biết"],
        examples: ["Binary Option", "Tiền số rủi ro cao", "Forex không hiểu biết", "Đầu tư đa cấp", "Đầu cơ sàn ảo"]
    }
];

const sampleGamblingDetails = [
    {
        id: 1,
        name: "Đánh bài",
        type: "Cờ Bạc Truyền Thống",
        description: "Các loại hình đánh bài với tiền cược, phổ biến tại Việt Nam như tiến lên, phỏm, bài cào...",
        image: "https://genk.mediacdn.vn/2018/8/15/gambling-15343270139671150331654.jpg",
        shortTerm: [
            "Kích thích cảm giác hưng phấn, giải trí",
            "Tạo cảm giác kết nối xã hội tạm thời",
            "Có thể được lợi nhuận ngắn hạn",
            "Tạo cảm giác thành công khi thắng",
            "Tăng cảm giác tự tin tạm thời"
        ],
        longTerm: [
            "Thua lỗ tài chính nghiêm trọng",
            "Ảnh hưởng đến công việc, học tập",
            "Tâm lý căng thẳng, trầm cảm",
            "Mâu thuẫn, đổ vỡ gia đình",
            "Nợ nần dẫn đến các hành vi phạm pháp"
        ]
    },
    {
        id: 2,
        name: "Casino trực tuyến",
        type: "Cờ Bạc Trực Tuyến",
        description: "Các sòng bài trực tuyến cung cấp nhiều trò chơi casino như: baccarat, roulette, blackjack, slot machine...",
        image: "https://cafefcdn.com/zoom/700_438/203337114487263232/2024/3/31/1-17119029652422046465899-63-0-1001-1500-crop-17119029725091632831080.jpeg",
        shortTerm: [
            "Dễ tiếp cận mọi lúc, mọi nơi",
            "Các khuyến mãi, tiền thưởng hấp dẫn ban đầu",
            "Giao diện đẹp, âm thanh sống động tạo cảm giác thật",
            "Tiện lợi khi chơi tại nhà, không cần di chuyển",
            "Nhiều lựa chọn trò chơi đa dạng"
        ],
        longTerm: [
            "Khó kiểm soát thời gian và tiền bạc",
            "Không gian ảo dễ mất kết nối với thực tế",
            "Nguy cơ lộ thông tin cá nhân, tài khoản ngân hàng",
            "Rủi ro cao với các trang web không uy tín",
            "Khả năng nghiện cao hơn do dễ tiếp cận 24/7"
        ]
    }
];

// Dữ liệu mẫu cho các câu chuyện về hậu quả của cờ bạc
const sampleGamblingStories = [
    {
        id: 1,
        name: "Hoàng M.",
        age: 42,
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        story: "Tôi đã từng đánh bạc trong 15 năm và mất gần như tất cả: gia đình, công việc, nhà cửa. Chỉ khi nhận được sự hỗ trợ từ các chuyên gia và gia đình, tôi mới dần hồi phục. Giờ đây, sau 3 năm không đánh bạc, cuộc sống của tôi đã hoàn toàn thay đổi."
    },
    {
        id: 2,
        name: "Thu H.",
        age: 35,
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        story: "Chồng tôi nghiện cờ bạc online, từ một người chồng tốt trở thành con người khác hẳn. Anh ấy vay nợ khắp nơi, bán cả đồ trong nhà để đánh bạc. Gia đình chúng tôi suýt tan vỡ. May mắn là sau 2 năm điều trị, anh ấy đã cai được và chúng tôi đang từng bước xây dựng lại cuộc sống."
    }
];

// Khai báo biến để lưu dữ liệu từ server
let gamblingTypes = [];
let gamblingDetails = [];
let gamblingStories = [];

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo modal cho cờ bạc
    initializeGamblingInterface();

    // Thêm sự kiện click cho nút Cờ bạc trong circular menu
    document.addEventListener('click', function(e) {
        if (e.target.closest('.social-issue-circle.gambling')) {
            e.preventDefault();
            openGamblingMenu();
        }
    });
});

// Hàm khởi tạo giao diện cờ bạc
function initializeGamblingInterface() {
    // Tạo container cho modal cờ bạc
    const gamblingMenuContainer = document.createElement('div');
    gamblingMenuContainer.classList.add('gambling-menu-container');
    
    // Tạo nội dung modal
    gamblingMenuContainer.innerHTML = `
        <div class="gambling-menu-content">
            <button class="gambling-menu-close">
                <i class="fas fa-times"></i>
            </button>
            
            <h2 style="color: #fff; text-align: center; margin-bottom: 20px;">
                <i class="fas fa-dice" style="margin-right: 10px; color: #e74c3c;"></i>
                Cờ Bạc - Hiểm Họa Tiềm Ẩn
            </h2>
            
            <div class="gambling-warning">
                <i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i>
                Những thông tin dưới đây chỉ để giáo dục và phòng chống, tuyệt đối không thử nghiệm!
            </div>
            
            <div class="gambling-stats">
                <div class="gambling-stat">
                    <span class="stat-number"><span class="counter" data-target="85">0</span>%</span>
                    <span class="stat-description">Người chơi cờ bạc bị tổn thất tài chính</span>
                </div>
                <div class="gambling-stat">
                    <span class="stat-number"><span class="counter" data-target="5.2">0</span>%</span>
                    <span class="stat-description">Dân số Việt Nam có vấn đề về cờ bạc</span>
                </div>
                <div class="gambling-stat">
                    <span class="stat-number"><span class="counter" data-target="67">0</span>%</span>
                    <span class="stat-description">Người nghiện mắc các vấn đề tâm lý</span>
                </div>
            </div>
            
            <div class="gambling-types-grid" id="gambling-types-grid">
                <!-- Các loại cờ bạc sẽ được thêm vào đây bằng JavaScript -->
            </div>
            
            <div class="gambling-menu-wave"></div>
            <div class="gambling-menu-wave"></div>
        </div>
    `;
    
    // Thêm modal vào body
    document.body.appendChild(gamblingMenuContainer);
    
    // Tạo modal chi tiết cho từng loại cờ bạc
    const gamblingDetailModal = document.createElement('div');
    gamblingDetailModal.classList.add('gambling-detail-modal');
    gamblingDetailModal.innerHTML = `
        <button class="gambling-menu-close">
            <i class="fas fa-times"></i>
        </button>
        <div id="gambling-detail-content">
            <!-- Nội dung chi tiết sẽ được thêm vào đây -->
        </div>
    `;
    
    document.body.appendChild(gamblingDetailModal);
    
    // Thêm sự kiện đóng modal
    document.querySelectorAll('.gambling-menu-close').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Ngăn chặn hành vi mặc định và ngăn sự kiện lan truyền
            e.preventDefault();
            e.stopPropagation();
            
            // Chỉ đóng modal cụ thể mà không quay về trang chủ
            if (this.closest('.gambling-detail-modal')) {
                // Nếu đang ở trong modal chi tiết, chỉ đóng modal chi tiết
                document.querySelector('.gambling-detail-modal').classList.remove('active');
            } else {
                // Nếu đang ở menu chính, đóng cả hai
                closeGamblingMenus();
            }
        });
    });
    
    // Ngăn chặn sự kiện click trên nội dung của modal làm đóng modal
    gamblingMenuContainer.querySelector('.gambling-menu-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    gamblingDetailModal.querySelector('#gambling-detail-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Cho phép click vào khoảng trống của modal detail để đóng
    gamblingDetailModal.addEventListener('click', function(e) {
        if (e.target === gamblingDetailModal) {
            e.preventDefault();
            gamblingDetailModal.classList.remove('active');
        }
    });
    
    // Hiển thị dữ liệu ban đầu
    loadGamblingTypes();
    
    // Thêm dấu hiệu cảnh báo cho nút cờ bạc trong circular menu
    const gamblingButton = document.querySelector('.social-issue-circle.gambling');
    if (gamblingButton) {
        const highlight = document.createElement('span');
        highlight.classList.add('gambling-highlight');
        highlight.textContent = '!';
        gamblingButton.appendChild(highlight);
        
        // Cập nhật tooltip
        gamblingButton.setAttribute('title', 'Thông tin về cờ bạc - Hiểm họa và tác hại');
    }
}

// Hàm mở modal cờ bạc
function openGamblingMenu() {
    // Đóng circular menu nếu đang mở
    const circularMenu = document.querySelector('.circular-menu');
    const circularMenuBackdrop = document.querySelector('.circular-menu-backdrop');
    
    if (circularMenu && circularMenu.classList.contains('active')) {
        circularMenu.classList.remove('active');
        circularMenuBackdrop.classList.remove('active');
    }
    
    // Mở gambling menu
    const gamblingMenuContainer = document.querySelector('.gambling-menu-container');
    gamblingMenuContainer.classList.add('active');
    
    // Bắt đầu hiệu ứng counter
    animateCounters();
    
    // Block scroll trên body
    document.body.style.overflow = 'hidden';
}

// Hàm đóng tất cả các modal cờ bạc
function closeGamblingMenus() {
    const gamblingMenuContainer = document.querySelector('.gambling-menu-container');
    const gamblingDetailModal = document.querySelector('.gambling-detail-modal');
    
    if (gamblingMenuContainer) {
        gamblingMenuContainer.classList.remove('active');
    }
    
    if (gamblingDetailModal) {
        gamblingDetailModal.classList.remove('active');
    }
    
    // Cho phép scroll lại
    document.body.style.overflow = '';
}

// Hàm tải dữ liệu các loại cờ bạc
function loadGamblingTypes() {
    try {
        // Sử dụng dữ liệu mẫu trực tiếp thay vì gọi API
        console.log('Sử dụng dữ liệu cờ bạc mẫu từ cục bộ');
        gamblingTypes = sampleGamblingTypes;
        renderGamblingTypes(sampleGamblingTypes);
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu cờ bạc:', error);
        showToast('Đã xảy ra lỗi khi tải thông tin cờ bạc. Vui lòng thử lại sau.', 'error');
    }
}

// Hàm hiển thị các loại cờ bạc
function renderGamblingTypes(gamblingTypes) {
    const gamblingTypesGrid = document.getElementById('gambling-types-grid');
    gamblingTypesGrid.innerHTML = '';
    
    gamblingTypes.forEach(type => {
        const card = document.createElement('div');
        card.classList.add('gambling-type-card');
        
        card.innerHTML = `
            <div class="gambling-type-header" style="background-image: url('${type.image}')">
                <h3 class="gambling-type-name">${type.type}</h3>
            </div>
            <div class="gambling-type-content">
                <p class="gambling-type-desc">${type.description}</p>
                <h4 style="font-size: 1rem; margin: 15px 0 10px;">Rủi ro chính:</h4>
                <ul class="gambling-risks-list">
                    ${type.risks.map(risk => `<li>${risk}</li>`).join('')}
                </ul>
                <h4 style="font-size: 1rem; margin: 15px 0 10px;">Các dạng phổ biến:</h4>
                <div class="gambling-examples">
                    ${type.examples.map(example => 
                        `<span class="gambling-example" data-gambling="${example}">${example}</span>`
                    ).join('')}
                </div>
            </div>
        `;
        
        gamblingTypesGrid.appendChild(card);
    });
    
    // Thêm sự kiện cho các ví dụ cờ bạc
    document.querySelectorAll('.gambling-example').forEach(example => {
        example.addEventListener('click', function() {
            const gamblingName = this.getAttribute('data-gambling');
            openGamblingDetail(gamblingName);
        });
    });
}

// Hàm mở chi tiết về một loại cờ bạc
function openGamblingDetail(gamblingName) {
    try {
        // Tìm trong dữ liệu mẫu
        const gambling = sampleGamblingDetails.find(g => g.name.includes(gamblingName));
        
        // Nếu không tìm thấy, hiển thị thông tin mặc định
        showGamblingDetail(gambling || {
            name: gamblingName,
            type: "Chưa có thông tin chi tiết",
            description: "Hiện chúng tôi đang cập nhật thông tin chi tiết về loại hình cờ bạc này.",
            image: "https://via.placeholder.com/400x300?text=Đang+cập+nhật",
            shortTerm: ["Thông tin đang được cập nhật"],
            longTerm: ["Thông tin đang được cập nhật"],
            danger_level: "medium"
        });
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu chi tiết cờ bạc:', error);
        showToast('Đã xảy ra lỗi khi tải thông tin chi tiết. Vui lòng thử lại sau.', 'error');
    }
}

// Hiệu ứng đếm số cho thống kê
function animateCounters() {
    const counterElements = document.querySelectorAll('.counter');
    counterElements.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const duration = 2000; // 2 giây
        const increment = target / 100;
        let current = 0;
        const interval = duration / 100;
        
        const timer = setInterval(() => {
            current += increment;
            const displayValue = current >= target ? target : Number(current).toFixed(1);
            counter.textContent = displayValue;
            
            if (current >= target) {
                clearInterval(timer);
            }
        }, interval);
    });
}

// Hàm hiển thị chi tiết một loại cờ bạc
function showGamblingDetail(gambling) {
    const detailContent = document.getElementById('gambling-detail-content');
    
    try {
        // Sử dụng dữ liệu mẫu trực tiếp
        gamblingStories = sampleGamblingStories;
        
        // Hiển thị nội dung chi tiết với câu chuyện mẫu
        renderGamblingDetail(gambling, detailContent);
        
        // Hiển thị modal chi tiết
        document.querySelector('.gambling-detail-modal').classList.add('active');
    } catch (error) {
        console.error('Lỗi khi hiển thị chi tiết cờ bạc:', error);
        showToast('Đã xảy ra lỗi khi hiển thị thông tin chi tiết.', 'error');
    }
}

// Hàm hiển thị chi tiết cờ bạc (tách từ hàm showGamblingDetail)
function renderGamblingDetail(gambling, detailContent) {
    // Chọn một câu chuyện ngẫu nhiên
    const randomStory = gamblingStories[Math.floor(Math.random() * gamblingStories.length)];
    
    // Xác định cấp độ nguy hiểm
    const dangerLevel = gambling.danger_level || 'high';
    
    // HTML cơ bản cho thông tin cờ bạc
    let htmlContent = `
        <div class="gambling-detail-header">
            <img src="${gambling.image}" alt="${gambling.name}" class="gambling-detail-img">
            <div>
                <h3 class="gambling-detail-name">${gambling.name}</h3>
                <span class="gambling-detail-type">${gambling.type}</span>
            </div>
        </div>
        
        <div class="gambling-detail-content">
            <div class="gambling-detail-section">
                <h4>Mô tả</h4>
                <p>${gambling.description}</p>
            </div>
            
            <div class="gambling-detail-section">
                <h4>Tác động của ${gambling.name}</h4>
                <div class="gambling-effects-container">
                    <div class="effect-column">
                        <div class="effect-title short-term">
                            <i class="fas fa-bolt"></i> Tác động ngắn hạn
                        </div>
                        <ul class="effect-list">
                            ${gambling.shortTerm.map(effect => `<li>${effect}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="effect-column">
                        <div class="effect-title long-term">
                            <i class="fas fa-skull-crossbones"></i> Tác động dài hạn
                        </div>
                        <ul class="effect-list">
                            ${gambling.longTerm.map(effect => `<li>${effect}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="gambling-detail-section">
                <h4>Cách phòng tránh</h4>
                <ul class="effect-list">
                    <li>Xác định giới hạn thời gian và tiền bạc trước khi tham gia</li>
                    <li>Tránh xa các môi trường cờ bạc hoặc người rủ rê</li>
                    <li>Tìm hiểu về xác suất thắng thua thực tế</li>
                    <li>Xây dựng sở thích lành mạnh thay thế</li>
                    <li>Tìm sự giúp đỡ chuyên nghiệp nếu đã có dấu hiệu nghiện</li>
                </ul>
            </div>

            <div class="gambling-detail-section">
                <h4>Dấu hiệu nhận biết nghiện cờ bạc</h4>
                <ul class="effect-list">
                    <li>Liên tục nghĩ về cờ bạc và cách kiếm tiền để đánh bạc</li>
                    <li>Tăng dần số tiền đánh bạc để đạt cảm giác thỏa mãn</li>
                    <li>Cảm thấy bồn chồn, cáu kỉnh khi cố gắng dừng đánh bạc</li>
                    <li>Nói dối gia đình, bạn bè về mức độ đánh bạc</li>
                    <li>Bất chấp hậu quả tiếp tục đánh bạc dù đã có vấn đề nghiêm trọng</li>
                </ul>
            </div>
            
            <div class="gambling-detail-section">
                <h4>Câu chuyện thực tế</h4>
                <div class="gambling-story">
                    <div class="story-avatar">
                        <img src="${randomStory.avatar}" alt="Người chia sẻ">
                    </div>
                    <div class="story-content">
                        <h5>${randomStory.name}, ${randomStory.age} tuổi</h5>
                        <p>${randomStory.story}</p>
                    </div>
                </div>
            </div>

            <div class="gambling-detail-section">
                <h4>Đánh giá mức độ nguy hiểm</h4>
                <div class="danger-meter-container">
                    <div class="danger-meter ${dangerLevel}">
                        <div class="danger-level">${dangerLevel === 'low' ? 'Thấp' : dangerLevel === 'medium' ? 'Trung bình' : dangerLevel === 'high' ? 'Cao' : 'Cực kỳ nguy hiểm'}</div>
                        <div class="danger-description">Loại hình cờ bạc này có khả năng gây nghiện ${dangerLevel === 'low' ? 'thấp' : dangerLevel === 'medium' ? 'trung bình' : dangerLevel === 'high' ? 'cao' : 'rất cao'} và tác động tài chính ${dangerLevel === 'low' ? 'nhẹ' : dangerLevel === 'medium' ? 'đáng kể' : dangerLevel === 'high' ? 'nghiêm trọng' : 'hủy hoại'}</div>
                    </div>
                </div>
            </div>

            <div class="gambling-help-section">
                <h4>Bạn cần giúp đỡ?</h4>
                <div class="help-button">
                    <a href="tel:18001567" class="help-hotline">
                        <i class="fas fa-phone-alt"></i> Gọi đường dây nóng hỗ trợ: 1800 1567
                    </a>
                </div>
            </div>
        </div>
    `;
    
    // Hiển thị nội dung
    detailContent.innerHTML = htmlContent;
    
    // Hiển thị modal
    const gamblingDetailModal = document.querySelector('.gambling-detail-modal');
    gamblingDetailModal.classList.add('active');
}

// Hàm tạo toast thông báo
function showToast(message, type) {
    // Kiểm tra xem đã có toast container chưa
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Tạo toast mới
    const toast = document.createElement('div');
    toast.className = `toast toast-${type || 'info'}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="${type === 'success' ? 'fas fa-check-circle' : type === 'warning' ? 'fas fa-exclamation-triangle' : type === 'error' ? 'fas fa-times-circle' : 'fas fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    // Thêm toast vào container
    toastContainer.appendChild(toast);
    
    // Hiển thị toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Tự động xóa toast sau 5 giây
    const timeout = setTimeout(() => {
        removeToast(toast);
    }, 5000);
    
    // Xử lý sự kiện đóng toast
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timeout);
        removeToast(toast);
    });
}

// Hàm xóa toast
function removeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
} 