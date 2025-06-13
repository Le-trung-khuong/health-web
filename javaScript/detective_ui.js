/**
 * Detective UI - Quản lý giao diện người dùng cho trò chơi
 */

class DetectiveUI {
    constructor(game) {
        // Tham chiếu đến game
        this.game = game;
        
        // Lưu trữ các phần tử DOM
        this.elements = {};
    }

    /**
     * Khởi tạo UI
     */
    initialize() {
        console.log('Khởi tạo giao diện người dùng...');
        
        // Lấy tham chiếu đến các phần tử DOM
        this.cacheElements();
        
        // Thiết lập sự kiện
        this.setupEventListeners();
        
        // Cập nhật thông tin người dùng
        this.updateUserInfo();
        
        console.log('Khởi tạo giao diện người dùng hoàn tất!');
    }

    /**
     * Lưu trữ các phần tử DOM
     */
    cacheElements() {
        // Khởi tạo object elements nếu chưa có
        if (!this.elements) {
            this.elements = {};
        }
        
        // Màn hình chính
        this.elements.mainScreen = document.getElementById('main-screen');
        
        // Màn hình lựa chọn vụ án
        this.elements.caseSelectionScreen = document.getElementById('case-selection-screen');
        this.elements.caseSelectionTitle = document.getElementById('case-selection-title');
        this.elements.casesGrid = document.getElementById('cases-grid');
        
        // Màn hình chơi game
        this.elements.gameplayScreen = document.getElementById('gameplay-screen');
        this.elements.caseTitle = document.getElementById('case-title');
        this.elements.caseDifficulty = document.getElementById('case-difficulty');
        this.elements.caseType = document.getElementById('case-type');
        this.elements.caseNarrative = document.getElementById('case-narrative');
        this.elements.evidenceList = document.getElementById('evidence-list');
        this.elements.actionButtons = document.getElementById('action-buttons');
        
        // Phần tử hộp thoại
        this.elements.gameDialog = document.getElementById('game-dialog');
        this.elements.dialogContent = document.getElementById('dialog-content');
        this.elements.dialogOptions = document.getElementById('dialog-options');
        
        // Kiểm tra xem các phần tử hộp thoại có tồn tại không
        if (!this.elements.gameDialog || !this.elements.dialogContent || !this.elements.dialogOptions) {
            console.warn('Không thể tìm thấy các phần tử hộp thoại. Vui lòng kiểm tra HTML.');
        } else {
            console.log('Đã tìm thấy các phần tử hộp thoại:', 
                        this.elements.gameDialog, 
                        this.elements.dialogContent, 
                        this.elements.dialogOptions);
        }
        
        // Màn hình kết quả
        this.elements.caseResultScreen = document.getElementById('case-result-screen');
        this.elements.resultHeader = document.getElementById('result-header');
        this.elements.resultContent = document.getElementById('result-content');
        this.elements.resultStats = document.getElementById('result-stats');
        this.elements.educationalTips = document.getElementById('educational-tips');
        
        // Thông tin người dùng
        this.elements.username = document.getElementById('username');
        this.elements.userScore = document.getElementById('user-score');
        this.elements.userRank = document.getElementById('user-rank');
        
        // Nút điều hướng
        this.elements.replayCase = document.getElementById('replay-case');
        this.elements.nextCase = document.getElementById('next-case');
        this.elements.backToCases = document.getElementById('back-to-cases');
    }

    /**
     * Thiết lập sự kiện
     */
    setupEventListeners() {
        // Sự kiện cho các nút chế độ chơi
        const modeBtns = document.querySelectorAll('.btn-play');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                this.game.handleAction('select-mode', { mode });
            });
        });
        
        // Sự kiện cho các nút trong màn hình kết quả
        if (this.elements.replayCase) {
            this.elements.replayCase.addEventListener('click', () => {
                const currentCaseId = this.game.gameState.currentCase.id;
                this.game.handleAction('select-case', { caseId: currentCaseId });
            });
        }
        
        if (this.elements.nextCase) {
            this.elements.nextCase.addEventListener('click', () => {
                this.game.handleAction('back-to-cases');
            });
        }
        
        if (this.elements.backToCases) {
            this.elements.backToCases.addEventListener('click', () => {
                this.game.handleAction('back-to-cases');
            });
        }
    }

    /**
     * Cập nhật thông tin người dùng
     */
    updateUserInfo() {
        const gameState = this.game.gameState;
        
        // Cập nhật tên người dùng
        if (this.elements.username) {
            this.elements.username.textContent = gameState.isLoggedIn 
                ? gameState.userData.username 
                : 'Khách';
        }
        
        // Cập nhật điểm số
        if (this.elements.userScore) {
            this.elements.userScore.textContent = gameState.score;
        }
        
        // Cập nhật danh hiệu
        if (this.elements.userRank) {
            let rank = 'Tân binh';
            
            // Xác định danh hiệu dựa trên điểm số
            if (gameState.score >= 1000) {
                rank = 'Điều tra viên chuyên nghiệp';
            } else if (gameState.score >= 500) {
                rank = 'Điều tra viên cấp cao';
            } else if (gameState.score >= 200) {
                rank = 'Điều tra viên giỏi';
            } else if (gameState.score >= 100) {
                rank = 'Điều tra viên';
            }
            
            this.elements.userRank.textContent = rank;
        }
    }

    /**
     * Cập nhật màn hình chính
     */
    updateMainScreen() {
        // Hiển thị các vụ án gần đây
        this.renderRecentCases();
        
        // Hiển thị các thành tựu
        this.renderAchievements();
    }

    /**
     * Hiển thị danh sách vụ án gần đây
     */
    renderRecentCases() {
        if (!this.elements.recentCasesList) return;
        
        const recentCases = this.game.gameState.completedCases.slice(0, 3);
        
        // Xóa nội dung hiện tại
        this.elements.recentCasesList.innerHTML = '';
        
        if (recentCases.length === 0) {
            this.elements.recentCasesList.innerHTML = '<p>Bạn chưa hoàn thành vụ án nào.</p>';
            return;
        }
        
        // Tạo thẻ cho mỗi vụ án
        recentCases.forEach(async (caseId) => {
            if (!caseId) {
                console.error('ID vụ án không hợp lệ trong danh sách hoàn thành');
                return;
            }
            
            try {
                // Đảm bảo cases đã được khởi tạo
                if (!this.game.cases) {
                    console.error('Đối tượng cases chưa được khởi tạo');
                    return;
                }
                
                // Kiểm tra phương thức getCaseById tồn tại
                if (typeof this.game.cases.getCaseById !== 'function') {
                    console.error('Phương thức getCaseById không tồn tại');
                    return;
                }
                
                const caseData = await this.game.cases.getCaseById(caseId);
                if (!caseData) {
                    console.warn(`Không thể tải thông tin cho vụ án ID: ${caseId}`);
                    return;
                }
                
                const caseElement = document.createElement('div');
                caseElement.className = 'case-card';
                caseElement.innerHTML = `
                    <h4>${caseData.title}</h4>
                    <p>${caseData.description.substring(0, 100)}...</p>
                    <button class="btn-play">Chơi lại</button>
                `;
                
                // Thêm sự kiện
                const button = caseElement.querySelector('.btn-play');
                button.addEventListener('click', () => {
                    console.log('Chơi lại vụ án:', caseId);
                    this.game.handleAction('select-case', { caseId: caseId });
                });
                
                this.elements.recentCasesList.appendChild(caseElement);
            } catch (error) {
                console.error(`Lỗi khi tải vụ án gần đây ID: ${caseId}`, error);
            }
        });
    }

    /**
     * Hiển thị danh sách thành tựu
     */
    renderAchievements() {
        if (!this.elements.achievementsList) return;
        
        const achievements = this.game.gameState.achievements;
        
        // Xóa nội dung hiện tại
        this.elements.achievementsList.innerHTML = '';
        
        if (achievements.length === 0) {
            this.elements.achievementsList.innerHTML = '<p>Bạn chưa đạt được thành tựu nào.</p>';
            return;
        }
        
        // Tạo thẻ cho mỗi thành tựu
        achievements.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = 'achievement-card';
            achievementElement.innerHTML = `
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
                <span><i class="fas fa-trophy"></i> ${achievement.points} điểm</span>
            `;
            
            this.elements.achievementsList.appendChild(achievementElement);
        });
    }

    /**
     * Hiển thị màn hình lựa chọn vụ án
     * @param {Array} cases - Danh sách vụ án
     * @param {string} mode - Chế độ chơi
     * @param {Array} completedCases - Danh sách ID các vụ án đã hoàn thành
     */
    showCaseSelection(cases, mode, completedCases) {
        if (!this.elements.casesGrid) return;
        
        // Đặt tiêu đề là "Bản đồ" cho tất cả các trường hợp
        if (this.elements.caseSelectionTitle) {
            this.elements.caseSelectionTitle.textContent = 'Bản đồ';
        }
        
        // Hiển thị danh sách vụ án theo kiểu bản đồ
        this.renderCasesList(mode);
    }

    /**
     * Hiển thị danh sách vụ án
     * @param {string} mode - Chế độ chơi
     */
    async renderCasesList(mode) {
        if (!this.elements.casesGrid) return;
        
        // Hiển thị loading
        this.elements.casesGrid.innerHTML = '<div class="loading-message">Đang tải danh sách vụ án...</div>';
        
        try {
            // Đảm bảo cases đã được khởi tạo
            if (!this.game.cases) {
                console.error('Đối tượng cases chưa được khởi tạo');
                this.elements.casesGrid.innerHTML = '<div class="error-message">Không thể tải danh sách vụ án. Vui lòng làm mới trang.</div>';
                return;
            }
            
            // Lấy danh sách vụ án theo chế độ
            const cases = await this.game.cases.getCasesByMode(mode);
            
            // Xóa nội dung hiện tại
            this.elements.casesGrid.innerHTML = '';
            
            if (!cases || cases.length === 0) {
                this.elements.casesGrid.innerHTML = '<div class="no-cases-message">Không có vụ án nào trong chế độ này.</div>';
                return;
            }
            
            console.log(`Hiển thị ${cases.length} vụ án cho chế độ ${mode}:`, cases);
            
            // Danh sách các địa điểm cho vụ án
            const locations = {
                1: "Bắc Ninh",
                2: "Hà Nội",
                3: "Hải Phòng",
                4: "Đà Nẵng", 
                5: "TP. Hồ Chí Minh",
                6: "Cần Thơ",
                7: "Vũng Tàu",
                8: "Nha Trang",
                9: "Huế",
                10: "Hạ Long"
            };
            
            // Tạo các đường nối giữa các vụ án
            const completedCases = this.game.gameState.completedCases || [];
            
            for (let i = 0; i < cases.length - 1; i++) {
                const currentCase = cases[i];
                const nextCase = cases[i + 1];
                
                // Kiểm tra xem vụ án tiếp theo có bị khóa không
                const isNextLocked = await this.game.cases.isCaseLocked(nextCase.id, completedCases);
                
                // Tạo đường dẫn giữa hai vụ án
                const path = document.createElement('div');
                path.className = `case-path case-path-${currentCase.id}-${nextCase.id} ${isNextLocked ? 'locked' : ''}`;
                
                this.elements.casesGrid.appendChild(path);
            }
            
            // Tạo các vụ án
            for (let i = 0; i < cases.length; i++) {
                try {
                    const caseData = cases[i];
                    // Kiểm tra xem vụ án có bị khóa hay không
                    const isLocked = await this.game.cases.isCaseLocked(caseData.id, completedCases);
                    const isCompleted = completedCases.includes(caseData.id);
                    
                    const caseItem = document.createElement('div');
                    caseItem.className = `case-item ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`;
                    caseItem.setAttribute('data-case-id', caseData.id);
                    caseItem.setAttribute('data-location', locations[caseData.id] || `Vụ án ${caseData.id}`);
                    caseItem.setAttribute('data-type', caseData.type || 'Khác');
                    
                    // Xác định icon cho từng loại vụ án
                    let caseIcon = '';
                    switch(caseData.type) {
                        case 'Ma túy':
                            caseIcon = '<i class="fas fa-pills"></i>';
                            break;
                        case 'Rượu bia':
                            caseIcon = '<i class="fas fa-wine-bottle"></i>';
                            break;
                        case 'Cờ bạc':
                            caseIcon = '<i class="fas fa-dice"></i>';
                            break;
                        case 'Trộm cắp':
                            caseIcon = '<i class="fas fa-mask"></i>';
                            break;
                        case 'Băng đảng':
                            caseIcon = '<i class="fas fa-users-slash"></i>';
                            break;
                        default:
                            caseIcon = '<i class="fas fa-search"></i>';
                    }
                    
                    // Hiển thị vụ án như một điểm trên bản đồ
                    caseItem.innerHTML = `
                        <div class="case-point">
                            ${isLocked ? '' : caseIcon}
                        </div>
                        <div class="case-info">
                            <h3>${caseData.title}</h3>
                            <div class="case-meta">
                                <span class="case-type">${caseData.type || 'Khác'}</span>
                                <span class="case-difficulty">${this.renderDifficultyStars(caseData.difficulty)}</span>
                            </div>
                        </div>
                    `;
                    
                    // Thêm sự kiện click
                    if (!isLocked) {
                        caseItem.addEventListener('click', () => {
                            console.log('Bắt đầu vụ án:', caseData.id);
                            this.game.handleAction('select-case', { caseId: caseData.id });
                        });
                    } else {
                        // Hiển thị thông báo khi click vào vụ án bị khóa
                        caseItem.addEventListener('click', () => {
                            this.game.ui.showNotification('Vụ án bị khóa', 'Bạn cần hoàn thành các vụ án trước để mở khóa vụ án này.', 'warning');
                        });
                    }
                    
                    this.elements.casesGrid.appendChild(caseItem);
                } catch (error) {
                    console.error(`Lỗi khi xử lý vụ án ID: ${cases[i].id}`, error);
                }
            }
            
            // Thêm khu vực miền bắc (chỉ giữ lại viền ellipse, xóa phần text "MIỀN BẮC")
            const areaNorth = document.createElement('div');
            areaNorth.className = 'map-area-north';
            this.elements.casesGrid.appendChild(areaNorth);
            
            // Thêm tên vùng miền
            const regionNorth = document.createElement('div');
            regionNorth.className = 'map-region region-north';
            regionNorth.textContent = 'MIỀN BẮC';
            this.elements.casesGrid.appendChild(regionNorth);
            
            // Thêm chi tiết các tỉnh miền bắc
            const northDetails = [
                { name: 'Hải Phòng', top: '38%', left: '68%' },
                { name: 'Hạ Long', top: '35%', left: '75%' }
            ];
            
            northDetails.forEach(city => {
                const cityElement = document.createElement('div');
                cityElement.className = 'map-city';
                cityElement.textContent = city.name;
                cityElement.style.top = city.top;
                cityElement.style.left = city.left;
                this.elements.casesGrid.appendChild(cityElement);
            });
            
            const regionCentral = document.createElement('div');
            regionCentral.className = 'map-region region-central';
            regionCentral.textContent = 'MIỀN TRUNG';
            this.elements.casesGrid.appendChild(regionCentral);
            
            const regionSouth = document.createElement('div');
            regionSouth.className = 'map-region region-south';
            regionSouth.textContent = 'MIỀN NAM';
            this.elements.casesGrid.appendChild(regionSouth);
            
            // Thêm các yếu tố trang trí để tạo hiệu ứng bản đồ cũ
            // Thêm compass rose (hoa hồng phương hướng)
            const compassRose = document.createElement('div');
            compassRose.className = 'compass-rose';
            this.elements.casesGrid.appendChild(compassRose);
            
            // Thêm trang trí 
            const dragonDecoration = document.createElement('div');
            dragonDecoration.className = 'map-decoration dragon';
            this.elements.casesGrid.appendChild(dragonDecoration);
            
            // Thêm ghi chú
            const noteDecoration = document.createElement('div');
            noteDecoration.className = 'map-decoration note';
            this.elements.casesGrid.appendChild(noteDecoration);
            
            // Thêm các vết mực
            const inkBlot1 = document.createElement('div');
            inkBlot1.className = 'ink-blot one';
            this.elements.casesGrid.appendChild(inkBlot1);
            
            const inkBlot2 = document.createElement('div');
            inkBlot2.className = 'ink-blot two';
            this.elements.casesGrid.appendChild(inkBlot2);
            
            const inkBlot3 = document.createElement('div');
            inkBlot3.className = 'ink-blot three';
            this.elements.casesGrid.appendChild(inkBlot3);
            
            // Thêm viền trang trí
            const borderDecoration = document.createElement('div');
            borderDecoration.className = 'map-decoration border';
            this.elements.casesGrid.appendChild(borderDecoration);
            
            // Thêm nhãn tọa độ
            const coordinateLabels = document.createElement('div');
            coordinateLabels.className = 'coordinate-labels';
            this.elements.casesGrid.appendChild(coordinateLabels);
            
            // Tạo nhãn tọa độ ngang (A-L)
            const horizontalLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
            horizontalLabels.forEach((label, index) => {
                const horizontalLabel = document.createElement('div');
                horizontalLabel.className = `coordinate-label coord-horizontal coord-${label}`;
                horizontalLabel.textContent = label;
                coordinateLabels.appendChild(horizontalLabel);
            });
            
            // Tạo nhãn tọa độ dọc (1-12)
            for (let i = 1; i <= 12; i++) {
                const verticalLabel = document.createElement('div');
                verticalLabel.className = `coordinate-label coord-vertical coord-${i}`;
                verticalLabel.textContent = i;
                coordinateLabels.appendChild(verticalLabel);
            }
            
            // Thêm dấu vị trí hiện tại
            const currentPosition = document.createElement('div');
            currentPosition.className = 'current-position-marker';
            currentPosition.style.left = '45%';
            currentPosition.style.top = '55%';
            this.elements.casesGrid.appendChild(currentPosition);
            
        } catch (error) {
            console.error('Lỗi khi tải danh sách vụ án:', error);
            this.elements.casesGrid.innerHTML = '<div class="error-message">Không thể tải danh sách vụ án. Vui lòng làm mới trang.</div>';
        }
    }

    /**
     * Hiển thị sao đánh giá độ khó
     * @param {number} difficulty - Độ khó (1-5)
     * @returns {string} HTML cho các ngôi sao
     */
    renderDifficultyStars(difficulty) {
        let stars = '';
        
        // Giới hạn độ khó từ 1-5
        const level = Math.min(5, Math.max(1, difficulty));
        
        // Tạo sao đầy đủ
        for (let i = 0; i < level; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Tạo sao rỗng
        for (let i = level; i < 5; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    /**
     * Hiển thị vụ án
     * @param {object} caseData - Dữ liệu vụ án
     */
    renderCase(caseData) {
        // Cập nhật tiêu đề và thông tin
        if (this.elements.caseTitle) {
            this.elements.caseTitle.textContent = caseData.title;
        }
        
        if (this.elements.caseDifficulty) {
            this.elements.caseDifficulty.innerHTML = `Độ khó: ${this.renderDifficultyStars(caseData.difficulty)}`;
        }
        
        if (this.elements.caseType) {
            this.elements.caseType.textContent = `Loại: ${caseData.type}`;
        }
        
        // Xóa danh sách bằng chứng
        if (this.elements.evidenceList) {
            this.elements.evidenceList.innerHTML = '';
        }
        
        // Hiển thị bước đầu tiên
        if (caseData.steps && caseData.steps.length > 0) {
            this.renderStep(caseData.steps[0]);
        }
    }

    /**
     * Hiển thị bước
     * @param {object} stepData - Dữ liệu bước
     */
    renderStep(stepData) {
        if (!stepData) {
            console.error('Không có dữ liệu bước để hiển thị');
            this.showError('Lỗi hiển thị nội dung', 'Không thể tải nội dung bước tiếp theo.');
            return;
        }
        
        console.log('Hiển thị bước:', stepData);
        
        // Hiển thị các điều khiển game (nút hướng dẫn và nút quay lại)
        this.renderGameControls();
        
        // Hiển thị nội dung tường thuật
        if (this.elements.caseNarrative) {
            // Kiểm tra nếu stepData có thuộc tính narrative hoặc finalStep
            if (stepData.narrative) {
                this.elements.caseNarrative.innerHTML = stepData.narrative;
            } else if (stepData.isFinalStep && this.game.gameState.currentCase && this.game.gameState.currentCase.finalStep) {
                this.elements.caseNarrative.innerHTML = this.game.gameState.currentCase.finalStep.narrative;
            } else {
                this.elements.caseNarrative.innerHTML = '<p>Không có nội dung tường thuật</p>';
            }
        }
        
        // Hiển thị gợi ý về bằng chứng cần thu thập (nếu là vụ án Bí Mật Gia Đình)
        if (this.game.gameState.currentCase && this.game.gameState.currentCase.id === 'alcohol-family-1') {
            // Kiểm tra finalStep để lấy danh sách bằng chứng cần thu thập
            const currentCase = this.game.gameState.currentCase;
            const requiredEvidence = currentCase.finalStep ? currentCase.finalStep.requireEvidence : [];
            
            if (requiredEvidence && requiredEvidence.length > 0) {
                // Tìm tên các bằng chứng
                const evidenceNames = requiredEvidence.map(evidenceId => {
                    const evidence = currentCase.evidence.find(e => e.id === evidenceId);
                    return evidence ? evidence.name : evidenceId;
                });
                
                // Thêm gợi ý vào cuối nội dung tường thuật
                const hintElement = document.createElement('div');
                hintElement.className = 'evidence-hint';
                hintElement.style.cssText = 'margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-left: 3px solid #3498db; font-style: italic; color: #2980b9;';
                hintElement.innerHTML = `<p><strong>Gợi ý:</strong> Để kết thúc vụ án, bạn cần thu thập các bằng chứng quan trọng: ${evidenceNames.join(', ')}.</p>`;
                
                // Thêm vào narrative nếu không phải là finalStep
                if (!stepData.isFinalStep && this.elements.caseNarrative) {
                    this.elements.caseNarrative.appendChild(hintElement);
                }
            }
        }
        
        // Xóa các hành động hiện tại và hiển thị các hành động mới
        if (stepData.actions && stepData.actions.length > 0) {
            this.renderActionButtons(stepData.actions);
        } else {
            this.renderActionButtons([]);
        }
        
        // Nếu là bước cuối (finalStep), hiển thị các lựa chọn
        if (stepData.isFinalStep && stepData.choices) {
            this.renderChoices(stepData.choices);
        }
        
        // Nếu có dialog, hiển thị hộp thoại
        if (stepData.dialog) {
            this.showDialog(stepData.dialog);
        }
    }

    /**
     * Hiển thị các điều khiển game (nút hướng dẫn và nút quay lại)
     */
    renderGameControls() {
        // Kiểm tra xem container điều khiển có tồn tại không
        let controlsContainer = document.querySelector('.gameplay-controls');
        
        // Nếu chưa có, tạo mới
        if (!controlsContainer) {
            controlsContainer = document.createElement('div');
            controlsContainer.className = 'gameplay-controls';
            
            // Thêm vào đầu khu vực gameplay
            const gameplayArea = document.querySelector('.gameplay-area');
            if (gameplayArea) {
                gameplayArea.insertBefore(controlsContainer, gameplayArea.firstChild);
            }
        }
        
        // Cập nhật nội dung
        controlsContainer.innerHTML = `
            <div class="controls-left">
                <button id="btn-tutorial" class="control-btn">
                    <i class="fas fa-question-circle"></i> Hướng dẫn
                </button>
            </div>
            <div class="controls-right">
                <button id="btn-previous-step" class="control-btn" ${this.game.gameState.stepHistory.length === 0 ? 'disabled' : ''}>
                    <i class="fas fa-undo"></i> Quay lại bước trước
                </button>
            </div>
        `;
        
        // Thêm sự kiện cho nút hướng dẫn
        const tutorialBtn = document.getElementById('btn-tutorial');
        if (tutorialBtn) {
            tutorialBtn.addEventListener('click', () => {
                this.game.handleAction('show-tutorial', { type: 'general' });
            });
        }
        
        // Thêm sự kiện cho nút quay lại
        const previousStepBtn = document.getElementById('btn-previous-step');
        if (previousStepBtn) {
            previousStepBtn.addEventListener('click', () => {
                this.game.handleAction('previous-step');
            });
        }
    }

    /**
     * Hiển thị các nút hành động
     * @param {Array} actions - Danh sách hành động
     */
    renderActionButtons(actions) {
        if (!this.elements.actionButtons || !actions) return;
        
        // Xóa nội dung hiện tại
        this.elements.actionButtons.innerHTML = '';
        
        // Tạo nút cho mỗi hành động
        actions.forEach(action => {
            const button = document.createElement('button');
            button.className = 'action-btn';
            
            // Nếu có icon, hiển thị icon
            if (action.icon) {
                button.innerHTML = `<i class="fas ${action.icon}"></i> ${action.label}`;
            } else {
                button.textContent = action.label;
            }
            
            // Thêm sự kiện click
            button.addEventListener('click', () => {
                this.game.handleAction(action.type, { targetId: action.targetId });
            });
            
            this.elements.actionButtons.appendChild(button);
        });
    }

    /**
     * Hiển thị các lựa chọn
     * @param {Array} choices - Danh sách lựa chọn
     */
    renderChoices(choices) {
        if (!this.elements.actionButtons || !choices) return;
        
        // Xóa nội dung hiện tại
        this.elements.actionButtons.innerHTML = '';
        
        // Tạo nút cho mỗi lựa chọn
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'action-btn choice-btn';
            button.textContent = choice.text;
            
            // Thêm sự kiện click
            button.addEventListener('click', () => {
                this.game.processChoice(choice.id);
            });
            
            this.elements.actionButtons.appendChild(button);
        });
    }

    /**
     * Hiển thị hộp thoại
     * @param {object} dialog - Dữ liệu hộp thoại
     */
    renderDialog(dialog) {
        if (!dialog || !this.elements.dialogContent || !this.elements.dialogOptions) {
            console.error('Lỗi: Các phần tử cần thiết cho hộp thoại không tồn tại');
            return;
        }
        
        console.log('Hiển thị hộp thoại:', dialog);
        
        // Ẩn thông tin debug
        const debugContainer = document.getElementById('dialog-debug');
        if (debugContainer) {
            debugContainer.style.display = 'none';
        }
        
        // Hiển thị nội dung hộp thoại với hiệu ứng mới
        const character = dialog.character;
        
        // Tạo hình ảnh mặc định nếu không có
        const characterImage = character.image || '../images/characters/default.jpg';
        
        // Xác định biểu tượng vai trò dựa trên vai trò của nhân vật
        let roleIcon = '';
        if (character.role) {
            const roleLower = character.role.toLowerCase();
            if (roleLower.includes('cảnh sát') || roleLower.includes('công an')) {
                roleIcon = '<i class="fas fa-shield-alt"></i> ';
            } else if (roleLower.includes('nhân chứng')) {
                roleIcon = '<i class="fas fa-eye"></i> ';
            } else if (roleLower.includes('nghi phạm')) {
                roleIcon = '<i class="fas fa-user-secret"></i> ';
            } else if (roleLower.includes('nạn nhân')) {
                roleIcon = '<i class="fas fa-user-injured"></i> ';
            } else if (roleLower.includes('chuyên gia')) {
                roleIcon = '<i class="fas fa-microscope"></i> ';
            } else {
                roleIcon = '<i class="fas fa-user"></i> ';
            }
        }
        
        const dialogHTML = `
            <div class="character-dialog">
                <div class="character-info">
                    <div class="character-image">
                        <img src="${characterImage}" alt="${character.name}">
                    </div>
                    <div class="character-details">
                        <h4>${character.name}</h4>
                        <p>${roleIcon}${character.role || ''}</p>
                    </div>
                </div>
                <div class="dialog-text typewriter">
                    ${dialog.text || ''}
                </div>
            </div>
        `;
        this.elements.dialogContent.innerHTML = dialogHTML;
        
        // Hiển thị các tùy chọn đối thoại nếu có
        if (dialog.options && dialog.options.length > 0) {
            this.elements.dialogOptions.innerHTML = '';
            
            // Thêm hiệu ứng xuất hiện dần cho các tùy chọn
            dialog.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'dialog-option';
                optionElement.setAttribute('data-option-id', option.id);
                
                // Thêm delay để các tùy chọn xuất hiện theo thứ tự
                optionElement.style.opacity = '0';
                optionElement.style.transform = 'translateY(10px)';
                optionElement.style.transition = 'all 0.3s ease';
                optionElement.style.transitionDelay = `${index * 0.1 + 0.5}s`;
                
                optionElement.innerHTML = `
                        <p>${option.text}</p>
                `;
            
                this.elements.dialogOptions.appendChild(optionElement);
            
                // Xóa bất kỳ trình nghe sự kiện hiện có nào để tránh đăng ký trùng lặp
                optionElement.addEventListener('click', () => {
                    this.handleDialogOptionClick(optionElement, option.id);
                });
                
                // Kích hoạt hiệu ứng xuất hiện
                setTimeout(() => {
                    optionElement.style.opacity = '1';
                    optionElement.style.transform = 'translateY(0)';
                }, 10);
            });
        } else {
            this.elements.dialogOptions.innerHTML = '';
        }
        
        // Hiển thị hộp thoại nếu đang ẩn
        if (this.elements.gameDialog) {
            this.elements.gameDialog.style.display = 'block';
            
            // Thêm hiệu ứng xuất hiện cho hộp thoại
            this.elements.gameDialog.classList.add('dialog-fade-in');
            setTimeout(() => {
                this.elements.gameDialog.classList.remove('dialog-fade-in');
            }, 500);
        }
        
        // Thêm hiệu ứng typing cho văn bản đối thoại
        this.applyTypingEffect();
    }
    
    /**
     * Áp dụng hiệu ứng đánh máy cho văn bản đối thoại
     */
    applyTypingEffect() {
        const dialogText = document.querySelector('.dialog-text.typewriter');
        if (!dialogText) return;
        
        const text = dialogText.innerHTML;
        dialogText.innerHTML = '';
        
        let i = 0;
        const speed = 15; // tốc độ đánh máy (ms)
        
        // Tạo biểu tượng nhắc nhở người dùng nhấn vào hộp thoại để hiển thị toàn bộ văn bản
        const skipIndicator = document.createElement('div');
        skipIndicator.className = 'skip-typing-indicator';
        skipIndicator.innerHTML = '<i class="fas fa-arrow-down"></i> Nhấn để hiển thị toàn bộ';
        skipIndicator.style.display = 'none';
        dialogText.parentNode.appendChild(skipIndicator);
        
        // Hiển thị văn bản từng ký tự một
        function typeWriter() {
            if (i < text.length) {
                // Xử lý thẻ HTML
                if (text.substring(i).startsWith('<')) {
                    // Tìm vị trí kết thúc của thẻ HTML
                    const endPos = text.indexOf('>', i);
                    if (endPos !== -1) {
                        dialogText.innerHTML += text.substring(i, endPos + 1);
                        i = endPos + 1;
                    }
                } else {
                    dialogText.innerHTML += text.charAt(i);
                    i++;
                }
                
                // Hiển thị chỉ báo bỏ qua sau một thời gian ngắn
                if (i > 20 && skipIndicator.style.display === 'none') {
                    skipIndicator.style.display = 'block';
                }
                
                setTimeout(typeWriter, speed);
            } else {
                // Đã hoàn thành, ẩn chỉ báo
                skipIndicator.style.display = 'none';
            }
        }
        
        // Bắt đầu hiệu ứng đánh máy
        typeWriter();
        
        // Cho phép người dùng nhấp vào để hiển thị toàn bộ văn bản ngay lập tức
        dialogText.addEventListener('click', function() {
            dialogText.innerHTML = text;
            i = text.length; // dừng hiệu ứng đánh máy
            skipIndicator.style.display = 'none';
        });
    }

    /**
     * Thu thập bằng chứng mới và áp dụng hiệu ứng
     * @param {object} evidence - Dữ liệu bằng chứng
     */
    showEvidenceDetails(evidence) {
        if (!evidence) return;
        
        // Tạo modal chi tiết bằng chứng
        const modal = document.createElement('div');
        modal.className = 'evidence-modal';
        
        // Nội dung modal với thiết kế mới cải tiến
        modal.innerHTML = `
            <div class="evidence-modal-content">
                <div class="evidence-modal-header">
                    <h3>${evidence.name}</h3>
                    <button class="evidence-modal-close" title="Đóng">&times;</button>
                </div>
                <div class="evidence-modal-body">
                    ${evidence.image ? `
                        <div class="evidence-image">
                            <img src="${evidence.image}" alt="${evidence.name}">
                        </div>
                    ` : ''}
                    <div class="evidence-description">
                        <p>${evidence.description}</p>
                    </div>
                    ${evidence.analysis ? `
                        <div class="evidence-analysis">
                            <h4>Phân tích:</h4>
                            <p>${evidence.analysis}</p>
                        </div>
                    ` : ''}
                    <div class="evidence-modal-actions">
                        <button class="btn-confirm">Đã hiểu</button>
                    </div>
                </div>
            </div>
        `;
        
        // Thêm modal vào body
        document.body.appendChild(modal);
        
        // Hiển thị modal với hiệu ứng
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Sự kiện đóng modal khi nhấn nút X
        const closeButton = modal.querySelector('.evidence-modal-close');
        if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
            });
        }
        
        // Sự kiện đóng modal khi nhấn nút Đã hiểu
        const confirmButton = modal.querySelector('.btn-confirm');
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            });
        }
        
        // Đóng modal khi nhấn bên ngoài
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }
        });
    }

    /**
     * Cập nhật hiển thị bằng chứng với hiệu ứng mới
     */
    updateEvidence() {
        if (!this.elements.evidenceList) return;
        
        // Lấy danh sách bằng chứng đã thu thập
        const evidenceCollected = this.game.gameState.evidenceCollected;
        const caseData = this.game.gameState.currentCase;
        
        if (!caseData || !caseData.evidence || !Array.isArray(evidenceCollected)) {
            this.elements.evidenceList.innerHTML = '<p>Chưa có bằng chứng nào.</p>';
            return;
        }
        
        // Lưu trữ ID bằng chứng hiện tại để theo dõi bằng chứng mới
        const currentEvidenceIds = Array.from(this.elements.evidenceList.querySelectorAll('.evidence-item'))
            .map(item => item.getAttribute('data-evidence-id'));
        
        // Xóa nội dung hiện tại
        this.elements.evidenceList.innerHTML = '';
        
        if (evidenceCollected.length === 0) {
            this.elements.evidenceList.innerHTML = '<p>Chưa có bằng chứng nào.</p>';
            return;
        }
        
        // Hiển thị mỗi bằng chứng đã thu thập
        evidenceCollected.forEach(evidenceId => {
            const evidence = caseData.evidence.find(e => e.id === evidenceId);
            if (!evidence) return;
            
            const evidenceElement = document.createElement('div');
            evidenceElement.className = 'evidence-item';
            evidenceElement.setAttribute('data-evidence-id', evidenceId);
            
            // Áp dụng class 'new' cho bằng chứng mới thu thập
            if (!currentEvidenceIds.includes(evidenceId)) {
                evidenceElement.classList.add('new');
            }
            
            evidenceElement.innerHTML = `
                <h4>${evidence.name}</h4>
                <p>${evidence.description.substring(0, 50)}${evidence.description.length > 50 ? '...' : ''}</p>
            `;
            
            // Thêm sự kiện click để xem chi tiết
            evidenceElement.addEventListener('click', () => {
                this.showEvidenceDetails(evidence);
            });
            
            this.elements.evidenceList.appendChild(evidenceElement);
        });
        
        // Hiển thị chỉ số điều tra nếu cần
        this.updateInvestigationProgress();
    }
    
    /**
     * Cập nhật thanh tiến trình điều tra
     */
    updateInvestigationProgress() {
        // Kiểm tra xem thanh tiến trình đã tồn tại chưa
        let progressContainer = document.querySelector('.investigation-progress');
        
        if (!progressContainer) {
            // Tạo mới thanh tiến trình nếu chưa có
            progressContainer = document.createElement('div');
            progressContainer.className = 'investigation-progress';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressContainer.appendChild(progressBar);
            
            // Thêm vào sau phần bằng chứng
            if (this.elements.evidencePanel) {
                this.elements.evidencePanel.appendChild(progressContainer);
            }
        }
        
        // Cập nhật tiến trình
        const evidenceCollected = this.game.gameState.evidenceCollected.length;
        const totalEvidence = this.game.gameState.currentCase?.evidence?.length || 1;
        const progressPercentage = Math.min(100, Math.round((evidenceCollected / totalEvidence) * 100));
        
        const progressBar = progressContainer.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progressPercentage}%`;
            
            // Thay đổi màu dựa trên tiến trình
            if (progressPercentage < 30) {
                progressBar.style.background = 'linear-gradient(to right, #e74c3c, #f39c12)';
            } else if (progressPercentage < 70) {
                progressBar.style.background = 'linear-gradient(to right, #f39c12, #3498db)';
            } else {
                progressBar.style.background = 'linear-gradient(to right, #3498db, #2ecc71)';
            }
        }
    }

    /**
     * Hiển thị địa điểm
     * @param {object} location - Dữ liệu địa điểm
     */
    showLocation(location) {
        if (!location) return;
        
        // Tạo hoặc cập nhật phần tử hiển thị địa điểm
        let locationElement = document.getElementById('current-location');
        
        if (!locationElement) {
            locationElement = document.createElement('div');
            locationElement.id = 'current-location';
            locationElement.className = 'location-container';
            
            // Thêm vào sau phần nội dung câu chuyện
            if (this.elements.caseNarrative) {
                this.elements.caseNarrative.after(locationElement);
            }
        }
        
        // Cập nhật nội dung địa điểm
        locationElement.innerHTML = `
            <div class="location-header">
                <h3><i class="fas fa-map-marker-alt"></i> ${location.name}</h3>
            </div>
            <div class="location-content">
                ${location.image ? `
                    <div class="location-image">
                        <img src="${location.image}" alt="${location.name}">
                    </div>
                ` : ''}
                <div class="location-description">
                    <p>${location.description}</p>
                </div>
            </div>
        `;
    }

    /**
     * Hiển thị đối thoại với một nhân vật
     * @param {object} character - Đối tượng nhân vật
     */
    showDialog(character) {
        if (!character) {
            console.error('Không thể hiển thị hộp thoại: Nhân vật không hợp lệ');
            return;
        }
        
        console.log('Hiển thị đối thoại với:', character);
        
        // Lấy nội dung đối thoại ban đầu
        const initialText = character.initialDialog || character.initial_dialog || 'Không có thông tin.';
        
        // Lấy các tùy chọn đối thoại
        let dialogOptions = [];
        
        // Kiểm tra xem character có dialogOptions không
        if (character.dialogOptions && Array.isArray(character.dialogOptions)) {
            dialogOptions = character.dialogOptions;
        }
        // Nếu không có dialogOptions, thử tìm dialog_options (một số data có thể dùng _)
        else if (character.dialog_options && Array.isArray(character.dialog_options)) {
            dialogOptions = character.dialog_options;
        }
        
        console.log('Các tùy chọn đối thoại:', dialogOptions);
        
        // Tạo đối tượng dialog
        const dialog = {
            character: character,
            text: initialText,
            options: dialogOptions
        };
        
        // Hiển thị hộp thoại
        this.renderDialog(dialog);
    }

    /**
     * Hiển thị kết quả vụ án
     * @param {object} result - Kết quả vụ án
     */
    showCaseResult(result) {
        const currentCase = this.game.gameState.currentCase;
        
        if (!currentCase) return;
        
        // Cập nhật tiêu đề kết quả
        if (this.elements.resultHeader) {
            let headerClass = '';
            let headerText = '';
            
            switch (result.result) {
                case 'success':
                    headerClass = 'success';
                    headerText = 'Vụ án đã được giải quyết!';
                    break;
                    
                case 'failure':
                    headerClass = 'failure';
                    headerText = 'Vụ án thất bại!';
                    break;
                    
                case 'timeout':
                    headerClass = 'failure';
                    headerText = 'Hết thời gian!';
                    break;
            }
            
            this.elements.resultHeader.className = `result-header ${headerClass}`;
            this.elements.resultHeader.innerHTML = `<h2>${headerText}</h2>`;
        }
        
        // Cập nhật nội dung kết quả
        if (this.elements.resultContent) {
            const content = result.result === 'success' 
                ? currentCase.successContent 
                : currentCase.failureContent;
                
            this.elements.resultContent.innerHTML = content;
        }
        
        // Cập nhật thống kê với giao diện mới
        if (this.elements.resultStats) {
            this.elements.resultStats.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value">${result.totalScore || 0}</div>
                    <div class="stat-label">Điểm số</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${result.correctChoices || 0}</div>
                    <div class="stat-label">Lựa chọn đúng</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${result.evidenceCollected || 0}/${result.totalEvidence || 0}</div>
                    <div class="stat-label">Bằng chứng</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.formatTime(result.timeSpent || 0)}</div>
                    <div class="stat-label">Thời gian</div>
                </div>
            `;
        }
        
        // Cập nhật các nút hành động với biểu tượng
        if (this.elements.replayCase) {
            this.elements.replayCase.innerHTML = '<i class="fas fa-redo"></i> Chơi lại';
        }
        
        if (this.elements.nextCase) {
            this.elements.nextCase.innerHTML = '<i class="fas fa-arrow-right"></i> Vụ án tiếp theo';
        }
        
        if (this.elements.backToCases) {
            this.elements.backToCases.innerHTML = '<i class="fas fa-map-marked-alt"></i> Quay lại bản đồ';
        }
        
        // Cập nhật kiến thức bổ ích
        if (this.elements.educationalTips) {
            const tips = currentCase.educationalTips || [];
            
            if (tips.length > 0) {
                let tipsHTML = '<h3>Kiến thức bổ ích</h3><ul>';
                
                tips.forEach(tip => {
                    tipsHTML += `<li>${tip}</li>`;
                });
                
                tipsHTML += '</ul>';
                
                this.elements.educationalTips.innerHTML = tipsHTML;
                
                // Hiển thị phần kiến thức bổ ích
                this.elements.educationalTips.style.display = 'block';
            } else {
                this.elements.educationalTips.style.display = 'none';
            }
        }
        
        // Tạo hiệu ứng xuất hiện tuần tự
        setTimeout(() => {
            const resultElements = document.querySelectorAll('.result-content, .result-stats, .result-buttons, .educational-tips');
            resultElements.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }, 100);
    }

    /**
     * Định dạng thời gian
     * @param {number} seconds - Số giây
     * @returns {string} Thời gian đã định dạng
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    /**
     * Cập nhật hiển thị thời gian
     * @param {number} seconds - Số giây đã trôi qua
     */
    updateTimer(seconds) {
        const timerElement = document.getElementById('case-timer');
        
        if (timerElement) {
            timerElement.textContent = this.formatTime(seconds);
        }
    }

    /**
     * Hiển thị thông báo lỗi
     * @param {string} title - Tiêu đề lỗi
     * @param {string} message - Thông điệp lỗi
     */
    showError(title, message) {
        console.error('Lỗi:', title, message);
        
        const container = document.getElementById('error-container');
        if (!container) {
            // Tạo container lỗi nếu chưa có
            const errorContainer = document.createElement('div');
            errorContainer.id = 'error-container';
            errorContainer.className = 'error-message';
            
            const errorBox = document.createElement('div');
            errorBox.className = 'error-container';
            
            const errorTitle = document.createElement('h3');
            errorTitle.textContent = title || 'Đã xảy ra lỗi';
            
            const errorText = document.createElement('p');
            errorText.textContent = message || 'Vui lòng tải lại trang và thử lại.';
            
            const errorBtn = document.createElement('button');
            errorBtn.textContent = 'Đóng';
            errorBtn.onclick = () => errorContainer.remove();
            
            // Thêm nút debug nếu cần
            const debugBtn = document.createElement('button');
            debugBtn.textContent = 'Hiển thị thông tin gỡ lỗi';
            debugBtn.style.marginLeft = '10px';
            debugBtn.style.backgroundColor = '#e74c3c';
            debugBtn.onclick = () => this.showDebugInfo();
            
            errorBox.appendChild(errorTitle);
            errorBox.appendChild(errorText);
            errorBox.appendChild(errorBtn);
            errorBox.appendChild(debugBtn);
            errorContainer.appendChild(errorBox);
            
            document.body.appendChild(errorContainer);
        } else {
            // Cập nhật nội dung lỗi nếu đã có container
            const titleEl = container.querySelector('h3');
            const messageEl = container.querySelector('p');
            
            if (titleEl) titleEl.textContent = title || 'Đã xảy ra lỗi';
            if (messageEl) messageEl.textContent = message || 'Vui lòng tải lại trang và thử lại.';
            
            container.style.display = 'flex';
        }
    }

    /**
     * Hiển thị thông tin gỡ lỗi
     */
    showDebugInfo() {
        console.log('Hiển thị thông tin gỡ lỗi');
        
        if (!this.game) return;
        
        const caseData = this.game.gameState.currentCase;
        const debugInfo = {
            browserInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform
            },
            gameState: { ...this.game.gameState },
            caseData: caseData ? {
                id: caseData.id,
                title: caseData.title,
                stepsCount: caseData.steps ? caseData.steps.length : 0,
                steps: caseData.steps ? caseData.steps.map(s => ({
                    id: s.id,
                    is_starting_step: s.is_starting_step,
                    isStartingStep: s.isStartingStep
                })) : []
            } : null
        };
        
        // Tạo overlay debug
        const debugOverlay = document.createElement('div');
        debugOverlay.className = 'debug-overlay';
        debugOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            padding: 20px;
            font-family: monospace;
            overflow: auto;
        `;
        
        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            width: 100%;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        `;
        
        const title = document.createElement('h2');
        title.textContent = 'Thông tin gỡ lỗi';
        title.style.margin = '0';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Đóng';
        closeBtn.onclick = () => debugOverlay.remove();
        closeBtn.style.cssText = `
            background-color: #e74c3c;
            color: white;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
        `;
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        // Content
        const content = document.createElement('div');
        content.style.cssText = `
            background-color: #2c3e50;
            padding: 15px;
            border-radius: 5px;
            width: 90%;
            max-width: 800px;
            white-space: pre-wrap;
            overflow: auto;
            max-height: 70vh;
        `;
        
        content.textContent = JSON.stringify(debugInfo, null, 2);
        
        // Actions
        const actions = document.createElement('div');
        actions.style.cssText = `
            margin-top: 20px;
            display: flex;
            gap: 10px;
        `;
        
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Sao chép thông tin';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))
                .then(() => alert('Đã sao chép thông tin gỡ lỗi vào clipboard'))
                .catch(err => console.error('Lỗi sao chép:', err));
        };
        copyBtn.style.cssText = `
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 15px;
            cursor: pointer;
        `;
        
        actions.appendChild(copyBtn);
        
        // Assemble
        debugOverlay.appendChild(header);
        debugOverlay.appendChild(content);
        debugOverlay.appendChild(actions);
        
        document.body.appendChild(debugOverlay);
    }

    /**
     * Hiển thị thông báo
     * @param {string} title - Tiêu đề thông báo
     * @param {string} message - Nội dung thông báo
     * @param {string} type - Loại thông báo ('info', 'error', 'warning')
     * @param {number} duration - Thời gian hiển thị (ms)
     */
    showNotification(title, message, type = 'info', duration = 3000) {
        // Xóa thông báo cũ nếu có
        const oldNotification = document.querySelector('.notification');
        if (oldNotification) {
            oldNotification.remove();
        }
        
        // Tạo element thông báo
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification notification-${type}`;
        
        // Thêm icon phù hợp với loại thông báo
        let icon = '';
        switch(type) {
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
        }
        
        notificationElement.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    ${icon}
                    <h4>${title}</h4>
                    <button class="notification-close">&times;</button>
                </div>
                <p>${message}</p>
            </div>
        `;
        
        // Thêm vào body
        document.body.appendChild(notificationElement);
        
        // Thêm sự kiện đóng thông báo
        const closeButton = notificationElement.querySelector('.notification-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                notificationElement.classList.remove('show');
                setTimeout(() => {
                    notificationElement.remove();
                }, 300);
            });
        }
        
        // Hiệu ứng hiển thị
        setTimeout(() => {
            notificationElement.classList.add('show');
        }, 10);
        
        // Tự động ẩn sau thời gian đã định
        if (duration > 0) {
            setTimeout(() => {
                if (document.body.contains(notificationElement)) {
                    notificationElement.classList.remove('show');
                    setTimeout(() => {
                        if (document.body.contains(notificationElement)) {
                            notificationElement.remove();
                        }
                    }, 300);
                }
            }, duration);
        }
    }

    /**
     * Hiển thị debug thông tin hộp thoại để giúp xác định vấn đề
     * @param {object} dialog - Dữ liệu hộp thoại
     */
    showDialogDebugInfo(dialog) {
        // Lấy phần tử debug  
        const debugContainer = document.getElementById('dialog-debug');
        const debugInfo = document.getElementById('dialog-debug-info');
        
        if (!debugContainer || !debugInfo) return;
        
        // Giữ debug container ẩn trong môi trường production
        debugContainer.style.display = 'none';
        
        // Tạo thông tin debug (vẫn giữ cho mục đích phát triển nhưng không hiển thị)
        const info = {
            character: dialog.character ? {
                id: dialog.character.id,
                name: dialog.character.name,
                hasDialogOptions: dialog.character.dialogOptions ? dialog.character.dialogOptions.length : 0
            } : null,
            dialogText: dialog.text,
            optionsCount: dialog.options ? dialog.options.length : 0,
            options: dialog.options ? dialog.options.map(option => ({
                id: option.id,
                text: option.text ? option.text.substring(0, 30) + '...' : null,
                character_id: option.character_id || 'KHÔNG CÓ CHARACTER_ID'
            })) : []
        };
        
        // Hiển thị thông tin dưới dạng JSON
        debugInfo.textContent = JSON.stringify(info, null, 2);
    }

    /**
     * Xử lý khi người dùng chọn một tùy chọn đối thoại
     * @param {HTMLElement} element - Phần tử HTML được click
     * @param {string} choiceId - ID của lựa chọn
     */
    handleDialogOptionClick(element, choiceId) {
        if (!choiceId) return;
        
        console.log('Dialog option clicked:', choiceId);
        console.log('Element:', element);
        
        // Hiển thị thông tin debug khi click
        const option = element.querySelector('p');
        const optionText = option ? option.textContent : '';
        
        // Hiển thị thông tin debug trong console
        console.log('Option text:', optionText);
        
        // Thêm hiệu ứng khi click
        element.style.backgroundColor = '#cbd5e0';
        element.style.transform = 'translateY(0)';
        
        // Gửi sự kiện xử lý lựa chọn
        this.game.processChoice(choiceId);
    }
} 