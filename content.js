const TIMEOUT = 5000;
let start, end, timeout;

window.addEventListener('mousemove', () => {
    console.log('FIRST');
    if (start) {
        end = new Date();
        //
    }
    if (timeout){
        console.log('CLEARING TIMEOUT');
        clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
        console.log('IDLE START');
        
        start = new Date();
    }, TIMEOUT);
});