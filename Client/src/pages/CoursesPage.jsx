import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { CoursesFormPage } from "./CoursesFormPage";
import { getAllCourses, deleteCourse, getCourseById } from "../api/courses.api";
import { useState, useEffect } from "react";
import { Tooltip } from "@nextui-org/react";
import { EditIcon } from "../assets/EditIcon";
import { DeleteIcon } from "../assets/DeleteIcon";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Co } from "../components/CourseById";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";

export function CoursesPage() {
  // Usa useState para declarar el estado courses
  const [courses, setCourses] = useState([]);

  const [refetch, setRefetch] = useState(true);
  // Usa useDisclosure para manejar el estado del modal
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const navigate = useNavigate();
  useEffect(() => {
    //  verificar si refetch es true
    async function loadCourses() {
      const res = await getAllCourses();
      setCourses(res.data);
      setRefetch(false);
    }
    if (refetch) {
      loadCourses();
    }
  }, [refetch]); // Mantiene refetch como dependencia
  const cambiarValor = () => {
    setRefetch(true); // Aquí cambiamos el valor del estado del padre a false
  };

  return (
    <div className="w-80%">
      <div className="w-3/4 ml-10">
        <Button onPress={onOpen} color="primary" className="mb-1  bg-myAzul-800 border-black hover:bg-myAzul-700 hover:border-zinc-800 dark:bg-purple-600 text-white border dark:border-purple-600 shadow-md dark:hover:bg-purple-800 dark:hover:border-purple-400">
          Add Course
        </Button>
        <Modal
          isOpen={isOpen}
          // Pasa la función handleOpenChange por referencia al prop onOpenChange
          onOpenChange={onOpenChange}
          isDismissable={false}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  New Course
                </ModalHeader>
                <ModalBody>
                  <CoursesFormPage
                    onclose={onClose}
                    setRefetch={cambiarValor}
                  />
                </ModalBody>
                <ModalFooter></ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
      <div className="flex flex-wrap gap-4 mt-10 w-full  ">
        {courses.map((course) => (
          <Card
            className="py-1 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 max-w-md mb-10 ml-5 bg-zinc-900"
            key={course.id}
          >
            <CardHeader
              onClick={async () => {
                navigate(`/courses/${course.id}/`);
              }}
              className="pb-1 pt-0 px-2  border-b bg-slate-500 dark:bg-zinc-800"
            >
              <p className="text-2xl text-black-500 text-center">
                {course.name}{" "}
              </p>
            </CardHeader>
            <CardBody className="overflow-visible py-2 text-zinc-500">
              <div className="flex items-center justify-between px-2">
                <p>Aca se pueden poner varias cosas </p>
              </div>
            </CardBody>
            <CardFooter>
              <div className="flex justify-between items-center  w-full sm:3/4 md:1/2">
                <div className="flex gap-2 ">
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
                            setRefetch(!refetch);
                            let updatedcourses = courses.filter(
                              (course) => course.id !== course.id
                            );
                            setCourses(updatedcourses);
                            toast.success("course deleted");
                          }
                        }}
                      />
                    </span>
                  </Tooltip>
                </div>
                
                <Dropdown >
      <DropdownTrigger>
        <Button className="ml-20"
          variant="shadow"
          color="default" 
        >
          Detalles
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions">
        <DropdownItem key="new"> <Co valor={course.id} /></DropdownItem>
      </DropdownMenu>
    </Dropdown>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
