import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { ProgressBar } from "../components/ProgressBar";
import { motion } from "motion/react";
import { TrendingUp, BookOpen, Award, ExternalLink, Target, Loader2, Upload } from "lucide-react";
import React, { useState, useEffect } from "react";
import { getSkillGap } from "../../api";
import { Link, useNavigate } from "react-router-dom";

export function SkillGapPage() {
  const [skillGap, setSkillGap] = useState<any[]>([]);
  const [cvSkills, setCvSkills] = useState<string[]>([]);
  // FIX: use API recommendations instead of hardcoded courses
  const [recommendations, setRecommendations] = useState<{ title: string; url: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noCv, setNoCv] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getSkillGap();
        setSkillGap(data.skill_gap || []);
        setCvSkills(data.cv_skills || []);
        setRecommendations(data.recommendations || []);
      } catch (e: any) {
        if (e.message.includes("Unauthorized")) {
          navigate("/login");
          return;
        }
        if (e.message.includes("404") || e.message.includes("CV not found")) {
          setNoCv(true);
        } else {
          console.error(e);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <Loader2 className="animate-spin text-[#4F46E5]" size={48} />
      </div>
    );
  }

  if (noCv) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <Card className="max-w-md text-center p-12">
              <div className="w-20 h-20 bg-[#4F46E5]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="text-[#4F46E5]" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Resume Found</h2>
              <p className="text-gray-600 mb-8">
                Upload your resume to see personalised skill gap analysis and course recommendations.
              </p>
              <Link to="/resume">
                <Button className="w-full">Go to Resume Upload</Button>
              </Link>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const matchPct =
    cvSkills.length > 0
      ? Math.round((cvSkills.length / (cvSkills.length + skillGap.length)) * 100)
      : 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Skill Gap Analysis</h1>
              <p className="text-gray-600">
                Identify and bridge skill gaps to unlock more opportunities
              </p>
            </div>

            {/* Overview Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card hover={false}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Target className="text-orange-600" size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{skillGap.length}</p>
                      <p className="text-gray-600">Skills to Improve</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card hover={false}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="text-green-600" size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{cvSkills.length}</p>
                      <p className="text-gray-600">Identified Skills</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card hover={false}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Award className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{matchPct}%</p>
                      <p className="text-gray-600">Market Coverage</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Skill Gaps */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Missing Skills</h2>
                <div className="space-y-4">
                  {skillGap.length > 0 ? (
                    skillGap.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.07 }}
                      >
                        <Card>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-1 capitalize">
                                {item.skill}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                In demand across many job listings
                              </p>
                            </div>
                            <Tag
                              text={`${item.priority} Priority`}
                              variant={
                                item.priority === "High"
                                  ? "warning"
                                  : item.priority === "Medium"
                                  ? "default"
                                  : "success"
                              }
                            />
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Your current level</span>
                                <span className="font-medium text-gray-900">Not detected</span>
                              </div>
                              <ProgressBar percentage={0} color="#94a3b8" />
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <TrendingUp size={16} className="text-green-600" />
                                <span>
                                  Closing this gap could significantly boost your match score.
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <Card>
                      <p className="text-gray-500 text-center py-4">
                        🎉 No skill gaps identified — your skills are well-aligned with current listings!
                      </p>
                    </Card>
                  )}
                </div>
              </div>

              {/* FIX: Recommended Courses from API, not hardcoded */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Courses</h2>
                <div className="space-y-4">
                  {recommendations.length > 0 ? (
                    recommendations.map((course, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card>
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-[#4F46E5]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BookOpen className="text-[#4F46E5]" size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm leading-snug">
                                {course.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {new URL(course.url).hostname.replace("www.", "")}
                              </p>
                            </div>
                          </div>
                          <a href={course.url} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline" className="w-full">
                              <ExternalLink size={16} />
                              View Course
                            </Button>
                          </a>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <Card>
                      <p className="text-gray-500 text-sm text-center py-4">
                        Course recommendations will appear once skill gaps are identified.
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}