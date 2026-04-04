import { Outlet } from "react-router-dom";
import { G } from "./globalStyle";

const RecruiterLayout = () => {
  return (
    <>
      <G />   
      <Outlet />
    </>
  );
};

export default RecruiterLayout;