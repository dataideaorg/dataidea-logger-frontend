import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e5e5e5]">
      {/* Navigation */}
      <nav className="border-b border-[#3a3a3a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#e5e5e5]">DATAIDEA Logger</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-[#e5e5e5] hover:text-[#c5c5c5] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-[#e5e5e5] text-[#1a1a1a] rounded-md hover:bg-[#c5c5c5] font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#e5e5e5] mb-6">
            Centralized Logging Platform
          </h1>
          <p className="text-xl text-[#a5a5a5] mb-8 max-w-3xl mx-auto">
            Track application events and LLM interactions in one place. Monitor, analyze, and optimize your applications with ease.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/register"
              className="px-8 py-3 bg-[#e5e5e5] text-[#1a1a1a] rounded-md hover:bg-[#c5c5c5] font-semibold transition-colors text-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-[#2a2a2a] text-[#e5e5e5] border border-[#3a3a3a] rounded-md hover:bg-[#3a3a3a] font-semibold transition-colors text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#e5e5e5] mb-4">Why Choose DATAIDEA Logger?</h2>
          <p className="text-lg text-[#a5a5a5]">Everything you need to monitor your applications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 hover:bg-[#3a3a3a] transition-colors">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-[#e5e5e5] mb-2">Event Logging</h3>
            <p className="text-[#a5a5a5]">
              Track application events with different severity levels - info, warning, error, and debug.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 hover:bg-[#3a3a3a] transition-colors">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-[#e5e5e5] mb-2">LLM Monitoring</h3>
            <p className="text-[#a5a5a5]">
              Monitor LLM interactions including queries, responses, and sources for better insights.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 hover:bg-[#3a3a3a] transition-colors">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-[#e5e5e5] mb-2">Analytics Dashboard</h3>
            <p className="text-[#a5a5a5]">
              Visualize your logs with interactive charts and gain actionable insights.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 hover:bg-[#3a3a3a] transition-colors">
            <div className="text-4xl mb-4">🔑</div>
            <h3 className="text-xl font-semibold text-[#e5e5e5] mb-2">API Keys</h3>
            <p className="text-[#a5a5a5]">
              Secure your integrations with API key authentication and easy management.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 hover:bg-[#3a3a3a] transition-colors">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-[#e5e5e5] mb-2">Project Organization</h3>
            <p className="text-[#a5a5a5]">
              Organize logs by projects for better management and team collaboration.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 hover:bg-[#3a3a3a] transition-colors">
            <div className="text-4xl mb-4">💾</div>
            <h3 className="text-xl font-semibold text-[#e5e5e5] mb-2">Export & Download</h3>
            <p className="text-[#a5a5a5]">
              Download your logs as CSV files for offline analysis and reporting.
            </p>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#e5e5e5] mb-4">Easy Integration</h2>
            <p className="text-lg text-[#a5a5a5]">Integrate with your applications in minutes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🐍</div>
              <h3 className="font-semibold text-[#e5e5e5] mb-2">Python Package</h3>
              <p className="text-sm text-[#a5a5a5]">Official DATAIDEA package</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="font-semibold text-[#e5e5e5] mb-2">REST API</h3>
              <p className="text-sm text-[#a5a5a5]">Direct HTTP integration</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-[#e5e5e5] mb-2">JavaScript SDK</h3>
              <p className="text-sm text-[#a5a5a5]">Frontend & Node.js support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-[#e5e5e5] mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-[#a5a5a5] mb-8">
            Start logging and monitoring your applications today
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-[#e5e5e5] text-[#1a1a1a] rounded-md hover:bg-[#c5c5c5] font-semibold transition-colors text-lg"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#3a3a3a] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-[#a5a5a5]">
            <p>&copy; 2024 DATAIDEA Logger. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}