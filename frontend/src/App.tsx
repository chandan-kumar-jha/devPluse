// import React from 'react';
// import { Navbar } from './components/Navbar';
// import { HeroSection } from './components/HeroSection';
import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  return <RouterProvider router={router} />;
}
