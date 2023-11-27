import { PlayersList } from "../components/PlayersList";
import { Button } from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@nextui-org/react";
import { PlayersFormPage } from "./PlayersFormPage";
import { useState } from "react";

export function PlayersPage() {
  const [refetch, setRefetch] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <div>
      <Button onPress={onOpen}  className="mb-3 bg-myAzul-900 border-black hover:bg-myAzul-800 hover:border-zinc-800 dark:bg-purple-600 text-white border dark:border-purple-600 shadow-md dark:hover:bg-purple-800 dark:hover:border-purple-400">
        Add Player
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                New Player
              </ModalHeader>
              <ModalBody>
                <PlayersFormPage onclose={onClose} setRefetch={setRefetch} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      <PlayersList refetch={refetch} setRefetch={setRefetch} />
    </div>
  );
}
