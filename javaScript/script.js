console.log("DEBUG: script.js is starting to load...");
document.addEventListener('DOMContentLoaded', function() {
    // Cập nhật thời gian hiện tại (có thể bỏ nếu không cần cho trang này)
    // updateCurrentTime(); 
    // setInterval(updateCurrentTime, 60000); 
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleDarkMode);
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggle.setAttribute('aria-label', 'Chuyển sang chế độ Sáng');
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggle.setAttribute('aria-label', 'Chuyển sang chế độ Tối');
        }
    }
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href') !== "#") {
                const targetId = this.getAttribute('href');
                if (!this.dataset.bsToggle) { 
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                }
            }
        });
    });

    // Logic cho active link trên navbar khi cuộn trang (chủ yếu cho index.html)
    const navLinksObserver = document.querySelectorAll('#navbarMain .nav-link[href^="#"]:not([href="#"])');
    const sectionsObserver = document.querySelectorAll('section[id]');
    
    if (navLinksObserver.length > 0 && sectionsObserver.length > 0 && 
        (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html'))) {

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.4 
        };

        const activateLink = (id) => {
            let anyLinkActivated = false;
            navLinksObserver.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                    anyLinkActivated = true;
                }
            });
            // Nếu không có section nào active (ví dụ cuộn lên đầu cùng)
            // thì active lại Trang Chủ nếu nó tồn tại
            const homeLink = document.querySelector('#navbarMain .nav-link[href="#hero"]'); // Thay #home bằng #hero
            if (!anyLinkActivated && homeLink) {
                 homeLink.classList.add('active');
            }
        };
        
        const intersectionCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    activateLink(entry.target.id);
                }
            });
             // Fallback if no section is intersecting, activate home
            const isAnySectionIntersecting = entries.some(entry => entry.isIntersecting);
            if (!isAnySectionIntersecting) {
                const homeLink = document.querySelector('#navbarMain .nav-link[href="#hero"]');
                 if (homeLink && !homeLink.classList.contains('active')) { // Check if not already active
                    navLinksObserver.forEach(link => link.classList.remove('active')); // Deactivate others
                    homeLink.classList.add('active');
                }
            }
        };

        const observer = new IntersectionObserver(intersectionCallback, observerOptions);
        sectionsObserver.forEach(section => observer.observe(section));

        if (!window.location.hash) {
            const homeLink = document.querySelector('#navbarMain .nav-link[href="#hero"]');
            if (homeLink) homeLink.classList.add('active');
        }
    }

    // Cập nhật navbar dựa trên trạng thái đăng nhập (nếu có)
    updateNavbarBasedOnLogin(); 

    const logoutButton = document.getElementById('logoutButton'); 
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
    }
    
    // Sticky navbar on scroll
    window.addEventListener('scroll', function() {
        const header = document.getElementById('main-header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
    
    // Counter animation for stats
    const counterElements = document.querySelectorAll('.counter-value');
    if (counterElements.length > 0) {
        const isInViewport = function(elem) {
            const bounding = elem.getBoundingClientRect();
            return (
                bounding.top >= 0 &&
                bounding.left >= 0 &&
                bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        };
        
        let counted = false;
        
        function startCounters() {
            if (counted) return;
            
            const counterElement = document.querySelector('.counter-value');
            if (!counterElement) return;
            
            if (isInViewport(counterElement)) {
                counted = true;
                counterElements.forEach(counter => {
                    const targetValue = counter.getAttribute('data-count');
                    let count = 0;
                    const increment = Math.ceil(targetValue / 50);
                    const duration = 2000; // 2 seconds
                    const interval = duration / (targetValue / increment);
                    
                    const timer = setInterval(() => {
                        count += increment;
                        if (count >= targetValue) {
                            counter.textContent = targetValue;
                            clearInterval(timer);
                        } else {
                            counter.textContent = count;
                        }
                    }, interval);
                });
            }
        }
        
        // Start counters when scrolled into view
        window.addEventListener('scroll', startCounters);
        // Also check on page load
        startCounters();
    }
});

// Bỏ hoặc sửa đổi updateCurrentTime nếu không dùng
// function updateCurrentTime() {
//     const currentTimeElement = document.getElementById('current-time');
//     if (currentTimeElement) {
//         const now = new Date();
//         const hours = now.getHours().toString().padStart(2, '0');
//         const minutes = now.getMinutes().toString().padStart(2, '0');
//         currentTimeElement.textContent = `${hours}:${minutes}`;
//     }
// }

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const themeToggle = document.getElementById('theme-toggle');
    
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggle.setAttribute('aria-label', 'Chuyển sang chế độ Sáng');
    } else {
        localStorage.setItem('darkMode', 'disabled');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.setAttribute('aria-label', 'Chuyển sang chế độ Tối');
    }
}

function isLoggedIn() {
    return !!localStorage.getItem('authToken'); // Giả sử dùng authToken
}

function getUserRole() {
    return localStorage.getItem('userRole');
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userInfo'); 
    showToast('Bạn đã đăng xuất.', 'info');
    // Chuyển hướng về trang chủ hoặc trang thông tin chính
    window.location.href = 'index.html'; 
}

function updateNavbarBasedOnLogin() {
    const navLoggedInElements = document.querySelectorAll('.nav-loggedIn'); // Các li hoặc a cần hiển thị khi đăng nhập
    const navLoggedOutElements = document.querySelectorAll('.nav-loggedOut'); // Các li hoặc a cần hiển thị khi chưa đăng nhập
    const userNameDisplay = document.getElementById('user-name-display'); 
    // const navAdminLinks = document.getElementById('nav-adminLinks'); // Nếu có link admin

    if (isLoggedIn()) {
        navLoggedOutElements.forEach(el => el.classList.add('d-none'));
        navLoggedInElements.forEach(el => el.classList.remove('d-none'));
        
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userNameDisplay && userInfo) {
            userNameDisplay.textContent = userInfo.name || userInfo.email;
        }

        // if (getUserRole() === 'admin' && navAdminLinks) {
        //     navAdminLinks.classList.remove('d-none');
        // }

    } else {
        navLoggedInElements.forEach(el => el.classList.add('d-none'));
        // if (navAdminLinks) navAdminLinks.classList.add('d-none');
        navLoggedOutElements.forEach(el => el.classList.remove('d-none'));
    }
}

console.log("DEBUG: About to define showToast function.");
function showToast(message, type = 'info') {
    console.log("DEBUG: showToast called with message:", message, "type:", type);
    let toastContainer = document.getElementById('toastPlacement');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastPlacement';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = "1056"; // Đảm bảo toast trên modal (nếu có)
        document.body.appendChild(toastContainer);
    }

    let iconClass = 'fas fa-bell';
    let headerClass = 'text-primary';
    let strongText = "Thông báo";

    if (type === 'success') {
        iconClass = 'fas fa-check-circle';
        headerClass = 'text-success';
        strongText = "Thành công";
    } else if (type === 'error' || type === 'danger') {
        iconClass = 'fas fa-exclamation-circle';
        headerClass = 'text-danger';
        strongText = "Lỗi";
    } else if (type === 'warning') {
        iconClass = 'fas fa-exclamation-triangle';
        headerClass = 'text-warning';
        strongText = "Cảnh báo";
    }

    // Tạo ID duy nhất cho mỗi toast
    const toastId = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    const toastHtml = `<div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="${iconClass} me-2 ${headerClass}"></i>
                <strong class="me-auto ${headerClass}">${strongText}</strong>
                <small>Vừa xong</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>`;

    // Không cần kiểm tra existingToast với ID cố định nữa
    // vì mỗi toast giờ đã có ID riêng

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = toastHtml;
    const toastElement = tempDiv.firstChild;

    console.log("DEBUG: toastElement is:", toastElement); // THÊM DÒNG NÀY
    console.log("DEBUG: toastElement.outerHTML is:", toastElement ? toastElement.outerHTML : 'null'); 
    // THÊM DÒNG NÀY
    toastContainer.appendChild(toastElement);

    if (!toastElement || typeof toastElement.getAttribute !== 'function') { // KIỂM TRA THÊM
    console.error("ERROR: toastElement is not a valid DOM element or is null!", toastElement);
    return; // Ngăn không cho chạy new bootstrap.Toast nếu toastElement không hợp lệ
}

    const toast = new bootstrap.Toast(toastElement, { delay: 5000 }); // 5 giây
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', function () {
        toast.dispose(); // Nên dispose instance của Bootstrap trước khi remove element
        toastElement.remove();
        console.log("DEBUG: Toast removed from DOM:", toastId);
    });
    console.log("DEBUG: Toast created and shown:", toastId);
}
// console.log("DEBUG: showToast function has been defined."); // Dòng này có thể bỏ nếu không cần thiết

// HÀM TIỆN ÍCH API (Ví dụ, không dùng trực tiếp trong giao diện này trừ khi có backend)
const API_BASE_URL = '/api'; 

async function apiRequest(endpoint, method = 'GET', body = null, requiresAuth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (requiresAuth && isLoggedIn()) { 
        headers['Authorization'] = `Bearer ${localStorage.getItem('authToken')}`;
    }

    const config = { method, headers };
    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        if (response.status === 401 && requiresAuth) {
            logout(); 
            return null;
        }
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error(`API Error ${response.status}: ${errorData.message || 'Unknown error'}`);
            showToast(`Lỗi: ${errorData.message || response.statusText}`, 'error'); 
            return null;
        }
        if (response.status === 204) { // No content
             return true;
        }
        return await response.json();
    } catch (error) {
        console.error('Network or API request error:', error);
        showToast('Lỗi kết nối máy chủ. Vui lòng thử lại.', 'error');
        return null;
    }
}