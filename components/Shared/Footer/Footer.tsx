export function Footer() {
  return (
    <footer className="py-4 px-6 border-t bg-background w-full">
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <p>Active English © 2025 - All rights reserved</p>

        <div className="flex gap-4 items-center">
          <a
            href="https://activenglish.it/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </a>
          <span>-</span>
          <a
            href="https://activenglish.it/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Cookie Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
