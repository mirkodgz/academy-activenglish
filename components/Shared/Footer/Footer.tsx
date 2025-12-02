// import Link from "next/link"; // Comentado por ahora

export function Footer() {
  return (
    <footer className="py-4 px-6 border-t bg-background w-full">
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <p>2025 © activenglish</p>

        {/* Comentado por ahora - enlaces de privacidad y términos de uso */}
        {/* <div className="flex gap-2 items-center">
          <Link href="/privacy-policy">Privacidad</Link>
          <Link href="/terms">Términos de uso</Link>
        </div> */}
      </div>
    </footer>
  );
}
