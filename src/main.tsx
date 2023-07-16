import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App.tsx';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import ErrorPage from './ErrorPage.tsx';
import Home from './Home';
import IFrame from './IFrame.tsx';
import './index.css';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Home /> },
        {
          path: 'pwi/:pwi?',
          element: <IFrame />,
        },
        {
          path: 'motan',
          element: <IFrame />,
        },
        {
          path: 'rabbitmq',
          element: <IFrame />,
        },
        {
          path: 'weather',
          element: <IFrame />,
        },
        {
          path: 'docs/:docs',
          element: <IFrame />,
        },
      ],
    },
  ],
  { basename: '/lvmweb' }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
