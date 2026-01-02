import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaTimes, FaImage } from 'react-icons/fa';
import './UploadImage.css';

const UploadImage = ({ onClose, onUploadSuccess }) => {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('');
    const [image, setImage] = useState(''); // Stores the URL string for DB
    const [tags, setTags] = useState([]);
    const [currentTag, setCurrentTag] = useState('');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [uploadMode, setUploadMode] = useState('file');

    const uploadFileHandler = (e) => {
        const file = e.target.files[0];
        if (!file) {
            console.log('No file selected');
            return;
        }

        console.log('File selected:', file.name, file.size);

        // Preview immediately
        const objectRen = URL.createObjectURL(file);
        setPreview(objectRen);

        // Convert to Base64
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            console.log('Base64 conversion successful');
            setImage(reader.result); // This sets the main state used for publishing
            toast.success('Image Ready!');
        };

        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            toast.error('Could not read file');
        };
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = currentTag.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
                setCurrentTag('');
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            toast.error('Please upload an image first');
            return;
        }

        setLoading(true);
        try {
            await axios.post('https://ai-photo-propmt.onrender.com/api/images', {
                prompt,
                style,
                imageUrl: image,
                tags: tags
            });
            toast.success('Published Successfully');
            onUploadSuccess();
            onClose();
        } catch (error) {
            toast.error('Failed to publish');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>New AI Image</h3>
                    <button onClick={onClose}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit}>

                    <div className="upload-tabs">
                        <button
                            type="button"
                            className={`tab-btn ${uploadMode === 'file' ? 'active' : ''}`}
                            onClick={() => setUploadMode('file')}
                        >
                            Upload File
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${uploadMode === 'url' ? 'active' : ''}`}
                            onClick={() => setUploadMode('url')}
                        >
                            Image Link
                        </button>
                    </div>

                    <div className="form-group upload-area">
                        {uploadMode === 'file' ? (
                            <>
                                <label htmlFor="image-file" className="file-upload-label">
                                    {preview ? (
                                        <div className="preview-container">
                                            <img src={preview} alt="Preview" className="upload-preview" />
                                            <div className="change-overlay">Change Image</div>
                                        </div>
                                    ) : (
                                        <div className="placeholder">
                                            <FaImage size={40} />
                                            <span>Click to Upload Image</span>
                                        </div>
                                    )}
                                </label>
                                <input
                                    type="file"
                                    id="image-file"
                                    onChange={uploadFileHandler}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </>
                        ) : (
                            <div className="url-input-container">
                                <input
                                    type="text"
                                    className="modern-input"
                                    placeholder="Paste image URL here (https://...)"
                                    value={image}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        // Auto-convert Google Drive Links
                                        if (val.includes('drive.google.com') && val.includes('/file/d/')) {
                                            const match = val.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                                            if (match && match[1]) {
                                                val = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                                            }
                                        }
                                        setImage(val);
                                        setPreview(val);
                                    }}
                                />
                                {preview && (
                                    <div className="preview-container mt-3">
                                        <img src={preview} alt="Preview" className="upload-preview" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Prompt / Description</label>
                        <textarea
                            rows="3"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the image..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Keywords (Type and press Enter)</label>
                        <div className="tag-input-container">
                            <div className="tags-list">
                                {tags.map((tag, index) => (
                                    <span key={index} className="tag-chip">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)}><FaTimes size={10} /></button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder={tags.length === 0 ? "nature, blue, futuristic..." : "Add another..."}
                                className="tag-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Style</label>
                        <select value={style} onChange={(e) => setStyle(e.target.value)}>
                            <option value="">Select Style</option>
                            <option value="Cyberpunk">Cyberpunk</option>
                            <option value="Realistic">Realistic</option>
                            <option value="Anime">Anime</option>
                            <option value="Watercolor">Watercolor</option>
                            <option value="3D Render">3D Render</option>
                        </select>
                    </div>

                    <button type="submit" className="upload-btn" disabled={loading}>
                        {loading ? 'Processing...' : <><FaCloudUploadAlt /> Publish Image</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadImage;
