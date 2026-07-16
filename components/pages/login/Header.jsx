import React from "react";
import Logo from "../../../public/login/Logo";

export default function Header({ showSignInBtn, onSignInClick, onLogoClick }) {
  return (
    <header className="p-6 md:px-14 fixed top-0 left-0 w-full z-50 flex items-center justify-between select-none">
      <button 
        onClick={onLogoClick} 
        className="max-w-[148px] block outline-none cursor-pointer focus:outline-none bg-transparent border-0"
      >
        <Logo />
      </button>
      
      {showSignInBtn && (
        <button
          onClick={onSignInClick}
          className="bg-[#e50914] hover:bg-red-700 active:bg-red-800 text-white text-sm font-bold py-1.5 px-4 rounded duration-200 transition-colors"
        >
          Sign In
        </button>
      )}
    </header>
  );
}
