/**
 * COMMUNITY COMPONENTS JAVASCRIPT
 * Quản lý các components và tương tác trong trang cộng đồng
 */

// =============================================
// GLOBAL VARIABLES & INITIALIZATION
// =============================================

// Biến toàn cục
const CommunityApp = {
    isLoggedIn: false,
    currentUserId: null,
    currentChatGroupId: null,
    chatPollingInterval: null,
    lastMessageId: 0,
    searchTimeout: null,
    
    // DOM Elements
    elements: {
        searchInput: null,
        searchResults: null,
        searchLoading: null,
        chatModal: null,
        chatMessages: null,
        chatInput: null,
        chatSendBtn: null
    },
    
    // Initialize app
    init: function(config = {}) {
        this.isLoggedIn = config.isLoggedIn || false;
        this.currentUserId = config.currentUserId || null;
        
        // Initialize DOM elements
        this.initializeElements();
        
        // Initialize components
        this.initializeSearch();
        this.initializeChat();
        this.initializePostInteractions();
        this.initializeResponsive();
        
        console.log('Community App initialized:', { isLoggedIn: this.isLoggedIn, currentUserId: this.currentUserId });
    },
    
    // Initialize DOM elements
    initializeElements: function() {
        this.elements = {
            searchInput: document.getElementById('userSearchInput'),
            searchResults: document.getElementById('searchResults'),
            searchLoading: document.getElementById('searchLoading'),
            chatModal: document.getElementById('chatModal'),
            chatMessages: document.getElementById('chatMessages'),
            chatInput: document.getElementById('chatInput'),
            chatSendBtn: document.getElementById('chatSendBtn')
        };
    }
};

// =============================================
// SEARCH COMPONENT
// =============================================

CommunityApp.initializeSearch = function() {
    if (!this.elements.searchInput) return;
    
    // Xử lý tìm kiếm với debounce
    this.elements.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Reset nếu input trống
        if (query.length === 0) {
            this.showNoResults('Nhập tên để tìm kiếm thành viên trong cộng đồng');
            return;
        }
        
        // Hiển thị loading
        this.showSearchLoading(true);
        
        // Debounce 500ms
        this.searchTimeout = setTimeout(() => {
            this.performUserSearch(query);
        }, 500);
    });
    
    // Focus effect
    this.elements.searchInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    this.elements.searchInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
};

CommunityApp.performUserSearch = function(query) {
    if (query.length < 2) {
        this.showNoResults('Vui lòng nhập ít nhất 2 ký tự');
        this.showSearchLoading(false);
        return;
    }
    
    fetch(`api/search_users.php?q=${encodeURIComponent(query)}&limit=10`)
        .then(response => response.json())
        .then(data => {
            this.showSearchLoading(false);
            
            if (data.success && data.users.length > 0) {
                this.displaySearchResults(data.users);
            } else {
                this.showNoResults(`Không tìm thấy người dùng nào với từ khóa "${query}"`);
            }
        })
        .catch(error => {
            console.error('Search error:', error);
            this.showSearchLoading(false);
            this.showNoResults('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại!');
        });
};

CommunityApp.displaySearchResults = function(users) {
    let html = '';
    
    users.forEach(user => {
        html += `
            <div class="user-item interactive" onclick="CommunityApp.viewUserProfile(${user.id}, '${user.username}')">
                <img src="${user.avatar_url}" 
                     class="user-avatar" 
                     alt="${user.username}" 
                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&size=48&background=6366f1&color=ffffff&rounded=true'">
                <div class="user-info">
                    <div class="user-name">
                        ${user.username}
                        ${user.post_count > 10 ? '<i class="fas fa-star" style="color: #f59e0b; font-size: 0.8rem;" title="Thành viên tích cực"></i>' : ''}
                    </div>
                    <div class="user-stats">
                        <span class="user-stat">
                            <i class="fas fa-edit"></i>
                            ${user.post_count} bài viết
                        </span>
                        <span class="user-stat">
                            <i class="fas fa-heart"></i>
                            ${user.total_likes} lượt thích
                        </span>
                        <span class="user-stat">
                            <i class="fas fa-calendar"></i>
                            Tham gia ${user.join_date}
                        </span>
                    </div>
                </div>
                <div class="user-actions" style="margin-left: auto;">
                    <button class="btn-icon" onclick="event.stopPropagation(); CommunityApp.sendDirectMessage('${user.username}')" title="Gửi tin nhắn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    this.elements.searchResults.innerHTML = html;
};

CommunityApp.showNoResults = function(message) {
    this.elements.searchResults.innerHTML = `
        <div class="no-results">
            <i class="fas fa-users"></i>
            <p>${message}</p>
        </div>
    `;
};

CommunityApp.showSearchLoading = function(show) {
    if (show) {
        this.elements.searchLoading.style.display = 'block';
        document.querySelector('.search-icon').style.display = 'none';
    } else {
        this.elements.searchLoading.style.display = 'none';
        document.querySelector('.search-icon').style.display = 'block';
    }
};

CommunityApp.viewUserProfile = function(userId, username) {
    // Tạo modal profile đẹp thay vì alert
    this.showUserProfileModal(userId, username);
};

CommunityApp.showUserProfileModal = function(userId, username) {
    const modal = document.createElement('div');
    modal.className = 'user-profile-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user"></i> Thông tin người dùng</h3>
                <button onclick="this.closest('.user-profile-modal').remove()" class="btn-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="user-profile-info">
                    <div class="user-basic-info">
                        <div class="username">${username}</div>
                        <div class="user-id">ID: ${userId}</div>
                    </div>
                    <div class="profile-actions">
                        <button class="btn btn-primary" onclick="CommunityApp.sendDirectMessage('${username}')">
                            <i class="fas fa-paper-plane"></i> Gửi tin nhắn
                        </button>
                        <button class="btn btn-secondary" onclick="CommunityApp.viewUserPosts(${userId})">
                            <i class="fas fa-eye"></i> Xem bài viết
                        </button>
                        <button class="btn btn-warning" onclick="CommunityApp.followUser(${userId})">
                            <i class="fas fa-user-plus"></i> Theo dõi
                        </button>
                    </div>
                    <div class="development-notice">
                        <i class="fas fa-info-circle"></i>
                        <p>Tính năng profile chi tiết đang được phát triển!</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animation
    setTimeout(() => modal.classList.add('show'), 10);
};

CommunityApp.sendDirectMessage = function(username) {
    // TODO: Implement direct messaging
    this.showNotification(`Tính năng gửi tin nhắn cho ${username} đang được phát triển!`, 'info');
};

CommunityApp.viewUserPosts = function(userId) {
    // TODO: Implement view user posts
    this.showNotification('Tính năng xem bài viết của người dùng đang được phát triển!', 'info');
};

CommunityApp.followUser = function(userId) {
    // TODO: Implement follow user
    this.showNotification('Tính năng theo dõi người dùng đang được phát triển!', 'info');
};

// =============================================
// CHAT COMPONENT
// =============================================

CommunityApp.initializeChat = function() {
    if (!this.elements.chatInput) return;
    
    // Xử lý Enter trong chat input
    this.elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendChatMessage();
        }
    });
    
    // Xử lý click vào backdrop để đóng modal
    if (this.elements.chatModal) {
        this.elements.chatModal.addEventListener('click', (e) => {
            if (e.target === this.elements.chatModal) {
                this.closeChatModal();
            }
        });
    }
};

CommunityApp.openChatModal = function(groupId, groupName) {
    if (!this.isLoggedIn) {
        this.showNotification('Bạn cần đăng nhập để sử dụng chat!', 'warning');
        return;
    }
    
    this.currentChatGroupId = groupId;
    document.getElementById('chatGroupName').textContent = groupName;
    this.elements.chatModal.style.display = 'flex';
    
    // Reset và load messages
    this.elements.chatMessages.innerHTML = '<div class="loading-message">Đang tải tin nhắn...</div>';
    this.loadChatMessages();
    this.startChatPolling();
    
    // Focus input
    this.elements.chatInput.focus();
    
    // Update last seen
    this.updateLastSeen(groupId);
    
    // Add animation
    this.elements.chatModal.classList.add('show');
};

CommunityApp.closeChatModal = function() {
    this.elements.chatModal.style.display = 'none';
    this.elements.chatModal.classList.remove('show');
    this.currentChatGroupId = null;
    
    // Dừng polling
    if (this.chatPollingInterval) {
        clearInterval(this.chatPollingInterval);
        this.chatPollingInterval = null;
    }
    
    // Reload trang để cập nhật unread count
    setTimeout(() => location.reload(), 300);
};

CommunityApp.sendChatMessage = function() {
    const message = this.elements.chatInput.value.trim();
    
    if (!message || !this.currentChatGroupId) return;
    
    this.elements.chatSendBtn.disabled = true;
    this.elements.chatSendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    fetch('api/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'send_message',
            group_id: this.currentChatGroupId,
            message: message
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            this.elements.chatInput.value = '';
            this.loadChatMessages();
        } else {
            this.showNotification(data.message || 'Lỗi khi gửi tin nhắn!', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        this.showNotification('Lỗi kết nối!', 'error');
    })
    .finally(() => {
        this.elements.chatSendBtn.disabled = false;
        this.elements.chatSendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        this.elements.chatInput.focus();
    });
};

// =============================================
// POST INTERACTIONS
// =============================================

CommunityApp.initializePostInteractions = function() {
    // Like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            this.handleLike(e.target.closest('.like-btn'));
        });
    });
    
    // Auto-resize textarea
    const postInput = document.querySelector('.post-input');
    if (postInput) {
        postInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }
};

CommunityApp.handleLike = function(btn) {
    if (!this.isLoggedIn) {
        this.showNotification('Vui lòng đăng nhập để thích bài viết!', 'warning');
        return;
    }
    
    const postId = btn.dataset.postId;
    
    fetch('api/like.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({post_id: postId})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            btn.classList.toggle('liked');
            
            // Update like count
            const postCard = btn.closest('.post-card');
            const statsSection = postCard.querySelector('.post-stats');
            if (data.likes_count > 0) {
                statsSection.innerHTML = `<span><i class="fas fa-heart" style="color: var(--danger-color);"></i> ${data.likes_count} lượt thích</span>`;
            } else {
                statsSection.innerHTML = '';
            }
            
            // Animation effect
            btn.style.animation = 'pulse 0.3s ease';
            setTimeout(() => btn.style.animation = '', 300);
            
        } else {
            this.showNotification('Có lỗi xảy ra khi thích bài viết!', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        this.showNotification('Có lỗi kết nối!', 'error');
    });
};

// =============================================
// RESPONSIVE HANDLER
// =============================================

CommunityApp.initializeResponsive = function() {
    // Mobile menu toggle
    this.handleMobileMenus();
    
    // Resize handler
    window.addEventListener('resize', () => {
        this.handleResize();
    });
    
    // Initial resize
    this.handleResize();
};

CommunityApp.handleMobileMenus = function() {
    // Mobile chat modal
    if (window.innerWidth <= 768 && this.elements.chatModal) {
        this.elements.chatModal.addEventListener('touchstart', (e) => {
            if (e.target === this.elements.chatModal) {
                this.closeChatModal();
            }
        });
    }
};

CommunityApp.handleResize = function() {
    const width = window.innerWidth;
    
    // Adjust chat modal for mobile
    if (width <= 768 && this.elements.chatModal) {
        const chatContainer = this.elements.chatModal.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.style.width = '100%';
            chatContainer.style.height = '100%';
            chatContainer.style.borderRadius = '0';
        }
    }
    
    // Adjust search results height
    if (this.elements.searchResults && width <= 480) {
        this.elements.searchResults.style.maxHeight = '250px';
    }
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

CommunityApp.showNotification = function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Show animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
};

CommunityApp.formatTimeAgo = function(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
};

// =============================================
// GLOBAL FUNCTIONS (for backward compatibility)
// =============================================

// Chat functions
function openChatModal(groupId, groupName) {
    CommunityApp.openChatModal(groupId, groupName);
}

function closeChatModal() {
    CommunityApp.closeChatModal();
}

function sendChatMessage() {
    CommunityApp.sendChatMessage();
}

// Search functions
function viewUserProfile(userId, username) {
    CommunityApp.viewUserProfile(userId, username);
}

// Notification function
function showNotification(message, type) {
    CommunityApp.showNotification(message, type);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommunityApp;
}

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    CommunityApp.init();
}); 