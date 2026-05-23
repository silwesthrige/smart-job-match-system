import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { motion } from "motion/react";
import { Brain, Target, TrendingUp, Upload, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const features = [
  {
    icon: Brain,
    title: "Resume Analysis",
    description: "AI-powered analysis of your resume to extract skills, experience, and qualifications",
  },
  {
    icon: Target,
    title: "Job Matching Score",
    description: "Get precise match percentages for each job based on your profile and skills",
  },
  {
    icon: TrendingUp,
    title: "Skill Gap Detection",
    description: "Identify missing skills and get personalized learning recommendations",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Software Engineer",
    text: "Found my dream job in just 2 weeks! The AI matching was incredibly accurate.",
    image: "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwc21pbGluZ3xlbnwxfHx8fDE3NzYzMTM4NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    name: "Michael Chen",
    role: "Product Manager",
    text: "The skill gap analysis helped me upskill and land a role at a top tech company.",
    image: "https://images.unsplash.com/photo-1616804827035-f4aa814c14ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYW1lcmljYW4lMjBtYW4lMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzc2NDE1NjM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    name: "Emily Rodriguez",
    role: "UX Designer",
    text: "Best job search platform I've used. The interface is clean and the results are spot-on.",
    image: "https://images.unsplash.com/photo-1653566031535-bcf33e1c2893?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwYnVzaW5lc3MlMjB0ZWFtfGVufDF8fHx8MTc3NjM1OTgyOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#4F46E5]" size={28} />
            <h1 className="text-2xl font-bold text-[#4F46E5]">SmartMatch</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block mb-4 px-4 py-2 bg-[#4F46E5]/10 text-[#4F46E5] rounded-full text-sm">
            🚀 AI-Powered Job Matching
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find the Right Job with <span className="text-[#4F46E5]">AI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Upload your resume and let our intelligent system match you with the perfect job opportunities. 
            Get personalized recommendations and skill insights in seconds.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/resume">
              <Button size="lg">
                <Upload size={20} />
                Upload Resume
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" size="lg">
                Get Started
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-8 mt-12">
            <div>
              <p className="text-3xl font-bold text-[#4F46E5]">50K+</p>
              <p className="text-gray-600">Jobs Matched</p>
            </div>
            <div className="h-12 w-px bg-gray-300" />
            <div>
              <p className="text-3xl font-bold text-[#4F46E5]">95%</p>
              <p className="text-gray-600">Success Rate</p>
            </div>
            <div className="h-12 w-px bg-gray-300" />
            <div>
              <p className="text-3xl font-bold text-[#4F46E5]">15K+</p>
              <p className="text-gray-600">Happy Users</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1750365919971-7dd273e7b317?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMHRlY2hub2xvZ3klMjBuZXR3b3JrfGVufDF8fHx8MTc3NjQxNTYzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="AI Job Matching"
              className="w-full h-auto"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500" size={24} />
              <div>
                <p className="font-medium">Match Found!</p>
                <p className="text-sm text-gray-500">92% compatibility</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Three simple steps to your dream job</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <div className="w-14 h-14 bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] rounded-xl flex items-center justify-center mb-4">
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-gradient-to-br from-[#4F46E5]/5 to-[#06B6D4]/5 rounded-3xl my-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
          <p className="text-xl text-gray-600">Hear from job seekers who found their dream roles</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card>
                <div className="flex items-center gap-4 mb-4">
                  <ImageWithFallback
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] rounded-3xl p-12 text-white"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Find Your Dream Job?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of job seekers who've already found success</p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-[#4F46E5] hover:bg-gray-100">
              Get Started for Free
              <ArrowRight size={20} />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4">SmartMatch</h3>
            <p className="text-gray-400">AI-powered job matching platform for the modern job seeker.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">How it Works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2026 SmartMatch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
