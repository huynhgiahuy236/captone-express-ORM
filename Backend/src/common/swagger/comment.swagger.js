export const commentSwagger = {
  "/api/comments": {
    post: {
      tags: ["Comments"],
      summary: "Create comment for an image",
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
              required: ["imageId", "content"],
              properties: {
                imageId: { type: "integer", example: 1 },
                content: { type: "string", example: "Great picture!" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Created" },
        400: { description: "Bad Request" },
        401: { description: "Unauthorized" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/comments/image/{imageId}": {
    get: {
      tags: ["Comments"],
      summary: "Get comments by image ID",
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
};
