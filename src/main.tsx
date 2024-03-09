import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { CSSPrioritize } from '@hilma/forms'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CSSPrioritize>
      <App />
    </CSSPrioritize>
  </React.StrictMode>,
)
