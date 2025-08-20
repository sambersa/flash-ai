"use client";

import Image from "next/image";

import { cn, getTechLogos } from "@/lib/utils";

const DisplayTechIcons = ({ techStack }: TechIconProps) => {
  console.log("Tech stack received:", techStack);
  
  const techIcons = getTechLogos(techStack);
  
  console.log("Generated tech icons:", techIcons.map(icon => ({
    tech: icon.tech,
    url: icon.url,
    hasMapping: icon.url.includes('devicon')
  })));

  return (
    <div className="flex flex-row gap-2">
      {techIcons.slice(0, 3).map(({ tech, url }, index) => (
        <div
          key={tech}
          className={cn(
            "relative group bg-dark-300 rounded-full p-2 flex items-center justify-center w-10 h-10",
            // Remove the negative margin that was causing overlap
            // index >= 1 && "-ml-3"
          )}
        >
          {/* Tooltip for tech name */}
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            {tech}
          </span>

          <Image
            src={url}
            alt={tech}
            width={20}
            height={20}
            className="w-5 h-5 object-contain"
          />
        </div>
      ))}
      
      {/* Show count if there are more than 3 technologies */}
      {techStack.length > 3 && (
        <div className="bg-dark-300 rounded-full p-2 flex items-center justify-center w-10 h-10">
          <span className="text-xs text-gray-400">+{techStack.length - 3}</span>
        </div>
      )}
    </div>
  );
};

export default DisplayTechIcons;