import { createContext, useContext, useEffect, useState } from "react";

import { getCourseInfo, type CourseInfo } from "../apis/course-withdrawal.api";

const CourseInfoContext = createContext<CourseInfo | undefined>(undefined);

export const CourseInfoProvider: React.FC<{
  courseId: string;
  children: React.ReactNode;
}> = ({ courseId, children }) => {
  const [courseInfo, setCourseInfo] = useState<CourseInfo>({
    courseName: "",
  });

  useEffect(() => {
    getCourseInfo({ courseId }).then(setCourseInfo);
  }, [courseId]);

  return (
    <CourseInfoContext.Provider value={courseInfo}>
      {children}
    </CourseInfoContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCourseInfo = (): CourseInfo => {
  const courseInfo = useContext(CourseInfoContext);
  if (!courseInfo) {
    throw new Error("useCourseInfo must be used within a CourseInfoProvider");
  }
  return courseInfo;
};
