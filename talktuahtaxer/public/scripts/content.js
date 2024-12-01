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
                        chrome.storage.local.get(['sliderAmount'], async function (result) {
                            const sliderAmount = result.sliderAmount || 0;

                            const response = await fetch('http://127.0.0.1:8000/api/v1/start-debate', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    title: name,
                                    price: price,
                                    threshold: sliderAmount
                                })
                            });

                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }

                            const debateData = await response.json();
                            console.log('Debate started for product:', { name, price }, 'Response:', debateData);

                            // Call showPopup with the debate data
                            showPopup(debateData);

                            productList.push({
                                name: name,
                                price: price,
                                debateData: debateData
                            });
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

// Function to create and show popup
// function showPopup(cartData) {
//     console.log('Creating popup with cart data:', cartData);

//     // Create a div for the popup
//     const popup = document.createElement('div');
//     popup.classList.add('popup');

//     popup.style.backgroundImage = `url('${chrome.runtime.getURL('Background.png')}')`;
//     popup.style.backgroundColor = 'white'; // Add a fallback background color

//     // Add a close button
//     const closeButton = document.createElement('button');
//     closeButton.classList.add('close-button');
//     closeButton.innerText = 'X';
//     closeButton.onclick = () => {
//         popup.style.opacity = '0';
//         setTimeout(() => popup.remove(), 500);
//     };

//     // Add left-side image
//     const leftImage = document.createElement('img');
//     leftImage.src = chrome.runtime.getURL('LivvyDunne.png');
//     leftImage.alt = 'Left Image';
//     leftImage.classList.add('left-image');

//     // Add left-side bubble
//     const leftBubble = document.createElement('img');
//     leftBubble.src = chrome.runtime.getURL('BubbleLeft.png');
//     leftBubble.alt = 'Left Bubble';
//     leftBubble.classList.add('left-bubble');

//     // Add the text in the center
//     const popupText = document.createElement('div');
//     popupText.innerText = `Your cart total is $${cartData.total.toFixed(2)}. Do you really want to purchase this?`;
//     popupText.style.flex = '1';
//     popupText.style.margin = '0 20px';
//     popupText.style.fontSize = '24px';
//     popupText.style.fontWeight = 'bold';
//     popupText.style.color = 'white';

//     // Add right-side image
//     const rightImage = document.createElement('img');
//     rightImage.src = chrome.runtime.getURL('KaiCenat.png');
//     rightImage.alt = 'Right Image';
//     rightImage.classList.add('right-image');

//     // Add right-side bubble
//     const rightBubble = document.createElement('img');
//     rightBubble.src = chrome.runtime.getURL('BubbleLeft.png');
//     rightBubble.alt = 'Right Bubble';
//     rightBubble.classList.add('right-bubble');

//     // Append everything to the popup
//     popup.appendChild(closeButton);
//     popup.appendChild(leftImage);
//     popup.appendChild(leftBubble);
//     popup.appendChild(popupText);
//     popup.appendChild(rightImage);
//     popup.appendChild(rightBubble);

//     // Append the popup to the body
//     document.body.appendChild(popup);

//     console.log('Popup created and appended to body');

//     // Trigger the fade-in effect after appending
//     setTimeout(() => {
//         popup.style.opacity = '1';
//         console.log('Popup fade-in triggered');
//     }, 10);
// }

// Function to stream and play audio

function showPopup(debateData) {
    let currentAudio = null;
    let isClosing = false;
    console.log('Creating popup with Full debate data:', debateData);

    // Store session ID from the debate data
    const sessionId = debateData.session_id;
    console.log('Using session ID:', sessionId);

    // Create a div for the popup
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.style.opacity = '0';
    popup.style.backgroundImage = `url('${chrome.runtime.getURL('Background.png')}')`;
    popup.style.backgroundColor = 'white'; // Add a fallback background color

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.classList.add('close-button');
    closeButton.innerText = 'X';
    closeButton.onclick = () => {
        // Stop current audio if playing
        isClosing = true;
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.src = '';
            currentAudio = null;
        }

        // Clear any ongoing timeouts
        const highestTimeoutId = setTimeout(() => { });
        for (let i = 0; i < highestTimeoutId; i++) {
            clearTimeout(i);
        }

        // Clear all text and hide bubbles
        leftText.innerText = '';
        rightText.innerText = '';
        leftBubble.style.display = 'none';
        rightBubble.style.display = 'none';

        // Fade out and remove popup
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 500);
    };

    // Add images and bubbles
    const leftImage = document.createElement('img');
    leftImage.src = chrome.runtime.getURL('LivvyDunne.png');
    leftImage.alt = 'Left Image';
    leftImage.classList.add('left-image');

    const rightImage = document.createElement('img');
    rightImage.src = chrome.runtime.getURL('KaiCenat.png');
    rightImage.alt = 'Right Image';
    rightImage.classList.add('right-image');

    const leftBubble = document.createElement('img');
    leftBubble.src = chrome.runtime.getURL('BubbleLeft.png');
    leftBubble.alt = 'Left Bubble';
    leftBubble.classList.add('left-bubble');
    leftBubble.style.display = 'none';

    const rightBubble = document.createElement('img');
    rightBubble.src = chrome.runtime.getURL('BubbleLeft.png');
    rightBubble.alt = 'Right Bubble';
    rightBubble.classList.add('right-bubble');
    rightBubble.style.display = 'none';
    rightBubble.style.transform = 'scaleX(-1)';

    // Add text containers for each character
    const leftText = document.createElement('div');
    const rightText = document.createElement('div');

    // Add the text styling function
    function setTextStyles(element, isLeft) {
        element.style.position = 'absolute';
        element.style.width = '220px';
        element.style.maxHeight = '130px';
        element.style.textAlign = 'center';
        element.style.overflow = 'auto';
        element.style.wordWrap = 'break-word';
        element.style.fontSize = '16px';
        element.style.lineHeight = '1.2';
        element.style.padding = '10px';
        element.style.top = '130px';
        element.style.scrollbarBehavior = 'smooth';

        if (isLeft) {
            element.style.left = '130px';
        } else {
            element.style.right = '130px';
        }
    }

    // Apply styles to text containers
    setTextStyles(leftText, true);
    setTextStyles(rightText, false);

    // Append everything to popup
    popup.appendChild(closeButton);
    popup.appendChild(leftImage);
    popup.appendChild(rightImage);
    popup.appendChild(leftBubble);
    popup.appendChild(rightBubble);
    popup.appendChild(leftText);
    popup.appendChild(rightText);

    async function streamAndPlayAudio(sessionId, character, preloadedBlob = null) {
        if (isClosing) return;
        try {
            let blob;
            if (preloadedBlob) {
                blob = preloadedBlob;
            } else {
                console.log(`Getting audio for session ${sessionId}, character ${character}`);

                const response = await fetch(`http://127.0.0.1:8000/api/v1/get-audio/${sessionId}/${character}`, {
                    headers: {
                        'Accept': 'audio/mpeg'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                blob = await response.blob();
            }

            // const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            currentAudio = audio; // Store reference to current audio

            return new Promise((resolve, reject) => {
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    currentAudio = null;
                    resolve();
                };

                audio.onerror = (error) => {
                    URL.revokeObjectURL(audioUrl);
                    currentAudio = null;
                    reject(error);
                };

                audio.play().catch(error => {
                    URL.revokeObjectURL(audioUrl);
                    currentAudio = null;
                    reject(error);
                });
            });
        } catch (error) {
            console.error(`Error streaming audio for ${character}:`, error);
            throw error;
        }
    }

    // Add the new displayText function
    async function displayText(message, textContainer, bubble) {
        return new Promise((resolve) => {
            // bubble.style.display = 'block';
            const words = message.text.split(' ');
            let currentWord = 0;

            function addWord() {
                if (currentWord < words.length) {
                    if (currentWord === 0) {
                        textContainer.innerText = words.slice(0, 5).join(' ');
                        currentWord = 5;
                    } else {
                        textContainer.innerText += ' ' + words[currentWord];
                        currentWord++;
                    }
                    textContainer.scrollTop = textContainer.scrollHeight;
                    // currentWord++;
                    setTimeout(addWord, 350);
                } else {
                    resolve();
                }
            }
            addWord();
            // setTimeout(addWord, 3000);
        });
    }

    async function handleCharacterTurn(character, text, preloadedBlob = null) {
        try {
            const textContainer = character === 'Livvy' ? leftText : rightText;
            const bubble = character === 'Livvy' ? leftBubble : rightBubble;

            // Prepare audio first
            const audioPromise = preloadedBlob ?
                streamAndPlayAudio(debateData.session_id, character.toLowerCase(), preloadedBlob) :
                streamAndPlayAudio(debateData.session_id, character.toLowerCase());

            // Only now show the popup when audio is ready
            if (character === 'Livvy') {
                // Wait for audio to be ready
                await new Promise(resolve => {
                    const checkAudio = setInterval(() => {
                        if (currentAudio && currentAudio.readyState >= 3) {
                            clearInterval(checkAudio);
                            document.body.appendChild(popup);
                            popup.style.opacity = '1';
                            bubble.style.display = 'block';
                            resolve();
                        }
                    }, 100);
                });
            } else {
                bubble.style.display = 'block';
            }

            // Start both audio and text display
            const textPromise = displayText({ text, character }, textContainer, bubble);
            await Promise.all([audioPromise, textPromise]);

            // Hide bubble and text after completing
            if (!isClosing) {
                bubble.style.display = 'none';
                textContainer.innerText = '';
            }

        } catch (error) {
            console.error(`Error during ${character}'s turn:`, error);
            if (!isClosing) {
                const textContainer = character === 'Livvy' ? leftText : rightText;
                textContainer.innerText = `Error playing ${character}'s response. Please try again.`;
            }
        }
    }

    // Add the new startConversation function
    async function startConversation() {
        if (isClosing) return;
        try {
            console.log('Debug - Responses structure:', debateData); // Add this

            // Based on your API response structure, modify this:
            const encourageText = debateData.encourage?.text;  // Changed from debateData.data.responses.encourage.text
            const discourageText = debateData.discourage?.text;

            if (!encourageText || !discourageText) {
                throw new Error('Missing response text from API');
            }

            // Start preloading Kai's audio while Livvy speaks
            const preloadKaiAudio = fetch(`http://127.0.0.1:8000/api/v1/get-audio/${debateData.session_id}/kai`, {
                headers: {
                    'Accept': 'audio/mpeg'
                }
            }).then(response => response.blob());

            // Show Livvy's response first
            await handleCharacterTurn('Livvy', encourageText);

            // By now, Kai's audio should be ready
            const kaiBlob = await preloadKaiAudio;

            // Wait a moment before Kai's response
            await new Promise(resolve => setTimeout(resolve, 200));

            // Show Kai's response
            await handleCharacterTurn('Kai', discourageText, kaiBlob);

            // Clear bubbles and text before showing decision buttons
            leftBubble.style.display = 'none';
            rightBubble.style.display = 'none';
            leftText.innerText = '';
            rightText.innerText = '';

            // Show decision buttons after both characters are done
            displayDecisionButtons();

        } catch (error) {
            console.error('Error in conversation:', error);
            console.log('Debug - Data structure:', debateData);
        }
    }

    // Function to display Yes and No buttons
    function displayDecisionButtons() {
        console.log('Displaying decision buttons');

        // Create a container for the image and text
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container'); // Add class for styling

        // Create a new image for the center
        const centerImage = document.createElement('img');
        centerImage.src = chrome.runtime.getURL('CaseOh.png'); // Replace with your image file
        centerImage.alt = 'Center Image';
        centerImage.classList.add('center-image'); // Add class for styling

        // Create text to overlay on the image
        const overlayText = document.createElement('div');
        overlayText.innerText = 'Get Fanum Taxed??'; // Replace with your text
        overlayText.classList.add('overlay-text'); // Add class for styling

        // Append the text and image to the container
        imageContainer.appendChild(centerImage);
        imageContainer.appendChild(overlayText);

        // Create a container for the buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container'); // Add container for styling

        // Create Yes button
        const yesButton = document.createElement('button');
        yesButton.innerText = 'Yes';
        yesButton.classList.add('yes-button'); // Add class for styling
        yesButton.onclick = () => {
            console.log('Yes button clicked');
            alert('You chose Yes! Proceeding to purchase...');
            popup.remove(); // Remove the popup after the decision
            window.location.href = '/checkout'; // Redirect to the checkout page
        };

        // Create No button
        const noButton = document.createElement('button');
        noButton.innerText = 'No';
        noButton.classList.add('no-button'); // Add class for styling
        noButton.onclick = () => {
            console.log('No button clicked');
            if (document.referrer) {
                console.log('Redirecting to:', document.referrer);
                window.location.href = document.referrer; // Redirect to the referring page
            } else {
                console.log('No referrer found, redirecting to homepage');
                window.location.href = '/'; // Fallback to the homepage if no referrer is available
            }
        };

        // Append buttons to the container
        buttonContainer.appendChild(yesButton);
        buttonContainer.appendChild(noButton);

        // Append the image container and button container to the popup
        popup.appendChild(imageContainer);
        popup.appendChild(buttonContainer);

        console.log('Buttons, center image, and text added to the popup');
    }


    // Append popup to body
    // document.body.appendChild(popup);

    // // Start the conversation
    // setTimeout(() => {
    //     popup.style.opacity = '1';
    //     startConversation();
    // }, 10);
    startConversation();
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
            await scrapeAmazonCart(); // Remove cartData assignment since we're showing popup directly in scrapeAmazonCart
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