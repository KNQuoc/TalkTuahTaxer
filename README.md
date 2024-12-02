#TalkTuahTaxer

We've all been there—late-night scrolling turns into “just one more thing in the cart.” Whether it’s grabbing the latest gadgets, splurging on unnecessary decor, or stocking up on way too many snacks, sticking to a budget can feel impossible. Traditional budgeting apps? Too passive. Sheer willpower? Let’s be real. That’s where TalkTuahTaxer steps in.
It’s your no-nonsense spending buddy, ready to call you out before you hit Confirm Purchase and help you think twice about that “essential” fifth pair of headphones.

## What It Does
**TalkTuahTaxer** is a Chrome extension designed to help you control your online spending. Whenever you're on Amazon checkout page, it locks the *BUY NOW* button and throws you into a scary-basement-style scenario! Two influencers will argue your purchase:
- **Kai Cenat**: Explains how buying this will give you negative aura and why you should not buy the item
- **Livvy Dunne**: Lure you into buying the item by stating how it can help you.

![Kai Cenat](talktuahtaxer/public/KaiCenat.png) ![Livvy Dunne](talktuahtaxer/public/LivvyDunne.png)
The arguments are based on your monthly budget, previous spending, and the items in your cart. By making you think twice about the pros and cons, **TalkTuahTaxer** helps you make more informed, mindful financial decisions before you proceed with any purchase.
![CaseOh](talktuahtaxer/public/CaseOh.png)

##How We Built It
we built the user interface using react keeping it clean and sigma-worthy, The backend is the vanilla cream of Node.js and FastAPI. We used openAI for conversation between Kai Cenat, Livvy Dunne, and CaseOh. As for text-to-speech, we used ElevenLabs (Goated)

##Challenges We Ran Into
Backend and Frontend Integration: Ensuring seamless communication between the backend and frontend was a significant challenge. It required a lot of debugging and optimization to maintain smooth functionality and cordination. 
Dynamic Content Handling: Amazon’s dynamicly changing content required us to create adaping dynamic scripts, ensuring they remained robust and up-to-date.

##Accomplishments That We're Proud Of
Making Finance Engaging and Fun: We succeeded in turning financial management into an enjoyable experience, encouraging users (specially gen z and alpha) to rethink their spending habits and make more responsible decisions—one Don Apollo Chicken at a time.
Our team’s dedication shone through during a 24+ hour call in a single day. From late-night brainstorming sessions to seamless collaboration, we demonstrated commitment and synergy throughout the project.

##What we learned
Innovative Approaches: Adapting creative, engaging methods can help younger generations understand and adopt essential concepts across different fields. We also learned that We learned that saving money is more than practical—it’s empowering. By making financial management accessible and fun, we’re helping users take control of their spending habits.

##What's next for TalkTuahTaxer
Expaaaaaaand, Why stop at Amazon? We’re setting our sights on platforms like eBay and Walmart to make the magic happen everywhere. Introducing a scoring system to track how responsible (or skibidi) you are with your spending habits—because accountability should come with style. Integrate Retell AI for voice chat between users and the extension—because sometimes, you really need to TalkTuah before you buy.
