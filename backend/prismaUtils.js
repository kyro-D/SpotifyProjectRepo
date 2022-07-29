async function updateUser(prisma, userId, userData) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      ...userData,
    },
  });
}

async function createUser(prisma, userId, userData) {
  await prisma.user.create({
    id: userId,
    ...userData,
  });
}

async function doesUserExist(prisma, userId) {
  const results = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (results !== null) {
    return true;
  } else {
    return false;
  }
}

async function handleUserLogin(prisma, userId, userData) {
  if (await doesUserExist(prisma, userId)) {
    //user already exists
    updateUser(prisma, userId, userData);
  } else {
    createUser(prisma, userId, userData);
  }
}

async function getUserAccessToken(prisma, userId) {
  if (!(await doesUserExist(prisma, userId))) {
    //user doesn't already exist, nothing to retrieve
    return null;
  } else {
    const results = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        accessToken: true,
      },
    });
    return results.accessToken;
  }
}

module.exports = {
  handleUserLogin,
  getUserAccessToken,
};
