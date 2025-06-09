
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('send-contact-email', {
        body: data,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Message sent successfully!",
        description: "Thank you for your inquiry. We'll get back to you soon.",
      });

      reset();
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Address",
      content: "plantsmedg@gmail.com",
      href: "mailto:plantsmedg@gmail.com"
    },
    {
      icon: Phone,
      title: "Phone Numbers",
      content: "+91-9799774222\n+91-9351120119",
      href: "tel:+919799774222"
    },
    {
      icon: MapPin,
      title: "Our Location",
      content: "G1-31, Road Number 2, RIICO Industrial Area, Sirsi Road, Bindayka, RIICO Industrial Area, Jaipur, Rajasthan - 302001, India",
      href: "https://maps.google.com/?q=G1-31,+Road+Number+2,+RIICO+Industrial+Area,+Sirsi+Road,+Bindayka,+Jaipur,+Rajasthan+302001"
    },
    {
      icon: Clock,
      title: "Business Hours",
      content: "Monday - Saturday: 9:00 AM - 6:00 PM\nSunday: Closed",
      href: null
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl mb-6">
              Get in touch with Plants Med Laboratories Pvt. Ltd.
            </p>
            <p className="text-lg opacity-90">
              We're here to help with your pharmaceutical and wellness needs
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-green-800 mb-4">Get In Touch</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Have questions about our products or services? We'd love to hear from you.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactInfo.map((info, index) => (
                <Card key={index} className="border-green-200 hover:shadow-lg transition-shadow text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <info.icon className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 mb-3">{info.title}</h3>
                    {info.href ? (
                      <a
                        href={info.href}
                        target={info.href.startsWith('http') ? '_blank' : undefined}
                        rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-gray-600 text-sm hover:text-green-600 transition-colors whitespace-pre-line"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <p className="text-gray-600 text-sm whitespace-pre-line">{info.content}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Form and Company Info */}
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          {...register('name')}
                          placeholder="Your full name"
                          className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          placeholder="your.email@example.com"
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          {...register('phone')}
                          placeholder="+91-9999999999"
                          className={errors.phone ? 'border-red-500' : ''}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          {...register('subject')}
                          placeholder="What is this regarding?"
                          className={errors.subject ? 'border-red-500' : ''}
                        />
                        {errors.subject && (
                          <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        {...register('message')}
                        placeholder="Please describe your inquiry in detail..."
                        rows={5}
                        className={errors.message ? 'border-red-500' : ''}
                      />
                      {errors.message && (
                        <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Company Information */}
              <div className="space-y-6">
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800">About Plants Med Laboratories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Plants Med Laboratories Pvt. Ltd. is committed to providing high-quality 
                      pharmaceutical products and wellness solutions. We bridge traditional 
                      wisdom with modern science to deliver effective healthcare products.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-green-600 mt-1" />
                        <div>
                          <p className="font-medium text-green-800">Email</p>
                          <a href="mailto:plantsmedg@gmail.com" className="text-gray-600 hover:text-green-600">
                            plantsmedg@gmail.com
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-green-600 mt-1" />
                        <div>
                          <p className="font-medium text-green-800">Phone</p>
                          <div className="text-gray-600">
                            <a href="tel:+919799774222" className="hover:text-green-600">+91-9799774222</a>
                            <br />
                            <a href="tel:+919351120119" className="hover:text-green-600">+91-9351120119</a>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-green-600 mt-1" />
                        <div>
                          <p className="font-medium text-green-800">Address</p>
                          <p className="text-gray-600 text-sm">
                            G1-31, Road Number 2, RIICO Industrial Area, 
                            Sirsi Road, Bindayka, RIICO Industrial Area, 
                            Jaipur, Rajasthan - 302001, India
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800">Quick Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => window.open('mailto:plantsmedg@gmail.com')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => window.open('tel:+919799774222')}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => window.open('https://maps.google.com/?q=G1-31,+Road+Number+2,+RIICO+Industrial+Area,+Sirsi+Road,+Bindayka,+Jaipur,+Rajasthan+302001')}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-green-800 mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">Quick answers to common questions</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-green-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-green-800 mb-3">What are your business hours?</h3>
                  <p className="text-gray-600 text-sm">We are open Monday through Saturday from 9:00 AM to 6:00 PM. We're closed on Sundays.</p>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-green-800 mb-3">How quickly do you respond to inquiries?</h3>
                  <p className="text-gray-600 text-sm">We typically respond to all inquiries within 24 hours during business days.</p>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-green-800 mb-3">Do you offer product consultations?</h3>
                  <p className="text-gray-600 text-sm">Yes, our experts are available to provide consultations about our products and their applications.</p>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-green-800 mb-3">Where are you located?</h3>
                  <p className="text-gray-600 text-sm">We're located in the RIICO Industrial Area in Jaipur, Rajasthan. Visit us or contact us for detailed directions.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
