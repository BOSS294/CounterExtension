const vscode = require('vscode');

class Timer {
    constructor() {
        this.elapsedSeconds = 0;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.statusBarItem.text = `$(clock) ${this.formatTime()}`;
        this.statusBarItem.tooltip = "Click to view animated elapsed time";
        this.statusBarItem.command = 'extension.showTimeAnimation';
        this.timer = null;
    }

    formatTime() {
        const hours = Math.floor(this.elapsedSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((this.elapsedSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (this.elapsedSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    start() {
        this.statusBarItem.show();
        this.timer = setInterval(() => {
            this.elapsedSeconds++;
            this.statusBarItem.text = `$(clock) ${this.formatTime()}`;
        }, 1000);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
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

    let disposable = vscode.commands.registerCommand('extension.showTimeAnimation', () => {
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
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(initialTime) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Elapsed Time</title>
<style>
    * { box-sizing: border-box; }
    body {
        margin: 0;
        padding: 0;
        background-color: #000;
        color: #fff;
        font-family: sans-serif;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .header {
        text-align: center;
        padding: 20px;
        font-size: 4em;
        font-weight: bold;
    }
    .main {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .timer-container {
        display: flex;
        align-items: center;
        gap: 20px;
    }
    .time-container {
        background-color: #444;
        border-radius: 10px;
        padding: 20px;
        min-width: 150px;
        text-align: center;
    }
    .digit {
        font-size: 5em;
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
        font-size: 2em;
        margin-top: 10px;
    }
    .separator {
        font-size: 4em;
        line-height: 1;
    }
    .footer {
        text-align: center;
        padding: 20px;
        font-size: 1.5em;
        color: #aaa;
    }
</style>
</head>
<body>
    <div class="header">Counter V1</div>
    <div class="main">
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
<script>
    let elapsed = ${initialTime};
    let prevHours = null, prevMinutes = null, prevSeconds = null;
    
    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return { hours, minutes, seconds };
    }
    
    function updateDisplay() {
        elapsed++;
        const time = formatTime(elapsed);
        const hoursDigit = document.getElementById('hoursDigit');
        const minutesDigit = document.getElementById('minutesDigit');
        const secondsDigit = document.getElementById('secondsDigit');
        
        if (prevHours !== time.hours) {
            hoursDigit.innerText = time.hours;
            hoursDigit.classList.add('pulse');
            setTimeout(() => {
                hoursDigit.classList.remove('pulse');
            }, 400);
            prevHours = time.hours;
        }
        if (prevMinutes !== time.minutes) {
            minutesDigit.innerText = time.minutes;
            minutesDigit.classList.add('pulse');
            setTimeout(() => {
                minutesDigit.classList.remove('pulse');
            }, 400);
            prevMinutes = time.minutes;
        }
        if (prevSeconds !== time.seconds) {
            secondsDigit.innerText = time.seconds;
            secondsDigit.classList.add('pulse');
            setTimeout(() => {
                secondsDigit.classList.remove('pulse');
            }, 400);
            prevSeconds = time.seconds;
        }
    }
    
    // Initialize display with initial values
    const initialTimeValues = formatTime(elapsed);
    document.getElementById('hoursDigit').innerText = initialTimeValues.hours;
    document.getElementById('minutesDigit').innerText = initialTimeValues.minutes;
    document.getElementById('secondsDigit').innerText = initialTimeValues.seconds;
    prevHours = initialTimeValues.hours;
    prevMinutes = initialTimeValues.minutes;
    prevSeconds = initialTimeValues.seconds;
    
    setInterval(updateDisplay, 1000);
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
