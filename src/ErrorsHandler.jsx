import { toast } from "react-toastify";

export const errorsHandler = (errors) => {
  const errorObject = {};
  switch (typeof errors) {
    case "string":
      errorObject.error = [errors];
      break;
    case "object":
      if (Array.isArray(errors)) {
        errors.forEach((error) => {
          errorObject[error.field] = [error.message];
        }
        );
      } else {
        Object.entries(errors).forEach(([key, value]) => {
          errorObject[key] = [];
          if (typeof value === "string") {
            errorObject[key].push(value);
          } else if (Array.isArray(value)) {
            value.forEach((error) => {
              if (typeof error === "string") {
                errorObject[key].push(error);
              } else if (Array.isArray(error)) {
                errorObject[key] = [...errorObject[key], ...error];
              } else {
                Object.entries(error).forEach(([key2, value2]) => {
                  const nestedErrors = errorsHandler(value2);
                  console.log("NESTED ERRORS: ", nestedErrors);
                  Object.entries(nestedErrors).forEach(([key3, value3]) => {
                    errorObject[`${key}.${key2}.${key3}`] = value3;
                  });
                  if (!errorObject[`${key}.${key2}`].length) {
                    delete errorObject[`${key}.${key2}`];
                  }
                });
              }
            });
          } else {
            const nestedErrors = errorsHandler(value);
            Object.entries(nestedErrors).forEach(([key2, value2]) => {
              errorObject[`${key}.${key2}`] = value2;
            });
          }
          console.log("ERROR OBJECT FROM HANDLER: ", errorObject);
          if (!errorObject[key].length) {
            delete errorObject[key];
          }
        });
      }
      break;
    default:
      break;
  }
  return errorObject;
};

/**
   *  @description: This function is used to notify the user of errors coming from the server
   * @param errors: array of errors or object of errors or string of errors
   * @return: null
   *
   */
export const notifyErrors = (errors) => {
  const errorsObject = errorsHandler(errors);
  Object.entries(errorsObject).forEach(([key, value]) =>
    toast.error(`${key}: ${value.join(", ")}`)
  );
};
