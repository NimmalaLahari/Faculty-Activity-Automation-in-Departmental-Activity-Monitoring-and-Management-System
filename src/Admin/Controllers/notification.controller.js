const { notification } = require("../../Admin/Models/notifications.model.js");
const { ApiResponse } = require("../Utils/ApiResponse.utils.js");
const { ApiError } = require("../Utils/ApiError.utils.js");
const { asyncHandler } = require("../../Admin/Utils/asyncHandler.utils.js");

// To view faculties for student creating notification and sending notification to faculty
// use viewFaculty in viewFaculty.controller.js

const viewNotifications = asyncHandler(async (req, res) => {
  const { admin } = req.params;

  let query;
  if (req.user.rollNo) {
    query.toUserId = req.user.rollNo;
  } else if (req.user.facultyId) {
    query.toUserId = req.uesr.facultyId;
  } else if (admin === "admin") {
    query.toUserId = process.env.ADMIN_ID;
  }

  const result = await notification.find(query, { toUserId: 0 });

  if (!result) {
    throw new ApiError(500, "Internal Server Error: No Notifications found");
  }

  res.status(200).json(new ApiResponse(200, result, "Successful"));
});

const createNotification = asyncHandler(async (req, res) => {
  const { userId, message } = req.body;
  // if admin wants to create notification then provide "admin" in req.params.admin
  const { admin } = req.params;

  if (!userId || !message) {
    throw new ApiError(404, "Client Error: Info not provided");
  }

  let data = {};
  if (req.user.rollNo) {
    data.from = req.user.rollNo;
  } else if (req.user.facultyId) {
    data.from = req.user.facultyId;
  } else if (admin === "admin") {
    data.from = process.env.ADMIN_ID;
  } else {
    throw new ApiError(404, "User Not Authorized");
  }

  let result;
  if (req.user.rollNo || req.user.facultyId) {
    data = {
      ...data,
      toUserId: userId,
      firstname: req.userDetails.firstname,
      lastname: req.userDetails.lastname,
      message,
    };

    result = await notification.create(data);
  } else {
    data = {
      ...data,
      toUserId: userId,
      firstname: "Administrative Dept",
      message,
    };

    result = await notification.create(data);
  }

  if (!result) {
    throw new ApiError(
      500,
      "Internal Server Error: Couldn't create notification"
    );
  }

  res.status(200).json(new ApiResponse(200, {}, "Successful"));
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(
      404,
      "Client Error: Either Details are not provided or It is not an array"
    );
  }

  const result = await notification.deleteMany({ _id: { $in: ids } });

  if (!result) {
    throw new ApiError(
      500,
      "Internal Server Error: Couldn't delete notification"
    );
  }

  res.status(200).json(new ApiResponse(200, result, "Successful"));
});

const readNotification = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(404, "Client Error: ");
  }

  const result = await notification.updateMany(
    { _id: { $in: ids } },
    { $set: { hasRead: true } }
  );

  if (!result) {
    throw new ApiError(
      500,
      "Internal Server Error: Couldn't change to Mark As Read"
    );
  }

  res.status(200).json(new ApiResponse(200, {}, "Successful"));
});
