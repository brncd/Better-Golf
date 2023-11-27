import { BrowserRouter } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Toaster } from "react-hot-toast";
import { RoutesList } from "./components/RoutesList";
import { SideBar } from "./components/SideBar";
import { Divider } from "@nextui-org/react";

function App() {
  return (
    <BrowserRouter className="bg-zinc-50 dark:bg-black">
      <div>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#18181b",
              color: "#fff",
            },
          }}
        />
        <Navigation />
        <Divider />
        <div className="flex h-screen">
          <div className="w-1/4 sm:w-1/5 md:w-1/6 lg:w-1/8 xl:w-1/10">
            <SideBar />
          </div>
          <RoutesList />
        </div>
      </div>
    </BrowserRouter>
  );
}
export default App;
