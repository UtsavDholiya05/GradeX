import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./Header";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Commented out original authentication verification
    // const authToken = localStorage.getItem("institute-auth");
    // const email = localStorage.getItem("email");
    // if (authToken && email) {
    //   setIsAuthenticated(true);
    //   setUser({ email });
    // }
    
    // Auto-login with dummy credentials
    localStorage.setItem("institute-auth", "dummy-token-value");
    localStorage.setItem("email", "dummy@gradex.com");
    setIsAuthenticated(true);
    setUser({ email: "dummy@gradex.com" });
  }, []);

  const handleSignOut = () => {
    // Commented out original sign out logic to keep user logged in with dummy account
    // localStorage.removeItem("institute-auth");
    // setIsAuthenticated(false);
    // setUser(null);
    // setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.05),transparent)] opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,107,107,0.03),transparent)] opacity-40"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(255,255,255,0.01)_49%,rgba(255,255,255,0.01)_51%,transparent_52%)] bg-[length:20px_20px]"></div>
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <Sidebar 
            isSidebarOpen={isSidebarOpen} 
            toggleSidebar={() => setIsSidebarOpen(false)}
            user={user}
            onSignOut={handleSignOut}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          isAuthenticated={isAuthenticated}
          onSignOut={handleSignOut}
          user={user}
        />

        <main className="flex-1">
          <Outlet context={{ isAuthenticated, user }} />
        </main>
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
}
