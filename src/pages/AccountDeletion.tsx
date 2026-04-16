import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  Trash2,
  UserMinus,
  Key,
  Mail,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import LegalHeader from "@/components/landing/LegalHeader";
import LegalFooter from "@/components/landing/LegalFooter";
import artikinLogo from "@/assets/artikin-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const BASE_URL = "https://api.artikin.com";
// const BASE_URL = "http://localhost:4500";
type FlowState =
  | "LOGIN"
  | "FORGOT_PASSWORD"
  | "RESET_PASSWORD"
  | "SELECTION"
  | "CONFIRM_ACTION"
  | "SUCCESS";

const AccountDeletion = () => {
  const [step, setStep] = useState<FlowState>("LOGIN");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"DEACTIVATE" | "DELETE" | null>(null);

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter both username and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const authToken = data.data?.token || data.token || data.data?.accessToken || data.accessToken;
        if (authToken) {
          setToken(authToken);
          setStep("SELECTION");
          toast.success("Logged in successfully");
        } else {
          toast.error("Authentication failed. Token not received.");
        }
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/users/password/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("OTP sent to your email");
        setStep("RESET_PASSWORD");
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmNewPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/users/password/reset`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password reset successfully. Please login.");
        setStep("LOGIN");
        setPassword("");
      } else {
        toast.error(data.message || "Reset failed");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyPasswordAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmPasswordInput) {
      toast.error("Please enter your password to confirm");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Verify password again by attempting a "login-like" verification if possible
      // or just trust the user and pass it to the final action.
      // Since the user wants to ask for password before submit, we'll use it in the payload.

      const endpoint = actionType === "DELETE"
        ? `${BASE_URL}/api/users/delete-account`
        : `${BASE_URL}/api/users/deactivate`;

      const method = actionType === "DELETE" ? "DELETE" : "POST";

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ password: confirmPasswordInput })
      });

      const data = await response.json();

      if (response.ok) {
        setStep("SUCCESS");
        toast.success(`Account ${actionType === "DELETE" ? "deleted" : "deactivated"} successfully`);
      } else {
        toast.error(data.message || "Verification failed. Incorrect password?");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (step) {
      case "LOGIN":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="border border-slate-200 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 bg-[#0073cc]">
                    <img src={artikinLogo} alt="Artikin Logo" className="w-12 h-12 object-contain" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Login to Artikin</CardTitle>
                {/* <CardDescription>
                  Enter your credentials to manage your account status
                </CardDescription> */}
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="username">Username, Email or Mobile Number</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        placeholder="Username, Email or Mobile Number"
                        className="pl-10 h-11 transition-all focus:ring-2 focus:ring-blue-500/20"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        onClick={() => setStep("FORGOT_PASSWORD")}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 h-11 transition-all focus:ring-2 focus:ring-blue-500/20"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        );

      case "FORGOT_PASSWORD":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="border border-slate-200 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="space-y-1">
                <button
                  onClick={() => setStep("LOGIN")}
                  className="w-fit flex items-center text-sm text-muted-foreground hover:text-blue-600 mb-2 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back to login
                </button>
                <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                <CardDescription>
                  Enter your email address to receive an OTP to reset your password.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleForgotPassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email Address</Label>
                    <Input
                      id="forgot-email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send OTP"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        );

      case "RESET_PASSWORD":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="border border-slate-200 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Verification</CardTitle>
                <CardDescription>
                  Check your email for the OTP and set a new password.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleResetPassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-center">
                    <p className="text-sm text-muted-foreground">OTP sent to: <strong>{email}</strong></p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="h-11 text-center text-lg tracking-[0.5em] font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Min 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="pl-10 h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirm Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-new-password"
                        type={showConfirmNewPassword ? "text" : "password"}
                        placeholder="Repeat new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        className="pl-10 h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset & Login"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        );

      case "SELECTION":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl mx-auto"
          >
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">What would you like to do?</h1>
              <p className="text-slate-500 max-w-lg mx-auto">We're sorry to see you go. Please choose if you want to deactivate your account temporarily or delete it permanently.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Deactivation Card */}
              <Card
                className={`relative group cursor-pointer transition-all duration-300 ${actionType === "DEACTIVATE" ? "border-blue-500 bg-blue-50/5 shadow-md" : "border-slate-200 hover:border-slate-300"}`}
                onClick={() => setActionType("DEACTIVATE")}
              >
                {actionType === "DEACTIVATE" && (
                  <div className="absolute top-4 right-4 text-blue-600 animate-in zoom-in-50 duration-300">
                    <CheckCircle2 size={24} fill="currentColor" className="text-white fill-blue-600" />
                  </div>
                )}
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600 transition-transform group-hover:scale-110">
                    <UserMinus size={24} />
                  </div>
                  <CardTitle className="text-xl">Deactivate Account</CardTitle>
                  <CardDescription>Temporary hiatus</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="mt-1"><CheckCircle2 size={14} className="text-blue-500" /></div>
                      <span>Your profile will be hidden. Reactivate any time by logging in.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1"><CheckCircle2 size={14} className="text-blue-500" /></div>
                      <span>No data is lost.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Deletion Card */}
              <Card
                className={`relative group cursor-pointer transition-all duration-300 ${actionType === "DELETE" ? "border-red-500 bg-red-50/5 shadow-md" : "border-slate-200 hover:border-slate-300"}`}
                onClick={() => setActionType("DELETE")}
              >
                {actionType === "DELETE" && (
                  <div className="absolute top-4 right-4 text-red-600 animate-in zoom-in-50 duration-300">
                    <CheckCircle2 size={24} fill="currentColor" className="text-white fill-red-600" />
                  </div>
                )}
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 text-red-600 transition-transform group-hover:scale-110">
                    <Trash2 size={24} />
                  </div>
                  <CardTitle className="text-xl">Delete Account</CardTitle>
                  <CardDescription>Permanent removal in 30 days</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="mt-1"><ShieldAlert size={14} className="text-red-500" /></div>
                      <span className="font-bold text-red-600">Account will be deleted in 30 days. Log in back to cancel.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1"><ShieldAlert size={14} className="text-red-500" /></div>
                      <span>All photos, projects, and connections will be gone forever.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1"><ShieldAlert size={14} className="text-red-500" /></div>
                      <span>Username will be released for others.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10 flex justify-center">
              <Button
                onClick={() => {
                  if (!actionType) {
                    toast.error("Please select an option first");
                    return;
                  }
                  setStep("CONFIRM_ACTION");
                }}
                disabled={!actionType}
                className={`px-10 h-14 rounded-full text-lg font-bold shadow-xl transition-all ${actionType === "DELETE" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                  } active:scale-95`}
              >
                Continue to {actionType === "DELETE" ? "Delete" : "Deactivate"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        );

      case "CONFIRM_ACTION":
        return (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg mx-auto"
          >
            <Card className="border border-slate-200 shadow-lg overflow-hidden bg-white/95">
              <div className={`h-2 w-full ${actionType === "DELETE" ? "bg-red-500" : "bg-blue-500"}`} />
              <CardHeader className="space-y-2 text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-2">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Final Confirmation</CardTitle>
                <CardDescription className="text-base">
                  To {actionType === "DELETE" ? "permanently delete" : "deactivate"} your account, please enter your current password.
                </CardDescription>
              </CardHeader>
              <form onSubmit={verifyPasswordAndSubmit}>
                <CardContent className="space-y-6 px-10">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Account</p>
                      <p className="text-sm font-bold text-slate-700">{username}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="confirm-pass" className="text-slate-700 font-semibold">Enter Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-pass"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 h-12 rounded-xl focus:ring-2"
                        placeholder="Enter your password"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 px-10 pb-10">
                  <Button
                    type="submit"
                    variant={actionType === "DELETE" ? "destructive" : "default"}
                    className={`w-full h-12 text-lg font-bold rounded-xl shadow-lg transition-all ${actionType === "DEACTIVATE" ? "bg-blue-600 hover:bg-blue-700" : ""
                      }`}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Yes, ${actionType === "DELETE" ? "Delete Permanently" : "Deactivate Now"}`}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-slate-500 font-medium"
                    onClick={() => setStep("SELECTION")}
                    disabled={loading}
                  >
                    Go Back
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        );

      case "SUCCESS":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto text-center"
          >
            <div className="mb-8 relative inline-block">
              <div className="absolute inset-0 bg-green-200 blur-2xl rounded-full opacity-50 scale-150 animate-pulse" />
              <div className="relative w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Action Completed
            </h2>
            <p className="text-slate-500 text-lg mb-10 leading-relaxed">
              Your account has been successfully {actionType === "DELETE" ? "scheduled for deletion" : "deactivated"}.
              {actionType === "DEACTIVATE"
                ? " You can come back whenever you want."
                : " It will be permanently removed in 30 days. Log in before then to cancel this request."}
            </p>
            <Button
              className="px-10 h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xl active:scale-95"
              onClick={() => window.location.href = "/"}
            >
              Back to Homepage
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] flex flex-col font-sans">
      <LegalHeader />

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-100/30 rounded-full blur-[120px]" />
      </div>

      <main className="flex-grow flex items-center justify-center py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <AnimatePresence mode="wait">
            {renderCurrentStep()}
          </AnimatePresence>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
};

export default AccountDeletion;
