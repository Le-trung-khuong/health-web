/**
 * Hiển thị thông báo lỗi
 * @param {string} message Thông báo lỗi
 * @param {string} title Tiêu đề của thông báo (tùy chọn)
 */
function showErrorMessage(message, title = 'Lỗi') {
    console.error(message);
    
    // Kiểm tra xem có thẻ error-message nào đang hiển thị không
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Tạo phần tử thông báo lỗi
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-container">
            <h3>${title}</h3>
            <p>${message}</p>
            <button onclick="this.parentNode.parentNode.remove()">Đóng</button>
        </div>
    `;
    
    // Thêm vào body
    document.body.appendChild(errorDiv);
    
    // Thêm sự kiện click bên ngoài để đóng
    errorDiv.addEventListener('click', function(event) {
        if (event.target === errorDiv) {
            errorDiv.remove();
        }
    });
}

// Export hàm nếu cần
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { showErrorMessage };
} 