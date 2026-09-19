import { useState, type FormEvent } from "react";
import { ArrowRight, Github, Mail, MapPin, Phone, Quote } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { BRAND_CONTACT, CONTACT_FORM_ENDPOINT, TESTIMONIALS } from "@/lib/site-data";
import { cn, scrollToSection } from "@/lib/utils";

/**
 * idle     – filling in the form
 * sending  – posting to CONTACT_FORM_ENDPOINT (only when one is configured)
 * sent     – the endpoint accepted it
 * compose  – no endpoint configured: the message is ready to send from the
 *            visitor's own mail app or Gmail (no third-party service needed)
 */
type Status = "idle" | "sending" | "sent" | "compose";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [compose, setCompose] = useState<{ mailto: string; gmail: string } | null>(null);
  const testimonial = TESTIMONIALS[1];

  const testimonialCard = useReveal({ y: 18 });
  const aboutCard = useReveal({ delay: 90, y: 18 });
  const formCard = useReveal<HTMLFormElement>({ delay: 180, y: 18 });
  const contactRow = useReveal({ delay: 100, y: 16 });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (name.length < 2) {
      setError("Please tell me who to follow up with.");
      return;
    }
    if (!email.includes("@")) {
      setError("I need a real email so I can send the quote.");
      return;
    }
    if (message.length < 8) {
      setError("A sentence or two about the project is plenty.");
      return;
    }

    const phone = String(data.get("phone") ?? "").trim();
    const looking = String(data.get("type") ?? "").trim();
    const subject = `New project inquiry from ${name}`;
    const details = [
      `Name: ${name}`,
      `Email: ${email}`,
      ...(phone ? [`Phone: ${phone}`] : []),
      ...(looking ? [`Looking for: ${looking}`] : []),
    ];
    const body = `${message}\n\n---\n${details.join("\n")}`;

    if (CONTACT_FORM_ENDPOINT) {
      setStatus("sending");
      try {
        const response = await fetch(CONTACT_FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            project: looking,
            message,
            _subject: subject,
          }),
        });
        if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);
        setStatus("sent");
        form.reset();
      } catch {
        setStatus("idle");
        setError(
          `That didn\u2019t go through. Please email ${BRAND_CONTACT.email} or call ${BRAND_CONTACT.phone}.`,
        );
      }
      return;
    }

    // No form service configured: hand the finished message to the visitor's mail client.
    const to = BRAND_CONTACT.email;
    setCompose({
      mailto: `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    });
    setStatus("compose");
  }

  return (
    <section
      id="contact"
      className="scroll-mt-24 relative overflow-hidden px-5 pt-24 pb-10 md:px-8"
    >
      <img
        src="/images/contact-bg.jpg"
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-bg/85" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,#0c1016_0%,transparent_40%)]" />

      <div className="relative mx-auto grid max-w-6xl items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Testimonial — quote mark, body copy, and attribution all centered;
            no leading dash before the name. */}
        <article
          ref={testimonialCard.ref}
          className={cn(
            "flex flex-col items-center rounded-xl border border-teal-dim/20 bg-bg-deep/40 p-5 text-center shadow-(--shadow-card) backdrop-blur-md sm:p-6",
            testimonialCard.className,
          )}
          style={testimonialCard.style}
        >
          <Quote className="size-8 fill-teal-dim text-teal-dim" strokeWidth={1} />
          <p className="mt-4 font-display text-base leading-relaxed text-pretty text-fg">
            {testimonial.quote}
          </p>
          <div className="mt-5">
            <p className="font-display font-bold text-fg">{testimonial.name}</p>
            <p className="font-display text-sm text-muted">{testimonial.role}</p>
          </div>
        </article>

        <article
          ref={aboutCard.ref}
          className={cn(
            "flex flex-col rounded-xl border border-teal-dim/20 bg-bg-deep/40 p-5 shadow-(--shadow-card) backdrop-blur-md sm:p-6",
            aboutCard.className,
          )}
          style={aboutCard.style}
        >
          <p className="section-kicker">About me</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-fg">
            Technology That
            <br />
            Works For
            <br />
            You.
          </h2>
          <p className="mt-3 font-display text-sm leading-relaxed text-pretty text-muted">
            I provide technology solutions: websites, hosting, automation, and the unglamorous
            upkeep, so local businesses across the Upstate can compete without a big-city agency
            bill.
          </p>
          <button
            type="button"
            onClick={() => scrollToSection("about")}
            className="pressable mt-4 inline-flex items-center gap-2 font-display text-sm font-semibold tracking-[0.14em] text-teal-dim uppercase"
          >
            Learn more
            <ArrowRight className="size-4" />
          </button>
        </article>

        {/* Form — sharp-cornered inputs, no dropdown/select, and a
            rounded-rectangle (not pill) muted-teal submit button. */}
        <form
          ref={formCard.ref}
          onSubmit={onSubmit}
          className={cn(
            "rounded-xl border border-teal-dim/25 bg-bg-deep/40 p-5 shadow-(--shadow-card) backdrop-blur-md sm:p-6 md:col-span-2 lg:col-span-1",
            formCard.className,
          )}
          style={formCard.style}
        >
          <p className="section-kicker">Let&rsquo;s build something great</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-fg">
            Ready to Grow Your Business?
          </h2>
          <div className="mt-4">
            {status === "sent" ? (
              <div className="flex min-h-64 flex-col justify-center">
                <p className="font-display text-3xl font-bold tracking-wide text-teal-dim uppercase">
                  Quote request in
                </p>
                <p className="mt-3 max-w-md font-display text-base leading-relaxed text-muted">
                  Thanks! I’ll follow up shortly with next steps. If it’s urgent, mention that in a
                  second note and I’ll move you up the list.
                </p>
                <button
                  type="button"
                  className="pressable mt-8 self-start rounded-md border border-border px-5 py-2.5 font-display text-sm font-semibold tracking-[0.12em] text-fg uppercase"
                  onClick={() => setStatus("idle")}
                >
                  Send another
                </button>
              </div>
            ) : null}

            {status === "compose" && compose ? (
              <div className="flex min-h-64 flex-col justify-center">
                <p className="font-display text-3xl font-bold tracking-wide text-teal-dim uppercase">
                  Almost there
                </p>
                <p className="mt-3 max-w-md font-display text-base leading-relaxed text-muted">
                  Your message is filled in. Pick where you’d like to send it from and hit send
                  there.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={compose.mailto}
                    className="pressable inline-flex items-center gap-2 rounded-md bg-teal-dim px-5 py-2.5 font-display text-sm font-bold tracking-[0.12em] text-fg uppercase"
                  >
                    Open in Mail app
                    <ArrowRight className="size-4" />
                  </a>
                  <a
                    href={compose.gmail}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pressable inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 font-display text-sm font-semibold tracking-[0.12em] text-fg uppercase"
                  >
                    Open in Gmail
                    <ArrowRight className="size-4" />
                  </a>
                </div>
                <p className="mt-4 font-display text-sm text-muted">
                  Or reach me directly at{" "}
                  <a href={BRAND_CONTACT.emailHref} className="text-teal hover:text-teal-bright">
                    {BRAND_CONTACT.email}
                  </a>
                  .
                </p>
                <button
                  type="button"
                  className="pressable mt-6 self-start font-display text-sm font-semibold tracking-[0.12em] text-muted uppercase hover:text-fg"
                  onClick={() => setStatus("idle")}
                >
                  ← Edit message
                </button>
              </div>
            ) : null}

            {/* Fields stay mounted (just hidden) after "Almost there" so that
                "Edit message" brings back what was typed. */}
            <div
              className={cn("grid gap-3", (status === "sent" || status === "compose") && "hidden")}
            >
              <Field label="Name" name="name" autoComplete="name" />
              <Field label="Email" name="email" type="email" autoComplete="email" />
              <Field label="What are you looking for?" name="type" />
              <Field label="Phone" name="phone" type="tel" autoComplete="tel" optional />
              <label className="grid gap-1.5 font-display text-sm text-muted">
                What are you trying to get done?
                <textarea
                  name="message"
                  rows={4}
                  // text-base (16px): below that, iOS Safari zooms the whole
                  // page in on focus (it treats a sub-16px input as "content
                  // too small to type into" and auto-scales) — jarring on a
                  // form that's meant to stay put. It'd otherwise inherit
                  // this label's own text-sm (14px).
                  className="rounded-sm border border-teal-dim/25 bg-bg-deep/40 px-3 py-2.5 font-display text-base text-fg backdrop-blur-md outline-none focus:border-teal-dim"
                  suppressHydrationWarning
                />
              </label>
              {error ? <p className="font-display text-sm text-amber">{error}</p> : null}
              <button
                type="submit"
                disabled={status === "sending"}
                className={cn(
                  "pressable mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-teal-dim px-6 py-2.5 font-display text-sm font-bold tracking-[0.14em] text-fg uppercase",
                  status === "sending" && "opacity-70",
                )}
              >
                {status === "sending" ? "Sending…" : "Send message"}
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Contact row — sits at the very bottom of the section, right above the
          footer, larger and brighter than the old muted line so it reads as a
          real call to action. */}
      <div
        ref={contactRow.ref}
        className={cn(
          "relative mx-auto mt-20 flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-5 font-display text-lg font-medium text-fg md:mt-28 md:text-xl",
          contactRow.className,
        )}
        style={contactRow.style}
      >
        <a
          href={BRAND_CONTACT.phoneHref}
          className="inline-flex items-center gap-3 hover:text-teal-dim"
        >
          <Phone className="size-6 text-teal" strokeWidth={1.5} />
          {BRAND_CONTACT.phone}
        </a>
        <a
          href={BRAND_CONTACT.emailHref}
          className="inline-flex items-center gap-3 hover:text-teal-dim"
        >
          <Mail className="size-6 text-teal" strokeWidth={1.5} />
          {BRAND_CONTACT.email}
        </a>
        <span className="inline-flex items-center gap-3">
          <MapPin className="size-6 text-teal" strokeWidth={1.5} />
          {BRAND_CONTACT.location}
        </span>
        <a
          href={BRAND_CONTACT.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 hover:text-teal-dim"
        >
          <Github className="size-6 text-teal" strokeWidth={1.5} />
          GitHub
        </a>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  optional,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  optional?: boolean;
}) {
  return (
    <label className="grid gap-1.5 font-display text-sm text-muted">
      <span>
        {label}
        {optional ? <span className="text-faint"> · optional</span> : null}
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        // text-base: see the same note on the textarea above — keeps iOS
        // Safari from zooming the page in when this field is focused.
        className="h-10 rounded-sm border border-teal-dim/25 bg-bg-deep/40 px-3 font-display text-base text-fg backdrop-blur-md outline-none focus:border-teal-dim"
        suppressHydrationWarning
      />
    </label>
  );
}
