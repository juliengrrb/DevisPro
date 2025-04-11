import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set default styling for date inputs to match shadcn/ui style
import { createGlobalStyle } from "@/lib/utils";

// Apply global styles
createGlobalStyle();

createRoot(document.getElementById("root")!).render(<App />);
