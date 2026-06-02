import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2, ShieldCheck, RotateCw } from "lucide-react";

interface ApplicationFormProps {
  jobTitle?: string;
}

const ApplicationForm = ({ jobTitle = "General Application" }: ApplicationFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFormValid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    phone.trim() !== "" &&
    college.trim() !== "" &&
    linkedin.trim() !== "" &&
    file !== null &&
    message.trim() !== "" &&
    captchaInput.trim() !== "";

  const generateCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 9) + 1); // 1-9
    setCaptchaNum2(Math.floor(Math.random() * 9) + 1); // 1-9
    setCaptchaInput("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        toast.error("Please upload a PDF file only.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. CAPTCHA Check
    if (parseInt(captchaInput) !== captchaNum1 + captchaNum2) {
      toast.error("Incorrect CAPTCHA answer. Please try again.");
      generateCaptcha();
      return;
    }

    // 2. Full Name Length Check
    if (name.trim().length > 60) {
      toast.error("Full Name cannot exceed 60 characters.");
      return;
    }

    // 3. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // 4. Phone Number Validation
    const phoneRegex = /^[+]?[0-9\s-]{10,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.error("Please enter a valid phone number (10 to 15 digits).");
      return;
    }

    // 5. College Length Check
    if (college.trim().length > 100) {
      toast.error("College/University name cannot exceed 100 characters.");
      return;
    }

    // 6. LinkedIn URL Validation
    if (!linkedin.toLowerCase().includes("linkedin")) {
      toast.error("Please enter a valid LinkedIn profile URL.");
      return;
    }

    // 7. Optional Portfolio URL Validation
    if (portfolio.trim() !== "") {
      const trimmedPortfolio = portfolio.trim().toLowerCase();
      if (!trimmedPortfolio.includes(".") || trimmedPortfolio.length < 4) {
        toast.error("Please enter a valid Portfolio URL.");
        return;
      }
    }

    // 8. Why Join / Message Length Check
    if (message.trim().length > 1000) {
      toast.error("Cover letter message cannot exceed 1000 characters.");
      return;
    }

    // 9. Resume File Validation
    if (!file) {
      toast.error("Please upload your resume PDF.");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed for resume.");
      return;
    }

    const maxFileSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxFileSize) {
      toast.error("Resume file size cannot exceed 5MB.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Uploading resume and submitting application...");

    try {
      // 1. Upload file to Cloudinary
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset || cloudName === "YOUR_CLOUDINARY_CLOUD_NAME") {
        throw new Error("Cloudinary configuration missing. Please update your environment variables.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to upload file to Cloudinary");
      }

      const uploadData = await response.json();
      const resumeUrl = uploadData.secure_url;

      // 2. Save application to Firestore
      await addDoc(collection(db, "job_applications"), {
        name,
        email,
        phone,
        college,
        linkedin,
        portfolio,
        resumeUrl,
        message,
        jobTitle,
        createdAt: new Date().toISOString(),
      });

      // 3. Send email via EmailJS REST API
      const emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const emailjsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (emailjsServiceId && emailjsTemplateId && emailjsPublicKey) {
        const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            service_id: emailjsServiceId,
            template_id: emailjsTemplateId,
            user_id: emailjsPublicKey,
            template_params: {
              name,
              email,
              phone,
              college,
              linkedin,
              portfolio,
              title: jobTitle,
              resume_url: resumeUrl,
              message: `POSITION: ${jobTitle}\n` +
                `-----------------------------------------\n` +
                `CANDIDATE DETAILS:\n` +
                `Name: ${name}\n` +
                `Email: ${email}\n` +
                `Phone: ${phone}\n` +
                `College/University: ${college}\n` +
                `LinkedIn Profile: ${linkedin}\n` +
                `Portfolio URL: ${portfolio || "Not Provided"}\n` +
                `Resume PDF Link: ${resumeUrl}\n` +
                `-----------------------------------------\n\n` +
                `COVER LETTER / MESSAGE:\n${message}`,
              time: new Date().toLocaleString('en-US', { hour12: true })
            }
          })
        });

        if (!emailResponse.ok) {
          console.error("EmailJS sending error:", await emailResponse.text());
        }
      }

      toast.success("Application submitted successfully!", { id: toastId });

      // Reset form fields
      setName("");
      setEmail("");
      setPhone("");
      setCollege("");
      setLinkedin("");
      setPortfolio("");
      setMessage("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      generateCaptcha();

    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit application. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="apply" className="bg-slate-50 p-8 md:p-12 rounded-[32px] border border-slate-100 shadow-sm">
      <h3 className="text-3xl font-bold text-slate-900 mb-8">Apply for this position</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              required
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="rounded-xl h-12 bg-white border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="rounded-xl h-12 bg-white border-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="rounded-xl h-12 bg-white border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="college">College / University *</Label>
            <Input
              id="college"
              required
              maxLength={100}
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="University Name"
              className="rounded-xl h-12 bg-white border-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile URL *</Label>
            <Input
              id="linkedin"
              required
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="rounded-xl h-12 bg-white border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio URL (Optional)</Label>
            <Input
              id="portfolio"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              placeholder="https://example.com/..."
              className="rounded-xl h-12 bg-white border-slate-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resume">Resume / CV (PDF) <span className="text-red-500">*</span></Label>
          <div
            onClick={triggerFileInput}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center bg-white hover:border-primary/30 transition-colors cursor-pointer"
          >
            <p className="text-slate-400 font-bold">
              {file ? `Selected: ${file.name}` : "Click to upload or drag and drop"}
            </p>
          </div>
          <p className="text-xs text-slate-400">Supported format: PDF only. Max file size: 5MB.</p>
          <input
            type="file"
            id="resume"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="message">Why join Artikin? <span className="text-red-500">*</span></Label>
            <span className="text-xs text-slate-400 font-medium">{message.length}/1000 characters</span>
          </div>
          <Textarea
            id="message"
            required
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what excites you about Artikin..."
            className="rounded-xl min-h-[150px] bg-white border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="captcha" className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              Security Verification: What is {captchaNum1} + {captchaNum2}? <span className="text-red-500">*</span>
            </Label>
            <button
              type="button"
              onClick={generateCaptcha}
              className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1 text-xs font-semibold focus:outline-none"
              title="Change Question"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
          <Input
            id="captcha"
            required
            type="number"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            placeholder="Enter the sum"
            className="rounded-xl h-12 bg-white border-slate-200"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-full text-lg font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {isSubmitting ? "Submitting Application..." : "Submit Application"}
        </Button>
      </form>
    </div>
  );
};

export default ApplicationForm;
