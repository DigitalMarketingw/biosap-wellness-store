
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
  };
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const imageUrl = category.image_url || '/placeholder.svg';

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-green-100 hover:border-green-300">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={imageUrl}
            alt={category.name}
            className="w-full h-24 sm:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        
        <div className="p-3 text-center">
          <h3 className="font-semibold text-green-800 group-hover:text-green-600 transition-colors text-sm sm:text-base">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-xs text-green-600 mt-1 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
