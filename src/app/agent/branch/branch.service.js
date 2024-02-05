const getAgentBranchById = async (id, dbInstance) => {
  const agentBranch = await dbInstance.agentBranch.findOne({
    where: { id },
    include: [{
      model: dbInstance.agent,
      attributes: ['id'],
      include: [{
        model: dbInstance.user,
        attributes: ['id', 'firstName', 'lastName'],
      }],
    }],
  });

  if (!agentBranch) {
    return false;
  }

  return agentBranch;
};

export const listAgentBranches = async (agentInfo, dbInstance) => {
  try {
    return await dbInstance.agentBranch.findAll({
      where: { userId: agentInfo.id },
      include: [{
        model: dbInstance.agent,
        attributes: ['id'],
        include: [{
          model: dbInstance.user,
          attributes: ['id', 'firstName', 'lastName'],
        }],
      }],
      order: [['id', 'desc']],
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('listAgentBranchesServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const createAgentBranch = async (reqBody, req) => {
  try {
    const { user: agentInfo, dbInstance } = req;

    // create agent branch
    const agentBranch = await dbInstance.agentBranch.create({
      name: reqBody.name,
      userId: agentInfo.id,
    });

    return (agentBranch.id) ? await getAgentBranchById(agentBranch.id, dbInstance) : agentBranch;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('createAgentBranchServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const updateAgentBranch = async (reqBody, req) => {
  try {
    const { name, branchId } = reqBody;
    const { dbInstance } = req;

    const agentBranch = await getAgentBranchById(branchId, dbInstance);

    agentBranch.name = name;
    await agentBranch.save();

    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('updateAgentBranchServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const getAgentBranch = async (id, dbInstance) => {
  try {
    const agentBranch = await getAgentBranchById(id, dbInstance);
    if (!agentBranch) {
      return { error: true, message: 'Invalid branch id or branch do not exist.' };
    }

    return agentBranch;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('getAgentBranchServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const deleteAgentBranch = async (id, dbInstance) => {
  try {
    const agentBranch = await getAgentBranchById(id, dbInstance);
    if (!agentBranch) {
      return { error: true, message: 'Invalid branch id or branch do not exist.' };
    }

    await dbInstance.agentBranch.destroy({
      where: {
        id,
      },
    });

    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('deleteAgentUserServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};
