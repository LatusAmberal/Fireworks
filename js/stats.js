/* ===== Statistics Page ===== */

const Stats = {
    init() {},

    onShow() {
        this.render();
    },

    render() {
        const container = document.getElementById('statsContainer');
        const messages = Data.getMessages();
        const cards = Data.getCards();

        const totalMessages = messages.length;
        const myMessages = messages.filter(m => m.side === 'me').length;
        const peerMessages = messages.filter(m => m.side === 'other').length;
        const firstChatDate = Data.data.firstChatDate;

        const sortedCards = [...cards].filter(c => c.usageCount > 0).sort((a, b) => b.usageCount - a.usageCount);
        const topCards = sortedCards.slice(0, 10);

        container.innerHTML = `
            <div class="stat-row">
                <div class="stat-card">
                    <div class="stat-card-title">\u804A\u5929\u6761\u76EE</div>
                    <div class="stat-card-value">${totalMessages}<span class="unit">\u6761</span></div>
                    <div class="stat-card-sub">\u6211 ${myMessages} | \u5BF9\u65B9 ${peerMessages}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-title">\u5B57\u5361\u603B\u6570</div>
                    <div class="stat-card-value">${cards.length}<span class="unit">\u5F20</span></div>
                    <div class="stat-card-sub">\u5DF2\u5C4F\u853D ${cards.filter(c => c.blocked).length} \u5F20</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-card-title">\u7B2C\u4E00\u6B21\u804A\u5929</div>
                <div class="stat-card-value" style="font-size:20px">${firstChatDate ? Utils.formatDateTime(firstChatDate) : '\u8FD8\u672A\u5F00\u59CB\u804A\u5929'}</div>
                <div class="stat-card-sub">${firstChatDate ? `\u5DF2\u8FC7 ${Math.floor((Date.now() - firstChatDate) / 86400000)} \u5929` : ''}</div>
            </div>

            <div class="stat-card">
                <div class="stat-card-title">\u4E00\u5929\u6D88\u606F\u5206\u5E03</div>
                ${this.renderDailyChart(messages)}
            </div>

            <div class="stat-card">
                <div class="stat-card-title">\u4E00\u5468\u6D88\u606F\u70ED\u529B\u56FE</div>
                ${this.renderHeatmap(messages)}
            </div>

            <div class="stat-card">
                <div class="stat-card-title">\u6700\u5E38\u7528\u5B57\u5361 Top ${topCards.length}</div>
                ${this.renderMostUsed(topCards)}
            </div>
        `;
    },

    renderHeatmap(messages) {
        const days = ['\u5468\u65E5', '\u5468\u4E00', '\u5468\u4E8C', '\u5468\u4E09', '\u5468\u56DB', '\u5468\u4E94', '\u5468\u516D'];
        const today = new Date();

        const dayData = [];
        const dayLabels = [];
        for (let d = 6; d >= 0; d--) {
            const date = new Date(today);
            date.setDate(date.getDate() - d);
            const dateStr = date.toDateString();
            const dayName = days[date.getDay()];
            dayLabels.push(`${dayName} ${date.getMonth()+1}/${date.getDate()}`);

            const hourCounts = new Array(24).fill(0);
            messages.forEach(msg => {
                if (new Date(msg.timestamp).toDateString() === dateStr) {
                    const h = new Date(msg.timestamp).getHours();
                    hourCounts[h]++;
                }
            });
            dayData.push(hourCounts);
        }

        let maxCount = 0;
        dayData.forEach(day => day.forEach(c => { if (c > maxCount) maxCount = c; }));

        let html = '<div class="heatmap-wrapper">';
        dayData.forEach((day, dayIdx) => {
            html += `<div class="heatmap-day-row">`;
            html += `<div class="heatmap-day-label">${dayLabels[dayIdx]}</div>`;
            html += '<div class="heatmap-cells">';
            for (let h = 0; h < 24; h++) {
                const count = day[h];
                let level = 0;
                if (count > 0) {
                    if (maxCount > 0) {
                        const ratio = count / maxCount;
                        if (ratio > 0.75) level = 4;
                        else if (ratio > 0.5) level = 3;
                        else if (ratio > 0.25) level = 2;
                        else level = 1;
                    } else {
                        level = 1;
                    }
                }
                html += `<div class="heatmap-cell level-${level}" title="${dayLabels[dayIdx]} ${h}:00 (${count}\u6761)"></div>`;
            }
            html += '</div></div>';
        });
        html += '</div>';

        html += '<div class="heatmap-hour-labels">';
        for (let h = 0; h < 24; h++) {
            if (h % 6 === 0) html += `<span>${h}:00</span>`;
            else html += '<span></span>';
        }
        html += '</div>';

        return html;
    },

    renderDailyChart(messages) {
        const hourCounts = new Array(24).fill(0);
        messages.forEach(msg => {
            const h = new Date(msg.timestamp).getHours();
            hourCounts[h]++;
        });

        const maxCount = Math.max(...hourCounts, 1);
        const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

        let html = '<div class="daily-chart">';
        for (let h = 0; h < 24; h++) {
            const count = hourCounts[h];
            const height = (count / maxCount) * 100;
            const isPeak = count === maxCount && count > 0;
            html += `<div class="daily-bar ${isPeak ? 'peak' : ''}" style="height:${height}%" title="${h}:00 - ${count}\u6761"></div>`;
        }
        html += '</div>';

        html += '<div class="daily-labels">';
        for (let h = 0; h < 24; h++) {
            if (h % 4 === 0) html += `<span>${h}</span>`;
            else html += '<span></span>';
        }
        html += '</div>';

        if (maxCount > 0) {
            html += `<div class="stat-card-sub" style="margin-top:8px">\u6700\u6D3B\u8DC3\u65F6\u6BB5\uFF1A${peakHour}:00 - ${peakHour+1}:00 (${hourCounts[peakHour]} \u6761)</div>`;
        }

        return html;
    },

    renderMostUsed(topCards) {
        if (topCards.length === 0) {
            return '<div class="empty-state" style="padding:20px"><p style="font-size:14px">\u6682\u65E0\u4F7F\u7528\u8BB0\u5F55</p><p style="font-size:12px;margin-top:4px">\u804A\u5929\u540E\u4F1A\u663E\u793A\u6700\u5E38\u7528\u7684\u5B57\u5361</p></div>';
        }

        let html = '<div class="most-used-list">';
        topCards.forEach((card, i) => {
            const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
            html += `
                <div class="most-used-item">
                    <div class="most-used-rank ${rankClass}">${i + 1}</div>
                    <div class="most-used-content">
                        <div class="most-used-text">${Utils.escapeHtml(card.content)}</div>
                        ${card.translation ? `<div class="most-used-count">${Utils.escapeHtml(card.translation)}</div>` : ''}
                    </div>
                    <div class="most-used-count" style="font-weight:bold">${card.usageCount} \u6B21</div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }
};
