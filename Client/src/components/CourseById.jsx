import { useEffect, useState } from "react";
import { getCourseById } from "../api/courses.api";
export function Co({valor}) {
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    async function loadCourses(valor) {
      const res = await getCourseById(valor);
      setCourses(res.data);
    }
    loadCourses(valor);
  }, [valor]);

  return (
    <div>
      <p>
        Name: {courses.name}
        <br />
        Course Slope: {courses.courseSlope}
        <br />
        Course Rating: {courses.courseRating}
        <br />
        Course Par: {courses.par}
      </p>
    </div>
  );
}
