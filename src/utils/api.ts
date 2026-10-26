export const API_URL = import.meta.env.DEV
  ? `http://localhost:3000/api`
  : `https://cabunets-production.up.railway.app/api`;


  console.log(API_URL)