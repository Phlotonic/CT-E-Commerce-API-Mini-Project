import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </React.StrictMode>,
)
// Why does it matter if the page refreshes?
// State Persistence
// Tried to navigate to a page, but you aren't allowed access
// If logged in, render About, else render Login

// <Route> <Routes> <Link>