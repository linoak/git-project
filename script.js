// 全局變數
let scores = {
    home: 0,
    away: 0
};

let gameNumber = 1;
let currentTheme = 'default';
let gameDisplayMode = 'show';
let hiddenTeams = {
    home: false,
    away: false
};

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateDisplay();
    setupEventListeners();
});

// 設置事件監聽器
function setupEventListeners() {
    // 團隊名稱編輯
    document.querySelectorAll('.team-name').forEach(nameElement => {
        nameElement.addEventListener('blur', function() {
            saveTeamName(this.dataset.team, this.textContent);
        });
        
        nameElement.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                this.blur();
            }
        });
    });
    
    // 長按重置分數
    let longPressTimer;
    document.querySelectorAll('.score-btn.minus').forEach(btn => {
        btn.addEventListener('mousedown', function() {
            longPressTimer = setTimeout(() => {
                const team = this.closest('.team-section').classList.contains('home-team') ? 'home' : 'away';
                resetTeamScore(team);
            }, 1000);
        });
        
        btn.addEventListener('mouseup', function() {
            clearTimeout(longPressTimer);
        });
        
        btn.addEventListener('mouseleave', function() {
            clearTimeout(longPressTimer);
        });
    });
}

// 調整分數
function adjustScore(team, amount) {
    scores[team] = Math.max(0, scores[team] + amount);
    
    // 檢查是否達到11分（乒乓球規則）
    if (scores[team] >= 11) {
        // 檢查是否需要領先2分
        const otherTeam = team === 'home' ? 'away' : 'home';
        if (scores[team] - scores[otherTeam] >= 2) {
            showGameWinAlert(team);
        }
    }
    
    updateDisplay();
    saveData();
    
    // 添加動畫效果
    const scoreElement = document.getElementById(`${team}-score`);
    scoreElement.classList.add('score-update');
    setTimeout(() => {
        scoreElement.classList.remove('score-update');
    }, 300);
}

// 調整局數
function adjustGame(amount) {
    gameNumber = Math.max(1, gameNumber + amount);
    updateDisplay();
    saveData();
}

// 重置團隊分數
function resetTeamScore(team) {
    if (confirm(`確定要將${team === 'home' ? '主隊' : '客隊'}的分數重置為0嗎？`)) {
        scores[team] = 0;
        updateDisplay();
        saveData();
    }
}

// 重置所有分數
function resetScores() {
    if (confirm('確定要重置所有分數嗎？')) {
        scores.home = 0;
        scores.away = 0;
        gameNumber = 1;
        updateDisplay();
        saveData();
    }
}

// 切換團隊名稱顯示
function toggleTeamName(team) {
    hiddenTeams[team] = !hiddenTeams[team];
    const nameElement = document.querySelector(`[data-team="${team}"]`);
    const btn = nameElement.nextElementSibling.querySelector('.hide-name-btn');
    
    if (hiddenTeams[team]) {
        nameElement.classList.add('hidden');
        btn.textContent = '顯示';
    } else {
        nameElement.classList.remove('hidden');
        btn.textContent = '隱藏';
    }
    
    updateDisplay();
    saveData();
}

// 改變佈景主題
function changeTheme() {
    const themeSelector = document.getElementById('theme-selector');
    const newTheme = themeSelector.value;
    
    // 移除舊主題
    document.body.classList.remove(`theme-${currentTheme}`);
    
    // 添加新主題
    if (newTheme !== 'default') {
        document.body.classList.add(`theme-${newTheme}`);
    }
    
    currentTheme = newTheme;
    saveData();
}

// 改變局數顯示模式
function changeGameDisplayMode() {
    const modeSelector = document.getElementById('game-display-mode');
    gameDisplayMode = modeSelector.value;
    
    const gameCounter = document.querySelector('.game-counter');
    if (gameDisplayMode === 'hide') {
        gameCounter.classList.add('hidden');
    } else {
        gameCounter.classList.remove('hidden');
    }
    
    saveData();
}

// 清除所有資料
function clearAllData() {
    if (confirm('確定要清除所有資料嗎？這將無法復原！')) {
        localStorage.removeItem('pingPongScoreboard');
        location.reload();
    }
}

// 更新顯示
function updateDisplay() {
    document.getElementById('home-score').textContent = scores.home;
    document.getElementById('away-score').textContent = scores.away;
    document.getElementById('game-number').textContent = gameNumber;
    
    // 更新主題選擇器
    document.getElementById('theme-selector').value = currentTheme;
    
    // 更新局數顯示模式選擇器
    document.getElementById('game-display-mode').value = gameDisplayMode;
    
    // 應用當前主題
    document.body.classList.remove('theme-default', 'theme-bright', 'theme-led', 'theme-red-blue');
    if (currentTheme !== 'default') {
        document.body.classList.add(`theme-${currentTheme}`);
    }
    
    // 應用局數顯示模式
    const gameCounter = document.querySelector('.game-counter');
    if (gameDisplayMode === 'hide') {
        gameCounter.classList.add('hidden');
    } else {
        gameCounter.classList.remove('hidden');
    }
    
    // 應用團隊名稱隱藏狀態
    Object.keys(hiddenTeams).forEach(team => {
        const nameElement = document.querySelector(`[data-team="${team}"]`);
        const btn = nameElement.nextElementSibling.querySelector('.hide-name-btn');
        
        if (hiddenTeams[team]) {
            nameElement.classList.add('hidden');
            btn.textContent = '顯示';
        } else {
            nameElement.classList.remove('hidden');
            btn.textContent = '隱藏';
        }
    });
}

// 保存資料到本地存儲
function saveData() {
    const data = {
        scores,
        gameNumber,
        currentTheme,
        gameDisplayMode,
        hiddenTeams,
        teamNames: {
            home: document.querySelector('[data-team="home"]').textContent,
            away: document.querySelector('[data-team="away"]').textContent
        },
        timestamp: Date.now()
    };
    
    localStorage.setItem('pingPongScoreboard', JSON.stringify(data));
}

// 從本地存儲載入資料
function loadData() {
    const savedData = localStorage.getItem('pingPongScoreboard');
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            // 載入分數和局數
            if (data.scores) {
                scores = data.scores;
            }
            if (data.gameNumber) {
                gameNumber = data.gameNumber;
            }
            
            // 載入主題設置
            if (data.currentTheme) {
                currentTheme = data.currentTheme;
            }
            
            // 載入局數顯示模式
            if (data.gameDisplayMode) {
                gameDisplayMode = data.gameDisplayMode;
            }
            
            // 載入團隊名稱隱藏狀態
            if (data.hiddenTeams) {
                hiddenTeams = data.hiddenTeams;
            }
            
            // 載入團隊名稱
            if (data.teamNames) {
                document.querySelector('[data-team="home"]').textContent = data.teamNames.home;
                document.querySelector('[data-team="away"]').textContent = data.teamNames.away;
            }
            
        } catch (error) {
            console.error('載入資料時發生錯誤:', error);
        }
    }
}

// 保存團隊名稱
function saveTeamName(team, name) {
    saveData();
}

// 顯示遊戲獲勝提示
function showGameWinAlert(team) {
    const teamName = team === 'home' ? '主隊' : '客隊';
    const message = `恭喜！${teamName}贏得第${gameNumber}局！`;
    
    // 創建提示元素
    const alert = document.createElement('div');
    alert.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #28a745;
        color: white;
        padding: 20px 40px;
        border-radius: 15px;
        font-size: 1.2rem;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: fadeInOut 3s ease-in-out;
    `;
    alert.textContent = message;
    
    // 添加動畫樣式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(alert);
    
    // 3秒後自動移除
    setTimeout(() => {
        document.body.removeChild(alert);
        document.head.removeChild(style);
    }, 3000);
}

// 鍵盤快捷鍵支持
document.addEventListener('keydown', function(e) {
    switch(e.key) {
        case '1':
            adjustScore('home', 1);
            break;
        case '2':
            adjustScore('away', 1);
            break;
        case 'q':
            adjustScore('home', -1);
            break;
        case 'w':
            adjustScore('away', -1);
            break;
        case 'g':
            adjustGame(1);
            break;
        case 'f':
            adjustGame(-1);
            break;
        case 'r':
            if (e.ctrlKey) {
                e.preventDefault();
                resetScores();
            }
            break;
    }
});

// 觸控設備支持
let touchStartTime;
let touchTimer;

document.addEventListener('touchstart', function(e) {
    if (e.target.classList.contains('score-btn') && e.target.classList.contains('minus')) {
        touchStartTime = Date.now();
        touchTimer = setTimeout(() => {
            const team = e.target.closest('.team-section').classList.contains('home-team') ? 'home' : 'away';
            resetTeamScore(team);
        }, 1000);
    }
});

document.addEventListener('touchend', function(e) {
    if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
    }
});

// 自動保存提醒
setInterval(() => {
    saveData();
}, 30000); // 每30秒自動保存一次

// 頁面卸載前保存資料
window.addEventListener('beforeunload', function() {
    saveData();
});

// 錯誤處理
window.addEventListener('error', function(e) {
    console.error('應用程式錯誤:', e.error);
    // 可以添加用戶友好的錯誤提示
});

// 性能監控
if ('performance' in window) {
    window.addEventListener('load', function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`頁面載入時間: ${loadTime}ms`);
    });
}


