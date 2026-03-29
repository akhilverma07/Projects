import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const PolicyPage = () => {
  const { type } = useParams();

  const policies = {
    shipping: {
      title: 'Shipping Policy',
      content: `
        At SP & Their Sons, we strive to deliver your premium footwear in the fastest and safest way possible.
        
        1. Shipping Rates:
        - Free standard shipping on all orders over ₹150.
        - A flat rate of ₹15 applies to orders under ₹150.
        
        2. Delivery Times:
        - Standard Shipping: 3-5 business days.
        - Express Shipping: 1-2 business days (additional charges apply).
        
        3. Tracking:
        - Once your order is shipped, you will receive a tracking number via email to monitor your delivery.
      `
    },
    refund: {
      title: 'Refund Policy',
      content: `
        Your satisfaction is our priority. If you are not completely happy with your purchase, we are here to help.
        
        1. Eligibility:
        - Items must be returned within 30 days of purchase.
        - Items must be unworn, in their original packaging, and with all tags attached.
        
        2. Process:
        - Once we receive and inspect your return, we will notify you of the approval or rejection of your refund.
        - If approved, your refund will be processed to your original method of payment within 7-10 business days.
      `
    },
    return: {
      title: 'Return Policy',
      content: `
        We offer a hassle-free return process for all our customers.
        
        1. How to Return:
        - Visit our online return portal and enter your order number.
        - Print the prepaid return label and attach it to your package.
        - Drop off the package at any authorized shipping location.
        
        2. Exchanges:
        - We offer free exchanges for different sizes of the same product, subject to availability.
      `
    },
    privacy: {
      title: 'Privacy Policy',
      content: `
        Your privacy is critically important to us. This policy outlines how we collect, use, and protect your personal information.
        
        1. Information Collection:
        - We collect information you provide when creating an account, making a purchase, or contacting us.
        
        2. Use of Information:
        - Your data is used to process orders, improve our services, and communicate with you about your account or promotions.
        
        3. Security:
        - We implement industry-standard security measures to protect your data from unauthorized access.
      `
    },
    terms: {
      title: 'Terms & Conditions',
      content: `
        By using our website, you agree to comply with and be bound by the following terms and conditions.
        
        1. Use of Site:
        - You must be at least 18 years old to make a purchase.
        - You agree to provide accurate and complete information.
        
        2. Intellectual Property:
        - All content on this site, including logos, designs, and images, is the property of SP & Their Sons.
        
        3. Limitation of Liability:
        - SP & Their Sons shall not be liable for any indirect or consequential damages arising from the use of our products or site.
      `
    }
  };

  const policy = policies[type as keyof typeof policies];

  if (!policy) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-black">Policy Not Found</h2>
        <Link to="/" className="mt-4 text-brand-red font-bold underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="bg-brand-gray py-16 border-b border-white/5 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-black tracking-tighter uppercase">{policy.title}</h1>
          <p className="text-white/50 mt-2">Last updated: March 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-gray p-12 rounded-3xl border border-white/5">
          <div className="prose prose-invert max-w-none">
            {policy.content.split('\n').map((line, i) => (
              <p key={i} className="text-white/60 leading-relaxed mb-4">
                {line.trim()}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
