import { Link } from "react-router-dom";
import { FileText, ArrowRight, Zap, Check, Users, BarChart3, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const LandingPage = () => {
  const [isAuthenticated, setAuthentication] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAuthentication(!!localStorage.getItem("institute-auth"));
  }, []);

  const handleGetStarted = () => {
    // Commented out original check and redirect to /auth
    // navigate(isAuthenticated ? "/app" : "/auth");
    navigate("/app");
  };

  const features = [
    {
      icon: <Zap className="h-10 w-10 text-white" />,
      title: "Lightning Fast Evaluation",
      description: "Process hundreds of answer sheets in minutes with our advanced AI technology. No more manual grading hassles."
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-white" />,
      title: "Accurate Results",
      description: "Our AI ensures consistent and unbiased grading every time. Get detailed analytics and performance insights."
    },
    {
      icon: <Users className="h-10 w-10 text-white" />,
      title: "Student Analytics",
      description: "Track student performance trends, identify knowledge gaps, and generate comprehensive reports automatically."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Documents",
      description: "Securely upload your question papers and answer sheets in PDF format with drag-and-drop simplicity."
    },
    {
      number: "02",
      title: "AI Processing",
      description: "Our advanced AI analyzes handwriting, evaluates answers, and applies your grading criteria with precision."
    },
    {
      number: "03",
      title: "Review & Export",
      description: "Review AI-generated results, make adjustments if needed, and export detailed reports in multiple formats."
    }
  ];

  const stats = [
    { number: "10K+", label: "Answer Sheets Processed" },
    { number: "500+", label: "Educators Trust Us" },
    { number: "99.2%", label: "Accuracy Rate" },
    { number: "75%", label: "Time Saved" }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.15),transparent)] opacity-70"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,107,107,0.1),transparent)] opacity-60"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full mb-8">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-300">AI-Powered Answer Sheet Evaluation</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight max-w-5xl mx-auto mb-8">
              Grade Answer Sheets{" "}
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                10x Faster
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Transform your grading workflow with advanced AI technology. Accurate, consistent, and lightning-fast evaluation for modern educators.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={handleGetStarted}
                className="group relative px-8 py-4 text-lg bg-white text-black font-semibold rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 inline-block group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 text-lg border border-gray-600 hover:border-white rounded-lg transition-colors duration-300"
              >
                Learn More
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-gray-400 text-sm md:text-base">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Why Choose Gradex?
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Experience the future of educational assessment with our cutting-edge features designed for modern educators.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-all h-full rounded-xl p-8 group"
              >
                <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gray-700 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-white text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Simple, streamlined workflow that gets you from upload to results in minutes.
            </p>
          </motion.div>

          <div className="relative grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="absolute hidden md:block w-full h-0.5 bg-gray-700 top-8 left-0"></div>

            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="text-center relative"
              >
                <div className="relative z-10 w-16 h-16 mx-auto mb-6 bg-black border-2 border-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-center mt-16"
          >
            <button
              onClick={handleGetStarted}
              className="group relative px-8 py-4 text-lg bg-white text-black font-semibold rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out"
            >
              Try It Now - It's Free
              <ArrowRight className="ml-2 h-5 w-5 inline-block group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 max-w-4xl mx-auto rounded-xl overflow-hidden shadow-xl">
              <div className="p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Transform Your Grading?
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join hundreds of educators who have already revolutionized their workflow with Gradex. Start your free trial today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={handleGetStarted}
                    className="group relative px-8 py-4 text-lg bg-white text-black font-semibold rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 inline-block group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                  <p className="text-sm text-gray-400 mt-2 sm:mt-0">No credit card required • Free forever plan available</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-black" />
              </div>
              <span className="text-2xl font-bold text-white">Gradex</span>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a>
              <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How it works</a>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} Gradex. All rights reserved. • Built with ❤️ for educators worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
