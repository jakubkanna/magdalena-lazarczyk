import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import type { Route } from "./+types/bio";

const bioImageSrc = `${import.meta.env.BASE_URL}image 1.png`;

const bioParagraphs = [
  "W swojej twórczości łączy doświadczenia z obszarów fotografii, kolażu, instalacji i działań site-specific z praktyką teatralną. Tworzy scenografie, kostiumy i lalki, których forma wynika z eksperymentów wizualnych oraz poszukiwań formalnych.",
  "Jej prace charakteryzuje unikalne podejście do przestrzeni i obrazu scenicznego. Projekty scenograficzne i kostiumowe traktuje jako rozszerzenie indywidualnego języka wizualnego, a teatr jako pole współdziałania, dialogu i kolektywnego tworzenia. Często pracuje w duecie artystycznym z Łukaszem Sosińskim.",
  "Jest absolwentką kulturoznawstwa na Uniwersytecie im. Adama Mickiewicza w Poznaniu (2010), fotografii na Uniwersytecie Artystycznym w Poznaniu (2013) oraz sztuki mediów na Akademii Sztuk Pięknych w Warszawie (2015), gdzie obroniła dyplom w Pracowni Działań Przestrzennych prof. Mirosława Bałki. Jej praca dyplomowa została nagrodzona na wystawie „Coming Out” jako najlepsza realizacja w dziedzinie sztuki nowych mediów oraz zdobyła główną nagrodę na wystawie „(Nie)obecność” w Galerii Labirynt (2017).",
  "Jej praktyka artystyczna wyrasta z interdyscyplinarnych źródeł i łączy elementy teorii kultury, estetyki oraz eksperymentów formalnych. Inspiruje ją świat rzeczy – postrzega siebie jako poszukiwaczkę i archeolożkę, która bada materię świata, odkrywa jej fragmenty i porządkuje je na nowo. Punktem wyjścia są dla niej sztuki wizualne, jednak to ich przenikanie z praktyką teatralną generuje twórcze napięcia. Praca w teatrze pozwala jej przekraczać przyzwyczajenia i przyjęte schematy, implementując rozwiązania nieoczywiste i wizualnie złożone. Interesuje ją relacja przedmiotów z ich kontekstem – buduje z nich narracje, które angażują widza i prowokują do refleksji.",
  "Projektuje scenografie, kostiumy i wizualizacje, które współtworzą język spektakli oraz ich emocjonalną przestrzeń. Wśród zrealizowanych projektów znajdują się m.in.: Mur (Teatr Polski w Bydgoszczy), Hamer (Teatr Studio w Warszawie), Królestwa (Teatr Guliwer w Warszawie), Tajemniczy ogród (Teatr Zagłębia) oraz You Can Fail! Porażka Show (Teatr Komedia w Warszawie). Od lat współpracuje z Teatrem 21.",
  "Prowadzi działalność edukacyjną i warsztatową, w tym projekty „Połączenia#2” i „Połączenia#3” w wielokulturowych szkołach podstawowych w Warszawie, w ramach których wraz z dziećmi tworzyła elementy scenografii i kostiumów do spektakli prezentowanych w Teatrze Guliwer.",
  "Ważne są dla niej idee pracy ekologicznej i odpowiedzialnej – projektowanie w duchu zero waste oraz wrażliwość na kontekst społeczny.",
  "Współtworzyła performatywny duet TWINS z Zuzą Golińską. W latach 2014–2021 była kuratorką i współprowadzącą ROD – Realny Obszar Działań w Warszawie, przestrzeni artystycznej zorientowanej na dialog, niezależność i eksperyment. Jej prace były prezentowane w Polsce i za granicą, m.in. w Zachęcie, Galerii Labirynt, Galerii Arsenał, Galerii SKALA, Showroom MAMA (Rotterdam), Officine 800 (Wenecja), Narodowej Galerii Sztuki w Waszyngtonie oraz CCA Tbilisi.",
  "Jej praktyka to ciągła próba redefinicji granic dyscyplin i odkrywania punktów przecięcia pomiędzy światem sztuki a przestrzenią społeczno-teatralną.",
];

const exhibitions = [
  "2023 – Struktury przejścia, Galeria Arsenał (wystawa zbiorowa)",
  "2022 – Ciała obiektów, Galeria Labirynt (wystawa indywidualna)",
  "2021 – Expanded Stage, Zachęta – Narodowa Galeria Sztuki (wystawa zbiorowa)",
  "2020 – Materia i narracja, Galeria SKALA (wystawa indywidualna)",
  "2019 – Objects in Dialogue, Showroom MAMA (wystawa zbiorowa)",
  "2018 – Przestrzenie wspólne, ROD – Realny Obszar Działań (projekt kuratorsko-artystyczny)",
  "2017 – (Nie)obecność, Galeria Labirynt (wystawa zbiorowa, nagroda główna)",
  "2016 – Interferencje, Officine 800 (wystawa zbiorowa)",
  "2015 – Coming Out – Najlepsze Dyplomy ASP, Akademia Sztuk Pięknych w Warszawie (wystawa zbiorowa, wyróżnienie)",
  "2014 – Nowe napięcia, CCA Tbilisi (wystawa zbiorowa)",
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bio | Magdalena Łazarczyk" },
    {
      name: "description",
      content: "Biografia Magdaleny Łazarczyk.",
    },
  ];
}

export default function Bio() {
  const location = useLocation();
  const scrollRootRef = useRef<HTMLElement | null>(null);
  const workshopsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (location.hash !== "#warsztaty") {
      scrollRootRef.current?.scrollTo({ top: 0 });
      return;
    }

    window.requestAnimationFrame(() => {
      workshopsRef.current?.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });
    });
  }, [location.hash]);

  return (
    <main
      ref={scrollRootRef}
      className="h-svh overflow-y-auto bg-white px-4 pb-16 pt-28 text-[#111] md:px-8"
    >
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-y-[100px]">
        <section className="grid grid-cols-1 gap-8 md:mt-[200px] md:grid-cols-2 md:gap-10">
          <h1 className="font-display text-[clamp(42px,12vw,72px)] font-bold italic leading-[0.95] md:text-[clamp(76px,11vw,160px)]">
            Artystka wizualna, scenografka i kostiumografka
          </h1>
          <div className="flex justify-start md:justify-end">
            <div className="w-full md:w-[33%] md:min-w-[128px]">
              <a
                className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111]"
                href={bioImageSrc}
                target="_blank"
                rel="noreferrer"
                aria-label="Otwórz zdjęcie Magdaleny Łazarczyk w nowej karcie"
              >
                <img
                  className="block aspect-[386/407] h-auto w-full object-contain"
                  src={bioImageSrc}
                  alt="Magdalena Łazarczyk"
                  width={386}
                  height={407}
                  decoding="async"
                  draggable={false}
                />
              </a>
            </div>
          </div>
        </section>

        <section className="bio-content w-full md:max-w-66/100">
          {bioParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
          <h2 className="font-display text-[clamp(34px,5vw,72px)] font-normal italic leading-[0.95]">
            Wybrane wystawy i prezentacje
          </h2>
          <div className="bio-content">
            {exhibitions.map((exhibition) => (
              <p key={exhibition}>{exhibition}</p>
            ))}
          </div>
        </section>

        <section
          id="warsztaty"
          ref={workshopsRef}
          className="grid scroll-mb-16 grid-cols-1 gap-8 pb-12 md:grid-cols-2 md:gap-10"
        >
          <h2 className="font-display text-[clamp(34px,5vw,72px)] font-normal italic leading-[0.95]">
            Warsztaty teatralne:
          </h2>
          <div className="bio-content">
            <p>
              Miejsce zajęć:
              <br />
              Centrum Kultury „Scena”, ul. Przykładowa 12, 00-000 Miasto
            </p>
            <p>
              Telefon:
              <br />
              +48 123 456 789
            </p>
            <p>
              E-mail:
              <br />
              warsztaty@scena.pl
            </p>
            <p>
              Godziny kontaktu:
              <br />
              Poniedziałek – Piątek: 10:00–18:00
              <br />
              Sobota: 10:00-14:00
            </p>
            <p className="bio-content__workshop-signup">
              Zapisy na warsztaty
              <br />
              Aby zapisać się na warsztaty, wyślij do nas wiadomość e-mail.
            </p>
          </div>
        </section>

        <nav className="pb-14" aria-label="Bio links">
          <Link
            className="filter-button filter-button--large inline-flex no-underline"
            to="/portfolio"
          >
            Portfolio
          </Link>
        </nav>
      </div>
    </main>
  );
}
