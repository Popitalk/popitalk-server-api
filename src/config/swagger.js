// const api = {
//   openapi: "3.0.0",
//   info: {
//     title: "Playnows API",
//     version: "0.6.0"
//   },
//   servers: [{ url: "/api" }],
//   tags: [
//     { name: "sessions" },
//     { name: "users" },
//     { name: "channels" },
//     { name: "members" },
//     { name: "messages" },
//     { name: "posts" },
//     { name: "comments" }
//   ],
//   paths: {
//     "/users": {
//       post: {
//         tags: ["users"],
//         summary: "Registers a new account",
//         operationId: "addUser",
//         requestBody: {
//           $ref: "#/components/requestBodies/addUser"
//         },
//         responses: {
//           "200": {
//             description: "successful operation"
//           }
//         }
//       }
//     }
//   },
//   components: {
//     requestBodies: {
//       addUser: {
//         required: true,
//         content: {
//           "application/json": {
//             schema: {
//               type: "object",
//               properties: {
//                 firstName: {
//                   type: "string"
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// };
// const { celebrate, Joi, errors, Segments } = require("celebrate");
// const j2od = require("joi-to-openapi-definition");
// const validators = require("../helpers/validators");

// // console.log("X", validators.addUser);
// // console.log("X", validators.addUser);
// const schema = Joi.object()
//   .keys({
//     username: Joi.string()
//       .alphanum()
//       .min(3)
//       .max(30)
//       .required(),
//     password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
//     access_token: [Joi.string(), Joi.number()],
//     birthyear: Joi.number()
//       .integer()
//       .min(1900)
//       .max(2013),
//     email: Joi.string().email({ minDomainSegments: 2 })
//   })
//   .with("username", "birthyear")
//   .without("password", "access_token");

// //  Add schema to OpenApi definition
// console.log("A", Joi);
// j2od.add_joi_model(api, "schema", schema);

// // j2od.add_joi_model(api, "addUser", validators.addUser._schema);
// console.log("Y", api);
// module.exports = api;

const Joi = require("@hapi/joi");
// const { celebrate, Joi, errors, Segments } = require("celebrate");
const j2od = require("joi-to-openapi-definition");

const definition = {
  //  Your OpenApi definition
  openapi: "3.0.0",
  info: {
    title: "Sample API",
    description:
      "Optional multiline or single-line description in [CommonMark](http://commonmark.org/help/) or HTML.",
    version: "0.1.9"
  },
  servers: [
    {
      url: "http://api.example.com/v1",
      description: "Optional server description, e.g. Main (production) server"
    },
    {
      url: "http://staging-api.example.com",
      description:
        "Optional server description, e.g. Internal staging server for testing"
    }
  ],
  paths: {}
};

const schema = Joi.object()
  .keys({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
    access_token: [Joi.string(), Joi.number()],
    birthyear: Joi.number()
      .integer()
      .min(1900)
      .max(2013),
    email: Joi.string().email({ minDomainSegments: 2 })
  })
  .with("username", "birthyear")
  .without("password", "access_token");

// //  Add schema to OpenApi definition
// j2od.add_joi_model(definition, "schema", schema);

// console.log(definition);

// const joi = require("joi");
const convert = require("joi-to-json-schema");

// const schema = Joi.object({
//   name: Joi.string()
//     .required()
//     .regex(/^\w+$/),
//   description: Joi.string()
//     .optional()
//     .default("no description provided"),
//   a: Joi.boolean()
//     .required()
//     .default(false),
//   b: Joi.alternatives().when("a", {
//     is: true,
//     then: Joi.string().default("a is true"),
//     otherwise: Joi.number().default(0)
//   })
// });

// console.log("SC", schema);
convert(schema);

module.exports = definition;
