import { useEffect, useState } from "react";
import { getAllPlayers } from "../api/players.api";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Tooltip,
  Button,
} from "@nextui-org/react";
import { EditIcon } from "../assets/EditIcon";
import { DeleteIcon } from "../assets/DeleteIcon";
import { Link, useNavigate } from "react-router-dom";
import { deletePlayer } from "../api/players.api";
import { toast } from "react-hot-toast";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react";
import { tournamentsForPlayer } from "../api/players.api";

export function PlayersList({ refetch, setRefetch }) {
  const [players, setPlayers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPlayers() {
      const res = await getAllPlayers();
      setPlayers(res.data);
      setRefetch(false);
    }
    if (refetch) {
      loadPlayers();
    }
  }, [refetch]);

  return (
    <div className="flex flex-col gap-3">
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
          <TableColumn>Handicap Index</TableColumn>
          <TableColumn>Actions</TableColumn>
          <TableColumn>tournamet active</TableColumn>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell className="text-lg">{player.matriculaAUG}</TableCell>
              <TableCell className="text-lg">{player.name}</TableCell>
              <TableCell className="text-lg">{player.lastName}</TableCell>
              <TableCell className="text-lg">{player.handicapIndex}</TableCell>

              <TableCell>
                <div className="relative flex items-center gap-6">
                  <Tooltip content="Edit">
                    <Link to={`/players/${player.id}`}>
                      <span className="text-xl text-default-400 cursor-pointer active:opacity-50">
                        <EditIcon />
                      </span>
                    </Link>
                  </Tooltip>
                  <Tooltip color="danger" content="Delete">
                    <span className="text-xl text-danger cursor-pointer active:opacity-50">
                      <DeleteIcon
                        onClick={async () => {
                          const accepted = window.confirm("Confirm");
                          if (accepted) {
                            await deletePlayer(player.id);
                            var updatedPlayers = players.filter(
                              (Player) => Player.id !== player.id
                            );
                            setPlayers(updatedPlayers);
                            toast.success("Player deleted");
                          }
                        }}
                      />
                    </span>
                  </Tooltip>
                </div>
              </TableCell>
              <TableCell>
              <Popover placement="bottom" showArrow={true}>
                  <PopoverTrigger>
                    <Button onClick={

                      async () => { 
                        const resultado = await tournamentsForPlayer(player.id)
                        setTournaments(resultado.data);}
                    } className="">
                    Torneos Activos</Button>
                    

                      </PopoverTrigger>
                  <PopoverContent>
                  <div className="px-1 py-2">
                  {tournaments.map((tournament) => (
                    <li key={tournament.id}>
            <span className="font-bold">{tournament.name}</span>
            <br/>
            <span className="text-sm text-zinc-500">
              {tournament.startDate} - {tournament.endDate}
            </span>
          </li>
        ))}
        </div>
      
                  </PopoverContent>
                  </Popover>
                  </TableCell>
                  </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

