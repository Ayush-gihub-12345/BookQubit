import Icon from "@/components/Icon";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="text-muted mt-4 leading-relaxed">
        Questions, feedback, or a correction on a book listing? We'd like to hear from you.
      </p>
      <div className="card mt-6 flex items-center gap-3 p-5 hover:!translate-y-0">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600/10 text-brand-600">
          <Icon name="feather" size={17} />
        </span>
        <div>
          <p className="font-semibold">Email</p>
          <a href="mailto:hello@bookqubit.com" className="text-sm text-brand-600 hover:underline">hello@bookqubit.com</a>
        </div>
      </div>
    </div>
  );
}
