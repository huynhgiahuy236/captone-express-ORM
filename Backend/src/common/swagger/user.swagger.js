export const userSwagger = {
  "/api/users/profile": {
    get: {
      tags: ["Users"],
      summary: "Get current user profile and statistics",
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
    put: {
      tags: ["Users"],
      summary: "Update current user profile and avatar",
      parameters: [
        {
          name: "token",
          in: "header",
          description: "Access Token",
          required: false,
          schema: { type: "string" },
        },
      ],
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
      summary: "Update tab privacy settings",
      parameters: [
        {
          name: "token",
          in: "header",
          description: "Access Token",
          required: false,
          schema: { type: "string" },
        },
      ],
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
      summary: "Get public user profile by user ID",
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
        {
          name: "token",
          in: "header",
          description: "Optional: Access Token",
          required: false,
          schema: { type: "string" },
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
      summary: "Get list of saved images for current user",
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
  "/api/users/saved-images/{userId}": {
    get: {
      tags: ["Users"],
      summary: "Get list of saved images by user ID (respects privacy)",
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
        {
          name: "token",
          in: "header",
          description: "Optional: Access Token",
          required: false,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Success" },
        403: { description: "Forbidden" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/users/created-images": {
    get: {
      tags: ["Users"],
      summary: "Get list of created images for current user",
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
  "/api/users/created-images/{userId}": {
    get: {
      tags: ["Users"],
      summary: "Get list of created images by user ID",
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
        {
          name: "token",
          in: "header",
          description: "Optional: Access Token",
          required: false,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Success" },
        403: { description: "Forbidden" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/users/liked-images": {
    get: {
      tags: ["Users"],
      summary: "Get list of liked images for current user",
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
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/users/liked-comments": {
    get: {
      tags: ["Users"],
      summary: "Get list of liked comments for current user",
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
        500: { description: "Internal Server Error" },
      },
    },
  },
};
