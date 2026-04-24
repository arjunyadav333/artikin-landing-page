import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Share2, X, Smartphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import "./ArtistProfile.css";

interface OrgProfileData {
  user: {
    id: string;
    username: string;
    role: string;
    profile: {
      orgName: string;
      organizationType: string;
      city: string;
      state: string;
      pincode: string;
      about: string;
      profileImage: string;
      coverImage: string;
      mobileNumber: string;
    };
  };
  portfolio: {
    certificates: any[];
    awards: any[];
    socialLinks: any[];
  };
  posts: any[];

  jobs: {
    _id: string;
    title: string;
    type: string;
    location: string;
    description: string;
  }[];
}

const normalizeUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `https://${url}`;
};

const OrgProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();

 const [activeTab, setActiveTab] = useState<"posts" | "about" | "jobs">("posts");
  const [activeSubTab, setActiveSubTab] = useState("basic");
// Modal State
const [isModalOpen, setIsModalOpen] = useState(false);
const [modalType, setModalType] = useState<'post' | 'image'>('post');

// Open Modal
const openModal = (type: 'post' | 'image') => {
  setModalType(type);
  setIsModalOpen(true);
  document.body.style.overflow = 'hidden';
};

// Close Modal
const closeModal = () => {
  setIsModalOpen(false);
  document.body.style.overflow = 'auto';
};
  const sectionRefs = {
    basic: useRef<HTMLElement>(null),
    certificates: useRef<HTMLElement>(null),
    awards: useRef<HTMLElement>(null),
  };

const { data, isLoading, isError } = useQuery({
  queryKey: ["orgProfile", id],
  queryFn: async () => {
    const res = await fetch(`/api/users/external/profile/${id}`);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.message || "API Failed");
    }

    return {
      ...json.data,
      jobs: json.data?.portfolio?.jobs || [],
    };
  },
});

// ✅ DEBUG HERE
console.log("FULL DATA 👉", data);
console.log("JOBS 👉", data?.jobs);

  const handleSubTabClick = (tab: string) => {
    setActiveSubTab(tab);
    sectionRefs[tab as keyof typeof sectionRefs]?.current?.scrollIntoView({
      behavior: "smooth",
    block: "start",
inline: "nearest"
    });
  };
  
useEffect(() => {
  if (activeTab !== "about") return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute("data-id");
          if (sectionId) {
            setActiveSubTab(sectionId);
          }
        }
      });
    },
    {
      root: null,
      rootMargin: "-120px 0px -60% 0px", 
      threshold: 0,
    }
  );

  Object.entries(sectionRefs).forEach(([key, ref]) => {
    if (ref.current) {
      ref.current.setAttribute("data-id", key);
      observer.observe(ref.current);
    }
  });

  return () => observer.disconnect();
}, [activeTab]);
  if (isLoading) return <Skeleton className="h-[400px]" />;
  if (isError || !data) return <p>Error loading profile</p>;
const user = data?.user;
const posts = data?.posts || [];
const portfolio = data?.portfolio || { certificates: [], awards: [] };
const jobs = data?.jobs || [];
  const profile = user.profile;

  return (
    <div className="artist-profile-page">
<header className="main-navbar">
  <div className="navbar-content">
    
    <a href="/" className="brand">
      <img 
        src="/ARTIKINLOGO.png" 
        alt="Artikin Logo" 
        className="logo"
      />
      <span className="brand-text">Artikin</span>
    </a>

    <button className="nav-download-btn">
      Download App Now
    </button>

  </div>
</header>
      <div className="profile-app-container">

        {/* HEADER */}
        <header className="profile-header">
          <div className="cover-image-container">
            <img src={normalizeUrl(profile.coverImage)} className="cover-image" />
            <div className="header-actions">
              <button className="icon-btn">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <div className="profile-info-container">
            <div className="avatar-wrapper">
              <img src={normalizeUrl(profile.profileImage)} className="profile-avatar" />
            </div>

            <div className="profile-header-main">
                    <div className="name-section">
     <h1>{profile.orgName}</h1>
              </div>
         

              <div className="meta-section">
                <span className="badge">{profile.organizationType}</span>
                <span>@{user.username}</span>
            
              </div>
    <div className="connection-stats">
  <span>
    <strong>{user.followersCount}</strong> Followers
  </span>
  {/* <span>
    <strong>{user.followingCount}</strong> Following
  </span> */}
</div>
              <p className="profile-bio">{profile.about}</p>
            </div>
          </div>
        </header>

        {/* MAIN TABS */}
        <nav className="main-tabs mb-2">
          <button
            className={`tab-btn ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            Posts
          </button>
<button
  className={`tab-btn ${activeTab === "jobs" ? "active" : ""}`}
  onClick={() => setActiveTab("jobs")}
>
  Jobs
</button>
          <button
            className={`tab-btn ${activeTab === "about" ? "active" : ""}`}
            onClick={() => setActiveTab("about")}
          >
            About More
          </button>
          
        </nav>

        {/* POSTS */}
        {activeTab === "posts" && (
          <div className="posts-grid">
            {posts.map((p, i) => (
              <div key={i} className="post-item" onClick={() => setIsModalOpen(true)}>
                <img src={normalizeUrl(p?.mediaFiles?.[0])} />
              </div>
            ))}
          </div>
        )}

        {/* ABOUT WITH STICKY SUB NAV */}
        {activeTab === "about" && (
          <>
      
            <div className="portfolio-sub-nav-wrapper">
              <nav className="portfolio-sub-nav">
                {["basic", "certificates", "awards"].map((tab) => (
                  <button
                    key={tab}
                    className={`sub-tab-btn ${activeSubTab === tab ? "active" : ""}`}
                    onClick={() => handleSubTabClick(tab)}
                  >
                    {tab === "basic" && "Basic Info"}
                    {tab === "certificates" && "Certificates"}
                    {tab === "awards" && "Awards"}
                  </button>
                ))}
              </nav>
            </div>

            <div className="portfolio-scroll-container">

        

{/* BASIC */}
<section ref={sectionRefs.basic} className="portfolio-section">
  <div className="section-header">
    <h2 className="section-title">Basic Information</h2>
  </div>

  <div className="info-grid">
    <div className="info-card">
      <span className="info-label">Organization</span>
      <span className="info-value">{profile.orgName}</span>
    </div>

    <div className="info-card">
      <span className="info-label">Username</span>
      <span className="info-value">{user.username}</span>
    </div>

    <div className="info-card">
      <span className="info-label">City</span>
      <span className="info-value">{profile.city}</span>
    </div>

    <div className="info-card">
      <span className="info-label">State</span>
      <span className="info-value">{profile.state}</span>
    </div>

    <div className="info-card">
      <span className="info-label">Pincode</span>
      <span className="info-value">{profile.pincode}</span>
    </div>

    <div className="info-card">
      <span className="info-label">Type</span>
      <span className="info-value">{profile.organizationType}</span>
    </div>
  </div>
</section>
{/* CERTIFICATES */}
<section ref={sectionRefs.certificates} className="portfolio-section">
 <div className="section-header">
  <h2 className="section-title">Certificates</h2>
</div>

  {portfolio.certificates.map((c, i) => (
    <div key={i} className="content-card">
      <h3 className="card-title">{c.title}</h3>
      <img
        src={normalizeUrl(c?.media?.[0])}
        className="card-image-main"
      />
      <p className="card-subtitle">{c.issuer}</p>
    </div>
  ))}
</section>

{/* AWARDS */}
<section ref={sectionRefs.awards} className="portfolio-section">
<div className="section-header">
  <h2 className="section-title">Awards</h2>
</div>
  {portfolio.awards.map((a, i) => (
    <div key={i} className="content-card">
      <h3 className="card-title">{a.title}</h3>
      <img
        src={normalizeUrl(a?.media?.[0])}
        className="card-image-main"
      />
      <p className="card-subtitle">{a.year}</p>
    </div>
  ))}
</section>

          

            </div>
          </>
        )}
{/* JOBS */}
{activeTab === "jobs" && (
  <div className="portfolio-scroll-container">
    <section className="portfolio-section">

      <div className="section-header">
        <h2 className="section-title">Jobs ({jobs?.length || 0})</h2>
      </div>

      {/* No Jobs */}
      {jobs?.length === 0 ? (
        <p className="card-subtitle">No jobs available</p>
      ) : (
        jobs.map((job, index) => (
      <div key={job.id || index} className="job-card">
<div className="job-header flex items-center justify-between">
  <h3 className="job-title">
    {job.projectName || job.role}
    
  </h3>
  <span className="job-badge">{job.experience}</span>
  </div>
  <p className="job-sub">
    {job.role} • {job.city}, {job.state}
  </p>



  <p className="job-desc">
    {job.jobDescription}
  </p>

  <div className="job-extra">
    <span>₹{job.salaryMin} - ₹{job.salaryMax}</span>
  </div>
<button className="apply-btn">Apply Now</button>
</div>
          
        ))
      )}

    </section>
  </div>
)}
  {/* Post Interaction Modal */}
{isModalOpen && (
  <div className="modal-overlay" onClick={closeModal}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      
      {/* Close Button */}
      <button className="modal-close" onClick={closeModal}>
        <X size={20} />
      </button>

      <div className="modal-body">

        {/* Avatar */}
        <div className="modal-avatar-wrapper">
          <img
            src={normalizeUrl(profile.profileImage)}
            alt="User"
            className="modal-avatar"
          />
        </div>

        {/* Title */}
        <h2 className="modal-title">
          See this {modalType}
        </h2>

        {/* Description */}
        <p className="modal-text">
          Sign up or log in to see <strong>@{user.username}</strong>'s full{" "}
          {modalType} and interact with the organization.
        </p>

        {/* Actions */}
        <div className="modal-actions">

          {/* Google Play */}
          <button className="btn-store google-play">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Google Play"
              className="store-img"
            />
          </button>

          {/* App Store */}
          <button className="btn-store app-store">
            <img
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              alt="App Store"
              className="store-img"
            />
          </button>

        </div>

        {/* Footer */}
        <p className="modal-footer-text">
          By continuing, you agree to Artikin's{" "}
          <strong>Terms of Use</strong> and{" "}
          <strong>Privacy Policy</strong>.
        </p>

      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default OrgProfile;