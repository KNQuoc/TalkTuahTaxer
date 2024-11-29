// Create a div for the popup
const popup = document.createElement('div');
popup.classList.add('popup'); // Add the CSS class for styles
popup.style.backgroundImage = `url('${chrome.runtime.getURL('Background.png')}')`;
popup.style.backgroundColor = 'white'; // Add a fallback background color

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

// Add a left-side text container
const leftText = document.createElement('div');
leftText.classList.add('left-text'); // CSS class for Livvy's text
leftText.innerText = 'Waiting for Livvy...';

// Add a right-side image
const rightImage = document.createElement('img');
rightImage.src = chrome.runtime.getURL('KaiCenat.png'); // Path to the image
rightImage.alt = 'Right Image';
rightImage.classList.add('right-image'); // Add a CSS class for styles

// Add right-side bubble
const rightBubble = document.createElement('img');
rightBubble.src = chrome.runtime.getURL('BubbleLeft.png'); // Path to the image
rightBubble.alt = 'Right Bubble';
rightBubble.classList.add('right-bubble'); // Add a CSS class for styles

// Add a right-side text container
const rightText = document.createElement('div');
rightText.classList.add('right-text'); // CSS class for Kai's text
rightText.innerText = 'Waiting for Kai...';

// Add the text in the center
const popupText = document.createElement('div');
popupText.innerText = "STOP! Do you really want to purchase this?";
popupText.style.flex = '1';
popupText.style.margin = '0 20px'; // Add spacing between images
popupText.style.fontSize = '24px';
popupText.style.fontWeight = 'bold';
popupText.style.color = 'black';

// Add the "X" close button in the top-right corner
const closeButton = document.createElement('button');
closeButton.classList.add('close-button');
closeButton.innerText = 'X';
closeButton.onclick = () => {
  popup.style.opacity = '0'; // Start fading out
  setTimeout(() => popup.remove(), 500); // Remove after fade-out
};

// Append elements to the popup
popup.appendChild(closeButton); // Add close button first to ensure it's on top
popup.appendChild(leftImage);
popup.appendChild(leftBubble);
popup.appendChild(leftText); // Add Livvy's text container
popup.appendChild(popupText);
popup.appendChild(rightImage);
popup.appendChild(rightBubble);
popup.appendChild(rightText); // Add Kai's text container

// Fetch data and display character messages
const sessionId = '993f2736-88f2-455d-bc69-48ea09c65d5a'; // Replace this with your session ID dynamically

fetch(`http://127.0.0.1:8000/api/v1/debate-history/${sessionId}`)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    const messages = data.data.messages || [];
    let currentIndex = 0;

    function playAudio(base64Audio) {
      if (!base64Audio) return;
      
      // Convert base64 to audio
      const audio = new Audio();
      audio.src = `data:audio/mp3;base64,${base64Audio}`;
      
      return audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }

    async function displayNextTurn() {
      const message = messages[currentIndex];
      if (!message) return;

      // Clear bubbles and text containers before starting a new message
      leftText.classList.remove('fade-in', 'fade-out');
      rightText.classList.remove('fade-in', 'fade-out');
      leftText.innerText = '';
      rightText.innerText = '';
      leftBubble.style.display = 'none';
      rightBubble.style.display = 'none';

      // Play audio if available in the message
      if (message.audio) {
        await playAudio(message.audio);
      }

      const words = message.text.split(' ');
      const chunkSize = 5;
      let wordIndex = 0;

      function displayWords() {
        if (message.character === 'Livvy') {
          leftBubble.style.display = 'block';
          rightBubble.style.display = 'none';

          leftText.classList.add('fade-out');
          setTimeout(() => {
            leftText.innerText = words.slice(wordIndex, wordIndex + chunkSize).join(' ');
            leftText.classList.remove('fade-out');
            leftText.classList.add('fade-in');
          }, 500);
        } else if (message.character === 'Kai') {
          rightBubble.style.display = 'block';
          leftBubble.style.display = 'none';

          rightText.classList.add('fade-out');
          setTimeout(() => {
            rightText.innerText = words.slice(wordIndex, wordIndex + chunkSize).join(' ');
            rightText.classList.remove('fade-out');
            rightText.classList.add('fade-in');
          }, 500);
        }

        wordIndex += chunkSize;

        if (wordIndex < words.length) {
          setTimeout(displayWords, 1000);
        } else {
          currentIndex++;
          if (currentIndex < messages.length) {
            setTimeout(displayNextTurn, 2000);
          } else {
            setTimeout(() => {
              leftBubble.style.display = 'none';
              rightBubble.style.display = 'none';
              console.log('All messages displayed.');
            }, 1000);
          }
        }
      }

      displayWords();
    }

    // Start displaying turns
    displayNextTurn();
  })
  .catch((error) => {
    console.error('Error fetching debate history:', error);
    leftText.innerText = 'Failed to load Livvy\'s text.';
    rightText.innerText = 'Failed to load Kai\'s text.';
  });