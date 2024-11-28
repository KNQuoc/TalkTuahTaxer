import { useState } from "react";

const PurchaseConfirmation = () => {
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const handleVoiceInput = () => {
    const recognition = new (window as any).SpeechRecognition();
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      if (transcript.includes("yes")) {
        setConfirmation("Accepted");
      } else if (transcript.includes("no")) {
        setConfirmation("Rejected");
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Error occurred in recognition: ", event.error);
    };
  };

  return (
    <div>
      <h2>Purchase Confirmation</h2>
      <button onClick={handleVoiceInput}>Use Voice Input</button>
      <button onClick={() => setConfirmation("Accepted")}>Yes</button>
      <button onClick={() => setConfirmation("Rejected")}>No</button>
      {confirmation && <p>Purchase: {confirmation}</p>}
    </div>
  );
};

export default PurchaseConfirmation;
