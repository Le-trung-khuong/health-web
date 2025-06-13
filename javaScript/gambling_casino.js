/**
 * Warning Theme Gambling Prevention UI JavaScript
 * Hiệu ứng và chức năng tương tác cho giao diện cảnh báo cờ bạc
 */

// Biến toàn cục để lưu trữ dữ liệu
let casinoGamblingTypes = [];
let casinoGamblingDetails = [];
let casinoGamblingStories = [];

// Khởi tạo giao diện khi trang đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    initCasinoUI();
    
    // Thêm sự kiện cho nút "Cờ bạc" trong trang chủ
    document.addEventListener('click', function(e) {
        if (e.target.closest('.open-gambling-info')) {
            e.preventDefault();
            openCasinoGamblingUI();
        }
    });
});

// Hàm khởi tạo giao diện
function initCasinoUI() {
    // Tạo container chính
    const casinoContainer = document.createElement('div');
    casinoContainer.classList.add('casino-container');
    
    // Tạo nội dung container
    casinoContainer.innerHTML = `
        <div class="casino-content">
            <div class="casino-header">
                <h1 class="casino-title">Cờ Bạc & Tác Hại</h1>
                <p class="casino-subtitle">Thông tin và cảnh báo về các loại hình cờ bạc phổ biến</p>
                <button class="casino-close"><i class="fas fa-times"></i></button>
            </div>
            
            <div class="warning-banner">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Nội dung này chỉ mang tính chất giáo dục và cảnh báo về tác hại của cờ bạc</span>
            </div>
            
            <!-- Phần thống kê -->
            <div class="casino-stats">
                <div class="stat-card">
                    <div class="stat-number"><span class="counter" data-target="85">0</span>%</div>
                    <div class="stat-text">Người chơi cờ bạc bị tổn thất tài chính</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number"><span class="counter" data-target="5.2">0</span>%</div>
                    <div class="stat-text">Dân số Việt Nam có vấn đề về cờ bạc</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number"><span class="counter" data-target="67">0</span>%</div>
                    <div class="stat-text">Người nghiện mắc các vấn đề tâm lý</div>
                </div>
            </div>
            
            <div class="casino-grid" id="casino-grid">
                <!-- Nội dung sẽ được thêm bằng JavaScript -->
            </div>
            
            <!-- Phần trợ giúp -->
            <div class="help-section">
                <h3><i class="fas fa-hands-helping"></i> Cần Hỗ Trợ?</h3>
                <p>Nếu bạn hoặc người thân đang gặp vấn đề với cờ bạc, hãy liên hệ với các trung tâm hỗ trợ chuyên nghiệp để được tư vấn kịp thời.</p>
                <a href="tel:111" class="help-button"><i class="fas fa-phone"></i> Gọi Đường Dây Nóng</a>
            </div>
        </div>
    `;
    
    // Thêm vào body
    document.body.appendChild(casinoContainer);
    
    // Tạo modal chi tiết
    const detailModal = document.createElement('div');
    detailModal.classList.add('casino-detail-modal');
    detailModal.innerHTML = `
        <div class="casino-detail-content">
            <button class="casino-close"><i class="fas fa-times"></i></button>
            <div id="casino-detail-content">
                <!-- Nội dung chi tiết sẽ được thêm ở đây -->
            </div>
        </div>
    `;
    
    document.body.appendChild(detailModal);
    
    // Thêm sự kiện đóng modal
    document.querySelectorAll('.casino-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            if (this.closest('.casino-detail-modal')) {
                document.querySelector('.casino-detail-modal').classList.remove('active');
            } else {
                closeCasinoGamblingUI();
            }
        });
    });
    
    // Tải dữ liệu
    loadCasinoGamblingData();
}

// Hàm mở giao diện cờ bạc
function openCasinoGamblingUI() {
    // Đóng circular menu nếu đang mở
    const circularMenu = document.querySelector('.circular-menu');
    const circularMenuBackdrop = document.querySelector('.circular-menu-backdrop');
    
    if (circularMenu && circularMenu.classList.contains('active')) {
        circularMenu.classList.remove('active');
        circularMenuBackdrop.classList.remove('active');
    }
    
    // Mở casino UI
    const casinoContainer = document.querySelector('.casino-container');
    if (casinoContainer) {
        casinoContainer.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Bắt đầu hiệu ứng đếm
        startCountAnimation();
    }
}

// Hàm đóng giao diện cờ bạc
function closeCasinoGamblingUI() {
    const casinoContainer = document.querySelector('.casino-container');
    const detailModal = document.querySelector('.casino-detail-modal');
    
    if (casinoContainer) {
        casinoContainer.classList.remove('active');
    }
    
    if (detailModal) {
        detailModal.classList.remove('active');
    }
    
    // Khôi phục scroll
    document.body.style.overflow = '';
}

// Load dữ liệu cờ bạc
function loadCasinoGamblingData() {
    try {
        // Sử dụng dữ liệu mẫu trực tiếp thay vì gọi API
        console.log('Sử dụng dữ liệu cờ bạc mẫu từ cục bộ');
        casinoGamblingTypes = getSampleGamblingTypes();
        renderCasinoGamblingTypes(casinoGamblingTypes);
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu cờ bạc:', error);
        // Vẫn sử dụng dữ liệu mẫu ngay cả khi có lỗi
        casinoGamblingTypes = getSampleGamblingTypes();
        renderCasinoGamblingTypes(casinoGamblingTypes);
    }
}

// Hiển thị các loại cờ bạc
function renderCasinoGamblingTypes(types) {
    const gridContainer = document.getElementById('casino-grid');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    
    types.forEach((type, index) => {
        const iconClass = getIconClassForType(type.type);
        const cardHtml = `
            <div class="casino-card" data-type="${type.type}" data-index="${index}">
                <div class="casino-card-inner">
                    <div class="casino-card-icon">
                        <i class="${iconClass}"></i>
                    </div>
                    <h3 class="casino-card-title">${type.type}</h3>
                    <p class="casino-card-desc">${type.description}</p>
                    <div class="casino-card-examples">
                        ${type.examples.map(example => `<span class="example-tag">${example}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
        
        gridContainer.innerHTML += cardHtml;
    });
    
    // Thêm sự kiện click cho các thẻ
    document.querySelectorAll('.casino-card').forEach(card => {
        card.addEventListener('click', function() {
            const typeIndex = this.dataset.index;
            const gamblingType = casinoGamblingTypes[typeIndex];
            openCasinoGamblingDetail(gamblingType);
        });
    });
}

// Mở modal chi tiết
function openCasinoGamblingDetail(gamblingType) {
    try {
        // Sử dụng dữ liệu mẫu trực tiếp
        const sampleDetails = getSampleGamblingDetails();
        const matchingDetail = sampleDetails.find(detail => 
            detail.type === gamblingType.type || 
            detail.name === gamblingType.examples[0]
        );
        
        if (matchingDetail) {
            renderCasinoGamblingDetail(matchingDetail);
        } else {
            renderCasinoGamblingDetail(createDefaultDetail(gamblingType));
        }
    } catch (error) {
        console.error('Lỗi khi xử lý chi tiết cờ bạc:', error);
        // Tạo chi tiết mặc định nếu có lỗi
        renderCasinoGamblingDetail(createDefaultDetail(gamblingType));
    }
}

// Hiển thị chi tiết cờ bạc
function renderCasinoGamblingDetail(detail) {
    const detailContent = document.getElementById('casino-detail-content');
    if (!detailContent) return;
    
    const iconClass = getIconClassForType(detail.type);
    
    let detailHtml = `
        <div class="warning-banner">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Thông tin giáo dục về tác hại của cờ bạc</span>
        </div>
        
        <div class="detail-header">
            <div class="detail-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="detail-title-group">
                <h2 class="detail-title">${detail.name}</h2>
                <p class="detail-subtitle">${detail.type}</p>
            </div>
        </div>
        
        <img src="${detail.image}" alt="${detail.name}" class="detail-image">
        
        <div class="detail-section">
            <h3 class="detail-section-title"><i class="fas fa-info-circle"></i> Mô tả</h3>
            <p class="detail-description">${detail.description}</p>
        </div>
        
        <div class="detail-section">
            <h3 class="detail-section-title"><i class="fas fa-exclamation-triangle"></i> Tác động</h3>
            <div class="effects-container">
                <div class="effects-column short-term">
                    <div class="effects-title">
                        <i class="fas fa-clock"></i> Tác động ngắn hạn
                    </div>
                    <ul class="effects-list">
                        ${detail.shortTerm.map(effect => `<li>${effect}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="effects-column long-term">
                    <div class="effects-title">
                        <i class="fas fa-calendar-alt"></i> Tác động dài hạn
                    </div>
                    <ul class="effects-list">
                        ${detail.longTerm.map(effect => `<li>${effect}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // Thêm câu chuyện về hậu quả từ dữ liệu mẫu
    try {
        const sampleStories = getSampleGamblingStories();
        if (sampleStories.length > 0) {
            const randomStory = sampleStories[Math.floor(Math.random() * sampleStories.length)];
            detailHtml += createStoryHTML(randomStory);
        }
        
        // Cập nhật nội dung
        detailContent.innerHTML = detailHtml;
        
        // Mở modal
        document.querySelector('.casino-detail-modal').classList.add('active');
    } catch (error) {
        console.error('Lỗi khi xử lý câu chuyện cờ bạc:', error);
        // Vẫn hiển thị nội dung chính ngay cả khi không có câu chuyện
        detailContent.innerHTML = detailHtml;
        document.querySelector('.casino-detail-modal').classList.add('active');
    }
}

// Tạo HTML cho phần câu chuyện
function createStoryHTML(story) {
    return `
        <div class="detail-section">
            <h3 class="detail-section-title"><i class="fas fa-book"></i> Câu chuyện thật</h3>
            <div class="story-container">
                <div class="story-avatar">
                    <img src="${story.avatar}" alt="${story.name}">
                </div>
                <div class="story-content">
                    <blockquote>
                        <p>"${story.story}"</p>
                        <footer>— ${story.name}, ${story.age} tuổi</footer>
                    </blockquote>
                </div>
            </div>
        </div>
    `;
}

// Tạo chi tiết mặc định nếu không có dữ liệu
function createDefaultDetail(gamblingType) {
    return {
        id: 0,
        name: gamblingType.examples[0] || gamblingType.type,
        type: gamblingType.type,
        description: gamblingType.description,
        image: "https://ddk.1cdn.vn/thumbs/900x600/2024/02/29/anh-chup-man-hinh-2024-02-29-luc-09.48.07.png",
        shortTerm: [
            "Cảm giác phấn khích, hưng phấn tạm thời",
            "Giải trí, thư giãn trong thời gian ngắn",
            "Tạo cảm giác kết nối xã hội",
            "Có thể có lợi nhuận nhỏ trong thời gian ngắn",
            "Sự hồi hộp của trò chơi mang tính may rủi"
        ],
        longTerm: [
            "Tổn thất tài chính, nợ nần",
            "Ảnh hưởng tiêu cực đến công việc, học tập",
            "Rủi ro phát triển thành nghiện",
            "Mâu thuẫn, đổ vỡ gia đình",
            "Tác động tiêu cực đến sức khỏe tâm lý"
        ]
    };
}

// Lấy class icon phù hợp với loại cờ bạc
function getIconClassForType(type) {
    switch(type) {
        case "Cờ Bạc Truyền Thống":
            return "fas fa-dice";
        case "Cờ Bạc Trực Tuyến":
            return "fas fa-laptop";
        case "Game Có Yếu Tố Cờ Bạc":
            return "fas fa-gamepad";
        case "Đầu Tư Rủi Ro Cao":
            return "fas fa-chart-line";
        default:
            return "fas fa-dice";
    }
}

// Animation đếm số
function startCountAnimation() {
    document.querySelectorAll('.counter').forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        let count = 0;
        const duration = 2000; // 2 giây
        
        // Xác định bước nhảy dựa trên giá trị mục tiêu
        let step;
        if (target < 10) {
            step = 0.1; // Số thập phân nhỏ
        } else {
            step = Math.ceil(target / 50); // Chia thành khoảng 50 bước
        }
        
        const updateCount = () => {
            if (count < target) {
                count += step;
                if (count > target) count = target;
                
                // Hiển thị giá trị
                if (target < 10) {
                    counter.textContent = count.toFixed(1);
                } else {
                    counter.textContent = Math.round(count);
                }
                
                requestAnimationFrame(updateCount);
            }
        };
        
        updateCount();
    });
}

// Các hàm lấy dữ liệu mẫu
function getSampleGamblingTypes() {
    return [
        {
            type: "Cờ Bạc Truyền Thống",
            description: "Các hình thức cờ bạc phổ biến trong văn hóa truyền thống Việt Nam",
            image: "https://ddk.1cdn.vn/thumbs/900x600/2024/02/29/anh-chup-man-hinh-2024-02-29-luc-09.48.07.png",
            risks: ["Thua lỗ tài chính", "Ảnh hưởng đến gia đình", "Phạm tội hình sự", "Nghiện cờ bạc"],
            examples: ["Đánh bài", "Tài xỉu", "Lô đề", "Cá độ thể thao", "Xổ số"]
        },
        {
            type: "Cờ Bạc Trực Tuyến",
            description: "Các hoạt động cờ bạc diễn ra trên internet, dễ tiếp cận 24/7",
            image: "https://adminvov1.vov.gov.vn/UploadImages/vov1/2021/thang_11/giai-thich-ly-do-vi-sao-danh-bac-online-luon-thua.jpg?w=1000",
            risks: ["Dễ nghiện do tiếp cận 24/7", "Khó kiểm soát chi tiêu", "Bẫy lừa đảo", "Thông tin cá nhân bị đánh cắp"],
            examples: ["Casino trực tuyến", "Cá cược thể thao online", "Poker online", "Lô đề qua app", "Game bài đổi thưởng"]
        },
        {
            type: "Game Có Yếu Tố Cờ Bạc",
            description: "Các trò chơi điện tử có tính năng may rủi, cá cược tiền thật",
            image: "https://media.thuonghieucongluan.vn/uploads/2018_03_13/co-bac-truc-tuyen-1520911422.jpg",
            risks: ["Thu hút giới trẻ", "Ranh giới mờ nhạt với game thường", "Rủi ro tài chính", "Cơ chế gây nghiện cao"],
            examples: ["Loot box", "Game quay thưởng", "Game bắn cá", "Game mạng xã hội", "NFT Gaming"]
        },
        {
            type: "Đầu Tư Rủi Ro Cao",
            description: "Các hoạt động đầu tư có tính chất đánh bạc, đầu cơ",
            image: "https://media.vov.vn/sites/default/files/styles/large/public/2024-04/co_bac.png",
            risks: ["Mất vốn cao", "Tâm lý FOMO", "Hệ thống Ponzi", "Đầu tư không hiểu biết"],
            examples: ["Binary Option", "Tiền số rủi ro cao", "Forex không hiểu biết", "Đầu tư đa cấp", "Đầu cơ sàn ảo"]
        }
    ];
}

function getSampleGamblingDetails() {
    return [
        {
            id: 1,
            name: "Đánh bài",
            type: "Cờ Bạc Truyền Thống",
            description: "Các loại hình đánh bài với tiền cược, phổ biến tại Việt Nam như tiến lên, phỏm, bài cào...",
            image: "https://ddk.1cdn.vn/thumbs/900x600/2024/02/29/anh-chup-man-hinh-2024-02-29-luc-09.48.07.png",
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
            image: "https://cdn-images.vtv.vn/thumb_w/640/66349b6076cb4dee98746cf1/2024/08/29/29082024--co-bac-truc-tuyen-indo-2-62393234859193999502510.png",
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
}

function getSampleGamblingStories() {
    return [
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
}

// Thêm style Google Font Roboto
function addFonts() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
    document.head.appendChild(link);
}

// Gọi hàm thêm font
addFonts(); 