/* eslint-disable @typescript-eslint/no-shadow */
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import {
  AuthProvider,
} from "./firebase/context/auth"
import {
  DBProvider,
} from "./firebase/context/database"
import { Channel } from "./channel";
import { AppNavbar } from "./navbar";
import "./index.scss";
import { LandingPage } from "./LandingPage";

const App = () => {
  return (
    <div className="bg-dark text-light app">
      <Router>
        <AuthProvider>
          <DBProvider>
            <div className="content">
              <AppNavbar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/c/:channel" element={<Channel />} />
              </Routes>
            </div>
          </DBProvider>
        </AuthProvider>
      </Router>
    </div>
  );
};
export default App;
