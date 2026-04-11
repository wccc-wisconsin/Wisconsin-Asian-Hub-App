import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import AdminPage from './admin/AdminPage.tsx'
import AnthemModule from './modules/anthem/AnthemModule.tsx'
import './styles/globals.css'

const path = window.location.pathname

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {path.startsWith('/admin')  ? <AdminPage />    :
     path.startsWith('/anthem') ? <AnthemModule /> :
     <App />}
  </React.StrictMode>,
)
