/**
 * Face Detection Module
 * Sử dụng face-api.js để nhận diện khuôn mặt và landmarks
 */

class FaceDetector {
    constructor() {
        this.isModelLoaded = false;
        this.modelLoadPromise = null;
        // Sử dụng đường dẫn đến thư mục weights trực tiếp thay vì API PHP
        this.modelsPath = '../weights/';
        // Đường dẫn dự phòng nếu thư mục weights trực tiếp không hoạt động
        this.fallbackApiPath = '../api/local-proxy.php?model=';
        this.minConfidence = 0.5; // Lower confidence threshold from 0.7 to 0.5
        this.minFaceSize = 50;    // Lower minimum face size from 100 to 50
        this.useFallback = false; // Flag để biết có đang sử dụng phương pháp dự phòng không
        this.useLocalProxy = false; // Flag để biết có đang sử dụng local proxy hay không
    }

    /**
     * Khởi tạo và tải các mô hình nhận diện khuôn mặt
     */
    async initialize() {
        if (this.modelLoadPromise) {
            return this.modelLoadPromise;
        }

        this.modelLoadPromise = new Promise(async (resolve, reject) => {
            try {
                // Đảm bảo face-api.js đã được tải
                if (typeof faceapi === 'undefined') {
                    try {
                        // Thử tải từ file local trước
                        await this.loadScript('../face-api.min.js');
                        console.log('Đã tải face-api.js từ file local');
                    } catch (localError) {
                        console.warn('Không thể tải face-api.js từ file local, thử từ CDN:', localError);
                        try {
                            await this.loadScript('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js');
                        } catch (error) {
                            console.warn('Không thể tải face-api.js từ CDN, sử dụng phương pháp dự phòng');
                            this.useFallback = true;
                            resolve(false);
                            return;
                        }
                    }
                }

                console.log('Đang tải mô hình nhận diện khuôn mặt từ thư mục local...');
                
                try {
                    // Tải các mô hình cần thiết từ thư mục weights trực tiếp
                    try {
                        await this.loadModelsWithPath(this.modelsPath);
                        console.log('Mô hình nhận diện khuôn mặt đã được tải thành công từ thư mục weights');
                    } catch (mainPathError) {
                        console.warn('Không thể tải models từ thư mục weights trực tiếp, thử với local proxy:', mainPathError);
                        this.useLocalProxy = true;
                        
                        // Thử lại với local proxy
                        try {
                            await this.loadModelsWithPath(this.fallbackApiPath);
                            console.log('Mô hình nhận diện khuôn mặt đã được tải thành công từ local proxy');
                        } catch (proxyError) {
                            console.error('Không thể tải models từ cả hai nơi:', proxyError);
                            throw proxyError;
                        }
                    }
                    
                    this.isModelLoaded = true;
                    resolve(true);
                } catch (modelError) {
                    console.warn('Không thể tải models face-api từ local, sử dụng phương pháp dự phòng', modelError);
                    this.useFallback = true;
                    resolve(false);
                }
            } catch (error) {
                console.error('Lỗi khi tải mô hình nhận diện khuôn mặt:', error);
                this.useFallback = true;
                resolve(false);
            }
        });

        return this.modelLoadPromise;
    }

    /**
     * Tải script từ URL
     * @param {string} url - URL của script cần tải
     * @returns {Promise<void>}
     */
    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => resolve();
            script.onerror = (error) => reject(new Error(`Failed to load script: ${url}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Tải các mô hình từ đường dẫn cụ thể
     * @param {string} path - Đường dẫn đến thư mục chứa mô hình
     */
    async loadModelsWithPath(path) {
        // Tắt caching cho face-api.js để tránh lỗi 304 Not Modified
        faceapi.tf.ENV.set('WEBGL_FORCE_F16_TEXTURES', false);
        faceapi.tf.ENV.set('WEBGL_FLUSH_THRESHOLD', 0);
        faceapi.tf.ENV.set('USE_WEBGL', true);
        
        console.log('Tải mô hình từ đường dẫn:', path);
        
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(path),
            faceapi.nets.faceLandmark68Net.loadFromUri(path),
            faceapi.nets.faceRecognitionNet.loadFromUri(path),
            faceapi.nets.ssdMobilenetv1.loadFromUri(path)
        ]);
        
        console.log('Tất cả mô hình đã được tải thành công');
    }

    /**
     * Nhận diện khuôn mặt trong hình ảnh
     * @param {HTMLImageElement} imageElement - Element hình ảnh
     * @returns {Promise<Object>} Dữ liệu khuôn mặt đã nhận diện
     */
    async detectFace(imageElement) {
        await this.initialize();
        
        // Nếu đang sử dụng phương pháp dự phòng hoặc không tải được mô hình
        if (this.useFallback || !this.isModelLoaded) {
            console.log('Sử dụng phương pháp nhận diện dự phòng đơn giản');
            return this.fallbackDetection(imageElement);
        }

        // Tạo canvas cho việc xử lý
        const canvas = document.createElement('canvas');
        const originalWidth = imageElement.naturalWidth || imageElement.width;
        const originalHeight = imageElement.naturalHeight || imageElement.height;
        
        // Thiết lập kích thước cho canvas
        canvas.width = originalWidth;
        canvas.height = originalHeight;
        
        // Vẽ hình ảnh lên canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageElement, 0, 0, originalWidth, originalHeight);
        
        try {
            // Thử nhiều phương pháp khác nhau với các cấu hình khác nhau
            console.log('Detecting face...');
            
            // Mảng các phương pháp phát hiện khác nhau để thử
            const detectionMethods = [
                // Method 1: SSD MobileNet với cấu hình mặc định
                async () => await faceapi.detectAllFaces(canvas, 
                    new faceapi.SsdMobilenetv1Options({ 
                        minConfidence: this.minConfidence, 
                        minFaceSize: this.minFaceSize 
                    })
                ).withFaceLandmarks().withFaceDescriptors(),
                
                // Method 2: SSD MobileNet với ngưỡng tin cậy thấp hơn
                async () => await faceapi.detectAllFaces(canvas, 
                    new faceapi.SsdMobilenetv1Options({ 
                        minConfidence: 0.3, 
                        minFaceSize: this.minFaceSize 
                    })
                ).withFaceLandmarks().withFaceDescriptors(),
                
                // Method 3: TinyFace Detector với kích thước đầu vào nhỏ
                async () => await faceapi.detectAllFaces(canvas, 
                    new faceapi.TinyFaceDetectorOptions({ 
                        minConfidence: this.minConfidence - 0.1, 
                        inputSize: 416 
                    })
                ).withFaceLandmarks().withFaceDescriptors(),
                
                // Method 4: TinyFace Detector với kích thước đầu vào lớn
                async () => await faceapi.detectAllFaces(canvas, 
                    new faceapi.TinyFaceDetectorOptions({ 
                        minConfidence: 0.3, 
                        inputSize: 608 
                    })
                ).withFaceLandmarks().withFaceDescriptors(),
                
                // Method 5: Thử với ảnh được xử lý trước khi phát hiện
                async () => {
                    // Xử lý trước hình ảnh - tăng độ tương phản
                    const processedCanvas = document.createElement('canvas');
                    processedCanvas.width = canvas.width;
                    processedCanvas.height = canvas.height;
                    const processedCtx = processedCanvas.getContext('2d');
                    
                    // Vẽ hình ảnh gốc
                    processedCtx.drawImage(canvas, 0, 0);
                    
                    // Tăng độ tương phản
                    const imageData = processedCtx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    
                    const contrast = 1.3; // Tăng độ tương phản
                    const brightness = 5; // Tăng độ sáng nhẹ
                    
                    for (let i = 0; i < data.length; i += 4) {
                        // Áp dụng độ tương phản và độ sáng
                        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128 + brightness));
                        data[i+1] = Math.min(255, Math.max(0, (data[i+1] - 128) * contrast + 128 + brightness));
                        data[i+2] = Math.min(255, Math.max(0, (data[i+2] - 128) * contrast + 128 + brightness));
                    }
                    
                    processedCtx.putImageData(imageData, 0, 0);
                    
                    // Thử phát hiện trên hình ảnh đã xử lý
                    return await faceapi.detectAllFaces(processedCanvas, 
                        new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3, minFaceSize: this.minFaceSize })
                    ).withFaceLandmarks().withFaceDescriptors();
                }
            ];
            
            // Thử từng phương pháp cho đến khi phát hiện được khuôn mặt
            let detections = null;
            let successMethod = -1;
            
            for (let i = 0; i < detectionMethods.length; i++) {
                try {
                    console.log(`Trying detection method ${i+1}...`);
                    detections = await detectionMethods[i]();
                    
                    if (detections && detections.length > 0) {
                        successMethod = i + 1;
                        console.log(`Successfully detected face with method ${successMethod}`);
                        break;
                    }
                } catch (methodError) {
                    console.warn(`Method ${i+1} failed:`, methodError);
                    // Tiếp tục với phương pháp tiếp theo
                }
            }
            
            // Kiểm tra lại xem đã phát hiện được khuôn mặt chưa
            if (!detections || detections.length === 0) {
                console.error('No face detected in the image after trying all methods');
                return this.fallbackDetection(imageElement);
            }
            
            // Nếu có nhiều khuôn mặt, chọn khuôn mặt lớn nhất (có thể là khuôn mặt chính)
            const detection = this.getLargestFace(detections);
            
            // Chuẩn bị dữ liệu khuôn mặt
            const faceData = {
                box: detection.detection.box,
                landmarks: detection.landmarks.positions,
                descriptor: detection.descriptor,
                alignedRect: detection.alignedRect,
                confidence: detection.detection.score,
                canvas: canvas,
                detectionMethod: successMethod // Lưu phương pháp phát hiện thành công
            };
            
            console.log('Face detection completed successfully with method', successMethod);
            return faceData;
        } catch (error) {
            console.error('Error in face detection:', error);
            return this.fallbackDetection(imageElement);
        }
    }
    
    /**
     * Phương pháp nhận diện dự phòng đơn giản khi không thể sử dụng face-api
     * @param {HTMLImageElement} imageElement - Element hình ảnh
     * @returns {Object} Dữ liệu khuôn mặt dự đoán đơn giản
     */
    fallbackDetection(imageElement) {
        console.log('Sử dụng nhận diện khuôn mặt dự phòng');
        const width = imageElement.naturalWidth || imageElement.width;
        const height = imageElement.naturalHeight || imageElement.height;
        
        // Giả định khuôn mặt nằm ở giữa ảnh, chiếm khoảng 60% kích thước ảnh
        const faceWidth = width * 0.6;
        const faceHeight = height * 0.6;
        const faceX = (width - faceWidth) / 2;
        const faceY = (height - faceHeight) / 2.2; // Thường khuôn mặt nằm hơi lên trên
        
        // Tạo canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageElement, 0, 0, width, height);
        
        // Tạo dữ liệu khuôn mặt giả định
        const box = {
            x: faceX,
            y: faceY,
            width: faceWidth,
            height: faceHeight
        };
        
        // Tạo mảng landmarks giả định với 68 điểm
        const landmarks = [];
        for (let i = 0; i < 68; i++) {
            landmarks.push({
                x: faceX + Math.random() * faceWidth,
                y: faceY + Math.random() * faceHeight
            });
        }
        
        return {
            box: box,
            landmarks: landmarks,
            canvas: canvas,
            confidence: 0.5,
            isFallback: true,
            detectionMethod: 'fallback'
        };
    }
    
    /**
     * Lấy khuôn mặt lớn nhất từ mảng phát hiện
     * @param {Array} detections - Mảng các khuôn mặt đã phát hiện
     * @returns {Object} Khuôn mặt lớn nhất
     */
    getLargestFace(detections) {
        if (!detections || detections.length === 0) return null;
        
        // Chỉ lấy mặt lớn nhất nếu có nhiều hơn 1 mặt
        if (detections.length > 1) {
            return detections.reduce((prev, current) => {
                const prevArea = prev.detection.box.width * prev.detection.box.height;
                const currentArea = current.detection.box.width * current.detection.box.height;
                return (prevArea > currentArea) ? prev : current;
            });
        }
        
        // Nếu chỉ có 1 mặt
        return detections[0];
    }

    /**
     * Vẽ landmarks lên khuôn mặt (dùng cho debug)
     * @param {HTMLImageElement} imageElement - Element hình ảnh
     * @param {Object} faceData - Dữ liệu khuôn mặt đã phát hiện
     * @returns {HTMLCanvasElement} Canvas chứa khuôn mặt với landmarks
     */
    drawFaceLandmarks(imageElement, faceData) {
        const canvas = document.createElement('canvas');
        const width = imageElement.naturalWidth || imageElement.width;
        const height = imageElement.naturalHeight || imageElement.height;
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageElement, 0, 0, width, height);
        
        if (faceData && faceData.box && faceData.landmarks) {
            // Vẽ hộp khuôn mặt
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(faceData.box.x, faceData.box.y, faceData.box.width, faceData.box.height);
            
            // Vẽ điểm landmarks
            faceData.landmarks.forEach(point => {
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
                ctx.fill();
            });
            
            // Vẽ thông tin tin cậy
            ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            ctx.font = '16px Arial';
            ctx.fillText(`Confidence: ${Math.round(faceData.confidence * 100)}%`, faceData.box.x, faceData.box.y - 10);
        }
        
        return canvas;
    }
    
    /**
     * Chuẩn bị hình ảnh khuôn mặt đã căn chỉnh để chuyển đến AI biến đổi
     * @param {HTMLImageElement} imageElement - Element hình ảnh gốc
     * @param {Object} faceData - Dữ liệu khuôn mặt đã phát hiện
     * @returns {HTMLCanvasElement} Canvas chứa khuôn mặt đã căn chỉnh
     */
    alignFace(imageElement, faceData) {
        if (!faceData || !faceData.landmarks) {
            console.error('No face data available for alignment');
            return null;
        }
        
        try {
            const canvas = document.createElement('canvas');
            const width = imageElement.naturalWidth || imageElement.width;
            const height = imageElement.naturalHeight || imageElement.height;
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imageElement, 0, 0, width, height);
            
            // Nếu có alignedRect, sử dụng nó để căn chỉnh khuôn mặt
            if (faceData.alignedRect) {
                const box = faceData.alignedRect.box;
                
                // Tính toán padding để lấy khuôn mặt với nhiều ngữ cảnh hơn
                const padding = {
                    x: box.width * 0.3,
                    y: box.height * 0.3
                };
                
                // Tính toán vùng cắt
                const crop = {
                    x: Math.max(0, box.x - padding.x),
                    y: Math.max(0, box.y - padding.y),
                    width: Math.min(width - box.x + padding.x, box.width + padding.x * 2),
                    height: Math.min(height - box.y + padding.y, box.height + padding.y * 2)
                };
                
                // Tạo canvas mới cho khuôn mặt đã căn chỉnh
                const faceCanvas = document.createElement('canvas');
                faceCanvas.width = crop.width;
                faceCanvas.height = crop.height;
                
                const faceCtx = faceCanvas.getContext('2d');
                faceCtx.drawImage(canvas, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
                
                return faceCanvas;
            }
            
            return canvas;
        } catch (error) {
            console.error('Error aligning face:', error);
            return null;
        }
    }
}

// Export để sử dụng trong các module khác
window.FaceDetector = FaceDetector; 