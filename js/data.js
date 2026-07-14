/* ===== Data Layer - localStorage management ===== */

const DB_KEY = 'fireworks_db';

const defaultData = {
    profile: {
        avatar: '',
        avatarEmoji: '\uD83C\uDF86',
        background: '',
        nickname: 'sparkle',
        bio: '\u5728\u8FD9\u91CC\uFF0C\u6BCF\u4E00\u6761\u6D88\u606F\u90FD\u662F\u4E00\u573A\u70DF\u82B1',
        location: 'Shanghai',
        weather: 'Sunny 25\u00B0C',
        useRealWeather: false,
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
        { id: 'default', name: '\u9ED8\u8BA4\u5206\u7EC4' },
        { id: 'greetings', name: '\u65E5\u5E38\u95EE\u5019' },
        { id: 'funny', name: '\u8DA3\u5473' }
    ],
    cards: [
        { id: 'c1', content: '\u4F60\u597D\u5440\uFF01', translation: 'Hello there!', group: 'greetings', blocked: false, usageCount: 0 },
        { id: 'c2', content: '\u4ECA\u5929\u8FC7\u5F97\u600E\u4E48\u6837\uFF1F', translation: 'How was your day?', group: 'greetings', blocked: false, usageCount: 0 },
        { id: 'c3', content: '\u665A\u5B89\uFF0C\u505A\u4E2A\u597D\u68A6', translation: 'Good night, sweet dreams', group: 'greetings', blocked: false, usageCount: 0 },
        { id: 'c4', content: '\u4E2D\u5348\u5403\u4E86\u4EC0\u4E48\uFF1F', translation: 'What did you have for lunch?', group: 'greetings', blocked: false, usageCount: 0 },
        { id: 'c5', content: '\u597D\u4E45\u4E0D\u89C1\uFF01', translation: 'Long time no see!', group: 'greetings', blocked: false, usageCount: 0 },
        { id: 'c6', content: '\u54C8\u54C8\u54C8\u592A\u641E\u7B11\u4E86', translation: 'Hahaha that is so funny', group: 'funny', blocked: false, usageCount: 0 },
        { id: 'c7', content: '\u6211\u4E5F\u662F\u8FD9\u4E48\u60F3\u7684', translation: 'I think so too', group: 'funny', blocked: false, usageCount: 0 },
        { id: 'c8', content: '\u8FD9\u4E5F\u592A\u79BB\u8C31\u4E86\u5427', translation: 'This is absolutely ridiculous', group: 'funny', blocked: false, usageCount: 0 },
        { id: 'c9', content: '\u4F60\u8BF4\u7684\u6709\u9053\u7406', translation: 'You make a good point', group: 'default', blocked: false, usageCount: 0 },
        { id: 'c10', content: '\u6211\u5728\u542C\uFF0C\u7EE7\u7EED\u8BF4', translation: "I'm listening, go on", group: 'default', blocked: false, usageCount: 0 },
        { id: 'c11', content: '\u539F\u6765\u5982\u6B64', translation: 'I see', group: 'default', blocked: false, usageCount: 0 },
        { id: 'c12', content: '\u55EF\u55EF\uFF0C\u7136\u540E\u5462\uFF1F', translation: 'Yeah, and then?', group: 'default', blocked: false, usageCount: 0 },
        { id: 'c13', content: '\u54C7\uFF0C\u597D\u5389\u5BB3\uFF01', translation: 'Wow, amazing!', group: 'funny', blocked: false, usageCount: 0 },
        { id: 'c14', content: '\u6211\u4EEC\u4E00\u8D77\u52A0\u6CB9\u5427', translation: "Let's do our best together", group: 'greetings', blocked: false, usageCount: 0 },
        { id: 'c15', content: '\u522B\u5FD8\u4E86\u4F11\u606F\u54E6', translation: "Don't forget to rest", group: 'greetings', blocked: false, usageCount: 0 }
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
        patSettings: {
            enabled: true,
            patText: '\u62CD\u4E86\u62CD',
            userPatCustomText: '\u5934',
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

const Data = {
    data: null,

    init() {
        const saved = localStorage.getItem(DB_KEY);
        if (saved) {
            try {
                this.data = JSON.parse(saved);
                this.data = { ...defaultData, ...this.data };
                this.data.profile = { ...defaultData.profile, ...this.data.profile };
                this.data.peer = { ...defaultData.peer, ...this.data.peer };
                this.data.settings = { ...defaultData.settings, ...this.data.settings };
                if (!this.data.groups) this.data.groups = defaultData.groups;
                if (!this.data.cards) this.data.cards = defaultData.cards;
                if (!this.data.emojiCards) this.data.emojiCards = defaultData.emojiCards;
                if (!this.data.giftCards) this.data.giftCards = defaultData.giftCards;
            } catch (e) {
                this.data = JSON.parse(JSON.stringify(defaultData));
            }
        } else {
            this.data = JSON.parse(JSON.stringify(defaultData));
            this.save();
        }
    },

    save() {
        localStorage.setItem(DB_KEY, JSON.stringify(this.data));
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
    deleteGroup(id) {
        if (id === 'default') return false;
        this.data.groups = this.data.groups.filter(g => g.id !== id);
        this.data.cards.forEach(c => {
            if (c.group === id) c.group = 'default';
        });
        this.save();
        return true;
    },

    // Cards
    getCards() { return this.data.cards; },
    getCardsByGroup(groupId) {
        if (groupId === 'all' || !groupId) return this.data.cards;
        return this.data.cards.filter(c => c.group === groupId);
    },
    getActiveCards() {
        return this.data.cards.filter(c => !c.blocked);
    },
    getActiveCardsByGroup(groupId) {
        const cards = this.getActiveCards();
        if (!groupId || groupId === 'all') return cards;
        return cards.filter(c => c.group === groupId);
    },
    addCards(contents, group) {
        const targetGroup = group || 'default';
        contents.forEach(line => {
            let content = line.trim();
            if (!content) return;
            let translation = '';
            const match = content.match(/\{\{(.+?)\}\}/);
            if (match) {
                translation = match[1].trim();
                content = content.replace(/\{\{.+?\}\}/, '').trim();
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
        txt += '# \u683C\u5F0F\u8BF4\u660E\uFF1A\u6BCF\u884C\u4E00\u6761\u5B57\u5361\uFF0C{{}}\u5185\u4E3A\u7FFB\u8BD1\n\n';
        this.data.cards.forEach(c => {
            const groupName = (this.data.groups.find(g => g.id === c.group) || {}).name || '\u9ED8\u8BA4\u5206\u7EC4';
            txt += `[${groupName}] ${c.content}`;
            if (c.translation) txt += ` {{${c.translation}}}`;
            txt += '\n';
        });
        return txt;
    },
    importCardsTxt(txt) {
        const lines = txt.split('\n');
        let added = 0;
        lines.forEach(line => {
            let trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;

            let cardGroup = 'default';
            const groupMatch = trimmed.match(/^\[([^\]]+)\]\s*(.*)/);
            if (groupMatch) {
                const groupName = groupMatch[1].trim();
                trimmed = groupMatch[2];
                const existingGroup = this.data.groups.find(g => g.name === groupName);
                if (existingGroup) {
                    cardGroup = existingGroup.id;
                } else {
                    cardGroup = this.addGroup(groupName);
                }
            }

            let content = trimmed;
            let translation = '';
            const transMatch = content.match(/\{\{(.+?)\}\}/);
            if (transMatch) {
                translation = transMatch[1].trim();
                content = content.replace(/\{\{.+?\}\}/, '').trim();
            }
            if (content) {
                this.data.cards.push({
                    id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7) + '_' + added,
                    content,
                    translation,
                    group: cardGroup,
                    blocked: false,
                    usageCount: 0
                });
                added++;
            }
        });
        this.save();
        return added;
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
    }
};

// Initialize data
Data.init();
