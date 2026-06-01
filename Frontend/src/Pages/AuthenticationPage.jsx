import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, KeyRound, Clock, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export default function AuthenticationPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isCooldown, setIsCooldown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (isCooldown && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsCooldown(false);
    }
    return () => clearInterval(interval);
  }, [isCooldown, timer]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Sending OTP request to:", axios.defaults.baseURL + '/v1/send-otp');
      
      const response = await axios.post('/v1/send-otp', { email }, {
        timeout: 60000 // 60 second timeout
      });
      
      console.log("OTP Response:", response.data);
      
      if (response.data.success) {
        setIsOtpSent(true);
        setIsCooldown(true);
        setTimer(60);
        setError(""); // Clear any previous errors
      } else {
        setError(response.data.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP Send Error Details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          "Failed to send OTP. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Sending OTP verification request...");
      
      const response = await axios.post("/v1/verify-otp", { email, otp }, {
        timeout: 60000 // 60 second timeout
      });
      
      console.log("OTP Verify Response:", response.data);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem("institute-auth", response.data.token);
        localStorage.setItem("email", email);
        navigate("/app");
      } else {
        setError(response.data.message || "Authentication failed. Please try again.");
      }
    } catch (error) {
      console.error("OTP Verify Error Details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          "Invalid OTP. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isLoading || timer > 0) return;
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post('/v1/send-otp', { email }, {
        timeout: 60000 // 60 second timeout
      });
      
      if (response.data.success) {
        setIsCooldown(true);
      setTimer(150);
    } catch (error) {
      setError("Failed to resend OTP. Please try again.");
    }
    setIsLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 24,
        staggerChildren: 0.04
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-950 via-gray-900 to-black p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <motion.div variants={itemVariants} className="hidden md:flex flex-col justify-center gap-6 bg-[linear-gradient(135deg,#0f172a66,transparent)] rounded-2xl p-8 border border-gray-800/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white">Gradex</h3>
              <p className="text-sm text-gray-400">Smart grading for educators</p>
            </div>
          </div>

          <div className="text-gray-300 space-y-3">
            <p className="text-lg font-medium text-white">Fast, accurate grading</p>
            <p className="text-sm">Upload question papers and get automated evaluations with explanations and insights. Built for teachers.</p>
          </div>

          <div className="mt-auto text-sm text-gray-500">
            <p>New to Gradex? <Link to="/" className="text-white underline">Learn more</Link></p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-white">Welcome back</h1>
            <p className="text-sm text-gray-400 mt-1">Sign in with your institute email to continue</p>
          </div>

          <AnimatePresence mode="wait">
            {!isOtpSent ? (
              <motion.form key="email" onSubmit={handleEmailSubmit} variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: -30 }} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-3 p-3 rounded-md bg-red-600/10 border border-red-600/20 text-red-300">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <label className="text-sm font-medium text-gray-300">Institute Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@institute.edu"
                  className="w-full bg-transparent border border-gray-700/60 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="flex-1 inline-flex items-center justify-center gap-3 rounded-lg px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg transition-all"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Send verification code
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500">By continuing you agree to our Terms and Privacy Policy.</p>
              </motion.form>
            ) : (
              <motion.form key="otp" onSubmit={handleOtpSubmit} variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: 30 }} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-3 p-3 rounded-md bg-red-600/10 border border-red-600/20 text-red-300">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center shadow">
                    <KeyRound className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-white mt-3">Enter verification code</h2>
                  <p className="text-sm text-gray-400">Code sent to <span className="text-white font-medium">{email}</span></p>
                </div>

                {isCooldown && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-blue-600/5 border border-blue-600/10 text-blue-300 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Resend available in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                  </div>
                )}

                <label className="text-sm font-medium text-gray-300">Verification code</label>
                <input
                  id="otp"
                  type="text"
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  className="w-full bg-transparent border border-gray-700/60 rounded-lg px-4 py-3 text-center text-xl tracking-widest font-mono text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="flex-1 inline-flex items-center justify-center gap-3 rounded-lg px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold shadow transition-all"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Verifying...
                      </div>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Verify & continue
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading || timer > 0}
                    className="px-4 py-3 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800/30"
                  >
                    Resend
                  </button>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => { setIsOtpSent(false); setOtp(""); setError(""); }}
                    className="text-sm text-gray-400 hover:text-white inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Change email
                  </button>
                </div>

              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-400 hover:text-white inline-flex items-center gap-2">
              <ArrowLeft className="w-3 h-3" /> Back to home
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
