(function(global) {
    const CITIES = ["La Habana","Santiago de Cuba","Camagüey","Holguín","Santa Clara","Guantánamo","Pinar del Río","Cienfuegos","Matanzas","Las Tunas"];
    const VALID_SECOND_DIGITS = ['2','3','4','5','6','7','8','9'];

    function generateRawCubanMobile() {
        const secondDigit = VALID_SECOND_DIGITS[Math.floor(Math.random() * VALID_SECOND_DIGITS.length)];
        let rest = "";
        for (let i = 0; i < 6; i++) rest += Math.floor(Math.random() * 10);
        return `5${secondDigit}${rest}`;
    }

    function formatNumber(raw) {
        return `+53 ${raw.slice(0,3)} ${raw.slice(3,5)} ${raw.slice(5)}`;
    }

    function getCityForNumber(selectedCity) {
        if (selectedCity === "all") return CITIES[Math.floor(Math.random() * CITIES.length)];
        return selectedCity;
    }

    function generateUniqueNumbers(cityFilter, count, existingSet = new Set(), currentMessage) {
        const newNumbers = [];
        const used = new Set(existingSet);
        let attempts = 0;
        while (newNumbers.length < count && attempts < 250) {
            let raw = generateRawCubanMobile();
            if (used.has(raw)) { attempts++; continue; }
            used.add(raw);
            const city = getCityForNumber(cityFilter);
            const formatted = formatNumber(raw);
            const waNumber = `53${raw}`;
            const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(currentMessage)}`;
            newNumbers.push({
                raw, formatted, waLink, city,
                id: `${Date.now()}-${raw}-${Math.random()}`
            });
            attempts = 0;
        }
        return { newNumbers, usedSet: used };
    }

    global.API = {
        generateUniqueNumbers,
        formatNumber
    };
})(window);