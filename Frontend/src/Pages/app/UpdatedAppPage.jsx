import { useState } from "react";
import { Upload, Loader2, X, ArrowLeft, FileText, Plus, Eye, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useFileUpload } from "../../lib/useFileUpload";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

function UpdatedAppPage() {
  const [questionPaper, setQuestionPaper] = useState(null);
  const [referenceSheet, setReferenceSheet] = useState(null);
  const [answerSheets, setAnswerSheets] = useState([]);
  const [questionPaperId, setQuestionPaperId] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showAnswerUpload, setShowAnswerUpload] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [showExistingPapers, setShowExistingPapers] = useState(false);

  const [existingPapers, setExistingPapers] = useState([]);
  const [isLoadingPapers, setIsLoadingPapers] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const {
    uploadProgress: progress,
    uploadStatus: processingStep,
    isUploading,
    uploadSingleFile,
    uploadMultipleFiles,
    setUploadStatus: setProcessingStep
  } = useFileUpload();

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 4000);
  };

  const handleUploadQuestionPaper = async () => {
    if (!questionPaper || !referenceSheet) {
      showToast("Please upload both the question paper and the reference sheet.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("questionPaper", questionPaper);
    formData.append("referenceSheet", referenceSheet);

    setIsProcessing(true);

    try {
      const headers = {
        "Authorization": `Bearer ${localStorage.getItem("institute-auth")}`
      };

      const response = await uploadSingleFile(
        "/v1/upload",
        formData,
        headers
      );

      if (response.data.success) {
        setQuestionPaperId(response.data.questionPaperId);
        setShowAnswerUpload(true);
        showToast("Question paper uploaded successfully!", "success");
      } else {
        showToast(response.data.message || "Failed to upload question paper.", "error");
      }

    } catch (err) {
      const errorMsg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || "An error occurred during the upload.";
      showToast(errorMsg, "error");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const handleUploadAnswerSheets = async () => {
    if (answerSheets.length === 0) {
      showToast("Please upload at least one answer sheet.", "error");
      return;
    }

    setIsProcessing(true);

    try {
      const headers = {
        "Authorization": `Bearer ${localStorage.getItem("institute-auth")}`
      };

      const prepareFormData = (file) => {
        const formData = new FormData();
        formData.append("questionPaperId", questionPaperId);
        formData.append("answerSheet", file);
        return formData;
      };

      await uploadMultipleFiles(
        "/v1/upload-answers",
        answerSheets,
        prepareFormData,
        headers,
        (file, response, index) => {
          showToast(`Processed ${file.name} (${index + 1}/${answerSheets.length})`, "success");
        }
      );

      setShowFinalModal(true);
      showToast("All answer sheets processed successfully!", "success");
    } catch (err) {
      showToast("An error occurred during processing.", "error");
    } finally {
      setIsProcessing(false);
    }

    setIsProcessing(false);
    setShowFinalModal(true);
    setProcessingStep("");
    showToast("All answer sheets processed successfully!", "success");
  };

  const handleShowExistingPapers = async () => {
    setIsLoadingPapers(true);
    try {
      const response = await axios.get("/v1/get-question-papers", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("institute-auth")}`
        }
      });

      setExistingPapers(response.data.papers || []);
      setShowExistingPapers(true);
    } catch (err) {
      showToast("Failed to fetch existing papers.", "error");
    } finally {
      setIsLoadingPapers(false);
    }
  };

  const handleSelectPaper = async (paperId) => {
    try {
      setQuestionPaperId(paperId);
      setShowAnswerUpload(true);
      setShowExistingPapers(false);
    } catch (err) {
      showToast("Error selecting paper.", "error");
    }
  };

  const resetAll = () => {
    setShowAnswerUpload(false);
    setShowFinalModal(false);
    setQuestionPaperId(null);
    setAnswerSheets([]);
    setQuestionPaper(null);
    setReferenceSheet(null);
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.05),transparent)] opacity-50"></div>
      </div>

      <div className="relative z-10">
        {!showAnswerUpload && !showExistingPapers && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto py-12 px-4"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full mb-6"
              >
                <Upload className="h-4 w-4 text-white" />
                <span className="text-sm text-gray-300">Upload & Evaluate</span>
              </motion.div>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Upload Question Paper
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Start by uploading your question paper and reference sheet to begin the automated evaluation process
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all h-full rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600/20 border border-blue-600/30 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h2 className="text-white text-lg font-semibold">Question Paper</h2>
                          <p className="text-gray-400 text-sm">Upload the question paper (PDF format)</p>
                        </div>
                      </div>
                      {questionPaper && <span className="bg-green-600/20 text-green-400 rounded-full px-3 py-1 text-xs font-medium">Uploaded</span>}
                    </div>
                    <div className="p-4">
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => setQuestionPaper(e.target.files[0])}
                        />
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${questionPaper
                            ? 'border-green-600/50 bg-green-600/5'
                            : 'border-gray-600 hover:border-blue-500/50 hover:bg-blue-500/5'
                          }`}>
                          <Upload className={`w-12 h-12 mx-auto mb-4 ${questionPaper ? 'text-green-400' : 'text-gray-400'
                            }`} />
                          <p className={`mb-2 font-medium ${questionPaper ? 'text-green-300' : 'text-gray-300'
                            }`}>
                            {questionPaper ? questionPaper.name : "Drag and drop or click to browse"}
                          </p>
                          <p className="text-sm text-gray-500">PDF files only, up to 10MB</p>
                        </div>
                        {questionPaper && (
                          <div className="absolute top-2 right-2 z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuestionPaper(null);
                              }}
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all h-full rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600/20 border border-purple-600/30 rounded-lg flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <h2 className="text-white text-lg font-semibold">Reference Sheet</h2>
                          <p className="text-gray-400 text-sm">Upload the answer key/reference (PDF format)</p>
                        </div>
                      </div>
                      {referenceSheet && <span className="bg-green-600/20 text-green-400 rounded-full px-3 py-1 text-xs font-medium">Uploaded</span>}
                    </div>
                    <div className="p-4">
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => setReferenceSheet(e.target.files[0])}
                        />
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${referenceSheet
                            ? 'border-green-600/50 bg-green-600/5'
                            : 'border-gray-600 hover:border-purple-500/50 hover:bg-purple-500/5'
                          }`}>
                          <Upload className={`w-12 h-12 mx-auto mb-4 ${referenceSheet ? 'text-green-400' : 'text-gray-400'
                            }`} />
                          <p className={`mb-2 font-medium ${referenceSheet ? 'text-green-300' : 'text-gray-300'
                            }`}>
                            {referenceSheet ? referenceSheet.name : "Drag and drop or click to browse"}
                          </p>
                          <p className="text-sm text-gray-500">PDF files only, up to 10MB</p>
                        </div>
                        {referenceSheet && (
                          <div className="absolute top-2 right-2 z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReferenceSheet(null);
                              }}
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <button
                  onClick={handleUploadQuestionPaper}
                  disabled={!questionPaper || !referenceSheet}
                  className="px-8 py-4 text-lg min-w-[250px] bg-blue-600 hover:bg-blue-700 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload & Continue
                </button>

                <div className="text-gray-400 text-sm">or</div>

                <button
                  onClick={handleShowExistingPapers}
                  className="px-8 py-4 text-lg min-w-[250px] border border-gray-600 hover:border-white rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Use Existing Paper
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 text-center"
              >
                <div className="bg-blue-600/5 border border-blue-600/20 max-w-2xl mx-auto rounded-xl overflow-hidden">
                  <div className="flex items-start gap-3 p-4">
                    <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-blue-300 font-medium mb-2">Tips for best results:</p>
                      <ul className="text-sm text-blue-200/80 space-y-1">
                        <li>• Ensure PDFs are clear and high-quality scans</li>
                        <li>• Question papers should be well-structured with clear numbering</li>
                        <li>• Reference sheets should contain complete model answers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {showExistingPapers && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl shadow-2xl"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Select Existing Question Paper</h2>
                    <p className="text-gray-400 mt-1">Choose from your previously uploaded question papers</p>
                  </div>
                  <button
                    onClick={() => setShowExistingPapers(false)}
                    className="text-gray-400 hover:text-white p-2 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  {isLoadingPapers ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-white mr-3" />
                      <span className="text-gray-300">Loading your question papers...</span>
                    </div>
                  ) : existingPapers.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Question Papers Found</h3>
                      <p className="text-gray-400 mb-6">You haven't uploaded any question papers yet.</p>
                      <button onClick={() => setShowExistingPapers(false)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all">
                        Upload Your First Paper
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {existingPapers.map((paper) => (
                        <div
                          key={paper.id}
                          className="bg-gray-800/50 border-gray-700 hover:border-white/50 transition-all cursor-pointer rounded-lg overflow-hidden"
                          onClick={() => handleSelectPaper(paper.id)}
                        >
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">
                                  {paper.name || `Question Paper #${paper.id}`}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  Created: {new Date(paper.createdOn).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="text-gray-400">
                              <Plus className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {showAnswerUpload && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto py-12 px-4"
          >
            <div className="max-w-5xl mx-auto">
              <button
                onClick={resetAll}
                className="mb-8 text-gray-400 hover:text-white flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Question Paper Upload
              </button>

              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-600/30 rounded-full mb-6"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-300">Question Paper Ready</span>
                </motion.div>

                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  Upload Answer Sheets
                </h1>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Now upload the student answer sheets for automated evaluation and grading
                </p>
              </div>

              <div className="bg-gray-900/50 border-gray-800 mb-8 rounded-xl overflow-hidden">
                <div className="p-8">
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => setAnswerSheets(Array.from(e.target.files))}
                    />
                    <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${answerSheets.length > 0
                        ? 'border-green-600/50 bg-green-600/5'
                        : 'border-gray-600 hover:border-blue-500/50 hover:bg-blue-500/5'
                      }`}>
                      <Upload className={`w-16 h-16 mx-auto mb-6 ${answerSheets.length > 0 ? 'text-green-400' : 'text-gray-400'
                        }`} />
                      <h3 className={`text-xl font-semibold mb-2 ${answerSheets.length > 0 ? 'text-green-300' : 'text-white'
                        }`}>
                        {answerSheets.length > 0
                          ? `${answerSheets.length} Answer Sheet${answerSheets.length > 1 ? 's' : ''} Selected`
                          : 'Drop Answer Sheets Here'
                        }
                      </h3>
                      <p className="text-gray-400 mb-4">
                        Select multiple PDF files or drag and drop them here
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF files only • Multiple selection supported • Up to 50 files
                      </p>
                    </div>
                  </div>

                  {answerSheets.length > 0 && (
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">Selected Files ({answerSheets.length})</h4>
                        <button
                          onClick={() => setAnswerSheets([])}
                          className="text-red-400 hover:text-red-300"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {answerSheets.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg group hover:bg-gray-800 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-gray-400" />
                              <div>
                                <span className="text-gray-300 font-medium block truncate max-w-xs">{file.name}</span>
                                <span className="text-gray-500 text-sm">
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setAnswerSheets(answerSheets.filter((_, i) => i !== idx))
                              }
                              className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex justify-end">
                    <div className="text-center">
                      <button
                        onClick={handleUploadAnswerSheets}
                        disabled={answerSheets.length === 0}
                        className="px-8 py-4 text-lg text-black bg-white hover:bg-gray-300 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Process {answerSheets.length} Answer Sheet{answerSheets.length > 1 ? 's' : ''}
                      </button>
                      {answerSheets.length > 0 && (
                        <p className="text-sm text-gray-400 mt-2">
                          This will take approximately {Math.ceil(answerSheets.length * 0.5)} minute{Math.ceil(answerSheets.length * 0.5) > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl"
              >
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-blue-600/20 border border-blue-600/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-2">
                    Processing Files
                  </h2>
                  <p className="text-gray-400 mb-6">
                    {processingStep || "Please wait while we process your files..."}
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    Please don't close this window during processing
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFinalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl"
              >
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-green-600/20 border border-green-600/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-4">
                    Processing Complete!
                  </h2>
                  <p className="text-gray-300 mb-8 leading-relaxed">
                    All {answerSheets.length} answer sheet{answerSheets.length > 1 ? 's have' : ' has'} been successfully evaluated.
                    You can now view the results and analytics in your dashboard.
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowFinalModal(false);
                        window.location.href = '/dashboard';
                      }}
                      className="w-full px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                    >
                      View Results Dashboard
                    </button>
                    <button
                      onClick={resetAll}
                      className="w-full px-8 py-4 text-lg border border-gray-600 hover:border-white rounded-lg transition-all"
                    >
                      Process More Sheets
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {toast.show && (
          <div className={`fixed bottom-4 right-4 max-w-xs w-full p-4 rounded-lg shadow-lg transition-all 
            ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {toast.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
              <button
                onClick={() => setToast({ show: false, message: "", type: "info" })}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdatedAppPage;
