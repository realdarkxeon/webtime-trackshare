const TIMEOUT = 5000;
let start, end, timeout;

window.addEventListener('mousemove', () => {
    if(start) {
        end = new Date();
        // TODO: subtract idle time from webtime
    }
    
    if(timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
        // TODO: send message to stop timer on the badge
        start = new Date();
    }, TIMEOUT);
});