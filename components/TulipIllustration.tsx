'use client'

interface TulipIllustrationProps {
  side: 'left' | 'right'
  className?: string
}

export default function TulipIllustration({ side, className = '' }: TulipIllustrationProps) {
  const isLeft = side === 'left'
  
  return (
    <div className={`hidden md:block absolute ${isLeft ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 w-48 lg:w-64 xl:w-80 opacity-10 lg:opacity-15 pointer-events-none ${className}`} style={{ zIndex: 0 }}>
      <svg 
        viewBox="0 0 300 700" 
        className="w-full h-full" 
        preserveAspectRatio="xMidYMid meet"
        style={{ transform: isLeft ? 'scaleX(1)' : 'scaleX(-1)' }}
      >
        <defs>
          {/* Gradient for depth */}
          <linearGradient id="tulipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(44, 44, 44, 0.5)" />
            <stop offset="50%" stopColor="rgba(44, 44, 44, 0.3)" />
            <stop offset="100%" stopColor="rgba(44, 44, 44, 0.4)" />
          </linearGradient>
          {/* Pattern for texture */}
          <pattern id="texture" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.5" fill="rgba(44, 44, 44, 0.1)" />
          </pattern>
        </defs>
        
        <g opacity="0.5">
          {/* Main Tulip Flower - Highly Detailed */}
          {/* Outer Petal 1 - Left */}
          <path 
            d="M 150,40 
               C 130,20 100,25 85,45 
               C 75,60 78,80 88,95 
               C 95,105 105,110 120,108 
               C 135,110 145,105 150,95 
               C 155,85 158,70 155,55 
               C 152,45 145,35 150,40 Z" 
            fill="none" 
            stroke="rgba(44, 44, 44, 0.5)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Petal shading lines */}
          <path d="M 100,50 Q 110,60 120,65" fill="none" stroke="rgba(44, 44, 44, 0.3)" strokeWidth="1" />
          <path d="M 110,70 Q 120,75 130,78" fill="none" stroke="rgba(44, 44, 44, 0.25)" strokeWidth="0.8" />
          
          {/* Outer Petal 2 - Right */}
          <path 
            d="M 150,40 
               C 170,20 200,25 215,45 
               C 225,60 222,80 212,95 
               C 205,105 195,110 180,108 
               C 165,110 155,105 150,95 
               C 145,85 142,70 145,55 
               C 148,45 155,35 150,40 Z" 
            fill="none" 
            stroke="rgba(44, 44, 44, 0.5)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Petal shading lines */}
          <path d="M 200,50 Q 190,60 180,65" fill="none" stroke="rgba(44, 44, 44, 0.3)" strokeWidth="1" />
          <path d="M 190,70 Q 180,75 170,78" fill="none" stroke="rgba(44, 44, 44, 0.25)" strokeWidth="0.8" />
          
          {/* Outer Petal 3 - Back Center */}
          <path 
            d="M 150,40 
               C 145,25 135,20 125,28 
               C 115,38 110,50 115,65 
               C 118,75 125,82 135,85 
               C 145,88 155,88 165,85 
               C 175,82 182,75 185,65 
               C 190,50 185,38 175,28 
               C 165,20 155,25 150,40 Z" 
            fill="none" 
            stroke="rgba(44, 44, 44, 0.4)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          
          {/* Inner Petal Details - Center */}
          <path 
            d="M 150,50 
               C 145,45 140,48 138,55 
               C 136,62 138,70 142,75 
               C 146,80 150,82 155,80 
               C 160,82 164,80 168,75 
               C 172,70 174,62 172,55 
               C 170,48 165,45 160,50 
               C 155,55 150,55 150,50 Z" 
            fill="none" 
            stroke="rgba(44, 44, 44, 0.45)" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          
          {/* Inner petal veins */}
          <path d="M 150,50 Q 148,60 150,70" fill="none" stroke="rgba(44, 44, 44, 0.35)" strokeWidth="1.2" />
          <path d="M 142,60 Q 145,65 148,70" fill="none" stroke="rgba(44, 44, 44, 0.3)" strokeWidth="0.8" />
          <path d="M 158,60 Q 155,65 152,70" fill="none" stroke="rgba(44, 44, 44, 0.3)" strokeWidth="0.8" />
          
          {/* Stem - Detailed with texture */}
          <path 
            d="M 150,100 
               C 148,150 145,220 142,300 
               C 140,380 138,450 136,550 
               C 134,620 132,680 130,700" 
            fill="none" 
            stroke="rgba(44, 44, 44, 0.4)" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          {/* Stem texture lines */}
          <path d="M 148,200 Q 146,250 144,300" fill="none" stroke="rgba(44, 44, 44, 0.25)" strokeWidth="1.5" />
          <path d="M 152,250 Q 150,300 148,350" fill="none" stroke="rgba(44, 44, 44, 0.2)" strokeWidth="1" />
          <path d="M 146,400 Q 144,450 142,500" fill="none" stroke="rgba(44, 44, 44, 0.25)" strokeWidth="1.5" />
          
          {/* Large Wrapping Leaf 1 - Highly Detailed with Veins */}
          <path 
            d="M 130,250 
               C 80,270 40,300 25,340 
               C 15,380 20,420 35,450 
               C 55,470 80,475 105,470 
               C 125,465 140,455 150,440 
               C 155,420 150,400 140,380 
               C 130,360 120,340 115,320 
               C 130,300 130,280 130,250 Z" 
            fill="none" 
            stroke="rgba(44, 44, 44, 0.4)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Leaf veins - detailed */}
          <path d="M 50,320 Q 60,340 70,360 Q 80,380 90,400" fill="none" stroke="rgba(44, 44, 44, 0.3)" strokeWidth="1.5" />
          <path d="M 60,300 Q 70,320 80,340 Q 90,360 100,380" fill="none" stroke="rgba(44, 44, 44, 0.25)" strokeWidth="1.2" />
          <path d="M 40,340 Q 50,360 60,380 Q 70,400 80,420" fill="none" stroke="rgba(44, 44, 44, 0.25)" strokeWidth="1.2" />
          <path d="M 70,360 Q 75,370 80,380" fill="none" stroke="rgba(44, 44, 44, 0.2)" strokeWidth="1" />
          <path d="M 85,380 Q 90,390 95,400" fill="none" stroke="rgba(44, 44, 44, 0.2)" strokeWidth="1" />
          
          {/* Large Wrapping Leaf 2 - Highly Detailed */}
          <path 
            d="M 170,280 
               C 220,300 260,330 275,370 
               C 285,410 280,450 265,480 
               C 245,500 220,505 195,500 
               C 175,495 160,485 150,470 
               C 145,450 150,430 160,410 
               C 170,390 180,370 185,350 
               C 170,330 170,310 170,280 Z" 
            fill="none" 
            stroke="rgba(44, 44, 44, 0.4)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Leaf veins - detailed */}
          <path d="M 250,350 Q 240,370 230,390 Q 220,410 210,430" fill="none" stroke="rgba(44, 44, 44, 0.3)" strokeWidth="1.5" />
          <path d="M 240,330 Q 230,350 220,370 Q 210,390 200,410" fill="none" stroke="rgba(44, 44, 44, 0.25)" strokeWidth="1.2" />
          <path d="M 260,370 Q 250,390 240,410 Q 230,430 220,450" fill="none" stroke="rgba(44, 44, 44, 0.25)" strokeWidth="1.2" />
          <path d="M 230,390 Q 225,400 220,410" fill="none" stroke="rgba(44, 44, 44, 0.2)" strokeWidth="1" />
          <path d="M 215,410 Q 210,420 205,430" fill="none" stroke="rgba(44, 44, 44, 0.2)" strokeWidth="1" />
          
          {/* Small Decorative Leaf - Bottom */}
          <path 
            d="M 140,500 
               C 120,510 110,530 115,550 
               C 120,565 135,570 150,568 
               C 165,570 180,565 185,550 
               C 190,530 180,510 160,500 
               C 150,500 145,500 140,500 Z" 
            fill="none" 
            stroke="rgba(44, 44, 44, 0.3)" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path d="M 130,530 Q 140,540 150,545" fill="none" stroke="rgba(44, 44, 44, 0.2)" strokeWidth="1" />
          
          {/* Ornate Decorative Elements - Vintage Style */}
          <circle cx="100" cy="180" r="2.5" fill="rgba(44, 44, 44, 0.25)" />
          <circle cx="200" cy="210" r="2" fill="rgba(44, 44, 44, 0.2)" />
          <circle cx="80" cy="400" r="1.8" fill="rgba(44, 44, 44, 0.2)" />
          <circle cx="220" cy="430" r="1.5" fill="rgba(44, 44, 44, 0.18)" />
          
          {/* Decorative scroll elements */}
          <path d="M 120,150 Q 115,155 120,160 Q 125,155 120,150" fill="none" stroke="rgba(44, 44, 44, 0.2)" strokeWidth="1" />
          <path d="M 180,170 Q 185,175 180,180 Q 175,175 180,170" fill="none" stroke="rgba(44, 44, 44, 0.2)" strokeWidth="1" />
        </g>
      </svg>
    </div>
  )
}

