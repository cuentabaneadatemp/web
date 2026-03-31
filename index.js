(function() {
    let allNumbers = [];
    let usedNumbersSet = new Set();
    let currentMessage = "Hola, vi tu número en la red anónima. ¿Charlamos?";
    let isLoading = false;
    let hasAcceptedTerms = false;
    let currentTheme = "greenblue";

    const phoneListEl = document.getElementById("phoneList");
    const numbersCounterEl = document.getElementById("numbersCounter");
    const customMsgInput = document.getElementById("customMsg");
    const searchBtn = document.getElementById("searchBtn");
    const resetBtn = document.getElementById("resetBtn");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const acceptModal = document.getElementById("acceptTermsModal");
    const acceptBtn = document.getElementById("acceptTermsBtn");
    const privacyModal = document.getElementById("privacyModal");
    const termsModal = document.getElementById("termsModal");
    const openPrivacy = document.getElementById("openPrivacy");
    const openTerms = document.getElementById("openTerms");
    const toastMsg = document.getElementById("toastMsg");
    const themeGreenBlueBtn = document.getElementById("themeGreenBlue");
    const themeRandomBtn = document.getElementById("themeRandom");
    const shareChannelBtn = document.getElementById("shareWhatsAppChannel");

    const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029VbCdMrUHgZWU8CQ6uu0h";

    function showToast(text, duration = 2000) {
        toastMsg.textContent = text;
        toastMsg.style.opacity = "1";
        setTimeout(() => toastMsg.style.opacity = "0", duration);
    }

    function shareWhatsAppChannel() {
        if (navigator.share) {
            navigator.share({
                title: 'Canal de WhatsApp',
                text: 'Únete al canal oficial de Contactos Anónimos',
                url: WHATSAPP_CHANNEL_URL
            }).catch(() => {
                navigator.clipboard.writeText(WHATSAPP_CHANNEL_URL).then(() => {
                    showToast('Enlace copiado al portapapeles', 2000);
                }).catch(() => {
                    showToast('No se pudo copiar el enlace', 2000);
                });
            });
        } else {
            navigator.clipboard.writeText(WHATSAPP_CHANNEL_URL).then(() => {
                showToast('Enlace copiado al portapapeles', 2000);
            }).catch(() => {
                showToast('No se pudo copiar el enlace', 2000);
            });
        }
    }

    function renderNumbers() {
        if (!phoneListEl) return;
        if (allNumbers.length === 0) {
            phoneListEl.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:2rem;"><i class="fas fa-phone-slash"></i> No hay números. Usa "Buscar" o "Cargar más".</div>`;
            numbersCounterEl.innerText = "0 números disponibles";
            return;
        }

        let html = '';
        for (const item of allNumbers) {
            html += `
                <div class="phone-card" data-id="${item.id}">
                    <div class="phone-info">
                        <div class="phone-icon">👤</div>
                        <div>
                            <div class="phone-number">${escapeHtml(item.formatted)}</div>
                        </div>
                    </div>
                    <div class="chat-buttons">
                        <a href="${item.waLink}" target="_blank" rel="noopener noreferrer" class="wa-btn"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                        <a href="${item.telegramLink}" target="_blank" rel="noopener noreferrer" class="telegram-btn"><i class="fab fa-telegram"></i> Telegram</a>
                    </div>
                </div>
            `;
        }
        phoneListEl.innerHTML = html;
        numbersCounterEl.innerText = `${allNumbers.length} números disponibles`;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    async function loadNumbers(batchSize = 5, reset = false) {
        if (isLoading) return;
        isLoading = true;
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Generando...';

        try {
            const { newNumbers, usedSet } = await new Promise((resolve) => {
                const result = API.generateUniqueNumbers(batchSize, usedNumbersSet, currentMessage);
                resolve(result);
            });

            if (newNumbers.length === 0) {
                showToast("No hay más números únicos.", 3000);
                return;
            }

            if (reset) {
                allNumbers = newNumbers;
                usedNumbersSet = usedSet;
            } else {
                allNumbers = [...allNumbers, ...newNumbers];
                usedNumbersSet = usedSet;
            }
            renderNumbers();
        } catch (err) {
            console.error(err);
            showToast("Error al generar números", 2000);
        } finally {
            isLoading = false;
            loadMoreBtn.disabled = false;
            loadMoreBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Cargar más';
        }
    }

    function resetNumbers() {
        usedNumbersSet.clear();
        allNumbers = [];
        renderNumbers();
        loadNumbers(5, true);
    }

    function applySearch() {
        currentMessage = customMsgInput.value;
        resetNumbers();
    }

    function applyTheme(theme) {
        currentTheme = theme;
        if (theme === 'greenblue') {
            document.documentElement.style.setProperty('--primary-wa', '#25D366');
            document.documentElement.style.setProperty('--primary-tg', '#26A5E4');
            document.documentElement.style.setProperty('--accent-color', '#25D366');
            document.documentElement.style.setProperty('--grad-start', '#0f172a');
            document.documentElement.style.setProperty('--grad-end', '#03060c');
            document.body.style.background = 'radial-gradient(ellipse at 30% 10%, var(--grad-start), var(--grad-end))';
            const logoIcon = document.querySelector('.logo-icon');
            if (logoIcon) logoIcon.style.background = '#25D366';
        } else if (theme === 'random') {
            const hue1 = Math.floor(Math.random() * 360);
            const hue2 = (hue1 + 40) % 360;
            const sat = 60 + Math.floor(Math.random() * 30);
            const light = 20 + Math.floor(Math.random() * 20);
            const gradStart = `hsl(${hue1}, ${sat}%, ${light}%)`;
            const gradEnd = `hsl(${hue2}, ${sat}%, ${light-10}%)`;
            const accentHue = (hue1 + 180) % 360;
            document.documentElement.style.setProperty('--accent-color', `hsl(${accentHue}, 70%, 55%)`);
            document.documentElement.style.setProperty('--grad-start', gradStart);
            document.documentElement.style.setProperty('--grad-end', gradEnd);
            document.body.style.background = `radial-gradient(ellipse at 30% 10%, ${gradStart}, ${gradEnd})`;
            const logoIcon = document.querySelector('.logo-icon');
            if (logoIcon) logoIcon.style.background = `hsl(${accentHue}, 70%, 55%)`;
        }
    }

    function initModals() {
        if (!hasAcceptedTerms) acceptModal.classList.add('active');
        acceptBtn.addEventListener('click', () => {
            hasAcceptedTerms = true;
            acceptModal.classList.remove('active');
            resetNumbers();
        });
        openPrivacy.addEventListener('click', () => privacyModal.classList.add('active'));
        openTerms.addEventListener('click', () => termsModal.classList.add('active'));
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-overlay')) {
                    privacyModal.classList.remove('active');
                    termsModal.classList.remove('active');
                }
            });
        });
    }

    function bindEvents() {
        searchBtn.addEventListener('click', applySearch);
        resetBtn.addEventListener('click', resetNumbers);
        loadMoreBtn.addEventListener('click', () => loadNumbers(5, false));
        themeGreenBlueBtn.addEventListener('click', () => applyTheme('greenblue'));
        themeRandomBtn.addEventListener('click', () => applyTheme('random'));
        if (shareChannelBtn) {
            shareChannelBtn.addEventListener('click', shareWhatsAppChannel);
        }
    }

    function init() {
        bindEvents();
        initModals();
        applyTheme('greenblue');
    }

    init();
})();