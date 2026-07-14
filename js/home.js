/* ===== Home Page ===== */

const Home = {
    statusTimer: null,
    _editingStatusAvatarTarget: null,
    musicAudio: null,

    init() {
        this.bindInlineEditing();
        this.bindAvatarChange();
        this.bindStatusAvatarChange();
        this.bindCountdownEdit();
        this.bindMusicPlayer();
        this.ensurePeerStatus();
        this.scheduleStatusChange();
    },

    onShow() {
        this.render();
        this.renderPhotoWall();
        this.renderCountdown();
        this.renderMusicPlayer();
        App.applyAvatarSettings();
    },

    render() {
        const profile = Data.getProfile();
        const peer = Data.getPeer();
        const s = Data.getSettings();

        document.getElementById('profileNickname').textContent = profile.nickname || 'sparkle';
        document.getElementById('profileBio').textContent = profile.bio || '';
        document.getElementById('myStatusName').textContent = profile.nickname || 'sparkle';

        const quoteEl = document.getElementById('homeQuote');
        if (quoteEl) quoteEl.textContent = s.homeQuote || 'So long as men can breathe or eyes can see, So long lives this, and this gives life to thee.';

        this.renderStatusSection();
    },

    // ===== Inline Editing =====
    bindInlineEditing() {
        const inlineInput = document.getElementById('inlineEditInput');

        document.getElementById('profileNickname').addEventListener('dblclick', () => {
            this.showInlineEdit(document.getElementById('profileNickname'), 'nickname');
        });

        document.getElementById('profileBio').addEventListener('dblclick', () => {
            this.showInlineEdit(document.getElementById('profileBio'), 'bio');
        });

        document.getElementById('myStatusText').addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.showInlineEdit(document.getElementById('myStatusText'), 'myStatus');
        });

        document.getElementById('myStatusName').addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.showInlineEdit(document.getElementById('myStatusName'), 'myStatusName');
        });

        document.getElementById('otherStatusText').addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.showInlineEdit(document.getElementById('otherStatusText'), 'otherStatus');
        });

        document.getElementById('otherStatusName').addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.showInlineEdit(document.getElementById('otherStatusName'), 'otherStatusName');
        });

        const quoteEl = document.getElementById('homeQuote');
        if (quoteEl) {
            quoteEl.addEventListener('dblclick', () => {
                this.showInlineEdit(quoteEl, 'homeQuote');
            });
        }

        inlineInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.commitInlineEdit(inlineInput);
            } else if (e.key === 'Escape') {
                this.hideInlineEdit(inlineInput);
            }
        });

        inlineInput.addEventListener('blur', () => {
            this.commitInlineEdit(inlineInput);
        });
    },

    showInlineEdit(element, field) {
        const rect = element.getBoundingClientRect();
        const inlineInput = document.getElementById('inlineEditInput');
        inlineInput.style.display = 'block';
        inlineInput.style.left = rect.left + 'px';
        inlineInput.style.top = rect.top + 'px';
        inlineInput.style.width = Math.max(rect.width, 80) + 'px';
        inlineInput.style.fontSize = getComputedStyle(element).fontSize;
        inlineInput.value = element.textContent.trim();
        inlineInput.dataset.field = field;
        inlineInput.focus();
        inlineInput.select();
    },

    hideInlineEdit(input) {
        input.style.display = 'none';
    },

    commitInlineEdit(input) {
        if (input.style.display === 'none') return;
        const field = input.dataset.field;
        const value = input.value.trim();
        this.hideInlineEdit(input);

        // For photo date, handled separately
        if (field === 'photoDate') return;

        if (!value && field !== 'myStatus' && field !== 'countdownLabel' && field !== 'homeQuote') return;

        switch (field) {
            case 'nickname':
                Data.updateProfile({ nickname: value });
                this.render();
                break;
            case 'bio':
                Data.updateProfile({ bio: value });
                this.render();
                break;
            case 'myStatus':
                Data.updateProfile({ myStatus: value });
                this.renderStatusSection();
                break;
            case 'myStatusName':
                Data.updateProfile({ nickname: value });
                this.render();
                break;
            case 'otherStatus':
                Data.updatePeer({ currentStatus: value });
                document.getElementById('otherStatusText').textContent = value || '...';
                break;
            case 'otherStatusName':
                Data.updatePeer({ nickname: value });
                document.getElementById('otherStatusName').textContent = value;
                const chatPeerName = document.getElementById('chatPeerName');
                if (chatPeerName) chatPeerName.textContent = value;
                break;
            case 'countdownLabel':
                Data.updateProfile({ anniversaryLabel: value });
                document.getElementById('countdownLabel').textContent = value;
                break;
            case 'musicTitle':
                this.updateMusicInfo('title', value);
                break;
            case 'musicArtist':
                this.updateMusicInfo('artist', value);
                break;
            case 'homeQuote':
                Data.updateSettings({ homeQuote: value });
                const qEl = document.getElementById('homeQuote');
                if (qEl) qEl.textContent = value || 'So long as men can breathe or eyes can see, So long lives this, and this gives life to thee.';
                break;
        }
    },

    // ===== Avatar Change =====
    bindAvatarChange() {
        const avatarWrap = document.getElementById('profileAvatarWrap');
        const avatarFileInput = document.getElementById('avatarFileInput');

        avatarWrap.addEventListener('click', () => avatarFileInput.click());

        avatarFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
                Utils.toast('\u56FE\u7247\u4E0D\u80FD\u8D85\u8FC72MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                Data.updateSettings({ myAvatar: ev.target.result, myAvatarEmoji: '' });
                App.applyAvatarSettings();
                Utils.toast('\u5934\u50CF\u5DF2\u66F4\u65B0');
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        });
    },

    // ===== Status Avatar Change =====
    bindStatusAvatarChange() {
        const myStatusAvatar = document.getElementById('myStatusAvatar');
        const otherStatusAvatar = document.getElementById('otherStatusAvatar');
        const statusAvatarFileInput = document.getElementById('statusAvatarFileInput');

        function handleStatusAvatarClick(target) {
            Home._editingStatusAvatarTarget = target;
            statusAvatarFileInput.click();
        }

        myStatusAvatar.addEventListener('click', () => handleStatusAvatarClick('my'));
        otherStatusAvatar.addEventListener('click', () => handleStatusAvatarClick('other'));

        statusAvatarFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
                Utils.toast('\u56FE\u7247\u4E0D\u80FD\u8D85\u8FC72MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (Home._editingStatusAvatarTarget === 'my') {
                    Data.updateSettings({ myAvatar: ev.target.result, myAvatarEmoji: '' });
                } else {
                    Data.updateSettings({ otherAvatar: ev.target.result, otherAvatarEmoji: '' });
                }
                App.applyAvatarSettings();
                Utils.toast('\u5934\u50CF\u5DF2\u66F4\u65B0');
            };
            reader.readAsDataURL(file);
            e.target.value = '';
            Home._editingStatusAvatarTarget = null;
        });
    },

    // ===== Status Section =====
    renderStatusSection() {
        const peer = Data.getPeer();
        const profile = Data.getProfile();

        const peerName = document.getElementById('otherStatusName');
        if (peerName) peerName.textContent = peer.nickname || 'shimmer';

        const myName = document.getElementById('myStatusName');
        if (myName) myName.textContent = profile.nickname || 'sparkle';

        const otherStatus = document.getElementById('otherStatusText');
        if (otherStatus) otherStatus.textContent = peer.currentStatus || '...';

        const myStatus = document.getElementById('myStatusText');
        if (myStatus) myStatus.textContent = profile.myStatus || '\u5728\u7EBF';

        this.updateMyBattery();
        this.updateOtherBattery();
        this.updateMyWifi();
        this.updateOtherWifi();
    },

    ensurePeerStatus() {
        const peer = Data.getPeer();
        const now = Date.now();
        if (!peer.currentStatus || !peer.statusSetAt) {
            const status = Data.pickRandomStatus();
            Data.updatePeer({ currentStatus: status, statusSetAt: now });
        }
        const battery = Utils.randomInt(30, 95);
        const wifi = Utils.randomInt(30, 95);
        Data.updatePeer({ batteryLevel: battery, wifiLevel: wifi });
    },

    scheduleStatusChange() {
        if (this.statusTimer) clearTimeout(this.statusTimer);
        const interval = Utils.randomInt(60, 240) * 60 * 1000;
        this.statusTimer = setTimeout(() => {
            const status = Data.pickRandomStatus();
            if (status) {
                Data.updatePeer({ currentStatus: status, statusSetAt: Date.now() });
                const peer = Data.getPeer();
                const delta = Utils.randomInt(-15, 15);
                const newBattery = Math.max(10, Math.min(95, peer.batteryLevel + delta));
                const wifiDelta = Utils.randomInt(-10, 10);
                const newWifi = Math.max(10, Math.min(100, (peer.wifiLevel || 65) + wifiDelta));
                Data.updatePeer({ batteryLevel: newBattery, wifiLevel: newWifi });
                if (App.currentPage === 'home') {
                    this.renderStatusSection();
                }
            }
            this.scheduleStatusChange();
        }, interval);
    },

    updateMyBattery() {
        const fill = document.getElementById('myBatteryFill');
        if (!fill) return;
        if (navigator.getBattery) {
            navigator.getBattery().then(battery => {
                const level = Math.round(battery.level * 100);
                fill.setAttribute('width', Math.round(level * 0.18));
                this._setStatusColor(fill, level);
            }).catch(() => {
                fill.setAttribute('width', '15');
                fill.setAttribute('fill', 'var(--green)');
            });
        } else {
            fill.setAttribute('width', '15');
            fill.setAttribute('fill', 'var(--green)');
        }
    },

    updateOtherBattery() {
        const fill = document.getElementById('otherBatteryFill');
        if (!fill) return;
        const peer = Data.getPeer();
        const level = peer.batteryLevel || 60;
        fill.setAttribute('width', Math.round(level * 0.18));
        this._setStatusColor(fill, level);
    },

    _setStatusColor(el, level) {
        if (level > 60) el.setAttribute('fill', 'var(--green)');
        else if (level > 20) el.setAttribute('fill', 'var(--yellow)');
        else el.setAttribute('fill', 'var(--red)');
    },

    updateMyWifi() {
        const wifiEl = document.getElementById('myWifi');
        if (!wifiEl) return;
        let level = 75;
        if (navigator.connection) {
            const conn = navigator.connection;
            if (conn.downlink) level = Math.min(100, Math.round(conn.downlink * 10));
            if (conn.effectiveType === '4g') level = 90;
            else if (conn.effectiveType === '3g') level = 60;
            else if (conn.effectiveType === '2g') level = 30;
            else if (conn.effectiveType === 'slow-2g') level = 15;
        }
        this._setWifiDisplay(wifiEl, level);
    },

    updateOtherWifi() {
        const wifiEl = document.getElementById('otherWifi');
        if (!wifiEl) return;
        const peer = Data.getPeer();
        const level = peer.wifiLevel || 65;
        this._setWifiDisplay(wifiEl, level);
    },

    _setWifiDisplay(el, level) {
        const svg = el.querySelector('svg');
        if (!svg) return;
        if (level > 60) svg.style.color = 'var(--green)';
        else if (level > 20) svg.style.color = 'var(--yellow)';
        else svg.style.color = 'var(--red)';
        const paths = svg.querySelectorAll('path');
        if (level >= 80) { paths[3].style.opacity = '1'; paths[2].style.opacity = '1'; paths[1].style.opacity = '1'; }
        else if (level >= 50) { paths[3].style.opacity = '0.3'; paths[2].style.opacity = '1'; paths[1].style.opacity = '1'; }
        else if (level >= 25) { paths[3].style.opacity = '0.3'; paths[2].style.opacity = '0.3'; paths[1].style.opacity = '1'; }
        else { paths[3].style.opacity = '0.3'; paths[2].style.opacity = '0.3'; paths[1].style.opacity = '0.3'; }
        paths[0].style.opacity = '1';
    },

    // ===== Countdown Card =====
    bindCountdownEdit() {
        const numberEl = document.getElementById('countdownNumber');
        const labelEl = document.getElementById('countdownLabel');
        numberEl.addEventListener('dblclick', () => this.showCountdownModal());
        labelEl.addEventListener('dblclick', () => {
            const inlineInput = document.getElementById('inlineEditInput');
            const rect = labelEl.getBoundingClientRect();
            inlineInput.style.display = 'block';
            inlineInput.style.left = rect.left + 'px';
            inlineInput.style.top = rect.top + 'px';
            inlineInput.style.width = Math.max(rect.width, 80) + 'px';
            inlineInput.style.fontSize = getComputedStyle(labelEl).fontSize;
            inlineInput.value = (Data.getProfile().anniversaryLabel) || '';
            inlineInput.dataset.field = 'countdownLabel';
            inlineInput.focus();
            inlineInput.select();
        });
    },

    renderCountdown() {
        const profile = Data.getProfile();
        const numberEl = document.getElementById('countdownNumber');
        const labelEl = document.getElementById('countdownLabel');
        const subEl = document.getElementById('countdownSub');

        labelEl.textContent = profile.anniversaryLabel || '\u7EAA\u5FF5\u65E5';

        if (!profile.anniversaryDate) {
            numberEl.textContent = '--';
            subEl.textContent = '\u53CC\u51FB\u8BBE\u7F6E';
            return;
        }

        const targetDate = new Date(profile.anniversaryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = targetDate - today;
        const diffDays = Math.abs(Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        const type = profile.anniversaryType || 'countdown';
        const repeat = profile.anniversaryRepeat || 'none';

        if (type === 'countdown') {
            if (diffTime < 0) {
                numberEl.textContent = '-' + diffDays;
                subEl.textContent = '\u5929\u524D';
            } else {
                numberEl.textContent = diffDays;
                subEl.textContent = repeat === 'yearly' ? '\u6BCF\u5E74' : (repeat === 'monthly' ? '\u6BCF\u6708' : '\u5929');
            }
        } else {
            if (diffTime < 0) {
                numberEl.textContent = diffDays;
                subEl.textContent = '\u5929\u524D';
            } else {
                numberEl.textContent = diffDays;
                subEl.textContent = '\u5929\u540E';
            }
        }
    },

    showCountdownModal() {
        const profile = Data.getProfile();
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';

        const dateVal = profile.anniversaryDate || '';
        const typeVal = profile.anniversaryType || 'countdown';
        const repeatVal = profile.anniversaryRepeat || 'none';

        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">\u7EAA\u5FF5\u65E5\u8BBE\u7F6E</div>
                <div style="margin-bottom:12px">
                    <label style="font-size:13px;color:var(--text-secondary)">\u65E5\u671F</label>
                    <input type="date" id="anniDateInput" value="${dateVal}" style="width:100%;margin-top:4px;background:var(--bg-tertiary);border:none;border-radius:var(--radius);padding:10px 14px;color:var(--text-primary);font-size:14px;outline:none">
                </div>
                <div style="margin-bottom:12px">
                    <label style="font-size:13px;color:var(--text-secondary)">\u7C7B\u578B</label>
                    <div style="display:flex;gap:8px;margin-top:4px">
                        <button class="bubble-style-option ${typeVal === 'countdown' ? 'active' : ''}" id="anniTypeCountdown" style="font-size:13px">\u5012\u6570\u65E5</button>
                        <button class="bubble-style-option ${typeVal === 'countup' ? 'active' : ''}" id="anniTypeCountup" style="font-size:13px">\u6B63\u6570\u65E5</button>
                    </div>
                </div>
                <div style="margin-bottom:12px">
                    <label style="font-size:13px;color:var(--text-secondary)">\u91CD\u590D\u9891\u7387</label>
                    <div style="display:flex;gap:8px;margin-top:4px">
                        <button class="bubble-style-option ${repeatVal === 'none' ? 'active' : ''}" id="anniRepeatNone" style="font-size:13px">\u4E0D\u91CD\u590D</button>
                        <button class="bubble-style-option ${repeatVal === 'yearly' ? 'active' : ''}" id="anniRepeatYearly" style="font-size:13px">\u6BCF\u5E74</button>
                        <button class="bubble-style-option ${repeatVal === 'monthly' ? 'active' : ''}" id="anniRepeatMonthly" style="font-size:13px">\u6BCF\u6708</button>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" id="anniCancel">\u53D6\u6D88</button>
                    <button class="btn-danger btn-sm" id="anniClear" style="margin-right:auto">\u6E05\u9664</button>
                    <button class="btn-primary" id="anniConfirm">\u4FDD\u5B58</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        let newType = typeVal;
        let newRepeat = repeatVal;

        overlay.querySelector('#anniTypeCountdown').addEventListener('click', function() {
            newType = 'countdown';
            overlay.querySelectorAll('#anniTypeCountdown, #anniTypeCountup').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
        overlay.querySelector('#anniTypeCountup').addEventListener('click', function() {
            newType = 'countup';
            overlay.querySelectorAll('#anniTypeCountdown, #anniTypeCountup').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
        overlay.querySelector('#anniRepeatNone').addEventListener('click', function() {
            newRepeat = 'none';
            overlay.querySelectorAll('#anniRepeatNone, #anniRepeatYearly, #anniRepeatMonthly').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
        overlay.querySelector('#anniRepeatYearly').addEventListener('click', function() {
            newRepeat = 'yearly';
            overlay.querySelectorAll('#anniRepeatNone, #anniRepeatYearly, #anniRepeatMonthly').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
        overlay.querySelector('#anniRepeatMonthly').addEventListener('click', function() {
            newRepeat = 'monthly';
            overlay.querySelectorAll('#anniRepeatNone, #anniRepeatYearly, #anniRepeatMonthly').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });

        overlay.querySelector('#anniCancel').addEventListener('click', () => overlay.remove());
        overlay.querySelector('#anniClear').addEventListener('click', () => {
            Data.updateProfile({ anniversaryDate: null, anniversaryType: 'countdown', anniversaryRepeat: 'none' });
            this.renderCountdown();
            overlay.remove();
            Utils.toast('\u7EAA\u5FF5\u65E5\u5DF2\u6E05\u9664');
        });
        overlay.querySelector('#anniConfirm').addEventListener('click', () => {
            const dateVal = overlay.querySelector('#anniDateInput').value;
            Data.updateProfile({
                anniversaryDate: dateVal || null,
                anniversaryType: newType,
                anniversaryRepeat: newRepeat
            });
            this.renderCountdown();
            overlay.remove();
            Utils.toast('\u7EAA\u5FF5\u65E5\u5DF2\u4FDD\u5B58');
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    },

    // ===== Photo Wall =====
    renderPhotoWall() {
        const grid = document.getElementById('photoWallGrid');
        const addBtn = document.getElementById('photoWallAdd');
        const settings = Data.getSettings();
        const photos = settings.photoWall || [];

        if (photos.length === 0) {
            grid.innerHTML = '';
            // Show add button only when no photos
            addBtn.style.display = '';
            addBtn.innerHTML = `
                <label class="photo-wall-add-btn">+ \u6DFB\u52A0\u7167\u7247
                    <input type="file" accept="image/*" id="photoWallInput" style="display:none" multiple>
                </label>
            `;
            const photoInput = document.getElementById('photoWallInput');
            if (photoInput) {
                photoInput.addEventListener('change', (e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    let processed = 0;
                    const total = files.length;
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        if (file.size > 3 * 1024 * 1024) {
                            Utils.toast('\u56FE\u7247\u4E0D\u80FD\u8D85\u8FC73MB');
                            processed++;
                            continue;
                        }
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            const s = Data.getSettings();
                            if (!s.photoWall) s.photoWall = [];
                            s.photoWall.push({
                                dataUrl: ev.target.result,
                                addedAt: Date.now(),
                                date: ''
                            });
                            Data.updateSettings({ photoWall: s.photoWall });
                            processed++;
                            if (processed >= total) {
                                this.renderPhotoWall();
                                Utils.toast('\u5DF2\u6DFB\u52A0\u7167\u7247');
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                    e.target.value = '';
                });
            }
        } else {
            // Has photos: render photos, hide add button
            let html = '';
            photos.forEach((photo, i) => {
                const angle = Utils.randomInt(-12, 12);
                const customDate = photo.date || '';
                const displayDate = customDate || new Date(photo.addedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
                html += `
                    <div class="polaroid" style="transform: rotate(${angle}deg)">
                        <button class="polaroid-delete" data-photo-idx="${i}">\u00D7</button>
                        <img src="${photo.dataUrl}" alt="photo" loading="lazy">
                        <div class="polaroid-date" data-photo-idx="${i}" data-has-date="${customDate ? '1' : '0'}">${Utils.escapeHtml(displayDate)}</div>
                    </div>
                `;
            });
            grid.innerHTML = html;
            addBtn.style.display = 'none';
            addBtn.innerHTML = '';

            grid.querySelectorAll('.polaroid-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(btn.dataset.photoIdx);
                    const s = Data.getSettings();
                    s.photoWall.splice(idx, 1);
                    Data.updateSettings({ photoWall: s.photoWall });
                    this.renderPhotoWall();
                    Utils.toast('\u7167\u7247\u5DF2\u5220\u9664');
                });
            });

            grid.querySelectorAll('.polaroid-date').forEach(dateEl => {
                dateEl.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    this.editPhotoDate(dateEl);
                });
            });
        }
    },

    editPhotoDate(dateEl) {
        const idx = parseInt(dateEl.dataset.photoIdx);
        const inlineInput = document.getElementById('inlineEditInput');
        const rect = dateEl.getBoundingClientRect();

        // Remove previous listeners
        const oldHandler = inlineInput._photoDateHandler;
        if (oldHandler) {
            inlineInput.removeEventListener('keydown', oldHandler.keyHandler);
            inlineInput.removeEventListener('blur', oldHandler.blurHandler);
        }

        inlineInput.style.display = 'block';
        inlineInput.style.left = rect.left + 'px';
        inlineInput.style.top = rect.top + 'px';
        inlineInput.style.width = Math.max(rect.width, 100) + 'px';
        inlineInput.style.fontSize = '9px';
        inlineInput.value = dateEl.dataset.hasDate === '1' ? dateEl.textContent.trim() : '';
        inlineInput.dataset.field = 'photoDate';
        inlineInput.dataset.photoIdx = idx;
        inlineInput.focus();
        inlineInput.select();

        const commit = () => {
            const value = inlineInput.value.trim();
            const pidx = parseInt(inlineInput.dataset.photoIdx);
            const s = Data.getSettings();
            if (s.photoWall[pidx] !== undefined) {
                s.photoWall[pidx].date = value;
                Data.updateSettings({ photoWall: s.photoWall });
                this.renderPhotoWall();
            }
            inlineInput.style.display = 'none';
            inlineInput.removeEventListener('keydown', keyHandler);
            inlineInput.removeEventListener('blur', blurHandler);
        };

        const keyHandler = (e) => {
            if (e.key === 'Enter') commit();
            else if (e.key === 'Escape') {
                inlineInput.style.display = 'none';
                inlineInput.removeEventListener('keydown', keyHandler);
                inlineInput.removeEventListener('blur', blurHandler);
            }
        };

        const blurHandler = () => commit();

        inlineInput.addEventListener('keydown', keyHandler);
        inlineInput.addEventListener('blur', blurHandler);
        inlineInput._photoDateHandler = { keyHandler, blurHandler };
    },

    // ===== Music Player =====
    bindMusicPlayer() {
        const playBtn = document.getElementById('musicPlayBtn');
        const discWrap = document.getElementById('musicDiscWrap');
        const discImageInput = document.getElementById('discImageInput');
        const musicTitle = document.getElementById('musicTitle');
        const musicArtist = document.getElementById('musicArtist');

        // Double-click disc to upload image
        discWrap.addEventListener('dblclick', () => {
            discImageInput.click();
        });

        discImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
                Utils.toast('\u56FE\u7247\u4E0D\u80FD\u8D85\u8FC72MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                const s = Data.getSettings();
                s.musicPlayer.discImage = ev.target.result;
                Data.updateSettings({ musicPlayer: s.musicPlayer });
                this.renderMusicPlayer();
                Utils.toast('\u5531\u7247\u56FE\u7247\u5DF2\u66F4\u65B0');
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        });

        // Play/Pause
        playBtn.addEventListener('click', () => this.toggleMusic());

        // Double-click title
        musicTitle.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.showInlineEdit(musicTitle, 'musicTitle');
        });

        // Double-click artist
        musicArtist.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.showInlineEdit(musicArtist, 'musicArtist');
        });
    },

    updateMusicInfo(field, value) {
        const s = Data.getSettings();
        if (field === 'title') s.musicPlayer.title = value;
        else if (field === 'artist') s.musicPlayer.artist = value;
        Data.updateSettings({ musicPlayer: s.musicPlayer });
        this.renderMusicPlayer();
    },

    renderMusicPlayer() {
        const s = Data.getSettings();
        const mp = s.musicPlayer || {};
        const disc = document.getElementById('musicDisc');
        const titleEl = document.getElementById('musicTitle');
        const artistEl = document.getElementById('musicArtist');

        if (titleEl) titleEl.textContent = mp.title || 'glitter';
        if (artistEl) artistEl.textContent = mp.artist || '\u5F0B\u67AB';

        if (disc) {
            if (mp.discImage) {
                disc.style.backgroundImage = `url(${mp.discImage})`;
                disc.style.background = `url(${mp.discImage}) center/cover`;
            } else {
                disc.style.backgroundImage = '';
                disc.style.background = 'conic-gradient(from 0deg, #1a1a2e, #2d2d44, #1a1a2e, #2d2d44, #1a1a2e, #2d2d44, #1a1a2e, #2d2d44, #1a1a2e)';
            }
        }

        // Sync play state
        if (mp.isPlaying) {
            if (disc) disc.classList.add('spinning');
            const playIcon = document.getElementById('musicPlayIcon');
            const pauseIcon = document.getElementById('musicPauseIcon');
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = '';
        } else {
            if (disc) disc.classList.remove('spinning');
            const playIcon = document.getElementById('musicPlayIcon');
            const pauseIcon = document.getElementById('musicPauseIcon');
            if (playIcon) playIcon.style.display = '';
            if (pauseIcon) pauseIcon.style.display = 'none';
        }
    },

    toggleMusic() {
        const s = Data.getSettings();
        const mp = s.musicPlayer || {};

        if (!this.musicAudio) {
            this.musicAudio = new Audio();
            this.musicAudio.volume = 0.4;
            this.musicAudio.loop = true;
        }

        if (mp.isPlaying) {
            this.musicAudio.pause();
            mp.isPlaying = false;
        } else {
            const url = mp.audioUrl || 'https://videotourl.com/audio/1783941921708-3d60a063-2a43-4def-b80a-93d630a154e6.m4a';
            if (this.musicAudio.src !== url) {
                this.musicAudio.src = url;
            }
            this.musicAudio.play().catch(() => {
                Utils.toast('\u97F3\u4E50\u64AD\u653E\u5931\u8D25');
                return;
            });
            mp.isPlaying = true;
        }

        Data.updateSettings({ musicPlayer: mp });
        this.renderMusicPlayer();
    }
};
