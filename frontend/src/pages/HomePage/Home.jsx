import React from 'react'
import ParallaxHeroSection from '../../pageComponents/Home/HeroSection/HeroSections'
import video from "../../assets/videos/home2.mp4"
import AboutUs from '../../pageComponents/Home/AboutUs/AboutUs'
import SafariMap3D from '../../pageComponents/Home/VRMap/SafariMap3D'
import ReviewMarquee from '../../pageComponents/Home/Reviews/Reviews'
import Navbar from '../../components/Navbar/Navbar'

function HomePage() {
  return (
    <div>
        <Navbar/>
       <ParallaxHeroSection/>
       <AboutUs/>
       <SafariMap3D/>
       <div className="video-container">
                <video 
                    src={video} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                    className="background-video"
                    width="100%"
                />
                
            </div>
            <ReviewMarquee/>
    </div>
  )
}

export default HomePage