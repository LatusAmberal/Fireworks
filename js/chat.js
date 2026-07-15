/* ===== Chat Page ===== */

const Chat = {
    isReplying: false,
    messagesContainer: null,
    inputField: null,
    sendBtn: null,
    playBtn: null,
    peerNameEl: null,
    lastRenderedTs: 0,
    autoScroll: true,
    proactiveTimer: null,
    lastSentTimestamp: 0,
    _patDebounce: {},
    _callTimer: null,
    _callStartTime: null,
    _inCall: false,

    init() {
        this.messagesContainer = document.getElementById('chatMessages');
        this.inputField = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('chatSendBtn');
        this.playBtn = document.getElementById('chatPlayBtn');
        this.peerNameEl = document.getElementById('chatPeerName');
        this.lastSentTimestamp = Date.now();

        this.sendBtn.addEventListener('click', () => this.handleSend());
        this.playBtn.addEventListener('click', () => this.handlePlay());

        this.inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        this.messagesContainer.addEventListener('scroll', () => {
            const { scrollTop, scrollHeight, clientHeight } = this.messagesContainer;
            this.autoScroll = scrollHeight - scrollTop - clientHeight < 80;

            const scrollBtn = document.getElementById('scrollBottomBtn');
            if (scrollBtn) {
                scrollBtn.style.display = this.autoScroll ? 'none' : 'flex';
            }
        });

        // Click on messages container background hides all delete buttons
        this.messagesContainer.addEventListener('click', (e) => {
            if (!e.target.closest('.msg-bubble')) {
                document.querySelectorAll('.msg-delete-bubble.visible').forEach(b => b.classList.remove('visible'));
            }
        });

        document.getElementById('chatSettingsBtn').addEventListener('click', () => {
            App.navigate('chatsettings');
        });

        // Scroll to bottom button
        const scrollBtn = document.getElementById('scrollBottomBtn');
        if (scrollBtn) {
            scrollBtn.addEventListener('click', () => this.scrollToBottom(true));
        }

        // + drawer
        this.bindDrawer();

        this.startProactiveCheck();
    },

    onShow() {
        const peer = Data.getPeer();
        this.peerNameEl.textContent = peer.nickname || 'shimmer';
        this.renderAllMessages();
        this.scrollToBottom(true);
        const scrollBtn = document.getElementById('scrollBottomBtn');
        if (scrollBtn) scrollBtn.style.display = 'none';
    },

    handleSend() {
        const text = this.inputField.value.trim();
        if (!text) return;
        this.inputField.value = '';
        this.lastSentTimestamp = Date.now();
        this.sendMyMessage(text);
    },

    handlePlay() {
        if (this.isReplying) return;
        this.triggerPeerReply();
    },

    sendMyMessage(text) {
        const msg = {
            id: Utils.uid(),
            side: 'me',
            content: text,
            translation: '',
            timestamp: Date.now(),
            read: false
        };
        Data.addMessage(msg);

        this.appendMessage(msg, true);
        this.scrollToBottom();
        Utils.playSound('send');

        const peer = Data.getPeer();
        const readDelay = Utils.randomFloat(peer.readDelayMin * 1000, peer.readDelayMax * 1000);

        setTimeout(() => {
            msg.read = true;
            Data.save();
            this.updateReadStatus(msg.id);

            if (peer.autoReply) {
                // Fixed 2%-10% chance of no reply
                const noReplyChance = Utils.randomFloat(0.02, 0.10);
                if (Math.random() > noReplyChance) {
                    this.triggerPeerReply();
                }
            }
        }, readDelay);
    },

    triggerPeerReply() {
        if (this.isReplying) return;

        const settings = Data.getSettings();
        const peer = Data.getPeer();
        const patSettings = settings.patSettings || {};

        this.isReplying = true;
        const delay = Utils.randomInt(peer.minDelay * 1000, peer.maxDelay * 1000);
        this.showTypingIndicator();

        setTimeout(() => {
            this.hideTypingIndicator();

            // Check pat trigger probability first
            if (patSettings.enabled !== false && Math.random() < (patSettings.patTriggerProbability || 0)) {
                const profile = Data.getProfile();
                const myName = profile.nickname || 'sparkle';
                const peerName = peer.nickname || 'shimmer';
                const text = (patSettings.peerPatPrefix || '\u5BF9\u65B9\u62CD\u4E86\u62CD\u4F60\u7684\uFF1A') + myName;
                this.appendPatDivider(text, 'other');
                this.isReplying = false;
                this.lastSentTimestamp = Date.now();
                return;
            }

            let activeCards = Data.getActiveCardsByGroup(peer.activeGroup);

            let mixEmojis = [];
            if (settings.emojiMixEnabled) {
                const activeEmojis = Data.getActiveEmojiCards();
                if (Math.random() < settings.emojiMixProbability) {
                    const emojiCount = Utils.randomInt(1, 3);
                    mixEmojis = Utils.pickRandom(activeEmojis, emojiCount).map(c => ({ content: c.content, isEmoji: true }));
                }
            }

            if (activeCards.length === 0 && mixEmojis.length === 0) {
                Utils.toast('\u5B57\u5361\u5E93\u4E2D\u6CA1\u6709\u53EF\u7528\u7684\u5B57\u5361');
                this.isReplying = false;
                return;
            }

            const count = Math.min(Utils.randomCardCount(), activeCards.length + mixEmojis.length);
            let selectedCards;

            if (activeCards.length === 0) {
                selectedCards = mixEmojis.slice(0, count).map(e => ({ content: e.content, isEmoji: true }));
            } else if (mixEmojis.length === 0) {
                selectedCards = Utils.pickRandom(activeCards, count).map(c => ({ content: c.content, translation: c.translation || '', id: c.id }));
            } else {
                const textCount = Math.max(1, count - mixEmojis.length);
                const textCards = Utils.pickRandom(activeCards, textCount).map(c => ({ content: c.content, translation: c.translation || '', id: c.id }));
                const emojiToAdd = mixEmojis.slice(0, count - textCount);
                selectedCards = Utils.shuffle([...textCards, ...emojiToAdd]).slice(0, count);
            }

            this.sendPeerMessages(selectedCards);
            this.isReplying = false;
            this.lastSentTimestamp = Date.now();
        }, delay);
    },

    async sendPeerMessages(cards) {
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            if (i > 0) {
                const gap = Utils.randomInt(800, 2500);
                this.showTypingIndicator();
                await this.sleep(gap);
                this.hideTypingIndicator();
            }

            const isEmoji = card.isEmoji || false;
            const msg = {
                id: Utils.uid(),
                side: 'other',
                content: card.content,
                translation: (!isEmoji && card.translation) ? card.translation : '',
                timestamp: Date.now(),
                read: true,
                isEmoji: isEmoji
            };
            Data.addMessage(msg);
            if (card.id && !isEmoji) Data.incrementUsage(card.id);
            this.appendMessage(msg, true);
            this.scrollToBottom();
            Utils.playSound('receive');
            Utils.notify(Data.getPeer().nickname, card.content);
        }
    },

    showTypingIndicator() {
        this.hideTypingIndicator();

        // Auto-mark all unread messages as read when peer starts typing
        this._markUnreadAsRead();

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typingIndicator';

        const avatarWrap = document.createElement('div');
        avatarWrap.className = 'msg-avatar-wrap';
        const avatar = document.createElement('div');
        avatar.className = 'msg-avatar';
        const peer = Data.getPeer();
        const settings = Data.getSettings();
        if (settings.otherAvatar) {
            avatar.style.backgroundImage = `url(${settings.otherAvatar})`;
            avatar.textContent = '';
        } else {
            avatar.textContent = peer.avatarEmoji || settings.otherAvatarEmoji || '\uD83D\uDE0A';
        }
        avatarWrap.appendChild(avatar);

        const dots = document.createElement('div');
        dots.className = 'typing-dots';
        dots.innerHTML = '<span></span><span></span><span></span>';

        indicator.appendChild(avatarWrap);
        indicator.appendChild(dots);
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    },

    hideTypingIndicator() {
        const existing = document.getElementById('typingIndicator');
        if (existing) existing.remove();
    },

    _markUnreadAsRead() {
        const messages = Data.getMessages();
        let changed = false;
        messages.forEach(msg => {
            if (msg.side === 'me' && msg.read === false) {
                msg.read = true;
                changed = true;
                this.updateReadStatus(msg.id);
            }
        });
        if (changed) Data.save();
    },

    appendMessage(msg, animate = false) {
        const messages = Data.getMessages();
        const msgIndex = messages.findIndex(m => m.id === msg.id);
        const prevMsg = msgIndex > 0 ? messages[msgIndex - 1] : null;

        if (prevMsg && Utils.shouldShowTimeDivider(prevMsg.timestamp, msg.timestamp)) {
            this.appendTimeDivider(msg.timestamp);
        } else if (!prevMsg) {
            this.appendTimeDivider(msg.timestamp);
        }

        const hint = document.getElementById('chatEmptyHint');
        if (hint) hint.style.display = 'none';

        const row = this.createMessageElement(msg);
        this.messagesContainer.appendChild(row);
    },

    createMessageElement(msg) {
        const row = document.createElement('div');
        row.className = `msg-row msg-${msg.side}`;
        row.dataset.msgId = msg.id;

        const avatarWrap = document.createElement('div');
        avatarWrap.className = 'msg-avatar-wrap';

        const avatar = document.createElement('div');
        avatar.className = 'msg-avatar';
        const settings = Data.getSettings();
        const peer = Data.getPeer();
        const profile = Data.getProfile();

        if (msg.side === 'me') {
            if (settings.myAvatar) {
                avatar.style.backgroundImage = `url(${settings.myAvatar})`;
            } else {
                avatar.textContent = settings.myAvatarEmoji || '\uD83D\uDE0E';
            }
        } else {
            if (settings.otherAvatar) {
                avatar.style.backgroundImage = `url(${settings.otherAvatar})`;
            } else {
                avatar.textContent = peer.avatarEmoji || settings.otherAvatarEmoji || '\uD83D\uDE0A';
            }
        }

        // Double-click avatar for pat
        const patSettings = settings.patSettings || {};
        if (patSettings.enabled !== false) {
            avatar.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this.handlePat(msg.side);
            });
        }

        avatarWrap.appendChild(avatar);

        const avatarTime = document.createElement('div');
        avatarTime.className = 'msg-avatar-time';
        avatarTime.textContent = Utils.formatTime(msg.timestamp);
        avatarWrap.appendChild(avatarTime);

        const contentWrap = document.createElement('div');
        contentWrap.className = 'msg-content-wrap';

        // Red packet message
        if (msg.isRedPacket) {
            const bubble = this._createRedPacketBubble(msg);
            contentWrap.appendChild(bubble);
            if (msg.side === 'me') {
                const meta = document.createElement('div');
                meta.className = 'msg-meta';
                const readStatus = document.createElement('span');
                readStatus.className = 'msg-read-status ' + (msg.read ? 'read' : 'unread');
                readStatus.textContent = msg.read ? '\u5DF2\u8BFB' : '\u672A\u8BFB';
                readStatus.id = `read-${msg.id}`;
                meta.appendChild(readStatus);
                contentWrap.appendChild(meta);
            }
            if (msg.side === 'other') {
                row.appendChild(avatarWrap);
                row.appendChild(contentWrap);
            } else {
                row.appendChild(contentWrap);
                row.appendChild(avatarWrap);
            }
            return row;
        }

        // Gift message
        if (msg.isGift) {
            const bubble = this._createGiftBubble(msg);
            contentWrap.appendChild(bubble);
            if (msg.side === 'me') {
                const meta = document.createElement('div');
                meta.className = 'msg-meta';
                const readStatus = document.createElement('span');
                readStatus.className = 'msg-read-status ' + (msg.read ? 'read' : 'unread');
                readStatus.textContent = msg.read ? '\u5DF2\u8BFB' : '\u672A\u8BFB';
                readStatus.id = `read-${msg.id}`;
                meta.appendChild(readStatus);
                contentWrap.appendChild(meta);
            }
            if (msg.side === 'other') {
                row.appendChild(avatarWrap);
                row.appendChild(contentWrap);
            } else {
                row.appendChild(contentWrap);
                row.appendChild(avatarWrap);
            }
            return row;
        }

        // Call summary message
        if (msg.isCallSummary) {
            const bubble = document.createElement('div');
            bubble.className = 'msg-bubble call-summary-bubble';
            bubble.innerHTML = msg.callText || msg.content || '';
            contentWrap.appendChild(bubble);
            if (msg.side === 'other') {
                row.appendChild(avatarWrap);
                row.appendChild(contentWrap);
            } else {
                row.appendChild(contentWrap);
                row.appendChild(avatarWrap);
            }
            return row;
        }

        // Reject notice — centered red text, not a chat bubble
        if (msg.isRejectNotice) {
            row.className = 'msg-row msg-reject-notice-row';
            row.innerHTML = '';
            const notice = document.createElement('div');
            notice.className = 'reject-notice';
            notice.textContent = msg.content;
            row.appendChild(notice);
            return row;
        }

        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        if (msg.isEmoji) {
            bubble.style.fontSize = '28px';
            bubble.style.padding = '8px 12px';
        }
        bubble.textContent = msg.content;

        // Delete button on bubble
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'msg-delete-bubble';
        deleteBtn.innerHTML = '\u00D7';
        deleteBtn.title = '\u5220\u9664\u6D88\u606F';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteMessage(msg.id);
        });
        bubble.appendChild(deleteBtn);

        if (msg.side === 'other' && msg.translation && !msg.isEmoji) {
            const translation = document.createElement('div');
            translation.className = 'msg-translation';
            translation.textContent = msg.translation;
            contentWrap.appendChild(bubble);
            contentWrap.appendChild(translation);

            bubble.addEventListener('click', (e) => {
                e.stopPropagation();
                translation.classList.toggle('hidden');
                const wasVisible = deleteBtn.classList.contains('visible');
                document.querySelectorAll('.msg-delete-bubble.visible').forEach(b => b.classList.remove('visible'));
                if (!wasVisible) deleteBtn.classList.add('visible');
            });
        } else {
            contentWrap.appendChild(bubble);
            bubble.addEventListener('click', (e) => {
                e.stopPropagation();
                const wasVisible = deleteBtn.classList.contains('visible');
                document.querySelectorAll('.msg-delete-bubble.visible').forEach(b => b.classList.remove('visible'));
                if (!wasVisible) deleteBtn.classList.add('visible');
            });
        }

        if (msg.side === 'me') {
            const meta = document.createElement('div');
            meta.className = 'msg-meta';

            const readStatus = document.createElement('span');
            readStatus.className = 'msg-read-status ' + (msg.read ? 'read' : 'unread');
            readStatus.textContent = msg.read ? '\u5DF2\u8BFB' : '\u672A\u8BFB';
            readStatus.id = `read-${msg.id}`;
            meta.appendChild(readStatus);

            contentWrap.appendChild(meta);
        }

        if (msg.side === 'other') {
            row.appendChild(avatarWrap);
            row.appendChild(contentWrap);
        } else {
            row.appendChild(contentWrap);
            row.appendChild(avatarWrap);
        }

        return row;
    },

    // ===== Red Packet Bubble =====
    _createRedPacketBubble(msg) {
        const wrap = document.createElement('div');
        wrap.className = 'rp-bubble-wrap';
        wrap.id = `rp-${msg.id}`;

        const card = document.createElement('div');
        card.className = 'rp-chat-card';
        if (msg.rpStatus === 'accepted') card.classList.add('accepted');
        if (msg.rpStatus === 'rejected') card.classList.add('rejected');

        const statusText = msg.rpStatus === 'accepted' ? '\u5DF2\u6536\u4E0B' : (msg.rpStatus === 'rejected' ? '\u5DF2\u62D2\u7EDD' : '\u5F85\u9886\u53D6');
        const statusIcon = msg.rpStatus === 'accepted' ? '\u2705' : (msg.rpStatus === 'rejected' ? '\u274C' : '');

        card.innerHTML = `
            <div class="rp-card-top">
                <div class="rp-card-icon">\uD83E\uDDE7</div>
                <div class="rp-card-info">
                    <div class="rp-card-amount">${msg.rpCurrency || '\u00A5'}${msg.rpAmount}</div>
                    <div class="rp-card-note">${Utils.escapeHtml(msg.rpNote || '\u606D\u559C\u53D1\u8D22')}</div>
                </div>
            </div>
            <div class="rp-card-bottom">
                <span class="rp-card-status">${statusIcon} ${statusText}</span>
                <span class="rp-card-arrow">\u203A</span>
            </div>
        `;

        if (msg.rpStatus === 'pending') {
            card.addEventListener('click', () => this._showRedPacketModal(msg));
        }

        wrap.appendChild(card);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'msg-delete-bubble';
        deleteBtn.innerHTML = '\u00D7';
        deleteBtn.title = '\u5220\u9664';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteMessage(msg.id);
        });
        card.appendChild(deleteBtn);
        card.addEventListener('click', (e) => {
            if (e.target === deleteBtn) return;
            if (msg.rpStatus === 'pending') return; // already opens modal
            const wasVisible = deleteBtn.classList.contains('visible');
            document.querySelectorAll('.msg-delete-bubble.visible').forEach(b => b.classList.remove('visible'));
            if (!wasVisible) deleteBtn.classList.add('visible');
        });

        return wrap;
    },

    _showRedPacketModal(msg) {
        const isMine = msg.side === 'me';
        const peer = Data.getPeer();
        const profile = Data.getProfile();
        const senderName = isMine ? (profile.nickname || 'sparkle') : (peer.nickname || 'shimmer');
        const receiverName = isMine ? (peer.nickname || 'shimmer') : (profile.nickname || 'sparkle');

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay rp-overlay';
        overlay.style.display = 'flex';
        overlay.style.zIndex = '400';

        const statusText = msg.rpStatus === 'accepted' ? '\u5DF2\u6536\u4E0B' : (msg.rpStatus === 'rejected' ? '\u5DF2\u62D2\u7EDD' : '\u5F85\u9886\u53D6');

        overlay.innerHTML = `
            <div class="rp-modal">
                <div class="rp-modal-header">
                    <div class="rp-modal-icon">\uD83E\uDDE7</div>
                </div>
                <div class="rp-modal-body">
                    <div class="rp-modal-sender">${Utils.escapeHtml(senderName)}\u7684\u7EA2\u5305</div>
                    <div class="rp-modal-amount">${msg.rpCurrency || '\u00A5'}<span class="rp-amount-num">${msg.rpAmount}</span></div>
                    <div class="rp-modal-note">${Utils.escapeHtml(msg.rpNote || '\u606D\u559C\u53D1\u8D22')}</div>
                    <div class="rp-modal-status">${statusText}</div>
                </div>
                <div class="rp-modal-actions">
                    ${msg.rpStatus === 'pending' && !isMine ? `
                        <button class="rp-btn rp-btn-reject" id="rpReject">\u62D2\u7EDD</button>
                        <button class="rp-btn rp-btn-accept" id="rpAccept">\u6536\u4E0B</button>
                    ` : `
                        <button class="rp-btn rp-btn-close" id="rpClose">\u5173\u95ED</button>
                    `}
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        const closeBtn = overlay.querySelector('#rpClose');
        if (closeBtn) closeBtn.addEventListener('click', close);

        const acceptBtn = overlay.querySelector('#rpAccept');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                msg.rpStatus = 'accepted';
                Data.save();
                this._updateRedPacketBubble(msg.id, 'accepted');
                close();
            });
        }

        const rejectBtn = overlay.querySelector('#rpReject');
        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => {
                msg.rpStatus = 'rejected';
                Data.save();
                this._updateRedPacketBubble(msg.id, 'rejected');
                close();
            });
        }
    },

    _updateRedPacketBubble(msgId, status) {
        const row = document.querySelector(`[data-msg-id="${msgId}"]`);
        if (!row) return;
        const card = row.querySelector('.rp-chat-card');
        if (!card) return;
        card.classList.remove('accepted', 'rejected');
        card.classList.add(status);
        const statusEl = card.querySelector('.rp-card-status');
        if (statusEl) {
            statusEl.textContent = (status === 'accepted' ? '\u2705 \u5DF2\u6536\u4E0B' : '\u274C \u5DF2\u62D2\u7EDD');
        }
    },

    // ===== Gift Bubble =====
    _createGiftBubble(msg) {
        const wrap = document.createElement('div');
        wrap.className = 'gift-bubble-wrap';
        wrap.id = `gift-${msg.id}`;

        const card = document.createElement('div');
        card.className = 'gift-chat-card';
        if (msg.giftStatus === 'accepted') card.classList.add('accepted');
        if (msg.giftStatus === 'rejected') card.classList.add('rejected');

        const senderName = msg.side === 'me' ? (Data.getProfile().nickname || 'sparkle') : (Data.getPeer().nickname || 'shimmer');
        const statusText = msg.giftStatus === 'accepted' ? '\u5DF2\u6536\u4E0B' : (msg.giftStatus === 'rejected' ? '\u5DF2\u62D2\u7EDD' : '\u5F85\u9886\u53D6');
        const statusIcon = msg.giftStatus === 'accepted' ? '\u2705' : (msg.giftStatus === 'rejected' ? '\u274C' : '');

        card.innerHTML = `
            <div class="gift-card-top">
                <div class="gift-card-emoji-lg">${Utils.escapeHtml(msg.giftEmoji)}</div>
                <div class="gift-card-info">
                    <div class="gift-card-title">${Utils.escapeHtml(senderName)} \u9001\u51FA\u4E00\u4E2A ${Utils.escapeHtml(msg.giftName)}</div>
                    <div class="gift-card-note-line">${msg.giftNote ? Utils.escapeHtml(msg.giftNote) : ''}</div>
                </div>
            </div>
            <div class="gift-card-bottom">
                <span class="gift-card-status">${statusIcon} ${statusText}</span>
                <span class="gift-card-arrow">\u203A</span>
            </div>
        `;

        if (msg.giftStatus === 'pending') {
            card.addEventListener('click', () => this._showGiftDetailModal(msg));
        }

        wrap.appendChild(card);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'msg-delete-bubble';
        deleteBtn.innerHTML = '\u00D7';
        deleteBtn.title = '\u5220\u9664';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteMessage(msg.id);
        });
        card.appendChild(deleteBtn);
        card.addEventListener('click', (e) => {
            if (e.target === deleteBtn) return;
            if (msg.giftStatus === 'pending') return;
            const wasVisible = deleteBtn.classList.contains('visible');
            document.querySelectorAll('.msg-delete-bubble.visible').forEach(b => b.classList.remove('visible'));
            if (!wasVisible) deleteBtn.classList.add('visible');
        });

        return wrap;
    },

    _showGiftDetailModal(msg) {
        const isMine = msg.side === 'me';
        const peer = Data.getPeer();
        const profile = Data.getProfile();
        const senderName = isMine ? (profile.nickname || 'sparkle') : (peer.nickname || 'shimmer');

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay gift-overlay';
        overlay.style.display = 'flex';
        overlay.style.zIndex = '400';

        const statusText = msg.giftStatus === 'accepted' ? '\u5DF2\u6536\u4E0B' : (msg.giftStatus === 'rejected' ? '\u5DF2\u62D2\u7EDD' : '\u5F85\u9886\u53D6');

        overlay.innerHTML = `
            <div class="gift-modal">
                <div class="gift-modal-header">
                    <div class="gift-modal-emoji">${Utils.escapeHtml(msg.giftEmoji)}</div>
                </div>
                <div class="gift-modal-body">
                    <div class="gift-modal-name">${Utils.escapeHtml(msg.giftName)}</div>
                    <div class="gift-modal-desc">${Utils.escapeHtml(msg.giftDesc || '')}</div>
                    ${msg.giftNote ? `<div class="gift-modal-note">\u201C${Utils.escapeHtml(msg.giftNote)}\u201D</div>` : ''}
                    <div class="gift-modal-sender">\u6765\u81EA ${Utils.escapeHtml(senderName)}</div>
                    <div class="gift-modal-status">${statusText}</div>
                </div>
                <div class="gift-modal-actions">
                    ${msg.giftStatus === 'pending' && !isMine ? `
                        <button class="gift-btn gift-btn-reject" id="giftReject">\u62D2\u7EDD</button>
                        <button class="gift-btn gift-btn-accept" id="giftAccept">\u6536\u4E0B</button>
                    ` : `
                        <button class="gift-btn gift-btn-close" id="giftClose">\u5173\u95ED</button>
                    `}
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        const closeBtn = overlay.querySelector('#giftClose');
        if (closeBtn) closeBtn.addEventListener('click', close);

        const acceptBtn = overlay.querySelector('#giftAccept');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                msg.giftStatus = 'accepted';
                Data.save();
                this._updateGiftBubble(msg.id, 'accepted');
                close();
            });
        }

        const rejectBtn = overlay.querySelector('#giftReject');
        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => {
                msg.giftStatus = 'rejected';
                Data.save();
                this._updateGiftBubble(msg.id, 'rejected');
                close();
            });
        }
    },

    _updateGiftBubble(msgId, status) {
        const row = document.querySelector(`[data-msg-id="${msgId}"]`);
        if (!row) return;
        const card = row.querySelector('.gift-chat-card');
        if (!card) return;
        card.classList.remove('accepted', 'rejected');
        card.classList.add(status);
        const statusEl = card.querySelector('.gift-card-status');
        if (statusEl) {
            statusEl.textContent = (status === 'accepted' ? '\u2705 \u5DF2\u6536\u4E0B' : '\u274C \u5DF2\u62D2\u7EDD');
        }
    },

    deleteMessage(msgId) {
        if (!confirm('\u786E\u5B9A\u5220\u9664\u8FD9\u6761\u6D88\u606F\u5417\uFF1F')) return;
        const messages = Data.getMessages();
        const idx = messages.findIndex(m => m.id === msgId);
        if (idx !== -1) {
            messages.splice(idx, 1);
            Data.save();
        }
        this.renderAllMessages();
        Utils.toast('\u6D88\u606F\u5DF2\u5220\u9664');
    },

    handlePat(side) {
        const profile = Data.getProfile();
        const peer = Data.getPeer();
        const settings = Data.getSettings();
        const patSettings = settings.patSettings || {};
        const myName = profile.nickname || 'sparkle';
        const peerName = peer.nickname || 'shimmer';

        let text;
        if (side === 'me') {
            // User pats peer: {myName}拍了拍{peerName}的...
            text = (patSettings.userPatPrefix || '\u4F60\u62CD\u4E86\u62CD\u5BF9\u65B9\u7684\uFF1A') + peerName;
        } else {
            // User pats self (double-click own avatar): {myName}拍了拍{myName}的...
            text = '\u4F60\u62CD\u4E86\u62CD\u81EA\u5DF1\u7684\uFF1A' + myName;
        }

        this.appendPatDivider(text, side);

        // Debounce
        const now = Date.now();
        const key = side;
        if (this._patDebounce[key] && now - this._patDebounce[key] < 2000) return;
        this._patDebounce[key] = now;
    },

    appendPatDivider(text, side) {
        const divider = document.createElement('div');
        divider.className = 'pat-divider';
        const span = document.createElement('span');
        span.textContent = text;
        divider.appendChild(span);
        this.messagesContainer.appendChild(divider);
        this.scrollToBottom();

        // Save to messages for persistence
        const msg = {
            id: 'pat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            isPatDivider: true,
            text: text,
            side: side || 'me',
            timestamp: Date.now()
        };
        Data.getMessages().push(msg);
        Data.save();
    },

    appendTimeDivider(ts) {
        const divider = document.createElement('div');
        divider.className = 'msg-time-divider';
        const span = document.createElement('span');
        span.textContent = Utils.formatDateTime(ts);
        divider.appendChild(span);
        this.messagesContainer.appendChild(divider);
    },

    updateReadStatus(msgId) {
        const el = document.getElementById(`read-${msgId}`);
        if (el) {
            el.className = 'msg-read-status read';
            el.textContent = '\u5DF2\u8BFB';
        }
    },

    renderAllMessages() {
        const hint = document.getElementById('chatEmptyHint');
        this.messagesContainer.innerHTML = '';
        this.messagesContainer.appendChild(hint);

        const messages = Data.getMessages();
        if (messages.length === 0) {
            hint.style.display = '';
            return;
        }

        hint.style.display = 'none';

        let prevMsg = null;
        messages.forEach(msg => {
            if (msg.isPatDivider) {
                const divider = document.createElement('div');
                divider.className = 'pat-divider';
                const span = document.createElement('span');
                span.textContent = msg.text || '';
                divider.appendChild(span);
                this.messagesContainer.appendChild(divider);
                return;
            }
            if (!prevMsg || Utils.shouldShowTimeDivider(prevMsg.timestamp, msg.timestamp)) {
                this.appendTimeDivider(msg.timestamp);
            }
            const row = this.createMessageElement(msg);
            this.messagesContainer.appendChild(row);
            prevMsg = msg;
        });
    },

    // ===== + Drawer =====
    bindDrawer() {
        const plusBtn = document.getElementById('chatPlusBtn');
        const drawer = document.getElementById('chatDrawer');
        const overlay = document.getElementById('chatDrawerOverlay');
        const closeBtn = document.getElementById('chatDrawerClose');

        plusBtn.addEventListener('click', () => {
            drawer.classList.add('open');
            overlay.style.display = 'block';
            this.scrollToBottom(true);
        });

        const closeDrawer = () => {
            drawer.classList.remove('open');
            overlay.style.display = 'none';
        };
        closeBtn.addEventListener('click', closeDrawer);
        overlay.addEventListener('click', closeDrawer);

        // Icon grid: each icon opens its own floating modal
        document.getElementById('drawerMultiMsgIcon').addEventListener('click', () => {
            closeDrawer();
            this.showMultiMsgModal();
        });

        document.getElementById('drawerCallIcon').addEventListener('click', () => {
            closeDrawer();
            this.showCallModal();
        });

        document.getElementById('drawerTransferIcon').addEventListener('click', () => {
            closeDrawer();
            this.showTransferModal();
        });

        document.getElementById('drawerGiftIcon').addEventListener('click', () => {
            closeDrawer();
            this.showGiftModal();
        });
    },

    // ===== Floating Modals =====
    showMultiMsgModal() {
        const modal = this._createModal('\u53D1\u9001\u591A\u6D88\u606F', `
            <textarea class="drawer-multi-msg" id="modalMultiMsg" placeholder="\u6BCF\u884C\u4E00\u6761\u6D88\u606F\uFF0C\u53EF\u4E00\u6B21\u53D1\u9001\u591A\u6761..." style="width:100%;min-height:100px;margin-bottom:12px"></textarea>
            <div class="modal-actions">
                <button class="btn-secondary" id="modalMultiCancel">\u53D6\u6D88</button>
                <button class="btn-primary" id="modalMultiSend">\u53D1\u9001</button>
            </div>
        `);
        modal.querySelector('#modalMultiCancel').addEventListener('click', () => modal.remove());
        modal.querySelector('#modalMultiSend').addEventListener('click', () => {
            const text = modal.querySelector('#modalMultiMsg').value.trim();
            if (!text) return;
            const lines = text.split('\n').filter(l => l.trim());
            lines.forEach(line => {
                this.sendMyMessage(line.trim());
            });
            modal.remove();
            Utils.toast(`\u5DF2\u53D1\u9001 ${lines.length} \u6761\u6D88\u606F`);
        });
    },

    showCallModal() {
        this.startOutgoingCall('call');
    },

    showTransferModal() {
        const modal = this._createModal('\u53D1\u9001\u7EA2\u5305', `
            <div class="redpacket-send-wrap">
                <div class="redpacket-send-header">
                    <div class="redpacket-send-icon">\uD83E\uDDE7</div>
                    <div class="redpacket-send-title">\u7EA2\u5305</div>
                </div>
                <div class="redpacket-send-amount-row">
                    <span class="redpacket-currency" id="rpCurrency">\u00A5</span>
                    <input type="number" id="modalTransferAmount" placeholder="0.00" style="flex:1;background:var(--bg-tertiary);border:none;border-radius:8px;padding:10px;color:var(--text-primary);outline:none;font-size:18px;text-align:center">
                </div>
                <input type="text" id="modalTransferNote" placeholder="\u795D\u798F\u8BED\uFF08\u53EF\u9009\uFF09" style="width:100%;background:var(--bg-tertiary);border:none;border-radius:8px;padding:10px;color:var(--text-primary);outline:none;font-size:14px;margin-top:8px">
                <select class="beautified-select" id="modalTransferCurrency" style="display:none">
                    <option value="\u00A5" selected>\u00A5 CNY</option>
                </select>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="modalTransferCancel">\u53D6\u6D88</button>
                <button class="btn-primary" id="modalTransferSend" style="background:#e54d42">\u53D1\u9001\u7EA2\u5305</button>
            </div>
        `);
        modal.querySelector('#modalTransferCancel').addEventListener('click', () => modal.remove());
        modal.querySelector('#modalTransferSend').addEventListener('click', () => {
            const amount = modal.querySelector('#modalTransferAmount').value.trim();
            if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
                Utils.toast('\u8BF7\u8F93\u5165\u6709\u6548\u91D1\u989D');
                return;
            }
            const currency = modal.querySelector('#modalTransferCurrency').value;
            const note = modal.querySelector('#modalTransferNote').value.trim() || '\u606D\u559C\u53D1\u8D22\uFF0C\u5927\u5409\u5927\u5229';
            const amountNum = parseFloat(amount).toFixed(2);

            // Send red packet as a special message
            const msg = {
                id: Utils.uid(),
                side: 'me',
                content: '',
                translation: '',
                timestamp: Date.now(),
                read: false,
                isRedPacket: true,
                rpAmount: amountNum,
                rpCurrency: currency,
                rpNote: note,
                rpStatus: 'pending'
            };
            Data.addMessage(msg);
            this.appendMessage(msg, true);
            this.scrollToBottom();
            Utils.playSound('send');
            modal.remove();

            // Peer may accept/reject (40%-60% reject)
            const rejectChance = Utils.randomFloat(0.40, 0.60);
            setTimeout(() => {
                // Mark as read first
                msg.read = true;
                Data.save();
                this.updateReadStatus(msg.id);

                if (Math.random() >= rejectChance) {
                    // Accepted
                    msg.rpStatus = 'accepted';
                    Data.save();
                    this._updateRedPacketBubble(msg.id, 'accepted');
                } else {
                    // Rejected
                    msg.rpStatus = 'rejected';
                    Data.save();
                    this._updateRedPacketBubble(msg.id, 'rejected');
                }
            }, Utils.randomInt(2000, 5000));
        });
    },

    showGiftModal() {
        const giftCards = Data.getActiveGiftCards();
        const modal = this._createModal('\u9001\u793C', `
            <div class="gift-send-wrap">
                <div class="gift-send-picker" id="giftPicker">
                    ${giftCards.map((g, i) => `
                        <div class="gift-pick-item ${i === 0 ? 'selected' : ''}" data-gift-id="${g.id}" data-source="preset">
                            <div class="gift-pick-emoji">${g.emoji}</div>
                            <div class="gift-pick-name">${Utils.escapeHtml(g.name)}</div>
                        </div>
                    `).join('')}
                    <div class="gift-pick-item gift-pick-custom ${giftCards.length === 0 ? 'selected' : ''}" data-gift-id="custom" data-source="custom">
                        <div class="gift-pick-emoji">+</div>
                        <div class="gift-pick-name">\u81EA\u5B9A\u4E49</div>
                    </div>
                </div>
                <div class="gift-custom-fields" id="giftCustomFields" style="${giftCards.length === 0 ? '' : 'display:none'}">
                    <div style="display:flex;gap:8px;margin-top:12px">
                        <input type="text" id="customGiftEmoji" placeholder="Emoji" maxlength="4" style="width:60px;text-align:center;background:var(--bg-tertiary);border:none;border-radius:8px;padding:10px;color:var(--text-primary);outline:none;font-size:18px">
                        <input type="text" id="customGiftName" placeholder="\u793C\u7269\u540D\u79F0" style="flex:1;background:var(--bg-tertiary);border:none;border-radius:8px;padding:10px;color:var(--text-primary);outline:none;font-size:14px">
                    </div>
                    <input type="text" id="customGiftDesc" placeholder="\u793C\u7269\u63CF\u8FF0\uFF08\u53EF\u7559\u7A7A\uFF09" style="width:100%;background:var(--bg-tertiary);border:none;border-radius:8px;padding:10px;color:var(--text-primary);outline:none;font-size:14px;margin-top:8px">
                </div>
                <input type="text" id="modalGiftNote" placeholder="\u5907\u6CE8\uFF08\u53EF\u7559\u7A7A\uFF09" style="width:100%;background:var(--bg-tertiary);border:none;border-radius:8px;padding:10px;color:var(--text-primary);outline:none;font-size:14px;margin-top:12px">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="modalGiftCancel">\u53D6\u6D88</button>
                <button class="btn-primary" id="modalGiftSend">\u9001\u51FA\u793C\u7269</button>
            </div>
        `);

        let selectedGiftId = giftCards.length > 0 ? giftCards[0].id : 'custom';

        modal.querySelector('#giftPicker').addEventListener('click', (e) => {
            const item = e.target.closest('.gift-pick-item');
            if (!item) return;
            modal.querySelectorAll('.gift-pick-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedGiftId = item.dataset.giftId;
            const customFields = modal.querySelector('#giftCustomFields');
            if (item.dataset.source === 'custom') {
                customFields.style.display = '';
            } else {
                customFields.style.display = 'none';
            }
        });

        modal.querySelector('#modalGiftCancel').addEventListener('click', () => modal.remove());
        modal.querySelector('#modalGiftSend').addEventListener('click', () => {
            let giftEmoji, giftName, giftDesc;

            if (selectedGiftId === 'custom') {
                giftEmoji = modal.querySelector('#customGiftEmoji').value.trim() || '\uD83C\uDF81';
                giftName = modal.querySelector('#customGiftName').value.trim();
                giftDesc = modal.querySelector('#customGiftDesc').value.trim();
                if (!giftName) {
                    Utils.toast('\u8BF7\u8F93\u5165\u793C\u7269\u540D\u79F0');
                    return;
                }
            } else {
                const gift = Data.getGiftCards().find(g => g.id === selectedGiftId);
                if (!gift) return;
                giftEmoji = gift.emoji;
                giftName = gift.name;
                giftDesc = gift.description || '';
            }

            const note = modal.querySelector('#modalGiftNote').value.trim();

            const msg = {
                id: Utils.uid(),
                side: 'me',
                content: '',
                translation: '',
                timestamp: Date.now(),
                read: false,
                isGift: true,
                giftEmoji: giftEmoji,
                giftName: giftName,
                giftDesc: giftDesc,
                giftNote: note,
                giftStatus: 'pending'
            };
            Data.addMessage(msg);
            this.appendMessage(msg, true);
            this.scrollToBottom();
            Utils.playSound('send');
            modal.remove();

            // Peer may accept/reject
            const drawerS = Data.getSettings().drawerSettings || {};
            const prob = drawerS.giftAcceptProbability || 0.7;
            setTimeout(() => {
                // Mark as read first
                msg.read = true;
                Data.save();
                this.updateReadStatus(msg.id);

                if (Math.random() < prob) {
                    msg.giftStatus = 'accepted';
                    Data.save();
                    this._updateGiftBubble(msg.id, 'accepted');
                } else {
                    msg.giftStatus = 'rejected';
                    Data.save();
                    this._updateGiftBubble(msg.id, 'rejected');
                }
            }, Utils.randomInt(2000, 5000));
        });
    },

    _createModal(title, bodyHTML) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';
        overlay.style.zIndex = '300';
        overlay.innerHTML = `
            <div class="modal" style="max-width:380px">
                <div class="modal-header">${title}</div>
                ${bodyHTML}
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
        return overlay;
    },

    _sendSystemReply(text) {
        const msg = {
            id: Utils.uid(),
            side: 'other',
            content: text,
            translation: '',
            timestamp: Date.now(),
            read: true,
            isSystem: true
        };
        Data.addMessage(msg);
        this.appendMessage(msg, true);
        this.scrollToBottom();
        Utils.playSound('receive');
    },

    _showRejectNotice(text) {
        const msg = {
            id: Utils.uid(),
            side: 'system',
            content: text,
            translation: '',
            timestamp: Date.now(),
            read: true,
            isRejectNotice: true
        };
        Data.addMessage(msg);
        this.appendMessage(msg, true);
        this.scrollToBottom();
    },

    // ===== Call System =====
    _resetCallState() {
        if (this._callResponseTimeout) {
            clearTimeout(this._callResponseTimeout);
            this._callResponseTimeout = null;
        }
        if (this._callTimer) {
            clearTimeout(this._callTimer);
            this._callTimer = null;
        }
        // Remove global drag listeners from float ball
        if (this._callDragCleanup) {
            this._callDragCleanup();
        }
        this._inCall = false;
        this._callStartTime = null;
        this._callStartMsg = null;
        this._callDirection = null;
        this._callType = null;
        this._callPeerName = null;
        this._micOn = false;
        this._cameraOn = false;
        document.getElementById('callFullscreen').style.display = 'none';
        document.getElementById('callFloat').style.display = 'none';
    },

    startOutgoingCall(type) {
        // Prevent starting a new call while one is in progress
        if (this._inCall || this._callResponseTimeout) {
            this._resetCallState();
        }

        const peer = Data.getPeer();
        const peerName = peer.nickname || 'shimmer';
        const typeName = '\u901A\u8BDD';
        const icon = '\uD83D\uDCDE';

        // Add call start message in user's bubble
        const startMsg = {
            id: Utils.uid(),
            side: 'me',
            content: '',
            translation: '',
            timestamp: Date.now(),
            read: false,
            isCallSummary: true,
            callType: type,
            callText: `${icon} \u53D1\u8D77${typeName}`
        };
        Data.addMessage(startMsg);
        this.appendMessage(startMsg, true);
        this.scrollToBottom();

        // Show call UI
        this._showCallScreen(type, peerName, 'outgoing');

        // After 2-4 seconds, check if accepted (30%-70% reject)
        this._callResponseTimeout = setTimeout(() => {
            this._callResponseTimeout = null;
            // Guard: if call was already ended, do nothing
            if (!this._callDirection) return;
            const rejectChance = Utils.randomFloat(0.30, 0.70);
            if (Math.random() >= rejectChance) {
                // Accepted
                this._onCallAccepted(type, peerName, startMsg);
            } else {
                // Rejected
                this._onCallRejected(type, peerName, startMsg);
            }
        }, Utils.randomInt(2000, 4000));
    },

    startIncomingCall(type) {
        // Prevent incoming call while one is in progress
        if (this._inCall || this._callResponseTimeout) {
            this._resetCallState();
        }

        const peer = Data.getPeer();
        const peerName = peer.nickname || 'shimmer';
        const typeName = '\u901A\u8BDD';
        const icon = '\uD83D\uDCDE';

        // Add call start message in peer's bubble
        const startMsg = {
            id: Utils.uid(),
            side: 'other',
            content: '',
            translation: '',
            timestamp: Date.now(),
            read: true,
            isCallSummary: true,
            callType: type,
            callText: `${icon} ${peerName}\u53D1\u8D77${typeName}`
        };
        Data.addMessage(startMsg);
        this.appendMessage(startMsg, true);
        this.scrollToBottom();
        Utils.playSound('receive');

        // Show incoming call UI
        this._showCallScreen(type, peerName, 'incoming');
    },

    _showCallScreen(type, peerName, direction) {
        const fs = document.getElementById('callFullscreen');
        fs.style.display = 'flex';
        document.getElementById('callFullPeer').textContent = peerName;

        const settings = Data.getSettings();
        const avatar = document.getElementById('callFullAvatar');
        if (settings.otherAvatar) {
            avatar.style.backgroundImage = `url(${settings.otherAvatar})`;
            avatar.textContent = '';
        } else {
            avatar.textContent = settings.otherAvatarEmoji || '\uD83D\uDE0A';
            avatar.style.backgroundImage = '';
        }

        // Set background
        const bg = document.getElementById('callFullBg');
        bg.style.background = `linear-gradient(135deg, ${this._getThemeColor1()}, ${this._getThemeColor2()})`;

        // Show ripples
        document.getElementById('callRipple').style.display = '';

        // Timer hidden initially
        document.getElementById('callFullTimer').style.display = 'none';

        const floatEl = document.getElementById('callFloat');
        floatEl.style.display = 'none';
        document.getElementById('callFloatIcon').textContent = '\uD83D\uDCDE';

        if (direction === 'outgoing') {
            document.getElementById('callFullType').textContent = '\u547C\u53EB\u4E2D...';
            document.getElementById('callActionsOutgoing').style.display = 'flex';
            document.getElementById('callActionsIncoming').style.display = 'none';
        } else {
            document.getElementById('callFullType').textContent = '\u6765\u7535\u4E2D...';
            document.getElementById('callActionsOutgoing').style.display = 'none';
            document.getElementById('callActionsIncoming').style.display = 'flex';
        }

        this._callDirection = direction;
        this._callType = type;
        this._callPeerName = peerName;
        this._callStartMsg = null;
        this._micOn = false;
        this._cameraOn = false;

        // Bind buttons (remove old listeners by cloning)
        this._bindCallButtons();
    },

    _bindCallButtons() {
        // Outgoing: end call
        const endBtn = document.getElementById('callEndBtn');
        const newEnd = endBtn.cloneNode(true);
        endBtn.parentNode.replaceChild(newEnd, endBtn);
        newEnd.addEventListener('click', () => this._endCall('cancelled'));

        // Mic button
        const micBtn = document.getElementById('callMicBtn');
        const newMic = micBtn.cloneNode(true);
        micBtn.parentNode.replaceChild(newMic, micBtn);
        newMic.addEventListener('click', () => {
            this._micOn = !this._micOn;
            newMic.classList.toggle('active', this._micOn);
        });

        // Camera button
        const camBtn = document.getElementById('callCameraBtn');
        const newCam = camBtn.cloneNode(true);
        camBtn.parentNode.replaceChild(newCam, camBtn);
        newCam.addEventListener('click', () => {
            this._cameraOn = !this._cameraOn;
            newCam.classList.toggle('active', this._cameraOn);
        });

        // Minimize
        const minBtn = document.getElementById('callMinimizeBtn');
        const newMin = minBtn.cloneNode(true);
        minBtn.parentNode.replaceChild(newMin, minBtn);
        newMin.addEventListener('click', () => this._minimizeCall());

        // Incoming: accept
        const acceptBtn = document.getElementById('callAcceptBtn');
        const newAccept = acceptBtn.cloneNode(true);
        acceptBtn.parentNode.replaceChild(newAccept, acceptBtn);
        newAccept.addEventListener('click', () => this._acceptIncomingCall());

        // Incoming: reject
        const rejectBtn = document.getElementById('callRejectBtn');
        const newReject = rejectBtn.cloneNode(true);
        rejectBtn.parentNode.replaceChild(newReject, rejectBtn);
        newReject.addEventListener('click', () => this._rejectIncomingCall());

        // Float ball click to expand
        const floatBall = document.getElementById('callFloatBall');
        const newFloat = floatBall.cloneNode(true);
        floatBall.parentNode.replaceChild(newFloat, floatBall);
        newFloat.addEventListener('click', () => this._expandCall());
        this._makeFloatDraggable(newFloat);
    },

    _onCallAccepted(type, peerName, startMsg) {
        this._callStartTime = Date.now();
        this._inCall = true;
        this._callStartMsg = startMsg;

        document.getElementById('callFullType').textContent = '\u901A\u8BDD\u4E2D...';
        document.getElementById('callRipple').style.display = 'none';
        document.getElementById('callFullTimer').style.display = '';
        document.getElementById('callFullTimer').textContent = '00:00';

        // Update the call message
        startMsg.callText += ' \u2705 \u5DF2\u63A5\u901A';
        Data.save();
        this._updateCallSummary(startMsg.id, startMsg.callText);

        // Start timer
        const updateTimer = () => {
            if (!this._inCall) return;
            const elapsed = Math.floor((Date.now() - this._callStartTime) / 1000);
            const mins = Math.floor(elapsed / 60);
            const secs = elapsed % 60;
            const timeStr = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
            const tEl = document.getElementById('callFullTimer');
            const fEl = document.getElementById('callFloatTimer');
            if (tEl) tEl.textContent = timeStr;
            if (fEl) fEl.textContent = timeStr;
            this._callTimer = setTimeout(updateTimer, 1000);
        };
        updateTimer();
    },

    _onCallRejected(type, peerName, startMsg) {
        const typeName = '\u901A\u8BDD';
        startMsg.callText += ` \u274C \u5DF2\u62D2\u7EDD`;
        Data.save();
        this._updateCallSummary(startMsg.id, startMsg.callText);
        this._showRejectNotice(`\u274C \u5BF9\u65B9\u62D2\u7EDD\u4E86\u901A\u8BDD`);

        this._resetCallState();
    },

    _acceptIncomingCall() {
        this._callStartTime = Date.now();
        this._inCall = true;

        // Update the peer's call message
        const messages = Data.getMessages();
        const lastCallMsg = [...messages].reverse().find(m => m.isCallSummary);
        if (lastCallMsg) {
            lastCallMsg.callText += ' \u2705 \u5DF2\u63A5\u901A';
            this._callStartMsg = lastCallMsg;
            Data.save();
            this._updateCallSummary(lastCallMsg.id, lastCallMsg.callText);
        }

        document.getElementById('callFullType').textContent = '\u901A\u8BDD\u4E2D...';
        document.getElementById('callRipple').style.display = 'none';
        document.getElementById('callFullTimer').style.display = '';
        document.getElementById('callFullTimer').textContent = '00:00';
        document.getElementById('callActionsIncoming').style.display = 'none';
        document.getElementById('callActionsOutgoing').style.display = 'flex';

        const updateTimer = () => {
            if (!this._inCall) return;
            const elapsed = Math.floor((Date.now() - this._callStartTime) / 1000);
            const mins = Math.floor(elapsed / 60);
            const secs = elapsed % 60;
            const timeStr = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
            const tEl = document.getElementById('callFullTimer');
            const fEl = document.getElementById('callFloatTimer');
            if (tEl) tEl.textContent = timeStr;
            if (fEl) fEl.textContent = timeStr;
            this._callTimer = setTimeout(updateTimer, 1000);
        };
        updateTimer();
    },

    _rejectIncomingCall() {
        const messages = Data.getMessages();
        const lastCallMsg = [...messages].reverse().find(m => m.isCallSummary);
        if (lastCallMsg) {
            lastCallMsg.callText += ' \u274C \u5DF2\u62D2\u7EDD';
            Data.save();
            this._updateCallSummary(lastCallMsg.id, lastCallMsg.callText);
        }
        this._showRejectNotice(`\u274C \u5DF2\u62D2\u7EDD\u901A\u8BDD`);

        this._resetCallState();
    },

    _endCall(reason) {
        if (!this._inCall && !this._callStartTime) {
            // Call was never connected (user cancelled before answer)
            const messages = Data.getMessages();
            const lastCallMsg = [...messages].reverse().find(m => m.isCallSummary);
            if (lastCallMsg && !lastCallMsg.callText.includes('\u2705') && !lastCallMsg.callText.includes('\u274C')) {
                lastCallMsg.callText += ' \u274C \u5DF2\u53D6\u6D88';
                Data.save();
                this._updateCallSummary(lastCallMsg.id, lastCallMsg.callText);
            }
            this._resetCallState();
            return;
        }

        const elapsed = Math.floor((Date.now() - this._callStartTime) / 1000);

        const type = this._callType || 'call';
        const typeName = '\u901A\u8BDD';
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const durStr = mins > 0 ? `${mins}\u5206${secs}\u79D2` : `${secs}\u79D2`;

        // Update the call summary message (in caller's bubble)
        if (this._callStartMsg) {
            this._callStartMsg.callText += ` \u2502 ${typeName}\u5DF2\u7ED3\u675F \u901A\u8BDD\u65F6\u957F ${durStr}`;
            Data.save();
            this._updateCallSummary(this._callStartMsg.id, this._callStartMsg.callText);
        }

        this._resetCallState();
    },

    _minimizeCall() {
        document.getElementById('callFullscreen').style.display = 'none';
        document.getElementById('callFloat').style.display = 'flex';
    },

    _expandCall() {
        document.getElementById('callFloat').style.display = 'none';
        document.getElementById('callFullscreen').style.display = 'flex';
    },

    _makeFloatDraggable(el) {
        let isDragging = false;
        let startX, startY, initLeft, initTop;
        let hasMoved = false;
        const floatContainer = document.getElementById('callFloat');

        const onStart = (e) => {
            isDragging = true;
            hasMoved = false;
            const touch = e.touches ? e.touches[0] : e;
            startX = touch.clientX;
            startY = touch.clientY;
            const rect = floatContainer.getBoundingClientRect();
            initLeft = rect.left;
            initTop = rect.top;
            floatContainer.style.right = 'auto';
            floatContainer.style.bottom = 'auto';
            floatContainer.style.left = initLeft + 'px';
            floatContainer.style.top = initTop + 'px';
            e.preventDefault();
        };

        const onMove = (e) => {
            if (!isDragging) return;
            const touch = e.touches ? e.touches[0] : e;
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;
            let newLeft = initLeft + dx;
            let newTop = initTop + dy;
            const maxX = window.innerWidth - floatContainer.offsetWidth;
            const maxY = window.innerHeight - floatContainer.offsetHeight;
            newLeft = Math.max(0, Math.min(maxX, newLeft));
            newTop = Math.max(0, Math.min(maxY, newTop));
            floatContainer.style.left = newLeft + 'px';
            floatContainer.style.top = newTop + 'px';
        };

        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            if (!hasMoved) {
                this._expandCall();
            }
        };

        el.addEventListener('mousedown', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        el.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);

        // Return cleanup function to remove global listeners
        this._callDragCleanup = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
            el.removeEventListener('mousedown', onStart);
            el.removeEventListener('touchstart', onStart);
            this._callDragCleanup = null;
        };
    },

    _updateCallSummary(msgId, text) {
        const row = document.querySelector(`[data-msg-id="${msgId}"]`);
        if (!row) return;
        const bubble = row.querySelector('.call-summary-bubble');
        if (bubble) bubble.innerHTML = text;
    },

    _getThemeColor1() {
        const themes = {
            dark: '#36393f', light: '#2f3136', ocean: '#1a2332',
            sunset: '#2d1b2e', forest: '#1e2a1e', rust: '#1a1214',
            monochrome: '#2f3136', morandi: '#e8e0d8', matcha: '#f4f7f0', sakura: '#fdf5f6'
        };
        const theme = Data.getSettings().theme || 'dark';
        return themes[theme] || '#36393f';
    },

    _getThemeColor2() {
        const themes = {
            dark: '#2f3136', light: '#36393f', ocean: '#1e2d3f',
            sunset: '#3a2540', forest: '#283828', rust: '#24181a',
            monochrome: '#36393f', morandi: '#dfd6ce', matcha: '#edf2e8', sakura: '#fbeff1'
        };
        const theme = Data.getSettings().theme || 'dark';
        return themes[theme] || '#2f3136';
    },

    // Proactive messaging
    startProactiveCheck() {
        if (this.proactiveTimer) clearInterval(this.proactiveTimer);
        this.proactiveTimer = setInterval(() => {
            const peer = Data.getPeer();
            if (!peer.proactiveMessage) return;
            if (this.isReplying) return;
            if (App.currentPage !== 'chat') return;

            const elapsed = (Date.now() - this.lastSentTimestamp) / 1000;
            const threshold = Utils.randomInt(peer.proactiveMinInterval, peer.proactiveMaxInterval) * 60;

            if (elapsed >= threshold) {
                // Check for proactive events (call, transfer, gift) with fixed probabilities
                const drawerS = Data.getSettings().drawerSettings || {};
                const rand = Math.random();

                // Call: fixed 1%-4%
                if (drawerS.peerCallEnabled !== false && rand < Utils.randomFloat(0.01, 0.04)) {
                    const type = 'call';
                    this.startIncomingCall(type);
                    this.lastSentTimestamp = Date.now();
                }
                // Transfer (red packet): fixed 0.3%-1%
                else if (drawerS.peerTransferEnabled !== false && rand < Utils.randomFloat(0.003, 0.01)) {
                    const amount = Utils.randomInt(10, 200);
                    const amountStr = parseFloat(amount).toFixed(2);
                    const notes = ['\u606D\u559C\u53D1\u8D22\uFF0C\u5927\u5409\u5927\u5229', '\u4E00\u70B9\u5FC3\u610F', '\u8BF7\u559D\u5976\u8336', '\u751F\u65E5\u5FEB\u4E50', '\u8C8C\u7F8E\u5982\u4F60'];
                    const note = notes[Math.floor(Math.random() * notes.length)];
                    const msg = {
                        id: Utils.uid(),
                        side: 'other',
                        content: '',
                        translation: '',
                        timestamp: Date.now(),
                        read: true,
                        isRedPacket: true,
                        rpAmount: amountStr,
                        rpCurrency: '\u00A5',
                        rpNote: note,
                        rpStatus: 'pending'
                    };
                    Data.addMessage(msg);
                    this.appendMessage(msg, true);
                    this.scrollToBottom();
                    Utils.playSound('receive');
                    this.lastSentTimestamp = Date.now();
                }
                // Gift: fixed 0.4%-2%
                else if (drawerS.peerGiftEnabled !== false && rand < Utils.randomFloat(0.004, 0.02)) {
                    const gift = Data.pickRandomGift();
                    if (gift) {
                        const statusNote = Data.pickRandomStatus();
                        const msg = {
                            id: Utils.uid(),
                            side: 'other',
                            content: '',
                            translation: '',
                            timestamp: Date.now(),
                            read: true,
                            isGift: true,
                            giftEmoji: gift.emoji,
                            giftName: gift.name,
                            giftDesc: gift.description,
                            giftNote: statusNote || '',
                            giftStatus: 'pending'
                        };
                        Data.addMessage(msg);
                        this.appendMessage(msg, true);
                        this.scrollToBottom();
                        Utils.playSound('receive');
                    } else {
                        this.triggerPeerReply();
                    }
                    this.lastSentTimestamp = Date.now();
                } else {
                    this.triggerPeerReply();
                }
            }
        }, 10000);
    },

    scrollToBottom(instant = false) {
        if (!this.autoScroll && !instant) return;
        requestAnimationFrame(() => {
            if (instant) {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            } else {
                this.messagesContainer.scrollTo({
                    top: this.messagesContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }
        });
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

/* ===== Chat Settings Page ===== */
const ChatSettings = {
    onShow() {
        this.render();
    },

    render() {
        const container = document.getElementById('chatSettingsContainer');
        const peer = Data.getPeer();
        const s = Data.getSettings();
        const ps = s.patSettings || {};
        const ds = s.drawerSettings || {};

        container.innerHTML = `
            <div class="setting-group">
                <div class="setting-group-title">\u5BF9\u65B9\u8BBE\u7F6E</div>
                <div class="setting-item">
                    <div><div class="setting-label">\u6635\u79F0</div></div>
                    <input type="text" id="peerNameInput" value="${Utils.escapeAttr(peer.nickname)}" style="background:var(--bg-tertiary);border:none;border-radius:8px;padding:8px 12px;color:var(--text-primary);outline:none;font-size:14px;text-align:right;width:150px">
                </div>
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u56DE\u590D\u8BBE\u7F6E</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u81EA\u52A8\u56DE\u590D</div>
                        <div class="setting-desc">\u53D1\u9001\u6D88\u606F\u540E\u5BF9\u65B9\u81EA\u52A8\u56DE\u590D</div>
                    </div>
                    <div class="toggle ${peer.autoReply ? 'on' : ''}" id="autoReplyToggle"></div>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u56DE\u590D\u5EF6\u8FDF\u8303\u56F4</div>
                        <div class="setting-desc">\u5BF9\u65B9\u8F93\u5165\u52A8\u753B\u7684\u65F6\u957F\uFF08\u79D2\uFF09</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px">
                        <input type="number" id="minDelayInput" value="${peer.minDelay}" min="1" style="width:50px;background:var(--bg-tertiary);border:none;border-radius:8px;padding:6px;color:var(--text-primary);outline:none;text-align:center">
                        <span style="color:var(--text-muted)">~</span>
                        <input type="number" id="maxDelayInput" value="${peer.maxDelay}" min="1" style="width:50px;background:var(--bg-tertiary);border:none;border-radius:8px;padding:6px;color:var(--text-primary);outline:none;text-align:center">
                        <span style="color:var(--text-muted)">\u79D2</span>
                    </div>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u5DF2\u8BFB\u5EF6\u8FDF\u8303\u56F4</div>
                        <div class="setting-desc">\u672A\u8BFB\u53D8\u4E3A\u5DF2\u8BFB\u7684\u95F4\u9694\u65F6\u95F4\uFF08\u79D2\uFF09</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px">
                        <input type="number" id="readDelayMinInput" value="${peer.readDelayMin}" min="0.1" step="0.1" style="width:55px;background:var(--bg-tertiary);border:none;border-radius:8px;padding:6px;color:var(--text-primary);outline:none;text-align:center">
                        <span style="color:var(--text-muted)">~</span>
                        <input type="number" id="readDelayMaxInput" value="${peer.readDelayMax}" min="0.1" step="0.1" style="width:55px;background:var(--bg-tertiary);border:none;border-radius:8px;padding:6px;color:var(--text-primary);outline:none;text-align:center">
                        <span style="color:var(--text-muted)">\u79D2</span>
                    </div>
                </div>
                <div class="setting-item" id="proactiveMsgItem">
                    <div>
                        <div class="setting-label">\u4E3B\u52A8\u53D1\u9001\u6D88\u606F</div>
                        <div class="setting-desc">\u5BF9\u65B9\u4F1A\u5728\u6211\u65B9\u4E0D\u53D1\u8A00\u65F6\u4E3B\u52A8\u53D1\u6D88\u606F</div>
                    </div>
                    <div class="chat-checkbox ${peer.proactiveMessage ? 'checked' : ''}" id="proactiveMsgCheck">
                        <div class="chat-checkbox-box"></div>
                    </div>
                </div>
                <div class="setting-item" id="proactiveIntervalRow" style="${peer.proactiveMessage ? '' : 'display:none'}">
                    <div>
                        <div class="setting-label">\u4E3B\u52A8\u6D88\u606F\u95F4\u9694</div>
                        <div class="setting-desc">\u5BF9\u65B9\u4E3B\u52A8\u53D1\u6D88\u606F\u7684\u65F6\u95F4\u8303\u56F4\uFF08\u5206\u949F\uFF09</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px">
                        <input type="number" id="proactiveMinInput" value="${peer.proactiveMinInterval}" min="1" style="width:55px;background:var(--bg-tertiary);border:none;border-radius:8px;padding:6px;color:var(--text-primary);outline:none;text-align:center">
                        <span style="color:var(--text-muted)">~</span>
                        <input type="number" id="proactiveMaxInput" value="${peer.proactiveMaxInterval}" min="1" style="width:55px;background:var(--bg-tertiary);border:none;border-radius:8px;padding:6px;color:var(--text-primary);outline:none;text-align:center">
                        <span style="color:var(--text-muted)">\u5206\u949F</span>
                    </div>
                </div>
            </div>

            <div class="setting-group">
                <div class="setting-group-title">Emoji \u6DF7\u7528</div>
                <div class="setting-item" id="emojiMixItem">
                    <div>
                        <div class="setting-label">\u542F\u7528 Emoji \u6DF7\u7528</div>
                        <div class="setting-desc">\u5BF9\u65B9\u56DE\u590D\u65F6\u4F1A\u6DF7\u5165 Emoji \u8868\u60C5</div>
                    </div>
                    <div class="chat-checkbox ${s.emojiMixEnabled ? 'checked' : ''}" id="emojiMixCheck">
                        <div class="chat-checkbox-box"></div>
                    </div>
                </div>
                <div class="setting-item" id="emojiProbRow" style="${s.emojiMixEnabled ? '' : 'display:none'}">
                    <div>
                        <div class="setting-label">Emoji \u6DF7\u7528\u6982\u7387</div>
                        <div class="setting-desc">\u5BF9\u65B9\u56DE\u590D\u4E2D\u6DF7\u5165 Emoji \u7684\u6982\u7387</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px">
                        <input type="number" id="emojiProbInput" value="${Math.round(s.emojiMixProbability * 100)}" min="5" max="80" step="5" style="width:55px;background:var(--bg-tertiary);border:none;border-radius:8px;padding:6px;color:var(--text-primary);outline:none;text-align:center" ${s.emojiMixEnabled ? '' : 'disabled'}>
                        <span style="color:var(--text-muted)">%</span>
                    </div>
                </div>
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u62CD\u4E00\u62CD</div>
                <div class="setting-item" id="patEnabledItem">
                    <div>
                        <div class="setting-label">\u542F\u7528\u62CD\u4E00\u62CD</div>
                        <div class="setting-desc">\u53CC\u51FB\u5934\u50CF\u89E6\u53D1\u62CD\u4E00\u62CD\u6D88\u606F</div>
                    </div>
                    <div class="chat-checkbox ${ps.enabled !== false ? 'checked' : ''}" id="patEnabledCheck">
                        <div class="chat-checkbox-box"></div>
                    </div>
                </div>
                <div class="setting-item" id="patTriggerRow" style="${ps.enabled !== false ? '' : 'display:none'}">
                    <div>
                        <div class="setting-label">\u62CD\u4E00\u62CD\u89E6\u53D1\u6982\u7387</div>
                        <div class="setting-desc">\u5BF9\u65B9\u56DE\u590D\u65F6\u89E6\u53D1\u62CD\u4E00\u62CD\u7684\u6982\u7387\uFF08\u89E6\u53D1\u540E\u66FF\u4EE3\u5B57\u5361\u56DE\u590D\uFF09</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px">
                        <input type="number" id="patTriggerInput" value="${Math.round((ps.patTriggerProbability || 0.05) * 100)}" min="0" max="100" step="5" style="width:55px;background:var(--bg-tertiary);border:none;border-radius:8px;padding:6px;color:var(--text-primary);outline:none;text-align:center" ${ps.enabled !== false ? '' : 'disabled'}>
                        <span style="color:var(--text-muted)">%</span>
                    </div>
                </div>
                <div class="setting-item" id="patUserTextRow" style="${ps.enabled !== false ? '' : 'display:none'}">
                    <div>
                        <div class="setting-label">\u81EA\u5DF1\u62CD\u62CD\u6587\u6848</div>
                        <div class="setting-desc">\u4F60\u53CC\u51FB\u5BF9\u65B9\u5934\u50CF\u65F6\u663E\u793A\u7684\u524D\u7F00\u6587\u6848</div>
                    </div>
                    <input type="text" id="patUserPrefixInput" value="${Utils.escapeAttr(ps.userPatPrefix || '\u4F60\u62CD\u4E86\u62CD\u5BF9\u65B9\u7684\uFF1A')}" placeholder="\u4F60\u62CD\u4E86\u62CD\u5BF9\u65B9\u7684\uFF1A" style="background:var(--bg-tertiary);border:none;border-radius:8px;padding:8px 12px;color:var(--text-primary);outline:none;font-size:14px;text-align:right;width:180px" ${ps.enabled !== false ? '' : 'disabled'}>
                </div>
                <div class="setting-item" id="patPeerPrefixRow" style="${ps.enabled !== false ? '' : 'display:none'}">
                    <div>
                        <div class="setting-label">\u5BF9\u65B9\u62CD\u62CD\u6587\u6848</div>
                        <div class="setting-desc">\u5BF9\u65B9\u62CD\u4F60\u65F6\u663E\u793A\u7684\u524D\u7F00\u6587\u6848</div>
                    </div>
                    <input type="text" id="patPeerPrefixInput" value="${Utils.escapeAttr(ps.peerPatPrefix || '\u5BF9\u65B9\u62CD\u4E86\u62CD\u4F60\u7684\uFF1A')}" placeholder="\u5BF9\u65B9\u62CD\u4E86\u62CD\u4F60\u7684\uFF1A" style="background:var(--bg-tertiary);border:none;border-radius:8px;padding:8px 12px;color:var(--text-primary);outline:none;font-size:14px;text-align:right;width:180px" ${ps.enabled !== false ? '' : 'disabled'}>
                </div>
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u804A\u5929\u5916\u89C2</div>
                <div class="setting-group-title" style="padding-bottom:0">\u6C14\u6CE1\u6837\u5F0F</div>
                <div class="bubble-style-picker" id="bubbleStylePicker">
                    <div class="bubble-style-option ${s.chatBubbleStyle === 'default' ? 'active' : ''}" data-style="default">\u9ED8\u8BA4</div>
                    <div class="bubble-style-option ${s.chatBubbleStyle === 'pill' ? 'active' : ''}" data-style="pill">\u4E38\u5F62</div>
                    <div class="bubble-style-option ${s.chatBubbleStyle === 'square' ? 'active' : ''}" data-style="square">\u65B9\u5F62</div>
                    <div class="bubble-style-option ${s.chatBubbleStyle === 'minimal' ? 'active' : ''}" data-style="minimal">\u6781\u7B80</div>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u804A\u5929\u80CC\u666F</div>
                        <div class="setting-desc">${s.chatBackground ? '\u5DF2\u81EA\u5B9A\u4E49' : '\u65E0\u80CC\u666F'}</div>
                    </div>
                    <label class="file-btn">\u9009\u62E9\u56FE\u7247
                        <input type="file" accept="image/*" id="chatBgFile" style="display:none">
                    </label>
                </div>
                ${s.chatBackground ? `
                <div style="padding:0 16px 8px">
                    <div class="chat-bg-live-preview" id="chatBgLivePreview">
                        <div class="chat-bg-preview-bg" style="background-image:url(${s.chatBackground})"></div>
                        <div class="chat-bg-preview-content">
                            <div class="chat-bg-preview-bubble other">\u4F60\u597D\u5440</div>
                            <div class="chat-bg-preview-bubble me">\u4ECA\u5929\u600E\u4E48\u6837</div>
                        </div>
                    </div>
                </div>` : ''}
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u80CC\u666F\u6E05\u6670\u5EA6</div>
                        <div class="setting-desc">\u8C03\u6574\u804A\u5929\u80CC\u666F\u56FE\u7684\u900F\u660E\u5EA6</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px">
                        <input type="range" class="chat-opacity-slider" id="chatBgOpacitySlider" min="5" max="80" value="${Math.round((s.chatBackgroundOpacity || 0.15) * 100)}" style="width:100px">
                        <span style="font-size:13px;color:var(--text-secondary);min-width:35px" id="chatBgOpacityValue">${Math.round((s.chatBackgroundOpacity || 0.15) * 100)}%</span>
                    </div>
                </div>
                ${s.chatBackground ? `
                <div class="setting-item">
                    <div class="setting-label">\u5F53\u524D\u80CC\u666F</div>
                    <button class="btn-secondary btn-sm" id="resetChatBg">\u6E05\u9664\u80CC\u666F</button>
                </div>` : ''}
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u804A\u5929\u4E8B\u4EF6\u6982\u7387</div>
                <div class="setting-item" id="peerCallEnabledItem">
                    <div>
                        <div class="setting-label">\u5BF9\u65B9\u53EF\u53D1\u8D77\u901A\u8BDD</div>
                        <div class="setting-desc">\u5BF9\u65B9\u4E3B\u52A8\u53D1\u8D77\u8BED\u97F3/\u89C6\u9891\u901A\u8BDD</div>
                    </div>
                    <div class="chat-checkbox ${ds.peerCallEnabled !== false ? 'checked' : ''}" id="peerCallEnabledCheck">
                        <div class="chat-checkbox-box"></div>
                    </div>
                </div>
                <div class="setting-item" id="peerTransferEnabledItem">
                    <div>
                        <div class="setting-label">\u5BF9\u65B9\u53EF\u53D1\u7EA2\u5305</div>
                        <div class="setting-desc">\u5BF9\u65B9\u4E3B\u52A8\u53D1\u9001\u7EA2\u5305</div>
                    </div>
                    <div class="chat-checkbox ${ds.peerTransferEnabled !== false ? 'checked' : ''}" id="peerTransferEnabledCheck">
                        <div class="chat-checkbox-box"></div>
                    </div>
                </div>
                <div class="setting-item" id="peerGiftEnabledItem">
                    <div>
                        <div class="setting-label">\u5BF9\u65B9\u53EF\u53D1\u8D77\u9001\u793C</div>
                        <div class="setting-desc">\u5BF9\u65B9\u4E3B\u52A8\u53D1\u8D77\u9001\u793C</div>
                    </div>
                    <div class="chat-checkbox ${ds.peerGiftEnabled !== false ? 'checked' : ''}" id="peerGiftEnabledCheck">
                        <div class="chat-checkbox-box"></div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    },

    bindEvents() {
        // Nickname
        document.getElementById('peerNameInput').addEventListener('change', (e) => {
            Data.updatePeer({ nickname: e.target.value });
            document.getElementById('chatPeerName').textContent = e.target.value;
            const otherName = document.getElementById('otherStatusName');
            if (otherName) otherName.textContent = e.target.value;
        });

        // Auto reply toggle
        document.getElementById('autoReplyToggle').addEventListener('click', (e) => {
            const on = !e.target.classList.contains('on');
            e.target.classList.toggle('on', on);
            Data.updatePeer({ autoReply: on });
        });

        // Min/Max delay
        document.getElementById('minDelayInput').addEventListener('change', (e) => {
            let val = parseFloat(e.target.value) || 2;
            val = Math.max(1, Math.min(30, val));
            e.target.value = val;
            const maxVal = parseFloat(document.getElementById('maxDelayInput').value);
            if (val > maxVal) {
                document.getElementById('maxDelayInput').value = val;
                Data.updatePeer({ minDelay: val, maxDelay: val });
            } else {
                Data.updatePeer({ minDelay: val });
            }
        });

        document.getElementById('maxDelayInput').addEventListener('change', (e) => {
            let val = parseFloat(e.target.value) || 6;
            val = Math.max(1, Math.min(30, val));
            e.target.value = val;
            const minVal = parseFloat(document.getElementById('minDelayInput').value);
            if (val < minVal) {
                document.getElementById('minDelayInput').value = val;
                Data.updatePeer({ minDelay: val, maxDelay: val });
            } else {
                Data.updatePeer({ maxDelay: val });
            }
        });

        // Read delay range
        document.getElementById('readDelayMinInput').addEventListener('change', (e) => {
            let val = parseFloat(e.target.value) || 0.3;
            val = Math.max(0.1, Math.min(10, val));
            e.target.value = val;
            const maxVal = parseFloat(document.getElementById('readDelayMaxInput').value);
            if (val > maxVal) {
                document.getElementById('readDelayMaxInput').value = val;
                Data.updatePeer({ readDelayMin: val, readDelayMax: val });
            } else {
                Data.updatePeer({ readDelayMin: val });
            }
        });

        document.getElementById('readDelayMaxInput').addEventListener('change', (e) => {
            let val = parseFloat(e.target.value) || 2;
            val = Math.max(0.1, Math.min(10, val));
            e.target.value = val;
            const minVal = parseFloat(document.getElementById('readDelayMinInput').value);
            if (val < minVal) {
                document.getElementById('readDelayMinInput').value = val;
                Data.updatePeer({ readDelayMin: val, readDelayMax: val });
            } else {
                Data.updatePeer({ readDelayMax: val });
            }
        });

        // Proactive message checkbox
        document.getElementById('proactiveMsgItem').addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT') return;
            const cb = document.getElementById('proactiveMsgCheck');
            const on = !cb.classList.contains('checked');
            cb.classList.toggle('checked', on);
            Data.updatePeer({ proactiveMessage: on });
            const row = document.getElementById('proactiveIntervalRow');
            if (row) row.style.display = on ? '' : 'none';
        });

        // Proactive interval (minutes)
        document.getElementById('proactiveMinInput').addEventListener('change', (e) => {
            let val = parseInt(e.target.value) || 1;
            val = Math.max(1, Math.min(60, val));
            e.target.value = val;
            const maxVal = parseInt(document.getElementById('proactiveMaxInput').value);
            if (val > maxVal) {
                document.getElementById('proactiveMaxInput').value = val;
                Data.updatePeer({ proactiveMinInterval: val, proactiveMaxInterval: val });
            } else {
                Data.updatePeer({ proactiveMinInterval: val });
            }
        });

        document.getElementById('proactiveMaxInput').addEventListener('change', (e) => {
            let val = parseInt(e.target.value) || 5;
            val = Math.max(1, Math.min(60, val));
            e.target.value = val;
            const minVal = parseInt(document.getElementById('proactiveMinInput').value);
            if (val < minVal) {
                document.getElementById('proactiveMinInput').value = val;
                Data.updatePeer({ proactiveMinInterval: val, proactiveMaxInterval: val });
            } else {
                Data.updatePeer({ proactiveMaxInterval: val });
            }
        });

        // Emoji mix checkbox
        document.getElementById('emojiMixItem').addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT') return;
            const cb = document.getElementById('emojiMixCheck');
            const on = !cb.classList.contains('checked');
            cb.classList.toggle('checked', on);
            Data.updateSettings({ emojiMixEnabled: on });
            const row = document.getElementById('emojiProbRow');
            if (row) row.style.display = on ? '' : 'none';
            const inp = document.getElementById('emojiProbInput');
            if (inp) inp.disabled = !on;
        });

        // Emoji probability
        document.getElementById('emojiProbInput').addEventListener('change', (e) => {
            let val = parseInt(e.target.value) || 15;
            val = Math.max(5, Math.min(80, val));
            e.target.value = val;
            Data.updateSettings({ emojiMixProbability: val / 100 });
        });

        // Pat settings
        document.getElementById('patEnabledItem').addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT') return;
            const cb = document.getElementById('patEnabledCheck');
            const on = !cb.classList.contains('checked');
            cb.classList.toggle('checked', on);
            const s = Data.getSettings();
            if (!s.patSettings) s.patSettings = {};
            s.patSettings.enabled = on;
            Data.updateSettings({ patSettings: s.patSettings });
            // Hide/show related rows and disable inputs
            ['patTriggerRow', 'patUserTextRow', 'patPeerPrefixRow'].forEach(id => {
                const row = document.getElementById(id);
                if (row) row.style.display = on ? '' : 'none';
            });
            ['patTriggerInput', 'patUserPrefixInput', 'patPeerPrefixInput'].forEach(id => {
                const inp = document.getElementById(id);
                if (inp) inp.disabled = !on;
            });
        });

        document.getElementById('patTriggerInput').addEventListener('change', (e) => {
            let val = parseInt(e.target.value) || 5;
            val = Math.max(0, Math.min(100, val));
            e.target.value = val;
            const s = Data.getSettings();
            if (!s.patSettings) s.patSettings = {};
            s.patSettings.patTriggerProbability = val / 100;
            Data.updateSettings({ patSettings: s.patSettings });
        });

        document.getElementById('patUserPrefixInput').addEventListener('change', (e) => {
            const s = Data.getSettings();
            if (!s.patSettings) s.patSettings = {};
            s.patSettings.userPatPrefix = e.target.value;
            Data.updateSettings({ patSettings: s.patSettings });
        });

        document.getElementById('patPeerPrefixInput').addEventListener('change', (e) => {
            const s = Data.getSettings();
            if (!s.patSettings) s.patSettings = {};
            s.patSettings.peerPatPrefix = e.target.value;
            Data.updateSettings({ patSettings: s.patSettings });
        });

        // Bubble style picker
        document.querySelectorAll('#bubbleStylePicker .bubble-style-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('#bubbleStylePicker .bubble-style-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                const style = opt.dataset.style;
                Data.updateSettings({ chatBubbleStyle: style });
                App.applyBubbleStyle();
            });
        });

        // Chat background upload
        const chatBgFile = document.getElementById('chatBgFile');
        if (chatBgFile) {
            chatBgFile.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 10 * 1024 * 1024) {
                    Utils.toast('\u56FE\u7247\u4E0D\u80FD\u8D85\u8FC710MB');
                    return;
                }
                try {
                    const dataUrl = await Utils.compressImage(file, 1920, 0.75);
                    Data.updateSettings({ chatBackground: dataUrl });
                    App.applyChatBackground();
                    this.render();
                    Utils.toast('\u804A\u5929\u80CC\u666F\u5DF2\u66F4\u65B0');
                } catch (err) {
                    Utils.toast('\u56FE\u7247\u52A0\u8F7D\u5931\u8D25');
                }
                e.target.value = '';
            });
        }

        // Chat background opacity slider
        const opacitySlider = document.getElementById('chatBgOpacitySlider');
        if (opacitySlider) {
            opacitySlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) / 100;
                document.getElementById('chatBgOpacityValue').textContent = Math.round(val * 100) + '%';
                Data.updateSettings({ chatBackgroundOpacity: val });
                App.applyChatBackground();
                // Update live preview
                const previewBg = document.querySelector('#chatBgLivePreview .chat-bg-preview-bg');
                if (previewBg) previewBg.style.opacity = val;
            });
        }

        const resetChatBg = document.getElementById('resetChatBg');
        if (resetChatBg) {
            resetChatBg.addEventListener('click', () => {
                Data.updateSettings({ chatBackground: '' });
                App.applyChatBackground();
                this.render();
                Utils.toast('\u80CC\u666F\u5DF2\u6E05\u9664');
            });
        }

        // Drawer event toggles (probability is fixed, not adjustable)
        this._bindCheckToggle('peerCallEnabledItem', 'peerCallEnabledCheck', (on) => {
            const s = Data.getSettings();
            if (!s.drawerSettings) s.drawerSettings = {};
            s.drawerSettings.peerCallEnabled = on;
            Data.updateSettings({ drawerSettings: s.drawerSettings });
        });
        this._bindCheckToggle('peerTransferEnabledItem', 'peerTransferEnabledCheck', (on) => {
            const s = Data.getSettings();
            if (!s.drawerSettings) s.drawerSettings = {};
            s.drawerSettings.peerTransferEnabled = on;
            Data.updateSettings({ drawerSettings: s.drawerSettings });
        });
        this._bindCheckToggle('peerGiftEnabledItem', 'peerGiftEnabledCheck', (on) => {
            const s = Data.getSettings();
            if (!s.drawerSettings) s.drawerSettings = {};
            s.drawerSettings.peerGiftEnabled = on;
            Data.updateSettings({ drawerSettings: s.drawerSettings });
        });
    },

    _bindCheckToggle(itemId, checkId, callback) {
        const item = document.getElementById(itemId);
        if (!item) return;
        item.addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT') return;
            const cb = document.getElementById(checkId);
            if (!cb) return;
            const on = !cb.classList.contains('checked');
            cb.classList.toggle('checked', on);
            callback(on);
        });
    }
};
