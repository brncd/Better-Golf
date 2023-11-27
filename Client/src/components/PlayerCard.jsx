import { useNavigate } from "react-router-dom";

export function PlayerCard({ player }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/players/${player.id}`)}>
      {player.name}
      {player.lastName}
    </div>
  );
}
