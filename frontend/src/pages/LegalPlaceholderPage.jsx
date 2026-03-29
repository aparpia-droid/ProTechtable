export default function LegalPlaceholderPage({ title }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-navy">{title}</h1>
      <p className="mt-4 text-brandgray">
        This is a placeholder page. Replace with your legal text before production launch.
      </p>
    </div>
  );
}
