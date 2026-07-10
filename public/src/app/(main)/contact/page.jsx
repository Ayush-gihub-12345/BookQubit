import Icon from "@/components/Icon";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the BookQubit team — questions, feedback, or corrections on a book listing.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="text-muted mt-4 leading-relaxed">
        Questions, feedback, or a correction on a book listing? We'd like to hear from you —
        send us a message below, or email us directly.
      </p>

      <div className="mt-6"><ContactForm /></div>

      <div className="card mt-4 flex items-center gap-3 p-5 hover:!translate-y-0">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600/10 text-brand-600">
          <Icon name="feather" size={17} />
        </span>
        <div>
          <p className="font-semibold">Email us directly</p>
          <a href="mailto:contact@bookqubit.com" className="text-sm text-brand-600 hover:underline">contact@bookqubit.com</a>
        </div>
      </div>
    </div>
  );
}
