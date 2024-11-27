import React, { useState, useEffect } from "react";
import { CartData, CartItem } from "./types/types";

const App: React.FC = () => {
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scrapeCart = async (): Promise<void> => {
      try {
        // Get the active tab
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (!tab.id) {
          throw new Error("No active tab found");
        }

        // Send message to content script
        const response: CartData = await chrome.tabs.sendMessage(tab.id, {
          action: "scrapeCart" as const,
        });

        setCartData(response);
        setLoading(false);
      } catch (err) {
        setError(
          "Failed to scrape cart. Make sure you're on an Amazon cart page."
        );
        setLoading(false);
      }
    };

    scrapeCart();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!cartData) return <div className="p-4">No cart data found.</div>;

  return (
    <div className="p-4 max-w-md">
      <h1 className="text-xl font-bold mb-4">Cart Contents</h1>

      <div className="space-y-4">
        {cartData.items.map((item: CartItem, index: number) => (
          <div key={index} className="border p-2 rounded">
            <div className="font-medium">{item.name}</div>
            <div className="text-gray-600">{item.price}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="font-bold">Total: {cartData.total}</div>
      </div>
    </div>
  );
};

export default App;
