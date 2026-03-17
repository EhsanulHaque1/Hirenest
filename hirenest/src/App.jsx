import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { AIProvider } from "./Components/AIContext";

import Home from "./Components/Home/Home";
import Footer from "./Components/Footer/Footer";
import AIAssistance from "./Components/AIAssistance/AIAssistance";
import Layout from "./Components/Layout/Layout";

// Pages
import WebDevelopment from "./Pages/WebDevelopment";
import AppDevelopment from "./Pages/AppDevelopment";
import UIUXDesign from "./Pages/UIUXDesign";
import Marketing from "./Pages/Marketing";
import PostProject from "./Pages/PostProject";
import FindFreelancers from "./Pages/FindFreelancers";
import HowItWorks from "./Pages/HowItWorks";
import CreateProfile from "./Pages/CreateProfile";
import FindJobs from "./Pages/FindJobs";
import FreelancerSupport from "./Pages/FreelancerSupport";
import Privacy from "./Pages/Privacy";
import TermsOfService from "./Pages/TermsOfService";
import Help from "./Pages/Help";
import PostJob from "./Pages/PostJob";
import BrowseApply from "./Pages/BrowseApply";
import Payments from "./Pages/Payments";
import Chat from "./Pages/Chat";
import Reviews from "./Pages/Reviews";
import AIAssistant from "./Pages/AIAssistant";
import AdminPanel from "./Pages/AdminPanel";
import AdminPage from "./Pages/AdminPage";

function App() {
  return (
    <AIProvider>
      <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/web-development" element={<Layout><WebDevelopment /></Layout>} />
        <Route path="/app-development" element={<Layout><AppDevelopment /></Layout>} />
        <Route path="/ui-ux-design" element={<Layout><UIUXDesign /></Layout>} />
        <Route path="/marketing" element={<Layout><Marketing /></Layout>} />
        <Route path="/post-project" element={<Layout><PostProject /></Layout>} />
        <Route path="/find-freelancers" element={<Layout><FindFreelancers /></Layout>} />
        <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
        <Route path="/create-profile" element={<Layout><CreateProfile /></Layout>} />
        <Route path="/find-jobs" element={<Layout><FindJobs /></Layout>} />
        <Route path="/support" element={<Layout><FreelancerSupport /></Layout>} />
        <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
        <Route path="/terms-of-service" element={<Layout><TermsOfService /></Layout>} />
        <Route path="/help" element={<Layout><Help /></Layout>} />
        <Route path="/post-job" element={<Layout><PostJob /></Layout>}/>
        <Route path="/browse-apply" element={<Layout><BrowseApply /></Layout>}/>
        <Route path="/payments" element={<Layout><Payments /></Layout>}/>
        <Route path="/chat" element={<Layout><Chat /></Layout>}/>
        <Route path="/reviews" element={<Layout><Reviews /></Layout>}/>
        <Route path="/ai-assistant" element={<Layout><AIAssistant /></Layout>}/>
<Route path="/admin-panel" element={<Layout><AdminPanel /></Layout>}/>
<Route path="/admin-page" element={<Layout><AdminPage /></Layout>}/>
      </Routes>

      {/* Footer stays outside Routes so it shows on all pages */}
      <Footer />
      <AIAssistance />
    </Router>
    </AIProvider>
  );
}

export default App;
