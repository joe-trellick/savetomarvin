function saveSettings() {
  const apiKey = document.getElementById('apiKey').value;
  chrome.storage.sync.set({apiKey: apiKey}, function() {
  })
}

const submitButton = document.getElementById('submitButton');
submitButton.addEventListener('click', saveSettings);

chrome.storage.sync.get('apiKey', function(data) {
  if (data.apiKey !== undefined) {
    document.getElementById('apiKey').value = data.apiKey;
  }
});
