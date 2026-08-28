import "./Pages.css";

function Help() {
  const faqs = [
    {
      question: "How do I get started on Hirenest?",
      answer:
        "Sign up, create your profile, and start either posting projects or applying for jobs.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept credit cards, PayPal, bank transfers, and wire transfers.",
    },
    {
      question: "How is payment protected?",
      answer:
        "Funds are held in escrow and released only after client approval of completed work.",
    },
    {
      question: "Can I dispute a project outcome?",
      answer:
        "Yes, we have a 14-day dispute resolution process to handle disagreements.",
    },
  ];

  return (
    <div className="page-container">
      <h1>Help & FAQ</h1>
      <p className="intro-text">
        Find answers to frequently asked questions and get support.
      </p>

      <div className="content-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faqs-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <h4>💬 {faq.question}</h4>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="content-section">
        <h2>Need More Help?</h2>
        <div className="contact-options">
          <p>📧 Email: support@hirenest.com</p>
          <p>💬 Live Chat: Available 24/7</p>
          <p>🌐 Community Forum: Connect with other users</p>
        </div>
      </div>
    </div>
  );
}

export default Help;
