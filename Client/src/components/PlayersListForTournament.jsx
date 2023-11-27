import { useEffect, useState } from "react";
import { getAllPlayers } from "../api/players.api";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Tooltip, RadioGroup, Radio, Button } from "@nextui-org/react";

import {useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import { addPlayerToTournament } from "../api/tournaments.api";
import { AddIcon } from "../assets/AddIcon";

export function PlayersListForTournament( ) {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState(players);
  const params = useParams(); // para obtener el id de la url
/*   const tournamentid = parseInt(params.id, 10) */
 const navigate = useNavigate();
  useEffect(() => {
    async function loadPlayers() {
      const res = await getAllPlayers();
      setPlayers(res.data);
      setFilteredPlayers(res.data);
    }
    loadPlayers();
  }, [ ]);

  
  const handlePlayerClick = (playerId) => {
    const newFilteredPlayers = filteredPlayers.filter((player) => player.id !== playerId);
    setFilteredPlayers(newFilteredPlayers);
  };
  

  return (
    <div className="flex flex-col gap-3 w-3/4 ml-20">
      <Table
        color={"primary"}
        selectionMode="single"
        defaultSelectedKeys={["3"]}
        aria-label="Example static collection table"
      >
        <TableHeader>
          <TableColumn>MatriculaAUG</TableColumn>
          <TableColumn>Name</TableColumn>
          <TableColumn>Last Name</TableColumn>
         
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
            {filteredPlayers.map((player) => (
            <TableRow key={player.id}>
              <TableCell>{player.matriculaAUG}</TableCell>
              <TableCell>{player.name}</TableCell>
              <TableCell>{player.lastName}</TableCell>
              <TableCell>
                <div className="relative flex items-center gap-2">
                  <Tooltip content="Add player to tournament">
                      <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                        <AddIcon
                        className=" hover:bg-amber-600 active:bg-red-800 text-zinc-300  transition transform active:shake"
                        onClick={async () =>
                          { handlePlayerClick(player.id); 
                            addPlayerToTournament(params.id, player.id); 
                            toast.success(`Player ${player.name} added to tournament`);
                          }
                        }
                        />
                      </span>
                    
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
      variant="shadow"
      color="success"
       onClick={async () => {navigate(`/tournaments/${params.id}`)}} className="bg-myColor-200 dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-white font-bold py-3 px-6 rounded w-1/6 transition transform active:shake  "> Go Back</Button>
    </div>
  );
}