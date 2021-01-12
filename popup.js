let pageTitle = '';
let pageUrl = '';
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  pageTitle = tabs[0].title;
  pageUrl = tabs[0].url;
  const titleField = document.getElementById('title');
  titleField.value = pageTitle;
  titleField.focus();
  titleField.select();
});

let storedApiToken = '';
chrome.storage.sync.get('apiKey', function(data) {
  storedApiToken = data.apiKey;
});

const dimmer = document.getElementById('dimmer');
const error = document.getElementById('error');
const confirmation = document.getElementById('confirmation');

function showError() {
  error.style.display = 'flex';
}

function hideError() {
  error.style.display = 'none';
}

function startLoad() {
  dimmer.style.display = 'block';
  hideError();
}

function endLoad() {
  dimmer.style.display = 'none';
}

function newTaskSucceeded(title, dateString) {
  const successTextPara = document.getElementById('successText');
  const successTextHTML = 'New task <b>' + title + '</b> added on <b>' + dateString + '</b>.';
  successTextPara.innerHTML = successTextHTML;
  // const marvinURL = 'https://app.amazingmarvin.com/';
  // chrome.tabs.create({ url: marvinURL });
  // window.close();
  confirmation.style.display = 'block';
}

function addTask(title, pageUrl) {
  const req = new XMLHttpRequest();
  const baseUrl = 'https://serv.amazingmarvin.com/api/addTask';

  let date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  const dateString = date.toISOString().slice(0,10);

  let data = {};
  data.title = title;
  data.note = pageUrl;
  data.day = dateString;

  req.open('POST', baseUrl, true);
  req.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
  req.setRequestHeader('X-API-Token', storedApiToken);
  req.send(JSON.stringify(data));

  req.onreadystatechange = function() { // Call a function when the state changes.
    if (this.readyState === XMLHttpRequest.DONE) {
      if (this.status === 200) {
        const responseJSON = JSON.parse(req.responseText);
        newTaskSucceeded(responseJSON.title, responseJSON.day);
      } else {
        showError();
      }
      endLoad();
    }
  }
};

const titleField = document.getElementById('title');

const submitAction = function() {
  startLoad();
  let title = titleField.value;
  addTask(title, pageUrl);
}

const checkForEnter = function() {
  const key = window.event.keyCode;

  // If the user has pressed enter
  if (key === 13) {
    submitAction();
    return false;
  } else {
    return true;
  }
}

titleField.onkeypress = checkForEnter;

const button = document.getElementById('submitButton');
button.onclick = submitAction;