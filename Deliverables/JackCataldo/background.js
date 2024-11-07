chrome.identity.getAuthToken({ interactive: true }, function(token) {
    if (chrome.runtime.lastError || !token) {
        console.error('Error obtaining auth token:', chrome.runtime.lastError);
        return;
    }
    console.log('Auth token obtained:', token);
    // Continue with the API call
});

// Add a listener to handle the request for the auth token
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getAuthToken') {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            sendResponse({ token: token });
        });
        return true;  // indicates the response is async
    }
});
