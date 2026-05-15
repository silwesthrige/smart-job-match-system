import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { Dashboard } from "./pages/Dashboard";
import { ResumePage } from "./pages/ResumePage";
import { JobMatchesPage } from "./pages/JobMatchesPage";
import { JobDetailsPage } from "./pages/JobDetailsPage";
import { SkillGapPage } from "./pages/SkillGapPage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/resume",
    Component: ResumePage,
  },
  {
    path: "/jobs",
    Component: JobMatchesPage,
  },
  {
    path: "/jobs/:id",
    Component: JobDetailsPage,
  },
  {
    path: "/skill-gap",
    Component: SkillGapPage,
  },
  {
    path: "/settings",
    Component: SettingsPage,
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);