import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCourseById,
  deleteCourse,
  getHolesInCourses,
} from "../api/courses.api";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
} from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { CoursesFormPage } from "./CoursesFormPage";
import { toast } from "react-hot-toast";
/* import { CourseandPLayer } from "./CourseandPLayer"; */
import { CoursesAndHole } from "./CoursesAndHoles";

export function CoursePageId() {
  const [course, setCourse] = useState(null);
  const [numOfPlayers, setNumOfPlayers] = useState(null);
  const { id } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const navigate = useNavigate();
  const params = useParams();

  const [size, setSize] = React.useState("md");
  const [backdrop, setBackdrop] = React.useState("opaque");

  const handleOpen = (size) => {
    setSize(size);
    onOpen();
  };

  const handleBackdropChange = (newBackdrop) => {
    setBackdrop(newBackdrop);
  };

  const [refetch, setRefetch] = React.useState(true);

  const handleRefetch = () => {
    setRefetch((prevRefetch) => !prevRefetch);
  };

  useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await getCourseById(id);
        setCourse(response.data);
      } catch (error) {
        console.error("Error fetching Course:", error);
      }
    }

    async function fetchNumOfPlayers() {
      try {
        const response = await getHolesInCourses(id);
        setNumOfPlayers(response.data.length);
      } catch (error) {
        console.error("Error fetching number of players:", error);
      }
    }

    fetchCourse();
    fetchNumOfPlayers();
  }, [id, refetch]);

  return (
    <>
      <div className="w-3/4 ml-32">
      <div>

<div className="flex items-start justify-start w-1/3">

<Button 
variant="shadow"
color="default"
onClick={() => navigate(`/courses/${params.id}/EditHole/1`)} className="bg-myColor-400 hover:bg-myColor-300 dark:bg-amber-950 dark:hover:bg-amber-700">Edit Holes in Course</Button>
</div>
<div className=" flex justify-end items-start"> 
<Button
variant="shadow"
color="succes"
onClick={async () => {navigate(`/tournaments`)}} 
className="bg-myColor-200 dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-white font-bold py-3 px-6 rounded w-1/6 transition transform active:shake ">
 Go Back
 </Button>
 </div>
</div>
        {course ? (
          <div>
            <Card className=" dark:bg-zinc-900 mt-7">
              <CardHeader className="bg-sky-300  dark:bg-zinc-700">
                <h1 className="text-3xl font-bold">{course.name}</h1>
              </CardHeader>
              <Divider />
              <CardBody className=" bg-neutral-100 text-neutral-800 dark:bg-zinc-800">
                <p className="mb-3 text-gray-700 dark:text-gray-300 text-tiny uppercase font-bold">
                 Slope :  { course.courseSlope}
                </p>
                <p className="mb-3 text-gray-700 dark:text-gray-300 text-tiny uppercase font-bold">
                 Rating :  {course.courseRating}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                 Par :  {course.par}
                </p>
              </CardBody>
              <CardFooter className="flex justify-between  bg-neutral-100 dark:bg-zinc-800">
                <Button onPress={() => handleOpen("")} className=" bg-myAzul-900 border-black hover:bg-myAzul-800 hover:border-zinc-800 dark:bg-purple-600 text-white border dark:border-purple-600 shadow-md dark:hover:bg-purple-800 dark:hover:border-purple-400">
                  Edit info
                  <Modal
                    size={"1xl"}
                    backdrop={"blur"}
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    isDismissable={false}
                  >
                    <ModalContent>
                      {(onClose) => (
                        <>
                          <ModalHeader className="flex flex-col gap-1"> Course</ModalHeader>
                          <ModalBody>
                            <CoursesFormPage
                              onClose={onClose}
                              setRefetch={handleRefetch}
                            />
                          </ModalBody>
                        </>
                      )}
                    </ModalContent>
                  </Modal>
                </Button>
                <Button
                  color="danger"
                  onClick={async () => {
                    const accepted = window.confirm(
                      "Are you sure you want to delete this Course?"
                    );
                    if (accepted) {
                      await deleteCourse(id);
                      toast.success("Course deleted");
                      navigate("/Courses");
                    }
                  }}
                >
                  Delete Course
                </Button>
              </CardFooter>
            </Card>
            <Divider className="my-3" />
            <Card className="bg-zinc-800 dark:bg-zinc-900 mt-7">
              <CardHeader className="bg-gray-500  dark:bg-zinc-700">
                <h1 className="text-3xl font-bold">
                  {numOfPlayers === 0
                    ? `No Holes on ${course.name}`
                    : `${numOfPlayers} Hole${
                        numOfPlayers === 1 ? "" : "s"
                      } on ${course.name}`}
                </h1>
              </CardHeader>
              <Divider />
              <CardBody className=" overflow-y-auto h-40  bg-neutral-100 text-neutral-800 dark:bg-zinc-800">
             
               <CoursesAndHole  />
              </CardBody>
              <CardFooter className=" bg-neutral-100 text-neutral-800 dark:bg-zinc-800">
                {params.id && (
                  <Button
                    onClick={() => {
                      navigate(`/Courses/${params.id}/holes`);
                    }}
                    className=" bg-myAzul-900 border-black hover:bg-myAzul-800 hover:border-zinc-800 dark:bg-purple-600 text-white border dark:border-purple-600 shadow-md dark:hover:bg-purple-800 dark:hover:border-purple-400"
                  >
                    Add Holes
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        ) : (
          <p>Loading Course information...</p>
        )}
      </div>
    </>
  );
}
