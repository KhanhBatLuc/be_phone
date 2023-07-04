import express from "express";
import asyncHandler from "express-async-handler";
import { admin, protect } from "../Middleware/AuthMiddleware.js";
import Category from "../Models/CategoryModel.js";
import Banner from "../Models/BannerModel.js";
const categoryRouter = express.Router();

// ADMIN GET ALL ORDERS
categoryRouter.get(
  "/all",
  asyncHandler(async (req, res) => {
    const category = await Category.find({});
    res.json(category);
  })
);

categoryRouter.get(
  "/all/status",
  asyncHandler(async (req, res) => {
    const category = await Category.find({ isShow: true, isParent: true });
    res.json(category);
  })
);

categoryRouter.get(
  "/all/status/no",
  asyncHandler(async (req, res) => {
    const category = await Category.find({ isParent: false });
    res.json(category);
  })
);

categoryRouter.get(
  "/all/status-detail/:id",
  asyncHandler(async (req, res) => {
    const category = await Category.find({
      isShow: true,
      isParent: false,
      parentCategory: req.params.id,
    });
    res.json(category);
  })
);
// GET CATEGORY BY ID
categoryRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
      res.json(category);
    } else {
      res.status(404);
      throw new Error("Category Not Found");
    }
  })
);

// CREATE ORDER
categoryRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, description, isShow, parentCategory } = req.body;

    const check = await Category.find({
      name: name,
    });

    if (check.length > 0) {
      res.status(400).json("trung danh muc");
    } else {
      if (parentCategory) {
        const category = new Category({
          name: name,
          description: description,
          isShow: isShow,
          parentCategory: parentCategory,
        });
        const categoryR = await category.save();
        res.status(201).json(categoryR);
      } else {
        const category = new Category({
          name: name,
          description: description,
          isShow: isShow,
          isParent: true,
        });
        const categoryR = await category.save();
        res.status(201).json(categoryR);
      }
    }
  })
);

// DELETE CATEGORY
categoryRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (category) {
      await category.remove();
      res.json({ message: "Category deleted" });
    } else {
      res.status(404);
      throw new Error("Category not Found");
    }
  })
);

categoryRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { name, description, isShow, parentCategory } = req.body;
    const category = await Category.findById(req.params.id);
    if (category) {
      if (parentCategory) {
        category.name = name;
        category.description = description;
        category.isShow = isShow;
        category.parentCategory = parentCategory;

        const categoryUpdate = await category.save();
        res.json(categoryUpdate);
      } else {
        category.name = name;
        category.description = description;
        category.isShow = isShow;

        const categoryUpdate = await category.save();
        res.json(categoryUpdate);
      }
    } else {
      res.status(404);
      throw new Error("Category not found");
    }
  })
);

categoryRouter.put(
  "/status/:id",
  asyncHandler(async (req, res) => {
    const { isShow } = req.body;
    const category = await Category.findById(req.params.id);
    if (category) {
      category.isShow = isShow;

      const categoryUpdate = await category.save();
      res.json(categoryUpdate);
    } else {
      res.status(404);
      throw new Error("Category not found");
    }
  })
);

categoryRouter.get(
  "/banner-detail/:detailId",
  asyncHandler(async (req, res) => {
    const banner = await Banner.findOne({
      _id: req.params.detailId,
    });

    if (banner) {
      res.json(banner);
    } else {
      res.status(404);
      throw new Error("banner Not Found");
    }
  })
);

categoryRouter.get(
  "/all/banner",
  asyncHandler(async (req, res) => {
    const banner = await Banner.find({});

    if (banner) {
      res.json(banner);
    } else {
      res.status(404);
      throw new Error("banner Not Found");
    }
  })
);

categoryRouter.post(
  "/banner",
  asyncHandler(async (req, res) => {
    const { linkImg, linkPage, isShow } = req.body;

    const check = await Banner.find({
      linkImg: linkImg,
    });

    if (check.length > 0) {
      res.status(400).json("trung danh muc");
    } else {
      const category = new Banner({
        linkImg: linkImg,
        isShow: isShow,
        linkPage: linkPage,
      });
      const categoryR = await category.save();
      res.status(200).json(categoryR);
    }
  })
);

categoryRouter.put(
  "/banner/:id",
  asyncHandler(async (req, res) => {
    const { linkImg, linkPage, isShow } = req.body;
    const category = await Banner.findById(req.params.id);
    if (category) {
      category.isShow = isShow;
      category.linkImg = linkImg;
      category.linkPage = linkPage;

      const categoryUpdate = await category.save();
      res.json(categoryUpdate);
    } else {
      res.status(404);
      throw new Error("Banner not found");
    }
  })
);

categoryRouter.delete(
  "/banner/delete/:id",
  asyncHandler(async (req, res) => {
    const category = await Banner.findById(req.params.id);
    if (category) {
      await category.remove();
      res.json({ message: "Category deleted" });
    } else {
      res.status(404);
      throw new Error("Category not Found");
    }
  })
);

export default categoryRouter;
