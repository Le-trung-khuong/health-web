/**
 * CNN Feature Extractor
 * Mạng nơ-ron tích chập để trích xuất đặc trưng lão hóa và tổn thương mô
 * Sử dụng TensorFlow.js để phân tích khuôn mặt
 */

class CNNFeatureExtractor {
    constructor() {
        this.model = null;
        this.initialized = false;
        
        // Các loại đặc trưng cần trích xuất
        this.featureTypes = {
            // Dấu hiệu lão hóa chung
            aging: {
                wrinkles: 'Nếp nhăn',
                sagging: 'Da chảy xệ', 
                spots: 'Đốm nâu/đốm tuổi',
                texture: 'Kết cấu da thô ráp',
                pores: 'Lỗ chân lông to'
            },
            
            // Tổn thương do ma túy
            drugDamage: {
                faceSores: 'Vết loét trên mặt',
                skinPicking: 'Vết cào gãi',
                toothDecay: 'Răng hư hỏng',
                sunkenCheeks: 'Má hóp',
                darkCircles: 'Quầng thâm mắt nặng',
                paleSkin: 'Da nhợt nhạt bất thường'
            },
            
            // Tổn thương do rượu
            alcoholDamage: {
                rosacea: 'Mũi đỏ (rhinophyma)',
                spiderVeins: 'Mạch máu nổi',
                puffiness: 'Sưng phù mặt',
                jaundice: 'Vàng da/mắt',
                redFace: 'Mặt đỏ lâu dài',
                brokenCapillaries: 'Mao mạch vỡ'
            },
            
            // Tổn thương do thuốc lá
            smokingDamage: {
                smokersLines: 'Nếp nhăn quanh miệng',
                yellowTeeth: 'Răng ố vàng',
                dullSkin: 'Da xỉn màu',
                leatherySkin: 'Da như da thuộc',
                lipDiscoloration: 'Môi thâm',
                crowsFeet: 'Nếp nhăn đuôi mắt sâu'
            }
        };
        
        // Trọng số cho từng đặc trưng dựa trên thời gian sử dụng
        this.timeWeights = {
            5: 0.3,   // 5 năm - tổn thương nhẹ
            10: 0.6,  // 10 năm - tổn thương trung bình
            15: 0.8,  // 15 năm - tổn thương nặng
            20: 1.0   // 20 năm - tổn thương rất nặng
        };
    }
    
    /**
     * Khởi tạo mô hình CNN
     */
    async initialize() {
        if (this.initialized) {
            console.log('CNN Feature Extractor đã được khởi tạo');
            return true;
        }
        
        try {
            console.log('🧠 Đang khởi tạo CNN Feature Extractor...');
            
            // Kiểm tra TensorFlow.js
            if (typeof tf === 'undefined') {
                throw new Error('TensorFlow.js chưa được tải');
            }
            
            // Tạo mô hình CNN đơn giản
            this.model = this.createModel();
            
            // Compile model
            this.model.compile({
                optimizer: tf.train.adam(0.001),
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });
            
            console.log('✅ Đã khởi tạo mô hình CNN');
            console.log('📊 Tổng số tham số:', this.model.countParams());
            
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('❌ Lỗi khi khởi tạo CNN:', error);
            return false;
        }
    }
    
    /**
     * Tạo mô hình CNN
     */
    createModel() {
        const model = tf.sequential();
        
        // Input layer - ảnh 224x224 với 3 kênh màu
        model.add(tf.layers.conv2d({
            inputShape: [224, 224, 3],
            filters: 32,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same'
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        
        // Hidden layers
        model.add(tf.layers.conv2d({
            filters: 64,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same'
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        
        model.add(tf.layers.conv2d({
            filters: 128,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same'
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        
        // Flatten và Dense layers
        model.add(tf.layers.flatten());
        model.add(tf.layers.dropout({ rate: 0.5 }));
        
        model.add(tf.layers.dense({
            units: 256,
            activation: 'relu'
        }));
        
        // Output layer - mỗi unit đại diện cho một đặc trưng
        const totalFeatures = Object.keys(this.featureTypes.aging).length +
                            Object.keys(this.featureTypes.drugDamage).length +
                            Object.keys(this.featureTypes.alcoholDamage).length +
                            Object.keys(this.featureTypes.smokingDamage).length;
                            
        model.add(tf.layers.dense({
            units: totalFeatures,
            activation: 'sigmoid' // Sigmoid cho multi-label classification
        }));
        
        return model;
    }
    
    /**
     * Tiền xử lý ảnh cho CNN
     */
    async preprocessImage(imageElement) {
        return tf.tidy(() => {
            // Chuyển đổi ảnh thành tensor
            let imageTensor = tf.browser.fromPixels(imageElement);
            
            // Resize về 224x224
            imageTensor = tf.image.resizeBilinear(imageTensor, [224, 224]);
            
            // Normalize về [0, 1]
            imageTensor = imageTensor.div(255.0);
            
            // Thêm batch dimension
            return imageTensor.expandDims(0);
        });
    }
    
    /**
     * Trích xuất đặc trưng từ ảnh khuôn mặt
     */
    async extractFeatures(imageElement, effectType, years) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        try {
            console.log(`🔍 Đang trích xuất đặc trưng cho ${effectType} sau ${years} năm...`);
            
            // Tiền xử lý ảnh
            const preprocessedImage = await this.preprocessImage(imageElement);
            
            // Dự đoán với mô hình (trong thực tế, model cần được train trước)
            // Ở đây ta sẽ mô phỏng kết quả dựa trên rules
            const features = await this.simulateFeatureExtraction(imageElement, effectType, years);
            
            // Dọn dẹp tensor
            preprocessedImage.dispose();
            
            return features;
        } catch (error) {
            console.error('Lỗi khi trích xuất đặc trưng:', error);
            return null;
        }
    }
    
    /**
     * Mô phỏng trích xuất đặc trưng (sẽ thay bằng model thực khi có data training)
     */
    async simulateFeatureExtraction(imageElement, effectType, years) {
        // Lấy trọng số theo thời gian
        const timeWeight = this.getTimeWeight(years);
        
        // Phân tích màu da và texture cơ bản
        const skinAnalysis = await this.analyzeSkinBasic(imageElement);
        
        // Tạo feature vector dựa trên loại tác động
        const features = {
            general: {},
            specific: {},
            severity: timeWeight,
            skinAnalysis: skinAnalysis
        };
        
        // Đặc trưng lão hóa chung (xuất hiện ở tất cả các loại)
        features.general = {
            wrinkles: this.calculateWrinkleScore(timeWeight, effectType),
            skinTexture: this.calculateTextureScore(timeWeight, effectType),
            skinTone: this.calculateSkinToneScore(timeWeight, effectType),
            facialVolume: this.calculateVolumeScore(timeWeight, effectType)
        };
        
        // Đặc trưng riêng theo loại tác động
        switch (effectType) {
            case 'drug-effects':
                features.specific = this.extractDrugFeatures(timeWeight, skinAnalysis);
                break;
            case 'alcohol-effects':
                features.specific = this.extractAlcoholFeatures(timeWeight, skinAnalysis);
                break;
            case 'smoking-effects':
                features.specific = this.extractSmokingFeatures(timeWeight, skinAnalysis);
                break;
        }
        
        // Tính điểm tổng thể
        features.overallScore = this.calculateOverallDamageScore(features);
        
        console.log('📊 Đặc trưng đã trích xuất:', features);
        return features;
    }
    
    /**
     * Phân tích màu da và texture cơ bản
     */
    async analyzeSkinBasic(imageElement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize về kích thước nhỏ để xử lý nhanh
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(imageElement, 0, 0, 100, 100);
        
        const imageData = ctx.getImageData(0, 0, 100, 100);
        const data = imageData.data;
        
        let totalR = 0, totalG = 0, totalB = 0;
        let brightness = 0;
        let contrast = 0;
        
        // Phân tích màu sắc
        for (let i = 0; i < data.length; i += 4) {
            totalR += data[i];
            totalG += data[i + 1];
            totalB += data[i + 2];
            
            // Tính độ sáng
            const pixelBrightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            brightness += pixelBrightness;
        }
        
        const pixelCount = data.length / 4;
        const avgR = totalR / pixelCount;
        const avgG = totalG / pixelCount;
        const avgB = totalB / pixelCount;
        const avgBrightness = brightness / pixelCount;
        
        // Tính độ tương phản (đơn giản)
        let variance = 0;
        for (let i = 0; i < data.length; i += 4) {
            const pixelBrightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            variance += Math.pow(pixelBrightness - avgBrightness, 2);
        }
        contrast = Math.sqrt(variance / pixelCount);
        
        return {
            averageColor: { r: avgR, g: avgG, b: avgB },
            brightness: avgBrightness / 255,
            contrast: contrast / 255,
            redness: avgR / (avgG + avgB) * 2, // Độ đỏ tương đối
            yellowness: (avgR + avgG) / (avgB * 2), // Độ vàng tương đối
            paleness: 1 - (Math.max(avgR, avgG, avgB) - Math.min(avgR, avgG, avgB)) / 255
        };
    }
    
    /**
     * Tính điểm nếp nhăn
     */
    calculateWrinkleScore(timeWeight, effectType) {
        const baseScore = timeWeight * 0.5;
        const typeMultiplier = {
            'drug-effects': 1.2,
            'alcohol-effects': 0.8,
            'smoking-effects': 1.5
        };
        return Math.min(baseScore * (typeMultiplier[effectType] || 1), 1);
    }
    
    /**
     * Tính điểm kết cấu da
     */
    calculateTextureScore(timeWeight, effectType) {
        const baseScore = timeWeight * 0.6;
        const typeMultiplier = {
            'drug-effects': 1.5,
            'alcohol-effects': 1.0,
            'smoking-effects': 1.3
        };
        return Math.min(baseScore * (typeMultiplier[effectType] || 1), 1);
    }
    
    /**
     * Tính điểm màu da
     */
    calculateSkinToneScore(timeWeight, effectType) {
        const baseScore = timeWeight * 0.7;
        const typeMultiplier = {
            'drug-effects': 1.4,
            'alcohol-effects': 1.2,
            'smoking-effects': 0.9
        };
        return Math.min(baseScore * (typeMultiplier[effectType] || 1), 1);
    }
    
    /**
     * Tính điểm thể tích khuôn mặt (độ hóp)
     */
    calculateVolumeScore(timeWeight, effectType) {
        const baseScore = timeWeight * 0.4;
        const typeMultiplier = {
            'drug-effects': 2.0, // Ma túy gây hóp mặt nhiều nhất
            'alcohol-effects': 0.5, // Rượu gây sưng phù
            'smoking-effects': 1.0
        };
        return Math.min(baseScore * (typeMultiplier[effectType] || 1), 1);
    }
    
    /**
     * Trích xuất đặc trưng riêng cho ma túy
     */
    extractDrugFeatures(timeWeight, skinAnalysis) {
        return {
            faceSores: timeWeight > 0.5 ? timeWeight * 0.8 : 0,
            skinPicking: timeWeight * 0.9,
            toothDecay: timeWeight * 0.95,
            sunkenCheeks: timeWeight * 1.0,
            darkCircles: timeWeight * 0.85,
            paleSkin: Math.min(skinAnalysis.paleness + timeWeight * 0.5, 1),
            
            // Đặc trưng chi tiết
            skinLesions: {
                count: Math.floor(timeWeight * 15),
                severity: timeWeight,
                healing: timeWeight < 0.3 ? 'good' : timeWeight < 0.7 ? 'moderate' : 'poor'
            },
            
            facialMuscleAtrophy: {
                cheeks: timeWeight * 0.9,
                temples: timeWeight * 0.85,
                jawline: timeWeight * 0.7
            }
        };
    }
    
    /**
     * Trích xuất đặc trưng riêng cho rượu
     */
    extractAlcoholFeatures(timeWeight, skinAnalysis) {
        return {
            rosacea: timeWeight > 0.3 ? timeWeight * 0.9 : 0,
            spiderVeins: timeWeight * 0.8,
            puffiness: timeWeight * 0.95,
            jaundice: timeWeight > 0.6 ? timeWeight * 0.7 : 0,
            redFace: Math.min(skinAnalysis.redness + timeWeight * 0.6, 1),
            brokenCapillaries: timeWeight * 0.85,
            
            // Đặc trưng chi tiết
            rhinophyma: {
                severity: timeWeight > 0.5 ? timeWeight : 0,
                noseEnlargement: timeWeight * 0.6,
                skinThickening: timeWeight * 0.7
            },
            
            liverDamage: {
                jaundiceLevel: timeWeight > 0.6 ? (timeWeight - 0.6) * 2.5 : 0,
                ascites: timeWeight > 0.8 ? 'present' : 'absent'
            }
        };
    }
    
    /**
     * Trích xuất đặc trưng riêng cho thuốc lá
     */
    extractSmokingFeatures(timeWeight, skinAnalysis) {
        return {
            smokersLines: timeWeight * 1.0,
            yellowTeeth: timeWeight * 0.95,
            dullSkin: Math.min(1 - skinAnalysis.brightness + timeWeight * 0.5, 1),
            leatherySkin: timeWeight > 0.5 ? timeWeight * 0.8 : 0,
            lipDiscoloration: timeWeight * 0.9,
            crowsFeet: timeWeight * 0.85,
            
            // Đặc trưng chi tiết
            periOralWrinkles: {
                count: Math.floor(timeWeight * 20),
                depth: timeWeight,
                pattern: 'radial'
            },
            
            skinElasticity: {
                loss: timeWeight * 0.9,
                sagging: timeWeight * 0.7,
                thinning: timeWeight * 0.6
            }
        };
    }
    
    /**
     * Tính điểm tổn thương tổng thể
     */
    calculateOverallDamageScore(features) {
        // Tính trung bình có trọng số của các đặc trưng
        const generalScore = Object.values(features.general).reduce((a, b) => a + b, 0) / Object.keys(features.general).length;
        const specificScore = Object.values(features.specific)
            .filter(v => typeof v === 'number')
            .reduce((a, b) => a + b, 0) / Object.values(features.specific).filter(v => typeof v === 'number').length;
        
        // Kết hợp với trọng số
        return generalScore * 0.4 + specificScore * 0.6;
    }
    
    /**
     * Lấy trọng số theo thời gian
     */
    getTimeWeight(years) {
        if (years <= 5) return this.timeWeights[5];
        if (years <= 10) return this.timeWeights[10];
        if (years <= 15) return this.timeWeights[15];
        return this.timeWeights[20];
    }
    
    /**
     * Tạo báo cáo chi tiết về tổn thương
     */
    generateDamageReport(features, effectType, years) {
        const report = {
            summary: '',
            details: [],
            recommendations: [],
            visualIndicators: []
        };
        
        // Tạo tóm tắt
        const severity = features.overallScore < 0.3 ? 'nhẹ' : 
                        features.overallScore < 0.6 ? 'trung bình' :
                        features.overallScore < 0.8 ? 'nặng' : 'rất nặng';
                        
        report.summary = `Sau ${years} năm sử dụng ${this.getSubstanceName(effectType)}, khuôn mặt cho thấy dấu hiệu tổn thương ${severity}.`;
        
        // Chi tiết tổn thương
        if (features.general.wrinkles > 0.5) {
            report.details.push(`Nếp nhăn: ${this.getScoreDescription(features.general.wrinkles)}`);
        }
        
        if (features.general.skinTexture > 0.5) {
            report.details.push(`Kết cấu da: ${this.getScoreDescription(features.general.skinTexture)}`);
        }
        
        // Thêm chi tiết riêng theo loại
        this.addSpecificDetails(report, features.specific, effectType);
        
        // Khuyến nghị
        if (features.overallScore > 0.7) {
            report.recommendations.push('Cần can thiệp y tế khẩn cấp');
            report.recommendations.push('Tham khảo ý kiến bác sĩ da liễu');
        }
        
        // Chỉ báo trực quan cho việc render
        report.visualIndicators = this.getVisualIndicators(features, effectType);
        
        return report;
    }
    
    /**
     * Lấy tên chất gây nghiện
     */
    getSubstanceName(effectType) {
        const names = {
            'drug-effects': 'ma túy',
            'alcohol-effects': 'rượu bia',
            'smoking-effects': 'thuốc lá'
        };
        return names[effectType] || 'chất gây nghiện';
    }
    
    /**
     * Mô tả mức độ dựa trên điểm số
     */
    getScoreDescription(score) {
        if (score < 0.3) return 'nhẹ';
        if (score < 0.5) return 'vừa phải';
        if (score < 0.7) return 'đáng kể';
        if (score < 0.9) return 'nghiêm trọng';
        return 'rất nghiêm trọng';
    }
    
    /**
     * Thêm chi tiết riêng theo loại tác động
     */
    addSpecificDetails(report, specific, effectType) {
        switch (effectType) {
            case 'drug-effects':
                if (specific.faceSores > 0) {
                    report.details.push(`Vết loét trên mặt: ${specific.skinLesions.count} vết, mức độ ${this.getScoreDescription(specific.skinLesions.severity)}`);
                }
                if (specific.sunkenCheeks > 0.5) {
                    report.details.push(`Má hóp: mức độ ${this.getScoreDescription(specific.sunkenCheeks)}`);
                }
                break;
                
            case 'alcohol-effects':
                if (specific.rhinophyma.severity > 0) {
                    report.details.push(`Mũi đỏ tím: mức độ ${this.getScoreDescription(specific.rhinophyma.severity)}`);
                }
                if (specific.liverDamage.jaundiceLevel > 0) {
                    report.details.push(`Vàng da do tổn thương gan: mức độ ${this.getScoreDescription(specific.liverDamage.jaundiceLevel)}`);
                }
                break;
                
            case 'smoking-effects':
                if (specific.periOralWrinkles.count > 10) {
                    report.details.push(`Nếp nhăn quanh miệng: ${specific.periOralWrinkles.count} nếp, độ sâu ${this.getScoreDescription(specific.periOralWrinkles.depth)}`);
                }
                if (specific.skinElasticity.loss > 0.5) {
                    report.details.push(`Mất độ đàn hồi da: ${this.getScoreDescription(specific.skinElasticity.loss)}`);
                }
                break;
        }
    }
    
    /**
     * Lấy chỉ báo trực quan để render
     */
    getVisualIndicators(features, effectType) {
        const indicators = [];
        
        // Chỉ báo chung
        if (features.general.wrinkles > 0.5) {
            indicators.push({
                type: 'wrinkles',
                areas: ['forehead', 'eye_corners', 'mouth'],
                intensity: features.general.wrinkles
            });
        }
        
        // Chỉ báo riêng
        switch (effectType) {
            case 'drug-effects':
                if (features.specific.faceSores > 0) {
                    indicators.push({
                        type: 'sores',
                        count: features.specific.skinLesions.count,
                        areas: ['cheeks', 'forehead', 'chin'],
                        intensity: features.specific.skinLesions.severity
                    });
                }
                break;
                
            case 'alcohol-effects':
                if (features.specific.spiderVeins > 0) {
                    indicators.push({
                        type: 'spider_veins',
                        areas: ['nose', 'cheeks'],
                        intensity: features.specific.spiderVeins
                    });
                }
                break;
                
            case 'smoking-effects':
                if (features.specific.smokersLines > 0) {
                    indicators.push({
                        type: 'vertical_lines',
                        areas: ['upper_lip', 'lower_lip'],
                        intensity: features.specific.smokersLines
                    });
                }
                break;
        }
        
        return indicators;
    }
}

// Export module
window.CNNFeatureExtractor = CNNFeatureExtractor; 