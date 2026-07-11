import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import { WebAudioAdapter } from './platform/web/audio';
import './ui/styles.css';
import './ui/accessibility.css';
const root = document.querySelector('#root');
if (!(root instanceof HTMLElement)) throw new Error('Missing #root');
createRoot(root).render(<StrictMode><App audio={new WebAudioAdapter()} /></StrictMode>);
