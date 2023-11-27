import { useEffect, useState } from "react";
import { getAllCourses, deleteCourse } from "../api/courses.api";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Tooltip,
  RadioGroup,
  Radio,
} from "@nextui-org/react";
import { EditIcon } from "../assets/EditIcon";
import { DeleteIcon } from "../assets/DeleteIcon";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export function CoursesList() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCourses() {
      const res = await getAllCourses();
      setCourses(res.data);
    }
    loadCourses();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <Table
        color={"primary"}
        selectionMode="single"
        defaultSelectedKeys={["2"]}
        aria-label="Example static collection table"
      >
        <TableHeader>
          <TableColumn>InfoADefinir</TableColumn>
          <TableColumn>InfoADefinir</TableColumn>
          <TableColumn>InfoADefinir</TableColumn>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell>{course.InfoADefinir}</TableCell>
              <TableCell>{course.InfoADefinir}</TableCell>
              <TableCell>{course.InfoADefinir}</TableCell>
              <TableCell>
                <div className="relative flex items-center gap-2">
                  <Tooltip content="Edit">
                    <Link to={`/courses/${course.id}`}>
                      <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                        <EditIcon />
                      </span>
                    </Link>
                  </Tooltip>
                  <Tooltip color="danger" content="Delete">
                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                      <DeleteIcon
                        onClick={async () => {
                          const accepted = window.confirm("Confirm");
                          if (accepted) {
                            await deleteCourse(course.id);
                            var updatedCourses = courses.filter(
                              (Course) => Course.id !== course.id
                            );
                            setCourses(updatedCourses);
                            toast.success("Course deleted");
                          }
                        }}
                      />
                    </span>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
