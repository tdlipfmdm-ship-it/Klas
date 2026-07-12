(function() {
    let currentUser = null;
    let users = JSON.parse(localStorage.getItem('klas_users')) || [];
    let messages = JSON.parse(localStorage.getItem('klas_messages')) || [];

    const authScreen = document.getElementById('authScreen');
    const mainScreen = document.getElementById('mainScreen');
    const authName = document.getElementById('authName');
    const authClass = document.getElementById('authClass');
    const loginBtn = document.getElementById('loginBtn');
    const googleBtn = document.getElementById('googleBtn');
    const toggleRegister = document.getElementById('toggleRegister');
    const toast = document.getElementById('toastMsg');
    const mainName = document.getElementById('mainName');
    const mainClass = document.getElementById('mainClass');
    const mainAvatar = document.getElementById('mainAvatar');
    const chatArea = document.getElementById('chatArea');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const callBtn = document.getElementById('callBtn');

    let isRegisterMode = false;

    function showToast(text, type = 'info') {
        toast.textContent = text;
        toast.className = 'toast';
        if (type === 'error') toast.classList.add('error');
        else if (type === 'success') toast.classList.add('success');
        toast.style.display = 'block';
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 3500);
    }

    function saveUsers() { localStorage.setItem('klas_users', JSON.stringify(users)); }
    function saveMessages() { localStorage.setItem('klas_messages', JSON.stringify(messages)); }

    function renderMessages() {
        if (!chatArea) return;
        if (messages.length === 0) {
            chatArea.innerHTML = `<div style="text-align:center; color:#94a3b8; font-size:13px; padding:20px;">Söhbet başlatmak üçin habar ýazyň</div>`;
            return;
        }
        let html = '';
        messages.forEach(msg => {
            const isOwn = (currentUser && msg.userId === currentUser.id);
            html += `<div class="message-item ${isOwn ? 'sent' : 'received'}">
                        ${msg.text}
                        <span class="msg-meta">${msg.userName} • ${msg.time}</span>
                    </div>`;
        });
        chatArea.innerHTML = html;
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function loadMainScreen(user) {
        currentUser = user;
        authScreen.style.display = 'none';
        mainScreen.style.display = 'flex';
        mainName.textContent = user.name;
        mainClass.textContent = user.className || 'Synpdaş';
        mainAvatar.textContent = user.name.charAt(0).toUpperCase();
        renderMessages();
        chatInput.value = '';
    }

    function loginUser(name, className) {
        const trimmedName = name.trim();
        const trimmedClass = className.trim();
        if (!trimmedName || trimmedName.length < 2) {
            showToast('Adyňyz 2 harpdan gysga bolmaly däl!', 'error');
            return false;
        }
        let user = users.find(u => u.name.toLowerCase() === trimmedName.toLowerCase() && u.className === trimmedClass);
        if (!user) {
            user = {
                id: Date.now() + Math.random().toString(36).substring(2, 6),
                name: trimmedName,
                className: trimmedClass,
                avatar: trimmedName.charAt(0).toUpperCase()
            };
            users.push(user);
            saveUsers();
            showToast(`Hoş geldiň, ${trimmedName}!`, 'success');
        } else {
            showToast(`Hoş geldiň gaýdyp, ${user.name}!`, 'success');
        }
        loadMainScreen(user);
        return true;
    }

    function googleLogin() {
        const fakeName = prompt('Google hasabyňyzy simulýasiýa etmek üçin adyňyzy ýazyň:', 'Google_User');
        if (!fakeName || fakeName.trim().length < 2) {
            showToast('Dogry ady ýazyň!', 'error');
            return;
        }
        const fakeClass = prompt('Synpyňyz:', '11B') || '11B';
        loginUser(fakeName.trim(), fakeClass.trim());
    }

    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const name = authName.value.trim();
        const cls = authClass.value.trim();
        if (isRegisterMode) {
            if (!name || !cls) { showToast('Ähli ýerleri dolduryň!', 'error'); return; }
            const exist = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.className === cls);
            if (exist) { showToast('Bu ulanyjy eýýäm bar! Göni giriň.', 'error'); return; }
            loginUser(name, cls);
            isRegisterMode = false;
            toggleRegister.textContent = 'Hasap aç';
            loginBtn.textContent = 'Giriş';
        } else {
            loginUser(name, cls);
        }
    });

    googleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        googleLogin();
    });

    toggleRegister.addEventListener('click', function(e) {
        e.preventDefault();
        isRegisterMode = !isRegisterMode;
        if (isRegisterMode) {
            loginBtn.textContent = 'Hasap aç';
            toggleRegister.textContent = 'Giriş et';
            showToast('Täze hasap açmak üçin maglumatlary dolduryň.', 'info');
        } else {
            loginBtn.textContent = 'Giriş';
            toggleRegister.textContent = 'Hasap aç';
        }
    });

    function sendMessage() {
        if (!currentUser) { showToast('Ilki bilen giriň!', 'error'); return; }
        const text = chatInput.value.trim();
        if (!text) { showToast('Habar ýazyň!', 'error'); return; }
        const msg = {
            id: Date.now(),
            userId: currentUser.id,
            userName: currentUser.name,
            text: text,
            time: new Date().toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})
        };
        messages.push(msg);
        saveMessages();
        renderMessages();
        chatInput.value = '';
        chatInput.focus();
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
    });

    logoutBtn.addEventListener('click', function() {
        currentUser = null;
        authScreen.style.display = 'flex';
        mainScreen.style.display = 'none';
        showToast('Çykdyňyz. Täzeden hoş geldiň!', 'info');
        authName.value = '';
        authClass.value = '';
        isRegisterMode = false;
        loginBtn.textContent = 'Giriş';
        toggleRegister.textContent = 'Hasap aç';
    });

    callBtn.addEventListener('click', function() {
        if (!currentUser) { showToast('Ilki bilen giriň!', 'error'); return; }
        showToast(`📹 ${currentUser.name}, synpdaşlar bilen wideo jaň birikdirilýär... (WebRTC simulýasiýa)`, 'success');
        const fakeCallDiv = document.createElement('div');
        fakeCallDiv.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#0f172a; color:#fff; padding:30px 40px; border-radius:30px; z-index:999; text-align:center; box-shadow:0 30px 80px rgba(0,0,0,0.5); max-width:90%;';
        fakeCallDiv.innerHTML = `<div style="font-size:60px;margin-bottom:10px;">📹</div><div style="font-size:20px;font-weight:600;">Wideo jaň simulýasiýasy</div><div style="font-size:14px;opacity:0.7;margin:10px 0;">Hakyky jaň üçin Signal Server (Socket.io) we STUN/TURN gerek.</div><button onclick="this.parentElement.remove()" style="margin-top:20px;padding:10px 30px;border:none;border-radius:40px;background:#3b82f6;color:#fff;font-weight:bold;cursor:pointer;">Ýapmak</button>`;
        document.body.appendChild(fakeCallDiv);
    });

    document.addEventListener('keypress', function(e) {
        if (e.target.id === 'authName' || e.target.id === 'authClass') {
            if (e.key === 'Enter') loginBtn.click();
        }
    });
})();
