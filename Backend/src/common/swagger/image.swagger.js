export const imageSwagger = {
  "/api/images": {
    get: {
      tags: ["Images"],
      summary: "Get list of images with pagination and search filter",
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
          schema: { type: "string", example: "" },
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
      summary: "Upload new image",
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
      summary: "Search images by name",
      parameters: [
        {
          name: "name",
          in: "query",
          schema: { type: "string", example: "cat" },
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
      summary: "Get image details by ID",
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
      summary: "Delete image created by user",
      parameters: [
        {
          name: "id",
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
        400: { description: "Bad Request" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
  },
};
