"use client"

import React from "react"
import "./HeroSection.css"
import Flag_Left from "../../../assets/parallax/trees.png"
import Flag_Right from "../../../assets/parallax/trees.png"
import Tiger from "../../../assets/parallax/tiger.png"
import Bear from "../../../assets/parallax/bear.png"
import Birds from "../../../assets/parallax/birds.png"
import { Zoom } from "react-awesome-reveal"
import AOS from "aos"
import "aos/dist/aos.css"
import $ from "jquery"

AOS.init({ once: true })

export default function Home() {
  React.useEffect(() => {
    setTimeout(() => {
      const handleScroll = () => {
        const scrollTop = $(window).scrollTop()

        // Apply zoom-out effect to earth
        const earthScale = Math.max(1, 1 + scrollTop / 1500)
        $("#earth img").css({
          transform: `scale(${earthScale})`,
          transition: "transform 0.3s ease-out",
        })

        // Apply parallax effect to buildings
        const buildingsOffset = scrollTop * 0.2
        $(".buildings").css({
          transform: `translateY(${buildingsOffset}px)`,
          transition: "transform 0.3s ease-out",
        })

        // Apply parallax effect to MUN_gif
        const munGifOffset = scrollTop * 0.1
        $(".MUN_gif").css({
          transform: `translateY(${munGifOffset}px)`,
          transition: "transform 0.3s ease-out",
        })

        // Apply parallax effect to flags
        const flagsOffset = scrollTop * 0.5
        $(".flag1").css({
          transform: `translateX(-${flagsOffset}px)`,
          transition: "transform 0.3s ease-out",
        })
        $(".flag2").css({
          transform: `translateX(${flagsOffset}px)`,
          transition: "transform 0.3s ease-out",
        })

        // Tiger (left) parallax effect
        const tigerOffset = scrollTop * 0.3
        $(".tiger").css({
          transform: `translateX(-${tigerOffset}px)`,
          transition: "transform 0.3s ease-out",
        })

        // Bear (right) parallax effect
        const bearOffset = scrollTop * 0.3
        $(".bear").css({
          transform: `translateX(${bearOffset}px)`,
          transition: "transform 0.3s ease-out",
        })

        // Birds (top) parallax effect
        const birdsOffset = scrollTop * 0.15
        $(".birds").css({
          transform: `translateY(-${birdsOffset}px)`,
          transition: "transform 0.3s ease-out",
        })
      }

      $(window).on("scroll", handleScroll)
      handleScroll() // Initial call

      return () => $(window).off("scroll", handleScroll)
    }, 1750)
  }, [])

  return (
    <div className="home">
      <div className="home-text" data-aos="fade-up" data-aos-duration="2000" data-aos-delay="800">
        <h5>Welcome To</h5>
        <h1>Jungle Safari</h1>
        <div className="subtitle">Souvenir Shop</div>
        <button className="explore-btn">Explore Now</button>
      </div>

      {/* Buildings */}
      <div
        className="buildings"
        data-aos="fade-zoom-in"
        data-aos-easing="ease-in-back"
        data-aos-delay="400"
        data-aos-offset="0"
      ></div>

      {/* MUN GIF */}
      <div className="MUN_gif" data-aos="fade-up">
        <Zoom duration={500} delay={500} zoom={0.5}>
          {/* <img src={Logo || "/placeholder.svg"} alt="MUN Logo" /> */}
        </Zoom>
      </div>

      {/* Earth and Flags */}
      <div className="earth" id="earth">
        {/* <div className="earth-img">
                    <img src={Earth || "/placeholder.svg"} alt="Earth" />
                </div> */}
        <div className="flags">
          <div className="flag1">
            <img src={Flag_Left || "/placeholder.svg"} alt="Flag Left" />
          </div>
          <div className="flag2">
            <img src={Flag_Right || "/placeholder.svg"} alt="Flag Right" />
          </div>
        </div>
      </div>

      {/* Tiger, Bear, Birds */}
      <div className="tiger">
        <img src={Tiger || "/placeholder.svg"} alt="Tiger" />
      </div>
      <div className="bear">
        <img src={Bear || "/placeholder.svg"} alt="Bear" />
      </div>
      <div className="birds">
        <img src={Birds || "/placeholder.svg"} alt="Birds" />
      </div>
      <div className="scroll-indicator">
        <div className="scroll-text">Scroll to Explore</div>
        <div className="scroll-icon">
          <div className="scroll-dot"></div>
        </div>
      </div>
    </div>
  )
}

