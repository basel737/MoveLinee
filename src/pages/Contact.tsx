import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Contact = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">Contact Us</h1>
        <p className="text-center text-muted-foreground max-w-3xl mx-auto">
          This page is under construction. Stay tuned for contact form and details!
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
