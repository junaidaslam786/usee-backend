const axios = require('axios');
const { Client } = require('@googlemaps/google-maps-services-js');

const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function calculateDistanceMatrix(origin, destination) {
  const originStructure = [{
    latitude: origin.latitude,
    longitude: origin.longitude,
  }];

  const destinationStructure = [{
    latitude: destination.latitude,
    longitude: destination.longitude,
  }];

  const client = new Client({});

  const response = await client
    .distancematrix({
      params: {
        origins: originStructure,
        destinations: destinationStructure,
        key: MAPS_API_KEY,
      },
      timeout: 1000, // milliseconds
    });

  if (response.data.rows[0].elements[0].status === 'OK') {
    return response.data.rows[0].elements;
  }
  throw new Error('Unable to find distance via Google Maps API');
}

export async function calculateTime(origin, destination) {
  const originStructure = [{
    latitude: origin.latitude,
    longitude: origin.longitude,
  }];

  const destinationStructure = [{
    latitude: destination.latitude,
    longitude: destination.longitude,
  }];

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${originStructure.origin}&destinations=${destinationStructure}&key=${MAPS_API_KEY}`;

  return axios.get(url)
    .then((response) => {
      const { data } = response;
      // eslint-disable-next-line no-console
      console.log('DATA_2', data.rows[0].elements);

      if (data.rows[0].elements[0].status === 'OK') {
        return data.rows[0].elements[0].duration.value;
      }
      throw new Error('Unable to find distance via Google Maps API');
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
    });
}
