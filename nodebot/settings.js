let REST_API_URL;

if (process.env.NODE_ENV === "production") {
  REST_API_ROOT_URL = "http://api.secondmunch.com";
} else {
  REST_API_ROOT_URL = "http://127.0.0.1:8000";
}

exports.REST_API_ROOT_URL = REST_API_ROOT_URL;
