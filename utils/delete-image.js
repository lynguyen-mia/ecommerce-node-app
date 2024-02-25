const fs = require("fs");

const deleteImg = (path) => {
  try {
    fs.unlink(path, (err) => {
      if (err) {
        return new Error(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = deleteImg;
