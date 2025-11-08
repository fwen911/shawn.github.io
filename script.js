// 全局变量
const MAX_PLAY_COUNT = 5;
let currentAudioId = null;
let currentAudioElement = null;

// 模拟后端存储服务（在实际项目中应替换为真实后端API）
class MockAudioStorageService {
    constructor() {
        this.storageKey = 'shared-audio-files';
    }
    
    // 获取所有音频文件
    getAllAudioFiles() {
        try {
            const data = sessionStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading audio files:', error);
            return [];
        }
    }
    
    // 保存所有音频文件
    saveAudioFiles(files) {
        try {
            sessionStorage.setItem(this.storageKey, JSON.stringify(files));
            return true;
        } catch (error) {
            console.error('Error saving audio files:', error);
            return false;
        }
    }
    
    // 获取单个音频文件
    getAudioFile(id) {
        const files = this.getAllAudioFiles();
        return files.find(file => file.id === id);
    }
    
    // 增加播放次数
    incrementPlayCount(id) {
        const files = this.getAllAudioFiles();
        const fileIndex = files.findIndex(file => file.id === id);
        
        if (fileIndex !== -1) {
            files[fileIndex].playCount += 1;
            this.saveAudioFiles(files);
            return files[fileIndex];
        }
        return null;
    }
    
    // 删除音频文件
    deleteAudioFile(id) {
        const files = this.getAllAudioFiles();
        const filteredFiles = files.filter(file => file.id !== id);
        return this.saveAudioFiles(filteredFiles);
    }
    
    // 添加新音频文件
    addAudioFile(file) {
        const files = this.getAllAudioFiles();
        files.push(file);
        return this.saveAudioFiles(files);
    }
    
    // 清空所有音频文件
    clearAllAudioFiles() {
        sessionStorage.removeItem(this.storageKey);
        return true;
    }
}

// 创建模拟存储服务实例
const storageService = new MockAudioStorageService();

// DOM 元素
const uploadForm = document.getElementById('uploadForm');
const audioFile = document.getElementById('audioFile');
const audioList = document.getElementById('audioList');
const emptyState = document.getElementById('emptyState');
const clearAllBtn = document.getElementById('clearAllBtn');

// 初始化应用
function init() {
    // 检查URL参数是否包含音频ID
    const urlParams = new URLSearchParams(window.location.search);
    const audioId = urlParams.get('id');
    
    loadAudioFiles();
    setupEventListeners();
    
    // 如果URL中有音频ID参数，直接显示该音频的分享模态框
    if (audioId) {
        setTimeout(() => {
            shareAudio(audioId);
        }, 500);
    }
}

// 从模拟存储服务加载音频文件
function loadAudioFiles() {
    let audioFiles = storageService.getAllAudioFiles();
    
    // 过滤掉已经达到最大播放次数的音频
    const validAudioFiles = audioFiles.filter(file => file.playCount < MAX_PLAY_COUNT);
    
    // 更新存储（移除过期文件）
    if (audioFiles.length !== validAudioFiles.length) {
        storageService.saveAudioFiles(validAudioFiles);
    }
    
    // 渲染音频列表
    renderAudioList(validAudioFiles);
    
    // 显示或隐藏空状态
    updateEmptyState(validAudioFiles.length > 0);
    
    // 在控制台显示当前模拟用户信息，帮助理解模拟多用户环境
    console.log('========= 模拟多用户环境提示 =========');
    console.log('1. 当前使用sessionStorage模拟不同用户间的音频共享');
    console.log('2. 在真实环境中，应替换为后端API和数据库');
    console.log('3. 要模拟不同用户，请打开新的隐私窗口或清除浏览器数据');
    console.log('====================================');
}

// 保存音频文件到模拟存储服务
function saveAudioFile(file) {
    // 添加新文件
    const success = storageService.addAudioFile(file);
    
    if (success) {
        // 重新加载并渲染列表
        loadAudioFiles();
        
        // 显示成功提示
        showNotification('音频上传成功！分享音频给好友一起享受5次播放机会吧！', 'success');
    } else {
        showNotification('音频保存失败！', 'error');
    }
}

// 渲染音频列表
function renderAudioList(files) {
    // 清空列表
    audioList.innerHTML = '';
    
    if (files.length === 0) return;
    
    // 显示清空全部按钮
    clearAllBtn.classList.remove('hidden');
    
    // 渲染每个音频文件
    files.forEach((file, index) => {
        const audioCard = createAudioCard(file, index);
        audioList.appendChild(audioCard);
    });
}

// 创建音频卡片
function createAudioCard(file, index) {
    const remainingPlays = MAX_PLAY_COUNT - file.playCount;
    const isExpired = remainingPlays <= 0;
    
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-md p-4 md:p-6 audio-card-hover fade-in';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const progressPercentage = ((file.playCount / MAX_PLAY_COUNT) * 100).toFixed(0);
    
    card.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex-1">
                <div class="flex items-center gap-4 mb-3">
                    <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <i class="fa fa-file-audio-o text-primary text-xl"></i>
                    </div>
                    <div>
                        <h3 class="font-semibold text-lg text-dark break-all max-w-xs md:max-w-md">${file.name}</h3>
                        <p class="text-sm text-gray-500">${formatFileSize(file.size)} · ${formatDate(file.uploadTime)}</p>
                    </div>
                </div>
                
                <div class="mb-3">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-gray-600">剩余播放次数</span>
                        <span class="font-medium ${isExpired ? 'text-danger' : 'text-primary'}">
                            ${isExpired ? '已过期' : `${remainingPlays}/${MAX_PLAY_COUNT}`}
                        </span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%" 
                             data-remaining="${remainingPlays}"></div>
                    </div>
                </div>
            </div>
            
            <div class="flex items-center gap-3">
                <audio id="audio-${file.id}" src="${file.dataUrl}" class="hidden"></audio>
                <button onclick="playAudio('${file.id}')" 
                        class="btn-primary flex items-center gap-2 ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}"
                        ${isExpired ? 'disabled' : ''}>
                    <i class="fa fa-play"></i>
                    <span>播放</span>
                </button>
                <button onclick="shareAudio('${file.id}')" 
                        class="btn-secondary flex items-center gap-2">
                    <i class="fa fa-share-alt text-gray-600"></i>
                    <span class="text-sm">分享</span>
                </button>
                <button onclick="deleteAudio('${file.id}')" 
                        class="btn-secondary flex items-center gap-2">
                    <i class="fa fa-trash text-gray-600"></i>
                    <span class="text-sm">删除</span>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// 播放音频
function playAudio(audioId) {
    // 从模拟存储服务获取音频信息
    const audioFile = storageService.getAudioFile(audioId);
    
    if (!audioFile) {
        showNotification('音频文件不存在或已被删除', 'error');
        return;
    }
    
    // 检查是否还有剩余播放次数
    if (audioFile.playCount >= MAX_PLAY_COUNT) {
        showNotification('此音频已达到最大播放次数限制！', 'error');
        return;
    }
    
    // 增加播放次数
    const updatedFile = storageService.incrementPlayCount(audioId);
    
    // 播放音频
    const audioElement = document.getElementById(`audio-${audioId}`);
    if (audioElement) {
        // 暂停当前播放的音频
        if (currentAudioElement && currentAudioElement !== audioElement && !currentAudioElement.paused) {
            currentAudioElement.pause();
        }
        
        // 更新当前播放的音频
        currentAudioElement = audioElement;
        currentAudioId = audioId;
        
        audioElement.play().catch(error => {
            console.error('Error playing audio:', error);
            showNotification('无法播放音频，请检查浏览器权限设置', 'error');
        });
        
        // 重新加载文件列表以更新UI
        loadAudioFiles();
        
        // 检查是否达到最大播放次数
        if (updatedFile && updatedFile.playCount >= MAX_PLAY_COUNT) {
            showNotification('此音频已达到最大播放次数，将在刷新后自动删除！', 'warning');
        }
    }
}

// 删除音频
function deleteAudio(audioId) {
    if (confirm('确定要删除这个音频文件吗？')) {
        // 如果删除的是当前播放的音频，停止播放
        if (currentAudioId === audioId) {
            if (currentAudioElement) {
                currentAudioElement.pause();
                currentAudioElement = null;
            }
            currentAudioId = null;
        }
        
        // 从模拟存储服务删除音频
        const success = storageService.deleteAudioFile(audioId);
        
        if (success) {
            // 重新加载并渲染列表
            loadAudioFiles();
            
            // 显示成功提示
            showNotification('音频删除成功！', 'success');
        } else {
            showNotification('音频删除失败！', 'error');
        }
    }
}

// 清空所有音频
function clearAllAudio() {
    if (confirm('确定要清空所有音频文件吗？此操作无法撤销。')) {
        // 停止当前播放的音频
        if (currentAudioElement) {
            currentAudioElement.pause();
            currentAudioElement = null;
        }
        currentAudioId = null;
        
        // 从模拟存储服务清空所有音频
        const success = storageService.clearAllAudioFiles();
        
        if (success) {
            // 清空列表
            audioList.innerHTML = '';
            
            // 更新空状态
            updateEmptyState(false);
            
            // 隐藏清空按钮
            clearAllBtn.classList.add('hidden');
            
            // 显示成功提示
            showNotification('所有音频已清空！', 'success');
        } else {
            showNotification('清空音频失败！', 'error');
        }
    }
}

// 处理音频上传
function handleAudioUpload(event) {
    event.preventDefault();
    
    const file = audioFile.files[0];
    if (!file) {
        showNotification('请选择一个音频文件！', 'error');
        return;
    }
    
    // 检查文件类型
    const validTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/mpeg'];
    if (!validTypes.includes(file.type)) {
        showNotification('不支持的文件类型！请上传 MP3、WAV、OGG 或 AAC 格式的音频。', 'error');
        return;
    }
    
    // 检查文件大小（限制为 50MB）
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        showNotification('文件过大！最大支持 50MB 的音频文件。', 'error');
        return;
    }
    
    // 读取文件并转换为 base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const audioData = {
            id: 'audio-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: e.target.result,
            uploadTime: new Date().toISOString(),
            playCount: 0
        };
        
        // 保存音频数据到模拟存储服务
        saveAudioFile(audioData);
        
        // 清空文件输入
        audioFile.value = '';
    };
    
    reader.onerror = function() {
        showNotification('文件读取失败，请重试！', 'error');
    };
    
    reader.readAsDataURL(file);
}

// 更新空状态显示
function updateEmptyState(hasAudio) {
    if (hasAudio) {
        emptyState.classList.add('hidden');
        audioList.classList.remove('hidden');
        clearAllBtn.classList.remove('hidden');
    } else {
        emptyState.classList.remove('hidden');
        audioList.classList.add('hidden');
        clearAllBtn.classList.add('hidden');
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    // 检查是否已存在通知元素
    let notification = document.getElementById('notification');
    if (notification) {
        notification.remove();
    }
    
    // 创建通知元素
    notification = document.createElement('div');
    notification.id = 'notification';
    
    // 设置样式和内容
    const bgColor = type === 'success' ? 'bg-secondary' : 
                    type === 'error' ? 'bg-danger' : 
                    type === 'warning' ? 'bg-warning' : 'bg-primary';
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    notification.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg fixed bottom-6 right-6 flex items-center gap-3 transform transition-all duration-300 z-50`;
    notification.style.transform = 'translateY(100px)';
    notification.innerHTML = `
        <i class="fa ${icon} text-xl"></i>
        <span>${message}</span>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // 3秒后隐藏
    setTimeout(() => {
        notification.style.transform = 'translateY(100px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return '刚刚';
    if (diffMin < 60) return `${diffMin}分钟前`;
    if (diffHour < 24) return `${diffHour}小时前`;
    if (diffDay < 30) return `${diffDay}天前`;
    
    return date.toLocaleDateString('zh-CN');
}

// 设置事件监听器
function setupEventListeners() {
    // 表单提交事件
    uploadForm.addEventListener('submit', handleAudioUpload);
    
    // 清空全部按钮点击事件
    clearAllBtn.addEventListener('click', clearAllAudio);
    
    // 拖放功能
    const dropArea = uploadForm.querySelector('.border-dashed');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('border-primary', 'bg-primary/5');
    }
    
    function unhighlight() {
        dropArea.classList.remove('border-primary', 'bg-primary/5');
    }
    
    // 处理拖放的文件
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        
        if (file) {
            audioFile.files = dt.files;
        }
    }
    
    // 响应式调整
    window.addEventListener('resize', () => {
        // 可以在这里添加响应式调整逻辑
    });
}

// 分享音频函数
function shareAudio(audioId) {
    // 从模拟存储服务获取音频信息
    const audioFile = storageService.getAudioFile(audioId);
    
    if (!audioFile) {
        showNotification('未找到指定的音频文件！', 'error');
        return;
    }
    
    // 检查音频是否已过期
    if (audioFile.playCount >= MAX_PLAY_COUNT) {
        showNotification('此音频已达到最大播放次数限制！', 'error');
        return;
    }
    
    // 生成分享链接
    const currentUrl = window.location.origin + window.location.pathname;
    const shareLink = `${currentUrl}?id=${audioId}`;
    
    // 显示分享模态框
    const shareModal = document.getElementById('shareModal');
    const shareLinkInput = document.getElementById('shareLink');
    shareLinkInput.value = shareLink;
    
    // 清空之前的二维码
    const qrcodeContainer = document.getElementById('qrcodeContainer');
    qrcodeContainer.innerHTML = '';
    qrcodeContainer.classList.add('hidden');
    
    shareModal.classList.remove('hidden');
    
    // 生成二维码按钮点击事件
    document.getElementById('shareViaQR').onclick = function() {
        qrcodeContainer.innerHTML = `
            <div class="p-2 bg-white rounded-lg shadow-md inline-block">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareLink)}" 
                     alt="分享二维码" 
                     class="w-36 h-36">
            </div>
        `;
        qrcodeContainer.classList.remove('hidden');
        qrcodeContainer.classList.add('flex');
    };
    
    // 复制链接按钮点击事件
    document.getElementById('copyShareLink').onclick = function() {
        shareLinkInput.select();
        document.execCommand('copy');
        showNotification('链接已复制到剪贴板！', 'success');
    };
    
    // 关闭模态框
    const closeModal = function() {
        shareModal.classList.add('hidden');
    };
    
    document.getElementById('closeShareModal').onclick = closeModal;
    document.getElementById('confirmShareModal').onclick = closeModal;
    
    // 点击模态框外部关闭
    shareModal.onclick = function(e) {
        if (e.target === shareModal) {
            closeModal();
        }
    };
}

// 从URL参数加载特定音频
function loadAudioFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const audioId = urlParams.get('id');
    
    if (!audioId) return;
    
    // 从模拟存储服务获取音频
    const audioFile = storageService.getAudioFile(audioId);
    
    if (!audioFile) {
        showNotification('分享的音频文件不存在或已被删除！', 'error');
        return;
    }
    
    // 检查是否过期
    if (audioFile.playCount >= MAX_PLAY_COUNT) {
        showNotification('分享的音频已达到最大播放次数限制！', 'error');
        return;
    }
    
    // 显示通知，包含剩余播放次数
    showNotification(`已加载分享的音频：${audioFile.name}，剩余播放次数：${MAX_PLAY_COUNT - audioFile.playCount}次`, 'success');
    
    // 高亮显示该音频卡片
    setTimeout(() => {
        const card = document.querySelector(`[data-audio-id="${audioId}"]`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.add('ring-2', 'ring-primary');
            setTimeout(() => {
                card.classList.remove('ring-2', 'ring-primary');
            }, 2000);
        }
    }, 1000);
}

// 修改渲染函数，添加data属性
function renderAudioList(files) {
    // 清空列表
    audioList.innerHTML = '';
    
    if (files.length === 0) {
        // 如果没有音频文件，让updateEmptyState处理显示空状态
        return;
    }
    
    // 显示清空全部按钮
    clearAllBtn.classList.remove('hidden');
    
    // 按上传时间倒序排序（最新的在前）
    files.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
    
    // 渲染每个音频文件
    files.forEach((file, index) => {
        const audioCard = createAudioCard(file, index);
        audioCard.dataset.audioId = file.id; // 添加data属性用于定位
        audioList.appendChild(audioCard);
    });
    
    // 检查URL参数并加载特定音频
    loadAudioFromUrl();
}

// 暴露全局函数
window.playAudio = playAudio;
window.deleteAudio = deleteAudio;
window.shareAudio = shareAudio;

// 初始化应用
init();