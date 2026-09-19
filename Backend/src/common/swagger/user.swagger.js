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
                description: { type: "string", example: "Designer & Photographer" },
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
  "/api/users/privacy": {
    put: {
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                created: { type: "string", enum: ["PUBLIC", "PRIVATE"], example: "PUBLIC" },
                saved: { type: "string", enum: ["PUBLIC", "PRIVATE"], example: "PUBLIC" },
                liked_pins: { type: "string", enum: ["PUBLIC", "PRIVATE"], example: "PUBLIC" },
                liked_comments: { type: "string", enum: ["PUBLIC", "PRIVATE"], example: "PUBLIC" },
                followers: { type: "string", enum: ["PUBLIC", "PRIVATE"], example: "PUBLIC" },
                following: { type: "string", enum: ["PUBLIC", "PRIVATE"], example: "PUBLIC" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Success" },
        401: { description: "Unauthorized" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/users/{userId}": {
    get: {
      tags: ["Users"],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
      ],
      responses: {
        200: { description: "Success" },
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
  "/api/users/saved-images/{userId}": {
    get: {
      tags: ["Users"],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
      ],
      responses: {
        200: { description: "Success" },
        403: { description: "Forbidden (Private tab)" },
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
  "/api/users/created-images/{userId}": {
    get: {
      tags: ["Users"],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
      ],
      responses: {
        200: { description: "Success" },
        403: { description: "Forbidden (Private tab)" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/users/liked-images": {
    get: {
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Success" },
        401: { description: "Unauthorized" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/users/liked-comments": {
    get: {
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Success" },
        401: { description: "Unauthorized" },
        500: { description: "Internal Server Error" },
      },
    },
  },
};
