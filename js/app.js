/* ===== Main App - Routing & Navigation ===== */

const App = {
    pageHistory: ['home'],
    currentPage: 'home',

    init() {
        this.applyTheme();
        this.applyGlassmorphism();
        this.applyBubbleStyle();
        this.applyChatBackground();
        this.applyCustomCSS();
        this.bindNav();
        this.bindBackButtons();
        this.bindSettingsTabs();
        this.navigate('home', false);

        Home.init();
        Chat.init();
        Cards.init();
        Stats.init();
        Settings.init();

        this.applyAvatarSettings();

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
                if (Data.getSettings().theme === 'system') {
                    this.applyTheme();
                }
            });
        }

        // Save data before page unload (prevents loss when refreshing while editing)
        window.addEventListener('beforeunload', () => {
            Data.save();
        });

        // Save data periodically (every 30 seconds) to prevent data loss
        setInterval(() => {
            Data.save();
        }, 30000);
    },

    bindNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                if (page && page !== this.currentPage) {
                    this.navigate(page);
                }
            });
        });
    },

    bindBackButtons() {
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.back;
                if (target) {
                    this.navigate(target);
                } else {
                    this.goBack();
                }
            });
        });
    },

    bindSettingsTabs() {
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                Settings.renderTab(tab.dataset.tab);
            });
        });
    },

    navigate(page, addHistory = true) {
        if (addHistory) {
            this.pageHistory.push(this.currentPage);
        }
        this.currentPage = page;

        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        const target = document.getElementById('page-' + page);
        if (target) {
            target.classList.add('active');
        }

        const navBar = document.getElementById('navBar');
        if (page === 'home') {
            navBar.style.display = 'flex';
        } else {
            navBar.style.display = 'none';
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        if (page === 'home') Home.onShow();
        else if (page === 'chat') Chat.onShow();
        else if (page === 'cards') Cards.onShow();
        else if (page === 'stats') Stats.onShow();
        else if (page === 'settings') Settings.onShow();
        else if (page === 'chatsettings') ChatSettings.onShow();

        window.scrollTo(0, 0);
    },

    goBack() {
        if (this.pageHistory.length > 0) {
            const prev = this.pageHistory.pop();
            this.navigate(prev, false);
        } else {
            this.navigate('home', false);
        }
    },

    applyTheme() {
        let theme = Data.getSettings().theme || 'dark';
        if (theme === 'system') {
            theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }
        document.documentElement.setAttribute('data-theme', theme);
    },

    applyGlassmorphism() {
        const s = Data.getSettings();
        document.documentElement.setAttribute('data-glass', s.glassmorphism ? 'true' : 'false');
    },

    applyBubbleStyle() {
        const s = Data.getSettings();
        document.documentElement.setAttribute('data-bubble-style', s.chatBubbleStyle || 'default');
    },

    applyChatBackground() {
        const s = Data.getSettings();
        const chatBg = document.getElementById('chatBg');
        if (chatBg) {
            if (s.chatBackground) {
                chatBg.style.backgroundImage = `url(${s.chatBackground})`;
                chatBg.style.opacity = s.chatBackgroundOpacity || 0.15;
            } else {
                chatBg.style.backgroundImage = '';
                chatBg.style.opacity = '';
            }
        }
    },

    applyCustomCSS() {
        const css = Data.getSettings().customCSS || '';
        const el = document.getElementById('custom-css');
        if (el) el.textContent = css;
    },

    applyAvatarSettings() {
        const settings = Data.getSettings();

        // Home avatar
        const homeAvatar = document.getElementById('profileAvatar');
        if (homeAvatar) {
            if (settings.myAvatar) {
                homeAvatar.style.backgroundImage = `url(${settings.myAvatar})`;
                homeAvatar.textContent = '';
            } else {
                homeAvatar.style.backgroundImage = '';
                homeAvatar.textContent = settings.myAvatarEmoji || '\uD83C\uDF86';
            }
        }

        // Status section avatar (my)
        const myStatusAvatar = document.getElementById('myStatusAvatar');
        if (myStatusAvatar) {
            if (settings.myAvatar) {
                myStatusAvatar.style.backgroundImage = `url(${settings.myAvatar})`;
                myStatusAvatar.textContent = '';
            } else {
                myStatusAvatar.style.backgroundImage = '';
                myStatusAvatar.textContent = settings.myAvatarEmoji || '\uD83D\uDE0E';
            }
        }

        // Status section avatar (other)
        const otherStatusAvatar = document.getElementById('otherStatusAvatar');
        if (otherStatusAvatar) {
            if (settings.otherAvatar) {
                otherStatusAvatar.style.backgroundImage = `url(${settings.otherAvatar})`;
                otherStatusAvatar.textContent = '';
            } else {
                otherStatusAvatar.style.backgroundImage = '';
                otherStatusAvatar.textContent = settings.otherAvatarEmoji || '\uD83D\uDE0A';
            }
        }

        // Home background - full cover
        const homeBg = document.getElementById('homeBg');
        if (homeBg) {
            if (settings.homeBackground) {
                homeBg.style.background = `url(${settings.homeBackground}) center/cover no-repeat`;
                homeBg.style.backgroundSize = 'cover';
            } else {
                homeBg.style.background = '';
            }
        }

        // Profile card background
        const cardBg = document.getElementById('profileCardBg');
        if (cardBg) {
            if (settings.cardBackground) {
                cardBg.style.background = `url(${settings.cardBackground}) center/cover`;
            } else {
                cardBg.style.background = '';
            }
        }
    }
};

/* ===== Onboarding: Registration + Splash Animation ===== */
const Onboarding = {
    init() {
        const profile = Data.getProfile();
        if (!profile.registered) {
            this.showRegistration();
        } else {
            this.showSplash();
        }
    },

    showRegistration() {
        const screen = document.getElementById('register-screen');
        screen.style.display = 'flex';

        const nicknameInput = document.getElementById('registerNickname');
        const passwordInput = document.getElementById('registerPassword');
        const submitBtn = document.getElementById('registerSubmit');

        setTimeout(() => nicknameInput.focus(), 100);

        const handleSubmit = () => {
            const nickname = nicknameInput.value.trim();
            const password = passwordInput.value.trim();
            if (!nickname) {
                nicknameInput.style.borderColor = '#ff5e6c';
                nicknameInput.focus();
                setTimeout(() => { nicknameInput.style.borderColor = ''; }, 1500);
                return;
            }
            if (!password) {
                passwordInput.style.borderColor = '#ff5e6c';
                passwordInput.focus();
                setTimeout(() => { passwordInput.style.borderColor = ''; }, 1500);
                return;
            }

            Data.updateProfile({ nickname: nickname, registered: true });

            // Pre-load app data immediately while splash is starting
            this._preloadApp();

            // Apply custom splash text from settings
            const s = Data.getSettings();
            const titleEl = document.getElementById('splashTitle');
            const poemEl = document.getElementById('splashPoem');
            if (titleEl) titleEl.textContent = s.splashTitle || 'Sonnet';
            if (poemEl) {
                const subtitle = (s.splashSubtitle || 'Shall I compare thee to a summer\'s day?\nThou art more lovely and more temperate.');
                poemEl.innerHTML = subtitle.replace(/\n/g, '<br>');
            }

            // Cross-fade: start splash behind registration screen, then fade out registration
            const splash = document.getElementById('splash-screen');
            splash.style.display = 'flex';
            this.startAnimation();

            // Fade out registration screen on top of splash
            screen.classList.add('fade-out');
            setTimeout(() => {
                screen.style.display = 'none';
                screen.classList.remove('fade-out');
            }, 500);
        };

        submitBtn.addEventListener('click', handleSubmit);
        passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSubmit();
        });
        nicknameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') passwordInput.focus();
        });
    },

    showSplash() {
        const regScreen = document.getElementById('register-screen');
        if (regScreen) regScreen.style.display = 'none';

        // Apply custom splash text from settings
        const s = Data.getSettings();
        const titleEl = document.getElementById('splashTitle');
        const poemEl = document.getElementById('splashPoem');
        if (titleEl) titleEl.textContent = s.splashTitle || 'Sonnet';
        if (poemEl) {
            const subtitle = (s.splashSubtitle || 'Shall I compare thee to a summer\'s day?\nThou art more lovely and more temperate.');
            poemEl.innerHTML = subtitle.replace(/\n/g, '<br>');
        }

        const screen = document.getElementById('splash-screen');
        screen.style.display = 'flex';

        this.startAnimation();

        // Pre-load app data during animation (after a brief delay for canvas to start)
        this._preloadApp();
    },

    // Pre-load all app data and initialize modules during splash animation
    _appPreloaded: false,
    _preloadApp() {
        if (this._appPreloaded) return;
        this._appPreloaded = true;

        // Use requestAnimationFrame to ensure canvas is painting, then init app
        requestAnimationFrame(() => {
            setTimeout(() => {
                App.init();
            }, 100);
        });
    },

    // ===== Geometric Firework Animation =====
    _canvas: null,
    _ctx: null,
    _animId: null,
    _resizeHandler: null,
    _startTime: 0,
    _totalDuration: 3000,

    startAnimation() {
        const canvas = document.getElementById('splash-canvas');
        if (!canvas) return;
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
        this._startTime = performance.now();

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            this._dpr = dpr;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';
        };
        resize();
        this._resizeHandler = resize;
        window.addEventListener('resize', resize);

        const animate = (now) => {
            const ctx = this._ctx;
            if (!ctx) return;
            const dpr = this._dpr || 1;
            const w = window.innerWidth;
            const h = window.innerHeight;
            const cx = w / 2;
            const cy = h * 0.36;

            const elapsed = now - this._startTime;
            const totalProgress = Math.min(1, elapsed / this._totalDuration);

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);

            // Slow counter-rotation for geometric motion
            const rotation = now * 0.0003;

            // ===== Two concentric progress rings =====
            const outerR = Math.min(85, w * 0.12);
            const innerR = outerR * 0.6;

            // --- Outer ring: 20 segments, larger squares, clockwise ---
            const outerSegs = 20;
            const outerSize = 6;
            const outerLit = Math.floor(totalProgress * outerSegs);
            const outerPulse = 0.85 + Math.sin(now * 0.004) * 0.1;

            for (let i = 0; i < outerSegs; i++) {
                const a = (Math.PI * 2 * i) / outerSegs - Math.PI / 2 + rotation;
                const sx = cx + Math.cos(a) * outerR;
                const sy = cy + Math.sin(a) * outerR;

                const isLit = i < outerLit;
                const isNext = i === outerLit && totalProgress < 1;
                const partial = isNext ? (totalProgress * outerSegs - outerLit) : 0;

                ctx.save();
                ctx.translate(sx, sy);
                ctx.rotate(a + Math.PI / 2);

                if (isLit) {
                    ctx.fillStyle = `rgba(88, 101, 242, ${outerPulse})`;
                    ctx.fillRect(-outerSize / 2, -outerSize / 2, outerSize, outerSize);
                } else if (isNext) {
                    ctx.fillStyle = `rgba(88, 101, 242, ${0.85 * partial})`;
                    const ds = outerSize * partial;
                    ctx.fillRect(-ds / 2, -outerSize / 2, ds, outerSize);
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.fillRect(-outerSize / 2, -outerSize / 2, outerSize, outerSize);
                }
                ctx.restore();
            }

            // --- Inner ring: 16 segments, counter-clockwise ---
            const innerSegs = 16;
            const innerSize = 5;
            const innerLit = Math.floor(totalProgress * innerSegs);
            const innerPulse = 0.7 + Math.sin(now * 0.004 + 1) * 0.1;

            for (let i = 0; i < innerSegs; i++) {
                const a = (Math.PI * 2 * i) / innerSegs - Math.PI / 2 - rotation;
                const sx = cx + Math.cos(a) * innerR;
                const sy = cy + Math.sin(a) * innerR;

                const isLit = i < innerLit;
                const isNext = i === innerLit && totalProgress < 1;
                const partial = isNext ? (totalProgress * innerSegs - innerLit) : 0;

                ctx.save();
                ctx.translate(sx, sy);
                ctx.rotate(a + Math.PI / 2);

                if (isLit) {
                    ctx.fillStyle = `rgba(88, 101, 242, ${innerPulse})`;
                    ctx.fillRect(-innerSize / 2, -innerSize / 2, innerSize, innerSize);
                } else if (isNext) {
                    ctx.fillStyle = `rgba(88, 101, 242, ${0.7 * partial})`;
                    const ds = innerSize * partial;
                    ctx.fillRect(-ds / 2, -innerSize / 2, ds, innerSize);
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                    ctx.fillRect(-innerSize / 2, -innerSize / 2, innerSize, innerSize);
                }
                ctx.restore();
            }

            // ===== Central pulsing white circle =====
            const pulseCycle = Math.sin(now * 0.0015);
            const circleRadius = 10 + pulseCycle * 6;
            const circleAlpha = 0.15 + (pulseCycle + 1) * 0.1;
            ctx.beginPath();
            ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${circleAlpha})`;
            ctx.fill();

            this._animId = requestAnimationFrame(animate);
        };
        this._animId = requestAnimationFrame(animate);

        // Schedule splash screen removal
        setTimeout(() => {
            const screen = document.getElementById('splash-screen');
            screen.classList.add('fade-out');
            setTimeout(() => {
                screen.style.display = 'none';
                screen.classList.remove('fade-out');
                this.stopAnimation();
                // App.init() is already called during animation via _preloadApp()
                // Ensure it's initialized even if _preloadApp failed
                if (!this._appPreloaded) {
                    App.init();
                }
            }, 500);
        }, this._totalDuration);
    },

    stopAnimation() {
        if (this._animId) {
            cancelAnimationFrame(this._animId);
            this._animId = null;
        }
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
            this._resizeHandler = null;
        }
        this._canvas = null;
        this._ctx = null;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Onboarding.init();
});
