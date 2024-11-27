export interface CartItem {
    name: string;
    price: string;
  }
  
export interface CartData {
    items: CartItem[];
    total: string;
  }
  
export interface ScrapeMessage {
    action: 'scrapeCart';
  }