// First, let's add a console log to confirm the script is loading
console.log('Content script loaded');

// Function to scrape cart
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

// Function to create and show popup with your exact existing structure
function showPopup(cartData) {
    console.log('Creating popup with cart data:', cartData);

    // Create a div for the popup
    const popup = document.createElement('div');
    popup.classList.add('popup');

    // Add a close button
    const closeButton = document.createElement('button');
    closeButton.classList.add('close-button');
    closeButton.innerText = 'X';
    closeButton.onclick = () => {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 500);
    };

    // Add left-side image
    const leftImage = document.createElement('img');
    leftImage.src = chrome.runtime.getURL('LivvyDunne.png');
    leftImage.alt = 'Left Image';
    leftImage.classList.add('left-image');

    // Add left-side bubble
    const leftBubble = document.createElement('img');
    leftBubble.src = chrome.runtime.getURL('BubbleLeft.png');
    leftBubble.alt = 'Left Bubble';
    leftBubble.classList.add('left-bubble');

    // Add the text in the center
    const popupText = document.createElement('div');
    popupText.innerText = `Your cart total is $${cartData.total.toFixed(2)}. Do you really want to purchase this?`;
    popupText.style.flex = '1';
    popupText.style.margin = '0 20px';
    popupText.style.fontSize = '24px';
    popupText.style.fontWeight = 'bold';
    popupText.style.color = 'black';

    // Add right-side image
    const rightImage = document.createElement('img');
    rightImage.src = chrome.runtime.getURL('KaiCenat.jpg');
    rightImage.alt = 'Right Image';
    rightImage.classList.add('right-image');

    // Add right-side bubble
    const rightBubble = document.createElement('img');
    rightBubble.src = chrome.runtime.getURL('BubbleRight.png');
    rightBubble.alt = 'Right Bubble';
    rightBubble.classList.add('right-bubble');

    // Append everything to the popup
    popup.appendChild(closeButton);
    popup.appendChild(leftImage);
    popup.appendChild(leftBubble);
    popup.appendChild(popupText);
    popup.appendChild(rightImage);
    popup.appendChild(rightBubble);

    // Append the popup to the body
    document.body.appendChild(popup);

    console.log('Popup created and appended to body');

    // Trigger the fade-in effect after appending
    setTimeout(() => {
        popup.style.opacity = '1';
        console.log('Popup fade-in triggered');
    }, 10);
}

// Function to initialize
async function initialize() {
    console.log('Initializing script');

    // Add MutationObserver to wait for cart content to load
    const observer = new MutationObserver(async (mutations, obs) => {
        const cartSection = document.getElementById('sc-active-cart');
        if (cartSection) {
            console.log('Cart section found, starting scrape');
            obs.disconnect(); // Stop observing
            const cartData = await scrapeAmazonCart();
            if (cartData && cartData.products.length > 0) {
                showPopup(cartData);
            }
        }
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Make sure the DOM is loaded before starting
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}