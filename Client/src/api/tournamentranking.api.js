import axios from 'axios';

const rankingApi = axios.create({
    baseURL: 'http://localhost:5001/api/TournamentRankings'
});

export const getRankingByIdTournament = (id) => rankingApi.get(`/${id}`);