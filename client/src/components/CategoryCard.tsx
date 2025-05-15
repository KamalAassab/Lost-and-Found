import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface CategoryCardProps {
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
}

export default function CategoryCard({ title, description, imageUrl, slug }: CategoryCardProps) {
  return (
    <div className="relative group overflow-hidden h-[400px] rounded-2xl shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
      <img
        src={imageUrl}
        alt={`${title} collection`}
        className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col justify-end p-8">
        <h3 className="text-white text-3xl font-bold font-montserrat uppercase mb-2 drop-shadow-lg">
          {title}
        </h3>
        <p className="text-neutral-200 mb-4 text-lg drop-shadow">
          {description}
        </p>
        <Link href={`/products/${slug}`}>
          <Button className="bg-white text-black font-bold rounded-full px-6 py-2 shadow hover:bg-accent hover:text-white transition-colors duration-200">
            Voir la collection
          </Button>
        </Link>
      </div>
    </div>
  );
}
