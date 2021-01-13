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
  confirmation.style.display = 'block';
}

function addTask(title, pageUrl) {
  let date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  const dateString = date.toISOString().slice(0,10);

  let data = {};
  data.title = title;
  data.note = pageUrl;
  data.day = dateString;

  fetch('https://serv.amazingmarvin.com/api/addTask', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'X-API-Token': storedApiToken
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    endLoad();
    if (!response.ok) {
      throw new Error('Network error');
    }
    return response.json();
  })
  .then(responseJSON => {
    newTaskSucceeded(responseJSON.title, responseJSON.day);
  })
  .catch((error) => {
    showError();
  });
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