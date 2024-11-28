// Create a div for the popup
const popup = document.createElement('div');
popup.style.position = 'fixed';
popup.style.top = '50%';
popup.style.left = '50%';
popup.style.transform = 'translate(-50%, -50%)'; // Center the popup
popup.style.zIndex = '10000';
popup.style.background = 'white';
popup.style.border = '1px solid black';
popup.style.padding = '40px';
popup.style.borderRadius = '10px';
popup.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
popup.style.fontFamily = 'Arial, sans-serif';
popup.style.fontSize = '20px';
popup.style.textAlign = 'center';
popup.style.width = '600px'; // Make popup wider
popup.style.display = 'flex';
popup.style.justifyContent = 'space-between';
popup.style.alignItems = 'center';

// Add a left-side image
const leftImage = document.createElement('img');
leftImage.src = chrome.runtime.getURL('ChillGuy.jpeg'); // Local left image
leftImage.alt = 'Left Image';
leftImage.style.width = '150px';
leftImage.style.height = '150px';
leftImage.style.objectFit = 'cover'; // Maintain aspect ratio
leftImage.style.borderRadius = '10px';

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
rightImage.src = chrome.runtime.getURL('CaseOh.jpg'); // Local right image
rightImage.alt = 'Right Image';
rightImage.style.width = '150px';
rightImage.style.height = '150px';
rightImage.style.objectFit = 'cover'; // Maintain aspect ratio
rightImage.style.borderRadius = '10px';

// Add a close button below the popup
const closeButton = document.createElement('button');
closeButton.innerText = 'Close';
closeButton.style.marginTop = '20px';
closeButton.style.padding = '10px 20px';
closeButton.style.cursor = 'pointer';
closeButton.style.border = 'none';
closeButton.style.borderRadius = '5px';
closeButton.style.background = '#007bff';
closeButton.style.color = 'white';
closeButton.style.fontSize = '16px';
closeButton.onclick = () => {
  popup.remove();
};

// Append everything to the popup
popup.appendChild(leftImage);
popup.appendChild(popupText);
popup.appendChild(rightImage);
document.body.appendChild(popup);

// Add the close button below the popup
popup.appendChild(closeButton);
