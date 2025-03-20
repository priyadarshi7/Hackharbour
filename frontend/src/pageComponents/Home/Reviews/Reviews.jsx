import React, { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';

const SafariReviewMarquee = () => {
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef(null);
  
  // Sample reviews from visitors
  const reviews = [
    {
      id: 1,
      name: "Aditya Sharma",
      location: "Delhi",
      rating: 5,
      text: "Incredible experience! Spotted a Bengal tiger within 20 minutes of our journey. The VR map helped us prepare perfectly for what to expect.",
      avatar: "AS"
    },
    {
      id: 2,
      name: "Priya Patel",
      location: "Mumbai",
      rating: 5,
      text: "The interactive 3D map was a game changer! It helped my kids understand the safari routes beforehand and made spotting animals much more exciting.",
      avatar: "PP"
    },
    {
      id: 3,
      name: "Rahul Kapoor",
      rating: 4,
      location: "Bangalore",
      text: "Our guide was very knowledgeable. The elephant sighting was the highlight of our trip. The 3D map feature helped us choose the best route.",
      avatar: "RK"
    },
    {
      id: 4,
      name: "Meera Joshi",
      rating: 5,
      location: "Hyderabad",
      text: "Worth every penny! We saw sloth bears, spotted deer, and various bird species. The VR preview got my children excited before we even arrived.",
      avatar: "MJ"
    },
    {
      id: 5,
      name: "Vikram Singh",
      rating: 4,
      location: "Jaipur",
      text: "Beautiful landscape and diverse wildlife. The digital map feature was very useful for planning our day at the safari.",
      avatar: "VS"
    },
  ];
  
  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    let animationId;
    
    const scroll = () => {
      if (scrollContainer && !isHovered) {
        scrollContainer.scrollLeft += 1;
        
        // Reset scroll position when reaching the end
        if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth - scrollContainer.clientWidth)) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };
    
    animationId = requestAnimationFrame(scroll);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isHovered]);
  
  // Render stars based on rating
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index} 
        size={16} 
        className={index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
      />
    ));
  };
  
  return (
    <div className="w-full bg-black py-6 px-4 shadow-md">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-green-800">What Our Visitors Say</h3>
        <p className="text-white">Hear from adventurers who have experienced the Raipur Jungle Safari</p>
      </div>
      
      <div 
        className="overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide pb-4 gap-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Double the reviews to create an infinite scroll effect */}
          {[...reviews, ...reviews].map((review, index) => (
            <div 
              key={`${review.id}-${index}`} 
              className="flex-shrink-0 w-80 bg-white p-4 rounded-lg shadow-md border-l-4 border-green-600"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold mr-3">
                    {review.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{review.name}</h4>
                    <p className="text-xs text-gray-500">{review.location}</p>
                  </div>
                </div>
                <div className="flex">
                  {renderStars(review.rating)}
                </div>
              </div>
              <p className="text-gray-600 text-sm">{review.text}</p>
              <div className="mt-3 text-xs text-green-700 font-medium">
                Verified Visit • {Math.floor(Math.random() * 12) + 1} months ago
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="inline-block bg-green-100 px-4 py-2 rounded-full text-green-800 text-sm font-medium">
          Join 5000+ visitors who have experienced our safari this year
        </p>
      </div>
    </div>
  );
};

export default SafariReviewMarquee;