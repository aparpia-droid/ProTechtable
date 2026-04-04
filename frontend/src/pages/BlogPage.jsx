import { Link } from "react-router-dom";

const posts = [
  {
    slug: "remove-data-spokeo-2026",
    title: "How to Remove Your Data from Spokeo (2026 Guide)",
    category: "Broker Removal",
    excerpt:
      "Step-by-step instructions to opt out of Spokeo, or let ProTechtable do it automatically.",
  },
  {
    slug: "remove-info-beenverified",
    title: "How to Remove Your Info from BeenVerified",
    category: "Broker Removal",
    excerpt: "BeenVerified sells your personal data. Here's how to stop them.",
  },
  {
    slug: "what-to-do-after-data-breach",
    title: "What to Do After a Data Breach",
    category: "Security Guide",
    excerpt: "Your email was found in a breach. Here are the 5 things you should do right now.",
  },
  {
    slug: "college-student-privacy-guide",
    title: "College Student Privacy Guide: Protect Your Digital Identity",
    category: "Student Guide",
    excerpt: "Campus Wi-Fi, shared housing, job applications — here's how to stay safe.",
  },
  {
    slug: "data-brokers-explained",
    title: "Data Brokers Explained: Who Has Your Data and Why",
    category: "Privacy 101",
    excerpt: "50+ companies are selling your personal information right now. Here's what they know.",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-center text-3xl font-bold text-white md:text-4xl">Privacy Protection Guides</h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-400">
          Step-by-step guides to remove your data from broker sites
        </p>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <article
              key={p.slug}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-brandyellow/30"
            >
              <span className="inline-block w-fit rounded-full bg-brandyellow/15 px-3 py-1 text-xs font-semibold text-brandyellow">
                {p.category}
              </span>
              <h2 className="mt-4 text-lg font-bold text-white">{p.title}</h2>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-gray-400">{p.excerpt}</p>
              <Link
                to={`/blog/${p.slug}`}
                className="mt-6 inline-flex font-semibold text-brandyellow hover:brightness-110"
              >
                Read guide →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
