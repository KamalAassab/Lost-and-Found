import React from 'react';
import { ShopLogo } from './shop-logo';

interface ProfessionalLoaderProps {
  title?: string;
  subtitle?: string;
  loadingSteps?: string[];
}

export function ProfessionalLoader({ 
  title = "LOST & FOUND", 
  subtitle = "Chargement...",
  loadingSteps = [
    "Vérification de l'authentification",
    "Chargement des données",
    "Préparation de l'interface"
  ]
}: ProfessionalLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 text-center">
        {/* Professional logo area */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-200 rounded-2xl shadow-2xl flex items-center justify-center">
                <ShopLogo className="h-10 w-auto text-black" />
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-white to-gray-200 rounded-2xl shadow-2xl animate-ping opacity-20"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-300 text-lg">{subtitle}</p>
        </div>

        {/* Modern loading animation */}
        <div className="relative mb-8">
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        {/* Professional loading text */}
        <div className="space-y-2">
          <p className="text-white font-semibold text-lg">Chargement en cours...</p>
          <p className="text-gray-400 text-sm">Préparation de vos données...</p>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
          {loadingSteps.map((step, index) => (
            <div key={index} className="flex items-center justify-center space-x-2">
              <div 
                className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"
                style={{ animationDelay: `${index * 0.5}s` }}
              ></div>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
