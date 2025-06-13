/**
 * Detective Game - Trò chơi Nhà Điều Tra Tệ Nạn
 * File JS chính để quản lý trò chơi
 */

class DetectiveGame {
    constructor() {
        // Trạng thái của trò chơi
        this.gameState = {
            currentScreen: 'main', // 'main', 'case-selection', 'gameplay', 'case-result'
            currentMode: null,     // 'story', 'quick', 'challenge'
            currentCase: null,     // Vụ án hiện tại
            currentStep: 0,        // Bước hiện tại trong vụ án
            evidenceCollected: [], // Bằng chứng đã thu thập
            score: 0,              // Điểm số
            correctChoices: 0,     // Số lựa chọn đúng
            wrongChoices: 0,       // Số lựa chọn sai
            timeSpent: 0,          // Thời gian đã sử dụng
            isLoggedIn: false,     // Người dùng đã đăng nhập chưa
            userData: null,        // Dữ liệu người dùng
            completedCases: [],    // Các vụ án đã hoàn thành
            achievements: [],       // Thành tựu đạt được
            timeLimit: 0,          // Giới hạn thời gian cho vụ án
            interactedCharacters: [], // Danh sách nhân vật đã tương tác
            stepHistory: []        // Lịch sử các bước đã chơi để có thể quay lại
        };

        // Tham chiếu đến UI
        this.ui = null;

        // Tham chiếu đến dữ liệu vụ án
        this.cases = null;

        // Timer cho chế độ tính giờ
        this.timer = null;
        
        // Tham chiếu đến hệ thống hướng dẫn
        this.tutorial = null;
    }

    /**
     * Khởi tạo trò chơi
     */
    async initialize() {
        try {
            console.log('Đang khởi tạo trò chơi...');
            
            // Hiển thị màn hình loading
            this.showLoading('Đang tải dữ liệu trò chơi...');

            // Kết nối với UI
            this.ui = new DetectiveUI(this);
            this.ui.initialize();
            
            // Ẩn debug dialog
            const debugDialog = document.getElementById('dialog-debug');
            if (debugDialog) {
                debugDialog.style.display = 'none';
            }
            
            // Khởi tạo hệ thống hướng dẫn
            this.tutorial = new DetectiveTutorial(this);
            this.tutorial.initialize();

            // Tải dữ liệu vụ án
            try {
                console.log('Khởi tạo DetectiveCases và tải dữ liệu...');
                this.cases = new DetectiveCases();
                const loadResult = await this.cases.loadCases();
                
                if (!loadResult) {
                    console.warn('Có vấn đề khi tải dữ liệu vụ án, nhưng vẫn tiếp tục...');
                } else {
                    console.log('Tải dữ liệu vụ án thành công!');
                }
                
                // Kiểm tra phương thức getCaseById
                if (typeof this.cases.getCaseById !== 'function') {
                    console.warn('Phương thức getCaseById không tồn tại. Kiểm tra cập nhật của detective_cases.js');
                }
                
                // Kiểm tra phương thức loadLocalCaseDetails
                if (typeof this.cases.loadLocalCaseDetails !== 'function') {
                    console.error('Phương thức loadLocalCaseDetails không tồn tại. Ứng dụng có thể không hoạt động đúng.');
                }
            } catch (caseError) {
                console.error('Lỗi khi tải dữ liệu vụ án:', caseError);
                throw new Error('Không thể tải dữ liệu vụ án: ' + caseError.message);
            }

            // Kiểm tra người dùng đăng nhập
            await this.checkUserLogin();

            // Tải các vụ án đã hoàn thành và thành tựu
            if (this.gameState.isLoggedIn) {
                await this.loadUserProgress();
            }

            // Xóa thông tin gỡ lỗi khỏi localStorage
            localStorage.removeItem('debugInfo');

            // Thay đổi: Hiển thị màn hình lựa chọn vụ án thay vì màn hình chính
            this.switchToScreen('case-selection', { mode: 'story' });
            
            // Ẩn màn hình loading
            this.hideLoading();

            console.log('Khởi tạo trò chơi hoàn tất!');
        } catch (error) {
            console.error('Lỗi khởi tạo trò chơi:', error);
            this.hideLoading();
            
            // Hiển thị thông báo lỗi chi tiết hơn
            let errorMessage = 'Vui lòng tải lại trang và thử lại.';
            if (error.message) {
                errorMessage = `${error.message}. ${errorMessage}`;
            }
            
            this.ui.showError('Không thể tải trò chơi', errorMessage);
        }
    }

    /**
     * Kiểm tra người dùng đăng nhập
     */
    async checkUserLogin() {
        try {
            // Kiểm tra cookie hoặc localStorage để xem người dùng đã đăng nhập chưa
            const userToken = localStorage.getItem('userToken');
            if (userToken) {
                // Gọi API để kiểm tra token
                const response = await this.callAPI('check-token', { token: userToken });
                if (response && response.success) {
                    this.gameState.isLoggedIn = true;
                    this.gameState.userData = response.userData;
                    console.log('Người dùng đã đăng nhập:', this.gameState.userData.username);
                }
            }
        } catch (error) {
            console.error('Lỗi kiểm tra đăng nhập:', error);
            // Xóa token không hợp lệ
            localStorage.removeItem('userToken');
            this.gameState.isLoggedIn = false;
        }
    }

    /**
     * Tải tiến trình của người dùng
     */
    async loadUserProgress() {
        try {
            if (!this.gameState.isLoggedIn) return;

            const response = await this.callAPI('get-user-progress', {
                userId: this.gameState.userData.id
            });

            if (response && response.success) {
                this.gameState.completedCases = response.completedCases || [];
                this.gameState.achievements = response.achievements || [];
                this.gameState.score = response.score || 0;
            }
        } catch (error) {
            console.error('Lỗi tải tiến trình người dùng:', error);
        }
    }

    /**
     * Gọi API
     * @param {string} endpoint - Endpoint của API
     * @param {object} data - Dữ liệu gửi lên
     * @returns {Promise<object>} Kết quả từ API
     */
    async callAPI(endpoint, data = {}) {
        try {
            // Nếu chạy local thì mô phỏng API
            if (window.location.protocol === 'file:') {
                return await this.mockAPI(endpoint, data);
            }

            const response = await fetch(`../api/${endpoint}.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Lỗi gọi API ${endpoint}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mô phỏng API khi chạy local
     * @param {string} endpoint - Endpoint của API
     * @param {object} data - Dữ liệu gửi lên
     * @returns {Promise<object>} Kết quả mô phỏng
     */
    async mockAPI(endpoint, data) {
        // Mô phỏng độ trễ mạng
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log(`Mock API ${endpoint} with data:`, data);

        switch (endpoint) {
            case 'check-token':
                return {
                    success: true,
                    userData: {
                        id: 1,
                        username: 'NguoiDung',
                        email: 'nguoidung@example.com',
                        rank: 'Tân binh'
                    }
                };

            case 'get-user-progress':
                return {
                    success: true,
                    completedCases: [],
                    achievements: [],
                    score: 0
                };

            case 'save-case-result':
                return {
                    success: true,
                    newScore: data.score,
                    message: 'Đã lưu kết quả vụ án'
                };

            default:
                return {
                    success: false,
                    error: 'API không tồn tại'
                };
        }
    }

    /**
     * Hiển thị màn hình loading
     * @param {string} message - Thông báo loading
     */
    showLoading(message = 'Đang tải...') {
        const loadingOverlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text');
        
        if (loadingText) {
            loadingText.textContent = message;
        }
        
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    }

    /**
     * Ẩn màn hình loading
     */
    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    /**
     * Chuyển đổi màn hình
     * @param {string} screenId - ID của màn hình cần chuyển đến
     * @param {object} params - Các tham số bổ sung
     */
    switchToScreen(screenId, params = {}) {
        // Ẩn tất cả màn hình
        const screens = [
            'main-screen',
            'case-selection-screen',
            'gameplay-screen',
            'case-result-screen'
        ];

        screens.forEach(screen => {
            const element = document.getElementById(screen);
            if (element) {
                element.style.display = 'none';
            }
        });

        // Hiển thị màn hình mới
        const targetScreen = document.getElementById(`${screenId}-screen`);
        if (targetScreen) {
            targetScreen.style.display = 'block';
        }

        // Cập nhật trạng thái
        this.gameState.currentScreen = screenId;

        // Xử lý màn hình cụ thể
        switch (screenId) {
            case 'main':
                this.ui.updateMainScreen();
                break;
                
            case 'case-selection':
                // Luôn đặt chế độ là story
                this.gameState.currentMode = 'story';
                this.ui.showCaseSelection([], 'story', this.gameState.completedCases);
                break;
                
            case 'gameplay':
                this.startCase(params.caseId);
                break;
                
            case 'case-result':
                this.ui.showCaseResult(params.result);
                break;
        }
    }

    /**
     * Bắt đầu vụ án
     * @param {string} caseId - ID của vụ án
     */
    async startCase(caseId) {
        try {
            console.log('Bắt đầu vụ án:', caseId);
            
            // Kiểm tra caseId có hợp lệ không
            if (!caseId) {
                console.error('Lỗi: caseId không được cung cấp');
                this.ui.showNotification('Lỗi', 'Không thể bắt đầu vụ án do thiếu ID vụ án', 'error');
                return;
            }
            
            // Hiển thị màn hình loading
            this.showLoading('Đang tải vụ án...');
            
            // Kiểm tra xem this.cases có tồn tại không
            if (!this.cases) {
                console.log('Khởi tạo đối tượng DetectiveCases');
                this.cases = new DetectiveCases();
                await this.cases.loadCases();
            }
            
            // Đảm bảo danh sách cases đã được tải
            if (!this.cases.loaded) {
                console.log('Tải danh sách vụ án...');
                await this.cases.loadCases();
            }
            
            // Kiểm tra xem caseId có tồn tại trong danh sách không
            const caseExists = this.cases.cases.some(c => c.id === caseId);
            if (!caseExists) {
                console.error(`Vụ án ID: ${caseId} không tồn tại trong danh sách`);
                throw new Error(`Không tìm thấy vụ án với ID: ${caseId}`);
            }
            
            // Lấy dữ liệu vụ án cơ bản để kiểm tra trạng thái khóa
            const caseBasicInfo = this.cases.cases.find(c => c.id === caseId);
            
            // Kiểm tra xem vụ án có bị khóa không
            if (caseBasicInfo && caseBasicInfo.is_locked) {
                const isLocked = await this.cases.isCaseLocked(caseId, this.gameState.completedCases);
                if (isLocked) {
                    this.hideLoading();
                    this.ui.showNotification('Vụ án bị khóa', 'Bạn cần hoàn thành các vụ án khác trước khi chơi vụ án này.', 'warning', 5000);
                    this.switchToScreen('case-selection', { mode: this.gameState.currentMode });
                    return;
                }
            }
            
            // Lấy dữ liệu chi tiết vụ án
            let caseData;
            
            // Sử dụng getCaseById nếu có
            if (typeof this.cases.getCaseById === 'function') {
                console.log('Gọi getCaseById với ID:', caseId);
                caseData = await this.cases.getCaseById(caseId);
            } 
            // Nếu không, sử dụng loadLocalCaseDetails
            else if (typeof this.cases.loadLocalCaseDetails === 'function') {
                console.log('Gọi loadLocalCaseDetails với ID:', caseId);
                caseData = await this.cases.loadLocalCaseDetails(caseId);
            } 
            else {
                throw new Error('Không thể tìm thấy phương thức để tải chi tiết vụ án');
            }
            
            if (!caseData) {
                throw new Error(`Không tìm thấy dữ liệu cho vụ án ID: ${caseId}`);
            }
            
            // Thêm log để debug
            console.log('Dữ liệu vụ án đã tải:', caseData);
            
            // Đặt lại trạng thái trò chơi
            this.resetGame();
            
            // Cập nhật thông tin vụ án
            this.gameState.currentCase = caseData;
            
            // Kiểm tra xem vụ án có bước nào không
            if (!caseData.steps || caseData.steps.length === 0) {
                throw new Error('Vụ án không có bước nào hoặc dữ liệu không hợp lệ');
            }
            
            // Tìm bước bắt đầu
            let startingStep = null;
            
            // Tìm bước đánh dấu là bắt đầu - kiểm tra các cách đánh dấu khác nhau
            startingStep = caseData.steps.find(step => {
                return step && (
                    step.is_starting_step === true || 
                    step.isStartingStep === true ||
                    step.is_starting_step === 1 ||
                    (typeof step.is_starting_step === 'string' && step.is_starting_step.toLowerCase() === 'true')
                );
            });
            
            // Nếu không tìm thấy, dùng bước đầu tiên
            if (!startingStep && caseData.steps.length > 0) {
                console.log('Không tìm thấy bước bắt đầu, sử dụng bước đầu tiên');
                startingStep = caseData.steps[0];
            }
            
            if (!startingStep) {
                throw new Error('Không thể tìm thấy bước bắt đầu cho vụ án');
            }
            
            // Kiểm tra xem startingStep có đủ thông tin không
            if (!startingStep.id) {
                console.error('Bước bắt đầu thiếu ID:', startingStep);
                throw new Error('Dữ liệu bước bắt đầu không hợp lệ: thiếu ID');
            }
            
            // Cập nhật bước hiện tại
            this.gameState.currentStep = startingStep.id;
            console.log('Bắt đầu với bước:', startingStep);
            
            // Thiết lập bằng chứng mặc định (nếu có)
            if (caseData.evidence && Array.isArray(caseData.evidence)) {
                const defaultEvidence = caseData.evidence
                    .filter(e => e && (e.collectedByDefault || e.collected_by_default))
                    .map(e => e.id);
                    
                if (defaultEvidence.length > 0) {
                    this.gameState.evidenceCollected = [...defaultEvidence];
                }
            }
            
            // Xóa lịch sử bước chơi
            if (this.tutorial) {
                this.tutorial.clearStepHistory();
            }
            
            // Chuyển đến màn hình chơi game
            this.switchToScreen('gameplay');
            
            // Hiển thị bước đầu tiên
            this.ui.renderStep(startingStep);
            
            // Lưu bước đầu tiên vào lịch sử
            if (this.tutorial) {
                this.tutorial.saveCurrentStep(startingStep);
            }
            
            // Bắt đầu timer nếu vụ án có giới hạn thời gian
            if (caseData.timed && caseData.timeLimit > 0) {
                this.gameState.timeLimit = caseData.timeLimit;
                this.startTimer();
            }
            
            // Hiển thị hướng dẫn tự động nếu cần
            if (this.tutorial) {
                setTimeout(() => {
                    this.tutorial.showAutoTutorial(caseId);
                }, 1000);
            }
            
            // Ẩn màn hình loading
            this.hideLoading();
            
            console.log('Vụ án đã được tải thành công:', caseData.title);
        } catch (error) {
            console.error('Lỗi bắt đầu vụ án:', error);
            this.hideLoading();
            
            // Hiển thị thông tin chi tiết hơn về lỗi
            const errorMessage = `${error.message || 'Lỗi không xác định'}. Vui lòng làm mới trang và thử lại.`;
            this.ui.showError('Không thể bắt đầu vụ án', errorMessage);
            
            // Quay lại màn hình chọn vụ án
            this.switchToScreen('case-selection', { mode: this.gameState.currentMode || 'story' });
        }
    }

    /**
     * Bắt đầu bộ đếm thời gian
     */
    startTimer() {
        // Xóa timer cũ nếu có
        if (this.timer) {
            clearInterval(this.timer);
        }

        const startTime = Date.now();
        
        this.timer = setInterval(() => {
            const currentTime = Date.now();
            this.gameState.timeSpent = Math.floor((currentTime - startTime) / 1000);
            
            // Cập nhật hiển thị thời gian nếu cần
            this.ui.updateTimer(this.gameState.timeSpent);
            
            // Kiểm tra hết giờ nếu là chế độ có giới hạn thời gian
            if (this.gameState.currentCase.timeLimit && 
                this.gameState.timeSpent >= this.gameState.currentCase.timeLimit) {
                this.endCase('timeout');
            }
        }, 1000);
    }

    /**
     * Dừng bộ đếm thời gian
     */
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * Xử lý hành động
     * @param {string} actionType - Loại hành động
     * @param {object} actionData - Dữ liệu hành động
     */
    handleAction(actionType, actionData = {}) {
        console.log('Xử lý hành động:', actionType, actionData);
        
        switch (actionType) {
            case 'select-mode':
                // Luôn chọn chế độ story vì chỉ còn lại một chế độ
                this.gameState.currentMode = 'story';
                this.switchToScreen('case-selection', { mode: 'story' });
                break;
                
            case 'select-case':
                // Chọn vụ án
                if (!actionData.caseId) return;
                
                this.startCase(actionData.caseId);
                break;
                
            case 'back-to-main':
                // Chuyển hướng sang bản đồ thay vì màn hình chính
                this.switchToScreen('case-selection', { mode: 'story' });
                break;
                
            case 'back-to-cases':
                // Quay lại màn hình lựa chọn vụ án
                this.switchToScreen('case-selection', { mode: 'story' });
                break;
                
            case 'previous-step':
                // Quay lại bước trước đó
                this.goToPreviousStep();
                break;
                
            case 'show-tutorial':
                // Hiển thị hướng dẫn
                if (this.tutorial) {
                    this.tutorial.showTutorial(actionData.type || 'general');
                }
                break;
                
            case 'collect-evidence':
                // Thu thập bằng chứng
                if (!actionData.targetId) return;
                
                this.collectEvidence(actionData.targetId);
                break;
                
            case 'examine-location':
                // Khám xét địa điểm
                if (!actionData.targetId) return;
                
                this.examineLocation(actionData.targetId);
                break;
                
            case 'talk-to-character':
                // Nói chuyện với nhân vật
                if (!actionData.targetId) return;
                
                this.talkToCharacter(actionData.targetId);
                break;
                
            default:
                console.warn('Hành động không được hỗ trợ:', actionType);
        }
    }

    /**
     * Xử lý lựa chọn
     * @param {string} choiceId - ID của lựa chọn
     */
    async processChoice(choiceId) {
        if (!choiceId) {
            console.error('Lỗi: ID lựa chọn không được cung cấp');
            return;
        }
        
        const caseData = this.gameState.currentCase;
        if (!caseData) {
            console.error('Lỗi: Không có vụ án hiện tại');
            return;
        }
        
        console.log('Xử lý lựa chọn ID:', choiceId);
        
        // Tìm lựa chọn trong các bước
        let selectedChoice = null;
        let choiceType = null;
        
        // Kiểm tra trong bước cuối
        if (caseData.finalStep && caseData.finalStep.choices) {
            selectedChoice = caseData.finalStep.choices.find(c => c.id === choiceId);
            if (selectedChoice) choiceType = 'final';
        }
        
        // Kiểm tra trong đối thoại của nhân vật
        if (!selectedChoice && caseData.characters) {
            for (const character of caseData.characters) {
                // Kiểm tra dialogOptions
                if (character.dialogOptions) {
                    selectedChoice = character.dialogOptions.find(option => option.id === choiceId);
                    if (selectedChoice) {
                        choiceType = 'dialog';
                        break;
                    }
                }
                
                // Kiểm tra dialog_options (một số data có thể dùng _)
                if (!selectedChoice && character.dialog_options) {
                    selectedChoice = character.dialog_options.find(option => option.id === choiceId);
                    if (selectedChoice) {
                        choiceType = 'dialog';
                        break;
                    }
                }
            }
        }
        
        // Kiểm tra trong hộp thoại hiện tại
        if (!selectedChoice && this.gameState.currentStep) {
            const currentStep = caseData.steps.find(s => s.id === this.gameState.currentStep);
            if (currentStep && currentStep.dialog && currentStep.dialog.options) {
                selectedChoice = currentStep.dialog.options.find(option => option.id === choiceId);
                if (selectedChoice) choiceType = 'step-dialog';
            }
        }
        
        if (!selectedChoice) {
            console.warn('Không tìm thấy lựa chọn:', choiceId);
            this.ui.showNotification('Lỗi', 'Không thể xử lý lựa chọn này. Vui lòng thử lại.', 'error');
            return;
        }
        
        console.log('Đã chọn:', selectedChoice, 'Loại:', choiceType);
        
        // Cập nhật điểm
        if (selectedChoice.points) {
            this.gameState.score += selectedChoice.points;
            
            // Cập nhật số lựa chọn đúng/sai
            if (selectedChoice.correct) {
                this.gameState.correctChoices++;
            } else {
                this.gameState.wrongChoices++;
            }
            
            // Cập nhật thông tin người dùng
            this.ui.updateUserInfo();
        }
        
        // Xử lý nội dung phản hồi cho đối thoại
        if (choiceType === 'dialog' && selectedChoice.response) {
            // Lấy ID nhân vật từ thuộc tính character_id của lựa chọn
            const characterId = selectedChoice.character_id;
            
            if (!characterId) {
                console.error('Lỗi: ID nhân vật không tìm thấy cho lựa chọn:', selectedChoice);
                return;
            }
            
            const character = caseData.characters.find(c => c.id === characterId);
            
            if (character) {
                // Cập nhật hộp thoại với phản hồi
                const dialog = {
                    character: character,
                    text: selectedChoice.response,
                    options: [] // Xóa các lựa chọn sau khi chọn
                };
                
                this.ui.renderDialog(dialog);
                
                // Mở khóa địa điểm nếu có
                if (selectedChoice.unlocksLocation || selectedChoice.unlocks_location) {
                    const locationId = selectedChoice.unlocksLocation || selectedChoice.unlocks_location;
                    const location = caseData.locations.find(loc => loc.id === locationId);
                    if (location) {
                        location.locked = false;
                        this.ui.showNotification('Đã mở khóa địa điểm mới', `Bạn có thể khám phá ${location.name} ngay bây giờ.`);
                    }
                }
                
                // Xử lý danh sách mở khóa nếu có
                if (selectedChoice.unlocks && Array.isArray(selectedChoice.unlocks)) {
                    selectedChoice.unlocks.forEach(unlock => {
                        if (unlock.unlock_type === 'location' && unlock.unlocked_id) {
                            const location = caseData.locations.find(loc => loc.id === unlock.unlocked_id);
                            if (location) {
                                location.locked = false;
                                this.ui.showNotification('Đã mở khóa địa điểm mới', `Bạn có thể khám phá ${location.name} ngay bây giờ.`);
                            }
                        } else if (unlock.unlock_type === 'evidence' && unlock.unlocked_id) {
                            if (!this.gameState.evidenceCollected.includes(unlock.unlocked_id)) {
                                this.gameState.evidenceCollected.push(unlock.unlocked_id);
                                this.ui.updateEvidence();
                                this.ui.showNotification('Đã thu thập bằng chứng mới', 'Kiểm tra danh sách bằng chứng để xem chi tiết.');
                            }
                        }
                    });
                }
                
                // Mở khóa bằng chứng nếu có
                if (selectedChoice.unlocksEvidence && selectedChoice.unlocksEvidence.length > 0) {
                    selectedChoice.unlocksEvidence.forEach(evidenceId => {
                        if (!this.gameState.evidenceCollected.includes(evidenceId)) {
                            this.gameState.evidenceCollected.push(evidenceId);
                        }
                    });
                    
                    this.ui.updateEvidence();
                    this.ui.showNotification('Đã thu thập bằng chứng mới', 'Kiểm tra danh sách bằng chứng để xem chi tiết.');
                }
                
                // Mở khóa nhân vật nếu có
                if (selectedChoice.unlocksCharacter && selectedChoice.unlocksCharacter.length > 0) {
                    selectedChoice.unlocksCharacter.forEach(charId => {
                        const unlockedChar = caseData.characters.find(c => c.id === charId);
                        if (unlockedChar) {
                            unlockedChar.locked = false;
                            this.ui.showNotification('Đã mở khóa nhân vật mới', `Bạn có thể nói chuyện với ${unlockedChar.name}.`);
                        }
                    });
                }
                
                // Thêm ID nhân vật vào danh sách đã tương tác nếu chưa có
                if (character && !this.gameState.interactedCharacters.includes(character.id)) {
                    this.gameState.interactedCharacters.push(character.id);
                }
            } else {
                console.warn('Không tìm thấy nhân vật cho ID:', characterId);
            }
        }
        
        // Xử lý lựa chọn cuối cùng
        if (choiceType === 'final' && selectedChoice.finalSolution) {
            // Kết thúc vụ án
            const result = {
                success: selectedChoice.correct,
                score: selectedChoice.points,
                outcome: selectedChoice.outcome || '',
                nextCase: selectedChoice.nextCase || null
            };
            
            await this.endCase(result);
            return;
        }
        
        // Kiểm tra điều kiện để chuyển đến bước tiếp theo
        await this.checkForNextStep();
    }
    
    /**
     * Kiểm tra và chuyển đến bước tiếp theo nếu đủ điều kiện
     */
    async checkForNextStep() {
        const caseData = this.gameState.currentCase;
        const currentStepId = this.gameState.currentStep;
        
        if (!caseData || !currentStepId) return;
        
        // Lấy bước tiếp theo
        const nextStep = await this.cases.getNextStep(
            caseData.id, 
            currentStepId, 
            this.gameState.evidenceCollected,
            this.gameState.interactedCharacters
        );
        
        if (nextStep) {
            // Lưu bước hiện tại vào lịch sử
            this.gameState.stepHistory.push({
                stepId: currentStepId,
                evidenceCollected: [...this.gameState.evidenceCollected],
                interactedCharacters: [...this.gameState.interactedCharacters]
            });
            
            // Nếu là bước cuối
            if (nextStep.isFinalStep) {
                // Hiển thị lựa chọn cuối cùng
                this.ui.renderStep(nextStep);
                return;
            }
            
            // Cập nhật bước hiện tại
            this.gameState.currentStep = nextStep.id;
            
            // Hiển thị bước tiếp theo
            this.ui.renderStep(nextStep);
            
            // Hiển thị hướng dẫn nếu có
            if (this.tutorial) {
                this.tutorial.showStepGuidance(nextStep.id);
            }
        }
    }

    /**
     * Quay lại bước trước đó
     * @returns {boolean} - true nếu quay lại thành công, false nếu không có bước trước đó
     */
    goToPreviousStep() {
        // Kiểm tra xem có bước nào trong lịch sử không
        if (this.gameState.stepHistory.length === 0) {
            this.ui.showNotification('Không thể quay lại', 'Bạn đang ở bước đầu tiên của vụ án này.', 'info');
            return false;
        }
        
        // Lấy bước cuối cùng từ lịch sử
        const previousState = this.gameState.stepHistory.pop();
        
        // Khôi phục trạng thái trước đó
        this.gameState.currentStep = previousState.stepId;
        this.gameState.evidenceCollected = [...previousState.evidenceCollected];
        this.gameState.interactedCharacters = [...previousState.interactedCharacters];
        
        // Tìm bước trước đó và hiển thị
        const previousStep = this.gameState.currentCase.steps.find(step => step.id === previousState.stepId);
        
        if (previousStep) {
            // Hiển thị bước trước đó
            this.ui.renderStep(previousStep);
            
            // Cập nhật UI
            this.ui.updateEvidence();
            
            // Thông báo cho người dùng
            this.ui.showNotification('Đã quay lại bước trước', 'Bạn đã quay lại bước trước đó trong vụ án.', 'info');
            
            return true;
        }
        
        return false;
    }

    /**
     * Thu thập bằng chứng
     * @param {string} evidenceId - ID của bằng chứng
     */
    collectEvidence(evidenceId) {
        const caseData = this.gameState.currentCase;
        
        if (!caseData || !caseData.evidence) return;
        
        // Tìm bằng chứng
        const evidence = caseData.evidence.find(e => e.id === evidenceId);
        
        if (!evidence) {
            console.warn('Không tìm thấy bằng chứng:', evidenceId);
            return;
        }
        
        // Kiểm tra xem đã thu thập chưa
        if (this.gameState.evidenceCollected.includes(evidenceId)) {
            this.ui.showNotification('Lưu ý', 'Bạn đã thu thập bằng chứng này rồi.');
            return;
        }
        
        // Thêm vào danh sách bằng chứng đã thu thập
        this.gameState.evidenceCollected.push(evidenceId);
        
        // Cập nhật điểm số
        if (evidence.points) {
            this.gameState.score += evidence.points;
            this.ui.updateUserInfo();
        }
        
        // Cập nhật UI bằng chứng
        this.ui.updateEvidence();
        
        // Hiển thị thông báo
        this.ui.showNotification('Đã thu thập bằng chứng', `Bạn đã thu thập: ${evidence.name}`);
        
        // Hiển thị chi tiết bằng chứng
        this.ui.showEvidenceDetails(evidence);
        
        // Kiểm tra điều kiện để chuyển đến bước tiếp theo
        this.checkForNextStep();
    }

    /**
     * Khám xét địa điểm
     * @param {string} locationId - ID của địa điểm
     */
    examineLocation(locationId) {
        const caseData = this.gameState.currentCase;
        
        if (!caseData || !caseData.locations) return;
        
        // Tìm địa điểm
        const location = caseData.locations.find(loc => loc.id === locationId);
        
        if (!location) {
            console.warn('Không tìm thấy địa điểm:', locationId);
            return;
        }
        
        // Kiểm tra xem địa điểm có bị khóa không
        if (this.cases.isLocationLocked(location, this.gameState.evidenceCollected)) {
            this.ui.showNotification('Địa điểm bị khóa', 'Bạn cần thu thập thêm bằng chứng để mở khóa địa điểm này.');
            return;
        }
        
        // Hiển thị địa điểm
        this.ui.showLocation(location);
        
        // Hiển thị các hành động có thể thực hiện
        if (location.actions && location.actions.length > 0) {
            this.ui.renderActionButtons(location.actions);
        } else {
            this.ui.renderActionButtons([]);
        }
        
        // Cập nhật bước hiện tại nếu cần
        if (location.step) {
            this.gameState.currentStep = location.step;
        }
    }

    /**
     * Nói chuyện với nhân vật
     * @param {string} characterId - ID của nhân vật
     */
    talkToCharacter(characterId) {
        const caseData = this.gameState.currentCase;
        
        if (!caseData || !caseData.characters) return;
        
        // Tìm nhân vật
        const character = caseData.characters.find(c => c.id === characterId);
        
        if (!character) {
            console.warn('Không tìm thấy nhân vật:', characterId);
            return;
        }
        
        // Kiểm tra xem nhân vật có bị khóa không
        if (this.cases.isCharacterLocked(character, this.gameState.evidenceCollected, this.gameState.interactedCharacters)) {
            this.ui.showNotification('Nhân vật bị khóa', 'Bạn cần thu thập thêm bằng chứng hoặc thông tin để nói chuyện với nhân vật này.');
            return;
        }
        
        // Hiển thị hộp thoại với nhân vật
        this.ui.showDialog(character);
        
        // Thêm ID nhân vật vào danh sách đã tương tác nếu chưa có
        if (!this.gameState.interactedCharacters.includes(characterId)) {
            this.gameState.interactedCharacters.push(characterId);
        }
    }

    /**
     * Làm mới màn hình lựa chọn vụ án
     * Được gọi sau khi mở khóa vụ án để cập nhật giao diện
     */
    async refreshCaseSelection() {
        try {
            console.log('Làm mới danh sách vụ án sau khi mở khóa...');
            
            // Kiểm tra xem hiện tại có đang ở màn hình lựa chọn vụ án không
            if (this.gameState.currentScreen === 'case-selection') {
                // Nếu đang ở màn hình lựa chọn vụ án, hiển thị lại danh sách
                const mode = this.gameState.currentMode;
                if (mode) {
                    // Lấy lại danh sách vụ án theo chế độ
                    const cases = await this.cases.getCasesByMode(mode);
                    
                    // Hiển thị lại danh sách
                    this.ui.showCaseSelection(cases, mode, this.gameState.completedCases);
                    
                    console.log('Đã làm mới danh sách vụ án!');
                }
            } else {
                console.log('Không phải đang ở màn hình lựa chọn vụ án. Các vụ án đã được mở khóa và sẽ hiển thị khi bạn vào màn hình lựa chọn.');
            }
        } catch (error) {
            console.error('Lỗi khi làm mới danh sách vụ án:', error);
        }
    }

    /**
     * Kết thúc vụ án
     * @param {object} result - Kết quả của vụ án
     */
    async endCase(result) {
        console.log('Kết thúc vụ án:', result);
        
        const caseData = this.gameState.currentCase;
        
        if (!caseData) return;
        
        // Dừng timer nếu đang chạy
        if (this.timer) {
            this.stopTimer();
        }
        
        // Tính điểm tổng cộng
        let totalScore = this.gameState.score;
        
        // Cộng thêm điểm thưởng nếu thành công
        if (result.success) {
            totalScore += 50;
        }
        
        // Thêm vào danh sách vụ án đã hoàn thành nếu chưa có
        if (!this.gameState.completedCases.includes(caseData.id)) {
            this.gameState.completedCases.push(caseData.id);
        }
        
        // Lưu kết quả nếu đã đăng nhập
        if (this.gameState.isLoggedIn) {
            await this.saveResult({
                caseId: caseData.id,
                success: result.success,
                score: totalScore,
                evidenceCollected: this.gameState.evidenceCollected.length,
                correctChoices: this.gameState.correctChoices,
                wrongChoices: this.gameState.wrongChoices,
                timeSpent: this.gameState.timeSpent
            });
        }
        
        // Chuyển đến màn hình kết quả
        this.switchToScreen('case-result', {
            caseData,
            result: {
                ...result,
                totalScore,
                evidenceCollected: this.gameState.evidenceCollected.length,
                totalEvidence: caseData.evidence ? caseData.evidence.length : 0,
                correctChoices: this.gameState.correctChoices,
                wrongChoices: this.gameState.wrongChoices,
                timeSpent: this.gameState.timeSpent
            }
        });
    }

    /**
     * Lưu kết quả vụ án
     * @param {object} result - Kết quả vụ án
     */
    async saveResult(result) {
        try {
            if (!this.gameState.isLoggedIn) return;
            
            const response = await this.callAPI('save-case-result', {
                userId: this.gameState.userData.id,
                caseId: result.caseId,
                result: result.result,
                score: result.score,
                correctChoices: result.correctChoices,
                wrongChoices: result.wrongChoices,
                evidenceCollected: result.evidenceCollected,
                totalEvidence: result.totalEvidence,
                timeSpent: result.timeSpent
            });
            
            if (response && response.success) {
                // Cập nhật điểm số
                this.gameState.score = response.newScore || this.gameState.score;
                
                // Kiểm tra nếu vụ án chưa hoàn thành trước đó
                if (!this.gameState.completedCases.includes(result.caseId)) {
                    this.gameState.completedCases.push(result.caseId);
                }
                
                // Cập nhật UI
                this.ui.updateUserInfo();
            }
        } catch (error) {
            console.error('Lỗi lưu kết quả vụ án:', error);
        }
    }

    /**
     * Đặt lại trạng thái trò chơi
     */
    resetGame() {
        this.gameState.currentCase = null;
        this.gameState.currentStep = null;
        this.gameState.evidenceCollected = [];
        this.gameState.interactedCharacters = [];
        this.gameState.correctChoices = 0;
        this.gameState.wrongChoices = 0;
        this.gameState.timeSpent = 0;
        this.gameState.timeLimit = 0;
        this.gameState.stepHistory = []; // Đặt lại lịch sử bước
        
        // Dừng timer nếu đang chạy
        if (this.timer) {
            this.stopTimer();
        }
    }
}

// Khởi tạo trò chơi khi trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    window.detectiveGame = new DetectiveGame();
    window.detectiveGame.initialize();
}); 