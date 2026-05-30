import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { ProgressBar } from "../components/ProgressBar";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  DollarSign,
  Briefcase,
  Filter,
  CheckCircle,
  Loader2,
  Globe,
  RefreshCw,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { getMatches, getCV, findGlobalJobs } from "../../api";
import { toast } from "sonner";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Remote"];

export function JobMatchesPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasCv, setHasCv] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const cv = await getCV();
        setHasCv(!!cv);
        await loadMatches();
      } catch (err: any) {
        if (err.message.includes("Unauthorized")) {
          navigate("/login");
          return;
        }
        console.error(err);
        toast.error("Failed to load jobs. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  async function loadMatches() {
    const matches = await getMatches(50);
    const mapped = matches.map((m: any) => ({
      id: m.job_id,
      title: m.title || "Untitled",
      company: m.company || "N/A",
      location: m.location || "Remote",
      type: m.type || "Full-time",
      salary: m.salary || null,
      match: Math.round((m.score || 0) * 100),
      skills: m.matched_skills || [],
      missing: m.missing_skills || [],
      url: m.url || "#",
    }));
    setJobs(mapped);
  }

  // Refresh: re-fetch from APIs and recompute matches
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      toast.info("Fetching fresh jobs from APIs…");
      await findGlobalJobs(20);
      await loadMatches();
      toast.success("Job listings refreshed!");
    } catch (err: any) {
      toast.error(err.message || "Refresh failed.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // FIX: working multi-select filter
  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => setSelectedTypes([]);

  const filteredJobs =
    selectedTypes.length > 0
      ? jobs.filter((job) => selectedTypes.includes(job.type))
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {hasCv ? "Personalised Matches" : "Global Job Openings"}
                </h1>
                <p className="text-gray-600">
                  {hasCv
                    ? `${filteredJobs.length} jobs matched with your profile`
                    : "Showing latest opportunities. Upload your resume for personalised matching."}
                </p>
              </div>
              <div className="flex gap-3">
                {!hasCv && (
                  <Link to="/resume">
                    <Button variant="outline" className="border-[#4F46E5] text-[#4F46E5]">
                      Upload Resume
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled ={isRefreshing}
                >
                  <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                  {isRefreshing ? "Refreshing…" : "Refresh Jobs"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={filterOpen ? "bg-[#4F46E5]/10 border-[#4F46E5] text-[#4F46E5]" : ""}
                >
                  <Filter size={18} />
                  Filters
                  {selectedTypes.length > 0 && (
                    <span className="ml-1 w-5 h-5 bg-[#4F46E5] text-white rounded-full text-xs flex items-center justify-center">
                      {selectedTypes.length}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* FIX: working filter panel */}
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <Card hover={false}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Filter by Job Type</h3>
                      {selectedTypes.length > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-sm text-[#4F46E5] hover:underline flex items-center gap-1"
                        >
                          <X size={14} /> Clear all
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {JOB_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => toggleType(type)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                            selectedTypes.includes(type)
                              ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                              : "bg-white text-gray-700 border-gray-300 hover:border-[#4F46E5] hover:text-[#4F46E5]"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Job Cards */}
            <div className="space-y-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.5) }}
                  >
                    <Card>
                      <div className="grid md:grid-cols-[1fr_auto] gap-6">
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                {job.title}
                              </h3>
                              <p className="text-gray-600">{job.company}</p>
                            </div>
                            {job.match > 0 ? (
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full shrink-0">
                                <CheckCircle size={16} />
                                <span className="font-semibold">{job.match}% Match</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full shrink-0">
                                <Globe size={16} />
                                <span className="font-semibold">New Opening</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <MapPin size={16} />
                              <span className="text-sm">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Briefcase size={16} />
                              <span className="text-sm">{job.type}</span>
                            </div>
                            {job.salary && (
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <DollarSign size={16} />
                                <span className="text-sm">{job.salary}</span>
                              </div>
                            )}
                          </div>

                          {(job.skills.length > 0 || job.missing.length > 0) && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.skills.map((skill: string, idx: number) => (
                                <Tag key={`match-${idx}`} text={skill} variant="success" />
                              ))}
                              {job.missing.slice(0, 3).map((skill: string, idx: number) => (
                                <Tag key={`miss-${idx}`} text={skill} variant="default" />
                              ))}
                            </div>
                          )}

                          {job.match > 0 && (
                            <ProgressBar
                              percentage={job.match}
                              color={
                                job.match >= 80
                                  ? "#10b981"
                                  : job.match >= 60
                                  ? "#4F46E5"
                                  : "#06B6D4"
                              }
                            />
                          )}
                        </div>

                        <div className="flex flex-col gap-3 md:min-w-[160px]">
                          <a href={job.url} target="_blank" rel="noreferrer">
                            <Button className="w-full">View Details</Button>
                          </a>
                          <Button variant="outline" className="w-full">
                            Save
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16">
                  {selectedTypes.length > 0 ? (
                    <>
                      <p className="text-gray-500 mb-4">
                        No jobs match the selected filters.
                      </p>
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-500 mb-4">
                        No jobs found. Click "Refresh Jobs" to fetch the latest listings.
                      </p>
                      <Button onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                        Fetch Jobs
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}