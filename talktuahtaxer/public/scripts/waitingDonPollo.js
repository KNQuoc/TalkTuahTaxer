console.log('Content script running');

// Flag to ensure the script only runs once
let scriptExecuted = false;

if (!scriptExecuted) {
  scriptExecuted = true; // Set the flag to true to prevent re-execution

  // Create video element
  const video = document.createElement('video');
  video.src = chrome.runtime.getURL('DonPollo.mp4');
  video.style.width = '400px';
  video.style.height = '600px';
  video.style.position = 'fixed';
  video.style.top = '200px';
  video.style.left = '600px';
  video.autoplay = true;
  video.muted = false; // Ensure audio is enabled
  video.controls = false; // Optional: Add controls for debugging
  console.log('Video source:', chrome.runtime.getURL('DonPollo.mp4'));

  // Verify if the video has audio tracks
  video.addEventListener('loadeddata', () => {
    if (video.audioTracks && video.audioTracks.length === 0) {
      console.warn('The video does not contain an audio track.');
      alert('This video does not have an audio track.');
    } else {
      console.log('Audio track found.');
    }
  });

  // Add the video to the DOM
  document.body.appendChild(video);
  console.log('Video added to DOM');

  // Function to calculate random positions
  function getRandomPosition() {
    const maxX = window.innerWidth - video.offsetWidth;
    const maxY = window.innerHeight - video.offsetHeight;
    return {
      x: Math.random() * maxX,
      y: Math.random() * maxY,
    };
  }

  // Function to move the video
  function moveVideo() {
    const pos = getRandomPosition();
    video.style.left = `${pos.x}px`;
    video.style.top = `${pos.y}px`;
    console.log(`Video moved to position: (${pos.x}, ${pos.y})`);
  }

  // Start bouncing the video every 1 second
  const bounceInterval = setInterval(moveVideo, 1000);

  // Stop bouncing and clean up when the video ends
  video.addEventListener('ended', () => {
    clearInterval(bounceInterval); // Stop the bouncing interval
    console.log('Video has ended.');
    video.remove(); // Remove the video element from the DOM

    // Clean up: Remove all event listeners and reset flag
    document.body.removeEventListener('click', handleAutoplay);
    scriptExecuted = false; // Reset the flag in case the script is injected again
    console.log('Script cleaned up after first run.');
  });

  // Handle autoplay restrictions
  function handleAutoplay() {
    if (video.paused) {
      console.log('Attempting to play video with sound');
      video.play().catch((error) => {
        console.error('Error playing video:', error);
        alert('Unable to play video with sound due to browser restrictions.');
      });
    }
  }

  document.body.addEventListener('click', handleAutoplay);

  // Handle errors during video playback
  video.onerror = (e) => {
    console.error('Video failed to load or play', e);
    alert('An error occurred while loading the video.');
    video.remove(); // Remove video element if loading fails

    // Clean up on error
    clearInterval(bounceInterval);
    document.body.removeEventListener('click', handleAutoplay);
    scriptExecuted = false; // Reset the flag
  };
} else {
  console.log('Script has already been executed. Skipping re-run.');
}
