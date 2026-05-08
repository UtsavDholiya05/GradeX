import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { GalleryVerticalEnd } from "lucide-react";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const tableVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.5 },
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("/v1/get-history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("institute-auth")}`,
          },
        });
        setHistoryData(response.data.papers || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

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
            <GalleryVerticalEnd className="h-4 w-4 text-white" />
            <span className="text-sm text-gray-300">Your Evaluation History</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-5xl mx-auto mb-8">
            Past Submissions
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            A list of all the documents you've submitted for evaluation. You can review and download results here.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center text-gray-400">Loading history...</div>
        ) : historyData.length === 0 ? (
          <div className="text-center text-gray-400">No history found.</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-4xl mx-auto bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-800">
                  <tr className="bg-gray-800">
                    <th className="px-6 py-4 font-semibold text-gray-300">Title</th>
                    <th className="px-6 py-4 font-semibold text-gray-300">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((paper, index) => (
                    <motion.tr
                      key={index}
                      variants={tableVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom={index}
                      className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-300">{paper.name}</td>
                      <td className="px-6 py-4 text-gray-400">
                        {formatDistanceToNow(new Date(paper.createdOn), { addSuffix: true })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default History;
