import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon, 
  Building, 
  Mail, 
  Sparkles, 
  Sliders, 
  Shield, 
  Bell, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Cpu, 
  Server,
  FileCheck
} from "lucide-react";
import { toast } from "react-toastify";
import { Button, Input, Label, Badge } from "../components/ui";

export default function Settings() {
  const [institutionName, setInstitutionName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [evaluationMode, setEvaluationMode] = useState("normal");
  const [aiModel, setAiModel] = useState("gemini-3-flash");
  const [ocrEngine, setOcrEngine] = useState("llama-4-groq");
  const [detailedFeedback, setDetailedFeedback] = useState(true);
  const [autoExtractRollNo, setAutoExtractRollNo] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load persisted settings or set defaults
    const savedInstitute = localStorage.getItem("gradex_institution_name") || "GradeX Academic Center";
    const savedDept = localStorage.getItem("gradex_department") || "Computer Science & Engineering";
    const savedEmail = localStorage.getItem("email") || "dummy@gradex.com";
    const savedMode = localStorage.getItem("gradex_evaluation_mode") || "normal";
    const savedModel = localStorage.getItem("gradex_ai_model") || "gemini-3-flash";
    const savedOcr = localStorage.getItem("gradex_ocr_engine") || "llama-4-groq";
    const savedFeedback = localStorage.getItem("gradex_detailed_feedback") !== "false";
    const savedAutoRoll = localStorage.getItem("gradex_auto_roll") !== "false";
    const savedNotifs = localStorage.getItem("gradex_email_notifs") !== "false";

    setInstitutionName(savedInstitute);
    setDepartment(savedDept);
    setEmail(savedEmail);
    setEvaluationMode(savedMode);
    setAiModel(savedModel);
    setOcrEngine(savedOcr);
    setDetailedFeedback(savedFeedback);
    setAutoExtractRollNo(savedAutoRoll);
    setEmailNotifications(savedNotifs);
  }, []);

  const handleSave = (e) => {
    e?.preventDefault();
    localStorage.setItem("gradex_institution_name", institutionName);
    localStorage.setItem("gradex_department", department);
    localStorage.setItem("email", email);
    localStorage.setItem("gradex_evaluation_mode", evaluationMode);
    localStorage.setItem("gradex_ai_model", aiModel);
    localStorage.setItem("gradex_ocr_engine", ocrEngine);
    localStorage.setItem("gradex_detailed_feedback", detailedFeedback.toString());
    localStorage.setItem("gradex_auto_roll", autoExtractRollNo.toString());
    localStorage.setItem("gradex_email_notifs", emailNotifications.toString());

    setIsSaved(true);
    toast.success("Settings saved successfully!");
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    setInstitutionName("GradeX Academic Center");
    setDepartment("Computer Science & Engineering");
    setEvaluationMode("normal");
    setAiModel("gemini-3-flash");
    setOcrEngine("llama-4-groq");
    setDetailedFeedback(true);
    setAutoExtractRollNo(true);
    setEmailNotifications(true);
    toast.info("Settings reset to defaults. Click 'Save' to apply.");
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 max-w-4xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/60 border border-gray-700 rounded-full mb-4 shadow-lg backdrop-blur-md">
            <SettingsIcon className="w-4 h-4 text-purple-400 animate-spin-slow" />
            <span className="text-sm font-medium text-gray-300">Preferences & Configuration</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-gray-400 mt-3 text-base md:text-lg max-w-xl mx-auto">
            Configure evaluation parameters, institution details, and AI grading preferences.
          </p>
        </motion.div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Institution Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 md:p-8 bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Institution Profile</h2>
                <p className="text-xs text-gray-400">Details that appear on generated marksheets and analytics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="inst-name" className="mb-2 block">Institution / University Name</Label>
                <Input
                  id="inst-name"
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="bg-gray-800/60 border-gray-700 focus:border-purple-500"
                />
              </div>

              <div>
                <Label htmlFor="department" className="mb-2 block">Department / Faculty</Label>
                <Input
                  id="department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Department of Computer Science"
                  className="bg-gray-800/60 border-gray-700 focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="inst-email" className="mb-2 block">Admin / Notification Email</Label>
                <div className="relative">
                  <Input
                    id="inst-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gradex.com"
                    className="bg-gray-800/60 border-gray-700 focus:border-purple-500 pl-10"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 2: AI & Grading Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 md:p-8 bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Grading & Evaluation Modes</h2>
                <p className="text-xs text-gray-400">Control semantic scoring strictness and model selection</p>
              </div>
            </div>

            {/* Grading Mode Selector */}
            <div className="mb-6">
              <Label className="mb-3 block text-sm font-semibold">Evaluation Mode</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: "lenient",
                    title: "Lenient",
                    desc: "Generous marking. Awards credit for understanding core concepts even with minor flaws.",
                    badge: "Relaxed"
                  },
                  {
                    id: "normal",
                    title: "Normal",
                    desc: "Balanced semantic analysis aligned directly with ground-truth grading rubrics.",
                    badge: "Recommended"
                  },
                  {
                    id: "strict",
                    title: "Strict",
                    desc: "Rigorous standards. Requires precise technical terminology and thorough derivations.",
                    badge: "High Precision"
                  }
                ].map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => setEvaluationMode(mode.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      evaluationMode === mode.id
                        ? "bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30"
                        : "bg-gray-800/40 border-gray-700/70 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">{mode.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        mode.id === "normal" 
                          ? "bg-purple-600/30 text-purple-300 border border-purple-500/40" 
                          : "bg-gray-700/50 text-gray-300"
                      }`}>
                        {mode.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{mode.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Model & OCR Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <Label htmlFor="ai-model" className="mb-2 block">AI Evaluator Model</Label>
                <select
                  id="ai-model"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-700 bg-gray-800/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="gemini-3-flash">Google Gemini 3 Flash (Fast & Scalable)</option>
                  <option value="gemini-3.1-pro">Google Gemini 3.1 Pro (Deep Reasoning)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="ocr-engine" className="mb-2 block">OCR Recognition Engine</Label>
                <select
                  id="ocr-engine"
                  value={ocrEngine}
                  onChange={(e) => setOcrEngine(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-700 bg-gray-800/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="llama-4-groq">Llama 4 Maverick (Groq AI Fast OCR)</option>
                  <option value="pymupdf">PyMuPDF Native Text Extractor</option>
                </select>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="mt-6 pt-4 border-t border-gray-800/80 space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium text-white text-sm">Detailed Feedback & Improvement Suggestions</div>
                  <div className="text-xs text-gray-400">Provide students with constructive question-by-question recommendations</div>
                </div>
                <input
                  type="checkbox"
                  checked={detailedFeedback}
                  onChange={(e) => setDetailedFeedback(e.target.checked)}
                  className="w-5 h-5 accent-purple-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium text-white text-sm">Automated Student Roll Number Detection</div>
                  <div className="text-xs text-gray-400">Extract student identification automatically from uploaded file names</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoExtractRollNo}
                  onChange={(e) => setAutoExtractRollNo(e.target.checked)}
                  className="w-5 h-5 accent-purple-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </motion.div>

          {/* Section 3: System & Connectivity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 md:p-8 bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">System & Service Status</h2>
                <p className="text-xs text-gray-400">Connectivity and backend service diagnostics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/60 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400">Backend API URL</div>
                  <div className="text-sm font-mono text-purple-300 mt-1 truncate max-w-[200px] md:max-w-[260px]">
                    {import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Connected
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/60 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400">Authentication Session</div>
                  <div className="text-sm font-semibold text-white mt-1">
                    {localStorage.getItem("institute-auth") ? "Active JWT Token" : "Guest Mode"}
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  <Shield className="w-3.5 h-3.5" />
                  Secured
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800/80">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium text-white text-sm">Evaluation Email Notifications</div>
                  <div className="text-xs text-gray-400">Receive an email summary once an evaluation batch completes</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-5 h-5 accent-purple-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white transition-all text-sm font-medium w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>

            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-8 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {isSaved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
