import React, { useState } from 'react';
import './Add.css';
import { assets, url } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = () => {
    const categories = [
        "All", "Shirts", "T-Shirts", "Jackets", "Caps/Hats", 
        "Mugs", "Key Chains", "Paintings", "Bottles", 
        "Stationary", "Sunglasses"
    ];

    const [image, setImage] = useState(false);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "Shirts"
    });
    
    const onSubmitHandler = async (event) => {
        event.preventDefault();
        if (!image) {
            toast.error('Image not selected');
            return null;
        }
        
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", Number(data.price));
        formData.append("stock", Number(data.stock));
        formData.append("category", data.category);
        formData.append("image", image);
        
        try {
            const response = await axios.post(`${url}/api/food/add`, formData);
            
            if (response.data.success) {
                toast.success(response.data.message);
                setData({
                    name: "",
                    description: "",
                    price: "",
                    stock: "",
                    category: "Shirts"
                });
                setImage(false);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Error adding product");
        }
    };
    
    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    };
    
    return (
        <div className="add-container">
            <div className="add-header">
                <h2>Add New Product</h2>
                <p>Fill in the details to add a new item to your inventory</p>
            </div>
            
            <form className="add-form" onSubmit={onSubmitHandler}>
                <div className="form-grid">
                    <div className="image-upload-container">
                        <p className="form-label">Product Image</p>
                        <input 
                            onChange={(e) => { 
                                setImage(e.target.files[0]); 
                                e.target.value = ''; 
                            }} 
                            type="file" 
                            accept="image/*" 
                            id="image" 
                            hidden 
                        />
                        <label htmlFor="image" className="image-upload-area">
                            {!image ? (
                                <>
                                    <img src={assets.upload_area} alt="Upload" className="upload-icon" />
                                    <p>Click to upload image</p>
                                </>
                            ) : (
                                <div className="preview-container">
                                    <img 
                                        src={URL.createObjectURL(image)} 
                                        alt="Product Preview" 
                                        className="image-preview" 
                                    />
                                    <div className="preview-overlay">
                                        <span>Change Image</span>
                                    </div>
                                </div>
                            )}
                        </label>
                    </div>

                    <div className="form-details">
                        <div className="input-group">
                            <label className="form-label">Product Name</label>
                            <input 
                                name="name" 
                                onChange={onChangeHandler} 
                                value={data.name} 
                                type="text" 
                                placeholder="Enter product name" 
                                className="form-input" 
                                required 
                            />
                        </div>
                        
                        <div className="input-group">
                            <label className="form-label">Description</label>
                            <textarea 
                                name="description" 
                                onChange={onChangeHandler} 
                                value={data.description} 
                                rows={4} 
                                placeholder="Describe your product" 
                                className="form-input textarea" 
                                required 
                            />
                        </div>
                        
                        <div className="input-row">
                            <div className="input-group">
                                <label className="form-label">Category</label>
                                <select 
                                    name="category" 
                                    onChange={onChangeHandler}
                                    value={data.category}
                                    className="form-input"
                                >
                                    {categories.filter(cat => cat !== "All").map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="input-group">
                                <label className="form-label">Price ($)</label>
                                <input 
                                    type="number" 
                                    name="price" 
                                    onChange={onChangeHandler} 
                                    value={data.price} 
                                    placeholder="0.00" 
                                    className="form-input" 
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            
                            <div className="input-group">
                                <label className="form-label">Stock</label>
                                <input 
                                    type="number" 
                                    name="stock" 
                                    onChange={onChangeHandler} 
                                    value={data.stock} 
                                    placeholder="0" 
                                    className="form-input" 
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                <button type="submit" className="submit-button">
                    Add Product
                </button>
            </form>
        </div>
    );
};

export default Add;