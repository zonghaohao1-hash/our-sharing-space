// 请将下面的配置替换为您在 Firebase 获取的实际配置
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, Timestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Firebase 配置 - 需要替换成您的配置
const firebaseConfig = {
    apiKey: "您的apiKey",
    authDomain: "您的authDomain",
    projectId: "您的projectId",
    storageBucket: "您的storageBucket",
    messagingSenderId: "您的messagingSenderId",
    appId: "您的appId"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 添加新内容
window.addPost = async function(author, content) {
    try {
        await addDoc(collection(db, "posts"), {
            author: author,
            content: content,
            timestamp: Timestamp.now(),
            comments: []
        });
    } catch (error) {
        console.error("添加内容错误: ", error);
        throw error;
    }
};

// 添加评论
window.addComment = async function(postId, author, content) {
    try {
        const postRef = doc(db, "posts", postId);
        const postDoc = await getDoc(postRef);
        const currentComments = postDoc.data().comments || [];
        
        currentComments.push({
            author: author,
            content: content,
            timestamp: Timestamp.now()
        });
        
        await updateDoc(postRef, {
            comments: currentComments
        });
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
        
        const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            postsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>还没有任何分享</h3>
                    <p>发布第一条内容开始记录吧</p>
                </div>
            `;
            return;
        }
        
        let postsHTML = '';
        
        querySnapshot.forEach((doc) => {
            const post = doc.data();
            const postId = doc.id;
            const date = post.timestamp.toDate();
            const dateString = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            
            let commentsHTML = '';
            if (post.comments && post.comments.length > 0) {
                post.comments.forEach(comment => {
                    const commentDate = comment.timestamp.toDate();
                    const commentDateString = `${commentDate.getFullYear()}-${(commentDate.getMonth()+1).toString().padStart(2, '0')}-${commentDate.getDate().toString().padStart(2, '0')}`;
                    
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
            
            postsHTML += `
                <div class="post-card">
                    <div class="post-header">
                        <span class="post-author">${post.author}</span>
                        <span class="post-date">${dateString}</span>
                    </div>
                    <div class="post-content">${post.content}</div>
                    <div class="comments-section">
                        ${commentsHTML || '<p style="color: #999; font-style: italic;">暂无评论</p>'}
                        <div class="comment-input-group">
                            <input type="text" class="comment-input" placeholder="写下你的评论..." data-postid="${postId}">
                            <button class="comment-btn" onclick="postComment('${postId}')">评论</button>
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
        await loadPosts();
    } catch (error) {
        alert('评论发布失败，请重试');
        console.error('评论错误:', error);
    }
};
