// JavaScript for Prostitution Modal
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xem main.js đã xử lý modal này chưa
    const mainJsHandled = typeof window.prostitutionModalInitialized !== 'undefined' && window.prostitutionModalInitialized;
    
    // Nếu main.js đã xử lý, không thực hiện các bước khởi tạo nữa
    if (mainJsHandled) {
        console.log('Prostitution modal already initialized in main.js');
        return;
    }
    
    // Đánh dấu là đã khởi tạo
    window.prostitutionModalInitialized = true;
    
    // Lấy tất cả các phần tử cần thiết
    const prostitutionModal = document.querySelector('.prostitution-modal');
    const prostitutionModalClose = document.querySelector('.prostitution-modal-close');
    const openButtons = document.querySelectorAll('.open-prostitution-info');
    const sectionTabs = document.querySelectorAll('.section-tab');
    
    // Kiểm tra nếu không tìm thấy modal
    if (!prostitutionModal) {
        console.error('Prostitution modal not found in the document');
        return;
    }
    
    // Thêm các tab mới cho các phần nội dung mới
    const tabsContainer = document.querySelector('.section-tabs');
    if (tabsContainer) {
        // Thêm tab cho phần Các hình thức
        const formsTab = document.createElement('div');
        formsTab.className = 'section-tab';
        formsTab.setAttribute('data-section', 'forms');
        formsTab.innerHTML = '<i class="fas fa-th-list"></i> Các Hình Thức';
        tabsContainer.appendChild(formsTab);
        
        // Thêm tab cho phần Tác hại
        const effectsTab = document.createElement('div');
        effectsTab.className = 'section-tab';
        effectsTab.setAttribute('data-section', 'effects');
        effectsTab.innerHTML = '<i class="fas fa-exclamation-circle"></i> Tác Hại';
        tabsContainer.appendChild(effectsTab);
        
        // Thêm tab cho phần Pháp luật
        const legalTab = document.createElement('div');
        legalTab.className = 'section-tab';
        legalTab.setAttribute('data-section', 'legal');
        legalTab.innerHTML = '<i class="fas fa-gavel"></i> Pháp Luật';
        tabsContainer.appendChild(legalTab);
    }
    
    // Tạo các phần nội dung mới
    const modalBody = document.querySelector('.prostitution-modal-body');
    if (modalBody) {
        // Tạo phần Các hình thức
        const formsSection = document.createElement('div');
        formsSection.className = 'forms-section';
        modalBody.appendChild(formsSection);
        
        // Tạo phần Tác hại
        const effectsSection = document.createElement('div');
        effectsSection.className = 'effects-section';
        modalBody.appendChild(effectsSection);
        
        // Tạo phần Pháp luật
        const legalSection = document.createElement('div');
        legalSection.className = 'legal-section';
        modalBody.appendChild(legalSection);
    }
    
    // Cập nhật đối tượng sections với các phần mới
    const sections = {
        prevention: document.querySelector('.prevention-section'),
        support: document.querySelector('.support-section'),
        education: document.querySelector('.education-section'),
        forms: document.querySelector('.forms-section'),
        effects: document.querySelector('.effects-section'),
        legal: document.querySelector('.legal-section')
    };
    
    // Mở modal khi click vào các nút "Mại dâm"
    openButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Mở modal
            openModal();
            
            // Chuyển đến section được chỉ định (nếu có)
            const section = this.getAttribute('data-section');
            if (section && sections[section]) {
                changeSection(section);
            }
        });
    });
    
    // Đóng modal khi click vào nút đóng
    prostitutionModalClose.addEventListener('click', closeModal);
    
    // Đóng modal khi click vào nền ngoài modal
    prostitutionModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // Đóng modal khi nhấn ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && prostitutionModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Chuyển đổi giữa các section khi click vào tabs
    document.querySelectorAll('.section-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            changeSection(section);
        });
    });
    
    // Hàm mở modal
    function openModal() {
        document.body.style.overflow = 'hidden'; // Ngăn scroll trang
        prostitutionModal.classList.add('active');
        
        // Mặc định hiển thị section đầu tiên
        if (!document.querySelector('.section-tab.active')) {
            changeSection('prevention');
        }
        
        // Thêm hiệu ứng đặc biệt khi mở modal
        addSpecialEffects();
        
        // Render các phần nội dung mới
        renderFormSection();
        renderEffectsSection();
        renderLegalSection();
    }
    
    // Hàm đóng modal
    function closeModal() {
        document.body.style.overflow = ''; // Khôi phục scroll trang
        prostitutionModal.classList.remove('active');
    }
    
    // Hàm chuyển section
    function changeSection(sectionName) {
        // Bỏ active khỏi tất cả tabs và sections
        document.querySelectorAll('.section-tab').forEach(tab => tab.classList.remove('active'));
        Object.values(sections).forEach(section => {
            if (section) section.classList.remove('active');
        });
        
        // Thêm active vào tab và section được chọn
        const selectedTab = document.querySelector(`.section-tab[data-section="${sectionName}"]`);
        if (selectedTab) selectedTab.classList.add('active');
        
        const selectedSection = sections[sectionName];
        if (selectedSection) {
            selectedSection.classList.add('active');
            
            // Cuộn lên đầu của modal content khi chuyển section
            const modalContent = document.querySelector('.prostitution-modal-content');
            if (modalContent) modalContent.scrollTop = 0;
            
            // Khởi tạo lại hiệu ứng flip cards nếu đang ở phần forms
            if (sectionName === 'forms') {
                setTimeout(() => setupFlipCards(), 100);
            }
        }
    }
    
    // Thêm hiệu ứng đặc biệt cho modal
    function addSpecialEffects() {
        // Hiệu ứng trượt bảng so sánh hình ảnh
        setupImageComparison();
        
        // Thiết lập quiz
        setupQuiz();
        
        // Thiết lập sự kiện cho testimonial
        setupTestimonial();
        
        // Thiết lập các hiệu ứng mới
        setTimeout(() => setupFlipCards(), 100);
        setupEffectTabs();
        setupAccordion();
        setupStatisticCounters();
    }
    
    // Thiết lập chức năng trượt so sánh hình ảnh
    function setupImageComparison() {
        const comparisonContainers = document.querySelectorAll('.image-comparison');
        
        comparisonContainers.forEach(container => {
            const slider = container.querySelector('.comparison-slider');
            const beforeImage = container.querySelector('.before-image');
            const afterImage = container.querySelector('.after-image');
            
            if (!slider || !beforeImage || !afterImage) return;
            
            let isActive = false;
            
            // Xử lý sự kiện chuột
            slider.addEventListener('mousedown', function() {
                isActive = true;
            });
            
            window.addEventListener('mouseup', function() {
                isActive = false;
            });
            
            container.addEventListener('mousemove', function(e) {
                if (!isActive) return;
                
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = (x / rect.width) * 100;
                
                // Giới hạn phạm vi 0-100%
                const limitedPercentage = Math.max(0, Math.min(100, percentage));
                
                // Cập nhật vị trí slider và clip-path
                slider.style.left = `${limitedPercentage}%`;
                afterImage.style.clipPath = `polygon(0 0, ${limitedPercentage}% 0, ${limitedPercentage}% 100%, 0 100%)`;
            });
            
            // Xử lý sự kiện cảm ứng cho thiết bị di động
            slider.addEventListener('touchstart', function() {
                isActive = true;
            });
            
            window.addEventListener('touchend', function() {
                isActive = false;
            });
            
            container.addEventListener('touchmove', function(e) {
                if (!isActive) return;
                
                const rect = container.getBoundingClientRect();
                const touch = e.touches[0];
                const x = touch.clientX - rect.left;
                const percentage = (x / rect.width) * 100;
                
                // Giới hạn phạm vi 0-100%
                const limitedPercentage = Math.max(0, Math.min(100, percentage));
                
                // Cập nhật vị trí slider và clip-path
                slider.style.left = `${limitedPercentage}%`;
                afterImage.style.clipPath = `polygon(0 0, ${limitedPercentage}% 0, ${limitedPercentage}% 100%, 0 100%)`;
                
                // Ngăn cuộn trang khi đang di chuyển slider
                e.preventDefault();
            });
        });
    }
    
    // Thiết lập chức năng quiz
    function setupQuiz() {
        const quizContainers = document.querySelectorAll('.quiz-container');
        
        quizContainers.forEach(quiz => {
            const options = quiz.querySelectorAll('.quiz-option');
            const feedback = quiz.querySelector('.quiz-feedback');
            const checkAnswerBtn = quiz.querySelector('.check-answer');
            const nextQuestionBtn = quiz.querySelector('.next-question');
            
            if (!options.length || !feedback || !checkAnswerBtn) return;
            
            // Sự kiện khi click vào option
            options.forEach(option => {
                option.addEventListener('click', function() {
                    // Bỏ chọn tất cả các options
                    options.forEach(opt => opt.classList.remove('selected'));
                    
                    // Chọn option hiện tại
                    this.classList.add('selected');
                });
            });
            
            // Sự kiện khi click vào nút kiểm tra đáp án
            checkAnswerBtn.addEventListener('click', function() {
                const selectedOption = quiz.querySelector('.quiz-option.selected');
                
                if (!selectedOption) {
                    // Nếu chưa chọn đáp án
                    feedback.textContent = 'Vui lòng chọn một đáp án trước khi kiểm tra.';
                    feedback.style.display = 'block';
                    return;
                }
                
                // Xác định đáp án đúng/sai
                const isCorrect = selectedOption.getAttribute('data-correct') === 'true';
                
                // Hiển thị kết quả
                options.forEach(option => {
                    option.classList.remove('correct', 'incorrect');
                    
                    if (option.getAttribute('data-correct') === 'true') {
                        option.classList.add('correct');
                    } else if (option === selectedOption && !isCorrect) {
                        option.classList.add('incorrect');
                    }
                });
                
                // Hiển thị phản hồi
                feedback.style.display = 'block';
                
                // Hiện nút câu hỏi tiếp theo (nếu có)
                if (nextQuestionBtn) {
                    nextQuestionBtn.style.display = 'block';
                }
            });
            
            // Sự kiện khi click vào nút câu hỏi tiếp theo
            if (nextQuestionBtn) {
                nextQuestionBtn.addEventListener('click', function() {
                    // Tạo câu hỏi mới (hoặc xử lý logic tuỳ ứng dụng)
                    // Ở đây chỉ reset quiz hiện tại để demo
                    options.forEach(option => {
                        option.classList.remove('selected', 'correct', 'incorrect');
                    });
                    
                    feedback.style.display = 'none';
                    nextQuestionBtn.style.display = 'none';
                });
            }
        });
    }
    
    // Thiết lập chức năng testimonial
    function setupTestimonial() {
        const testimonialReadMoreButtons = document.querySelectorAll('.testimonial-read-more');
        const testimonialPopup = document.querySelector('.testimonial-popup');
        const testimonialClose = document.querySelector('.testimonial-close');
        
        if (!testimonialPopup || !testimonialClose) return;
        
        // Mở popup khi click vào nút "Đọc thêm"
        testimonialReadMoreButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                testimonialPopup.classList.add('active');
            });
        });
        
        // Đóng popup khi click vào nút đóng
        testimonialClose.addEventListener('click', function() {
            testimonialPopup.classList.remove('active');
        });
        
        // Đóng popup khi click vào nền ngoài popup
        testimonialPopup.addEventListener('click', function(e) {
            if (e.target === this) {
                testimonialPopup.classList.remove('active');
            }
        });
    }
    
    // Hình ảnh cho các hình thức mại dâm
    const formImages = {
        "Mại dâm truyền thống": "https://img.freepik.com/free-vector/red-light-district-amsterdam-at-night_107791-11508.jpg",
        "Mại dâm online": "https://img.freepik.com/free-photo/dating-site-app-laptop-mobile-phone-3d-rendering_123827-22799.jpg",
        "Mại dâm trá hình": "https://img.freepik.com/free-photo/massage-room-spa-salon_1150-12316.jpg",
        "Buôn bán người": "https://img.freepik.com/free-photo/woman-hands-holding-chain-human-trafficking-concept_23-2148068936.jpg",
        "Du lịch tình dục": "https://img.freepik.com/free-photo/young-woman-with-suitcase-airport_1303-16456.jpg",
        "Mại dâm trẻ vị thành niên": "https://img.freepik.com/free-photo/silhouette-sad-lonely-boy_53876-31021.jpg"
    };
    
    // Render phần Các hình thức mại dâm
    function renderFormSection() {
        if (!sections.forms) return;
        
        sections.forms.innerHTML = `
            <div class="info-block">
                <h4><i class="fas fa-th-list"></i> Các Hình Thức Mại Dâm</h4>
                <p class="info-text">Mại dâm tồn tại dưới nhiều hình thức khác nhau, mỗi hình thức đều có những rủi ro và hậu quả riêng:</p>
                
                <div class="form-cards">
                    ${prostitutionData.forms.map(form => `
                        <div class="form-card">
                            <div class="form-card-inner">
                                <div class="form-card-front">
                                    <div class="form-card-background" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 12px; background: url('${formImages[form.title] || "https://via.placeholder.com/300"}') center/cover; opacity: 0.2; z-index: 0;"></div>
                                    <div class="form-card-icon">
                                        <i class="fas ${form.icon}"></i>
                                    </div>
                                    <h5>${form.title}</h5>
                                    <p class="form-stats">${form.statistics || ""}</p>
                                    <button class="flip-btn" type="button"><i class="fas fa-info-circle"></i> Xem chi tiết</button>
                                </div>
                                <div class="form-card-back">
                                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 40%; border-radius: 12px 12px 0 0; overflow: hidden;">
                                        <img src="${formImages[form.title] || "https://via.placeholder.com/300"}" style="width: 100%; height: 100%; object-fit: cover;" alt="${form.title}">
                                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(46, 49, 65, 1))"></div>
                                    </div>
                                    <div style="margin-top: 40%; padding: 10px; overflow-y: auto; max-height: 220px;">
                                        <h5>${form.title}</h5>
                                        <p>${form.description}</p>
                                        
                                        ${form.examples ? `
                                        <div class="detail-section">
                                            <h6><i class="fas fa-list"></i> Ví dụ</h6>
                                            <p>${form.examples}</p>
                                        </div>` : ''}
                                        
                                        ${form.locations ? `
                                        <div class="detail-section">
                                            <h6><i class="fas fa-map-marker-alt"></i> Khu vực</h6>
                                            <p>${form.locations}</p>
                                        </div>` : ''}
                                        
                                        <div class="risk-box">
                                            <h6><i class="fas fa-exclamation-triangle"></i> Rủi ro</h6>
                                            <p>${form.risks}</p>
                                        </div>
                                        
                                        ${form.identifiers && form.identifiers.length > 0 ? `
                                        <div class="identifiers-section">
                                            <h6><i class="fas fa-search"></i> Dấu hiệu nhận biết</h6>
                                            <ul class="identifiers-list">
                                                ${form.identifiers.map(id => `<li>${id}</li>`).join('')}
                                            </ul>
                                        </div>` : ''}
                                        
                                        <button class="flip-btn" type="button"><i class="fas fa-arrow-left"></i> Quay lại</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="info-block">
                <h4><i class="fas fa-chart-pie"></i> Thống Kê Về Mại Dâm</h4>
                <p class="info-text">Dữ liệu thống kê cho thấy những thực tế đáng báo động về mại dâm:</p>
                
                <div class="statistics-container">
                    ${prostitutionData.statistics.map(stat => `
                        <div class="statistic-item">
                            <div class="statistic-icon">
                                <i class="fas ${stat.icon}"></i>
                            </div>
                            <div class="statistic-value">${stat.value}</div>
                            <div class="statistic-label">${stat.label}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="info-block">
                <h4><i class="fas fa-question-circle"></i> Câu Hỏi Thường Gặp</h4>
                <div class="faq-accordion">
                    ${prostitutionData.faqs.map((faq, index) => `
                        <div class="faq-item">
                            <div class="faq-question">
                                <i class="faq-icon fas fa-plus"></i>
                                ${faq.question}
                            </div>
                            <div class="faq-answer">
                                ${faq.answer}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Gắn sự kiện ngay sau khi nội dung được render
        setTimeout(() => setupFlipCards(), 100);
    }
    
    // Render phần Tác hại
    function renderEffectsSection() {
        if (!sections.effects) return;
        
        sections.effects.innerHTML = `
            <div class="info-block">
                <h4><i class="fas fa-exclamation-circle"></i> Tác Hại Của Mại Dâm</h4>
                <p class="info-text">Mại dâm gây ra nhiều tác hại nghiêm trọng trên nhiều khía cạnh:</p>
                
                <div class="effects-tabs">
                    <div class="effects-tab-buttons">
                        <button class="effects-tab-btn active" data-tab="physical">
                            <i class="fas fa-heartbeat"></i> Sức Khỏe Thể Chất
                        </button>
                        <button class="effects-tab-btn" data-tab="mental">
                            <i class="fas fa-brain"></i> Sức Khỏe Tâm Thần
                        </button>
                        <button class="effects-tab-btn" data-tab="social">
                            <i class="fas fa-users"></i> Xã Hội
                        </button>
                        <button class="effects-tab-btn" data-tab="economic">
                            <i class="fas fa-dollar-sign"></i> Kinh Tế
                        </button>
                    </div>
                    
                    <div class="effects-tab-content">
                        <div class="effects-tab-pane active" id="physical-tab">
                            <div class="effects-image-wrapper">
                                <img src="https://images2.thanhnien.vn/528068263637045248/2024/2/6/9-dau-lung-shutterstock-1707220828487688756399.png" alt="Tác hại sức khỏe">
                                <div class="effects-overlay"></div>
                            </div>
                            <ul class="effects-list">
                                ${prostitutionData.effects.physical.map(effect => `<li>${effect}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="effects-tab-pane" id="mental-tab">
                            <div class="effects-image-wrapper">
                                <img src="https://cdn.tgdd.vn//News/1541344//ngu-nhieu-co-tot-khong-18-tac-hai-voi-co-the-6-800x450.jpg" alt="Tác hại tâm lý">
                                <div class="effects-overlay"></div>
                            </div>
                            <ul class="effects-list">
                                ${prostitutionData.effects.mental.map(effect => `<li>${effect}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="effects-tab-pane" id="social-tab">
                            <div class="effects-image-wrapper">
                                <img src="https://cdn.24h.com.vn//upload/3-2020/images/2020-07-13/1594644291-197-thumbnail-width640height480.jpg" alt="Tác hại xã hội">
                                <div class="effects-overlay"></div>
                            </div>
                            <ul class="effects-list">
                                ${prostitutionData.effects.social.map(effect => `<li>${effect}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="effects-tab-pane" id="economic-tab">
                            <div class="effects-image-wrapper">
                                <img src="https://vinuni.edu.vn/wp-content/uploads/2024/08/khung-hoang-kinh-te-la-gi-phan-tich-bieu-hien-nguyen-nhan-va-hau-qua.jpg" alt="Tác hại kinh tế">
                                <div class="effects-overlay"></div>
                            </div>
                            <ul class="effects-list">
                                ${prostitutionData.effects.economic.map(effect => `<li>${effect}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="info-block">
                <h4><i class="fas fa-hand-holding-heart"></i> Tổ Chức Hỗ Trợ</h4>
                <p class="info-text">Các tổ chức dưới đây cung cấp hỗ trợ cho người muốn thoát khỏi mại dâm:</p>
                
                <div class="support-organizations">
                    ${prostitutionData.supportOrganizations.map(org => `
                        <div class="org-card">
                            <h5>${org.name}</h5>
                            <p>${org.description}</p>
                            <div class="org-contacts">
                                <a href="tel:${org.phone}" class="org-phone">
                                    <i class="fas fa-phone-alt"></i> ${org.phone}
                                </a>
                                <a href="${org.website}" target="_blank" class="org-website">
                                    <i class="fas fa-globe"></i> Website
                                </a>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Render phần Pháp luật
    function renderLegalSection() {
        if (!sections.legal) return;
        
        sections.legal.innerHTML = `
            <div class="info-block">
                <h4><i class="fas fa-gavel"></i> Quan Điểm Pháp Luật Việt Nam</h4>
                <p class="info-text">${prostitutionData.legalPerspective.perspective}</p>
                
                <div class="legal-framework">
                    <h5><i class="fas fa-balance-scale"></i> Khung Pháp Lý</h5>
                    <div class="legal-laws">
                        ${prostitutionData.legalPerspective.laws.map(law => `
                            <div class="law-card">
                                <h6>${law.title}</h6>
                                <p>${law.content}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="info-block">
                <h4><i class="fas fa-exclamation-triangle"></i> Hình Phạt Theo Quy Định</h4>
                <div class="penalties-container">
                    <div class="penalty-card">
                        <div class="penalty-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <h5>Người Mua Dâm</h5>
                        <p>${prostitutionData.legalPerspective.penalties.buyers}</p>
                    </div>
                    
                    <div class="penalty-card">
                        <div class="penalty-icon">
                            <i class="fas fa-sitemap"></i>
                        </div>
                        <h5>Người Tổ Chức</h5>
                        <p>${prostitutionData.legalPerspective.penalties.organizers}</p>
                    </div>
                    
                    <div class="penalty-card">
                        <div class="penalty-icon">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <h5>Người Môi Giới</h5>
                        <p>${prostitutionData.legalPerspective.penalties.brokers}</p>
                    </div>
                    
                    <div class="penalty-card">
                        <div class="penalty-icon">
                            <i class="fas fa-fist-raised"></i>
                        </div>
                        <h5>Người Cưỡng Bức</h5>
                        <p>${prostitutionData.legalPerspective.penalties.coercers}</p>
                    </div>
                </div>
            </div>
            
            <div class="info-block">
                <h4><i class="fas fa-hand-paper"></i> Hỗ Trợ Pháp Lý</h4>
                <p class="info-text">Nếu bạn cần hỗ trợ pháp lý liên quan đến các vấn đề mại dâm, buôn người hoặc xâm hại tình dục:</p>
                
                <div class="legal-support">
                    <div class="legal-support-item">
                        <div class="legal-support-icon">
                            <i class="fas fa-phone-alt"></i>
                        </div>
                        <h5>Tổng đài trợ giúp pháp lý</h5>
                        <p>Gọi số <a href="tel:19001234">1900 1234</a> để được tư vấn pháp lý miễn phí.</p>
                    </div>
                    
                    <div class="legal-support-item">
                        <div class="legal-support-icon">
                            <i class="fas fa-balance-scale"></i>
                        </div>
                        <h5>Trung tâm trợ giúp pháp lý</h5>
                        <p>Có mặt tại tất cả các tỉnh thành, cung cấp tư vấn và hỗ trợ pháp lý miễn phí cho người thuộc diện chính sách.</p>
                    </div>
                    
                    <div class="legal-support-item">
                        <div class="legal-support-icon">
                            <i class="fas fa-user-shield"></i>
                        </div>
                        <h5>Đường dây nóng phòng chống mua bán người</h5>
                        <p>Gọi số <a href="tel:111">111</a> để báo cáo hoặc tìm kiếm hỗ trợ về các vụ việc buôn bán người.</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Thiết lập flip cards
    function setupFlipCards() {
        console.log('Setting up flip cards...');
        const flipButtons = document.querySelectorAll('.flip-btn');
        console.log(`Found ${flipButtons.length} flip buttons`);
        
        // Xóa event listeners cũ để tránh trùng lặp
        flipButtons.forEach(button => {
            button.removeEventListener('click', handleFlipButtonClick);
            button.addEventListener('click', handleFlipButtonClick);
        });
        
        // Thêm hiệu ứng hover 3D cho các thẻ
        const formCards = document.querySelectorAll('.form-card');
        console.log(`Found ${formCards.length} form cards`);
        
        formCards.forEach(formCard => {
            formCard.removeEventListener('mousemove', handleCardMouseMove);
            formCard.removeEventListener('mouseleave', handleCardMouseLeave);
            
            formCard.addEventListener('mousemove', handleCardMouseMove);
            formCard.addEventListener('mouseleave', handleCardMouseLeave);
        });
        
        // Thêm style mới cho hiệu ứng lật thẻ bài
        addCardFlipStyles();
    }
    
    // Xử lý sự kiện click vào nút lật thẻ
    function handleFlipButtonClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Tìm thẻ cha là form-card-inner
        const card = this.closest('.form-card-inner');
        console.log(`Button clicked, card:`, card);
        
        if (card) {
            // Thêm hiệu ứng rung nhẹ trước khi lật
            card.classList.add('card-shake');
            
            // Phát âm thanh khi lật thẻ
            playFlipSound();
            
            // Lật thẻ sau một khoảng thời gian ngắn để hiệu ứng rung hoàn thành
            setTimeout(() => {
                card.classList.remove('card-shake');
                card.classList.toggle('flipped');
                console.log(`Card flipped, has class 'flipped': ${card.classList.contains('flipped')}`);
                
                // Thêm hiệu ứng tỏa sáng khi lật
                if (card.classList.contains('flipped')) {
                    addGlowEffect(card);
                }
            }, 150);
        } else {
            console.error('Card parent not found for button:', this);
        }
    }
    
    // Xử lý sự kiện di chuột qua thẻ
    function handleCardMouseMove(e) {
        const card = this.querySelector('.form-card-inner');
        if (card && !card.classList.contains('flipped')) {
            // Tính toán vị trí chuột tương đối so với thẻ
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left; // vị trí X của chuột trong thẻ
            const y = e.clientY - rect.top; // vị trí Y của chuột trong thẻ
            
            // Tính góc nghiêng dựa trên vị trí chuột
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateY = ((x - centerX) / centerX) * 10; // tối đa 10 độ nghiêng
            const rotateX = ((centerY - y) / centerY) * 10; // tối đa 10 độ nghiêng
            
            // Áp dụng hiệu ứng 3D
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        }
    }
    
    // Xử lý sự kiện di chuột ra ngoài thẻ
    function handleCardMouseLeave() {
        const card = this.querySelector('.form-card-inner');
        if (card && !card.classList.contains('flipped')) {
            // Đưa về trạng thái ban đầu khi di chuột ra ngoài
            card.style.transform = '';
            card.style.transition = 'transform 0.5s ease';
            
            // Xóa transition sau khi hoàn thành để không ảnh hưởng đến hiệu ứng lật
            setTimeout(() => {
                if (!card.classList.contains('flipped')) {
                    card.style.transition = '';
                }
            }, 500);
        }
    }
    
    // Thêm style cho hiệu ứng lật thẻ bài
    function addCardFlipStyles() {
        if (!document.querySelector('#card-flip-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'card-flip-styles';
            styleElement.textContent = `
                /* Hiệu ứng ánh sáng và animation */
                @keyframes glow-pulse {
                    0% { opacity: 0; box-shadow: 0 0 5px 0px rgba(155, 89, 182, 0.5); }
                    50% { opacity: 1; box-shadow: 0 0 20px 5px rgba(155, 89, 182, 0.7); }
                    100% { opacity: 0; box-shadow: 0 0 5px 0px rgba(155, 89, 182, 0.5); }
                }
                
                @keyframes card-shake {
                    0% { transform: translateX(0) rotateY(0); }
                    20% { transform: translateX(-5px) rotateY(-15deg); }
                    40% { transform: translateX(5px) rotateY(15deg); }
                    60% { transform: translateX(-3px) rotateY(-5deg); }
                    80% { transform: translateX(3px) rotateY(5deg); }
                    100% { transform: translateX(0) rotateY(0); }
                }
                
                @keyframes shine {
                    0% {
                        left: -100%;
                        opacity: 0;
                    }
                    20% {
                        opacity: 0.8;
                    }
                    100% {
                        left: 100%;
                        opacity: 0;
                    }
                }
                
                /* Các styles quan trọng cho hiệu ứng lật thẻ */
                .form-card {
                    perspective: 1500px !important;
                }
                
                .form-card-inner {
                    transform-style: preserve-3d !important;
                    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
                    position: relative;
                    width: 100%;
                    height: 100%;
                }
                
                .form-card-front, .form-card-back {
                    position: absolute !important;
                    width: 100%;
                    height: 100%;
                    -webkit-backface-visibility: hidden !important;
                    backface-visibility: hidden !important;
                }
                
                .form-card-back {
                    transform: rotateY(180deg) !important;
                }
                
                .form-card-inner.flipped {
                    transform: rotateY(180deg) !important;
                }
                
                .card-shake {
                    animation: card-shake 0.4s ease;
                }
                
                /* Hiệu ứng ánh sáng khi lật */
                .form-card-inner::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(
                        to right,
                        rgba(255, 255, 255, 0) 0%,
                        rgba(255, 255, 255, 0.3) 50%,
                        rgba(255, 255, 255, 0) 100%
                    );
                    transform: skewX(-25deg);
                    z-index: 10;
                    opacity: 0;
                    transition: opacity 0.2s;
                    pointer-events: none;
                }
                
                .form-card-inner.card-shake::before {
                    animation: shine 0.7s;
                }
                
                /* Thêm hiệu ứng đổ bóng cho thẻ */
                .form-card:hover .form-card-inner:not(.flipped) {
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
                    transform: translateY(-5px);
                }
                
                /* Thêm hiệu ứng lấp lánh cho thẻ khi hover */
                .form-card-inner:hover::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(
                        circle,
                        rgba(255, 255, 255, 0.1) 0%,
                        rgba(255, 255, 255, 0) 70%
                    );
                    transform: rotate(30deg);
                    pointer-events: none;
                }
                
                /* Đảm bảo các nút lật hoạt động tốt */
                .flip-btn {
                    cursor: pointer !important;
                    z-index: 10 !important;
                    position: relative !important;
                }
            `;
            document.head.appendChild(styleElement);
            console.log('Card flip styles added');
        }
    }
    
    // Phát âm thanh khi lật thẻ
    function playFlipSound() {
        try {
            // Tạo audio context (hoặc sử dụng context hiện có)
            if (!window.audioContext) {
                window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Oscillator để phát âm thanh
            const oscillator = window.audioContext.createOscillator();
            const gainNode = window.audioContext.createGain();
            
            // Cấu hình âm thanh - giống tiếng lật bài lá
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(400, window.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, window.audioContext.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.15, window.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 0.2);
            
            // Kết nối và phát âm thanh
            oscillator.connect(gainNode);
            gainNode.connect(window.audioContext.destination);
            oscillator.start();
            oscillator.stop(window.audioContext.currentTime + 0.2);
        } catch (e) {
            console.log('Web Audio API không được hỗ trợ hoặc đã bị chặn');
        }
    }
    
    // Thêm hiệu ứng tỏa sáng cho thẻ đã lật
    function addGlowEffect(card) {
        // Tạo phần tử hiệu ứng
        const glowEffect = document.createElement('div');
        glowEffect.className = 'card-glow-effect';
        
        // Định vị trí hiệu ứng
        glowEffect.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 12px;
            box-shadow: 0 0 15px 5px rgba(155, 89, 182, 0.5);
            opacity: 0;
            pointer-events: none;
            z-index: 2;
            animation: glow-pulse 1s ease-in-out;
        `;
        
        // Thêm hiệu ứng vào thẻ
        card.appendChild(glowEffect);
        
        // Xóa hiệu ứng sau khi animation hoàn thành
        setTimeout(() => {
            if (glowEffect && glowEffect.parentNode) {
                glowEffect.parentNode.removeChild(glowEffect);
            }
        }, 1000);
    }
    
    // Thiết lập effects tabs
    function setupEffectTabs() {
        const tabButtons = document.querySelectorAll('.effects-tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Bỏ active từ tất cả các buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active cho button hiện tại
                this.classList.add('active');
                
                // Bỏ active từ tất cả các tab panes
                document.querySelectorAll('.effects-tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                
                // Hiển thị tab pane tương ứng
                const tabId = this.getAttribute('data-tab') + '-tab';
                const tabPane = document.getElementById(tabId);
                if (tabPane) {
                    tabPane.classList.add('active');
                }
            });
        });
    }
    
    // Thiết lập accordion
    function setupAccordion() {
        const faqItems = document.querySelectorAll('.faq-question');
        
        faqItems.forEach(item => {
            item.addEventListener('click', function() {
                // Toggle active class cho item hiện tại
                this.classList.toggle('active');
                
                // Toggle icon plus/minus
                const icon = this.querySelector('.faq-icon');
                if (icon) {
                    if (this.classList.contains('active')) {
                        icon.classList.replace('fa-plus', 'fa-minus');
                    } else {
                        icon.classList.replace('fa-minus', 'fa-plus');
                    }
                }
                
                // Toggle hiển thị nội dung
                const answer = this.nextElementSibling;
                if (answer) {
                    if (this.classList.contains('active')) {
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                    } else {
                        answer.style.maxHeight = '0';
                    }
                }
            });
        });
    }
    
    // Thiết lập statistic counters
    function setupStatisticCounters() {
        const counters = document.querySelectorAll('.statistic-value');
        
        counters.forEach(counter => {
            const value = counter.textContent;
            let startValue = 0;
            let endValue = parseInt(value);
            
            // Nếu giá trị là phần trăm
            if (value.includes('%')) {
                endValue = parseInt(value);
                counter.textContent = '0%';
            }
            
            const duration = 2000; // 2 seconds
            const frameRate = 50; // fps
            const totalFrames = duration / (1000 / frameRate);
            const increment = endValue / totalFrames;
            
            let currentFrame = 0;
            
            const animate = () => {
                currentFrame++;
                startValue += increment;
                
                if (currentFrame <= totalFrames) {
                    counter.textContent = value.includes('%') ? 
                        Math.floor(startValue) + '%' : 
                        Math.floor(startValue);
                    requestAnimationFrame(animate);
                } else {
                    counter.textContent = value;
                }
            };
            
            // Bắt đầu animation khi section hiển thị
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animate();
                        observer.unobserve(counter);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(counter);
        });
    }
}); 