/**
 * Detective Error Handler - Xử lý các lỗi cho game Nhà Điều Tra Tệ Nạn
 */

class DetectiveErrorHandler {
    /**
     * Khởi tạo error handler
     */
    static initialize() {
        console.log('Khởi tạo hệ thống xử lý lỗi...');
        
        // Bắt tất cả các lỗi không được xử lý
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
        
        // Ghi đè fetch API để xử lý lỗi
        this.overrideFetch();
        
        console.log('Đã khởi tạo hệ thống xử lý lỗi');
    }
    
    /**
     * Xử lý lỗi toàn cục
     * @param {ErrorEvent} event - Sự kiện lỗi
     */
    static handleGlobalError(event) {
        console.error('Lỗi không được xử lý:', event.error || event.message);
        
        // Lưu thông tin lỗi để gỡ lỗi
        this.saveErrorInfo({
            type: 'runtime',
            message: event.message,
            stack: event.error ? event.error.stack : '',
            source: event.filename,
            line: event.lineno,
            column: event.colno,
            timestamp: new Date().toISOString()
        });
        
        // Hiển thị thông báo lỗi thân thiện với người dùng
        this.showErrorToUser('Đã xảy ra lỗi', 'Vui lòng tải lại trang và thử lại.');
        
        // Ngăn browser hiển thị lỗi mặc định
        event.preventDefault();
    }
    
    /**
     * Xử lý lỗi Promise không được xử lý
     * @param {PromiseRejectionEvent} event - Sự kiện từ chối Promise
     */
    static handlePromiseError(event) {
        console.error('Promise không được xử lý:', event.reason);
        
        // Lưu thông tin lỗi để gỡ lỗi
        this.saveErrorInfo({
            type: 'promise',
            message: event.reason ? event.reason.message : 'Promise bị từ chối',
            stack: event.reason && event.reason.stack ? event.reason.stack : '',
            timestamp: new Date().toISOString()
        });
        
        // Hiển thị thông báo lỗi thân thiện với người dùng nếu cần
        // this.showErrorToUser('Đã xảy ra lỗi', 'Vui lòng tải lại trang và thử lại.');
        
        // Ngăn browser hiển thị lỗi mặc định
        event.preventDefault();
    }
    
    /**
     * Ghi đè fetch API để xử lý lỗi
     */
    static overrideFetch() {
        const originalFetch = window.fetch;
        
        window.fetch = async function(...args) {
            try {
                const response = await originalFetch.apply(this, args);
                
                // Xử lý các phản hồi không thành công
                if (!response.ok) {
                    console.warn(`HTTP error ${response.status}: ${response.statusText}`, args[0]);
                    
                    // Lưu thông tin lỗi
                    DetectiveErrorHandler.saveErrorInfo({
                        type: 'fetch',
                        url: typeof args[0] === 'string' ? args[0] : args[0].url,
                        status: response.status,
                        statusText: response.statusText,
                        timestamp: new Date().toISOString()
                    });
                }
                
                return response;
            } catch (error) {
                console.error('Lỗi fetch:', error);
                
                // Lưu thông tin lỗi
                DetectiveErrorHandler.saveErrorInfo({
                    type: 'fetch',
                    url: typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : 'unknown'),
                    message: error.message,
                    stack: error.stack,
                    timestamp: new Date().toISOString()
                });
                
                throw error;
            }
        };
    }
    
    /**
     * Lưu thông tin lỗi vào localStorage
     * @param {object} errorInfo - Thông tin lỗi
     */
    static saveErrorInfo(errorInfo) {
        try {
            // Lấy danh sách lỗi hiện có
            const errorsJson = localStorage.getItem('detective_errors');
            const errors = errorsJson ? JSON.parse(errorsJson) : [];
            
            // Thêm lỗi mới vào đầu danh sách
            errors.unshift(errorInfo);
            
            // Giới hạn số lượng lỗi lưu trữ
            const maxErrors = 10;
            if (errors.length > maxErrors) {
                errors.length = maxErrors;
            }
            
            // Lưu lại danh sách lỗi
            localStorage.setItem('detective_errors', JSON.stringify(errors));
            
            // Cập nhật thông tin browserInfo, gameState hiện tại
            this.updateDebugInfo({
                lastError: errorInfo
            });
        } catch (e) {
            console.error('Không thể lưu thông tin lỗi:', e);
        }
    }
    
    /**
     * Cập nhật thông tin gỡ lỗi
     * @param {object} additionalInfo - Thông tin bổ sung
     */
    static updateDebugInfo(additionalInfo = {}) {
        try {
            // Lấy thông tin hiện có
            const debugInfoJson = localStorage.getItem('debugInfo');
            const debugInfo = debugInfoJson ? JSON.parse(debugInfoJson) : {};
            
            // Cập nhật thông tin trình duyệt nếu chưa có
            if (!debugInfo.browserInfo) {
                debugInfo.browserInfo = {
                    userAgent: navigator.userAgent,
                    language: navigator.language,
                    platform: navigator.platform
                };
            }
            
            // Thêm thông tin bổ sung
            Object.assign(debugInfo, additionalInfo);
            
            // Lưu lại thông tin gỡ lỗi
            localStorage.setItem('debugInfo', JSON.stringify(debugInfo));
        } catch (e) {
            console.error('Không thể cập nhật thông tin gỡ lỗi:', e);
        }
    }
    
    /**
     * Hiển thị thông báo lỗi thân thiện với người dùng
     * @param {string} title - Tiêu đề lỗi
     * @param {string} message - Nội dung lỗi
     */
    static showErrorToUser(title, message) {
        // Kiểm tra xem đã có thông báo lỗi nào đang hiển thị chưa
        if (document.querySelector('.error-dialog')) {
            return;
        }
        
        // Tạo element thông báo lỗi
        const errorDialog = document.createElement('div');
        errorDialog.className = 'error-dialog';
        errorDialog.innerHTML = `
            <div class="error-content">
                <div class="error-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> ${title}</h3>
                    <button class="error-close">&times;</button>
                </div>
                <div class="error-body">
                    <p>${message}</p>
                </div>
                <div class="error-footer">
                    <button class="btn-reload">Tải lại trang</button>
                </div>
            </div>
        `;
        
        // Thêm vào body
        document.body.appendChild(errorDialog);
        
        // Xử lý sự kiện
        const closeBtn = errorDialog.querySelector('.error-close');
        const reloadBtn = errorDialog.querySelector('.btn-reload');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                errorDialog.remove();
            });
        }
        
        if (reloadBtn) {
            reloadBtn.addEventListener('click', () => {
                window.location.reload();
            });
        }
        
        // Thêm CSS cho thông báo lỗi
        if (!document.getElementById('error-dialog-style')) {
            const style = document.createElement('style');
            style.id = 'error-dialog-style';
            style.textContent = `
                .error-dialog {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                }
                .error-content {
                    background-color: #fff;
                    border-radius: 8px;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                }
                .error-header {
                    background-color: #f8d7da;
                    color: #721c24;
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f5c6cb;
                }
                .error-header h3 {
                    margin: 0;
                    font-size: 18px;
                }
                .error-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #721c24;
                }
                .error-body {
                    padding: 20px;
                    color: #333;
                }
                .error-footer {
                    padding: 15px 20px;
                    text-align: right;
                    background-color: #f8f9fa;
                    border-top: 1px solid #e9ecef;
                }
                .btn-reload {
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                }
                .btn-reload:hover {
                    background-color: #0069d9;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Hiển thị lỗi có thể phục hồi và thông báo cách giải quyết
     * @param {string} title - Tiêu đề lỗi
     * @param {string} message - Thông điệp lỗi
     * @param {string} type - Loại thông báo ('error', 'warning', 'info')
     * @param {number} duration - Thời gian hiển thị (ms), mặc định là 5000ms
     */
    static showRecoverableError(title, message, type = 'warning', duration = 5000) {
        console.warn('Lỗi có thể phục hồi:', title, message);
        
        // Kiểm tra xem đã có UI được khởi tạo chưa
        if (window.detectiveGame && window.detectiveGame.ui) {
            window.detectiveGame.ui.showNotification(title, message, type, duration);
        } else {
            // Nếu chưa có UI, tạo thông báo trực tiếp
            const notificationContainer = document.createElement('div');
            notificationContainer.className = `detective-notification ${type}`;
            notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 350px;
                background-color: ${type === 'error' ? '#e74c3c' : (type === 'warning' ? '#f39c12' : '#3498db')};
                color: white;
                padding: 15px;
                border-radius: 5px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
                word-wrap: break-word;
            `;
            
            notificationContainer.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px;">${title}</div>
                <div>${message}</div>
                <button style="margin-top: 10px; padding: 5px 10px; background: rgba(255,255,255,0.3); border: none; color: white; border-radius: 3px; cursor: pointer;">Đóng</button>
            `;
            
            document.body.appendChild(notificationContainer);
            
            // Hiển thị thông báo
            setTimeout(() => {
                notificationContainer.style.opacity = '1';
            }, 10);
            
            // Thêm sự kiện cho nút đóng
            const closeButton = notificationContainer.querySelector('button');
            closeButton.addEventListener('click', () => {
                notificationContainer.style.opacity = '0';
                setTimeout(() => {
                    notificationContainer.remove();
                }, 300);
            });
            
            // Tự động đóng
            if (duration > 0) {
                setTimeout(() => {
                    if (document.body.contains(notificationContainer)) {
                        notificationContainer.style.opacity = '0';
                        setTimeout(() => {
                            if (document.body.contains(notificationContainer)) {
                                notificationContainer.remove();
                            }
                        }, 300);
                    }
                }, duration);
            }
        }
    }
    
    /**
     * Xử lý lỗi kết nối database
     * @param {Error} error - Lỗi kết nối 
     * @param {string} action - Hành động đang thực hiện khi gặp lỗi
     */
    static handleDatabaseError(error, action = 'kết nối database') {
        console.error(`Lỗi ${action}:`, error);
        
        // Đánh dấu lỗi database để chuyển sang chế độ offline
        document.cookie = "db_connection_failed=true; path=/; max-age=300"; // Lưu cookie trong 5 phút
        localStorage.setItem('dbErrorTimestamp', Date.now());
        
        // Hiển thị thông báo
        this.showRecoverableError(
            'Không thể kết nối đến cơ sở dữ liệu',
            'Đang chuyển sang chế độ ngoại tuyến với dữ liệu mẫu. Một số tính năng có thể bị hạn chế.',
            'warning', 
            8000
        );
        
        // Ghi log lỗi để phân tích sau
        if (navigator.onLine) {
            const errorData = {
                timestamp: Date.now(),
                action: action,
                message: error.message,
                stack: error.stack,
                browserInfo: navigator.userAgent
            };
            
            localStorage.setItem('lastDatabaseError', JSON.stringify(errorData));
        }
        
        // Force local mode
        localStorage.setItem('forceLocalMode', 'true');
        
        return true; // Đã xử lý lỗi
    }
}

// Khởi tạo error handler khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    DetectiveErrorHandler.initialize();
}); 