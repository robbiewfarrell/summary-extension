document.addEventListener('DOMContentLoaded', function() {
 const summarizeBtn = document.getElementById('summarizeBtn');
 const statusDiv = document.getElementById('status');
 const summaryDiv = document.getElementById('summary');

 summarizeBtn.addEventListener('click', async () => {
   try {
     statusDiv.textContent = 'Generating summary...';
     summaryDiv.textContent = '';

     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
     
     const results = await chrome.scripting.executeScript({
       target: { tabId: tab.id },
       function: () => {
         const container = document.getElementById('page-container');
         if (!container) {
           return 'No content found with ID "page-container"';
         }
         const text = container.innerText;
         const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
         const topSentences = sentences.slice(0, 5);
         return topSentences.join('. ');
       }
     });

     if (results && results[0]) {
       statusDiv.textContent = 'Summary generated!';
       summaryDiv.textContent = results[0].result;
     }

   } catch (error) {
     statusDiv.textContent = `Error: ${error.message}`;
     console.error(error);
   }
 });
});