const { noticeBoard } = require("../../Admin/Models/noticeBoard.model.js");
const { studentModel } = require("../../Admin/Models/student.model.js");
const { asyncHandler } = require("../../Admin/Utils/asyncHandler.utils.js");
const { ApiError } = require("../../Admin/Utils/ApiError.utils.js");
const { ApiResponse } = require("../../Admin/Utils/ApiResponse.utils.js");

const viewNoticeBoard = asyncHandler(async (req, res) => {
  const student = await studentModel.findOne(
    { rollNo: req.user.rollNo },
    { branch: 1, _id: 0 }
  );

  if (!student) {
    throw new ApiError(400, "Student record does not exist");
  }

  const academicYear =
    1000 * Number(new Date().getFullYear().toString()[0]) +
    Number(req.user.rollNo.slice(0, 2));

  const notices = await noticeBoard.find(
    {
      branch: student.branch,
      academicYear,
    },
    {
      title: 1,
      url: 1,
      _id: 0,
    }
  );

  if (!notices) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "No notice is available at the moment",
          "Successful"
        )
      );
  }

  res.status(200).json(new ApiResponse(200, notices, "Successful"));
});

module.exports = { viewNoticeBoard };
