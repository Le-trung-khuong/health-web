/**
 * Detective Game - Script khởi tạo
 * Khởi tạo các thành phần cần thiết cho game
 */

// Khởi tạo các đối tượng chính cho game
let detectives = {};

document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('Khởi tạo game...');
        
        // Ẩn debug dialog
        const debugDialog = document.getElementById('dialog-debug');
        if (debugDialog) {
            debugDialog.style.display = 'none';
        }
        
        // Khởi tạo quản lý vụ án
        detectives.cases = new DetectiveCases();
        
        // Khởi tạo giao diện người dùng
        detectives.ui = new DetectiveUI();
        
        // Khởi tạo trò chơi chính
        detectives.game = new DetectiveGame(detectives.cases, detectives.ui);
        
        // Tải dữ liệu ban đầu
        detectives.cases.loadCases().then(() => {
            detectives.game.initialize();
            console.log('Game đã sẵn sàng!');
        }).catch(error => {
            console.error('Lỗi khởi tạo game:', error);
            detectives.ui.showErrorMessage('Không thể tải dữ liệu game. Vui lòng thử lại sau.');
        });
        
    } catch (error) {
        console.error('Lỗi nghiêm trọng khi khởi tạo game:', error);
        DetectiveErrorHandler.handleError(error);
    }
});

/**
 * Hàm mở khóa tất cả các vụ án (có thể gọi từ console)
 * @returns {number} Số lượng vụ án đã mở khóa
 */
function unlockAllCases() {
    try {
        // Kiểm tra xem game đã được khởi tạo chưa
        if (!detectives.cases) {
            console.error('Game chưa được khởi tạo!');
            return 0;
        }
        
        // Gọi hàm mở khóa từ đối tượng cases
        const unlockedCount = detectives.cases.unlockAllCases();
        
        // Làm mới giao diện để hiển thị các vụ án đã mở khóa
        if (detectives.game && typeof detectives.game.refreshCaseSelection === 'function') {
            detectives.game.refreshCaseSelection();
        } else {
            console.log('Vui lòng làm mới trang để thấy các vụ án đã mở khóa');
        }
        
        return unlockedCount;
    } catch (error) {
        console.error('Lỗi khi mở khóa các vụ án:', error);
        return 0;
    }
} 