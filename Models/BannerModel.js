import mongoose from "mongoose";

const bannerSchema = mongoose.Schema(
  {
    linkImg: {
      type: String,
      required: false,
    },
    linkPage: {
      type: String,
      required: false,
    },
    isShow: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
