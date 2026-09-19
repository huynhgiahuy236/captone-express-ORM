export const authSwagger = {
  "/api/auth/signup": {
    post: {
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password", "fullName"],
              properties: {
                email: { type: "string", example: "testuser@gmail.com" },
                password: { type: "string", example: "123456" },
                fullName: { type: "string", example: "John Doe" },
                age: { type: "integer", example: 22 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Created" },
        400: { description: "Bad Request" },
        429: { description: "Too Many Requests" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/auth/signin": {
    post: {
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", example: "sangnguyen@gmail.com" },
                password: { type: "string", example: "123456" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Success" },
        400: { description: "Bad Request" },
        429: { description: "Too Many Requests" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/auth/refresh-token": {
    post: {
      tags: ["Auth"],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Success" },
        400: { description: "Bad Request" },
        401: { description: "Unauthorized" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/auth/info": {
    get: {
      tags: ["Auth"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Success" },
        401: { description: "Unauthorized" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
  },
};
