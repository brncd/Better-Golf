import { getHolesInCourses, deleteHolesInCourses } from "../api/courses.api";
import { DeleteIcon } from "../assets/DeleteIcon";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  Button,
} from "@nextui-org/react";
import { Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export function CoursesAndHole() {
  const [holes, setholes] = useState([]);
  const [refetch, setRefetch] = useState(true);
  const params = useParams(); // para obtener el id de la url
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHoles() {
      if (params.id) {
        const res = await getHolesInCourses(params.id);
        setholes(res.data);
        setRefetch(false);
        console.log(res.data);
      }
    }
    if (refetch) {
      fetchHoles();
    }
  }, [refetch]);

  return (
    <div>
      <div className="flex flex-col gap-3">
        <Table
          color={"primary"}
          selectionMode="single"
          defaultSelectedKeys={["3"]}
          aria-label="Example static collection table"
        >
          <TableHeader>
            <TableColumn>Par</TableColumn>
            <TableColumn>Number</TableColumn>
            <TableColumn>strokeIndex</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody >
            {holes.map((hole) => (
              <TableRow key={hole.id}>
                <TableCell>{hole.par}</TableCell>
                <TableCell>{hole.number}</TableCell>
                <TableCell>{hole.strokeIndex}</TableCell>
                <TableCell>
                  <div className="relative flex items-center gap-2">
                    <Tooltip color="danger" content="Delete">
                      <span className="text-lg text-danger cursor-pointer active:opacity-50">
                        <DeleteIcon
                          onClick={async () => {
                            await deleteHolesInCourses(params.id, hole.id);
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
    </div>
  );
}
