import Link from 'next/link';
import Hero from '@/components/hero';

export const metadata = {
  title: 'About – InkSphere',
  description: 'InkSphere is where writers, thinkers, and creators share ideas — and connect as a community.',
};

const features = [
  {
    title: 'Write & Publish',
    desc: 'A distraction-free editor built for long-form essays, tutorials, and stories. Your words deserve a premium stage.',
  },
  {
    title: 'Connect & Follow',
    desc: 'Follow writers you love, get notified of new posts, and build a reading community around shared interests.',
  },
  {
    title: 'Chat & Collaborate',
    desc: 'Go beyond comments. Real-time chat and video calls let you build genuine relationships with your audience.',
  },
];

export default function AboutPage() {
  return (
    <main className="flex flex-col">
      <Hero />

      {/* Features */}
      <section className="bg-background text-foreground py-20 border-b border-border">
        <div className="max-w-5xl mx-auto px-6">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4 block">
            PLATFORM FEATURES
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-foreground">
            More than a blog.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="border border-border p-6 rounded-sm group hover:border-foreground/40 transition-colors duration-300">
                <h3 className="font-mono text-sm uppercase tracking-widest font-bold mb-3 text-foreground">{f.title}</h3>
                <p className="font-serif text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="bg-background text-foreground py-20 border-b border-border">
        <div className="max-w-3xl mx-auto px-6">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4 block">
            OUR STORY
          </span>
          <blockquote className="border-l-2 border-foreground pl-6 italic font-serif text-2xl leading-relaxed text-foreground mb-10">
            "I wanted a place where writing comes first — but where community doesn't have to be an afterthought."
          </blockquote>
          <div className="editorial-content text-foreground">
            <p>
              InkSphere started as a personal blog project, a space to practice writing and share thoughts publicly. But it quickly became clear that the best part of publishing wasn't the post — it was the conversation that followed.
            </p>
            <p>
              So we built something different: a platform where long-form content lives alongside real social features. Follow writers, exchange messages, jump on a video call. All without leaving the reading experience you love.
            </p>
            <p>
              InkSphere is built with Next.js, React Query, and a design philosophy that prizes readability, performance, and authenticity over noise.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#121212] dark:bg-[#0a0a0a] text-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Ready to start writing?</h2>
          <p className="text-slate-300 font-serif text-lg mb-8">
            Join InkSphere and publish your first story today.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block border border-white text-white font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-white hover:text-black transition-colors duration-300"
          >
            Create an Account →
          </Link>
        </div>
      </section>
    </main>
  );
}

