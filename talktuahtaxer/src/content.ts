console.log("Content script loaded.");
// Additional functionality can be added here

import { AmazonScraper } from './lib/checkoutScraper.js';

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeCheckout') {
    AmazonScraper.scrapeCheckoutPage()
      .then(data => {
        console.log('Scraped data:', data);
        sendResponse({ success: true, data });
      })
      .catch(error => {
        console.error('Scraping error:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // Return true to indicate we'll send a response asynchronously
    return true;
  }
});

// You can also auto-run the scraper when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.href.includes('amazon.com/gp/cart') || 
      window.location.href.includes('amazon.com/checkout')) {
    try {
      const data = await AmazonScraper.scrapeCheckoutPage();
      console.log('Checkout data:', data);
      
      // Send data to your extension's background script
      chrome.runtime.sendMessage({
        action: 'checkoutDataScraped',
        data
      });
    } catch (error) {
      console.error('Error scraping checkout:', error);
    }
  }
});