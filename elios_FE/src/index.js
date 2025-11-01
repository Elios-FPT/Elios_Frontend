// FRONT-END: elios_FE/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import "./i18n/i18n";
import './index.css';
import App from './App';
import "bootstrap/dist/css/bootstrap.min.css";

// Import all your providers
import { AppContextProvider } from './context/AppContext';
import { ForumContextProvider } from './forum/context/ForumContext';
import { CodingChallengeProvider } from './codingChallenge/context/CodingChallengeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <AppContextProvider>
      <ForumContextProvider>
        <CodingChallengeProvider>
          <App />
        </CodingChallengeProvider>
      </ForumContextProvider>
    </AppContextProvider>
  // </React.StrictMode>
);