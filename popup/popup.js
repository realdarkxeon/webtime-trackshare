const get_data = (item) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([item], (res) => {
            resolve(res[item]);
        });
    });
};

function toFormalDate(obj) {
    return `${obj.getFullYear()}-${obj.getMonth()+1}-${obj.getDate()}`;
}

const getProportion = (a, b) => {
    let c = a / b * 100;
    if(c < 10) {
        return c.toPrecision(3);
    }
    else {
        return c.toPrecision(3);
    }
};

const getHours = (s) => {
    return Math.floor(s / 3600);
};

const getMinutes = (s) => {
    let res = Math.floor(s / 60) % 60;
    if(res < 10) {
        return "0"+res.toString();
    }
    else {
        return res.toString();
    }
};

const getSeconds = (s) => {
    let res = s % 60;
    if(res < 10) {
        return "0"+res.toString();
    }
    else {
        return res.toString();
    }
};

async function updateTable() {
    let domains = JSON.parse(await get_data("domains"));
    let websites_list = Object.keys(domains);
    let today = toFormalDate(new Date());

    let OVERALL_TIME = 0;
    for(var i = 0; i < websites_list.length; i++) {
        if(domains[websites_list[i]].days[today]) {
            OVERALL_TIME += domains[websites_list[i]].days[today];
        }
    }

    let activities = document.getElementsByClassName("activity-table")[0];

    let colors = ["FF0000", "FF7A00", "FAFF00", "ADFF00", "33FF00", "00FF66", "00FF38", "00FFA3", "0788FF", "8F00FF", "D9D9D9"];

    websites_list.sort((a, b) => domains[b].days[today] - domains[a].days[today]);

    activities.innerHTML = "";
    let totalSeconds = 0;
    for(var i = 0; i < websites_list.length; i++) {
        let seconds = domains[websites_list[i]].days[today];
        if(seconds) {
            totalSeconds += seconds;
            let colorId = (i < 10 ? i : 10);
            let addedHTML = `<div class="website-data">
                                <div class="domain-part">
                                    <div class="coloured-circle" style="background-color: #${colors[colorId]}"></div>
                                    <div class="hostname-container">
                                        <span class="hostname">${websites_list[i]}</span>
                                    </div>
                                </div>
                                <div class="stats-part">
                                    <div class="percentage-container">
                                        <span class="percentage">${getProportion(seconds, OVERALL_TIME)}%</span>
                                    </div>
                                    <div class="elapsed-time">
                                        <div class="hh">${getHours(seconds)}h</div>
                                        <div class="mm">${getMinutes(seconds)}m</div>
                                        <div class="ss">${getSeconds(seconds)}s</div>
                                    </div>
                                </div>
                            </div>`;
            activities.innerHTML += addedHTML;
        }
    }

    let th = document.querySelector("body > div.website-data > div.stats-part > div.elapsed-time > div.hh");
    let tm = document.querySelector("body > div.website-data > div.stats-part > div.elapsed-time > div.mm");
    let ts = document.querySelector("body > div.website-data > div.stats-part > div.elapsed-time > div.ss");

    th.innerHTML = `${getHours(totalSeconds)}h`;
    tm.innerHTML = `${getMinutes(totalSeconds)}m`;
    ts.innerHTML = `${getSeconds(totalSeconds)}s`;

    let arr = document.getElementsByClassName("website-data");
    for(var i = 0; i+1 < arr.length; i++) {
        arr[i].addEventListener("mouseenter", (event) => {
            event.target.style.color = "#000"; 
        });
        arr[i].addEventListener("mouseleave", (event) => {
            event.target.style.color = "#7e7e7e";
        });
    }
}

updateTable();