import axios from 'axios';
import jwt from 'jsonwebtoken';
import OpenTok from 'opentok';

export const getSessionId = async (userId) => {
  try {
    return new Promise(resolve => {
      const opentok = new OpenTok(process.env.OPENTOK_API_KEY, process.env.OPENTOK_API_SECRET);
      opentok.createSession({ mediaMode: 'routed', archiveMode: "always", archiveName: "usee360_call"+userId.substr(userId.length - 6) }, (error, session) => {
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
    const opentok = new OpenTok(process.env.OPENTOK_API_KEY, process.env.OPENTOK_API_SECRET);
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
    iss: process.env.OPENTOK_API_KEY,
    ist: 'project',
    iat: now,
    exp: exp
  };

  return jwt.sign(payload, process.env.OPENTOK_API_SECRET);
};

export const getSessionDetails = async (sessionId) => {
  try {
    return new Promise(resolve => {
      const opentok = new OpenTok(process.env.OPENTOK_API_KEY, process.env.OPENTOK_API_SECRET);
      opentok.listArchives({ offset: 0, count: 5 }, function(err, archives, count) {
        if (err) return res.send(500, 'Could not list archives. error=' + err.message);
        resolve({ archives: archives, count: count });
      });

      // opentok.listStreams(sessionId, (error, streams) => {
      //   if (error) {
      //     console.log(error);
      //     resolve(false);
      //   }

      //   if (!streams?.length) {
      //     resolve(false);
      //   } else {
      //     streams.map(function (stream) {
      //       console.log(stream.id); // '2a84cd30-3a33-917f-9150-49e454e01572'
      //       console.log(stream.videoType); // 'camera'
      //       console.log(stream.name); // 'Bob'
      //       console.log(stream.layoutClassList); // ['main']
      //     });
      //     resolve(streams);
      //   }
      // });
    });
  } catch (err) {
    console.error('Error fetching session details:', err);
    return false;
  }
};

export const downloadArchive = async (archiveId) => {
  try {
    return new Promise(resolve => {
      const opentok = new OpenTok(process.env.OPENTOK_API_KEY, process.env.OPENTOK_API_SECRET);
      opentok.getArchive(archiveId, (error, archive) => {
        if (error) {
          console.log(error);
          resolve(false);
        }

        if (!archive) {
          resolve(false);
        } else {
          resolve(archive);
        }
      });
    });
  } catch (err) {
    console.error('Error fetching archive details:', err);
    return false;
  }
}
