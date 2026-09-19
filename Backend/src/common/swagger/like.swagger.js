export const likeSwagger = {
  "/api/likes/image/toggle/{imageId}": {
    post: {
      tags: ["Likes"],
      summary: "Toggle like / unlike image",
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
        200: { description: "Đã thả tim hình ảnh / Đã bỏ tim hình ảnh" },
        401: { description: "Unauthorized" },
        404: { description: "Hình ảnh không tồn tại" },
        500: { description: "Internal Server Error" },
      },
    },
  },
  "/api/likes/comment/toggle/{commentId}": {
    post: {
      tags: ["Likes"],
      summary: "Toggle like / unlike comment",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "commentId",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
      ],
      responses: {
        200: { description: "Đã thích bình luận / Đã bỏ thích bình luận" },
        401: { description: "Unauthorized" },
        404: { description: "Bình luận không tồn tại" },
        500: { description: "Internal Server Error" },
      },
    },
  },
};
