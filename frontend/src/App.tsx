import { type FC, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useIntl } from "react-intl";
import { TeacherDashboard } from "./pages/TeacherDashboard";
/*
import { NotFound } from "./components/NotFound";
import { StudentDashboard } from "./pages/StudentDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
*/

export const App: FC = () => {
  const { formatMessage: f } = useIntl();
  const appName = f({ id: "app.name" });

  useEffect(() => {
    document.title = appName;
  }, [appName]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/teacher" element={<TeacherDashboard />} />
        {/*
        <Route
          path="/student/:id"
          element={
            <StudentDashboard
              application={{ status: "未申請", reason: "" }}
              onSubmit={() => {}}
              courseSettings={courseSettings}
            />
          }
        />
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

export default App;
