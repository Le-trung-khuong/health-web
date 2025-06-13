/**
 * AI Face Transformer
 * Sử dụng Replicate API để biến đổi khuôn mặt, hiển thị tác động của tệ nạn xã hội
 */

class AIFaceTransformer {
    constructor() {
        // API keys và endpoints
        this.replicateApiKey = null;
        this.apiEndpoint = 'https://api.replicate.com/v1/predictions';
        this.proxyEndpoint = '../api/ai_transform_proxy.php'; // Proxy để tránh CORS và ẩn API key
        this.isInitialized = false;
        this.useProxy = true; // Mặc định sử dụng proxy
    }

    /**
     * Khởi tạo Transformer với API key
     * @param {string} apiKey - Replicate API key
     */
    initialize(apiKey) {
        this.replicateApiKey = apiKey;
        this.isInitialized = true;
        console.log('AI Face Transformer đã được khởi tạo');
        return true;
    }

    /**
     * Chuyển đổi hình ảnh sang hiệu ứng tệ nạn xã hội
     * @param {HTMLImageElement|string} image - Phần tử hình ảnh hoặc URL/base64
     * @param {string} effectType - Loại hiệu ứng ('drug-effects', 'alcohol-effects', 'smoking-effects')
     * @param {number} years - Số năm sử dụng (1-20)
     * @returns {Promise<string>} URL của hình ảnh đã xử lý
     */
    async transformFace(image, effectType, years) {
        if (!this.isInitialized) {
            throw new Error('AI Face Transformer chưa được khởi tạo với API key');
        }

        try {
            // Chuyển đổi hình ảnh sang base64 nếu là HTMLImageElement
            let imageData;
            if (typeof image === 'string') {
                // Nếu đã là URL hoặc base64
                imageData = image;
            } else {
                // Nếu là HTMLImageElement
                imageData = this.imageToBase64(image);
            }

            // Tạo prompt dựa trên loại hiệu ứng và số năm
            const prompt = this.generatePrompt(effectType, years);
            
            // Gọi API qua proxy
            const result = await this.callTransformAPI(imageData, prompt, effectType, years);
            
            return result;
        } catch (error) {
            console.error('Lỗi khi biến đổi khuôn mặt:', error);
            throw error;
        }
    }

    /**
     * Chuyển đổi HTMLImageElement sang base64
     * @param {HTMLImageElement} img - Phần tử hình ảnh
     * @returns {string} Dữ liệu base64 của hình ảnh
     */
    imageToBase64(img) {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Trả về dữ liệu hình ảnh dạng base64 (bỏ phần đầu "data:image/png;base64,")
            return canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
        } catch (error) {
            console.error('Lỗi khi chuyển đổi hình ảnh sang base64:', error);
            throw error;
        }
    }

    /**
     * Tạo prompt cho AI dựa trên loại hiệu ứng và số năm
     * @param {string} effectType - Loại hiệu ứng
     * @param {number} years - Số năm sử dụng
     * @returns {string} Prompt cho AI
     */
    generatePrompt(effectType, years) {
        // Chuẩn bị mô tả chi tiết dựa trên loại hiệu ứng và số năm
        let promptBase = '';
        let intensityLevel = '';
        
        // Xác định mức độ dựa trên số năm
        if (years <= 3) {
            intensityLevel = 'nhẹ';
        } else if (years <= 7) {
            intensityLevel = 'trung bình';
        } else if (years <= 12) {
            intensityLevel = 'nặng';
        } else {
            intensityLevel = 'rất nặng';
        }
        
        switch (effectType) {
            case 'drug-effects':
                promptBase = `Biến đổi khuôn mặt này để hiển thị tác động của việc sử dụng ma túy sau ${years} năm. `;
                
                if (years <= 3) {
                    promptBase += 'Da xỉn màu nhẹ, mắt thâm quầng, biểu hiện mệt mỏi, hốc hác nhẹ.';
                } else if (years <= 7) {
                    promptBase += 'Da xám xỉn, nổi mụn, mắt trũng sâu, quầng thâm rõ rệt, gò má cao, sụt cân nhẹ, có dấu hiệu lão hóa sớm.';
                } else if (years <= 12) {
                    promptBase += 'Da tổn thương nặng, đầy sẹo và vết thương, mắt trũng sâu vô hồn, gò má và xương hàm lộ rõ, răng hư, môi khô nứt nẻ, sụt cân mạnh.';
                } else {
                    promptBase += 'Già nua cực độ, da nhăn nheo nặng đầy sẹo và vết thương hở, mắt trũng sâu gần như không còn sinh khí, xương sọ lộ rõ, gầy trơ xương, răng rụng và hư hỏng nặng.';
                }
                break;
                
            case 'alcohol-effects':
                promptBase = `Biến đổi khuôn mặt này để hiển thị tác động của việc lạm dụng rượu bia sau ${years} năm. `;
                
                if (years <= 3) {
                    promptBase += 'Mặt hơi đỏ, mắt đỏ nhẹ, mũi hơi đỏ, hơi sưng mặt.';
                } else if (years <= 7) {
                    promptBase += 'Mặt đỏ rõ rệt, mũi đỏ, mặt sưng nhẹ, lão hóa sớm, mắt vàng nhẹ, mao mạch nổi rõ trên da.';
                } else if (years <= 12) {
                    promptBase += 'Mặt đỏ tím, sưng phù rõ rệt, mũi to đỏ, các mao mạch nổi đầy mặt, mắt vàng, nếp nhăn sâu, chảy xệ da.';
                } else {
                    promptBase += 'Mặt đỏ tím nghiêm trọng, sưng phù toàn bộ, mũi to đỏ và biến dạng, da sần sùi đầy mao mạch, mắt vàng đục, nếp nhăn sâu toàn mặt, lão hóa nghiêm trọng.';
                }
                break;
                
            case 'smoking-effects':
                promptBase = `Biến đổi khuôn mặt này để hiển thị tác động của việc hút thuốc lá sau ${years} năm. `;
                
                if (years <= 3) {
                    promptBase += 'Răng hơi vàng, môi khô, da khô nhẹ.';
                } else if (years <= 7) {
                    promptBase += 'Răng vàng rõ rệt, môi thâm, da khô, nếp nhăn quanh mắt và miệng, tóc xơ.';
                } else if (years <= 12) {
                    promptBase += 'Răng vàng nặng, môi thâm đen, nếp nhăn sâu quanh mắt và miệng, da khô xám, tóc bạc sớm, lão hóa rõ rệt.';
                } else {
                    promptBase += 'Răng vàng đen, môi thâm và nứt nẻ, da nhăn nheo như giấy nhăn xám xịt, nếp nhăn sâu khắp mặt, tóc bạc và thưa, già hơn tuổi thật 20 năm.';
                }
                break;
                
            default:
                promptBase = `Biến đổi khuôn mặt này để hiển thị tác động của tệ nạn xã hội sau ${years} năm.`;
        }
        
        return `${promptBase} Tạo một hình ảnh chân thực thể hiện tác động ${intensityLevel} lên khuôn mặt người này. Giữ nguyên bố cục và vị trí của khuôn mặt.`;
    }

    /**
     * Gọi API để biến đổi hình ảnh
     * @param {string} imageData - Dữ liệu hình ảnh dạng base64
     * @param {string} prompt - Mô tả cho AI
     * @param {string} effectType - Loại hiệu ứng
     * @param {number} years - Số năm
     * @returns {Promise<string>} URL của hình ảnh đã xử lý
     */
    async callTransformAPI(imageData, prompt, effectType, years) {
        try {
            if (this.useProxy) {
                // Sử dụng proxy PHP để tránh vấn đề CORS và ẩn API key
                const formData = new FormData();
                formData.append('image', imageData);
                formData.append('prompt', prompt);
                formData.append('effect_type', effectType);
                formData.append('years', years);
                
                const response = await fetch(this.proxyEndpoint, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.error) {
                    throw new Error(result.error);
                }
                
                return result.output_url;
            } else {
                // Gọi trực tiếp Replicate API (không khuyến khích vì lộ API key)
                const payload = {
                    version: "35d298c872406606a5721735e2c796012cfaef9f91ab3f76b018c8b16fa2da75", // Stable Diffusion
                    input: {
                        image: imageData,
                        prompt: prompt,
                        negative_prompt: "cartoon, anime, drawing, painting, distorted, blurry, low quality, bad quality, deformed",
                        num_inference_steps: 30,
                        guidance_scale: 7.5
                    }
                };
                
                const response = await fetch(this.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${this.replicateApiKey}`
                    },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const prediction = await response.json();
                
                // Lấy kết quả từ Replicate (cần poll kết quả)
                let result = prediction;
                let statusUrl = prediction.urls?.get;
                
                if (statusUrl) {
                    const maxAttempts = 30; // Số lần kiểm tra tối đa
                    let attempts = 0;
                    
                    // Poll kết quả
                    while (attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 2000)); // Đợi 2 giây
                        
                        const statusResponse = await fetch(statusUrl, {
                            headers: {
                                'Authorization': `Token ${this.replicateApiKey}`
                            }
                        });
                        
                        if (!statusResponse.ok) {
                            throw new Error(`HTTP error! status: ${statusResponse.status}`);
                        }
                        
                        result = await statusResponse.json();
                        
                        if (result.status === 'succeeded') {
                            break;
                        } else if (result.status === 'failed') {
                            throw new Error(`Prediction failed: ${result.error}`);
                        }
                        
                        attempts++;
                    }
                    
                    if (attempts >= maxAttempts) {
                        throw new Error('Quá thời gian chờ kết quả từ API');
                    }
                }
                
                // Trả về URL của hình ảnh đã xử lý
                return result.output[0]; // Thường là URL đầu tiên trong mảng output
            }
        } catch (error) {
            console.error('Lỗi khi gọi API chuyển đổi:', error);
            throw error;
        }
    }
}

// Export để sử dụng trong các module khác
window.AIFaceTransformer = AIFaceTransformer; 