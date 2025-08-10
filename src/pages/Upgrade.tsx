import { useState } from "react";
import { Check, Star, Zap, Shield, Users, Clock, Sparkles, ArrowRight, ArrowLeft, Crown, Trophy, Rocket, Infinity, Lock, Globe, Download, Cloud, Headphones, Palette, Code, BarChart3, CheckCircle, X } from "lucide-react";

const Upgrade = () => {
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [billingCycle, setBillingCycle] = useState("yearly");
  const [showComparison, setShowComparison] = useState(false);

  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Perfect for getting started",
      price: { monthly: 0, yearly: 0 },
      originalPrice: { monthly: 0, yearly: 0 },
      features: [
        "Access to 50+ basic tools",
        "Standard processing speed",
        "Basic support",
        "Community forum access",
        "5 tools per day limit",
        "Standard file size limits"
      ],
      popular: false,
      icon: Zap,
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      borderColor: "border-blue-200"
    },
    {
      id: "pro",
      name: "Pro",
      description: "Most popular choice for professionals",
      price: { monthly: 19, yearly: 190 },
      originalPrice: { monthly: 29, yearly: 290 },
      features: [
        "Access to 200+ premium tools",
        "Unlimited tool usage",
        "Priority processing speed",
        "Advanced file formats",
        "Larger file size limits",
        "Priority email support",
        "Custom tool configurations",
        "API access (1000 calls/month)",
        "Advanced analytics",
        "Team collaboration features"
      ],
      popular: true,
      icon: Crown,
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      borderColor: "border-purple-300"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For teams and large organizations",
      price: { monthly: 49, yearly: 490 },
      originalPrice: { monthly: 69, yearly: 690 },
      features: [
        "Everything in Pro",
        "Unlimited API calls",
        "White-label solutions",
        "Custom integrations",
        "Dedicated account manager",
        "Phone & video support",
        "Advanced security features",
        "Custom SLA agreements",
        "Team management dashboard",
        "Usage analytics & reporting",
        "Custom tool development",
        "On-premise deployment options"
      ],
      popular: false,
      icon: Trophy,
      gradient: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      borderColor: "border-orange-300"
    }
  ];

  const selectedPlanData = plans.find(p => p.id === selectedPlan);
  const savings = billingCycle === "yearly" ? 20 : 0;

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process files 10x faster with our optimized infrastructure",
      color: "text-yellow-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and SOC 2 compliance",
      color: "text-green-500"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share tools and results with your team seamlessly",
      color: "text-blue-500"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Get help whenever you need it with priority support",
      color: "text-purple-500"
    },
    {
      icon: Sparkles,
      title: "Premium Tools",
      description: "Access to exclusive tools not available in free tier",
      color: "text-pink-500"
    },
    {
      icon: Infinity,
      title: "Unlimited Usage",
      description: "No more daily limits or restrictions on tool usage",
      color: "text-cyan-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Designer",
      company: "TechCorp",
      content: "ToolsHub Pro has revolutionized our design workflow. The unlimited access and faster processing have saved us hours every week.",
      rating: 5,
      avatar: "SC",
      gradient: "from-blue-400 to-purple-500"
    },
    {
      name: "Marcus Rodriguez",
      role: "Developer",
      company: "StartupXYZ",
      content: "The API access and custom integrations have made it incredibly easy to automate our processes. Highly recommended!",
      rating: 5,
      avatar: "MR",
      gradient: "from-green-400 to-blue-500"
    },
    {
      name: "Emily Watson",
      role: "Marketing Manager",
      company: "GrowthCo",
      content: "We've seen a 40% increase in productivity since upgrading to Pro. The team collaboration features are game-changing.",
      rating: 5,
      avatar: "EW",
      gradient: "from-pink-400 to-red-500"
    }
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Tools Available", value: "200+", icon: Code },
    { label: "Files Processed", value: "10M+", icon: BarChart3 },
    { label: "Uptime", value: "99.9%", icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center gap-4 mb-8">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Upgrade to Pro
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
            Unlock unlimited access to premium tools, faster processing, and priority support. 
            Choose the perfect plan that grows with your needs.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4 group-hover:shadow-xl transition-shadow border border-gray-100">
                    <IconComponent className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-2 bg-white rounded-2xl shadow-lg border border-gray-200 mb-16">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                billingCycle === "monthly" 
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                billingCycle === "yearly" 
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Yearly
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="container mx-auto py-16 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              const isSelected = selectedPlan === plan.id;
              const price = billingCycle === "yearly" ? plan.price.yearly : plan.price.monthly;
              const originalPrice = billingCycle === "yearly" ? plan.originalPrice.yearly : plan.originalPrice.monthly;
              const discount = originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0;
              
              return (
                <div 
                  key={plan.id} 
                  className={`relative group transition-all duration-500 hover:scale-105 ${
                    plan.popular ? "md:-translate-y-4" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                        <Star className="w-4 h-4 mr-1 inline" />
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className={`relative h-full p-8 bg-white rounded-3xl shadow-xl border-2 transition-all duration-300 overflow-hidden ${
                    plan.popular ? "border-purple-300 shadow-purple-100/50" : "border-gray-200 hover:border-gray-300"
                  } ${isSelected ? "ring-4 ring-purple-200" : ""}`}>
                    
                    {/* Background Pattern */}
                    <div className={`absolute inset-0 opacity-5 ${plan.bgColor}`}></div>
                    
                    {/* Header */}
                    <div className="relative z-10 text-center mb-8">
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${plan.gradient} mb-6 shadow-lg`}>
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-gray-600">{plan.description}</p>
                    </div>

                    {/* Pricing */}
                    <div className="relative z-10 text-center mb-8">
                      {price === 0 ? (
                        <div className="text-5xl font-bold text-gray-900">Free</div>
                      ) : (
                        <div className="space-y-2">
                          {discount > 0 && (
                            <div className="text-lg text-gray-400 line-through">
                              ${originalPrice}
                            </div>
                          )}
                          <div className="text-5xl font-bold text-gray-900">
                            ${price}
                          </div>
                          <div className="text-gray-600">
                            per {billingCycle === "monthly" ? "month" : "year"}
                          </div>
                          {discount > 0 && (
                            <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                              Save {discount}%
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="relative z-10 space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="relative z-10">
                      <button 
                        className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 ${
                          plan.popular 
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105" 
                            : isSelected
                              ? "bg-gray-900 text-white shadow-lg hover:shadow-xl"
                              : "border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        {plan.id === "free" ? "Current Plan" : "Choose Plan"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison Toggle */}
          <div className="text-center mt-16">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Compare Plans in Detail
              <ArrowRight className={`w-4 h-4 transition-transform ${showComparison ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Detailed Comparison */}
          {showComparison && (
            <div className="mt-12 bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-center mb-8">Detailed Plan Comparison</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-4 font-bold">Feature</th>
                        <th className="text-center p-4 font-bold">Free</th>
                        <th className="text-center p-4 font-bold text-purple-600">Pro</th>
                        <th className="text-center p-4 font-bold">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { feature: "Tools Available", free: "50+", pro: "200+", enterprise: "200+" },
                        { feature: "Daily Usage Limit", free: "5 tools", pro: "Unlimited", enterprise: "Unlimited" },
                        { feature: "Processing Speed", free: "Standard", pro: "Priority", enterprise: "Ultra Fast" },
                        { feature: "Support", free: "Community", pro: "Email Priority", enterprise: "Phone + Video" },
                        { feature: "API Access", free: "-", pro: "1000 calls/month", enterprise: "Unlimited" },
                        { feature: "Custom Integrations", free: "-", pro: "Basic", enterprise: "Advanced" },
                      ].map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-4 font-medium">{row.feature}</td>
                          <td className="text-center p-4">{row.free === "-" ? <X className="w-5 h-5 text-gray-300 mx-auto" /> : row.free}</td>
                          <td className="text-center p-4 text-purple-600 font-medium">{row.pro === "-" ? <X className="w-5 h-5 text-gray-300 mx-auto" /> : row.pro}</td>
                          <td className="text-center p-4">{row.enterprise === "-" ? <X className="w-5 h-5 text-gray-300 mx-auto" /> : row.enterprise}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-gray-100 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Upgrade to Pro?</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Get more done with powerful features designed for professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group">
                  <div className="h-full p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <IconComponent className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto py-20 px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">What Our Pro Users Say</h2>
          <p className="text-xl text-gray-600">
            Join thousands of satisfied professionals who've upgraded
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group">
              <div className="h-full p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="flex justify-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold`}>
                    {testimonial.avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about upgrading
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                question: "Can I cancel my subscription anytime?",
                answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise plans. All payments are processed securely."
              },
              {
                question: "Is there a free trial for Pro plans?",
                answer: "Yes! You can try Pro features free for 7 days. No credit card required to start your trial."
              },
              {
                question: "Can I upgrade or downgrade my plan?",
                answer: "Absolutely! You can change your plan at any time. Upgrades take effect immediately, downgrades at the next billing cycle."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold mb-4 text-gray-900">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl p-12 text-center text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-red-600/90"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to unlock your full potential?</h2>
              <p className="text-xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
                Join thousands of professionals who've already upgraded to Pro and transformed their workflow
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button className="group bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all hover:scale-105 shadow-lg flex items-center gap-3">
                  <Crown className="w-6 h-6" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 border-2 border-white text-white rounded-2xl font-bold text-lg hover:bg-white hover:text-purple-600 transition-all">
                  Browse Free Tools
                </button>
              </div>
              <p className="text-sm opacity-75 mt-6">
                No credit card required • 7-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Upgrade;