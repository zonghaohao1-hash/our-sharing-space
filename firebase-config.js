// Firebase 配置 - 已更新为您的配置
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getDatabase, ref, push, set, onValue, orderByKey, limitToLast, query } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyAll5S5iiCkXcpaVN9Ao7oQ-kQaGOAD3-A",
  authDomain: "our-sharing-space.firebaseapp.com",
  databaseURL: "https://our-sharing-space-default-rtdb.firebaseio.com",
  projectId: "our-sharing-space",
  storageBucket: "our-sharing-space.firebasestorage.app",
  messagingSenderId: "368313136195",
  appId: "1:368313136195:web:157ebd1835a983cc3f50f6",
  measurementId: "G-71CY3DVM2Q"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Base64图片编码（100%可行，无需网络请求）
window.uploadImage = async function(file) {
    try {
        console.log('使用Base64编码图片:', file.name);
        
        // 检查文件大小（建议限制在2MB以内）
        if (file.size > 2 * 1024 * 1024) {
            throw new Error('图片大小不能超过2MB，请选择较小的图片');
        }
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                console.log('图片Base64编码完成');
                resolve(e.target.result); // 返回data:image/jpeg;base64,...格式
            };
            reader.onerror = function(error) {
                reject(new Error('图片读取失败: ' + error));
            };
            reader.readAsDataURL(file);
        });
    } catch (error) {
        console.error("图片处理失败: ", error);
        throw error;
    }
};

// 添加新内容（支持图片）
window.addPost = async function(author, content, imageUrl = null) {
    try {
        const postsRef = ref(database, 'posts');
        const newPostRef = push(postsRef);
        
        await set(newPostRef, {
            author: author,
            content: content,
            imageUrl: imageUrl, // 新增图片URL字段
            timestamp: new Date().toISOString(),
            comments: {}
        });
        
        return true;
    } catch (error) {
        console.error("添加内容错误: ", error);
        throw error;
    }
};

// 添加评论
window.addComment = async function(postId, author, content) {
    try {
        const commentsRef = ref(database, `posts/${postId}/comments`);
        const newCommentRef = push(commentsRef);
        
        await set(newCommentRef, {
            author: author,
            content: content,
            timestamp: new Date().toISOString()
        });
        
        return true;
    } catch (error) {
        console.error("添加评论错误: ", error);
        throw error;
    }
};

// 加载所有内容
window.loadPosts = async function() {
    try {
        const postsContainer = document.getElementById('postsContainer');
        postsContainer.innerHTML = '<div class="empty-state"><h3>加载中...</h3></div>';
        
        const postsRef = ref(database, 'posts');
        const postsQuery = query(postsRef, orderByKey());
        
        onValue(postsQuery, (snapshot) => {
            const postsData = snapshot.val();
            
            if (!postsData) {
                postsContainer.innerHTML = `
                    <div class="empty-state">
                        <h3>还没有任何分享</h3>
                        <p>发布第一条内容开始记录吧</p>
                    </div>
                `;
                return;
            }
            
            // 转换数据为数组并按时间排序
            const postsArray = Object.entries(postsData).map(([id, post]) => ({
                id,
                ...post
            })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            let postsHTML = '';
            
            postsArray.forEach((post) => {
                const date = new Date(post.timestamp);
                const dateString = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                
                let commentsHTML = '';
                if (post.comments) {
                    const commentsArray = Object.values(post.comments);
                    commentsArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    
                    commentsArray.forEach(comment => {
                        const commentDate = new Date(comment.timestamp);
                        const commentDateString = `${commentDate.getFullYear()}-${(commentDate.getMonth()+1).toString().padStart(2, '0')}-${commentDate.getDate().toString().padStart(2, '0')} ${commentDate.getHours().toString().padStart(2, '0')}:${commentDate.getMinutes().toString().padStart(2, '0')}`;
                        
                        commentsHTML += `
                            <div class="comment">
                                <div class="comment-header">
                                    <span class="comment-author">${comment.author}</span>
                                    <span class="comment-date">${commentDateString}</span>
                                </div>
                                <div class="comment-content">${comment.content}</div>
                            </div>
                        `;
                    });
                }
                
                // 添加图片显示
                const imageHTML = post.imageUrl ? `
                    <div class="post-image">
                        <img src="${post.imageUrl}" alt="分享的图片" onclick="viewImage('${post.imageUrl}')">
                    </div>
                ` : '';
                
                postsHTML += `
                    <div class="post-card">
                        <div class="post-header">
                            <span class="post-author">${post.author}</span>
                            <span class="post-date">${dateString}</span>
                        </div>
                        <div class="post-content">${post.content}</div>
                        ${imageHTML}
                        <div class="comments-section">
                            ${commentsHTML || '<p style="color: #999; font-style: italic;">暂无评论</p>'}
                            <div class="comment-input-group">
                                <input type="text" class="comment-input" placeholder="写下你的评论..." data-postid="${post.id}">
                                <button class="comment-btn" onclick="postComment('${post.id}')">评论</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            postsContainer.innerHTML = postsHTML;
            
            // 为评论输入框添加回车事件
            document.querySelectorAll('.comment-input').forEach(input => {
                input.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        postComment(this.getAttribute('data-postid'));
                    }
                });
            });
        });
        
    } catch (error) {
        console.error("加载内容错误: ", error);
        document.getElementById('postsContainer').innerHTML = `
            <div class="empty-state">
                <h3>加载失败</h3>
                <p>请检查网络连接后刷新</p>
            </div>
        `;
    }
};

// 发布评论
window.postComment = async function(postId) {
    const commentInput = document.querySelector(`.comment-input[data-postid="${postId}"]`);
    const content = commentInput.value.trim();
    
    if (!content) {
        alert('请输入评论内容');
        return;
    }
    
    try {
        await addComment(postId, currentUser, content);
        commentInput.value = '';
        // 评论会自动通过onValue监听更新
    } catch (error) {
        alert('评论发布失败，请重试');
        console.error('评论错误:', error);
    }
};

// 查看大图
window.viewImage = function(imageUrl) {
    window.open(imageUrl, '_blank');
};




