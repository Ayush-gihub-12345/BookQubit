"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import {
  FaDollarSign,
  FaShoppingCart,
  FaLink,
  FaCreditCard,
  FaChartLine,
  FaUsers,
  FaBookOpen,
  FaVideo,
  FaTags,
  FaCrown,
  FaRocket,
  FaHandshake,
  FaGraduationCap,
  FaStore,
  FaTachometerAlt,
  FaArrowRight,
  FaCheckCircle,
  FaStar,
  FaRegGem,
} from "react-icons/fa";
import "./monetization.css";

const MonetizationPage = () => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();
  const { currentFont } = useFont();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  const themeColors = {
    background: isDarkMode ? "#1a1a2e" : "#ffffff",
    textPrimary: isDarkMode ? "#ffffff" : "#1a1a2e",
    textSecondary: isDarkMode ? "#a0aec0" : "#666666",
    border: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
    cardBg: isDarkMode ? "rgba(255,255,255,0.05)" : "#f9fafb",
    primary: "#0ea5e9",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  };

  const monetizationCards = [
    {
      id: "dropshipping",
      title: "Dropshipping Store",
      icon: <FaStore />,
      description: "Sell physical books and merchandise without inventory. Partner with suppliers who ship directly to customers.",
      features: [
        "Zero inventory management",
        "Print-on-demand books",
        "Bookish merchandise",
        "Automated fulfillment"
      ],
      potentialEarnings: "$500 - $5,000/month",
      setupTime: "1-2 weeks",
      difficulty: "Medium",
      color: "#10b981",
      link: "/monetization/dropshipping"
    },
    {
      id: "affiliate",
      title: "Affiliate Marketing",
      icon: <FaLink />,
      description: "Earn commissions by recommending books and products. Partner with Amazon, Flipkart, and book publishers.",
      features: [
        "5-10% commission on sales",
        "60-day cookie duration",
        "Access to 1000+ publishers",
        "Real-time tracking"
      ],
      potentialEarnings: "$300 - $3,000/month",
      setupTime: "1-3 days",
      difficulty: "Easy",
      color: "#f59e0b",
      link: "/monetization/affiliate"
    },
    {
      id: "subscription",
      title: "Premium Subscriptions",
      icon: <FaCrown />,
      description: "Offer premium features like unlimited summaries, AI recommendations, and ad-free experience.",
      features: [
        "Recurring monthly revenue",
        "Tiered pricing ($4.99 - $9.99)",
        "Annual plans with discounts",
        "Lifetime membership options"
      ],
      potentialEarnings: "$1,000 - $20,000/month",
      setupTime: "2-3 weeks",
      difficulty: "Medium",
      color: "#8b5cf6",
      link: "/monetization/subscription"
    },
    {
      id: "ads",
      title: "Advertisement Revenue",
      icon: <FaChartLine />,
      description: "Monetize traffic through display ads, sponsored content, and native advertising.",
      features: [
        "Google AdSense integration",
        "Direct sponsorships",
        "Native ad placements",
        "Video ads before summaries"
      ],
      potentialEarnings: "$200 - $2,000/month",
      setupTime: "1-2 days",
      difficulty: "Easy",
      color: "#ef4444",
      link: "/monetization/ads"
    },
    {
      id: "api",
      title: "API Access",
      icon: <FaTachometerAlt />,
      description: "Sell API access to businesses, schools, and developers who want book data and summaries.",
      features: [
        "Tiered pricing plans",
        "Rate limiting options",
        "Custom enterprise deals",
        "Usage-based billing"
      ],
      potentialEarnings: "$500 - $10,000/month",
      setupTime: "3-4 weeks",
      difficulty: "Hard",
      color: "#06b6d4",
      link: "/monetization/api"
    },
    {
      id: "digital",
      title: "Digital Products",
      icon: <FaTags />,
      description: "Create and sell reading journals, templates, planners, and digital bookmarks.",
      features: [
        "Reading trackers (Notion/PDF)",
        "Book review templates",
        "Digital reading journals",
        "Printable bookmarks"
      ],
      potentialEarnings: "$200 - $2,000/month",
      setupTime: "1 week",
      difficulty: "Easy",
      color: "#ec4899",
      link: "/monetization/digital"
    },
    {
      id: "courses",
      title: "Online Courses",
      icon: <FaGraduationCap />,
      description: "Create and sell courses about speed reading, book analysis, and writing reviews.",
      features: [
        "Self-paced video courses",
        "Live workshops",
        "Monthly book clubs",
        "Author interviews"
      ],
      potentialEarnings: "$1,000 - $15,000/month",
      setupTime: "2-4 weeks",
      difficulty: "Medium",
      color: "#14b8a6",
      link: "/monetization/courses"
    },
    {
      id: "sponsored",
      title: "Sponsored Content",
      icon: <FaHandshake />,
      description: "Partner with publishers and authors for featured placements and sponsored reviews.",
      features: [
        "Featured book placements",
        "Sponsored reading lists",
        "Author spotlights",
        "Newsletter sponsorships"
      ],
      potentialEarnings: "$500 - $5,000/month",
      setupTime: "1 week",
      difficulty: "Easy",
      color: "#f97316",
      link: "/monetization/sponsored"
    },
    {
      id: "community",
      title: "Community Membership",
      icon: <FaUsers />,
      description: "Create exclusive community for book lovers with premium access to events and discussions.",
      features: [
        "Monthly book clubs",
        "Author Q&A sessions",
        "Private Discord/Forum",
        "Exclusive content"
      ],
      potentialEarnings: "$500 - $3,000/month",
      setupTime: "2 weeks",
      difficulty: "Medium",
      color: "#a855f7",
      link: "/monetization/community"
    }
  ];

  const successStories = [
    {
      name: "Sarah Johnson",
      revenue: "$2,847",
      method: "Affiliate Marketing",
      quote: "Made $2,847 in my first month recommending books on BookQubit!",
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      revenue: "$5,234",
      method: "Premium Subscriptions",
      quote: "Premium subscriptions changed my life. Recurring revenue is amazing!",
      avatar: "MC"
    },
    {
      name: "Emma Rodriguez",
      revenue: "$1,892",
      method: "Digital Products",
      quote: "My reading planners are selling like hotcakes. BookQubit audience is perfect!",
      avatar: "ER"
    }
  ];

  return (
    <div 
      className="monetization-page"
      style={{
        backgroundColor: themeColors.background,
        color: themeColors.textPrimary,
        fontFamily: currentFont?.family,
      }}
    >
      {/* Hero Section */}
      <div className="monetization-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <FaDollarSign className="badge-icon" />
            <span>Start Earning Today</span>
          </div>
          <h1 className="hero-title">
            Monetize Your
            <span className="gradient-text"> BookQubit</span>
            <br />Platform
          </h1>
          <p className="hero-description">
            Turn your passion for books into a sustainable income stream.
            Choose from multiple monetization strategies tailored for BookQubit.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value">9+</div>
              <div className="stat-label">Revenue Streams</div>
            </div>
            <div className="stat">
              <div className="stat-value">$10K+</div>
              <div className="stat-label">Monthly Potential</div>
            </div>
            <div className="stat">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Passive Income</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Cards Grid */}
      <div className="monetization-container">
        <div className="section-header">
          <h2 className="section-title">Choose Your Monetization Strategy</h2>
          <p className="section-subtitle">
            Mix and match multiple strategies to maximize your earnings
          </p>
        </div>

        <div className="cards-grid">
          {monetizationCards.map((card) => (
            <div
              key={card.id}
              className="monetization-card"
              style={{
                backgroundColor: themeColors.cardBg,
                borderColor: themeColors.border,
              }}
            >
              <div className="card-header">
                <div className="card-icon" style={{ color: card.color }}>
                  {card.icon}
                </div>
                <h3 className="card-title">{card.title}</h3>
              </div>

              <p className="card-description">{card.description}</p>

              <div className="card-features">
                {card.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <FaCheckCircle className="feature-icon" style={{ color: card.color }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="card-metrics">
                <div className="metric">
                  <span className="metric-label">Potential Earnings</span>
                  <span className="metric-value" style={{ color: card.color }}>
                    {card.potentialEarnings}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Setup Time</span>
                  <span className="metric-value">{card.setupTime}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Difficulty</span>
                  <span className="metric-value">
                    <span className={`difficulty-badge ${card.difficulty.toLowerCase()}`}>
                      {card.difficulty}
                    </span>
                  </span>
                </div>
              </div>

              <Link href={card.link} className="card-link">
                Learn More <FaArrowRight className="link-icon" />
              </Link>
            </div>
          ))}
        </div>

        {/* Success Stories Section */}
        <div className="success-stories">
          <div className="section-header">
            <h2 className="section-title">Success Stories</h2>
            <p className="section-subtitle">
              Real creators earning real money with BookQubit
            </p>
          </div>

          <div className="stories-grid">
            {successStories.map((story, index) => (
              <div
                key={index}
                className="story-card"
                style={{
                  backgroundColor: themeColors.cardBg,
                  borderColor: themeColors.border,
                }}
              >
                <div className="story-avatar" style={{ background: themeColors.gradient }}>
                  {story.avatar}
                </div>
                <div className="story-content">
                  <div className="story-revenue" style={{ color: themeColors.primary }}>
                    ${story.revenue}
                  </div>
                  <div className="story-method">{story.method}</div>
                  <p className="story-quote">"{story.quote}"</p>
                  <div className="story-name">- {story.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section" style={{ background: themeColors.gradient }}>
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Earning?</h2>
            <p className="cta-description">
              Join hundreds of creators already monetizing their BookQubit presence
            </p>
            <button className="cta-button">
              Get Started Now <FaRocket className="cta-icon" />
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>

          <div className="faq-grid">
            {[
              {
                q: "How do I get paid?",
                a: "We support PayPal, Stripe, and bank transfers. Payments are processed monthly on the 15th."
              },
              {
                q: "Can I use multiple monetization methods?",
                a: "Absolutely! Most successful creators combine 2-3 different strategies for maximum earnings."
              },
              {
                q: "Is there a minimum traffic requirement?",
                a: "No minimum! Start monetizing from day one. However, higher traffic leads to higher earnings."
              },
              {
                q: "How long until I see my first payout?",
                a: "Most creators see their first payment within 30-45 days of starting."
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="faq-item"
                style={{
                  backgroundColor: themeColors.cardBg,
                  borderColor: themeColors.border,
                }}
              >
                <div className="faq-question">
                  <FaStar className="faq-icon" style={{ color: themeColors.primary }} />
                  <h3>{faq.q}</h3>
                </div>
                <p className="faq-answer">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonetizationPage;