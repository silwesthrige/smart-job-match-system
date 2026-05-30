import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { ProgressBar } from "../components/ProgressBar";
import { motion } from "motion/react";
import { TrendingUp, BookOpen, Award, ExternalLink, Target, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { getSkillGap } from "../../api";

const learningPaths = [
  {
    title: "TypeScript Fundamentals",
    provider: "Udemy",
    duration: "12 hours",
    rating: 4.8,
    students: "45,230",
    price: "$79.99",
  },
  {
    title: "GraphQL Complete Guide",
    provider: "Coursera",
    duration: "8 weeks",
    rating: 4.7,
    students: "23,450",
    price: "$49.99/mo",
  },
  {
    title: "Docker & Kubernetes",
    provider: "Pluralsight",
    duration: "15 hours",
    rating: 4.9,
    students: "67,890",
    price: "$29.99/mo",
  },
];

export function SkillGapPage() {
  const [skillGap, setSkillGap] = useState<string[]>([]);
  const [cvSkills, setCvSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const cvId = localStorage.getItem("cv_id");
      if (!cvId) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await getSkillGap(cvId);
        setSkillGap(data.skill_gap || []);
        setCvSkills(data.cv_skills || []);
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Skill Gap Analysis</h1>
              <p className="text-gray-600">Identify and bridge skill gaps to unlock more opportunities</p>
            </div>

            {/* Overview Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
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
                      <p className="text-2xl font-bold text-gray-900">
                        {cvSkills.length > 0 ? Math.round((cvSkills.length / (cvSkills.length + skillGap.length)) * 100) : 0}%
                      </p>
                      <p className="text-gray-600">Match Percentage</p>
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
                    skillGap.map((skill, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-1 capitalize">
                                {skill}
                              </h3>
                              <p className="text-gray-600 text-sm">Required for many high-matching jobs</p>
                            </div>
                            <Tag text="High Priority" variant="warning" />
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium text-gray-900">0%</span>
                              </div>
                              <ProgressBar percentage={0} color="#94a3b8" />
                            </div>

                            <div className="pt-3 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <TrendingUp size={16} className="text-green-600" />
                                <span>Closing this gap could increase your matches significantly.</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-gray-500">No skill gaps identified. Upload your resume to see analysis.</p>
                  )}
                </div>
              </div>

              {/* Learning Paths */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Courses</h2>
                <div className="space-y-4">
                  {learningPaths.map((course, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card>
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-[#4F46E5]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="text-[#4F46E5]" size={20} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {course.title}
                            </h4>
                            <p className="text-sm text-gray-600">{course.provider}</p>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{course.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rating:</span>
                            <span className="font-medium">⭐ {course.rating}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Students:</span>
                            <span className="font-medium">{course.students}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <span className="text-lg font-bold text-[#4F46E5]">
                            {course.price}
                          </span>
                          <Button size="sm" variant="outline">
                            <ExternalLink size={16} />
                            View Course
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
