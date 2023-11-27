import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTournamentById,
  getAllTournamentCategories,
  deleteTournament,
} from "../api/tournaments.api";

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
import { TournamentsFormPage } from "./TournamentsFormPage";
import { toast } from "react-hot-toast";
import { TournamentCategories } from "./TournamentCategories";


export function TournamentCategoriesPage() {
  const [tournament, setTournament] = useState(null);
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
    async function fetchTournament() {
        const response = await getTournamentById(id);
        setTournament(response.data);
    
    }

    async function fetchNumOfPlayers() {
    
        const response = await getAllTournamentCategories(id);
        setNumOfPlayers(response.data.length);
    
    }

    fetchTournament();
    fetchNumOfPlayers();
  }, [id, refetch]);

  return (
    <>
      <div className="w-3/4 ml-32">
      <Button
      variant="shadow"
      color="success"
       onClick={async () => {navigate(`/tournaments/${params.id}`)}} 
       className="bg-myColor-200 dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-white font-bold py-3 px-6 rounded w-1/6 transition transform active:shake  " >
         Go Back
         </Button>
        {tournament ? (
          <div>
            <Card className=" dark:bg-zinc-900 mt-7">
              <CardHeader className="bg-sky-300  dark:bg-zinc-700">
                <h1 className="text-3xl font-bold">{tournament.name}</h1>
              </CardHeader>
              <Divider />
              <CardBody className=" bg-neutral-100 text-neutral-800 dark:bg-zinc-800">
                <p className="mb-3 text-gray-700 dark:text-gray-500 text-tiny uppercase font-bold text-end">
                  {new Date(tournament.startDate).toLocaleDateString()} -{" "}
                  {new Date(tournament.endDate).toLocaleDateString()}
                </p>
                <p className="mb-3 text-gray-700 dark:text-gray-500 text-tiny uppercase font-bold">
                  {tournament.tournamentType}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {tournament.description}
                </p>
              </CardBody>
              <CardFooter className="flex justify-between  bg-neutral-100 dark:bg-zinc-800">
                <Button onPress={() => handleOpen("")} className=" bg-myAzul-900 border-black hover:bg-myAzul-800 hover:border-zinc-800 dark:bg-purple-600 text-white border dark:border-purple-600 shadow-md dark:hover:bg-purple-800 dark:hover:border-purple-400">
                  Edit info
                  <Modal
                    size={"2xl"}
                    backdrop={"blur"}
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    isDismissable={false}
                  >
                    <ModalContent>
                      {(onClose) => (
                        <>
                          <ModalHeader className="flex flex-col gap-1"></ModalHeader>
                          <ModalBody>
                            <TournamentsFormPage
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
                      "Are you sure you want to delete this tournament?"
                    );
                    if (accepted) {
                      await deleteTournament(id);
                      toast.success("Tournament deleted");
                      navigate("/tournaments");
                    }
                  }}
                >
                  Delete tournament
                </Button>
              </CardFooter>
            </Card>
            <Divider className="my-3" />
            <Card className="bg-zinc-800 dark:bg-zinc-900 mt-7">
              <CardHeader className=" bg-slate-400  dark:bg-zinc-700">
                <h1 className="text-3xl font-bold">
                  {numOfPlayers === 0
                    ? `No Categories on ${tournament.name}`
                    : `${numOfPlayers} Categories available${
                        numOfPlayers === 1 ? "" : "s"
                      } on ${tournament.name}`}
                </h1>
              </CardHeader>
              <Divider />
              <CardBody className=" bg-neutral-100 text-neutral-800 dark:bg-zinc-800">
               <TournamentCategories />
              </CardBody>
              <CardFooter className=" bg-neutral-100 text-neutral-800 dark:bg-zinc-800">
                {params.id && (
                  <Button
                    onClick={() => {
                      navigate(`/tournaments/${params.id}/addCategory`);
                    }} className=" bg-myAzul-900 border-black hover:bg-myAzul-800 hover:border-zinc-800 dark:bg-purple-600 text-white border dark:border-purple-600 shadow-md dark:hover:bg-purple-800 dark:hover:border-purple-400"
                  >
                    Add Category
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        ) : (
          <p>Loading tournament information...</p>
        )}
      </div>
    </>
  );
}
