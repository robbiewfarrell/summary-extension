// Function to extract main content
function extractMainContent() {
  // Try multiple methods to extract the main content of the page
  const contentSelectors = [
    'article', 
    'main', 
    '.main-content', 
    '#content', 
    '.content', 
    'body'
  ];

  for (let selector of contentSelectors) {
    const content = document.querySelector(selector);
    if (content) {
      // Remove script, style, and navigation elements
      const cleanContent = content.cloneNode(true);
      cleanContent.querySelectorAll('script, style, nav, header, footer, [class*="header"], [class*="footer"], [class*="menu"], [class*="navigation"]')
        .forEach(el => el.remove());
      
      return cleanContent.innerText.trim();
    }
  }

  // Fallback to body text if no specific content area found
  return document.body.innerText.trim();
}

// Function to generate summary
function generateSummary(text, maxLength = 500) {
  // Check if text is empty
  if (!text || text.trim().length === 0) {
    return "No content found to summarize.";
  }

  // Split text into sentences
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  
  // If not enough sentences, return full text
  if (sentences.length <= 3) {
    return text.substring(0, maxLength);
  }

  // Score sentences by word count and position
  const scoredSentences = sentences.map((sentence, index) => {
    const wordCount = sentence.split(/\s+/).length;
    // Give slightly higher score to sentences near the beginning
    const positionScore = sentences.length - index;
    return {
      sentence,
      score: wordCount * positionScore
    };
  });

  // Sort sentences by score
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)  // Take top 5 sentences
    .map(item => item.sentence);

  // Combine top sentences
  let summary = topSentences.join('. ');
  
  // Truncate to maxLength
  return summary.length > maxLength 
    ? summary.substring(0, maxLength) + '...' 
    : summary;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in content script:', request);

  if (request.action === 'generateSummary') {
    try {
      const pageContent = extractMainContent();
      const summary = generateSummary(pageContent);
      
      sendResponse({ summary: summary });
    } catch (error) {
      console.error('Error generating summary:', error);
      sendResponse({ error: error.message });
    }
    
    return true;  // Indicates we wish to send a response asynchronously
  }
});