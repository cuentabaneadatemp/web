(function(){
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U' || e.key === 'p' || e.key === 'P' || e.key === 'j' || e.key === 'J' || e.key === 'i' || e.key === 'I')) {
            e.preventDefault();
            return false;
        }
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.shiftKey && e.key === 'J') || (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
            return false;
        }
    });

    document.querySelectorAll('img, iframe, video').forEach(el => {
        el.addEventListener('dragstart', (e) => e.preventDefault());
    });

    const style = document.createElement('style');
    style.innerHTML = `* {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }`;
    document.head.appendChild(style);

    setInterval(() => {
        if (window.devtools && window.devtools.open) {
            window.location.reload();
        }
    }, 1000);
})();