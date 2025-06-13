document.addEventListener('DOMContentLoaded', function() {
    const newPostForm = document.getElementById('new-post-form');
    const postContentInput = document.getElementById('post-content');
    const charCount = document.getElementById('char-count');
    const postsFeed = document.getElementById('posts-feed');
    const noPostsMessage = document.getElementById('no-posts-message');
    const postImageUpload = document.getElementById('post-image-upload');
    const postImagePreview = document.getElementById('post-image-preview');
    const removeImageBtn = document.getElementById('remove-image-btn');

    let posts = JSON.parse(localStorage.getItem('communityPosts')) || [];

    renderPosts();

    if (postContentInput && charCount) {
        postContentInput.addEventListener('input', function() {
            charCount.textContent = `${this.value.length}/500`;
        });
    }

    if (postImageUpload && postImagePreview && removeImageBtn) {
        postImageUpload.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    postImagePreview.src = e.target.result;
                    postImagePreview.style.display = 'block';
                    removeImageBtn.style.display = 'inline-block';
                }
                reader.readAsDataURL(file);
            }
        });

        removeImageBtn.addEventListener('click', function() {
            postImageUpload.value = null; // Xóa file đã chọn
            postImagePreview.src = '#';
            postImagePreview.style.display = 'none';
            this.style.display = 'none';
        });
    }

    if (newPostForm) {
        newPostForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const content = postContentInput.value.trim();
            const imageFile = postImageUpload.files[0];

            if (content === '' && !imageFile) {
                showToast('Vui lòng nhập nội dung hoặc chọn ảnh.', 'warning');
                return;
            }
            if (content.length > 500) {
                showToast('Nội dung bài viết không được quá 500 ký tự.', 'warning');
                return;
            }

            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const authorName = userInfo ? userInfo.name : 'Người dùng ẩn danh';
            const avatarInitial = authorName ? authorName.charAt(0).toUpperCase() : 'A';


            const newPost = {
                id: Date.now(),
                author: authorName,
                avatarChar: avatarInitial,
                timestamp: new Date().toLocaleString('vi-VN'),
                content: content,
                image: null,
                likes: 0,
                comments: [],
                likedByUser: false
            };

            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    newPost.image = e.target.result;
                    addPostToList(newPost); // Gọi hàm đã sửa tên
                }
                reader.readAsDataURL(imageFile);
            } else {
                addPostToList(newPost); // Gọi hàm đã sửa tên
            }
        });
    }

    function addPostToList(post) { // Đổi tên hàm này
        posts.unshift(post);
        savePosts();
        renderPosts();
        resetPostForm(); // Reset form sau khi thêm thành công
        showToast('Đăng bài thành công!', 'success');
    }

    function resetPostForm() {
        if(postContentInput) postContentInput.value = '';
        if(charCount) charCount.textContent = '0/500';
        if(postImageUpload) postImageUpload.value = null;
        if(postImagePreview) {
            postImagePreview.src = '#';
            postImagePreview.style.display = 'none';
        }
        if(removeImageBtn) removeImageBtn.style.display = 'none';
    }

    function renderPosts() {
        if (!postsFeed) return;
        
        // Xóa các bài viết cũ, giữ lại h2 và noPostsMessage
        const existingPostItems = postsFeed.querySelectorAll('.post-item');
        existingPostItems.forEach(item => item.remove());

        if (posts.length === 0) {
            if (noPostsMessage) noPostsMessage.style.display = 'block';
        } else {
            if (noPostsMessage) noPostsMessage.style.display = 'none';
            posts.forEach(post => {
                const postElement = createPostElement(post);
                postsFeed.appendChild(postElement);
            });
        }
    }

    function createPostElement(post) {
        const postItem = document.createElement('div');
        postItem.classList.add('post-item');
        postItem.setAttribute('data-post-id', post.id);

        let imageHTML = '';
        if (post.image) {
            imageHTML = `<img src="${post.image}" alt="Ảnh bài viết" class="post-image">`;
        }

        postItem.innerHTML = `
            <div class="post-header">
                <div class="post-avatar">${post.avatarChar}</div>
                <div class="post-author-time">
                    <h5>${escapeHTML(post.author)}</h5>
                    <p>${post.timestamp}</p>
                </div>
            </div>
            <div class="post-content-text">${escapeHTML(post.content)}</div>
            ${imageHTML}
            <div class="post-actions">
                <button class="post-action-btn like-btn ${post.likedByUser ? 'liked' : ''}">
                    <i class="fas ${post.likedByUser ? 'fa-thumbs-up' : 'fa-thumbs-up'}"></i> Thích 
                    <span class="like-count">${post.likes}</span>
                </button>
                <button class="post-action-btn comment-toggle-btn">
                    <i class="fas fa-comment"></i> Bình luận 
                    <span class="comment-count">${post.comments.length}</span>
                </button>
                <button class="post-action-btn share-btn">
                    <i class="fas fa-share"></i> Chia sẻ
                </button>
            </div>
            <div class="comments-section" style="display: none;">
                <!-- Nội dung bình luận sẽ được render riêng -->
            </div>
        `;

        const likeBtn = postItem.querySelector('.like-btn');
        likeBtn.addEventListener('click', () => toggleLike(post.id, likeBtn));

        const commentToggleBtn = postItem.querySelector('.comment-toggle-btn');
        const commentsSection = postItem.querySelector('.comments-section');
        commentToggleBtn.addEventListener('click', () => {
            const isHidden = commentsSection.style.display === 'none' || commentsSection.style.display === '';
            commentsSection.style.display = isHidden ? 'block' : 'none';
            if (isHidden) {
                renderCommentsForPost(post.id, commentsSection); // Render comments khi mở
            }
        });

        const shareBtn = postItem.querySelector('.share-btn');
        shareBtn.addEventListener('click', () => sharePost(post.id));

        return postItem;
    }

    function renderCommentsForPost(postId, commentsSectionElement) {
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        let commentsHTML = '';
        if (post.comments.length === 0) {
            commentsHTML = '<p class="no-comments-message-inner">Chưa có bình luận nào.</p>';
        } else {
            commentsHTML = post.comments.map(comment => `
                <div class="comment-item">
                    <div class="comment-avatar">${comment.avatarChar}</div>
                    <div class="comment-content">
                        <strong>${escapeHTML(comment.author)}</strong>
                        <p>${escapeHTML(comment.content)}</p>
                        <span class="comment-time">${comment.timestamp}</span>
                    </div>
                </div>
            `).join('');
        }

        commentsSectionElement.innerHTML = `
            ${commentsHTML}
            <form class="comment-form">
                <textarea placeholder="Viết bình luận..." required></textarea>
                <button type="submit" class="btn btn-sm">Gửi</button>
            </form>
        `;

        const commentForm = commentsSectionElement.querySelector('.comment-form');
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const commentTextarea = commentForm.querySelector('textarea');
            const commentContent = commentTextarea.value.trim();
            if (commentContent) {
                addComment(postId, commentContent);
                commentTextarea.value = '';
                renderCommentsForPost(postId, commentsSectionElement); // Re-render comments in this section
            }
        });
    }


    function toggleLike(postId, likeBtn) {
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex > -1) {
            posts[postIndex].likedByUser = !posts[postIndex].likedByUser;
            posts[postIndex].likes += posts[postIndex].likedByUser ? 1 : -1;

            likeBtn.classList.toggle('liked', posts[postIndex].likedByUser);
            likeBtn.querySelector('i').classList.toggle('fas', posts[postIndex].likedByUser); // Solid icon
            likeBtn.querySelector('i').classList.toggle('far', !posts[postIndex].likedByUser); // Regular icon (cần FontAwesome Pro hoặc chỉnh lại)
                                                                                            // Nếu dùng FA Free, cả hai đều là fas, chỉ đổi class 'liked'
            likeBtn.querySelector('.like-count').textContent = posts[postIndex].likes;
            savePosts();
        }
    }

    function sharePost(postId) {
        const post = posts.find(p => p.id === postId);
        if(post) {
            const shareUrl = window.location.href + '#post-' + postId; // Tạo một URL giả định
            const shareText = `Xem bài viết này: "${post.content.substring(0, 50)}..." trên Cộng Đồng Vì Một Xã Hội Khỏe Mạnh!`;

            if (navigator.share) {
                navigator.share({
                    title: 'Chia sẻ từ Cộng Đồng Vì Một Xã Hội Khỏe Mạnh',
                    text: shareText,
                    url: shareUrl,
                })
                .then(() => showToast('Đã chia sẻ bài viết!', 'success'))
                .catch((error) => console.error('Lỗi khi chia sẻ:', error));
            } else {
                const dummyTextArea = document.createElement("textarea");
                document.body.appendChild(dummyTextArea);
                dummyTextArea.value = `${shareText} ${shareUrl}`;
                dummyTextArea.select();
                try {
                    document.execCommand('copy');
                    showToast('Đã sao chép liên kết vào clipboard.', 'info');
                } catch (err) {
                    prompt("Sao chép liên kết này:", `${shareText} ${shareUrl}`);
                }
                document.body.removeChild(dummyTextArea);
            }
        }
    }

    function addComment(postId, content) {
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex > -1) {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const authorName = userInfo ? userInfo.name : 'Khách';
            const avatarInitial = authorName ? authorName.charAt(0).toUpperCase() : 'K';

            const newComment = {
                author: authorName,
                avatarChar: avatarInitial,
                timestamp: new Date().toLocaleString('vi-VN'),
                content: content
            };
            posts[postIndex].comments.push(newComment);
            savePosts();

            // Cập nhật số lượng bình luận trên nút
            const postElement = document.querySelector(`.post-item[data-post-id="${postId}"]`);
            if (postElement) {
                const commentCountSpan = postElement.querySelector('.comment-count');
                if(commentCountSpan) commentCountSpan.textContent = posts[postIndex].comments.length;

                // Nếu phần bình luận đang mở, render lại nó
                const commentsSection = postElement.querySelector('.comments-section');
                if (commentsSection.style.display === 'block') {
                    renderCommentsForPost(postId, commentsSection);
                }
            }
        }
    }

    function savePosts() {
        localStorage.setItem('communityPosts', JSON.stringify(posts));
    }

    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>"']/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[match];
        });
    }

    // Load theme từ localStorage khi trang community tải
    const themeToggle = document.querySelector('.theme-toggle'); // Lấy lại nút theme-toggle trên trang này
    if (themeToggle) { // Kiểm tra lại nếu themeToggle tồn tại
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        // Sự kiện click đã được xử lý trong main.js, nhưng nếu main.js không được load
        // hoặc để chắc chắn, bạn có thể thêm lại listener ở đây:
        // themeToggle.addEventListener('click', function() { /* copy logic từ main.js */ });
    }

    // Hàm showToast nên được định nghĩa ở main.js và được load trước
    // Nếu không, bạn cần định nghĩa lại ở đây hoặc đảm bảo thứ tự load script
    if (typeof window.showToast !== 'function') {
        window.showToast = function(message, type = 'info') {
            console.warn("showToast function is not globally available. Using alert as fallback.");
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }

});