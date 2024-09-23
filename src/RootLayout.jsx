// RootLayout.jsx
import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="flex flex-col min-h-screen items-start justify-start w-full m-0 p-0">
      <Navbar />
      <main className="flex-grow container w-full mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
