const getHostname = (url) => {
    return new URL(url).hostname;
}

let lastUrl = "", badgeTimer, url;

const get_data = (temp_url) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([temp_url], (res) => {
            resolve(res);
        });
    });
};

const get_time = (seconds) => {
    let answer = "";
    if(seconds < 60) {
        answer = `${seconds}s`;
    }
    else if(seconds < 3600) {
        answer = `${Math.floor(seconds / 60)}m`;
    }
    else {
        answer = `${Math.floor(seconds / 3600)}h`;
    }
    return answer;
};

chrome.tabs.onActivated.addListener(() => {
    chrome.tabs.query({active: true, status: "complete", lastFocusedWindow: true}, async (res) => {
        url = getHostname(res[0].url);

        chrome.storage.sync.set({[url]: {
            "seconds": 0,
            "visit": (new Date()).toJSON()
        }});

        if(badgeTimer) clearInterval(badgeTimer);

        if(lastUrl !== "" && lastUrl !== url) {
            let current = await get_data(url);
            let last = await get_data(lastUrl);
            
            last[lastUrl].seconds += Math.floor((new Date(current[url].visit) - new Date(last[lastUrl].visit)) / 1000);
            
            chrome.storage.sync.set({[lastUrl]: {
                "seconds": last[lastUrl].seconds,
                "visit": last[lastUrl].visit
            }});
            
            last = await get_data(lastUrl);
            console.log(last);
            
            // TODO: start timer on the badge

            let displayTime = current[url].seconds;

            badgeTimer = setInterval(() => {
                chrome.action.setBadgeText({text: get_time(displayTime)});
                displayTime += 3;
            }, 3000);
        }
        lastUrl = url;
    });
}); 

let windowStart, windowEnd;
const handleBrowserFocus = async (windowId) => {
    if(windowStart && windowId !== chrome.windows.WINDOW_ID_NONE) {
        windowEnd = new Date();
        // TODO: subtract idle time from webtime
        let current = await get_data(url);
        current[url].seconds -= Math.floor((new Date(windowEnd) - new Date(windowStart)) / 1000);
        chrome.storage.sync.set({[url]: {
            "seconds": current[url].seconds,
            "visit": current[url].visit
        }});
        windowStart = null;
        
        let displayTime = current[url].seconds;

        badgeTimer = setInterval(() => {
            chrome.action.setBadgeText({text: get_time(displayTime)});
            displayTime += 3;
        }, 3000);
    }
    else if(windowId === chrome.windows.WINDOW_ID_NONE) {
        windowStart = new Date();
        // TODO: stop timer on the badge
        clearInterval(badgeTimer);
    }
};

chrome.windows.onFocusChanged.addListener((windowId) => {
    handleBrowserFocus(windowId);
});

