import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useOrders } from '../context/OrderContext';

const Contact = () => {
  const contactSections = [
    {
      title: 'Clothing & Footwear Related Queries',
      name: 'Mr. Anil Verma',
      mobile: '9919576275',
      email: '',
    },
    {
      title: 'Wholesale Clothing',
      name: 'Mr. Vindeshwari Prasad Verma',
      mobile: '9838518542',
      email: '',
    },
    {
      title: 'CSE (Cyber Cafe) Services',
      name: 'Mr. Rameshwari Prasad Verma',
      mobile: '9984270109',
      email: 'rpverma0786@gmail.com',
    },
  ];

  const { addContactMessage } = useOrders();
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: '',
    message: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.mobile.trim() || !form.message.trim()) {
      setSuccessMessage('Please fill all required details before sending.');
      return;
    }

    addContactMessage({
      name: form.name.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      subject: form.subject.trim() || 'General enquiry',
      message: form.message.trim(),
    });

    setForm({
      name: '',
      email: '',
      mobile: '',
      subject: '',
      message: '',
    });
    setSuccessMessage('Your message has been sent to the admin dashboard.');
  };

  return (
    <div className="pb-24">
      <div className="bg-brand-gray py-16 border-b border-white/5 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-black tracking-tighter">CONTACT US</h1>
          <p className="text-white/50 mt-2">We're here to help you find your perfect fit.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Contact Info */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-black tracking-tight">CONTACT INFORMATION</h2>
              <p className="text-white/60 leading-relaxed">
                Reach the right person quickly with our dedicated service contacts. Each section below is organized by business category so customers can connect without confusion.
              </p>
            </div>

            <div className="space-y-6">
              {contactSections.map((section) => (
                <motion.div
                  key={section.title}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl border border-white/5 bg-brand-gray p-8 shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-[0.35em] text-brand-red">{section.title}</p>
                      <h3 className="text-2xl font-black tracking-tight text-white">{section.name}</h3>
                    </div>
                    <div className="rounded-2xl bg-brand-red/10 p-4 text-brand-red">
                      <Phone size={22} />
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <a
                      href={`tel:${section.mobile}`}
                      className="flex items-center gap-4 rounded-2xl border border-white/5 bg-brand-dark/70 px-5 py-4 text-sm text-white/70 transition-all hover:border-brand-red/30 hover:text-white"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                        <Phone size={18} />
                      </span>
                      <span>
                        <span className="block text-[11px] font-black uppercase tracking-[0.3em] text-white/35">Phone</span>
                        <span className="text-base font-semibold tracking-wide">{section.mobile}</span>
                      </span>
                    </a>

                    {section.email ? (
                      <a
                        href={`mailto:${section.email}`}
                        className="flex items-center gap-4 rounded-2xl border border-white/5 bg-brand-dark/70 px-5 py-4 text-sm text-white/70 transition-all hover:border-brand-red/30 hover:text-white"
                      >
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                          <Mail size={18} />
                        </span>
                        <span>
                          <span className="block text-[11px] font-black uppercase tracking-[0.3em] text-white/35">Email</span>
                          <span className="text-base font-semibold break-all">{section.email}</span>
                        </span>
                      </a>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-white/5 bg-brand-gray p-7 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                  <Mail size={24} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">Emergency / General Enquiries</h4>
                  <a
                    href="mailto:rpverma0786@gmail.com"
                    className="inline-flex text-sm text-white/50 transition-colors hover:text-brand-red break-all"
                  >
                    rpverma0786@gmail.com
                  </a>
                </div>
              </div>
              <div className="rounded-3xl border border-white/5 bg-brand-gray p-7 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                  <Clock size={24} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">Working Hours</h4>
                  <p className="text-sm text-white/50">Mon - Sat: 9AM - 8PM</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-brand-gray to-brand-dark p-8 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Visit Our Store</h4>
                  <p className="text-sm text-white/50">A trusted destination for clothing, footwear, services, and community support since 1970.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-brand-gray p-10 rounded-3xl border border-white/5">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-brand-dark border border-white/10 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-brand-red transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-brand-dark border border-white/10 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-brand-red transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-white/40">Mobile Number</label>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => updateField('mobile', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-brand-red transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-white/40">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                  placeholder="How can we help?"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-brand-red transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-white/40">Message</label>
                <textarea
                  rows={6}
                  value={form.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  placeholder="Tell us more about your inquiry..."
                  className="w-full bg-brand-dark border border-white/10 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-brand-red transition-all resize-none"
                />
              </div>
              {successMessage && (
                <p className="text-sm text-brand-red">{successMessage}</p>
              )}
              <button
                type="submit"
                className="w-full bg-brand-red text-white h-16 rounded-full font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-lg shadow-brand-red/20"
              >
                Send Message
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
