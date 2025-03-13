'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  discount?: number;
  lessonsCount?: number;
  level?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  price,
  discount,
  lessonsCount,
  level,
}) => {
  const discountedPrice = discount ? price - (price * discount) / 100 : price;

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl || '/placeholder-course.jpg'}
          alt={title}
          fill
          className="object-cover"
        />
        {discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {discount}% OFF
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between mb-4">
          {level && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {level}
            </span>
          )}
          {lessonsCount && (
            <span className="text-xs text-gray-500">
              {lessonsCount} {lessonsCount === 1 ? 'lesson' : 'lessons'}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            {discount ? (
              <div className="flex items-center">
                <span className="text-lg font-bold text-gray-900 mr-2">
                  ${discountedPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                ${price.toFixed(2)}
              </span>
            )}
          </div>
          
          <Link href={`/courses/${id}`}>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-300">
              View Course
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard; 