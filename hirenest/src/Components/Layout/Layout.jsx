import { useState, useEffect } from "react";
import Header from "../Header/Header";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function Layout({ children }) {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database instead of localStorage
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // For admin token, use hardcoded admin user
      if (token === "admin-token") {
        setUser({
          username: "admin",
          firstName: "Admin",
          role: "admin",
          profileComplete: true
        });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          // Also update localStorage for other components that might need it
          localStorage.setItem('hirenest_user', JSON.stringify(userData));
        } else {
          // Token invalid, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("hirenest_user");
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  return (
    <>
      <Header
        showSignIn={showSignIn}
        setShowSignIn={setShowSignIn}
        showSignUp={showSignUp}
        setShowSignUp={setShowSignUp}
        user={user}
        setUser={setUser}
        isHome={false}
        loading={loading}
      />
      <div className="layout-content">
        {children}
      </div>
      <style>{`
        .layout-content {
          padding-top: 80px;
        }
        @media (max-width: 768px) {
          .layout-content {
            padding-top: 85px;
          }
        }
        @media (max-width: 480px) {
          .layout-content {
            padding-top: 90px;
          }
        }
        /* iPhone XR (414px), iPhone 12 Pro (390px), Pixel 3 (393px) */
        @media screen and (min-width: 381px) and (max-width: 420px) {
          .layout-content {
            padding-top: 100px;
          }
        }
        @media (max-width: 320px) {
          .layout-content {
            padding-top: 95px;
          }
        }
      `}</style>
    </>
  );
}

export default Layout;

