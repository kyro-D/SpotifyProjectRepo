import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./login/Login";
import Dashboard from "./dashboard/dashboard";
import Error from "./login/Error";
import "./approuter.css";

function AppRouter() {
  return (
    <BrowserRouter>
      <section className="application-body">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/error" element={<Error />} />
        </Routes>
      </section>
    </BrowserRouter>
  );
}

export default AppRouter;
