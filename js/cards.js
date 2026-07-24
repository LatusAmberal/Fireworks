/* ===== Cards Page ===== */

const Cards = {
    currentFilter: 'all',
    currentCardTab: 'main',
    multiSelectMode: false,
    selectedCards: new Set(),
    editingCardId: null,
    _pendingImportTxt: null,

    init() {
        this.currentFilter = Data.data.cardFilter || 'all';

        document.getElementById('cardAddBtn').addEventListener('click', () => this.showAddModal());
        document.getElementById('cardMultiBtn').addEventListener('click', () => this.toggleMultiSelect());
        document.getElementById('cardImportBtn').addEventListener('click', () => this.handleImport());
        document.getElementById('cardExportBtn').addEventListener('click', () => this.handleExport());
        document.getElementById('cardDedupBtn').addEventListener('click', () => this.handleDedup());

        document.getElementById('addCardCancel').addEventListener('click', () => this.hideAddModal());
        document.getElementById('addCardConfirm').addEventListener('click', () => this.confirmAdd());
        // Enter key to confirm in single-line add inputs
        ['addCardGiftName', 'addCardGiftEmoji', 'addCardGiftDesc', 'addCardStatusInput'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.confirmAdd(); });
        });
        document.getElementById('editCardCancel').addEventListener('click', () => this.hideEditModal());
        document.getElementById('editCardConfirm').addEventListener('click', () => this.confirmEdit());
        document.getElementById('groupModalClose').addEventListener('click', () => this.hideGroupModal());
        document.getElementById('addGroupBtn').addEventListener('click', () => this.addGroupFromModal());

        document.getElementById('multiSelectCancel').addEventListener('click', () => this.toggleMultiSelect(false));
        document.getElementById('multiSelectMove').addEventListener('click', () => this.moveSelectedToGroup());
        document.getElementById('multiSelectDelete').addEventListener('click', () => this.deleteSelected());
        document.getElementById('multiSelectBlock').addEventListener('click', () => this.blockSelected());

        document.getElementById('moveGroupCancel').addEventListener('click', () => this.hideMoveGroupModal());

        document.getElementById('cardFileInput').addEventListener('change', (e) => this.processFile(e));

        // Tab bar
        document.querySelectorAll('.cards-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.cards-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentCardTab = tab.dataset.cardTab;
                this.onShow();
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.style.display = 'none';
            });
        });
    },

    onShow() {
        this.renderGroupBar();
        this.renderCards();
    },

    renderGroupBar() {
        const bar = document.getElementById('cardsGroupBar');
        // Show group bar for main cards only, hide for status and emoji
        if (this.currentCardTab !== 'main') {
            bar.style.display = 'none';
            return;
        }
        bar.style.display = 'flex';

        const groups = Data.getGroups();
        let html = `<div class="group-tag ${this.currentFilter === 'all' ? 'active' : ''}" data-group="all">全部</div>`;
        groups.forEach(g => {
            html += `<div class="group-tag ${this.currentFilter === g.id ? 'active' : ''}" data-group="${g.id}">
                ${Utils.escapeHtml(g.name)}
                <span class="tag-edit" data-edit-group="${g.id}">&#9998;</span>
            </div>`;
        });
        // Virtual "未分组" for cards without a valid group
        const validIds = new Set(groups.map(g => g.id));
        const hasUngrouped = Data.getCards().some(c => !c.group || !validIds.has(c.group));
        if (hasUngrouped) {
            html += `<div class="group-tag ${this.currentFilter === 'default' ? 'active' : ''}" data-group="default">未分组</div>`;
        }
        html += `<div class="group-tag tag-manage" id="manageGroupsBtn">+ 管理分组</div>`;

        bar.innerHTML = html;

        bar.querySelectorAll('.group-tag[data-group]').forEach(tag => {
            tag.addEventListener('click', (e) => {
                if (e.target.dataset.editGroup) return;
                this.currentFilter = tag.dataset.group;
                Data.data.cardFilter = this.currentFilter;
                Data.save();
                this.renderGroupBar();
                this.renderCards();
            });
        });

        bar.querySelectorAll('[data-edit-group]').forEach(editBtn => {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showGroupModal(editBtn.dataset.editGroup);
            });
        });

        document.getElementById('manageGroupsBtn').addEventListener('click', () => {
            this.showGroupModal();
        });
    },

    getCurrentCardList() {
        const tab = this.currentCardTab;
        if (tab === 'status') return Data.getStatusCards();
        if (tab === 'emoji') return Data.getEmojiCards();
        if (tab === 'sticker') return Data.getStickerCards();
        if (tab === 'gift') return Data.getGiftCards();
        return this.currentFilter === 'all' ? Data.getCards() : Data.getCardsByGroup(this.currentFilter);
    },

    renderCards() {
        const list = document.getElementById('cardsList');
        const tab = this.currentCardTab;
        let cards = this.getCurrentCardList();
        let addModal = document.getElementById('addCardModal');
        let groupRow = document.getElementById('addCardGroupRow');
        let editGroupRow = document.getElementById('editCardGroupRow');

        if (tab !== 'main') {
            groupRow.style.display = 'none';
            editGroupRow.style.display = 'none';
        } else {
            groupRow.style.display = 'flex';
            editGroupRow.style.display = 'flex';
        }

        const tabLabel = tab === 'status' ? '\u72B6\u6001\u5B57\u5361' : (tab === 'emoji' ? 'Emoji' : (tab === 'gift' ? '\u793C\u7269' : (tab === 'sticker' ? '\u8868\u60C5\u5305' : '\u5B57\u5361')));

        if (cards.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">${tab === 'emoji' ? '\uD83D\uDE00' : (tab === 'gift' ? '\uD83C\uDF81' : (tab === 'sticker' ? '\uD83E\uDD73' : '\uD83D\uDCE6'))}</div>
                    <p>\u6682\u65E0${tabLabel}</p>
                    <p style="font-size:13px;margin-top:4px">\u70B9\u51FB\u53F3\u4E0A\u89D2 + \u6DFB\u52A0${tabLabel}</p>
                </div>
            `;
            return;
        }

        const isGrid = tab !== 'main';
        const isSticker = tab === 'sticker';
        list.className = 'cards-list' + (this.multiSelectMode ? ' multi-select' : '') + (isGrid ? ' grid-layout' : '') + (isSticker ? ' sticker-grid' : '');

        let html = '';
        cards.forEach(card => {
            const groupName = tab === 'main' ? (Data.getGroups().find(g => g.id === card.group) || {}).name || '' : '';
            const isSelected = this.selectedCards.has(card.id);
            const isEmoji = tab === 'emoji';
            const isGift = tab === 'gift';
            if (isGift) {
                html += `
                    <div class="card-item gift-card ${card.blocked ? 'blocked' : ''} ${isSelected ? 'selected' : ''}" data-card-id="${card.id}">
                        <div class="card-checkbox ${isSelected ? 'checked' : ''}"></div>
                        <div class="card-content-wrap">
                            <div class="gift-card-row">
                                <span class="gift-card-emoji">${Utils.escapeHtml(card.emoji)}</span>
                                <div class="gift-card-info">
                                    <div class="gift-card-name">${Utils.escapeHtml(card.name)}</div>
                                    <div class="gift-card-desc">${Utils.escapeHtml(card.description)}</div>
                                </div>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button class="card-action-btn block ${card.blocked ? 'blocked' : ''}" data-action="block" data-id="${card.id}" title="${card.blocked ? '\u89E3\u9664\u5C4F\u853D' : '\u5C4F\u853D'}">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            </button>
                            <button class="card-action-btn edit" data-action="edit" data-id="${card.id}" title="\u4FEE\u6539">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="card-action-btn delete" data-action="delete" data-id="${card.id}" title="\u5220\u9664">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </div>
                `;
            } else if (isSticker) {
                html += `
                    <div class="card-item sticker-card ${card.blocked ? 'blocked' : ''} ${isSelected ? 'selected' : ''}" data-card-id="${card.id}">
                        <div class="card-checkbox ${isSelected ? 'checked' : ''}"></div>
                        <div class="card-content-wrap">
                            <img class="sticker-card-img" src="${card.imageData || ''}" alt="${Utils.escapeHtml(card.name || '')}">
                        </div>
                        <div class="card-actions">
                            <button class="card-action-btn block ${card.blocked ? 'blocked' : ''}" data-action="block" data-id="${card.id}" title="${card.blocked ? '\u89E3\u9664\u5C4F\u853D' : '\u5C4F\u853D'}">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            </button>
                            <button class="card-action-btn delete" data-action="delete" data-id="${card.id}" title="\u5220\u9664">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="card-item ${isEmoji ? 'emoji-card' : ''} ${card.blocked ? 'blocked' : ''} ${isSelected ? 'selected' : ''}" data-card-id="${card.id}">
                        <div class="card-checkbox ${isSelected ? 'checked' : ''}"></div>
                        <div class="card-content-wrap">
                            <div class="card-content">${isEmoji ? card.content : Utils.escapeHtml(card.content)}</div>
                            ${tab === 'main' && card.translation ? `<div class="card-translation">${Utils.escapeHtml(card.translation)}</div>` : ''}
                            ${groupName ? `<div class="card-translation" style="margin-top:4px;opacity:0.6">\uD83D\uDCC1 ${Utils.escapeHtml(groupName)}</div>` : ''}
                        </div>
                        <div class="card-actions">
                            <button class="card-action-btn block ${card.blocked ? 'blocked' : ''}" data-action="block" data-id="${card.id}" title="${card.blocked ? '\u89E3\u9664\u5C4F\u853D' : '\u5C4F\u853D'}">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            </button>
                            <button class="card-action-btn edit" data-action="edit" data-id="${card.id}" title="\u4FEE\u6539">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="card-action-btn delete" data-action="delete" data-id="${card.id}" title="\u5220\u9664">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </div>
                `;
            }
        });

        list.innerHTML = html;

        list.querySelectorAll('.card-item').forEach(item => {
            const cardId = item.dataset.cardId;

            if (this.multiSelectMode) {
                item.addEventListener('click', () => this.toggleSelect(cardId));
            } else {
                item.querySelector('[data-action="block"]')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (tab === 'status') Data.toggleStatusBlock(cardId);
                    else if (tab === 'emoji') Data.toggleEmojiBlock(cardId);
                    else if (tab === 'gift') Data.toggleGiftBlock(cardId);
                    else if (tab === 'sticker') {
                        Data.toggleStickerBlock(cardId);
                        const card = Data.getStickerCards().find(c => c.id === cardId);
                        if (card && card.blocked) {
                            Utils.toast('屏蔽后对方回复时无法抽取此表情包，但你仍可以正常发送');
                        } else {
                            Utils.toast('已更新屏蔽状态');
                        }
                    }
                    else Data.toggleBlock(cardId);
                    this.renderCards();
                    if (tab !== 'sticker') Utils.toast('\u5DF2\u66F4\u65B0\u5C4F\u853D\u72B6\u6001');
                });

                item.querySelector('[data-action="edit"]')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showEditModal(cardId);
                });

                item.querySelector('[data-action="delete"]')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.confirmDeleteCard(cardId);
                });
            }
        });
    },

    // ===== Add Modal =====
    showAddModal() {
        const tab = this.currentCardTab;
        const modal = document.getElementById('addCardModal');
        const groupRow = document.getElementById('addCardGroupRow');
        const select = document.getElementById('addCardGroupSelect');
        const textarea = document.getElementById('addCardTextarea');
        const giftName = document.getElementById('addCardGiftName');
        const giftEmoji = document.getElementById('addCardGiftEmoji');
        const giftDesc = document.getElementById('addCardGiftDesc');
        const statusInput = document.getElementById('addCardStatusInput');

        // Reset all inputs to hidden by default
        textarea.style.display = 'block';
        if (giftName) { giftName.style.display = 'none'; giftName.value = ''; }
        if (giftEmoji) { giftEmoji.style.display = 'none'; giftEmoji.value = ''; }
        if (giftDesc) { giftDesc.style.display = 'none'; giftDesc.value = ''; }
        if (statusInput) { statusInput.style.display = 'none'; statusInput.value = ''; }
        const stickerFile = document.getElementById('addCardStickerFile');
        if (stickerFile) { stickerFile.style.display = 'none'; stickerFile.value = ''; }
        const uploadArea = document.getElementById('stickerUploadArea');
        if (uploadArea) uploadArea.style.display = 'none';

        if (tab !== 'main') {
            groupRow.style.display = 'none';
        } else {
            groupRow.style.display = 'flex';
            const groups = Data.getGroups();
            select.innerHTML = groups.map(g => `<option value="${g.id}">${Utils.escapeHtml(g.name)}</option>`).join('');
        }

        textarea.value = '';
        if (tab === 'gift') {
            textarea.style.display = 'none';
            if (giftName) giftName.style.display = 'block';
            if (giftEmoji) giftEmoji.style.display = 'block';
            if (giftDesc) giftDesc.style.display = 'block';
            modal.querySelector('.modal-header').textContent = '添加礼物';
            setTimeout(() => { if (giftName) giftName.focus(); }, 100);
        } else if (tab === 'status') {
            textarea.style.display = 'none';
            if (statusInput) statusInput.style.display = 'block';
            modal.querySelector('.modal-header').textContent = '添加对方状态';
            setTimeout(() => { if (statusInput) statusInput.focus(); }, 100);
        } else if (tab === 'emoji') {
            textarea.placeholder = '每行一个 Emoji，可以是单个也可以是多个：😂 \uD83D\uDC4D';
            modal.querySelector('.modal-header').textContent = '添加 Emoji';
            setTimeout(() => textarea.focus(), 100);
        } else if (tab === 'sticker') {
            textarea.style.display = 'none';
            modal.querySelector('.modal-header').textContent = '上传表情包';
            const uploadArea = document.getElementById('stickerUploadArea');
            const uploadBox = document.getElementById('stickerUploadBox');
            const fileInput = document.getElementById('addCardStickerFile');
            const preview = document.getElementById('stickerUploadPreview');
            const previewImg = document.getElementById('stickerUploadPreviewImg');
            const filename = document.getElementById('stickerUploadFilename');
            if (uploadArea) uploadArea.style.display = 'block';
            if (fileInput) fileInput.value = '';
            if (preview) preview.style.display = 'none';
            if (previewImg) previewImg.src = '';
            if (filename) filename.textContent = '';
            // Bind upload box click
            if (uploadBox && fileInput) {
                uploadBox.onclick = () => fileInput.click();
            }
            // Bind file change for preview
            if (fileInput) {
                fileInput.onchange = () => {
                    const file = fileInput.files[0];
                    if (file && preview && previewImg && filename) {
                        preview.style.display = 'block';
                        previewImg.src = URL.createObjectURL(file);
                        filename.textContent = file.name;
                    }
                };
            }
        } else {
            textarea.placeholder = '每行一条字卡\n用 {翻译内容} 添加翻译\n例如：你好 {Hello}';
            modal.querySelector('.modal-header').textContent = '添加字卡';
            setTimeout(() => textarea.focus(), 100);
        }
        modal.style.display = 'flex';
    },

    hideAddModal() {
        document.getElementById('addCardModal').style.display = 'none';
    },

    confirmAdd() {
        const tab = this.currentCardTab;
        let added = 0;

        if (tab === 'gift') {
            const name = document.getElementById('addCardGiftName').value.trim();
            const emoji = document.getElementById('addCardGiftEmoji').value.trim();
            const desc = document.getElementById('addCardGiftDesc').value.trim();
            if (!name && !emoji) {
                Utils.toast('请至少输入礼物名称或 Emoji');
                return;
            }
            Data.addGiftCard(emoji || '🎁', name || '礼物', desc);
            added = 1;
        } else if (tab === 'status') {
            const content = document.getElementById('addCardStatusInput').value.trim();
            if (!content) {
                Utils.toast('请输入状态内容');
                return;
            }
            Data.addStatusCard(content);
            added = 1;
        } else if (tab === 'emoji') {
            const text = document.getElementById('addCardTextarea').value;
            if (!text.trim()) {
                Utils.toast('请输入内容');
                return;
            }
            const lines = text.split('\n');
            lines.forEach(line => {
                const content = line.trim();
                if (content) {
                    Data.addEmojiCard(content);
                    added++;
                }
            });
        } else if (tab === 'sticker') {
            const fileInput = document.getElementById('addCardStickerFile');
            if (!fileInput || !fileInput.files || !fileInput.files[0]) {
                Utils.toast('请选择图片文件');
                return;
            }
            const file = fileInput.files[0];
            if (file.size > 20 * 1024 * 1024) {
                Utils.toast('文件不能超过20MB');
                return;
            }
            Utils.compressImage(file, 512, 0.7).then(dataUrl => {
                const name = (file.name || '').replace(/\.[^.]+$/, '').slice(0, 30) || '表情包';
                Data.addStickerCard(name, dataUrl);
                this.hideAddModal();
                this.renderCards();
                Utils.toast('表情包已添加');
            }).catch(() => {
                Utils.toast('图片处理失败');
            });
            return; // async, don't continue with sync flow
        } else {
            const text = document.getElementById('addCardTextarea').value;
            if (!text.trim()) {
                Utils.toast('请输入内容');
                return;
            }
            const lines = text.split('\n');
            const group = document.getElementById('addCardGroupSelect').value;
            Data.addCards(lines, group);
            added = lines.filter(l => l.trim()).length;
            this.renderGroupBar();
        }
        this.hideAddModal();
        this.renderCards();
        Utils.toast(`已添加 ${added} 条`);
    },

    // ===== Edit Modal =====
    showEditModal(cardId) {
        const tab = this.currentCardTab;
        let card;
        if (tab === 'status') card = Data.getStatusCards().find(c => c.id === cardId);
        else if (tab === 'emoji') card = Data.getEmojiCards().find(c => c.id === cardId);
        else if (tab === 'gift') card = Data.getGiftCards().find(c => c.id === cardId);
        else if (tab === 'sticker') card = Data.getStickerCards().find(c => c.id === cardId);
        else card = Data.getCards().find(c => c.id === cardId);
        if (!card) return;

        this.editingCardId = cardId;
        const contentInput = document.getElementById('editCardContent');
        const transInput = document.getElementById('editCardTranslation');
        const giftEmojiInput = document.getElementById('editCardGiftEmoji');
        const giftDescInput = document.getElementById('editCardGiftDesc');
        const groupRow = document.getElementById('editCardGroupRow');

        document.querySelector('#editCardModal .modal-header').textContent = tab === 'emoji' ? '\u4FEE\u6539 Emoji' : (tab === 'gift' ? '\u4FEE\u6539\u793C\u7269' : '\u4FEE\u6539\u5B57\u5361');

        // Reset visibility
        contentInput.style.display = '';
        transInput.style.display = '';
        giftEmojiInput.style.display = 'none';
        giftDescInput.style.display = 'none';

        if (tab === 'gift') {
            contentInput.value = card.name;
            contentInput.placeholder = '\u793C\u7269\u540D\u79F0';
            transInput.style.display = 'none';
            giftEmojiInput.style.display = '';
            giftDescInput.style.display = '';
            giftEmojiInput.value = card.emoji;
            giftDescInput.value = card.description || '';
            groupRow.style.display = 'none';
        } else if (tab !== 'main') {
            contentInput.value = card.content;
            contentInput.placeholder = '\u5185\u5BB9';
            transInput.value = '';
            transInput.style.display = 'none';
            groupRow.style.display = 'none';
        } else {
            contentInput.value = card.content;
            contentInput.placeholder = '\u5B57\u5361\u5185\u5BB9';
            transInput.value = card.translation || '';
            transInput.style.display = '';
            groupRow.style.display = 'flex';
            const select = document.getElementById('editCardGroupSelect');
            const groups = Data.getGroups();
            select.innerHTML = groups.map(g => `<option value="${g.id}" ${g.id === card.group ? 'selected' : ''}>${Utils.escapeHtml(g.name)}</option>`).join('');
        }

        document.getElementById('editCardModal').style.display = 'flex';
    },

    hideEditModal() {
        document.getElementById('editCardModal').style.display = 'none';
        this.editingCardId = null;
    },

    confirmEdit() {
        if (!this.editingCardId) return;
        const tab = this.currentCardTab;
        const content = document.getElementById('editCardContent').value.trim();

        if (!content) {
            Utils.toast('\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A');
            return;
        }

        if (tab === 'gift') {
            const emoji = document.getElementById('editCardGiftEmoji').value.trim() || '\uD83C\uDF81';
            const description = document.getElementById('editCardGiftDesc').value.trim();
            Data.updateGiftCard(this.editingCardId, { name: content, emoji, description });
        } else if (tab === 'status') {
            Data.updateStatusCard(this.editingCardId, { content });
        } else if (tab === 'emoji') {
            Data.updateEmojiCard(this.editingCardId, { content });
        } else {
            const translation = document.getElementById('editCardTranslation').value.trim();
            const group = document.getElementById('editCardGroupSelect').value;
            Data.updateCard(this.editingCardId, { content, translation, group });
        }
        this.hideEditModal();
        this.renderCards();
        Utils.toast('\u5DF2\u66F4\u65B0');
    },

    // ===== Delete =====
    confirmDeleteCard(cardId) {
        const tab = this.currentCardTab;
        let card;
        if (tab === 'status') card = Data.getStatusCards().find(c => c.id === cardId);
        else if (tab === 'emoji') card = Data.getEmojiCards().find(c => c.id === cardId);
        else if (tab === 'gift') card = Data.getGiftCards().find(c => c.id === cardId);
        else if (tab === 'sticker') card = Data.getStickerCards().find(c => c.id === cardId);
        else card = Data.getCards().find(c => c.id === cardId);
        if (!card) return;

        const label = tab === 'gift' ? card.name : (tab === 'sticker' ? (card.name || '\u8868\u60C5\u5305') : (tab === 'emoji' ? card.content : card.content));
        this.showConfirmDialog('\u5220\u9664', `\u786E\u5B9A\u5220\u9664"${label}"\u5417\uFF1F`, () => {
            if (tab === 'status') Data.deleteStatusCard(cardId);
            else if (tab === 'emoji') Data.deleteEmojiCard(cardId);
            else if (tab === 'gift') Data.deleteGiftCard(cardId);
            else if (tab === 'sticker') Data.deleteStickerCard(cardId);
            else Data.deleteCard(cardId);
            this.renderCards();
            if (tab === 'main') this.renderGroupBar();
            Utils.toast('\u5DF2\u5220\u9664');
        });
    },

    // ===== Multi-select =====
    toggleMultiSelect(force) {
        this.multiSelectMode = force !== undefined ? force : !this.multiSelectMode;
        this.selectedCards.clear();

        const bar = document.getElementById('multiSelectBar');
        bar.style.display = this.multiSelectMode ? 'flex' : 'none';

        this.renderCards();
        this.updateMultiSelectCount();
    },

    toggleSelect(cardId) {
        if (this.selectedCards.has(cardId)) {
            this.selectedCards.delete(cardId);
        } else {
            this.selectedCards.add(cardId);
        }
        this.renderCards();
        this.updateMultiSelectCount();
    },

    updateMultiSelectCount() {
        document.getElementById('multiSelectCount').textContent = `\u5DF2\u9009 ${this.selectedCards.size} \u9879`;
    },

    deleteSelected() {
        if (this.selectedCards.size === 0) { Utils.toast('\u8BF7\u5148\u9009\u62E9'); return; }
        const tab = this.currentCardTab;
        this.showConfirmDialog('\u5220\u9664\u9009\u4E2D', `\u786E\u5B9A\u5220\u9664 ${this.selectedCards.size} \u5F20\u5B57\u5361\u5417\uFF1F`, () => {
            const ids = [...this.selectedCards];
            if (tab === 'status') Data.deleteStatusCards(ids);
            else if (tab === 'emoji') Data.deleteEmojiCards(ids);
            else if (tab === 'gift') Data.deleteGiftCards(ids);
            else if (tab === 'sticker') Data.deleteStickerCards(ids);
            else Data.deleteCards(ids);
            this.selectedCards.clear();
            this.toggleMultiSelect(false);
            if (tab === 'main') this.renderGroupBar();
            Utils.toast('\u5DF2\u5220\u9664');
        });
    },

    blockSelected() {
        if (this.selectedCards.size === 0) { Utils.toast('\u8BF7\u5148\u9009\u62E9'); return; }
        const tab = this.currentCardTab;
        const ids = [...this.selectedCards];
        if (tab === 'status') Data.blockStatusCards(ids, true);
        else if (tab === 'emoji') Data.blockEmojiCards(ids, true);
        else if (tab === 'gift') Data.blockGiftCards(ids, true);
        else if (tab === 'sticker') Data.blockStickerCards(ids, true);
        else Data.blockCards(ids, true);
        this.selectedCards.clear();
        this.toggleMultiSelect(false);
        Utils.toast('\u5DF2\u5C4F\u853D');
    },

    moveSelectedToGroup() {
        if (this.selectedCards.size === 0) { Utils.toast('\u8BF7\u5148\u9009\u62E9'); return; }
        if (this.currentCardTab !== 'main') { Utils.toast('\u4EC5\u4E3B\u5B57\u5361\u652F\u6301\u5206\u7EC4'); return; }
        this.showMoveGroupModal();
    },

    showMoveGroupModal() {
        const modal = document.getElementById('moveGroupModal');
        const list = document.getElementById('moveGroupList');
        const groups = Data.getGroups();
        let html = '';
        groups.forEach(g => {
            html += `<div class="group-picker-item" data-group-id="${g.id}">${Utils.escapeHtml(g.name)}</div>`;
        });
        // Also add "未分组" option
        html += `<div class="group-picker-item" data-group-id="__ungrouped__">未分组（移除分组）</div>`;
        list.innerHTML = html;
        modal.style.display = 'flex';

        list.querySelectorAll('.group-picker-item').forEach(item => {
            item.addEventListener('click', () => {
                const groupId = item.dataset.groupId;
                const ids = [...this.selectedCards];
                const targetGroup = groupId === '__ungrouped__' ? null : groupId;
                Data.moveCardsToGroup(ids, targetGroup);
                this.selectedCards.clear();
                this.toggleMultiSelect(false);
                this.hideMoveGroupModal();
                if (App.currentPage === 'cards') {
                    this.renderGroupBar();
                    this.renderCards();
                }
                Utils.toast(`\u5DF2\u79FB\u52A8 ${ids.length} \u5F20\u5B57\u5361`);
            });
        });
    },

    hideMoveGroupModal() {
        document.getElementById('moveGroupModal').style.display = 'none';
    },

    // ===== Import / Export =====
    handleExport() {
        const tab = this.currentCardTab;
        let cards, prefix, txt = '';
        if (tab === 'status') {
            cards = Data.getStatusCards();
            prefix = 'fireworks_status';
            txt = '# Fireworks \u72B6\u6001\u5B57\u5361\u5BFC\u51FA\n\n';
            cards.forEach(c => { txt += c.content + '\n'; });
        } else if (tab === 'emoji') {
            cards = Data.getEmojiCards();
            prefix = 'fireworks_emoji';
            txt = '# Fireworks Emoji \u5BFC\u51FA\n\n';
            cards.forEach(c => { txt += c.content + '\n'; });
        } else if (tab === 'gift') {
            cards = Data.getGiftCards();
            prefix = 'fireworks_gift';
            txt = '# Fireworks \u793C\u7269\u5BFC\u51FA\n# \u683C\u5F0F: Emoji | \u540D\u79F0 | \u63CF\u8FF0\n\n';
            cards.forEach(c => { txt += `${c.emoji} | ${c.name} | ${c.description || ''}\n`; });
        } else {
            const t = Data.exportCardsTxt();
            txt = t;
            prefix = 'fireworks_cards';
        }
        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${prefix}_${new Date().toISOString().slice(0,10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Utils.toast('\u5B57\u5361\u5DF2\u5BFC\u51FA');
    },

    handleImport() {
        document.getElementById('cardFileInput').click();
    },

    processFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        const tab = this.currentCardTab;

        const reader = new FileReader();
        reader.onload = (e) => {
            const txt = e.target.result;

            // For main tab, show import mode choice modal
            if (tab === 'main') {
                this._pendingImportTxt = txt;
                this.showImportModeModal();
            } else {
                // Other tabs: import directly (always append)
                const lines = txt.split('\n');
                let added = 0;
                lines.forEach(line => {
                    const content = line.trim();
                    if (content && !content.startsWith('#')) {
                        if (tab === 'gift') {
                            const parts = content.split('|').map(s => s.trim());
                            if (parts.length >= 2) {
                                Data.addGiftCard(parts[0] || '\uD83C\uDF81', parts[1], parts[2] || '');
                                added++;
                            } else if (parts.length === 1 && parts[0]) {
                                Data.addGiftCard('\uD83C\uDF81', parts[0], '');
                                added++;
                            }
                        } else if (tab === 'status') {
                            Data.addStatusCard(content);
                            added++;
                        } else if (tab === 'emoji') {
                            Data.addEmojiCard(content);
                            added++;
                        }
                    }
                });
                this.renderCards();
                Utils.toast(`\u5DF2\u5BFC\u5165 ${added} \u6761`);
            }
        };
        reader.readAsText(file, 'UTF-8');
        event.target.value = '';
    },

    // ===== Import Mode Modal =====
    showImportModeModal() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';
        overlay.innerHTML = `
            <div class="modal" style="max-width:380px">
                <div class="modal-header">\u5BFC\u5165\u5B57\u5361</div>
                <div class="confirm-dialog">
                    <div class="confirm-text">\u8BF7\u9009\u62E9\u5BFC\u5165\u65B9\u5F0F\uFF1A</div>
                </div>
                <div class="modal-actions" style="flex-direction:column;gap:8px">
                    <button class="btn-danger" id="importOverwrite" style="width:100%">\u8986\u76D6 \u2014 \u66FF\u6362\u5168\u90E8\u5B57\u5361</button>
                    <button class="btn-primary" id="importAppend" style="width:100%">\u8FFD\u52A0 \u2014 \u53BB\u91CD\u540E\u6DFB\u52A0</button>
                    <button class="btn-secondary" id="importCancel" style="width:100%">\u53D6\u6D88</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('#importOverwrite').addEventListener('click', () => {
            overlay.remove();
            this.doImport(this._pendingImportTxt, 'overwrite');
        });
        overlay.querySelector('#importAppend').addEventListener('click', () => {
            overlay.remove();
            this.doImport(this._pendingImportTxt, 'append');
        });
        overlay.querySelector('#importCancel').addEventListener('click', () => {
            overlay.remove();
            this._pendingImportTxt = null;
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                this._pendingImportTxt = null;
            }
        });
    },

    doImport(txt, mode) {
        const count = Data.importCardsTxt(txt, mode);
        this.renderGroupBar();
        this.renderCards();
        const modeText = mode === 'overwrite' ? '\u8986\u76D6' : '\u8FFD\u52A0';
        Utils.toast(`\u5DF2${modeText}\u5BFC\u5165 ${count} \u6761\u5B57\u5361`);
    },

    handleDedup() {
        const tab = this.currentCardTab;
        let removed = 0;
        switch (tab) {
            case 'main': removed = Data.dedupCards(); break;
            case 'status': removed = Data.dedupStatusCards(); break;
            case 'emoji': removed = Data.dedupEmojiCards(); break;
            case 'gift': removed = Data.dedupGiftCards(); break;
        }
        if (removed > 0) {
            this.renderCards();
            if (tab === 'main') this.renderGroupBar();
            Utils.toast(`\u5DF2\u53BB\u9664 ${removed} \u6761\u91CD\u590D\u5B57\u5361`);
        } else {
            Utils.toast('\u6CA1\u6709\u53D1\u73B0\u91CD\u590D\u5B57\u5361');
        }
    },

    // ===== Group Modal =====
    showGroupModal(editGroupId) {
        const modal = document.getElementById('groupModal');
        this.renderGroupEditList();
        document.getElementById('newGroupName').value = '';
        modal.style.display = 'flex';

        if (editGroupId) {
            setTimeout(() => {
                const input = modal.querySelector(`[data-group-id="${editGroupId}"]`);
                if (input) { input.focus(); input.select(); }
            }, 200);
        }
    },

    hideGroupModal() {
        document.getElementById('groupModal').style.display = 'none';
    },

    renderGroupEditList() {
        const list = document.getElementById('groupListEdit');
        const groups = Data.getGroups().filter(g => g.id !== 'default');

        let html = '';
        groups.forEach((g, idx) => {
            html += `
                <div class="group-edit-row" draggable="true" data-group-id="${g.id}" data-group-idx="${idx}">
                    <span class="group-drag-handle" title="拖动排序">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
                    </span>
                    <input type="text" value="${Utils.escapeHtml(g.name)}" data-group-id="${g.id}">
                    <button class="delete-group" data-delete-group="${g.id}" title="删除">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            `;
        });

        list.innerHTML = html;

        // Inline rename: save on Enter or blur
        list.querySelectorAll('input[data-group-id]').forEach(input => {
            const save = () => {
                const id = input.dataset.groupId;
                const newName = input.value.trim();
                if (newName && newName !== (Data.getGroups().find(g => g.id === id) || {}).name) {
                    Data.renameGroup(id, newName);
                    this.renderGroupBar();
                    Utils.toast('\u5206\u7EC4\u5DF2\u91CD\u547D\u540D');
                } else if (!newName) {
                    input.value = (Data.getGroups().find(g => g.id === id) || {}).name || '';
                }
            };
            input.addEventListener('blur', save);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { input.blur(); }
            });
        });

        // Drag-and-drop reorder
        let dragSrcId = null;
        list.querySelectorAll('.group-edit-row').forEach(row => {
            row.addEventListener('dragstart', (e) => {
                dragSrcId = row.dataset.groupId;
                row.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', dragSrcId);
            });
            row.addEventListener('dragend', () => {
                row.classList.remove('dragging');
                list.querySelectorAll('.group-edit-row').forEach(r => r.classList.remove('drag-over'));
                dragSrcId = null;
            });
            row.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (row.dataset.groupId !== dragSrcId) {
                    list.querySelectorAll('.group-edit-row').forEach(r => r.classList.remove('drag-over'));
                    row.classList.add('drag-over');
                }
            });
            row.addEventListener('dragleave', () => {
                row.classList.remove('drag-over');
            });
            row.addEventListener('drop', (e) => {
                e.preventDefault();
                row.classList.remove('drag-over');
                const targetId = row.dataset.groupId;
                if (!dragSrcId || dragSrcId === targetId) return;
                const groups = Data.getGroups().filter(g => g.id !== 'default');
                const orderedIds = groups.map(g => g.id);
                const srcIdx = orderedIds.indexOf(dragSrcId);
                const tgtIdx = orderedIds.indexOf(targetId);
                orderedIds.splice(srcIdx, 1);
                orderedIds.splice(tgtIdx, 0, dragSrcId);
                Data.reorderGroups(orderedIds);
                this.renderGroupBar();
                this.renderGroupEditList();
                Utils.toast('\u6392\u5E8F\u5DF2\u66F4\u65B0');
            });
        });

        // Delete
        list.querySelectorAll('[data-delete-group]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.deleteGroup;
                const group = Data.getGroups().find(g => g.id === id);
                this.showConfirmDialog('删除分组', `确定删除分组"${group.name}"吗？组内字卡将移至未分组。`, () => {
                    Data.deleteGroup(id);
                    if (this.currentFilter === id) this.currentFilter = 'all';
                    this.renderGroupBar();
                    this.renderGroupEditList();
                    this.renderCards();
                    Utils.toast('\u5206\u7EC4\u5DF2\u5220\u9664');
                });
            });
        });
    },

    addGroupFromModal() {
        const input = document.getElementById('newGroupName');
        const name = input.value.trim();
        if (!name) { Utils.toast('\u8BF7\u8F93\u5165\u5206\u7EC4\u540D\u79F0'); return; }
        Data.addGroup(name);
        input.value = '';
        this.renderGroupEditList();
        this.renderGroupBar();
        Utils.toast('\u5206\u7EC4\u5DF2\u6DFB\u52A0');
    },

    // ===== Confirm Dialog =====
    showConfirmDialog(title, text, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">${title}</div>
                <div class="confirm-dialog">
                    <div class="confirm-text">${text}</div>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" id="confirmCancel">\u53D6\u6D88</button>
                    <button class="btn-danger" id="confirmOk">\u786E\u5B9A</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('#confirmCancel').addEventListener('click', () => overlay.remove());
        overlay.querySelector('#confirmOk').addEventListener('click', () => { onConfirm(); overlay.remove(); });
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    }
};
