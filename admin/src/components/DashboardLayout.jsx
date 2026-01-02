import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { FaImages, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="dashboard-container">
            {/* Mobile Overlay */}
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Fusion Admin</h3>
                    <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
                        <FaTimes />
                    </button>
                </div>
                <nav className="sidebar-menu">
                    <Link
                        to="/"
                        className={`menu-item ${location.pathname === '/' ? 'active' : ''}`}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <FaImages /> <span>Images</span>
                    </Link>
                    {/* Add more links here */}
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <FaSignOutAlt /> <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-bar">
                    <button className="menu-toggle-btn" onClick={toggleSidebar}>
                        <FaBars />
                    </button>
                    <div className="user-info">
                        <span>{user?.email}</span>
                    </div>
                </header>
                <div className="content-area">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
