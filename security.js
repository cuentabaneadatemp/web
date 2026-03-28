(function(){
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    document.addEventListener('keydown', function(e) {
        const target = e.target;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
        if (isInput && e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V')) {
            return;
        }
        if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U' || 
                          e.key === 'p' || e.key === 'P' || e.key === 'j' || e.key === 'J' || 
                          e.key === 'i' || e.key === 'I')) {
            e.preventDefault();
            return false;
        }
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || 
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
            return false;
        }
    });
    document.querySelectorAll('img, iframe, video').forEach(el => {
        el.addEventListener('dragstart', (e) => e.preventDefault());
    });
    const style = document.createElement('style');
    style.innerHTML = `body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    input, textarea {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
    }`;
    document.head.appendChild(style);
})();