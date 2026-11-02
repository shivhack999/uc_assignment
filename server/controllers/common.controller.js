const uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file || !req.files.file[0]) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    console.log('files:- ', req.files.file);
    const filename = req.files.file[0].filename;
    
    // const file = req?.file;
    // console.log('file:- ', file);
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }
    const imageUrl = `/web/${filename}`;
    // save file after design model implementation

    return res.status(200).json({
      success: true,
      data: {
        fileUrl: imageUrl,
      },
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.log("Error in uploadFile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
    uploadFile
}