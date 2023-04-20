export const listProperties = async (dbInstance) => {
  try {
    const { count, rows } = await dbInstance.product.findAndCountAll({
      include: [
        {
          model: dbInstance.user,
          as: 'user',
          where: { deletedAt: null },
          attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
        },
      ],

      order: [['id', 'DESC']],
    });

    return {
      data: rows,
      totalItems: count,
    };
  } catch (err) {
    console.log('listPropertiesServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};
