import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash } from 'react-icons/fa';
import UploadImage from '../components/UploadImage';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);

    const fetchImages = async () => {
        try {
            const { data } = await axios.get('https://ai-photo-propmt.onrender.com/api/images');
            setImages(data.images);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching images', error);
            toast.error(`Error: ${error.message}`);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await axios.delete(`https://ai-photo-propmt.onrender.com/api/images/${id}`);
                setImages(images.filter(img => img._id !== id));
                toast.success('Image Deleted');
            } catch (error) {
                toast.error('Delete Failed');
            }
        }
    };

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h2>Image Feed</h2>
                <button className="add-btn" onClick={() => setShowUpload(true)}>
                    <FaPlus /> New Upload
                </button>
            </div>

            {loading ? (
                <div className="loader">Loading...</div>
            ) : (
                <div className="image-grid">
                    {images.map(img => (
                        <div key={img._id} className="image-card">
                            <div className="card-img">
                                <img src={img.imageUrl} alt={img.prompt} />
                                <div className="card-overlay">
                                    <button onClick={() => handleDelete(img._id)} className="delete-btn">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <span className="style-tag">{img.style || 'General'}</span>
                                <p className="prompt-text">{img.prompt}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showUpload && (
                <UploadImage
                    onClose={() => setShowUpload(false)}
                    onUploadSuccess={fetchImages}
                />
            )}
        </div>
    );
};

export default Dashboard;
