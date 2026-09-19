export const userSwagger = {
  "/api/users/profile": {
    get: {
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Success" },
        401: { description: "Unauthorized" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
    put: {
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                fullName: { type: "string", example: "Sang Nguyen Pro" },
                age: { type: "integer", example: 25 },
                avatar: { type: "string", format: "binary" },
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
  "/api/users/saved-images": {
    get: {
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Success" },
        401: { description: "Unauthorized" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/users/created-images": {
    get: {
      tags: ["Users"],
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
