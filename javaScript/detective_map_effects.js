/**
 * Detective Map Effects - Hiệu ứng bổ sung cho bản đồ
 */

document.addEventListener('DOMContentLoaded', function() {
    // Thêm hiệu ứng zoom và pan cho bản đồ
    initMapZoomPan();
    
    // Thêm hiệu ứng hover cho các điểm vụ án
    initCaseHoverEffects();
    
    // Thêm hiệu ứng particle cho bản đồ
    initMapParticles();
    
    // Thêm hiệu ứng cho vùng miền bắc
    initNorthRegionEffects();
    
    // Căn giữa tiêu đề "MIỀN BẮC" trong viền ellipse
    centerNorthRegion();
});

/**
 * Khởi tạo hiệu ứng zoom và pan cho bản đồ
 */
function initMapZoomPan() {
    const mapContainer = document.querySelector('.cases-grid');
    if (!mapContainer) return;
    
    let isZoomed = false;
    let startX, startY, startLeft, startTop;
    let isDragging = false;
    
    // Thêm nút zoom
    const zoomButton = document.createElement('button');
    zoomButton.className = 'map-zoom-button';
    zoomButton.innerHTML = '<i class="fas fa-search-plus"></i>';
    mapContainer.appendChild(zoomButton);
    
    // Sự kiện click cho nút zoom
    zoomButton.addEventListener('click', function() {
        if (!isZoomed) {
            // Zoom in
            mapContainer.classList.add('zoomed');
            zoomButton.innerHTML = '<i class="fas fa-search-minus"></i>';
            isZoomed = true;
        } else {
            // Zoom out
            mapContainer.classList.remove('zoomed');
            zoomButton.innerHTML = '<i class="fas fa-search-plus"></i>';
            isZoomed = false;
            
            // Reset vị trí
            mapContainer.style.transform = 'scale(1)';
            mapContainer.style.left = '0';
            mapContainer.style.top = '0';
        }
    });
    
    // Sự kiện mouse down
    mapContainer.addEventListener('mousedown', function(e) {
        if (!isZoomed) return;
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(document.defaultView.getComputedStyle(mapContainer).left, 10) || 0;
        startTop = parseInt(document.defaultView.getComputedStyle(mapContainer).top, 10) || 0;
        
        // Thay đổi con trỏ
        mapContainer.style.cursor = 'grabbing';
    });
    
    // Sự kiện mouse move
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        mapContainer.style.left = `${startLeft + dx}px`;
        mapContainer.style.top = `${startTop + dy}px`;
    });
    
    // Sự kiện mouse up
    document.addEventListener('mouseup', function() {
        isDragging = false;
        mapContainer.style.cursor = 'grab';
    });
}

/**
 * Khởi tạo hiệu ứng hover cho các điểm vụ án
 */
function initCaseHoverEffects() {
    const caseItems = document.querySelectorAll('.case-item');
    
    caseItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            // Highlight đường dẫn kết nối với vụ án này
            const caseId = this.getAttribute('data-case-id');
            const connectingPaths = document.querySelectorAll(`.case-path-${caseId}-`);
            connectingPaths.forEach(path => {
                path.classList.add('highlight');
            });
            
            // Highlight các đường dẫn đến vụ án này
            const incomingPaths = document.querySelectorAll(`[class*="-${caseId}"]`);
            incomingPaths.forEach(path => {
                path.classList.add('highlight');
            });
        });
        
        item.addEventListener('mouseleave', function() {
            // Remove highlight
            const highlightedPaths = document.querySelectorAll('.case-path.highlight');
            highlightedPaths.forEach(path => {
                path.classList.remove('highlight');
            });
        });
    });
}

/**
 * Khởi tạo hiệu ứng particle cho bản đồ
 */
function initMapParticles() {
    const mapContainer = document.querySelector('.cases-grid');
    if (!mapContainer) return;
    
    // Tạo container cho particles
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'map-particles';
    mapContainer.appendChild(particlesContainer);
    
    // Số lượng particles
    const particleCount = 20;
    
    // Tạo particles
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
}

/**
 * Tạo một particle
 * @param {HTMLElement} container - Container chứa particle
 */
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'map-particle';
    
    // Random vị trí
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    
    // Random kích thước
    const size = Math.random() * 5 + 1;
    
    // Random tốc độ
    const speedX = Math.random() * 0.3 - 0.15;
    const speedY = Math.random() * 0.3 - 0.15;
    
    // Random độ trong suốt
    const opacity = Math.random() * 0.5 + 0.1;
    
    // Random màu sắc
    const hue = Math.random() * 60 + 30; // Vàng đến cam
    
    // Set style
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.opacity = opacity;
    particle.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
    
    // Thêm vào container
    container.appendChild(particle);
    
    // Animation
    moveParticle(particle, speedX, speedY);
}

/**
 * Di chuyển particle
 * @param {HTMLElement} particle - Particle cần di chuyển
 * @param {number} speedX - Tốc độ theo trục X
 * @param {number} speedY - Tốc độ theo trục Y
 */
function moveParticle(particle, speedX, speedY) {
    let posX = parseFloat(particle.style.left);
    let posY = parseFloat(particle.style.top);
    
    // Hàm chuyển động
    function animate() {
        // Cập nhật vị trí
        posX += speedX;
        posY += speedY;
        
        // Kiểm tra biên
        if (posX < 0 || posX > 100) {
            speedX *= -1;
        }
        
        if (posY < 0 || posY > 100) {
            speedY *= -1;
        }
        
        // Cập nhật style
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        
        // Tiếp tục animation
        requestAnimationFrame(animate);
    }
    
    // Bắt đầu animation
    animate();
}

/**
 * Khởi tạo hiệu ứng cho vùng miền bắc
 */
function initNorthRegionEffects() {
    const mapContainer = document.querySelector('.cases-grid');
    const areaNorth = document.querySelector('.map-area-north');
    const regionNorth = document.querySelector('.region-north');
    
    if (!mapContainer || !areaNorth || !regionNorth) return;
    
    // Thêm hiệu ứng hover
    mapContainer.addEventListener('mouseover', function(e) {
        // Kiểm tra xem con trỏ chuột có nằm trong khu vực miền bắc không
        const rect = areaNorth.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        if (mouseX >= rect.left && mouseX <= rect.right && 
            mouseY >= rect.top && mouseY <= rect.bottom) {
            
            // Highlight vùng miền bắc
            areaNorth.classList.add('hover');
            regionNorth.classList.add('highlight');
            
            // Highlight các điểm trên bản đồ thuộc miền bắc
            const northCases = document.querySelectorAll('.case-item[data-case-id="1"], .case-item[data-case-id="2"], .case-item[data-case-id="3"]');
            northCases.forEach(caseItem => {
                caseItem.classList.add('region-highlight');
            });
        }
    });
    
    mapContainer.addEventListener('mouseout', function(e) {
        // Remove highlight khi di chuột ra khỏi vùng
        areaNorth.classList.remove('hover');
        regionNorth.classList.remove('highlight');
        
        const highlightedCases = document.querySelectorAll('.case-item.region-highlight');
        highlightedCases.forEach(caseItem => {
            caseItem.classList.remove('region-highlight');
        });
    });
    
    // Thêm sự kiện click để zoom vào vùng miền bắc
    regionNorth.addEventListener('click', function() {
        // Toggle highlight và zoom
        if (areaNorth.classList.contains('active')) {
            areaNorth.classList.remove('active');
            mapContainer.classList.remove('focus-north');
        } else {
            areaNorth.classList.add('active');
            mapContainer.classList.add('focus-north');
        }
    });
}

/**
 * Căn giữa tiêu đề "MIỀN BẮC" trong vùng ellipse
 */
function centerNorthRegion() {
    const areaNorth = document.querySelector('.map-area-north');
    const regionNorth = document.querySelector('.region-north');
    
    if (!areaNorth || !regionNorth) return;
    
    // Áp dụng style từ CSS và không cần thay đổi thêm gì 
    // vì đã đặt vị trí cố định trong CSS để gần với miền trung
    console.log('Đã căn chỉnh vị trí chữ "MIỀN BẮC" gần miền trung trong vùng ellipse');
} 