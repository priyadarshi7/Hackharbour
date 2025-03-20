// import React, { useState, useRef, useEffect } from 'react';
// import { Camera } from 'lucide-react';

// const AddAutomatic = () => {
//   const videoRef = useRef(null);
//   const [stream, setStream] = useState(null);
//   const [isAutoCapturing, setIsAutoCapturing] = useState(false);
//   const [autoCaptureInterval, setAutoCaptureInterval] = useState(null);
//   const [status, setStatus] = useState({ message: 'Starting camera...', color: 'gray' });
//   const [loading, setLoading] = useState(false);
//   const [analysisHistory, setAnalysisHistory] = useState([]);
//   const [currentResult, setCurrentResult] = useState(null);
//   const [showFlash, setShowFlash] = useState(false);
//   const [socket, setSocket] = useState(null);

//   // Initialize WebSocket connection
//   useEffect(() => {
//     // Determine the correct WebSocket URL based on the current host
//     const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//     const wsUrl = `${protocol}//${window.location.host}/ws/analyze`;
    
//     const newSocket = new WebSocket(wsUrl);
    
//     newSocket.onopen = () => {
//       console.log('WebSocket connection established');
//       setStatus({ message: 'Connected to server', color: 'green' });
//     };
    
//     newSocket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log('Received analysis:', data);
      
//       if (data.error) {
//         setStatus({ message: `Analysis error: ${data.error}`, color: 'red' });
//         setLoading(false);
//         return;
//       }
      
//       // Format the result for display
//       const result = {
//         id: data.id,
//         timestamp: data.timestamp,
//         name: data.name || 'Unknown Product',
//         category: data.category || 'Uncategorized',
//         price: data.price || 'Price unknown',
//         stock: data.stock || 'Stock unknown',
//         description: data.description || 'No description available',
//       };
      
//       setCurrentResult(result);
//       setAnalysisHistory(prev => [result, ...prev].slice(0, 10));
//       setLoading(false);
//       setStatus({ message: 'Analysis complete', color: 'green' });
//     };
    
//     newSocket.onerror = (error) => {
//       console.error('WebSocket error:', error);
//       setStatus({ message: 'Connection error', color: 'red' });
//     };
    
//     newSocket.onclose = () => {
//       console.log('WebSocket connection closed');
//       setStatus({ message: 'Disconnected from server', color: 'red' });
//     };
    
//     setSocket(newSocket);
    
//     // Fetch existing analysis history from API
//     fetchAnalysisHistory();
    
//     // Cleanup function
//     return () => {
//       if (newSocket) {
//         newSocket.close();
//       }
//     };
//   }, []);

//   // Fetch existing analysis history from the backend
//   const fetchAnalysisHistory = async () => {
//     try {
//       const response = await fetch('/api/history');
//       if (response.ok) {
//         const history = await response.json();
//         setAnalysisHistory(history.slice(0, 10));
//       }
//     } catch (error) {
//       console.error('Error fetching analysis history:', error);
//     }
//   };

//   // Initialize camera
//   useEffect(() => {
//     const setupCamera = async () => {
//       try {
//         const cameraStream = await navigator.mediaDevices.getUserMedia({
//           video: { 
//             width: { ideal: 1280 },
//             height: { ideal: 720 },
//             facingMode: 'environment' // Prefer rear camera on mobile
//           }
//         });
        
//         if (videoRef.current) {
//           videoRef.current.srcObject = cameraStream;
//         }
        
//         setStream(cameraStream);
//         setStatus({ message: 'Camera ready', color: 'green' });
//       } catch (error) {
//         console.error('Error accessing camera:', error);
//         setStatus({ message: `Camera error: ${error.message}`, color: 'red' });
//       }
//     };

//     setupCamera();

//     // Cleanup function
//     return () => {
//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//       }
      
//       if (autoCaptureInterval) {
//         clearInterval(autoCaptureInterval);
//       }
//     };
//   }, []);

//   // Handle auto capture toggling
//   useEffect(() => {
//     if (isAutoCapturing) {
//       captureImage();
//       const interval = setInterval(captureImage, 5000); // 5 seconds
//       setAutoCaptureInterval(interval);
//       setStatus({ message: 'Auto-capturing', color: 'yellow' });
//     } else {
//       if (autoCaptureInterval) {
//         clearInterval(autoCaptureInterval);
//         setAutoCaptureInterval(null);
//       }
//       setStatus({ message: 'Ready', color: 'green' });
//     }

//     return () => {
//       if (autoCaptureInterval) {
//         clearInterval(autoCaptureInterval);
//       }
//     };
//   }, [isAutoCapturing]);

//   // Camera flash effect
//   const showFlashEffect = () => {
//     setShowFlash(true);
//     setTimeout(() => setShowFlash(false), 300);
//   };

//   // Capture image from video feed
//   const captureImage = async () => {
//     if (!stream || !videoRef.current || !socket || socket.readyState !== WebSocket.OPEN) {
//       setStatus({ message: 'Not ready to capture or not connected to server', color: 'red' });
//       return;
//     }
    
//     // Create a canvas element to capture the image
//     const canvas = document.createElement('canvas');
//     const video = videoRef.current;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
    
//     // Draw the video frame to canvas
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
//     // Flash effect
//     showFlashEffect();
    
//     // Convert to base64
//     const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
//     // Start analysis
//     setLoading(true);
//     setStatus({ message: 'Analyzing...', color: 'blue' });
    
//     // Send image to server via WebSocket
//     socket.send(JSON.stringify({ image: imageData }));
//   };

//   return (
//     <div className="bg-gray-100 min-h-screen flex flex-col">
//       {/* Header */}
//       <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
//         <div className="container mx-auto py-6 px-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <Camera className="mr-3" size={28} />
//               <h1 className="text-2xl font-bold">AI Product Analyzer</h1>
//             </div>
//             <div>
//               <span className="text-sm">Powered by</span>
//               <span className="ml-1 font-semibold">Gemini AI</span>
//             </div>
//           </div>
//           <p className="mt-2 text-blue-100">Real-time product detection and analysis using your camera</p>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="container mx-auto py-8 px-4 flex-grow">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//           {/* Camera Section */}
//           <div className="lg:col-span-7">
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-semibold text-gray-800">
//                   <Camera className="inline mr-2 text-blue-500" size={20} />
//                   Live Camera Feed
//                 </h2>
//                 <div className="flex space-x-3">
//                   <button 
//                     onClick={() => setIsAutoCapturing(!isAutoCapturing)}
//                     className={`px-3 py-1 rounded text-sm flex items-center ${
//                       isAutoCapturing 
//                         ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
//                         : 'bg-gray-200 hover:bg-gray-300'
//                     }`}
//                   >
//                     <span className="mr-1">
//                       {isAutoCapturing ? '⏸' : '🔄'}
//                     </span>
//                     <span>{isAutoCapturing ? 'Pause' : 'Auto'}</span>
//                   </button>
//                   <button 
//                     onClick={captureImage}
//                     className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm flex items-center"
//                     disabled={loading}
//                   >
//                     <span className="mr-1">📷</span>
//                     <span>Capture</span>
//                   </button>
//                 </div>
//               </div>

//               <div className="relative max-w-lg mx-auto rounded-lg overflow-hidden shadow-lg">
//                 <video 
//                   ref={videoRef} 
//                   autoPlay 
//                   playsInline 
//                   className="w-full rounded-lg"
//                 />
                
//                 {/* Border overlay */}
//                 <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"></div>
                
//                 {/* Grid overlay */}
//                 <div className="absolute inset-0 pointer-events-none opacity-30" 
//                      style={{
//                        backgroundImage: `
//                          linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
//                          linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
//                        `,
//                        backgroundSize: '50px 50px'
//                      }}></div>
                
//                 {/* Flash effect */}
//                 <div className={`absolute inset-0 bg-white transition-opacity duration-300 ${showFlash ? 'opacity-70' : 'opacity-0'}`}></div>
                
//                 {/* Status indicator */}
//                 {status.message && (
//                   <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-70 text-white px-3 py-1 rounded-full text-sm flex items-center">
//                     <span className={`h-2 w-2 rounded-full mr-2 animate-pulse`} 
//                           style={{backgroundColor: status.color === 'green' ? '#10B981' : 
//                                                  status.color === 'red' ? '#EF4444' : 
//                                                  status.color === 'yellow' ? '#F59E0B' : 
//                                                  status.color === 'blue' ? '#3B82F6' : '#9CA3AF'}}></span>
//                     <span>{status.message}</span>
//                   </div>
//                 )}
//               </div>

//               <div className="mt-4 bg-gray-50 rounded-lg p-4">
//                 {loading ? (
//                   <div className="flex items-center justify-center p-4">
//                     <div className="animate-spin text-blue-500 mr-3">⏳</div>
//                     <span className="text-gray-600">Analyzing product...</span>
//                   </div>
//                 ) : (
//                   <div className="text-center text-gray-500">
//                     <span>Position the product in the center of the frame and click 'Capture'</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Results Section */}
//           <div className="lg:col-span-5">
//             <div className="bg-white rounded-xl shadow-lg p-6 h-full">
//               <h2 className="text-xl font-semibold text-gray-800 mb-4">
//                 <span className="mr-2">📋</span>
//                 Analysis Results
//               </h2>
              
//               {currentResult && (
//                 <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
//                   <div className="flex justify-between items-start">
//                     <h3 className="text-lg font-medium text-gray-800">{currentResult.name}</h3>
//                     <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
//                       {currentResult.category}
//                     </span>
//                   </div>
//                   <div className="mt-2 grid grid-cols-2 gap-2">
//                     <div className="bg-white p-2 rounded border border-gray-200">
//                       <span className="text-xs text-gray-500">Price</span>
//                       <p className="font-medium text-gray-900">{currentResult.price}</p>
//                     </div>
//                     <div className="bg-white p-2 rounded border border-gray-200">
//                       <span className="text-xs text-gray-500">Stock</span>
//                       <p className="font-medium text-gray-900">{currentResult.stock}</p>
//                     </div>
//                   </div>
//                   <div className="mt-2">
//                     <span className="text-xs text-gray-500">Description</span>
//                     <p className="text-gray-700 text-sm mt-1">{currentResult.description}</p>
//                   </div>
//                   <div className="mt-3 text-xs text-gray-500 flex justify-between">
//                     <span>{new Date(currentResult.timestamp).toLocaleTimeString()}</span>
//                     <span>#{currentResult.id.substring(currentResult.id.indexOf('_') + 1)}</span>
//                   </div>
//                 </div>
//               )}
              
//               <div className="max-h-96 overflow-y-auto">
//                 {analysisHistory.length === 0 ? (
//                   <div className="flex flex-col items-center justify-center text-gray-400 py-10">
//                     <span className="text-3xl mb-2">🔍</span>
//                     <p>No products analyzed yet</p>
//                     <p className="text-sm mt-1">Capture an image to start analyzing</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {analysisHistory.map((result) => (
//                       <div key={result.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-all transform hover:-translate-y-1">
//                         <div className="flex justify-between items-start">
//                           <h4 className="font-medium text-gray-800">{result.name}</h4>
//                           <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">{result.category}</span>
//                         </div>
//                         <div className="mt-1 text-sm text-gray-600 truncate">{result.description}</div>
//                         <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
//                           <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
//                           <span className="font-medium text-gray-700">{result.price}</span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="bg-gray-800 text-white py-6 mt-10">
//         <div className="container mx-auto px-4">
//           <div className="flex flex-col md:flex-row justify-between items-center">
//             <div className="mb-4 md:mb-0">
//               <h3 className="text-lg font-semibold">AI Product Analyzer</h3>
//               <p className="text-gray-400 text-sm">A React and Gemini AI-powered application</p>
//             </div>
//             <div className="flex space-x-4">
//               <a href="#" className="text-gray-400 hover:text-white">
//                 <span>GitHub</span>
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white">
//                 <span>Portfolio</span>
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white">
//                 <span>Contact</span>
//               </a>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default AddAutomatic;