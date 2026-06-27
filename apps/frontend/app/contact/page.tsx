import Link from 'next/link';

export const metadata = {
  title: 'Contact – InkSphere',
  description: 'Get in touch with the creator of InkSphere.',
};

const socials = [
  {
    label: 'Email',
    value: 'kieuphat159@gmail.com',
    href: 'mailto:kieuphat159@gmail.com',
    tag: 'MAIL',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0L12 13.5 2.25 6.75" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    value: 'kieuphat159',
    href: 'https://github.com/kieuphat159',
    tag: 'CODE',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.744.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    value: 'Kiều Nguyễn Thành Phát',
    href: 'https://www.facebook.com/thanhphat.kieu.942/',
    tag: 'SOCIAL',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    value: 'Phát Kiều',
    href: 'https://www.linkedin.com/in/ph%C3%A1t-ki%E1%BB%81u-a0205233a/',
    tag: 'NETWORK',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M20.447 20.452H16.893V14.883c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a1.977 1.977 0 01-1.972-1.977 1.977 1.977 0 011.972-1.977 1.977 1.977 0 011.972 1.977 1.977 1.977 0 01-1.972 1.977zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="bg-[#121212] dark:bg-[#0a0a0a] text-white pt-28 pb-16 md:pt-36 md:pb-24 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6">
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-4 block">
            KIEU NGUYEN THANH PHAT // CREATOR
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-black leading-tight tracking-tight mb-6">
            Let's get<br />
            <span className="italic font-normal text-slate-300">in touch.</span>
          </h1>
          <div className="h-[1px] w-20 bg-slate-500 my-6" />
          <p className="text-slate-300 text-lg md:text-xl font-serif max-w-2xl leading-relaxed">
            Open to collaboration, feedback, and new ideas. Reach out through any channel below — I'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Social cards */}
      <section className="bg-background text-foreground py-20 border-b border-border">
        <div className="max-w-5xl mx-auto px-6">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4 block">
            CONTACT CHANNELS
          </span>
          <h2 className="text-3xl font-serif font-bold mb-12 text-foreground">Find me here.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="group flex items-start gap-5 border border-border p-6 rounded-sm hover:border-foreground/50 transition-colors duration-300"
              >
                <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 mt-0.5 flex-shrink-0">
                  {s.icon}
                </span>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">{s.tag}</span>
                  <p className="font-mono text-sm font-bold text-foreground mb-0.5">{s.label}</p>
                  <p className="font-serif text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 break-all">{s.value}</p>
                </div>
                <span className="ml-auto text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300 text-lg self-center">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Brief bio */}
      <section className="bg-background text-foreground py-20">
        <div className="max-w-3xl mx-auto px-6">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4 block">
            ABOUT ME
          </span>
          <div className="editorial-content text-foreground">
            <p>
              I'm a software developer with a passion for building products that feel good to use. InkSphere is my attempt to prove that a blog platform can have real personality — both in its writing experience and its social layer.
            </p>
            <p>
              Whether you're a writer, a reader, or someone building something similar, I'd genuinely enjoy a conversation. Drop me a message on any of the channels above.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block font-mono text-xs uppercase tracking-widest border border-border px-6 py-3 hover:bg-foreground hover:text-background transition-colors duration-300 mt-6"
          >
            ← Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}

