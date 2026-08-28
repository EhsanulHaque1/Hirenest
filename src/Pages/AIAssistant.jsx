import "./AIAssistant.css";
import { useAI } from "../Components/AIContext";

function AIAssistant() {
  const { setIsOpen } = useAI();
  const openChatbot = () => {
    setIsOpen(true);
  };

  return (
    <div className="ai-wrapper">
      
      <header className="ai-hero">
      <div className="ai-hero">
        <div className="ai-hero-content">
          <h1 className="ai-title">Meet Your HireNest AI Assistant</h1>
          <p className="ai-subtitle">
            Navigating the freelance marketplace is easier than ever. Whether you are a client looking to hire or a job seeker searching for opportunities, our AI is here to help.
          </p>
        </div>
      </div>
      </header>

      <section className="ai-features-section">
        <h2 className="ai-section-title">How Can I Help You Today?</h2>
        <div className="ai-features-grid">
          
          <div className="ai-feature-card">
            <div className="ai-icon">🔍</div>
            <h3>Smart Job Searching</h3>
            <p>Guiding freelancers through efficient job searches and providing tailored career advice.</p>
          </div>
          
          <div className="ai-feature-card">
            <div className="ai-icon">📝</div>
            <h3>Winning Proposals</h3>
            <p>Receive actionable tips to write standout job proposals that catch a client's eye.</p>
          </div>
          
          <div className="ai-feature-card">
            <div className="ai-icon">🏢</div>
            <h3>Clear Job Postings</h3>
            <p>Assisting clients and employers in drafting clear, detailed job descriptions to attract top talent.</p>
          </div>
          
          <div className="ai-feature-card">
            <div className="ai-icon">💡</div>
            <h3>Platform Guidance</h3>
            <p>Get instant answers to frequently asked questions about payments, secure messaging, and more.</p>
          </div>

        </div>
      </section>

      <section className="ai-future-section">
        <div className="ai-future-card">
          <h2>Looking Ahead 🚀</h2>
          <p>
            As HireNest grows, so will our AI! Future updates will include advanced resume analysis, intelligent matching algorithms, and automated proposal suggestions to make your hiring and job-seeking process completely seamless.
          </p>
        </div>
      </section>

      <div className="ai-cta-container">
        <button className="ai-chatbot-btn" onClick={openChatbot}>
          <span className="ai-btn-icon">💬</span> Open AI Chatbot
        </button>
      </div>

    </div>
  );
}

export default AIAssistant;