'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Combined Terms & Conditions and Privacy Policy page for GameGrid app
 * Essential for App Store compliance and legal protection
 * Contains both terms of use and comprehensive privacy practices
 */
export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header with back link */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <motion.main 
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 
          className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8"
          style={{ fontFamily: 'var(--font-gamegrid-title)' }}
        >
          Terms & Conditions and Privacy Policy
        </h1>

        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="text-sm text-gray-500 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* TERMS AND CONDITIONS SECTION */}
          <div className="mb-16">
            <h2 
              className="text-3xl font-bold text-gray-900 mb-6 text-center"
              style={{ fontFamily: 'var(--font-gamegrid-title)' }}
            >
              TERMS AND CONDITIONS
            </h2>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h3>
              <p>
                By downloading, installing, or using the GameGrid mobile application (&quot;App&quot;), you agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you do not agree to these Terms, please do not use our App.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h3>
              <p>
                GameGrid is a sports league management application that provides tools for organizing, tracking, and managing recreational sports leagues. Our services include real-time statistics tracking, player dashboards, strategy planning tools, and league management features.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. User Account and Registration</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>You must create an account to use certain features of the App</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. User Conduct</h3>
              <p>You agree not to:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Use the App for any unlawful purpose or in violation of applicable laws</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Upload or share inappropriate, offensive, or harmful content</li>
                <li>Attempt to gain unauthorized access to the App or its systems</li>
                <li>Interfere with or disrupt the App&apos;s functionality</li>
                <li>Use automated scripts, bots, or other tools to access the App</li>
                <li>Reverse engineer, decompile, or disassemble the App</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Subscription and Payment Terms</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Some features may require a paid subscription</li>
                <li>Subscription fees are charged in advance on a recurring basis</li>
                <li>You may cancel your subscription at any time through your device&apos;s app store settings</li>
                <li>Refunds are subject to the app store&apos;s refund policy</li>
                <li>We reserve the right to change subscription prices with advance notice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h3>
              <p>
                The App and its original content, features, and functionality are owned by GameGrid and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You retain ownership of any content you submit to the App, but you grant us a worldwide, royalty-free license to use, display, and distribute such content in connection with the App&apos;s operation.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Disclaimers and Limitation of Liability</h3>
              <p>
                THE APP IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. IN NO EVENT SHALL GAMEGRID BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APP.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Termination</h3>
              <p>
                We may terminate or suspend your account and access to the App at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
            </section>
          </div>

          {/* PRIVACY POLICY SECTION */}
          <div>
            <h2 
              className="text-3xl font-bold text-gray-900 mb-6 text-center"
              style={{ fontFamily: 'var(--font-gamegrid-title)' }}
            >
              PRIVACY POLICY
            </h2>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h3>
            <p>
              GameGrid (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application GameGrid (&quot;App&quot;). Please read this privacy policy carefully.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
            <p>When you register for an account, we may collect:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Name and email address</li>
              <li>Age and date of birth</li>
              <li>Location information (city, state, or region)</li>
              <li>Sports preferences and interests</li>
              <li>Physical measurements (weight and height) for sports analytics and performance tracking</li>
              <li>Contact information for league management and communication</li>
              <li>Payment information (processed securely through third-party providers)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Usage Data</h3>
            <p>We automatically collect certain information when you use our App:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Device information (device type, operating system, unique device identifiers)</li>
              <li>App usage analytics (features used, time spent in app, user interactions)</li>
              <li>Performance data and crash reports</li>
              <li>Location data (if you grant permission) for local league discovery</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Sports and League Data</h3>
            <ul className="list-disc ml-6 space-y-2">
              <li>Game statistics and performance metrics</li>
              <li>League participation history</li>
              <li>Team affiliations and roles</li>
              <li>Strategy plans and game notes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h3>
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Provide and maintain our App services</li>
              <li>Create personalized player profiles and performance analytics</li>
              <li>Generate accurate sports statistics and performance metrics using physical data</li>
              <li>Match players with appropriate leagues and skill levels</li>
              <li>Process transactions and manage subscriptions</li>
              <li>Send you technical notices, updates, and security alerts</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Improve our App through analytics and user feedback</li>
              <li>Personalize your experience and provide relevant content based on location and preferences</li>
              <li>Facilitate league organization and communication</li>
              <li>Detect, prevent, and address technical issues and security vulnerabilities</li>
            </ul>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Why We Collect Physical Data</h4>
              <p className="text-sm text-gray-700">
                Weight and height information helps us provide more accurate performance analytics, 
                calculate sport-specific metrics (like BMI for certain sports), and ensure fair 
                matchmaking in leagues. This data is always kept private and used solely for 
                enhancing your sports experience within the app.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 With Other Users</h3>
            <p>
              Certain information may be shared with other users in your leagues, including your name, statistics, and team information as necessary for league functionality.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 With Service Providers</h3>
            <p>We may share your information with third-party service providers who assist us in:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Cloud hosting and data storage</li>
              <li>Payment processing</li>
              <li>Analytics and app performance monitoring</li>
              <li>Customer support services</li>
              <li>Marketing and communication services</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Legal Requirements</h3>
            <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Secure data centers and infrastructure</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary to provide you with our services and as described in this Privacy Policy. We may also retain and use your information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Privacy Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate personal information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Opt-out:</strong> Opt-out of certain data processing activities</li>
              <li><strong>Withdraw consent:</strong> Withdraw your consent for data processing</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us using the information provided in the &quot;Contact Us&quot; section.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children&apos;s Privacy</h2>
            <p>
              Our App is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete such information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure that such transfers are conducted in accordance with applicable data protection laws and include appropriate safeguards to protect your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Third-Party Services</h2>
            <p>
              Our App may contain links to third-party services or integrate with third-party APIs. This Privacy Policy does not apply to the practices of third parties, and we are not responsible for their privacy policies or practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibent text-gray-900 mb-4">11. California Privacy Rights</h2>
            <p>
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete personal information, and the right to opt-out of the sale of personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p><strong>Email:</strong> gamegridllc@gmail.com</p>
              <p><strong>Contact Form:</strong> <a href="https://calendly.com/gamegrid/30min" className="text-blue-600 hover:text-blue-800">Schedule a Meeting</a></p>
            </div>
          </section>
          </div>
        </div>
      </motion.main>
    </div>
  );
}

