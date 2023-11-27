
import { useEffect, useState } from "react";
import {getRankingByIdTournament} from "../api/tournamentranking.api";
import {getPlayerById} from "../api/players.api";
import { TableBody } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/react";


export function TournamentResult( { prueba }) {
  const [values, setValues] = useState([]);
  console.log(prueba)
  const  fetchRanking = async () => {
    const response = await getRankingByIdTournament(prueba);
    console.log(response.data);
    const ranking = response.data;
    setValues(ranking);
  
  }

  useEffect(() => {
    fetchRanking();
  }, []);
const jugador = async (entra) => {
  const response = await getPlayerById(entra); // Corregido
  const player = response.data;
  return player;
}

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
          
        </TableHeader>
        <TableBody>
          {values.map((player) => (
            <TableRow key={player.id}>
              <TableCell className="text-lg">{player.position}</TableCell>
              <TableCell className="text-lg">{player.tournamentId}</TableCell>
              <TableCell className="text-lg">{player.totalStrokes}</TableCell>
              <TableCell className="text-lg">{player.handicapIndex}</TableCell>

           </TableRow>
))}
         </TableBody>
          
        </Table>

    </div>
  );
}