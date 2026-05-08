import { Home, FileText, BarChart3, Clock, Settings, LogOut, User, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "./components/ui";

function Sidebar({ isSidebarOpen, toggleSidebar, user, onSignOut }) {
  const location = useLocation();
  
  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BarChart3, label: "Dashboard", path: "/dashboard" },
    { icon: FileText, label: "Upload Sheets", path: "/app" },
    { icon: Clock, label: "History", path: "/history" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      opacity: 0,
      x: 20
    }
  };

  return (
    <motion.aside
      initial="closed"
      animate={isSidebarOpen ? "open" : "closed"}
      variants={sidebarVariants}
      className="fixed top-0 right-0 h-screen w-80 glass-dark border-l border-gray-700/50 z-50 shadow-2xl"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold text-white">Navigation</h2>
            <p className="text-sm text-gray-400">Choose your destination</p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-gray-400 hover:text-white hover:bg-gray-800/50"
            >
              <X className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        {user && (
          <motion.div 
            variants={itemVariants}
            className="p-6 border-b border-gray-700/50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Welcome back!</p>
                <p className="text-gray-400 text-sm truncate">{user.email || "user@gradex.com"}</p>
              </div>
            </div>
          </motion.div>
        )}

        <nav className="flex-1 p-6">
          <motion.ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <motion.li 
                  key={item.path}
                  variants={itemVariants}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    onClick={toggleSidebar}
                    className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      active 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${
                      active ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`} />
                    <span className="font-medium">{item.label}</span>
                    {active && (
                      <motion.div 
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        </nav>

        <motion.div 
          variants={itemVariants}
          className="p-6 border-t border-gray-700/50"
        >
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-red-600/20 hover:border-red-600/30 group"
            onClick={() => {
              if (onSignOut) onSignOut();
              toggleSidebar();
            }}
          >
            <LogOut className="h-5 w-5 mr-3 group-hover:text-red-400 transition-colors" />
            <span className="group-hover:text-red-400 transition-colors">Sign Out</span>
          </Button>
        </motion.div>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
