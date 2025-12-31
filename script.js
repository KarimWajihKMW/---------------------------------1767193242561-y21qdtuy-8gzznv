document.addEventListener('DOMContentLoaded', () => {
    // State
    let count = 0;
    let target = 33;
    let currentDhikr = 'سبحان الله';
    let vibrationEnabled = true;

    // Elements
    const countDisplay = document.getElementById('countDisplay');
    const targetDisplay = document.getElementById('targetDisplay');
    const progressRing = document.getElementById('progressRing');
    const dhikrText = document.getElementById('dhikrText');
    const clickArea = document.getElementById('clickArea');
    const resetBtn = document.getElementById('resetBtn');
    const vibrateBtn = document.getElementById('vibrateBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const pulse = document.getElementById('pulse');
    
    // Modal Elements
    const settingsModal = document.getElementById('settingsModal');
    const modalContent = document.getElementById('modalContent');
    const closeSettings = document.getElementById('closeSettings');
    const saveSettings = document.getElementById('saveSettings');
    const dhikrSelect = document.getElementById('dhikrSelect');
    const targetBtns = document.querySelectorAll('.target-btn');

    // Constants for Circle Progress
    const radius = 136;
    const circumference = 2 * Math.PI * radius;
    
    // Initialize
    loadState();
    updateUI();
    updateVibrationUI();

    // Event Listeners
    clickArea.addEventListener('click', increment);
    
    // Also allow spacebar
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') increment();
    });

    resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if(confirm('هل أنت متأكد من تصفير العداد؟')) {
            resetCount();
        }
    });

    vibrateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleVibration();
    });

    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal();
    });

    closeSettings.addEventListener('click', closeModal);
    saveSettings.addEventListener('click', saveAndCloseModal);

    targetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            targetBtns.forEach(b => b.classList.remove('active-target'));
            btn.classList.add('active-target');
        });
    });

    // Core Functions

    function increment() {
        count++;
        triggerHaptic();
        animateClick();
        updateUI();
        saveState();
        
        // Check target reached
        if (target !== 9999 && count % target === 0) {
            celebrateTarget();
        }
    }

    function resetCount() {
        count = 0;
        updateUI();
        saveState();
    }

    function updateUI() {
        countDisplay.textContent = count;
        dhikrText.textContent = currentDhikr;
        
        if (target === 9999) {
            targetDisplay.textContent = 'الهدف: مفتوح';
            setProgress(100); 
        } else {
            targetDisplay.textContent = `الهدف: ${target}`;
            const progressCount = count % target;
            const percentage = (count > 0 && count % target === 0) ? 100 : (progressCount / target) * 100;
            setProgress(percentage);
        }
    }

    function setProgress(percent) {
        const offset = circumference - (percent / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;
    }

    function animateClick() {
        pulse.classList.remove('animate-pulse-custom');
        void pulse.offsetWidth; 
        pulse.classList.add('animate-pulse-custom');
    }

    function triggerHaptic() {
        if (vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(15);
        }
    }
    
    function celebrateTarget() {
        if (vibrationEnabled && navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
        countDisplay.style.color = '#fff';
        setTimeout(() => {
            countDisplay.style.color = '';
        }, 300);
    }

    function toggleVibration() {
        vibrationEnabled = !vibrationEnabled;
        updateVibrationUI();
        saveState();
        
        // Feedback
        if (vibrationEnabled && navigator.vibrate) navigator.vibrate(50);
    }

    function updateVibrationUI() {
        const iconDiv = vibrateBtn.querySelector('div');
        if (vibrationEnabled) {
            iconDiv.classList.remove('text-gray-400');
            iconDiv.classList.add('text-primary');
        } else {
            iconDiv.classList.remove('text-primary');
            iconDiv.classList.add('text-gray-400');
        }
    }

    // Settings Logic
    function openModal() {
        settingsModal.classList.remove('hidden');
        setTimeout(() => {
            settingsModal.classList.add('modal-active');
            modalContent.classList.add('modal-content-active');
        }, 10);
        
        dhikrSelect.value = currentDhikr;
        targetBtns.forEach(b => {
            b.classList.remove('active-target');
            if (parseInt(b.dataset.target) === target) {
                b.classList.add('active-target');
            }
        });
    }

    function closeModal() {
        settingsModal.classList.remove('modal-active');
        modalContent.classList.remove('modal-content-active');
        setTimeout(() => {
            settingsModal.classList.add('hidden');
        }, 300);
    }

    function saveAndCloseModal() {
        currentDhikr = dhikrSelect.value;
        
        const activeBtn = document.querySelector('.target-btn.active-target');
        if (activeBtn) {
            target = parseInt(activeBtn.dataset.target);
        }

        updateUI();
        saveState();
        closeModal();
    }

    // Local Storage (Safe Mode)
    function saveState() {
        try {
            const state = {
                count,
                target,
                currentDhikr,
                vibrationEnabled
            };
            localStorage.setItem('misbahaState', JSON.stringify(state));
        } catch (e) {
            console.warn('LocalStorage is unavailable in this environment:', e);
        }
    }

    function loadState() {
        try {
            const saved = localStorage.getItem('misbahaState');
            if (saved) {
                const state = JSON.parse(saved);
                count = state.count || 0;
                target = state.target || 33;
                currentDhikr = state.currentDhikr || 'سبحان الله';
                vibrationEnabled = state.vibrationEnabled !== undefined ? state.vibrationEnabled : true;
            }
        } catch (e) {
            console.warn('LocalStorage is unavailable in this environment:', e);
            // Continue with default values
        }
    }
});