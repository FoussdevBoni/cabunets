import React  from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Provider } from 'react-redux';
import { store } from './reducer/store';


createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
   <BrowserRouter>
    <Provider store={store}>
       <AuthProvider>
       <App />
     </AuthProvider>
    </Provider>
  </BrowserRouter>
  </React.StrictMode>
);