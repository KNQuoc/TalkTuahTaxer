// src/lib/amazonScraper.ts

export interface CartItem {
    name: string;
    price: number;
    quantity: number;
  }
  
  export interface CartTotal {
    subtotal: number;
    tax?: number;
    shipping?: number;
    total: number;
  }
  
  export class AmazonScraper {
    private static priceToNumber(priceString: string): number {
      return parseFloat(priceString.replace(/[^0-9.-]+/g, ''));
    }
  
    static scrapeCartItems(): CartItem[] {
      const items: CartItem[] = [];
      
      // Select all cart items
      const cartItems = document.querySelectorAll('.sc-list-item');
      
      cartItems.forEach((item) => {
        try {
          const nameElement = item.querySelector('.sc-product-title');
          const priceElement = item.querySelector('.sc-price');
          const quantityElement = item.querySelector('.sc-quantity-textfield');
  
          if (nameElement && priceElement && quantityElement) {
            const name = nameElement.textContent?.trim() || '';
            const price = this.priceToNumber(priceElement.textContent || '0');
            const quantity = parseInt(
              (quantityElement as HTMLInputElement).value || '1',
              10
            );
  
            items.push({ name, price, quantity });
          }
        } catch (error) {
          console.error('Error scraping cart item:', error);
        }
      });
  
      return items;
    }
  
    static scrapeCartTotal(): CartTotal {
      try {
        // Attempt to find subtotal
        const subtotalElement = document.querySelector('.sc-subtotal-amount-activecart');
        const subtotal = subtotalElement 
          ? this.priceToNumber(subtotalElement.textContent || '0')
          : 0;
  
        // Attempt to find tax
        const taxElement = document.querySelector('.sc-tax-amount');
        const tax = taxElement 
          ? this.priceToNumber(taxElement.textContent || '0')
          : undefined;
  
        // Attempt to find shipping
        const shippingElement = document.querySelector('.sc-shipping-amount');
        const shipping = shippingElement
          ? this.priceToNumber(shippingElement.textContent || '0')
          : undefined;
  
        // Attempt to find total
        const totalElement = document.querySelector('.sc-grand-total');
        const total = totalElement
          ? this.priceToNumber(totalElement.textContent || '0')
          : subtotal + (tax || 0) + (shipping || 0);
  
        return {
          subtotal,
          tax,
          shipping,
          total
        };
      } catch (error) {
        console.error('Error scraping cart total:', error);
        return {
          subtotal: 0,
          total: 0
        };
      }
    }
  
    static async scrapeCheckoutPage(): Promise<{
      items: CartItem[];
      totals: CartTotal;
    }> {
      const items = this.scrapeCartItems();
      const totals = this.scrapeCartTotal();
  
      return {
        items,
        totals
      };
    }
  }