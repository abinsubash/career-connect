import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/user/login";
import SignupPage from "./pages/user/signup";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/signup" element = {<SignupPage/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;