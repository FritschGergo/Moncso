export interface CourseData {
  id: string;
  title: string;
  description: string;
  price: string;
  features: string[];
  popular: boolean;
  weeks?: { id: number; title: string; desc: string; status: 'current' | 'locked' | 'completed' }[];
}

export const availableCourses: CourseData[] = [
  {
    id: "c1",
    title: "Alap kurzus",
    description: "Sajátítsd el a macskatartás és nevelés alapjait 9 hét alatt. Minden héten új lecke nyílik meg, hogy lépésről lépésre haladhass.",
    price: "14 990 Ft",
    features: [
      "9 hetes átfogó tananyag",
      "Videós és szöveges leckék",
      "Gyakorlati feladatok",
      "Közösségi hozzáférés",
      "Örökös hozzáférés"
    ],
    popular: true,
    weeks: [
      { id: 1, title: "A macska testbeszédének alapjai", desc: "Ismerd meg, mit üzen a cicád a farkával, fülével és testtartásával.", status: 'current' },
      { id: 2, title: "A megfelelő környezet kialakítása", desc: "Hogyan tedd macskabaráttá az otthonod? Kaparófák, pihenőhelyek.", status: 'locked' },
      { id: 3, title: "Táplálkozás és egészség", desc: "Mivel és hányszor etesd? Alapvető egészségügyi jelek felismerése.", status: 'locked' },
      { id: 4, title: "Játék és mentális stimuláció", desc: "A vadászösztön levezetése és a megfelelő játékok kiválasztása.", status: 'locked' },
      { id: 5, title: "Problémás viselkedések I.", desc: "Karmolás, rágás és agresszió kezelése pozitív megerősítéssel.", status: 'locked' },
      { id: 6, title: "Problémás viselkedések II.", desc: "Alomhasználati problémák okai és hatékony megoldásuk.", status: 'locked' },
      { id: 7, title: "Szocializáció", desc: "Új emberekhez, gyerekekhez és más állatokhoz való szoktatás.", status: 'locked' },
      { id: 8, title: "Ápolás és állatorvos", desc: "Stresszmentes hordozóhoz szoktatás, karomvágás és fésülés.", status: 'locked' },
      { id: 9, title: "Haladó tréning és trükkök", desc: "Klikker tréning alapok, pacsi és egyéb szórakoztató trükkök.", status: 'locked' },
    ]
  },
  {
    id: "c2",
    title: "Haladó viselkedésterápia",
    description: "Mélyebb betekintés a problémás viselkedések kezelésébe. Agresszió, szeparációs szorongás és extrém félelem kezelése.",
    price: "24 990 Ft",
    features: [
      "6 hetes intenzív tréning",
      "Esettanulmányok elemzése",
      "Személyre szabható tervek",
      "1 havi VIP konzultáció",
      "Letölthető munkafüzetek"
    ],
    popular: false,
  },
  {
    id: "c3",
    title: "Klikker tréning mesterfokon",
    description: "Tanítsd meg cicádat lenyűgöző trükkökre és hasznos viselkedésekre a pozitív megerősítés erejével.",
    price: "9 990 Ft",
    features: [
      "4 hetes gyakorlati kurzus",
      "Lépésről lépésre videók",
      "Időzítés és jutalmazás",
      "Haladó trükkök (pl. agility)",
      "Klikker használati útmutató"
    ],
    popular: false,
  }
];
