import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  Bell, 
  Mail, 
  Shield, 
  Cloud, 
  Puzzle, 
  CheckCircle, 
  Clock, 
  BookmarkPlus, 
  Star,
  Users,
  ArrowRight,
  Play,
  Download,
  Sparkles,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';

const features = [
  {
    icon: <BookmarkPlus className="h-8 w-8" />,
    title: 'Save Instagram Posts',
    description: 'Capture inspiration, ideas, and important posts directly from Instagram with one click.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: <Bell className="h-8 w-8" />,
    title: 'Smart Reminders',
    description: 'Set reminders for your notes and get notified via email or browser at the perfect time.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: <Mail className="h-8 w-8" />,
    title: 'Email & Browser Alerts',
    description: 'Choose how you want to be notified—never miss a thing with flexible notification options.',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: <Cloud className="h-8 w-8" />,
    title: 'Access Anywhere',
    description: 'Your notes sync securely to the cloud. Access them from any device, anytime.',
    color: 'from-emerald-500 to-teal-500'
  }
];

const steps = [
  {
    icon: <Download className="h-6 w-6" />,
    title: 'Install Extension',
    description: 'Add Instagram Notes to your browser in seconds.',
    color: 'bg-blue-500'
  },
  {
    icon: <CheckCircle className="h-6 w-6" />,
    title: 'Sign In',
    description: 'Log in securely with your Google account.',
    color: 'bg-purple-500'
  },
  {
    icon: <BookmarkPlus className="h-6 w-6" />,
    title: 'Save Notes',
    description: 'Take notes on any Instagram post or profile.',
    color: 'bg-pink-500'
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: 'Get Reminders',
    description: 'Receive notifications when it matters most.',
    color: 'bg-orange-500'
  }
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Content Creator',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    quote: 'Instagram Notes completely transformed how I organize my inspiration. I never lose track of amazing content anymore!',
    rating: 5
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Digital Marketer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    quote: 'The reminder feature is a game-changer. I can save posts for later and actually remember to come back to them.',
    rating: 5
  },
  {
    name: 'Emily Johnson',
    role: 'Small Business Owner',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    quote: 'Perfect for keeping track of competitor posts and industry trends. The search feature makes everything so easy to find.',
    rating: 5
  }
];

const stats = [
  { number: '50K+', label: 'Active Users', icon: <Users className="h-5 w-5" /> },
  { number: '500K+', label: 'Notes Saved', icon: <BookmarkPlus className="h-5 w-5" /> },
  { number: '99.9%', label: 'Uptime', icon: <Shield className="h-5 w-5" /> },
  { number: '24/7', label: 'Support', icon: <Clock className="h-5 w-5" /> }
];

function Home() {
  const [isVisible, setIsVisible] = useState({});
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                <Instagram className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Instagram Notes
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">Features</a>
              <a href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">How it Works</a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">Reviews</a>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-200">
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-purple-200 dark:border-purple-700 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Never lose inspiration again</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
              Save Instagram posts with
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> smart notes</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Capture inspiration, set reminders, and organize your favorite Instagram content. 
              Never lose track of what matters to you.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Install Extension</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                <Play className="h-5 w-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Hero Image Placeholder */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-8 border border-purple-200 dark:border-purple-700">
                <div className="text-center text-gray-600 dark:text-gray-400">
                  <Instagram className="h-16 w-16 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
                  <p className="text-lg font-medium">Extension Demo Preview</p>
                  <p className="text-sm">See how easy it is to save and organize your Instagram content</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to help you capture, organize, and never forget your Instagram inspiration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl bg-gradient-to-br ${feature.color} text-white transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/90 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Get started in minutes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Simple setup process that gets you saving Instagram posts with notes in no time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="text-white">
                <div className="flex items-center justify-center mb-2">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Loved by creators worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See what our users are saying about Instagram Notes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 transition-colors duration-300">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{testimonial.quote}</p>
                <div className="flex items-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to organize your Instagram inspiration?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of creators who never lose track of their favorite content.
          </p>
          <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 mx-auto">
            <Download className="h-5 w-5" />
            <span>Get Started Free</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                <Instagram className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Instagram Notes</span>
            </div>
            <p className="text-gray-400 mb-4">
              Never lose your Instagram inspiration again.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home; 