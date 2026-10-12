const mongoose = require("mongoose");

const homeSchema = mongoose.Schema({
  houseName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  photo: String,
  description: String,
});

homeSchema.virtual("photoUrl").get(function () {
  if (!this.photo) {
    return "/images/home-placeholder.svg";
  }

  if (/^(https?:)?\/\//i.test(this.photo)) {
    return this.photo;
  }

  const normalizedPath = this.photo.replace(/\\/g, "/").replace(/^\.\/+/, "");
  const uploadsIndex = normalizedPath.toLowerCase().lastIndexOf("/uploads/");

  if (uploadsIndex !== -1) {
    return normalizedPath.slice(uploadsIndex);
  }

  if (normalizedPath.toLowerCase().startsWith("uploads/")) {
    return `/${normalizedPath}`;
  }

  return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
});

// homeSchema.pre('findOneAndDelete', async function(next) {
//   console.log('Came to pre hook while deleting a home');
//   const homeId = this.getQuery()._id;
//   await favourite.deleteMany({houseId: homeId});
//   next();
// });

module.exports = mongoose.model("Home", homeSchema);
