/* ===== Data Layer - localStorage management ===== */

const DB_KEY = 'fireworks_db';

const defaultData = {
    profile: {
        avatar: '',
        avatarEmoji: '\uD83C\uDF86',
        background: '',
        nickname: 'sparkle',
        registered: false,
        bio: '\u5728\u8FD9\u91CC\uFF0C\u6BCF\u4E00\u6761\u6D88\u606F\u90FD\u662F\u4E00\u573A\u70DF\u82B1',
        location: 'Shanghai',
        weather: 'Sunny 25\u00B0C',
        useRealWeather: false,
        myStatus: '\u5728\u7EBF',
        lat: 31.23,
        lon: 121.47,
        anniversaryDate: null,
        anniversaryType: 'countdown',
        anniversaryRepeat: 'none',
        anniversaryLabel: '\u7EAA\u5FF5\u65E5'
    },
    peer: {
        nickname: 'shimmer',
        avatar: '',
        avatarEmoji: '\uD83D\uDE0A',
        minDelay: 2,
        maxDelay: 6,
        autoReply: true,
        activeGroup: 'all',
        readNoReply: false,
        readDelayMin: 0.3,
        readDelayMax: 2.0,
        proactiveMessage: false,
        proactiveMinInterval: 1,
        proactiveMaxInterval: 5,
        currentStatus: '',
        statusSetAt: 0,
        batteryLevel: 60,
        wifiLevel: 65
    },
    groups: [
        { id: 'preset', name: '预设分组' }
    ],
    cards: [
        { id: 'c1', content: 'Hello there!', translation: '你好呀！', group: 'preset', blocked: false, usageCount: 0 },
        { id: 'c2', content: 'How was your day?', translation: '今天过得怎么样？', group: 'preset', blocked: false, usageCount: 0 },
        { id: 'c3', content: 'Good night, sweet dreams', translation: '晚安，做个好梦', group: 'preset', blocked: false, usageCount: 0 },
        { id: 'c4', content: 'What did you have for lunch?', translation: '中午吃了什么？', group: 'preset', blocked: false, usageCount: 0 },
        { id: 'c5', content: 'Long time no see!', translation: '好久不见！', group: 'preset', blocked: false, usageCount: 0 },
        { id: 'c6', content: 'Hahaha, that is hilarious', translation: '哈哈哈太搞笑了', group: 'preset', blocked: false, usageCount: 0 },
        { id: 'c7', content: 'That is exactly what I think', translation: '我也是这么想的', group: 'preset', blocked: false, usageCount: 0 },
        { id: 'c8', content: 'That is just outrageous', translation: '这也太离谱了吧', group: 'preset', blocked: false, usageCount: 0 },
        { id: 'c9', content: 'You make a good point', translation: '你说的有道理', group: 'preset', blocked: false, usageCount: 0 },
        { id: 'c10', content: 'I am listening, go on', translation: '我在听，继续说', group: 'preset', blocked: false, usageCount: 0 },
        { id: 'c11', content: 'I see', translation: '原来如此', group: 'preset', blocked: false, usageCount: 0 },
        { id: 'c12', content: 'Yeah, and then?', translation: '嗯嗯，然后呢？', group: 'preset', blocked: false, usageCount: 0 },
        { id: 'c13', content: 'Wow, that is amazing!', translation: '哇，好厉害！', group: 'preset', blocked: false, usageCount: 0 },
        { id: 'c14', content: 'Let us cheer each other on', translation: '我们一起加油吧', group: 'preset', blocked: false, usageCount: 0 },
        { id: 'c15', content: 'Do not forget to rest', translation: '别忘了休息哦', group: 'preset', blocked: false, usageCount: 0 }
    ],
    messages: [],
    firstChatDate: null,
    statusCards: [
        { id: 'sc1', content: '\u5728\u53D1\u5446', blocked: false, usageCount: 0 },
        { id: 'sc2', content: '\u5DE5\u4F5C\u4E2D', blocked: false, usageCount: 0 },
        { id: 'sc3', content: '\u6478\u9C7C\u4E2D', blocked: false, usageCount: 0 },
        { id: 'sc4', content: '\u60F3\u4F60\u4E86', blocked: false, usageCount: 0 },
        { id: 'sc5', content: '\u542C\u6B4C\u4E2D', blocked: false, usageCount: 0 },
        { id: 'sc6', content: '\u5403\u996D\u53BB\u4E86', blocked: false, usageCount: 0 },
        { id: 'sc7', content: '\u5728\u5916\u9762', blocked: false, usageCount: 0 },
        { id: 'sc8', content: '\u597D\u56F0\u554A', blocked: false, usageCount: 0 },
        { id: 'sc9', content: '\u6253\u6E38\u620F\u4E2D', blocked: false, usageCount: 0 },
        { id: 'sc10', content: '\u521A\u7761\u9192', blocked: false, usageCount: 0 }
    ],
    emojiCards: [
        { id: 'ec1', content: '\uD83D\uDE02', blocked: false, usageCount: 0 },
        { id: 'ec2', content: '\uD83D\uDE0D', blocked: false, usageCount: 0 },
        { id: 'ec3', content: '\uD83D\uDE0A', blocked: false, usageCount: 0 },
        { id: 'ec4', content: '\uD83E\uDD72', blocked: false, usageCount: 0 },
        { id: 'ec5', content: '\uD83D\uDC4D', blocked: false, usageCount: 0 },
        { id: 'ec6', content: '\uD83D\uDC4F', blocked: false, usageCount: 0 },
        { id: 'ec7', content: '\uD83D\uDD25', blocked: false, usageCount: 0 },
        { id: 'ec8', content: '\uD83D\uDC96', blocked: false, usageCount: 0 },
        { id: 'ec9', content: '\uD83D\uDE22', blocked: false, usageCount: 0 },
        { id: 'ec10', content: '\uD83C\uDF89', blocked: false, usageCount: 0 },
        { id: 'ec11', content: '\uD83E\uDD14', blocked: false, usageCount: 0 },
        { id: 'ec12', content: '\uD83D\uDE31', blocked: false, usageCount: 0 }
    ],
    giftCards: [
        { id: 'gc1', emoji: '\uD83C\uDF39', name: '\u73ab\u7470', description: '\u4E00\u6735\u5C5C\u5C5C\u7684\u73ab\u7470\uFF0C\u4EE3\u8868\u6211\u7684\u5FC3\u610F', blocked: false, usageCount: 0 },
        { id: 'gc2', emoji: '\uD83C\uDF81', name: '\u795E\u79D8\u793C\u7269', description: '\u4E00\u4EFD\u7CBE\u5FC3\u51C6\u5907\u7684\u60CA\u559C', blocked: false, usageCount: 0 },
        { id: 'gc3', emoji: '\uD83C\uDF82', name: '\u751F\u65E5\u86CB\u7CD5', description: '\u9001\u4E0A\u6700\u751C\u871C\u7684\u795D\u798F', blocked: false, usageCount: 0 },
        { id: 'gc4', emoji: '\uD83C\uDF6B', name: '\u5DE7\u514B\u529B', description: '\u751C\u751C\u7684\u5DE7\u514B\u529B\uFF0C\u6EB6\u5728\u5FC3\u91CC', blocked: false, usageCount: 0 },
        { id: 'gc5', emoji: '\uD83C\uDF38', name: '\u5411\u65E5\u8475', description: '\u8FFD\u5BFB\u9633\u5149\u7684\u65B9\u5411\uFF0C\u5C31\u50CF\u8FFD\u5BFB\u4F60', blocked: false, usageCount: 0 },
        { id: 'gc6', emoji: '\u2B50', name: '\u6D41\u661F', description: '\u4E3A\u4F60\u6458\u4E0B\u7684\u90A3\u9897\u6700\u4EAE\u7684\u661F', blocked: false, usageCount: 0 }
    ],
    settings: {
        theme: 'dark',
        sound: true,
        soundType: 'pop',
        sendSoundType: 'pop',
        receiveSoundType: 'pop',
        notifications: false,
        myAvatar: '',
        myAvatarEmoji: '\uD83D\uDE0E',
        otherAvatar: '',
        otherAvatarEmoji: '\uD83D\uDE0A',
        homeBackground: '',
        cardBackground: '',
        profileCardBg: '',
        peerAvatar: '',
        peerAvatarEmoji: '\uD83D\uDE0A',
        customCSS: '',
        sendSound: true,
        receiveSound: true,
        photoWall: [],
        customSounds: [],
        customSoundType: 'pop',
        chatBubbleStyle: 'default',
        chatBackground: '',
        chatBackgroundOpacity: 0.15,
        emojiMixEnabled: false,
        emojiMixProbability: 0.15,
        glassmorphism: false,
        musicPlayer: {
            discImage: '',
            audioUrl: 'https://videotourl.com/audio/1783941921708-3d60a063-2a43-4def-b80a-93d630a154e6.m4a',
            title: 'glitter',
            artist: '\u5F0B\u67AB',
            isPlaying: false
        },
        splashTitle: 'Sonnet',
        splashSubtitle: 'Shall I compare thee to a summer\'s day?\nThou art more lovely and more temperate.',
        homeQuote: 'I have crossed oceans of time to find you.',
        patSettings: {
            enabled: true,
            patUserSuffix: '',
            patPeerSuffix: '',
            patTriggerProbability: 0.05
        },
        drawerSettings: {
            imageCompressQuality: 0.6,
            callAcceptProbability: 0.6,
            transferAcceptProbability: 0.5,
            giftAcceptProbability: 0.7,
            peerCallProbability: 0.03,
            peerTransferProbability: 0.02,
            peerGiftProbability: 0.04,
            peerCallEnabled: true,
            peerTransferEnabled: true,
            peerGiftEnabled: true
        }
    },
    cardFilter: 'all',
    multiSelectMode: false,
    selectedCards: []
};

// ===== IndexedDB Backup Store =====
const IDBStore = {
    _db: null,
    _dbReady: null,

    _open() {
        if (this._dbReady) return this._dbReady;
        this._dbReady = new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB not available'));
                return;
            }
            const request = window.indexedDB.open('FireworksDB', 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this._db = request.result;
                resolve(this._db);
            };
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('data')) {
                    db.createObjectStore('data', { keyPath: 'key' });
                }
            };
        });
        return this._dbReady;
    },

    get(key) {
        return this._open().then(db => {
            return new Promise((resolve, reject) => {
                const tx = db.transaction('data', 'readonly');
                const store = tx.objectStore('data');
                const req = store.get(key);
                req.onsuccess = () => resolve(req.result ? req.result.value : null);
                req.onerror = () => reject(req.error);
            });
        });
    },

    set(key, value) {
        return this._open().then(db => {
            return new Promise((resolve, reject) => {
                const tx = db.transaction('data', 'readwrite');
                const store = tx.objectStore('data');
                const req = store.put({ key, value });
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            });
        });
    }
};

const Data = {
    data: null,

    _mediaLoaded: false,

    init() {
        let loaded = false;

        // 1. Try localStorage (synchronous, fast initial render - text only, no media)
        try {
            const saved = localStorage.getItem(DB_KEY);
            if (saved) {
                this.data = JSON.parse(saved);
                loaded = true;
            }
        } catch (e) {
            // localStorage read failed or corrupted
        }

        if (loaded) {
            this._mergeDefaults();
            this._runMigrations();
        } else {
            // Set defaults - will be replaced when IDB loads
            this.data = JSON.parse(JSON.stringify(defaultData));
            this._mergeDefaults();
        }

        // 2. Always load full data from IndexedDB (has media that localStorage doesn't)
        IDBStore.get(DB_KEY).then(idbData => {
            if (idbData) {
                // IndexedDB has full data with media - use it
                this.data = idbData;
                this._mergeDefaults();
                this._runMigrations();
            } else if (!loaded) {
                // No data anywhere - save defaults
                this.save();
            }
            // Re-apply visual settings that depend on media
            this._onMediaLoaded();
        }).catch(() => {
            this._onMediaLoaded();
        });

        // Request persistent storage to prevent browser from evicting data
        if (navigator.storage && navigator.storage.persist) {
            navigator.storage.persist().then(() => {}).catch(() => {});
        }
    },

    _onMediaLoaded() {
        if (this._mediaLoaded) return;
        this._mediaLoaded = true;
        // Re-apply visual settings that depend on base64 media (loaded from IndexedDB)
        if (typeof App !== 'undefined') {
            if (App.applyAvatarSettings) App.applyAvatarSettings();
            if (App.applyChatBackground) App.applyChatBackground();
        }
        if (typeof Home !== 'undefined') {
            if (Home.renderPhotoWall) Home.renderPhotoWall();
            if (Home.renderMusicPlayer) Home.renderMusicPlayer();
        }
    },

    _mergeDefaults() {
        const raw = this.data;
        this.data = { ...defaultData, ...raw };
        this.data.profile = { ...defaultData.profile, ...(raw.profile || {}) };
        this.data.peer = { ...defaultData.peer, ...(raw.peer || {}) };
        this.data.settings = { ...defaultData.settings, ...(raw.settings || {}) };
        if (!this.data.groups) this.data.groups = defaultData.groups;
        if (!this.data.cards) this.data.cards = defaultData.cards;
        if (!this.data.emojiCards) this.data.emojiCards = defaultData.emojiCards;
        if (!this.data.giftCards) this.data.giftCards = defaultData.giftCards;
    },

    _runMigrations() {
        if (!this.data._migratedPreset) {
            if (!this.data.groups.find(g => g.id === 'preset')) {
                this.data.groups.unshift({ id: 'preset', name: '\u9884\u8BBE\u5206\u7EC4' });
            }
            const oldGroupIds = ['greetings', 'funny'];
            this.data.cards.forEach(c => {
                if (oldGroupIds.includes(c.group)) {
                    c.group = 'preset';
                }
            });
            this.data.groups = this.data.groups.filter(g => {
                if (oldGroupIds.includes(g.id)) {
                    return this.data.cards.some(c => c.group === g.id);
                }
                return true;
            });
            this.data._migratedPreset = true;
            this.save();
        }

        // Migration: swap card content/translation (content=English, translation=Chinese)
        if (!this.data._migratedCardSwap) {
            const presetMap = {
                'c1': { content: 'Hello there!', translation: '你好呀！' },
                'c2': { content: 'How was your day?', translation: '今天过得怎么样？' },
                'c3': { content: 'Good night, sweet dreams', translation: '晚安，做个好梦' },
                'c4': { content: 'What did you have for lunch?', translation: '中午吃了什么？' },
                'c5': { content: 'Long time no see!', translation: '好久不见！' },
                'c6': { content: 'Hahaha, that is hilarious', translation: '哈哈哈太搞笑了' },
                'c7': { content: 'That is exactly what I think', translation: '我也是这么想的' },
                'c8': { content: 'That is just outrageous', translation: '这也太离谱了吧' },
                'c9': { content: 'You make a good point', translation: '你说的有道理' },
                'c10': { content: 'I am listening, go on', translation: '我在听，继续说' },
                'c11': { content: 'I see', translation: '原来如此' },
                'c12': { content: 'Yeah, and then?', translation: '嗯嗯，然后呢？' },
                'c13': { content: 'Wow, that is amazing!', translation: '哇，好厉害！' },
                'c14': { content: 'Let us cheer each other on', translation: '我们一起加油吧' },
                'c15': { content: 'Do not forget to rest', translation: '别忘了休息哦' }
            };
            this.data.cards.forEach(c => {
                if (presetMap[c.id]) {
                    c.content = presetMap[c.id].content;
                    c.translation = presetMap[c.id].translation;
                } else if (c.translation && c.content !== c.translation) {
                    // Swap content and translation for user cards
                    const tmp = c.content;
                    c.content = c.translation;
                    c.translation = tmp;
                }
            });
            this.data._migratedCardSwap = true;
            this.save();
        }

        // Migration: remove 'default' group from groups array (keep as virtual)
        if (!this.data._migratedDefaultGroup) {
            this.data.groups = this.data.groups.filter(g => g.id !== 'default');
            this.data._migratedDefaultGroup = true;
            this.save();
        }
    },

    save() {
        const fullData = this.data;

        // Always save full data to IndexedDB (primary - handles large media)
        IDBStore.set(DB_KEY, fullData).catch(() => {});

        // Try to save to localStorage (for fast sync load on next visit)
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(fullData));
        } catch (e) {
            // localStorage full - save stripped version (media stored in IndexedDB only)
            try {
                const stripped = this._stripMedia(fullData);
                localStorage.setItem(DB_KEY, JSON.stringify(stripped));
            } catch (e2) {
                // Even stripped version too large - skip localStorage, rely on IndexedDB
                console.warn('localStorage save skipped, using IndexedDB only');
            }
        }
    },

    _stripMedia(data) {
        const clone = JSON.parse(JSON.stringify(data));
        const s = clone.settings;
        if (!s) return clone;
        // Strip large base64 media fields (they'll be loaded from IndexedDB)
        if (s.myAvatar) s.myAvatar = '';
        if (s.otherAvatar) s.otherAvatar = '';
        if (s.homeBackground) s.homeBackground = '';
        if (s.cardBackground) s.cardBackground = '';
        if (s.profileCardBg) s.profileCardBg = '';
        if (s.peerAvatar) s.peerAvatar = '';
        if (s.chatBackground) s.chatBackground = '';
        if (s.musicPlayer && s.musicPlayer.discImage) s.musicPlayer.discImage = '';
        if (s.photoWall) s.photoWall.forEach(p => { if (p.dataUrl) p.dataUrl = ''; });
        if (s.customSounds) s.customSounds.forEach(cs => { if (cs.dataUrl) cs.dataUrl = ''; });
        return clone;
    },

    // Profile
    getProfile() { return this.data.profile; },
    updateProfile(updates) {
        Object.assign(this.data.profile, updates);
        this.save();
    },

    // Peer
    getPeer() { return this.data.peer; },
    updatePeer(updates) {
        Object.assign(this.data.peer, updates);
        this.save();
    },

    // Groups
    getGroups() { return this.data.groups; },
    addGroup(name) {
        const id = 'g_' + Date.now();
        this.data.groups.push({ id, name });
        this.save();
        return id;
    },
    renameGroup(id, name) {
        const g = this.data.groups.find(g => g.id === id);
        if (g) { g.name = name; this.save(); }
    },
    reorderGroups(orderedIds) {
        const newGroups = [];
        orderedIds.forEach(id => {
            const g = this.data.groups.find(g => g.id === id);
            if (g) newGroups.push(g);
        });
        this.data.groups.forEach(g => {
            if (!orderedIds.includes(g.id)) newGroups.push(g);
        });
        this.data.groups = newGroups;
        this.save();
    },
    deleteGroup(id) {
        if (id === 'default') return false;
        this.data.groups = this.data.groups.filter(g => g.id !== id);
        this.data.cards.forEach(c => {
            if (c.group === id) c.group = null;
        });
        this.save();
        return true;
    },

    // Cards
    getCards() { return this.data.cards; },
    getCardsByGroup(groupId) {
        if (groupId === 'all' || !groupId) return this.data.cards;
        if (groupId === 'default') {
            const validIds = new Set(this.data.groups.map(g => g.id));
            return this.data.cards.filter(c => !c.group || !validIds.has(c.group));
        }
        return this.data.cards.filter(c => c.group === groupId);
    },
    getActiveCards() {
        return this.data.cards.filter(c => !c.blocked);
    },
    getActiveCardsByGroup(groupId) {
        const cards = this.getActiveCards();
        if (!groupId || groupId === 'all') return cards;
        if (groupId === 'default') {
            const validIds = new Set(this.data.groups.map(g => g.id));
            return cards.filter(c => !c.group || !validIds.has(c.group));
        }
        return cards.filter(c => c.group === groupId);
    },
    addCards(contents, group) {
        const targetGroup = group || null;
        contents.forEach(line => {
            let content = line.trim();
            if (!content) return;
            let translation = '';
            const match = content.match(/\{(.+?)\}/);
            if (match) {
                translation = match[1].trim();
                content = content.replace(/\{.+?\}/, '').trim();
            }
            if (content) {
                this.data.cards.push({
                    id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
                    content,
                    translation,
                    group: targetGroup,
                    blocked: false,
                    usageCount: 0
                });
            }
        });
        this.save();
    },
    updateCard(id, updates) {
        const card = this.data.cards.find(c => c.id === id);
        if (card) {
            Object.assign(card, updates);
            this.save();
        }
    },
    deleteCard(id) {
        this.data.cards = this.data.cards.filter(c => c.id !== id);
        this.save();
    },
    deleteCards(ids) {
        const idSet = new Set(ids);
        this.data.cards = this.data.cards.filter(c => !idSet.has(c.id));
        this.save();
    },
    toggleBlock(id) {
        const card = this.data.cards.find(c => c.id === id);
        if (card) {
            card.blocked = !card.blocked;
            this.save();
        }
    },
    blockCards(ids, blocked) {
        const idSet = new Set(ids);
        this.data.cards.forEach(c => {
            if (idSet.has(c.id)) c.blocked = blocked;
        });
        this.save();
    },
    moveCardsToGroup(ids, groupId) {
        const idSet = new Set(ids);
        this.data.cards.forEach(c => {
            if (idSet.has(c.id)) c.group = groupId;
        });
        this.save();
    },
    incrementUsage(id) {
        const card = this.data.cards.find(c => c.id === id);
        if (card) {
            card.usageCount++;
            this.save();
        }
    },

    // Messages
    getMessages() { return this.data.messages; },
    addMessage(msg) {
        if (this.data.messages.length === 0 && !this.data.firstChatDate) {
            this.data.firstChatDate = Date.now();
        }
        this.data.messages.push(msg);
        this.save();
    },
    clearMessages() {
        this.data.messages = [];
        this.save();
    },

    // Status Cards
    getStatusCards() { return this.data.statusCards || []; },
    getActiveStatusCards() {
        return (this.data.statusCards || []).filter(c => !c.blocked);
    },
    addStatusCard(content) {
        if (!this.data.statusCards) this.data.statusCards = [];
        this.data.statusCards.push({
            id: 'sc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            content,
            blocked: false,
            usageCount: 0
        });
        this.save();
    },
    updateStatusCard(id, updates) {
        const card = (this.data.statusCards || []).find(c => c.id === id);
        if (card) {
            Object.assign(card, updates);
            this.save();
        }
    },
    deleteStatusCard(id) {
        if (!this.data.statusCards) return;
        this.data.statusCards = this.data.statusCards.filter(c => c.id !== id);
        this.save();
    },
    deleteStatusCards(ids) {
        if (!this.data.statusCards) return;
        const idSet = new Set(ids);
        this.data.statusCards = this.data.statusCards.filter(c => !idSet.has(c.id));
        this.save();
    },
    toggleStatusBlock(id) {
        const card = (this.data.statusCards || []).find(c => c.id === id);
        if (card) {
            card.blocked = !card.blocked;
            this.save();
        }
    },
    blockStatusCards(ids, blocked) {
        if (!this.data.statusCards) return;
        const idSet = new Set(ids);
        this.data.statusCards.forEach(c => {
            if (idSet.has(c.id)) c.blocked = blocked;
        });
        this.save();
    },
    pickRandomStatus() {
        const active = this.getActiveStatusCards();
        if (active.length === 0) return '';
        const card = active[Math.floor(Math.random() * active.length)];
        const sc = (this.data.statusCards || []).find(c => c.id === card.id);
        if (sc) sc.usageCount++;
        return card.content;
    },

    // Emoji Cards
    getEmojiCards() { return this.data.emojiCards || []; },
    getActiveEmojiCards() {
        return (this.data.emojiCards || []).filter(c => !c.blocked);
    },
    addEmojiCard(content) {
        if (!this.data.emojiCards) this.data.emojiCards = [];
        this.data.emojiCards.push({
            id: 'ec_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            content,
            blocked: false,
            usageCount: 0
        });
        this.save();
    },
    updateEmojiCard(id, updates) {
        const card = (this.data.emojiCards || []).find(c => c.id === id);
        if (card) {
            Object.assign(card, updates);
            this.save();
        }
    },
    deleteEmojiCard(id) {
        if (!this.data.emojiCards) return;
        this.data.emojiCards = this.data.emojiCards.filter(c => c.id !== id);
        this.save();
    },
    deleteEmojiCards(ids) {
        if (!this.data.emojiCards) return;
        const idSet = new Set(ids);
        this.data.emojiCards = this.data.emojiCards.filter(c => !idSet.has(c.id));
        this.save();
    },
    toggleEmojiBlock(id) {
        const card = (this.data.emojiCards || []).find(c => c.id === id);
        if (card) {
            card.blocked = !card.blocked;
            this.save();
        }
    },
    blockEmojiCards(ids, blocked) {
        if (!this.data.emojiCards) return;
        const idSet = new Set(ids);
        this.data.emojiCards.forEach(c => {
            if (idSet.has(c.id)) c.blocked = blocked;
        });
        this.save();
    },
    pickRandomEmoji() {
        const active = this.getActiveEmojiCards();
        if (active.length === 0) return '';
        const card = active[Math.floor(Math.random() * active.length)];
        const ec = (this.data.emojiCards || []).find(c => c.id === card.id);
        if (ec) ec.usageCount++;
        return card.content;
    },

    // Gift Cards
    getGiftCards() { return this.data.giftCards || []; },
    getActiveGiftCards() {
        return (this.data.giftCards || []).filter(c => !c.blocked);
    },
    addGiftCard(emoji, name, description) {
        if (!this.data.giftCards) this.data.giftCards = [];
        this.data.giftCards.push({
            id: 'gc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            emoji: emoji || '\uD83C\uDF81',
            name: name || '\u793C\u7269',
            description: description || '',
            blocked: false,
            usageCount: 0
        });
        this.save();
    },
    updateGiftCard(id, updates) {
        const card = (this.data.giftCards || []).find(c => c.id === id);
        if (card) {
            Object.assign(card, updates);
            this.save();
        }
    },
    deleteGiftCard(id) {
        if (!this.data.giftCards) return;
        this.data.giftCards = this.data.giftCards.filter(c => c.id !== id);
        this.save();
    },
    deleteGiftCards(ids) {
        if (!this.data.giftCards) return;
        const idSet = new Set(ids);
        this.data.giftCards = this.data.giftCards.filter(c => !idSet.has(c.id));
        this.save();
    },
    toggleGiftBlock(id) {
        const card = (this.data.giftCards || []).find(c => c.id === id);
        if (card) {
            card.blocked = !card.blocked;
            this.save();
        }
    },
    blockGiftCards(ids, blocked) {
        if (!this.data.giftCards) return;
        const idSet = new Set(ids);
        this.data.giftCards.forEach(c => {
            if (idSet.has(c.id)) c.blocked = blocked;
        });
        this.save();
    },
    pickRandomGift() {
        const active = this.getActiveGiftCards();
        if (active.length === 0) return null;
        const card = active[Math.floor(Math.random() * active.length)];
        const gc = (this.data.giftCards || []).find(c => c.id === card.id);
        if (gc) gc.usageCount++;
        this.save();
        return { emoji: card.emoji, name: card.name, description: card.description || '' };
    },

    // Settings
    getSettings() { return this.data.settings; },
    updateSettings(updates) {
        Object.assign(this.data.settings, updates);
        this.save();
    },

    // Data size stats
    getDataStats() {
        const json = JSON.stringify(this.data);
        const total = new Blob([json]).size;

        // Settings portion (text fields only)
        const settingsData = JSON.stringify({
            settings: this.data.settings,
            profile: this.data.profile,
            peer: this.data.peer,
            groups: this.data.groups
        });
        const settingsSize = new Blob([settingsData]).size;

        // Cards portion
        const cardsData = JSON.stringify({
            cards: this.data.cards,
            statusCards: this.data.statusCards,
            emojiCards: this.data.emojiCards,
            giftCards: this.data.giftCards
        });
        const cardsSize = new Blob([cardsData]).size;

        // Media portion (images, audio as base64)
        let mediaSize = 0;
        const s = this.data.settings;
        if (s.myAvatar) mediaSize += s.myAvatar.length * 0.75;
        if (s.otherAvatar) mediaSize += s.otherAvatar.length * 0.75;
        if (s.homeBackground) mediaSize += s.homeBackground.length * 0.75;
        if (s.cardBackground) mediaSize += s.cardBackground.length * 0.75;
        if (s.photoWall) s.photoWall.forEach(p => { mediaSize += (p.dataUrl || '').length * 0.75; });
        if (s.customSounds) s.customSounds.forEach(cs => { mediaSize += (cs.dataUrl || '').length * 0.75; });

        // Messages portion
        const msgData = JSON.stringify({ messages: this.data.messages });
        const msgSize = new Blob([msgData]).size;

        return {
            total,
            settingsSize,
            cardsSize,
            mediaSize: Math.round(mediaSize),
            msgSize
        };
    },

    // Export / Import
    exportData() {
        return JSON.stringify(this.data, null, 2);
    },
    importData(jsonStr) {
        try {
            const imported = JSON.parse(jsonStr);
            this.data = { ...defaultData, ...imported };
            this.data.profile = { ...defaultData.profile, ...(imported.profile || {}) };
            this.data.peer = { ...defaultData.peer, ...(imported.peer || {}) };
            this.data.settings = { ...defaultData.settings, ...(imported.settings || {}) };
            this.save();
            return true;
        } catch (e) {
            return false;
        }
    },
    exportCardsTxt() {
        let txt = '# Fireworks \u5B57\u5361\u5E93\u5BFC\u51FA\n';
        txt += '# \u683C\u5F0F\u8BF4\u660E\uFF1A\u3010\u3011\u5185\u4E3A\u5206\u7EC4\uFF0C{}\u5185\u4E3A\u7FFB\u8BD1\n\n';

        // Group cards by group name
        const grouped = {};
        this.data.cards.forEach(c => {
            const groupName = (this.data.groups.find(g => g.id === c.group) || {}).name || '\u672A\u5206\u7EC4';
            if (!grouped[groupName]) grouped[groupName] = [];
            grouped[groupName].push(c);
        });

        for (const [groupName, cards] of Object.entries(grouped)) {
            txt += `\u3010${groupName}\u3011\n`;
            cards.forEach(c => {
                txt += c.content;
                if (c.translation) txt += ` {${c.translation}}`;
                txt += '\n';
            });
            txt += '\n';
        }
        return txt;
    },
    importCardsTxt(txt, mode = 'append') {
        // Overwrite mode: clear all existing main cards first
        if (mode === 'overwrite') {
            this.data.cards = [];
        }

        const lines = txt.split('\n');
        let added = 0;
        let currentGroup = null;

        // Build set of existing card contents for dedup (append mode only)
        const existingContents = mode === 'append' ? new Set(this.data.cards.map(c => c.content)) : null;

        lines.forEach(line => {
            let trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;

            // New format group header: \u3010xxx\u3011
            const newGroupMatch = trimmed.match(/^\u3010(.+?)\u3011$/);
            if (newGroupMatch) {
                const groupName = newGroupMatch[1].trim();
                const existingGroup = this.data.groups.find(g => g.name === groupName);
                if (existingGroup) {
                    currentGroup = existingGroup.id;
                } else {
                    currentGroup = this.addGroup(groupName);
                }
                return;
            }

            // Old format: [Group] content (backward compatible)
            const oldGroupMatch = trimmed.match(/^\[([^\]]+)\]\s*(.*)/);
            if (oldGroupMatch) {
                const groupName = oldGroupMatch[1].trim();
                trimmed = oldGroupMatch[2];
                const existingGroup = this.data.groups.find(g => g.name === groupName);
                if (existingGroup) {
                    currentGroup = existingGroup.id;
                } else {
                    currentGroup = this.addGroup(groupName);
                }
            }

            let content = trimmed;
            let translation = '';

            // New format: {translation} at end of line
            const newTransMatch = content.match(/\s*\{(.+?)\}\s*$/);
            if (newTransMatch) {
                translation = newTransMatch[1].trim();
                content = content.replace(/\s*\{.+?\}\s*$/, '').trim();
            }
            // Old format: {{translation}} (backward compatible)
            if (!translation) {
                const oldTransMatch = content.match(/\{\{(.+?)\}\}/);
                if (oldTransMatch) {
                    translation = oldTransMatch[1].trim();
                    content = content.replace(/\{\{.+?\}\}/, '').trim();
                }
            }

            if (content) {
                // Dedup in append mode
                if (existingContents && existingContents.has(content)) return;
                if (existingContents) existingContents.add(content);

                this.data.cards.push({
                    id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7) + '_' + added,
                    content,
                    translation,
                    group: currentGroup,
                    blocked: false,
                    usageCount: 0
                });
                added++;
            }
        });
        this.save();
        return added;
    },
    // Dedup functions
    dedupCards() {
        const seen = new Set();
        const unique = [];
        let removed = 0;
        for (let i = this.data.cards.length - 1; i >= 0; i--) {
            const c = this.data.cards[i];
            if (!seen.has(c.content)) {
                seen.add(c.content);
                unique.unshift(this.data.cards[i]);
            } else {
                removed++;
            }
        }
        this.data.cards = unique;
        this.save();
        return removed;
    },
    dedupStatusCards() {
        const seen = new Set();
        const unique = [];
        let removed = 0;
        for (let i = this.data.statusCards.length - 1; i >= 0; i--) {
            const c = this.data.statusCards[i];
            if (!seen.has(c.content)) {
                seen.add(c.content);
                unique.unshift(this.data.statusCards[i]);
            } else {
                removed++;
            }
        }
        this.data.statusCards = unique;
        this.save();
        return removed;
    },
    dedupEmojiCards() {
        const seen = new Set();
        const unique = [];
        let removed = 0;
        for (let i = this.data.emojiCards.length - 1; i >= 0; i--) {
            const c = this.data.emojiCards[i];
            if (!seen.has(c.content)) {
                seen.add(c.content);
                unique.unshift(this.data.emojiCards[i]);
            } else {
                removed++;
            }
        }
        this.data.emojiCards = unique;
        this.save();
        return removed;
    },
    dedupGiftCards() {
        const seen = new Set();
        const unique = [];
        let removed = 0;
        for (let i = this.data.giftCards.length - 1; i >= 0; i--) {
            const c = this.data.giftCards[i];
            const key = `${c.emoji}|${c.name}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.unshift(this.data.giftCards[i]);
            } else {
                removed++;
            }
        }
        this.data.giftCards = unique;
        this.save();
        return removed;
    },
    clearAll() {
        this.data = JSON.parse(JSON.stringify(defaultData));
        this.save();
    }
};

/* ===== Utility functions ===== */
const Utils = {
    uid() {
        return 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    },
    formatTime(ts) {
        const d = new Date(ts);
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    },
    formatDate(ts) {
        const d = new Date(ts);
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === now.toDateString()) {
            return '\u4ECA\u5929';
        } else if (d.toDateString() === yesterday.toDateString()) {
            return '\u6628\u5929';
        } else {
            return `${d.getFullYear()}\u5E74${d.getMonth()+1}\u6708${d.getDate()}\u65E5`;
        }
    },
    formatDateTime(ts) {
        return this.formatDate(ts) + ' ' + this.formatTime(ts);
    },
    shouldShowTimeDivider(prevTs, currTs) {
        if (!prevTs) return false;
        const diff = currTs - prevTs;
        const oneHour = 60 * 60 * 1000;
        const prevDate = new Date(prevTs);
        const currDate = new Date(currTs);
        if (prevDate.toDateString() !== currDate.toDateString()) return true;
        if (diff >= oneHour) return true;
        return false;
    },
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },
    // Probability distribution for number of cards - weighted toward single messages
    randomCardCount() {
        const weights = [55, 25, 12, 5, 3]; // P(1)=55%, P(2)=25%, etc
        const total = weights.reduce((a,b) => a+b, 0);
        let r = Math.random() * total;
        for (let i = 0; i < weights.length; i++) {
            r -= weights[i];
            if (r <= 0) return i + 1;
        }
        return 1;
    },
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },
    pickRandom(array, count) {
        return this.shuffle(array).slice(0, Math.min(count, array.length));
    },
    toast(msg, duration = 2500) {
        const el = document.getElementById('toast');
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => el.classList.remove('show'), duration);
    },
    escapeHtml(text) {
        if (!text && text !== 0) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    },
    escapeAttr(text) {
        return String(text || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    playSound(type, force) {
        if (force) {
            return this._playSoundInternal(type);
        }
        const settings = Data.getSettings();
        if (!settings.sound) return;
        if (type === 'send' && !settings.sendSound) return;
        if (type === 'receive' && !settings.receiveSound) return;
        return this._playSoundInternal(type);
    },

    _playSoundInternal(type) {
        try {
            const s = Data.getSettings();
            // Check for custom sound
            const customSounds = s.customSounds || [];
            const soundType = type === 'send' ? (s.sendSoundType || s.soundType || 'pop') : (s.receiveSoundType || s.soundType || 'pop');

            const isCustom = customSounds.find(cs => cs.id === soundType);
            if (isCustom) {
                const audio = new Audio(isCustom.dataUrl);
                audio.volume = 0.5;
                audio.play().catch(() => {});
                setTimeout(() => { audio.pause(); audio.src = ''; }, 2000);
                return;
            }

            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'send') {
                if (soundType === 'pop') {
                    osc.frequency.setValueAtTime(800, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
                } else if (soundType === 'bell') {
                    osc.frequency.setValueAtTime(1200, ctx.currentTime);
                } else if (soundType === 'bubble') {
                    osc.frequency.setValueAtTime(600, ctx.currentTime);
                    osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.05);
                }
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.15);
            } else if (type === 'receive') {
                if (soundType === 'pop') {
                    osc.frequency.setValueAtTime(500, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.1);
                } else if (soundType === 'bell') {
                    osc.frequency.setValueAtTime(900, ctx.currentTime);
                } else if (soundType === 'bubble') {
                    osc.frequency.setValueAtTime(400, ctx.currentTime);
                    osc.frequency.linearRampToValueAtTime(700, ctx.currentTime + 0.05);
                }
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.2);
            }
            setTimeout(() => ctx.close(), 300);
        } catch(e) {}
    },
    notify(title, body) {
        if (!Data.getSettings().notifications) return;
        if (!('Notification' in window)) return;
        // 页面在前台（用户正在使用）时不发送通知，仅后台时发送
        if (document.visibilityState === 'visible') return;
        if (Notification.permission === 'granted') {
            new Notification(title, { body });
        }
    },
    requestNotifyPermission() {
        if (!('Notification' in window)) return Promise.resolve('unsupported');
        return Notification.requestPermission();
    },
    // Format bytes to human readable
    formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    },

    // Compress image using canvas - reduces file size dramatically
    compressImage(file, maxWidth = 1920, quality = 0.75) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                reject(new Error('Not an image'));
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let w = img.naturalWidth;
                    let h = img.naturalHeight;
                    if (w > maxWidth) {
                        h = Math.round(h * maxWidth / w);
                        w = maxWidth;
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    // Keep PNG for small images (transparency), use JPEG for large
                    const outType = (file.type === 'image/png' && w * h < 250000)
                        ? 'image/png'
                        : 'image/jpeg';
                    resolve(canvas.toDataURL(outType, quality));
                };
                img.onerror = () => reject(new Error('Image load failed'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }
};

// Initialize data
Data.init();
