'use client';

import { useState } from 'react';

interface TeamMemberProps {
  name: string;
  role: string;
  image: string;
}

export default function TeamMember({ name, role, image }: TeamMemberProps) {
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);
  
  const handleImageError = () => {
    setFallbackSrc("https://via.placeholder.com/128x128?text=TrueSpace");
  };

  return (
    <div>
      <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-2 border-accent/30">
        <img 
          src={fallbackSrc || image} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </div>
      <h3 className="text-lg font-medium">{name}</h3>
      <p className="text-secondary">{role}</p>
    </div>
  );
} 