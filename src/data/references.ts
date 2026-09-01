export interface ReferenceItem {
  id: string;
  image: string;
  style: string;
  label: string;
  promptKey?: string;
  inputMode?: 'single' | 'couple';
}

export interface Category {
  id: string;
  name: string;
  tag: string;
  cover: string;
  category: 'cartoon' | 'other' | 'collage' | 'movie';
  inputMode?: 'single' | 'couple';
}

export const categories: Category[] = [
  // Row 1 (col 1→3): Zootopia | Euphoria | Titanic
  { id: 'zootopia',                  name: 'Zootopia',                       tag: 'Animated',   cover: '/styles/zootopia/zootopia1.jpg',                                                          category: 'cartoon' },
  { id: 'euphoria',                  name: 'Euphoria',                       tag: 'TV Series',  cover: '/styles/euphoria/euphoria1.webp',                                                         category: 'movie'   },
  { id: 'titanic',                   name: 'Titanic',                        tag: 'Film',       cover: '/styles/titanic/titanic1.webp',                                                           category: 'movie'   },
  // Row 2 (col 1→3): Tangled | La La Land | Mr. & Mrs. Smith
  { id: 'tangled',                   name: 'Tangled',                        tag: 'Animated',   cover: '/styles/tangled/tangled1.jpg',                                                            category: 'cartoon' },
  { id: 'lalaland',                  name: 'La La Land',                     tag: 'Film',       cover: '/styles/lalaland/lalaland1.webp',                                                         category: 'movie'   },
  { id: 'smith',                     name: 'Mr. & Mrs. Smith',               tag: 'Film',       cover: '/styles/smith/smith1.webp',                                                               category: 'movie'   },
  // Row 3 (col 1→3): Cinderella | Stranger Things | TEOTFW
  { id: 'cinderella',                name: 'Cinderella',                     tag: 'Animated',   cover: '/styles/cinderella/cinderella1.jpg',                                                      category: 'cartoon' },
  { id: 'stranger-things',           name: 'Stranger Things',                tag: 'TV Series',  cover: '/styles/stranger-things/stranger-things1.webp',                                           category: 'movie'   },
  { id: 'end-of-the-fucking-world',  name: 'The End of the F***ing World',   tag: 'TV Series',  cover: '/styles/end-of-the-fucking-world/end-of-the-fucking-world1.webp',                         category: 'movie'   },
  // Row 4: Collages
  { id: 'collage',                   name: 'Collages',                       tag: 'Collage',    cover: '/styles/collage/collage1.webp',                                                           category: 'collage' },
  // Row 5: American Psycho | Fight Club
  { id: 'americanpsycho',  name: 'American Psycho',          tag: 'Film', cover: '/styles/americanpsycho/americanpsycho1.webp',   category: 'other', inputMode: 'single' },
  { id: 'fightclub',       name: 'Fight Club',               tag: 'Film', cover: '/styles/fightclub/fightclub1.webp',             category: 'other', inputMode: 'single' },
  // Row 5b: Terminator | The Fast and the Furious
  { id: 'terminator',      name: 'Terminator',               tag: 'Film', cover: '/styles/terminator/terminator1.webp',           category: 'other', inputMode: 'single' },
  { id: 'thefast',         name: 'The Fast and the Furious', tag: 'Film', cover: '/styles/thefast/thefast1.webp',                 category: 'other', inputMode: 'single' },
  // Row 5c: Mamma Mia!
  { id: 'mammamia',        name: 'Mamma Mia!',               tag: 'Film', cover: '/styles/mammamia/mammamia1.webp',               category: 'other', inputMode: 'single' },
  // Row 5d: Rambo
  { id: 'rambo',           name: 'Rambo',                    tag: 'Film', cover: '/styles/rambo/rambo1.jpg',                     category: 'other', inputMode: 'single' },
  // Row 6: The Notebook | 500 Days of Summer | Twilight
  { id: 'thenotebook',     name: 'The Notebook',             tag: 'Film', cover: '/styles/thenotebook/thenotebook1.jpg',         category: 'movie' },
  { id: '500daysofsummer', name: '500 Days of Summer',       tag: 'Film', cover: '/styles/500daysofsummer/500daysofsummer1.jpg', category: 'movie' },
  { id: 'twilight',        name: 'Twilight',                 tag: 'Film', cover: '/styles/twilight/twilight1.webp',               category: 'movie' },
];

export function getRefsForCategory(categoryId: string): ReferenceItem[] {
  return references.filter((r) => r.style === categoryId);
}

export const references: ReferenceItem[] = [
  // ── Zootopia ──
  { id: 'zootopia-1', style: 'zootopia', label: 'Zootopia', image: '/styles/zootopia/zootopia1.jpg' },
  { id: 'zootopia-2', style: 'zootopia', label: 'Zootopia', image: '/styles/zootopia/zootopia2.webp' },
  { id: 'zootopia-3', style: 'zootopia', label: 'Zootopia', image: '/styles/zootopia/zootopia3.webp' },

  // ── Euphoria ──
  { id: 'euphoria-1', style: 'euphoria', label: 'Euphoria', image: '/styles/euphoria/euphoria1.webp' },
  { id: 'euphoria-2', style: 'euphoria', label: 'Euphoria', image: '/styles/euphoria/euphoria2.webp' },
  { id: 'euphoria-3', style: 'euphoria', label: 'Euphoria', image: '/styles/euphoria/euphoria3.webp' },

  // ── Titanic ──
  { id: 'titanic-1', style: 'titanic', label: 'Titanic', image: '/styles/titanic/titanic1.webp' },
  { id: 'titanic-2', style: 'titanic', label: 'Titanic', image: '/styles/titanic/titanic2.webp' },
  { id: 'titanic-3', style: 'titanic', label: 'Titanic', image: '/styles/titanic/titanic3.webp' },

  // ── La La Land ──
  { id: 'lalaland-1', style: 'lalaland', label: 'La La Land', image: '/styles/lalaland/lalaland1.webp', promptKey: 'LALALAND_1' },
  { id: 'lalaland-2', style: 'lalaland', label: 'La La Land', image: '/styles/lalaland/lalaland2.webp', promptKey: 'LALALAND_2' },
  { id: 'lalaland-3', style: 'lalaland', label: 'La La Land', image: '/styles/lalaland/lalaland3.webp', promptKey: 'LALALAND_3' },

  // ── Tangled ──
  { id: 'tangled-1', style: 'tangled', label: 'Tangled', image: '/styles/tangled/tangled1.jpg' },
  { id: 'tangled-2', style: 'tangled', label: 'Tangled', image: '/styles/tangled/tangled2.jpg' },
  { id: 'tangled-3', style: 'tangled', label: 'Tangled', image: '/styles/tangled/tangled3.webp' },

  // ── Mr. & Mrs. Smith ──
  { id: 'smith-1', style: 'smith', label: 'Mr. & Mrs. Smith', image: '/styles/smith/smith1.webp' },
  { id: 'smith-2', style: 'smith', label: 'Mr. & Mrs. Smith', image: '/styles/smith/smith2.webp' },
  { id: 'smith-3', style: 'smith', label: 'Mr. & Mrs. Smith', image: '/styles/smith/smith3.webp' },

  // ── Cinderella ──
  { id: 'cinderella-1', style: 'cinderella', label: 'Cinderella', image: '/styles/cinderella/cinderella1.jpg' },
  { id: 'cinderella-2', style: 'cinderella', label: 'Cinderella', image: '/styles/cinderella/cinderella2.jpg' },
  { id: 'cinderella-3', style: 'cinderella', label: 'Cinderella', image: '/styles/cinderella/cinderella3.jpg' },

  // ── Stranger Things ──
  { id: 'stranger-things-1', style: 'stranger-things', label: 'Stranger Things', image: '/styles/stranger-things/stranger-things1.webp' },
  { id: 'stranger-things-2', style: 'stranger-things', label: 'Stranger Things', image: '/styles/stranger-things/stranger-things2.webp' },
  { id: 'stranger-things-3', style: 'stranger-things', label: 'Stranger Things', image: '/styles/stranger-things/stranger-things3.webp' },

  // ── The End of the F***ing World ──
  { id: 'end-of-the-fucking-world-1', style: 'end-of-the-fucking-world', label: 'The End of the F***ing World', image: '/styles/end-of-the-fucking-world/end-of-the-fucking-world1.webp' },
  { id: 'end-of-the-fucking-world-2', style: 'end-of-the-fucking-world', label: 'The End of the F***ing World', image: '/styles/end-of-the-fucking-world/end-of-the-fucking-world2.webp' },
  { id: 'end-of-the-fucking-world-3', style: 'end-of-the-fucking-world', label: 'The End of the F***ing World', image: '/styles/end-of-the-fucking-world/end-of-the-fucking-world3.webp' },

  // ── Collages ──
  { id: 'collage-1', style: 'collage', label: 'The Notebook',      image: '/styles/collage/collage1.webp' },
  { id: 'collage-2', style: 'collage', label: 'The Notebook',      image: '/styles/collage/collage2.webp' },
  { id: 'collage-3', style: 'collage', label: '500 Days of Summer', image: '/styles/collage/collage3.webp' },
  { id: 'collage-4', style: 'collage', label: 'Me Before You',     image: '/styles/collage/collage4.webp' },
  { id: 'collage-5', style: 'collage', label: 'Mr. & Mrs. Smith',  image: '/styles/collage/collage5.webp' },
  { id: 'collage-6', style: 'collage', label: 'Spider-Man',        image: '/styles/collage/collage6.webp' },
  { id: 'collage-7', style: 'collage', label: 'Pretty Woman',      image: '/styles/collage/collage7.webp' },
  { id: 'collage-8', style: 'collage', label: 'Twilight',          image: '/styles/collage/collage8.webp' },
  { id: 'collage-9', style: 'collage', label: '500 Days of Summer', image: '/styles/collage/collage9.webp' },

  // ── American Psycho ──
  { id: 'americanpsycho-1', style: 'americanpsycho', label: 'American Psycho', image: '/styles/americanpsycho/americanpsycho1.webp', inputMode: 'single' },
  { id: 'americanpsycho-2', style: 'americanpsycho', label: 'American Psycho', image: '/styles/americanpsycho/americanpsycho2.webp', inputMode: 'single' },
  { id: 'americanpsycho-3', style: 'americanpsycho', label: 'American Psycho', image: '/styles/americanpsycho/americanpsycho3.webp', inputMode: 'single' },

  // ── Fight Club ──
  { id: 'fightclub-1', style: 'fightclub', label: 'Fight Club', image: '/styles/fightclub/fightclub1.webp', inputMode: 'single' },
  { id: 'fightclub-2', style: 'fightclub', label: 'Fight Club', image: '/styles/fightclub/fightclub2.webp', inputMode: 'single' },
  { id: 'fightclub-3', style: 'fightclub', label: 'Fight Club', image: '/styles/fightclub/fightclub3.webp', inputMode: 'single' },

  // ── Terminator ──
  { id: 'terminator-1', style: 'terminator', label: 'Terminator', image: '/styles/terminator/terminator1.webp', inputMode: 'single' },
  { id: 'terminator-2', style: 'terminator', label: 'Terminator', image: '/styles/terminator/terminator2.webp', inputMode: 'single' },
  { id: 'terminator-3', style: 'terminator', label: 'Terminator', image: '/styles/terminator/terminator3.webp', inputMode: 'single' },

  // ── The Fast and the Furious ──
  { id: 'thefast-1', style: 'thefast', label: 'The Fast and the Furious', image: '/styles/thefast/thefast1.webp', inputMode: 'single' },
  { id: 'thefast-2', style: 'thefast', label: 'The Fast and the Furious', image: '/styles/thefast/thefast2.webp', inputMode: 'single' },
  { id: 'thefast-3', style: 'thefast', label: 'The Fast and the Furious', image: '/styles/thefast/thefast3.webp', inputMode: 'single' },

  // ── Mamma Mia! ──
  { id: 'mammamia-1', style: 'mammamia', label: 'Mamma Mia!', image: '/styles/mammamia/mammamia1.webp', inputMode: 'single' },
  { id: 'mammamia-2', style: 'mammamia', label: 'Mamma Mia!', image: '/styles/mammamia/mammamia2.webp', inputMode: 'single' },
  { id: 'mammamia-3', style: 'mammamia', label: 'Mamma Mia!', image: '/styles/mammamia/mammamia3.jpg', inputMode: 'single' },

  // ── Rambo ──
  { id: 'rambo-1', style: 'rambo', label: 'Rambo', image: '/styles/rambo/rambo1.jpg', inputMode: 'single' },
  { id: 'rambo-2', style: 'rambo', label: 'Rambo', image: '/styles/rambo/rambo2.jpg', inputMode: 'single' },
  { id: 'rambo-3', style: 'rambo', label: 'Rambo', image: '/styles/rambo/rambo3.jpg', inputMode: 'single' },

  // ── The Notebook ──
  { id: 'thenotebook-1', style: 'thenotebook', label: 'The Notebook', image: '/styles/thenotebook/thenotebook1.jpg' },
  { id: 'thenotebook-2', style: 'thenotebook', label: 'The Notebook', image: '/styles/thenotebook/thenotebook2.jpg' },
  { id: 'thenotebook-3', style: 'thenotebook', label: 'The Notebook', image: '/styles/thenotebook/thenotebook3.jpg' },

  // ── 500 Days of Summer ──
  { id: '500daysofsummer-1', style: '500daysofsummer', label: '500 Days of Summer', image: '/styles/500daysofsummer/500daysofsummer1.jpg' },
  { id: '500daysofsummer-2', style: '500daysofsummer', label: '500 Days of Summer', image: '/styles/500daysofsummer/500daysofsummer2.jpg' },
  { id: '500daysofsummer-3', style: '500daysofsummer', label: '500 Days of Summer', image: '/styles/500daysofsummer/500daysofsummer3.jpg' },

  // ── Twilight ──
  { id: 'twilight-1', style: 'twilight', label: 'Twilight', image: '/styles/twilight/twilight1.webp' },
  { id: 'twilight-2', style: 'twilight', label: 'Twilight', image: '/styles/twilight/twilight2.webp' },
  { id: 'twilight-3', style: 'twilight', label: 'Twilight', image: '/styles/twilight/twilight3.webp' },
];
