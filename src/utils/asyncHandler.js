const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler }

// const asyncHandler = (func) => {
//     return async (req, res, next) => {
//         try {
//             await func(req, res, next);
//         } catch (error) {
//             next(error);
//         }
//     };
// };

// export default asyncHandler;