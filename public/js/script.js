/**
 * FitHub Core JavaScript Engine (Enhanced Systematic Interactive Edition)
 * Modern, Interactive, AI-Powered Fitness Ecosystem
 * Pure Black / White / Grey Dark Aesthetic
 */

// ============================================================================
// 1. App Environment & Dynamic Path Resolution
// ============================================================================
const FitHubPath = {
    getContext() {
        const path = window.location.pathname.replace(/\\/g, '/');
        if (path.includes('/src/ai-features/')) {
            return 'AI_FEATURES';
        } else if (path.includes('/pages/')) {
            return 'PAGES';
        } else {
            return 'ROOT';
        }
    },

    asset(relativePath) {
        const ctx = this.getContext();
        const clean = relativePath.replace(/^(\.\.\/)+/, '').replace(/^assets\//, '');
        if (ctx === 'AI_FEATURES') {
            return `../../public/assets/${clean}`;
        } else if (ctx === 'PAGES') {
            return `../assets/${clean}`;
        } else {
            return `assets/${clean}`;
        }
    },

    page(targetPage) {
        const ctx = this.getContext();
        const targetClean = targetPage.replace(/^(\.\.\/)+/, '').replace(/^(pages\/|public\/pages\/)/, '');
        
        if (targetClean === 'index.html' || targetClean === '') {
            if (ctx === 'AI_FEATURES') return '../../public/index.html';
            if (ctx === 'PAGES') return '../index.html';
            return 'index.html';
        }

        if (targetClean === 'ai.html') {
            if (ctx === 'AI_FEATURES') return 'ai.html';
            if (ctx === 'PAGES') return '../../src/ai-features/ai.html';
            return '../src/ai-features/ai.html';
        }

        if (ctx === 'AI_FEATURES') return `../../public/pages/${targetClean}`;
        if (ctx === 'PAGES') return targetClean;
        return `pages/${targetClean}`;
    }
};

// ============================================================================
// 2. Synthesized Web Audio API Sound Manager
// ============================================================================
const FitHubAudio = {
    ctx: null,
    muted: localStorage.getItem('fithub_muted') === 'true',

    init() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
    },

    playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
        if (this.muted) return;
        try {
            this.init();
            if (!this.ctx) return;
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn("Audio error:", e);
        }
    },

    playClick() {
        this.playTone(850, 'sine', 0.04, 0.08);
    },

    playTick() {
        this.playTone(1200, 'sine', 0.02, 0.05);
    },

    playSuccess() {
        if (this.muted) return;
        this.playTone(523.25, 'sine', 0.1, 0.12);
        setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.15), 80);
    },

    playTimerDone() {
        if (this.muted) return;
        this.playTone(880, 'triangle', 0.18, 0.2);
        setTimeout(() => this.playTone(1174.66, 'triangle', 0.2, 0.22), 160);
        setTimeout(() => this.playTone(1760, 'sine', 0.35, 0.25), 340);
    },

    playWater() {
        if (this.muted) return;
        this.playTone(600, 'sine', 0.08, 0.12);
        setTimeout(() => this.playTone(800, 'sine', 0.1, 0.15), 60);
    },

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('fithub_muted', this.muted);
        this.updateButtons();
        return this.muted;
    },

    updateButtons() {
        const btns = document.querySelectorAll('.sound-toggle-btn');
        btns.forEach(btn => {
            btn.innerHTML = this.muted ? '🔇' : '🔊';
            btn.title = this.muted ? 'Sound: Muted (Click to Unmute)' : 'Sound: Active (Click to Mute)';
            if (this.muted) btn.classList.add('muted');
            else btn.classList.remove('muted');
        });
    }
};

// ============================================================================
// 3. Centralized Interactive State Management (FitHubState)
// ============================================================================
const FitHubState = {
    today: new Date().toISOString().split('T')[0],
    data: {
        reps: 0,
        repsTarget: 50,
        waterGlasses: 0,
        waterTarget: 8,
        calories: 0,
        caloriesTarget: 400,
        streak: 3,
        habits: {},
        challengeReps: 0,
        challengeTarget: 30
    },

    init() {
        const saved = localStorage.getItem('fithub_interactive_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.date === this.today) {
                    this.data = { ...this.data, ...parsed.data };
                } else {
                    // New day: retain streak and habits, reset daily counters
                    this.data.streak = parsed.data.streak || 1;
                    this.data.habits = parsed.data.habits || {};
                }
            } catch (e) {
                console.warn("State parse error:", e);
            }
        }
        this.save();
    },

    save() {
        localStorage.setItem('fithub_interactive_state', JSON.stringify({
            date: this.today,
            data: this.data
        }));
        this.notify();
    },

    addWater(glasses = 1) {
        this.data.waterGlasses = Math.min(16, this.data.waterGlasses + glasses);
        FitHubAudio.playWater();
        this.save();
        if (this.data.waterGlasses === this.data.waterTarget) {
            FitHubAudio.playSuccess();
            FitHubVoice.speak("Daily hydration target achieved! Outstanding work.");
        }
    },

    addReps(reps = 10, calories = null) {
        this.data.reps += reps;
        const cal = calories || Math.round(reps * 0.35);
        this.data.calories += cal;
        FitHubAudio.playSuccess();
        this.save();
    },

    addChallengeReps(delta = 1) {
        this.data.challengeReps = Math.max(0, Math.min(100, this.data.challengeReps + delta));
        this.data.reps += Math.max(0, delta);
        this.data.calories += Math.max(0, Math.round(delta * 0.4));
        FitHubAudio.playClick();
        this.save();
        if (this.data.challengeReps >= this.data.challengeTarget) {
            FitHubAudio.playSuccess();
        }
    },

    toggleHabitDay(dayName) {
        this.data.habits[dayName] = !this.data.habits[dayName];
        if (this.data.habits[dayName]) {
            FitHubAudio.playSuccess();
            this.data.streak += 1;
        } else {
            FitHubAudio.playClick();
            this.data.streak = Math.max(1, this.data.streak - 1);
        }
        this.save();
    },

    notify() {
        FitHubDashboard.renderRings();
        FitHubDashboard.renderHabitCalendar();
        FitHubDashboard.renderChallenge();
    }
};

// ============================================================================
// 4. Interactive Live Dashboard & Command Center Controller
// ============================================================================
const FitHubDashboard = {
    init() {
        FitHubState.init();
        this.initSliders();
        this.renderRings();
        this.renderHabitCalendar();
        this.renderChallenge();
        this.initDock();
    },

    renderRings() {
        const d = FitHubState.data;

        // 1. Move/Workout Ring (circumference = 2 * PI * 32 = 201.06)
        const C = 201.06;
        const movePct = Math.min(1, d.reps / (d.repsTarget || 50));
        const moveOffset = C - (movePct * C);
        const moveBar = document.getElementById('ringBarMove');
        if (moveBar) moveBar.style.strokeDashoffset = moveOffset;
        const moveVal = document.getElementById('ringValMove');
        if (moveVal) moveVal.innerText = `${d.reps} Reps`;

        // 2. Water Ring
        const waterPct = Math.min(1, d.waterGlasses / (d.waterTarget || 8));
        const waterOffset = C - (waterPct * C);
        const waterBar = document.getElementById('ringBarWater');
        if (waterBar) waterBar.style.strokeDashoffset = waterOffset;
        const waterVal = document.getElementById('ringValWater');
        if (waterVal) waterVal.innerText = `${d.waterGlasses}/${d.waterTarget} Cups`;

        // 3. Calorie Ring
        const calPct = Math.min(1, d.calories / (d.caloriesTarget || 400));
        const calOffset = C - (calPct * C);
        const calBar = document.getElementById('ringBarCal');
        if (calBar) calBar.style.strokeDashoffset = calOffset;
        const calVal = document.getElementById('ringValCal');
        if (calVal) calVal.innerText = `${d.calories} kcal`;
    },

    initSliders() {
        const weightSlider = document.getElementById('dashWeightSlider');
        const heightSlider = document.getElementById('dashHeightSlider');
        if (!weightSlider || !heightSlider) return;

        const updateBMI = () => {
            const w = parseFloat(weightSlider.value);
            const h = parseFloat(heightSlider.value);
            const wValEl = document.getElementById('dashWeightVal');
            const hValEl = document.getElementById('dashHeightVal');
            if (wValEl) wValEl.innerText = `${w} kg`;
            if (hValEl) hValEl.innerText = `${h} cm`;

            const hM = h / 100;
            const bmi = (w / (hM * hM)).toFixed(1);

            const bmiValEl = document.getElementById('dashBmiVal');
            const bmiPillEl = document.getElementById('dashBmiPill');
            const waterRecEl = document.getElementById('dashWaterRec');
            const calRecEl = document.getElementById('dashCalRec');

            if (bmiValEl) bmiValEl.innerText = bmi;

            let category = "Normal";
            if (bmi < 18.5) category = "Underweight";
            else if (bmi >= 25 && bmi < 29.9) category = "Overweight";
            else if (bmi >= 30) category = "Obese";

            if (bmiPillEl) {
                bmiPillEl.innerText = category;
            }

            // Hydration recommendation: weight * 0.033 L
            const recLiters = (w * 0.033).toFixed(1);
            if (waterRecEl) waterRecEl.innerText = `${recLiters}L / day`;

            // Base maintenance calories estimate
            const estCal = Math.round(10 * w + 6.25 * h - 5 * 25 + 5);
            if (calRecEl) calRecEl.innerText = `~${estCal} kcal`;
        };

        weightSlider.addEventListener('input', () => {
            FitHubAudio.playTick();
            updateBMI();
        });

        heightSlider.addEventListener('input', () => {
            FitHubAudio.playTick();
            updateBMI();
        });

        updateBMI();
    },

    renderHabitCalendar() {
        const container = document.getElementById('dashHabitRow');
        const streakEl = document.getElementById('dashStreakCount');
        if (streakEl) streakEl.innerText = `🔥 ${FitHubState.data.streak} Day Streak`;
        if (!container) return;

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const todayDayIdx = (new Date().getDay() + 6) % 7; // Mon = 0
        container.innerHTML = '';

        days.forEach((day, idx) => {
            const isChecked = !!FitHubState.data.habits[day];
            const isToday = idx === todayDayIdx;

            const pill = document.createElement('div');
            pill.className = `habit-day-pill ${isChecked ? 'checked' : ''} ${isToday ? 'today' : ''}`;
            pill.innerHTML = `
                <span class="habit-day-name">${day}</span>
                <span class="habit-check-icon">${isChecked ? '✓' : '○'}</span>
            `;
            pill.title = `Click to log ${day} workout`;
            pill.addEventListener('click', () => {
                FitHubState.toggleHabitDay(day);
            });
            container.appendChild(pill);
        });
    },

    renderChallenge() {
        const fill = document.getElementById('dashChallengeFill');
        const text = document.getElementById('dashChallengeProgress');
        if (!fill || !text) return;

        const d = FitHubState.data;
        const pct = Math.min(100, (d.challengeReps / d.challengeTarget) * 100);
        fill.style.width = `${pct}%`;
        text.innerText = `${d.challengeReps} / ${d.challengeTarget} Reps (${Math.round(pct)}%)`;
    },

    initDock() {
        if (document.getElementById('fithubFloatingDock')) return;
        const dock = document.createElement('div');
        dock.id = 'fithubFloatingDock';
        dock.className = 'fithub-floating-dock';

        dock.innerHTML = `
            <button class="dock-item-btn primary-highlight" onclick="FitHubWorkoutPlayer.start('quick')">
                <span>🏋️</span><span class="dock-label">Start Workout</span>
            </button>
            <button class="dock-item-btn" onclick="startRestTimer(60, 'Rest Interval')">
                <span>⏱️</span><span class="dock-label">Rest</span>
            </button>
            <button class="dock-item-btn" onclick="FitHubState.addWater(1)">
                <span>💧</span><span class="dock-label">+1 Cup</span>
            </button>
            <button class="dock-item-btn" onclick="openChat()">
                <span>🤖</span><span class="dock-label">Chitti</span>
            </button>
            <button class="dock-item-btn" onclick="openVoiceAssistant()">
                <span>🎙️</span><span class="dock-label">Voice</span>
            </button>
        `;

        document.body.appendChild(dock);
    }
};

// ============================================================================
// 5. Live Interactive Guided Workout Player (FitHubWorkoutPlayer)
// ============================================================================
const FitHubWorkoutPlayer = {
    modal: null,
    routines: {
        quick: {
            title: "⚡ 15-Minute Full Body Power",
            exercises: [
                { name: "Barbell Bench Press", target: "Overall Chest & Triceps", sets: 3, reps: 10, rest: 45, img: "assets/animations/workouts/chest1.gif" },
                { name: "Wide-Grip Lat Pulldown", target: "Lats & Upper Back", sets: 3, reps: 10, rest: 45, img: "assets/animations/workouts/back1.gif" },
                { name: "Barbell Back Squat", target: "Quadriceps & Glutes", sets: 3, reps: 12, rest: 60, img: "assets/animations/workouts/leg.gif" },
                { name: "Overhead Dumbbell Press", target: "Shoulders & Traps", sets: 3, reps: 10, rest: 45, img: "assets/animations/workouts/shoulder1.gif" }
            ]
        },
        chest: {
            title: "💥 Heavy Chest Builder",
            exercises: [
                { name: "Barbell Bench Press", target: "Pectoralis Major", sets: 4, reps: 8, rest: 60, img: "assets/animations/workouts/chest1.gif" },
                { name: "Incline Dumbbell Press", target: "Upper Clavicular Pecs", sets: 3, reps: 10, rest: 60, img: "assets/animations/workouts/chest2.gif" },
                { name: "Dumbbell Chest Flyes", target: "Outer Chest Stretch", sets: 3, reps: 12, rest: 45, img: "assets/animations/workouts/chest3.gif" },
                { name: "Bodyweight Push-Ups", target: "Chest & Core Burnout", sets: 3, reps: 15, rest: 45, img: "assets/animations/workouts/chest5.gif" }
            ]
        }
    },

    currentRoutine: null,
    currentExIdx: 0,
    currentSetNum: 1,
    restInterval: null,
    restSecondsRemaining: 0,

    init() {
        if (document.getElementById('fithubGuidedPlayer')) {
            this.modal = document.getElementById('fithubGuidedPlayer');
            return;
        }

        const div = document.createElement('div');
        div.id = 'fithubGuidedPlayer';
        div.className = 'guided-workout-overlay';
        div.innerHTML = `
            <div class="guided-player-container">
                <div class="player-header">
                    <div>
                        <div class="player-title" id="playerRoutineTitle">Workout Session</div>
                        <div style="font-size: 0.75rem; color: #a1a1aa;" id="playerExCounter">Exercise 1 of 4</div>
                    </div>
                    <button class="timer-icon-btn" onclick="FitHubWorkoutPlayer.close()" title="Exit Workout">✕</button>
                </div>

                <div class="player-gif-wrap">
                    <img id="playerExImg" src="" alt="Exercise Demonstration">
                </div>

                <div class="player-exercise-name" id="playerExName">Exercise Name</div>
                <div class="player-target-muscle" id="playerExTarget">🎯 Target: Muscle Group</div>

                <div class="player-set-tracker-box">
                    <div>
                        <span style="font-size: 0.78rem; font-weight: 700; color: #a1a1aa; display: block;">ACTIVE SET</span>
                        <span style="font-size: 1.3rem; font-weight: 800; color: #ffffff;" id="playerActiveSet">Set 1 of 3</span>
                    </div>
                    <div class="player-inputs-wrap">
                        <div>
                            <label>Kg</label><br>
                            <input type="number" id="playerWeightInput" class="set-log-input" placeholder="0" min="0" value="40">
                        </div>
                        <div>
                            <label>Reps</label><br>
                            <input type="number" id="playerRepsInput" class="set-log-input" placeholder="10" min="1" value="10">
                        </div>
                    </div>
                </div>

                <div class="player-actions-row">
                    <button type="button" class="cta-btn cta-btn-secondary" onclick="FitHubWorkoutPlayer.prevExercise()">← Previous</button>
                    <button type="button" class="cta-btn cta-btn-primary" id="playerCompleteSetBtn" onclick="FitHubWorkoutPlayer.completeCurrentSet()">✓ Complete Set</button>
                    <button type="button" class="cta-btn cta-btn-secondary" onclick="FitHubWorkoutPlayer.nextExercise()">Next →</button>
                </div>

                <!-- Rest Countdown Overlay -->
                <div class="player-rest-overlay" id="playerRestOverlay">
                    <div style="font-size: 0.85rem; font-weight: 700; color: #a1a1aa; letter-spacing: 1px;">REST PERIOD</div>
                    <div class="rest-time-giant" id="playerRestGiant">00:45</div>
                    <p style="color: #d4d4d8; font-size: 0.9rem; margin-bottom: 16px;">Hydrate and catch your breath!</p>
                    <button type="button" class="cta-btn cta-btn-primary" onclick="FitHubWorkoutPlayer.skipRest()">Skip Rest ➔</button>
                </div>
            </div>
        `;

        document.body.appendChild(div);
        this.modal = div;
    },

    start(routineKey = 'quick') {
        this.init();
        this.currentRoutine = this.routines[routineKey] || this.routines.quick;
        this.currentExIdx = 0;
        this.currentSetNum = 1;

        FitHubAudio.playSuccess();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        this.renderExercise();
        FitHubVoice.speak(`Starting ${this.currentRoutine.title}. First up: ${this.currentRoutine.exercises[0].name}`);
    },

    renderExercise() {
        const ex = this.currentRoutine.exercises[this.currentExIdx];
        if (!ex) return;

        document.getElementById('playerRoutineTitle').innerText = this.currentRoutine.title;
        document.getElementById('playerExCounter').innerText = `Exercise ${this.currentExIdx + 1} of ${this.currentRoutine.exercises.length}`;
        document.getElementById('playerExName').innerText = ex.name;
        document.getElementById('playerExTarget').innerText = `🎯 Target: ${ex.target}`;
        document.getElementById('playerActiveSet').innerText = `Set ${this.currentSetNum} of ${ex.sets}`;
        document.getElementById('playerExImg').src = FitHubPath.asset(ex.img);
        document.getElementById('playerRepsInput').value = ex.reps;
    },

    completeCurrentSet() {
        const ex = this.currentRoutine.exercises[this.currentExIdx];
        const reps = parseInt(document.getElementById('playerRepsInput').value) || ex.reps;
        FitHubAudio.playSuccess();

        // Add to global state
        FitHubState.addReps(reps);

        if (this.currentSetNum < ex.sets) {
            this.currentSetNum++;
            this.startRestCountdown(ex.rest || 45);
        } else {
            // Exercise complete
            if (this.currentExIdx < this.currentRoutine.exercises.length - 1) {
                this.currentExIdx++;
                this.currentSetNum = 1;
                this.startRestCountdown(ex.rest || 60);
                FitHubVoice.speak(`Exercise completed! Next: ${this.currentRoutine.exercises[this.currentExIdx].name}`);
            } else {
                this.finishWorkout();
            }
        }
    },

    startRestCountdown(sec) {
        const overlay = document.getElementById('playerRestOverlay');
        const readout = document.getElementById('playerRestGiant');
        overlay.classList.add('active');
        this.restSecondsRemaining = sec;

        readout.innerText = `00:${this.restSecondsRemaining.toString().padStart(2, '0')}`;

        clearInterval(this.restInterval);
        this.restInterval = setInterval(() => {
            this.restSecondsRemaining--;
            if (this.restSecondsRemaining >= 0) {
                const s = this.restSecondsRemaining % 60;
                const m = Math.floor(this.restSecondsRemaining / 60);
                readout.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

                if (this.restSecondsRemaining <= 3 && this.restSecondsRemaining > 0) {
                    FitHubAudio.playTone(880, 'sine', 0.08, 0.15);
                }
            } else {
                this.skipRest();
            }
        }, 1000);
    },

    skipRest() {
        clearInterval(this.restInterval);
        document.getElementById('playerRestOverlay').classList.remove('active');
        FitHubAudio.playTimerDone();
        this.renderExercise();
    },

    nextExercise() {
        FitHubAudio.playClick();
        if (this.currentExIdx < this.currentRoutine.exercises.length - 1) {
            this.currentExIdx++;
            this.currentSetNum = 1;
            this.renderExercise();
        }
    },

    prevExercise() {
        FitHubAudio.playClick();
        if (this.currentExIdx > 0) {
            this.currentExIdx--;
            this.currentSetNum = 1;
            this.renderExercise();
        }
    },

    finishWorkout() {
        clearInterval(this.restInterval);
        this.close();
        FitHubAudio.playTimerDone();
        FitHubVoice.speak("Session finished! Phenomenal effort today.");

        showFeatureModal("🏆 Workout Complete!", `
            <div style="text-align: center; padding: 10px 0;">
                <div style="font-size: 3rem; margin-bottom: 8px;">🔥</div>
                <h3 style="color: #ffffff; margin-bottom: 6px;">Routine Crushed!</h3>
                <p style="color: #a1a1aa; font-size: 0.9rem;">Total Reps Logged: <b>+${FitHubState.data.reps}</b><br>Estimated Calories: <b>+${FitHubState.data.calories} kcal</b></p>
                <div style="margin-top: 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 10px;">
                    <span style="font-size: 0.85rem; color: #ffffff; font-weight: 700;">Active Streak: ${FitHubState.data.streak} Days 🔥</span>
                </div>
            </div>
        `);
    },

    close() {
        clearInterval(this.restInterval);
        if (this.modal) this.modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
};

// ============================================================================
// 6. Global Floating Dockable Rest Timer (FitHubTimer)
// ============================================================================
const FitHubTimer = {
    seconds: 60,
    totalSeconds: 60,
    interval: null,
    isPaused: false,
    currentExercise: "Rest Period",
    element: null,

    init() {
        if (document.getElementById('fithubFloatingTimer')) {
            this.element = document.getElementById('fithubFloatingTimer');
            return;
        }

        const div = document.createElement('div');
        div.id = 'fithubFloatingTimer';
        div.className = 'fithub-floating-timer minimized';
        div.style.display = 'none';

        div.innerHTML = `
            <div class="timer-header">
                <div class="timer-mini-display" id="timerMiniDisplay">
                    <span>⏱️</span>
                    <span id="timerMiniTime">01:00</span>
                </div>
                <div class="timer-title" id="timerTitleFull">⏱️ Rest Timer</div>
                <div class="timer-header-btns">
                    <button class="timer-icon-btn" id="timerMinMaxBtn" title="Toggle Size">⤢</button>
                    <button class="timer-icon-btn" id="timerCloseBtn" title="Close Timer">✕</button>
                </div>
            </div>
            <div class="timer-body">
                <div class="timer-exercise-name" id="timerExerciseName">Resting: Exercise</div>
                <div class="timer-time-readout" id="timerReadout">01:00</div>
                <div class="timer-progress-track">
                    <div class="timer-progress-fill" id="timerProgressFill"></div>
                </div>
                <div class="timer-main-controls">
                    <button class="timer-btn-primary" id="timerPlayPauseBtn">Pause</button>
                    <button class="timer-btn-secondary" id="timerResetBtn">Reset</button>
                </div>
            </div>
            <div class="timer-quick-adjust">
                <button class="timer-adjust-btn" onclick="FitHubTimer.adjust(-15)">-15s</button>
                <button class="timer-adjust-btn" onclick="FitHubTimer.adjust(15)">+15s</button>
            </div>
            <div class="timer-presets">
                <button class="timer-preset-chip" onclick="FitHubTimer.setPreset(30)">30s</button>
                <button class="timer-preset-chip" onclick="FitHubTimer.setPreset(60)">60s</button>
                <button class="timer-preset-chip" onclick="FitHubTimer.setPreset(90)">90s</button>
                <button class="timer-preset-chip" onclick="FitHubTimer.setPreset(120)">120s</button>
            </div>
        `;

        document.body.appendChild(div);
        this.element = div;

        document.getElementById('timerMinMaxBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            FitHubAudio.playClick();
            this.toggleMinimize();
        });

        document.getElementById('timerCloseBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            FitHubAudio.playClick();
            this.stop();
        });

        document.getElementById('timerPlayPauseBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            FitHubAudio.playClick();
            this.togglePause();
        });

        document.getElementById('timerResetBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            FitHubAudio.playClick();
            this.reset();
        });

        div.addEventListener('click', () => {
            if (this.element.classList.contains('minimized')) {
                FitHubAudio.playClick();
                this.toggleMinimize();
            }
        });
    },

    start(seconds = 60, exerciseName = "Rest Period") {
        this.init();
        this.currentExercise = exerciseName;
        this.totalSeconds = seconds;
        this.seconds = seconds;
        this.isPaused = false;

        const exNameEl = document.getElementById('timerExerciseName');
        if (exNameEl) exNameEl.innerText = `Resting: ${exerciseName}`;

        const playBtn = document.getElementById('timerPlayPauseBtn');
        if (playBtn) playBtn.innerText = "Pause";

        this.element.style.display = 'block';
        this.element.classList.remove('minimized');
        this.updateDisplay();

        clearInterval(this.interval);
        this.interval = setInterval(() => {
            if (!this.isPaused) {
                if (this.seconds > 0) {
                    this.seconds--;
                    this.updateDisplay();
                } else {
                    this.finish();
                }
            }
        }, 1000);
    },

    togglePause() {
        this.isPaused = !this.isPaused;
        const playBtn = document.getElementById('timerPlayPauseBtn');
        if (playBtn) {
            playBtn.innerText = this.isPaused ? "Resume" : "Pause";
        }
    },

    adjust(delta) {
        this.seconds = Math.max(5, this.seconds + delta);
        this.totalSeconds = Math.max(this.seconds, this.totalSeconds);
        this.updateDisplay();
        FitHubAudio.playClick();
    },

    setPreset(sec) {
        this.start(sec, this.currentExercise);
        FitHubAudio.playClick();
    },

    reset() {
        this.seconds = this.totalSeconds;
        this.isPaused = false;
        const playBtn = document.getElementById('timerPlayPauseBtn');
        if (playBtn) playBtn.innerText = "Pause";
        this.updateDisplay();
    },

    toggleMinimize() {
        this.element.classList.toggle('minimized');
    },

    stop() {
        clearInterval(this.interval);
        if (this.element) this.element.style.display = 'none';
    },

    finish() {
        clearInterval(this.interval);
        FitHubAudio.playTimerDone();
        FitHubVoice.speak("Rest period finished! Time for your next set!");

        const readout = document.getElementById('timerReadout');
        if (readout) readout.innerText = "00:00";

        setTimeout(() => {
            this.stop();
        }, 2000);
    },

    updateDisplay() {
        const mins = Math.floor(this.seconds / 60);
        const secs = this.seconds % 60;
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        const readout = document.getElementById('timerReadout');
        const miniTime = document.getElementById('timerMiniTime');
        const progressFill = document.getElementById('timerProgressFill');

        if (readout) readout.innerText = timeStr;
        if (miniTime) miniTime.innerText = timeStr;
        if (progressFill && this.totalSeconds > 0) {
            const pct = (this.seconds / this.totalSeconds) * 100;
            progressFill.style.width = `${pct}%`;
        }
    }
};

function startRestTimer(seconds = 60, exerciseName = "Exercise Rest") {
    FitHubAudio.playClick();
    FitHubTimer.start(seconds, exerciseName);
}
function pauseResumeTimer() { FitHubTimer.togglePause(); }
function closeRestTimer() { FitHubTimer.stop(); }

// ============================================================================
// 7. Interactive Exercise Cards (Set Logger & Bookmarks)
// ============================================================================
const FitHubExercises = {
    favorites: JSON.parse(localStorage.getItem('fithub_favorites') || '[]'),
    loggedSets: JSON.parse(localStorage.getItem('fithub_logged_sets') || '{}'),

    init() {
        const cards = document.querySelectorAll('.exercise-card');
        if (cards.length === 0) return;

        cards.forEach((card, index) => {
            const titleEl = card.querySelector('.exercise-title');
            const exerciseName = titleEl ? titleEl.innerText.trim() : `Exercise ${index + 1}`;
            const exId = exerciseName.toLowerCase().replace(/[^a-z0-9]/g, '-');

            if (!card.querySelector('.exercise-fav-btn')) {
                const favBtn = document.createElement('button');
                favBtn.className = 'exercise-fav-btn';
                const isFav = this.favorites.includes(exId);
                if (isFav) favBtn.classList.add('active');
                favBtn.innerHTML = '★';
                favBtn.title = isFav ? 'Remove from Favorites' : 'Add to Favorites';

                favBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    FitHubAudio.playClick();
                    this.toggleFavorite(exId, favBtn);
                });
                card.appendChild(favBtn);
            }

            const details = card.querySelector('.exercise-details');
            if (details && !details.querySelector('.exercise-actions-bar')) {
                const actionsBar = document.createElement('div');
                actionsBar.className = 'exercise-actions-bar';

                const timerBtn = details.querySelector('.timer-start-btn');
                if (timerBtn) {
                    actionsBar.appendChild(timerBtn);
                }

                const logBtn = document.createElement('button');
                logBtn.className = 'set-log-toggle-btn';
                logBtn.innerHTML = '📝 Track Sets';
                actionsBar.appendChild(logBtn);

                details.appendChild(actionsBar);

                const drawer = document.createElement('div');
                drawer.className = 'set-logger-drawer';
                drawer.id = `drawer-${exId}`;
                drawer.innerHTML = `
                    <table class="set-log-table">
                        <thead>
                            <tr>
                                <th>Set</th>
                                <th>Weight (kg)</th>
                                <th>Reps</th>
                                <th>Done</th>
                            </tr>
                        </thead>
                        <tbody id="sets-${exId}">
                            ${this.renderSetRows(exId, 3)}
                        </tbody>
                    </table>
                    <button type="button" class="add-set-btn" onclick="FitHubExercises.addSetRow('${exId}')">+ Add Set</button>
                `;
                details.appendChild(drawer);

                logBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    FitHubAudio.playClick();
                    drawer.classList.toggle('open');
                    logBtn.innerHTML = drawer.classList.contains('open') ? '✕ Close Log' : '📝 Track Sets';
                });
            }
        });

        this.addFavoritesFilterChip();
    },

    renderSetRows(exId, count) {
        let html = '';
        for (let i = 1; i <= count; i++) {
            html += `
                <tr id="row-${exId}-${i}">
                    <td style="font-weight:700; color:#ffffff;">${i}</td>
                    <td><input type="number" class="set-log-input" placeholder="0" min="0" max="500"></td>
                    <td><input type="number" class="set-log-input" placeholder="10" min="1" max="100"></td>
                    <td>
                        <button type="button" class="set-check-btn" onclick="FitHubExercises.toggleSetDone('${exId}', ${i}, this)">✓</button>
                    </td>
                </tr>
            `;
        }
        return html;
    },

    addSetRow(exId) {
        FitHubAudio.playClick();
        const tbody = document.getElementById(`sets-${exId}`);
        if (!tbody) return;
        const currentCount = tbody.querySelectorAll('tr').length + 1;
        const tr = document.createElement('tr');
        tr.id = `row-${exId}-${currentCount}`;
        tr.innerHTML = `
            <td style="font-weight:700; color:#ffffff;">${currentCount}</td>
            <td><input type="number" class="set-log-input" placeholder="0" min="0" max="500"></td>
            <td><input type="number" class="set-log-input" placeholder="10" min="1" max="100"></td>
            <td>
                <button type="button" class="set-check-btn" onclick="FitHubExercises.toggleSetDone('${exId}', ${currentCount}, this)">✓</button>
            </td>
        `;
        tbody.appendChild(tr);
    },

    toggleSetDone(exId, setNum, btn) {
        const isDone = btn.classList.toggle('completed');
        if (isDone) {
            FitHubAudio.playSuccess();
            FitHubState.addReps(10);
            FitHubTimer.start(60, `Set ${setNum} Completed`);
        } else {
            FitHubAudio.playClick();
        }
    },

    toggleFavorite(exId, btn) {
        const idx = this.favorites.indexOf(exId);
        if (idx > -1) {
            this.favorites.splice(idx, 1);
            btn.classList.remove('active');
            btn.title = 'Add to Favorites';
        } else {
            this.favorites.push(exId);
            btn.classList.add('active');
            btn.title = 'Remove from Favorites';
            FitHubAudio.playSuccess();
        }
        localStorage.setItem('fithub_favorites', JSON.stringify(this.favorites));
    },

    addFavoritesFilterChip() {
        const chipsContainer = document.querySelector('.filter-chips');
        if (!chipsContainer || chipsContainer.querySelector('[data-filter="favorites"]')) return;

        const favChip = document.createElement('button');
        favChip.className = 'chip';
        favChip.setAttribute('data-filter', 'favorites');
        favChip.innerHTML = '⭐ Favorites';
        favChip.addEventListener('click', () => {
            FitHubAudio.playClick();
        });
        chipsContainer.appendChild(favChip);
    }
};

// ============================================================================
// 8. Universal Global Voice Assistant (FitHubVoice)
// ============================================================================
const FitHubVoice = {
    recognition: null,
    modal: null,
    isListening: false,

    init() {
        this.injectModal();
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
            this.recognition = new SpeechRec();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.showModal();
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.handleResult(transcript);
            };

            this.recognition.onerror = (event) => {
                console.warn("Voice error:", event.error);
                this.updateTranscript(`Error: ${event.error}. Please try again.`);
                setTimeout(() => this.hideModal(), 2000);
            };

            this.recognition.onend = () => {
                this.isListening = false;
            };
        }

        const vaBtn = document.querySelector('.virtual-assistant');
        if (vaBtn) {
            vaBtn.addEventListener('click', (e) => {
                e.preventDefault();
                FitHubAudio.playClick();
                this.start();
            });
        }
    },

    injectModal() {
        if (document.getElementById('fithubVoiceModal')) {
            this.modal = document.getElementById('fithubVoiceModal');
            return;
        }

        const oldSpeak = document.querySelector('.speak-page');
        if (oldSpeak && oldSpeak.parentNode) {
            oldSpeak.parentNode.removeChild(oldSpeak);
        }

        const div = document.createElement('div');
        div.id = 'fithubVoiceModal';
        div.className = 'speak-page';
        div.innerHTML = `
            <div class="speak-visualizer">🎙️</div>
            <h2 style="color:#ffffff; font-size:1.6rem; font-weight:700;">FitHub Voice Assistant</h2>
            <p style="color:#a1a1aa; font-size:0.9rem; margin-top:4px;">Listening for your command...</p>
            <div class="speak-transcript" id="voiceTranscript">"Speak now..."</div>
            <div class="speak-hint-chips">
                <span class="speak-hint-chip">"Start Workout"</span>
                <span class="speak-hint-chip">"Open Chest"</span>
                <span class="speak-hint-chip">"Start 60s Rest"</span>
                <span class="speak-hint-chip">"Open Pose Trainer"</span>
                <span class="speak-hint-chip">"Motivate Me"</span>
            </div>
            <button class="speak-close-btn" id="voiceModalCloseBtn">Cancel</button>
        `;

        document.body.appendChild(div);
        this.modal = div;

        document.getElementById('voiceModalCloseBtn').addEventListener('click', () => {
            FitHubAudio.playClick();
            this.stop();
        });
    },

    start() {
        if (!this.recognition) {
            alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
            return;
        }
        try {
            this.updateTranscript("Listening...");
            this.recognition.start();
        } catch (e) {
            this.showModal();
        }
    },

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        this.hideModal();
    },

    showModal() {
        if (this.modal) this.modal.classList.add('active-speak');
    },

    hideModal() {
        if (this.modal) this.modal.classList.remove('active-speak');
    },

    updateTranscript(text) {
        const el = document.getElementById('voiceTranscript');
        if (el) el.innerText = `"${text}"`;
    },

    speak(text) {
        if (!window.speechSynthesis || FitHubAudio.muted) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.0;
        utter.pitch = 1.0;
        utter.volume = 1.0;
        utter.lang = 'en-US';
        window.speechSynthesis.speak(utter);
    },

    handleResult(rawCommand) {
        const cmd = rawCommand.toLowerCase().trim();
        this.updateTranscript(cmd);

        setTimeout(() => {
            this.hideModal();
            this.executeCommand(cmd);
        }, 800);
    },

    executeCommand(cmd) {
        if (cmd.includes('start workout') || cmd.includes('begin workout')) {
            this.speak("Launching Guided Workout Session");
            FitHubWorkoutPlayer.start('quick');
        } else if (cmd.includes('chest')) {
            this.speak("Opening Chest Workouts");
            window.location.href = FitHubPath.page('chest.html');
        } else if (cmd.includes('back')) {
            this.speak("Opening Back Workouts");
            window.location.href = FitHubPath.page('back.html');
        } else if (cmd.includes('bicep') || cmd.includes('tricep') || cmd.includes('arm')) {
            this.speak("Opening Arms Workouts");
            window.location.href = FitHubPath.page('biceps-triceps.html');
        } else if (cmd.includes('shoulder')) {
            this.speak("Opening Shoulder Workouts");
            window.location.href = FitHubPath.page('shoulder.html');
        } else if (cmd.includes('leg')) {
            this.speak("Opening Leg Workouts");
            window.location.href = FitHubPath.page('leg.html');
        } else if (cmd.includes('library') || cmd.includes('all workout') || cmd.includes('exercise')) {
            this.speak("Opening Exercise Library");
            window.location.href = FitHubPath.page('workout.html');
        } else if (cmd.includes('plan') || cmd.includes('routine')) {
            this.speak("Opening Personalized Workout Plans");
            window.location.href = FitHubPath.page('personalized-plans.html');
        } else if (cmd.includes('nutrition') || cmd.includes('diet') || cmd.includes('macro') || cmd.includes('meal')) {
            this.speak("Opening Nutrition Guide");
            window.location.href = FitHubPath.page('nutrition-guide.html');
        } else if (cmd.includes('pose') || cmd.includes('camera') || cmd.includes('trainer') || cmd.includes('ai workout')) {
            this.speak("Opening AI Pose Trainer");
            window.location.href = FitHubPath.page('ai.html');
        } else if (cmd.includes('home') || cmd.includes('dashboard')) {
            this.speak("Navigating Home");
            window.location.href = FitHubPath.page('index.html');
        } else if (cmd.includes('water') || cmd.includes('drink')) {
            FitHubState.addWater(1);
            this.speak("Logged one glass of water. Keep hydrating!");
        } else if (cmd.includes('rest') || cmd.includes('timer')) {
            let seconds = 60;
            if (cmd.includes('30')) seconds = 30;
            else if (cmd.includes('45')) seconds = 45;
            else if (cmd.includes('90')) seconds = 90;
            else if (cmd.includes('120') || cmd.includes('2 minute')) seconds = 120;
            this.speak(`Starting ${seconds} second rest timer`);
            FitHubTimer.start(seconds, "Voice Timer");
        } else if (cmd.includes('pause timer')) {
            this.speak("Rest timer paused");
            FitHubTimer.togglePause();
        } else if (cmd.includes('stop timer') || cmd.includes('close timer')) {
            this.speak("Rest timer stopped");
            FitHubTimer.stop();
        } else if (cmd.includes('chat') || cmd.includes('chitti')) {
            if (cmd.includes('close')) {
                this.speak("Closing chat");
                FitHubChat.close();
            } else {
                this.speak("Opening Chitti assistant");
                FitHubChat.open();
            }
        } else if (cmd.includes('motivate') || cmd.includes('quote')) {
            const quote = fitnessQuotes[Math.floor(Math.random() * fitnessQuotes.length)];
            this.speak(quote);
        } else if (cmd.includes('who are you')) {
            this.speak("I am FitHub Virtual Assistant, your hands-free fitness and training partner.");
        } else if (cmd.includes('time')) {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            this.speak(`The current time is ${time}`);
        } else if (cmd.includes('date')) {
            const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
            this.speak(`Today is ${date}`);
        } else {
            this.speak(`Searching Google for ${cmd}`);
            window.open(`https://www.google.com/search?q=${encodeURIComponent(cmd)}`, '_blank');
        }
    }
};

function openVoiceAssistant() {
    FitHubVoice.start();
    return false;
}

// ============================================================================
// 9. Universal Chitti AI Fitness Assistant (FitHubChat)
// ============================================================================
const FitHubChat = {
    chatbox: null,
    chatContainer: null,
    promptInput: null,
    sendBtn: null,
    micBtn: null,
    chatIcon: null,
    isOpen: false,

    offlineKnowledge: {
        "chest": "For comprehensive chest development, prioritize heavy compound pressing: Flat Barbell Bench Press (4x8-10), Incline Dumbbell Press (3x10-12) for upper chest, and Cable/Dumbbell Flyes for pec isolation. Rest 60-90s between sets.",
        "back": "To build back thickness and a V-taper, include Wide-Grip Lat Pulldowns (4x10), Bent-Over Barbell Rows (4x8-10), and Face Pulls to support rear delts and rotator cuffs.",
        "arms": "For bigger arms, train both biceps and triceps. Recommended: Barbell Bicep Curls (3x10-12), Hammer Curls for brachialis width, Skull Crushers (3x10), and Tricep Rope Pushdowns.",
        "legs": "Leg day essentials: Barbell Squats (4x8-10), Romanian Deadlifts for hamstrings, Walking Lunges, and Standing Calf Raises. Focus on controlled eccentric tempo.",
        "shoulder": "For round 3D deltoids: Overhead Barbell/Dumbbell Press (4x8), Lateral Raises (4x12-15) for width, and Bent-Over Reverse Flyes for rear delts.",
        "weight loss": "For sustainable fat loss, aim for a moderate 300-500 calorie deficit below your TDEE. Maintain high protein intake (1.6g-2.2g per kg bodyweight) to preserve lean muscle.",
        "muscle gain": "For lean hypertrophy, maintain a 250-350 calorie surplus, target 8-12 reps near muscular failure, and get 7-9 hours of deep restorative sleep each night.",
        "protein": "Top high-protein sources: Chicken breast (31g/100g), Greek yogurt (10g/100g), Eggs (6g each), Whey protein (24g/scoop), Salmon, Tofu, Lentils, and Cottage Cheese.",
        "creatine": "Creatine Monohydrate (3-5g daily) is the most scientifically validated supplement for strength, power output, and intracellular muscle hydration. No loading phase strictly needed.",
        "water": "Aim for 2.5 to 3.5 liters of water daily, especially around workout windows to maintain endurance and cellular nutrient transport.",
        "default": "I am Chitti, your 24/7 AI fitness trainer! You can ask me about workout routines, exercise technique, nutrition splits, macro targets, and recovery strategies."
    },

    init() {
        this.chatbox = document.querySelector('.chat-box');
        this.chatContainer = document.querySelector('.chat-container');
        this.promptInput = document.querySelector('.prompt');
        this.sendBtn = document.querySelector('.send-btn');
        this.chatIcon = document.querySelector('#chatbotimg');

        if (!this.chatbox) return;

        if (this.chatIcon) {
            this.chatIcon.src = FitHubPath.asset('icons/chatbot.svg');
            const navChatBtn = document.querySelector('.chatbot-container');
            if (navChatBtn) {
                navChatBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    FitHubAudio.playClick();
                    this.toggle();
                });
            }
        }

        const inputArea = document.querySelector('.input-area');
        if (inputArea && !document.getElementById('chatMicBtn')) {
            const micBtn = document.createElement('button');
            micBtn.id = 'chatMicBtn';
            micBtn.className = 'mic-input-btn';
            micBtn.innerHTML = '🎙️';
            micBtn.title = 'Speak your question';
            micBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                FitHubAudio.playClick();
                this.listenForPrompt();
            });
            inputArea.insertBefore(micBtn, this.sendBtn);
            this.micBtn = micBtn;
        }

        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => {
                this.handleSend();
            });
        }

        if (this.promptInput) {
            this.promptInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSend();
                }
            });
        }

        const refreshBtn = document.getElementById('refreshChat');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                FitHubAudio.playClick();
                if (this.chatContainer) this.chatContainer.innerHTML = '';
                const h1 = document.querySelector('.chat-header .h1');
                if (h1) h1.style.display = 'block';
                sessionStorage.removeItem('fithub_chat_history');
            });
        }

        this.restoreHistory();
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        if (!this.chatbox) return;
        this.chatbox.classList.add('active-chat-box');
        this.isOpen = true;
        if (this.chatIcon) this.chatIcon.src = FitHubPath.asset('icons/cross.svg');
        if (this.promptInput) this.promptInput.focus();
    },

    close() {
        if (!this.chatbox) return;
        this.chatbox.classList.remove('active-chat-box');
        this.isOpen = false;
        if (this.chatIcon) this.chatIcon.src = FitHubPath.asset('icons/chatbot.svg');
    },

    listenForPrompt() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        const rec = new SpeechRec();
        rec.lang = 'en-US';
        rec.interimResults = false;

        rec.onstart = () => {
            if (this.micBtn) this.micBtn.classList.add('listening');
        };

        rec.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (this.promptInput) {
                this.promptInput.value = transcript;
                this.handleSend();
            }
        };

        rec.onerror = () => {
            if (this.micBtn) this.micBtn.classList.remove('listening');
        };

        rec.onend = () => {
            if (this.micBtn) this.micBtn.classList.remove('listening');
        };

        rec.start();
    },

    handleSend() {
        if (!this.promptInput || !this.promptInput.value.trim()) return;
        const query = this.promptInput.value.trim();
        this.promptInput.value = '';

        FitHubAudio.playClick();

        const h1 = document.querySelector('.chat-header .h1');
        if (h1) h1.style.display = 'none';

        this.appendMessage('YOU', query, 'user-chat-box');

        const loadingBox = document.createElement('div');
        loadingBox.className = 'ai-chat-box';
        loadingBox.innerHTML = `
            <div class="message-label">CHITTI</div>
            <p class="text">Thinking...</p>
        `;
        this.chatContainer.appendChild(loadingBox);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;

        setTimeout(() => {
            this.generateResponse(query, loadingBox);
        }, 500);
    },

    appendMessage(label, text, className) {
        if (!this.chatContainer) return;
        const box = document.createElement('div');
        box.className = className;
        box.innerHTML = `
            <div class="message-label">${label}</div>
            <p class="text">${text}</p>
        `;
        this.chatContainer.appendChild(box);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        this.saveHistory();
    },

    async generateResponse(query, boxElement) {
        const textElement = boxElement.querySelector('.text');
        const lower = query.toLowerCase();

        let answer = null;
        for (const key in this.offlineKnowledge) {
            if (lower.includes(key)) {
                answer = this.offlineKnowledge[key];
                break;
            }
        }

        if (!answer) {
            answer = this.offlineKnowledge.default;
        }

        textElement.innerHTML = answer;

        const speakBtn = document.createElement('button');
        speakBtn.className = 'ai-speak-answer-btn';
        speakBtn.innerHTML = '🔊 Listen';
        speakBtn.addEventListener('click', () => {
            FitHubVoice.speak(answer);
        });
        boxElement.appendChild(speakBtn);

        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        this.saveHistory();
    },

    saveHistory() {
        if (!this.chatContainer) return;
        sessionStorage.setItem('fithub_chat_history', this.chatContainer.innerHTML);
    },

    restoreHistory() {
        const saved = sessionStorage.getItem('fithub_chat_history');
        if (saved && this.chatContainer && saved.trim() !== '') {
            this.chatContainer.innerHTML = saved;
            const h1 = document.querySelector('.chat-header .h1');
            if (h1) h1.style.display = 'none';

            const speakBtns = this.chatContainer.querySelectorAll('.ai-speak-answer-btn');
            speakBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const text = btn.parentNode.querySelector('.text')?.innerText || '';
                    FitHubVoice.speak(text);
                });
            });
        }
    }
};

function openChat() {
    FitHubChat.open();
    return false;
}

// ============================================================================
// 10. Prompt Suggestions for Chatbot
// ============================================================================
function initChatPromptPills() {
    const inputArea = document.querySelector('.input-area');
    if (!inputArea || document.querySelector('.prompt-suggestions')) return;

    const container = document.createElement('div');
    container.className = 'prompt-suggestions';

    const suggestions = [
        "💪 Chest workout",
        "🥗 High protein diet",
        "🔥 Fat loss tips",
        "⏱️ 60s Rest timer",
        "🏋️ 4-day split"
    ];

    suggestions.forEach(text => {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.innerText = text;
        chip.addEventListener('click', () => {
            FitHubAudio.playClick();
            const promptInput = document.querySelector('.prompt');
            if (promptInput) {
                promptInput.value = text.replace(/^[^\w]+/, '').trim();
                FitHubChat.handleSend();
            }
        });
        container.appendChild(chip);
    });

    inputArea.parentNode.insertBefore(container, inputArea);
}

// ============================================================================
// 11. Exercise Search and Muscle Category Filtering
// ============================================================================
function initExerciseSearchFilter() {
    const searchInput = document.getElementById('exerciseSearchInput');
    const chips = document.querySelectorAll('.filter-chips .chip');
    const cards = document.querySelectorAll('.exercise-card');
    const grid = document.querySelector('.exercise-grid');

    if (!searchInput && chips.length === 0) return;

    let currentCategory = 'all';
    let searchQuery = '';

    function filterCards() {
        let visibleCount = 0;
        const favs = FitHubExercises.favorites;

        cards.forEach(card => {
            const title = card.querySelector('.exercise-title')?.innerText.toLowerCase() || '';
            const category = card.getAttribute('data-category')?.toLowerCase() || 'all';
            const exId = title.replace(/[^a-z0-9]/g, '-');

            const matchesSearch = title.includes(searchQuery);
            let matchesCategory = false;

            if (currentCategory === 'all') {
                matchesCategory = true;
            } else if (currentCategory === 'favorites') {
                matchesCategory = favs.includes(exId);
            } else {
                matchesCategory = category.includes(currentCategory);
            }

            if (matchesSearch && matchesCategory) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (grid) {
            let emptyEl = grid.querySelector('.exercise-empty-state');
            if (visibleCount === 0) {
                if (!emptyEl) {
                    emptyEl = document.createElement('div');
                    emptyEl.className = 'exercise-empty-state';
                    emptyEl.innerHTML = `
                        <h3>No Exercises Found</h3>
                        <p>Try searching for a different muscle group or keyword.</p>
                    `;
                    grid.appendChild(emptyEl);
                }
            } else if (emptyEl) {
                emptyEl.remove();
            }
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterCards();
        });
    }

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCategory = chip.getAttribute('data-filter') || 'all';
            filterCards();
        });
    });
}

// ============================================================================
// 12. Interactive Water Intake Tracker
// ============================================================================
function initWaterIntakeTracker() {
    if (document.getElementById('waterIntakeTracker')) return;

    const todayStr = new Date().toISOString().split('T')[0];
    let savedWater = JSON.parse(localStorage.getItem('fithub_water_tracker') || '{}');
    if (!savedWater[todayStr]) {
        savedWater[todayStr] = FitHubState.data.waterGlasses || 0;
    }

    const container = document.createElement('div');
    container.id = 'waterIntakeTracker';
    container.className = 'water-tracker-card';

    const targetGlasses = 8;
    const currentGlasses = savedWater[todayStr];

    container.innerHTML = `
        <div class="water-tracker-header">
            <div class="water-tracker-title">💧 Daily Hydration Tracker</div>
            <div class="water-tracker-stats" id="waterStats">${currentGlasses} / ${targetGlasses} Glasses (${(currentGlasses * 0.25).toFixed(1)}L / 2.0L)</div>
        </div>
        <div class="water-glasses-grid" id="waterGlassesGrid"></div>
        <div class="water-progress-bar-track">
            <div class="water-progress-bar-fill" id="waterProgressFill" style="width: ${(currentGlasses / targetGlasses) * 100}%"></div>
        </div>
    `;

    const targetParent = document.querySelector('.nutrition-container') || document.querySelector('main');
    if (targetParent) {
        const formWrap = document.querySelector('.nutrition-form-container');
        if (formWrap) {
            targetParent.insertBefore(container, formWrap.nextSibling);
        } else {
            targetParent.appendChild(container);
        }
    }

    renderWaterGlasses(currentGlasses, targetGlasses, todayStr, savedWater);
}

function renderWaterGlasses(current, target, todayStr, savedData) {
    const grid = document.getElementById('waterGlassesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 1; i <= target; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `water-glass-btn ${i <= current ? 'drank' : ''}`;
        btn.innerHTML = `
            <span class="water-glass-icon">${i <= current ? '🥛' : '🥤'}</span>
            <span class="water-glass-label">Glass ${i}</span>
        `;
        btn.addEventListener('click', () => {
            FitHubAudio.playClick();
            let updated = (current >= i) ? i - 1 : i;
            savedData[todayStr] = updated;
            localStorage.setItem('fithub_water_tracker', JSON.stringify(savedData));

            FitHubState.data.waterGlasses = updated;
            FitHubState.save();

            const stats = document.getElementById('waterStats');
            const fill = document.getElementById('waterProgressFill');
            if (stats) stats.innerText = `${updated} / ${target} Glasses (${(updated * 0.25).toFixed(1)}L / 2.0L)`;
            if (fill) fill.style.width = `${(updated / target) * 100}%`;

            if (updated === target) {
                FitHubAudio.playSuccess();
                FitHubVoice.speak("Daily hydration goal achieved! Outstanding work!");
            }

            renderWaterGlasses(updated, target, todayStr, savedData);
        });
        grid.appendChild(btn);
    }
}

// ============================================================================
// 13. Hero Dynamic Typing Effect
// ============================================================================
function initHeroTypingEffect() {
    const targetEl = document.getElementById('heroTypingText');
    if (!targetEl) return;
    
    const phrases = [
        "Personalized AI Workout Routines",
        "Real-Time Camera Pose Tracking",
        "Smart Macro & Nutrition Intelligence",
        "24/7 Intelligent Assistant Chitti"
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 50;
    
    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            targetEl.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 25;
        } else {
            targetEl.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 50;
        }
        
        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 300;
        }
        
        setTimeout(type, typeSpeed);
    }
    
    type();
}

// ============================================================================
// 14. Modals & Navigation Helpers
// ============================================================================
function showFeatureModal(title, content) {
    let modal = document.getElementById("featureModal");
    if (!modal) {
        modal = createModal();
    }
    
    const modalTitle = modal.querySelector(".modal-title");
    const modalContent = modal.querySelector(".modal-content");
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalContent) modalContent.innerHTML = `
        <p>${content}</p>
        <div class="modal-actions">
            <button class="btn btn-primary" onclick="closeModal()">Get Started</button>
            <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `;
    
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function showLegalPage(title, content) {
    let modal = document.getElementById("featureModal");
    if (!modal) {
        modal = createModal();
    }
    
    const modalTitle = modal.querySelector(".modal-title");
    const modalContent = modal.querySelector(".modal-content");
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalContent) modalContent.innerHTML = `
        <div class="legal-content">
            <p>${content}</p>
            <div class="legal-sections">
                <h4>Key Policies:</h4>
                <ul>
                    <li>Complete biometric privacy and offline processing priority</li>
                    <li>Zero unconsented third-party data tracking</li>
                    <li>Free user access to workout generations and nutrition formulas</li>
                </ul>
            </div>
        </div>
        <div class="modal-actions">
            <button class="btn btn-primary" onclick="closeModal()">I Understand</button>
            <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `;
    
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function createModal() {
    const modal = document.createElement("div");
    modal.id = "featureModal";
    modal.className = "modal";
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-container">
            <div class="modal-header">
                <h3 class="modal-title">Feature Title</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-content"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function closeModal() {
    const modal = document.getElementById("featureModal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

// ============================================================================
// 15. DOM Initialization Entry Point
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
        document.body.classList.add('index-page');
    }

    initSplashScreen();
    document.body.classList.remove('light-theme');
    localStorage.removeItem('fithub_theme');

    initHamburgerMenu();
    initSelectDropdown();
    initChatPromptPills();
    initExerciseSearchFilter();
    initDailyMotivationQuote();
    initHeroTypingEffect();

    FitHubTimer.init();
    FitHubExercises.init();

    FitHubVoice.init();
    FitHubChat.init();

    // Initialize Systematic Interactive Dashboard if elements exist (e.g. on index.html)
    if (document.getElementById('ringBarMove') || document.getElementById('dashWeightSlider')) {
        FitHubDashboard.init();
    }

    if (document.getElementById('nutritionForm') || document.querySelector('.nutrition-container')) {
        initWaterIntakeTracker();
    }
});

function initSoundToggle() {
    // Sound toggle icon removed from header per user request.
}

function initHamburgerMenu() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const rightNav = document.getElementById('rightNav');
    
    if (hamburgerMenu && rightNav) {
        hamburgerMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            FitHubAudio.playClick();
            hamburgerMenu.classList.toggle('active');
            rightNav.classList.toggle('active');
        });
        
        document.addEventListener('click', function(event) {
            if (!hamburgerMenu.contains(event.target) && !rightNav.contains(event.target)) {
                hamburgerMenu.classList.remove('active');
                rightNav.classList.remove('active');
            }
        });
    }
}

function initSelectDropdown() {
    const select = document.querySelector(".select-heading");
    const arrow = document.querySelector(".select-heading img");
    const options = document.querySelector(".options");
    const optionItems = document.querySelectorAll(".option");
    const selectText = document.querySelector(".select-heading span");
    const selectBox = document.querySelector(".select-box");

    if (selectBox) {
        document.addEventListener('click', (e) => {
            if (!selectBox.contains(e.target)) {
                if (options) options.classList.remove("active-options");
                if (arrow) arrow.classList.remove("rotate");
                selectBox.classList.remove("active");
            }
        });
    }

    if (select) {
        select.addEventListener("click", (e) => {
            e.stopPropagation();
            FitHubAudio.playClick();
            if (options) options.classList.toggle("active-options");
            if (arrow) arrow.classList.toggle("rotate");
            if (selectBox) selectBox.classList.toggle("active");
        });
    }

    optionItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            const parentLink = item.closest("a");
            if (parentLink && parentLink.getAttribute("href")) {
                window.location.href = parentLink.getAttribute("href");
            } else {
                if (selectText) selectText.innerText = item.innerText;
                if (options) options.classList.remove("active-options");
                if (arrow) arrow.classList.remove("rotate");
                if (selectBox) selectBox.classList.remove("active");
            }
        });
    });
}

function initSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    if (!splashScreen) return;

    const navEntries = performance.getEntriesByType && performance.getEntriesByType('navigation');
    const isReload = (navEntries && navEntries.length > 0 && navEntries[0].type === 'reload') || 
                     (window.performance && window.performance.navigation && window.performance.navigation.type === 1);
    const hasSeenSplash = sessionStorage.getItem('fithub_splash_seen');

    if (hasSeenSplash && !isReload) {
        splashScreen.style.display = 'none';
        return;
    }

    sessionStorage.setItem('fithub_splash_seen', 'true');

    if (!document.querySelector('.splash-skip-btn')) {
        const skipBtn = document.createElement('button');
        skipBtn.className = 'splash-skip-btn';
        skipBtn.innerText = 'Skip ➔';
        skipBtn.addEventListener('click', () => {
            splashScreen.style.display = 'none';
        });
        splashScreen.appendChild(skipBtn);
    }

    const progressBar = document.getElementById('splashProgressBar');
    const splashCounter = document.getElementById('splashCounter');
    const splashStatus = document.getElementById('splashStatus');

    let progress = 0;
    const statusMessages = [
        "Initializing Engine...",
        "Loading AI Models...",
        "Structuring Workouts...",
        "Finalizing Nutrition...",
        "Ready to Train!"
    ];

    const interval = setInterval(() => {
        progress += 2;
        if (progressBar) progressBar.style.width = Math.min(progress, 100) + '%';
        if (splashCounter) splashCounter.innerText = Math.min(progress, 100) + '%';
        if (splashStatus) {
            if (progress < 25) splashStatus.innerText = statusMessages[0];
            else if (progress < 50) splashStatus.innerText = statusMessages[1];
            else if (progress < 75) splashStatus.innerText = statusMessages[2];
            else if (progress < 95) splashStatus.innerText = statusMessages[3];
            else splashStatus.innerText = statusMessages[4];
        }

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                splashScreen.classList.add('fade-out');
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                }, 400);
            }, 300);
        }
    }, 25);
}

const fitnessQuotes = [
    "The body achieves what the mind believes.",
    "Action is the foundational key to all success.",
    "Your only limit is you. Push harder than yesterday!",
    "Success starts with self-discipline and daily consistency.",
    "Small daily improvements over time lead to stunning results.",
    "The hard work you put in today will build the strength you feel tomorrow.",
    "Don't limit your challenges. Challenge your limits.",
    "The difference between try and triumph is just a little extra umph!",
    "Strength does not come from physical capacity. It comes from an indomitable will.",
    "Energy flows where attention goes. Focus on your goals!",
    "Believe you can and you're halfway there.",
    "Consistency is what transforms average into excellence.",
    "You don't have to be extreme, just consistent.",
    "Discipline is choosing between what you want now and what you want most.",
    "Make today count. Your future self will thank you!"
];

function initDailyMotivationQuote() {
    const quoteElement = document.getElementById("dailyQuoteText");
    if (!quoteElement) return;

    const randomIndex = Math.floor(Math.random() * fitnessQuotes.length);
    quoteElement.innerText = `"${fitnessQuotes[randomIndex]}"`;

    quoteElement.style.cursor = 'pointer';
    quoteElement.title = 'Click for another motivational quote';
    quoteElement.addEventListener('click', () => {
        FitHubAudio.playClick();
        const nextIndex = Math.floor(Math.random() * fitnessQuotes.length);
        quoteElement.innerText = `"${fitnessQuotes[nextIndex]}"`;
    });
}

function openPersonalizedPlans() { window.location.href = FitHubPath.page('personalized-plans.html'); return false; }
function openNutritionGuide() { window.location.href = FitHubPath.page('nutrition-guide.html'); return false; }
function openProgressTracking() { showFeatureModal("Progress Tracking", "Log sets and reps on any exercise card, or start a live Guided Workout. All progress syncs with your daily rings."); return false; }
function openExerciseLibrary() { window.location.href = FitHubPath.page('workout.html'); return false; }
function openAccessibility() { showFeatureModal("Accessibility", "FitHub features high-contrast dark theme, full keyboard tab navigation, and hands-free Web Speech voice command controls."); return false; }
function openSitemap() { showFeatureModal("FitHub Sitemap", "• Home<br>• Exercise Library (Chest, Back, Arms, Shoulders, Legs)<br>• Personalized Plans<br>• Nutrition Guide<br>• AI Pose Trainer"); return false; }
function openFAQ() { showFeatureModal("FAQ", "<b>Q: Does camera pose detection send video to servers?</b><br>A: No, all TensorFlow MoveNet pose estimations occur 100% locally inside your web browser.<br><br><b>Q: How are macros calculated?</b><br>A: Using the Mifflin-St Jeor metabolic formula matched with target activity multipliers."); return false; }
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); return false; }
function openFacebook() { window.open("https://www.facebook.com/", "_blank"); return false; }
function openTwitter() { window.open("https://www.twitter.com/", "_blank"); return false; }
function openInstagram() { window.open("https://www.instagram.com/", "_blank"); return false; }
function sendEmail() { window.open("mailto:support@fithub.com?subject=FitHub Support", "_blank"); return false; }
function makePhoneCall() { window.open("tel:+1234567890", "_blank"); return false; }
function openPrivacyPolicy() { showLegalPage("Privacy Policy", "FitHub processes biometric metrics and webcam tracking on your device locally with complete user data confidentiality."); return false; }
function openTermsOfService() { showLegalPage("Terms of Service", "FitHub workout and nutrition tools are for informational and educational fitness guidance."); return false; }
function openCookiePolicy() { showLegalPage("Cookie Policy", "FitHub utilizes client-side LocalStorage exclusively for workout plans, set logs, and user preference retention."); return false; }
