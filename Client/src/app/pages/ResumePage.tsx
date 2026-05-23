import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { motion } from "motion/react";
import { Upload, FileText, CheckCircle, X } from "lucide-react";
import { useState } from "react";

export function ResumePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const handleFileUpload = (file: File) => {
    setUploadedFile(file.name);
    setIsProcessing(true);
    
    // Simulate upload progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
        }, 500);
      }
    }, 200);
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

            {/* Upload Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
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
                      <p className="text-gray-600 mb-6">
                        or click to browse from your computer
                      </p>
                      <input
                        type="file"
                        id="resume-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                      <label htmlFor="resume-upload">
                        <Button as="span" className="cursor-pointer">
                          <Upload size={20} />
                          Choose File
                        </Button>
                      </label>
                      <p className="text-sm text-gray-500 mt-4">
                        Supported formats: PDF, DOC, DOCX (Max 5MB)
                      </p>
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
                        {isProcessing ? "Processing..." : "Upload Complete!"}
                      </h3>
                      <p className="text-gray-600 mb-4">{uploadedFile}</p>
                      
                      {isProcessing && (
                        <div className="w-full max-w-md mx-auto mb-6">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className="h-full bg-[#4F46E5]"
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
                        </div>
                      )}
                      
                      {!isProcessing && (
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={() => setUploadedFile(null)}>
                            <X size={20} />
                            Remove
                          </Button>
                          <input
                            type="file"
                            id="resume-replace"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload(e.target.files[0]);
                              }
                            }}
                          />
                          <label htmlFor="resume-replace">
                            <Button as="span" className="cursor-pointer">
                              <Upload size={20} />
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

            {/* Resume Preview/Analysis */}
            {uploadedFile && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 grid md:grid-cols-2 gap-6"
              >
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="text-[#4F46E5]" size={22} />
                    Extracted Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">John Doe</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">john.doe@example.com</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">+1 (555) 123-4567</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-medium text-gray-900">5 years</p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {["React", "JavaScript", "TypeScript", "Node.js", "CSS", "Git", "REST APIs", "MongoDB"].map(
                      (skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#4F46E5]/10 text-[#4F46E5] rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                  <Button className="w-full mt-6">
                    Find Matching Jobs
                  </Button>
                </Card>
              </motion.div>
            )}

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <Card hover={false}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Tips</h3>
                <ul className="space-y-2">
                  {[
                    "Use clear section headings (Education, Experience, Skills)",
                    "Include quantifiable achievements and metrics",
                    "List relevant technical skills and tools",
                    "Keep formatting simple and clean",
                    "Ensure your contact information is up to date",
                  ].map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={18} />
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
