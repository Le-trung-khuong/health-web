/**
 * Enhanced Gambling Prevention UI
 * JavaScript để thêm các hiệu ứng tương tác và thành phần động
 */

document.addEventListener('DOMContentLoaded', function() {
    // Chờ cho tất cả các tệp tài nguyên tải xong
    window.addEventListener('load', initEnhancements);
});

// Khởi tạo các tính năng nâng cao
function initEnhancements() {
    // Theo dõi khi modal cờ bạc mở
    document.addEventListener('click', function(e) {
        if (e.target.closest('.open-gambling-info')) {
            // Trì hoãn để đảm bảo modal đã hiển thị
            setTimeout(enhanceGamblingUI, 300);
        }
    });
}

// Nâng cao giao diện cờ bạc
function enhanceGamblingUI() {
    // Nếu modal đã mở
    const casinoContainer = document.querySelector('.casino-container.active');
    if (!casinoContainer) return;

    // Thêm các bong bóng nền di chuyển
    addAnimatedBackgroundBubbles();
    
    // Thêm biểu đồ thống kê
    addStatisticsGraph();
    
    // Thêm infographic
    addInfoGraphic();
    
    // Thêm sơ đồ chu kỳ nghiện
    addAddictionCycleDiagram();
    
    // Thêm các dữ kiện nổi
    addFloatingFacts();
    
    // Thêm sự kiện cho các thành phần
    addInteractionEvents();
}

// Thêm bong bóng nền di chuyển
function addAnimatedBackgroundBubbles() {
    const casinoContent = document.querySelector('.casino-content');
    if (!casinoContent) return;
    
    // Xóa các bong bóng cũ nếu có
    document.querySelectorAll('.animated-bubble').forEach(bubble => bubble.remove());
    
    // Thêm các bong bóng mới
    const bubbleCount = 12;
    
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('animated-bubble');
        
        // Kích thước ngẫu nhiên
        const size = Math.random() * 80 + 40;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Vị trí ngẫu nhiên
        bubble.style.left = `${Math.random() * 90}%`;
        bubble.style.top = `${Math.random() * 90}%`;
        
        // Độ trong suốt ngẫu nhiên
        bubble.style.opacity = `${Math.random() * 0.08 + 0.02}`;
        
        // Animation
        const animationDuration = Math.random() * 20 + 20;
        const animationDelay = Math.random() * 10;
        bubble.style.animation = `float ${animationDuration}s ease-in-out ${animationDelay}s infinite`;
        
        casinoContent.appendChild(bubble);
    }
}

// Thêm biểu đồ thống kê
function addStatisticsGraph() {
    // Kiểm tra xem đã có biểu đồ chưa
    if (document.querySelector('.graph-container')) return;
    
    const statsSection = document.querySelector('.casino-stats');
    if (!statsSection) return;
    
    const graphContainer = document.createElement('div');
    graphContainer.className = 'graph-container';
    graphContainer.innerHTML = `
        <h3 style="text-align: center; margin-bottom: 20px; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">Tỷ lệ người gặp vấn đề cờ bạc theo hình thức</h3>
        <div class="bar-graph">
            <div class="bar" style="--height: 85%">
                <span class="bar-label" style="color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); font-weight: bold;">Cá cược thể thao</span>
                <span class="bar-value" style="color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); font-weight: bold;">42%</span>
            </div>
            <div class="bar" style="--height: 60%">
                <span class="bar-label" style="color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); font-weight: bold;">Đánh bài</span>
                <span class="bar-value" style="color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); font-weight: bold;">30%</span>
            </div>
            <div class="bar" style="--height: 90%">
                <span class="bar-label" style="color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); font-weight: bold;">Cờ bạc online</span>
                <span class="bar-value" style="color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); font-weight: bold;">45%</span>
            </div>
            <div class="bar" style="--height: 70%">
                <span class="bar-label" style="color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); font-weight: bold;">Lô đề</span>
                <span class="bar-value" style="color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); font-weight: bold;">35%</span>
            </div>
            <div class="bar" style="--height: 50%">
                <span class="bar-label" style="color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); font-weight: bold;">Game có loot box</span>
                <span class="bar-value" style="color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); font-weight: bold;">25%</span>
            </div>
        </div>
    `;
    
    // Chèn sau phần thống kê
    statsSection.parentNode.insertBefore(graphContainer, statsSection.nextSibling);
}

// Thêm infographic về con số thống kê
function addInfoGraphic() {
    // Kiểm tra xem đã có infographic chưa
    if (document.querySelector('.stat-infographic')) return;
    
    const casinoGrid = document.getElementById('casino-grid');
    if (!casinoGrid) return;
    
    const infographic = document.createElement('div');
    infographic.className = 'stat-infographic';
    infographic.innerHTML = `
        <div class="info-stat">
            <div class="info-stat-icon">
                <i class="fas fa-money-bill-wave"></i>
            </div>
            <div class="info-stat-value" style="color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); font-weight: bold;">7.5%</div>
            <div class="info-stat-label" style="color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.8); font-weight: 500;">Thu nhập trung bình mất đi do cờ bạc của người nghiện</div>
        </div>
        
        <div class="info-stat">
            <div class="info-stat-icon">
                <i class="fas fa-users"></i>
            </div>
            <div class="info-stat-value" style="color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); font-weight: bold;">1/5</div>
            <div class="info-stat-label" style="color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.8); font-weight: 500;">Người nghiện cờ bạc có ý định tự tử</div>
        </div>
        
        <div class="info-stat">
            <div class="info-stat-icon">
                <i class="fas fa-chart-line"></i>
            </div>
            <div class="info-stat-value" style="color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); font-weight: bold;">40%</div>
            <div class="info-stat-label" style="color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.8); font-weight: 500;">Số người chơi game có loot box có nguy cơ trở thành người nghiện cờ bạc</div>
        </div>
    `;
    
    // Chèn trước casino-grid
    casinoGrid.parentNode.insertBefore(infographic, casinoGrid);
}

// Thêm sơ đồ chu kỳ nghiện cờ bạc
function addAddictionCycleDiagram() {
    // Kiểm tra xem đã có sơ đồ chưa
    if (document.querySelector('.diagram-container')) return;
    
    const helpSection = document.querySelector('.help-section');
    if (!helpSection) return;
    
    const diagramContainer = document.createElement('div');
    diagramContainer.className = 'diagram-container';
    diagramContainer.innerHTML = `
        <h3 class="diagram-title" style="color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">Chu kỳ nghiện cờ bạc</h3>
        <div class="cycle-diagram">
            <div class="cycle-step">
                <div class="cycle-step-icon">
                    <i class="fas fa-dice"></i>
                </div>
                <div class="cycle-step-text" style="color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.9); font-weight: bold;">Chơi và thắng lần đầu</div>
            </div>
            
            <div class="cycle-step">
                <div class="cycle-step-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="cycle-step-text" style="color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.9); font-weight: bold;">Tăng kích thích dopamine</div>
            </div>
            
            <div class="cycle-step">
                <div class="cycle-step-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="cycle-step-text" style="color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.9); font-weight: bold;">Thua lỗ và trầm cảm</div>
            </div>
            
            <div class="cycle-step">
                <div class="cycle-step-icon">
                    <i class="fas fa-redo"></i>
                </div>
                <div class="cycle-step-text" style="color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.9); font-weight: bold;">Tiếp tục chơi để gỡ gạc</div>
            </div>
        </div>
    `;
    
    // Chèn trước phần help
    helpSection.parentNode.insertBefore(diagramContainer, helpSection);
}

// Thêm các dữ kiện nổi
function addFloatingFacts() {
    // Kiểm tra xem đã có facts chưa
    if (document.querySelector('.floating-fact')) return;
    
    const helpSection = document.querySelector('.help-section');
    if (!helpSection) return;
    
    const factsContainer = document.createElement('div');
    factsContainer.className = 'facts-container';
    factsContainer.innerHTML = `
        <div class="floating-fact" style="background: rgba(231, 76, 60, 0.3);">
            <div class="fact-icon">
                <i class="fas fa-exclamation"></i>
            </div>
            <div class="fact-content">
                <p style="color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.7); font-weight: 500;">Cờ bạc trực tuyến có tỷ lệ nghiện cao gấp 3 lần so với cờ bạc truyền thống do tính dễ tiếp cận 24/7.</p>
            </div>
        </div>
        
        <div class="floating-fact" style="background: rgba(231, 76, 60, 0.3);">
            <div class="fact-icon">
                <i class="fas fa-exclamation"></i>
            </div>
            <div class="fact-content">
                <p style="color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.7); font-weight: 500;">Các game có loot box được nhiều chuyên gia xem như một hình thức cờ bạc trá hình nhắm vào giới trẻ.</p>
            </div>
        </div>
        
        <div class="floating-fact" style="background: rgba(231, 76, 60, 0.3);">
            <div class="fact-icon">
                <i class="fas fa-exclamation"></i>
            </div>
            <div class="fact-content">
                <p style="color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.7); font-weight: 500;">Cờ bạc kích hoạt cùng vùng não liên quan đến các chất gây nghiện như ma túy và rượu.</p>
            </div>
        </div>
    `;
    
    // Chèn sau diagram
    const diagramContainer = document.querySelector('.diagram-container');
    if (diagramContainer) {
        diagramContainer.parentNode.insertBefore(factsContainer, diagramContainer.nextSibling);
    } else {
        helpSection.parentNode.insertBefore(factsContainer, helpSection);
    }
}

// Thêm sự kiện tương tác
function addInteractionEvents() {
    // Thêm hiệu ứng hover cho các phần tử
    document.querySelectorAll('.casino-card, .stat-card, .floating-fact, .info-stat, .cycle-step').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = this.className.includes('cycle-step') ? 'scale(1.05)' : 'translateY(-10px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // Thêm hiệu ứng click để mở thông tin chi tiết
    document.querySelectorAll('.floating-fact').forEach(fact => {
        fact.addEventListener('click', function() {
            // Hiệu ứng nhấp nháy khi click
            this.style.animation = 'none';
            this.offsetHeight; // Trigger reflow
            this.style.animation = 'pulse 0.5s';
            
            // Có thể thêm hiệu ứng mở rộng thông tin chi tiết ở đây
        });
    });
}

// Thêm sự kiện theo dõi việc mở modal chi tiết
document.addEventListener('click', function(e) {
    // Nếu click vào thẻ cờ bạc để mở chi tiết
    if (e.target.closest('.casino-card')) {
        // Trì hoãn để đảm bảo modal đã mở
        setTimeout(function() {
            const detailModal = document.querySelector('.casino-detail-modal.active');
            if (detailModal) {
                enhanceDetailModal(detailModal);
            }
        }, 300);
    }
});

// Nâng cao modal chi tiết
function enhanceDetailModal(modal) {
    // Thêm các hiệu ứng cho modal chi tiết
    const detailContent = modal.querySelector('#casino-detail-content');
    if (!detailContent) return;
    
    // Thêm bong bóng nền
    addDetailModalBubbles(modal);
    
    // Thêm hiệu ứng hover cho hình ảnh
    const detailImage = modal.querySelector('.detail-image');
    if (detailImage) {
        detailImage.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        detailImage.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    }
}

// Thêm bong bóng nền cho modal chi tiết
function addDetailModalBubbles(modal) {
    const detailContent = modal.querySelector('.casino-detail-content');
    if (!detailContent) return;
    
    // Xóa các bong bóng cũ nếu có
    detailContent.querySelectorAll('.animated-bubble').forEach(bubble => bubble.remove());
    
    // Thêm bong bóng mới
    const bubbleCount = 8;
    
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('animated-bubble');
        
        // Kích thước ngẫu nhiên
        const size = Math.random() * 60 + 30;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Vị trí ngẫu nhiên
        bubble.style.left = `${Math.random() * 90}%`;
        bubble.style.top = `${Math.random() * 90}%`;
        
        // Độ trong suốt ngẫu nhiên
        bubble.style.opacity = `${Math.random() * 0.08 + 0.02}`;
        
        // Animation
        const animationDuration = Math.random() * 15 + 15;
        const animationDelay = Math.random() * 8;
        bubble.style.animation = `float ${animationDuration}s ease-in-out ${animationDelay}s infinite`;
        
        detailContent.appendChild(bubble);
    }
} 