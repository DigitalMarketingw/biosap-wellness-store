
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Leaf, Award, Users, Globe, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const values = [
    {
      icon: Leaf,
      title: "Natural & Pure",
      description: "100% natural ingredients sourced from certified organic farms across India"
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "All products are tested for purity and potency in our certified laboratories"
    },
    {
      icon: Users,
      title: "Expert Guidance",
      description: "Formulated by experienced Ayurvedic practitioners and modern scientists"
    },
    {
      icon: Globe,
      title: "Sustainable",
      description: "Committed to environmental sustainability and ethical sourcing practices"
    }
  ];

  const team = [
    {
      name: "Dr. Rajesh Sharma",
      role: "Chief Ayurvedic Consultant",
      experience: "25+ years in Ayurveda"
    },
    {
      name: "Dr. Priya Verma",
      role: "Head of Quality Control",
      experience: "15+ years in herbal research"
    },
    {
      name: "Arjun Patel",
      role: "Founder & CEO",
      experience: "10+ years in wellness industry"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-green-100 text-green-700 mb-4">
              <Leaf className="h-4 w-4 mr-2" />
              Ancient Wisdom, Modern Science
            </Badge>
            <h1 className="text-5xl font-bold mb-6">About BIOSAP Ayu</h1>
            <p className="text-xl leading-relaxed mb-8">
              We bridge the timeless wisdom of Ayurveda with cutting-edge research to bring you 
              the finest natural wellness products. Our mission is to make authentic Ayurvedic 
              healing accessible to everyone, everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-green-800 mb-6">Our Story</h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Founded in 2015, BIOSAP Ayu was born from a simple yet powerful belief: 
                  that nature holds the key to optimal health and wellbeing. Our founder, 
                  inspired by his grandmother's traditional remedies and armed with modern 
                  scientific knowledge, set out to create a bridge between ancient Ayurvedic 
                  wisdom and contemporary wellness needs.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Today, we're proud to serve thousands of customers worldwide, offering 
                  carefully crafted products that honor traditional formulations while 
                  meeting the highest standards of modern quality and safety.
                </p>
                <Link to="/products">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Explore Our Products
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <img 
                  src="/lovable-uploads/ab5ccc34-8661-4343-abac-8863eb7e8c1c.png" 
                  alt="CitruSpire - Premium Ayurvedic herbal infusion showcasing traditional formulation"
                  className="rounded-lg shadow-lg w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-green-800 mb-4">Our Core Values</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Every product we create is guided by these fundamental principles that define who we are
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-green-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 mb-3">{value.title}</h3>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quality & Certifications Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <img 
                  src="/lovable-uploads/ac01bd08-854c-47c1-a2c1-2cf2884eab66.png" 
                  alt="Real customer enjoying BIOSAP products - quality and lifestyle integration"
                  className="rounded-lg shadow-lg w-full"
                />
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-bold text-green-800 mb-6">Quality & Certifications</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-800">ISO 9001:2015 Certified</h4>
                      <p className="text-gray-600">International quality management standards</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-800">GMP Certified</h4>
                      <p className="text-gray-600">Good Manufacturing Practices compliance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-800">Organic Certified</h4>
                      <p className="text-gray-600">Certified organic ingredients and processes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-800">Third-Party Tested</h4>
                      <p className="text-gray-600">Independent laboratory verification</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Range Showcase */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-green-800 mb-4">Our Product Range</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From digestive wellness to hormonal balance, our diverse range covers all aspects of holistic health
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-green-200 overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2">
                    <img 
                      src="/lovable-uploads/2902c1b1-4f02-4a7c-8ea6-1f48a7664697.png" 
                      alt="SheVital - Women's wellness and hormonal balance support"
                      className="w-full h-48 md:h-full object-cover"
                    />
                    <div className="p-6 flex flex-col justify-center">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Women's Wellness</h3>
                      <p className="text-gray-600 text-sm">
                        Specialized formulations designed to support women's unique health needs throughout all life stages.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2">
                    <img 
                      src="/lovable-uploads/6a70f8ba-4f96-4c5f-88d5-ff8b20a8e61a.png" 
                      alt="CoolDetox - Natural detoxification and cleansing support"
                      className="w-full h-48 md:h-full object-cover"
                    />
                    <div className="p-6 flex flex-col justify-center">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Detox & Cleanse</h3>
                      <p className="text-gray-600 text-sm">
                        Natural detoxification blends that help cleanse and rejuvenate your body from within.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-green-800 mb-4">Meet Our Expert Team</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our dedicated team of Ayurvedic experts, researchers, and wellness professionals
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="border-green-200 text-center">
                  <CardContent className="p-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">{member.name}</h3>
                    <p className="text-green-600 font-medium mb-2">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.experience}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-12 text-white">
              <Heart className="h-16 w-16 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl font-bold mb-4">Join Our Wellness Journey</h2>
              <p className="text-xl mb-8 opacity-90">
                Experience the transformative power of authentic Ayurveda with BIOSAP Ayu
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products">
                  <Button variant="secondary" size="lg" className="bg-white text-green-800 hover:bg-green-50">
                    Shop Now
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-green-800">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
