import axios from 'axios';

const playersApi = axios.create({
	baseURL: 'http://localhost:5001/api/players',
});

export const getAllPlayers = () => playersApi.get('/');

export const getPlayerById = (id) => playersApi.get(`/${id}`);

export const createPlayer = (player) => playersApi.post('/', player);

export const deletePlayer = (id) => playersApi.delete(`/${id}`);

export const updatePlayer = (id, player) => playersApi.put(`/${id}`, player);

export const Tournamentsforplayer = (id) => playersApi.get(`/${id}/Tournaments`);

export const tournamentsForPlayer = (id) => playersApi.get(`/${id}/tournaments`);
