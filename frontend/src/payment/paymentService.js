import axios from "axios";

const BASE_URL = "http://localhost:5005/api/payments";

export const createPayment = async (data) => {
    const res = await axios.post(`${BASE_URL}/create`, data);
    return res.data;
};

export const confirmPayment = async (data) => {
    const res = await axios.post(`${BASE_URL}/confirm`, data);
    return res.data;
};