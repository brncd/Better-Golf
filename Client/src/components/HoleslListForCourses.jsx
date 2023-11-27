import { useEffect, useState } from "react";
import { getAllHoles } from "../api/Holes.api";
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
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  deleteHolesInCourses,
  addHoleToCourse,
  updateHoleInCourse,
  getHolesInCourses,
} from "../api/courses.api";

export function HolesListForTournament() {
  const [Holes, setHoles] = useState([]);
  const params = useParams(); // para obtener el id de la url

  useEffect(() => {
    async function loadHoles() {
      const res = await getHolesInCourses(params.id);
      setHoles(res.data);
    }
    loadHoles();
  }, []);

  return (
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
          <TableColumn>StrokeIndex</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {Holes.map((hole) => (
            <TableRow key={hole.id}>
              <TableCell>{hole.par}</TableCell>
              <TableCell>{hole.number}</TableCell>
              <TableCell>{hole.strokeIndex}</TableCell>
              <TableCell>
                <div className="relative flex items-center gap-2">
                  <Tooltip content="Edit">
                    <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                      <EditIcon
                        onClick={async () => {
                          addHoleToCourse(params.id, hole.id);
                        }}
                      />
                    </span>
                  </Tooltip>
                  <Tooltip color="danger" content="Delete">
                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                      <DeleteIcon
                        onClick={async () => {
                          const accepted = window.confirm("Confirm");
                          if (accepted) {
                            await deleteHolesInCourses(params.id, hole.id);
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
