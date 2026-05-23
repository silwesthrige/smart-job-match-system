import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { ProgressBar } from "../components/ProgressBar";
import { motion } from "motion/react";
import { MapPin, DollarSign, Briefcase, Clock, CheckCircle, X, ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const jobDetails = {
  id: 1,
  title: "Senior React Developer",
  company: "TechCorp Inc.",
  location: "Remote",
  type: "Full-time",
  salary: "$120k - $160k",
  match: 94,
  posted: "2 days ago",
  description: `We are looking for an experienced React Developer to join our growing team. You will be responsible for developing and implementing user interface components using React concepts and workflows such as Redux, Flux, and Webpack.

You will also be responsible for profiling and improving front-end performance and documenting our front-end codebase. The ideal candidate should have strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model.`,
  responsibilities: [
    "Develop new user-facing features using React.js",
    "Build reusable components and front-end libraries for future use",
    "Translate designs and wireframes into high-quality code",
    "Optimize components for maximum performance across devices and browsers",
    "Collaborate with backend developers and designers",
  ],
  requiredSkills: [
    { name: "React", match: true },
    { name: "TypeScript", match: true },
    { name: "Node.js", match: true },
    { name: "GraphQL", match: false },
    { name: "Docker", match: false },
    { name: "AWS", match: true },
    { name: "Redux", match: true },
    { name: "Jest", match: true },
  ],
  benefits: [
    "Competitive salary and equity package",
    "Health, dental, and vision insurance",
    "401(k) matching",
    "Flexible work schedule",
    "Remote work options",
    "Professional development budget",
    "Unlimited PTO",
  ],
};

export function JobDetailsPage() {
  const { id } = useParams();

  const yourSkills = jobDetails.requiredSkills.filter((s) => s.match).length;
  const totalSkills = jobDetails.requiredSkills.length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <Link to="/jobs">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft size={20} />
                Back to Jobs
              </Button>
            </Link>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card hover={false}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {jobDetails.title}
                    </h1>
                    <p className="text-xl text-gray-600 mb-4">{jobDetails.company}</p>
                    
                    <div className="flex flex-wrap gap-4 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={18} />
                        <span>{jobDetails.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={18} />
                        <span>{jobDetails.type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={18} />
                        <span>{jobDetails.salary}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={18} />
                        <span>Posted {jobDetails.posted}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full mb-4">
                      <CheckCircle size={20} />
                      <span className="text-lg font-semibold">{jobDetails.match}% Match</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button size="lg" className="flex-1">
                    Apply Now
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1">
                    Save Job
                  </Button>
                </div>
              </Card>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6 mt-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card hover={false}>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {jobDetails.description}
                    </p>
                  </Card>
                </motion.div>

                {/* Responsibilities */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card hover={false}>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Responsibilities</h2>
                    <ul className="space-y-3">
                      {jobDetails.responsibilities.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="text-[#4F46E5] mt-0.5 flex-shrink-0" size={18} />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card hover={false}>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Benefits</h2>
                    <div className="grid md:grid-cols-2 gap-3">
                      {jobDetails.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                          <span className="text-gray-700 text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Match Score Breakdown */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Score</h3>
                    <div className="text-center mb-4">
                      <div className="text-5xl font-bold text-green-600 mb-2">
                        {jobDetails.match}%
                      </div>
                      <p className="text-gray-600">Excellent Match!</p>
                    </div>
                    <ProgressBar percentage={jobDetails.match} color="#10b981" />
                  </Card>
                </motion.div>

                {/* Skills Comparison */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Skills Comparison
                    </h3>
                    <div className="mb-4">
                      <p className="text-gray-600 mb-2">
                        You have {yourSkills} of {totalSkills} required skills
                      </p>
                      <ProgressBar
                        percentage={Math.round((yourSkills / totalSkills) * 100)}
                        color="#4F46E5"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-3">Required Skills:</p>
                      {jobDetails.requiredSkills.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm text-gray-900">{skill.name}</span>
                          {skill.match ? (
                            <CheckCircle className="text-green-500" size={18} />
                          ) : (
                            <X className="text-red-500" size={18} />
                          )}
                        </div>
                      ))}
                    </div>
                    <Link to="/skill-gap" className="block mt-4">
                      <Button variant="outline" className="w-full">
                        Improve Skills
                      </Button>
                    </Link>
                  </Card>
                </motion.div>

                {/* Company Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card hover={false}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About Company</h3>
                    <p className="text-gray-700 text-sm mb-4">
                      TechCorp Inc. is a leading technology company specializing in innovative software solutions.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Industry:</span>
                        <span className="font-medium">Technology</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company Size:</span>
                        <span className="font-medium">500-1000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Founded:</span>
                        <span className="font-medium">2015</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
