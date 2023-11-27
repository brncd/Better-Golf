import axios from 'axios';

const scorecardApi = axios.create({
    baseURL: 'http://localhost:5001/api/ScorecardResults',
});


export const updateScorecard = (id, ScorecardInfo) => scorecardApi.put(`/${id}`, ScorecardInfo);

export const scoreCardResults = (id, pid) => scorecardApi.get(`/${id}/${pid}`);