import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./login/Login";
import Dashboard from "./dashboard/dashboard";
import "./approuter.css";

function AppRouter() {
  return (
    <BrowserRouter>
      <section className="application-body">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </section>
    </BrowserRouter>
  );
}

export default AppRouter;
