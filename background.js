const getHostname = (url) => {
    return new URL(url).hostname;
}

let lastUrl = "";

const get_data = (url) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([url], (res) => {
            resolve(res);
        });
    });
};

chrome.tabs.onActivated.addListener(() => {
    chrome.tabs.query({active: true, status: "complete", lastFocusedWindow: true}, async (res) => {
        let url = getHostname(res[0].url);

        chrome.storage.sync.set({[url]: {
            "seconds": 0,
            "visit": (new Date()).toJSON()
        }});

        if(lastUrl !== "") {
            let current = await get_data(url);
            let last = await get_data(lastUrl);
            
            last[lastUrl].seconds += Math.floor((new Date(current[url].visit) - new Date(last[lastUrl].visit)) / 1000);
            
            chrome.storage.sync.set({[lastUrl]: {
                "seconds": last[lastUrl].seconds,
                "visit": last[lastUrl].visit
            }});
            
            last = await get_data(lastUrl);
            console.log(last);
        }
        lastUrl = url;
    });
}); 

let windowStart, windowEnd;
chrome.windows.onFocusChanged.addListener((windowId) => {
    if(windowStart && windowId !== chrome.windows.WINDOW_ID_NONE) {
        windowEnd = new Date();
        // console.log("WINDOW END");
        windowStart = null;
    }
    else if(windowId === chrome.windows.WINDOW_ID_NONE) {
        windowStart = new Date();
        // console.log("WINDOW START");

    }
});