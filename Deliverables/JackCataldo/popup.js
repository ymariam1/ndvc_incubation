let docId = null;

// Check if the current tab is a Google Docs document
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs && tabs.length > 0 && tabs[0].url) {
        const url = tabs[0].url;

        if (url.includes('docs.google.com/document/d/')) {
            // Extract Document ID from the URL
            docId = extractDocId(url);
            console.log('Document ID:', docId);
        } else {
            console.log('This is not a Google Docs document.');
        }
    } else {
        console.error('No active tab found or tab URL is undefined.');
    }
});

document.getElementById('submit').addEventListener('click', async () => {
    const userInput = document.getElementById('userInput').value;

    // Ensure that docId is available before proceeding
    if (!docId) {
        console.error('Document ID is not available.');
        return;
    }

    // Request the auth token from the background script
    chrome.runtime.sendMessage({ action: 'getAuthToken' }, async (response) => {
        const token = response.token;
        if (token && docId) {
            await writeToGoogleDocs(userInput, token, docId);
        } else {
            console.error('Unable to get the auth token or document ID.');
        }
    });
});

// Function to extract the Document ID from a Google Docs URL
function extractDocId(url) {
    const match = url.match(/https:\/\/docs\.google\.com\/document\/d\/([^\/]+)\//);
    if (match && match[1]) {
        return match[1];  // Return the Document ID
    } else {
        console.error('Invalid Google Docs URL');
        return null;
    }
}

async function writeToGoogleDocs(text, token, docId) {
    const url = `https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            requests: [
                {
                    insertText: {
                        location: { index: 1 },
                        text: text
                    }
                }
            ]
        })
    });

    if (response.ok) {
        console.log("Text added to Google Doc");
    } else {
        console.error("Error adding text to Google Doc", response.statusText);
    }
}
