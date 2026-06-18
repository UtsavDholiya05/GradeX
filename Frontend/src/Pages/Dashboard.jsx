import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, FileText, Upload, Plus, Eye, X, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const Dashboard = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [questionPaper, setQuestionPaper] = useState(null);
  const [referenceSheet, setReferenceSheet] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [answerSheets, setAnswerSheets] = useState([]);
  const [evaluating, setEvaluating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [showPaperModal, setShowPaperModal] = useState(false);
  const [paperDetails, setPaperDetails] = useState(null);
  const [showCorrectedModal, setShowCorrectedModal] = useState(false);
  const [correctedSheets, setCorrectedSheets] = useState([]);
  const [selectedCorrectedPaper, setSelectedCorrectedPaper] = useState(null);
  const [expandedSheets, setExpandedSheets] = useState({});
  const [loadingSheets, setLoadingSheets] = useState([]);
  const [stats, setStats] = useState({ totalQuestionPapers: 0, totalAnswerSheetsCorrected: 0 });
  const [reEvaluating, setReEvaluating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Commented out original authentication check
    // const token = localStorage.getItem("institute-auth");
    // if (!token) {
    //   toast.error("Please log in to access the dashboard.");
    //   navigate("/auth");
    // } else {
    //   fetchStats();
    //   fetchPapers();
    // }

    fetchStats();
    fetchPapers();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const res = await axios.get("/v1/institute-stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("institute-auth")}`,
        },
      });
      setStats(res.data);
    } catch {
      toast.error("Failed to fetch institute stats.");
    }
  };

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/v1/get-all-question-paper-details", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("institute-auth")}`,
        },
      });
      setPapers(res.data.papers || []);
    } catch {
      toast.error("Failed to fetch question papers.");
    }
    setLoading(false);
  };

  const handleUploadQuestionPaper = async () => {
    if (!questionPaper || !referenceSheet) {
      toast.error("Please upload both files.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("questionPaper", questionPaper);
    formData.append("referenceSheet", referenceSheet);
    try {
      const res = await axios.post("/v1/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("institute-auth")}`,
        },
      });
      setShowUploadModal(false);
      setQuestionPaper(null);
      setReferenceSheet(null);

      if (res.data.success) {
        toast.success("Question paper uploaded!");
        fetchPapers();
        fetchStats();
      } else {
        toast.error(res.data.message || "Upload failed.");
      }
    } catch (error) {
      toast.error("Upload failed.");
    }
    setUploading(false);
  };

  const handleEvaluatePaper = (paperId) => {
    setSelectedPaperId(paperId);
    setShowAnswerModal(true);
    setAnswerSheets([]);
    setProgress(0);
  };

  const handleUploadAnswerSheets = async () => {
    if (answerSheets.length === 0) {
      toast.error("Please upload at least one answer sheet.");
      return;
    }
    setEvaluating(true);
    let completed = 0;
    let failedCount = 0;
    for (const answerSheet of answerSheets) {
      const formData = new FormData();
      formData.append("questionPaperId", selectedPaperId);
      formData.append("answerSheet", answerSheet);
      try {
        await axios.post("/v1/upload-answers", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("institute-auth")}`,
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(
              Math.round(((completed + percent / 100) / answerSheets.length) * 100)
            );
          },
        });
        completed++;
        setProgress(Math.round((completed / answerSheets.length) * 100));
      } catch (error) {
        failedCount++;
        const detail = error?.response?.data?.detail || `Upload failed for ${answerSheet.name}`;
        toast.error(detail);
      }
    }
    setEvaluating(false);
    setShowAnswerModal(false);
    setAnswerSheets([]);
    setProgress(0);
    if (failedCount === 0) {
      toast.success("Answer sheets evaluated!");
    } else if (completed > 0) {
      toast.warn(`${completed} evaluated, ${failedCount} failed.`);
    }
    fetchStats();
    fetchPapers();
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatRelativeTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diffInMinutes = Math.floor((now - d) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    return formatDate(iso);
  };

  const handleViewPaper = (paper) => {
    setPaperDetails(paper);
    setShowPaperModal(true);
  };

  const handleShowCorrectedSheets = async (paper) => {
    setSelectedCorrectedPaper(paper);
    setShowCorrectedModal(true);
    setCorrectedSheets([]);
    setExpandedSheets({});
    try {
      const res = await axios.get(`/v1/get-answer-sheets/${paper.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("institute-auth")}`,
        },
      });
      setCorrectedSheets(res.data.answerSheets || []);
    } catch {
      toast.error("Failed to fetch corrected answer sheets.");
    }
  };

  const handleToggleSheetDetails = async (sheet) => {
    const sheetId = sheet.id;
    // Toggle off if already expanded
    if (expandedSheets[sheetId]) {
      setExpandedSheets((prev) => {
        const copy = { ...prev };
        delete copy[sheetId];
        return copy;
      });
      return;
    }

    // Show a quick inline summary from existing data
    setExpandedSheets((prev) => ({
      ...prev,
      [sheetId]: {
        studentName: sheet.studentName || null,
        studentId: sheet.studentId || null,
        totalMarks: sheet.totalMarks ?? null,
        submittedOn: sheet.submittedOn,
      },
    }));

    // Try to fetch full marksheet in background — if it fails, show an error toaster
    try {
      setLoadingSheets((prev) => [...prev, sheetId]);
      const res = await axios.get(`/v1/get-answer-sheet-details/${sheetId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("institute-auth")}`,
        },
      });
      if (res.data && res.data.answerSheet) {
        setExpandedSheets((prev) => ({ ...prev, [sheetId]: res.data.answerSheet }));
      } else {
        toast.error("Failed to load marksheet.");
      }
    } catch (err) {
      toast.error("Failed to load marksheet.");
    } finally {
      setLoadingSheets((prev) => prev.filter((id) => id !== sheetId));
    }
  };

  const handleReEvaluate = async (paperId) => {
    setReEvaluating(true);
    try {
      const res = await axios.post(`/v1/re-parse-paper/${paperId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("institute-auth")}`,
        },
      });
      if (res.data.success) {
        toast.success(res.data.message || "Re-evaluation complete!");
        // Refresh the data
        await fetchPapers();
        // Refresh corrected sheets view
        const updatedPapers = (await axios.get("/v1/get-all-question-paper-details", {
          headers: { Authorization: `Bearer ${localStorage.getItem("institute-auth")}` },
        })).data.papers || [];
        const updatedPaper = updatedPapers.find(p => p.id === paperId);
        if (updatedPaper) {
          setSelectedCorrectedPaper(updatedPaper);
          setPaperDetails(updatedPaper);
        }
        // Refresh corrected sheets list
        const sheetsRes = await axios.get(`/v1/get-answer-sheets/${paperId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("institute-auth")}` },
        });
        setCorrectedSheets(sheetsRes.data.answerSheets || []);
        setExpandedSheets({});
        fetchStats();
      } else {
        toast.error(res.data.message || "Re-evaluation failed.");
      }
    } catch (err) {
      toast.error("Re-evaluation failed: " + (err?.response?.data?.detail || err.message));
    }
    setReEvaluating(false);
  };

  const handleDeletePaper = async (paperId) => {
    if (!window.confirm("Are you sure you want to completely delete this question paper and all its evaluations?")) {
      return;
    }
    try {
      const res = await axios.delete(`/v1/delete-paper/${paperId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("institute-auth")}`,
        },
      });
      if (res.data.success) {
        toast.success("Question paper deleted successfully!");
        fetchPapers();
        fetchStats();
      } else {
        toast.error(res.data.message || "Failed to delete paper.");
      }
    } catch (err) {
      toast.error("Failed to delete paper: " + (err?.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full mb-8">
            <FileText className="h-4 w-4 text-white" />
            <span className="text-sm text-gray-300">Your Question Papers</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-5xl mx-auto mb-8">
            Dashboard
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Manage your question papers and evaluations.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-3 px-6 py-3 text-white font-semibold rounded-xl bg-gray-800/50 border border-gray-700 hover:border-white transition-all duration-200 mx-auto"
          >
            <Upload size={20} />
            <span>Upload Question Paper</span>
          </motion.button>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Total Question Papers</h3>
            <p className="text-4xl font-extrabold text-green-400">{stats.totalQuestionPapers}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Total Answer Sheets Corrected</h3>
            <p className="text-4xl font-extrabold text-blue-400">{stats.totalAnswerSheetsCorrected}</p>
          </div>
        </div>

        <div className="mt-16">
          {loading && !papers.length && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="animate-spin text-white mx-auto mb-4" size={48} />
                <p className="text-gray-400">Loading question papers...</p>
              </div>
            </div>
          )}

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper, index) => {
              const Icon = LucideIcons[paper.icon] || FileText;
              return (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group bg-gray-900/50 border border-gray-800 hover:border-gray-700 rounded-xl p-8 transition-all h-full cursor-pointer"
                  onClick={() => handleShowCorrectedSheets(paper)}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gray-700 transition-colors duration-300">
                      <Icon size={32} className="text-white" />
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-300 mb-2 line-clamp-2 group-hover:text-white transition-colors">
                      {paper.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      {paper.createdOn ? formatRelativeTime(paper.createdOn) : ""}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Ready for evaluation</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => { e.stopPropagation(); handleEvaluatePaper(paper.id); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold bg-white text-black rounded-xl hover:bg-gray-200 transition-all duration-200"
                    >
                      <Plus size={16} />
                      Evaluate
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); handleViewPaper(paper); }}
                      className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-all duration-200"
                    >
                      <Eye size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); handleDeletePaper(paper.id); }}
                      className="p-3 bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl transition-all duration-200"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {papers.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="p-8 bg-gray-900/50 rounded-3xl border border-gray-800 max-w-md mx-auto">
                <FileText size={64} className="text-white mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-3">No Question Papers Yet</h3>
                <p className="text-gray-400 mb-6">Upload your first question paper to get started with automated grading</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200"
                >
                  <Upload size={20} />
                  Upload Now
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700 relative"
            >
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Upload New Paper</h2>
                <p className="text-gray-400">Upload both question paper and reference sheet</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-3">
                    Question Paper (PDF)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setQuestionPaper(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-white transition-colors">
                      <FileText className="text-gray-400 mx-auto mb-2" size={32} />
                      <p className="text-gray-400 text-sm">
                        {questionPaper ? questionPaper.name : "Click to select question paper"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-3">
                    Reference/Answer Sheet (PDF)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setReferenceSheet(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-white transition-colors">
                      <FileText className="text-gray-400 mx-auto mb-2" size={32} />
                      <p className="text-gray-400 text-sm">
                        {referenceSheet ? referenceSheet.name : "Click to select reference sheet"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUploadQuestionPaper}
                disabled={uploading || !questionPaper || !referenceSheet}
                className={`mt-8 w-full flex items-center justify-center gap-3 px-6 py-4 text-white font-semibold rounded-xl transition-all duration-200 ${uploading || !questionPaper || !referenceSheet
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-white text-black hover:bg-gray-200 shadow-lg hover:shadow-xl"
                  }`}
              >
                {uploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Upload Papers
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAnswerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 relative"
            >
              <button
                onClick={() => setShowAnswerModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Upload Answer Sheets</h2>
                <p className="text-gray-400">Select multiple answer sheets for evaluation</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-3">
                    Answer Sheets (Multiple PDFs)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={(e) => setAnswerSheets(Array.from(e.target.files))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-white transition-colors">
                      <Upload className="text-gray-400 mx-auto mb-2" size={32} />
                      <p className="text-gray-400 text-sm">
                        {answerSheets.length > 0
                          ? `${answerSheets.length} file(s) selected`
                          : "Click to select answer sheets"
                        }
                      </p>
                    </div>
                  </div>

                  {answerSheets.length > 0 && (
                    <div className="mt-4 max-h-32 overflow-y-auto">
                      <p className="text-xs text-gray-400 mb-2">Selected files:</p>
                      {answerSheets.map((file, index) => (
                        <div key={index} className="flex items-center justify-between py-1 px-2 bg-gray-800/50 rounded text-xs text-gray-300 mb-1">
                          <span className="truncate">{file.name}</span>
                          <button
                            onClick={() => setAnswerSheets(answerSheets.filter((_, i) => i !== index))}
                            className="text-red-400 hover:text-red-300 ml-2"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {evaluating && (
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Evaluating...</span>
                      <span className="text-sm text-white font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUploadAnswerSheets}
                disabled={evaluating || answerSheets.length === 0}
                className={`mt-8 w-full flex items-center justify-center gap-3 px-6 py-4 text-white font-semibold rounded-xl transition-all duration-200 ${evaluating || answerSheets.length === 0
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-white text-black hover:bg-gray-200 shadow-lg hover:shadow-xl"
                  }`}
              >
                {evaluating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Upload & Evaluate
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaperModal && paperDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm overflow-y-auto flex justify-center items-start z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700 relative my-8"
            >
              <button
                onClick={() => setShowPaperModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">{paperDetails.name}</h2>
                <p className="text-gray-400 mb-2">Created: {formatDate(paperDetails.createdOn)}</p>
                <p className="text-white font-semibold mb-4">Max Marks: {paperDetails.maxMarks}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Questions</h3>
                <ul className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
                  {paperDetails.questions?.map((q, idx) => (
                    <li key={idx} className="bg-gray-800 p-4 rounded-xl">
                      <div className="font-bold text-white mb-1">{q.qNo}: {q.question}</div>
                      <div className="text-sm text-gray-300">Max Marks: {q.maxMarks}</div>
                      <div className="text-sm text-gray-300">Guidelines: {q.guidelines}</div>
                      {q.groupId && (
                        <div className="text-sm text-gray-400">Group: {q.groupId}</div>
                      )}
                      {q.isOptional && (
                        <div className="text-sm text-yellow-400">
                          Optional Group (Attempt {q.optionalCount})
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCorrectedModal && selectedCorrectedPaper && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-700 relative"
            >
              <button
                onClick={() => { setShowCorrectedModal(false); setExpandedSheets({}); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Corrected Answer Sheets for "{selectedCorrectedPaper.name}"
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Max Marks: <span className="text-white font-semibold">{selectedCorrectedPaper.maxMarks ?? 'N/A'}</span></span>
                      <span>•</span>
                      <span>Students Evaluated: <span className="text-white font-semibold">{correctedSheets.length}</span></span>
                    </div>
                  </div>
                  {correctedSheets.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); handleReEvaluate(selectedCorrectedPaper.id); }}
                      disabled={reEvaluating}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${reEvaluating ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'}`}
                    >
                      {reEvaluating ? (
                        <><Loader2 size={14} className="animate-spin" /> Re-evaluating...</>
                      ) : (
                        <><RefreshCw size={14} /> Re-evaluate All</>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
              <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
                {correctedSheets.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText size={48} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No corrected answer sheets found.</p>
                    <p className="text-gray-500 text-sm mt-1">Upload answer sheets to evaluate them.</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {correctedSheets.map((sheet) => (
                      <li
                        key={sheet.id}
                        className="bg-gray-800 p-4 rounded-xl hover:bg-gray-700 transition cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); handleToggleSheetDetails(sheet); }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-grow">
                            <div className="font-bold text-white">{sheet.studentName || sheet.studentId || "Student"}</div>
                            <div className="text-sm text-gray-400">Submitted: {formatRelativeTime(sheet.submittedOn)}</div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-xs text-gray-400">Marks Obtained</div>
                            <div className="text-lg font-bold">
                              {sheet.totalMarks != null ? (
                                <span className={
                                  selectedCorrectedPaper.maxMarks && sheet.totalMarks >= selectedCorrectedPaper.maxMarks * 0.7
                                    ? 'text-green-400'
                                    : selectedCorrectedPaper.maxMarks && sheet.totalMarks >= selectedCorrectedPaper.maxMarks * 0.4
                                      ? 'text-yellow-400'
                                      : 'text-red-400'
                                }>
                                  {sheet.totalMarks}<span className="text-gray-500 text-sm font-normal">/{selectedCorrectedPaper.maxMarks ?? '?'}</span>
                                </span>
                              ) : (
                                <span className="text-gray-500 text-sm">Pending</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {expandedSheets[sheet.id] && (
                          <div className="bg-gray-900/60 p-4 rounded-xl mt-4 text-sm text-gray-300 border border-gray-700/50">
                            {loadingSheets.includes(sheet.id) ? (
                              <div className="flex items-center justify-center gap-2 text-gray-400 py-4">
                                <Loader2 size={16} className="animate-spin" /> Loading evaluation details...
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                                  <div>
                                    <div className="text-gray-400 text-xs mb-1">Student</div>
                                    <div className="text-white font-semibold">{expandedSheets[sheet.id].studentName}</div>
                                  </div>
                                  <div className="flex gap-6">
                                    <div className="text-center">
                                      <div className="text-gray-400 text-xs mb-1">Max Marks</div>
                                      <div className="text-xl font-bold text-gray-300">
                                        {selectedCorrectedPaper.maxMarks ?? 'N/A'}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-gray-400 text-xs mb-1">Marks Obtained</div>
                                      <div className={`text-2xl font-bold ${
                                        selectedCorrectedPaper.maxMarks && (expandedSheets[sheet.id].totalMarks ?? 0) >= selectedCorrectedPaper.maxMarks * 0.7
                                          ? 'text-green-400'
                                          : selectedCorrectedPaper.maxMarks && (expandedSheets[sheet.id].totalMarks ?? 0) >= selectedCorrectedPaper.maxMarks * 0.4
                                            ? 'text-yellow-400'
                                            : 'text-red-400'
                                      }`}>
                                        {expandedSheets[sheet.id].totalMarks ?? 'N/A'}
                                        <span className="text-gray-500 text-sm font-normal">/{selectedCorrectedPaper.maxMarks ?? '?'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {expandedSheets[sheet.id].evaluation && expandedSheets[sheet.id].evaluation.length > 0 ? (
                                  <div className="space-y-3">
                                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Question-wise Breakdown</div>
                                    {expandedSheets[sheet.id].evaluation.map((ev, idx) => (
                                      <div key={idx} className="bg-gray-800/80 p-4 rounded-lg space-y-2">
                                        <div className="flex items-start justify-between">
                                          <div className="font-semibold text-white text-sm flex-grow pr-3">
                                            Q{ev.questionNumber}{ev.question ? `: ${ev.question}` : ''}
                                          </div>
                                          <div className={`text-sm font-bold whitespace-nowrap ml-2 px-3 py-1 rounded-lg ${(ev.marksAwarded ?? ev.marksObtained ?? 0) === (ev.maxMarks ?? 0)
                                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                              : (ev.marksAwarded ?? ev.marksObtained ?? 0) === 0
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                            }`}>
                                            {ev.marksAwarded ?? ev.marksObtained ?? 0}/{ev.maxMarks ?? 0}
                                          </div>
                                        </div>
                                        {ev.comments && ev.comments !== "No comments" && (
                                          <div className="space-y-1.5 mt-2 pl-2 border-l-2 border-gray-700">
                                            {ev.comments.split(' | ').map((comment, cIdx) => {
                                              const isDeduction = comment.startsWith('Deduction:');
                                              const isFullMarks = comment.startsWith('Full Marks:');
                                              const isTips = comment.startsWith('Tips:');
                                              return (
                                                <p key={cIdx} className={`text-xs leading-relaxed ${
                                                  isDeduction ? 'text-red-400' : isFullMarks ? 'text-green-400' : isTips ? 'text-blue-400' : 'text-gray-400'
                                                }`}>
                                                  {isDeduction && <span className="font-semibold">⚠ </span>}
                                                  {isFullMarks && <span className="font-semibold">✓ </span>}
                                                  {isTips && <span className="font-semibold">💡 </span>}
                                                  {comment}
                                                </p>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4">
                                    <p className="text-gray-500 text-sm">No question-wise evaluation details available.</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
