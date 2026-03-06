import { createRoot } from 'react-dom/client'

import { RouterProvider } from './lib/router'

import App from './App.jsx'
import { router } from './routes.js'

import './styles/main.scss'


const Index = () => {
  return (
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <Index />
)
