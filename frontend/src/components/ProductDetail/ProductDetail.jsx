import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';
import { ArrowLeft, Star, ShoppingCart } from 'lucide-react';
import ProductComments from '../../components/ProductComments/ProductComments';
import StoreNavbar from '../StoreNavbar/StoreNavbar';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { cartItems, addToCart, removeFromCart, url, currency } = useContext(StoreContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${url}/api/food/list`);
        const data = await response.json();
        
        if (data.success) {
          const foundProduct = data.data.find(item => item._id === id);
          if (foundProduct) {
            setProduct(foundProduct);
          } else {
            navigate('/not-found');
          }
        } else {
          console.error('Failed to fetch product');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, url, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  return (
    <>
    <StoreNavbar/>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 mb-8 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Menu</span>
      </button>

      {/* Product details section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="rounded-2xl overflow-hidden bg-white shadow-lg">
          <div className="aspect-w-1 aspect-h-1 w-full">
            <img 
              src={`${url}/images/${product.image}`}
              alt={product.name}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col space-y-6">
          {/* Product name and badges */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
            <div className="flex items-center mt-2 space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    className="text-yellow-400 fill-current" 
                  />
                ))}
              </div>
              <span className="text-gray-500">(124 reviews)</span>
            </div>
          </div>

          {/* Price and stock */}
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-green-500">{currency}{product.price}</h2>
            <span 
              className={`px-4 py-1 rounded-full text-sm font-medium ${
                product.stock > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {product.stock > 0 
                ? `In Stock (${product.stock})` 
                : 'Out of Stock'}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Category */}
          <div className="flex items-center space-x-2">
            <span className="text-black">Category:</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{product.category}</span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Add to cart section */}
          <div className="mt-4">
            {!cartItems[product._id] ? (
              <button 
                onClick={() => addToCart(product._id)}
                disabled={product.stock <= 0}
                className={`w-full py-3 px-6 flex items-center justify-center space-x-2 rounded-full font-medium text-white transition-all ${
                  product.stock > 0 
                    ? 'bg-green-500 hover:bg-green-600 transform hover:scale-105' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={20} />
                <span>Add to Cart</span>
              </button>
            ) : (
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-4 bg-white shadow-md rounded-full px-4 py-2">
                  <button 
                    onClick={() => removeFromCart(product._id)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                  >
                    <span className="text-xl font-bold">-</span>
                  </button>
                  <span className="text-xl font-semibold min-w-8 text-center">{cartItems[product._id]}</span>
                  <button 
                    onClick={() => addToCart(product._id)}
                    disabled={cartItems[product._id] >= product.stock}
                    className={`w-10 h-10 flex items-center justify-center rounded-full ${
                      cartItems[product._id] >= product.stock
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-100 text-green-500 hover:bg-green-200 transition-colors'
                    }`}
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          

          {/* Additional features */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Quality Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-orange-500 mb-8 transition-colors mt-8"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Menu</span>
        </button>

      {/* Comments section */}
      <ProductComments productId={product._id} />
    </div>
    </>
  );
};

export default ProductDetail;

// import React, { useContext, useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { assets } from '../../assets/assets';
// import { StoreContext } from '../../Context/StoreContext';
// import { ArrowLeft, Star, ShoppingCart, Clock, Shield, TruckIcon, BadgeCheck, Heart } from 'lucide-react';
// import ProductComments from '../../components/ProductComments/ProductComments';
// import StoreNavbar from '../StoreNavbar/StoreNavbar';

// const ProductDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isFavorite, setIsFavorite] = useState(false);
//   const { cartItems, addToCart, removeFromCart, url, currency } = useContext(StoreContext);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const response = await fetch(`${url}/api/food/list`);
//         const data = await response.json();
        
//         if (data.success) {
//           const foundProduct = data.data.find(item => item._id === id);
//           if (foundProduct) {
//             setProduct(foundProduct);
//           } else {
//             navigate('/not-found');
//           }
//         } else {
//           console.error('Failed to fetch product');
//         }
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching product:', error);
//         setLoading(false);
//       }
//     };

//     fetchProduct();
//   }, [id, url, navigate]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-50">
//         <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-orange-500"></div>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
//         <h2 className="text-2xl font-bold mb-4 text-gray-800">Product Not Found</h2>
//         <button 
//           onClick={() => navigate('/')}
//           className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
//         >
//           Return to Menu
//         </button>
//       </div>
//     );
//   }

//   return (
//     <>
//     <StoreNavbar/>
//     <div className="bg-gray-50 min-h-screen pb-16">
//       {/* Breadcrumb */}
//       {/* <div className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex items-center space-x-2 text-sm">
//             <button onClick={() => navigate('/')} className="text-gray-500 hover:text-orange-500">Home</button>
//             <span className="text-gray-400">/</span>
//             <button onClick={() => navigate('/menu')} className="text-gray-500 hover:text-orange-500">Menu</button>
//             <span className="text-gray-400">/</span>
//             <button onClick={() => navigate(`/category/${product.category}`)} className="text-gray-500 hover:text-orange-500">{product.category}</button>
//             <span className="text-gray-400">/</span>
//             <span className="text-orange-500 font-medium">{product.name}</span>
//           </div>
//         </div>
//       </div> */}

//       {/* Main content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
//         {/* Product details section */}
//         <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8 mt-16">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
//             {/* Product Image */}
//             <div className="relative group">
//               <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100">
//                 <img 
//                   src={`${url}/images/${product.image}`}
//                   alt={product.name}
//                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//                 />
//               </div>
              
//               {/* Stock badge */}
//               {product.stock <= 0 ? (
//                 <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
//                   Out of Stock
//                 </div>
//               ) : product.stock <= 5 ? (
//                 <div className="absolute top-4 left-4 bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
//                   Only {product.stock} left
//                 </div>
//               ) : (
//                 <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
//                   In Stock
//                 </div>
//               )}
              
//               {/* Favorite button */}
//               <button 
//                 onClick={() => setIsFavorite(!isFavorite)}
//                 className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 hover:scale-110"
//               >
//                 <Heart 
//                   size={22} 
//                   className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
//                 />
//               </button>
//             </div>

//             {/* Product Details */}
//             <div className="p-8 flex flex-col space-y-6">
//               {/* Product name and category */}
//               <div>
//                 <div className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-3">
//                   {product.category}
//                 </div>
//                 <h1 className="text-3xl font-bold text-gray-800 leading-tight">{product.name}</h1>
                
//                 {/* Ratings */}
//                 <div className="flex items-center mt-3 space-x-2">
//                   <div className="flex items-center">
//                     {[...Array(5)].map((_, i) => (
//                       <Star 
//                         key={i} 
//                         size={18} 
//                         className="text-yellow-400 fill-current" 
//                       />
//                     ))}
//                   </div>
//                   <span className="text-gray-500 text-sm">(124 reviews)</span>
//                 </div>
//               </div>

//               {/* Price */}
//               <div className="flex items-end">
//                 <h2 className="text-4xl font-bold text-gray-800">{currency}{product.price}</h2>
//                 {product.stock > 0 && (
//                   <div className="ml-3 text-green-600 font-medium flex items-center">
//                     <BadgeCheck size={18} className="mr-1" />
//                     Available for immediate delivery
//                   </div>
//                 )}
//               </div>

//               {/* Description */}
//               <div className="border-t border-b border-gray-100 py-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
//                 <p className="text-gray-600 leading-relaxed">{product.description}</p>
//               </div>

//               {/* Add to cart section */}
//               <div className="mt-4">
//                 {!cartItems[product._id] ? (
//                   <button 
//                     onClick={() => addToCart(product._id)}
//                     disabled={product.stock <= 0}
//                     className={`w-full py-4 px-6 flex items-center justify-center space-x-3 rounded-xl font-semibold text-white transition-all duration-300 ${
//                       product.stock > 0 
//                         ? 'bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
//                         : 'bg-gray-300 cursor-not-allowed'
//                     }`}
//                   >
//                     <ShoppingCart size={20} />
//                     <span>Add to Cart</span>
//                   </button>
//                 ) : (
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-4 bg-white shadow-lg rounded-xl px-6 py-3 border border-gray-100">
//                       <button 
//                         onClick={() => removeFromCart(product._id)}
//                         className="w-12 h-12 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors border border-red-100"
//                       >
//                         <span className="text-xl font-bold">-</span>
//                       </button>
//                       <span className="text-2xl font-semibold min-w-8 text-center">{cartItems[product._id]}</span>
//                       <button 
//                         onClick={() => addToCart(product._id)}
//                         disabled={cartItems[product._id] >= product.stock}
//                         className={`w-12 h-12 flex items-center justify-center rounded-full ${
//                           cartItems[product._id] >= product.stock
//                             ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-200'
//                             : 'bg-green-50 text-green-500 hover:bg-green-100 transition-colors border border-green-100'
//                         }`}
//                       >
//                         <span className="text-xl font-bold">+</span>
//                       </button>
//                     </div>
                    
//                     <button 
//                       onClick={() => navigate('/cart')}
//                       className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
//                     >
//                       View Cart
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Features */}
//               <div className="grid grid-cols-2 gap-6 mt-6">
//                 <div className="flex items-center space-x-3 p-4 rounded-lg bg-gray-50">
//                   <TruckIcon size={22} className="text-orange-500" />
//                   <div>
//                     <p className="font-medium text-gray-800">Fast Delivery</p>
//                     <p className="text-sm text-gray-500">Delivered in 30 minutes</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-3 p-4 rounded-lg bg-gray-50">
//                   <Shield size={22} className="text-orange-500" />
//                   <div>
//                     <p className="font-medium text-gray-800">Quality Guarantee</p>
//                     <p className="text-sm text-gray-500">Fresh ingredients daily</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Back button */}
//         <button 
//           onClick={() => navigate(-1)}
//           className="inline-flex items-center space-x-2 text-gray-600 hover:text-orange-500 mb-8 transition-colors"
//         >
//           <ArrowLeft size={20} />
//           <span className="font-medium">Back to Menu</span>
//         </button>

//         {/* Comments section with improved styling */}
//         <div className="bg-white rounded-2xl shadow-md overflow-hidden p-8">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
//           <ProductComments productId={product._id} />
//         </div>
//       </div>
//     </div>
//     </>
//   );
// };

// export default ProductDetail;