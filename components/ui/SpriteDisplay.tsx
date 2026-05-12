"use client";
import Image from 'next/image';
import spriteForJob from '@/lib/spriteMap';
import React from 'react';

type Props = {
  job: string;
  className?: string;
};

export default function SpriteDisplay({ job, className = '' }: Props) {
  const src = spriteForJob(job);
  return (
    <div className={`relative w-full ${className}`}>
      <div className="mx-auto relative w-full h-56 sm:h-64 md:h-72 lg:h-80 pointer-events-none">
        <div className="relative mx-auto w-[90%] h-full overflow-visible" style={{ maxWidth: 360 }}>
          <div className="sprite-overlap">
            <div className="sprite-image sprite-break-out w-[80%] mx-auto relative" style={{ aspectRatio: '1 / 1' }}>
              <Image src={src} alt={job} fill style={{ objectFit: 'contain' }} priority sizes="(max-width: 640px) 160px, (max-width: 1024px) 220px, 320px" />
            </div>
          </div>
          <div className="card-portrait rounded-lg border p-2 mt-28 sm:mt-32 md:mt-36 bg-gradient-to-b from-slate-800 to-slate-900 shadow-inner">
            {/* Marco / fondo del retrato */}
          </div>
        </div>
      </div>
    </div>
  );
}
