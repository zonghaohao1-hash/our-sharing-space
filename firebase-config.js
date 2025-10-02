// firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js';

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyCqTfykW9g9RwcRzsyWXeN4q8aB2cJq6Y0",
  authDomain: "our-sharing-space.firebaseapp.com",
  projectId: "our-sharing-space",
  storageBucket: "our-sharing-space.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnopqrstuv"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 匿名登录
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('用户已登录:', user.uid);
  } else {
    console.log('开始匿名登录...');
    signInAnonymously(auth)
      .then(() => {
        console.log('匿名登录成功');
      })
      .catch((error) => {
        console.error('匿名登录失败:', error);
      });
  }
});

// 上传图片到 Firebase Storage
async function uploadImage(file) {
  try {
    console.log('开始上传图片到 Firebase Storage:', file.name);
    
    // 创建存储引用，使用时间戳避免文件名冲突
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `images/${fileName}`);
    
    // 上传文件
    console.log('正在上传文件...');
    const snapshot = await uploadBytes(storageRef, file);
    console.log('文件上传成功');
    
    // 获取下载 URL
    console.log('正在获取下载 URL...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('获取到下载 URL:', downloadURL);
    
    // 返回与之前 FreeImage.host 相同的结构
    return {
      image: {
        url: downloadURL,
        name: fileName
      }
    };
  } catch (error) {
    console.error('Firebase 图片上传失败：', error);
    throw error;
  }
}

// 发布内容到 Firestore
async function publishContent(content, imageFile = null) {
  try {
    let imageUrl = null;
    let imageName = null;

    // 如果有图片，先上传图片
    if (imageFile) {
      console.log('开始上传图片...');
      const uploadResult = await uploadImage(imageFile);
      imageUrl = uploadResult.image.url;
      imageName = uploadResult.image.name;
      console.log('图片上传完成:', imageUrl);
    }

    // 准备发布数据
    const postData = {
      content: content,
      timestamp: serverTimestamp(),
      likes: 0,
      liked: false
    };

    // 如果有图片，添加到数据中
    if (imageUrl) {
      postData.imageUrl = imageUrl;
      postData.imageName = imageName;
    }

    // 添加到 Firestore
    console.log('正在发布内容到 Firestore...');
    const docRef = await addDoc(collection(db, 'posts'), postData);
    console.log('内容发布成功，ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('发布内容失败：', error);
    throw error;
  }
}

// 监听帖子更新
function listenToPosts(callback) {
  const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const posts = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        content: data.content,
        imageUrl: data.imageUrl || null,
        timestamp: data.timestamp?.toDate() || new Date(),
        likes: data.likes || 0,
        liked: data.liked || false
      });
    });
    callback(posts);
  });
}

// 更新点赞状态
async function updateLike(postId, currentLikes, currentLiked) {
  try {
    // 这里需要更新 Firestore 中的 likes 字段
    // 注意：由于安全规则，这里可能需要使用 Cloud Function
    console.log(`更新帖子 ${postId} 的点赞状态`);
    
    // 返回更新后的状态（这里只是前端模拟，实际需要后端更新）
    return {
      likes: currentLiked ? currentLikes - 1 : currentLikes + 1,
      liked: !currentLiked
    };
  } catch (error) {
    console.error('更新点赞失败：', error);
    throw error;
  }
}

// 将函数暴露到全局作用域
window.uploadImage = uploadImage;
window.publishContent = publishContent;
window.listenToPosts = listenToPosts;
window.updateLike = updateLike;

console.log('Firebase 配置加载完成');
