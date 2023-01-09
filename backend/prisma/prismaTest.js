const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // create myself as a test user in the db

  //   await prisma.user.create({
  //     data: {
  //       id: "testId",
  //       name: "TEST Kyle Rose",
  //       country: "US",
  //       accessToken:
  //         "BQAsZ5qa9oDq51vT-5p5iNPVOMRZOdylscAF53IaHBXQF0RP4NUkPkejZ7pzNEMjArlIVokn8WYNkw2DOL69JtPDerLWQbxCEN3qwFHHM2tL5wzDysnsU-uctg4Nz7BtL55yLoLI6LZAQ82EMGPokUvJZkU0o4pi88Nw3fuFFbAo6z_xDYCN00DBlFdMLXFJ5QquHJyOnWKG21KlByNqLlOtnGNPpRuMlEgRmPWZXq-s_fCwNNa6_3K-wp5PIzB9RMjKCOwXL3fYr_SgVfi77N6GkQ",
  //       refreshToken:
  //         "AQBd5I5TvDaFyssSc6zH2tKTibiMSSDxN3vTTcnDwsOEW9c-F8nLcVZBQYhlMHNPIgKAGlOMqUuldNcu6Dwa63HkhPU07dPfLq9ofJONVx0qrCIAf_ytHW86AYgH4IJphqc",
  //     },
  //   });
  console.log(
    await prisma.user.findUnique({
      where: {
        id: "testId",
      },
      select: {
        name: true,
      },
    })
  );

  const allUsers = await prisma.user.findMany();
  console.log(allUsers);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })

  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });
