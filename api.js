(function(global) {
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

    function generateUniqueNumbers(count, existingSet = new Set(), currentMessage) {
        const newNumbers = [];
        const used = new Set(existingSet);
        let attempts = 0;
        const maxAttempts = 10000;

        while (newNumbers.length < count && attempts < maxAttempts) {
            let raw = generateRawCubanMobile();
            if (used.has(raw)) { attempts++; continue; }
            used.add(raw);
            const formatted = formatNumber(raw);
            const waNumber = `53${raw}`;
            const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(currentMessage)}`;
            const telegramLink = `https://t.me/+53${raw}?text=${encodeURIComponent(currentMessage)}`;
            newNumbers.push({
                raw, formatted, waLink, telegramLink,
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