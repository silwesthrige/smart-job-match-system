import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { ProgressBar } from "../components/ProgressBar";
import { motion } from "motion/react";
import { MapPin, DollarSign, Briefcase, Filter, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const jobs = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechCorp Inc.",
    location: "Remote",
    type: "Full-time",
    salary: "$120k - $160k",
    match: 94,
    posted: "2 days ago",
    skills: ["React", "TypeScript", "Node.js"],
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$110k - $150k",
    match: 89,
    posted: "1 week ago",
    skills: ["React", "Python", "AWS"],
  },
  {
    id: 3,
    title: "Frontend Developer",
    company: "DesignHub",
    location: "New York, NY",
    type: "Full-time",
    salary: "$100k - $140k",
    match: 87,
    posted: "3 days ago",
    skills: ["React", "CSS", "JavaScript"],
  },
  {
    id: 4,
    title: "JavaScript Engineer",
    company: "CloudSoft",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$95k - $130k",
    match: 85,
    posted: "5 days ago",
    skills: ["JavaScript", "Node.js", "MongoDB"],
  },
  {
    id: 5,
    title: "React Native Developer",
    company: "MobileFirst",
    location: "Remote",
    type: "Contract",
    salary: "$90k - $120k",
    match: 82,
    posted: "1 day ago",
    skills: ["React Native", "TypeScript", "Firebase"],
  },
  {
    id: 6,
    title: "Web Developer",
    company: "WebAgency",
    location: "Boston, MA",
    type: "Full-time",
    salary: "$80k - $110k",
    match: 78,
    posted: "1 week ago",
    skills: ["HTML", "CSS", "JavaScript"],
  },
];

export function JobMatchesPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredJobs = selectedType
    ? jobs.filter((job) => job.type === selectedType)
    : jobs;

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
                <Filter size={20} />
                Filters
              </Button>
            </div>

            {/* Filters */}
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Card hover={false}>
                  <h3 className="font-semibold text-gray-900 mb-4">Filter by Job Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Full-time", "Part-time", "Contract", "Remote"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(selectedType === type ? null : type)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          selectedType === type
                            ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                            : "bg-white text-gray-700 border-gray-300 hover:border-[#4F46E5]"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Job Cards */}
            <div className="space-y-4">
              {filteredJobs.map((job, index) => (
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
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {job.title}
                            </h3>
                            <p className="text-gray-600">{job.company}</p>
                          </div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                            <CheckCircle size={16} />
                            <span className="font-semibold">{job.match}% Match</span>
                          </div>
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
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <DollarSign size={16} />
                            <span className="text-sm">{job.salary}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.map((skill, idx) => (
                            <Tag key={idx} text={skill} variant="info" />
                          ))}
                        </div>

                        <ProgressBar
                          percentage={job.match}
                          color={job.match >= 90 ? "#10b981" : job.match >= 80 ? "#4F46E5" : "#06B6D4"}
                        />

                        <p className="text-sm text-gray-500 mt-3">Posted {job.posted}</p>
                      </div>

                      <div className="flex flex-col gap-3 md:min-w-[180px]">
                        <Link to={`/jobs/${job.id}`}>
                          <Button className="w-full">View Details</Button>
                        </Link>
                        <Button variant="outline" className="w-full">
                          Quick Apply
                        </Button>
                        <Button variant="ghost" className="w-full">
                          Save
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-8 text-center">
              <Button variant="outline" size="lg">
                Load More Jobs
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
