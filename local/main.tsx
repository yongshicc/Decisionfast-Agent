import React from 'react';
import { createRoot } from 'react-dom/client';
import { HeadContent, RouterProvider } from '@tanstack/react-router';
import { getRouter } from '../src/router';
import '../src/styles.css';
import { registerOffline } from '../src/lib/offline-registration';
const target=document.getElementById('root');
if(target)createRoot(target).render(<React.StrictMode><RouterProvider router={getRouter()} InnerWrap={({children})=><><HeadContent/>{children}</>}/></React.StrictMode>);
void registerOffline();
