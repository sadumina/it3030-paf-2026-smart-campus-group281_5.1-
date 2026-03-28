import './App.css'

function App() {
  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo">
            <h1>✨ Smart Study Operation Hub</h1>
          </div>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="auth-buttons">
            <button className="btn-signin">Sign In</button>
            <button className="btn-signup">Sign Up</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h2>Welcome to Smart Study Operation Hub</h2>
          <p className="hero-subtitle">Revolutionize Your Learning Experience</p>
          <p className="hero-description">
            Optimize study sessions, collaborate with peers, and master your academics with cutting-edge smart learning technology
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">Get Started Now</button>
            <button className="btn-secondary">Explore Platform</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="placeholder-image">🚀</div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <h2>Powerful Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Smart Study Planner</h3>
            <p>AI-powered study schedules tailored to your learning pace</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Collaborative Learning</h3>
            <p>Study groups, peer mentoring, and knowledge sharing</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Performance Analytics</h3>
            <p>Track progress and identify improvement areas</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h3>Resource Library</h3>
            <p>Access thousands of study materials and expert content</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Goal Tracking</h3>
            <p>Set, monitor, and achieve your academic milestones</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Secure Platform</h3>
            <p>Enterprise-grade security for all your academic data</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <h2>About Smart Study Operation Hub</h2>
        <p>
          Smart Study Operation Hub empowers students and educators with intelligent tools to enhance learning outcomes. We combine AI, analytics, and collaborative features to create the ultimate academic platform. Join thousands of learners transforming their educational journey.
        </p>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stat-card">
          <h3>10K+</h3>
          <p>Active Students</p>
        </div>
        <div className="stat-card">
          <h3>500+</h3>
          <p>Study Resources</p>
        </div>
        <div className="stat-card">
          <h3>95%</h3>
          <p>Success Rate</p>
        </div>
        <div className="stat-card">
          <h3>24/7</h3>
          <p>Support Available</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to Transform Your Studies?</h2>
        <p>Join the smart learning revolution today</p>
        <button className="btn-cta">Start Free Trial</button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Smart Study Hub</h4>
            <p>Empowering learners worldwide with smart education technology</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Smart Study Operation Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
