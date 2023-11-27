import { useEffect, useState } from "react";
import { getAllTournaments } from "../api/tournaments.api";
import { TournamentCard } from "./TournamentCard";

export function TournamentsList({ refetch, valor }) {
  const [tournaments, setTournaments] = useState([]);
  const [finishedTournaments, setFinishedTournaments] = useState(false);
  const fetchTournaments = async () => {
    const response = await getAllTournaments();
    if (valor === "actives") {
      const filteredTournaments = response.data.filter(tournament => new Date(tournament.startDate) < new Date() && new Date(tournament.endDate) > new Date());
      setTournaments(filteredTournaments);
      setFinishedTournaments(false);
      return;
    }
    else if (valor === "all") {
      setTournaments(response.data);
      setFinishedTournaments(false);
    }
    else if (valor === "upcoming") {
      const filteredTournaments = response.data.filter(tournament => new Date(tournament.startDate) > new Date());
      setTournaments(filteredTournaments);
      setFinishedTournaments(false);
    }
    else  {
      const filteredTournaments = response.data.filter(tournament => new Date(tournament.endDate) < new Date());
      setTournaments(filteredTournaments);
      setFinishedTournaments(true);
    }
  }
  useEffect(() => {
    fetchTournaments();
  }, [refetch]);

  return (
    <div className="flex flex-wrap gap-3">
      {tournaments.map((tournament) => (
        <TournamentCard key={tournament.id} tournament={tournament} finished={finishedTournaments}/>
      ))}
    </div>
  );
}
