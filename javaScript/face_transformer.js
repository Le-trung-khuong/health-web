/**
 * Face Transformer Module
 * Sử dụng Stability AI để biến đổi khuôn mặt theo tác động của các tệ nạn
 */

class FaceTransformer {
    constructor() {
        // API endpoints
        this.STABILITY_API_ENDPOINT = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image';
        this.HUGGINGFACE_API_ENDPOINT = 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5';
        
        // API keys - được thiết lập khi khởi tạo, không lưu trực tiếp trong code
        this.STABILITY_API_KEY = '';
        this.HUGGINGFACE_API_KEY = '';
        
        // Thiết lập mặc định cho API
        this.defaultSettings = {
            stability: {
                cfg_scale: 8,        // Kiểm soát độ trung thành với prompt (tăng lên để tuân thủ prompt nghiêm ngặt hơn)
                steps: 40,           // Tăng số bước để có kết quả chất lượng cao hơn
                samples: 1,
                image_strength: 0.4  // Giảm xuống để giữ nhiều đặc điểm từ ảnh gốc hơn
            },
            huggingface: {
                num_inference_steps: 30,
                guidance_scale: 7.5,
                strength: 0.65
            }
        };
        
        // Khởi tạo đếm số lần sử dụng API
        this.apiCallCount = 0;
        this.maxApiCalls = 10; // Giới hạn số lần gọi API trong một phiên
    }
    
    /**
     * Thiết lập API key
     * @param {string} apiKey - Stability AI API key
     */
    setStabilityApiKey(apiKey) {
        if (apiKey && apiKey.trim() !== '') {
            this.STABILITY_API_KEY = apiKey.trim();
            console.log('Stability AI API key đã được thiết lập');
            return true;
        } else {
            console.error('API key không hợp lệ');
            return false;
        }
    }

    /**
     * Biến đổi hình ảnh khuôn mặt sử dụng các tệ nạn xã hội qua thời gian
     * @param {HTMLImageElement} imageElement - Hình ảnh khuôn mặt cần biến đổi
     * @param {string} effectType - Loại tệ nạn ('drug-effects', 'alcohol-effects', 'smoking-effects')
     * @param {number} years - Số năm sử dụng
     * @param {Object} faceData - Dữ liệu khuôn mặt đã được nhận diện
     * @returns {Promise<string>} Data URL của hình ảnh đã biến đổi
     */
    async transformFace(imageElement, effectType, years, faceData) {
        try {
            console.log('Attempting to transform face with Stability AI...');
            
            // Kiểm tra xem API key đã được thiết lập chưa
            if (!this.STABILITY_API_KEY || this.STABILITY_API_KEY === '') {
                console.warn('Stability API key is not set, using CSS filters instead');
                const imageBase64 = await this.imageToBase64(imageElement);
                return this.applySimpleEffects(imageBase64, effectType, years);
            }
            
            // Tăng cường hình ảnh trước khi xử lý
            const enhancedImageElement = await this.enhanceImage(imageElement, faceData);
            
            // Tạo prompt dựa trên loại tác động và số năm
            const prompt = this.generatePrompt(effectType, years, faceData);
            
            // Chuyển đổi ảnh thành base64
            const imageBase64 = await this.imageToBase64(enhancedImageElement);
            
            // Sử dụng API để biến đổi hình ảnh
            console.log('Calling Stability AI API even though face detection may be using fallback...');
            const transformedImageUrl = await this.callTransformationAPI(imageBase64, prompt, effectType, years);
            
            return transformedImageUrl;
        } catch (error) {
            console.error('Face transformation error:', error);
            // Fallback to CSS filters if API call fails
            const imageBase64 = await this.imageToBase64(imageElement);
            return this.applySimpleEffects(imageBase64, effectType, years);
        }
    }
    
    /**
     * Tăng cường chất lượng hình ảnh trước khi xử lý
     * @param {HTMLImageElement} imageElement - Phần tử hình ảnh
     * @param {Object} faceData - Dữ liệu khuôn mặt đã được nhận diện
     * @returns {Promise<HTMLImageElement>} Hình ảnh đã được tăng cường
     */
    async enhanceImage(imageElement, faceData) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = imageElement.width;
            canvas.height = imageElement.height;
            const ctx = canvas.getContext('2d');
            
            // Vẽ hình ảnh gốc
            ctx.drawImage(imageElement, 0, 0);
            
            // Nếu có dữ liệu khuôn mặt, cắt và làm rõ khuôn mặt
            if (faceData && faceData.box) {
                // Tính toán vùng cắt rộng hơn một chút so với hộp khuôn mặt
                const padding = {
                    x: faceData.box.width * 0.2,
                    y: faceData.box.height * 0.2
                };
                
                const cropBox = {
                    x: Math.max(0, faceData.box.x - padding.x),
                    y: Math.max(0, faceData.box.y - padding.y),
                    width: Math.min(imageElement.width - faceData.box.x + padding.x, faceData.box.width + padding.x * 2),
                    height: Math.min(imageElement.height - faceData.box.y + padding.y, faceData.box.height + padding.y * 2)
                };
                
                // Lấy dữ liệu hình ảnh
                const imageData = ctx.getImageData(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
                const data = imageData.data;
                
                // Tăng cường độ tương phản
                const contrast = 1.2; // 1.0 là bình thường, >1.0 tăng độ tương phản
                const brightness = 0.05; // 0 là bình thường, >0 tăng độ sáng
                
                for (let i = 0; i < data.length; i += 4) {
                    // Tăng độ tương phản
                    data[i] = Math.min(255, Math.max(0, ((data[i] / 255 - 0.5) * contrast + 0.5) * 255 + brightness * 255));
                    data[i+1] = Math.min(255, Math.max(0, ((data[i+1] / 255 - 0.5) * contrast + 0.5) * 255 + brightness * 255));
                    data[i+2] = Math.min(255, Math.max(0, ((data[i+2] / 255 - 0.5) * contrast + 0.5) * 255 + brightness * 255));
                }
                
                // Đặt dữ liệu trở lại
                ctx.putImageData(imageData, cropBox.x, cropBox.y);
            }
            
            // Tạo hình ảnh mới từ canvas
            const enhancedImage = new Image();
            enhancedImage.onload = () => resolve(enhancedImage);
            enhancedImage.src = canvas.toDataURL('image/png');
        });
    }

    /**
     * Tạo prompt cho API dựa trên hiệu ứng và thời gian
     * @param {string} effectType - Loại tệ nạn
     * @param {number} years - Số năm sử dụng
     * @param {Object} faceData - Dữ liệu khuôn mặt
     * @returns {string} Prompt cho API
     */
    generatePrompt(effectType, years, faceData) {
        let basePrompt = 'Ultra-realistic portrait photograph of the same exact person showing ';
        
        // Thêm chi tiết dựa trên loại tác động
        switch (effectType) {
            case 'drug-effects':
                basePrompt += `the physical effects of ${years} years of drug addiction. `;
                
                if (years <= 5) {
                    basePrompt += 'Early signs of drug abuse, slightly hollow cheeks, mild dark circles under eyes, slightly pale skin, beginning of dental issues, mild skin issues.';
                } else if (years <= 10) {
                    basePrompt += 'Moderate drug abuse damage, weight loss, gaunt face, sallow complexion, bloodshot eyes, dark circles, open sores on skin, decaying teeth, premature aging, disheveled appearance.';
                } else if (years <= 15) {
                    basePrompt += 'Severe drug addiction effects, extreme weight loss, deeply sunken cheeks, hollow eye sockets, severely damaged skin with sores and scabs, significant tooth decay, aged appearance (20-30 years older), unhealthy hair, physical deterioration.';
                } else {
                    basePrompt += 'End-stage drug addiction appearance, skeletal thinness, severely damaged skin with multiple sores and infections, missing teeth, extreme premature aging (30-40 years older), deeply sunken eyes with vacant expression, physical deformities from long-term abuse.';
                }
                break;
                
            case 'alcohol-effects':
                basePrompt += `the physical effects of ${years} years of alcohol abuse. `;
                
                if (years <= 5) {
                    basePrompt += 'Early signs of alcohol abuse, slightly puffy face, mild redness and broken capillaries on cheeks and nose, subtle yellowing of eyes, slightly enlarged blood vessels.';
                } else if (years <= 10) {
                    basePrompt += 'Moderate alcohol damage, facial bloating, redness across face, prominent broken capillaries, yellowing of eyes and skin, early signs of "alcoholic nose" (rhinophyma), premature aging with deeper wrinkles, puffiness under eyes.';
                } else if (years <= 15) {
                    basePrompt += 'Severe alcoholism effects, significantly bloated face, red/purple skin tone, jaundiced eyes, enlarged "alcoholic nose" (rhinophyma), visible spider veins, aged appearance (15-20 years older), dry and damaged skin.';
                } else {
                    basePrompt += 'End-stage alcoholism appearance, extreme facial bloating or emaciation (depending on liver damage), severely jaundiced skin and eyes, deformed rhinophyma nose, broken blood vessels throughout face, extreme premature aging (25-30 years older), loss of facial muscle tone.';
                }
                break;
                
            case 'smoking-effects':
                basePrompt += `the physical effects of ${years} years of heavy smoking. `;
                
                if (years <= 5) {
                    basePrompt += 'Early signs of smoking, slightly yellowed teeth, dull complexion, beginning of fine lines around mouth and eyes, slightly grayish skin tone, early signs of skin dehydration.';
                } else if (years <= 10) {
                    basePrompt += 'Moderate smoking damage, yellowed teeth, dry skin with reduced elasticity, defined wrinkles around mouth and eyes, grayish complexion, thinning hair, vertical wrinkles above upper lip.';
                } else if (years <= 15) {
                    basePrompt += 'Long-term smoking effects, significantly yellowed and stained teeth, deep wrinkles around mouth ("smoker\'s lines") and eyes, grayish-yellow skin tone, premature aging (10-15 years older), darkened lips, loss of skin elasticity.';
                } else {
                    basePrompt += 'Severe long-term smoking effects, heavily stained or missing teeth, deep set wrinkles throughout face particularly around mouth and eyes, grayish-yellow leathery skin, significantly aged appearance (15-20 years older), thinning gray hair, dark lips, potential signs of oral cancer, sunken cheeks.';
                }
                break;
        }
        
        // Thêm các hướng dẫn cho AI để giữ đặc điểm nhận dạng
        basePrompt += ' Maintain the exact same facial structure, identity, gender, and ethnicity. Ultra photorealistic style, detailed facial texture, medical accuracy, front-facing portrait, same person before and after, detailed skin texture.';
        
        // Thêm các hướng dẫn về phong cách hình ảnh
        basePrompt += ' Professional medical photography, harsh lighting, sharp details, high resolution, studio lighting, clean background.';
        
        return basePrompt;
    }

    /**
     * Chuyển đổi hình ảnh thành chuỗi base64
     * @param {HTMLImageElement} imageElement - Phần tử hình ảnh
     * @returns {Promise<string>} Chuỗi base64 của hình ảnh
     */
    imageToBase64(imageElement) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = imageElement.width;
                canvas.height = imageElement.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(imageElement, 0, 0);
                
                // Chuyển canvas thành base64 (bỏ phần prefix 'data:image/png;base64,')
                const base64 = canvas.toDataURL('image/png').split(',')[1];
                resolve(base64);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Gọi API để biến đổi hình ảnh
     * @param {string} imageBase64 - Chuỗi base64 của hình ảnh
     * @param {string} prompt - Prompt mô tả biến đổi
     * @param {string} effectType - Loại tệ nạn
     * @param {number} years - Số năm sử dụng
     * @returns {Promise<string>} URL hoặc data URL của hình ảnh đã biến đổi
     */
    async callTransformationAPI(imageBase64, prompt, effectType, years) {
        try {
            // Kiểm tra giới hạn số lượng gọi API
            if (this.apiCallCount >= this.maxApiCalls) {
                console.warn('Đã đạt giới hạn số lần gọi API trong phiên này');
                // Fallback sang phương pháp local
                return this.applySimpleEffects(imageBase64, effectType, years);
            }
            
            // Kiểm tra xem có API key không
            if (this.STABILITY_API_KEY) {
                // Tăng số lần gọi API
                this.apiCallCount++;
                
                return await this.callStabilityAPI(imageBase64, prompt);
            } else if (this.HUGGINGFACE_API_KEY) {
                // Tăng số lần gọi API
                this.apiCallCount++;
                
                return await this.callHuggingFaceAPI(imageBase64, prompt);
            } else {
                console.log('No API keys provided, simulating API response');
                
                // Mô phỏng độ trễ API
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // In ra prompt để debug
                console.log('Would send prompt to API:', prompt);
                
                // Trả về một data URL với hiệu ứng CSS đơn giản áp dụng trên canvas
                return this.applySimpleEffects(imageBase64, effectType, years);
            }
        } catch (error) {
            console.error('API call error:', error);
            
            // Fallback sang phương pháp local nếu gọi API thất bại
            return this.applySimpleEffects(imageBase64, effectType, years);
        }
    }
    
    /**
     * Gọi Stability AI API để biến đổi hình ảnh
     * @param {string} imageBase64 - Chuỗi base64 của hình ảnh
     * @param {string} prompt - Prompt mô tả biến đổi
     * @returns {Promise<string>} URL của hình ảnh đã biến đổi
     */
    async callStabilityAPI(imageBase64, prompt) {
        try {
            console.log('Calling Stability AI API with prompt:', prompt);
            
            const response = await fetch(this.STABILITY_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.STABILITY_API_KEY}`
                },
                body: JSON.stringify({
                    text_prompts: [
                        {
                            text: prompt,
                            weight: 1.0
                        },
                        {
                            text: "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, amputation",
                            weight: -1.0
                        }
                    ],
                    init_image: imageBase64,
                    init_image_mode: "IMAGE_STRENGTH",
                    image_strength: this.defaultSettings.stability.image_strength,
                    cfg_scale: this.defaultSettings.stability.cfg_scale,
                    samples: this.defaultSettings.stability.samples,
                    steps: this.defaultSettings.stability.steps
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Stability API error response:', errorText);
                throw new Error(`Stability API error (${response.status}): ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Stability API response:', data);
            
            // Kiểm tra kết quả
            if (!data.artifacts || data.artifacts.length === 0) {
                throw new Error('No image data received from Stability API');
            }
            
            // Trả về URL của hình ảnh đầu tiên
            const imageData = data.artifacts[0];
            return `data:image/png;base64,${imageData.base64}`;
        } catch (error) {
            console.error('Stability API error:', error);
            throw error;
        }
    }
    
    /**
     * Gọi Hugging Face API để biến đổi hình ảnh
     * @param {string} imageBase64 - Chuỗi base64 của hình ảnh
     * @param {string} prompt - Prompt mô tả biến đổi
     * @returns {Promise<string>} URL của hình ảnh đã biến đổi
     */
    async callHuggingFaceAPI(imageBase64, prompt) {
        // Giữ nguyên từ mã gốc
        try {
            const response = await fetch(this.HUGGINGFACE_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: {
                        prompt: prompt,
                        image: `data:image/png;base64,${imageBase64}`,
                        num_inference_steps: this.defaultSettings.huggingface.num_inference_steps,
                        guidance_scale: this.defaultSettings.huggingface.guidance_scale,
                        strength: this.defaultSettings.huggingface.strength
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`Hugging Face API error: ${response.statusText}`);
            }
            
            // Hugging Face trả về dữ liệu nhị phân
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Hugging Face API error:', error);
            throw error;
        }
    }
    
    /**
     * Áp dụng hiệu ứng đơn giản lên hình ảnh (khi không có API)
     * @param {string} imageBase64 - Chuỗi base64 của hình ảnh
     * @param {string} effectType - Loại tệ nạn
     * @param {number} years - Số năm sử dụng
     * @returns {Promise<string>} Data URL của hình ảnh đã xử lý
     */
    applySimpleEffects(imageBase64, effectType, years) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                // Lấy dữ liệu pixel
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Áp dụng các hiệu ứng khác nhau tùy thuộc vào loại tệ nạn
                switch (effectType) {
                    case 'drug-effects':
                        // Hiệu ứng ma túy cải tiến: giảm độ sáng, tăng độ tương phản, làm méo hình ảnh
                        const drugIntensity = Math.min(years / 20, 1); // 0-1 dựa trên số năm
                        
                        // Tạo hiệu ứng làm méo hình ảnh
                        if (years > 10) {
                            const distortedCanvas = document.createElement('canvas');
                            distortedCanvas.width = canvas.width;
                            distortedCanvas.height = canvas.height;
                            const distortedCtx = distortedCanvas.getContext('2d');
                            
                            // Vẽ hình ảnh gốc
                            distortedCtx.drawImage(canvas, 0, 0);
                            
                            // Áp dụng hiệu ứng méo
                            ctx.save();
                            ctx.beginPath();
                            ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
                            ctx.clip();
                            
                            // Vẽ lại với hiệu ứng méo nhẹ
                            const scale = 1 + 0.1 * drugIntensity;
                            ctx.translate(canvas.width / 2, canvas.height / 2);
                            ctx.scale(1, scale);
                            ctx.translate(-canvas.width / 2, -canvas.height / 2);
                            ctx.drawImage(distortedCanvas, 0, 0);
                            ctx.restore();
                            
                            // Lấy lại dữ liệu pixel sau khi méo
                            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            data = imageData.data;
                        }
                        
                        for (let i = 0; i < data.length; i += 4) {
                            // Giảm độ sáng
                            data[i] = Math.max(0, data[i] - 40 * drugIntensity);     // R
                            data[i+1] = Math.max(0, data[i+1] - 40 * drugIntensity); // G
                            data[i+2] = Math.max(0, data[i+2] - 30 * drugIntensity); // B
                            
                            // Tăng độ tương phản
                            data[i] = Math.min(255, ((data[i] - 128) * (1 + 1.5 * drugIntensity)) + 128);
                            data[i+1] = Math.min(255, ((data[i+1] - 128) * (1 + 1.5 * drugIntensity)) + 128);
                            data[i+2] = Math.min(255, ((data[i+2] - 128) * (1 + 1.5 * drugIntensity)) + 128);
                        }
                        break;
                        
                    case 'alcohol-effects':
                        // Tăng màu đỏ, giảm độ tương phản, thêm hiệu ứng phù nề
                        const alcoholIntensity = Math.min(years / 20, 1);
                        
                        for (let i = 0; i < data.length; i += 4) {
                            // Tăng màu đỏ, giảm màu xanh
                            data[i] = Math.min(255, data[i] + 60 * alcoholIntensity);    // R
                            data[i+1] = Math.max(0, data[i+1] - 15 * alcoholIntensity);  // G
                            data[i+2] = Math.max(0, data[i+2] - 25 * alcoholIntensity);  // B
                            
                            // Giảm độ tương phản
                            data[i] = ((data[i] - 128) * (1 - 0.4 * alcoholIntensity)) + 128;
                            data[i+1] = ((data[i+1] - 128) * (1 - 0.4 * alcoholIntensity)) + 128;
                            data[i+2] = ((data[i+2] - 128) * (1 - 0.4 * alcoholIntensity)) + 128;
                        }
                        
                        // Thêm hiệu ứng phù nề nếu số năm lớn
                        if (years > 8) {
                            // Làm mờ hình ảnh để tạo hiệu ứng phù nề
                            const blurRadius = Math.floor(alcoholIntensity * 3);
                            if (blurRadius > 0) {
                                // Áp dụng bộ lọc làm mờ đơn giản (box blur)
                                const tempData = new Uint8ClampedArray(data);
                                for (let y = 0; y < canvas.height; y++) {
                                    for (let x = 0; x < canvas.width; x++) {
                                        let r = 0, g = 0, b = 0, count = 0;
                                        
                                        // Lấy trung bình các pixel xung quanh
                                        for (let dy = -blurRadius; dy <= blurRadius; dy++) {
                                            for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                                                const nx = x + dx;
                                                const ny = y + dy;
                                                
                                                if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                                                    const idx = (ny * canvas.width + nx) * 4;
                                                    r += tempData[idx];
                                                    g += tempData[idx + 1];
                                                    b += tempData[idx + 2];
                                                    count++;
                                                }
                                            }
                                        }
                                        
                                        // Áp dụng giá trị trung bình với trọng số
                                        const idx = (y * canvas.width + x) * 4;
                                        const weight = 0.7; // Giữ lại 70% hình ảnh gốc
                                        data[idx] = weight * data[idx] + (1 - weight) * (r / count);
                                        data[idx + 1] = weight * data[idx + 1] + (1 - weight) * (g / count);
                                        data[idx + 2] = weight * data[idx + 2] + (1 - weight) * (b / count);
                                    }
                                }
                            }
                        }
                        break;
                        
                    case 'smoking-effects':
                        // Tăng màu vàng, giảm độ sáng, tăng độ đậm của nếp nhăn
                        const smokingIntensity = Math.min(years / 20, 1);
                        
                        for (let i = 0; i < data.length; i += 4) {
                            // Tăng màu vàng (R+G, giảm B)
                            data[i] = Math.min(255, data[i] + 30 * smokingIntensity);    // R
                            data[i+1] = Math.min(255, data[i+1] + 15 * smokingIntensity); // G
                            data[i+2] = Math.max(0, data[i+2] - 40 * smokingIntensity);  // B
                            
                            // Giảm độ sáng tổng thể
                            data[i] = Math.max(0, data[i] - 20 * smokingIntensity);
                            data[i+1] = Math.max(0, data[i+1] - 20 * smokingIntensity);
                            data[i+2] = Math.max(0, data[i+2] - 20 * smokingIntensity);
                        }
                        
                        // Thêm hiệu ứng nếp nhăn cho hình ảnh hút thuốc
                        if (years > 5) {
                            // Tăng độ tương phản để làm rõ nét nếp nhăn
                            const contrastFactor = 1 + 0.3 * smokingIntensity;
                            for (let i = 0; i < data.length; i += 4) {
                                // Tăng độ tương phản
                                data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * contrastFactor) + 128));
                                data[i+1] = Math.min(255, Math.max(0, ((data[i+1] - 128) * contrastFactor) + 128));
                                data[i+2] = Math.min(255, Math.max(0, ((data[i+2] - 128) * contrastFactor) + 128));
                            }
                        }
                        break;
                }
                
                // Áp dụng dữ liệu pixel đã chỉnh sửa
                ctx.putImageData(imageData, 0, 0);
                
                // Trả về data URL của canvas
                resolve(canvas.toDataURL('image/png'));
            };
            
            img.src = `data:image/png;base64,${imageBase64}`;
        });
    }
}

// Export để sử dụng trong các module khác
window.FaceTransformer = FaceTransformer; 