import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default function TermsPage() {
  const lastUpdated = new Date();
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-[#0b3d4d] mb-6">Termini di Utilizzo</h1>
      <p className="text-gray-700 mb-4 text-lg">
        Benvenuto su activenglish. Accedendo e utilizzando la nostra piattaforma, accetti di rispettare e di essere vincolato dai seguenti termini e condizioni di utilizzo. Ti preghiamo di leggerli attentamente.
      </p>

      <h2 className="text-2xl font-semibold text-[#0b3d4d] mt-8 mb-4">1. Accettazione dei Termini</h2>
      <p className="text-gray-700 mb-4">
        Utilizzando activenglish, confermi di aver letto, compreso e accettato questi Termini di Utilizzo, nonché la nostra Informativa sulla Privacy. Se non sei d&apos;accordo con una qualsiasi parte di questi termini, non devi utilizzare la nostra piattaforma.
      </p>

      <h2 className="text-2xl font-semibold text-[#0b3d4d] mt-8 mb-4">2. Utilizzo del Servizio</h2>
      <p className="text-gray-700 mb-4">
        activenglish fornisce una piattaforma di apprendimento online per corsi di inglese. Ti impegni a utilizzare il servizio esclusivamente per scopi leciti e in conformità con questi termini.
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
        <li>Non utilizzerai la piattaforma per attività illegali o non autorizzate.</li>
        <li>Non tenterai di interferire con il corretto funzionamento della piattaforma.</li>
        <li>Non copierai, distribuirai né modificherai alcuna parte della piattaforma senza il nostro consenso.</li>
        <li>Non condividerai le tue credenziali di accesso con terze parti.</li>
        <li>Rispetterai i diritti di proprietà intellettuale di activenglish e dei suoi contenuti.</li>
      </ul>

      <h2 className="text-2xl font-semibold text-[#0b3d4d] mt-8 mb-4">3. Corsi di Inglese</h2>
      <p className="text-gray-700 mb-4">
        activenglish offre corsi di inglese online attraverso webinar e contenuti didattici. I corsi includono:
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
        <li>Video lezioni e contenuti multimediali</li>
        <li>Materiali didattici e documenti</li>
        <li>Accesso ai contenuti del corso per la durata del servizio</li>
        <li>Certificati di completamento per i corsi completati</li>
      </ul>
      <p className="text-gray-700 mb-4">
        Ti impegni a utilizzare i contenuti dei corsi esclusivamente per il tuo apprendimento personale e non a condividerli, distribuirli o rivenderli a terze parti.
      </p>

      <h2 className="text-2xl font-semibold text-[#0b3d4d] mt-8 mb-4">4. Account e Credenziali</h2>
      <p className="text-gray-700 mb-4">
        Sei responsabile di mantenere la riservatezza delle tue credenziali di accesso. Sei responsabile di tutte le attività che si verificano sotto il tuo account. Devi notificarci immediatamente di qualsiasi uso non autorizzato del tuo account.
      </p>

      <h2 className="text-2xl font-semibold text-[#0b3d4d] mt-8 mb-4">5. Proprietà Intellettuale</h2>
      <p className="text-gray-700 mb-4">
        Tutti i contenuti di activenglish, inclusi testi, grafiche, loghi, immagini, video, materiali didattici e software, sono di proprietà di activenglish o dei suoi licenzianti e sono protetti dalle leggi sulla proprietà intellettuale. Non puoi utilizzare i nostri contenuti senza il nostro permesso espresso.
      </p>

      <h2 className="text-2xl font-semibold text-[#0b3d4d] mt-8 mb-4">6. Limitazione di Responsabilità</h2>
      <p className="text-gray-700 mb-4">
        activenglish viene fornito &quot;così com&apos;è&quot; e &quot;secondo disponibilità&quot;. Non garantiamo che la piattaforma sia ininterrotta, priva di errori o sicura. Non saremo responsabili di eventuali danni diretti, indiretti, incidentali, speciali o consequenziali derivanti dall&apos;uso o dall&apos;impossibilità di utilizzare la piattaforma.
      </p>

      <h2 className="text-2xl font-semibold text-[#0b3d4d] mt-8 mb-4">7. Modifiche ai Termini</h2>
      <p className="text-gray-700 mb-4">
        Ci riserviamo il diritto di modificare questi Termini di Utilizzo in qualsiasi momento. Ti informeremo di eventuali modifiche pubblicando i nuovi termini sulla piattaforma. Il tuo utilizzo continuato della piattaforma dopo tali modifiche costituisce l&apos;accettazione dei nuovi termini.
      </p>

      <h2 className="text-2xl font-semibold text-[#0b3d4d] mt-8 mb-4">8. Risoluzione</h2>
      <p className="text-gray-700 mb-4">
        Ci riserviamo il diritto di sospendere o terminare il tuo accesso alla piattaforma in qualsiasi momento, senza preavviso, per violazione di questi termini o per qualsiasi altro motivo a nostra discrezione.
      </p>

      <h2 className="text-2xl font-semibold text-[#0b3d4d] mt-8 mb-4">9. Legge Applicabile</h2>
      <p className="text-gray-700 mb-4">
        Questi Termini di Utilizzo sono disciplinati e interpretati in conformità con le leggi italiane, senza tener conto dei principi di conflitto di leggi.
      </p>

      <h2 className="text-2xl font-semibold text-[#0b3d4d] mt-8 mb-4">10. Contatto</h2>
      <p className="text-gray-700 mb-4">
        Se hai domande su questi termini, puoi contattarci attraverso i canali ufficiali della piattaforma activenglish.
      </p>

      <p className="text-sm text-gray-500 mt-12" suppressHydrationWarning>
        Ultimo aggiornamento: {format(lastUpdated, 'dd/MM/yyyy')}
      </p>
    </div>
  );
}
