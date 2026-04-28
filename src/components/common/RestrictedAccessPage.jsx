import React from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, ShieldCheck } from "lucide-react";
import "./RestrictedAccessPage.css";

const RestrictedSimple = () => {
  const navigate = useNavigate();

  return (
    <div className="ra-container">
      <div className="ra-card">
        {/* Top Decorative element */}
        <div className="ra-header">
           <div className="ra-icon-wrapper">
              <ShieldCheck size={32} strokeWidth={2.5} />
           </div>
        </div>

        <div className="ra-content">
          <h1 className="ra-title">Mobile Only Feature</h1>
          <p className="ra-text">
           the best experience, this feature is exclusively available on our mobile application.
          </p>
          
          <div className="ra-divider">
            <span>GET THE APP</span>
          </div>
<div className="flex justify-center items-center">
          <div className="ra-buttons">
            <a 
              href="https://play.google.com/" 
              target="_blank" 
              className="ra-store-badge"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                alt="Get it on Google Play" 
              />
            </a>

            <a 
              href="https://www.apple.com/app-store/" 
              target="_blank" 
              className="ra-store-badge"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                alt="Download on the App Store" 
              />
            </a>
          </div>
        </div>
</div>
        {/* <button className="ra-back" onClick={() => navigate("/")}>
          Return to Dashboard
        </button> */}
      </div>
    </div>
  );
};

export default RestrictedSimple;