import { authSwagger } from "./auth.swagger.js";
import { imageSwagger } from "./image.swagger.js";
import { commentSwagger } from "./comment.swagger.js";
import { savedImageSwagger } from "./savedImage.swagger.js";
import { userSwagger } from "./user.swagger.js";
import { likeSwagger } from "./like.swagger.js";
import { followSwagger } from "./follow.swagger.js";
import { notificationSwagger } from "./notification.swagger.js";

export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Capstone Pinterest Clone API",
    description: "RESTful API Documentation for Pinterest Image Sharing Platform (Node.js Express + Prisma ORM)",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:3069",
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT Access Token directly",
      },
    },
  },
  paths: {
    ...authSwagger,
    ...commentSwagger,
    ...imageSwagger,
    ...savedImageSwagger,
    ...userSwagger,
    ...likeSwagger,
    ...followSwagger,
    ...notificationSwagger,
  },
};
