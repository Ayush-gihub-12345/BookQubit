"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaGithub,
  FaPaperPlane,
  FaCheckCircle,
  FaSpinner,
  FaHeadset,
  FaComments,
  FaRobot,
  FaBook,
  FaQuestionCircle,
} from "react-icons/fa";

const ContactPage = () => {
  const { theme, themeName } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <FaEnvelope />,
      title: "Email Us",
      details: "support@bookqubit.com",
      subDetails: "sales@bookqubit.com",
      link: "mailto:support@bookqubit.com",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FaPhone />,
      title: "Call Us",
      details: "+1 (555) 123-4567",
      subDetails: "Mon-Fri, 9am-6pm EST",
      link: "tel:+15551234567",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Visit Us",
      details: "123 BookQubit Street",
      subDetails: "New York, NY 10001, USA",
      link: "https://maps.google.com",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: <FaClock />,
      title: "Business Hours",
      details: "Monday - Friday",
      subDetails: "9:00 AM - 6:00 PM EST",
      color: "from-purple-500 to-pink-500",
    },
  ];

  const socialLinks = [
    { icon: <FaTwitter />, name: "Twitter", url: "https://twitter.com/bookqubit", color: "hover:text-blue-400" },
    { icon: <FaInstagram />, name: "Instagram", url: "https://instagram.com/bookqubit", color: "hover:text-pink-500" },
    { icon: <FaFacebook />, name: "Facebook", url: "https://facebook.com/bookqubit", color: "hover:text-blue-600" },
    { icon: <FaLinkedin />, name: "LinkedIn", url: "https://linkedin.com/company/bookqubit", color: "hover:text-blue-700" },
    { icon: <FaGithub />, name: "GitHub", url: "https://github.com/bookqubit", color: "hover:text-gray-700 dark:hover:text-gray-300" },
  ];

  const faqs = [
    { question: "How quickly will I get a response?", answer: "We typically respond within 24-48 hours during business days." },
    { question: "Can I request a book recommendation?", answer: "Absolutely! Our team loves helping readers discover new books." },
    { question: "Do you offer support for authors?", answer: "Yes, we have dedicated support for authors and publishers." },
  ];

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}>
              <FaEnvelope className={`text-4xl ${theme.textColors?.highlight || 'text-sky-600'}`} />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}>
            Contact Us
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Have questions, feedback, or need assistance? We're here to help!
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className={`group ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl p-6 text-center transition-all hover:shadow-xl hover:scale-105`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${info.color} flex items-center justify-center mx-auto mb-4 text-white text-2xl group-hover:scale-110 transition`}>
                {info.icon}
              </div>
              <h3 className={`text-lg font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                {info.title}
              </h3>
              <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600'}`}>{info.details}</p>
              <p className={`text-xs mt-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>{info.subDetails}</p>
              {info.link && (
                <Link
                  href={info.link}
                  className={`inline-block mt-3 text-sm ${theme.textColors?.highlight || 'text-sky-600'} hover:underline`}
                >
                  {info.title === "Email Us" ? "Send Email" : info.title === "Call Us" ? "Call Now" : info.title === "Visit Us" ? "Get Directions" : ""} →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Contact Form and Map Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl p-6 md:p-8`}>
            <div className="flex items-center gap-3 mb-6">
              <FaPaperPlane className={`text-2xl ${theme.textColors?.highlight || 'text-sky-600'}`} />
              <h2 className={`text-2xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                Send Us a Message
              </h2>
            </div>

            {isSubmitted ? (
              <div className="text-center py-8">
                <FaCheckCircle className={`text-5xl mx-auto mb-4 text-green-500`} />
                <h3 className={`text-xl font-bold mb-2 ${theme.textColors?.primary || 'text-gray-900'}`}>Message Sent!</h3>
                <p className={`${theme.textColors?.secondary || 'text-gray-600'}`}>
                  Thank you for reaching out. We'll get back to you within 24-48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || 'text-gray-900'}`}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.name ? 'border-red-500' : theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-white')} ${theme.textColors?.primary || 'text-gray-900'}`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || 'text-gray-900'}`}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.email ? 'border-red-500' : theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-white')} ${theme.textColors?.primary || 'text-gray-900'}`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || 'text-gray-900'}`}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.subject ? 'border-red-500' : theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-white')} ${theme.textColors?.primary || 'text-gray-900'}`}
                    placeholder="How can we help?"
                  />
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || 'text-gray-900'}`}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.message ? 'border-red-500' : theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-white')} ${theme.textColors?.primary || 'text-gray-900'}`}
                    placeholder="Please provide details about your inquiry..."
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'}`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Map and Support Options */}
          <div className="space-y-6">
            {/* Map */}
            <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl overflow-hidden h-64`}>
              <iframe
                title="BookQubit Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316bbff3b7%3A0x6f9e7b5c5e3f1e8!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1699999999999!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* Support Options */}
            <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <FaHeadset className={`text-2xl ${theme.textColors?.highlight || 'text-sky-600'}`} />
                <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  Other Ways to Get Help
                </h3>
              </div>
              <div className="space-y-4">
                <Link
                  href="/footerpages/help"
                  className={`flex items-center gap-3 p-3 rounded-lg ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')} hover:shadow-md transition-all group`}
                >
                  <FaQuestionCircle className={`text-xl ${theme.textColors?.highlight || 'text-sky-600'} group-hover:scale-110 transition`} />
                  <div className="flex-1">
                    <p className={`font-medium ${theme.textColors?.primary || 'text-gray-900'}`}>Help Center</p>
                    <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-500'}`}>Browse our knowledge base</p>
                  </div>
                  <span className={`${theme.textColors?.highlight || 'text-sky-600'}`}>→</span>
                </Link>
                <Link
                  href="/faq"
                  className={`flex items-center gap-3 p-3 rounded-lg ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')} hover:shadow-md transition-all group`}
                >
                  <FaComments className={`text-xl ${theme.textColors?.highlight || 'text-sky-600'} group-hover:scale-110 transition`} />
                  <div className="flex-1">
                    <p className={`font-medium ${theme.textColors?.primary || 'text-gray-900'}`}>Live Chat</p>
                    <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-500'}`}>Chat with our support team</p>
                  </div>
                  <span className={`${theme.textColors?.highlight || 'text-sky-600'}`}>→</span>
                </Link>
                <Link
                  href="/bookqubitai"
                  className={`flex items-center gap-3 p-3 rounded-lg ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')} hover:shadow-md transition-all group`}
                >
                  <FaRobot className={`text-xl ${theme.textColors?.highlight || 'text-sky-600'} group-hover:scale-110 transition`} />
                  <div className="flex-1">
                    <p className={`font-medium ${theme.textColors?.primary || 'text-gray-900'}`}>AI Assistant</p>
                    <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-500'}`}>Get instant answers 24/7</p>
                  </div>
                  <span className={`${theme.textColors?.highlight || 'text-sky-600'}`}>→</span>
                </Link>
              </div>
            </div>

            {/* FAQs */}
            <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <FaBook className={`text-2xl ${theme.textColors?.highlight || 'text-sky-600'}`} />
                <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  Frequently Asked Questions
                </h3>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <p className={`font-medium mb-1 ${theme.textColors?.primary || 'text-gray-900'}`}>{faq.question}</p>
                    <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600'}`}>{faq.answer}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/faq"
                className={`inline-block mt-4 text-sm ${theme.textColors?.highlight || 'text-sky-600'} hover:underline`}
              >
                View all FAQs →
              </Link>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className={`text-center pt-8 border-t ${theme.border?.default || 'border-gray-200 dark:border-gray-700'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
            Connect With Us
          </h3>
          <div className="flex justify-center gap-6">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-2xl ${theme.textColors?.secondary || 'text-gray-500'} ${social.color} transition-all hover:scale-110`}
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
          <p className={`mt-4 text-sm ${theme.textColors?.secondary || 'text-gray-500'}`}>
            Follow us for updates, book recommendations, and exclusive content
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;