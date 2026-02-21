import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "LOC 8.0 Team : Mugiwara Coders"
    },
    servers: [
      {
        url: "http://localhost:5000/api"
      }
    ]
  },
  apis: ["./routes/*.js"]
};

const specs = swaggerJsdoc(options);

export default specs;