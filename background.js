let UPDATE_INTERVAL = 1;
let DOMAINS_LIMIT = 10;
let TYPE = {
    "today": "today",
    "average": "average",
    "overall": "overall"
};

// let mode = TYPE.today;

function toFormalDate(obj) {
    return `${obj.getFullYear()}-${obj.getMonth()+1}-${obj.getDate()}`;
}

const getHostname = (url) => {
    return new URL(url).hostname;
}

const get_data = (item) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([item], (res) => {
            resolve(res[item]);
        });
    });
};

async function restart() {
    let days_count = await get_data("days_count");
    if(!days_count) {
        chrome.storage.sync.set({"days_count": 1});
    }
    let date = await get_data("date");
    if(!date) {
        chrome.storage.sync.set({"date": toFormalDate(new Date())});
    }
    let domains = await get_data("domains");
    if(!domains) {
        chrome.storage.sync.set({"domains": JSON.stringify({})});
    }
}

async function processLastTab(tabs) {
    if(tabs.length === 0) {
        return;
    }
    let tab = tabs[0];
    let today = toFormalDate(new Date());
    let domain = getHostname(tab.url);
    let domains = JSON.parse(await get_data("domains"));
    if(!(domain in domains)) {
        domains[domain] = {
            "alltime": 0,
            "days": {}
        };
    }
    if(!domains[domain].days[today]) {
        domains[domain].days[today] = 0;
    }
    domains[domain].days[today] += UPDATE_INTERVAL;
    domains[domain].alltime += UPDATE_INTERVAL;
    chrome.storage.sync.set({"domains": JSON.stringify(domains)});
    let num_min = Math.floor(domains[domain].days[today] / 60).toString();
    if(num_min.length < 4) {
        num_min += "m";
    }
    await chrome.action.setBadgeText({text: num_min});
}

function updateData() {
    chrome.idle.queryState(30, function(state) {
        if(state === "active") {
            chrome.tabs.query({lastFocusedWindow: true, active: true}, function(tabs) {
                processLastTab(tabs);
            });
        }
    });
}

let timerId = 0;
chrome.runtime.onInstalled.addListener(() => {
    if(timerId) clearInterval(timerId);
    restart();
    timerId = setInterval(updateData, UPDATE_INTERVAL * 1000);
});