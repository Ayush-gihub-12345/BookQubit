"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import {
  FaStore,
  FaBoxes,
  FaShippingFast,
  FaMoneyBillWave,
  FaChartLine,
  FaCheckCircle,
  FaArrowRight,
  FaTruck,
  FaWarehouse,
  FaGlobe,
  FaCreditCard,
  FaHeadset,
  FaRocket,
  FaStar,
  FaUsers,
  FaBook,
  FaGift,
  FaCalendarAlt,
  FaTrophy,
  FaHeart,
  FaShieldAlt,
} from "react-icons/fa";
import "./dropshipping.css";

const DropshippingPage = () => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();
  const { currentFont } = useFont();
  const [activeTab, setActiveTab] = useState("overview");

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

  const products = [
    {
      id: 1,
      name: "Premium Leather Bookmark Set",
      category: "Bookmarks",
      price: "$12.99",
      profit: "$5.20",
      image: "/images/bookmark-set.jpg",
      supplier: "Printful",
      rating: 4.8,
      sales: 1234,
    },
    {
      id: 2,
      name: "Reading Journal & Planner",
      category: "Journals",
      price: "$24.99",
      profit: "$9.99",
      image: "/images/reading-journal.jpg",
      supplier: "Printify",
      rating: 4.9,
      sales: 2345,
    },
    {
      id: 3,
      name: "Bookish Candle Set",
      category: "Home & Living",
      price: "$34.99",
      profit: "$14.00",
      image: "/images/candle-set.jpg",
      supplier: "CJDropshipping",
      rating: 4.7,
      sales: 892,
    },
    {
      id: 4,
      name: "Library Tote Bag",
      category: "Bags",
      price: "$19.99",
      profit: "$8.00",
      image: "/images/tote-bag.jpg",
      supplier: "Printful",
      rating: 4.8,
      sales: 1567,
    },
    {
      id: 5,
      name: "Book Embosser Stamp",
      category: "Accessories",
      price: "$29.99",
      profit: "$12.00",
      image: "/images/embosser.jpg",
      supplier: "Printify",
      rating: 4.9,
      sales: 678,
    },
    {
      id: 6,
      name: "Floating Bookshelf",
      category: "Furniture",
      price: "$39.99",
      profit: "$16.00",
      image: "/images/bookshelf.jpg",
      supplier: "CJDropshipping",
      rating: 4.6,
      sales: 445,
    },
  ];

  const suppliers = [
    {
      name: "Printful",
      logo: "/images/printful-logo.png",
      features: ["Print-on-demand", "Global fulfillment", "24/7 support"],
      commission: "15-25%",
      shipping: "3-7 days",
      rating: 4.9,
    },
    {
      name: "Printify",
      logo: "/images/printify-logo.png",
      features: ["High quality prints", "Multiple providers", "Mockup generator"],
      commission: "20-30%",
      shipping: "4-8 days",
      rating: 4.8,
    },
    {
      name: "CJDropshipping",
      logo: "/images/cj-logo.png",
      features: ["Warehouse in US/UK/EU", "Custom branding", "Fast shipping"],
      commission: "10-20%",
      shipping: "2-5 days",
      rating: 4.7,
    },
  ];

  const steps = [
    {
      icon: <FaStore />,
      title: "Setup Your Store",
      description: "Create your BookQubit storefront and connect payment gateway",
      time: "1-2 days",
    },
    {
      icon: <FaBoxes />,
      title: "Choose Products",
      description: "Select winning products from our curated catalog",
      time: "2-3 days",
    },
    {
      icon: <FaTruck />,
      title: "Connect Suppliers",
      description: "Integrate with Printful, Printify, or CJ Dropshipping",
      time: "1 day",
    },
    {
      icon: <FaMoneyBillWave />,
      title: "Start Selling",
      description: "Launch your store and start making sales",
      time: "Immediate",
    },
  ];

  const testimonials = [
    {
      name: "Alex Thompson",
      revenue: "$12,847",
      months: "3 months",
      quote: "BookQubit dropshipping helped me quit my 9-5! The supplier integration is seamless.",
      avatar: "AT",
    },
    {
      name: "Maria Garcia",
      revenue: "$8,234",
      months: "2 months",
      quote: "I've made $8k selling bookish merchandise. Best decision ever!",
      avatar: "MG",
    },
    {
      name: "David Kim",
      revenue: "$15,892",
      months: "6 months",
      quote: "Consistent monthly income of $15k+. The support team is amazing!",
      avatar: "DK",
    },
  ];

  return (
    <div 
      className="dropshipping-page"
      style={{
        backgroundColor: themeColors.background,
        color: themeColors.textPrimary,
        fontFamily: currentFont?.family,
      }}
    >
      {/* Hero Section */}
      <div className="dropshipping-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <FaStore className="badge-icon" />
            <span>BookQubit Dropshipping</span>
          </div>
          <h1 className="hero-title">
            Launch Your
            <span className="gradient-text"> Bookish Store</span>
          </h1>
          <p className="hero-description">
            Start selling book-related products without inventory. Zero upfront cost,
            automated fulfillment, and profit margins up to 50%.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value">50%+</div>
              <div className="stat-label">Profit Margins</div>
            </div>
            <div className="stat">
              <div className="stat-value">1,000+</div>
              <div className="stat-label">Products Available</div>
            </div>
            <div className="stat">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Automation</div>
            </div>
          </div>
          <button className="hero-button" style={{ background: themeColors.gradient }}>
            Start Dropshipping Now <FaRocket className="button-icon" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="dropshipping-container">
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <FaStore /> Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <FaBoxes /> Products
          </button>
          <button
            className={`tab-btn ${activeTab === "suppliers" ? "active" : ""}`}
            onClick={() => setActiveTab("suppliers")}
          >
            <FaShippingFast /> Suppliers
          </button>
          <button
            className={`tab-btn ${activeTab === "guide" ? "active" : ""}`}
            onClick={() => setActiveTab("guide")}
          >
            <FaChartLine /> Getting Started
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="tab-content">
            {/* Features Grid */}
            <div className="features-grid">
              <div className="feature-card" style={{ backgroundColor: themeColors.cardBg }}>
                <FaBoxes className="feature-icon" style={{ color: themeColors.primary }} />
                <h3>No Inventory</h3>
                <p>Products ship directly from suppliers to customers</p>
              </div>
              <div className="feature-card" style={{ backgroundColor: themeColors.cardBg }}>
                <FaMoneyBillWave className="feature-icon" style={{ color: themeColors.primary }} />
                <h3>High Margins</h3>
                <p>Keep 30-50% profit on every sale</p>
              </div>
              <div className="feature-card" style={{ backgroundColor: themeColors.cardBg }}>
                <FaTruck className="feature-icon" style={{ color: themeColors.primary }} />
                <h3>Automated Fulfillment</h3>
                <p>Automatic order processing and shipping</p>
              </div>
              <div className="feature-card" style={{ backgroundColor: themeColors.cardBg }}>
                <FaGlobe className="feature-icon" style={{ color: themeColors.primary }} />
                <h3>Global Reach</h3>
                <p>Sell to customers worldwide</p>
              </div>
            </div>

            {/* How It Works */}
            <div className="steps-section">
              <h2 className="section-title">How Dropshipping Works</h2>
              <div className="steps-grid">
                {steps.map((step, index) => (
                  <div key={index} className="step-card">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-icon">{step.icon}</div>
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-description">{step.description}</p>
                    <div className="step-time">
                      <FaCalendarAlt /> {step.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profit Calculator */}
            <div className="calculator-section" style={{ backgroundColor: themeColors.cardBg }}>
              <h2 className="section-title">Profit Calculator</h2>
              <div className="calculator">
                <div className="calculator-input">
                  <label>Product Price</label>
                  <input type="number" placeholder="$29.99" />
                </div>
                <div className="calculator-input">
                  <label>Product Cost</label>
                  <input type="number" placeholder="$15.00" />
                </div>
                <div className="calculator-result">
                  <div className="result-item">
                    <span>Your Profit:</span>
                    <strong className="profit-amount">$14.99</strong>
                  </div>
                  <div className="result-item">
                    <span>Profit Margin:</span>
                    <strong>50%</strong>
                  </div>
                  <div className="result-item">
                    <span>ROI:</span>
                    <strong>100%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="testimonials-section">
              <h2 className="section-title">Success Stories</h2>
              <div className="testimonials-grid">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="testimonial-card" style={{ backgroundColor: themeColors.cardBg }}>
                    <div className="testimonial-avatar" style={{ background: themeColors.gradient }}>
                      {testimonial.avatar}
                    </div>
                    <div className="testimonial-content">
                      <div className="testimonial-revenue">{testimonial.revenue}</div>
                      <div className="testimonial-metrics">in {testimonial.months}</div>
                      <p className="testimonial-quote">"{testimonial.quote}"</p>
                      <div className="testimonial-name">- {testimonial.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="tab-content">
            <div className="products-header">
              <h2 className="section-title">Trending Products</h2>
              <p className="section-subtitle">Highest margin, best-selling items for BookQubit stores</p>
            </div>

            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card" style={{ backgroundColor: themeColors.cardBg }}>
                  <div className="product-badge">
                    <FaStar className="star-icon" />
                    {product.rating}
                  </div>
                  <div className="product-image-placeholder">
                    <FaBook className="placeholder-icon" />
                  </div>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-category">{product.category}</div>
                  <div className="product-pricing">
                    <span className="product-price">{product.price}</span>
                    <span className="product-profit">Profit: {product.profit}</span>
                  </div>
                  <div className="product-metrics">
                    <div className="metric">
                      <FaUsers /> {product.sales} sold
                    </div>
                    <div className="metric">
                      <FaShippingFast /> {product.supplier}
                    </div>
                  </div>
                  <button className="product-button">Add to Store</button>
                </div>
              ))}
            </div>

            <div className="custom-products">
              <h3>Want custom products?</h3>
              <p>Upload your own designs for bookmarks, t-shirts, mugs, and more</p>
              <button className="custom-button">Create Custom Products</button>
            </div>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeTab === "suppliers" && (
          <div className="tab-content">
            <div className="suppliers-header">
              <h2 className="section-title">Trusted Suppliers</h2>
              <p className="section-subtitle">Partner with industry-leading dropshipping providers</p>
            </div>

            <div className="suppliers-grid">
              {suppliers.map((supplier, index) => (
                <div key={index} className="supplier-card" style={{ backgroundColor: themeColors.cardBg }}>
                  <div className="supplier-rating">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < Math.floor(supplier.rating) ? "star-filled" : "star-empty"} />
                    ))}
                  </div>
                  <div className="supplier-logo-placeholder">
                    <FaStore className="logo-icon" />
                  </div>
                  <h3 className="supplier-name">{supplier.name}</h3>
                  <div className="supplier-features">
                    {supplier.features.map((feature, idx) => (
                      <div key={idx} className="feature">
                        <FaCheckCircle className="check-icon" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="supplier-details">
                    <div className="detail">
                      <span>Commission:</span>
                      <strong>{supplier.commission}</strong>
                    </div>
                    <div className="detail">
                      <span>Shipping:</span>
                      <strong>{supplier.shipping}</strong>
                    </div>
                  </div>
                  <button className="supplier-button">Connect Now</button>
                </div>
              ))}
            </div>

            <div className="integration-guide">
              <h3>Easy Integration</h3>
              <p>Connect any supplier with our API in minutes. Automated order sync and tracking included.</p>
              <Link href="/docs/dropshipping-integration" className="guide-link">
                Read Integration Guide <FaArrowRight />
              </Link>
            </div>
          </div>
        )}

        {/* Getting Started Tab */}
        {activeTab === "guide" && (
          <div className="tab-content">
            <div className="guide-header">
              <h2 className="section-title">Your 5-Step Launch Plan</h2>
              <p className="section-subtitle">Start selling in less than a week</p>
            </div>

            <div className="guide-steps">
              <div className="guide-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Sign Up for BookQubit Dropshipping</h3>
                  <p>Create your seller account and choose your subscription plan</p>
                  <div className="step-time">⏱️ 5 minutes</div>
                </div>
              </div>

              <div className="guide-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Connect a Supplier</h3>
                  <p>Integrate with Printful, Printify, or CJ Dropshipping via API</p>
                  <div className="step-time">⏱️ 30 minutes</div>
                </div>
              </div>

              <div className="guide-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Import Products</h3>
                  <p>Browse our catalog and add winning products to your store</p>
                  <div className="step-time">⏱️ 1-2 hours</div>
                </div>
              </div>

              <div className="guide-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Set Pricing</h3>
                  <p>Set your profit margins and publish products</p>
                  <div className="step-time">⏱️ 30 minutes</div>
                </div>
              </div>

              <div className="guide-step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h3>Start Selling</h3>
                  <p>Launch your store and start marketing to BookQubit audience</p>
                  <div className="step-time">⏱️ Launch!</div>
                </div>
              </div>
            </div>

            <div className="resources-section">
              <h3>Free Resources</h3>
              <div className="resources-grid">
                <div className="resource-card">
                  <FaBook />
                  <span>Dropshipping eBook</span>
                </div>
                <div className="resource-card">
                  <FaChartLine />
                  <span>Profit Calculator Template</span>
                </div>
                <div className="resource-card">
                  <FaUsers />
                  <span>Marketing Guide</span>
                </div>
                <div className="resource-card">
                  <FaShieldAlt />
                  <span>Legal Checklist</span>
                </div>
              </div>
            </div>

            <div className="cta-box" style={{ background: themeColors.gradient }}>
              <h3>Ready to Start Your Dropshipping Journey?</h3>
              <p>Join thousands of successful sellers on BookQubit</p>
              <button className="cta-box-button">Get Started for Free</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropshippingPage;