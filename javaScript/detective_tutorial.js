/**
 * Detective Tutorial - Quản lý hệ thống hướng dẫn và chức năng quay lại
 */

class DetectiveTutorial {
    constructor(game) {
        // Tham chiếu đến game
        this.game = game;
        
        // Nội dung hướng dẫn theo loại vụ án
        this.tutorialContent = {
            'general': [
                {
                    title: 'Chào mừng đến với Nhà Điều Tra Tệ Nạn',
                    content: `
                        <p>Chào mừng bạn đến với <span class="highlight">Nhà Điều Tra Tệ Nạn</span> - trò chơi giáo dục giúp bạn tìm hiểu và phòng tránh các tệ nạn xã hội thông qua việc giải quyết các vụ án mô phỏng.</p>
                        <p>Trong vai trò một điều tra viên, bạn sẽ thu thập bằng chứng, thẩm vấn nhân chứng và đưa ra quyết định để giải quyết các vụ án liên quan đến ma túy, rượu bia, và các tệ nạn xã hội khác.</p>
                    `
                },
                {
                    title: 'Cách điều tra',
                    content: `
                        <p>Trong quá trình điều tra, bạn sẽ:</p>
                        <ul>
                            <li><strong>Khám xét địa điểm</strong>: Di chuyển giữa các địa điểm để tìm kiếm manh mối.</li>
                            <li><strong>Thu thập bằng chứng</strong>: Tìm và phân tích các bằng chứng quan trọng.</li>
                            <li><strong>Nói chuyện với nhân vật</strong>: Khai thác thông tin từ các nhân chứng và nghi phạm.</li>
                            <li><strong>Đưa ra quyết định</strong>: Chọn cách giải quyết vụ án dựa trên những gì bạn đã phát hiện.</li>
                        </ul>
                    `
                },
                {
                    title: 'Bằng chứng và điểm số',
                    content: `
                        <p>Mỗi bằng chứng bạn thu thập được sẽ xuất hiện trong bảng <span class="highlight">Bằng chứng đã thu thập</span> ở bên phải màn hình.</p>
                        <p>Bạn sẽ nhận được điểm khi:</p>
                        <ul>
                            <li>Thu thập bằng chứng mới</li>
                            <li>Đưa ra lựa chọn đúng khi nói chuyện với nhân vật</li>
                            <li>Giải quyết thành công vụ án</li>
                        </ul>
                        <p>Số điểm càng cao, danh hiệu của bạn càng tốt!</p>
                    `
                },
                {
                    title: 'Quay lại bước trước',
                    content: `
                        <p>Nếu bạn muốn xem lại một địa điểm hoặc đối thoại trước đó, bạn có thể sử dụng nút <span class="highlight">Quay lại</span> ở phía trên màn hình.</p>
                        <p>Lưu ý rằng khi quay lại bước trước, bạn vẫn giữ nguyên tất cả bằng chứng và thông tin đã thu thập được.</p>
                    `
                },
                {
                    title: 'Giải quyết vụ án',
                    content: `
                        <p>Sau khi thu thập đủ bằng chứng và thông tin cần thiết, bạn sẽ đến giai đoạn cuối cùng - giải quyết vụ án.</p>
                        <p>Tại đây, bạn sẽ đưa ra quyết định dựa trên những gì đã phát hiện. Mỗi quyết định sẽ dẫn đến kết quả khác nhau.</p>
                        <p>Hãy suy nghĩ kỹ và đưa ra quyết định đúng đắn nhất!</p>
                        <p><strong>Nhấn vào nút Hướng dẫn bất cứ lúc nào để xem lại các hướng dẫn này.</strong></p>
                    `
                }
            ],
            'drug-school-1': [
                {
                    title: 'Vụ án: Bóng Ma Trong Trường',
                    content: `
                        <p>Trong vụ án này, bạn sẽ điều tra về tình trạng lan truyền chất gây nghiện trong một trường học.</p>
                        <p>Học sinh có biểu hiện bất thường và bạn cần tìm ra nguồn gốc cũng như ngăn chặn kịp thời.</p>
                        <p>Hãy chú ý đến:</p>
                        <ul>
                            <li>Lời khai của học sinh</li>
                            <li>Các địa điểm như nhà vệ sinh, phòng tủ đồ</li>
                            <li>Bằng chứng liên quan đến chất gây nghiện</li>
                        </ul>
                    `
                }
            ],
            'alcohol-family-1': [
                {
                    title: 'Vụ án: Bí Mật Gia Đình',
                    content: `
                        <p>Trong vụ án này, bạn sẽ điều tra một vụ tai nạn giao thông và khám phá bí mật về vấn đề nghiện rượu giấu kín trong một gia đình tưởng chừng hạnh phúc.</p>
                        <p>Hãy chú ý đến:</p>
                        <ul>
                            <li>Lời khai của các thành viên gia đình</li>
                            <li>Bằng chứng tại hiện trường tai nạn</li>
                            <li>Lịch sử y tế của nạn nhân</li>
                            <li>Các manh mối trong nhà nạn nhân</li>
                        </ul>
                    `
                }
            ],
            'drug-network-1': [
                {
                    title: 'Vụ án: Đường Dây Ma Túy',
                    content: `
                        <p>Trong vụ án này, bạn sẽ điều tra và triệt phá một đường dây ma túy lớn đang nhắm vào học sinh nhiều trường trong khu vực.</p>
                        <p>Đây là vụ án phức tạp, đòi hỏi sự phân tích kỹ lưỡng.</p>
                        <p>Hãy chú ý đến:</p>
                        <ul>
                            <li>Mối liên hệ giữa các địa điểm và nhân vật</li>
                            <li>Các bằng chứng kỹ thuật như dữ liệu cuộc gọi</li>
                            <li>Hoạt động đáng ngờ tại câu lạc bộ đêm</li>
                            <li>Các manh mối từ vụ án trước đó</li>
                        </ul>
                    `
                }
            ]
        };
        
        // Biến theo dõi trạng thái
        this.currentTutorialIndex = 0;
        this.currentTutorialType = 'general';
        this.isShowingTutorial = false;
        
        // Lịch sử bước chơi
        this.stepHistory = [];
    }

    /**
     * Khởi tạo tính năng hướng dẫn và quay lại
     */
    initialize() {
        console.log('Khởi tạo hệ thống hướng dẫn và quay lại...');
        
        // Lấy tham chiếu đến các phần tử DOM
        this.elements = {
            tutorialOverlay: document.getElementById('tutorial-overlay'),
            tutorialContent: document.getElementById('tutorial-content'),
            tutorialProgress: document.getElementById('tutorial-progress'),
            prevTutorial: document.getElementById('prev-tutorial'),
            nextTutorial: document.getElementById('next-tutorial'),
            closeTutorial: document.getElementById('close-tutorial'),
            showTutorial: document.getElementById('show-tutorial'),
            goBackStep: document.getElementById('go-back-step')
        };
        
        // Thiết lập sự kiện
        this.setupEventListeners();
        
        // Ban đầu, vô hiệu hóa nút quay lại vì chưa có bước nào để quay lại
        if (this.elements.goBackStep) {
            this.elements.goBackStep.disabled = true;
        }
        
        console.log('Khởi tạo hệ thống hướng dẫn và quay lại hoàn tất!');
    }

    /**
     * Thiết lập sự kiện
     */
    setupEventListeners() {
        if (!this.elements) return;
        
        // Sự kiện cho nút hiển thị hướng dẫn
        if (this.elements.showTutorial) {
            this.elements.showTutorial.addEventListener('click', () => {
                this.showTutorial();
            });
        }
        
        // Sự kiện cho nút đóng hướng dẫn
        if (this.elements.closeTutorial) {
            this.elements.closeTutorial.addEventListener('click', () => {
                this.hideTutorial();
            });
        }
        
        // Sự kiện cho nút chuyển trang hướng dẫn
        if (this.elements.prevTutorial) {
            this.elements.prevTutorial.addEventListener('click', () => {
                this.showPreviousTutorial();
            });
        }
        
        if (this.elements.nextTutorial) {
            this.elements.nextTutorial.addEventListener('click', () => {
                this.showNextTutorial();
            });
        }
        
        // Sự kiện cho nút quay lại bước trước
        if (this.elements.goBackStep) {
            this.elements.goBackStep.addEventListener('click', () => {
                this.goBackToPreviousStep();
            });
        }
    }

    /**
     * Hiển thị hướng dẫn
     * @param {string} tutorialType - Loại hướng dẫn ('general' hoặc ID của vụ án)
     */
    showTutorial(tutorialType = null) {
        // Nếu có chỉ định loại hướng dẫn, cập nhật loại hiện tại
        if (tutorialType) {
            this.currentTutorialType = tutorialType;
        } else if (this.game.gameState.currentCase) {
            // Nếu không có chỉ định và đang trong vụ án, dùng ID vụ án
            this.currentTutorialType = this.game.gameState.currentCase.id;
            
            // Nếu không có hướng dẫn cho vụ án cụ thể, dùng hướng dẫn chung
            if (!this.tutorialContent[this.currentTutorialType]) {
                this.currentTutorialType = 'general';
            }
        } else {
            // Mặc định là hướng dẫn chung
            this.currentTutorialType = 'general';
        }
        
        // Reset về trang đầu tiên
        this.currentTutorialIndex = 0;
        
        // Hiển thị nội dung
        this.updateTutorialContent();
        
        // Hiển thị overlay
        if (this.elements.tutorialOverlay) {
            this.elements.tutorialOverlay.style.display = 'flex';
            this.isShowingTutorial = true;
        }
    }

    /**
     * Ẩn hướng dẫn
     */
    hideTutorial() {
        if (this.elements.tutorialOverlay) {
            this.elements.tutorialOverlay.style.display = 'none';
            this.isShowingTutorial = false;
        }
    }

    /**
     * Cập nhật nội dung hướng dẫn
     */
    updateTutorialContent() {
        // Lấy danh sách hướng dẫn theo loại
        const tutorials = this.tutorialContent[this.currentTutorialType] || this.tutorialContent.general;
        
        // Đảm bảo chỉ số không vượt quá phạm vi
        if (this.currentTutorialIndex < 0) {
            this.currentTutorialIndex = 0;
        } else if (this.currentTutorialIndex >= tutorials.length) {
            this.currentTutorialIndex = tutorials.length - 1;
        }
        
        // Lấy nội dung hướng dẫn hiện tại
        const currentTutorial = tutorials[this.currentTutorialIndex];
        
        // Cập nhật nội dung
        if (this.elements.tutorialContent && currentTutorial) {
            this.elements.tutorialContent.innerHTML = `
                <h4>${currentTutorial.title}</h4>
                ${currentTutorial.content}
            `;
        }
        
        // Cập nhật chỉ số trang
        if (this.elements.tutorialProgress) {
            this.elements.tutorialProgress.textContent = `${this.currentTutorialIndex + 1}/${tutorials.length}`;
        }
        
        // Cập nhật trạng thái các nút
        if (this.elements.prevTutorial) {
            this.elements.prevTutorial.disabled = this.currentTutorialIndex === 0;
        }
        
        if (this.elements.nextTutorial) {
            this.elements.nextTutorial.disabled = this.currentTutorialIndex === tutorials.length - 1;
        }
    }

    /**
     * Hiển thị trang hướng dẫn trước
     */
    showPreviousTutorial() {
        this.currentTutorialIndex--;
        this.updateTutorialContent();
    }

    /**
     * Hiển thị trang hướng dẫn tiếp theo
     */
    showNextTutorial() {
        this.currentTutorialIndex++;
        this.updateTutorialContent();
    }

    /**
     * Lưu bước hiện tại vào lịch sử
     * @param {object} step - Thông tin bước hiện tại
     */
    saveCurrentStep(step) {
        if (!step) return;
        
        // Kiểm tra xem bước này đã có trong lịch sử chưa
        const hasStep = this.stepHistory.some(
            historyStep => historyStep.id === step.id
        );
        
        if (!hasStep) {
            // Thêm vào lịch sử
            this.stepHistory.push({
                id: step.id,
                narrative: step.narrative,
                location_id: step.location_id,
                actions: step.actions,
                dialogOptions: step.dialogOptions || [],
                isCharacterDialog: step.isCharacterDialog || false,
                characterId: step.characterId || null
            });
            
            // Kích hoạt nút quay lại nếu cần
            if (this.elements.goBackStep && this.stepHistory.length > 1) {
                this.elements.goBackStep.disabled = false;
            }
        }
    }

    /**
     * Quay lại bước trước đó
     */
    goBackToPreviousStep() {
        // Kiểm tra xem có bước nào để quay lại không
        if (this.stepHistory.length <= 1) {
            this.elements.goBackStep.disabled = true;
            return;
        }
        
        // Xóa bước hiện tại khỏi lịch sử
        this.stepHistory.pop();
        
        // Lấy bước trước đó
        const previousStep = this.stepHistory[this.stepHistory.length - 1];
        
        if (!previousStep) return;
        
        console.log('Quay lại bước trước:', previousStep);
        
        // Nếu là bước đối thoại với nhân vật
        if (previousStep.isCharacterDialog && previousStep.characterId) {
            const character = this.game.gameState.currentCase.characters.find(
                c => c.id === previousStep.characterId
            );
            
            if (character) {
                // Hiển thị lại đối thoại với nhân vật
                this.game.talkToCharacter(previousStep.characterId, true);
            }
        }
        // Nếu là bước khám xét địa điểm
        else if (previousStep.location_id) {
            const location = this.game.gameState.currentCase.locations.find(
                loc => loc.id === previousStep.location_id
            );
            
            if (location) {
                // Hiển thị lại địa điểm
                this.game.examineLocation(previousStep.location_id, true);
            }
        }
        // Trường hợp khác
        else {
            // Hiển thị lại bước
            this.game.ui.renderStep(previousStep);
        }
        
        // Vô hiệu hóa nút quay lại nếu đã về bước đầu tiên
        if (this.stepHistory.length <= 1) {
            this.elements.goBackStep.disabled = true;
        }
    }

    /**
     * Hiển thị thông báo hướng dẫn tự động khi bắt đầu vụ án
     * @param {string} caseId - ID của vụ án
     */
    showAutoTutorial(caseId) {
        // Kiểm tra xem đã từng xem hướng dẫn cho vụ án này chưa
        const hasSeenTutorial = localStorage.getItem(`seen_tutorial_${caseId}`);
        
        if (!hasSeenTutorial) {
            // Hiển thị hướng dẫn cho vụ án cụ thể nếu có
            if (this.tutorialContent[caseId]) {
                this.showTutorial(caseId);
            } else {
                // Nếu không có hướng dẫn riêng, hiển thị hướng dẫn chung
                this.showTutorial('general');
            }
            
            // Đánh dấu đã xem hướng dẫn
            localStorage.setItem(`seen_tutorial_${caseId}`, 'true');
        }
    }

    /**
     * Xóa lịch sử bước khi bắt đầu vụ án mới
     */
    clearStepHistory() {
        this.stepHistory = [];
        
        // Vô hiệu hóa nút quay lại
        if (this.elements.goBackStep) {
            this.elements.goBackStep.disabled = true;
        }
    }
} 