document.addEventListener('DOMContentLoaded', function() {
    // Biến lưu trữ trạng thái
    let currentQuizIndex = 0;
    let userScore = 0;
    let quizQuestions = [];
    let selectedGamblingType = null;
    let isDataLoaded = false;

    // Khởi tạo các thành phần UI
    initUI();

    // Tạo hiệu ứng hạt nền
    createParticles();

    // Xử lý tabs trong phần tác hại
    initTabs();

    // Xử lý các nút hành động
    initActionButtons();

    // Xử lý kiểm tra nghiện cờ bạc
    initQuiz();

    // Xử lý chuyển đổi chế độ sáng tối
    initThemeToggle();

    // Hiển thị thông tin chi tiết khi nhấp vào loại hình cờ bạc
    initGamblingTypeCards();

    // Animation counter cho số liệu thống kê
    animateCounters();

    // Tải dữ liệu từ "cơ sở dữ liệu"
    loadData();

    // Hàm khởi tạo UI
    function initUI() {
        // Hiệu ứng cuộn cho navbar
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.gambling-navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Xử lý nút cuộn tới nội dung
        const scrollButton = document.querySelector('.scrollToContent');
        if (scrollButton) {
            scrollButton.addEventListener('click', function() {
                const targetSection = document.getElementById('gambling-types');
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Xử lý menu mobile
        const navbarToggle = document.getElementById('navbar-toggle');
        const navbarLinks = document.querySelector('.navbar-links');
        if (navbarToggle && navbarLinks) {
            navbarToggle.addEventListener('click', function() {
                navbarLinks.classList.toggle('active');
            });
        }

        // Ẩn phần loading sau 1.5 giây
        setTimeout(function() {
            const loadingContent = document.querySelector('.loading-content');
            if (loadingContent) {
                loadingContent.style.display = 'none';
            }
        }, 1500);
    }

    // Hàm khởi tạo tabs
    function initTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Xóa active class từ tất cả các buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                // Thêm active class cho button được click
                this.classList.add('active');
                
                // Hiển thị nội dung tab tương ứng
                const targetId = this.getAttribute('data-tab');
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === targetId + '-tab') {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    // Hàm khởi tạo các nút hành động
    function initActionButtons() {
        const actionButtons = document.querySelectorAll('.action-button[data-target]');
        
        actionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetSectionId = this.getAttribute('data-target');
                if (targetSectionId === 'test-awareness') {
                    openQuizModal();
                } else {
                    scrollToSection(targetSectionId);
                }
            });
        });

        // Nút kiểm tra trong warning section
        const testBtn = document.querySelector('.test-btn');
        if (testBtn) {
            testBtn.addEventListener('click', function() {
                openQuizModal();
            });
        }

        // Nút tìm trung tâm hỗ trợ
        const findCentersBtn = document.getElementById('findCentersBtn');
        if (findCentersBtn) {
            findCentersBtn.addEventListener('click', function() {
                // Trong thực tế, đây sẽ là một API gọi đến bản đồ
                alert('Chức năng này sẽ hiển thị bản đồ với các trung tâm hỗ trợ gần bạn nhất.');
            });
        }
    }

    // Hàm tạo hiệu ứng hạt nền
    function createParticles() {
        const particles = document.getElementById('particles');
        if (!particles) return;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Kích thước ngẫu nhiên
            const size = Math.random() * 5 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Vị trí ngẫu nhiên
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // Màu ngẫu nhiên
            const colors = ['#e74c3c', '#c0392b', '#f39c12', '#d35400', '#ffffff'];
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Animation
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
            
            particles.appendChild(particle);
        }
    }

    // Hàm cuộn đến section
    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Hàm khởi tạo chuyển đổi chế độ sáng tối
    function initThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            // Kiểm tra theme lưu trong localStorage
            const savedTheme = localStorage.getItem('gambling-theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-mode');
                themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
            }

            themeToggle.addEventListener('click', function() {
                document.body.classList.toggle('dark-mode');
                const icon = this.querySelector('i');
                
                if (document.body.classList.contains('dark-mode')) {
                    icon.classList.replace('fa-moon', 'fa-sun');
                    localStorage.setItem('gambling-theme', 'dark');
                } else {
                    icon.classList.replace('fa-sun', 'fa-moon');
                    localStorage.setItem('gambling-theme', 'light');
                }
            });
        }
    }

    // Hàm animation counters
    function animateCounters() {
        const counterElements = document.querySelectorAll('.counter');
        counterElements.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const duration = 2000; // 2 giây
            const step = target / 100;
            let current = 0;
            const timer = setInterval(() => {
                current += step;
                counter.textContent = Math.round(current * 10) / 10;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                }
            }, duration / 100);
        });
    }

    // Hàm khởi tạo quiz
    function initQuiz() {
        // Load câu hỏi quiz
        loadQuizQuestions();

        // Xử lý nút đóng quiz
        const closeQuizBtn = document.querySelector('.close-quiz');
        if (closeQuizBtn) {
            closeQuizBtn.addEventListener('click', function() {
                document.getElementById('quizModal').classList.remove('active');
            });
        }

        // Xử lý nút "Câu tiếp theo"
        const nextQuestionBtn = document.getElementById('nextQuestion');
        if (nextQuestionBtn) {
            nextQuestionBtn.addEventListener('click', function() {
                if (currentQuizIndex < quizQuestions.length - 1) {
                    currentQuizIndex++;
                    displayQuestion(currentQuizIndex);
                } else {
                    document.getElementById('showResults').style.display = 'block';
                    this.style.display = 'none';
                }
            });
        }

        // Xử lý nút "Xem kết quả"
        const showResultsBtn = document.getElementById('showResults');
        if (showResultsBtn) {
            showResultsBtn.addEventListener('click', function() {
                showQuizResults();
            });
        }

        // Xử lý nút "Làm lại bài kiểm tra"
        const retakeQuizBtn = document.getElementById('retakeQuiz');
        if (retakeQuizBtn) {
            retakeQuizBtn.addEventListener('click', function() {
                resetQuiz();
            });
        }
    }

    // Hàm mở quiz modal
    function openQuizModal() {
        const quizModal = document.getElementById('quizModal');
        if (quizModal) {
            document.querySelector('.quiz-content').style.display = 'block';
            document.querySelector('.quiz-results').style.display = 'none';
            resetQuiz();
            quizModal.classList.add('active');
        }
    }

    // Hàm load câu hỏi quiz (trong thực tế sẽ lấy từ API/database)
    function loadQuizQuestions() {
        quizQuestions = [
            {
                question: "Đâu là dấu hiệu cảnh báo sớm của nghiện cờ bạc?",
                options: [
                    "Chỉ chơi trong các dịp đặc biệt",
                    "Luôn nghĩ về cờ bạc khi không đánh bạc",
                    "Đặt giới hạn thời gian và tiền bạc khi chơi",
                    "Chỉ chơi với số tiền nhỏ"
                ],
                correctAnswer: 1,
                feedback: "Suy nghĩ liên tục về cờ bạc, không thể ngừng nghĩ về nó là một dấu hiệu cảnh báo sớm của nghiện cờ bạc."
            },
            {
                question: "Cờ bạc trực tuyến được cho là nguy hiểm hơn cờ bạc truyền thống vì lý do nào?",
                options: [
                    "Tỷ lệ thắng thấp hơn",
                    "Giá cược cao hơn",
                    "Có thể chơi bất kỳ lúc nào và không dễ bị phát hiện",
                    "Luôn bị gian lận"
                ],
                correctAnswer: 2,
                feedback: "Cờ bạc trực tuyến có thể tiếp cận 24/7, người chơi có thể đánh bạc một cách kín đáo mà không bị người khác phát hiện, làm tăng nguy cơ nghiện."
            },
            {
                question: "Người nghiện cờ bạc thường có tâm lý nào sau đây?",
                options: [
                    "Chấp nhận thua cuộc và dừng chơi",
                    "Tin rằng họ sẽ gỡ lại tiền đã thua nếu tiếp tục chơi",
                    "Đặt giới hạn số tiền chơi và tuân thủ nghiêm ngặt",
                    "Luôn đánh giá khách quan về cơ hội thắng thua"
                ],
                correctAnswer: 1,
                feedback: "Niềm tin sai lầm rằng sẽ gỡ lại được tiền đã thua (chase losses) là một đặc điểm tâm lý phổ biến của người nghiện cờ bạc."
            },
            {
                question: "Gia đình có thể giúp người nghiện cờ bạc bằng cách nào sau đây?",
                options: [
                    "Cho người nghiện vay tiền để trả nợ cờ bạc",
                    "Giữ bí mật không cho người khác biết về vấn đề cờ bạc",
                    "Đe dọa và trừng phạt để họ dừng đánh bạc",
                    "Hỗ trợ tìm kiếm sự giúp đỡ chuyên nghiệp và kiểm soát tài chính"
                ],
                correctAnswer: 3,
                feedback: "Hỗ trợ tìm kiếm sự giúp đỡ chuyên nghiệp và giúp kiểm soát tài chính là cách hiệu quả để gia đình hỗ trợ người nghiện cờ bạc."
            },
            {
                question: "Biện pháp nào sau đây KHÔNG hiệu quả trong việc phòng tránh cờ bạc?",
                options: [
                    "Tìm hiểu về tác hại của cờ bạc",
                    "Đặt giới hạn thời gian và tiền bạc cho hoạt động giải trí",
                    "Tìm kiếm các hoạt động giải trí lành mạnh thay thế",
                    "Tin vào các 'hệ thống' và 'mẹo' để thắng cược"
                ],
                correctAnswer: 3,
                feedback: "Tin vào các 'hệ thống' và 'mẹo' để thắng cược là một niềm tin sai lầm và không hiệu quả trong việc phòng tránh cờ bạc, thực tế có thể làm tăng nguy cơ nghiện."
            }
        ];
    }

    // Hiển thị câu hỏi
    function displayQuestion(index) {
        if (!quizQuestions || quizQuestions.length === 0) return;
        
        const question = quizQuestions[index];
        const questionElement = document.getElementById('questionText');
        const optionsContainer = document.getElementById('quizOptions');
        const feedbackElement = document.getElementById('quizFeedback');
        const progressBar = document.querySelector('.progress-bar');
        
        // Cập nhật thanh tiến trình
        const progressPercent = ((index + 1) / quizQuestions.length) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        // Đặt nội dung câu hỏi
        questionElement.textContent = question.question;
        
        // Xóa các option cũ
        optionsContainer.innerHTML = '';
        
        // Thêm options mới
        question.options.forEach((option, optIndex) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'quiz-option';
            optionElement.textContent = option;
            optionElement.dataset.index = optIndex;
            
            optionElement.addEventListener('click', function() {
                selectOption(this, optIndex, question.correctAnswer);
            });
            
            optionsContainer.appendChild(optionElement);
        });
        
        // Ẩn phản hồi
        feedbackElement.style.display = 'none';
        
        // Ẩn nút Xem kết quả
        document.getElementById('showResults').style.display = 'none';
        document.getElementById('nextQuestion').style.display = 'block';
    }

    // Xử lý khi người dùng chọn câu trả lời
    function selectOption(optionElement, selectedIndex, correctIndex) {
        const options = document.querySelectorAll('.quiz-option');
        const feedbackElement = document.getElementById('quizFeedback');
        
        // Xóa các classes trước đó
        options.forEach(opt => {
            opt.classList.remove('selected', 'correct', 'incorrect');
        });
        
        // Highlight lựa chọn hiện tại
        optionElement.classList.add('selected');
        
        // Đánh dấu đúng/sai
        if (selectedIndex === correctIndex) {
            optionElement.classList.add('correct');
            userScore++;
        } else {
            optionElement.classList.add('incorrect');
            options[correctIndex].classList.add('correct');
        }
        
        // Hiển thị phản hồi
        feedbackElement.textContent = quizQuestions[currentQuizIndex].feedback;
        feedbackElement.style.display = 'block';
    }

    // Hiển thị kết quả quiz
    function showQuizResults() {
        document.querySelector('.quiz-content').style.display = 'none';
        document.querySelector('.quiz-results').style.display = 'block';
        
        const scoreDisplay = document.getElementById('scoreDisplay');
        const resultsFeedback = document.getElementById('resultsFeedback');
        
        scoreDisplay.textContent = `${userScore}/${quizQuestions.length}`;
        
        // Phản hồi dựa trên điểm số
        const percentage = (userScore / quizQuestions.length) * 100;
        
        if (percentage >= 80) {
            resultsFeedback.textContent = "Xuất sắc! Bạn đã hiểu rõ về cờ bạc và các rủi ro của nó. Hãy tiếp tục duy trì nhận thức này để bảo vệ bản thân và người thân.";
        } else if (percentage >= 60) {
            resultsFeedback.textContent = "Tốt! Bạn có hiểu biết cơ bản về cờ bạc. Hãy tìm hiểu thêm để bảo vệ bản thân tốt hơn nữa.";
        } else {
            resultsFeedback.textContent = "Bạn cần tìm hiểu thêm về cờ bạc và các dấu hiệu nghiện. Điều này sẽ giúp bạn bảo vệ bản thân và nhận biết các dấu hiệu nguy hiểm.";
        }
    }

    // Reset quiz
    function resetQuiz() {
        currentQuizIndex = 0;
        userScore = 0;
        
        document.querySelector('.quiz-content').style.display = 'block';
        document.querySelector('.quiz-results').style.display = 'none';
        
        displayQuestion(currentQuizIndex);
    }

    // Hàm khởi tạo xử lý thẻ loại hình cờ bạc
    function initGamblingTypeCards() {
        const gamblingTypeCards = document.querySelectorAll('.gambling-type-card');
        
        gamblingTypeCards.forEach(card => {
            card.addEventListener('click', function() {
                const typeId = this.getAttribute('data-type');
                
                // Hiển thị modal hoặc thay đổi nội dung khi click
                showGamblingTypeDetails(typeId);
            });
        });
    }

    // Hàm hiển thị chi tiết loại hình cờ bạc (sẽ triển khai sau)
    function showGamblingTypeDetails(typeId) {
        alert(`Trong triển khai thực tế, đây sẽ hiển thị thông tin chi tiết về loại hình cờ bạc: ${typeId}`);
        // Trong thực tế, đây sẽ là API gọi dữ liệu và hiển thị trong modal hoặc expander
    }

    // Hàm tải dữ liệu (trong thực tế sẽ gọi API)
    function loadData() {
        // Giả lập việc gọi API để lấy dữ liệu
        setTimeout(() => {
            isDataLoaded = true;
            console.log("Dữ liệu đã được tải");
        }, 1000);
    }

    // Hiệu ứng chuyển trang
    document.querySelectorAll('a:not([href^="#"])').forEach(link => {
        link.addEventListener('click', function(e) {
            // Kiểm tra nếu đây là link nội bộ
            const href = this.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('tel:') && !href.startsWith('mailto:')) {
                e.preventDefault();
                
                // Hiệu ứng transition
                const overlay = document.querySelector('.page-transition-overlay');
                if (overlay) {
                    overlay.classList.add('active');
                    
                    setTimeout(() => {
                        window.location.href = href;
                    }, 500);
                } else {
                    window.location.href = href;
                }
            }
        });
    });
}); 