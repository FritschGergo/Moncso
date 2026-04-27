import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-bg-light text-text-dark font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Vissza a főoldalra</span>
          </Link>
          <div className="flex items-center gap-2">
            <PawPrint className="text-primary w-8 h-8" />
            <span className="font-bold text-xl tracking-tight text-text-dark">Macska<span className="text-primary">Terápia</span></span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl font-extrabold text-text-dark mb-8">Felhasználási Feltételek</h1>
          
          <div className="space-y-6 text-text-muted leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-text-dark mb-3">1. Általános rendelkezések</h2>
              <p>
                A jelen Felhasználási Feltételek (a továbbiakban: "Feltételek") szabályozzák a MacskaTerápia (a továbbiakban: "Szolgáltató") által üzemeltetett weboldal és az azon keresztül elérhető szolgáltatások, kurzusok és konzultációk igénybevételét.
              </p>
              <p className="mt-2">
                A weboldal használatával, illetve a szolgáltatásokra való regisztrációval Ön elfogadja a jelen Feltételeket. Kérjük, figyelmesen olvassa el ezeket, mielőtt használná a szolgáltatásainkat.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-dark mb-3">2. Szolgáltatások leírása</h2>
              <p>
                A MacskaTerápia online oktatási anyagokat (videókurzusokat), valamint online videókonzultációs lehetőséget biztosít macskaviselkedési problémák kezeléséhez. A kurzusok anyagai a vásárlást követően saját tempóban végezhetők el.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-dark mb-3">3. Regisztráció és fiók</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>A szolgáltatások teljes körű igénybevételéhez regisztráció szükséges.</li>
                <li>A regisztráció során megadott adatoknak a valóságnak megfelelőnek kell lenniük.</li>
                <li>A felhasználó felelős a fiókja jelszavának titokban tartásáért és a fiókjából végzett minden tevékenységért.</li>
                <li>A Szolgáltató fenntartja a jogot a fiók felfüggesztésére vagy törlésére, amennyiben a felhasználó megsérti a jelen Feltételeket.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-dark mb-3">4. Fizetés és számlázás</h2>
              <p>
                Jelenleg a fizetés és számlázás manuálisan történik. A vásárlási szándék jelzése után a Szolgáltató felveszi a kapcsolatot a felhasználóval a megadott e-mail címen a fizetési részletek egyeztetése céljából. A kurzusokhoz és konzultációkhoz való hozzáférés a sikeres fizetés után kerül aktiválásra.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-dark mb-3">5. Szerzői jogok</h2>
              <p>
                A weboldalon található minden tartalom (szövegek, videók, képek, grafikák) a Szolgáltató szellemi tulajdonát képezi. A tartalmak másolása, terjesztése, módosítása vagy bármilyen formában történő üzleti célú felhasználása a Szolgáltató előzetes írásbeli engedélye nélkül szigorúan tilos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-dark mb-3">6. Felelősségkorlátozás</h2>
              <p>
                A kurzusokban és konzultációk során elhangzott információk tájékoztató jellegűek, és nem helyettesítik a szakképzett állatorvosi diagnózist vagy kezelést. A Szolgáltató nem vállal felelősséget a tanácsok alkalmazásából eredő esetleges károkért vagy sérülésekért. Súlyos egészségügyi vagy viselkedési probléma esetén mindig forduljon állatorvoshoz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-dark mb-3">7. Módosítások</h2>
              <p>
                A Szolgáltató fenntartja a jogot a jelen Feltételek egyoldalú módosítására. A módosítások a weboldalon történő közzététellel lépnek hatályba.
              </p>
            </section>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-text-muted text-center">
            Utolsó frissítés: 2023. október 1.
          </div>
        </div>
      </div>
    </div>
  );
}
