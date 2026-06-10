import { Link, useNavigate, useLocation } from "react-router-dom";
import { FileText, Menu, User, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./components/ui";

function Header({ isAuthenticated = false, user, onSignOut, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    if (onSignOut) onSignOut();
    navigate("/");
  };

  const isLandingPage = location.pathname === "/";

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 left-0 w-full glass-dark shadow-xl z-50"
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Gradex
            </h1>
          </motion.div>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-8">
            {isLandingPage && (
              <>
                <motion.a 
                  href="#features" 
                  className="text-gray-300 hover:text-white transition-colors relative group"
                  whileHover={{ y: -2 }}
                >
                  Features
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                </motion.a>
                <motion.a 
                  href="#how-it-works" 
                  className="text-gray-300 hover:text-white transition-colors relative group"
                  whileHover={{ y: -2 }}
                >
                  How it works
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                </motion.a>
              </>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {user && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-300">{user.email || "User"}</span>
                  </div>
                )}
                {/* Commented out Sign Out button to keep dummy user logged in permanently
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
                */}
              </div>
            ) : (
              /* Commented out Sign In link since the dummy account is always authenticated
              <Link to="/auth">
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-600 hover:text-white hover:border-purple-600"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign in
                </Button>
              </Link>
              */
              null
            )}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-gray-300 hover:text-white hover:bg-gray-800/50"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
