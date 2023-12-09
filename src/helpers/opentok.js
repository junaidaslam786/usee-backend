import axios from 'axios';
import jwt from 'jsonwebtoken';
import OpenTok from 'opentok';

export const getSessionId = async () => {
  try {
    return new Promise(resolve => {
      const opentok = new OpenTok(process.env.OPENTOK_APIKEY, process.env.OPENTOK_APISECRET);
      opentok.createSession({ mediaMode: 'routed' }, (error, session) => {
        if (error) {
          resolve(false);
        }

        resolve(session?.sessionId ? session.sessionId : false);
      });
    });
  } catch (err) {
    return false;
  }
};

export const getSessionEntryToken = async (user, role, sessionId) => {
  try {
    const opentok = new OpenTok(process.env.OPENTOK_APIKEY, process.env.OPENTOK_APISECRET);
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const tokenOptions = {
      role: role || 'publisher',
      expireTime: timestamp + (24 * 60 * 60),
    };
    tokenOptions.data = `firstname=${user.firstName}`;
    // Generate a token.
    const token = opentok.generateToken(sessionId, tokenOptions);
    return token;
  } catch (err) {
    return false;
  }
};

export const generateJwt = () => {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (60 * 60); // Token valid for 1 hour

  const payload = {
    iss: process.env.OPENTOK_APIKEY,
    ist: 'project',
    iat: now,
    exp: exp
  };

  return jwt.sign(payload, process.env.OPENTOK_APISECRET);
};

export const getSessionDetails = async (sessionId) => {
  try {
    // return new Promise(resolve => async () => {
    //   const opentok = new OpenTok(process.env.OPENTOK_APIKEY, process.env.OPENTOK_APISECRET);
    //   const response = await axios.get(`https://api.opentok.com/v2/project/${process.env.OPENTOK_APIKEY}/session/${sessionId}`, {
    //     headers: {
    //       'X-OPENTOK-AUTH': generateJwt(),
    //       'Content-Type': 'application/json'
    //     }
    //   });
    // });

    // return response.data; // This will contain the session details

    const opentok = new OpenTok(process.env.OPENTOK_APIKEY, process.env.OPENTOK_APISECRET);
    return new Promise(resolve => {
      opentok.listStreams(sessionId, (error, streams) => {
        if (error) {
          console.log(error.message);
          resolve(false);
        }

        if (!streams?.length) {
          resolve(false);
        }
        
        streams.map(function(stream) {
          console.log(stream.id); // '2a84cd30-3a33-917f-9150-49e454e01572'
          console.log(stream.videoType); // 'camera'
          console.log(stream.name); // 'Bob'
          console.log(stream.layoutClassList); // ['main']
        });
        resolve(streams);
      });
    });
  } catch (err) {
    console.error('Error fetching session details:', err);
    return false;
  }
};
