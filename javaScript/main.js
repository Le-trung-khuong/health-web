document.addEventListener('DOMContentLoaded', function() {
    // Xử lý navbar khi cuộn trang
    const navbar = document.querySelector('.navbar');
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarLinks = document.querySelector('.navbar-links');
    
    if (navbarToggle) {
        navbarToggle.addEventListener('click', function() {
            navbarLinks.classList.toggle('active');
            
            // Thay đổi biểu tượng khi menu được mở/đóng
            const icon = navbarToggle.querySelector('i');
            if (navbarLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Xử lý active links trong navbar
    const navLinks = document.querySelectorAll('.navbar-link a');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
    
    // Smooth scrolling cho anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (this.getAttribute('href') !== '#') {
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Đóng mobile menu khi click
                    if (navbarLinks && navbarLinks.classList.contains('active')) {
                        navbarLinks.classList.remove('active');
                    }
                    
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Tabs system
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.target;
            
            // Deactivate all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activate target tab
            button.classList.add('active');
            document.querySelector(targetTab).classList.add('active');
        });
    });
    
    // Counter animation
    const counterElements = document.querySelectorAll('.counter-value');
    let counted = false;
    
    function startCounting() {
        if (counted) return;
        
        const countersSection = document.querySelector('.counter-section');
        if (!countersSection) return;
        
        const sectionTop = countersSection.offsetTop;
        const sectionHeight = countersSection.clientHeight;
        const windowHeight = window.innerHeight;
        const scrollY = window.scrollY;
        
        if (scrollY > (sectionTop - windowHeight/1.5) && scrollY < (sectionTop + sectionHeight)) {
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
    
    // Check on scroll
    window.addEventListener('scroll', startCounting);
    // Check once on load
    startCounting();
    
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleDarkMode);
        
        // Check if dark mode was enabled previously
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('darkMode', 'disabled');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    // AOS (Animation On Scroll) - tự triển khai đơn giản
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    function checkAnimations() {
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            const animationTriggerPoint = windowHeight * 0.8;
            
            if (elementTop < animationTriggerPoint) {
                const animationType = element.dataset.aos;
                element.classList.add('aos-animate', animationType);
            }
        });
    }
    
    window.addEventListener('scroll', checkAnimations);
    window.addEventListener('resize', checkAnimations);
    
    // Check once on page load
    setTimeout(checkAnimations, 100);

    // Xử lý cho các tab đánh giá
    const assessmentTabBtns = document.querySelectorAll('.assessment-tab-btn');
    if (assessmentTabBtns.length > 0) {
        assessmentTabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                assessmentTabBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                // Hide all tab panes
                document.querySelectorAll('.assessment-tab-pane').forEach(pane => {
                    pane.style.display = 'none';
                });
                
                // Show target tab pane
                const target = this.getAttribute('data-target');
                document.getElementById(target + '-pane').style.display = 'block';
            });
        });
    }

    // Lấy các phần tử DOM
    const header = document.getElementById('main-header');
    const infoMenuToggle = document.querySelector('.info-menu-toggle');
    const circularMenu = document.querySelector('.circular-menu');
    const pageTransitionOverlay = document.querySelector('.page-transition-overlay');
    
    // Xử lý sự kiện cuộn trang để thay đổi header
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Xử lý circular menu
    if (infoMenuToggle) {
        const circularMenu = document.querySelector('.circular-menu');
        const circularMenuClose = document.querySelector('.circular-menu-close');
        const backdrop = document.querySelector('.circular-menu-backdrop');
        
        // Mở menu khi click vào nút Thông tin
        infoMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Hiện overlay chuyển trang
            if (pageTransitionOverlay) {
                pageTransitionOverlay.classList.add('active');
            }
            
            // Chuyển hướng đến trang special-info-page.html
            setTimeout(() => {
                window.location.href = 'special-info-page.html';
            }, 400);
        });
        
        // Đóng menu khi click vào nút đóng
        if (circularMenuClose) {
            circularMenuClose.addEventListener('click', function() {
                closeCircularMenu();
            });
        }
        
        // Đóng menu khi click vào backdrop
        if (backdrop) {
            backdrop.addEventListener('click', function() {
                closeCircularMenu();
            });
        }
        
        // Xử lý sự kiện click vào các mục trong circular menu
        const socialIssueLinks = document.querySelectorAll('.social-issue-circle, .center-logo');
        socialIssueLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                
                // Hiện overlay chuyển trang
                if (pageTransitionOverlay) {
                    pageTransitionOverlay.classList.add('active');
                }
                
                // Sau khi hiệu ứng hoàn tất, chuyển hướng đến trang mới
                setTimeout(() => {
                    window.location.href = href;
                }, 400);
            });
        });
        
        // Hàm đóng circular menu
        function closeCircularMenu() {
            if (circularMenu) {
                circularMenu.classList.remove('active');
            }
            if (backdrop) {
                backdrop.style.display = 'none';
            }
            document.body.style.overflow = ''; // Cho phép cuộn trang lại
        }
    }
    
    // Xử lý sự kiện khi nhấp vào liên kết trong menu
    const menuLinks = document.querySelectorAll('.navbar-link a:not(.info-menu-toggle):not(.social-issue-circle)');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Đóng menu trên thiết bị di động nếu đang mở
            if (window.innerWidth < 992) {
                navbarLinks.classList.remove('active');
                
                // Đổi lại biểu tượng
                const icon = navbarToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
            
            // Xóa lớp active từ tất cả các liên kết
            menuLinks.forEach(item => item.classList.remove('active'));
            
            // Thêm lớp active cho liên kết được nhấp vào
            this.classList.add('active');
        });
    });
    
    // Hàm hiển thị thông báo toast
    window.showToast = function(message, type = 'info') {
        // Tạo phần tử toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Thêm biểu tượng dựa vào loại thông báo
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        if (type === 'error') icon = 'times-circle';
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${icon}"></i>
                <div class="toast-message">${message}</div>
                <button class="toast-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="toast-progress"></div>
        `;
        
        // Thêm toast vào body
        document.body.appendChild(toast);
        
        // Hiển thị toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Xử lý sự kiện đóng toast
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        });
        
        // Tự động đóng toast sau 5 giây
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 5000);
    };
    
    // Kiểm tra nếu trang đang được tải từ trang khác
    if (document.referrer.includes(window.location.hostname) && pageTransitionOverlay) {
        pageTransitionOverlay.classList.add('active');
        
        // Ẩn overlay sau khi trang đã tải xong
        setTimeout(() => {
            pageTransitionOverlay.classList.remove('active');
        }, 400);
    }
    
    // Xử lý hiệu ứng counter
    const counters = document.querySelectorAll('.counter-value');
    const speed = 200;
    
    // Hàm chạy bộ đếm khi phần tử hiện ra trong viewport
    function runCounter() {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-count');
                const count = +counter.innerText;
                const increment = target / speed;
                
                if (count < target) {
                    counter.innerText = Math.ceil(count + increment);
                    setTimeout(updateCount, 1);
                } else {
                    counter.innerText = target;
                }
            };
            
            updateCount();
        });
    }
    
    // Khởi tạo AOS (Animate on Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }
    
    // Kiểm tra nếu phần tử counter có trong trang
    const counterSection = document.querySelector('.counter-section');
    if (counterSection) {
        // Kiểm tra nếu phần tử counter đã hiện ra trong viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counterSection);
    }

    // Mại dâm modal functionality
    const prostitutionModal = document.querySelector('.prostitution-modal');
    const prostitutionModalClose = document.querySelector('.prostitution-modal-close');
    const openProstitutionButtons = document.querySelectorAll('.open-prostitution-info');
    const sectionTabs = document.querySelectorAll('.section-tab');
    const preventionSection = document.querySelector('.prevention-section');
    const supportSection = document.querySelector('.support-section');
    const educationSection = document.querySelector('.education-section');
    
    // Open modal with the specified section
    if (openProstitutionButtons) {
        openProstitutionButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                showProstitutionModal(section);
            });
        });
    }
    
    // Close modal
    if (prostitutionModalClose) {
        prostitutionModalClose.addEventListener('click', function() {
            closeProstitutionModal();
        });
    }
    
    // Switch tabs
    if (sectionTabs) {
        sectionTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const section = this.getAttribute('data-section');
                switchProstitutionSection(section);
            });
        });
    }
    
    // Function to show modal with specific section
    function showProstitutionModal(section) {
        if (prostitutionModal) {
            prostitutionModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show the correct section
            switchProstitutionSection(section);
            
            // Random testimonial popup after delay
            setTimeout(showRandomTestimonial, 30000);
        }
    }
    
    // Function to close modal
    function closeProstitutionModal() {
        if (prostitutionModal) {
            prostitutionModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Function to switch between sections
    function switchProstitutionSection(section) {
        // Update tabs
        sectionTabs.forEach(tab => {
            if (tab.getAttribute('data-section') === section) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Hide all sections first
        preventionSection.classList.remove('active');
        supportSection.classList.remove('active');
        educationSection.classList.remove('active');
        
        // Show the selected section
        if (section === 'prevention') {
            preventionSection.classList.add('active');
        } else if (section === 'support') {
            supportSection.classList.add('active');
        } else if (section === 'education') {
            educationSection.classList.add('active');
        }
    }
    
    // Image comparison slider functionality
    const sliders = document.querySelectorAll('.comparison-slider');
    
    sliders.forEach(slider => {
        let isDown = false;
        
        slider.addEventListener('mousedown', () => {
            isDown = true;
        });
        
        window.addEventListener('mouseup', () => {
            isDown = false;
        });
        
        window.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            const x = e.pageX - slider.closest('.image-comparison').getBoundingClientRect().left;
            const walk = Math.max(0, Math.min(x, slider.closest('.image-comparison').offsetWidth));
            const percent = (walk / slider.closest('.image-comparison').offsetWidth) * 100;
            
            slider.style.left = `${percent}%`;
            slider.previousElementSibling.style.width = `${percent}%`;
        });
    });
    
    // Quiz functionality
    const quizOptions = document.querySelectorAll('.quiz-option');
    const checkAnswerBtn = document.querySelector('.check-answer');
    const nextQuestionBtn = document.querySelector('.next-question');
    const quizFeedback = document.querySelector('.quiz-feedback');
    
    if (quizOptions && checkAnswerBtn) {
        quizOptions.forEach(option => {
            option.addEventListener('click', function() {
                quizOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
        
        checkAnswerBtn.addEventListener('click', function() {
            const selectedOption = document.querySelector('.quiz-option.selected');
            
            if (!selectedOption) {
                quizFeedback.textContent = 'Vui lòng chọn một đáp án';
                quizFeedback.classList.add('error');
                quizFeedback.style.display = 'block';
                return;
            }
            
            const isCorrect = selectedOption.getAttribute('data-correct') === 'true';
            
            quizOptions.forEach(option => {
                const correct = option.getAttribute('data-correct') === 'true';
                
                if (option.classList.contains('selected')) {
                    option.classList.add(isCorrect ? 'correct' : 'incorrect');
                } else if (correct) {
                    option.classList.add('correct');
                }
                
                option.style.pointerEvents = 'none';
            });
            
            quizFeedback.classList.remove('error');
            quizFeedback.style.display = 'block';
            
            this.style.display = 'none';
            nextQuestionBtn.style.display = 'block';
        });
        
        if (nextQuestionBtn) {
            nextQuestionBtn.addEventListener('click', function() {
                // Reset quiz for demo purposes
                quizOptions.forEach(option => {
                    option.classList.remove('selected', 'correct', 'incorrect');
                    option.style.pointerEvents = '';
                });
                
                quizFeedback.style.display = 'none';
                checkAnswerBtn.style.display = 'block';
                this.style.display = 'none';
            });
        }
    }
    
    // Testimonial popup functionality
    const testimonialPopup = document.querySelector('.testimonial-popup');
    const testimonialClose = document.querySelector('.testimonial-close');
    
    function showRandomTestimonial() {
        if (testimonialPopup && !testimonialPopup.classList.contains('show') && Math.random() > 0.5) {
            testimonialPopup.classList.add('show');
            
            // Auto hide after 10 seconds
            setTimeout(() => {
                testimonialPopup.classList.remove('show');
            }, 10000);
        }
    }
    
    if (testimonialClose) {
        testimonialClose.addEventListener('click', function() {
            testimonialPopup.classList.remove('show');
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === prostitutionModal) {
            closeProstitutionModal();
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProstitutionModal();
            if (testimonialPopup) {
                testimonialPopup.classList.remove('show');
            }
        }
    });
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const projectsGridContainer = document.getElementById('projects-grid-container');
    
    const allProjectCards = projectsGridContainer ? Array.from(projectsGridContainer.querySelectorAll('.project-card')) : [];
    let currentProjectCards = [...allProjectCards];

    function applyFiltersAndSearch() {
        if (!projectsGridContainer) return; // Guard if container not found

        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        const selectedStatus = statusFilter ? statusFilter.value : 'all';
        const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

        currentProjectCards = allProjectCards.filter(card => {
            const cardCategory = card.dataset.category;
            const cardStatus = card.dataset.status;
            const cardText = (card.textContent || card.innerText || "").toLowerCase();

            const matchesCategory = (selectedCategory === 'all' || cardCategory === selectedCategory);
            const matchesStatus = (selectedStatus === 'all' || cardStatus === selectedStatus);
            const matchesSearch = (searchQuery === '' || cardText.includes(searchQuery));

            return matchesCategory && matchesStatus && matchesSearch;
        });
        applySort();
    }

    function applySort() {
        if (!projectsGridContainer) return;
        const criterion = sortSelect ? sortSelect.value : 'default';
        let sortedCards = [...currentProjectCards];

        if (criterion !== 'default') {
            sortedCards.sort((a, b) => {
                if (criterion === 'amount') return +b.dataset.amount - +a.dataset.amount;
                if (criterion === 'percent') return +b.dataset.percent - +a.dataset.percent;
                if (criterion === 'date') {
                    try {
                        return new Date(b.dataset.startdate) - new Date(a.dataset.startdate);
                    } catch (e) { console.error("Lỗi phân tích ngày tháng để sắp xếp:", e); return 0; }
                }
                return 0;
            });
        }
        
        projectsGridContainer.innerHTML = '';
        sortedCards.forEach(card => projectsGridContainer.appendChild(card));

        allProjectCards.forEach(card => {
            card.style.display = sortedCards.includes(card) ? '' : 'none';
        });
    }

    function startProjectCountdowns() {
        document.querySelectorAll('.project-card__countdown').forEach(el => {
            const endTimeAttr = el.dataset.end;
            if (!endTimeAttr) return;
            const endTime = new Date(endTimeAttr).getTime();
            if (isNaN(endTime)) { el.textContent = "Tg lỗi"; return; }

            const timer = setInterval(() => {
                const now = new Date().getTime();
                const distance = endTime - now;
                if (distance <= 0) {
                    el.textContent = 'Đã kết thúc'; clearInterval(timer);
                } else {
                    const d = Math.floor(distance/(1000*60*60*24));
                    const h = Math.floor((distance%(1000*60*60*24))/(1000*60*60));
                    const m = Math.floor((distance%(1000*60*60))/(1000*60));
                    const s = Math.floor((distance%(1000*60))/1000);
                    let txt = "";
                    if (d > 0) txt += `${d}n `;
                    if (h > 0 || d > 0) txt += `${h}g `;
                    if (m > 0 || h > 0 || d > 0) txt += `${m}p `;
                    txt += `${s}s`;
                    el.textContent = `Còn: ${txt.trim()}`;
                }
            }, 1000);
            el.dataset.timerId = timer;
        });
    }

    // --- XỬ LÝ MODAL & MÔ PHỎNG QUY TRÌNH QUYÊN GÓP ---
    const donationModal = document.getElementById('donationModal');
    const closeButton = donationModal?.querySelector('.close-button');
    const donationForm = document.getElementById('donationForm');
    const modalProjectTitleEl = document.getElementById('modalProjectTitle');
    const processingMessageEl = donationModal?.querySelector('.processing-message');
    let currentProjectTitleForModal = "";
    let currentDonationDetails = {};

    function openDonationModal(projectTitle) {
        if (!donationModal || !modalProjectTitleEl || !donationForm || !processingMessageEl) {
            console.error("Không tìm thấy các thành phần của modal quyên góp!");
            alert("Lỗi: Không thể mở biểu mẫu ủng hộ."); return;
        }
        currentProjectTitleForModal = projectTitle;
        modalProjectTitleEl.textContent = projectTitle;
        donationForm.reset();
        document.getElementById('donationAmount').value = '';
        processingMessageEl.style.display = 'none';
        donationForm.querySelector('button[type="submit"]').disabled = false;
        donationModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeDonationModal() {
        if (!donationModal) return;
        donationModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    if (closeButton) closeButton.addEventListener('click', closeDonationModal);
    if (donationModal) window.addEventListener('click', e => { if (e.target == donationModal) closeDonationModal(); });

    function addDonateTriggers() {
        if(!projectsGridContainer) return;
        projectsGridContainer.addEventListener('click', e => {
            const targetButton = e.target.closest('.donate-btn');
            if (targetButton) {
                e.preventDefault();
                const card = targetButton.closest('.project-card');
                const titleEl = card?.querySelector('.project-card__title a');
                const title = titleEl ? titleEl.textContent : "Dự án";
                openDonationModal(title);
            }
        });
    }

    // --- XỬ LÝ TRANG VNPAY MÔ PHỎNG ---
    const mainPageContentElements = [
        document.querySelector('.project-controls'),
        document.querySelector('.projects-section')
    ].filter(el => el != null); 

    const simulatedVnpayPageEl = document.getElementById('simulatedVnpayPage');
    const simulateVnpaySuccessBtn = document.getElementById('simulateVnpaySuccess');
    const vnpayCancelBtn = document.getElementById('vnpayCancelPayment');
    const vnpayTimerMinutesEl = document.getElementById('vnpayTimerMinutes');
    const vnpayTimerSecondsEl = document.getElementById('vnpayTimerSeconds');
    const vnpayOrderAmountDisplayEl = document.getElementById('vnpayOrderAmount');
    const vnpayBaseAmountDisplayEl = document.getElementById('vnpayBaseAmount');
    const vnpayFeeDisplayEl = document.getElementById('vnpayFee');
    const vnpayOrderIdDisplayEl = document.getElementById('vnpayOrderId');
    let vnpayCountdownInterval;

    function showSimulatedVnpayPage(orderDetails) {
        currentDonationDetails = { ...orderDetails }; 
        
        mainPageContentElements.forEach(el => el.style.display = 'none');
        if (simulatedVnpayPageEl) simulatedVnpayPageEl.style.display = 'block';
        document.body.style.overflow = 'auto';

        const baseAmount = parseFloat(currentDonationDetails.amount);
        const fee = Math.round(baseAmount * 0.0055) || 55; 
        const totalAmount = baseAmount + fee;

        currentDonationDetails.totalAmountWithFee = totalAmount;
        currentDonationDetails.fee = fee;
        currentDonationDetails.orderId = `GVN${new Date().getTime().toString().slice(-7)}`;

        if(vnpayOrderAmountDisplayEl) vnpayOrderAmountDisplayEl.innerHTML = `${new Intl.NumberFormat('vi-VN').format(totalAmount)}<sup>VND</sup>`;
        if(vnpayBaseAmountDisplayEl) vnpayBaseAmountDisplayEl.innerHTML = `${new Intl.NumberFormat('vi-VN').format(baseAmount)}<sup>VND</sup>`;
        if(vnpayFeeDisplayEl) vnpayFeeDisplayEl.innerHTML = `${new Intl.NumberFormat('vi-VN').format(fee)}<sup>VND</sup>`;
        if(vnpayOrderIdDisplayEl) vnpayOrderIdDisplayEl.textContent = currentDonationDetails.orderId;
        
        if(simulateVnpaySuccessBtn) simulateVnpaySuccessBtn.disabled = false;
        if(simulateVnpaySuccessBtn) simulateVnpaySuccessBtn.textContent = "MÔ PHỎNG THANH TOÁN THÀNH CÔNG";


        let timeLeft = 15 * 60; // 15 phút
        clearInterval(vnpayCountdownInterval);
        vnpayCountdownInterval = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(vnpayCountdownInterval);
                if (vnpayTimerMinutesEl) vnpayTimerMinutesEl.textContent = "00";
                if (vnpayTimerSecondsEl) vnpayTimerSecondsEl.textContent = "00";
                if(simulateVnpaySuccessBtn) simulateVnpaySuccessBtn.disabled = true;
                alert("Phiên thanh toán đã hết hạn.");
            } else {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                if (vnpayTimerMinutesEl) vnpayTimerMinutesEl.textContent = minutes.toString().padStart(2, '0');
                if (vnpayTimerSecondsEl) vnpayTimerSecondsEl.textContent = seconds.toString().padStart(2, '0');
                timeLeft--;
            }
        }, 1000);
    }

    function hideSimulatedVnpayPage() {
        clearInterval(vnpayCountdownInterval);
        if (simulatedVnpayPageEl) simulatedVnpayPageEl.style.display = 'none';
        mainPageContentElements.forEach(el => el.style.display = el.classList.contains('project-controls') ? 'flex' : 'block'); 
        applyFiltersAndSearch(); 
    }

    if (vnpayCancelBtn) {
        vnpayCancelBtn.addEventListener('click', () => {
            if (confirm("Bạn có chắc muốn hủy giao dịch này không?")) {
                hideSimulatedVnpayPage();
            }
        });
    }
    
    if (simulateVnpaySuccessBtn) {
        simulateVnpaySuccessBtn.addEventListener('click', function() {
            clearInterval(vnpayCountdownInterval);
            this.disabled = true;
            this.textContent = "ĐANG CHUYỂN HƯỚNG...";
            
            console.log("Mô phỏng VNPAY thành công. Dữ liệu cho trang cảm ơn:", currentDonationDetails);
            setTimeout(() => {
                const params = new URLSearchParams({
                    project: currentDonationDetails.project,
                    email: currentDonationDetails.email,
                    amount: currentDonationDetails.totalAmountWithFee,
                    method: currentDonationDetails.method,
                    orderId: currentDonationDetails.orderId
                });
                window.location.href = `thank-you.html?${params.toString()}`;
            }, 1000);
        });
    }

    if (donationForm) {
        donationForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const donorName = document.getElementById('donorName').value.trim();
            const donorEmail = document.getElementById('donorEmail').value.trim();
            const donationAmount = document.getElementById('donationAmount').value;
            const paymentMethodInput = donationForm.querySelector('input[name="paymentMethod"]:checked');
            const paymentMethod = paymentMethodInput ? paymentMethodInput.value : "vnpay"; 

            if (!donorName || !donorEmail || !donationAmount || donationAmount < 10000) {
                alert("Vui lòng điền đầy đủ thông tin. Số tiền tối thiểu là 10,000 VNĐ.");
                return;
            }

            if (processingMessageEl) processingMessageEl.style.display = 'block';
            const submitButton = donationForm.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;

            console.log("--- MÔ PHỎNG GỬI FORM QUYÊN GÓP -> ĐẾN TRANG VNPAY ---");
            const donationData = {
                project: currentProjectTitleForModal,
                email: donorEmail,
                amount: donationAmount,
                method: paymentMethod,
                donorName: donorName
            };

            setTimeout(() => {
                if (processingMessageEl) processingMessageEl.style.display = 'none';
                if (submitButton) submitButton.disabled = false;
                closeDonationModal();
                showSimulatedVnpayPage(donationData);
            }, 1500);
        });
    }

    // --- KHỞI TẠO ---
    if (categoryFilter) categoryFilter.addEventListener('change', applyFiltersAndSearch);
    if (statusFilter) statusFilter.addEventListener('change', applyFiltersAndSearch);
    if (searchInput) searchInput.addEventListener('input', applyFiltersAndSearch);
    if (sortSelect) sortSelect.addEventListener('change', applySort);

    applyFiltersAndSearch();
    startProjectCountdowns();
    addDonateTriggers();

    document.addEventListener('DOMContentLoaded', () => {
    // Lấy region từ URL ban đầu của quy.html
    const params = new URLSearchParams(window.location.search);
    const region = params.get('region') || '';

    // Lấy form để thu thập dữ liệu donor
    const form = document.getElementById('donationForm');
    const successBtn = document.getElementById('simulateVnpaySuccess');

    successBtn.addEventListener('click', () => {
      // Lấy dữ liệu từ form
      const donorName  = form.donorName.value;
      const donorEmail = form.donorEmail.value;
      const amount     = form.donationAmount.value;
      const methodEl   = form.paymentMethod;
      const method     = methodEl.value;
      // Tạo orderId giả
      const orderId    = 'ORD' + Date.now();

      // Chuyển iframe sang thank-you.html kèm params
      const query = new URLSearchParams({
        region,
        project: encodeURIComponent(document.getElementById('modalProjectTitle').textContent),
        email:   donorEmail,
        amount,
        method,
        orderId
      }).toString();

      // window.location trong iframe => đổi src của iframe
      window.location.href = `../thank-you.html?${query}`;
    });
  });

    document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('donationForm');
  form.addEventListener('submit', e => {
    e.preventDefault();

    // Ẩn modal donation, show phần VNPAY
    document.getElementById('donationModal').style.display = 'none';
    document.getElementById('simulatedVnpayPage').style.display = 'block';

    // Truyền lại region lên URL của iframe (đã có sẵn)
    iframe.src = `/html/regions/${id}.html?region=${id}`;
  });
});
});

// Thêm style cho Toast
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    .toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
    }
    .toast {
        min-width: 250px;
        background-color: white;
        color: #333;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        margin-top: 10px;
        animation: slideIn 0.3s ease forwards;
        overflow: hidden;
    }
    .toast-hiding {
        animation: slideOut 0.3s ease forwards;
    }
    .toast-header {
        display: flex;
        align-items: center;
        padding: 15px;
    }
    .toast-header i {
        margin-right: 10px;
    }
    .toast-header span {
        flex-grow: 1;
    }
    .toast-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #999;
    }
    .toast-success {
        border-left: 4px solid #2ecc71;
    }
    .toast-error {
        border-left: 4px solid #e74c3c;
    }
    .toast-info {
        border-left: 4px solid #3498db;
    }
    .toast-warning {
        border-left: 4px solid #f39c12;
    }
    .toast-success i {
        color: #2ecc71;
    }
    .toast-error i {
        color: #e74c3c;
    }
    .toast-info i {
        color: #3498db;
    }
    .toast-warning i {
        color: #f39c12;
    }
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    /* AOS animations */
    [data-aos] {
        opacity: 0;
        transition: all 0.8s ease;
    }
    .aos-animate {
        opacity: 1;
    }
    .fade-up {
        transform: translateY(30px);
    }
    .fade-up.aos-animate {
        transform: translateY(0);
    }
    .fade-right {
        transform: translateX(-30px);
    }
    .fade-right.aos-animate {
        transform: translateX(0);
    }
    .fade-left {
        transform: translateX(30px);
    }
    .fade-left.aos-animate {
        transform: translateX(0);
    }
    .zoom-in {
        transform: scale(0.9);
    }
    .zoom-in.aos-animate {
        transform: scale(1);
    }

    /* Hotline Button */
    .hotline-container {
        position: fixed;
        bottom: 30px;
        left: 30px;
        display: flex;
        align-items: center;
        z-index: 999;
    }
    
    .hotline-button {
        background-color: #e74c3c;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        text-decoration: none;
        animation: pulse 1.5s infinite;
        box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
    }
    
    .hotline-button-inner {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: #e74c3c;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 24px;
    }
    
    .hotline-content {
        background-color: white;
        color: #333;
        padding: 10px 15px;
        border-radius: 30px;
        margin-left: 10px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        font-weight: 500;
        transform: translateX(-20px);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .hotline-container:hover .hotline-content {
        transform: translateX(0);
        opacity: 1;
    }
    
    .hotline-content span {
        font-size: 1.2rem;
        font-weight: 700;
        color: #e74c3c;
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
        }
        70% {
            transform: scale(1.1);
            box-shadow: 0 0 0 15px rgba(231, 76, 60, 0);
        }
        100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
        }
    }

    /* Style for quiz banner */
    .quiz-banner {
        background: linear-gradient(135deg, var(--accent-light), var(--accent-color));
        color: white;
        box-shadow: 0 5px 15px rgba(243, 156, 18, 0.2);
    }

    /* Style for assessment cards */
    .assessment-card, .info-graphic-card {
        background-color: white;
        border-radius: 15px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.05);
        transition: all 0.3s ease;
    }

    .assessment-card:hover, .info-graphic-card:hover {
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .assessment-tab-btn {
        padding: 8px 15px;
        background-color: #f1f5f9;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .assessment-tab-btn.active {
        background-color: var(--primary-color);
        color: white;
    }

    /* Pulse button effect */
    .pulse-button {
        box-shadow: 0 0 0 0 rgba(220, 53, 69, 1);
        animation: pulse 1.5s infinite;
    }
`;

document.head.appendChild(toastStyle); 