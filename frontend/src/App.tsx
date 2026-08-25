import { type FC, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { useIntl } from "react-intl";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { CourseSectionSettingsTable } from "./pages/AdminDashboard/CourseSectionSettingsTable";
import { NotFound } from "./components/NotFound";

const StudentDashboardRoute: FC = () => {
  const { courseId } = useParams();
  return <StudentDashboard courseId={Number(courseId)} />;
};

const TeacherDashboardRoute: FC = () => {
  const { courseId } = useParams();
  return <TeacherDashboard courseId={Number(courseId)} />;
};

const CourseSectionSettingsTableRoute: FC = () => {
  const { courseId } = useParams();
  return <CourseSectionSettingsTable courseId={Number(courseId)} />;
};

const AppRoutes: FC = () => {
  const { formatMessage: f } = useIntl();
  const appName = f({ id: "app.name" });

  useEffect(() => {
    document.title = appName;
  }, [appName]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/courses/:courseId">
          <Route path="teacher" element={<TeacherDashboardRoute />} />
          <Route path="student" element={<StudentDashboardRoute />} />
        </Route>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/admin/courses/:courseId"
          element={<CourseSectionSettingsTableRoute />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export const App: FC = () => <AppRoutes />;

export default App;
