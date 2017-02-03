'use strict';

const padDigits = function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) +
        number;
};
const calculatePercentsLeft = function calculatePercentsLeft(value, from) {
    return Math.floor(Math.ceil(value / 1000) / (from * 60) * 100);
};
const calculateScaleFactor = function calculateScaleFactor(percent) {
    return 1 - (100 - percent) / 100;
};

let vibrateInterval;

function startVibrate(duration) {
    navigator.vibrate(duration);
}

function stopVibrate() {
    if(vibrateInterval) clearInterval(vibrateInterval);
    navigator.vibrate(0);
}

function startPeristentVibrate(duration, interval) {
    vibrateInterval = setInterval(function() {
        startVibrate(duration);
    }, interval);
}

function guid() {
    function s4() {
        return Math
            .floor((1 + Math.random()) * 65536)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() +
        s4() +
        s4();
}
const settings = {
    minute: {
        buttonTxt: 'Reset',
        waveFrontColor: '#34495e',
        waveBackColor: '#95a5a6',
        stageBg: '#2c3e50',
        durationInMinutes: 1
    },
    pomodoro: {
        buttonTxt: 'Switch task',
        waveFrontColor: '#e74c3c',
        waveBackColor: '#c0392b',
        stageBg: '#2c3e50',
        durationInMinutes: 15
    },
    softegg: {
        buttonTxt: 'Another One?',
        waveFrontColor: '#ecf0f1',
        waveBackColor: '#f39c12',
        stageBg: '#bdc3c7',
        durationInMinutes: 6
    }
};
new Vue({
    el: '#stage',
    data: function data() {
        return {
            color: '',
            percents: [ 100 ],
            percentsLeft: 100,
            secondsLeft: 0,
            waveStyles: '',
            duration: 1,
            timer: [],
            selectedVoice: {},
            countdownObj: {},
            isRunning: false,
            activeReminder: settings.minute,
            menuOpen: false,
            isListening: false,
            stageBg: settings.minute.stageBg
        };
    },
    mounted: function mounted() {
        const _this = this;
        this.resetTimer();
    },
    watch: {
        percentsLeft: function percentsLeft(val, oldVal) {
            if (val === oldVal) {
                return;
            }
            this.percents.splice(0, 1);
            this.percents.push(val);
        }
    },
    methods: {
        setActiveReminder: function setActiveReminder(reminder) {
            this.activeReminder = settings[reminder];
            this.stageBg = this.activeReminder.stageBg;
        },
        toggleMenu: function toggleMenu() {
            this.menuOpen = !this.menuOpen;
            if (this.menuOpen) {
                this.pauseTimer();
                this.waveStyles = 'transform: translate3d(0,100%,0); transition-delay: .25s;';
            } else {
                this.continueTimer();
            }
        },
        start: function start(reminder) {
            this.setActiveReminder(reminder);
            this.percents = [ 100 ];
            this.timer = [];
            this.menuOpen = false;
            this.resetTimer();
        },
        resetTimer: function resetTimer() {
            const durationInSeconds = 60 * this.activeReminder.durationInMinutes;
            this.startTimer(durationInSeconds);
        },
        startTimer: function startTimer(secondsLeft) {
            const _this2 = this;
            const now = new Date();
            if (this.countdown) {
                window.clearInterval(this.countdown);
            }
            this.countdown = countdown(
                function(ts) {
                    _this2.isRunning = true;
                    _this2.secondsLeft = Math.ceil(ts.value / 1000);
                    _this2.percentsLeft = calculatePercentsLeft(
                        ts.value,
                        _this2.activeReminder.durationInMinutes
                    );
                    _this2.waveStyles = 'transform: scale(1,' +
                        calculateScaleFactor(_this2.percentsLeft) +
                        ')';
                    _this2.updateCountdown(ts);
                    if (_this2.percentsLeft == 10) {
                        _this2.giveWarning();
                    }
                    if (_this2.percentsLeft <= 0) {
                        _this2.timeIsUpMessage();
                        _this2.pauseTimer();
                        _this2.timer = [];
                    }
                },
                now.getTime() + secondsLeft * 1000
            );
        },
        updateCountdown: function updateCountdown(ts) {
            if (this.timer.length > 2) {
                this.timer.splice(2);
            }
            const newTime = {
                id: guid(),
                value: padDigits(ts.minutes, 2) + ':' + padDigits(ts.seconds, 2)
            };
            this.timer.unshift(newTime);
        },
        pauseTimer: function pauseTimer() {
            window.clearInterval(this.countdown);
            this.isRunning = false;
        },
        toggleTimer: function toggleTimer() {
            if (this.isRunning) {
                this.pauseTimer();
            } else {
                this.startTimer(this.secondsLeft - 1);
            }
        },
        continueTimer: function continueTimer() {
            if (this.secondsLeft > 0) {
                this.startTimer(this.secondsLeft - 1);
            }
        },
        giveWarning: function giveWarning() {
            navigator.vibrate([ 300, 300, 300, 300, 300 ]);
        },
        timeIsUpMessage: function timeIsUpMessage() {
            startPeristentVibrate(1000, 500);
        },
        timerResetMessage: function timerResetMessage() {
            navigator.vibrate([300, 300]);
        },
        reset: function reset() {
            this.resetTimer();
            this.timerResetMessage();
            setTimeout(stopVibrate, 1000)
        },
        refetch: function() {
            localStorage.clear();
            location.reload(true);
        },
        mouseOver: function mouseOver(type) {
            this.stageBg = settings[type].stageBg;
        },
        mouseOut: function mouseOut() {
            this.stageBg = this.activeReminder.stageBg;
        }
    }
});