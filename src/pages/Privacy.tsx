import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, ArrowLeft } from 'lucide-react';

export default function Privacy() {
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
          <h1 className="text-3xl font-extrabold text-text-dark mb-8">Adatvédelmi Irányelvek</h1>
          
          <div className="space-y-6 text-text-muted leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-text-dark mb-3">1. Adatkezelő</h2>
              <p>
                A MacskaTerápia (a továbbiakban: "Adatkezelő") tiszteletben tartja a felhasználók személyes adatait, és elkötelezett azok védelme iránt. A jelen Adatvédelmi Irányelvek (a továbbiakban: "Irányelvek") ismertetik, hogyan gyűjtjük, használjuk, tároljuk és védjük a személyes adatokat a weboldal és a szolgáltatások használata során.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-dark mb-3">2. Gyűjtött adatok köre</h2>
              <p>
                Az alábbi személyes adatokat gyűjthetjük és kezelhetjük:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Regisztrációs adatok:</strong> Név, e-mail cím, jelszó (titkosítva tárolva).</li>
                <li><strong>Profiladatok:</strong> A felhasználó által megadott további információk (pl. macska neve, fajtája, kora).</li>
                <li><strong>Tranzakciós adatok:</strong> Vásárlási szándékok, számlázási információk (a manuális fizetés során egyeztetve).</li>
                <li><strong>Feltöltött tartalmak:</strong> A házi feladatokhoz feltöltött videók, képek és szöveges leírások.</li>
                <li><strong>Technikai adatok:</strong> IP-cím, böngésző típusa, eszközinformációk, a weboldal használatára vonatkozó adatok (sütik segítségével).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-dark mb-3">3. Az adatkezelés célja</h2>
              <p>
                A személyes adatokat az alábbi célokra használjuk:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>A szolgáltatások (kurzusok, konzultációk) nyújtása és kezelése.</li>
                <li>A felhasználói fiókok létrehozása és karbantartása.</li>
                <li>Kapcsolattartás a felhasználókkal (pl. ügyfélszolgálat, számlázási egyeztetés, jelszó-visszaállítás).</li>
                <li>A feltöltött házi feladatok értékelése és visszajelzés adása.</li>
                <li>A weboldal működésének biztosítása, fejlesztése és biztonságának fenntartása.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-dark mb-3">4. Adattovábbítás és megosztás</h2>
              <p>
                A személyes adatokat harmadik féllel csak az alábbi esetekben osztjuk meg:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Szolgáltatók:</strong> Olyan harmadik felek, akik segítenek a weboldal üzemeltetésében (pl. tárhelyszolgáltatók, Firebase, e-mail küldő szolgáltatások). Ezek a szolgáltatók csak a feladataik ellátásához szükséges mértékben férhetnek hozzá az adatokhoz, és kötelesek azokat bizalmasan kezelni.</li>
                <li><strong>Jogi kötelezettség:</strong> Ha törvény, bírósági határozat vagy hatósági kérés írja elő az adatok átadását.</li>
              </ul>
              <p className="mt-2">
                Az adatokat nem adjuk el, nem adjuk bérbe és nem osztjuk meg harmadik féllel marketing céljából a felhasználó kifejezett hozzájárulása nélkül.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-dark mb-3">5. Adatbiztonság</h2>
              <p>
                Megfelelő technikai és szervezési intézkedéseket alkalmazunk a személyes adatok védelme érdekében a jogosulatlan hozzáférés, megváltoztatás, továbbítás, nyilvánosságra hozatal, törlés vagy megsemmisítés ellen. A jelszavakat titkosítva tároljuk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-dark mb-3">6. Felhasználói jogok</h2>
              <p>
                A felhasználóknak joguk van:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Tájékoztatást kérni a személyes adataik kezeléséről.</li>
                <li>Kérni a pontatlan adatok helyesbítését.</li>
                <li>Kérni a személyes adataik törlését (a jogszabályi megőrzési kötelezettségek figyelembevételével).</li>
                <li>Tiltakozni az adatkezelés ellen bizonyos esetekben.</li>
              </ul>
              <p className="mt-2">
                Ezen jogok gyakorlásához kérjük, vegye fel velünk a kapcsolatot a megadott elérhetőségeken.
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
