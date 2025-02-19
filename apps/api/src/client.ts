import axios from 'axios';

const { BATU_ENERGY_API_KEY } = process.env;

if (!BATU_ENERGY_API_KEY) {
  throw new Error('BATU_ENERGY_API_KEY is not set');
}

// Create an axios instance with default config
const batuEnergyApiClient = axios.create({
  baseURL: 'https://api.batuenergy.com',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': BATU_ENERGY_API_KEY
  }
});


export default batuEnergyApiClient;
