import OpenTok from 'opentok';

export const getSessionId = async () => {
  try {
    return new Promise(resolve => {
      const opentok = new OpenTok(process.env.OPENTOK_APIKEY, process.env.OPENTOK_APISECRET);
      opentok.createSession({ mediaMode: 'routed' }, (error, session) => {
        if (error) {
          resolve(false);
        }
        resolve(session.sessionId)
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
