(function(){
    let generatedNumbers = [];
    let currentUsedSet = new Set();
    let currentCity = "all";
    let currentMessage = "Hola, vi tu número en la red anónima. ¿Charlamos?";

    const phoneContainer = document.getElementById("phoneList");
    const citySelect = document.getElementById("cityFilter");
    const customMsgInput = document.getElementById("customMsg");
    const searchBtn = document.getElementById("searchBtn");
    const resetBtn = document.getElementById("resetBtn");
    const loadMoreBtn = document.getElementById("loadMoreBtn");

    function renderNumbers(numbersArray) {
        if (!numbersArray.length) {
            phoneContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:1.5rem;">⚠️ No se pudieron generar números, intente de nuevo.</div>`;
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

        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const rawNum = btn.getAttribute('data-number');
                if (rawNum) {
                    navigator.clipboard.writeText(rawNum).then(() => showToast(`📞 ${rawNum} copiado`)).catch(() => showToast("Error al copiar"));
                }
            });
        });
    }

    function showToast(msg) {
        const toast = document.getElementById("toastMsg");
        toast.textContent = msg;
        toast.style.opacity = "1";
        setTimeout(() => toast.style.opacity = "0", 1700);
    }

    function setLoading(loading) {
        if (loading) {
            phoneContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:1.5rem;"><span class="spinner"></span> Generando números seguros...</div>`;
        }
    }

    function generateFullList(reset = true, append = false) {
        const city = citySelect.value;
        const message = customMsgInput.value.trim();
        if (message) currentMessage = message;
        else currentMessage = "Hola, vi tu número en la red anónima. ¿Charlamos?";

        if (reset) {
            generatedNumbers = [];
            currentUsedSet.clear();
        }
        setLoading(true);
        setTimeout(() => {
            const countToAdd = reset ? 8 : 5;
            const { newNumbers, usedSet } = API.generateUniqueNumbers(city, countToAdd, currentUsedSet, currentMessage);
            if (reset) {
                generatedNumbers = newNumbers;
                currentUsedSet = usedSet;
            } else {
                generatedNumbers = [...generatedNumbers, ...newNumbers];
                currentUsedSet = usedSet;
            }
            renderNumbers(generatedNumbers);
            if (generatedNumbers.length === 0) {
                showToast("No se generaron números, cambia de filtro.");
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

    let debounceTimer;
    searchBtn.addEventListener("click", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => resetAndGenerate(), 30);
    });
    resetBtn.addEventListener("click", resetAndGenerate);
    loadMoreBtn.addEventListener("click", loadMore);
    citySelect.addEventListener("change", () => resetAndGenerate());

    initModals();
    resetAndGenerate();
})();