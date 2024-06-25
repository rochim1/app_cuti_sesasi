const {
  makeExecutableSchema
} = require("@graphql-tools/schema");
const {
  ApolloServerPluginDrainHttpServer
} = require("@apollo/server/plugin/drainHttpServer");
const {
  ApolloServer
} = require("@apollo/server");
const {
  ApolloServerErrorCode
} = require("@apollo/server/errors");
const {
  expressMiddleware
} = require("@apollo/server/express4");
const {
  applyMiddleware
} = require("graphql-middleware");
const {
  graphqlUploadExpress
} = require("graphql-upload-minimal");
const {
  typeDefs,
  resolvers
} = require("./graphql");
const cors = require('cors')

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const httpCreate = require("http");
const dotenv = require("dotenv");
const app = require('./express/index');
const cronUtilities = require('./graphql/cron/cron.utilities');
const NotifikasiUtilities = require('./graphql/notifikasi/notifikasi.utilities');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

dotenv.config();

//loader
const {
  userTypeLoader,
  divisiLoader,
  presensiLoader,
  taskLoader,
  tipeIdentitasLoader,
  cutiLoader,
  userLoader,
  apotikLoader,
  instansiLoader,
  inventarisLoader
} = require("./graphql");

// middleware
const auth = require("./middlewares/authMiddleware");
const {
  GraphQLError
} = require("graphql");
// const userRole_middleware = require('./middlewares/usersMiddleware');

//stagging
mongoose
  .connect(`${process.env.DB_CONNECT}`)
  .then(() => console.log("Database connect"))
  .catch((err) => console.log("Database disconnected", err));

//development
// mongoose
//   .connect(`${process.env.DB_DEV}`)
//   .then(() => console.log("Database connect"))
//   .catch((err) => console.log("Database disconnected", err));
const cron = require("node-cron");
async function startCron() {
  const instansiModel = require('./graphql/instansi/instansi.model');

  const getInstansi = await instansiModel.find({
    status: 'active'
  }).select('_id')
  const instansiId = []
  if (getInstansi && getInstansi.length) {
    for (const {
        _id
      } of getInstansi) {
      instansiId.push(_id)
    }
  }

  for (let _id of instansiId) {
    _id = _id.toString()

    cronUtilities.listCronJobs.map(({
      trigger_name,
      trigger_date,
      func
    }) => {
      if (!cronUtilities.listCronJobsBlocked.includes(trigger_name)) {
        if (func && func.length) {
          for (const funct of func) {
            console.log(`${funct} cron ready`)
            cron.schedule(trigger_date, async () => {
              cronUtilities[funct](trigger_name, _id)
            })
          }
        }
      }
    })

    await NotifikasiUtilities.StartingWorkNotif(_id);
    await NotifikasiUtilities.EndWorkNotif(_id);
    await NotifikasiUtilities.RestWorkNotif(_id);
  }
}

async function startApolloServer() {
  app.use(graphqlUploadExpress({
    maxFileSize: 6000000,
    maxFiles: 5
  }));
  const httpServer = httpCreate.createServer(app);

  const makeExecutable = makeExecutableSchema({
    typeDefs,
    resolvers
  });
  const protectedAuth = applyMiddleware(makeExecutable, auth);

  const logRequest = (operationName, query, variables) => {
    const logEntry = {
      operationName,
      query,
      variables,
      time: new Date().toISOString(),
    };
    const logFilePath = path.join('./', 'graphql_requests.log');
    fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');
  };

  const logError = (error, query, variables) => {
    const logEntry = {
      error: error.message,
      query,
      variables,
      time: new Date().toISOString(),
    };

    const logFilePath = path.join('./', 'graphql_errors.log');
    fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');
  };

  const getTelegramChatID = async () => {
    const url = `https://api.telegram.org/bot${process.env.TELE_TOKEN}/getUpdates`;

    try {
      const response = await axios.get(url);
      const updates = response.data.result;

      if (updates.length === 0) {
        console.log('No messages found. Send a message to your bot first.');
        return;
      }

      // Assuming you want the chat ID of the last message
      const chatId = updates[updates.length - 1].message.chat.id;
      console.log('TELEGRAM_CHAT_ID:', chatId);
      return chatId
    } catch (error) {
      console.error('Error fetching updates:', error.response ? error.response.data : error.message);
    }
  };

  const sendTelegramMessage = async (message) => {
    try {
      if (process.env.NODE_ENV && process.env.NODE_ENV == "PRODUCTION") {
        message = `from PRODUCTION ${message}`;
      }
  
      const TELEGRAM_CHAT_ID = await getTelegramChatID()
      if (TELEGRAM_CHAT_ID) {
        const url = `https://api.telegram.org/bot${process.env.TELE_TOKEN}/sendMessage`;
        await axios.post(url, {
          chat_id: TELEGRAM_CHAT_ID,
          text: message
        });
      }
    } catch (error) {
      console.error('Error send telegram message:', error.response ? error.response.data : error.message);
    }
  };

  const server = new ApolloServer({
    schema: protectedAuth,
    plugins: [
      ApolloServerPluginDrainHttpServer({
        httpServer
      }),
      {
        requestDidStart(requestContext) {
          return {
            didEncounterErrors(ctx) {
              if (ctx.errors && process.env.NODE_ENV && process.env.NODE_ENV == "PRODUCTION") {
                ctx.errors.forEach((err) => {
                  try {
                    sendTelegramMessage(err)
                  } catch (error) {
                    console.log('cant send telegram error message')
                  }
                  // logError(
                  //   err,
                  //   ctx.request.query,
                  //   ctx.request.variables
                  // );
                });
              }
            },
          };
        },
      }
    ],
    csrfPrevention: false,
    includeStacktraceInErrorResponses: true,
    // formatError: (formattedError, error) => {
    //   logError(error, error.source?.body, error.positions);
    //   // Return a different error message
    //   if (formattedError.extensions.code === ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED) {
    //     throw new GraphQLError("Your query doesn't match the schema. Try double-checking it!", {
    //       extensions: {
    //         code: "MISDIRECTED_REQUEST",
    //         http: {
    //           status: 421
    //         }
    //       }
    //     })
    //   }
    //   if (error) {
    //     throw new GraphQLError(error.message, {
    //       extensions: {
    //         code: error.extensions.code,
    //         http: {
    //           status: error.extensions.http && error.extensions.http.status ? error.extensions.http.status : 400
    //         },
    //       },
    //     });
    //   }
    // },
  });

  await startCron()
  await server.start();
  app.use(
    bodyParser.json(),
    cors(),
    expressMiddleware(server, {
      context: function ({
        req
      }) {
        req;
        return {
          token: req.headers.authorization,
          apps_id: req.headers.apps_id ? req.headers.apps_id : null,
          userTypeLoader,
          divisiLoader,
          presensiLoader,
          taskLoader,
          tipeIdentitasLoader,
          userLoader,
          apotikLoader,
          instansiLoader,
          inventarisLoader,
          cutiLoader
        };
      },
    })
  );

  await new Promise((resolve) => {
    httpServer.listen({
      port: process.env.PORT
    }, resolve);
  });
  console.log(`🚀 Server ready at http://localhost:${process.env.PORT}/`);
}

startApolloServer();