import { createRoot } from "react-dom/client";
import { Button } from "./components/ui/button";

const root = createRoot(document.body);
root.render(
  <>
    <h2 className="text-3xl ">Hello from React!</h2>
    <Button>Click me</Button>
  </>
);
