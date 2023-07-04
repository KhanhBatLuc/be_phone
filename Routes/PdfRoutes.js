import express from "express";
import asyncHandler from "express-async-handler";
import Pdf from "../Models/PdfModel.js";
import { admin, protect } from "./../Middleware/AuthMiddleware.js";
import upload from "../config/multer.js";

const pdfRoutes = express.Router();

// get all file pdf
pdfRoutes.get(
  "/all",
  asyncHandler(async (req, res) => {
    const pdfFile = await Pdf.find({}).sort({ _id: -1 });
    res.json(pdfFile);
  })
);

// GET SINGLE file
pdfRoutes.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const pdf = await Pdf.findById(req.params.id);
    if (pdf) {
      res.json(pdf);
    } else {
      res.status(404);
      throw new Error("pdf not Found");
    }
  })
);

// DELETE Pdf
pdfRoutes.delete(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const pdf = await Pdf.findById(req.params.id);
    if (pdf) {
      await pdf.remove();
      res.json({ message: "Pdf deleted" });
    } else {
      res.status(404);
      throw new Error("Pdf not Found");
    }
  })
);

pdfRoutes.get(
  "/searchpdf/:type",
  asyncHandler(async (req, res) => {
    const products = await Pdf.find({
      $text: {
        $search: req.params.type,
      },
    });
    res.json(products);
  })
);

// PRODUCT Pdf
pdfRoutes.post(
  "/:id/review",
  protect,
  asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const pdf = await Pdf.findById(req.params.id);

    if (pdf) {
      const alreadyReviewed = pdf.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Product already Reviewed");
      }
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      pdf.reviews.push(review);
      pdf.numReviews = pdf.reviews.length;
      pdf.rating =
        pdf.reviews.reduce((acc, item) => item.rating + acc, 0) /
        pdf.reviews.length;

      await pdf.save();
      res.status(201).json({ message: "Reviewed Added" });
    } else {
      res.status(404);
      throw new Error("pdf not Found");
    }
  })
);

// CREATE Pdf
pdfRoutes.post(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { name, image, file } = req.body;
    const productExist = await Pdf.findOne({ name });
    if (productExist) {
      res.status(400);
      throw new Error("Pdf name already exist");
    } else {
      const pdf = new Pdf({
        name,
        image,
        file,
        user: req.user._id,
      });
      if (pdf) {
        const createdproduct = await pdf.save();
        res.status(201).json(createdproduct);
      } else {
        res.status(400);
        throw new Error("Invalid product data");
      }
    }
  })
);

// UPDATE PRODUCT
pdfRoutes.put(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { name, image, file } = req.body;
    const pdf = await Pdf.findById(req.params.id);
    if (pdf) {
      pdf.name = name || pdf.name;
      pdf.image = image || pdf.image;
      pdf.file = file || pdf.file;

      const updatedProduct = await pdf.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Pdf not found");
    }
  })
);

export default pdfRoutes;
