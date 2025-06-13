// Face Transformation Effects - Future Mirror
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animation library
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });

    // Variables
    let currentEffect = 'drug-effects'; // Default effect
    let uploadedImage = null;
    let yearsSlider = document.getElementById('years-slider');
    let yearsLabel = document.getElementById('years-label');
    let currentYears = 5; // Default years
    let isAiTransformEnabled = true; // Toggle between AI and CSS filters
    let isProcessing = false; // Flag to prevent multiple API calls
    let detectedFaceData = null; // Store detected face data
    
    // Initialize AI modules
    let faceDetector = new FaceDetector();
    let aiTransformer = new AIFaceTransformer(); // Sử dụng AIFaceTransformer thay vì FaceTransformer
    
    // Thiết lập API key cho Replicate API
    const replicateApiKey = 'r8_abc123'; // Thay bằng API key thực của bạn
    aiTransformer.initialize(replicateApiKey);
    
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
        // Tải mô hình trước
        await checkAndDownloadModels();
        
        // Initialize the range slider
        setupYearSlider();
        
        // Set up the upload handlers
        setupUploadHandlers();
        
        // Setup event listeners
        setupEventListeners();
        
        // Khởi tạo face detector khi trang tải xong
        await faceDetector.initialize().then(() => {
            console.log('Face detector initialized successfully');
            aiStatusDisplay.innerHTML = '<i class="fas fa-check-circle"></i> <span>AI Đã Sẵn Sàng</span>';
        }).catch(error => {
            console.error('Failed to initialize face detector:', error);
            aiStatusDisplay.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Lỗi Khởi Tạo AI</span>';
            isAiTransformEnabled = false;
            toggleAiButton.innerHTML = '<i class="fas fa-sliders-h"></i> Đang Dùng CSS Filters';
            toggleAiButton.classList.remove('active');
        });
        
        console.log('Future Mirror module initialized');
    }

    // Thêm hàm kiểm tra và tải mô hình trước
    async function checkAndDownloadModels() {
        try {
            console.log('Kiểm tra mô hình face-api...');
            
            // Đã sửa để sử dụng mô hình từ thư mục weights thay vì tải từ API
            console.log('Sử dụng mô hình face-api từ thư mục weights');
            return true;
            
            // Xóa code cũ gọi API download-models.php
        } catch (error) {
            console.warn('Lỗi khi kiểm tra mô hình:', error);
            // Vẫn trả về true để tiếp tục quá trình
            return true;
        }
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

        uploadDropzone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });

        uploadDropzone.addEventListener('dragleave', function() {
            this.classList.remove('dragover');
        });

        uploadDropzone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            handleFileUpload(e.dataTransfer.files[0]);
        });

        // File input change
        imageUpload.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                handleFileUpload(this.files[0]);
            }
        });
    }

    // Set up event listeners
    function setupEventListeners() {
        // Effect tabs
        effectTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetEffect = this.getAttribute('data-target');
                changeEffect(targetEffect);
            });
        });

        // Reset button
        resetButton.addEventListener('click', function() {
            resetMirror();
        });

        // Download button
        downloadButton.addEventListener('click', function() {
            downloadComparison();
        });

        // Share button
        shareButton.addEventListener('click', function() {
            shareResults();
        });
    }

    // Toggle debug mode
    function toggleDebugMode() {
        debugMode = !debugMode;
        if (debugMode) {
            toggleDebugButton.classList.add('active');
            showToast('Debug mode enabled', 'info');
            
            // If we have a face detected, show landmarks
            if (detectedFaceData && uploadedImage) {
                const debugCanvas = faceDetector.drawFaceLandmarks(uploadedImage, detectedFaceData);
                
                // Create a debug preview
                const debugContainer = document.createElement('div');
                debugContainer.className = 'debug-container';
                debugContainer.innerHTML = '<h4>Debug: Face Landmarks</h4>';
                debugContainer.appendChild(debugCanvas);
                
                // Insert after original image
                originalImageContainer.parentNode.insertBefore(debugContainer, originalImageContainer.nextSibling);
            }
        } else {
            toggleDebugButton.classList.remove('active');
            showToast('Debug mode disabled', 'info');
            
            // Remove debug elements
            const debugContainer = document.querySelector('.debug-container');
            if (debugContainer) {
                debugContainer.remove();
            }
        }
    }

    // Toggle between AI and CSS filters
    function toggleAiMode() {
        isAiTransformEnabled = !isAiTransformEnabled;
        
        if (isAiTransformEnabled) {
            toggleAiButton.innerHTML = '<i class="fas fa-robot"></i> Đang Dùng AI Thực';
            toggleAiButton.classList.add('active');
            aiStatusDisplay.style.display = 'flex';
        } else {
            toggleAiButton.innerHTML = '<i class="fas fa-sliders-h"></i> Đang Dùng CSS Filters';
            toggleAiButton.classList.remove('active');
            aiStatusDisplay.style.display = 'none';
        }
        
        if (uploadedImage) {
            transformFace();
        }
    }

    // Change current effect
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
        
        // If an image is already uploaded, transform it with the new effect
        if (uploadedImage) {
            transformFace();
        }
    }

    // Handle file upload
    function handleFileUpload(file) {
        if (!file) return;
        
        // Check file type
        const fileType = file.type;
        if (!fileType.startsWith('image/')) {
            showToast('Vui lòng tải lên file hình ảnh (JPG, PNG)', 'error');
            return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Kích thước file tối đa là 5MB', 'error');
            return;
        }
        
        // Show loading overlay
        loadingOverlay.style.display = 'flex';
        loadingOverlay.querySelector('p').textContent = 'Đang xử lý hình ảnh...';
        
        // Create a FileReader to read the image
        const reader = new FileReader();
        reader.onload = function(e) {
            // Store the uploaded image
            uploadedImage = new Image();
            uploadedImage.onload = function() {
                // Process the face
                detectAndTransformFace();
            };
            uploadedImage.src = e.target.result;
        };
        reader.onerror = function() {
            loadingOverlay.style.display = 'none';
            showToast('Lỗi khi đọc file. Vui lòng thử lại.', 'error');
        };
        reader.readAsDataURL(file);
    }

    // Detect and transform face
    async function detectAndTransformFace() {
        try {
            // Show results and hide upload section
            mirrorResults.style.display = 'block';
            
            // Display original image
            originalImageContainer.innerHTML = '';
            const originalImg = uploadedImage.cloneNode();
            originalImageContainer.appendChild(originalImg);
            
            // Detect face using our face detector
            loadingOverlay.querySelector('p').textContent = 'Đang nhận diện khuôn mặt...';
            
            try {
                // Use face-api.js to detect face in the image
                faceData = await faceDetector.detectFace(uploadedImage);
                
                // Check if we're using fallback detection method
                if (faceData.isFallback) {
                    console.log('Sử dụng phương pháp dự phòng để nhận diện khuôn mặt');
                    // Nếu đang sử dụng fallback, chuyển qua CSS filter tự động
                    isAiTransformEnabled = false;
                    toggleAiButton.innerHTML = '<i class="fas fa-sliders-h"></i> Đang Dùng CSS Filters';
                    toggleAiButton.classList.remove('active');
                    aiStatusDisplay.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Sử dụng CSS (AI lỗi)</span>';
                } else {
                    console.log('Face detected:', faceData);
                }
                
                loadingOverlay.querySelector('p').textContent = 'Đang biến đổi khuôn mặt...';
                
                // Draw face landmarks for debug mode
                if (debugMode) {
                    const debugContainer = document.createElement('div');
                    debugContainer.className = 'debug-container';
                    const landmarksCanvas = document.createElement('canvas');
                    landmarksCanvas.width = uploadedImage.width;
                    landmarksCanvas.height = uploadedImage.height;
                    debugContainer.appendChild(landmarksCanvas);
                    document.querySelector('.future-mirror-container').appendChild(debugContainer);
                    
                    const ctx = landmarksCanvas.getContext('2d');
                    ctx.drawImage(uploadedImage, 0, 0, landmarksCanvas.width, landmarksCanvas.height);
                    
                    // Draw face box
                    ctx.strokeStyle = '#00ff00';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(faceData.box.x, faceData.box.y, faceData.box.width, faceData.box.height);
                    
                    // Draw landmarks
                    ctx.fillStyle = '#ff0000';
                    faceData.landmarks.forEach(point => {
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
                        ctx.fill();
                    });
                }
                
                // Transform face based on the selected effect
                await transformFace();
                
                // Hide loading overlay
                loadingOverlay.style.display = 'none';
                
                // Show download and share buttons
                downloadButton.style.display = 'block';
                shareButton.style.display = 'block';
                
                // Update health impact information
                updateHealthImpacts();
            } catch (error) {
                console.error('Error in face detection or transformation:', error);
                loadingOverlay.style.display = 'none';
                
                // Sử dụng CSS filters khi có lỗi
                isAiTransformEnabled = false;
                toggleAiButton.innerHTML = '<i class="fas fa-sliders-h"></i> Đang Dùng CSS Filters';
                toggleAiButton.classList.remove('active');
                aiStatusDisplay.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Sử dụng CSS (AI lỗi)</span>';
                
                // Hiển thị ảnh gốc và áp dụng CSS filters
                transformedImageContainer.innerHTML = '';
                const transformedImg = uploadedImage.cloneNode();
                transformedImageContainer.appendChild(transformedImg);
                
                // Áp dụng CSS filter theo loại hiệu ứng đã chọn
                applyTransformationEffects(transformedImg);
                
                // Hiển thị thông báo
                showToast('Không thể nhận diện khuôn mặt chính xác. Đang sử dụng CSS filters.', 'warning');
                
                // Cập nhật thông tin sức khỏe
                updateHealthImpacts();
                
                // Hiển thị nút download và share
                downloadButton.style.display = 'block';
                shareButton.style.display = 'block';
            }
        } catch (error) {
            console.error('Fatal error:', error);
            loadingOverlay.style.display = 'none';
            showToast('Đã xảy ra lỗi: ' + error.message, 'error');
        }
    }

    // Transform face based on selected effect and years
    async function transformFace() {
        if (isProcessing) {
            showToast('Đang xử lý ảnh trước đó, vui lòng đợi...', 'info');
            return;
        }
        
        // Set processing flag
        isProcessing = true;
        
        // Update future label
        let effectName = '';
        switch (currentEffect) {
            case 'drug-effects':
                effectName = 'MA TÚY';
                break;
            case 'alcohol-effects':
                effectName = 'RƯỢU BIA';
                break;
            case 'smoking-effects':
                effectName = 'THUỐC LÁ';
                break;
        }
        futureLabel.textContent = `SAU ${currentYears} NĂM SỬ DỤNG ${effectName}`;
        
        // Display transformed image container
        transformedImageContainer.innerHTML = '';
        const transformedImg = document.createElement('img');
        transformedImg.src = uploadedImage.src; // Start with the original image
        transformedImageContainer.appendChild(transformedImg);
        
        // Hiển thị loading placeholder trước
        const loadingPlaceholder = document.createElement('div');
        loadingPlaceholder.className = 'transform-loading-placeholder';
        loadingPlaceholder.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Đang sử dụng AI để mô phỏng tác động của ${effectName.toLowerCase()} sau ${currentYears} năm...</p>
            <small>Quá trình này có thể mất 15-30 giây</small>
        `;
        transformedImageContainer.appendChild(loadingPlaceholder);
        
        // Kiểm tra xem có thể sử dụng AI không
        if (isAiTransformEnabled) {
            // Show loading overlay
            loadingOverlay.style.display = 'flex';
            loadingOverlay.querySelector('p').textContent = 'Đang áp dụng biến đổi AI...';
            
            try {
                // Sử dụng AI Transformer mới để biến đổi hình ảnh
                console.log(`Transforming face with ${effectName} effect for ${currentYears} years...`);
                
                // Gọi aiTransformer để biến đổi hình ảnh
                const transformedImageUrl = await aiTransformer.transformFace(
                    uploadedImage,
                    currentEffect,
                    currentYears
                );
                
                // Update the image with the transformed version
                transformedImg.onload = function() {
                    // Xóa loading placeholder
                    if (loadingPlaceholder) {
                        loadingPlaceholder.remove();
                    }
                    
                    // Gắn class animation cho hiệu ứng fade in
                    transformedImg.classList.add('transform-fade-in');
                    
                    isProcessing = false;
                    loadingOverlay.style.display = 'none';
                    
                    // Hiển thị thông báo thành công
                    showToast('Biến đổi AI hoàn tất!', 'success');
                };
                transformedImg.onerror = function() {
                    console.error('Failed to load transformed image');
                    // Xóa loading placeholder
                    if (loadingPlaceholder) {
                        loadingPlaceholder.remove();
                    }
                    
                    isProcessing = false;
                    loadingOverlay.style.display = 'none';
                    showToast('Không thể tải hình ảnh đã biến đổi. Thử lại với CSS filters.', 'error');
                    applyTransformationEffects(transformedImg);
                };
                transformedImg.src = transformedImageUrl;
            } catch (error) {
                console.error('Error in AI transformation:', error);
                // Xóa loading placeholder
                if (loadingPlaceholder) {
                    loadingPlaceholder.remove();
                }
                
                showToast('Lỗi khi áp dụng AI. Sử dụng CSS filters thay thế.', 'warning');
                
                // Fallback to CSS filters
                applyTransformationEffects(transformedImg);
                isProcessing = false;
                loadingOverlay.style.display = 'none';
            }
        } else {
            // Xóa loading placeholder
            if (loadingPlaceholder) {
                loadingPlaceholder.remove();
            }
            
            // Use CSS filters as fallback
            applyTransformationEffects(transformedImg);
            isProcessing = false;
            loadingOverlay.style.display = 'none';
        }
        
        // Update health impacts
        updateHealthImpacts();
    }

    // Apply visual transformation effects to the image
    function applyTransformationEffects(imgElement) {
        // Apply CSS filters based on effect and years
        let filterValue = '';
        
        if (currentEffect === 'drug-effects') {
            // Drug effects: gaunt, pale, damaged skin
            const hueRotate = Math.min(currentYears * 3, 40);
            const saturate = Math.max(100 - currentYears * 5, 30);
            const brightness = Math.max(100 - currentYears * 3, 50);
            const contrast = 100 + currentYears * 5;
            const sepia = Math.min(currentYears * 3, 50);
            
            filterValue = `hue-rotate(${hueRotate}deg) saturate(${saturate}%) brightness(${brightness}%) contrast(${contrast}%) sepia(${sepia}%)`;
        }
        else if (currentEffect === 'alcohol-effects') {
            // Alcohol effects: red, puffy, bloated
            const saturate = 100 + currentYears * 3;
            const brightness = Math.max(100 - currentYears, 80);
            const contrast = 100 - currentYears * 2;
            const hueRotate = Math.min(currentYears, 15);
            
            filterValue = `hue-rotate(-${hueRotate}deg) saturate(${saturate}%) brightness(${brightness}%) contrast(${contrast}%)`;
        }
        else if (currentEffect === 'smoking-effects') {
            // Smoking effects: yellowed, wrinkled, dry
            const sepia = Math.min(currentYears * 3, 50);
            const saturate = Math.max(100 - currentYears * 2, 60);
            const brightness = Math.max(100 - currentYears * 2, 70);
            const contrast = 100 + currentYears * 2;
            
            filterValue = `sepia(${sepia}%) saturate(${saturate}%) brightness(${brightness}%) contrast(${contrast}%)`;
        }
        
        imgElement.style.filter = filterValue;
        
        // Add CSS class based on years for additional effects
        imgElement.className = '';
        if (currentYears <= 5) {
            imgElement.classList.add('transform-light');
        } else if (currentYears <= 10) {
            imgElement.classList.add('transform-medium');
        } else if (currentYears <= 15) {
            imgElement.classList.add('transform-heavy');
        } else {
            imgElement.classList.add('transform-severe');
        }
    }

    // Update health impacts based on effect and years
    function updateHealthImpacts() {
        healthImpactContent.innerHTML = '';
        
        // Find closest year milestone
        let yearMilestone = 1;
        if (currentYears >= 20) yearMilestone = 20;
        else if (currentYears >= 15) yearMilestone = 15;
        else if (currentYears >= 10) yearMilestone = 10;
        else if (currentYears >= 5) yearMilestone = 5;
        
        // Get impacts for the current effect and year
        const impacts = healthImpacts[currentEffect][yearMilestone];
        
        // Create impact items
        impacts.forEach(impact => {
            const impactItem = document.createElement('div');
            impactItem.className = 'impact-item';
            
            const title = document.createElement('h5');
            title.textContent = impact.title;
            
            const text = document.createElement('p');
            text.textContent = impact.text;
            
            impactItem.appendChild(title);
            impactItem.appendChild(text);
            healthImpactContent.appendChild(impactItem);
        });
    }

    // Reset the mirror
    function resetMirror() {
        uploadedImage = null;
        detectedFaceData = null;
        mirrorResults.style.display = 'none';
        originalImageContainer.innerHTML = '';
        transformedImageContainer.innerHTML = '';
        healthImpactContent.innerHTML = '';
        imageUpload.value = '';
        yearsSlider.value = 5;
        currentYears = 5;
        yearsLabel.textContent = `5 năm`;
        
        // Remove any debug elements
        const debugContainer = document.querySelector('.debug-container');
        if (debugContainer) {
            debugContainer.remove();
        }
    }

    // Download comparison image
    function downloadComparison() {
        // Create a canvas to combine both images
        const canvas = document.createElement('canvas');
        
        // Get the images
        const originalImg = originalImageContainer.querySelector('img');
        const transformedImg = transformedImageContainer.querySelector('img');
        
        if (!originalImg || !transformedImg) {
            showToast('Không thể tải ảnh, vui lòng thử lại', 'error');
            return;
        }
        
        // Set canvas size to fit both images side by side with padding
        const padding = 20;
        const labelHeight = 40;
        canvas.width = originalImg.width + transformedImg.width + padding * 3;
        canvas.height = Math.max(originalImg.height, transformedImg.height) + padding * 2 + labelHeight;
        
        // Get canvas context
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw divider
        ctx.fillStyle = '#ddd';
        ctx.fillRect(originalImg.width + padding * 1.5, 0, 1, canvas.height);
        
        // Draw original image
        ctx.drawImage(originalImg, padding, padding + labelHeight);
        
        // Draw transformed image
        ctx.drawImage(transformedImg, originalImg.width + padding * 2, padding + labelHeight);
        
        // Add labels
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        
        // Original label
        ctx.fillText('HIỆN TẠI', padding + originalImg.width / 2, padding + 20);
        
        // Transformed label
        let effectName = '';
        switch (currentEffect) {
            case 'drug-effects': effectName = 'MA TÚY'; break;
            case 'alcohol-effects': effectName = 'RƯỢU BIA'; break;
            case 'smoking-effects': effectName = 'THUỐC LÁ'; break;
        }
        ctx.fillText(`SAU ${currentYears} NĂM SỬ DỤNG ${effectName}`, 
            originalImg.width + padding * 2 + transformedImg.width / 2, padding + 20);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = dataUrl;
        downloadLink.download = `tuong-lai-sau-${currentYears}-nam-su-dung-${currentEffect}.png`;
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        showToast('Đã tải ảnh thành công!', 'success');
    }

    // Share results
    function shareResults() {
        // In a real implementation, we would create a shareable link
        // For now, we'll just show a toast message
        showToast('Tính năng chia sẻ đang được phát triển', 'info');
        
        /* Example implementation for Web Share API if available
        if (navigator.share) {
            // Create a temporary canvas to combine images
            const canvas = document.createElement('canvas');
            // ... code to draw both images on canvas ...
            
            // Convert canvas to blob
            canvas.toBlob(function(blob) {
                // Create file from blob
                const file = new File([blob], 'future-mirror-comparison.png', { type: 'image/png' });
                
                // Share
                navigator.share({
                    title: 'Gương Soi Tương Lai',
                    text: `Xem hình ảnh của tôi sau ${currentYears} năm sử dụng ${currentEffect}`,
                    files: [file]
                })
                .then(() => console.log('Shared successfully'))
                .catch((error) => console.log('Error sharing:', error));
            });
        } else {
            showToast('Trình duyệt của bạn không hỗ trợ tính năng chia sẻ', 'warning');
        }
        */
    }

    // Toast notification
    function showToast(message, type) {
        // Check for existing toast container
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type || 'info'}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="${type === 'success' ? 'fas fa-check-circle' : type === 'warning' ? 'fas fa-exclamation-triangle' : type === 'error' ? 'fas fa-times-circle' : 'fas fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close">&times;</button>
        `;
        
        // Add toast to container
        toastContainer.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-remove toast after 5 seconds
        const timeout = setTimeout(() => {
            removeToast(toast);
        }, 5000);
        
        // Handle close button click
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(timeout);
            removeToast(toast);
        });
    }

    // Remove toast
    function removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }

    // Initialize the module
    initializeMirror();
});