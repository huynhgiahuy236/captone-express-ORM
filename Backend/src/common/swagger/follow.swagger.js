export const followSwagger = {
  "/api/follow/{authorId}": {
    post: {
      tags: ["Follow"],
      summary: "Toggle follow / unfollow author",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "authorId",
          in: "path",
          required: true,
          schema: { type: "integer", example: 2 },
        },
      ],
      responses: {
        200: { description: "Đã theo dõi / Đã hủy theo dõi thành công" },
        401: { description: "Unauthorized" },
        404: { description: "Người dùng không tồn tại" },
        500: { description: "Internal Server Error" },
      },
    },
  },
};
