import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react'
import { Card, CardHeader, CardBody} from "@nextui-org/react";
import { deleteCourse } from '../api/courses.api';
import { DeleteIcon } from '../assets/DeleteIcon';

export function CardForTournaments({setRefetch, course}) {
<Card className="py-1 w-5/6 ml-11 bg-opacity-10" 
          >
            <CardHeader onClick={navigate(`/courses/${course.id}/`)} className="pb-1 pt-0 px-2 display-flex flex-row border-b border-2 border-gray-300">
              <p className="text-tiny uppercase font-bold">{course.id}</p>
              <small className="text-2xl text-black-500">{course.name}</small>
              <h4 className="font-bold text-large">{course.courseSlope}</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-2">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
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
                 
                </div>
                <Dropdown>
      <DropdownTrigger>
        <Button 
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
            </CardBody>
          </Card>
          }

