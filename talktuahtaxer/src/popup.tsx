// src/popup.tsx
import { onMount } from 'svelte';

let message = '';

onMount(() => {
    message = 'Hello from TalkTuahTaxer!';
    console.log(message);
});