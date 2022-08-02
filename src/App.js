/* global chrome */

import './App.css';
import {useState, useEffect} from 'react'
import { act } from 'react-dom/test-utils';

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

function App() {

  const [data, setData] = useState([]);

  async function updateTable() {
    let domains = JSON.parse(await get_data("domains"));
    if(domains === "undefined") return [];
    let websites_list = Object.keys(domains);
    let today = toFormalDate(new Date());
  
    let OVERALL_TIME = 0;
    for(var i = 0; i < websites_list.length; i++) {
        if(domains[websites_list[i]].days[today]) {
            OVERALL_TIME += domains[websites_list[i]].days[today];
        }
    }
  
    let activities = [];
  
    let colors = ["FF0000", "FF7A00", "FAFF00", "ADFF00", "33FF00", "00FF66", "00FF38", "00FFA3", "0788FF", "8F00FF", "D9D9D9"];
  
    websites_list.sort((a, b) => domains[b].days[today] - domains[a].days[today]);
  
    let off_domains = ["newtab", ""];
  
    let totalSeconds = 0;
    for(var i = 0; i < websites_list.length; i++) {
        let seconds = domains[websites_list[i]].days[today];
        if(seconds && websites_list[i] !== "newtab" && websites_list[i] !== "") {
            totalSeconds += seconds;
            let colorId = (i < 10 ? i : 10);
            activities.push({
              "color": `#${colors[colorId]}`,
              "hostname": websites_list[i],
              "percentage": getProportion(seconds, OVERALL_TIME),
              "hours": getHours(seconds),
              "minutes": getMinutes(seconds),
              "seconds": getSeconds(seconds)
            });
        }
    }
  
    activities.push({
      "color": "#",
      "hours": getHours(totalSeconds),
      "minutes": getMinutes(totalSeconds),
      "seconds": getSeconds(totalSeconds)
    });
  
    setData(activities);
  }

  updateTable();

  let currentData = data;

  return (
    <>
      <div className="headings">
          <div className="primary-heading">
              Webtime Trackshare
          </div>
          <div className="secondary-heading">
              Let others to be aware of your web activity!
          </div>
      </div>
      <div className="switchers">
          <button className="today active">
              Today
          </button>
          <button className="average">
              Daily Average
          </button>
          <button className="overall">
              All-time
          </button>
      </div>
      <div className="headline-container">
          <p className="headline">Today data</p>
      </div>
      <div className="activity-table">
        {currentData.length>0 && currentData.map((obj) => obj.color !== "#" ? (
          <div className="website-data">
            <div className="domain-part">
                <div className="coloured-circle" style={{backgroundColor: obj.color}}></div>
                <div className="hostname-container">
                    <span className="hostname">{obj.hostname}</span>
                </div>
            </div>
            <div className="stats-part">
                <div className="percentage-container">
                    <span className="percentage">{obj.percentage}%</span>
                </div>
                <div className="elapsed-time">
                    <div className="hh">{obj.hours}h</div>
                    <div className="mm">{obj.minutes}m</div>
                    <div className="ss">{obj.seconds}s</div>
                </div>
            </div>
          </div>
        ) : "")}
      </div>
      <hr />
      {currentData.length ? (
        <div className="website-data">
            <div className="domain-part">
                <div className="uncoloured-circle"></div>
                <div className="hostname-container">
                    <span className="hostname">Total</span>
                </div>
            </div>
            <div className="stats-part">
                <div className="percentage-container">
                    <span className="percentage">100.00%</span>
                </div>
                <div className="elapsed-time">
                    <div className="hh">{currentData[currentData.length-1].hours}h</div>
                    <div className="mm">{currentData[currentData.length-1].minutes}m</div>
                    <div className="ss">{currentData[currentData.length-1].seconds}s</div>
                </div>
            </div>
        </div>
      ):""}
      <div className="footer">
          <span className="author-message">Made with <span className="heart"> ❤️‍🔥 </span>by darkxeon</span>
      </div>
    </>
  );
}

export default App;
