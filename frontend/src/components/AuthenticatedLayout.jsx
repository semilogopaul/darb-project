import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const AuthenticatedLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default AuthenticatedLayout;
