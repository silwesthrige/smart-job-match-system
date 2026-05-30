import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { ProgressBar } from "../components/ProgressBar";
import { motion } from "motion/react";
import { MapPin, DollarSign, Briefcase, Filter, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { getMatches } from "../../api";
import { toast } from "sonner";

export function JobMatchesPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const matches = await getMatches(50);
        const mapped = matches.map((m: any) => ({
          id: m.job_id,
          title: m.title || "Untitled",
          company: m.company || "N/A",
          location: m.location || "Remote",
          type: m.type || "Full-time",
          salary: m.salary || "N/A",
          match: Math.round((m.score || 0) * 100),
          posted: "Recently",
          skills: m.matched_skills || [],
          missing: m.missing_skills || [],
          url: m.url || "#",
        }));
        setJobs(mapped);
      } catch (err: any) {
        toast.error("Failed to load matches. Please upload your resume first.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredJobs = selectedType
    ? jobs.filter((job) => job.type === selectedType)
    : jobs;

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
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Matches</h1>
                <p className="text-gray-600">{filteredJobs.length} jobs match your profile</p>
              </div>
              <Button variant="outline" onClick={() => setFilterOpen(!filterOpen)}>
                <Filter size={20} /> Filters
              </Button>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card>
                      <div className="grid md:grid-cols-[1fr_auto] gap-6">
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
                              <p className="text-gray-600">{job.company}</p>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                              <CheckCircle size={16} />
                              <span className="font-semibold">{job.match}% Match</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <MapPin size={16} /> <span className="text-sm">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Briefcase size={16} /> <span className="text-sm">{job.type}</span>
                            </div>
                            {job.salary !== "N/A" && (
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <DollarSign size={16} /> <span className="text-sm">{job.salary}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills.map((skill: string, idx: number) => (
                              <Tag key={idx} text={skill} variant="success" />
                            ))}
                            {job.missing.slice(0, 3).map((skill: string, idx: number) => (
                              <Tag key={idx} text={skill} variant="default" />
                            ))}
                          </div>

                          <ProgressBar
                            percentage={job.match}
                            color={job.match >= 90 ? "#10b981" : job.match >= 80 ? "#4F46E5" : "#06B6D4"}
                          />
                        </div>

                        <div className="flex flex-col gap-3 md:min-w-[180px]">
                          <a href={job.url} target="_blank" rel="noreferrer">
                            <Button className="w-full">Apply Now</Button>
                          </a>
                          <Button variant="outline" className="w-full">Save</Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No matches found. Try uploading your resume or refreshing the search.</p>
                  <Link to="/resume">
                    <Button>Go to Resume Upload</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
