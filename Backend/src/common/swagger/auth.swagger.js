export const authSwagger = {
  "/api/auth/signup": {
    post: {
      tags: ["Auth"],
      summary: "Register new user account",
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
      summary: "Sign in with email and password",
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
      summary: "Refresh access token",
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
      summary: "Get current user profile information",
      parameters: [
        {
          name: "token",
          in: "header",
          description: "Access Token",
          required: false,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Success" },
        401: { description: "Unauthorized" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
  },
};
