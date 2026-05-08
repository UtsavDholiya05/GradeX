import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

export default function Troubles() {
  const [errorMessage, setErrorMessage] = useState("Something went wrong during the last operation. Please try again.");

  useEffect(() => {
    const error = sessionStorage.getItem("errorMessage");
    if (error) setErrorMessage(error);
  }, []);

  const goHome = () => {
    window.location.href = "/";
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="p-8 md:p-12 bg-gray-900/50 rounded-3xl border border-gray-800 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-red-900/50 border border-red-800/50 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle size={48} className="text-red-400" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              An Error Occurred
            </h1>

            <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
              {errorMessage}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goHome}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gray-800/50 border border-gray-700 hover:border-white text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-200"
              >
                <Home size={20} />
                Go to Home
              </motion.button>
            </div>

            <button
              onClick={goBack}
              className="text-gray-500 hover:text-white transition-colors inline-flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back to previous page
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
