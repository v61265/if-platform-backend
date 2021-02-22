class GeneralError extends Error {
  constructor(message) {
    super();
    this.message = message;
  }
  getStatus() {
    if (this instanceof BadRequest) return 400;
    if (this instanceof Unauthorized) return 401;
    if (this instanceof Forbidden) return 403;
    if (this instanceof NotFound) return 404;
    return 500;
  }
}

class BadRequest extends GeneralError {}
class Unauthorized extends GeneralError {}
class Forbidden extends GeneralError {}
class NotFound extends GeneralError {}

const MissingError = new BadRequest("資料輸入不齊全，請輸入完整資料");
const VarifyError = new Unauthorized("驗證失敗，請重新登入");

const handleError = (error, req, res, next) => {
  console.log("error:", error);
  if (error instanceof GeneralError) {
    return res.status(error.getStatus()).json({
      ok: 0,
      message: error.message,
    });
  }
  return res.status(500).json({
    ok: 0,
    message: error.message,
  });
};

const catchAsyncError = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

module.exports = {
  GeneralError,
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  MissingError,
  VarifyError,
  handleError,
  catchAsyncError,
};
