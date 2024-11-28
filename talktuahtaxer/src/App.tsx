import { SvelteComponent } from 'svelte';
import Popup from './popup.svelte';

const app = new Popup({
    target: document.body,
});

export default app;