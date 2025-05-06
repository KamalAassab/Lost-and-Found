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
    <div className="relative group overflow-hidden h-[400px]">
      <img
        src={imageUrl}
        alt={`${title} collection`}
        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-8">
        <h3 className="text-white text-3xl font-bold font-montserrat uppercase mb-2">
          {title}
        </h3>
        <p className="text-neutral-200 mb-4">{description}</p>
        <Link href={`/products/${slug}`}>
          <a className="bg-white text-primary py-2 px-6 inline-block font-semibold uppercase text-sm tracking-wider hover:bg-neutral-100 transition duration-300 w-max">
            Voir la collection
          </a>
        </Link>
      </div>
    </div>
  );
}
