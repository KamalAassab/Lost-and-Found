import React from "react";
import MainLayout from "@/layouts/MainLayout";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface SupportLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function SupportLayout({ title, children }: SupportLayoutProps) {
  const [, navigate] = useLocation();

  return (
    <MainLayout>
      <div className="bg-neutral-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <button 
              onClick={() => navigate("/")}
              className="mr-3 p-2 hover:bg-neutral-200 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8">
            {children}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 