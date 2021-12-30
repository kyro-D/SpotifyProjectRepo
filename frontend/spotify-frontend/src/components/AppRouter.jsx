import {
    BrowserRouter,
    Routes,
    Route,
    Link
  } from "react-router-dom";

  import App from "../App";
  import Dashboard from "./dashboard/dashboard";
  import './approuter.css'
  

function AppRouter(){
    return(
        <BrowserRouter>
            <section className="application-body">
                <Routes>
                    <Route path="/" element={<App/>}/>
                    <Route path="/dashboard" element={<Dashboard/>}/>
                </Routes>
            </section>
        </BrowserRouter>
    )
}

export default AppRouter;