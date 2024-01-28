const axios = require('axios');

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function calculateDistance(origin, destination) {
  const originStructure = {
    origin: {
      location: {
        latLng: {
          latitude: origin.latitude,
          longitude: origin.longitude,
        },
      },
    },
  };

  const destinationStructure = {
    destination: {
      location: {
        latLng: {
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
      },
    },
  };

  const url = `https://maps.googleapis.com/maps/api/directions/json?units=imperial&origins=${originStructure}&destinations=${destinationStructure}&key=${API_KEY}`;

  return axios.get(url)
    .then((response) => {
      const { data } = response;
      // eslint-disable-next-line no-console
      console.log('DATA_1', data);

      if (data.rows[0].elements[0].status === 'OK') {
        return data.rows[0].elements[0].distance.value;
      }

      throw new Error('Unable to find distance via Google Maps API');
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
    });
}

export async function calculateTime(origin, destination) {
  const originStructure = {
    origin: {
      location: {
        latLng: {
          latitude: origin.latitude,
          longitude: origin.longitude,
        },
      },
    },
  };

  const destinationStructure = {
    destination: {
      location: {
        latLng: {
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
      },
    },
  };

  // console.log("ORIGIN", originStructure)
  // console.log("DESTINATION", destinationStructure)

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${originStructure.origin}&destinations=${destinationStructure}&key=${API_KEY}`;

  return axios.get(url)
    .then((response) => {
      const { data } = response;
      // eslint-disable-next-line no-console
      console.log('DATA_2', data);

      if (data.rows[0].elements[0].status === 'OK') {
        return data.rows[0].elements[0].duration.value;
      }
      throw new Error('Unable to find distance via Google Maps API');
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
    });
}
