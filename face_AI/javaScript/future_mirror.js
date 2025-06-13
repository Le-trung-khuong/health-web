// Face Transformation Effects - Future Mirror
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animation library
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });

    // Global loading protection - ensure loading overlay never gets stuck for more than 45 seconds
    setInterval(() => {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay && loadingOverlay.style.display === 'flex') {
            const loadingStartTime = loadingOverlay.getAttribute('data-start-time');
            if (loadingStartTime) {
                const elapsedTime = Date.now() - parseInt(loadingStartTime);
                if (elapsedTime > 45000) { // 45 seconds maximum loading time
                    console.warn('Loading overlay has been displayed for too long. Force hiding it.');
                    loadingOverlay.style.display = 'none';
                    showToast('Xử lý hình ảnh đã bị hủy do quá thời gian. Vui lòng thử lại.', 'warning');
                }
            }
        }
    }, 5000); // Check every 5 seconds

    // Variables
    let currentEffect = 'drug-effects'; // Default effect
    let uploadedImage = null;
    let yearsSlider = document.getElementById('years-slider');
    let yearsLabel = document.getElementById('years-label');
    let currentYears = 5; // Default years
    let isAiTransformEnabled = true; // Toggle between AI and CSS filters
    let isProcessing = false; // Flag to prevent multiple API calls
    let detectedFaceData = null; // Store detected face data
    let userAge = 25; // Tuổi mặc định của người dùng
    
    // Initialize AI modules
    // Sử dụng đúng module FaceDetection đã được định nghĩa trong face_detection.js
    // Đã loại bỏ dòng let faceDetector = new FaceDetector();
    
    // AIFaceTransformer được định nghĩa ở đâu đó, nếu không tồn tại thì phải tạo stub
    let aiTransformer = window.AIFaceTransformer ? new window.AIFaceTransformer() : {
        initialize: function() { return true; },
        transformFace: function() { return Promise.resolve(null); },
        setUserAge: function(age) { console.log('Setting user age:', age); },
        getAgeSpecificImpact: function(effectType, years, age) { 
            return {
                originalYears: years,
                adjustedYears: years,
                vietnameseNote: '',
                detailedDescription: ''
            };
        }
    };
    
    // Thiết lập API key cho Replicate API
    // Lưu ý: Trong triển khai thực tế, bạn cần sử dụng API key thực của bạn
    // và nên gửi yêu cầu thông qua backend để bảo mật API key
    const replicateApiKey = ''; // Để trống trong phiên bản demo
    if (aiTransformer && typeof aiTransformer.initialize === 'function') {
    aiTransformer.initialize(replicateApiKey);
    }
    
    // Elements
    const uploadDropzone = document.getElementById('upload-dropzone');
    const imageUpload = document.getElementById('image-upload');
    const mirrorResults = document.getElementById('mirror-results');
    const loadingOverlay = document.getElementById('loading-overlay');
    const originalImageContainer = document.getElementById('original-image-container');
    const transformedImageContainer = document.getElementById('transformed-image-container');
    const healthImpactContent = document.getElementById('health-impact-content');
    const resetButton = document.getElementById('reset-button');
    const downloadButton = document.getElementById('download-button');
    const shareButton = document.getElementById('share-button');
    const futureLabel = document.getElementById('future-label');
    const aiStatusDisplay = document.createElement('div');
    
    // AI status display
    aiStatusDisplay.className = 'ai-status-display';
    aiStatusDisplay.innerHTML = '<i class="fas fa-robot"></i> <span>AI Thực đang được sử dụng</span>';
    document.querySelector('.future-mirror-container').appendChild(aiStatusDisplay);

    // Face detection canvas overlay
    const faceDetectionCanvas = document.createElement('canvas');
    faceDetectionCanvas.className = 'face-detection-canvas';
    faceDetectionCanvas.style.position = 'absolute';
    faceDetectionCanvas.style.top = '0';
    faceDetectionCanvas.style.left = '0';
    faceDetectionCanvas.style.pointerEvents = 'none';
    
    // Thêm nút điều khiển để hiển thị/ẩn điểm mốc khuôn mặt
    const faceMarkersToggle = document.createElement('button');
    faceMarkersToggle.className = 'btn btn-sm btn-outline face-markers-toggle';
    faceMarkersToggle.innerHTML = '<i class="fas fa-face-smile"></i> Hiển thị điểm mốc';
    faceMarkersToggle.style.position = 'absolute';
    faceMarkersToggle.style.top = '10px';
    faceMarkersToggle.style.right = '10px';
    faceMarkersToggle.style.zIndex = '100';
    faceMarkersToggle.style.display = 'none'; // Ẩn mặc định
    
    let showFaceMarkers = false;
    
    faceMarkersToggle.addEventListener('click', function() {
        showFaceMarkers = !showFaceMarkers;
        
        if (showFaceMarkers) {
            faceMarkersToggle.innerHTML = '<i class="fas fa-face-smile"></i> Ẩn điểm mốc';
            // Hiển thị kết quả nhận diện khuôn mặt
            if (detectedFaceData && uploadedImage) {
                const displaySize = { width: uploadedImage.width, height: uploadedImage.height };
                if (window.FaceDetection && typeof window.FaceDetection.drawResults === 'function') {
                    window.FaceDetection.drawResults(faceDetectionCanvas, displaySize);
                    faceDetectionCanvas.style.display = 'block';
                }
            }
        } else {
            faceMarkersToggle.innerHTML = '<i class="fas fa-face-smile"></i> Hiển thị điểm mốc';
            // Ẩn canvas
            faceDetectionCanvas.style.display = 'none';
        }
    });
    
    document.querySelector('.future-mirror-container').appendChild(faceMarkersToggle);
    
    // AI toggle button
    const toggleAiButton = document.createElement('button');
    toggleAiButton.className = 'btn btn-outline ai-toggle-btn active';
    toggleAiButton.innerHTML = '<i class="fas fa-robot"></i> Đang Dùng AI Thực';
    toggleAiButton.addEventListener('click', toggleAiMode);
    document.querySelector('.future-mirror-container').appendChild(toggleAiButton);
    
    // Debug mode toggle (for developers)
    const toggleDebugButton = document.createElement('button');
    toggleDebugButton.className = 'btn btn-outline debug-toggle-btn';
    toggleDebugButton.innerHTML = '<i class="fas fa-bug"></i> Debug Mode';
    toggleDebugButton.style.position = 'absolute';
    toggleDebugButton.style.top = '10px';
    toggleDebugButton.style.left = '10px';
    toggleDebugButton.addEventListener('click', toggleDebugMode);
    document.querySelector('.future-mirror-container').appendChild(toggleDebugButton);
    
    let debugMode = false;
    
    // Effect tabs
    const effectTabs = document.querySelectorAll('.future-mirror-tab');
    
    // Effect specific data for health impacts
    const healthImpacts = {
        'drug-effects': {
            1: [
                { title: 'Mắt', text: 'Giãn đồng tử, mắt đỏ và thâm quầng nhẹ' },
                { title: 'Da', text: 'Da bắt đầu xỉn màu, giảm độ đàn hồi' },
                { title: 'Miệng & Răng', text: 'Khô miệng, răng bắt đầu sậm màu' }
            ],
            5: [
                { title: 'Mắt', text: 'Thâm quầng rõ rệt, mắt trũng, ánh nhìn mờ đục' },
                { title: 'Da', text: 'Xuất hiện mụn, vết loét, da nhợt nhạt' },
                { title: 'Miệng & Răng', text: 'Răng bắt đầu mục, nướu viêm đỏ' },
                { title: 'Cân nặng', text: 'Sụt cân đáng kể, cơ bắp teo nhỏ' }
            ],
            10: [
                { title: 'Mắt', text: 'Mắt trũng sâu, ánh nhìn vô hồn, mạch máu đỏ' },
                { title: 'Da', text: 'Da nhăn nheo, sần sùi, nhiều vết thương không lành' },
                { title: 'Miệng & Răng', text: 'Răng hư hỏng nặng, nướu viêm tấy, hơi thối' },
                { title: 'Cân nặng', text: 'Gầy gò như bộ xương, tiêu cơ nghiêm trọng' },
                { title: 'Cấu trúc mặt', text: 'Biến dạng, xương gò má lộ rõ, già trước tuổi' }
            ],
            15: [
                { title: 'Mắt', text: 'Mắt lõm sâu trong hốc mắt, ánh nhìn mất tập trung hoàn toàn' },
                { title: 'Da', text: 'Da nhăn nheo nặng, loét, nhiễm trùng, xuất hiện vết thương mủ' },
                { title: 'Miệng & Răng', text: 'Hầu hết răng bị mất hoặc hư hỏng nặng, nướu teo và viêm loét' },
                { title: 'Cân nặng', text: 'Suy dinh dưỡng trầm trọng, cơ thể không còn cơ' },
                { title: 'Cấu trúc mặt', text: 'Biến dạng nghiêm trọng, già nua trước 20-30 tuổi so với tuổi thật' },
                { title: 'Thần kinh', text: 'Những cơn co giật, mất kiểm soát cơ mặt thường xuyên' }
            ],
            20: [
                { title: 'Mắt', text: 'Mắt hoàn toàn trũng sâu, mất sinh khí, thường xuyên xuất huyết' },
                { title: 'Da', text: 'Da nhăn nheo như người già 80-90 tuổi, đầy vết thương lở loét' },
                { title: 'Miệng & Răng', text: 'Mất gần hết răng, hàm teo, nướu hoại tử' },
                { title: 'Cân nặng', text: 'Cơ thể chỉ còn da bọc xương, không còn cơ bắp' },
                { title: 'Cấu trúc mặt', text: 'Biến dạng không thể nhận ra, già nua như cuối đời' },
                { title: 'Thần kinh', text: 'Tổn thương não vĩnh viễn, mất kiểm soát cơ mặt hoàn toàn' },
                { title: 'Tuổi thọ', text: 'Giảm 30-40 năm tuổi thọ, nguy cơ tử vong cực cao' }
            ]
        },
        'alcohol-effects': {
            1: [
                { title: 'Mặt', text: 'Da mặt hơi đỏ, bắt đầu xuất hiện mao mạch nổi' },
                { title: 'Mắt', text: 'Mắt hơi sưng, đỏ sau khi uống' }
            ],
            5: [
                { title: 'Mặt', text: 'Sưng phù, đỏ thường xuyên, mao mạch nổi rõ' },
                { title: 'Mắt', text: 'Vàng nhẹ, quầng thâm, thường xuyên sưng đỏ' },
                { title: 'Cân nặng', text: 'Tăng cân, béo mặt, đặc biệt ở vùng má và cằm' },
                { title: 'Mũi', text: 'Bắt đầu to và đỏ, nổi mao mạch' }
            ],
            10: [
                { title: 'Mặt', text: 'Sưng phù nặng, đỏ tím, mao mạch nổi đầy mặt' },
                { title: 'Mắt', text: 'Vàng rõ rệt (dấu hiệu tổn thương gan), sưng nề' },
                { title: 'Cân nặng', text: 'Béo mặt, cổ ngắn, phù nề toàn bộ' },
                { title: 'Mũi', text: 'Mũi to, đỏ tím, biến dạng (mũi rượu whisky)' },
                { title: 'Da', text: 'Già nua trước tuổi, nhăn nhiều, xỉn màu' }
            ],
            15: [
                { title: 'Mặt', text: 'Biến dạng, sưng to, đỏ tím thường xuyên' },
                { title: 'Mắt', text: 'Vàng đậm, sung huyết, thường xuyên đỏ ngầu' },
                { title: 'Cân nặng', text: 'Phù nề mặt nghiêm trọng hoặc gầy mòn (giai đoạn cuối)' },
                { title: 'Mũi', text: 'Mũi rượu whisky điển hình, biến dạng to đỏ' },
                { title: 'Da', text: 'Nứt nẻ, lão hóa nặng, tổn thương không hồi phục' },
                { title: 'Gan', text: 'Xơ gan nặng, có thể gây vàng da toàn thân' }
            ],
            20: [
                { title: 'Mặt', text: 'Biến dạng hoàn toàn, già nua, mất cấu trúc' },
                { title: 'Mắt', text: 'Vàng đậm, sung huyết, xuất huyết thường xuyên' },
                { title: 'Cơ thể', text: 'Suy kiệt, phù nề toàn thân do suy gan, suy thận' },
                { title: 'Mũi', text: 'Biến dạng hoàn toàn, tím tái, phì đại' },
                { title: 'Da', text: 'Tổn thương không hồi phục, già nua như người 90 tuổi' },
                { title: 'Não', text: 'Teo não, mất trí nhớ, sa sút trí tuệ rượu' },
                { title: 'Tuổi thọ', text: 'Giảm 20-30 năm tuổi thọ, nguy cơ tử vong rất cao' }
            ]
        },
        'smoking-effects': {
            1: [
                { title: 'Răng', text: 'Bắt đầu ố vàng, mùi hôi miệng' },
                { title: 'Da', text: 'Da xỉn màu, mất độ ẩm' }
            ],
            5: [
                { title: 'Răng', text: 'Răng vàng rõ rệt, nướu tối màu' },
                { title: 'Da', text: 'Xuất hiện nếp nhăn sớm, da khô' },
                { title: 'Môi', text: 'Môi khô, nứt nẻ, bắt đầu thâm' },
                { title: 'Mắt', text: 'Quầng thâm nhẹ dưới mắt' }
            ],
            10: [
                { title: 'Răng', text: 'Răng vàng đậm, nướu teo, bắt đầu mất răng' },
                { title: 'Da', text: 'Nếp nhăn sâu ở miệng, mắt, da xỉn màu xám' },
                { title: 'Môi', text: 'Môi thâm, khô, có thể xuất hiện nốt trắng (tiền ung thư)' },
                { title: 'Mắt', text: 'Quầng thâm rõ rệt, mắt mệt mỏi' },
                { title: 'Tóc', text: 'Tóc bạc sớm, khô xơ, dễ gãy rụng' }
            ],
            15: [
                { title: 'Răng', text: 'Mất nhiều răng, nướu teo nghiêm trọng, bệnh nha chu' },
                { title: 'Da', text: 'Già nua trước 10-15 tuổi, da nhăn nheo sâu' },
                { title: 'Môi', text: 'Môi thâm đen, nứt nẻ, nguy cơ ung thư môi cao' },
                { title: 'Mắt', text: 'Bọng mắt, quầng thâm nghiêm trọng' },
                { title: 'Khuôn mặt', text: 'Xuất hiện nếp nhăn sâu quanh mắt, miệng (chân chim)' }
            ],
            20: [
                { title: 'Răng', text: 'Mất đa số răng, nướu teo rút, viêm loét thường xuyên' },
                { title: 'Da', text: 'Già nua trước 15-20 tuổi, da nhăn nheo như giấy nhăn' },
                { title: 'Môi', text: 'Biến dạng, thâm đen, nguy cơ ung thư cao' },
                { title: 'Mắt', text: 'Quầng thâm vĩnh viễn, mắt trũng, vàng' },
                { title: 'Khuôn mặt', text: 'Già nua hoàn toàn, nếp nhăn sâu khắp mặt' },
                { title: 'Tuổi thọ', text: 'Giảm 15-20 năm tuổi thọ, nguy cơ ung thư rất cao' }
            ]
        }
    };

    // Initialize
    async function initializeMirror() {
        // Tải mô hình nhận diện khuôn mặt
        try {
            showLoadingOverlay('Đang tải mô hình nhận diện khuôn mặt từ GitHub...');
            
            if (window.FaceDetection && typeof window.FaceDetection.loadModels === 'function') {
                const modelLoadSuccess = await window.FaceDetection.loadModels();
                
                if (modelLoadSuccess) {
                    console.log('Face detection models loaded successfully from GitHub');
                    aiStatusDisplay.innerHTML = '<i class="fas fa-check-circle"></i> <span>Nhận Diện Khuôn Mặt Đã Sẵn Sàng</span>';
                    showToast('Mô hình nhận diện khuôn mặt đã được tải thành công', 'success');
                } else {
                    console.warn('Không thể tải mô hình nhận diện khuôn mặt từ GitHub, nhưng vẫn tiếp tục với chế độ CSS filter');
                    aiStatusDisplay.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Lỗi Tải Mô Hình - Đang Sử Dụng CSS Filters</span>';
                    isAiTransformEnabled = false;
                    toggleAiButton.innerHTML = '<i class="fas fa-sliders-h"></i> Đang Dùng CSS Filters';
                    toggleAiButton.classList.remove('active');
                    showToast('Không thể tải mô hình nhận diện khuôn mặt. Đang sử dụng chế độ CSS filter.', 'warning');
                }
            } else {
                console.warn('Module FaceDetection không khả dụng, nhưng vẫn tiếp tục với chế độ CSS filter');
                aiStatusDisplay.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Module FaceDetection Không Khả Dụng - Đang Sử Dụng CSS Filters</span>';
                isAiTransformEnabled = false;
                toggleAiButton.innerHTML = '<i class="fas fa-sliders-h"></i> Đang Dùng CSS Filters';
                toggleAiButton.classList.remove('active');
                showToast('Module nhận diện khuôn mặt không khả dụng. Đang sử dụng chế độ CSS filter.', 'warning');
            }
        } catch (error) {
            console.error('Lỗi khi tải mô hình nhận diện khuôn mặt:', error);
            aiStatusDisplay.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Lỗi Tải Mô Hình - Đang Sử Dụng CSS Filters</span>';
            isAiTransformEnabled = false;
            toggleAiButton.innerHTML = '<i class="fas fa-sliders-h"></i> Đang Dùng CSS Filters';
            toggleAiButton.classList.remove('active');
            
            showToast('Không thể tải mô hình nhận diện khuôn mặt. Đang sử dụng chế độ CSS filter.', 'warning');
        } finally {
            hideLoadingOverlay();
        }
        
        // Kiểm tra API key cho Replicate
        if (!replicateApiKey) {
            console.info('Không có API key cho Replicate, sẽ sử dụng chế độ mô phỏng thay vì AI');
            isAiTransformEnabled = false;
            toggleAiButton.innerHTML = '<i class="fas fa-image"></i> Đang Dùng Chế Độ Mô Phỏng';
            toggleAiButton.classList.remove('active');
            aiStatusDisplay.innerHTML = '<i class="fas fa-info-circle"></i> <span>Demo: Đang sử dụng chế độ mô phỏng</span>';
            
            // Disable the AI toggle button
            toggleAiButton.disabled = false; // Cho phép chuyển đổi vì chúng ta có mô phỏng
            toggleAiButton.title = 'Chuyển đổi giữa chế độ mô phỏng và CSS filter';
        }
        
        // Initialize the range slider
        setupYearSlider();
        
        // Set up the upload handlers
        setupUploadHandlers();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('Future Mirror module initialized');
    }

    // Initialize the range slider
    function setupYearSlider() {
        // Configure the years slider
        yearsSlider = document.getElementById('years-slider');
        yearsLabel = document.getElementById('years-label');
        
        // Set initial value
        yearsSlider.value = currentYears;
        yearsLabel.textContent = `${currentYears} năm`;
        
        // Add event listener
        yearsSlider.addEventListener('input', function() {
            currentYears = parseInt(this.value);
            yearsLabel.textContent = `${currentYears} năm`;
            if (uploadedImage) {
                transformFace();
            }
        });
    }

    // Set up upload handlers
    function setupUploadHandlers() {
        // Set up the upload dropzone handler
        uploadDropzone.addEventListener('click', function() {
            imageUpload.click();
        });

        // Set up drag and drop
        uploadDropzone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('active');
        });

        uploadDropzone.addEventListener('dragleave', function() {
            this.classList.remove('active');
        });

        uploadDropzone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('active');
            
            if (e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files[0]);
            }
        });

        // Handle file upload via input
        imageUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                handleFileUpload(this.files[0]);
            }
        });
    }

    // Setup event listeners
    function setupEventListeners() {
        // Effect tabs
        effectTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const effect = this.getAttribute('data-target');
                changeEffect(effect);
            });
        });

        // Reset button
        resetButton.addEventListener('click', resetMirror);

        // Download button
        downloadButton.addEventListener('click', downloadComparison);

        // Share button
        shareButton.addEventListener('click', shareResults);
        
        // User age input
        const userAgeInput = document.getElementById('user-age');
        const ageImpactInfo = document.querySelector('.age-impact-info');
        const ageImpactText = document.getElementById('age-impact-text');
        
        if (userAgeInput) {
            // Set initial age
            userAge = parseInt(userAgeInput.value) || 25;
            if (aiTransformer && typeof aiTransformer.setUserAge === 'function') {
                aiTransformer.setUserAge(userAge);
            }
            
            // Update age impact info
            updateAgeImpactInfo(userAge);
            
            // Add input event listener
            userAgeInput.addEventListener('input', function() {
                const age = parseInt(this.value);
                if (age && age >= 10 && age <= 100) {
                    userAge = age;
                    
                    // Update AI transformer
                    if (aiTransformer && typeof aiTransformer.setUserAge === 'function') {
                        aiTransformer.setUserAge(userAge);
                    }
                    
                    // Update age impact info
                    updateAgeImpactInfo(userAge);
                    
                    // Re-transform if image exists
                    if (uploadedImage) {
                        transformFace();
                    }
                }
            });
            
            // Show age impact info
            if (ageImpactInfo) {
                ageImpactInfo.style.display = 'block';
            }
        }
        
        // Helper function to update age impact info
        function updateAgeImpactInfo(age) {
            if (!ageImpactText) return;
            
            let message = '';
            if (age < 18) {
                message = `Ở tuổi ${age}, cơ thể đang phát triển. Chất gây nghiện sẽ gây tổn hại nghiêm trọng hơn 50% so với người trưởng thành.`;
            } else if (age < 25) {
                message = `Ở tuổi ${age}, não bộ vẫn đang phát triển. Tác hại của chất gây nghiện sẽ nặng hơn 30%.`;
            } else if (age < 35) {
                message = `Ở tuổi ${age}, cơ thể đang ở giai đoạn khỏe mạnh nhất nhưng dễ bị tổn thương bởi chất gây nghiện.`;
            } else if (age < 45) {
                message = `Ở tuổi ${age}, quá trình lão hóa tự nhiên bắt đầu. Chất gây nghiện sẽ đẩy nhanh quá trình này.`;
            } else if (age < 55) {
                message = `Ở tuổi ${age}, cơ thể phục hồi chậm hơn. Tác hại tích lũy nhanh chóng.`;
            } else {
                message = `Ở tuổi ${age}, sức đề kháng yếu. Chất gây nghiện có thể gây tử vong nhanh chóng.`;
            }
            
            ageImpactText.textContent = message;
        }
    }

    // Toggle debug mode
    function toggleDebugMode() {
        debugMode = !debugMode;
        
        if (debugMode) {
            toggleDebugButton.classList.add('active');
            faceMarkersToggle.style.display = 'block'; // Hiển thị nút điểm mốc khuôn mặt khi ở chế độ debug
            
            // Add debug information panel
            const debugPanel = document.createElement('div');
            debugPanel.id = 'debug-panel';
            debugPanel.className = 'debug-panel';
            debugPanel.innerHTML = `
                <h4>Debug Information</h4>
                <div id="debug-content">
                    <p>AI Enabled: ${isAiTransformEnabled}</p>
                    <p>Current Effect: ${currentEffect}</p>
                    <p>Years: ${currentYears}</p>
                    <p>Face Detection: ${detectedFaceData ? 'Available' : 'None'}</p>
                </div>
            `;
            document.querySelector('.future-mirror-container').appendChild(debugPanel);
            
            // Update debug panel if face data exists
            if (detectedFaceData) {
                const debugContent = document.getElementById('debug-content');
                if (debugContent) {
                    debugContent.innerHTML += `
                        <p>Faces Detected: ${detectedFaceData.count}</p>
                        <p>Primary Face Age: ${detectedFaceData.primaryFace ? Math.round(detectedFaceData.primaryFace.age) : 'N/A'}</p>
                        <p>Primary Face Gender: ${detectedFaceData.primaryFace ? detectedFaceData.primaryFace.gender : 'N/A'}</p>
                    `;
                }
            }
        } else {
            toggleDebugButton.classList.remove('active');
            faceMarkersToggle.style.display = 'none'; // Ẩn nút điểm mốc khuôn mặt khi tắt chế độ debug
            
            // Remove debug panel
            const debugPanel = document.getElementById('debug-panel');
            if (debugPanel) {
                debugPanel.remove();
            }
            
            // Hide face markers
            showFaceMarkers = false;
            faceMarkersToggle.innerHTML = '<i class="fas fa-face-smile"></i> Hiển thị điểm mốc';
            faceDetectionCanvas.style.display = 'none';
        }
    }

    // Toggle AI mode
    function toggleAiMode() {
        // Nếu không có API key, không cho phép toggle
        if (!replicateApiKey) {
            showToast('Cần API key để sử dụng AI thực tế. Đang sử dụng CSS filters.', 'info');
            return;
        }
        
        isAiTransformEnabled = !isAiTransformEnabled;
        
        if (isAiTransformEnabled) {
            toggleAiButton.classList.add('active');
            toggleAiButton.innerHTML = '<i class="fas fa-robot"></i> Đang Dùng AI Thực';
            aiStatusDisplay.style.display = 'block';
        } else {
            toggleAiButton.classList.remove('active');
            toggleAiButton.innerHTML = '<i class="fas fa-sliders-h"></i> Đang Dùng CSS Filters';
            aiStatusDisplay.style.display = 'none';
        }
        
        // Re-transform if image exists
        if (uploadedImage) {
            transformFace();
        }
    }

    // Change effect
    function changeEffect(effect) {
        currentEffect = effect;
        
        // Update active tab
        effectTabs.forEach(tab => {
            if (tab.getAttribute('data-target') === effect) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Re-transform if image exists
        if (uploadedImage) {
            transformFace();
        }
    }

    // Handle file upload
    function handleFileUpload(file) {
        if (!file || !file.type.match('image.*')) {
            showToast('Vui lòng chọn một tệp hình ảnh hợp lệ', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showToast('Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB', 'error');
            return;
        }
        
        // Show loading as soon as user selects a file
        showLoadingOverlay('Đang đọc hình ảnh...');
        
        const reader = new FileReader();
        
        // Set a timeout to ensure file reading doesn't hang
        const fileReadTimeout = setTimeout(() => {
            hideLoadingOverlay();
            showToast('Đọc file quá lâu. Vui lòng thử lại với ảnh khác.', 'error');
        }, 10000); // 10 second timeout for file reading
        
        reader.onload = function(e) {
            // Clear timeout as reading succeeded
            clearTimeout(fileReadTimeout);
            
            // Create new image to get dimensions
            uploadedImage = new Image();
            
            // Set a timeout for image loading
            const imageLoadTimeout = setTimeout(() => {
                hideLoadingOverlay();
                showToast('Tải hình ảnh quá lâu. Vui lòng thử lại với ảnh khác.', 'error');
            }, 10000); // 10 second timeout for image loading
            
            uploadedImage.onload = function() {
                // Clear image load timeout
                clearTimeout(imageLoadTimeout);
                
                // Proceed directly to CSS filter mode if the image is too small
                if (uploadedImage.width < 100 || uploadedImage.height < 100) {
                    showToast('Hình ảnh quá nhỏ để phát hiện khuôn mặt. Sử dụng chế độ CSS filter.', 'warning');
                    isAiTransformEnabled = false;
                    transformFace(uploadedImage, currentEffect, parseInt(yearsSlider.value));
                    return;
                }
                
                // Start the detection and transformation process
                detectAndTransformFace();
            };
            
            uploadedImage.onerror = function() {
                // Clear image load timeout
                clearTimeout(imageLoadTimeout);
                hideLoadingOverlay();
                showToast('Không thể tải hình ảnh. Vui lòng thử lại với ảnh khác.', 'error');
            };
            
            uploadedImage.src = e.target.result;
        };
        
        reader.onerror = function() {
            // Clear file read timeout
            clearTimeout(fileReadTimeout);
            hideLoadingOverlay();
            showToast('Không thể đọc tệp hình ảnh', 'error');
        };
        
        reader.readAsDataURL(file);
    }

    // Xử lý phát hiện khuôn mặt và biến đổi
    async function detectAndTransformFace() {
        if (!uploadedImage) {
            showToast('Không có hình ảnh để xử lý', 'error');
            return false;
        }
        
        try {
            // Show loading overlay
            showLoadingOverlay('Đang phân tích khuôn mặt...');
            console.log('Đang phát hiện khuôn mặt trong ảnh đã tải lên...');
            
            // Add timeout for face detection
            const faceDetectionPromise = window.FaceDetection.detect(uploadedImage);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Quá thời gian phát hiện khuôn mặt')), 15000)
            );
            
            // Use Promise.race to implement timeout
            let faceResults;
            try {
                faceResults = await Promise.race([faceDetectionPromise, timeoutPromise]);
            } catch (timeoutError) {
                console.error('Timeout khi phát hiện khuôn mặt:', timeoutError);
                showToast('Quá thời gian phát hiện khuôn mặt. Đang chuyển sang chế độ CSS filter.', 'warning');
                
                // Proceed with CSS filter mode
                    isAiTransformEnabled = false;
                await transformFace(uploadedImage, currentEffect, parseInt(yearsSlider.value));
                return true;
            }
            
            if (!faceResults || !faceResults.success) {
                console.error('Không phát hiện được khuôn mặt:', faceResults ? faceResults.message : 'Không có kết quả');
                showToast('Không phát hiện được khuôn mặt trong ảnh. Đang chuyển sang chế độ CSS filter.', 'warning');
                
                // Proceed with CSS filter mode
                isAiTransformEnabled = false;
                await transformFace(uploadedImage, currentEffect, parseInt(yearsSlider.value));
                return true;
            }
            
            if (faceResults.faces.length === 0) {
                console.warn('Không phát hiện khuôn mặt nào trong ảnh');
                showToast('Không phát hiện khuôn mặt nào trong ảnh. Đang chuyển sang chế độ CSS filter.', 'warning');
                
                // Proceed with CSS filter mode
                isAiTransformEnabled = false;
                await transformFace(uploadedImage, currentEffect, parseInt(yearsSlider.value));
                return true;
            }

            console.log(`Đã phát hiện ${faceResults.faces.length} khuôn mặt, tiếp tục xử lý...`);
            
            // Cập nhật UI hiển thị số lượng khuôn mặt phát hiện được
            updateLoadingMessage(`Đã phát hiện ${faceResults.faces.length} khuôn mặt. Đang áp dụng biến đổi...`);
            
            // Hiển thị hình ảnh biến đổi
            await transformFace(uploadedImage, currentEffect, parseInt(yearsSlider.value));
            
            return true;
            } catch (error) {
            console.error('Lỗi trong quá trình phát hiện và biến đổi khuôn mặt:', error);
            
            // Kiểm tra nếu là lỗi 'fill' not yet implemented
            if (error.message && error.message.includes('fill') && error.message.includes('not yet implemented')) {
                console.warn("Phát hiện lỗi 'fill' not yet implemented, có thể do phiên bản TensorFlow.js không tương thích");
                showToast("Lỗi tương thích TensorFlow.js. Đang chuyển sang chế độ CSS filter.", 'warning');
            } else {
                showToast('Đã xảy ra lỗi khi xử lý ảnh. Đang chuyển sang chế độ CSS filter.', 'error');
            }
            
            // Fallback to CSS filters
                isAiTransformEnabled = false;
            try {
                await transformFace(uploadedImage, currentEffect, parseInt(yearsSlider.value));
            } catch (finalError) {
                console.error('Lỗi cuối cùng:', finalError);
                hideLoadingOverlay();
                showToast('Không thể xử lý hình ảnh. Vui lòng thử lại với ảnh khác.', 'error');
            }
            
            return false;
        } finally {
            // Ensure loading overlay is hidden in all cases
            hideLoadingOverlay();
        }
    }

    // Update loading message
    function updateLoadingMessage(message) {
        const loadingMessage = loadingOverlay.querySelector('p');
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
        
        // Set loading start time if not already set
        if (loadingOverlay.style.display === 'flex' && !loadingOverlay.getAttribute('data-start-time')) {
            loadingOverlay.setAttribute('data-start-time', Date.now().toString());
        }
    }
    
    // Show loading overlay
    function showLoadingOverlay(message) {
        loadingOverlay.style.display = 'flex';
        loadingOverlay.setAttribute('data-start-time', Date.now().toString());
        if (message) {
            updateLoadingMessage(message);
        }
    }
    
    // Hide loading overlay
    function hideLoadingOverlay() {
            loadingOverlay.style.display = 'none';
        loadingOverlay.removeAttribute('data-start-time');
    }

    // Transform face
    async function transformFace(uploadedImage, effect, years) {
        if (!uploadedImage) return;
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Quá thời gian biến đổi hình ảnh')), 30000)
        );
        
        try {
        if (isProcessing) {
                showToast('Đang xử lý hình ảnh, vui lòng đợi', 'info');
            return;
        }
        
        isProcessing = true;
            showLoadingOverlay('Đang biến đổi khuôn mặt...');
            
            // Clear previous images
            while (originalImageContainer.firstChild) {
                originalImageContainer.removeChild(originalImageContainer.firstChild);
            }
            
            while (transformedImageContainer.firstChild) {
                transformedImageContainer.removeChild(transformedImageContainer.firstChild);
            }
            
            // Display original image
            const originalImg = document.createElement('img');
            originalImg.alt = 'Hình ảnh gốc';
            originalImg.className = 'comparison-img';
            originalImg.onload = function() {
                console.log('Original image loaded successfully');
            };
            originalImg.onerror = function() {
                console.error('Failed to load original image');
                hideLoadingOverlay();
                showToast('Không thể tải hình ảnh gốc', 'error');
            };
            originalImg.src = uploadedImage.src;
            originalImageContainer.appendChild(originalImg);
            
            // Append face detection canvas if needed
            if (debugMode && showFaceMarkers) {
                originalImageContainer.appendChild(faceDetectionCanvas);
            }
            
            // Create transformed image element
        const transformedImg = document.createElement('img');
            transformedImg.alt = 'Hình ảnh biến đổi';
            transformedImg.className = 'comparison-img';
            transformedImg.onload = function() {
                console.log('Transformed image loaded successfully');
            };
            transformedImg.onerror = function() {
                console.error('Failed to load transformed image');
                hideLoadingOverlay();
                showToast('Không thể tải hình ảnh biến đổi', 'error');
            };
            
            // Show loading placeholder in transformed image container
        const loadingPlaceholder = document.createElement('div');
        loadingPlaceholder.className = 'transform-loading-placeholder';
        loadingPlaceholder.innerHTML = `
            <div class="loading-spinner"></div>
                <p>Đang xử lý biến đổi khuôn mặt...</p>
                <small id="transform-status">Chuẩn bị</small>
        `;
        transformedImageContainer.appendChild(loadingPlaceholder);
        
            // Use AI transformation or CSS filters
        if (isAiTransformEnabled) {
                // Update loading message
                updateLoadingMessage('Đang xử lý với AI...');
                
                try {
                    // Progress callback to update status
                    const progressCallback = (status, percent) => {
                        const statusElem = document.getElementById('transform-status');
                        if (statusElem) {
                            let statusText = 'Đang xử lý';
                            switch(status) {
                                case 'preparing': 
                                    statusText = 'Đang chuẩn bị ảnh...';
                                    break;
                                case 'processing':
                                    statusText = 'Đang biến đổi khuôn mặt...';
                                    break;
                                case 'succeeded':
                                    statusText = 'Hoàn thành!';
                                    break;
                                default:
                                    statusText = `Đang xử lý (${Math.round(percent)}%)`;
                            }
                            statusElem.textContent = statusText;
                        }
                    };
                    
                    // Call AI transformer with progress updates and timeout
                    const transformPromise = aiTransformer.transformFace(
                    uploadedImage,
                        effect, 
                        years,
                        progressCallback
                    );
                    
                    // Use Promise.race for timeout
                    const transformedImageUrl = await Promise.race([transformPromise, timeoutPromise]);
                    
                    // If AI transformation was successful
                    if (transformedImageUrl) {
                        // Remove loading placeholder
                        if (loadingPlaceholder.parentNode) {
                            transformedImageContainer.removeChild(loadingPlaceholder);
                        }
                        
                        // Set transformed image source
                transformedImg.src = transformedImageUrl;
                        transformedImg.classList.add('transform-fade-in');
                        transformedImageContainer.appendChild(transformedImg);
                    } else {
                        // Fallback to CSS filters if API returned null
                        throw new Error('Không nhận được kết quả từ AI, sử dụng CSS filters');
                    }
            } catch (error) {
                    console.error('Lỗi khi biến đổi hình ảnh với AI:', error);
                    showToast('Đang chuyển sang sử dụng bộ lọc CSS', 'info');
                    
                    // Remove loading placeholder if it exists
                    if (loadingPlaceholder.parentNode) {
                        transformedImageContainer.removeChild(loadingPlaceholder);
                    }
                
                // Fallback to CSS filters
                    transformedImg.src = uploadedImage.src;
                applyTransformationEffects(transformedImg);
                    transformedImageContainer.appendChild(transformedImg);
                    
                    console.log('Using CSS filters for transformation, image source:', transformedImg.src);
            }
        } else {
                // Remove loading placeholder
                if (loadingPlaceholder.parentNode) {
                    transformedImageContainer.removeChild(loadingPlaceholder);
                }
                
                // Use CSS filters
                transformedImg.src = uploadedImage.src;
            applyTransformationEffects(transformedImg);
                transformedImageContainer.appendChild(transformedImg);
                
                console.log('Using CSS filters for transformation, image source:', transformedImg.src);
        }
            
            // Update future label
            futureLabel.textContent = `SAU ${years} NĂM SỬ DỤNG ${getEffectLabel().toUpperCase()}`;
        
        // Update health impacts
        updateHealthImpacts();
            
            // Show results
            mirrorResults.style.display = 'block';
            
            // Update debug panel if exists
            if (debugMode) {
                const debugContent = document.getElementById('debug-content');
                if (debugContent) {
                    debugContent.innerHTML = `
                        <p>AI Enabled: ${isAiTransformEnabled}</p>
                        <p>Current Effect: ${effect}</p>
                        <p>Years: ${years}</p>
                        <p>Face Detection: ${detectedFaceData ? 'Available' : 'None'}</p>
                    `;
                    
                    if (detectedFaceData) {
                        debugContent.innerHTML += `
                            <p>Faces Detected: ${detectedFaceData.count}</p>
                            <p>Primary Face Age: ${detectedFaceData.primaryFace ? Math.round(detectedFaceData.primaryFace.age) : 'N/A'}</p>
                            <p>Primary Face Gender: ${detectedFaceData.primaryFace ? detectedFaceData.primaryFace.gender : 'N/A'}</p>
                        `;
                    }
                }
            }
        } catch (error) {
            console.error('Lỗi khi biến đổi khuôn mặt:', error);
            showToast('Lỗi khi biến đổi hình ảnh. Đang sử dụng bộ lọc CSS.', 'warning');
            
            // Final fallback - just show the original image with CSS filters
            try {
                // Clear transformed container
                while (transformedImageContainer.firstChild) {
                    transformedImageContainer.removeChild(transformedImageContainer.firstChild);
                }
                
                // Create basic image with CSS filters
                const basicTransformedImg = document.createElement('img');
                basicTransformedImg.alt = 'Hình ảnh biến đổi';
                basicTransformedImg.className = 'comparison-img';
                basicTransformedImg.src = uploadedImage.src;
                applyTransformationEffects(basicTransformedImg);
                transformedImageContainer.appendChild(basicTransformedImg);
                
                // Show results
                mirrorResults.style.display = 'block';
                
                // Update label
                futureLabel.textContent = `SAU ${years} NĂM SỬ DỤNG ${getEffectLabel().toUpperCase()}`;
                
                // Update health impacts
                updateHealthImpacts();
            } catch (finalError) {
                console.error('Lỗi cuối cùng khi áp dụng CSS filters:', finalError);
            }
        } finally {
            isProcessing = false;
            hideLoadingOverlay();
        }
    }

    // Apply CSS transformation effects
    function applyTransformationEffects(imgElement) {
        const intensity = currentYears / 20; // 0 to 1 based on years
        
        switch (currentEffect) {
            case 'drug-effects':
                // Mô phỏng tác động của ma túy: 
                // - Làm giảm độ bão hòa (da xanh xao)
                // - Tăng độ tương phản (xương mặt nổi rõ)
                // - Giảm độ sáng (khuôn mặt đen và ảm đạm)
                // - Thêm tông màu đỏ ở mắt (hue-rotate)
                // - Thêm hiệu ứng mờ nhẹ (mệt mỏi, thiếu tỉnh táo)
                
                imgElement.style.filter = `
                    saturate(${100 - 70 * intensity}%)
                    contrast(${100 + 80 * intensity}%)
                    brightness(${100 - 40 * intensity}%)
                    sepia(${50 * intensity}%)
                    hue-rotate(${-15 * intensity}deg)
                    blur(${intensity * 0.7}px)
                `;
                
                // Thêm hiệu ứng "before-after" để tạo hiệu ứng da xấu
                imgElement.style.position = 'relative';
                
                // Thêm hiệu ứng overlay màu đỏ cho quầng thâm
                const overlay = document.createElement('div');
                overlay.className = 'effect-overlay';
                overlay.style.position = 'absolute';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'transparent';
                overlay.style.mixBlendMode = 'multiply';
                overlay.style.opacity = `${intensity * 0.5}`;
                overlay.style.backgroundImage = 'radial-gradient(transparent 70%, rgba(130, 0, 0, 0.3) 100%)';
                overlay.style.pointerEvents = 'none';
                overlay.style.zIndex = '1';
                
                // Xóa overlay cũ nếu có
                const parentElement = imgElement.parentElement;
                if (parentElement) {
                    const existingOverlays = parentElement.querySelectorAll('.effect-overlay');
                    existingOverlays.forEach(el => el.remove());
                    
                    // Thêm overlay mới
                    parentElement.appendChild(overlay);
                    console.log('Added drug effect overlay to', parentElement);
                } else {
                    console.error('Cannot apply overlay - parent element not found');
                }
                break;
                
            case 'alcohol-effects':
                // Mô phỏng tác động của rượu bia:
                // - Tăng độ bão hòa (da đỏ)
                // - Giảm độ tương phản (mặt sưng phù)
                // - Tông màu đỏ (cồn làm mặt đỏ)
                // - Thêm hiệu ứng mờ (say rượu)
                // - Thêm tông màu vàng (vàng da do gan)
                
                imgElement.style.filter = `
                    saturate(${100 + 50 * intensity}%)
                    contrast(${100 - 20 * intensity}%)
                    brightness(${100 - 10 * intensity}%)
                    sepia(${30 * intensity}%)
                    hue-rotate(${10 * intensity}deg)
                    blur(${intensity * 1.2}px)
                `;
                
                // Thêm hiệu ứng phù nề bằng cách dãn rộng hình ảnh
                imgElement.style.transform = `scale(${1 + intensity * 0.05})`;
                
                // Thêm hiệu ứng overlay màu đỏ và vàng
                const alcoholOverlay = document.createElement('div');
                alcoholOverlay.className = 'effect-overlay';
                alcoholOverlay.style.position = 'absolute';
                alcoholOverlay.style.top = '0';
                alcoholOverlay.style.left = '0';
                alcoholOverlay.style.width = '100%';
                alcoholOverlay.style.height = '100%';
                alcoholOverlay.style.backgroundColor = 'transparent';
                alcoholOverlay.style.mixBlendMode = 'multiply';
                alcoholOverlay.style.opacity = `${intensity * 0.6}`;
                alcoholOverlay.style.backgroundImage = 'radial-gradient(ellipse at center, rgba(255, 0, 0, 0.2) 10%, rgba(255, 255, 0, 0.2) 70%, rgba(255, 150, 0, 0.3) 100%)';
                alcoholOverlay.style.pointerEvents = 'none';
                alcoholOverlay.style.zIndex = '1';
                
                // Xóa overlay cũ nếu có
                const alcoholParent = imgElement.parentElement;
                if (alcoholParent) {
                    const existingOverlays = alcoholParent.querySelectorAll('.effect-overlay');
                    existingOverlays.forEach(el => el.remove());
                    
                    // Thêm overlay mới
                    alcoholParent.appendChild(alcoholOverlay);
                    console.log('Added alcohol effect overlay');
                } else {
                    console.error('Cannot apply alcohol overlay - parent element not found');
                }
                break;
                
            case 'smoking-effects':
                // Mô phỏng tác động của thuốc lá:
                // - Giảm độ bão hòa (da xám xịt)
                // - Tăng độ tương phản (làm rõ nếp nhăn)
                // - Giảm độ sáng (da tối màu)
                // - Tông màu hơi vàng (ngả màu như nicotine)
                // - Thêm hiệu ứng tăng độ sắc nét để hiện nếp nhăn
                
                imgElement.style.filter = `
                    saturate(${100 - 50 * intensity}%)
                    contrast(${100 + 30 * intensity}%)
                    brightness(${100 - 25 * intensity}%)
                    sepia(${40 * intensity}%)
                    hue-rotate(${5 * intensity}deg)
                `;
                
                // Thêm hiệu ứng làm nổi nếp nhăn
                // Sử dụng drop-shadow để tạo hiệu ứng nếp nhăn rõ nét
                imgElement.style.filter += ` drop-shadow(0 0 ${intensity * 2}px rgba(0, 0, 0, 0.3))`;
                
                // Thêm hiệu ứng overlay màu vàng xám
                const smokingOverlay = document.createElement('div');
                smokingOverlay.className = 'effect-overlay';
                smokingOverlay.style.position = 'absolute';
                smokingOverlay.style.top = '0';
                smokingOverlay.style.left = '0';
                smokingOverlay.style.width = '100%';
                smokingOverlay.style.height = '100%';
                smokingOverlay.style.backgroundColor = 'transparent';
                smokingOverlay.style.mixBlendMode = 'multiply';
                smokingOverlay.style.opacity = `${intensity * 0.5}`;
                smokingOverlay.style.backgroundImage = 'linear-gradient(to bottom, rgba(255, 255, 150, 0.1), rgba(100, 100, 100, 0.3))';
                smokingOverlay.style.pointerEvents = 'none';
                smokingOverlay.style.zIndex = '1';
                
                // Xóa overlay cũ nếu có
                const smokingParent = imgElement.parentElement;
                if (smokingParent) {
                    const existingOverlays = smokingParent.querySelectorAll('.effect-overlay');
                    existingOverlays.forEach(el => el.remove());
                    
                    // Thêm overlay mới
                    smokingParent.appendChild(smokingOverlay);
                    console.log('Added smoking effect overlay');
        } else {
                    console.error('Cannot apply smoking overlay - parent element not found');
                }
                break;
        }
    }

    // Update health impacts based on effect and years
    function updateHealthImpacts() {
        // Clear previous content
        healthImpactContent.innerHTML = '';
        
        // Get closest year bracket
        const yearBrackets = Object.keys(healthImpacts[currentEffect]).map(Number).sort((a, b) => a - b);
        let closestYear = yearBrackets[0];
        
        for (const year of yearBrackets) {
            if (Math.abs(year - currentYears) < Math.abs(closestYear - currentYears)) {
                closestYear = year;
            }
        }
        
        // Generate impacts HTML
        const impacts = healthImpacts[currentEffect][closestYear];
        impacts.forEach(impact => {
            const impactItem = document.createElement('div');
            impactItem.className = 'impact-item';
            impactItem.innerHTML = `
                <h5>${impact.title}</h5>
                <p>${impact.text}</p>
            `;
            healthImpactContent.appendChild(impactItem);
        });
        
        // Add age-specific impact if available
        if (userAge && aiTransformer && typeof aiTransformer.getAgeSpecificImpact === 'function') {
            const ageImpact = aiTransformer.getAgeSpecificImpact(currentEffect, currentYears, userAge);
            
            if (ageImpact && (ageImpact.vietnameseNote || ageImpact.detailedDescription)) {
                const ageImpactSection = document.createElement('div');
                ageImpactSection.className = 'age-specific-impact';
                ageImpactSection.style.marginTop = '20px';
                ageImpactSection.style.padding = '15px';
                ageImpactSection.style.backgroundColor = 'rgba(var(--primary-rgb), 0.05)';
                ageImpactSection.style.borderRadius = '8px';
                ageImpactSection.style.borderLeft = '4px solid var(--primary-color)';
                
                let ageImpactHTML = `
                    <h5><i class="fas fa-user-clock"></i> Tác Động Theo Độ Tuổi ${userAge}</h5>
                `;
                
                if (ageImpact.detailedDescription) {
                    ageImpactHTML += `<p style="margin-bottom: 10px;">${ageImpact.detailedDescription}</p>`;
                }
                
                if (ageImpact.vietnameseNote) {
                    ageImpactHTML += `<p style="font-style: italic; color: var(--danger-color);"><i class="fas fa-exclamation-triangle"></i> ${ageImpact.vietnameseNote}</p>`;
                }
                
                if (ageImpact.adjustedYears !== ageImpact.originalYears) {
                    ageImpactHTML += `<p style="font-size: 0.9em; color: #666;"><i class="fas fa-info-circle"></i> Do tuổi của bạn, tác động tương đương với ${ageImpact.adjustedYears} năm sử dụng ở người trưởng thành.</p>`;
                }
                
                ageImpactSection.innerHTML = ageImpactHTML;
                healthImpactContent.appendChild(ageImpactSection);
            }
        }
    }

    // Get effect label
    function getEffectLabel() {
        switch (currentEffect) {
            case 'drug-effects': return 'Ma Túy';
            case 'alcohol-effects': return 'Rượu Bia';
            case 'smoking-effects': return 'Thuốc Lá';
            default: return '';
        }
    }

    // Reset mirror
    function resetMirror() {
        // Clear images
        uploadedImage = null;
        detectedFaceData = null;
        
        // Hide results
        mirrorResults.style.display = 'none';
        
        // Reset file input
        imageUpload.value = '';
        
        // Reset year slider
        currentYears = 5;
        yearsSlider.value = currentYears;
        yearsLabel.textContent = `${currentYears} năm`;
        
        // Hide debug face markers
        faceDetectionCanvas.style.display = 'none';
        
        // Show upload zone
        const uploadOptions = document.querySelectorAll('.upload-option-btn');
        uploadOptions.forEach(option => {
            if (option.id === 'upload-option-file') {
                option.click();
            }
        });
    }

    // Download comparison
    function downloadComparison() {
        if (!uploadedImage) {
            showToast('Không có hình ảnh để tải xuống', 'error');
            return;
        }
        
        try {
        const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
        
            // Get comparison images
        const originalImg = originalImageContainer.querySelector('img');
        const transformedImg = transformedImageContainer.querySelector('img');
        
        if (!originalImg || !transformedImg) {
                throw new Error('Không tìm thấy hình ảnh so sánh');
        }
        
            // Set canvas size
            const imgWidth = Math.max(originalImg.naturalWidth, 400);
            const imgHeight = Math.max(originalImg.naturalHeight, 400);
        const padding = 20;
            const spacing = 10;
        const labelHeight = 40;
        
            canvas.width = imgWidth * 2 + padding * 2 + spacing;
            canvas.height = imgHeight + padding * 2 + labelHeight;
        
        // Fill background
            ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
            // Draw title
            ctx.fillStyle = '#1a1a1a';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Tác Động Của ${getEffectLabel()} Sau ${currentYears} Năm`, canvas.width / 2, padding + 20);
        
        // Draw original image
            ctx.drawImage(originalImg, padding, padding + labelHeight, imgWidth, imgHeight);
        
        // Draw transformed image
            ctx.drawImage(transformedImg, imgWidth + padding + spacing, padding + labelHeight, imgWidth, imgHeight);
            
            // Draw labels
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(padding, imgHeight + padding + labelHeight - 30, imgWidth, 30);
            ctx.fillRect(imgWidth + padding + spacing, imgHeight + padding + labelHeight - 30, imgWidth, 30);
            
            ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
            ctx.fillText('HIỆN TẠI', padding + imgWidth / 2, imgHeight + padding + labelHeight - 10);
            ctx.fillText(`SAU ${currentYears} NĂM`, imgWidth + padding + spacing + imgWidth / 2, imgHeight + padding + labelHeight - 10);
            
            // Add watermark
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '14px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('vicongdongkhoemanh.org', canvas.width - padding, canvas.height - 5);
            
            // Convert to image and download
            const link = document.createElement('a');
            link.download = `tac-dong-${currentEffect}-${currentYears}-nam.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.8);
            link.click();
            
            showToast('Đã tải xuống hình ảnh so sánh', 'success');
        } catch (error) {
            console.error('Error during download:', error);
            showToast('Lỗi khi tải xuống hình ảnh: ' + error.message, 'error');
        }
    }

    // Share results
    function shareResults() {
        if (!uploadedImage) {
            showToast('Không có hình ảnh để chia sẻ', 'error');
            return;
        }
        
        // Generate sharing text
        const shareText = `Tôi vừa xem tác động của ${getEffectLabel()} sau ${currentYears} năm sử dụng! Hãy xem và chia sẻ để nâng cao nhận thức về hậu quả của tệ nạn xã hội. #VìCộngĐồngKhỏeMạnh #PhòngChốngTệNạn`;
        
        // Check if Web Share API is supported
        if (navigator.share) {
                navigator.share({
                title: 'Gương Soi Tương Lai - Hậu Quả Của Tệ Nạn Xã Hội',
                text: shareText,
                url: window.location.href
            }).then(() => {
                showToast('Đã chia sẻ thành công', 'success');
            }).catch(error => {
                console.error('Error sharing:', error);
                showToast('Lỗi khi chia sẻ: ' + error.message, 'error');
                
                // Fallback to clipboard
                fallbackShare(shareText);
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            fallbackShare(shareText);
        }
    }
    
    // Fallback share method
    function fallbackShare(text) {
        try {
            // Copy to clipboard
            navigator.clipboard.writeText(text + ' ' + window.location.href).then(() => {
                showToast('Đã sao chép vào clipboard! Bạn có thể dán vào ứng dụng mạng xã hội', 'success');
            }).catch(err => {
                console.error('Clipboard error:', err);
                showToast('Không thể sao chép vào clipboard', 'error');
            });
        } catch (error) {
            console.error('Share fallback error:', error);
            showToast('Không thể chia sẻ. Hãy thử lại sau.', 'error');
        }
    }

    // Toast notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        
        let icon = '';
        switch (type) {
            case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
            case 'error': icon = '<i class="fas fa-exclamation-circle"></i>'; break;
            case 'warning': icon = '<i class="fas fa-exclamation-triangle"></i>'; break;
            default: icon = '<i class="fas fa-info-circle"></i>';
        }
        
        toast.innerHTML = `
            ${icon}
                <span>${message}</span>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            removeToast(toast);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            removeToast(toast);
        }, 5000);
        
        return toast;
    }

    // Remove toast
    function removeToast(toast) {
        toast.classList.remove('show');
        
        // Wait for animation to finish
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // Initialize the module
    initializeMirror();
});