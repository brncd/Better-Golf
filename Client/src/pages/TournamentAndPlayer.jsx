import {  getAllPlayersInTournament, getAllScorecardsInTournament, deletePlayerInTournament } from '../api/tournaments.api';
import { DeleteIcon } from "../assets/DeleteIcon";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableColumn } from "@nextui-org/react";
import { Tooltip } from "@nextui-org/react";
import { useEffect, useState } from 'react';
import { HoleIcon } from '../assets/HoleIcon';
import { useParams, useNavigate } from 'react-router-dom';
import { setScoreCard } from '../api/scorecard.api';


export function TournamentandPLayer() {
  const [players, setPlayers] = useState([]);
  const [refetch, setRefetch] = useState(true);
  const params = useParams(); // para obtener el id de la url 
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPlayers() {
     
      const players = await getAllPlayersInTournament(params.id);
      const result = await  getAllScorecardsInTournament(params.id)
      console.log(result)
      const playersresult = players.data.map(player => {
        for (let i = 0; i < result.data.length; i++) {
          const element = result.data[i];
          if (element.player === player.id) {
            return {...player, totalStrokes: element.totalStrokes, sId: element.id}
          }
        }
        return {...player, totalStrokes: 0, sId: 0}
      })
      setPlayers(playersresult);
      setRefetch(false);
      }
    
    if (refetch){
    fetchPlayers();
    }
  }, [refetch]);
 
  return (
    <div>
      <div className="flex flex-col gap-3 ">
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
          <TableColumn>Total Strokes</TableColumn>
          <TableColumn>Actions</TableColumn>
          <TableColumn>Results</TableColumn>
        </TableHeader>
        <TableBody>
            {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell>{player.matriculaAUG}</TableCell>
              <TableCell>{player.name}</TableCell>
              <TableCell>{player.lastName}</TableCell>
              <TableCell>{player.handicapIndex}</TableCell>
              <TableCell>{player.totalStrokes}</TableCell>
              
              <TableCell>
                <div className="relative flex items-center gap-2">
               
                  <Tooltip color="danger" content="Remove player">
                    <span className="text-3xl text-danger cursor-pointer active:opacity-50">
                      <DeleteIcon
                        onClick={async () => {
                          await deletePlayerInTournament(params.id, player.id);
                         setRefetch(true);
                        }}
                      />
                    </span>
                  </Tooltip>
                </div>
              </TableCell>
              <TableCell>
                <div className="relative flex items-center gap-2">
               
                  <Tooltip color="success" content="Add result by hole">
                    <span className="text-3xl text-ambar-500 cursor-pointer active:opacity-50">
                      <HoleIcon
                        onClick={async () => {
                          
                          navigate(`/tournaments/${params.id}/result/${player.sId}`);
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
    
  </div>
  );

}