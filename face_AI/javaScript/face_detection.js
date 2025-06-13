/**
 * Mô-đun Nhận Diện Khuôn Mặt
 * Sử dụng face-api.js để phát hiện, nhận diện và phân tích khuôn mặt
 */

// Biến toàn cục
let isFaceDetectionModelLoaded = false;
let detectedFaces = [];
let currentImage = null;

// Đường dẫn tới mô hình phù hợp với phiên bản face-api.js 0.22.1
// Sử dụng GitHub URL thay vì CDN
const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
// Đường dẫn dự phòng
const FALLBACK_MODEL_URL = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model';
// Đường dẫn dự phòng thứ hai
const SECOND_FALLBACK_URL = 'https://unpkg.com/face-api.js@0.22.1/weights';
// Đường dẫn local
const LOCAL_MODEL_URL = '../models';

// Đặc điểm khuôn mặt châu Á - giá trị tham khảo
const ASIAN_FACE_FEATURES = {
    // Tỷ lệ mắt (độ rộng/độ cao của mắt)
    eyeRatio: { min: 2.3, max: 3.2 },
    // Tỷ lệ mũi (độ rộng/độ cao của mũi)
    noseRatio: { min: 0.6, max: 0.9 },
    // Khoảng cách giữa hai mắt / độ rộng khuôn mặt
    eyeDistance: { min: 0.3, max: 0.38 },
    // Tỷ lệ mặt (độ rộng / độ cao)
    faceRatio: { min: 0.75, max: 0.9 },
};

// Kiểm tra xem face-api.js và TensorFlow.js đã được tải chưa
function isFaceApiAvailable() {
    return typeof faceapi !== 'undefined' && typeof tf !== 'undefined';
}

// Tạo mô hình đơn giản để kiểm tra sự tương thích với backend
async function testBackendCompatibility() {
    try {
        // Tạo một tensor đơn giản và thử thực hiện phép toán
        const tensor = tf.tensor1d([1, 2, 3]);
        const result = tensor.square();
        result.dispose();
        tensor.dispose();
        return true;
    } catch (error) {
        console.error("Backend không tương thích:", error);
        return false;
    }
}

// Khởi tạo và tải mô hình nhận diện khuôn mặt
async function loadFaceDetectionModels() {
    try {
        // Kiểm tra xem đã tải mô hình chưa
        if (isFaceDetectionModelLoaded) {
            console.log('Mô hình nhận diện khuôn mặt đã được tải trước đó');
            return true;
        }

        // Kiểm tra xem face-api.js đã được tải chưa
        if (!isFaceApiAvailable()) {
            console.error('face-api.js hoặc TensorFlow.js chưa được tải');
            updateLoadingMessage('Không thể tải face-api.js. Đang thử tải lại thư viện...');
            
            // Thử tải lại TensorFlow và face-api
            try {
                // Động tạo script elements để tải lại thư viện
                await loadScriptDynamically('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.7.4/dist/tf.min.js');
                await loadScriptDynamically('https://cdn.jsdelivr.net/npm/face-api.js@0.22.1/dist/face-api.min.js');
                
                // Thử tải từ nguồn khác nếu thất bại
                if (!isFaceApiAvailable()) {
                    await loadScriptDynamically('https://unpkg.com/@tensorflow/tfjs@1.7.4/dist/tf.min.js');
                    await loadScriptDynamically('https://unpkg.com/face-api.js@0.22.1/dist/face-api.min.js');
                }
                
                // Kiểm tra lại sau khi tải
                if (!isFaceApiAvailable()) {
                    throw new Error('Vẫn không thể tải face-api.js sau khi thử lại');
                }
                
                console.log('Đã tải lại thư viện thành công');
            } catch (loadError) {
                console.error('Không thể tải lại thư viện:', loadError);
                updateLoadingMessage('Không thể tải thư viện. Vui lòng làm mới trang và thử lại.');
                return false;
            }
        }

        // Kiểm tra backend tương thích
        const isBackendCompatible = await testBackendCompatibility();
        if (!isBackendCompatible) {
            console.error('Backend TensorFlow.js không tương thích');
            updateLoadingMessage('Backend TensorFlow.js không tương thích. Đang chuyển sang chế độ CSS filter.');
            return false;
        }

        // Hiển thị trạng thái tải
        updateLoadingMessage('Đang tải mô hình nhận diện khuôn mặt...');
        
        // Tắt cảnh báo console để tránh thông báo về source map
        const originalWarn = console.warn;
        console.warn = function(msg) {
            if (msg && (
                msg.includes('source map') || 
                msg.includes('already registered') ||
                msg.includes('Platform browser has already been set')
            )) {
                return;
            }
            originalWarn.apply(console, arguments);
        };
        
        console.log('Bắt đầu tải các mô hình nhận diện khuôn mặt từ GitHub:', MODEL_URL);
        
        // Tải các mô hình cần thiết
        try {
            // Tải lần lượt từng mô hình để dễ theo dõi tiến trình hơn
            updateLoadingMessage('Đang tải mô hình TinyFaceDetector...');
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            console.log('Đã tải mô hình tinyFaceDetector');
            
            updateLoadingMessage('Đang tải mô hình FaceLandmark68...');
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
            console.log('Đã tải mô hình faceLandmark68Net');
            
            // Tùy chọn tải thêm các mô hình khác nếu cần
            updateLoadingMessage('Đang tải mô hình FaceRecognition...');
            await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
            console.log('Đã tải mô hình faceRecognitionNet');
            
            updateLoadingMessage('Đang tải mô hình FaceExpression...');
            await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
            console.log('Đã tải mô hình faceExpressionNet');
            
            updateLoadingMessage('Đang tải mô hình AgeGender...');
            await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
            console.log('Đã tải mô hình ageGenderNet');
        } catch (error) {
            console.error('Lỗi khi tải mô hình từ GitHub:', error);
            throw error;
        }

        // Khôi phục hàm console.warn
        console.warn = originalWarn;

        console.log('Tải mô hình nhận diện khuôn mặt thành công');
        isFaceDetectionModelLoaded = true;
        return true;
    } catch (error) {
        console.error('Lỗi khi tải mô hình nhận diện khuôn mặt:', error);
        console.log('Thử tải lại từ nguồn dự phòng vladmandic/face-api:', FALLBACK_MODEL_URL);
        
        try {
            // Thử lại với nguồn dự phòng
            updateLoadingMessage('Đang thử lại với nguồn dự phòng vladmandic/face-api...');
            
            // Tải từng mô hình một từ nguồn dự phòng
            await faceapi.nets.tinyFaceDetector.loadFromUri(FALLBACK_MODEL_URL);
            console.log('Đã tải mô hình tinyFaceDetector từ nguồn dự phòng');
            
            await faceapi.nets.faceLandmark68Net.loadFromUri(FALLBACK_MODEL_URL);
            console.log('Đã tải mô hình faceLandmark68Net từ nguồn dự phòng');
            
            await faceapi.nets.faceRecognitionNet.loadFromUri(FALLBACK_MODEL_URL);
            console.log('Đã tải mô hình faceRecognitionNet từ nguồn dự phòng');
            
            await faceapi.nets.faceExpressionNet.loadFromUri(FALLBACK_MODEL_URL);
            console.log('Đã tải mô hình faceExpressionNet từ nguồn dự phòng');
            
            await faceapi.nets.ageGenderNet.loadFromUri(FALLBACK_MODEL_URL);
            console.log('Đã tải mô hình ageGenderNet từ nguồn dự phòng');
            
            console.log('Tải mô hình từ nguồn dự phòng vladmandic/face-api thành công');
            isFaceDetectionModelLoaded = true;
            return true;
        } catch (retryError) {
            console.error('Lỗi khi thử tải mô hình từ nguồn dự phòng:', retryError);
            console.log('Thử tải từ nguồn dự phòng unpkg:', SECOND_FALLBACK_URL);
            
            try {
                // Thử lại với nguồn dự phòng unpkg
                updateLoadingMessage('Đang thử tải từ nguồn dự phòng unpkg...');
                
                // Tải từng mô hình từ nguồn unpkg
                await faceapi.nets.tinyFaceDetector.loadFromUri(SECOND_FALLBACK_URL);
                console.log('Đã tải mô hình tinyFaceDetector từ unpkg');
                
                await faceapi.nets.faceLandmark68Net.loadFromUri(SECOND_FALLBACK_URL);
                console.log('Đã tải mô hình faceLandmark68Net từ unpkg');
                
                await faceapi.nets.faceRecognitionNet.loadFromUri(SECOND_FALLBACK_URL);
                console.log('Đã tải mô hình faceRecognitionNet từ unpkg');
                
                await faceapi.nets.faceExpressionNet.loadFromUri(SECOND_FALLBACK_URL);
                console.log('Đã tải mô hình faceExpressionNet từ unpkg');
                
                await faceapi.nets.ageGenderNet.loadFromUri(SECOND_FALLBACK_URL);
                console.log('Đã tải mô hình ageGenderNet từ unpkg');
                
                console.log('Tải mô hình từ nguồn unpkg thành công');
                isFaceDetectionModelLoaded = true;
                return true;
            } catch (secondRetryError) {
                console.error('Lỗi khi thử tải mô hình từ nguồn unpkg:', secondRetryError);
                console.log('Thử tải từ thư mục local:', LOCAL_MODEL_URL);
                
                try {
                    // Thử lại với mô hình local
                    updateLoadingMessage('Đang thử tải từ mô hình cục bộ...');
                    
                    // Tải từng mô hình từ thư mục local
                    await faceapi.nets.tinyFaceDetector.loadFromUri(LOCAL_MODEL_URL);
                    console.log('Đã tải mô hình tinyFaceDetector từ local');
                    
                    await faceapi.nets.faceLandmark68Net.loadFromUri(LOCAL_MODEL_URL);
                    console.log('Đã tải mô hình faceLandmark68Net từ local');
                    
                    await faceapi.nets.faceRecognitionNet.loadFromUri(LOCAL_MODEL_URL);
                    console.log('Đã tải mô hình faceRecognitionNet từ local');
                    
                    await faceapi.nets.faceExpressionNet.loadFromUri(LOCAL_MODEL_URL);
                    console.log('Đã tải mô hình faceExpressionNet từ local');
                    
                    await faceapi.nets.ageGenderNet.loadFromUri(LOCAL_MODEL_URL);
                    console.log('Đã tải mô hình ageGenderNet từ local');
                    
                    console.log('Tải mô hình local thành công');
                    isFaceDetectionModelLoaded = true;
                    return true;
                } catch (finalError) {
                    console.error('Lỗi khi thử tải mô hình từ tất cả các nguồn:', finalError);
                    updateLoadingMessage('Không thể tải mô hình nhận diện khuôn mặt. Đang sử dụng chế độ CSS filter.');
                    return false;
                }
            }
        }
    }
}

// Hàm để tải script động
function loadScriptDynamically(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Cập nhật thông báo tải
function updateLoadingMessage(message) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        const loadingMessage = loadingOverlay.querySelector('p');
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
        
        // Hiển thị overlay nếu chưa hiển thị
        if (loadingOverlay.style.display === 'none') {
            loadingOverlay.style.display = 'flex';
        }
    }
}

// Ẩn overlay tải
function hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Nhận diện khuôn mặt từ hình ảnh
async function detectFacesInImage(imageElement) {
    try {
        console.log('Bắt đầu nhận diện khuôn mặt trong hình ảnh...');
        
        // Đảm bảo mô hình đã được tải
        if (!isFaceDetectionModelLoaded) {
            console.log('Mô hình chưa được tải, đang tải mô hình...');
            const modelLoaded = await loadFaceDetectionModels();
            if (!modelLoaded) {
                console.error('Không thể tải mô hình nhận diện khuôn mặt');
                return { success: false, message: 'Không thể tải mô hình nhận diện khuôn mặt' };
            }
        }

        // Khởi tạo tùy chọn
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 });
        
        try {
            // Phát hiện khuôn mặt và các điểm mốc
            const detections = await faceapi.detectAllFaces(imageElement, options)
                .withFaceLandmarks()
                .withFaceDescriptors();
            
            console.log(`Đã phát hiện ${detections.length} khuôn mặt`);
            
            // Cập nhật biến toàn cục
            detectedFaces = detections;
            currentImage = imageElement;
            
            return {
                success: true,
                faces: detections,
                message: `Đã phát hiện ${detections.length} khuôn mặt`
            };
        } catch (detectionError) {
            console.error('Lỗi khi phát hiện khuôn mặt:', detectionError);
            // Thử với cách tiếp cận khác
            try {
                // Thử với SsdMobilenetv1 thay vì TinyFaceDetector
                const alternativeDetections = await faceapi.detectAllFaces(imageElement, new faceapi.SsdMobilenetv1Options())
                    .withFaceLandmarks();
                
                console.log(`Phương pháp thay thế: Đã phát hiện ${alternativeDetections.length} khuôn mặt`);
                
                // Cập nhật biến toàn cục
                detectedFaces = alternativeDetections;
                currentImage = imageElement;
                
                return {
                    success: true,
                    faces: alternativeDetections,
                    message: `Đã phát hiện ${alternativeDetections.length} khuôn mặt (phương pháp thay thế)`
                };
            } catch (altError) {
                console.error('Cả hai phương pháp nhận diện khuôn mặt đều thất bại:', altError);
                return { 
                    success: false, 
                    message: 'Không thể nhận diện khuôn mặt. Vui lòng thử với ảnh khác có khuôn mặt rõ ràng hơn.'
                };
            }
        }
    } catch (error) {
        console.error('Lỗi không mong muốn trong quá trình nhận diện khuôn mặt:', error);
        return { 
            success: false, 
            message: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.' 
        };
    }
}

// Vẽ kết quả nhận diện lên canvas
function drawFaceDetectionResults(canvas, displaySize) {
    if (!canvas || !detectedFaces || detectedFaces.length === 0) {
        return;
    }
    
    // Lấy context của canvas
    const ctx = canvas.getContext('2d');
    
    // Xóa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Đặt kích thước canvas phù hợp với hình ảnh
    if (displaySize) {
        canvas.width = displaySize.width;
        canvas.height = displaySize.height;
        faceapi.matchDimensions(canvas, displaySize);
    }
    
    // Vẽ kết quả nhận diện
    const resizedResults = faceapi.resizeResults(detectedFaces, displaySize);
    
    // Vẽ các khung khuôn mặt
    resizedResults.forEach(result => {
        // Vẽ khung khuôn mặt
        const box = result.detection.box;
        ctx.strokeStyle = '#43a047';
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        // Vẽ các điểm mốc khuôn mặt (tùy chọn)
        if (result.landmarks) {
            faceapi.draw.drawFaceLandmarks(canvas, resizedResults);
        }
        
        // Hiển thị thông tin tuổi và giới tính
        if (result.gender && result.age) {
            const text = `${Math.round(result.age)} tuổi, ${result.gender === 'male' ? 'Nam' : 'Nữ'}`;
            const textWidth = ctx.measureText(text).width;
            
            // Vẽ nền cho văn bản
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(box.x, box.y - 30, textWidth + 20, 30);
            
            // Vẽ văn bản
            ctx.fillStyle = '#fff';
            ctx.font = '16px Arial';
            ctx.fillText(text, box.x + 10, box.y - 10);
        }
    });
}

// Kiểm tra và trả về khuôn mặt được phát hiện
function getDetectedFaces() {
    return detectedFaces;
}

// Kiểm tra xem có phát hiện đúng một khuôn mặt hay không
function hasSingleFaceDetected() {
    return detectedFaces && detectedFaces.length === 1;
}

// Lấy khuôn mặt chính (trong trường hợp nhiều khuôn mặt, lấy khuôn mặt lớn nhất)
function getPrimaryFace() {
    if (!detectedFaces || detectedFaces.length === 0) {
        return null;
    }
    
    if (detectedFaces.length === 1) {
        return detectedFaces[0];
    }
    
    // Nếu có nhiều khuôn mặt, trả về khuôn mặt lớn nhất
    return detectedFaces.reduce((largest, face) => {
        const currentArea = face.detection.box.width * face.detection.box.height;
        const largestArea = largest.detection.box.width * largest.detection.box.height;
        return currentArea > largestArea ? face : largest;
    }, detectedFaces[0]);
}

// Cắt hình ảnh khuôn mặt từ ảnh gốc
function cropFaceImage(face, scale = 1.5) {
    if (!face || !currentImage) {
        return null;
    }
    
    try {
        // Lấy kích thước hình ảnh gốc
        const originalWidth = currentImage.width;
        const originalHeight = currentImage.height;
        
        // Lấy hộp khuôn mặt
        const box = face.detection.box;
        
        // Tính toán vùng cắt với tỷ lệ scale để lấy thêm không gian xung quanh khuôn mặt
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        
        // Tính kích thước mới với tỷ lệ scale
        const newWidth = box.width * scale;
        const newHeight = box.height * scale;
        
        // Tính toán tọa độ cắt, đảm bảo không vượt quá kích thước ảnh gốc
        let cropX = Math.max(0, centerX - newWidth / 2);
        let cropY = Math.max(0, centerY - newHeight / 2);
        let cropWidth = Math.min(newWidth, originalWidth - cropX);
        let cropHeight = Math.min(newHeight, originalHeight - cropY);
        
        // Tạo canvas mới để vẽ hình ảnh đã cắt
        const canvas = document.createElement('canvas');
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        
        // Vẽ phần cắt của hình ảnh vào canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(
            currentImage,
            cropX, cropY, cropWidth, cropHeight,
            0, 0, cropWidth, cropHeight
        );
        
        // Trả về đối tượng hình ảnh mới
        const croppedImage = new Image();
        croppedImage.src = canvas.toDataURL('image/jpeg');
        return croppedImage;
    } catch (error) {
        console.error('Lỗi khi cắt hình ảnh khuôn mặt:', error);
        return null;
    }
}

// Kiểm tra xem khuôn mặt có phải là người châu Á không
function isAsianFace(face) {
    if (!face || !face.landmarks) {
        console.error('Không có dữ liệu đánh dấu khuôn mặt');
        return false;
    }

    try {
        const landmarks = face.landmarks;
        const positions = landmarks.positions;

        // Lấy điểm mốc quan trọng
        // Mắt trái: 36-41, mắt phải: 42-47, mũi: 27-35, miệng: 48-68
        const leftEye = positions.slice(36, 42);
        const rightEye = positions.slice(42, 48);
        const nose = positions.slice(27, 36);
        const mouth = positions.slice(48, 68);
        const jawline = positions.slice(0, 17);

        // Tính toán các thông số đặc trưng của khuôn mặt
        // 1. Tính khoảng cách giữa hai mắt
        const leftEyeCenter = getCenterPoint(leftEye);
        const rightEyeCenter = getCenterPoint(rightEye);
        const eyeDistance = getDistance(leftEyeCenter, rightEyeCenter);

        // 2. Lấy độ rộng khuôn mặt từ jawline
        const faceWidth = getDistance(jawline[0], jawline[16]);
        const faceHeight = getDistance(getCenterPoint(nose), getCenterPoint([jawline[8]]));
        
        // 3. Tính tỷ lệ khoảng cách giữa hai mắt / độ rộng khuôn mặt
        const eyeDistanceRatio = eyeDistance / faceWidth;
        
        // 4. Tính tỷ lệ mắt (độ rộng / độ cao)
        const leftEyeWidth = getDistance(leftEye[0], leftEye[3]);
        const leftEyeHeight = Math.max(
            getDistance(leftEye[1], leftEye[5]),
            getDistance(leftEye[2], leftEye[4])
        );
        const leftEyeRatio = leftEyeWidth / leftEyeHeight;
        
        // 5. Tính tỷ lệ mũi
        const noseWidth = getDistance(nose[4], nose[8]);
        const noseHeight = getDistance(nose[0], nose[6]);
        const noseRatio = noseWidth / noseHeight;
        
        // 6. Tỷ lệ khuôn mặt (độ rộng / độ cao)
        const faceRatio = faceWidth / faceHeight;

        // Đánh giá đặc điểm khuôn mặt châu Á
        const eyeRatioMatch = leftEyeRatio >= ASIAN_FACE_FEATURES.eyeRatio.min && 
                            leftEyeRatio <= ASIAN_FACE_FEATURES.eyeRatio.max;
        
        const noseRatioMatch = noseRatio >= ASIAN_FACE_FEATURES.noseRatio.min && 
                             noseRatio <= ASIAN_FACE_FEATURES.noseRatio.max;
        
        const eyeDistanceMatch = eyeDistanceRatio >= ASIAN_FACE_FEATURES.eyeDistance.min && 
                                eyeDistanceRatio <= ASIAN_FACE_FEATURES.eyeDistance.max;
        
        const faceRatioMatch = faceRatio >= ASIAN_FACE_FEATURES.faceRatio.min && 
                             faceRatio <= ASIAN_FACE_FEATURES.faceRatio.max;
        
        // Tính điểm đánh giá (đơn giản hóa, thang điểm từ 0-100)
        let asianFeatureScore = 0;
        if (eyeRatioMatch) asianFeatureScore += 25;
        if (noseRatioMatch) asianFeatureScore += 25;
        if (eyeDistanceMatch) asianFeatureScore += 25;
        if (faceRatioMatch) asianFeatureScore += 25;

        console.log(`Điểm đánh giá khuôn mặt châu Á: ${asianFeatureScore}/100`);
        console.log({
            eyeRatio: leftEyeRatio,
            noseRatio,
            eyeDistanceRatio,
            faceRatio,
            isAsian: asianFeatureScore >= 75
        });
        
        // Đánh giá: nếu tổng điểm >= 75 (đạt 3/4 tiêu chí trở lên)
        return asianFeatureScore >= 75;
        
    } catch (error) {
        console.error('Lỗi khi phân tích đặc điểm khuôn mặt châu Á:', error);
        // Mặc định trả về true nếu không thể phân tích để tránh bị giới hạn
        return true;
    }
}

// Các hàm hỗ trợ tính toán
function getCenterPoint(points) {
    const sumX = points.reduce((sum, point) => sum + point.x, 0);
    const sumY = points.reduce((sum, point) => sum + point.y, 0);
    return {
        x: sumX / points.length,
        y: sumY / points.length
    };
}

function getDistance(point1, point2) {
    return Math.sqrt(
        Math.pow(point2.x - point1.x, 2) + 
        Math.pow(point2.y - point1.y, 2)
    );
}

// Thay đổi chỉ phần khuôn mặt trong hình ảnh
async function replaceOnlyFace(imageElement, faceReplacement, faceDetection = null) {
    try {
        if (!imageElement) {
            throw new Error('Không có hình ảnh gốc');
        }

        if (!faceReplacement) {
            throw new Error('Không có hình ảnh thay thế');
        }

        // Phát hiện khuôn mặt nếu chưa có
        let face = faceDetection;
        if (!face) {
            const detectionResult = await detectFacesInImage(imageElement);
            if (!detectionResult.success || detectionResult.faces.length === 0) {
                throw new Error('Không thể phát hiện khuôn mặt trong ảnh gốc');
            }
            face = getPrimaryFace();
        }

        // Kiểm tra xem khuôn mặt có phải là của người châu Á không
        if (!isAsianFace(face)) {
            throw new Error('Khuôn mặt không phải là của người châu Á');
        }

        // Cắt vùng khuôn mặt
        const box = face.detection.box;
        const scale = 1.0; // Tỷ lệ vùng cắt, có thể điều chỉnh

        // Tính toán vùng cắt
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        const cropWidth = box.width * scale;
        const cropHeight = box.height * scale;
        const cropX = centerX - (cropWidth / 2);
        const cropY = centerY - (cropHeight / 2);

        // Tạo canvas để vẽ ảnh kết quả
        const canvas = document.createElement('canvas');
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        const ctx = canvas.getContext('2d');

        // Vẽ ảnh gốc lên canvas
        ctx.drawImage(imageElement, 0, 0);

        // Vẽ hình ảnh thay thế chỉ ở vùng khuôn mặt
        // Điều chỉnh kích thước hình ảnh thay thế để phù hợp với vùng khuôn mặt
        ctx.drawImage(
            faceReplacement,
            0, 0, faceReplacement.width, faceReplacement.height,
            cropX, cropY, cropWidth, cropHeight
        );

        // Tạo hình ảnh kết quả
        const resultImage = new Image();
        resultImage.src = canvas.toDataURL('image/jpeg');
        return resultImage;
    } catch (error) {
        console.error('Lỗi khi thay đổi khuôn mặt:', error);
        return null;
    }
}

// Phát hiện khuôn mặt và thay đổi chỉ phần khuôn mặt, đảm bảo là khuôn mặt châu Á
async function detectAndReplaceAsianFace(originalImage, replacementImage) {
    try {
        // 1. Phát hiện khuôn mặt trong ảnh gốc
        const detectionResult = await detectFacesInImage(originalImage);
        if (!detectionResult.success || detectionResult.faces.length === 0) {
            return {
                success: false,
                message: 'Không thể phát hiện khuôn mặt trong ảnh gốc'
            };
        }

        // 2. Lấy khuôn mặt chính
        const primaryFace = getPrimaryFace();
        
        // 3. Kiểm tra xem khuôn mặt có phải là của người châu Á không
        if (!isAsianFace(primaryFace)) {
            return {
                success: false,
                message: 'Khuôn mặt không phải là của người châu Á'
            };
        }
        
        // 4. Thay đổi phần khuôn mặt
        const resultImage = await replaceOnlyFace(originalImage, replacementImage, primaryFace);
        if (!resultImage) {
            return {
                success: false,
                message: 'Không thể thay đổi khuôn mặt'
            };
        }
        
        return {
            success: true,
            image: resultImage,
            message: 'Đã thay đổi thành công chỉ phần khuôn mặt'
        };
    } catch (error) {
        console.error('Lỗi khi phát hiện và thay đổi khuôn mặt châu Á:', error);
        return {
            success: false,
            message: `Lỗi: ${error.message}`
        };
    }
}

// Hằng số cho biểu cảm đau khổ/buồn
const SAD_EXPRESSION_THRESHOLD = 0.6; // Ngưỡng để xác định biểu cảm buồn
const SAD_EXPRESSIONS = ['sad', 'fearful', 'disgusted', 'angry']; // Các biểu cảm liên quan đến đau khổ/buồn

// Kiểm tra xem khuôn mặt có biểu cảm buồn/đau khổ không
function hasSadExpression(face) {
    if (!face || !face.expressions) {
        console.error('Không có dữ liệu biểu cảm khuôn mặt');
        return false;
    }

    try {
        const expressions = face.expressions;
        
        // Tính tổng xác suất của các biểu cảm buồn/đau khổ
        let sadnessScore = 0;
        SAD_EXPRESSIONS.forEach(expression => {
            if (expressions[expression]) {
                sadnessScore += expressions[expression];
            }
        });

        console.log(`Điểm đánh giá biểu cảm buồn/đau khổ: ${sadnessScore}`);
        console.log('Chi tiết biểu cảm:', expressions);
        
        // Trả về true nếu tổng xác suất vượt ngưỡng
        return sadnessScore >= SAD_EXPRESSION_THRESHOLD;
    } catch (error) {
        console.error('Lỗi khi phân tích biểu cảm:', error);
        return false;
    }
}

// Phát hiện và thay thế khuôn mặt, chỉ chấp nhận khuôn mặt châu Á có biểu cảm buồn/đau khổ
async function detectAndReplaceSadAsianFace(originalImage, replacementImage) {
    try {
        // 1. Phát hiện khuôn mặt trong ảnh gốc
        const detectionResult = await detectFacesInImage(originalImage);
        if (!detectionResult.success || detectionResult.faces.length === 0) {
            return {
                success: false,
                message: 'Không thể phát hiện khuôn mặt trong ảnh gốc'
            };
        }

        // 2. Lấy khuôn mặt chính
        const primaryFace = getPrimaryFace();
        
        // 3. Kiểm tra xem khuôn mặt có phải là của người châu Á không
        if (!isAsianFace(primaryFace)) {
            return {
                success: false,
                message: 'Khuôn mặt không phải là của người châu Á'
            };
        }

        // 4. Kiểm tra biểu cảm buồn, đau khổ
        // Cần phát hiện với biểu cảm
        const withExpressions = await detectFacesWithExpression(originalImage);
        if (!withExpressions.success) {
            return {
                success: false,
                message: 'Không thể phân tích biểu cảm khuôn mặt'
            };
        }

        const faceWithExpression = withExpressions.faces[0];
        if (!hasSadExpression(faceWithExpression)) {
            return {
                success: false, 
                message: 'Khuôn mặt không có biểu cảm buồn hoặc đau khổ'
            };
        }
        
        // 5. Thay đổi phần khuôn mặt
        const resultImage = await replaceOnlyFace(originalImage, replacementImage, primaryFace);
        if (!resultImage) {
            return {
                success: false,
                message: 'Không thể thay đổi khuôn mặt'
            };
        }
        
        return {
            success: true,
            image: resultImage,
            message: 'Đã thay đổi thành công khuôn mặt châu Á có biểu cảm buồn/đau khổ'
        };
    } catch (error) {
        console.error('Lỗi khi phát hiện và thay đổi khuôn mặt:', error);
        return {
            success: false,
            message: `Lỗi: ${error.message}`
        };
    }
}

// Phát hiện khuôn mặt với biểu cảm
async function detectFacesWithExpression(imageElement) {
    try {
        console.log('Bắt đầu nhận diện khuôn mặt và biểu cảm trong hình ảnh...');
        
        // Đảm bảo mô hình đã được tải
        if (!isFaceDetectionModelLoaded) {
            console.log('Mô hình chưa được tải, đang tải mô hình...');
            const modelLoaded = await loadFaceDetectionModels();
            if (!modelLoaded) {
                console.error('Không thể tải mô hình nhận diện khuôn mặt');
                return { success: false, message: 'Không thể tải mô hình nhận diện khuôn mặt' };
            }
        }

        // Khởi tạo tùy chọn
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 });
        
        try {
            // Phát hiện khuôn mặt, điểm mốc và biểu cảm
            const detections = await faceapi.detectAllFaces(imageElement, options)
                .withFaceLandmarks()
                .withFaceExpressions();
            
            console.log(`Đã phát hiện ${detections.length} khuôn mặt với biểu cảm`);
            
            return {
                success: true,
                faces: detections,
                message: `Đã phát hiện ${detections.length} khuôn mặt với biểu cảm`
            };
        } catch (detectionError) {
            console.error('Lỗi khi phát hiện khuôn mặt và biểu cảm:', detectionError);
            // Thử với cách tiếp cận khác
            try {
                // Thử với SsdMobilenetv1 thay vì TinyFaceDetector
                const alternativeDetections = await faceapi.detectAllFaces(imageElement, new faceapi.SsdMobilenetv1Options())
                    .withFaceLandmarks()
                    .withFaceExpressions();
                
                console.log(`Phương pháp thay thế: Đã phát hiện ${alternativeDetections.length} khuôn mặt với biểu cảm`);
                
                return {
                    success: true,
                    faces: alternativeDetections,
                    message: `Đã phát hiện ${alternativeDetections.length} khuôn mặt với biểu cảm (phương pháp thay thế)`
                };
            } catch (altError) {
                console.error('Cả hai phương pháp nhận diện khuôn mặt và biểu cảm đều thất bại:', altError);
                return { 
                    success: false, 
                    message: 'Không thể nhận diện khuôn mặt và biểu cảm. Vui lòng thử với ảnh khác có khuôn mặt rõ ràng hơn.'
                };
            }
        }
    } catch (error) {
        console.error('Lỗi không mong muốn trong quá trình nhận diện khuôn mặt và biểu cảm:', error);
        return { 
            success: false, 
            message: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.' 
        };
    }
}

// Tăng cường biểu cảm buồn cho ảnh khuôn mặt
async function enhanceSadExpression(faceImage) {
    try {
        // Tạo canvas để vẽ và áp dụng bộ lọc
        const canvas = document.createElement('canvas');
        canvas.width = faceImage.width;
        canvas.height = faceImage.height;
        const ctx = canvas.getContext('2d');
        
        // Vẽ ảnh gốc
        ctx.drawImage(faceImage, 0, 0);
        
        // Lấy dữ liệu hình ảnh
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Áp dụng các bộ lọc để tạo hiệu ứng buồn
        // 1. Giảm độ bão hòa (desaturation) để tạo hiệu ứng u ám
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Tính giá trị độ xám (grayscale)
            const gray = 0.3 * r + 0.59 * g + 0.11 * b;
            
            // Giảm độ bão hòa 50% (trộn với ảnh xám)
            data[i] = r * 0.5 + gray * 0.5;     // Đỏ
            data[i + 1] = g * 0.5 + gray * 0.5; // Xanh lá
            data[i + 2] = b * 0.5 + gray * 0.5; // Xanh dương
        }
        
        // 2. Thêm tone màu xanh (blue tint) để tạo hiệu ứng lạnh lẽo
        for (let i = 0; i < data.length; i += 4) {
            // Tăng kênh xanh dương và giảm kênh đỏ một chút
            data[i] = Math.max(0, data[i] - 10);     // Giảm đỏ
            data[i + 2] = Math.min(255, data[i + 2] + 10); // Tăng xanh dương
        }
        
        // 3. Tăng độ tương phản một chút để làm nổi bật các nét buồn
        const factor = 1.2; // Hệ số tương phản
        const midpoint = 128; // Giá trị trung bình
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = midpoint + (data[i] - midpoint) * factor;     // Đỏ
            data[i + 1] = midpoint + (data[i + 1] - midpoint) * factor; // Xanh lá
            data[i + 2] = midpoint + (data[i + 2] - midpoint) * factor; // Xanh dương
        }
        
        // Cập nhật dữ liệu hình ảnh với các hiệu ứng
        ctx.putImageData(imageData, 0, 0);
        
        // Trả về hình ảnh đã được tăng cường biểu cảm buồn
        const enhancedImage = new Image();
        enhancedImage.src = canvas.toDataURL('image/jpeg');
        return enhancedImage;
    } catch (error) {
        console.error('Lỗi khi tăng cường biểu cảm buồn:', error);
        return faceImage; // Trả về ảnh gốc nếu có lỗi
    }
}

// Phát hiện, thay thế và tăng cường biểu cảm buồn cho khuôn mặt châu Á
async function detectAndReplaceSadEnhancedAsianFace(originalImage, replacementImage, enhanceSadness = true) {
    try {
        // 1. Thực hiện phát hiện và thay thế khuôn mặt châu Á có biểu cảm buồn
        const result = await detectAndReplaceSadAsianFace(originalImage, replacementImage);
        
        // Nếu không thành công, trả về kết quả thất bại
        if (!result.success) {
            return result;
        }
        
        // 2. Nếu yêu cầu tăng cường biểu cảm buồn
        if (enhanceSadness) {
            const enhancedImage = await enhanceSadExpression(result.image);
            
            return {
                success: true,
                image: enhancedImage,
                message: 'Đã thay đổi thành công và tăng cường biểu cảm buồn cho khuôn mặt châu Á'
            };
        }
        
        // Trả về kết quả gốc nếu không tăng cường biểu cảm
        return result;
    } catch (error) {
        console.error('Lỗi khi xử lý khuôn mặt với biểu cảm buồn:', error);
        return {
            success: false,
            message: `Lỗi: ${error.message}`
        };
    }
}

// Xuất các hàm và biến cần thiết
window.FaceDetection = {
    loadModels: loadFaceDetectionModels,
    detect: detectFacesInImage,
    drawResults: drawFaceDetectionResults,
    getDetectedFaces: getDetectedFaces,
    hasSingleFace: hasSingleFaceDetected,
    getPrimaryFace: getPrimaryFace,
    cropFaceImage: cropFaceImage,
    isAsianFace: isAsianFace,
    replaceOnlyFace: replaceOnlyFace,
    detectAndReplaceAsianFace: detectAndReplaceAsianFace,
    detectFacesWithExpression: detectFacesWithExpression,
    hasSadExpression: hasSadExpression,
    enhanceSadExpression: enhanceSadExpression,
    detectAndReplaceSadAsianFace: detectAndReplaceSadAsianFace,
    detectAndReplaceSadEnhancedAsianFace: detectAndReplaceSadEnhancedAsianFace
}; 