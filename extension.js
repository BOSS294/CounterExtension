const vscode = require('vscode');

class Timer {
    constructor(updateInterval = 1000) {
        this.elapsedSeconds = 0;
        this.updateInterval = updateInterval;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.statusBarItem.text = `$(clock) ${this.formatTime()}`;
        this.statusBarItem.tooltip = "Click to view animated elapsed time";
        this.statusBarItem.command = 'auroraclock.showTimeAnimation';
        this.timer = null;
    }

    formatTime() {
        try {
            const hours = Math.floor(this.elapsedSeconds / 3600)
                .toString()
                .padStart(2, '0');
            const minutes = Math.floor((this.elapsedSeconds % 3600) / 60)
                .toString()
                .padStart(2, '0');
            const seconds = (this.elapsedSeconds % 60).toString().padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        } catch (error) {
            console.error("Error formatting time:", error);
            return "00:00:00";
        }
    }

    start() {
        try {
            this.statusBarItem.show();
            this.timer = setInterval(() => {
                this.elapsedSeconds++;
                this.statusBarItem.text = `$(clock) ${this.formatTime()}`;
            }, this.updateInterval);
        } catch (error) {
            console.error("Error starting timer:", error);
        }
    }

    stop() {
        try {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        } catch (error) {
            console.error("Error stopping timer:", error);
        }
    }

    dispose() {
        this.stop();
        this.statusBarItem.dispose();
    }
}

let timerInstance;

function activate(context) {
    timerInstance = new Timer();
    timerInstance.start();
    context.subscriptions.push(timerInstance);

    let disposable = vscode.commands.registerCommand('auroraclock.showTimeAnimation', () => {
        try {
            const panel = vscode.window.createWebviewPanel(
                'timeAnimation',
                'Elapsed Time',
                vscode.ViewColumn.Active,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );
            const initialTime = timerInstance.elapsedSeconds;
            panel.webview.html = getWebviewContent(initialTime);
        } catch (error) {
            vscode.window.showErrorMessage("Error opening animated view: " + error.message);
            console.error("Error opening webview panel:", error);
        }
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(initialTime) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AuroraClock - Elapsed Time</title>
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        font-family: sans-serif;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: background 0.5s ease, color 0.5s ease;
    }
    body.neon {
      background: linear-gradient(135deg, #0d0d0d, #000);
      color: #fff;
    }
    body.neon .header {
      font-size:4.5em;
      color: #0ff;
      text-shadow: 0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff;
      margin-top:20px;
    }
    body.neon .time-container {
      background: rgba(0, 255, 255, 0.1);
      border: 1px solid rgba(0, 255, 255, 0.3);
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    }
    body.neon .digit {
      font-family: 'Orbitron', sans-serif;
      color: #0ff;
      text-shadow: 0 0 8px #0ff;
    }
    body.glass {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      color: #fff;
    }
    body.glass .header {
      font-size: 3.5em;
      color: #fff;
    }
    body.glass .time-container {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
    }
    body.glass .digit {
      color: #fff;
      text-shadow: 0 0 5px #fff;
    }
    body.classic {
      background: #fff;
      color: #000;
    }
    body.classic .header {
      font-size: 3.5em;
      color: #000;
      font-family: 'Times New Roman', serif;
    }
    body.classic .time-container {
      background: #f2f2f2;
      border: 1px solid #ccc;
      box-shadow: none;
    }
    body.classic .digit {
      color: #000;
      text-shadow: none;
    }
    body.cyber {
      background: radial-gradient(circle, #010a0f, #001f29);
      color: #0f0;
    }
    body.cyber .header {
      font-size: 3.5em;
      color: #0f0;
      text-shadow: 0 0 10px #0f0, 0 0 20px #0f0;
      font-family: 'Courier New', monospace;
    }
    body.cyber .time-container {
      background: rgba(0, 255, 0, 0.1);
      border: 1px solid rgba(0, 255, 0, 0.3);
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
    }
    body.cyber .digit {
      font-family: 'Courier New', monospace;
      color: #0f0;
      text-shadow: 0 0 5px #0f0;
    }
    body.minimal {
      background: #fafafa;
      color: #333;
    }
    body.minimal .header {
      font-size: 3.5em;
      color: #333;
      font-weight: lighter;
      letter-spacing: 2px;
    }
    body.minimal .time-container {
      background: #fff;
      border: 1px solid #ddd;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    body.minimal .digit {
      color: #333;
      font-family: 'Helvetica Neue', sans-serif;
    }
    .header {
        text-align: center;
        padding: 20px;
        transition: color 0.5s ease;
    }
    .main {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .work-message {
        text-align: center;
        margin-bottom: 20px;
    }
    .work-message p {
        font-size: 5em;
        font-weight: bold;
        letter-spacing: 1px;
        text-transform: uppercase;
    }
    .timer-container {
        display: flex;
        align-items: center;
        gap: 20px;
    }
    .time-container {
        border-radius: 10px;
        padding: 20px;
        min-width: 120px;
        text-align: center;
        transition: background 0.5s ease, border 0.5s ease, box-shadow 0.5s ease;
    }
    .digit {
        font-size: 2.5em;
        transition: text-shadow 0.5s ease;
    }
    .pulse {
        animation: pulse 0.4s ease;
    }
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    .label {
        font-size: 1em;
        margin-top: 10px;
    }
    .separator {
        font-size: 2.5em;
        line-height: 1;
    }
    .footer {
        text-align: center;
        padding: 10px;
        font-size: 1em;
        color: inherit;
    }
    #settingsButton {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        color: #fff;
        font-size: 1.8em;
        cursor: pointer;
        transition: transform 0.3s ease, opacity 0.3s ease;
        z-index: 1000;
    }
    #settingsButton:hover {
        transform: scale(1.2) rotate(15deg);
    }
    #settingsPanel {
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: rgba(0, 0, 0, 0.85);
        padding: 15px;
        border-radius: 8px;
        display: none;
        flex-direction: column;
        gap: 10px;
        animation: fadeIn 0.5s ease forwards;
        z-index: 1000;
    }
    #settingsPanel label {
        font-size: 1em;
        margin-bottom: 5px;
        color: #fff;
    }
    #settingsPanel select {
        padding: 5px;
        font-size: 1em;
        border-radius: 4px;
        border: none;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
</style>
</head>
<body class="neon">
    <div class="header">AuroraClock</div>
    <div class="main">
        <div class="work-message">
            <p>You have been working for</p>
        </div>
        <div class="timer-container">
            <div class="time-container">
                <div class="digit" id="hoursDigit">00</div>
                <div class="label">H</div>
            </div>
            <div class="separator">:</div>
            <div class="time-container">
                <div class="digit" id="minutesDigit">00</div>
                <div class="label">M</div>
            </div>
            <div class="separator">:</div>
            <div class="time-container">
                <div class="digit" id="secondsDigit">00</div>
                <div class="label">S</div>
            </div>
        </div>
    </div>
    <div class="footer">Created With <span style="color:red;">&#10084;</span> by Mayank Chawdhari</div>

    <button id="settingsButton">⚙</button>
    <!-- Settings Panel -->
    <div id="settingsPanel">
        <div>
            <label for="themeSelect">Select Theme:</label>
            <select id="themeSelect">
                <option value="neon" selected>Neon</option>
                <option value="glass">Glassmorphism</option>
                <option value="classic">Classic</option>
                <option value="cyber">Cyber</option>
                <option value="minimal">Minimal</option>
            </select>
        </div>
    </div>

<script>
    (function() {
        let elapsed = ${initialTime};
        const updateInterval = 1000;
        let timerInterval = null;
        let prevHours = null, prevMinutes = null, prevSeconds = null;

        function formatTime(totalSeconds) {
            const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
            const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
            const seconds = (totalSeconds % 60).toString().padStart(2, '0');
            return { hours, minutes, seconds };
        }

        function updateDisplay() {
            try {
                elapsed++;
                const time = formatTime(elapsed);
                const hoursDigit = document.getElementById('hoursDigit');
                const minutesDigit = document.getElementById('minutesDigit');
                const secondsDigit = document.getElementById('secondsDigit');
                const countdownDisplay = document.getElementById('countdownDisplay');

                if (prevHours !== time.hours) {
                    hoursDigit.innerText = time.hours;
                    hoursDigit.classList.add('pulse');
                    setTimeout(() => { hoursDigit.classList.remove('pulse'); }, 400);
                    prevHours = time.hours;
                }
                if (prevMinutes !== time.minutes) {
                    minutesDigit.innerText = time.minutes;
                    minutesDigit.classList.add('pulse');
                    setTimeout(() => { minutesDigit.classList.remove('pulse'); }, 400);
                    prevMinutes = time.minutes;
                }
                if (prevSeconds !== time.seconds) {
                    secondsDigit.innerText = time.seconds;
                    secondsDigit.classList.add('pulse');
                    setTimeout(() => { secondsDigit.classList.remove('pulse'); }, 400);
                    prevSeconds = time.seconds;
                }
                countdownDisplay.innerText = \`\${time.hours}:\${time.minutes}:\${time.seconds}\`;
            } catch (error) {
                console.error("Error updating display:", error);
            }
        }

        function startTimer() {
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(updateDisplay, updateInterval);
        }

        startTimer();

        const settingsButton = document.getElementById('settingsButton');
        const settingsPanel = document.getElementById('settingsPanel');
        settingsButton.addEventListener('click', () => {
            settingsPanel.style.display = (settingsPanel.style.display === "flex") ? "none" : "flex";
        });

        const themeSelect = document.getElementById('themeSelect');
        themeSelect.addEventListener('change', (e) => {
            document.body.className = e.target.value;
            if (e.target.value === 'classic' || e.target.value === 'minimal') {
                settingsButton.style.display = 'none';
            } else {
                settingsButton.style.display = 'block';
            }
        });
    })();
</script>
</body>
</html>`;
}

function deactivate() {
    if (timerInstance) {
        timerInstance.dispose();
    }
}

module.exports = {
    activate,
    deactivate
};
