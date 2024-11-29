async function scrapeAmazonCart() {
    console.log('Starting to scrape cart');
    try {
        const activeCartSection = document.getElementById('sc-active-cart');
        // Get all products in cart
        const products = activeCartSection.querySelectorAll('.sc-list-item');
        console.log(`Found ${products.length} products`);

        const productList = [];

        for (const product of products) {
            try {
                const nameElement = product.querySelector('.sc-product-title .a-truncate-cut');
                const priceMatch = product.textContent.match(/\$(\d+\.\d{2})/);

                if (nameElement && priceMatch) {
                    const name = nameElement.textContent.trim();
                    const price = parseFloat(priceMatch[0].replace('$', ''));
                    console.log('Product found:', { name, price });

                    // Send data to backend
                    try {
                        const response = await fetch('http://127.0.0.1:8000/api/v1/start-debate', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                title: name,
                                price: price,
                                description: null,
                                previous_messages: null
                            })
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const debateData = await response.json();
                        console.log('Debate started for product:', { name, price }, 'Response:', debateData);

                        productList.push({
                            name: name,
                            price: price,
                            debateData: debateData
                        });
                    } catch (fetchError) {
                        console.error('Error sending data to backend:', fetchError);
                    }
                }
            } catch (error) {
                console.error('Error scraping a product:', error);
            }
        }
        // console.log('Scraped Products:');
        // console.table(productList);

        const total = productList.reduce((sum, product) => sum + product.price, 0);
        return { products: productList, total };

    } catch (error) {
        console.error('Error scrapping cart:', error);
        return null;
    }
}