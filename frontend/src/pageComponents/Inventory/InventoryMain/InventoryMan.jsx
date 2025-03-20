import { useState, useEffect, useRef } from "react"
import { Search, Filter, Plus, Edit2, Trash2, AlertTriangle, Package, ShoppingCart, XCircle, Upload } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import "./InventoryMain.css"
import axios from "axios" // Make sure to install axios: npm install axios

const InventoryMain = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [inventoryItems, setInventoryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const fileInputRef = useRef(null)
  
  // Form state for adding/editing products
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: 0,
    stock: 0,
    description: ""
  })
  
  const [editMode, setEditMode] = useState(false)
  const [currentProductId, setCurrentProductId] = useState(null)

  // API URL - update this to your server URL
  const API_URL = "http://localhost:8000/api/products"
  const SERVER_URL = "http://localhost:8000"

  // Categories for the filter dropdown
  const categories = ["All",
    "Shirts", "T-Shirts", "Jackets", "Caps/Hats", "Mugs", 
    "Key Chains", "Paintings", "Bottles", "Stationary", "Sunglasses"
  ]

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_URL)
      setInventoryItems(response.data)
      setLoading(false)
    } catch (err) {
      setError("Failed to fetch products")
      setLoading(false)
      console.error("Error fetching products:", err)
    }
  }

  // Create new product with file upload
  const createProduct = async (productData, file) => {
    try {
      const formDataToSend = new FormData()
      
      // Append all product data to FormData
      Object.keys(productData).forEach(key => {
        formDataToSend.append(key, productData[key])
      })
      
      // Append the file if it exists
      if (file) {
        formDataToSend.append('image', file)
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
      
      const response = await axios.post(API_URL, formDataToSend, config)
      setInventoryItems([...inventoryItems, response.data])
      return response.data
    } catch (err) {
      console.error("Error creating product:", err)
      throw err
    }
  }

  // Update existing product with file upload
  const updateProduct = async (id, productData, file) => {
    try {
      const formDataToSend = new FormData()
      
      // Append all product data to FormData
      Object.keys(productData).forEach(key => {
        formDataToSend.append(key, productData[key])
      })
      
      // Append the file if it exists
      if (file) {
        formDataToSend.append('image', file)
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
      
      const response = await axios.put(`${API_URL}/${id}`, formDataToSend, config)
      setInventoryItems(inventoryItems.map(item => 
        item._id === id ? response.data : item
      ))
      return response.data
    } catch (err) {
      console.error("Error updating product:", err)
      throw err
    }
  }

  // Delete product
  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`)
      setInventoryItems(inventoryItems.filter(item => item._id !== id))
    } catch (err) {
      console.error("Error deleting product:", err)
      throw err
    }
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      
      // Create preview URL
      const fileReader = new FileReader()
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result)
      }
      fileReader.readAsDataURL(file)
    }
  }

  // Load products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "price" || name === "stock" ? Number(value) : value
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editMode && currentProductId) {
        await updateProduct(currentProductId, formData, selectedFile)
      } else {
        await createProduct(formData, selectedFile)
      }
      resetFormAndCloseModal()
    } catch (err) {
      alert("Error saving product")
    }
  }

  // Reset form and close modal
  const resetFormAndCloseModal = () => {
    setFormData({
      name: "",
      category: "",
      price: 0,
      stock: 0,
      description: ""
    })
    setSelectedFile(null)
    setPreviewUrl("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setEditMode(false)
    setCurrentProductId(null)
    setShowAddModal(false)
  }

  // Open edit modal with product data
  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description || ""
    })
    
    // If the product has an image, set the preview URL
    if (product.image) {
      setPreviewUrl(`${SERVER_URL}${product.image}`);
    } else {
      setPreviewUrl("")
    }
    
    setEditMode(true)
    setCurrentProductId(product._id)
    setShowAddModal(true)
  }

  // Confirm and delete product
  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id)
      } catch (err) {
        alert("Failed to delete product")
      }
    }
  }

  // Get image URL for product
  const getImageUrl = (item) => {
    if (item.image) {
      return `${SERVER_URL}${item.image}`
    }
    return `https://source.unsplash.com/400x300/?safari,${item.category.toLowerCase()}`
  }

  // Filter items based on search and category
  const filteredItems = inventoryItems
    .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((item) => filterCategory.toLowerCase() === "all" || item.category.toLowerCase() === filterCategory.toLowerCase())

  // Calculate stats
  const stats = [
    {
      title: "Total Products",
      value: inventoryItems.length,
      icon: Package,
      color: "bg-blue-500",
      trend: `${inventoryItems.length} products in inventory`,
    },
    {
      title: "Low Stock Items",
      value: inventoryItems.filter((item) => item.stock < 10).length,
      icon: AlertTriangle,
      color: "bg-amber-500",
      trend: "Less than 10 in stock",
    },
    {
      title: "Out of Stock",
      value: inventoryItems.filter((item) => item.stock === 0).length,
      icon: XCircle,
      color: "bg-red-500",
      trend: "Need to restock",
    },
  ]

  if (loading) return <div className="loading-state">Loading inventory...</div>
  
  if (error) return <div className="error-state">Error: {error}</div>

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <div className="header-content">
          <h2>Inventory Management</h2>
          <p className="text-gray-500">Manage your safari shop products</p>
        </div>
        <motion.button
          className="add-product-btn"
          onClick={() => {
            resetFormAndCloseModal()
            setShowAddModal(true)
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          <span>Add Product</span>
        </motion.button>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`stat-icon ${stat.color}`}>
              <stat.icon size={24} color="white" />
            </div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
              <span className="stat-trend">{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="inventory-filters">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-container">
          <Filter size={20} />
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <motion.div 
        className="inventory-grid"
        layout
      >
        <AnimatePresence>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <motion.div
                key={item._id}
                className="product-card"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="product-image">
                  <img
                    src={getImageUrl(item)}
                    alt={item.name}
                  />
                  {item.stock < 10 && (
                    <div className="low-stock-badge">
                      <AlertTriangle size={14} />
                      <span>Low Stock</span>
                    </div>
                  )}
                </div>
                <div className="product-details">
                  <h3>{item.name}</h3>
                  <span className="product-category">{item.category}</span>
                  <p className="product-price">₹{item.price.toLocaleString()}</p>
                  <div className="product-stock">
                    <div className="stock-bar-container">
                      <motion.div
                        className={`stock-bar ${item.stock < 10 ? "low" : ""}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(item.stock, 50) * 2}%` }}
                        transition={{ duration: 0.5 }}
                      ></motion.div>
                    </div>
                    <span>{item.stock} in stock</span>
                  </div>
                  <div className="product-actions">
                    <motion.button
                      className="edit-btn"
                      onClick={() => handleEditProduct(item)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit2 size={16} />
                    </motion.button>
                    <motion.button
                      className="delete-btn"
                      onClick={() => handleDeleteProduct(item._id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="no-products-message">
              No products match your search criteria
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="add-product-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="modal-header">
                <h3>{editMode ? "Edit Product" : "Add New Product"}</h3>
                <button className="close-btn" onClick={resetFormAndCloseModal}>
                  <XCircle size={24} />
                </button>
              </div>
              <form className="product-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Product Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name" 
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories
                      .filter((cat) => cat !== "All")
                      .map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input 
                      type="number" 
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00" 
                      min="0" 
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input 
                      type="number" 
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0" 
                      min="0" 
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Product Image</label>
                  <div className="file-upload-container">
                    {previewUrl && (
                      <div className="image-preview">
                        <img src={previewUrl} alt="Preview" />
                      </div>
                    )}
                    <div className="file-input">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*" 
                        id="product-image"
                      />
                      <label htmlFor="product-image" className="file-upload-button">
                        <Upload size={16} />
                        {editMode ? "Change Image" : "Upload Image"}
                      </label>
                    </div>
                    {previewUrl && (
                      <div className="file-name">
                        {selectedFile ? selectedFile.name : "Current image"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <motion.button
                    type="button"
                    className="cancel-btn"
                    onClick={resetFormAndCloseModal}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="save-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editMode ? "Update Product" : "Save Product"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default InventoryMain