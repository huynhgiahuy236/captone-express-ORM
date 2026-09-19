export const imageSwagger = {
  "/api/images": {
    get: {
      tags: ["Images"],
      parameters: [
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1, example: 1 },
        },
        {
          name: "pageSize",
          in: "query",
          schema: { type: "integer", default: 12, example: 12 },
        },
        {
          name: "search",
          in: "query",
          schema: { type: "string", example: "dog" },
        },
      ],
      responses: {
        200: { description: "Success" },
        400: { description: "Bad Request" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
    post: {
      tags: ["Images"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["title"],
              properties: {
                title: { type: "string", example: "Autumn Landscape" },
                description: { type: "string", example: "Beautiful sunset wallpaper in vintage art style" },
                file: { type: "string", format: "binary" },
                imageUrl: { type: "string", example: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e" },
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
  "/api/images/search": {
    get: {
      tags: ["Images"],
      parameters: [
        {
          name: "name",
          in: "query",
          schema: { type: "string", example: "dog" },
        },
      ],
      responses: {
        200: { description: "Success" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/images/{id}": {
    get: {
      tags: ["Images"],
      parameters: [
        {
          name: "id",
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
    delete: {
      tags: ["Images"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
      ],
      responses: {
        200: { description: "Success" },
        400: { description: "Bad Request" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
  },
};
