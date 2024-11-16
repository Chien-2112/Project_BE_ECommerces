import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
const app = express();

// INIT MIDDLEWARE.
app.use(morgan("dev")); // Dùng trong môi trường development.
// app.use(morgan("combined")); // Dùng trong môi trường production

app.use(helmet());
app.use(compression()); // Giảm tải khối lượng DL truyền đi.

// INIT DATABASE.

// INIT ROUTES.
app.get("/", (request, response) => {
	const str = "Hello FantipJS";
	return response.status(200).json({
		msg: "Welcome Fantipjs",
		strRepeat: str.repeat(10000)
	});
});

export default app;