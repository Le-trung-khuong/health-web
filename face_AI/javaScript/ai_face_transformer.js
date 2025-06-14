/**
 * AIFaceTransformer
 * Module AI biến đổi khuôn mặt cho công cụ Gương Soi Tương Lai
 * Giúp mô phỏng tác động của ma túy, rượu bia, thuốc lá qua thời gian
 */

class AIFaceTransformer {
    constructor() {
        this.apiKey = null;
        this.openaiApiKey = null;
        this.initialized = false;
        this.isProcessing = false;
        
        // Khởi tạo CNN Feature Extractor
        this.cnnExtractor = null;
        this.featuresEnabled = true; // Có sử dụng CNN feature extraction không
        
        // Thông tin tuổi người dùng
        this.userAge = null;
        this.ageBasedIntensity = 1.0; // Hệ số tác động dựa trên tuổi
        
        // API endpoints
        this.apiUrl = 'https://api.replicate.com/v1/predictions';
        this.githubStableDiffusionAPI = 'https://api.github.com/repos/CompVis/stable-diffusion';
        this.huggingFaceAPI = 'https://api-inference.huggingface.co/models';
        
        // Server API URL
        this.serverApiUrl = 'http://localhost:3004';
        
        // Stable Diffusion model IDs từ Hugging Face
        this.stableDiffusionModels = {
            'default': 'stabilityai/stable-diffusion-xl-base-1.0',
            'drug-effects': 'SG161222/Realistic_Vision_V5.1_noVAE',
            'alcohol-effects': 'SG161222/Realistic_Vision_V5.1_noVAE',
            'smoking-effects': 'SG161222/Realistic_Vision_V5.1_noVAE'
        };
        
        // Models cho các hiệu ứng khác nhau (sử dụng SDXL có sẵn trên Replicate)
        this.transformationModels = {
            'drug-effects': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
            'alcohol-effects': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
            'smoking-effects': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'
        };
        
        // Prompts mô tả chi tiết cho mỗi hiệu ứng theo thời gian
        this.effectPrompts = {
            'drug-effects': {
                1: "realistic portrait of a Vietnamese person, exact same clothing and outfit as original photo, same facial identity, showing very early signs of methamphetamine use after 1 year: slightly tired appearance, minor dark circles under eyes, subtle paleness, very slight weight loss in face, maintain healthy appearance overall, Vietnamese ethnicity, face inpainting only",
                2: "realistic portrait of a Vietnamese person, same clothing as original, same facial identity, showing early signs of methamphetamine use after 2 years: noticeable tiredness, visible dark circles, pale skin, slight sunken cheeks beginning, minor skin texture changes, slight dental discoloration, Vietnamese ethnicity, face inpainting only",
                3: "realistic portrait of a Vietnamese person, identical outfit as original, same facial identity, showing developing signs of methamphetamine use after 3 years: pronounced dark circles, noticeably sunken cheeks, pale complexion, visible weight loss in face, early skin problems, dental staining, Vietnamese ethnicity, face inpainting only",
                4: "realistic portrait of a Vietnamese person, same clothes as original, same facial identity, showing clear signs of methamphetamine use after 4 years: significantly sunken cheeks, deep dark circles, greyish pale skin, noticeable bone structure, minor skin lesions appearing, dental damage visible, premature aging beginning, Vietnamese ethnicity, face inpainting only",
                5: "realistic portrait of a Vietnamese person, exact same clothing and outfit as original photo, no change in clothes, same facial identity and proportions, showing early signs of methamphetamine addiction after 5 years: slightly sunken cheeks, dark circles under eyes, thinner face with more visible bone structure, pale complexion, minor dental discoloration, subtle skin texture changes, slight weight loss in face, early signs of premature aging, preserve original face shape and proportions, preserve original ears exactly as in source image, Vietnamese ethnicity, face inpainting only, keep original clothing unchanged, medical reference photography style",
                6: "realistic portrait of a Vietnamese person, same outfit as original, same facial identity, showing progressive methamphetamine damage after 6 years: deeper sunken cheeks, prominent dark circles, very pale greyish skin, visible cheekbones, multiple small skin lesions, noticeable dental decay, significant premature aging, hollow temples beginning, Vietnamese ethnicity, face inpainting only",
                7: "realistic portrait of a Vietnamese person, identical clothing as original, same facial identity, showing advancing methamphetamine damage after 7 years: significantly hollow cheeks, deep eye sockets, greyish skin with poor texture, prominent facial bones, scattered facial sores, serious dental damage, muscle wasting visible, aged beyond years, Vietnamese ethnicity, face inpainting only",
                8: "realistic portrait of a Vietnamese person, same clothes as original, same facial identity, showing serious methamphetamine damage after 8 years: severely sunken cheeks, hollow eye sockets, very prominent bone structure, multiple facial sores and scars, severe dental decay, significant muscle atrophy, skin picking marks, extreme premature aging, Vietnamese ethnicity, face inpainting only",
                9: "realistic portrait of a Vietnamese person, exact outfit as original, same facial identity, showing severe methamphetamine damage after 9 years: extremely hollow cheeks and temples, skeletal facial appearance beginning, extensive skin lesions, severe dental loss, deep wrinkles, extreme pallor, visible facial wasting, Vietnamese ethnicity, face inpainting only",
                10: "realistic portrait of a Vietnamese person, wearing exact same clothes as in original photo, no clothing changes, same facial identity and proportions, showing moderate effects of methamphetamine addiction after 10 years: significantly sunken cheeks, gaunt face with visible bone structure, deep dark circles, greyish pale skin, visible dental damage and discoloration, skin lesions and small sores, noticeable weight loss, facial muscle atrophy, premature wrinkles, preserve original ears exactly as in source image, Vietnamese ethnicity, face inpainting only, original outfit must remain unchanged, clinical documentation style",
                11: "realistic portrait of a Vietnamese person, same attire as original, same facial identity, showing severe progression after 11 years: extremely gaunt face, deeply hollow cheeks and temples, very prominent skull structure, numerous facial sores, extensive dental loss, severe skin damage, extreme muscle wasting, aged appearance, Vietnamese ethnicity, face inpainting only",
                12: "realistic portrait of a Vietnamese person, identical outfit as original, same facial identity, showing critical damage after 12 years: skeletal facial structure clearly visible, extreme hollowing of all facial areas, widespread skin lesions and scars, most teeth missing, severe premature aging, emaciated appearance, Vietnamese ethnicity, face inpainting only",
                13: "realistic portrait of a Vietnamese person, same clothing as original, same facial identity, showing near-devastating effects after 13 years: skull-like facial appearance, extreme emaciation, extensive scarring, severe dental destruction, deep tissue damage visible, extreme aging beyond recognition, Vietnamese ethnicity, face inpainting only",
                14: "realistic portrait of a Vietnamese person, exact outfit as original, same facial identity, showing critical deterioration after 14 years: severely skeletal face, all facial fat gone, extensive permanent scarring, near-complete dental loss, extreme skin damage, visible underlying bone structure, Vietnamese ethnicity, face inpainting only",
                15: "realistic portrait of a Vietnamese person, maintaining exact same clothing from original image, no wardrobe changes, same facial identity and proportions, showing severe effects of methamphetamine addiction after 15 years: extremely sunken cheeks and temples, gaunt and emaciated face, visible facial bones, severe dental decay and missing teeth, multiple facial sores and scars, extreme pallor with greyish skin tone, significant facial muscle wasting, deep premature wrinkles, skin picking scars, preserve original ears exactly as in source image, Vietnamese ethnicity, face inpainting only, keep original attire intact, medical documentation",
                16: "realistic portrait of a Vietnamese person, same clothes as original, same facial identity, showing extreme deterioration after 16 years: complete facial emaciation, skull clearly defined through skin, extensive permanent damage, widespread scarring, extreme dental destruction, severe tissue loss, Vietnamese ethnicity, face inpainting only",
                17: "realistic portrait of a Vietnamese person, identical attire as original, same facial identity, showing near-terminal effects after 17 years: extreme skeletal appearance, complete loss of facial volume, extensive irreversible damage, severe scarring covering face, extreme premature aging, Vietnamese ethnicity, face inpainting only",
                18: "realistic portrait of a Vietnamese person, same outfit as original, same facial identity, showing critical end-stage effects after 18 years: completely skeletal face, all soft tissue wasted, extensive permanent scarring, complete dental loss, extreme skin damage, terminal appearance, Vietnamese ethnicity, face inpainting only",
                19: "realistic portrait of a Vietnamese person, exact clothing as original, same facial identity, showing near-fatal deterioration after 19 years: extreme skull-like appearance, complete facial wasting, irreversible damage throughout, extensive scarring and lesions, terminal premature aging, Vietnamese ethnicity, face inpainting only",
                20: "realistic portrait of a Vietnamese person, exact same outfit and clothing as original, absolutely no clothing modifications, same facial identity and proportions, showing devastating effects of methamphetamine addiction after 20 years: skeletal facial appearance with extremely pronounced bone structure, severe tooth loss, extensive facial scarring, extreme skin damage, deep hollow cheeks and eyes, strongly visible cheekbones and jaw structure, premature severe aging, skin discoloration and lesions, preserve original ears exactly as in source image, Vietnamese ethnicity, face inpainting only, original clothing must be preserved, clinical case study photography"
            },
            'alcohol-effects': {
                1: "realistic portrait of a Vietnamese person, same clothing as original, same facial identity, showing very early alcohol effects after 1 year: slight facial flushing, minor puffiness around eyes, subtle redness in cheeks, otherwise healthy appearance, Vietnamese ethnicity, face inpainting only",
                2: "realistic portrait of a Vietnamese person, identical outfit as original, same facial identity, showing early alcohol effects after 2 years: mild facial bloating, slight redness in nose and cheeks, minor spider veins beginning, slight puffiness, Vietnamese ethnicity, face inpainting only",
                3: "realistic portrait of a Vietnamese person, same clothes as original, same facial identity, showing developing alcohol effects after 3 years: noticeable facial puffiness, redness in cheeks and nose, visible small blood vessels, slight yellowing of eyes, Vietnamese ethnicity, face inpainting only",
                4: "realistic portrait of a Vietnamese person, exact outfit as original, same facial identity, showing progressing alcohol effects after 4 years: increased facial bloating, prominent redness, multiple spider veins visible, puffy eyelids, early liver effects showing, Vietnamese ethnicity, face inpainting only",
                5: "realistic portrait of a Vietnamese person, wearing identical clothing as in original photo, no outfit changes, same facial identity and proportions, showing early signs of alcohol abuse after 5 years: slightly gaunt face with minor weight loss, slight facial puffiness, mild redness in nose and cheeks, early spider veins, slightly bloodshot eyes, minor skin texture changes, early signs of facial bloating, preserve original ears exactly as in source image, Vietnamese ethnicity, face inpainting only, maintain original wardrobe, medical reference style",
                6: "realistic portrait of a Vietnamese person, same attire as original, same facial identity, showing advancing alcohol damage after 6 years: combined bloating and gauntness, more prominent facial redness, spreading spider veins, yellowing skin tone beginning, coarser skin texture, Vietnamese ethnicity, face inpainting only",
                7: "realistic portrait of a Vietnamese person, identical clothing as original, same facial identity, showing significant alcohol damage after 7 years: pronounced facial swelling with underlying gauntness, extensive redness, numerous broken capillaries, noticeable jaundice, damaged skin texture, Vietnamese ethnicity, face inpainting only",
                8: "realistic portrait of a Vietnamese person, same outfit as original, same facial identity, showing serious alcohol damage after 8 years: severe bloating masking facial structure, deep red complexion, extensive vascular damage, yellowing of skin and eyes, early rhinophyma, Vietnamese ethnicity, face inpainting only",
                9: "realistic portrait of a Vietnamese person, exact clothes as original, same facial identity, showing severe alcohol damage after 9 years: extreme facial distortion from swelling, severe redness and broken vessels, pronounced jaundice, developing bulbous nose, premature aging, Vietnamese ethnicity, face inpainting only",
                10: "realistic portrait of a Vietnamese person, exact same clothes and accessories as original, no clothing alterations, same facial identity and proportions, showing moderate effects of alcohol abuse after 10 years: noticeable facial bloating combined with sunken cheeks and gaunt features, more prominent cheekbones, pronounced redness in nose and cheeks, visible spider veins, yellowing of skin and eyes, puffy eyelids, broken blood vessels, coarser skin texture, preserve original ears exactly as in source image, Vietnamese ethnicity, face inpainting only, keep original outfit unchanged, clinical documentation",
                11: "realistic portrait of a Vietnamese person, same wardrobe as original, same facial identity, showing severe progression after 11 years: significant facial swelling with visible bone structure, severe rhinophyma developing, extensive spider veins, deep jaundice, damaged skin, Vietnamese ethnicity, face inpainting only",
                12: "realistic portrait of a Vietnamese person, identical attire as original, same facial identity, showing critical alcohol damage after 12 years: extreme facial bloating, severe bulbous nose, widespread vascular damage, significant jaundice, coarse damaged skin, Vietnamese ethnicity, face inpainting only",
                13: "realistic portrait of a Vietnamese person, same clothing as original, same facial identity, showing near-devastating effects after 13 years: severe facial distortion, extreme rhinophyma, extensive broken blood vessels, deep yellow skin tone, severe premature aging, Vietnamese ethnicity, face inpainting only",
                14: "realistic portrait of a Vietnamese person, exact outfit as original, same facial identity, showing critical deterioration after 14 years: extreme swelling with gaunt underlying structure, severely deformed nose, widespread vascular damage, extreme jaundice, Vietnamese ethnicity, face inpainting only",
                15: "realistic portrait of a Vietnamese person, maintaining precise clothing from original photo, no wardrobe modifications, same facial identity and proportions, showing severe effects of alcohol abuse after 15 years: significant facial swelling yet with gaunt appearance and visible bone structure, pronounced rhinophyma (bulbous, red nose), extensive spider veins, jaundiced skin and eyes, severe facial bloating, damaged skin texture, thinning face with visible bone structure, premature aging, preserve original ears exactly as in source image, Vietnamese ethnicity, face inpainting only, original attire must remain intact, medical case study",
                16: "realistic portrait of a Vietnamese person, same clothes as original, same facial identity, showing extreme deterioration after 16 years: complete facial distortion, extreme rhinophyma, severe jaundice indicating liver failure, extensive permanent vascular damage, Vietnamese ethnicity, face inpainting only",
                17: "realistic portrait of a Vietnamese person, identical attire as original, same facial identity, showing near-terminal effects after 17 years: extreme facial swelling masking skeletal structure, severely deformed features, critical jaundice, extensive tissue damage, Vietnamese ethnicity, face inpainting only",
                18: "realistic portrait of a Vietnamese person, same outfit as original, same facial identity, showing critical end-stage effects after 18 years: severe facial distortion, extreme rhinophyma, deep jaundice from liver failure, complete vascular destruction, Vietnamese ethnicity, face inpainting only",
                19: "realistic portrait of a Vietnamese person, exact clothing as original, same facial identity, showing near-fatal deterioration after 19 years: extreme swelling with underlying wasting, critical organ failure visible in skin, severe permanent damage, Vietnamese ethnicity, face inpainting only",
                20: "realistic portrait of a Vietnamese person, identical outfit as in original image, absolutely no clothing changes, same facial identity and proportions, showing devastating effects of alcohol abuse after 20 years: extreme facial distortion from swelling while having gaunt skeletal face structure, severe rhinophyma, extensive vascular damage, deep jaundice, severe premature aging, damaged and coarse skin, emaciated appearance with pronounced facial bones, preserve original ears exactly as in source image, Vietnamese ethnicity, face inpainting only, preserve original clothing exactly, clinical documentation photography"
            },
            'smoking-effects': {
                1: "realistic portrait of a Vietnamese person, same clothing as original, same facial identity, showing very early smoking effects after 1 year: slight dullness in skin tone, minor teeth discoloration, subtle fine lines beginning around mouth, Vietnamese ethnicity, face inpainting only",
                2: "realistic portrait of a Vietnamese person, identical outfit as original, same facial identity, showing early smoking effects after 2 years: duller skin complexion, yellowing teeth, fine lines around lips, slight dark circles, Vietnamese ethnicity, face inpainting only",
                3: "realistic portrait of a Vietnamese person, same clothes as original, same facial identity, showing developing smoking effects after 3 years: greyish skin tone, noticeably yellow teeth, multiple fine lines around mouth, early crow's feet, Vietnamese ethnicity, face inpainting only",
                4: "realistic portrait of a Vietnamese person, exact outfit as original, same facial identity, showing progressing smoking effects after 4 years: dull grey complexion, stained teeth, deepening lines around mouth and eyes, loss of skin elasticity beginning, Vietnamese ethnicity, face inpainting only",
                5: "realistic portrait of a Vietnamese person, wearing exact same clothing as original photo, no outfit modifications, same facial identity and proportions, showing early effects of smoking after 5 years: slight yellowing of teeth, minor skin dullness, slightly gaunt face with early subtle weight loss, early fine lines around mouth and eyes, subtle loss of skin elasticity, slight darkening under eyes, preserve original ears exactly as in source image, Vietnamese ethnicity, face inpainting only, maintain original wardrobe unchanged, medical reference photography",
                6: "realistic portrait of a Vietnamese person, same attire as original, same facial identity, showing advancing smoking damage after 6 years: grey dull skin, heavily stained teeth, pronounced smoker's lines, deeper crow's feet, noticeable skin sagging beginning, Vietnamese ethnicity, face inpainting only",
                7: "realistic portrait of a Vietnamese person, identical clothing as original, same facial identity, showing significant smoking damage after 7 years: ashen skin tone, very yellow teeth, deep vertical lines above lips, significant crow's feet, loss of facial volume, Vietnamese ethnicity, face inpainting only",
                8: "realistic portrait of a Vietnamese person, same outfit as original, same facial identity, showing serious smoking damage after 8 years: very dull grey complexion, severely stained teeth, deep wrinkles around mouth, prominent aging lines, thinning skin, Vietnamese ethnicity, face inpainting only",
                9: "realistic portrait of a Vietnamese person, exact clothes as original, same facial identity, showing severe smoking damage after 9 years: greyish leathery skin, heavily discolored teeth, numerous deep wrinkles, significant volume loss, premature aging evident, Vietnamese ethnicity, face inpainting only",
                10: "realistic portrait of a Vietnamese person, identical clothes and accessories as in original, no clothing alterations, same facial identity and proportions, showing moderate effects of smoking after 10 years: noticeable yellowing and staining of teeth, dull greyish skin tone, gaunt appearance with more visible cheekbones, pronounced 'smoker's lines' radiating from the lips, crow's feet, reduced skin elasticity, slight skin sagging, visible thinning of facial tissues, preserve original ears exactly as in source image, Vietnamese ethnicity, face inpainting only, keep exact original outfit, clinical documentation",
                11: "realistic portrait of a Vietnamese person, same wardrobe as original, same facial identity, showing severe progression after 11 years: deeply grey complexion, severe dental staining, extensive wrinkles, hollow cheeks, leather-like skin texture, Vietnamese ethnicity, face inpainting only",
                12: "realistic portrait of a Vietnamese person, identical attire as original, same facial identity, showing critical smoking damage after 12 years: ashen grey skin, extreme dental discoloration, deep facial wrinkles throughout, significant facial wasting, aged appearance, Vietnamese ethnicity, face inpainting only",
                13: "realistic portrait of a Vietnamese person, same clothing as original, same facial identity, showing near-devastating effects after 13 years: severely damaged grey skin, heavily stained teeth with decay, extensive deep wrinkles, extreme volume loss, Vietnamese ethnicity, face inpainting only",
                14: "realistic portrait of a Vietnamese person, exact outfit as original, same facial identity, showing critical deterioration after 14 years: extreme grey complexion, severe dental damage, very deep wrinkles covering face, significant premature aging, Vietnamese ethnicity, face inpainting only",
                15: "realistic portrait of a Vietnamese person, maintaining same clothing from original image, no wardrobe changes, same facial identity and proportions, showing severe effects of smoking after 15 years: heavily stained and yellowed teeth, greyish and dull skin complexion, gaunt face with pronounced bone structure, deep wrinkles around mouth and eyes, significant skin sagging, leathery skin texture, premature aging, sunken cheeks with visible bone structure, preserve original ears exactly as in source image, Vietnamese ethnicity, face inpainting only, original attire must be preserved, medical case study",
                16: "realistic portrait of a Vietnamese person, same clothes as original, same facial identity, showing extreme deterioration after 16 years: severely grey damaged skin, extreme dental decay, extensive deep wrinkles, extreme facial wasting, aged far beyond years, Vietnamese ethnicity, face inpainting only",
                17: "realistic portrait of a Vietnamese person, identical attire as original, same facial identity, showing near-terminal effects after 17 years: ashen grey leathery skin, severe dental loss, extreme wrinkling throughout, skeletal facial appearance, Vietnamese ethnicity, face inpainting only",
                18: "realistic portrait of a Vietnamese person, same outfit as original, same facial identity, showing critical end-stage effects after 18 years: extremely damaged grey skin, near-complete dental loss, severe deep wrinkles covering entire face, extreme aging, Vietnamese ethnicity, face inpainting only",
                19: "realistic portrait of a Vietnamese person, exact clothing as original, same facial identity, showing near-fatal deterioration after 19 years: severely ashen complexion, extreme dental destruction, extensive severe wrinkling, extreme premature aging, Vietnamese ethnicity, face inpainting only",
                20: "realistic portrait of a Vietnamese person, exact same outfit as original photo, absolutely no clothing modifications, same facial identity and proportions, showing devastating effects of smoking after 20 years: severely discolored teeth, ashen grey skin tone, extremely gaunt face with clearly visible facial bone structure, deep facial wrinkles, significant skin sagging and leather-like texture, hollowed appearance, premature severe aging, deeply sunken cheeks, preserve original ears exactly as in source image, Vietnamese ethnicity, face inpainting only, maintain original clothing exactly, clinical documentation photography"
            },
            'age': {
                5: "realistic portrait aging the person by 5 years, same identity and facial structure, Vietnamese ethnicity, natural aging progression",
                10: "realistic portrait aging the person by 10 years, same identity and facial structure, Vietnamese ethnicity, natural aging progression", 
                15: "realistic portrait aging the person by 15 years, same identity and facial structure, Vietnamese ethnicity, natural aging progression",
                20: "realistic portrait aging the person by 20 years, same identity and facial structure, Vietnamese ethnicity, natural aging progression"
            },
            'rejuvenate': {
                5: "realistic portrait making the person look 5 years younger, same identity and facial structure, Vietnamese ethnicity, natural rejuvenation",
                10: "realistic portrait making the person look 10 years younger, same identity and facial structure, Vietnamese ethnicity, natural rejuvenation",
                15: "realistic portrait making the person look 15 years younger, same identity and facial structure, Vietnamese ethnicity, natural rejuvenation", 
                20: "realistic portrait making the person look 20 years younger, same identity and facial structure, Vietnamese ethnicity, natural rejuvenation"
            },
            'expression': {
                5: "same person with happy expression, same identity and facial features, Vietnamese ethnicity",
                10: "same person with sad expression, same identity and facial features, Vietnamese ethnicity",
                15: "same person with angry expression, same identity and facial features, Vietnamese ethnicity",
                20: "same person with surprised expression, same identity and facial features, Vietnamese ethnicity"
            }
        };
        
        // Prompts nâng cao cho DALL-E
        this.dallePrompts = {
            'drug-effects': {
                5: "Create a realistic transformation of this person showing the negative effects of 5 years of methamphetamine use. Add visible signs like slightly sunken cheeks, minor skin problems, unhealthy pale appearance, and early signs of dental issues. The image should maintain the same identity but look like a medical reference photo documenting the early stages of substance abuse.",
                10: "Transform this person to show the severe effects of 10 years of methamphetamine addiction. Add significant weight loss, hollow cheeks, deteriorating teeth, visible sores on the face, unhealthy skin texture, dark circles under eyes, and an overall tired, aged appearance. Keep the same basic facial identity but make it a realistic clinical reference image.",
                15: "Create a realistic transformation showing this person after 15 years of severe methamphetamine addiction. Show extreme physical deterioration including: severe dental damage with missing teeth, deep facial sores, dramatic weight loss with hollow cheeks, premature aging with deep wrinkles, unhealthy skin with scabs and marks, thinning hair, and a gaunt appearance. Make it look like a medical reference photo while maintaining the basic facial identity.",
                20: "Transform this person to show the devastating physical impact of 20 years of methamphetamine addiction. Create a realistic clinical reference photo showing: extreme emaciation with skull-like facial features, severe dental loss, open facial sores and scars, dramatic premature aging, damaged skin with scabs and lesions, hair loss, and an overall appearance of severe health deterioration. The image should be realistic but retain enough of the original facial structure to show it's the same person."
            },
            'alcohol-effects': {
                5: "Create a realistic transformation of this person showing the negative effects of 5 years of heavy alcohol consumption. Add visible signs like slightly puffy face, mild facial redness especially in the cheeks and nose, small broken blood vessels, slightly bloated appearance, and tired eyes. The image should maintain the same identity but look like a medical reference photo documenting early alcohol abuse.",
                10: "Transform this person to show the effects of 10 years of heavy alcohol abuse. Add significant facial swelling, pronounced redness across the face, clearly visible broken capillaries on cheeks and nose, early signs of jaundice with yellowish skin tone, bloated features, bags under eyes, and an unhealthy, prematurely aged appearance. Keep the same basic facial identity but make it a realistic clinical reference image.",
                15: "Create a realistic transformation showing this person after 15 years of severe alcoholism. Show significant physical deterioration including: pronounced rhinophyma (bulbous, red nose), severe facial bloating, extensive broken capillaries creating a permanently red complexion, yellow-tinged skin and eyes from liver damage, spider angiomas on the face, premature aging with deep wrinkles, and an unhealthy pallor. Make it look like a medical reference photo while maintaining the basic facial identity.",
                20: "Transform this person to show the devastating physical impact of 20 years of severe alcoholism. Create a realistic clinical reference photo showing: extreme facial bloating and puffiness, severely damaged red skin with extensive broken blood vessels, advanced rhinophyma with a bulbous, deformed nose, jaundiced skin from liver failure, visible signs of malnutrition, dramatic premature aging, and an overall appearance of severe health deterioration. The image should be realistic but retain enough of the original facial structure to show it's the same person."
            },
            'smoking-effects': {
                5: "Create a realistic transformation of this person showing the negative effects of 5 years of heavy smoking. Add visible signs like yellowed teeth, early wrinkles around the mouth and eyes, slightly duller skin tone, some discoloration around the lips, and a tired appearance. The image should maintain the same identity but look like a medical reference photo documenting early smoking effects.",
                10: "Transform this person to show the effects of 10 years of heavy smoking. Add deeply stained yellow-brown teeth, pronounced 'smoker's lines' radiating from the lips, vertical wrinkles above the upper lip, a grayish or sallow complexion, more defined crow's feet around the eyes, thinning skin, and an overall aged appearance beyond their years. Keep the same basic facial identity but make it a realistic clinical reference image.",
                15: "Create a realistic transformation showing this person after 15 years of heavy smoking. Show significant physical deterioration including: severely stained or decaying teeth, deep wrinkles around the mouth and eyes, pronounced vertical lines above the lips, leathery skin texture, grayish or yellowish complexion, thinning lips with darker coloration, sagging skin especially around the jawline, and premature aging of 10-15 years. Make it look like a medical reference photo while maintaining the basic facial identity.",
                20: "Transform this person to show the devastating physical impact of 20 years of heavy smoking. Create a realistic clinical reference photo showing: severely damaged teeth with decay and potential tooth loss, extremely wrinkled skin especially around the mouth and eyes, deep furrows above the lips, significantly aged and leathery skin texture, a distinctly gray or yellow complexion, hollow cheeks, thinning and discolored lips, signs of potential oral cancer, and an overall appearance of someone 15-20 years older than their actual age. The image should be realistic but retain enough of the original facial structure to show it's the same person."
            }
        };
        
        // Các tham số mặc định cho mô hình
        this.defaultParams = {
            width: 768,
            height: 768,
            num_outputs: 1,
            guidance_scale: 8.5,
            negative_prompt: "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, mutated hands and fingers, disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation, cartoon, anime, painting, drawing, watermark, signature, pretty, beautiful, attractive, improved appearance, clean skin, smooth skin, perfect skin, perfect face, enhanced features, wrong ethnicity, non-Asian features, European features, African features, wrong face size, disproportionate face, face too big, face too small, wrong face shape, body transformation, full body change, background change, different clothing, changed outfit, new clothes, modified wardrobe, altered attire, different dress, changed accessories, new jewelry, different hairstyle color, clothing color change, fabric change"
        };
        
        this.fallbackToCSS = true; // Có sử dụng CSS filter nếu API không khả dụng
        
        // Demo images cho chế độ không có API key
        this.demoImages = null; // Không sử dụng hình ảnh demo từ file nữa
        
        // URL của mô hình open-source Stable Diffusion
        this.stableDiffusionGithubURL = 'https://github.com/CompVis/stable-diffusion';
        this.stableDiffusionWebUI = 'https://github.com/AUTOMATIC1111/stable-diffusion-webui';
        
        // Cache lưu trữ kết quả để tái sử dụng
        this.resultCache = {};

        // Tham số cho hiệu ứng khuôn mặt gầy gò
        this.gauntFaceParams = {
            intensity: 0.7, // Cường độ mặc định 0-1
            enhanceFeatures: true, // Tăng cường đặc điểm gầy gò
            preserveIdentity: true // Giữ nguyên nhận dạng khuôn mặt
        };

        // Cài đặt chi tiết cho hiệu ứng gầy gò theo từng loại chất gây nghiện
        this.gauntFaceSettings = {
            'drug-effects': {
                // Ma túy - khuôn mặt cực kỳ gầy gò, xương xẩu, da tổn thương
                faceThinning: 0.9, // Mức độ gầy
                cheekHollowing: 0.85, // Má hóp
                eyeSunkenness: 0.8, // Mắt trũng
                temporalHollowing: 0.9, // Thái dương lõm
                boneProminence: 0.85, // Xương nhô
                skinDamage: 0.75, // Tổn thương da
                faceAsymmetry: 0.5, // Mất cân đối khuôn mặt
                skinLesions: true, // Vết thương trên da
                teethDamage: 0.8, // Hư hại răng
                prematureAging: 0.85, // Lão hóa sớm
                vietnameseCaptions: [
                    "Má hóp sâu, khuôn mặt hốc hác, thiếu sức sống",
                    "Thái dương lõm rõ rệt, xương gò má nhô cao",
                    "Da khô xạm, kém đàn hồi với vết thương nhỏ",
                    "Đôi mắt trũng sâu, quầng thâm nặng",
                    "Răng xỉn màu và hư tổn, môi khô nứt nẻ",
                    "Gầy gò với các xương mặt lộ rõ, da bọc xương"
                ]
            },
            'alcohol-effects': {
                // Rượu - phù nề nhưng cũng gầy gò, đỏ mặt
                faceThinning: 0.7, // Vẫn gầy nhưng ít hơn ma túy
                cheekHollowing: 0.6, // Má hóp vừa phải
                eyeSunkenness: 0.65, // Mắt trũng ít hơn
                temporalHollowing: 0.6, // Thái dương lõm vừa phải
                boneProminence: 0.6, // Xương nhô vừa phải
                skinDamage: 0.5, // Tổn thương da ít hơn
                faceAsymmetry: 0.3, // Mất cân đối ít
                faceBloating: 0.7, // Phù nề mặt đặc trưng của rượu
                faceRedness: 0.8, // Đỏ mặt
                spiderVeins: 0.75, // Mạch máu nổi
                jaundice: 0.6, // Da vàng úa do tổn thương gan
                vietnameseCaptions: [
                    "Mặt phù nề nhưng khuôn mặt gầy gò, da chảy xệ",
                    "Má và mũi đỏ, mạch máu nhỏ nổi rõ",
                    "Quầng thâm mắt kèm túi mắt sưng phồng",
                    "Da mặt vàng úa do tổn thương gan",
                    "Xương gò má và xương hàm vẫn lộ rõ dù mặt phù",
                    "Khuôn mặt có hiệu ứng mất nước kết hợp phù nề"
                ]
            },
            'smoking-effects': {
                // Thuốc lá - gầy, da xỉn, nhiều nếp nhăn sâu
                faceThinning: 0.75, // Gầy vừa phải
                cheekHollowing: 0.7, // Má hóp
                eyeSunkenness: 0.6, // Mắt trũng vừa phải
                temporalHollowing: 0.7, // Thái dương lõm vừa phải
                boneProminence: 0.7, // Xương nhô vừa phải
                skinDamage: 0.6, // Tổn thương da vừa phải
                faceAsymmetry: 0.4, // Mất cân đối vừa phải
                wrinkles: 0.85, // Nếp nhăn nhiều 
                periOralLines: 0.9, // Nếp nhăn quanh miệng
                skinDullness: 0.8, // Da xỉn màu
                teethDiscoloration: 0.9, // Răng ố vàng
                vietnameseCaptions: [
                    "Má hóp, da mặt chảy xệ với độ đàn hồi kém",
                    "Nếp nhăn sâu quanh miệng và mắt, rãnh mũi má rõ",
                    "Da xỉn màu, kém sắc sống, thiếu độ ẩm",
                    "Răng ố vàng rõ rệt, môi thâm và khô",
                    "Khuôn mặt gầy gò với xương gò má nhô cao",
                    "Đường viền hàm rõ nét hơn do mất mỡ mặt"
                ]
            }
        };
    }

    /**
     * Khởi tạo transformer với API key
     * @param {string} apiKey - API key cho Replicate hoặc Hugging Face
     * @param {string} openaiApiKey - API key cho OpenAI
     */
    initialize(apiKey, openaiApiKey) {
        if (!apiKey && !openaiApiKey) {
            console.info('Không có API key, đang sử dụng chế độ demo mô phỏng.');
            this.fallbackToCSS = true;
            this.initialized = true; // Vẫn đánh dấu là đã khởi tạo
        } else {
        this.apiKey = apiKey;
        this.openaiApiKey = openaiApiKey;
        this.initialized = true;
        console.log('AIFaceTransformer đã được khởi tạo với API key');
        
        // Kiểm tra kết nối API
        this.testConnection();
        }
        
        // Khởi tạo CNN Feature Extractor nếu có sẵn
        if (window.CNNFeatureExtractor && this.featuresEnabled) {
            console.log('🧠 Đang khởi tạo CNN Feature Extractor...');
            this.cnnExtractor = new window.CNNFeatureExtractor();
            this.cnnExtractor.initialize().then(success => {
                if (success) {
                    console.log('✅ CNN Feature Extractor đã sẵn sàng');
                } else {
                    console.warn('⚠️ Không thể khởi tạo CNN Feature Extractor');
                    this.featuresEnabled = false;
                }
            }).catch(error => {
                console.error('❌ Lỗi khi khởi tạo CNN:', error);
                this.featuresEnabled = false;
            });
        } else {
            console.warn('CNN Feature Extractor không khả dụng');
            this.featuresEnabled = false;
        }
        
        return true;
    }

    /**
     * Kiểm tra kết nối đến API
     */
    async testConnection() {
        if (!this.apiKey) {
            this.fallbackToCSS = true;
            return;
        }

        try {
            // Thử kết nối thông qua server trung gian
            const response = await fetch(`${this.serverApiUrl}/api/test-connection`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ apiKey: this.apiKey })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('Kết nối đến Replicate API thành công');
                this.fallbackToCSS = false;
                return;
            } else {
                console.warn('Không thể kết nối đến API thông qua server:', data.error || 'Lỗi không xác định');
                this.fallbackToCSS = true;
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra kết nối API:', error);
            this.fallbackToCSS = true;
        }
    }

    /**
     * Chuyển đổi ảnh thành base64
     * @param {HTMLImageElement} img - Phần tử ảnh
     * @returns {Promise<string>} Chuỗi base64 của ảnh
     */
    imageToBase64(img) {
        return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataURL.split(',')[1]);
        } catch (error) {
                reject(error);
        }
        });
    }

    /**
     * Tạo yêu cầu biến đổi đến API Replicate
     * @param {string} base64Image - Ảnh dạng base64
     * @param {string} effectType - Loại hiệu ứng
     * @param {number} years - Số năm sử dụng
     * @returns {Promise<string>} ID của yêu cầu
     */
    async createTransformationRequest(base64Image, effectType, years) {
        // Tạo miêu tả chi tiết cho hiệu ứng
        const detailedDescription = this.generateDetailedDescription(effectType, years);
        
        // Log thông tin chi tiết để debug
        console.log('🎯 Tạo miêu tả chi tiết cho Replicate AI:');
        console.log(`📊 Loại tác hại: ${effectType}`);
        console.log(`📅 Thời gian: ${years} năm (nhóm: ${detailedDescription.yearKey} năm)`);
        console.log(`📝 Mô tả tiếng Việt: ${detailedDescription.description}`);
        console.log(`👔 Giữ nguyên trang phục: CÓ - Chỉ thay đổi khuôn mặt và da`);
        console.log(`🎨 Prompt gửi đến AI: ${detailedDescription.prompt.substring(0, 150)}...`);
        console.log(`🚫 Negative prompt: ${detailedDescription.negativePrompt.substring(0, 100)}...`);
        
        // Sử dụng prompt chi tiết thay vì prompt cũ
        let prompt = detailedDescription.prompt;
        const negativePrompt = detailedDescription.negativePrompt;
        
        // Tạo ảnh từ base64 để phát hiện khuôn mặt
        let faceMask = null;
        let originalFace = null;
        let cnnFeatures = null;
        
        try {
            if (window.FaceDetection) {
                // Tạo image element từ base64
                const img = new Image();
                const loadPromise = new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = `data:image/jpeg;base64,${base64Image}`;
                });
                await loadPromise;
                
                // Phát hiện khuôn mặt
                console.log('🔍 Phát hiện khuôn mặt để tạo mask...');
                const detectionResult = await window.FaceDetection.detect(img);
                
                if (detectionResult && detectionResult.success && detectionResult.faces && detectionResult.faces.length > 0) {
                    originalFace = detectionResult.faces[0]; // Lấy khuôn mặt đầu tiên
                    console.log('✅ Đã phát hiện khuôn mặt, tạo mask...');
                    
                    // Kiểm tra xem có phải là khuôn mặt người Châu Á không
                    const isAsian = this.isAsianFace(originalFace);
                    console.log(`🌏 Khuôn mặt người Châu Á: ${isAsian ? 'Có' : 'Không'}`);
                    
                    // Tạo mask cho vùng khuôn mặt
                    faceMask = this.createFaceMask(img, originalFace, 1.3);
                    console.log('🎭 Đã tạo mask thành công');
                    
                    // Lưu originalFace để validation sau này
                    window.originalFace = originalFace;
                } else {
                    console.warn('⚠️ Không phát hiện được khuôn mặt, sẽ xử lý toàn bộ ảnh');
                    console.log('Debug - detectionResult:', detectionResult);
                }
                
                // Trích xuất đặc trưng CNN nếu có
                if (this.cnnExtractor && this.featuresEnabled) {
                    console.log('🧠 Đang trích xuất đặc trưng CNN...');
                    cnnFeatures = await this.cnnExtractor.extractFeatures(img, effectType, years);
                    
                    if (cnnFeatures) {
                        console.log('✅ Đã trích xuất đặc trưng CNN thành công');
                        
                        // Tăng cường prompt với CNN features
                        prompt = this.enhancePromptWithFeatures(prompt, cnnFeatures, effectType);
                        
                        // Tạo báo cáo chi tiết
                        const damageReport = this.cnnExtractor.generateDamageReport(cnnFeatures, effectType, years);
                        console.log('📋 Báo cáo tổn thương:', damageReport.summary);
                        damageReport.details.forEach(detail => console.log(`  - ${detail}`));
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Không thể tạo face mask hoặc trích xuất features:', error);
        }
        
        // Đảm bảo base64Image là hợp lệ
        if (!base64Image || base64Image.length < 100) {
            console.warn('⚠️ Dữ liệu hình ảnh không hợp lệ');
            throw new Error('Dữ liệu hình ảnh không hợp lệ hoặc quá nhỏ');
        }
        
        // Chuẩn bị input cho Replicate API với SDXL
        const input = {
            image: `data:image/jpeg;base64,${base64Image}`,
            prompt: prompt,
            // Cập nhật negative_prompt thêm để tránh thay đổi quá mức
            negative_prompt: `${negativePrompt}, different face, different person, completely different appearance, unrealistic effects, extreme transformation, cartoon, anime style, not photorealistic, inconsistent identity, ear changes, modified ears, different ears, fat face, chubby cheeks, healthy appearance`,
            num_outputs: 1,
            guidance_scale: 8.0,
            num_inference_steps: 40,
            scheduler: "DPMSolverMultistep",
            strength: 0.60, // Điều chỉnh strength cho biến đổi khuôn mặt gầy
            seed: Math.floor(Math.random() * 1000000)
        };
        
        // Thêm mask nếu có
        if (faceMask) {
            input.mask = faceMask;
            console.log('🎭 Đã thêm mask vào input để chỉ biến đổi khuôn mặt');
            // Điều chỉnh strength phù hợp khi sử dụng mask
            input.strength = 0.70;
        }
        
        try {
            console.log('🚀 Gửi yêu cầu đến Replicate API với SDXL...');
            const response = await fetch(`${this.serverApiUrl}/api/replicate/predictions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: this.transformationModels[effectType] || this.transformationModels.default,
                    input: input,
                    apiKey: this.apiKey
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Lỗi HTTP từ server proxy:', response.status, '-', JSON.stringify(errorData));
                throw new Error(`Lỗi HTTP ${response.status}: ${JSON.stringify(errorData)}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                console.error('❌ Lỗi từ Replicate API:', result.error);
                throw new Error(result.error || 'Lỗi không xác định từ Replicate API');
            }
            
            console.log('✅ Yêu cầu đã được tạo thành công với ID:', result.prediction.id);
            return result.prediction.id;
            
        } catch (error) {
            console.error('❌ Lỗi khi gửi yêu cầu biến đổi:', error);
            throw error;
        }
    }

    /**
     * Tạo yêu cầu biến đổi đến Hugging Face API
     * @param {string} base64Image - Ảnh dạng base64
     * @param {string} effectType - Loại hiệu ứng
     * @param {number} years - Số năm sử dụng
     * @param {function} progressCallback - Hàm callback để cập nhật tiến trình
     * @returns {Promise<string>} URL ảnh kết quả
     */
    async transformWithHuggingFace(base64Image, effectType, years, progressCallback) {
        // Sử dụng generateDetailedDescription để lấy prompt chi tiết
        const detailedDescription = this.generateDetailedDescription(effectType, years);
        
        // Log thông tin
        console.log('🎯 Gửi miêu tả đến Hugging Face API:');
        console.log(`📝 Mô tả: ${detailedDescription.description}`);
        console.log(`👔 Giữ nguyên trang phục: CÓ`);
        
        // Xác định model dựa trên hiệu ứng
        const model = this.stableDiffusionModels[effectType] || this.stableDiffusionModels.default;
        
        const prompt = detailedDescription.prompt;
        const negativePrompt = detailedDescription.negativePrompt;
        
        // Cập nhật tiến trình nếu có callback
        if (progressCallback) {
            progressCallback('preparing', 40);
        }
        
        // Tạo yêu cầu đến Hugging Face API thông qua server trung gian
        try {
            if (progressCallback) {
                progressCallback('processing', 'Đang gửi yêu cầu đến Hugging Face API...');
            }
            
            // Tạo ảnh từ base64 để phát hiện khuôn mặt
            let faceMask = null;
            let enhancedPrompt = prompt;
            
            try {
                if (window.FaceDetection) {
                    if (progressCallback) {
                        progressCallback('processing', 'Đang phát hiện khuôn mặt để tạo mask...');
                    }
                    
                    // Tạo image element từ base64
                    const img = new Image();
                    const loadPromise = new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                        img.src = `data:image/jpeg;base64,${base64Image}`;
                    });
                    await loadPromise;
                    
                    // Phát hiện khuôn mặt
                    const detectionResult = await window.FaceDetection.detect(img);
                    
                    if (detectionResult.success && detectionResult.faces.length > 0) {
                        // Lấy khuôn mặt chính (lớn nhất nếu có nhiều khuôn mặt)
                        const primaryFace = window.FaceDetection.getPrimaryFace();
                        if (primaryFace) {
                            // Tạo mask từ khuôn mặt được phát hiện
                            faceMask = this.createFaceMask(img, primaryFace, 1.8);
                            
                            // Nâng cao prompt cho inpainting
                            enhancedPrompt = `${prompt}, very realistic, detailed face, inpainting, same identity`;
                            
                            if (progressCallback) {
                                progressCallback('processing', 'Đã tạo mask từ khuôn mặt...');
                            }
                        }
                    }
                }
            } catch (faceError) {
                console.warn('Không thể tạo face mask cho Hugging Face:', faceError);
                // Tiếp tục mà không có mask
            }
            
            // Chuẩn bị request body
            const requestBody = {
                model: model,
                prompt: enhancedPrompt,
                image: `data:image/jpeg;base64,${base64Image}`,
                negative_prompt: negativePrompt,
                num_inference_steps: 30,
                guidance_scale: this.defaultParams.guidance_scale,
                apiKey: this.apiKey,
                // Thêm strength để kiểm soát mức độ biến đổi
                strength: 0.7
            };
            
            // Thêm mask nếu có
            if (faceMask) {
                requestBody.mask = faceMask;
            }
            
            const response = await fetch(`${this.serverApiUrl}/api/huggingface/stable-diffusion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (progressCallback) {
                progressCallback('processing', 80);
            }
            
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                console.warn(`Lỗi API Hugging Face:`, data.error || 'Lỗi không xác định');
                
                // Nếu API trả về lỗi xác thực hoặc quá tải, chuyển sang chế độ mô phỏng
                this.fallbackToCSS = true;
                throw new Error(`Lỗi API: ${data.error || 'Lỗi không xác định'}`);
            }
            
            if (progressCallback) {
                progressCallback('succeeded', 100);
            }
            
            return data.output; // Trả về URL ảnh kết quả
            
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu biến đổi đến Hugging Face:', error);
            
            // Set fallbackToCSS if network error occurs
            if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
                console.warn('Lỗi kết nối mạng, chuyển sang chế độ mô phỏng');
                this.fallbackToCSS = true;
            }
            
            throw error;
        }
    }
    
    /**
     * Tạo yêu cầu biến đổi sử dụng GitHub Stable Diffusion
     * @param {string} base64Image - Ảnh dạng base64
     * @param {string} effectType - Loại hiệu ứng
     * @param {number} years - Số năm sử dụng
     * @param {function} progressCallback - Hàm callback để cập nhật tiến trình
     * @returns {Promise<string>} URL ảnh kết quả hoặc null nếu lỗi
     */
    async transformWithGitHubStableDiffusion(base64Image, effectType, years, progressCallback) {
        // Kiểm tra cache trước
        const cacheKey = `${effectType}-${years}-${base64Image.substring(0, 50)}`;
        if (this.resultCache[cacheKey]) {
            console.log('Trả về kết quả từ cache');
            if (progressCallback) {
                progressCallback('succeeded', 100);
            }
            return this.resultCache[cacheKey];
        }
        
        // Sử dụng generateDetailedDescription
        const detailedDescription = this.generateDetailedDescription(effectType, years);
        console.log('🎯 GitHub Stable Diffusion - Miêu tả:', detailedDescription.description);
        
        // Cập nhật tiến trình nếu có callback
        if (progressCallback) {
            progressCallback('preparing', 20);
        }
        
        try {
            const prompt = detailedDescription.prompt;
            
            if (progressCallback) {
                progressCallback('processing', 'Đang truy cập GitHub Stable Diffusion...');
            }
            
            // Tìm mô hình phù hợp trên GitHub - demo này chỉ giả lập
            const repoInfo = await fetch(this.githubStableDiffusionAPI, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!repoInfo.ok) {
                throw new Error('Không thể truy cập repo Stable Diffusion trên GitHub');
            }
            
            console.log('Đã truy cập GitHub Stable Diffusion repository');
            
            if (progressCallback) {
                progressCallback('processing', 50);
            }
            
            // Xử lý ảnh bằng WebAssembly hoặc JavaScript - ở đây chỉ mô phỏng
            console.log('Đang xử lý biến đổi ảnh...');
            
            // Mô phỏng thời gian xử lý
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (progressCallback) {
                progressCallback('processing', 80);
            }
            
            // Kết quả mô phỏng - trong triển khai thực tế, sẽ gọi đến mô hình SD
            let resultUrl;
            
            // Kiểm tra xem có ảnh demo không
            if (this.demoImages && this.demoImages[effectType] && this.demoImages[effectType][years]) {
                resultUrl = this.demoImages[effectType][years];
            } else {
                // Fallback sử dụng ảnh demo nếu có, hoặc ảnh gốc
                resultUrl = `data:image/jpeg;base64,${base64Image}`;
            }
            
            // Lưu vào cache
            this.resultCache[cacheKey] = resultUrl;
            
            if (progressCallback) {
                progressCallback('succeeded', 100);
            }
            
            return resultUrl;
        } catch (error) {
            console.error('Lỗi khi sử dụng GitHub Stable Diffusion:', error);
            
            if (progressCallback) {
                progressCallback('failed', 0);
            }
            
            return null;
        }
    }
    
    /**
     * Tải và sử dụng mô hình local nếu đã cài đặt
     * @param {string} base64Image - Ảnh dạng base64
     * @param {string} effectType - Loại hiệu ứng
     * @param {number} years - Số năm sử dụng
     * @param {function} progressCallback - Hàm callback để cập nhật tiến trình
     * @returns {Promise<string>} URL ảnh kết quả hoặc null nếu lỗi
     */
    async useLocalStableDiffusion(base64Image, effectType, years, progressCallback) {
        if (progressCallback) {
            progressCallback('preparing', 10);
        }
        
        // Sử dụng generateDetailedDescription
        const detailedDescription = this.generateDetailedDescription(effectType, years);
        console.log('🎯 Local Stable Diffusion - Miêu tả:', detailedDescription.description);
        
        try {
            console.log('Kiểm tra mô hình Stable Diffusion cục bộ...');
            
            if (progressCallback) {
                progressCallback('processing', 'Đang kiểm tra mô hình Stable Diffusion cục bộ...');
            }
            
            // Kiểm tra xem có cài đặt SD Web UI không - trong thực tế sẽ gọi đến API local
            const isLocalSDAvailable = false; // Giả định là không có
            
            if (!isLocalSDAvailable) {
                console.warn('Không tìm thấy Stable Diffusion cục bộ');
                
                if (progressCallback) {
                    progressCallback('failed', 'Không tìm thấy Stable Diffusion cục bộ');
                }
                
                return null;
            }
            
            // Mã này sẽ không được thực thi vì isLocalSDAvailable = false
            // Nhưng trong triển khai thực tế, đây là nơi gọi API local của SD Web UI
            const localApiEndpoint = 'http://localhost:7860/api/v1/txt2img';
            
            const prompt = detailedDescription.prompt;
            const negativePrompt = detailedDescription.negativePrompt;
            
            if (progressCallback) {
                progressCallback('processing', 40);
            }
            
            const response = await fetch(localApiEndpoint, {
                    method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    init_images: [`data:image/jpeg;base64,${base64Image}`],
                    negative_prompt: negativePrompt,
                    sampler_index: "Euler a",
                    steps: 20,
                    cfg_scale: 7.5,
                    width: 768,
                    height: 768,
                    denoising_strength: 0.65
                })
            });
            
            if (progressCallback) {
                progressCallback('processing', 90);
            }
            
            if (response.ok) {
                const result = await response.json();
                
                if (progressCallback) {
                    progressCallback('succeeded', 100);
                }
                
                return result.images[0]; // Base64 của ảnh kết quả
            }
            
            if (progressCallback) {
                progressCallback('failed', 0);
            }
            
            return null;
        } catch (error) {
            console.error('Lỗi khi sử dụng Stable Diffusion cục bộ:', error);
            
            if (progressCallback) {
                progressCallback('failed', 0);
            }
            
            return null;
        }
    }
    
    /**
     * Kiểm tra trạng thái của yêu cầu
     * @param {string} requestId - ID của yêu cầu
     * @returns {Promise<{status: string, output: string|null}>} Trạng thái và kết quả (nếu có)
     */
    async checkRequestStatus(requestId) {
        try {
            const response = await fetch(`${this.serverApiUrl}/api/replicate/predictions/${requestId}?apiKey=${this.apiKey}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                console.warn(`Lỗi kiểm tra trạng thái API:`, data.error || 'Lỗi không xác định');
                
                // Nếu lỗi xác thực hoặc API server, chuyển sang chế độ mô phỏng
                this.fallbackToCSS = true;
                
                throw new Error(`Lỗi API: ${data.error || 'Lỗi không xác định'}`);
            }
            
            // Kiểm tra xem dữ liệu prediction có tồn tại không
            if (!data.prediction) {
                console.warn('Dữ liệu prediction không tồn tại:', data);
                this.fallbackToCSS = true;
                throw new Error('Dữ liệu prediction không tồn tại');
            }
            
            // Kiểm tra cơ bản nếu output tồn tại và status là succeeded
            if (data.prediction.status === 'succeeded' && data.prediction.output && data.prediction.output[0]) {
                // Kiểm tra đơn giản xem URL có hợp lệ không mà không cần gửi request
                try {
                    new URL(data.prediction.output[0]);
                } catch (e) {
                    console.warn('URL output không hợp lệ:', data.prediction.output[0]);
                    this.fallbackToCSS = true;
                    throw new Error('URL output không hợp lệ');
                }
                
                // Bỏ qua việc kiểm tra truy cập URL vì sẽ gây lỗi CORS
                // Thay vào đó, sẽ kiểm tra trong waitForCompletion sử dụng proxy
            }
            
            return {
                status: data.prediction.status,
                output: data.prediction.output ? data.prediction.output[0] : null
            };
            
        } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái yêu cầu:', error);
            
            // Set fallbackToCSS if network error or timeout occurs
            if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
                console.warn('Lỗi kết nối mạng, có thể chuyển sang chế độ mô phỏng');
                this.fallbackToCSS = true;
            }
            
            throw error;
        }
    }
    
    /**
     * Chờ cho đến khi yêu cầu hoàn thành
     * @param {string} requestId - ID của yêu cầu
     * @param {function} progressCallback - Hàm callback để cập nhật tiến trình
     * @returns {Promise<string>} URL của ảnh đã biến đổi
     */
    async waitForCompletion(requestId, progressCallback) {
        const maxAttempts = 30; // Tối đa 30 lần kiểm tra (khoảng 30 giây)
        let attempts = 0;
        let consecutiveErrors = 0;
        const maxConsecutiveErrors = 3; // Số lần lỗi liên tiếp tối đa trước khi chuyển sang mô phỏng
        
        return new Promise((resolve, reject) => {
            const checkStatus = async () => {
                try {
                    attempts++;
                    // Nếu đã chuyển sang chế độ mô phỏng
                    if (this.fallbackToCSS) {
                        progressCallback('processing', 'Đang chuyển sang chế độ mô phỏng...');
                        setTimeout(() => {
                            progressCallback('succeeded', 100);
                            // Không sử dụng ảnh demo nữa
                            const img = new Image();
                            // Sử dụng ảnh trống làm placeholder
                            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                            // Sau khi tải xong ảnh trống, tạo hiệu ứng
                            img.onload = async () => {
                                try {
                                    // Lấy năm gần nhất (5, 10, 15, 20)
                                    const yearKey = attempts > 17 ? 20 : attempts > 12 ? 15 : attempts > 7 ? 10 : 5;
                                    // Tạo ảnh với hiệu ứng
                                    const canvas = document.createElement('canvas');
                                    canvas.width = 400;
                                    canvas.height = 400;
                                    const ctx = canvas.getContext('2d');
                                    ctx.fillStyle = '#f0f0f0';
                                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                                    ctx.fillStyle = '#333';
                                    ctx.font = '20px Arial';
                                    ctx.textAlign = 'center';
                                    ctx.fillText('Hình ảnh mô phỏng', canvas.width/2, canvas.height/2 - 40);
                                    ctx.fillText(`Hiệu ứng: ${yearKey} năm`, canvas.width/2, canvas.height/2);
                                    
                                    resolve(canvas.toDataURL('image/jpeg'));
                                } catch (error) {
                                    console.error('Lỗi khi tạo hình ảnh mô phỏng:', error);
                                    reject(error);
                                }
                            };
                        }, 2000);
                        return;
                    }
                    
                    const result = await this.checkRequestStatus(requestId);
                    consecutiveErrors = 0; // Reset lỗi liên tiếp khi thành công
                    
                    // Cập nhật tiến trình
                    if (progressCallback) {
                        progressCallback(result.status, attempts / maxAttempts * 100);
                    }
                    
                    if (result.status === 'succeeded') {
                        if (result.output) {
                            // Thay đổi: Sử dụng proxy server để tải hình ảnh thay vì tải trực tiếp
                            try {
                                const originalUrl = result.output;
                                // Tạo URL proxy qua server của chúng ta
                                const proxyUrl = `http://localhost:3004/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
                                
                                // Kiểm tra tỉ lệ khuôn mặt trong kết quả nếu có originalFace
                                if (window.originalFace) {
                                    console.log('🔍 Đang kiểm tra tỉ lệ khuôn mặt trong kết quả...');
                                    const isValidProportion = await this.validateFaceProportions(proxyUrl, window.originalFace);
                                    
                                    if (!isValidProportion) {
                                        console.warn('⚠️ Tỉ lệ khuôn mặt không phù hợp, có thể cần tạo lại');
                                        // Có thể thêm logic retry ở đây nếu cần
                                    } else {
                                        console.log('✅ Tỉ lệ khuôn mặt hợp lệ');
                                    }
                                }
                                
                                resolve(proxyUrl);
                            } catch (proxyError) {
                                console.warn('Lỗi khi sử dụng proxy, thử URL gốc:', proxyError);
                                resolve(result.output);
                            }
                        } else {
                            reject(new Error('Không có kết quả từ API'));
                        }
                    } else if (result.status === 'failed') {
                        reject(new Error('Yêu cầu biến đổi thất bại'));
                    } else if (attempts >= maxAttempts) {
                        reject(new Error('Timeout: Yêu cầu mất quá nhiều thời gian'));
                    } else {
                        // Tiếp tục kiểm tra sau 1 giây
                        setTimeout(checkStatus, 1000);
                    }
                } catch (error) {
                    consecutiveErrors++;
                    console.error(`Lỗi khi kiểm tra trạng thái (lần ${consecutiveErrors}):`, error);
                    
                    if (consecutiveErrors >= maxConsecutiveErrors) {
                        console.warn('Quá nhiều lỗi liên tiếp, chuyển sang chế độ mô phỏng');
                        this.fallbackToCSS = true;
                        // Thử lại với chế độ mô phỏng
                        setTimeout(checkStatus, 1000);
                    } else if (attempts >= maxAttempts) {
                        reject(error);
                    } else {
                        // Thử lại sau 2 giây
                        setTimeout(checkStatus, 2000);
                    }
                }
            };
            
            // Bắt đầu kiểm tra
            checkStatus();
        });
    }

    /**
     * Biến đổi khuôn mặt sử dụng DALL-E
     * @param {string} base64Image - Ảnh dạng base64
     * @param {string} effectType - Loại hiệu ứng
     * @param {number} years - Số năm sử dụng
     * @param {function} progressCallback - Hàm callback để cập nhật tiến trình
     * @returns {Promise<string>} URL ảnh kết quả
     */
    async transformWithDallE(base64Image, effectType, years, progressCallback) {
        if (!this.openaiApiKey) {
            throw new Error('Cần OpenAI API key để sử dụng DALL-E');
        }
        
        try {
            if (progressCallback) {
                progressCallback('preparing', 20);
            }
            
            // Sử dụng generateDetailedDescription
            const detailedDescription = this.generateDetailedDescription(effectType, years);
            
            // Log thông tin chi tiết
            console.log('🎯 Gửi miêu tả đến DALL-E:');
            console.log(`📝 Mô tả tiếng Việt: ${detailedDescription.description}`);
            console.log(`👔 Giữ nguyên trang phục: CÓ`);
            
            // Lấy năm gần nhất (5, 10, 15, 20)
            let yearKey = 5;
            if (years > 17) yearKey = 20;
            else if (years > 12) yearKey = 15;
            else if (years > 7) yearKey = 10;
            
            // Sử dụng prompt đặc biệt cho DALL-E với nhấn mạnh về trang phục
            const dallePrompt = this.dallePrompts[effectType][yearKey] + 
                " IMPORTANT: The person must be wearing the exact same clothing, accessories, and hairstyle as in the original photo. Only facial features and skin should be modified.";
            
            if (progressCallback) {
                progressCallback('processing', 'Đang gửi yêu cầu đến DALL-E...');
            }
            
            const response = await fetch(`${this.serverApiUrl}/api/openai/dalle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: dallePrompt,
                    image: `data:image/jpeg;base64,${base64Image}`,
                    apiKey: this.openaiApiKey
                })
            });
            
            if (progressCallback) {
                progressCallback('processing', 80);
            }
            
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                console.warn(`Lỗi DALL-E API:`, data.error || 'Lỗi không xác định');
                throw new Error(`Lỗi DALL-E: ${data.error || 'Lỗi không xác định'}`);
            }
            
            if (progressCallback) {
                progressCallback('succeeded', 100);
            }
            
            return data.output;
        } catch (error) {
            console.error('Lỗi khi sử dụng DALL-E:', error);
            throw error;
        }
    }

    /**
     * Mô phỏng biến đổi sử dụng CSS filters
     * @param {HTMLImageElement} img - Hình ảnh gốc
     * @param {string} effectType - Loại hiệu ứng
     * @param {number} years - Số năm sử dụng
     * @param {function} progressCallback - Hàm callback để cập nhật tiến trình
     * @returns {Promise<string>} Data URL của ảnh đã biến đổi
     */
    async simulateTransformation(img, effectType, years, progressCallback) {
        return new Promise((resolve) => {
            if (progressCallback) {
                progressCallback('preparing', 20);
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            if (progressCallback) {
                progressCallback('processing', 50);
            }
            
            // Vẽ ảnh gốc
            ctx.drawImage(img, 0, 0);
            
            // Áp dụng hiệu ứng dựa trên loại và số năm
            const intensity = Math.min(years / 20, 1); // Chuẩn hóa từ 0 đến 1
            
            // Tạo overlay để mô phỏng hiệu ứng
            const overlayCanvas = document.createElement('canvas');
            overlayCanvas.width = canvas.width;
            overlayCanvas.height = canvas.height;
            const overlayCtx = overlayCanvas.getContext('2d');
            
            // Vẽ ảnh gốc lên overlay
            overlayCtx.drawImage(img, 0, 0);
            
            // Áp dụng filter dựa trên hiệu ứng
            switch (effectType) {
                case 'drug-effects':
                    overlayCtx.filter = `contrast(${1.2 + intensity * 0.5}) brightness(${0.8 - intensity * 0.3}) saturate(${0.7 - intensity * 0.4}) hue-rotate(${intensity * 20}deg)`;
                    break;
                case 'alcohol-effects':
                    overlayCtx.filter = `contrast(${0.9 + intensity * 0.3}) brightness(${0.9 - intensity * 0.2}) saturate(${1.1 + intensity * 0.3}) hue-rotate(${intensity * 10}deg)`;
                    break;
                case 'smoking-effects':
                    overlayCtx.filter = `contrast(${1.1 + intensity * 0.4}) brightness(${0.85 - intensity * 0.25}) saturate(${0.8 - intensity * 0.3}) sepia(${intensity * 0.3})`;
                    break;
                default:
                    overlayCtx.filter = `contrast(${1.1 + intensity * 0.3}) brightness(${0.9 - intensity * 0.2}) saturate(${0.9 - intensity * 0.2})`;
            }
            
            // Vẽ lại với filter
            overlayCtx.drawImage(img, 0, 0);
            
            if (progressCallback) {
                progressCallback('processing', 80);
            }
            
            // Kết hợp với ảnh gốc
            ctx.globalAlpha = 0.7 + intensity * 0.3;
            ctx.drawImage(overlayCanvas, 0, 0);
            
            // Thêm texture để mô phỏng tổn thương da
            if (intensity > 0.3) {
                ctx.globalAlpha = intensity * 0.3;
                ctx.fillStyle = '#8B4513';
                
                // Tạo các điểm nhỏ để mô phỏng tổn thương
                for (let i = 0; i < intensity * 100; i++) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    const size = Math.random() * 3 + 1;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Áp dụng hiệu ứng khuôn mặt gầy gò
            this.applyGauntFaceFilter(ctx, img, effectType, intensity);
            
            if (progressCallback) {
                progressCallback('succeeded', 100);
            }
            
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        });
    }

    /**
     * Áp dụng hiệu ứng khuôn mặt gầy gò cho ảnh
     * @param {CanvasRenderingContext2D} ctx - Canvas context để vẽ
     * @param {HTMLImageElement} img - Ảnh gốc
     * @param {string} effectType - Loại hiệu ứng
     * @param {number} intensity - Cường độ hiệu ứng (0-1)
     */
    applyGauntFaceFilter(ctx, img, effectType, intensity) {
        try {
            // Phát hiện khuôn mặt nếu có FaceDetection
            if (window.FaceDetection) {
                window.FaceDetection.detect(img)
                    .then(result => {
                        if (result.success && result.faces.length > 0) {
                            const face = result.faces[0]; // Lấy khuôn mặt đầu tiên
                            this._applyGauntEffectToFace(ctx, face, effectType, intensity);
                        } else {
                            // Nếu không phát hiện được khuôn mặt, áp dụng hiệu ứng chung cho toàn ảnh
                            this._applyGeneralGauntEffect(ctx, img, effectType, intensity);
                        }
                    })
                    .catch(error => {
                        console.warn('Không thể phát hiện khuôn mặt:', error);
                        this._applyGeneralGauntEffect(ctx, img, effectType, intensity);
                    });
            } else {
                // Nếu không có FaceDetection, áp dụng hiệu ứng chung
                this._applyGeneralGauntEffect(ctx, img, effectType, intensity);
            }
        } catch (error) {
            console.error('Lỗi khi áp dụng hiệu ứng khuôn mặt gầy gò:', error);
        }
    }

    /**
     * Áp dụng hiệu ứng gầy gò cho khu vực khuôn mặt đã phát hiện
     * @private
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} face - Đối tượng khuôn mặt được phát hiện
     * @param {string} effectType - Loại hiệu ứng
     * @param {number} intensity - Cường độ hiệu ứng (0-1)
     */
    _applyGauntEffectToFace(ctx, face, effectType, intensity) {
        const box = face.detection.box;
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        
        // Mở rộng vùng điều chỉnh ra ngoài khuôn mặt một chút
        const expandedWidth = box.width * 1.2;
        const expandedHeight = box.height * 1.4; // Mở rộng hơn về phía dưới
        
        // Lưu trạng thái canvas
        ctx.save();
        
        // Áp dụng shadow để tạo hiệu ứng hốc mắt và má hóp
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10 * intensity;
        
        // Các điểm quan trọng trên khuôn mặt (ước lượng từ box)
        // Điểm mắt trái (1/3 khuôn mặt từ trái)
        const leftEyeX = box.x + box.width / 3;
        const leftEyeY = box.y + box.height * 0.4;
        
        // Điểm mắt phải (2/3 khuôn mặt từ trái)
        const rightEyeX = box.x + box.width * 2/3;
        const rightEyeY = box.y + box.height * 0.4;
        
        // Điểm má trái
        const leftCheekX = box.x + box.width * 0.25;
        const leftCheekY = box.y + box.height * 0.6;
        
        // Điểm má phải
        const rightCheekX = box.x + box.width * 0.75;
        const rightCheekY = box.y + box.height * 0.6;
        
        // Điểm giữa của hai mắt
        const betweenEyesX = (leftEyeX + rightEyeX) / 2;
        const betweenEyesY = (leftEyeY + rightEyeY) / 2;
        
        // Vẽ bóng cho các vùng hốc mắt
        this._drawShadowEllipse(ctx, leftEyeX, leftEyeY, box.width * 0.15, box.height * 0.08, intensity);
        this._drawShadowEllipse(ctx, rightEyeX, rightEyeY, box.width * 0.15, box.height * 0.08, intensity);
        
        // Vẽ bóng cho vùng má hóp
        this._drawShadowEllipse(ctx, leftCheekX, leftCheekY, box.width * 0.2, box.height * 0.15, intensity);
        this._drawShadowEllipse(ctx, rightCheekX, rightCheekY, box.width * 0.2, box.height * 0.15, intensity);
        
        // Vẽ bóng cho vùng thái dương
        this._drawShadowEllipse(ctx, box.x + box.width * 0.15, box.y + box.height * 0.3, box.width * 0.15, box.height * 0.2, intensity);
        this._drawShadowEllipse(ctx, box.x + box.width * 0.85, box.y + box.height * 0.3, box.width * 0.15, box.height * 0.2, intensity);
        
        // Tạo highlight cho xương gò má và xương hàm để tăng hiệu ứng gầy gò
        ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        ctx.shadowBlur = 5;
        
        // Highlight xương gò má
        this._drawHighlightLine(ctx, leftCheekX - box.width * 0.05, leftCheekY - box.height * 0.1, 
                               leftCheekX + box.width * 0.15, leftCheekY, intensity);
        this._drawHighlightLine(ctx, rightCheekX + box.width * 0.05, rightCheekY - box.height * 0.1,
                               rightCheekX - box.width * 0.15, rightCheekY, intensity);
        
        // Highlight xương hàm
        this._drawHighlightLine(ctx, box.x + box.width * 0.15, box.y + box.height * 0.8,
                               box.x + box.width * 0.85, box.y + box.height * 0.8, intensity);
        
        // Khôi phục trạng thái canvas
        ctx.restore();
        
        // Áp dụng hiệu ứng đặc biệt cho từng loại
        if (effectType === 'drug-effects') {
            // Thêm vết sẹo và vết thương cho hiệu ứng ma túy
            this._addSoresAndScars(ctx, box, intensity);
        } else if (effectType === 'alcohol-effects') {
            // Thêm hiệu ứng phù nề và đỏ da cho rượu bia
            this._addRedSkinAndVeins(ctx, box, intensity);
        } else if (effectType === 'smoking-effects') {
            // Thêm hiệu ứng da xỉn và nếp nhăn cho thuốc lá
            this._addWrinklesAndAging(ctx, box, intensity);
        }
    }

    /**
     * Vẽ bóng hình elip để tạo hiệu ứng hốc mắt và má hóp
     * @private
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Tọa độ x trung tâm
     * @param {number} y - Tọa độ y trung tâm
     * @param {number} radiusX - Bán kính theo chiều ngang
     * @param {number} radiusY - Bán kính theo chiều dọc
     * @param {number} intensity - Cường độ hiệu ứng (0-1)
     */
    _drawShadowEllipse(ctx, x, y, radiusX, radiusY, intensity) {
        ctx.save();
        ctx.globalAlpha = 0.3 * intensity;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /**
     * Vẽ đường highlight cho xương mặt
     * @private
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x1 - Tọa độ x điểm đầu
     * @param {number} y1 - Tọa độ y điểm đầu
     * @param {number} x2 - Tọa độ x điểm cuối
     * @param {number} y2 - Tọa độ y điểm cuối
     * @param {number} intensity - Cường độ hiệu ứng (0-1)
     */
    _drawHighlightLine(ctx, x1, y1, x2, y2, intensity) {
        ctx.save();
        ctx.globalAlpha = 0.15 * intensity;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Thêm vết sẹo và vết thương cho hiệu ứng ma túy
     * @private
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} box - Đối tượng khuôn mặt được phát hiện
     * @param {number} intensity - Cường độ hiệu ứng (0-1)
     */
    _addSoresAndScars(ctx, box, intensity) {
        ctx.save();
        
        // Chỉ thêm các hiệu ứng nếu intensity đủ cao
        if (intensity > 0.4) {
            // Số lượng vết thương
            const soreCount = Math.floor(intensity * 10);
            
            // Thêm vết thương ngẫu nhiên trên khuôn mặt
            ctx.fillStyle = 'rgba(165, 42, 42, 0.7)'; // Màu nâu đỏ
            
            for (let i = 0; i < soreCount; i++) {
                // Chọn vị trí ngẫu nhiên trong khuôn mặt
                const x = box.x + Math.random() * box.width;
                const y = box.y + Math.random() * box.height;
                const size = 2 + Math.random() * 5 * intensity; // Kích thước tỷ lệ thuận với cường độ
                
                // Vẽ vết thương
                ctx.globalAlpha = 0.4 + Math.random() * 0.4;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                
                // Thêm viền tối hơn
                ctx.strokeStyle = 'rgba(120, 20, 20, 0.8)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            // Thêm vết sẹo nếu intensity cao
            if (intensity > 0.7) {
                ctx.strokeStyle = 'rgba(180, 100, 100, 0.6)';
                ctx.lineWidth = 2;
                
                // Số lượng vết sẹo
                const scarCount = Math.floor(intensity * 5);
                
                for (let i = 0; i < scarCount; i++) {
                    // Vị trí và hướng ngẫu nhiên
                    const x = box.x + Math.random() * box.width;
                    const y = box.y + Math.random() * box.height;
                    const length = 5 + Math.random() * 15 * intensity;
                    const angle = Math.random() * Math.PI * 2;
                    
                    ctx.globalAlpha = 0.3 + Math.random() * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
                    ctx.stroke();
                }
            }
        }
        
        ctx.restore();
    }

    /**
     * Thêm hiệu ứng đỏ da và mạch máu nổi cho rượu bia
     * @private
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} box - Đối tượng khuôn mặt được phát hiện
     * @param {number} intensity - Cường độ hiệu ứng (0-1)
     */
    _addRedSkinAndVeins(ctx, box, intensity) {
        ctx.save();
        
        // Thêm đỏ mũi và má
        if (intensity > 0.3) {
            // Vị trí mũi
            const noseX = box.x + box.width / 2;
            const noseY = box.y + box.height * 0.55;
            const noseRadius = box.width * 0.1;
            
            // Vẽ mũi đỏ
            ctx.fillStyle = 'rgba(200, 40, 40, 0.4)';
            ctx.globalAlpha = 0.2 + intensity * 0.4;
            ctx.beginPath();
            ctx.arc(noseX, noseY, noseRadius * (1 + intensity * 0.5), 0, Math.PI * 2);
            ctx.fill();
            
            // Vẽ má đỏ
            const cheekRadius = box.width * 0.15;
            
            // Má trái
            ctx.fillStyle = 'rgba(200, 70, 70, 0.35)';
            ctx.beginPath();
            ctx.arc(box.x + box.width * 0.25, box.y + box.height * 0.55, cheekRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Má phải
            ctx.beginPath();
            ctx.arc(box.x + box.width * 0.75, box.y + box.height * 0.55, cheekRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Thêm mạch máu nổi nếu intensity cao
        if (intensity > 0.5) {
            ctx.strokeStyle = 'rgba(180, 50, 50, 0.4)';
            ctx.lineWidth = 1;
            ctx.globalAlpha = intensity * 0.6;
            
            // Số lượng mạch máu
            const veinCount = Math.floor(intensity * 15);
            
            // Vùng má và mũi
            for (let i = 0; i < veinCount; i++) {
                // Chọn điểm bắt đầu quanh mũi hoặc má
                let startX, startY;
                
                if (Math.random() > 0.5) {
                    // Vùng mũi
                    startX = box.x + box.width * (0.4 + Math.random() * 0.2);
                    startY = box.y + box.height * (0.5 + Math.random() * 0.1);
                } else {
                    // Vùng má
                    if (Math.random() > 0.5) {
                        // Má trái
                        startX = box.x + box.width * (0.15 + Math.random() * 0.15);
                        startY = box.y + box.height * (0.5 + Math.random() * 0.15);
                    } else {
                        // Má phải
                        startX = box.x + box.width * (0.7 + Math.random() * 0.15);
                        startY = box.y + box.height * (0.5 + Math.random() * 0.15);
                    }
                }
                
                // Vẽ mạch máu dạng nhánh cây nhỏ
                this._drawSpiderVein(ctx, startX, startY, 5 + intensity * 10, intensity);
            }
        }
        
        ctx.restore();
    }

    /**
     * Vẽ mạch máu dạng nhánh nhỏ
     * @private
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Tọa độ x điểm bắt đầu
     * @param {number} y - Tọa độ y điểm bắt đầu
     * @param {number} length - Chiều dài nhánh chính
     * @param {number} intensity - Cường độ hiệu ứng (0-1)
     */
    _drawSpiderVein(ctx, x, y, length, intensity) {
        // Góc ngẫu nhiên
        const angle = Math.random() * Math.PI * 2;
        const branchFactor = 0.7; // Tỷ lệ chiều dài nhánh con so với nhánh chính
        
        // Vẽ nhánh chính
        ctx.beginPath();
        ctx.moveTo(x, y);
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Nếu đủ dài thì vẽ các nhánh phụ
        if (length > 3 && Math.random() < 0.7) {
            // Nhánh phụ 1
            const branch1Angle = angle + (Math.random() * 0.5 + 0.2) * Math.PI;
            const midX = (x + endX) / 2;
            const midY = (y + endY) / 2;
            this._drawSpiderVein(ctx, midX, midY, length * branchFactor, intensity);
            
            // Nhánh phụ 2 nếu intensity cao
            if (intensity > 0.7 && Math.random() < 0.5) {
                const branch2Angle = angle - (Math.random() * 0.5 + 0.2) * Math.PI;
                const mid2X = x + (endX - x) * 0.7;
                const mid2Y = y + (endY - y) * 0.7;
                this._drawSpiderVein(ctx, mid2X, mid2Y, length * branchFactor * 0.8, intensity);
            }
        }
    }

    /**
     * Thêm nếp nhăn và hiệu ứng lão hóa cho thuốc lá
     * @private
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} box - Đối tượng khuôn mặt được phát hiện
     * @param {number} intensity - Cường độ hiệu ứng (0-1)
     */
    _addWrinklesAndAging(ctx, box, intensity) {
        ctx.save();
        
        // Chỉ thêm nếp nhăn nếu intensity đủ cao
        if (intensity > 0.3) {
            ctx.strokeStyle = 'rgba(70, 70, 70, 0.3)';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3 * intensity;
            
            // Vị trí miệng
            const mouthX = box.x + box.width / 2;
            const mouthY = box.y + box.height * 0.7;
            const mouthWidth = box.width * 0.4;
            
            // Thêm nếp nhăn quanh miệng
            // Đường từ mũi đến khóe miệng (rãnh mũi má)
            ctx.beginPath();
            ctx.moveTo(mouthX - mouthWidth * 0.5, mouthY - mouthWidth * 0.3);
            ctx.bezierCurveTo(
                mouthX - mouthWidth * 0.3, mouthY - mouthWidth * 0.1,
                mouthX - mouthWidth * 0.2, mouthY,
                mouthX - mouthWidth * 0.5, mouthY
            );
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(mouthX + mouthWidth * 0.5, mouthY - mouthWidth * 0.3);
            ctx.bezierCurveTo(
                mouthX + mouthWidth * 0.3, mouthY - mouthWidth * 0.1,
                mouthX + mouthWidth * 0.2, mouthY,
                mouthX + mouthWidth * 0.5, mouthY
            );
            ctx.stroke();
            
            // Nếp nhăn trên môi (các đường thẳng đứng)
            if (intensity > 0.5) {
                const lipWrinkleCount = Math.floor(5 + intensity * 5);
                const lipTop = mouthY - box.height * 0.05;
                const lipBottom = mouthY;
                
                for (let i = 0; i < lipWrinkleCount; i++) {
                    const wrinkleX = mouthX - mouthWidth * 0.4 + mouthWidth * 0.8 * (i / (lipWrinkleCount - 1));
                    ctx.beginPath();
                    ctx.moveTo(wrinkleX, lipTop);
                    ctx.lineTo(wrinkleX, lipBottom);
                    ctx.stroke();
                }
            }
            
            // Nếp nhăn quanh mắt (chân chim)
            const leftEyeX = box.x + box.width * 0.3;
            const rightEyeX = box.x + box.width * 0.7;
            const eyeY = box.y + box.height * 0.4;
            const eyeRadius = box.width * 0.15;
            
            if (intensity > 0.4) {
                // Mắt trái
                for (let i = 0; i < 3; i++) {
                    const angle = Math.PI * 0.1 + i * Math.PI * 0.05;
                    const startX = leftEyeX + Math.cos(angle) * eyeRadius;
                    const startY = eyeY + Math.sin(angle) * eyeRadius;
                    const endX = startX + Math.cos(angle) * eyeRadius * intensity * 1.5;
                    const endY = startY + Math.sin(angle) * eyeRadius * intensity * 1.5;
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
                
                // Mắt phải
                for (let i = 0; i < 3; i++) {
                    const angle = Math.PI - Math.PI * 0.1 - i * Math.PI * 0.05;
                    const startX = rightEyeX + Math.cos(angle) * eyeRadius;
                    const startY = eyeY + Math.sin(angle) * eyeRadius;
                    const endX = startX + Math.cos(angle) * eyeRadius * intensity * 1.5;
                    const endY = startY + Math.sin(angle) * eyeRadius * intensity * 1.5;
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
            }
            
            // Nếp nhăn trên trán nếu intensity cao
            if (intensity > 0.6) {
                const foreheadY = box.y + box.height * 0.2;
                const foreheadWidth = box.width * 0.7;
                const wrinkleCount = Math.floor(2 + intensity * 2);
                
                for (let i = 0; i < wrinkleCount; i++) {
                    const y = foreheadY - i * box.height * 0.03;
                    
                    ctx.beginPath();
                    ctx.moveTo(box.x + box.width * 0.15, y);
                    
                    // Đường cong cho nếp nhăn
                    ctx.bezierCurveTo(
                        box.x + box.width * 0.3, y + Math.sin(i) * 2,
                        box.x + box.width * 0.7, y + Math.cos(i) * 2,
                        box.x + box.width * 0.85, y
                    );
                    
                    ctx.stroke();
                }
            }
        }
        
        ctx.restore();
    }

    /**
     * Áp dụng hiệu ứng gầy gò chung cho toàn bộ ảnh nếu không phát hiện được khuôn mặt
     * @private
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLImageElement} img - Ảnh gốc
     * @param {string} effectType - Loại hiệu ứng
     * @param {number} intensity - Cường độ hiệu ứng (0-1)
     */
    _applyGeneralGauntEffect(ctx, img, effectType, intensity) {
        // Áp dụng filter tăng cường độ tương phản và làm tối
        ctx.globalAlpha = intensity * 0.4;
        ctx.globalCompositeOperation = 'multiply';
        
        // Tạo một gradient từ tối đến sáng để mô phỏng khuôn mặt gầy gò
        const gradient = ctx.createRadialGradient(
            img.width / 2, img.height / 2, 0,
            img.width / 2, img.height / 2, img.width / 2
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, img.width, img.height);
        
        // Khôi phục chế độ vẽ mặc định
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
    }

    /**
     * Phương thức chính để biến đổi khuôn mặt
     * @param {HTMLImageElement} img - Hình ảnh gốc
     * @param {string} effectType - Loại hiệu ứng
     * @param {number} years - Số năm sử dụng
     * @param {function} progressCallback - Hàm callback để cập nhật tiến trình
     * @returns {Promise<string>} URL hoặc data URL của ảnh đã biến đổi
     */
    async transformFace(img, effectType, years, progressCallback) {
        if (!this.initialized) {
            throw new Error('AIFaceTransformer chưa được khởi tạo');
        }
        
        if (this.isProcessing) {
            throw new Error('Đang xử lý yêu cầu khác');
        }
        
        this.isProcessing = true;
        
        try {
            // Lưu originalFace vào window để sử dụng trong validation
            if (window.FaceDetection) {
                const detectionResult = await window.FaceDetection.detect(img);
                if (detectionResult.success && detectionResult.faces.length > 0) {
                    window.originalFace = window.FaceDetection.getPrimaryFace();
                }
            }
            
            // Chuyển đổi ảnh thành base64
            const base64Image = await this.imageToBase64(img);
            
            // Thử các phương pháp theo thứ tự ưu tiên
            const methods = [
                { name: 'replicate', func: this.createTransformationRequest.bind(this) },
                { name: 'huggingface', func: this.transformWithHuggingFace.bind(this) },
                { name: 'dalle', func: this.transformWithDallE.bind(this) },
                { name: 'github', func: this.transformWithGitHubStableDiffusion.bind(this) },
                { name: 'local', func: this.useLocalStableDiffusion.bind(this) }
            ];
            
            for (const method of methods) {
                if (this.fallbackToCSS) break;
                
                try {
                    if (progressCallback) {
                        progressCallback('processing', `Đang thử phương pháp ${method.name}...`);
                    }
                    
                    let result;
                    if (method.name === 'replicate') {
                        const requestId = await method.func(base64Image, effectType, years);
                        result = await this.waitForCompletion(requestId, progressCallback);
                    } else {
                        result = await method.func(base64Image, effectType, years, progressCallback);
                    }
                    
                    if (result) {
                        return result;
                    }
                } catch (error) {
                    console.warn(`Phương pháp ${method.name} thất bại:`, error);
                    continue;
                }
            }
            
            // Nếu tất cả phương pháp API thất bại, sử dụng CSS simulation
            if (progressCallback) {
                progressCallback('processing', 'Sử dụng phương pháp mô phỏng...');
            }
            
            return await this.simulateTransformation(img, effectType, years, progressCallback);
            
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Kiểm tra xem khuôn mặt có phải là người Châu Á không
     * @param {Object} face - Đối tượng khuôn mặt từ face-api.js
     * @returns {boolean} True nếu là khuôn mặt người Châu Á
     */
    isAsianFace(face) {
        try {
            // Dựa trên một số đặc điểm cơ bản của khuôn mặt Châu Á
            // Đây là phân tích đơn giản dựa trên tỷ lệ khuôn mặt
            
            if (!face || !face.detection || !face.detection.box) {
                console.warn('Không có dữ liệu khuôn mặt để phân tích');
                return true; // Mặc định là true để không làm hỏng prompt
            }
            
            const box = face.detection.box;
            const width = box.width;
            const height = box.height;
            
            // Tỷ lệ chiều rộng/chiều cao khuôn mặt
            const aspectRatio = width / height;
            
            // Khuôn mặt Châu Á thường có tỷ lệ khác biệt
            // Đây chỉ là ước lượng đơn giản, trong thực tế cần phân tích phức tạp hơn
            const isLikelyAsian = aspectRatio >= 0.7 && aspectRatio <= 0.9;
            
            console.log(`Tỷ lệ khuôn mặt: ${aspectRatio.toFixed(2)}, có khả năng là người Châu Á: ${isLikelyAsian}`);
            
            // Luôn trả về true để đảm bảo prompt được tối ưu hóa cho người Việt Nam
            return true;
        } catch (error) {
            console.warn('Lỗi khi phân tích đặc điểm khuôn mặt:', error);
            return true; // Mặc định là true
        }
    }

    /**
     * Tạo mask dựa trên vùng khuôn mặt được phát hiện
     * @param {HTMLImageElement} img - Hình ảnh gốc
     * @param {Object} face - Đối tượng khuôn mặt từ face-api.js
     * @param {number} scale - Tỷ lệ mở rộng (mặc định là 1.5)
     * @returns {string} Data URL của mask (định dạng base64)
     */
    createFaceMask(img, face, scale = 1.5) {
        try {
            // Lấy kích thước hình ảnh gốc
            const originalWidth = img.width;
            const originalHeight = img.height;
            
            // Tạo canvas để vẽ mask
            const canvas = document.createElement('canvas');
            canvas.width = originalWidth;
            canvas.height = originalHeight;
            const ctx = canvas.getContext('2d');
            
            // Vẽ nền đen (vùng không được chỉnh sửa)
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, originalWidth, originalHeight);
            
            if (!face || !face.detection || !face.detection.box) {
                console.warn('Không có dữ liệu khuôn mặt để tạo mask');
                // Trả về mask trống nếu không có khuôn mặt
                return canvas.toDataURL('image/png');
            }
            
            const box = face.detection.box;
            
            // Tính toán vị trí và kích thước vùng khuôn mặt với scale
            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;
            const scaledWidth = box.width * scale;
            const scaledHeight = box.height * scale;
            
            // Đảm bảo vùng mask không vượt quá biên ảnh
            const maskX = Math.max(0, centerX - scaledWidth / 2);
            const maskY = Math.max(0, centerY - scaledHeight / 2);
            const maskWidth = Math.min(scaledWidth, originalWidth - maskX);
            const maskHeight = Math.min(scaledHeight, originalHeight - maskY);
            
            // Vẽ vùng trắng (vùng sẽ được chỉnh sửa) - hình ellipse cho tự nhiên hơn
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.ellipse(
                centerX, 
                centerY, 
                scaledWidth / 2, 
                scaledHeight / 2, 
                0, 
                0, 
                2 * Math.PI
            );
            ctx.fill();
            
            // Tạo hiệu ứng gradient để làm mềm biên mask
            const gradient = ctx.createRadialGradient(
                centerX, centerY, scaledWidth / 4,
                centerX, centerY, scaledWidth / 2
            );
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(0.8, 'white');
            gradient.addColorStop(1, 'rgba(255,255,255,0.3)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(
                centerX, 
                centerY, 
                scaledWidth / 2, 
                scaledHeight / 2, 
                0, 
                0, 
                2 * Math.PI
            );
            ctx.fill();
            
            console.log(`Đã tạo face mask: center(${centerX.toFixed(1)}, ${centerY.toFixed(1)}), size(${scaledWidth.toFixed(1)}x${scaledHeight.toFixed(1)})`);
            
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Lỗi khi tạo face mask:', error);
            // Trả về mask trống nếu có lỗi
            const canvas = document.createElement('canvas');
            canvas.width = img.width || 512;
            canvas.height = img.height || 512;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/png');
        }
    }

    /**
     * Kiểm tra tỉ lệ khuôn mặt trong ảnh kết quả
     * @param {string} resultImageUrl - URL ảnh kết quả 
     * @param {Object} originalFace - Thông tin khuôn mặt gốc
     * @returns {Promise<boolean>} True nếu tỉ lệ chấp nhận được
     */
    async validateFaceProportions(resultImageUrl, originalFace) {
        try {
            // Tạo image element từ URL kết quả
            const resultImg = new Image();
            resultImg.crossOrigin = "anonymous";
            
            return new Promise((resolve) => {
                resultImg.onload = async () => {
                    try {
                        // Phát hiện khuôn mặt trong ảnh kết quả
                        if (window.FaceDetection) {
                            const detectionResult = await window.FaceDetection.detect(resultImg);
                            
                            if (detectionResult && detectionResult.success && detectionResult.faces && detectionResult.faces.length > 0) {
                                const resultFace = detectionResult.faces[0];
                                
                                // So sánh tỉ lệ khuôn mặt
                                const originalBox = originalFace.detection.box;
                                const resultBox = resultFace.detection.box;
                                
                                const originalRatio = originalBox.width / originalBox.height;
                                const resultRatio = resultBox.width / resultBox.height;
                                
                                // Kiểm tra sự khác biệt tỉ lệ (cho phép sai lệch 20%)
                                const ratioDifference = Math.abs(originalRatio - resultRatio) / originalRatio;
                                
                                console.log(`📏 Tỉ lệ gốc: ${originalRatio.toFixed(2)}, Tỉ lệ kết quả: ${resultRatio.toFixed(2)}, Sai lệch: ${(ratioDifference * 100).toFixed(1)}%`);
                                
                                resolve(ratioDifference < 0.2); // Chấp nhận nếu sai lệch < 20%
                            } else {
                                console.warn('❌ Không phát hiện được khuôn mặt trong ảnh kết quả');
                                resolve(false);
                            }
                        } else {
                            console.warn('⚠️ FaceDetection không khả dụng');
                            resolve(true); // Chấp nhận nếu không thể kiểm tra
                        }
                    } catch (validationError) {
                        console.warn('Lỗi khi validation khuôn mặt:', validationError);
                        resolve(true); // Chấp nhận nếu có lỗi
                    }
                };
                
                resultImg.onerror = () => {
                    console.warn('Không thể tải ảnh kết quả để validation');
                    resolve(true); // Chấp nhận nếu không thể tải ảnh
                };
                
                resultImg.src = resultImageUrl;
            });
        } catch (error) {
            console.warn('Lỗi khi validate face proportions:', error);
            return true; // Chấp nhận nếu có lỗi
        }
    }

    /**
     * Tạo miêu tả chi tiết về tác hại dựa trên loại và thời gian
     * @param {string} effectType - Loại hiệu ứng (drug-effects, alcohol-effects, smoking-effects)
     * @param {number} years - Số năm sử dụng (1-20)
     * @returns {Object} Đối tượng chứa prompt và negative prompt chi tiết
     */
    generateDetailedDescription(effectType, years) {
        // Điều chỉnh số năm dựa trên tuổi nếu có
        const adjustedYears = this.userAge ? this.calculateAgeAdjustedYears(years) : years;
        
        // Lấy prompt cho số năm cụ thể (1-20)
        let basePrompt = this.effectPrompts[effectType]?.[adjustedYears];
        
        // Nếu không có prompt cho năm cụ thể, lấy năm gần nhất
        if (!basePrompt) {
            console.warn(`Không tìm thấy prompt cho ${effectType} năm ${adjustedYears}, sử dụng năm gần nhất`);
            // Tìm năm gần nhất có sẵn
            const availableYears = Object.keys(this.effectPrompts[effectType] || {}).map(y => parseInt(y)).sort((a, b) => a - b);
            const closestYear = availableYears.reduce((prev, curr) => {
                return Math.abs(curr - adjustedYears) < Math.abs(prev - adjustedYears) ? curr : prev;
            });
            basePrompt = this.effectPrompts[effectType]?.[closestYear] || this.effectPrompts[effectType]?.[5];
        }
        
        if (!basePrompt) {
            console.warn(`Không tìm thấy prompt cho hiệu ứng ${effectType}`);
            basePrompt = "realistic portrait of a Vietnamese person, same facial identity and proportions";
        }
        
        // Thêm chi tiết về thời gian cụ thể nếu khác với yearKey
        if (years !== adjustedYears) {
            basePrompt = basePrompt.replace(`after ${adjustedYears} years`, `after ${years} years`);
        }
        
        // Thêm chi tiết về nhăn nheo và tối màu da
        const ageingDetails = "natural skin wrinkles, slightly darker skin tone, more prominent nasolabial folds";
        
        // Thêm chi tiết về khuôn mặt gầy gò và khắc khổ
        const gauntFaceDetails = "thinner and more gaunt face, sunken cheeks, pronounced cheekbones, hollowed eye sockets, more defined jaw bone, taut skin, visible facial bone structure";
        
        // Bảo vệ phần tai không bị chỉnh sửa
        const earProtection = "preserve original ears exactly as in the original photo, no changes to ears";
        
        // Tạo negative prompt chi tiết dựa trên loại tác hại
        let negativePrompt = this.defaultParams.negative_prompt;
        
        // Thêm vào negative prompt để tránh thay đổi quá mức
        negativePrompt += ", exaggerated effects, extreme changes, different person, unnatural transformation, ear changes, ear modification, distorted ears";
        
        switch (effectType) {
            case 'drug-effects':
                negativePrompt += ", healthy appearance, clear skin, bright eyes, full cheeks, healthy teeth, good complexion, no scars, no sores, well-nourished appearance, changing clothes, altering outfit";
                break;
            case 'alcohol-effects':
                negativePrompt += ", clear skin, normal complexion, no redness, no swelling, bright clear eyes, healthy appearance, no spider veins, no jaundice, modifying clothing, changing wardrobe";
                break;
            case 'smoking-effects':
                negativePrompt += ", white teeth, smooth skin, bright complexion, no wrinkles, elastic skin, healthy appearance, no yellowing, clear complexion, outfit changes, clothing alterations";
                break;
        }
        
        // Thêm chi tiết về mức độ dựa trên thời gian
        const intensityDescriptions = {
            5: "early stage damage, subtle changes, minor effects, natural aging",
            10: "moderate damage, modest changes, visible effects, natural aging", 
            15: "noticeable damage, clear changes, significant effects, natural aging",
            20: "severe damage, major changes, extensive effects, natural aging"
        };
        
        const progressDescription = intensityDescriptions[adjustedYears] || "moderate effects";
        
        // Tạo prompt cuối cùng với nhấn mạnh về giữ nguyên trang phục và đặc điểm nhận dạng
        const identityEmphasis = "IMPORTANT: maintain same identity, facial structure, bone structure, and key facial features";
        const clothingEmphasis = "IMPORTANT: keep exact same clothing, outfit, accessories, jewelry, and hairstyle as in the original photo, only modify facial features and skin";
        const subtleChangesEmphasis = "apply realistic changes only, maintain strong resemblance to original image";
        
        // Tăng cường hiệu ứng gầy gò cho khuôn mặt
        const enhancedGauntPrompt = this.enhanceGauntFaceEffect(effectType, years);

        return {
            prompt: `${basePrompt}, ${ageingDetails}, ${gauntFaceDetails}, ${enhancedGauntPrompt}, ${earProtection}, ${progressDescription}, ${identityEmphasis}, ${clothingEmphasis}, ${subtleChangesEmphasis}, detailed portrait, subtle skin aging, realistic wrinkles, slightly darker skin, gaunt appearance, malnourished look`,
            negativePrompt: negativePrompt,
            yearKey: adjustedYears,
            actualYears: years,
            effectType: effectType,
            description: this.getEffectDescription(effectType, years)
        };
    }

    /**
     * Lấy mô tả bằng tiếng Việt về tác hại
     * @param {string} effectType - Loại hiệu ứng
     * @param {number} years - Số năm sử dụng
     * @returns {string} Mô tả bằng tiếng Việt
     */
    getEffectDescription(effectType, years) {
        const descriptions = {
            'drug-effects': {
                1: "Giai đoạn khởi đầu: Mắt bắt đầu thâm quầng, da nhợt nhạt, sụt cân nhẹ, mệt mỏi thường xuyên.",
                2: "Suy giảm rõ rệt: Quầng thâm mắt sâu hơn, má hơi hóp, da xanh xao, răng bắt đầu ố vàng.",
                3: "Tổn thương ban đầu: Má hóp rõ, xương gò má bắt đầu lộ, da khô và thô ráp, răng vàng.",
                4: "Suy kiệt nhẹ: Má hóp sâu, mắt trũng, da xám xịt, xuất hiện mụn nhọt nhỏ, răng hư tổn.",
                5: "Giai đoạn đầu: Má hóp nhẹ, quầng thâm mắt, da nhợt nhạt, răng bắt đầu ố vàng, sụt cân nhẹ ở mặt.",
                6: "Tổn thương tiến triển: Má hóp sâu hơn, thái dương lõm, da xám và có vết thương nhỏ, răng sâu.",
                7: "Suy giảm nghiêm trọng: Má và mắt trũng sâu, xương mặt lộ rõ, nhiều vết loét, răng rụng.",
                8: "Tổn thương nặng: Khuôn mặt hốc hác, cơ mặt teo, da đầy sẹo và vết thương, răng hư nặng.",
                9: "Suy kiệt trầm trọng: Gương mặt như xương khô, má và thái dương cực kỳ hóp, da tổn thương nặng.",
                10: "Giai đoạn trung bình: Má hóp rõ rệt, da xám xịt, khuôn mặt gầy gò, xương gò má lộ rõ, răng hư hỏng, có mụn nhọt nhỏ, giảm cân đáng kể.",
                11: "Tổn thương nghiêm trọng: Cực kỳ gầy gò, xương sọ lộ rõ qua da, nhiều vết loét, răng rụng nhiều.",
                12: "Suy kiệt nặng: Khuôn mặt như bộ xương, da phủ đầy sẹo và vết thương, hầu hết răng đã rụng.",
                13: "Gần như tàn phá: Hình hài xương xẩu, da tổn thương không thể phục hồi, răng gần như mất hết.",
                14: "Suy kiệt cực độ: Mặt hoàn toàn xương, mất hết mỡ mặt, sẹo vĩnh viễn, răng rụng gần hết.",
                15: "Giai đoạn nặng: Má và thái dương hóp sâu, khuôn mặt hốc hác, da căng trên xương, răng rụng nhiều, nhiều vết sẹo, da xám bạc, già trước tuổi.",
                16: "Tàn phá hoàn toàn: Sọ lộ rõ qua da, tổn thương vĩnh viễn toàn mặt, răng mất hoàn toàn.",
                17: "Giai đoạn cuối: Cực kỳ kiệt quệ, mất hết thể tích khuôn mặt, tổn thương không phục hồi.",
                18: "Suy kiệt tận cùng: Hoàn toàn xương xẩu, mô mềm tiêu biến, sẹo vĩnh viễn khắp mặt.",
                19: "Gần tử vong: Hình hài như xác sống, hoàn toàn suy kiệt, tổn thương toàn diện.",
                20: "Giai đoạn cực nặng: Hình dáng gương mặt như xương khô, má hóp sâu, mắt trũng, xương mặt lộ rõ, răng rụng gần hết, da tổn thương nặng, già cỗi nghiêm trọng."
            },
            'alcohol-effects': {
                1: "Khởi đầu nhẹ: Mặt hơi ửng đỏ, mắt hơi sưng, má đỏ nhẹ khi uống.",
                2: "Dấu hiệu ban đầu: Mặt phù nhẹ, mũi và má đỏ hơn, xuất hiện mạch máu nhỏ.",
                3: "Phát triển rõ: Mặt sưng phù rõ, má và mũi đỏ, mạch máu nổi, mắt bắt đầu vàng.",
                4: "Tiến triển: Phù nề tăng, đỏ mặt rõ rệt, nhiều mạch máu vỡ, mí mắt sưng.",
                5: "Giai đoạn đầu: Mặt hơi sưng phù, đỏ mũi và má nhẹ, mắt hơi đỏ, da bắt đầu thô ráp, khuôn mặt hơi gầy.",
                6: "Tổn thương rõ: Phù nề kết hợp gầy gò, mặt đỏ nhiều hơn, mạch máu lan rộng, da vàng nhẹ.",
                7: "Nghiêm trọng: Sưng phù rõ với xương mặt lộ, đỏ da nhiều, mạch máu vỡ nhiều, vàng da rõ.",
                8: "Tổn thương nặng: Phù nề che lấp cấu trúc mặt, da đỏ sẫm, tổn thương mạch máu nhiều, mũi to dần.",
                9: "Biến dạng rõ: Mặt biến dạng do sưng, đỏ và mạch máu vỡ nặng, vàng da rõ, mũi phình to.",
                10: "Giai đoạn trung bình: Gương mặt gầy gò phối hợp sưng tấy, má hóp, mũi và má đỏ lâu, có mạch máu nổi, da vàng nhẹ, rãnh mũi má rõ.",
                11: "Tiến triển nặng: Sưng phù nặng với xương mặt vẫn lộ, mũi phình to rõ (rhinophyma), mạch máu vỡ nhiều, vàng da sâu.",
                12: "Tổn thương nghiêm trọng: Phù nề cực độ, mũi biến dạng nặng, tổn thương mạch máu lan rộng, vàng da nặng.",
                13: "Gần tàn phá: Biến dạng mặt nặng, rhinophyma cực độ, mạch máu vỡ khắp mặt, da vàng sẫm.",
                14: "Suy kiệt nặng: Sưng cực độ với cấu trúc xương gầy gò bên trong, mũi biến dạng hoàn toàn, tổn thương mạch máu nghiêm trọng.",
                15: "Giai đoạn nặng: Sưng phù nghiêm trọng nhưng má hóp, khuôn mặt khắc khổ, gò má nhô cao, mũi đỏ tím (rhinophyma), mạch máu nổi nhiều, da và mắt vàng.",
                16: "Biến dạng hoàn toàn: Mặt biến dạng hoàn toàn, rhinophyma cực độ, vàng da do suy gan nặng, tổn thương mạch máu vĩnh viễn.",
                20: "Giai đoạn cực nặng: Biến dạng mặt, khuôn mặt cực kỳ gầy gò và khắc khổ, mũi tổn thương nặng, mạch máu vỡ nhiều, vàng da nghiêm trọng."
            },
            'smoking-effects': {
                5: "Giai đoạn đầu: Răng ố vàng nhẹ, da hơi xỉn màu, khuôn mặt hơi gầy đi, nếp nhăn nhỏ quanh miệng và mắt.",
                10: "Giai đoạn trung bình: Răng ố vàng rõ, da xỉn xám, nếp nhăn sâu quanh miệng, má hóp nhẹ, xương gò má bắt đầu lộ, da mất độ đàn hồi.",
                15: "Giai đoạn nặng: Răng ố vàng nặng, da xám xịt, khuôn mặt gầy gò khắc khổ, má hóp rõ rệt, nếp nhăn sâu nhiều, da chảy xệ, như da thuộc.",
                20: "Giai đoạn cực nặng: Răng ố vàng và rụng, da tro xám, khuôn mặt cực kỳ gầy gò, xương mặt lộ rõ, nhăn nheo nhiều, da khô như da thuộc."
            }
        };
        
        let yearKey = 5;
        if (years > 17) yearKey = 20;
        else if (years > 12) yearKey = 15;
        else if (years > 7) yearKey = 10;
        
        return descriptions[effectType]?.[yearKey] || `Tác hại của ${effectType} sau ${years} năm sử dụng.`;
    }

    /**
     * Tăng cường prompt với đặc trưng từ CNN
     * @param {string} basePrompt - Prompt cơ bản
     * @param {Object} features - Đặc trưng từ CNN
     * @param {string} effectType - Loại hiệu ứng
     * @returns {string} Prompt đã được tăng cường
     */
    enhancePromptWithFeatures(basePrompt, features, effectType) {
        if (!features) return basePrompt;
        
        let enhancedPrompt = basePrompt;
        
        // Thêm chi tiết về nếp nhăn
        if (features.general.wrinkles > 0.5) {
            const wrinkleDesc = features.general.wrinkles > 0.8 ? 'deep severe' : 
                               features.general.wrinkles > 0.6 ? 'prominent' : 'noticeable';
            enhancedPrompt += `, ${wrinkleDesc} wrinkles on forehead and around eyes`;
        }
        
        // Thêm chi tiết về texture da
        if (features.general.skinTexture > 0.5) {
            const textureDesc = features.general.skinTexture > 0.8 ? 'very rough and damaged' :
                               features.general.skinTexture > 0.6 ? 'coarse and uneven' : 'slightly rough';
            enhancedPrompt += `, ${textureDesc} skin texture`;
        }
        
        // Thêm chi tiết cụ thể theo loại tác động
        switch (effectType) {
            case 'drug-effects':
                if (features.specific.skinLesions && features.specific.skinLesions.count > 0) {
                    enhancedPrompt += `, ${features.specific.skinLesions.count} visible facial sores and lesions`;
                }
                if (features.specific.facialMuscleAtrophy) {
                    enhancedPrompt += `, severe muscle wasting in cheeks (${(features.specific.facialMuscleAtrophy.cheeks * 100).toFixed(0)}% atrophy)`;
                }
                if (features.specific.paleSkin > 0.7) {
                    enhancedPrompt += `, extremely pale and unhealthy skin tone`;
                }
                break;
                
            case 'alcohol-effects':
                if (features.specific.rhinophyma && features.specific.rhinophyma.severity > 0) {
                    enhancedPrompt += `, bulbous red nose with visible rhinophyma`;
                }
                if (features.specific.spiderVeins > 0.5) {
                    enhancedPrompt += `, prominent spider veins on nose and cheeks`;
                }
                if (features.specific.liverDamage && features.specific.liverDamage.jaundiceLevel > 0) {
                    enhancedPrompt += `, yellowish skin tone from jaundice`;
                }
                break;
                
            case 'smoking-effects':
                if (features.specific.periOralWrinkles && features.specific.periOralWrinkles.count > 10) {
                    enhancedPrompt += `, ${features.specific.periOralWrinkles.count} vertical lines around mouth`;
                }
                if (features.specific.skinElasticity && features.specific.skinElasticity.loss > 0.7) {
                    enhancedPrompt += `, severe loss of skin elasticity with sagging`;
                }
                if (features.specific.dullSkin > 0.6) {
                    enhancedPrompt += `, dull grayish skin complexion`;
                }
                break;
        }
        
        // Thêm mô tả về độ nghiêm trọng tổng thể
        if (features.overallScore > 0.8) {
            enhancedPrompt += `, extremely severe overall facial damage`;
        } else if (features.overallScore > 0.6) {
            enhancedPrompt += `, significant visible facial deterioration`;
        }
        
        console.log('🎯 Prompt đã được tăng cường với CNN features');
        return enhancedPrompt;
    }

    /**
     * Tạo visual rendering hints từ CNN features
     * @param {Object} features - Đặc trưng từ CNN
     * @returns {Object} Rendering hints cho AI
     */
    createRenderingHints(features) {
        const hints = {
            focusAreas: [],
            intensityMap: {},
            specialEffects: []
        };
        
        // Xác định vùng cần tập trung
        if (features.visualIndicators) {
            features.visualIndicators.forEach(indicator => {
                hints.focusAreas.push(...indicator.areas);
                
                // Tạo intensity map
                indicator.areas.forEach(area => {
                    hints.intensityMap[area] = indicator.intensity;
                });
                
                // Thêm special effects
                if (indicator.type === 'sores') {
                    hints.specialEffects.push({
                        type: 'skin_lesions',
                        count: indicator.count,
                        areas: indicator.areas
                    });
                } else if (indicator.type === 'spider_veins') {
                    hints.specialEffects.push({
                        type: 'vascular_damage',
                        pattern: 'spider_web',
                        areas: indicator.areas
                    });
                }
            });
        }
        
        return hints;
    }

    /**
     * Lấy caption tiếng Việt ngẫu nhiên mô tả tác động của chất gây nghiện
     * @param {string} effectType - Loại hiệu ứng (drug-effects, alcohol-effects, smoking-effects)
     * @param {number} years - Số năm sử dụng
     * @returns {string} Caption tiếng Việt
     */
    getRandomVietnameseCaption(effectType, years) {
        // Nếu không phải hiệu ứng gây nghiện, trả về mô tả chung
        if (!['drug-effects', 'alcohol-effects', 'smoking-effects'].includes(effectType)) {
            return "Khuôn mặt biến đổi theo thời gian";
        }
        
        // Lấy danh sách caption từ cài đặt
        const captionsList = this.gauntFaceSettings[effectType]?.vietnameseCaptions;
        
        if (!captionsList || captionsList.length === 0) {
            // Trả về mô tả mặc định nếu không có caption
            return this.getEffectDescription(effectType, years);
        }
        
        // Chọn ngẫu nhiên một caption từ danh sách
        const randomIndex = Math.floor(Math.random() * captionsList.length);
        
        // Điều chỉnh caption theo số năm sử dụng
        let timePrefix = "";
        if (years <= 5) {
            timePrefix = "Giai đoạn đầu: ";
        } else if (years <= 10) {
            timePrefix = "Giai đoạn trung bình: ";
        } else if (years <= 15) {
            timePrefix = "Giai đoạn nặng: ";
        } else {
            timePrefix = "Giai đoạn nguy hiểm: ";
        }
        
        return `${timePrefix}${captionsList[randomIndex]}`;
    }

    // Thêm phương thức nâng cao chất lượng ảnh
    async enhanceImageDetail(img, intensityLevel = 0.8, progressCallback) {
        try {
            if (progressCallback) {
                progressCallback('preparing', 'Đang chuẩn bị xử lý nâng cao chi tiết ảnh...');
            }
            
            // Tạo canvas để xử lý hình ảnh
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Đặt kích thước canvas bằng với kích thước ảnh
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Vẽ ảnh gốc
            ctx.drawImage(img, 0, 0);
            
            if (progressCallback) {
                progressCallback('processing', 'Phân tích khuôn mặt và cấu trúc ảnh...');
            }
            
            // Phát hiện khuôn mặt để xử lý có mục tiêu hơn
            let faceDetected = false;
            let faceRegion = null;
            
            try {
                if (window.FaceDetection) {
                    const detectionResult = await window.FaceDetection.detect(img);
                    if (detectionResult.success && detectionResult.faces.length > 0) {
                        faceDetected = true;
                        const face = window.FaceDetection.getPrimaryFace();
                        const box = face.detection.box;
                        
                        // Mở rộng vùng khuôn mặt một chút
                        const scale = 1.5;
                        const centerX = box.x + box.width / 2;
                        const centerY = box.y + box.height / 2;
                        const newWidth = box.width * scale;
                        const newHeight = box.height * scale;
                        
                        faceRegion = {
                            x: Math.max(0, centerX - newWidth / 2),
                            y: Math.max(0, centerY - newHeight / 2),
                            width: Math.min(newWidth, img.width - Math.max(0, centerX - newWidth / 2)),
                            height: Math.min(newHeight, img.height - Math.max(0, centerY - newHeight / 2))
                        };
                    }
                }
            } catch (error) {
                console.warn('Không thể phát hiện khuôn mặt:', error);
                // Tiếp tục mà không có phát hiện khuôn mặt
            }
            
            if (progressCallback) {
                progressCallback('processing', 'Đang áp dụng nâng cao chi tiết...');
            }
            
            // Lấy dữ liệu hình ảnh
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Tạo bản sao để tính toán
            const tempData = new Uint8ClampedArray(data);
            
            // 1. Tăng cường độ tương phản cục bộ 
            const processLocalContrast = (startX, startY, width, height, intensity) => {
                for (let y = startY; y < startY + height; y++) {
                    for (let x = startX; x < startX + width; x++) {
                        if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;
                        
                        const idx = (y * canvas.width + x) * 4;
                        
                        // Lấy pixel hiện tại và các pixel xung quanh (3x3 kernel)
                        const neighborhood = [];
                        for (let j = -1; j <= 1; j++) {
                            for (let i = -1; i <= 1; i++) {
                                const nx = x + i;
                                const ny = y + j;
                                if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                                    const nidx = (ny * canvas.width + nx) * 4;
                                    // Lấy độ sáng của pixel
                                    const gray = 0.299 * tempData[nidx] + 0.587 * tempData[nidx + 1] + 0.114 * tempData[nidx + 2];
                                    neighborhood.push(gray);
                                }
                            }
                        }
                        
                        // Tính trung bình và độ lệch chuẩn của vùng lân cận
                        const sum = neighborhood.reduce((a, b) => a + b, 0);
                        const mean = sum / neighborhood.length;
                        
                        const variance = neighborhood.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / neighborhood.length;
                        const stdDev = Math.sqrt(variance);
                        
                        // Tính hệ số tăng cường dựa trên độ lệch chuẩn (chi tiết cao = độ lệch chuẩn cao)
                        // Áp dụng công thức CLAHE (Contrast Limited Adaptive Histogram Equalization) đơn giản hóa
                        const enhanceFactor = 1 + (stdDev / 128) * intensity;
                        
                        // Áp dụng hệ số tăng cường
                        for (let c = 0; c < 3; c++) {
                            const pixelValue = tempData[idx + c];
                            const diff = pixelValue - mean;
                            data[idx + c] = Math.min(255, Math.max(0, mean + diff * enhanceFactor));
                        }
                    }
                }
            };
            
            // 2. Tăng cường sắc nét (Unsharp Masking)
            const applyUnsharpMask = (startX, startY, width, height, amount) => {
                // Tạo một bản sao mờ của ảnh
                const blurredData = new Uint8ClampedArray(data.length);
                for (let i = 0; i < data.length; i++) {
                    blurredData[i] = data[i];
                }
                
                // Áp dụng bộ lọc Gaussian Blur đơn giản
                const gaussianBlur = (x, y, radius) => {
                    const idx = (y * canvas.width + x) * 4;
                    let r = 0, g = 0, b = 0;
                    let weightSum = 0;
                    
                    for (let j = -radius; j <= radius; j++) {
                        for (let i = -radius; i <= radius; i++) {
                            const nx = x + i;
                            const ny = y + j;
                            if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                                const nidx = (ny * canvas.width + nx) * 4;
                                const weight = Math.exp(-(i*i + j*j) / (2 * radius * radius));
                                
                                r += tempData[nidx] * weight;
                                g += tempData[nidx + 1] * weight;
                                b += tempData[nidx + 2] * weight;
                                weightSum += weight;
                            }
                        }
                    }
                    
                    blurredData[idx] = r / weightSum;
                    blurredData[idx + 1] = g / weightSum;
                    blurredData[idx + 2] = b / weightSum;
                };
                
                // Áp dụng Gaussian Blur cho vùng xử lý
                for (let y = startY; y < startY + height; y++) {
                    for (let x = startX; x < startX + width; x++) {
                        if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;
                        gaussianBlur(x, y, 1); // Bán kính = 1 pixel
                    }
                }
                
                // Áp dụng Unsharp Mask (Original + (Original - Blurred) * amount)
                for (let y = startY; y < startY + height; y++) {
                    for (let x = startX; x < startX + width; x++) {
                        if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;
                        
                        const idx = (y * canvas.width + x) * 4;
                        
                        // Tính toán và áp dụng unsharp mask cho từng kênh màu
                        for (let c = 0; c < 3; c++) {
                            const original = tempData[idx + c];
                            const blurred = blurredData[idx + c];
                            const mask = original - blurred;
                            data[idx + c] = Math.min(255, Math.max(0, original + mask * amount));
                        }
                    }
                }
            };
            
            // 3. Tăng cường độ chi tiết kết cấu (Texture Enhancement)
            const enhanceTexture = (startX, startY, width, height, intensity) => {
                // Tính toán và áp dụng bộ lọc Laplacian đơn giản để phát hiện cạnh
                const laplacianFilter = (x, y) => {
                    const idx = (y * canvas.width + x) * 4;
                    const kernel = [0, 1, 0, 1, -4, 1, 0, 1, 0]; // Laplacian kernel
                    let sum = [0, 0, 0];
                    
                    let k = 0;
                    for (let j = -1; j <= 1; j++) {
                        for (let i = -1; i <= 1; i++) {
                            const nx = x + i;
                            const ny = y + j;
                            if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                                const nidx = (ny * canvas.width + nx) * 4;
                                sum[0] += tempData[nidx] * kernel[k];
                                sum[1] += tempData[nidx + 1] * kernel[k];
                                sum[2] += tempData[nidx + 2] * kernel[k];
                            }
                            k++;
                        }
                    }
                    
                    return sum;
                };
                
                for (let y = startY; y < startY + height; y++) {
                    for (let x = startX; x < startX + width; x++) {
                        if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;
                        
                        const idx = (y * canvas.width + x) * 4;
                        const laplacian = laplacianFilter(x, y);
                        
                        // Áp dụng chi tiết Laplacian với cường độ được kiểm soát
                        for (let c = 0; c < 3; c++) {
                            data[idx + c] = Math.min(255, Math.max(0, data[idx + c] - laplacian[c] * intensity));
                        }
                    }
                }
            };
            
            // 4. Áp dụng các bộ lọc nâng cao với cường độ phù hợp
            // Áp dụng các bộ lọc cho toàn bộ ảnh với cường độ thấp
            processLocalContrast(0, 0, canvas.width, canvas.height, intensityLevel * 0.5);
            applyUnsharpMask(0, 0, canvas.width, canvas.height, intensityLevel * 0.6);
            enhanceTexture(0, 0, canvas.width, canvas.height, intensityLevel * 0.4);
            
            // Nếu đã phát hiện khuôn mặt, áp dụng nâng cao mạnh hơn cho vùng khuôn mặt
            if (faceDetected && faceRegion) {
                if (progressCallback) {
                    progressCallback('processing', 'Đang nâng cao chi tiết khuôn mặt...');
                }
                
                processLocalContrast(
                    faceRegion.x, faceRegion.y, 
                    faceRegion.width, faceRegion.height, 
                    intensityLevel * 0.9
                );
                
                applyUnsharpMask(
                    faceRegion.x, faceRegion.y, 
                    faceRegion.width, faceRegion.height, 
                    intensityLevel * 1.2
                );
                
                enhanceTexture(
                    faceRegion.x, faceRegion.y, 
                    faceRegion.width, faceRegion.height, 
                    intensityLevel * 0.8
                );
            }
            
            // 5. Tăng cường độ sáng và tương phản tổng thể
            for (let i = 0; i < data.length; i += 4) {
                // Áp dụng cải thiện độ tương phản toàn cục
                for (let c = 0; c < 3; c++) {
                    // Áp dụng đường cong độ sáng S-curve nhẹ để tăng tương phản
                    const normalizedValue = data[i + c] / 255;
                    const enhancedValue = 0.5 * (1 + Math.sin(Math.PI * (normalizedValue - 0.5)));
                    data[i + c] = Math.min(255, Math.max(0, Math.round(enhancedValue * 255)));
                }
            }
            
            if (progressCallback) {
                progressCallback('processing', 'Đang hoàn thiện nâng cao chi tiết...');
            }
            
            // Cập nhật dữ liệu hình ảnh vào canvas
            ctx.putImageData(imageData, 0, 0);
            
            // Tùy chọn: Thêm lớp phủ nhẹ để làm mịn tổng thể
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Khôi phục lại chế độ vẽ mặc định
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1.0;
            
            if (progressCallback) {
                progressCallback('succeeded', 100);
            }
            
            // Trả về URL dữ liệu của ảnh đã nâng cao
            return canvas.toDataURL('image/jpeg', 0.95);
        } catch (error) {
            console.error('Lỗi khi nâng cao chi tiết ảnh:', error);
            if (progressCallback) {
                progressCallback('failed', 'Lỗi khi nâng cao chi tiết ảnh');
            }
            throw error;
        }
    }

    /**
     * Tăng cường hiệu ứng khuôn mặt gầy gò dựa trên loại tác động và thời gian
     * @param {string} effectType - Loại hiệu ứng (drug-effects, alcohol-effects, smoking-effects)
     * @param {number} years - Số năm sử dụng
     * @returns {string} Prompt chi tiết cho hiệu ứng khuôn mặt gầy gò
     */
    enhanceGauntFaceEffect(effectType, years) {
        // Tính toán cường độ dựa trên số năm sử dụng
        const normalizedYears = Math.min(years, 20) / 20; // Chuẩn hóa từ 0-1
        const baseIntensity = this.gauntFaceParams.intensity;
        const effectIntensity = baseIntensity * normalizedYears;
        
        // Các mô tả chi tiết theo từng loại chất gây nghiện
        const commonGauntFeatures = "extremely thin face, bony facial structure, visible skull-like appearance";
        
        // Đặc điểm riêng cho từng loại tác động
        let specificFeatures = "";
        switch (effectType) {
            case 'drug-effects':
                specificFeatures = "severe malnourishment, hollow eye sockets, extreme temporal hollowing, sharp cheekbones, concave cheeks, defined jawline, thinned lips, visible facial tendons, visible veins on temples, taut skin stretched over bones";
                break;
            case 'alcohol-effects':
                specificFeatures = "paradoxical combination of bloating and emaciation, sunken eyes with puffy eyelids, swollen yet gaunt cheeks, defined cheekbones with redness, dehydrated skin, visible muscle wasting with fluid retention";
                break;
            case 'smoking-effects':
                specificFeatures = "deeply set eyes, prominent nasolabial folds, vertical lines around lips, loss of facial fat, premature sagging, hollow cheeks, visible temporalis muscle, prominent bony landmarks";
                break;
            default:
                specificFeatures = "sunken cheeks, hollow temples, visible facial bones, reduced facial fat, prominent bone structure";
        }
        
        // Điều chỉnh mức độ mô tả theo thời gian sử dụng
        let intensityDescription;
        if (years <= 5) {
            intensityDescription = "early signs of facial thinning, slight hollowing of cheeks, minor visible bone structure";
        } else if (years <= 10) {
            intensityDescription = "moderate facial emaciation, noticeable hollow cheeks, defined bone structure";
        } else if (years <= 15) {
            intensityDescription = "severe gauntness, prominently hollow cheeks, very defined facial bones, visible skull-like appearance";
        } else {
            intensityDescription = "extreme emaciation, skeletal appearance, dramatically hollow cheeks, severely pronounced bone structure, skull-like face with skin stretched tightly over bones";
        }
        
        // Thêm từ ngữ tiếng Việt để mô tả khuôn mặt gầy gò
        const vietnameseContext = "gương mặt gầy gò khắc khổ, hốc mắt trũng sâu, xương gò má nhô cao, da bọc xương, vẻ ngoài tiều tụy, khuôn mặt hốc hác";
        
        // Kết hợp tất cả để tạo prompt chi tiết
        return `${intensityDescription}, ${commonGauntFeatures}, ${specificFeatures}, ${vietnameseContext}`;
    }

    /**
     * Thiết lập tuổi người dùng để tính toán tác động chính xác hơn
     * @param {number} age - Tuổi người dùng
     */
    setUserAge(age) {
        this.userAge = age;
        
        // Tính toán hệ số tác động dựa trên tuổi
        // Người càng trẻ, tác động càng mạnh và nhanh
        if (age < 18) {
            this.ageBasedIntensity = 1.5; // Tác động mạnh hơn 50% cho người dưới 18
        } else if (age < 25) {
            this.ageBasedIntensity = 1.3; // Tác động mạnh hơn 30% cho người 18-25
        } else if (age < 35) {
            this.ageBasedIntensity = 1.1; // Tác động mạnh hơn 10% cho người 25-35
        } else if (age < 45) {
            this.ageBasedIntensity = 1.0; // Tác động bình thường cho người 35-45
        } else if (age < 55) {
            this.ageBasedIntensity = 0.9; // Tác động nhẹ hơn 10% cho người 45-55
        } else {
            this.ageBasedIntensity = 0.8; // Tác động nhẹ hơn 20% cho người trên 55
        }
        
        console.log(`Đã thiết lập tuổi người dùng: ${age}, hệ số tác động: ${this.ageBasedIntensity}`);
    }

    /**
     * Tính toán số năm tác động thực tế dựa trên tuổi người dùng
     * @param {number} years - Số năm sử dụng mong muốn
     * @returns {number} Số năm tác động thực tế
     */
    calculateAgeAdjustedYears(years) {
        if (!this.userAge) {
            return years; // Nếu không có tuổi, trả về số năm gốc
        }
        
        // Điều chỉnh số năm dựa trên hệ số tuổi
        const adjustedYears = Math.round(years * this.ageBasedIntensity);
        
        // Đảm bảo không vượt quá 20 năm
        return Math.min(adjustedYears, 20);
    }

    /**
     * Lấy mô tả tác động theo tuổi cụ thể
     * @param {string} effectType - Loại hiệu ứng
     * @param {number} years - Số năm sử dụng
     * @param {number} userAge - Tuổi người dùng
     * @returns {Object} Thông tin tác động chi tiết
     */
    getAgeSpecificImpact(effectType, years, userAge) {
        const impacts = {
            'drug-effects': {
                youth: { // < 25 tuổi
                    multiplier: 1.5,
                    additionalEffects: "faster metabolism leads to quicker physical deterioration, developing brain more susceptible to damage, growth stunting",
                    vietnameseNote: "Cơ thể trẻ bị tổn thương nhanh hơn, não bộ đang phát triển dễ bị hủy hoại, ngừng phát triển chiều cao"
                },
                youngAdult: { // 25-35 tuổi
                    multiplier: 1.3,
                    additionalEffects: "peak physical condition deteriorates rapidly, career and family life severely impacted",
                    vietnameseNote: "Sức khỏe đỉnh cao suy giảm nhanh chóng, ảnh hưởng nghiêm trọng đến sự nghiệp và gia đình"
                },
                middleAge: { // 35-50 tuổi
                    multiplier: 1.0,
                    additionalEffects: "combines with natural aging for compounded effects, slower recovery",
                    vietnameseNote: "Kết hợp với lão hóa tự nhiên tạo tác động kép, phục hồi chậm"
                },
                senior: { // > 50 tuổi
                    multiplier: 0.8,
                    additionalEffects: "interacts with age-related health conditions, extreme vulnerability",
                    vietnameseNote: "Tương tác với các bệnh tuổi già, cực kỳ dễ tổn thương"
                }
            },
            'alcohol-effects': {
                youth: {
                    multiplier: 1.4,
                    additionalEffects: "developing liver more susceptible, brain development disrupted",
                    vietnameseNote: "Gan đang phát triển dễ tổn thương hơn, gián đoạn phát triển não"
                },
                youngAdult: {
                    multiplier: 1.2,
                    additionalEffects: "social drinking escalates faster, tolerance builds quickly",
                    vietnameseNote: "Uống xã giao leo thang nhanh, dung nạp tăng nhanh"
                },
                middleAge: {
                    multiplier: 1.0,
                    additionalEffects: "liver damage accumulates, cardiovascular effects prominent",
                    vietnameseNote: "Tổn thương gan tích lũy, ảnh hưởng tim mạch rõ rệt"
                },
                senior: {
                    multiplier: 0.9,
                    additionalEffects: "interacts with medications, falls and injuries more likely",
                    vietnameseNote: "Tương tác với thuốc điều trị, dễ ngã và chấn thương"
                }
            },
            'smoking-effects': {
                youth: {
                    multiplier: 1.3,
                    additionalEffects: "lung development impaired, addiction forms faster",
                    vietnameseNote: "Phát triển phổi bị suy giảm, nghiện nhanh hơn"
                },
                youngAdult: {
                    multiplier: 1.1,
                    additionalEffects: "peak lung capacity reduced, skin aging accelerated",
                    vietnameseNote: "Dung tích phổi đỉnh giảm, lão hóa da tăng tốc"
                },
                middleAge: {
                    multiplier: 1.0,
                    additionalEffects: "cancer risk increases exponentially, COPD develops",
                    vietnameseNote: "Nguy cơ ung thư tăng theo cấp số nhân, phát triển COPD"
                },
                senior: {
                    multiplier: 0.9,
                    additionalEffects: "respiratory diseases worsen, quality of life severely impacted",
                    vietnameseNote: "Bệnh hô hấp trầm trọng hơn, chất lượng cuộc sống giảm nghiêm trọng"
                }
            }
        };
        
        let ageGroup;
        if (userAge < 25) ageGroup = 'youth';
        else if (userAge < 35) ageGroup = 'youngAdult';
        else if (userAge < 50) ageGroup = 'middleAge';
        else ageGroup = 'senior';
        
        const impact = impacts[effectType][ageGroup];
        const adjustedYears = Math.round(years * impact.multiplier);
        
        return {
            originalYears: years,
            adjustedYears: Math.min(adjustedYears, 20),
            ageGroup: ageGroup,
            multiplier: impact.multiplier,
            additionalEffects: impact.additionalEffects,
            vietnameseNote: impact.vietnameseNote,
            detailedDescription: this.getDetailedAgeDescription(effectType, years, userAge)
        };
    }

    /**
     * Lấy mô tả chi tiết về tác động theo tuổi
     * @param {string} effectType - Loại hiệu ứng
     * @param {number} years - Số năm sử dụng
     * @param {number} userAge - Tuổi người dùng
     * @returns {string} Mô tả chi tiết
     */
    getDetailedAgeDescription(effectType, years, userAge) {
        const currentAge = userAge + years;
        let description = "";
        
        switch (effectType) {
            case 'drug-effects':
                if (userAge < 20) {
                    description = `Ở tuổi ${userAge}, cơ thể đang trong giai đoạn phát triển. Sau ${years} năm sử dụng ma túy, khi ${currentAge} tuổi, não bộ sẽ bị tổn thương không thể phục hồi, chiều cao ngừng phát triển, và già đi ${years * 2} tuổi.`;
                } else if (userAge < 30) {
                    description = `Từ ${userAge} tuổi, đang ở độ tuổi vàng của cuộc đời. Sau ${years} năm, ở tuổi ${currentAge}, sẽ mất hết sức sống, khuôn mặt già nua như người ${currentAge + years * 1.5} tuổi.`;
                } else {
                    description = `Bắt đầu từ ${userAge} tuổi, sau ${years} năm sử dụng, ở tuổi ${currentAge}, cơ thể sẽ suy kiệt hoàn toàn, trông như người ${currentAge + years} tuổi.`;
                }
                break;
                
            case 'alcohol-effects':
                if (userAge < 25) {
                    description = `Uống rượu từ ${userAge} tuổi, gan non sẽ bị tổn thương nặng. Sau ${years} năm, khi ${currentAge} tuổi, gan sẽ xơ hóa sớm, mặt sưng phù và đỏ bừng thường xuyên.`;
                } else {
                    description = `Từ ${userAge} tuổi uống rượu liên tục ${years} năm, đến ${currentAge} tuổi sẽ mắc các bệnh gan, tim mạch, khuôn mặt biến dạng do phù nề.`;
                }
                break;
                
            case 'smoking-effects':
                const packsPerDay = years > 10 ? 2 : 1;
                const totalCigarettes = years * 365 * packsPerDay * 20;
                description = `Hút thuốc từ ${userAge} tuổi, trung bình ${packsPerDay} gói/ngày. Sau ${years} năm (${totalCigarettes.toLocaleString()} điếu thuốc), ở tuổi ${currentAge}, phổi sẽ đen như than, da nhăn nheo và xám xịt.`;
                break;
                
            // Thêm phân tích cho các tác động khác
            case 'age':
                description = `Bắt đầu từ ${userAge} tuổi, quá trình lão hóa tự nhiên qua ${years} năm sẽ làm xuất hiện nếp nhăn, giảm độ đàn hồi da, và thay đổi kết cấu da.`;
                break;
                
            case 'rejuvenate':
                description = `Ở tuổi ${userAge}, quay ngược thời gian ${years} năm sẽ cho thấy làn da trẻ trung, căng mịn và ít nếp nhăn hơn.`;
                break;
                
            case 'enhance-detail':
                description = `Nâng cao chi tiết giúp tăng cường độ nét, làm rõ đặc điểm khuôn mặt với mức độ ${years}/20.`;
                break;
        }
        
        return description;
    }
    
    /**
     * Lấy thông tin tác động theo tuổi cho UI
     * @param {string} effectType - Loại hiệu ứng
     * @param {number} userAge - Tuổi người dùng
     * @returns {string} Thông tin cho UI
     */
    getAgeImpactInfo(effectType, userAge) {
        if (!userAge) {
            return "Vui lòng nhập tuổi để có thông tin chính xác hơn.";
        }
        
        let info = "";
        
        // Thông tin chung về tác động theo độ tuổi
        if (userAge < 18) {
            info = `Ở tuổi ${userAge}, bạn đang trong giai đoạn phát triển. Các chất gây nghiện sẽ có tác động mạnh hơn 50% và gây hại vĩnh viễn cho não bộ đang phát triển.`;
        } else if (userAge < 25) {
            info = `Ở tuổi ${userAge}, não bộ vẫn đang phát triển. Các chất gây nghiện sẽ có tác động mạnh hơn 30% và gây hại lâu dài.`;
        } else if (userAge < 35) {
            info = `Ở tuổi ${userAge}, cơ thể đang ở giai đoạn khỏe mạnh nhất. Các chất gây nghiện sẽ làm suy giảm nhanh chóng thể trạng đỉnh cao này.`;
        } else if (userAge < 45) {
            info = `Ở tuổi ${userAge}, cơ thể bắt đầu có dấu hiệu lão hóa tự nhiên. Các chất gây nghiện sẽ đẩy nhanh quá trình này.`;
        } else if (userAge < 55) {
            info = `Ở tuổi ${userAge}, cơ thể đã bắt đầu lão hóa. Các chất gây nghiện kết hợp với lão hóa tự nhiên sẽ tạo ra tác động kép nguy hiểm.`;
        } else {
            info = `Ở tuổi ${userAge}, cơ thể đã lão hóa đáng kể. Các chất gây nghiện sẽ tương tác với các bệnh lý tuổi già, gây nguy hiểm nghiêm trọng.`;
        }
        
        // Thông tin bổ sung theo từng loại chất
        switch (effectType) {
            case 'drug-effects':
                if (userAge < 25) {
                    info += " Ma túy sẽ gây hại nghiêm trọng cho não bộ đang phát triển, ảnh hưởng đến trí nhớ và khả năng học tập.";
                } else {
                    info += " Ma túy sẽ làm tăng nguy cơ đột quỵ, bệnh tim và suy giảm nhận thức.";
                }
                break;
                
            case 'alcohol-effects':
                if (userAge < 25) {
                    info += " Rượu bia sẽ tổn thương gan non, gây hại não bộ và ảnh hưởng đến sự phát triển.";
                } else if (userAge > 50) {
                    info += " Rượu bia sẽ tương tác nguy hiểm với thuốc điều trị bệnh và làm trầm trọng các bệnh mãn tính.";
                } else {
                    info += " Rượu bia tích lũy trong cơ thể, gây tổn thương gan, tim mạch và não bộ.";
                }
                break;
                
            case 'smoking-effects':
                if (userAge < 25) {
                    info += " Thuốc lá làm suy giảm sự phát triển của phổi, gây nghiện nhanh hơn và ảnh hưởng đến sức khỏe sinh sản.";
                } else {
                    info += " Thuốc lá làm tăng đáng kể nguy cơ ung thư phổi, COPD và các bệnh tim mạch.";
                }
                break;
        }
        
        return info;
    }
}
