export const savedImageSwagger = {
  "/api/saved-images/check/{imageId}": {
    get: {
      tags: ["SavedImages"],
      security: [{ bearerAuth: [] }],
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
        401: { description: "Unauthorized" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/saved-images/toggle/{imageId}": {
    post: {
      tags: ["SavedImages"],
      security: [{ bearerAuth: [] }],
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
        401: { description: "Unauthorized" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
  },
};
