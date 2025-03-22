import React, { useContext } from 'react'
import FoodItem from '../FoodItem/FoodItem'
import { StoreContext } from '../../Context/StoreContext'

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);
  
  // Filter items based on category
  const filteredItems = food_list?.filter(item => 
    category === "All" || category === item.category
  );

  return (
    <div className="py-10 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto" id="food-display">
      {/* Heading with underline effect */}
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 inline-block relative border-b-4 border-green-500 pb-4">
          Top Products
          {/* <span className="absolute bottom-0 left-0 w-full h-1 bg-amber-400 transform -translate-y-2 rounded-full opacity-70"></span> */}
        </h2>
      </div>

      {/* Empty state message when no items match the filter */}
      {filteredItems?.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No Products found in this category.</p>
          <button 
            className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
            onClick={() => window.location.hash = "#explore-menu"}
          >
            Browse all categories
          </button>
        </div>
      )}

      {/* Food items grid with responsive columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {filteredItems?.map((item) => (
          <FoodItem 
            key={item._id} 
            image={item.image} 
            name={item.name} 
            desc={item.description} 
            price={item.price} 
            id={item._id}
          />
        ))}
      </div>
      
      {/* Items counter at the bottom */}
      {filteredItems?.length > 0 && (
        <p className="mt-6 text-sm text-gray-500 text-right">
          Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        </p>
      )}
    </div>
  )
}

export default FoodDisplay