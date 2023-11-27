import { tournamentsForPlayer } from "../api/players.api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@nextui-org/react";
export function tournamentsForPlayers() {
  const [tournaments, setTournaments] = useState([]);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function Tournamentsforp(valor) {
      const res = await tournamentsForPlayer(valor);
      setTournaments(res.data);
    }
    Tournamentsforp(params.id);
  }, []);

  return (
    <div className="flex flex-col w-2/5 bg-zinc-500 rounded">
      <h2 className="text-2xl font-bold">Tournaments</h2>
      <ul className="flex flex-col gap-2">
        {tournaments.map((tournament) => (
          <li key={tournament.id}>
            <span className="font-bold">{tournament.name}</span>
            <br />
            <span className="text-sm text-zinc-500">
              {tournament.startDate} - {tournament.endDate}
            </span>
          </li>
        ))}
      </ul>
      <Button
        onClick={async () => {
          navigate(`/players`);
        }}
        className="bg-zinc-500 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded w-1/5 self-center"
      >
        {" "}
        Come Back
      </Button>
    </div>
  );
}
