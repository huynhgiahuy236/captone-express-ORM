export const commentSwagger = {
  "/api/comments/image/{imageId}": {
    get: {
      tags: ["Comments"],
      parameters: [
        {
          name: "imageId",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
      ],
      responses: {
        200: { description: "Success" },
        400: { description: "Bad Request" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/comments": {
    post: {
      tags: ["Comments"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["imageId", "content"],
              properties: {
                imageId: { type: "integer", example: 1 },
                content: { type: "string", example: "This artwork looks totally amazing!" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Created" },
        400: { description: "Bad Request" },
        401: { description: "Unauthorized" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
  },
};
