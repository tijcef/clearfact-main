export function Newsletter() {
  return (
    <section className="bg-accent border border-border rounded-sm p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h3 className="font-serif text-2xl">The Morning Verify</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Five verified stories shaping Nigeria, in your inbox before 7am. No spam, ever.
          </p>
        </div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="flex-1 h-11 px-3 rounded-sm bg-background border border-border focus:border-primary outline-none"
          />
          <button className="h-11 px-5 rounded-sm bg-primary text-primary-foreground font-semibold hover:opacity-95">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
