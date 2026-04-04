import { Link, useParams } from "react-router-dom";

const titles = {
  "remove-data-spokeo-2026": "How to Remove Your Data from Spokeo (2026 Guide)",
  "remove-info-beenverified": "How to Remove Your Info from BeenVerified",
  "what-to-do-after-data-breach": "What to Do After a Data Breach",
  "college-student-privacy-guide": "College Student Privacy Guide: Protect Your Digital Identity",
  "data-brokers-explained": "Data Brokers Explained: Who Has Your Data and Why",
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const title = titles[slug] || "Guide";

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
        <p className="mt-6 text-gray-400">
          This guide is coming soon. In the meantime, scan your exposure for free.
        </p>
        <Link
          to="/scan"
          className="mt-10 inline-flex rounded-xl bg-brandyellow px-8 py-4 font-bold text-gray-900 hover:bg-yellow-300"
        >
          Scan My Exposure →
        </Link>
        <div className="mt-8">
          <Link to="/blog" className="text-sm text-brandyellow hover:brightness-110">
            ← All guides
          </Link>
        </div>
      </div>
    </div>
  );
}
