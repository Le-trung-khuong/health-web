/**
 * Detective Debug - Công cụ hỗ trợ debug
 * Thêm các tính năng hỗ trợ cho nhà phát triển
 */

// Chờ cho trang tải xong
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xem có đang ở chế độ debug không (có thể kích hoạt bằng cách thêm ?debug=true vào URL)
    const isDebugMode = window.location.search.includes('debug=true');
    
    if (isDebugMode) {
        console.log('Chế độ debug được kích hoạt!');
        initDebugTools();
    }
    
    // Thêm phím tắt Ctrl+Shift+D để kích hoạt chế độ debug
    document.addEventListener('keydown', function(event) {
        // Ctrl+Shift+D (hoặc Cmd+Shift+D trên Mac)
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
            console.log('Kích hoạt chế độ debug bằng phím tắt!');
            initDebugTools();
        }
    });
});

/**
 * Khởi tạo các công cụ debug
 */
function initDebugTools() {
    // Ẩn dialog-debug vì chỉ dành cho nhà phát triển
    const debugDialog = document.getElementById('dialog-debug');
    if (debugDialog) {
        debugDialog.style.display = 'none';
    }
    
    // Tạo panel debug
    createDebugPanel();
    
    // Thêm các chức năng debug khác nếu cần
}

/**
 * Tạo panel debug
 */
function createDebugPanel() {
    // Kiểm tra xem panel đã tồn tại chưa
    if (document.getElementById('debug-panel')) {
        console.log('Debug panel đã tồn tại!');
        return;
    }
    
    // Tạo panel
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.className = 'debug-panel';
    
    // CSS cho panel
    panel.style.position = 'fixed';
    panel.style.bottom = '10px';
    panel.style.right = '10px';
    panel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    panel.style.color = 'white';
    panel.style.padding = '10px';
    panel.style.borderRadius = '5px';
    panel.style.zIndex = '9999';
    panel.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    
    // Tiêu đề
    const title = document.createElement('div');
    title.textContent = 'Debug Tools';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '10px';
    title.style.borderBottom = '1px solid #555';
    title.style.paddingBottom = '5px';
    panel.appendChild(title);
    
    // Nút mở khóa tất cả vụ án
    const unlockButton = document.createElement('button');
    unlockButton.textContent = 'Mở khóa tất cả vụ án';
    unlockButton.style.padding = '5px 10px';
    unlockButton.style.margin = '5px';
    unlockButton.style.backgroundColor = '#4CAF50';
    unlockButton.style.color = 'white';
    unlockButton.style.border = 'none';
    unlockButton.style.borderRadius = '3px';
    unlockButton.style.cursor = 'pointer';
    unlockButton.onclick = function() {
        const count = unlockAllCases();
        alert(`Đã mở khóa ${count} vụ án!`);
    };
    panel.appendChild(unlockButton);
    
    // Thêm panel vào trang
    document.body.appendChild(panel);
    console.log('Đã tạo debug panel!');
}

/**
 * Ẩn/hiện panel debug
 */
function toggleDebugPanel() {
    const panel = document.getElementById('debug-panel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
} 