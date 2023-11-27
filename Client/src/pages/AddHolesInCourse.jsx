import { getHolesInCourses, addHoleToCourse } from "../api/courses.api";
import { EditIcon } from "../assets/EditIcon";
import { Button } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
} from "@nextui-org/react";
import { Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HolesFormPage } from "./HolesFormPage";

export function AddHolesInCourse() {
  const [holes, setholes] = useState([]);
  const [refetch, setRefetch] = useState(true);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
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
      <div className="flex flex-col gap-3 w-3/4 ml-16">
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
          <TableBody>
            {holes.map((hole) => (
              <TableRow key={hole.id}>
                <TableCell>{hole.par}</TableCell>
                <TableCell>{hole.number}</TableCell>
                <TableCell>{hole.strokeIndex}</TableCell>
                <TableCell>
                  <div className="relative flex items-center gap-2">
                    <Tooltip color="success" content="Delete">
                      <span className="text-lg text-danger cursor-pointer active:opacity-50">
                        <EditIcon
                          onClick={() => {
                            navigate(`/Courses/${params.id}/EditHole/${hole.id}`);
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
      <Button
        onClick={() => {
          navigate(`/Courses/${params.id}/`);
        }}
      >
        Back
      </Button>



  
    <div>
      <Button onPress={onOpen} color="primary" className="mb-3">Add Hole</Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">New Hole</ModalHeader>
              <ModalBody>
                <HolesFormPage onclose={onClose} setRefetch={setRefetch}/>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>

    </div>
  );
}