export const likeSwagger = {
  "/api/likes/image/toggle/{imageId}": {
    post: {
      tags: ["Likes"],
      summary: "Toggle like / unlike image",
      parameters: [
        {
          name: "imageId",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
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
  "/api/likes/comment/toggle/{commentId}": {
    post: {
      tags: ["Likes"],
      summary: "Toggle like / unlike comment",
      parameters: [
        {
          name: "commentId",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
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
