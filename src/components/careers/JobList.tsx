import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, ArrowRight, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const roles = [
  { 
    id: "eng-1", 
    title: "Senior Full Stack Engineer", 
    dept: "Engineering", 
    loc: "Remote / Hybrid", 
    type: "Full Time",
    info: "Experience: 5+ Years • Salary: Industry Standard • Growth: High"
  },
  { 
    id: "des-1", 
    title: "Product Designer", 
    dept: "Design", 
    loc: "Remote", 
    type: "Full Time",
    info: "Experience: 3+ Years • Tools: Figma, Framer • Creative Freedom: Unlimited"
  },
  { 
    id: "mkt-1", 
    title: "Community Manager", 
    dept: "Marketing", 
    loc: "Mumbai", 
    type: "Internship",
    info: "Duration: 3 Months • Stipend: Unpaid • Conversion: Performance-based"
  },
  { 
    id: "ops-1", 
    title: "Operations Associate", 
    dept: "Operations", 
    loc: "Bengaluru", 
    type: "Internship",
    info: "Duration: 6 Months • Stipend: Competitive • Impact: Operational Excellence"
  },
];

const JobList = () => {
  const [search, setSearch] = useState("");
  const [activeRoles, setActiveRoles] = useState(roles);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "jobs"));
        if (!querySnapshot.empty) {
          const jobsList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title || "",
            dept: doc.data().dept || doc.data().department || "",
            loc: doc.data().loc || doc.data().location || "",
            type: doc.data().type || "",
            info: doc.data().info || ""
          }));
          setActiveRoles(jobsList);
        }
      } catch (error) {
        console.error("Error fetching jobs from Firestore, using fallback:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);
  
  const filtered = activeRoles.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section id="roles" className="py-24 bg-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-8 border-b border-slate-100">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-blue-500 mb-6">Open Roles</h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">Join our global team of creators building the future of the creative industry.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search positions..."
              className="w-full h-12 pl-8 pr-4 bg-transparent border-none focus:outline-none focus:ring-0 font-medium text-lg placeholder:text-slate-300"
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 group-focus-within:bg-primary transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-slate-100 border border-slate-100">
          <AnimatePresence mode="popLayout">
            {filtered.map((role) => (
              <motion.div
                key={role.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Link 
                  to={`/careers/jobs/${role.id}`}
                  className="group block p-12 bg-white hover:bg-slate-50 transition-all duration-300 h-full relative"
                >
                  <div className="relative z-10">
                    <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-6 block">
                      {role.dept}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 group-hover:text-primary transition-colors leading-tight">
                      {role.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 mb-8 font-bold text-xs">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {role.loc}
                      </div>
                      <span className="text-slate-200">•</span>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        {role.type}
                      </div>
                    </div>

                    <p className="text-slate-500 text-sm leading-relaxed mb-10 font-medium opacity-80">
                      {role.info}
                    </p>

                    <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                      View Details
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default JobList;
