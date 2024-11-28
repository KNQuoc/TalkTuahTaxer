function scrapeCartAmazon() {
    try {
        const possibleSelectors = [
            "sc-list-body",
            "sc-list-item-content",
            "a-row.sc-cart-card",
            "sc-item-price-block",
            "a-section.sc-list-item"
        ];

        let cartSection = null;
        for (const selector of possibleSelectors) {
            const element = document.querySelector(`.${selector}`);
            if (element) {
                cartSection = element;
                console.log("Found cart using selector:", selector);
                break;
            }
        }

        if (!cartSection) {
            cartSection = document.querySelector('[data-name="Active Cart"]');
        }

        if (!cartSection) {
            throw new Error("Cart section not found. Verify you're on the cart page.");
        }

        const text = cartSection.innerText;
        console.log("Cart section text:", text);

        const productRegex = /([\w\s\-().&',]+)\s*\$\s*(\d+\.\d{2})[\s\S]*?(?:Qty|Quantity):\s*(\d+)/gim;
        const matches = Array.from(text.matchAll(productRegex));

        if (matches.length === 0) {
            console.log("No products found in cart section text.");
            return { products: [], subtotal: 0, tax: 0, total: 0 };
        }

        const products = matches.map(match => ({
            name: match[1].trim(),
            price: parseFloat(match[2]),
            quantity: parseInt(match[3], 10)
        }));

        const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        const tax = subtotal * 0.13;
        const total = subtotal + tax;

        return {
            products,
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        };
    } catch (error) {
        console.error("Error scraping cart:", error);
        return { products: [], subtotal: 0, tax: 0, total: 0 };
    }
}
