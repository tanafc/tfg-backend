import app from "./app";
import "./database/mongoose";

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`Server up on port ${port}`);
});

export default server;
