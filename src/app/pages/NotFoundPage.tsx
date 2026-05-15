import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Home, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4F46E5]/10 to-[#06B6D4]/10 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-9xl font-bold text-[#4F46E5] mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-xl text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button size="lg">
              <Home size={20} />
              Go Home
            </Button>
          </Link>
          <Button variant="outline" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft size={20} />
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
