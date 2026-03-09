import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/routes';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Не удалось найти элемент с id "root"');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);