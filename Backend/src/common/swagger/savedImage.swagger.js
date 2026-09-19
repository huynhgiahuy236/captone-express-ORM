export const savedImageSwagger = {
  "/api/saved-images/check/{imageId}": {
    get: {
      tags: ["SavedImages"],
      summary: "Check if user has saved this image",
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
  "/api/saved-images/toggle/{imageId}": {
    post: {
      tags: ["SavedImages"],
      summary: "Toggle save / unsave image",
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
};
