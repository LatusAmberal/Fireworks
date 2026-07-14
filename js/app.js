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
        const theme = Data.getSettings().theme || 'dark';
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

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
