import axios from 'axios';

const scorecardApi = axios.create({
    baseURL: 'http://localhost:5001/api/Scorecard',
});


export const setScoreCard = (id) => scorecardApi.get(`/${id}`);