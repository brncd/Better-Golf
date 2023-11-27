import { useState } from "react";
import {
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { TournamentsFormPage } from "./TournamentsFormPage";
import { TournamentsList } from "../components/TournamentsList";

export function TournamentsPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [refetch, setRefetch] = useState(true);
  const [activeTab, setActiveTab] = useState("actives"); // Agrega el estado para controlar la pestaña activa
  const handleRefetch = () => {
    setRefetch((prevRefetch) => !prevRefetch);
  };

  return (
    <div>
      <Button onPress={onOpen} className=" bg-myColor-600 text-white  dark:bg-purple-800 dark:text-zinc-300">
        Create Tournament
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          isDismissable={false}
          size={"lg"}
          backdrop={"blur"}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  
                </ModalHeader>
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
      <div className="text-center py-4">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tab key="all" title="All">
            <TournamentsList
              refetch={refetch}
              status={activeTab.toLowerCase()}
              valor={'all'}
            />
          </Tab>
          <Tab key="upcoming" title="Upcoming">
            <TournamentsList
              refetch={refetch}
              status={activeTab.toLowerCase()}
              valor={'upcoming'}
            />
          </Tab>
          <Tab key="active" title="Active">
            <TournamentsList
              refetch={refetch}
              status={activeTab.toLowerCase()}
              valor={'actives'}
            />
          </Tab>
          <Tab key="completed" title="Completed">
          <TournamentsList
              refetch={refetch}
              status={activeTab.toLowerCase()}
              valor={'completed'}
           />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
