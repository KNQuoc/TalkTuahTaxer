// Create a div for the popup
const popup = document.createElement('div');
popup.classList.add('popup'); // Add the CSS class for styles

// Append the popup to the body
document.body.appendChild(popup);

// Trigger the fade-in effect after appending the popup
setTimeout(() => {
  popup.style.opacity = '1'; // Fully visible
}, 10);

// Add a left-side image
const leftImage = document.createElement('img');
leftImage.src = chrome.runtime.getURL('LivvyDunne.png'); // Path to the image
leftImage.alt = 'Left Image';
leftImage.classList.add('left-image'); // Add a CSS class for styles

// Add left-side bubble 
const leftBubble = document.createElement('img');
leftBubble.src = chrome.runtime.getURL('BubbleLeft.png'); // Path to the image
leftBubble.alt = 'Left Bubble';
leftBubble.classList.add('left-bubble'); // Add a CSS class for styles

// Add the text in the center
const popupText = document.createElement('div');
popupText.innerText = "STOP! Do you really want to purchase this?";
popupText.style.flex = '1';
popupText.style.margin = '0 20px'; // Add spacing between images
popupText.style.fontSize = '24px';
popupText.style.fontWeight = 'bold';
popupText.style.color = 'black';

// Add a right-side image
const rightImage = document.createElement('img');
rightImage.src = chrome.runtime.getURL('KaiCenat.jpg'); // You can use a different image
rightImage.alt = 'Right Image';
rightImage.classList.add('right-image'); // Add a CSS class for styles

// Add right-side bubble
const rightBubble = document.createElement('img');
rightBubble.src = chrome.runtime.getURL('BubbleRight.png'); // Path to the image
rightBubble.alt = 'Right Bubble';
rightBubble.classList.add('right-bubble'); // Add a CSS class for styles

// Add the "X" close button in the top-right corner
const closeButton = document.createElement('button');
closeButton.classList.add('close-button');
closeButton.innerText = 'X';
closeButton.onclick = () => {
  popup.style.opacity = '0'; // Start fading out
  setTimeout(() => popup.remove(), 500); // Remove after fade-out
};

// Append everything to the popup
popup.appendChild(closeButton); // Add close button first to ensure it's on top
popup.appendChild(leftImage);
popup.appendChild(leftBubble);
popup.appendChild(popupText);
popup.appendChild(rightImage);
popup.appendChild(rightBubble);

const sessionId = 'c21bc583-e6ba-4db3-9626-e8dfa6dd923f'; // Replace this with your session ID dynamically
fetch(`http://127.0.0.1:8000/api/v1/debate-history/${sessionId}`)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    console.log('Data fetched successfully:', data);
  })
  .catch((error) => {
    console.error('Error fetching debate history:', error);
  });
