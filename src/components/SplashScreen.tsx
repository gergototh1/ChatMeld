import React from 'react';
import logo from '../chatmeld-logo.svg';

const SplashScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-primary text-white">
    <img src={logo} alt="ChatMeld logo" className="w-24 h-24 mb-4 animate-pulse" />
    <p className="text-xl font-semibold">Loading...</p>
  </div>
);

export default SplashScreen;
