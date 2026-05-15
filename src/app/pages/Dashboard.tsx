import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { ProgressBar } from "../components/ProgressBar";
import { Tag } from "../components/Tag";
import { motion } from "motion/react";
import { Target, Briefcase, TrendingUp, Award, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";

const topMatches = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechCorp Inc.",
    match: 94,
    location: "Remote",
    salary: "$120k - $160k",
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    match: 89,
    location: "San Francisco, CA",
    salary: "$110k - $150k",
  },
  {
    id: 3,
    title: "Frontend Developer",
    company: "DesignHub",
    match: 87,
    location: "New York, NY",
    salary: "$100k - $140k",
  },
];

const missingSkills = [
  { name: "TypeScript", priority: "High" },
  { name: "GraphQL", priority: "Medium" },
  { name: "Docker", priority: "Medium" },
  { name: "AWS", priority: "Low" },
];

export function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's your job search overview</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card hover={false}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Average Match Score</p>
                      <p className="text-3xl font-bold text-[#4F46E5]">87%</p>
                      <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                        <TrendingUp size={14} />
                        +5% from last week
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-[#4F46E5]/10 rounded-full flex items-center justify-center">
                      <Target className="text-[#4F46E5]" size={24} />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card hover={false}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Job Matches</p>
                      <p className="text-3xl font-bold text-[#06B6D4]">127</p>
                      <p className="text-gray-500 text-sm mt-1">24 new this week</p>
                    </div>
                    <div className="w-12 h-12 bg-[#06B6D4]/10 rounded-full flex items-center justify-center">
                      <Briefcase className="text-[#06B6D4]" size={24} />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card hover={false}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Skills to Learn</p>
                      <p className="text-3xl font-bold text-orange-500">4</p>
                      <p className="text-gray-500 text-sm mt-1">To reach 95% match</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="text-orange-500" size={24} />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card hover={false}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Applications</p>
                      <p className="text-3xl font-bold text-green-500">12</p>
                      <p className="text-gray-500 text-sm mt-1">3 pending responses</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Award className="text-green-500" size={24} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Top Job Matches */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Top Job Matches</h2>
                  <Link to="/jobs">
                    <Button variant="ghost" className="text-[#4F46E5]">
                      View All
                      <ArrowRight size={18} />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {topMatches.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                            <p className="text-gray-600">{job.company}</p>
                          </div>
                          <div className="text-right">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                              <CheckCircle size={16} />
                              <span className="font-semibold">{job.match}% Match</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Tag text={job.location} variant="info" />
                          <Tag text={job.salary} variant="success" />
                        </div>

                        <ProgressBar percentage={job.match} color={job.match >= 90 ? "#10b981" : "#4F46E5"} />

                        <div className="flex gap-3 mt-4">
                          <Link to={`/jobs/${job.id}`} className="flex-1">
                            <Button className="w-full">View Details</Button>
                          </Link>
                          <Button variant="outline" className="flex-1">Quick Apply</Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Skill Gap & Quick Actions */}
              <div className="space-y-6">
                {/* Missing Skills */}
                <Card hover={false}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Skills to Improve</h3>
                    <Link to="/skill-gap">
                      <button className="text-[#4F46E5] text-sm hover:underline">View All</button>
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {missingSkills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{skill.name}</span>
                        <Tag
                          text={skill.priority}
                          variant={
                            skill.priority === "High"
                              ? "warning"
                              : skill.priority === "Medium"
                              ? "info"
                              : "default"
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <Link to="/skill-gap" className="block mt-4">
                    <Button variant="outline" className="w-full">
                      Start Learning
                      <ArrowRight size={18} />
                    </Button>
                  </Link>
                </Card>

                {/* Quick Actions */}
                <Card hover={false}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link to="/resume">
                      <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all">
                        <p className="font-medium text-gray-900">Update Resume</p>
                        <p className="text-sm text-gray-500">Last updated 3 days ago</p>
                      </button>
                    </Link>
                    <Link to="/jobs">
                      <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all">
                        <p className="font-medium text-gray-900">Browse Jobs</p>
                        <p className="text-sm text-gray-500">127 new matches</p>
                      </button>
                    </Link>
                    <Link to="/settings">
                      <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all">
                        <p className="font-medium text-gray-900">Profile Settings</p>
                        <p className="text-sm text-gray-500">Manage preferences</p>
                      </button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
