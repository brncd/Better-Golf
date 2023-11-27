import axios from 'axios';

const tournamentsApi = axios.create({
	baseURL: 'http://localhost:5001/api/Tournaments',
});

export const getAllTournaments = () => tournamentsApi.get('/');

export const getTournamentById = (id) => tournamentsApi.get(`/${id}`);

export const createTournament = (tournament) => tournamentsApi.post('/', tournament);

export const deleteTournament = (id) => tournamentsApi.delete(`/${id}`);

export const updateTournament = (id, tournament) => tournamentsApi.put(`/${id}`, tournament);

export const getAllTournamentCategories = (id) => tournamentsApi.get(`/${id}/categories`);

export const addPlayerToTournament = (tid, playerid) => tournamentsApi.post(`/${tid}/players?tournamentId=${tid}&playerId=${playerid}`);

export const getAllPlayersInTournament = (id) => tournamentsApi.get(`/${id}/players`);

export const deletePlayerInTournament = (tid, pid) => tournamentsApi.delete(`/${tid}/players/${pid}?tournamentId=${tid}`);

export const getAllScorecardsInTournament = (id) => tournamentsApi.get(`/${id}/Scorecards`);

export const deleteCategoriesInTournament = (tid, pid) => tournamentsApi.delete(`/${tid}/categories/${pid}?tournamentId=${tid}`);

export const addcategorieToTournament = (tid, categoryid) => tournamentsApi.post(`/${tid}/Categories?tournamentId=${tid}&categoryId=${categoryid}`);

export const tournamentsForPlayer = (id) => playersApi.get(`/${id}/tournaments`);
