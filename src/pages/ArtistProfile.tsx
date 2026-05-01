  import React, { useState, useEffect, useRef } from 'react';
  import { useParams, useNavigate } from 'react-router-dom';
  import { useQuery } from '@tanstack/react-query';
  import { 
    Share2, 
    Download, 
    Linkedin, 
    Facebook, 
    Instagram, 
    Twitter, 
    Link as LinkIcon, 
    Award, 
    FileText, 
    Briefcase, 
    Image as ImageIcon, 
    User,
    X,
    Smartphone
  } from 'lucide-react';
  import { Skeleton } from "@/components/ui/skeleton";
  import './ArtistProfile.css';

  interface ProfileData {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      isPrivate: boolean;
      createdAt: string;
      profile: {
        id: string;
        fullName: string;
        artForm: string;
        city: string;
        state: string;
        pincode: string;
        bio: string;
        profileImage: string;
        coverImage: string;
        mobileNumber: string;
      };
    };
    portfolio: {
      certificationAwards: Array<{
        title: string;
        date: string;
        type: 'certificate' | 'award';
        image: string;
      }>;
      pastProjects: Array<{
        title: string;
        role: string;
        description: string;
        media: string[];
      }>;
      portfolioMedia: {
        media: string[];
      };
      socialLinks: Array<{
        platform: string;
        url: string;
      }>;
    };
    posts: Array<{
      mediaFiles: string[];
    }>;
  }
  const BUCKET_URL = 'https://s3.ap-south-1.amazonaws.com/artikin.dev-bucket';
  const normalizeUrl = (url?: string) => {
    if (!url) return '';

    // already full URL
    if (/^https?:\/\//i.test(url)) return url;

    // S3 domain without protocol
    if (url.startsWith('s3')) {
      return `https://${url}`;
    }

    // fallback → attach bucket
    return `${BUCKET_URL}/${url}`;
  };
  const ArtistProfileSkeleton: React.FC = () => (
    <div className="artist-profile-page">
      <div className="profile-app-container">
        <header className="main-navbar">
          <div className="navbar-content px-4">
            <Skeleton className="h-8 w-24" style={{ backgroundColor: '#e2e8f0' }} />
            <Skeleton className="h-10 w-40 rounded-full" style={{ backgroundColor: '#e2e8f0' }} />
          </div>
        </header>
        <header className="profile-header">
          <Skeleton className="w-full h-[160px] md:h-[300px]" style={{ backgroundColor: '#f1f5f9' }} />
          <div className="profile-info-container">
            <div className="avatar-wrapper">
              <Skeleton className="w-[150px] h-[150px] rounded-full border-4 border-white" style={{ backgroundColor: '#e2e8f0' }} />
            </div>
            <div className="profile-header-main mt-4 space-y-4">
              <Skeleton className="h-8 w-64" style={{ backgroundColor: '#e2e8f0' }} />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" style={{ backgroundColor: '#f1f5f9' }} />
                <Skeleton className="h-6 w-32" style={{ backgroundColor: '#f1f5f9' }} />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full max-w-2xl" style={{ backgroundColor: '#f1f5f9' }} />
                <Skeleton className="h-4 w-5/6 max-w-xl" style={{ backgroundColor: '#f1f5f9' }} />
              </div>
            </div>
          </div>
        </header>
        <div className="main-tabs mt-8 flex px-4 gap-4">
          <Skeleton className="flex-1 h-12" style={{ backgroundColor: '#e2e8f0' }} />
          <Skeleton className="flex-1 h-12" style={{ backgroundColor: '#e2e8f0' }} />
        </div>
        <div className="posts-grid mt-4 px-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" style={{ backgroundColor: '#f1f5f9' }} />
          ))}
        </div>
      </div>
    </div>
  );

  const ArtistProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState<'posts' | 'portfolio'>('posts');
    const [activeSubTab, setActiveSubTab] = useState<string>('basic');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'post' | 'image'>('post');
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sectionRefs = {
      basic: useRef<HTMLElement>(null),
      media: useRef<HTMLElement>(null),
      projects: useRef<HTMLElement>(null),
      social: useRef<HTMLElement>(null),
      certificates: useRef<HTMLElement>(null),
      awards: useRef<HTMLElement>(null),
    };

const API_URL = 'http://localhost:4500/api';

const { data, isLoading, error, refetch, isFetching } = useQuery({
  queryKey: ["artistProfile", id],
  enabled: !!id,

  queryFn: async (): Promise<ProfileData> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const url = `${API_URL}/users/external/profile/${id}`;
      console.log("🚀 Fetching:", url);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // ✅ Read raw response first (prevents JSON crash)
      const text = await res.text();
      console.log("📦 Raw Response:", text);

      if (!res.ok) {
        throw new Error(
          `Server Error (${res.status}): ${text || res.statusText}`
        );
      }

      // ✅ Safe JSON parse
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          "Invalid JSON response → API returned HTML or broken JSON"
        );
      }

      if (!result?.success) {
        throw new Error(result?.message || "User not found");
      }

      return result.data;
    } catch (err: any) {
      console.error("❌ Fetch Error:", err);

      if (err.name === "AbortError") {
        throw new Error("Request timeout. Please try again.");
      }

      if (err.message?.includes("Failed to fetch")) {
        throw new Error(
          "Cannot connect to server. Check API URL or backend status."
        );
      }

      throw err;
    } finally {
      clearTimeout(timeout);
    }
  },

  retry: 2,
});
    const handleSubTabClick = (subtab: string) => {
      setActiveSubTab(subtab);
      const element = sectionRefs[subtab as keyof typeof sectionRefs]?.current;
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const openModal = (type: 'post' | 'image') => {
      setModalType(type);
      setIsModalOpen(true);
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      setIsModalOpen(false);
      document.body.style.overflow = 'auto';
    };

    useEffect(() => {
      if (activeTab === 'portfolio') {
        const observerOptions = {
          root: null,
          rootMargin: '-160px 0px -50% 0px',
          threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const sectionId = entry.target.id.replace('section-', '');
              setActiveSubTab(sectionId);
            }
          });
        }, observerOptions);

        Object.values(sectionRefs).forEach(ref => {
          if (ref.current) observer.observe(ref.current);
        });

        return () => observer.disconnect();
      }
    }, [activeTab]);

    if (isLoading) {
      return <ArtistProfileSkeleton />;
    }

  if (error) {
  return (
    <div className="error-container">
      <h5> Something went wrong</h5>
      <p>{(error as Error).message}</p>

      <button onClick={() => refetch()} className="retry-btn">
        Retry
      </button>
    </div>
  );
}

if (!data) {
  return <div className="error-container">No data found</div>;
}

    const { user, portfolio, posts } = data;
    const profile = user.profile;

    return (
      <div className="artist-profile-page">
        <div className="profile-app-container">
          {/* Site Navigation Header */}
          <header className="main-navbar">
            <div className="navbar-content">
              <a href="/" className="brand-logo">Artikin</a>
              <button className="nav-download-btn">Download App Now</button>
            </div>
          </header>

          {/* Profile Header Section */}
          <header className="profile-header">
            <div className="cover-image-container">
              <img src={normalizeUrl(profile.coverImage)} alt="Cover" className="cover-image" />
              <div className="header-actions">
                <button className="icon-btn"><Share2 size={18} /></button>
              </div>
            </div>
            <div className="profile-info-container">
              <div className="avatar-wrapper">
                <img src={normalizeUrl(profile.profileImage)} alt="Profile" className="profile-avatar" />
              </div>
              <div className="profile-header-main">
                <div className="name-section">
                  <h1>{profile.fullName}</h1>
                </div>
                <div className="meta-section">
                  <span className="badge">{profile.artForm}</span>
                  <span id="username">@{user.username}</span>
                </div>
                <p className="profile-bio">{profile.bio}</p>
              </div>
            </div>
          </header>

          {/* Main Tab Navigation */}
          <nav className="main-tabs mb-2">
            <button 
              className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </button>
            <button 
              className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              Portfolio
            </button>
          </nav>

          {/* Tab Content Containers */}
          {activeTab === 'posts' ? (
            <section id="posts-content" className="tab-content active">
              <div className="posts-grid">
                {posts.map((post, idx) => (
                  post.mediaFiles && post.mediaFiles.length > 0 && (
                    <div key={idx} className="post-item" onClick={() => openModal('post')}>
                      <img src={normalizeUrl(post.mediaFiles[0])} alt={`Post ${idx}`} />
                    </div>
                  )
                ))}
                {posts.length === 0 && <div className="no-data">No posts found.</div>}
              </div>
            </section>
          ) : (
            <section id="portfolio-content" className="tab-content active">
              <div className="portfolio-sub-nav-wrapper">
                <nav className="portfolio-sub-nav">
                  {['basic', 'media', 'projects', 'social', 'certificates', 'awards'].map(sub => (
                    <button 
                      key={sub}
                      className={`sub-tab-btn ${activeSubTab === sub ? 'active' : ''}`}
                      onClick={() => handleSubTabClick(sub)}
                    >
                      {sub.charAt(0).toUpperCase() + sub.slice(1).replace('basic', 'Basic Information').replace('media', 'Portfolio Media')}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="portfolio-scroll-container">
                {/* Basic Info */}
                <section id="section-basic" ref={sectionRefs.basic} className="portfolio-section">
                  <div className="section-header">
                    <h2 className="section-title">Basic Information</h2>
                  </div>
                  <div className="info-grid">
                    {[
                      { label: 'Name', value: profile.fullName },
                      { label: 'Username', value: user.username },
                      { label: 'City', value: profile.city },
                      { label: 'State', value: profile.state },
                      { label: 'Pincode', value: profile.pincode },
                      { label: 'Art Form', value: profile.artForm }
                    ].map((info, i) => (
                      <div className="info-card" key={i}>
                        <span className="info-label">{info.label}</span>
                        <span className="info-value">{info.value || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Media */}
                <section id="section-media" ref={sectionRefs.media} className="portfolio-section">
                  <div className="section-header">
                    <h2 className="section-title">Portfolio Media</h2>
                  </div>
                  <div className="media-grid">
                    {(portfolio.portfolioMedia?.media || []).map((m, i) => (
                      <div key={i} className="media-item" onClick={() => openModal('image')}>
                        <img src={normalizeUrl(m)} alt={`Media ${i}`} />
                      </div>
                    ))}
                    {(!portfolio.portfolioMedia?.media || portfolio.portfolioMedia.media.length === 0) && <p className="no-data">No media found.</p>}
                  </div>
                </section>

                {/* Projects */}
                <section id="section-projects" ref={sectionRefs.projects} className="portfolio-section">
                  <div className="section-header">
                    <h2 className="section-title">Past Projects</h2>
                  </div>
                  {(portfolio.pastProjects || []).length > 0 ? (portfolio.pastProjects || []).map((p, i) => (
                    <div className="content-card" key={i}>
                      <div className="card-header">
                        <div>
                          <h3 className="card-title">{p.title}</h3>
                          <p className="card-subtitle">{p.role}</p>
                        </div>
                      </div>
                      <p className="card-desc">{p.description}</p>
                      {p.media && p.media.length > 0 && (
                        <img 
                          src={normalizeUrl(p.media[0])} 
                          className="card-image-main" 
                          alt="Project" 
                          onClick={() => openModal('image')} 
                        />
                      )}
                    </div>
                  )) : <p className="no-data">No projects found.</p>}
                </section>

                {/* Social Links */}
                <section id="section-social" ref={sectionRefs.social} className="portfolio-section">
                  <div className="section-header">
                    <h2 className="section-title">Social Links</h2>
                  </div>
                  <div className="social-list">
                    {(portfolio.socialLinks || []).length > 0 ? (portfolio.socialLinks || []).map((s, i) => {
                      const getSocialIcon = (platform: string) => {
                        switch (platform.toLowerCase()) {
                          case 'linkedin': return <Linkedin size={18} />;
                          case 'facebook': return <Facebook size={18} />;
                          case 'instagram': return <Instagram size={18} />;
                          case 'twitter': return <Twitter size={18} />;
                          default: return <LinkIcon size={18} />;
                        }
                      };
                      const getSocialColor = (platform: string) => {
                        switch (platform.toLowerCase()) {
                          case 'linkedin': return '#0077b5';
                          case 'facebook': return '#1877f2';
                          case 'instagram': return '#e4405f';
                          case 'twitter': return '#1da1f2';
                          default: return '#666';
                        }
                      };
                      const color = getSocialColor(s.platform);
                      return (
                        <div className="social-item" key={i}>
                          <div className="social-icon-wrapper" style={{ background: `${color}20`, color }}>
                            {getSocialIcon(s.platform)}
                          </div>
                          <div className="social-details">
                            <div className="social-name">{s.platform}</div>
                            <div className="social-url">{s.url}</div>
                          </div>
                        </div>
                      );
                    }) : <p className="no-data">No social links found.</p>}
                  </div>
                </section>

                {/* Certificates */}
                <section id="section-certificates" ref={sectionRefs.certificates} className="portfolio-section">
                  <div className="section-header">
                    <h2 className="section-title">Certificates</h2>
                  </div>
                  {(portfolio.certificationAwards || []).filter(x => x.type === 'certificate').length > 0 ?
                    (portfolio.certificationAwards || []).filter(x => x.type === 'certificate').map((c, i) => (
                      <div className="content-card" key={i}>
                        <div className="card-header">
                          <h3 className="card-title">{c.title}</h3>
                        </div>
                        <img 
                          src={normalizeUrl(c.image)} 
                          className="card-image-main" 
                          alt="Certificate" 
                          onClick={() => openModal('image')} 
                        />
                        <p className="info-label" style={{ marginTop: '16px' }}>Issue Date</p>
                        <p className="info-value">{new Date(c.date).toLocaleDateString()}</p>
                      </div>
                    )) : <p className="no-data">No certificates found.</p>}
                </section>

                {/* Awards */}
                <section id="section-awards" ref={sectionRefs.awards} className="portfolio-section">
                  <div className="section-header">
                    <h2 className="section-title">Awards</h2>
                  </div>
                  {(portfolio.certificationAwards || []).filter(x => x.type === 'award').length > 0 ?
                    (portfolio.certificationAwards || []).filter(x => x.type === 'award').map((a, i) => (
                      <div className="content-card" key={i}>
                        <div className="card-header">
                          <h3 className="card-title">{a.title}</h3>
                        </div>
                        <img 
                          src={normalizeUrl(a.image)} 
                          className="card-image-main" 
                          alt="Award" 
                          onClick={() => openModal('image')} 
                        />
                        <p className="info-label" style={{ marginTop: '16px' }}>Date</p>
                        <p className="info-value">{new Date(a.date).toLocaleDateString()}</p>
                      </div>
                    )) : <p className="no-data">No awards found.</p>}
                </section>
              </div>
            </section>
          )}
        </div>

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
    );
  };

  export default ArtistProfile;
