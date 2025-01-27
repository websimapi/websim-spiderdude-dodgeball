class ScoreManager {
  constructor() {
    this.personalHighScores = this.loadScores('personalHighScores') || [];
    this.startTime = null;
    this.stopwatchInterval = null;
    this.currentTime = 0;
  }

  loadScores(key) {
    const scores = localStorage.getItem(key);
    return scores ? JSON.parse(scores) : null;
  }

  saveScores() {
    localStorage.setItem('personalHighScores', JSON.stringify(this.personalHighScores));
  }

  startStopwatch() {
    this.startTime = Date.now();
    this.currentTime = 0;
    this.updateStopwatchDisplay();
    
    this.stopwatchInterval = setInterval(() => {
      this.currentTime = Date.now() - this.startTime;
      this.updateStopwatchDisplay();
    }, 10);
  }

  stopStopwatch() {
    if (this.stopwatchInterval) {
      clearInterval(this.stopwatchInterval);
      this.stopwatchInterval = null;
    }
    return this.currentTime;
  }

  updateStopwatchDisplay() {
    const display = document.querySelector('.stopwatch');
    if (display) {
      display.textContent = this.formatTime(this.currentTime);
    }
  }

  formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }

  addScore(time) {
    const scoreEntry = {
      time: time,
      date: new Date().toISOString()
    };

    // Update personal best if it's the first score or better than the current best
    if (this.personalHighScores.length === 0) {
      this.personalHighScores = [scoreEntry];
      this.saveScores();
    } else if (time > this.personalHighScores[0].time) {
      // Only update if the new time is higher (survived longer)
      this.personalHighScores = [scoreEntry];
      this.saveScores();
    }

    this.updateScoreDisplay();
  }

  updateScoreDisplay() {
    const personalList = document.querySelector('.personal-scores');
    if (personalList && this.personalHighScores.length > 0) {
      personalList.innerHTML = `<li><span>Best</span> <span class="time">${this.formatTime(this.personalHighScores[0].time)}</span></li>`;
    }
  }
}

const scoreManager = new ScoreManager();