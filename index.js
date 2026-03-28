(function(){
    let generatedNumbers = [];
    let currentUsedSet = new Set();
    let currentCity = "all";
    let currentMessage = "Hola, vi tu número en la red anónima. ¿Charlamos?";
    let isLoading = false;
    let preferredCity = null;
    let dailyCounter = 0;
    let dailyDate = "";

    const phoneContainer = document.getElementById("phoneList");
    const citySelect = document.getElementById("cityFilter");
    const customMsgInput = document.getElementById("customMsg");
    const searchBtn = document.getElementById("searchBtn");
    const resetBtn = document.getElementById("resetBtn");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const numbersCounter = document.getElementById("numbersCounter");
    const acceptModal = document.getElementById("acceptTermsModal");
    const acceptBtn = document.getElementById("acceptTermsBtn");

    function showToast(msg) {
        const toast = document.getElementById("toastMsg");
        toast.textContent = msg;
        toast.style.opacity = "1";
        setTimeout(() => toast.style.opacity = "0", 1700);
    }

    function setLoading(loading) {
        isLoading = loading;
        if (loading) {
            phoneContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:1.5rem;"><span class="spinner"></span> Obteniendo números...</div>`;
            searchBtn.disabled = true;
            resetBtn.disabled = true;
            loadMoreBtn.disabled = true;
        } else {
            searchBtn.disabled = false;
            resetBtn.disabled = false;
            loadMoreBtn.disabled = false;
        }
    }

    function renderNumbers(numbersArray) {
        if (!numbersArray.length) {
            phoneContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:1.5rem;">⚠️ No se encontraron números, intente de nuevo.</div>`;
            numbersCounter.textContent = `0 números disponibles`;
            return;
        }
        const fragment = document.createDocumentFragment();
        numbersArray.forEach(p => {
            const card = document.createElement('div');
            card.className = 'phone-card';
            card.setAttribute('role', 'listitem');
            card.innerHTML = `
                <div class="phone-info">
                    <div class="phone-number">
                        <i class="fab fa-whatsapp" style="color:#25D366" aria-hidden="true"></i> ${p.formatted}
                        <button class="copy-btn" data-number="${p.formatted.replace(/\s/g, '')}" title="Copiar número" aria-label="Copiar número ${p.formatted}"><i class="far fa-copy"></i> copiar</button>
                    </div>
                    <div class="phone-location"><i class="fas fa-map-pin"></i> ${p.city} · <i class="fas fa-user-secret"></i> anónimo</div>
                </div>
                <a href="${p.waLink}" target="_blank" rel="noopener noreferrer" class="wa-btn" aria-label="Abrir chat WhatsApp con ${p.formatted}"><i class="fab fa-whatsapp"></i> Chat WhatsApp</a>
            `;
            fragment.appendChild(card);
        });
        phoneContainer.innerHTML = '';
        phoneContainer.appendChild(fragment);
        const remaining = 15 - dailyCounter;
        numbersCounter.textContent = `${numbersArray.length} números · restan ${remaining} hoy`;
    }

    phoneContainer.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-btn');
        if (copyBtn) {
            e.stopPropagation();
            const rawNum = copyBtn.getAttribute('data-number');
            if (rawNum) {
                navigator.clipboard.writeText(rawNum).then(() => showToast(`📞 ${rawNum} copiado`)).catch(() => showToast("Error al copiar"));
            }
        }
    });

    function updateDailyLimit() {
        const today = new Date().toISOString().slice(0,10);
        const storedDate = localStorage.getItem("dailyDate");
        const storedCount = parseInt(localStorage.getItem("dailyCount") || "0", 10);
        if (storedDate !== today) {
            dailyCounter = 0;
            dailyDate = today;
            localStorage.setItem("dailyDate", today);
            localStorage.setItem("dailyCount", "0");
        } else {
            dailyCounter = storedCount;
            dailyDate = storedDate;
        }
    }

    function incrementDailyCount(amount) {
        dailyCounter += amount;
        localStorage.setItem("dailyCount", dailyCounter.toString());
    }

    function canGenerateMore(desired) {
        const remaining = 15 - dailyCounter;
        if (remaining <= 0) {
            showToast("Has alcanzado el límite diario de 15 números. Vuelve mañana.");
            return 0;
        }
        return Math.min(desired, remaining);
    }

    function generateFullList(reset = true, append = false) {
        if (isLoading) return;
        updateDailyLimit();
        const remaining = 15 - dailyCounter;
        if (remaining <= 0) {
            showToast("Límite diario alcanzado. No se pueden mostrar más números hoy.");
            return;
        }

        const city = citySelect.value;
        let message = customMsgInput.value.trim();
        if (!message) message = "Hola, vi tu número en la red anónima. ¿Charlamos?";
        currentMessage = message;

        if (reset) {
            generatedNumbers = [];
            currentUsedSet.clear();
        }
        
        const desiredCount = reset ? 5 : 5;
        const countToAdd = Math.min(desiredCount, remaining);
        if (countToAdd <= 0) return;

        setLoading(true);
        setTimeout(() => {
            try {
                const { newNumbers, usedSet } = API.generateUniqueNumbers(city, countToAdd, currentUsedSet, currentMessage, preferredCity);
                if (reset) {
                    generatedNumbers = newNumbers;
                    currentUsedSet = usedSet;
                } else {
                    generatedNumbers = [...generatedNumbers, ...newNumbers];
                    currentUsedSet = usedSet;
                }
                incrementDailyCount(newNumbers.length);
                renderNumbers(generatedNumbers);
                if (newNumbers.length === 0) {
                    showToast("No se encontraron números, cambia de filtro.");
                } else if (newNumbers.length < countToAdd) {
                    showToast(`Solo se mostraron ${newNumbers.length} de ${countToAdd} números.`);
                }
                if (dailyCounter >= 15) {
                    showToast("Límite diario alcanzado. Vuelve mañana para más números.");
                }
            } catch (error) {
                console.error(error);
                showToast("Error al obtener números. Intente de nuevo.");
                phoneContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:1.5rem;">❌ Error inesperado. Recarga la página.</div>`;
            } finally {
                setLoading(false);
            }
        }, 20);
    }

    function resetAndGenerate() {
        generateFullList(true, false);
    }

    function loadMore() {
        if (generatedNumbers.length > 0 || currentUsedSet.size > 0) {
            generateFullList(false, true);
        } else {
            resetAndGenerate();
        }
    }

    function requestLocation() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(pos => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                const cubaBounds = { latMin: 19.8, latMax: 23.3, lonMin: -85.0, lonMax: -74.1 };
                if (lat >= cubaBounds.latMin && lat <= cubaBounds.latMax && lon >= cubaBounds.lonMin && lon <= cubaBounds.lonMax) {
                    let province = "La Habana";
                    if (lon < -82) province = "Pinar del Río";
                    else if (lon < -80) province = "La Habana";
                    else if (lon < -78) province = "Cienfuegos";
                    else if (lon < -76) province = "Camagüey";
                    else province = "Santiago de Cuba";
                    if (CITIES.includes(province)) {
                        preferredCity = province;
                        if (citySelect.value === "all") citySelect.value = province;
                        showToast(`Ubicación detectada: ${province}. Se mostrarán números de esta provincia.`);
                    }
                }
            }, () => {});
        }
    }

    function initModals() {
        const privacyModal = document.getElementById("privacyModal");
        const termsModal = document.getElementById("termsModal");
        const openPrivacy = document.getElementById("openPrivacy");
        const openTerms = document.getElementById("openTerms");
        const closeBtns = document.querySelectorAll(".modal-close");

        function openModal(modal) { modal.classList.add("active"); modal.setAttribute("aria-hidden", "false"); }
        function closeModal(modal) { modal.classList.remove("active"); modal.setAttribute("aria-hidden", "true"); }

        openPrivacy.onclick = () => openModal(privacyModal);
        openTerms.onclick = () => openModal(termsModal);
        closeBtns.forEach(btn => {
            btn.onclick = (e) => {
                const modal = btn.closest(".modal-overlay");
                if (modal) closeModal(modal);
            };
        });
        window.onclick = (e) => {
            if (e.target.classList && e.target.classList.contains("modal-overlay")) closeModal(e.target);
        };
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (privacyModal.classList.contains('active')) closeModal(privacyModal);
                if (termsModal.classList.contains('active')) closeModal(termsModal);
            }
        });
    }

    function checkTermsAcceptance() {
        const accepted = localStorage.getItem("termsAccepted");
        if (!accepted) {
            acceptModal.classList.add("active");
            acceptModal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        } else {
            acceptModal.classList.remove("active");
            document.body.style.overflow = "";
        }
    }

    function acceptTerms() {
        localStorage.setItem("termsAccepted", "true");
        acceptModal.classList.remove("active");
        document.body.style.overflow = "";
        requestLocation();
        resetAndGenerate();
    }

    acceptBtn.addEventListener("click", acceptTerms);

    let debounceTimer;
    searchBtn.addEventListener("click", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => resetAndGenerate(), 50);
    });
    resetBtn.addEventListener("click", resetAndGenerate);
    loadMoreBtn.addEventListener("click", loadMore);
    citySelect.addEventListener("change", () => resetAndGenerate());

    initModals();
    checkTermsAcceptance();
})();