import { useState, useEffect } from "react";
import Header from "../Header/Header";

function Layout({ children }) {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [user, setUser] = useState(null);

  // Check for existing user session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("hirenest_user");
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    } else if (token) {
      // For admin token, restore admin user
      if (token === "admin-token") {
        setUser({
          username: "admin",
          firstName: "Admin",
          role: "admin",
        });
      }
    }
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
            padding-top: 70px;
          }
        }
        @media (max-width: 480px) {
          .layout-content {
            padding-top: 60px;
          }
        }
        @media (max-width: 320px) {
          .layout-content {
            padding-top: 55px;
          }
        }
      `}</style>
    </>
  );
}

export default Layout;

