import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { ProgressBar } from "../components/ProgressBar";
import { Tag } from "../components/Tag";
import { motion } from "motion/react";
import { Target, Briefcase, TrendingUp, Award, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import React, { useState, useEffect } from "react";
import { getMatches, getSkillGap } from "../../api";

export function Dashboard() {
  const [topMatches, setTopMatches] = useState<any[]>([]);
  const [skillGap, setSkillGap] = useState<any[]>([]);
  const [cvSkillsCount, setCvSkillsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const matches = await getMatches(3);
        setTopMatches(matches.map((m: any) => ({
          id: m.job_id,
          title: m.title || "Untitled",
          company: m.company || "N/A",
          match: Math.round((m.score || 0) * 100),
          location: m.location || "Remote",
          url: m.url || "#",
        })));

        const sg = await getSkillGap();
        setSkillGap(sg.skill_gap || []);
        setCvSkillsCount(sg.cv_skills?.length || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <Loader2 className="animate-spin text-[#4F46E5]" size={48} />
      </div>
    );
  }

  const avgMatch = topMatches.length > 0 
    ? Math.round(topMatches.reduce((acc, curr) => acc + curr.match, 0) / topMatches.length) 
    : 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's your job search overview</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card hover={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Avg Top Match</p>
                    <p className="text-3xl font-bold text-[#4F46E5]">{avgMatch}%</p>
                  </div>
                  <div className="w-12 h-12 bg-[#4F46E5]/10 rounded-full flex items-center justify-center">
                    <Target className="text-[#4F46E5]" size={24} />
                  </div>
                </div>
              </Card>

              <Card hover={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Matches Found</p>
                    <p className="text-3xl font-bold text-[#06B6D4]">{topMatches.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#06B6D4]/10 rounded-full flex items-center justify-center">
                    <Briefcase className="text-[#06B6D4]" size={24} />
                  </div>
                </div>
              </Card>

              <Card hover={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Skills to Learn</p>
                    <p className="text-3xl font-bold text-orange-500">{skillGap.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="text-orange-500" size={24} />
                  </div>
                </div>
              </Card>

              <Card hover={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Skills Identified</p>
                    <p className="text-3xl font-bold text-green-500">{cvSkillsCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="text-green-500" size={24} />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Top Job Matches</h2>
                  <Link to="/job-matches">
                    <Button variant="ghost" className="text-[#4F46E5]">View All <ArrowRight size={18} /></Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {topMatches.length > 0 ? (
                    topMatches.map((job) => (
                      <Card key={job.id}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                            <p className="text-gray-600">{job.company}</p>
                          </div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                            <CheckCircle size={16} /> <span className="font-semibold">{job.match}% Match</span>
                          </div>
                        </div>
                        <ProgressBar percentage={job.match} color={job.match >= 90 ? "#10b981" : "#4F46E5"} />
                        <div className="flex gap-3 mt-4">
                          <a href={job.url} target="_blank" rel="noreferrer" className="flex-1">
                            <Button className="w-full">View Details</Button>
                          </a>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-500">No matches found yet. Upload your resume first.</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <Card hover={false}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills to Improve</h3>
                  <div className="space-y-3">
                    {skillGap.slice(0, 5).map((gap, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900 capitalize">{gap.skill}</span>
                        <Tag text={gap.priority} variant="warning" />
                      </div>
                    ))}
                  </div>
                  <Link to="/skill-gap" className="block mt-4">
                    <Button variant="outline" className="w-full">Start Learning <ArrowRight size={18} /></Button>
                  </Link>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
