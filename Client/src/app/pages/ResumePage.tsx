import { Link } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { motion } from "motion/react";
import { Upload, FileText, CheckCircle, X, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { uploadCV, findGlobalJobs, getSkillGap, getCV, deleteCV } from "../../api";
import { toast } from "sonner";

export function ResumePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [cvSkillsState, setCvSkillsState] = useState<string[]>([]);

  // Load existing CV state on mount
  useEffect(() => {
    async function init() {
      try {
        const cv = await getCV();
        if (cv) {
          setUploadedFile(cv.filename);
          setCvSkillsState(cv.extracted_data?.skills || []);
          const last = localStorage.getItem("last_matches");
          if (last) {
            try {
              setMatches(JSON.parse(last));
            } catch {
              // ignore corrupt cache
            }
          }
        }
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileUpload(files[0]);
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error("Please upload a PDF or Word document (.pdf, .doc, .docx)");
      return;
    }

    setUploadedFile(file.name);
    setIsProcessing(true);
    setProgress(10);

    try {
      // Step 1: Upload & parse CV
      const up = await uploadCV(file);
      setProgress(35);
      localStorage.setItem("cv_id", up.cv_id);
      toast.info("CV parsed. Fetching matching jobs from APIs...");

      // Step 2: Fetch jobs from free APIs and compute matches
      const res = await findGlobalJobs(20);
      setProgress(70);
      const foundMatches = res.matches || [];
      localStorage.setItem("last_matches", JSON.stringify(foundMatches));
      setMatches(foundMatches);

      // Step 3: Get skill gap analysis
      const sg = await getSkillGap();
      setCvSkillsState(sg.cv_skills || []);
      setProgress(100);

      toast.success(`Found ${foundMatches.length} matching jobs!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Upload or matching failed. Please try again.");
      // Reset on failure so user can retry
      setUploadedFile(null);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  // FIX: Actually delete CV from backend, not just clear local state
  const handleRemoveCV = async () => {
    try {
      await deleteCV();
      setUploadedFile(null);
      setCvSkillsState([]);
      setMatches([]);
      localStorage.removeItem("last_matches");
      localStorage.removeItem("cv_id");
      toast.success("Resume removed.");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove resume.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <Loader2 className="animate-spin text-[#4F46E5]" size={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Resume</h1>
              <p className="text-gray-600">
                Upload your resume to get matched with jobs from Remotive, The Muse, and more
              </p>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card hover={false}>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                    isDragging
                      ? "border-[#4F46E5] bg-[#4F46E5]/5"
                      : "border-gray-300 hover:border-[#4F46E5]"
                  }`}
                >
                  {!uploadedFile ? (
                    <>
                      <div className="w-20 h-20 bg-[#4F46E5]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Upload className="text-[#4F46E5]" size={40} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Drop your resume here
                      </h3>
                      <p className="text-gray-600 mb-2">
                        or click to browse from your computer
                      </p>
                      <p className="text-sm text-gray-400 mb-6">
                        Supported formats: PDF, DOC, DOCX
                      </p>
                      <input
                        type="file"
                        id="resume-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                        }}
                      />
                      <label htmlFor="resume-upload">
                        <Button as="span" className="cursor-pointer">
                          <Upload size={20} /> Choose File
                        </Button>
                      </label>
                    </>
                  ) : (
                    <div>
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        {isProcessing ? (
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
                        ) : (
                          <CheckCircle className="text-green-600" size={40} />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {isProcessing ? "Processing…" : "Analysis Complete!"}
                      </h3>
                      <p className="text-gray-600 mb-4">{uploadedFile}</p>

                      {isProcessing && (
                        <div className="w-full max-w-md mx-auto mb-6">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.4 }}
                              className="h-full bg-[#4F46E5]"
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
                        </div>
                      )}

                      {!isProcessing && (
                        <div className="flex gap-3 justify-center">
                          {/* FIX: calls deleteCV() on backend, not just local state clear */}
                          <Button variant="outline" onClick={handleRemoveCV}>
                            <X size={20} /> Remove
                          </Button>
                          <input
                            type="file"
                            id="resume-upload-new"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                            }}
                          />
                          <label htmlFor="resume-upload-new">
                            <Button as="span" className="cursor-pointer">
                              Upload New
                            </Button>
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {uploadedFile && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 grid md:grid-cols-2 gap-6"
              >
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="text-[#4F46E5]" size={22} /> Detected Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cvSkillsState.length > 0 ? (
                      cvSkillsState.map((s, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-[#4F46E5]/10 text-[#4F46E5] rounded-full text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">
                        No skills detected — try a more detailed resume.
                      </span>
                    )}
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Insights
                  </h3>
                  <p className="text-gray-600 text-sm">
                    We found{" "}
                    <span className="font-semibold text-gray-900">{matches.length}</span>{" "}
                    matching jobs across Remotive, The Muse, and Arbeitnow.
                  </p>
                  <Link to="/jobs" className="block mt-4">
                    <Button variant="outline" className="w-full">
                      View All Matches
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}