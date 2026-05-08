import { useState } from "react";
import { Upload, Loader2, X, ArrowBigLeft } from "lucide-react";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

function AppPage() {
  const [questionPaper, setQuestionPaper] = useState(null);
  const [referenceSheet, setReferenceSheet] = useState(null);
  const [answerSheets, setAnswerSheets] = useState([]);
  const [questionPaperId, setQuestionPaperId] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showAnswerUpload, setShowAnswerUpload] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [showExistingPapers, setShowExistingPapers] = useState(false);

  const [progress, setProgress] = useState(0);
  const [existingPapers, setExistingPapers] = useState([]);
  const [isLoadingPapers, setIsLoadingPapers] = useState(false);

  const handleUploadQuestionPaper = async () => {
    if (!questionPaper || !referenceSheet) {
      alert("Please upload both the question paper and the reference sheet.");
      return;
    }

    const formData = new FormData();
    formData.append("questionPaper", questionPaper);
    formData.append("referenceSheet", referenceSheet);

    setIsProcessing(true);

    try {
      await axios.post("/v1/upload", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem("institute-auth")}`
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        }
      }).then(response => {
        if (response.data.success) {
          setQuestionPaperId(response.data.questionPaperId);
          setShowAnswerUpload(true);
        } else {
          alert(response.data.message || "Failed to upload question paper.");
          console.log(response.data.error);
        }
      });
    } catch (err) {
      console.error("Upload failed:", err);
      alert("An error occurred during the upload.");
    } finally {
      setIsProcessing(false);
      setProgress(0); // Reset progress
    }
  };

  const handleUploadAnswerSheets = async () => {
    if (answerSheets.length === 0) {
      alert("Please upload at least one answer sheet.");
      return;
    }

    setIsProcessing(true);

    let completed = 0;
    for (const answerSheet of answerSheets) {
      const formData = new FormData();
      formData.append("questionPaperId", questionPaperId);
      formData.append("answerSheet", answerSheet);

      try {
        await axios.post("/v1/upload-answers", formData, {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${localStorage.getItem("institute-auth")}`
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(Math.round(((completed + percent / 100) / answerSheets.length) * 100));
          }
        });

        completed++;
        setProgress(Math.round((completed / answerSheets.length) * 100));
      } catch (err) {
        console.error(`Upload failed for '${answerSheet.name}':`, err);
      }
    }

    setIsProcessing(false);
    setShowFinalModal(true);
  };

  const handleShowExistingPapers = async () => {
    setIsLoadingPapers(true);
    try {
      const response = await axios.get("/v1/get-question-papers",
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("institute-auth")}`
          }
        }
      );
      
      setExistingPapers(response.data.papers || []);
      setShowExistingPapers(true);
    } catch (err) {
      alert("Failed to fetch existing papers.");
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
      alert("Error selecting paper.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative">
      {/* Question Paper and Reference Sheet Upload */}
      {!showAnswerUpload && (
        <div className="max-w-4xl mx-auto py-12 px-4">
          <h1 className="text-4xl font-bold text-center text-pink-500 mb-8">
            Upload Question Paper and Reference Sheet
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Question Paper Upload */}
            <div className="border-dashed border-2 border-gray-600 rounded-lg p-6 text-center">
              <Upload className="w-10 h-10 text-pink-500 mx-auto mb-4" />
              <p className="text-gray-300 mb-4">Drag and drop the question paper here</p>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                id="questionPaperInput"
                onChange={(e) => setQuestionPaper(e.target.files[0])}
              />
              <label
                htmlFor="questionPaperInput"
                className="cursor-pointer bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded"
              >
                Browse Files
              </label>
              {questionPaper && (
                <div className="mt-4 text-gray-300">
                  <span>{questionPaper.name}</span>
                  <button
                    onClick={() => setQuestionPaper(null)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Reference Sheet Upload */}
            <div className="border-dashed border-2 border-gray-600 rounded-lg p-6 text-center">
              <Upload className="w-10 h-10 text-pink-500 mx-auto mb-4" />
              <p className="text-gray-300 mb-4">Drag and drop the reference sheet here</p>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                id="referenceSheetInput"
                onChange={(e) => setReferenceSheet(e.target.files[0])}
              />
              <label
                htmlFor="referenceSheetInput"
                className="cursor-pointer bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded"
              >
                Browse Files
              </label>
              {referenceSheet && (
                <div className="mt-4 text-gray-300">
                  <span>{referenceSheet.name}</span>
                  <button
                    onClick={() => setReferenceSheet(null)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            className="mt-8 w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded"
            onClick={handleUploadQuestionPaper}
          >
            Proceed
          </button>
          <button
            className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
            onClick={handleShowExistingPapers}
            disabled={isLoadingPapers}
          >
            {isLoadingPapers ? "Loading..." : "Proceed with existing paper"}
          </button>

          {/* Show existing papers list */}
          {showExistingPapers && (
            <div className="mt-6 bg-gray-800 rounded p-4">
              <h3 className="text-lg font-semibold mb-2 text-pink-400">Select a Question Paper:</h3>
              {existingPapers.length === 0 ? (
                <p className="text-gray-400">No papers found.</p>
              ) : (
                <ul>
                  {existingPapers.map((paper) => (
                    <li key={paper.id} className="mb-2">
                      <button
                        className="w-full text-left bg-gray-700 hover:bg-pink-700 text-white py-2 px-4 rounded"
                        onClick={() => handleSelectPaper(paper.id)}
                      >
                        {paper.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded"
                onClick={() => setShowExistingPapers(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Answer Sheet Upload */}
      {showAnswerUpload && (
        <div className="max-w-4xl mx-auto py-12 px-4">
          {/* Back Button */}
          <button
            className="mb-6 bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded"
            onClick={() => {
              setShowAnswerUpload(false);
              setQuestionPaperId(null);
              setAnswerSheets([]);
            }}
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-center text-pink-500 mb-8">
            Upload Answer Sheets
          </h1>

          <div className="border-dashed border-2 border-gray-600 rounded-lg p-6 text-center">
            <Upload className="w-10 h-10 text-pink-500 mx-auto mb-4" />
            <p className="text-gray-300 mb-4">Drag and drop the answer sheets here</p>
            <input
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              id="answerSheetsInput"
              onChange={(e) => setAnswerSheets(Array.from(e.target.files))}
            />
            <label
              htmlFor="answerSheetsInput"
              className="cursor-pointer bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded"
            >
              Browse Files
            </label>
            {answerSheets.length > 0 && (
              <div className="mt-4 text-gray-300">
                {answerSheets.map((file, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span>{file.name}</span>
                    <button
                      onClick={() =>
                        setAnswerSheets(answerSheets.filter((_, i) => i !== idx))
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="mt-8 w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded"
            onClick={handleUploadAnswerSheets}
          >
            Upload & Process
          </button>
        </div>
      )}

      {/* Processing Modal */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6 text-center shadow-2xl">
            <Loader2 className="w-10 h-10 text-pink-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-300">
              Processing files... {progress}% completed
            </h2>
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-pink-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Final Modal */}
      {showFinalModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6 text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-pink-500 mb-4">All Answer Sheets Processed</h2>
            <p className="text-gray-300">All answer sheets have been successfully evaluated.</p>
            <button
              className="mt-6 w-full bg-pink-600 hover:bg-pink-700 transition py-2 rounded text-white font-semibold"
              onClick={() => setShowFinalModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppPage;