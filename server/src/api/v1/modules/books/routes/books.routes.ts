// src/api/v1/modules/books/routes/books.routes.ts

import { Router } from "express";
import controller from "../controller/books.controller";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.get("/slug/:slug", controller.getBySlug);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
