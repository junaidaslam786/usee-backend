import db from '@/database';

export const listRoles = async (dbInstance) => {
    try {
        return await dbInstance.role.findAll({
            include: [
              {
                model: dbInstance.permission, 
                attributes: ["id", "name", "key"],
                through: { attributes: [] }
              },
            ],
        });
    } catch(err) {
        console.log('listRolesServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const getRole = async (roleId, dbInstance) => {
    try {
        const role = await getRoleDetailById(roleId, dbInstance);
        if (!role) {
            return { error: true, message: 'Invalid role id or Role do not exist.'}
        }

        return role;
    } catch(err) {
        console.log('getRoleServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const createRole = async (reqBody, dbInstance) => {
    try {
        const { name, description, permissions } = reqBody;
        const result = await db.transaction(async (transaction) => {
            // Create role
            const role = await dbInstance.role.create({
                name,
                description
            }, { transaction });

            // Assign permission to role
            if (role && permissions) {
                const findPermissions = await dbInstance.permission.findAll({ where: { id: permissions }});
                await role.addPermissions(findPermissions, { transaction });
            }

            return role;
        });

        return await getRoleDetailById(result.id, dbInstance);
    } catch(err) {
        console.log('createRoleServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const updateRole = async (reqBody, dbInstance) => {
    try {
        const role = await dbInstance.role.findOne({ where: { id: reqBody.id }});
        if (!role) {
            return { error: true, message: 'Invalid role id or Role do not exist.'}
        }

        const { name, description, permissions } = reqBody;
        await db.transaction(async (transaction) => {
            role.name = name;
            role.description = description;
            await role.save({ transaction });

            // remove old permissions
            await role.setPermissions([]);

            // Assign permission to role
            if (role && permissions) {
                const findPermissions = await dbInstance.permission.findAll({ where: { id: permissions }});
                await role.addPermissions(findPermissions, { transaction });
            }
        });

        return true;
    } catch(err) {
        console.log('createRoleServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const deleteRole = async (roleId, dbInstance) => {
    try {
        const role = await getRoleDetailById(roleId, dbInstance);
        if (!role) {
            return { error: true, message: 'Invalid role id or Role do not exist.'}
        }

        await dbInstance.role.destroy({
            where: {
                id: roleId
            }
        });

        return true;
    } catch(err) {
        console.log('deleteRoleServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

const getRoleDetailById = async (roleId, dbInstance) => {
    const role = await dbInstance.role.findOne({
        where: { id: roleId },
        include: [
          {
            model: dbInstance.permission, 
            attributes: ["id", "name", "key"],
            through: { attributes: [] }
          },
        ],
    });

    if (!role) {
        return false;
    }

    return role;
}