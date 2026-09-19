export const notificationSwagger = {
  "/api/notifications": {
    get: {
      tags: ["Notifications"],
      summary: "Get list of notifications for user",
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
  "/api/notifications/unread-count": {
    get: {
      tags: ["Notifications"],
      summary: "Get unread notifications count",
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
  "/api/notifications/read-all": {
    put: {
      tags: ["Notifications"],
      summary: "Mark all notifications as read",
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
  "/api/notifications/{id}/read": {
    put: {
      tags: ["Notifications"],
      summary: "Mark single notification as read",
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
        401: { description: "Unauthorized" },
        404: { description: "Not Found" },
        500: { description: "Internal Server Error" },
      },
    },
  },
};
