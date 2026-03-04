import { auth, toNextJsHandler } from "@mehtrics/auth";

export const { POST, GET } = toNextJsHandler(auth);
