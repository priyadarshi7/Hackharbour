import React, { useContext, useRef } from 'react'
import './ExploreMenu.css'
import { StoreContext } from '../../Context/StoreContext'

const ExploreMenu = ({category, setCategory}) => {
    const {menu_list} = useContext(StoreContext);
    const scrollContainerRef = useRef(null);
    
    // Scroll functions
    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -200,
                behavior: 'smooth'
            });
        }
    };
    
    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 200,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className='explore-menu' id='explore-menu'>
            <h1>Explore Safari Treasures</h1>
            <p className='explore-menu-text'>Discover our collection of authentic safari souvenirs to commemorate your wild adventure. Each item captures the spirit of the jungle, bringing a piece of the wilderness into your home.</p>
            
            <div className="explore-menu-container">
                {/* <div className="scroll-indicator scroll-left" onClick={scrollLeft}>
                    &#10094;
                </div> */}
                
                {/* <div className="explore-menu-list" ref={scrollContainerRef}>
                    {menu_list.map((item, index) => {
                        return (
                            <div 
                                onClick={() => setCategory(prev => prev === item.menu_name ? "All" : item.menu_name)} 
                                key={index} 
                                className='explore-menu-list-item'
                            >
                                <img 
                                    src={item.menu_image} 
                                    className={category === item.menu_name ? "active" : ""} 
                                    alt={item.menu_name} 
                                />
                                <p>{item.menu_name}</p>
                            </div>
                        )
                    })}
                </div> */}
                
                {/* <div className="scroll-indicator scroll-right" onClick={scrollRight}>
                    &#10095;
                </div> */}
            </div>
            
            <hr />
        </div>
    )
}

export default ExploreMenu