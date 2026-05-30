import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { motion } from "motion/react";
import { Upload, FileText, CheckCircle, X } from "lucide-react";
import React, { useState } from "react";
import { uploadCV, findGlobalJobs, getSkillGap } from "../../api";
import { toast } from "sonner";

export function ResumePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [cvSkillsState, setCvSkillsState] = useState<string[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file.name);
    setIsProcessing(true);
    setProgress(10);

    try {
      const up = await uploadCV(file);
      setProgress(40);
      localStorage.setItem("cv_id", up.cv_id);
      toast.info("CV parsed. Searching for matching jobs...");

      // Trigger global job search
      const res = await findGlobalJobs(20);
      setProgress(80);

      const foundMatches = res.matches || [];
      localStorage.setItem("last_matches", JSON.stringify(foundMatches));
      setMatches(foundMatches);

      // Get initial skill gap to show skills
      const sg = await getSkillGap();
      setCvSkillsState(sg.cv_skills || []);

      setProgress(100);
      toast.success("Job search and analysis complete!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Upload or matching failed.");
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Resume</h1>
              <p className="text-gray-600">Upload your resume to get matched with the best jobs</p>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card hover={false}>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                    isDragging ? "border-[#4F46E5] bg-[#4F46E5]/5" : "border-gray-300 hover:border-[#4F46E5]"
                  }`}
                >
                  {!uploadedFile ? (
                    <>
                      <div className="w-20 h-20 bg-[#4F46E5]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Upload className="text-[#4F46E5]" size={40} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Drop your resume here</h3>
                      <p className="text-gray-600 mb-6">or click to browse from your computer</p>
                      <input
                        type="file"
                        id="resume-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0]);
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
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                        ) : (
                          <CheckCircle className="text-green-600" size={40} />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {isProcessing ? "Processing Analysis..." : "Analysis Complete!"}
                      </h3>
                      <p className="text-gray-600 mb-4">{uploadedFile}</p>
                      
                      {isProcessing && (
                        <div className="w-full max-w-md mx-auto mb-6">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div animate={{ width: `${progress}%` }} className="h-full bg-[#4F46E5]" />
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
                        </div>
                      )}
                      
                      {!isProcessing && (
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={() => setUploadedFile(null)}>
                            <X size={20} /> Remove
                          </Button>
                          <Button onClick={() => setUploadedFile(null)}>Upload New</Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {uploadedFile && !isProcessing && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 grid md:grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="text-[#4F46E5]" size={22} /> Extracted Information
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Detected Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {cvSkillsState.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-[#4F46E5]/10 text-[#4F46E5] rounded-full text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
                
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
                  <p className="text-gray-600 text-sm">
                    We found {matches.length} matching jobs across various platforms based on your profile.
                  </p>
                  <Link to="/job-matches" className="block mt-4">
                    <Button variant="outline" className="w-full">View All Matches</Button>
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
