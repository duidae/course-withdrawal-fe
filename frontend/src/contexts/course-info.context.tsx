import { createContext, useContext, useEffect, useState } from "react";

import { getCourseInfo, type CourseInfo } from "../apis/course-withdrawal.api";
import { INIT_COURSES } from "../apis/mockup";

const CourseInfoContext = createContext<CourseInfo | undefined>(undefined);

export const CourseInfoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [courseInfo, setCourseInfo] = useState<CourseInfo>({
    courseName: "",
  });

  useEffect(() => {
    // TODO: Replace this with the actual courseId you want to fetch
    getCourseInfo({ courseId: INIT_COURSES[0].courseId }).then(setCourseInfo);
  }, []);

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
