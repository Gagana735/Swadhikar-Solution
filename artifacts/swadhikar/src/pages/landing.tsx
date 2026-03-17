import { Link } from "wouter";
import { ArrowRight, Scale, Wheat, Building2, ShieldCheck, HeartHandshake, Languages } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}images/logo-mark.png`} alt="Swadhikar Logo" className="w-8 h-8 object-contain" />
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              Swadhikar <span className="text-primary font-normal text-lg ml-1">स्वाधिकार</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground mr-4">
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
              <a href="#about" className="hover:text-primary transition-colors">About</a>
            </div>
            <Link 
              href="/chat" 
              className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0"
            >
              Start Chat
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Hero Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-xs uppercase tracking-wider mb-6 border border-secondary/20">
                <ShieldCheck className="w-4 h-4" />
                Empowering Citizens
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display leading-[1.1] tracking-tight mb-6 text-foreground">
                Your Rights.<br />
                Your Voice.<br />
                <span className="text-primary">Your Country.</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Swadhikar is your personal AI rights navigator. Get instant guidance on legal rights, farmer schemes, and government welfare in your local language.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/chat" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
                >
                  Start Navigating Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-secondary" />
                  10+ Languages
                </div>
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-secondary" />
                  Free & Accessible
                </div>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative lg:h-[600px] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-[3rem] -rotate-3 scale-105 -z-10"></div>
              <img 
                src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
                alt="Civic Empowerment" 
                className="w-full h-auto rounded-[2.5rem] shadow-2xl border-4 border-white object-cover"
              />
              
              {/* Floating UI Elements */}
              <div className="absolute -left-6 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-border/50 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Wheat className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">PM-Kisan Status</p>
                    <p className="text-sm font-bold text-foreground">Verified ✓</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 bg-white p-4 rounded-2xl shadow-xl border border-border/50 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Legal Advice</p>
                    <p className="text-sm font-bold text-foreground">RTI Draft Ready</p>
                  </div>
                </div>
              </div>

            </motion.div>

          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white border-y border-border/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Three Pillars of Empowerment</h2>
            <p className="text-lg text-muted-foreground">Comprehensive modules designed to clarify and claim what rightfully belongs to you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="group bg-background rounded-3xl p-8 shadow-sm border border-border hover:shadow-xl hover:border-blue-200 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Scale className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold font-display mb-3">Legal Advisor</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Understand your constitutional rights, how to file an FIR, draft RTI applications, and seek legal recourse in plain, simple language.
              </p>
              <Link href="/chat" className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1 group/link">
                Ask Legal Question <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="group bg-background rounded-3xl p-8 shadow-sm border border-border hover:shadow-xl hover:border-green-200 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wheat className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold font-display mb-3">Kisan Navigator</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Navigate agricultural subsidies, crop insurance (Fasal Bima), MSP rates, and farm equipment grants tailored to your state.
              </p>
              <Link href="/chat" className="text-green-600 font-bold hover:text-green-700 flex items-center gap-1 group/link">
                Find Farm Schemes <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="group bg-background rounded-3xl p-8 shadow-sm border border-border hover:shadow-xl hover:border-orange-200 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold font-display mb-3">Yojana Finder</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Discover housing, education, and healthcare welfare schemes (Yojanas) you are eligible for, and get step-by-step application guidance.
              </p>
              <Link href="/chat" className="text-orange-600 font-bold hover:text-orange-700 flex items-center gap-1 group/link">
                Check Eligibility <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-secondary text-secondary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Knowledge is Power.</h2>
          <p className="text-xl text-secondary-foreground/80 mb-10 font-medium">
            Join thousands of citizens who are claiming their rights and benefits with Swadhikar today.
          </p>
          <Link 
            href="/chat" 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-secondary font-bold text-lg shadow-xl hover:scale-105 transition-transform"
          >
            Start Chatting Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-muted py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
             <img src={`${import.meta.env.BASE_URL}images/logo-mark.png`} alt="Swadhikar Logo" className="w-8 h-8 object-contain grayscale opacity-70" />
            <span className="font-display font-bold text-xl tracking-tight text-white opacity-90">
              Swadhikar
            </span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} Swadhikar. An AI-powered civic tech initiative.
          </p>
          <div className="text-xs text-muted-foreground bg-white/10 px-3 py-1.5 rounded-full">
            Made for 🇮🇳 India
          </div>
        </div>
      </footer>

    </div>
  );
}
