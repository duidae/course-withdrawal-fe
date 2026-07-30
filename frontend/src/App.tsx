import { type FC, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useParams,
} from "react-router-dom";
import { useIntl } from "react-intl";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { CourseInfoProvider } from "./contexts/course-info.context";
import { StudentDashboard } from "./pages/StudentDashboard";
/*
import { AdminDashboard } from "./pages/AdminDashboard";
import { NotFound } from "./components/NotFound";
*/

const CourseLayout: FC = () => {
  const { id } = useParams();

  return (
    <CourseInfoProvider courseId={id ?? ""}>
      <Outlet />
    </CourseInfoProvider>
  );
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
        <Route path="/courses/:id" element={<CourseLayout />}>
          <Route path="teacher" element={<TeacherDashboard />} />
          <Route
            path="students/:id"
            element={
              <StudentDashboard
                application={{
                  name: "陳O佑",
                  loginID: "F34097391@mail.ncku.edu.tw",
                  studentID: "成大_F34097391",
                  status: "未申請",
                  reason: "",
                }}
                courseSettings={{
                  name: "深度學習 Deep Learning",
                  section: "國立成功大學",
                  teachers: ["彭文孝", "陳永昇", "謝秉均"],
                  st: "2026/07/01 00:00",
                  et: "2026/07/25 23:59",
                  ad: "2026/08/08 23:59",
                  notes: "",
                  isEnabled: true,
                }}
              />
            }
          />
        </Route>
        {/*
        <Route
          path="/admin"
          element={
            <AdminDashboard
              courses={adminCourses}
              setCourses={setAdminCourses}
              semester={adminSemester}
              setSemester={setAdminSemester}
              cSearch={adminCSearch}
              setCSearch={setAdminCSearch}
              onEdit={(c) => {
                setAdminCurCourse(c);
                setAdminView("edit");
              }}
              onAdd={() => setAdminAddOpen(true)}
              onToggle={adminToggleCourse}
              appCounts={adminAppCounts}
            />
          }
        />
        <Route path="*" element={<NotFound />} />
         */}
      </Routes>
    </BrowserRouter>
  );
};

export const App: FC = () => <AppRoutes />;

export default App;
