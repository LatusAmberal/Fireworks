/* ===== Settings Page ===== */

const Settings = {
    currentTab: 'appearance',

    init() {},

    onShow() {
        this.renderTab(this.currentTab);
    },

    renderTab(tab) {
        this.currentTab = tab;
        const container = document.getElementById('settingsContainer');

        document.querySelectorAll('.settings-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });

        switch(tab) {
            case 'appearance': container.innerHTML = this.renderAppearance(); this.bindAppearance(); break;
            case 'text': container.innerHTML = this.renderText(); this.bindText(); break;
            case 'data': container.innerHTML = this.renderData(); this.bindData(); break;
            case 'sound': container.innerHTML = this.renderSound(); this.bindSound(); break;
            case 'notification': container.innerHTML = this.renderNotification(); this.bindNotification(); break;
        }
    },

    // ===== Appearance =====
    renderAppearance() {
        const s = Data.getSettings();
        const themes = [
            { id: 'dark', name: '\u6DF1\u8272', class: 'theme-dark', group: 'dark' },
            { id: 'light', name: '\u6D45\u8272', class: 'theme-light', group: 'light' },
            { id: 'ocean', name: '\u6D77\u6D0B', class: 'theme-ocean', group: 'dark' },
            { id: 'sunset', name: '\u5F69\u971E', class: 'theme-sunset', group: 'dark' },
            { id: 'forest', name: '\u68EE\u6797', class: 'theme-forest', group: 'dark' },
            { id: 'rust', name: '\u7EA2\u9508', class: 'theme-rust', group: 'dark' },
            { id: 'orange', name: '\u843D\u65E5', class: 'theme-orange', group: 'dark' },
            { id: 'ins-dark', name: '\u7C89\u5F69', class: 'theme-ins-dark', group: 'dark' },
            { id: 'monochrome', name: '\u6781\u7B80\u9ED1\u767D', class: 'theme-monochrome', group: 'light' },
            { id: 'morandi', name: '\u83AB\u5170\u8FEA', class: 'theme-morandi', group: 'light' },
            { id: 'matcha', name: '\u62B9\u8336', class: 'theme-matcha', group: 'light' },
            { id: 'sakura', name: '\u6A31\u82B1', class: 'theme-sakura', group: 'light' },
            { id: 'skyblue', name: '\u6D77\u98CE', class: 'theme-skyblue', group: 'light' },
            { id: 'paleyellow', name: '\u96CF\u83CA', class: 'theme-paleyellow', group: 'light' }
        ];

        const darkThemes = themes.filter(t => t.group === 'dark');
        const lightThemes = themes.filter(t => t.group === 'light');

        const emojis = ['\uD83C\uDF86','\uD83D\uDE0E','\uD83D\uDC31','\uD83E\uDD8A','\uD83D\uDC3C','\uD83E\uDD89','\uD83C\uDF3A','\u26A1','\uD83C\uDF19','\uD83D\uDD25','\uD83D\uDC8E','\uD83C\uDFA8','\uD83C\uDF08','\uD83D\uDE80','\uD83C\uDFAE','\uD83C\uDFA7'];

        const myAvatarPreview = s.myAvatar
            ? `<div class="avatar-thumbnail" style="background-image:url(${Utils.escapeAttr(s.myAvatar)})"></div>`
            : `<div class="avatar-thumbnail">${s.myAvatarEmoji || '\uD83D\uDE0E'}</div>`;

        const otherAvatarPreview = s.otherAvatar
            ? `<div class="avatar-thumbnail" style="background-image:url(${Utils.escapeAttr(s.otherAvatar)})"></div>`
            : `<div class="avatar-thumbnail">${s.otherAvatarEmoji || '\uD83D\uDE0A'}</div>`;

        const homeBgPreview = s.homeBackground
            ? '<span style="font-size:12px;color:var(--text-muted)">\u5DF2\u81EA\u5B9A\u4E49</span>'
            : '<span style="font-size:12px;color:var(--text-muted)">\u4F7F\u7528\u9ED8\u8BA4\u7EAF\u8272</span>';

        const cardBgPreview = s.cardBackground
            ? '<span style="font-size:12px;color:var(--text-muted)">\u5DF2\u81EA\u5B9A\u4E49</span>'
            : '<span style="font-size:12px;color:var(--text-muted)">\u4F7F\u7528\u9ED8\u8BA4\u7EAF\u8272</span>';

        const systemFollowing = s.theme === 'system' || false;

        return `
            <div class="setting-group">
                <div class="setting-group-title">\u4E3B\u9898\u914D\u8272</div>
                <div class="system-theme-option ${systemFollowing ? 'active' : ''}" id="systemThemeOption">
                    <span class="system-theme-icon">\uD83C\uDF19</span>
                    <div>
                        <div class="system-theme-label">\u8DDF\u968F\u7CFB\u7EDF</div>
                        <div class="system-theme-desc">\u81EA\u52A8\u5339\u914D\u6D45\u8272/\u6DF1\u8272\u6A21\u5F0F</div>
                    </div>
                </div>
                <div class="theme-section-label">\u6DF1\u8272\u7CFB\u5217</div>
                <div class="theme-picker">
                    ${darkThemes.map(t => `
                        <div class="theme-option ${t.class} ${s.theme === t.id ? 'active' : ''}" data-theme="${t.id}">
                            <span class="theme-name">${t.name}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="theme-section-label">\u6D45\u8272\u7CFB\u5217</div>
                <div class="theme-picker">
                    ${lightThemes.map(t => `
                        <div class="theme-option ${t.class} ${s.theme === t.id ? 'active' : ''}" data-theme="${t.id}">
                            <span class="theme-name">${t.name}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u6DB2\u6001\u73BB\u7483\u6548\u679C</div>
                        <div class="setting-desc">\u5361\u7247\u4F7F\u7528\u6BDB\u73BB\u7483\u900F\u660E\u6548\u679C</div>
                    </div>
                    <div class="toggle ${s.glassmorphism ? 'on' : ''}" id="glassToggle"></div>
                </div>
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u53CC\u65B9\u5934\u50CF</div>
                <div class="avatar-thumbnail-pair">
                    ${myAvatarPreview}
                    <span>&</span>
                    ${otherAvatarPreview}
                </div>
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u6211\u7684\u5934\u50CF</div>
                <div style="display:flex;flex-wrap:wrap;gap:10px;padding:14px 16px" id="myAvatarPicker">
                    ${emojis.map(e => `<div class="avatar-option ${s.myAvatarEmoji === e ? 'active' : ''}" data-emoji="${e}">${e}</div>`).join('')}
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u4E0A\u4F20\u81EA\u5B9A\u4E49\u5934\u50CF</div>
                        <div class="setting-desc">\u652F\u6301\u56FE\u7247\u6587\u4EF6</div>
                    </div>
                    <label class="file-btn">\u9009\u62E9\u56FE\u7247
                        <input type="file" accept="image/*" id="myAvatarFile" style="display:none">
                    </label>
                </div>
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u5BF9\u65B9\u5934\u50CF</div>
                <div style="display:flex;flex-wrap:wrap;gap:10px;padding:14px 16px" id="otherAvatarPicker">
                    ${emojis.map(e => `<div class="avatar-option ${s.otherAvatarEmoji === e ? 'active' : ''}" data-emoji="${e}">${e}</div>`).join('')}
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u4E0A\u4F20\u81EA\u5B9A\u4E49\u5934\u50CF</div>
                        <div class="setting-desc">\u652F\u6301\u56FE\u7247\u6587\u4EF6</div>
                    </div>
                    <label class="file-btn">\u9009\u62E9\u56FE\u7247
                        <input type="file" accept="image/*" id="otherAvatarFile" style="display:none">
                    </label>
                </div>
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u4E3B\u9875\u80CC\u666F</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u4E3B\u9875\u6574\u4F53\u80CC\u666F</div>
                        <div class="setting-desc">${homeBgPreview}</div>
                    </div>
                    <label class="file-btn">\u9009\u62E9\u56FE\u7247
                        <input type="file" accept="image/*" id="homeBgFile" style="display:none">
                    </label>
                </div>
                ${s.homeBackground ? `
                <div class="setting-item">
                    <div class="setting-label">\u5F53\u524D\u80CC\u666F</div>
                    <button class="btn-secondary btn-sm" id="resetHomeBg">\u91CD\u7F6E\u4E3A\u9ED8\u8BA4</button>
                </div>` : ''}
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u540D\u7247\u80CC\u666F</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u7528\u6237\u540D\u7247\u80CC\u666F</div>
                        <div class="setting-desc">${cardBgPreview}</div>
                    </div>
                    <label class="file-btn">\u9009\u62E9\u56FE\u7247
                        <input type="file" accept="image/*" id="cardBgFile" style="display:none">
                    </label>
                </div>
                ${s.cardBackground ? `
                <div class="setting-item">
                    <div class="setting-label">\u5F53\u524D\u80CC\u666F</div>
                    <button class="btn-secondary btn-sm" id="resetCardBg">\u91CD\u7F6E\u4E3A\u9ED8\u8BA4</button>
                </div>` : ''}
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u7167\u7247\u5899</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u7BA1\u7406\u7167\u7247</div>
                        <div class="setting-desc">${(s.photoWall||[]).length} \u5F20\u7167\u7247</div>
                    </div>
                    <label class="file-btn">\u4E0A\u4F20\u7167\u7247
                        <input type="file" accept="image/*" id="photoWallFileSettings" style="display:none" multiple>
                    </label>
                </div>
                ${(s.photoWall||[]).length > 0 ? `
                <div class="setting-item">
                    <button class="btn-danger btn-sm" id="clearPhotoWall">\u6E05\u9664\u6240\u6709\u7167\u7247</button>
                </div>` : ''}
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u81EA\u5B9A\u4E49\u5916\u89C2 CSS</div>
                <div style="padding:12px 16px">
                    <textarea class="css-textarea" id="customCSSInput" placeholder="\u8F93\u5165\u81EA\u5B9A\u4E49CSS\u4EE3\u7801...">${Utils.escapeHtml(s.customCSS || '')}</textarea>
                    <div style="display:flex;gap:8px;margin-top:8px">
                        <button class="btn-primary btn-sm" id="applyCSSBtn">\u5E94\u7528</button>
                        <button class="btn-secondary btn-sm" id="resetCSSBtn">\u6E05\u9664</button>
                    </div>
                </div>
            </div>
        `;
    },

    bindAppearance() {
        // System theme option
        const sysOpt = document.getElementById('systemThemeOption');
        if (sysOpt) {
            sysOpt.addEventListener('click', () => {
                Data.updateSettings({ theme: 'system' });
                App.applyTheme();
                // Update active states without full re-render
                document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
                sysOpt.classList.add('active');
            });
        }

        // Theme selection
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const theme = opt.dataset.theme;
                Data.updateSettings({ theme });
                App.applyTheme();
                document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
                document.querySelectorAll('.system-theme-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
            });
        });

        // Glassmorphism toggle
        document.getElementById('glassToggle').addEventListener('click', (e) => {
            const on = !e.target.classList.contains('on');
            e.target.classList.toggle('on', on);
            Data.updateSettings({ glassmorphism: on });
            App.applyGlassmorphism();
        });

        // My avatar emoji
        document.querySelectorAll('#myAvatarPicker .avatar-option').forEach(opt => {
            opt.addEventListener('click', () => {
                Data.updateSettings({ myAvatarEmoji: opt.dataset.emoji, myAvatar: '' });
                document.querySelectorAll('#myAvatarPicker .avatar-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                App.applyAvatarSettings();
                this.renderTab('appearance');
            });
        });

        // Other avatar emoji
        document.querySelectorAll('#otherAvatarPicker .avatar-option').forEach(opt => {
            opt.addEventListener('click', () => {
                Data.updateSettings({ otherAvatarEmoji: opt.dataset.emoji, otherAvatar: '' });
                document.querySelectorAll('#otherAvatarPicker .avatar-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                App.applyAvatarSettings();
                this.renderTab('appearance');
            });
        });

        // Avatar uploads
        this.bindImageUpload('myAvatarFile', (dataUrl) => {
            Data.updateSettings({ myAvatar: dataUrl, myAvatarEmoji: '' });
            document.querySelectorAll('#myAvatarPicker .avatar-option').forEach(o => o.classList.remove('active'));
            App.applyAvatarSettings();
            this.renderTab('appearance');
            Utils.toast('\u5934\u50CF\u5DF2\u66F4\u65B0');
        }, 256);

        this.bindImageUpload('otherAvatarFile', (dataUrl) => {
            Data.updateSettings({ otherAvatar: dataUrl, otherAvatarEmoji: '' });
            document.querySelectorAll('#otherAvatarPicker .avatar-option').forEach(o => o.classList.remove('active'));
            App.applyAvatarSettings();
            this.renderTab('appearance');
            Utils.toast('\u5934\u50CF\u5DF2\u66F4\u65B0');
        }, 256);

        // Home background upload
        this.bindImageUpload('homeBgFile', (dataUrl) => {
            Data.updateSettings({ homeBackground: dataUrl });
            App.applyAvatarSettings();
            this.renderTab('appearance');
            Utils.toast('\u80CC\u666F\u5DF2\u66F4\u65B0');
        }, 1920);

        // Card background upload
        this.bindImageUpload('cardBgFile', (dataUrl) => {
            Data.updateSettings({ cardBackground: dataUrl });
            App.applyAvatarSettings();
            this.renderTab('appearance');
            Utils.toast('\u540D\u7247\u80CC\u666F\u5DF2\u66F4\u65B0');
        }, 1920);

        const resetHomeBg = document.getElementById('resetHomeBg');
        if (resetHomeBg) {
            resetHomeBg.addEventListener('click', () => {
                Data.updateSettings({ homeBackground: '' });
                App.applyAvatarSettings();
                this.renderTab('appearance');
                Utils.toast('\u5DF2\u91CD\u7F6E\u4E3A\u9ED8\u8BA4\u80CC\u666F');
            });
        }

        const resetCardBg = document.getElementById('resetCardBg');
        if (resetCardBg) {
            resetCardBg.addEventListener('click', () => {
                Data.updateSettings({ cardBackground: '' });
                App.applyAvatarSettings();
                this.renderTab('appearance');
                Utils.toast('\u5DF2\u91CD\u7F6E\u4E3A\u9ED8\u8BA4\u540D\u7247\u80CC\u666F');
            });
        }

        // Photo wall
        const photoWallFile = document.getElementById('photoWallFileSettings');
        if (photoWallFile) {
            photoWallFile.addEventListener('change', async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                let processed = 0;
                const total = files.length;
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (file.size > 20 * 1024 * 1024) { processed++; continue; }
                    try {
                        const dataUrl = await Utils.compressImage(file, 1280, 0.75);
                        const s = Data.getSettings();
                        if (!s.photoWall) s.photoWall = [];
                        s.photoWall.push({ dataUrl: dataUrl, addedAt: Date.now(), date: '' });
                        Data.updateSettings({ photoWall: s.photoWall });
                    } catch (err) {
                        // skip failed image
                    }
                    processed++;
                    if (processed >= total) {
                        this.renderTab('appearance');
                        if (App.currentPage === 'home') Home.renderPhotoWall();
                        Utils.toast('\u5DF2\u6DFB\u52A0\u7167\u7247');
                    }
                }
                e.target.value = '';
            });
        }

        const clearPhotoWall = document.getElementById('clearPhotoWall');
        if (clearPhotoWall) {
            clearPhotoWall.addEventListener('click', () => {
                this.showConfirm('\u6E05\u9664\u7167\u7247', '\u786E\u5B9A\u6E05\u9664\u6240\u6709\u7167\u7247\u5899\u7167\u7247\u5417\uFF1F', () => {
                    Data.updateSettings({ photoWall: [] });
                    this.renderTab('appearance');
                    if (App.currentPage === 'home') Home.renderPhotoWall();
                    Utils.toast('\u7167\u7247\u5DF2\u6E05\u9664');
                });
            });
        }

        // Custom CSS
        document.getElementById('applyCSSBtn').addEventListener('click', () => {
            const css = document.getElementById('customCSSInput').value;
            Data.updateSettings({ customCSS: css });
            App.applyCustomCSS();
            Utils.toast('CSS\u5DF2\u5E94\u7528');
        });
        document.getElementById('resetCSSBtn').addEventListener('click', () => {
            document.getElementById('customCSSInput').value = '';
            Data.updateSettings({ customCSS: '' });
            App.applyCustomCSS();
            Utils.toast('CSS\u5DF2\u6E05\u9664');
        });
    },

    bindImageUpload(inputId, callback, maxWidth = 1920) {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 10 * 1024 * 1024) {
                Utils.toast('\u56FE\u7247\u4E0D\u80FD\u8D85\u8FC710MB');
                return;
            }
            try {
                const dataUrl = await Utils.compressImage(file, maxWidth, 0.75);
                callback(dataUrl);
            } catch (err) {
                Utils.toast('\u56FE\u7247\u52A0\u8F7D\u5931\u8D25');
            }
        });
    },

    // ===== Text (文字外观) =====
    renderText() {
        const profile = Data.getProfile();
        const peer = Data.getPeer();
        const s = Data.getSettings();
        const mp = s.musicPlayer || {};
        return `
            <div class="setting-group">
                <div class="setting-group-title">\u4E3B\u9875\u6587\u5B57</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u6635\u79F0</div>
                        <div class="setting-desc">\u4E3B\u9875\u663E\u793A\u7684\u7528\u6237\u540D\u79F0</div>
                    </div>
                    <div style="text-align:right">
                        <input type="text" id="textNickname" value="${Utils.escapeAttr(profile.nickname)}" style="background:var(--bg-tertiary);border:none;border-radius:8px;padding:8px 12px;color:var(--text-primary);outline:none;font-size:14px;text-align:right;width:130px">
                    </div>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u4E2A\u6027\u7B7E\u540D</div>
                        <div class="setting-desc">\u4E3B\u9875\u540D\u7247\u4E0A\u7684\u4E2A\u6027\u7B7E\u540D</div>
                    </div>
                    <input type="text" id="textBio" value="${Utils.escapeAttr(profile.bio)}" style="background:var(--bg-tertiary);border:none;border-radius:8px;padding:8px 12px;color:var(--text-primary);outline:none;font-size:14px;text-align:right;width:180px">
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u7EAA\u5FF5\u65E5\u6807\u9898</div>
                        <div class="setting-desc">\u7EAA\u5FF5\u65E5\u5361\u7247\u4E0A\u65B9\u7684\u6807\u9898\u6587\u5B57</div>
                    </div>
                    <input type="text" id="textAnniversaryLabel" value="${Utils.escapeAttr(profile.anniversaryLabel || '')}" placeholder="\u7EAA\u5FF5\u65E5" style="background:var(--bg-tertiary);border:none;border-radius:8px;padding:8px 12px;color:var(--text-primary);outline:none;font-size:14px;text-align:right;width:130px">
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u81EA\u5DF1\u72B6\u6001\u6587\u5B57</div>
                        <div class="setting-desc">\u72B6\u6001\u680F\u81EA\u5DF1\u7684\u5728\u7EBF\u72B6\u6001</div>
                    </div>
                    <input type="text" id="textMyStatus" value="${Utils.escapeAttr(profile.myStatus || '\u5728\u7EBF')}" style="background:var(--bg-tertiary);border:none;border-radius:8px;padding:8px 12px;color:var(--text-primary);outline:none;font-size:14px;text-align:right;width:130px">
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u52B1\u5FD7\u8BED\u5F55</div>
                        <div class="setting-desc">\u540D\u7247\u4E0A\u65B9\u663E\u793A\u7684\u82F1\u8BED\u8BED\u5F55\uFF0C\u53CC\u51FB\u53EF\u5728\u4E3B\u9875\u7F16\u8F91</div>
                    </div>
                    <input type="text" id="textHomeQuote" value="${Utils.escapeAttr(s.homeQuote || '')}" placeholder="\u8F93\u5165\u82F1\u8BED\u8BED\u5F55" style="background:var(--bg-tertiary);border:none;border-radius:8px;padding:8px 12px;color:var(--text-primary);outline:none;font-size:13px;text-align:right;width:180px">
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u4F4D\u7F6E</div>
                        <div class="setting-desc">\u540D\u7247\u53F3\u4E0B\u89D2\u88C5\u9970\u6587\u5B57\uFF0C\u53CC\u51FB\u53EF\u5728\u4E3B\u9875\u7F16\u8F91</div>
                    </div>
                    <input type="text" id="textHomeLocation" value="${Utils.escapeAttr(profile.location || '')}" placeholder="\u5982\uFF1AShanghai" style="background:var(--bg-tertiary);border:none;border-radius:8px;padding:8px 12px;color:var(--text-primary);outline:none;font-size:13px;text-align:right;width:130px">
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u5929\u6C14</div>
                        <div class="setting-desc">\u540D\u7247\u53F3\u4E0B\u89D2\u88C5\u9970\u6587\u5B57\uFF0C\u53CC\u51FB\u53EF\u5728\u4E3B\u9875\u7F16\u8F91</div>
                    </div>
                    <input type="text" id="textHomeWeather" value="${Utils.escapeAttr(profile.weather || '')}" placeholder="\u5982\uFF1ASunny 25\u00B0C" style="background:var(--bg-tertiary);border:none;border-radius:8px;padding:8px 12px;color:var(--text-primary);outline:none;font-size:13px;text-align:right;width:130px">
                </div>
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u5BF9\u65B9\u6587\u5B57</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u5BF9\u65B9\u6635\u79F0</div>
                        <div class="setting-desc">\u5BF9\u65B9\u7684\u663E\u793A\u540D\u79F0</div>
                    </div>
                    <input type="text" id="textPeerNickname" value="${Utils.escapeAttr(peer.nickname)}" style="background:var(--bg-tertiary);border:none;border-radius:8px;padding:8px 12px;color:var(--text-primary);outline:none;font-size:14px;text-align:right;width:130px">
                </div>
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u97F3\u4E50\u64AD\u653E\u5668\u6587\u5B57</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u6B4C\u66F2\u6807\u9898</div>
                    </div>
                    <input type="text" id="textMusicTitle" value="${Utils.escapeAttr(mp.title || 'glitter')}" style="background:var(--bg-tertiary);border:none;border-radius:8px;padding:8px 12px;color:var(--text-primary);outline:none;font-size:14px;text-align:right;width:150px">
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u6B4C\u66F2\u4F5C\u8005</div>
                    </div>
                    <input type="text" id="textMusicArtist" value="${Utils.escapeAttr(mp.artist || '\u5F0B\u67AB')}" style="background:var(--bg-tertiary);border:none;border-radius:8px;padding:8px 12px;color:var(--text-primary);outline:none;font-size:14px;text-align:right;width:150px">
                </div>
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u5F00\u573A\u52A8\u753B\u6587\u5B57</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u52A8\u753B\u6807\u9898</div>
                        <div class="setting-desc">\u5F00\u573A\u52A8\u753B\u4E2D\u592E\u663E\u793A\u7684\u5927\u6807\u9898</div>
                    </div>
                    <input type="text" id="textSplashTitle" value="${Utils.escapeAttr(s.splashTitle || 'Sonnet')}" style="background:var(--bg-tertiary);border:none;border-radius:8px;padding:8px 12px;color:var(--text-primary);outline:none;font-size:14px;text-align:right;width:150px">
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u52A8\u753B\u526F\u6807\u9898</div>
                        <div class="setting-desc">\u6807\u9898\u4E0B\u65B9\u7684\u5C0F\u5B57\uFF0C\u652F\u6301\u6362\u884C</div>
                    </div>
                    <textarea id="textSplashSubtitle" style="background:var(--bg-tertiary);border:none;border-radius:8px;padding:8px 12px;color:var(--text-primary);outline:none;font-size:13px;width:180px;min-height:50px;resize:vertical;text-align:right">${Utils.escapeHtml(s.splashSubtitle || 'Shall I compare thee to a summer\'s day?\nThou art more lovely and more temperate.')}</textarea>
                </div>
            </div>

        `;
    },

    bindText() {
        const textFields = {
            'textNickname': { fn: (v) => Data.updateProfile({ nickname: v }) },
            'textBio': { fn: (v) => Data.updateProfile({ bio: v }) },
            'textAnniversaryLabel': { fn: (v) => Data.updateProfile({ anniversaryLabel: v }) },
            'textMyStatus': { fn: (v) => Data.updateProfile({ myStatus: v }) },
            'textHomeQuote': { fn: (v) => Data.updateSettings({ homeQuote: v }) },
            'textHomeLocation': { fn: (v) => Data.updateProfile({ location: v }) },
            'textHomeWeather': { fn: (v) => Data.updateProfile({ weather: v }) },
            'textPeerNickname': { fn: (v) => Data.updatePeer({ nickname: v }) },
            'textMusicTitle': {
                fn: (v) => {
                    const s = Data.getSettings();
                    if (!s.musicPlayer) s.musicPlayer = {};
                    s.musicPlayer.title = v;
                    Data.updateSettings({ musicPlayer: s.musicPlayer });
                }
            },
            'textMusicArtist': {
                fn: (v) => {
                    const s = Data.getSettings();
                    if (!s.musicPlayer) s.musicPlayer = {};
                    s.musicPlayer.artist = v;
                    Data.updateSettings({ musicPlayer: s.musicPlayer });
                }
            },
            'textSplashTitle': { fn: (v) => Data.updateSettings({ splashTitle: v }) },
            'textSplashSubtitle': { fn: (v) => Data.updateSettings({ splashSubtitle: v }) }
        };

        Object.entries(textFields).forEach(([id, config]) => {
            const el = document.getElementById(id);
            if (!el) return;

            // Debounced input event for real-time saving
            let debounceTimer = null;
            el.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    if (config.fn) config.fn(el.value);
                    if (App.currentPage === 'home') {
                        Home.render();
                        Home.renderMusicPlayer();
                        Home.renderCountdown();
                    }
                }, 500);
            });

            // Change event for immediate save on blur
            el.addEventListener('change', () => {
                clearTimeout(debounceTimer);
                if (config.fn) config.fn(el.value);
                if (App.currentPage === 'home') {
                    Home.render();
                    Home.renderMusicPlayer();
                    Home.renderCountdown();
                }
            });
        });
    },

    // ===== Data =====
    renderData() {
        const stats = Data.getDataStats();
        const messages = Data.getMessages();
        const cards = Data.getCards();
        const s = Data.getSettings();
        const photoCount = (s.photoWall || []).length;

        return `
            <div class="setting-group">
                <div class="setting-group-title">\u6570\u636E\u5360\u7528\u7EDF\u8BA1</div>
                <div class="data-stats-grid">
                    <div class="data-stat-card">
                        <div class="data-stat-icon">\u2699</div>
                        <div class="data-stat-value">${Utils.formatBytes(stats.settingsSize)}</div>
                        <div class="data-stat-label">\u8BBE\u7F6E\u4E0E\u914D\u7F6E</div>
                    </div>
                    <div class="data-stat-card">
                        <div class="data-stat-icon">\uD83D\uDCC7</div>
                        <div class="data-stat-value">${Utils.formatBytes(stats.cardsSize)}</div>
                        <div class="data-stat-label">\u5B57\u5361\u5185\u5BB9</div>
                    </div>
                    <div class="data-stat-card">
                        <div class="data-stat-icon">\uD83D\uDDBC</div>
                        <div class="data-stat-value">${Utils.formatBytes(stats.mediaSize)}</div>
                        <div class="data-stat-label">\u56FE\u7247/\u97F3\u9891</div>
                    </div>
                    <div class="data-stat-card">
                        <div class="data-stat-icon">\uD83D\uDCAC</div>
                        <div class="data-stat-value">${Utils.formatBytes(stats.msgSize)}</div>
                        <div class="data-stat-label">\u804A\u5929\u8BB0\u5F55</div>
                    </div>
                </div>
                <div class="data-stats-total">
                    <span>\u603B\u8BA1\u5360\u7528</span>
                    <strong>${Utils.formatBytes(stats.total)}</strong>
                </div>
                <div class="stat-row" style="padding:0 16px 12px">
                    <div class="stat-card" style="flex:1;padding:12px;text-align:center;margin-bottom:0">
                        <div class="stat-card-title">\u804A\u5929\u8BB0\u5F55</div>
                        <div class="stat-card-value" style="font-size:22px">${messages.length}<span class="unit">\u6761</span></div>
                    </div>
                    <div class="stat-card" style="flex:1;padding:12px;text-align:center;margin-bottom:0">
                        <div class="stat-card-title">\u5B57\u5361\u603B\u6570</div>
                        <div class="stat-card-value" style="font-size:22px">${cards.length}<span class="unit">\u5F20</span></div>
                    </div>
                </div>
                <div class="stat-row" style="padding:0 16px 12px">
                    <div class="stat-card" style="flex:1;padding:12px;text-align:center;margin-bottom:0">
                        <div class="stat-card-title">\u7167\u7247\u5899</div>
                        <div class="stat-card-value" style="font-size:22px">${photoCount}<span class="unit">\u5F20</span></div>
                    </div>
                    <div class="stat-card" style="flex:1;padding:12px;text-align:center;margin-bottom:0">
                        <div class="stat-card-title">Emoji \u5361</div>
                        <div class="stat-card-value" style="font-size:22px">${(Data.getEmojiCards()||[]).length}<span class="unit">\u5F20</span></div>
                    </div>
                </div>
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u6570\u636E\u7BA1\u7406</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u5BFC\u51FA\u5168\u90E8\u6570\u636E</div>
                        <div class="setting-desc">\u5BFC\u51FA\u6240\u6709\u6570\u636E\u4E3AJSON\u6587\u4EF6</div>
                    </div>
                    <button class="btn-primary btn-sm" id="exportDataBtn">\u5BFC\u51FA</button>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u5BFC\u5165\u6570\u636E</div>
                        <div class="setting-desc">\u4ECEJSON\u6587\u4EF6\u6062\u590D\u6570\u636E</div>
                    </div>
                    <label class="file-btn">\u9009\u62E9\u6587\u4EF6
                        <input type="file" accept=".json" id="importDataFile" style="display:none">
                    </label>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u5BFC\u51FA\u5916\u89C2\u6570\u636E</div>
                        <div class="setting-desc">\u4EC5\u5BFC\u51FA\u4E3B\u9898\u3001\u80CC\u666F\u3001\u5934\u50CF\u7B49\u5916\u89C2\u8BBE\u7F6E</div>
                    </div>
                    <button class="btn-secondary btn-sm" id="exportAppearanceBtn">\u5BFC\u51FA</button>
                </div>
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u804A\u5929\u6570\u636E</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u5BFC\u51FA\u804A\u5929\u8BB0\u5F55</div>
                        <div class="setting-desc">\u4EC5\u5BFC\u51FA\u804A\u5929\u6D88\u606F\u548C\u5BF9\u65B9\u4FE1\u606F</div>
                    </div>
                    <button class="btn-secondary btn-sm" id="exportChatBtn">\u5BFC\u51FA</button>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u6E05\u9664\u804A\u5929\u8BB0\u5F55</div>
                        <div class="setting-desc">\u5220\u9664\u6240\u6709\u804A\u5929\u6D88\u606F</div>
                    </div>
                    <button class="btn-danger btn-sm" id="clearChatBtn">\u6E05\u9664</button>
                </div>
            </div>

            <div class="setting-group danger-zone">
                <div class="setting-group-title">\u5371\u9669\u533A\u57DF</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label" style="color:var(--red)">\u6E05\u9664\u5168\u90E8\u6570\u636E</div>
                        <div class="setting-desc">\u5220\u9664\u6240\u6709\u6570\u636E\uFF0C\u5305\u62EC\u5B57\u5361\u3001\u804A\u5929\u3001\u8BBE\u7F6E\uFF0C\u6062\u590D\u51FA\u5382\u72B6\u6001</div>
                    </div>
                    <button class="danger-btn" id="clearAllBtn">\u6E05\u9664\u5168\u90E8</button>
                </div>
            </div>
        `;
    },

    bindData() {
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            const json = Data.exportData();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fireworks_backup_${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            Utils.toast('\u6570\u636E\u5DF2\u5BFC\u51FA');
        });

        document.getElementById('importDataFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (Data.importData(ev.target.result)) {
                    App.applyTheme();
                    App.applyGlassmorphism();
                    App.applyBubbleStyle();
                    App.applyChatBackground();
                    App.applyCustomCSS();
                    App.applyAvatarSettings();
                    this.renderTab('data');
                    Utils.toast('\u6570\u636E\u5BFC\u5165\u6210\u529F');
                } else {
                    Utils.toast('\u5BFC\u5165\u5931\u8D25\uFF0C\u6587\u4EF6\u683C\u5F0F\u4E0D\u6B63\u786E');
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });

        document.getElementById('exportChatBtn').addEventListener('click', () => {
            const json = Data.exportChatData();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fireworks_chat_${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            Utils.toast('\u804A\u5929\u8BB0\u5F55\u5DF2\u5BFC\u51FA');
        });

        document.getElementById('exportAppearanceBtn').addEventListener('click', () => {
            const json = Data.exportAppearanceData();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fireworks_appearance_${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            Utils.toast('\u5916\u89C2\u6570\u636E\u5DF2\u5BFC\u51FA');
        });

        document.getElementById('clearChatBtn').addEventListener('click', () => {
            this.showConfirm('\u6E05\u9664\u804A\u5929\u8BB0\u5F55', '\u786E\u5B9A\u6E05\u9664\u6240\u6709\u804A\u5929\u8BB0\u5F55\u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002', () => {
                Data.clearMessages();
                Data.data.firstChatDate = null;
                Data.save();
                if (App.currentPage === 'chat') Chat.renderAllMessages();
                Utils.toast('\u804A\u5929\u8BB0\u5F55\u5DF2\u6E05\u9664');
            });
        });

        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.showConfirm('\u6E05\u9664\u5168\u90E8\u6570\u636E', '\u8B66\u544A\uFF1A\u8FD9\u5C06\u5220\u9664\u6240\u6709\u6570\u636E\uFF0C\u5305\u62EC\u5B57\u5361\u3001\u804A\u5929\u8BB0\u5F55\u548C\u8BBE\u7F6E\uFF0C\u6062\u590D\u5230\u521D\u59CB\u72B6\u6001\u3002\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF01', () => {
                Data.clearAll();
                App.applyTheme();
                App.applyGlassmorphism();
                App.applyBubbleStyle();
                App.applyChatBackground();
                App.applyCustomCSS();
                App.applyAvatarSettings();
                if (App.currentPage === 'home') Home.render();
                this.renderTab('data');
                Utils.toast('\u6240\u6709\u6570\u636E\u5DF2\u6E05\u9664');
            });
        });
    },

    // ===== Sound =====
    renderSound() {
        const s = Data.getSettings();
        const sounds = [
            { id: 'pop', name: '\u6C14\u6CE1\u97F3' },
            { id: 'bell', name: '\u94C3\u58F0' },
            { id: 'bubble', name: '\u6C34\u6CE1\u97F3' }
        ];

        const customSounds = s.customSounds || [];
        const allSounds = [...sounds, ...customSounds.map(cs => ({ id: cs.id, name: cs.name }))];

        let customSoundList = '';
        if (customSounds.length > 0) {
            customSoundList = '<div style="padding:8px 16px">';
            customSounds.forEach((cs, i) => {
                customSoundList += `
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(128,128,128,0.08)">
                        <span style="font-size:13px;color:var(--text-secondary)">${Utils.escapeHtml(cs.name)}</span>
                        <div style="display:flex;gap:8px;align-items:center">
                            <button class="btn-secondary btn-sm test-custom-sound" data-sound-id="${cs.id}">\u8BD5\u542C</button>
                            <button class="btn-danger btn-sm delete-custom-sound" data-sound-idx="${i}">\u5220\u9664</button>
                        </div>
                    </div>
                `;
            });
            customSoundList += '</div>';
        }

        const sendType = s.sendSoundType || s.soundType || 'pop';
        const recvType = s.receiveSoundType || s.soundType || 'pop';

        return `
            <div class="setting-group">
                <div class="setting-group-title">\u97F3\u6548\u8BBE\u7F6E</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u542F\u7528\u97F3\u6548</div>
                        <div class="setting-desc">\u53D1\u9001\u548C\u63A5\u6536\u6D88\u606F\u65F6\u7684\u63D0\u793A\u97F3</div>
                    </div>
                    <div class="toggle ${s.sound ? 'on' : ''}" id="soundToggle"></div>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u53D1\u9001\u97F3\u6548\u7C7B\u578B</div>
                        <div class="setting-desc">\u6211\u53D1\u9001\u6D88\u606F\u65F6\u7684\u63D0\u793A\u97F3</div>
                    </div>
                    <div style="width:110px;flex-shrink:0">
                        <select class="beautified-select" id="sendSoundTypeSelect" style="width:110px">
                            ${allSounds.map(sd => `<option value="${sd.id}" ${sendType === sd.id ? 'selected' : ''}>${Utils.escapeHtml(sd.name)}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u63A5\u6536\u97F3\u6548\u7C7B\u578B</div>
                        <div class="setting-desc">\u5BF9\u65B9\u53D1\u9001\u6D88\u606F\u65F6\u7684\u63D0\u793A\u97F3</div>
                    </div>
                    <div style="width:110px;flex-shrink:0">
                        <select class="beautified-select" id="receiveSoundTypeSelect" style="width:110px">
                            ${allSounds.map(sd => `<option value="${sd.id}" ${recvType === sd.id ? 'selected' : ''}>${Utils.escapeHtml(sd.name)}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u53D1\u9001\u97F3\u6548</div>
                    </div>
                    <div class="toggle ${s.sendSound ? 'on' : ''}" id="sendSoundToggle"></div>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u63A5\u6536\u97F3\u6548</div>
                    </div>
                    <div class="toggle ${s.receiveSound ? 'on' : ''}" id="receiveSoundToggle"></div>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u8BD5\u542C\u97F3\u6548</div>
                    </div>
                    <div style="display:flex;gap:8px">
                        <button class="btn-secondary btn-sm" id="testSendSound">\u53D1\u9001\u97F3</button>
                        <button class="btn-secondary btn-sm" id="testReceiveSound">\u63A5\u6536\u97F3</button>
                    </div>
                </div>
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u81EA\u5B9A\u4E49\u97F3\u6548</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u4E0A\u4F20\u53D1\u9001\u97F3\u6548</div>
                        <div class="setting-desc">\u652F\u6301 WAV/MP3/OGG \u683C\u5F0F\uFF0C\u22641MB</div>
                    </div>
                    <label class="file-btn">\u9009\u62E9\u6587\u4EF6
                        <input type="file" accept="audio/*" id="customSendSoundFile" style="display:none">
                    </label>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u4E0A\u4F20\u63A5\u6536\u97F3\u6548</div>
                        <div class="setting-desc">\u652F\u6301 WAV/MP3/OGG \u683C\u5F0F\uFF0C\u22641MB</div>
                    </div>
                    <label class="file-btn">\u9009\u62E9\u6587\u4EF6
                        <input type="file" accept="audio/*" id="customRecvSoundFile" style="display:none">
                    </label>
                </div>
                ${customSoundList}
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u4E3B\u9875\u97F3\u4E50\u64AD\u653E\u5668</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u97F3\u4E50 URL</div>
                        <div class="setting-desc">\u4E3B\u9875\u97F3\u4E50\u64AD\u653E\u5668\u7684\u97F3\u9891\u94FE\u63A5</div>
                    </div>
                    <input type="text" id="musicUrlInput" value="${Utils.escapeAttr((s.musicPlayer||{}).audioUrl || '')}" placeholder="\u8F93\u5165\u97F3\u4E50URL" style="background:var(--bg-tertiary);border:none;border-radius:8px;padding:8px 12px;color:var(--text-primary);outline:none;font-size:13px;text-align:right;width:180px">
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u5531\u7247\u56FE\u7247</div>
                        <div class="setting-desc">${(s.musicPlayer||{}).discImage ? '\u5DF2\u81EA\u5B9A\u4E49' : '\u4F7F\u7528\u9ED8\u8BA4'}</div>
                    </div>
                    <label class="file-btn">\u9009\u62E9\u56FE\u7247
                        <input type="file" accept="image/*" id="musicDiscFile" style="display:none">
                    </label>
                </div>
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u540E\u53F0\u4FDD\u6D3B</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u4FDD\u6D3B\u97F3\u9891</div>
                        <div class="setting-desc">\u64AD\u653E\u9759\u97F3\u97F3\u9891\uFF0C\u9632\u6B62\u6D4F\u89C8\u5668\u6302\u8D77\u540E\u53F0\u6807\u7B7E\u9875\uFF08\u4FDD\u6301\u6D88\u606F\u56DE\u590D\u6B63\u5E38\u8FD0\u884C\uFF09</div>
                    </div>
                    <div class="toggle ${s.keepAliveAudio ? 'on' : ''}" id="keepAliveToggle"></div>
                </div>
            </div>
        `;
    },

    bindSound() {
        document.getElementById('soundToggle').addEventListener('click', (e) => {
            const on = !e.target.classList.contains('on');
            e.target.classList.toggle('on', on);
            Data.updateSettings({ sound: on });
        });

        document.getElementById('sendSoundTypeSelect').addEventListener('change', (e) => {
            Data.updateSettings({ sendSoundType: e.target.value });
            const s = Data.getSettings();
            const customSounds = s.customSounds || [];
            const isCustom = customSounds.find(cs => cs.id === e.target.value);
            if (isCustom) {
                this._playCustomSoundPreview(isCustom.dataUrl);
            } else {
                Utils.playSound('send', true);
            }
        });

        document.getElementById('receiveSoundTypeSelect').addEventListener('change', (e) => {
            Data.updateSettings({ receiveSoundType: e.target.value });
            const s = Data.getSettings();
            const customSounds = s.customSounds || [];
            const isCustom = customSounds.find(cs => cs.id === e.target.value);
            if (isCustom) {
                this._playCustomSoundPreview(isCustom.dataUrl);
            } else {
                Utils.playSound('receive', true);
            }
        });

        document.getElementById('sendSoundToggle').addEventListener('click', (e) => {
            const on = !e.target.classList.contains('on');
            e.target.classList.toggle('on', on);
            Data.updateSettings({ sendSound: on });
        });

        document.getElementById('receiveSoundToggle').addEventListener('click', (e) => {
            const on = !e.target.classList.contains('on');
            e.target.classList.toggle('on', on);
            Data.updateSettings({ receiveSound: on });
        });

        document.getElementById('testSendSound').addEventListener('click', () => {
            Utils.playSound('send', true);
        });

        document.getElementById('testReceiveSound').addEventListener('click', () => {
            Utils.playSound('receive', true);
        });

        const csSendFile = document.getElementById('customSendSoundFile');
        this._bindCustomSoundUpload(csSendFile, 'send');

        const csRecvFile = document.getElementById('customRecvSoundFile');
        this._bindCustomSoundUpload(csRecvFile, 'receive');

        document.querySelectorAll('.test-custom-sound').forEach(btn => {
            btn.addEventListener('click', () => {
                const soundId = btn.dataset.soundId;
                const s = Data.getSettings();
                const cs = (s.customSounds || []).find(c => c.id === soundId);
                if (cs) this._playCustomSoundPreview(cs.dataUrl);
            });
        });

        document.querySelectorAll('.delete-custom-sound').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.soundIdx);
                const s = Data.getSettings();
                const removed = s.customSounds[idx];
                s.customSounds.splice(idx, 1);
                if (s.sendSoundType === removed.id) s.sendSoundType = 'pop';
                if (s.receiveSoundType === removed.id) s.receiveSoundType = 'pop';
                if (s.soundType === removed.id) s.soundType = 'pop';
                Data.updateSettings({
                    customSounds: s.customSounds,
                    sendSoundType: s.sendSoundType,
                    receiveSoundType: s.receiveSoundType,
                    soundType: s.soundType
                });
                this.renderTab('sound');
                Utils.toast('\u81EA\u5B9A\u4E49\u97F3\u6548\u5DF2\u5220\u9664');
            });
        });

        // Music URL
        document.getElementById('musicUrlInput').addEventListener('change', (e) => {
            const s = Data.getSettings();
            if (!s.musicPlayer) s.musicPlayer = {};
            s.musicPlayer.audioUrl = e.target.value;
            Data.updateSettings({ musicPlayer: s.musicPlayer });
            Utils.toast('\u97F3\u4E50\u94FE\u63A5\u5DF2\u4FDD\u5B58');
        });

        // Music disc image
        this.bindImageUpload('musicDiscFile', (dataUrl) => {
            const s = Data.getSettings();
            if (!s.musicPlayer) s.musicPlayer = {};
            s.musicPlayer.discImage = dataUrl;
            Data.updateSettings({ musicPlayer: s.musicPlayer });
            this.renderTab('sound');
            if (App.currentPage === 'home') Home.renderMusicPlayer();
            Utils.toast('\u5531\u7247\u56FE\u7247\u5DF2\u66F4\u65B0');
        }, 512);

        // Keep-alive audio toggle
        document.getElementById('keepAliveToggle').addEventListener('click', (e) => {
            const on = !e.target.classList.contains('on');
            e.target.classList.toggle('on', on);
            Data.updateSettings({ keepAliveAudio: on });
            if (on) {
                Utils.startKeepAlive();
                Utils.toast('\u540E\u53F0\u4FDD\u6D3B\u5DF2\u5F00\u542F');
            } else {
                Utils.stopKeepAlive();
                Utils.toast('\u540E\u53F0\u4FDD\u6D3B\u5DF2\u5173\u95ED');
            }
        });
    },

    _bindCustomSoundUpload(input, type) {
        if (!input) return;
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 1024 * 1024) {
                Utils.toast('\u97F3\u9891\u6587\u4EF6\u4E0D\u80FD\u8D85\u8FC71MB');
                return;
            }
            const name = file.name.replace(/\.[^.]+$/, '');
            const reader = new FileReader();
            reader.onload = (ev) => {
                const s = Data.getSettings();
                if (!s.customSounds) s.customSounds = [];
                const id = 'cs_' + Date.now() + '_' + type;
                s.customSounds.push({ id, name: name + (type === 'send' ? '_\u53D1\u9001' : '_\u63A5\u6536'), dataUrl: ev.target.result });
                const updates = { customSounds: s.customSounds };
                if (type === 'send') updates.sendSoundType = id;
                else updates.receiveSoundType = id;
                Data.updateSettings(updates);
                this.renderTab('sound');
                Utils.toast(`\u5DF2\u6DFB\u52A0\u81EA\u5B9A\u4E49\u97F3\u6548: ${name}`);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        });
    },

    _playCustomSoundPreview(dataUrl) {
        try {
            const audio = new Audio(dataUrl);
            audio.volume = 0.5;
            audio.play().catch(() => {});
            setTimeout(() => { audio.pause(); audio.src = ''; }, 2000);
        } catch(e) {}
    },

    // ===== Notification =====
    renderNotification() {
        const s = Data.getSettings();
        const supported = 'Notification' in window;
        const permission = supported ? Notification.permission : 'unsupported';

        return `
            <div class="setting-group">
                <div class="setting-group-title">\u7CFB\u7EDF\u901A\u77E5</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u6D88\u606F\u901A\u77E5</div>
                        <div class="setting-desc">\u5BF9\u65B9\u53D1\u9001\u6D88\u606F\u65F6\u63A8\u9001\u7CFB\u7EDF\u901A\u77E5</div>
                    </div>
                    <div class="toggle ${s.notifications ? 'on' : ''}" id="notifToggle"></div>
                </div>
                ${!supported ? '<div class="setting-item"><div class="setting-desc">\u60A8\u7684\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u7CFB\u7EDF\u901A\u77E5</div></div>' : ''}
                ${supported && permission === 'denied' ? '<div class="setting-item"><div class="setting-desc" style="color:var(--red)">\u901A\u77E5\u6743\u9650\u88AB\u62D2\u7EDD\uFF0C\u8BF7\u5728\u6D4F\u89C8\u5668\u8BBE\u7F6E\u4E2D\u5141\u8BB8\u901A\u77E5</div></div>' : ''}
                ${supported && permission === 'default' ? '<div class="setting-item"><button class="btn-primary btn-sm" id="requestNotifBtn">\u8BF7\u6C42\u901A\u77E5\u6743\u9650</button></div>' : ''}
            </div>

            <div class="setting-group">
                <div class="setting-group-title">\u901A\u77E5\u9884\u89C8</div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">\u53D1\u9001\u6D4B\u8BD5\u901A\u77E5</div>
                        <div class="setting-desc">\u68C0\u67E5\u901A\u77E5\u662F\u5426\u6B63\u5E38\u5DE5\u4F5C</div>
                    </div>
                    <button class="btn-secondary btn-sm" id="testNotifBtn">\u53D1\u9001</button>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-card-title">\u901A\u77E5\u8BF4\u660E</div>
                <div class="stat-card-sub" style="line-height:1.8">
                    &bull; \u5F00\u542F\u901A\u77E5\u540E\uFF0C\u5BF9\u65B9\u56DE\u590D\u6D88\u606F\u65F6\u4F1A\u6536\u5230\u7CFB\u7EDF\u901A\u77E5<br>
                    &bull; \u9700\u8981\u6388\u4E88\u6D4F\u89C8\u5668\u901A\u77E5\u6743\u9650<br>
                    &bull; \u901A\u77E5\u4EC5\u5728\u7F51\u9875\u6253\u5F00\u65F6\u751F\u6548<br>
                    &bull; \u901A\u77E5\u5185\u5BB9\u4E3A\u5BF9\u65B9\u53D1\u9001\u7684\u6D88\u606F
                </div>
            </div>
        `;
    },

    bindNotification() {
        document.getElementById('notifToggle').addEventListener('click', async (e) => {
            const on = !e.target.classList.contains('on');
            if (on) {
                if ('Notification' in window) {
                    if (Notification.permission === 'default') {
                        const perm = await Utils.requestNotifyPermission();
                        if (perm !== 'granted') {
                            Utils.toast('\u9700\u8981\u6388\u4E88\u901A\u77E5\u6743\u9650\u624D\u80FD\u542F\u7528\u901A\u77E5');
                            return;
                        }
                    } else if (Notification.permission === 'denied') {
                        Utils.toast('\u901A\u77E5\u6743\u9650\u88AB\u62D2\u7EDD\uFF0C\u8BF7\u5728\u6D4F\u89C8\u5668\u8BBE\u7F6E\u4E2D\u5141\u8BB8');
                        return;
                    }
                } else {
                    Utils.toast('\u60A8\u7684\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u7CFB\u7EDF\u901A\u77E5');
                    return;
                }
            }
            e.target.classList.toggle('on', on);
            Data.updateSettings({ notifications: on });
        });

        const requestBtn = document.getElementById('requestNotifBtn');
        if (requestBtn) {
            requestBtn.addEventListener('click', async () => {
                const perm = await Utils.requestNotifyPermission();
                if (perm === 'granted') {
                    Utils.toast('\u901A\u77E5\u6743\u9650\u5DF2\u6388\u4E88');
                    this.renderTab('notification');
                } else {
                    Utils.toast('\u901A\u77E5\u6743\u9650\u88AB\u62D2\u7EDD');
                }
            });
        }

        document.getElementById('testNotifBtn').addEventListener('click', () => {
            if (!('Notification' in window)) { Utils.toast('\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u901A\u77E5'); return; }
            if (Notification.permission === 'granted') {
                new Notification('Fireworks', { body: '\u8FD9\u662F\u4E00\u6761\u6D4B\u8BD5\u901A\u77E5' });
            } else {
                Utils.toast('\u8BF7\u5148\u6388\u4E88\u901A\u77E5\u6743\u9650\u5E76\u5F00\u542F\u901A\u77E5');
            }
        });
    },

    // ===== Confirm Dialog =====
    showConfirm(title, text, onConfirm) {
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
