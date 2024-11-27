// src/features/content.ts
import { CartData, CartItem, ScrapeMessage } from '../types/types';

const scrapeCart = (): CartData => {
  const items: CartItem[] = [];
  
  // Select all cart items
  const cartItems: NodeListOf<Element> = document.querySelectorAll('.sc-list-item');
  
  cartItems.forEach((item: Element) => {
    const nameElement: HTMLElement | null = item.querySelector('.sc-product-title');
    const priceElement: HTMLElement | null = item.querySelector('.sc-price');
    
    if (nameElement && priceElement) {
      items.push({
        name: nameElement.textContent?.trim() ?? '',
        price: priceElement.textContent?.trim() ?? ''
      });
    }
  });
  
  // Get total price
  const totalElement: HTMLElement | null = document.querySelector('.sc-subtotal-amount-activecart');
  const total: string = totalElement ? totalElement.textContent?.trim() ?? 'N/A' : 'N/A';
  
  return {
    items,
    total
  };
};

// Add type assertion for chrome.runtime
chrome.runtime.onMessage.addListener(
  (request: ScrapeMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response: CartData) => void) => {
    if (request.action === 'scrapeCart') {
      const cartData = scrapeCart();
      sendResponse(cartData);
    }
  }
);