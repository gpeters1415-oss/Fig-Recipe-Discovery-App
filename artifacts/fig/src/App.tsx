import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import {
  ArrowDownRight, ArrowLeft, ArrowRight, Bookmark, Check, ChefHat, Clock3,
  Heart, Leaf, Menu, Plus, Search, Settings2, Sparkles, Users, X,
} from 'lucide-react';

type Recipe = {
  id: string; name: string; image: string; description: string; prepMinutes: number; cookMinutes: number;
  servings: number; ingredients: string[]; instructions: string[]; notes: string; categories: string[];
  source: string; visibility: 'private' | 'public'; isDemo: boolean; isMade: boolean; isSaved: boolean; isLoved: boolean;
};
type Category = { id: string; name: string };
type PlannerAnswers = { craving: string; dinerIds: string[]; timeLimit: string; familiarity: string };
type Store = { recipes: Recipe[]; categories: Category[]; privacy: boolean };
const KEY = 'fig-prototype-v1';
const stockImages = {
  pasta: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=1000',
  chicken: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=1000',
  salad: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?auto=compress&cs=tinysrgb&w=1000',
  soup: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=1000',
  tart: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=1000',
};
const starterRecipes: Recipe[] = [
  { id:'lemon-orzo', name:'Lemony orzo with greens', image:stockImages.pasta, description:'A bright, one-pan bowl with silky orzo, tender greens, and a little salty cheese. Weeknight comfort with the windows open.', prepMinutes:10, cookMinutes:20, servings:4, ingredients:['1½ cups orzo','3 cups vegetable stock','1 lemon, zest and juice','2 handfuls baby spinach','½ cup crumbled feta','2 tbsp olive oil','Fresh dill'], instructions:['Warm the olive oil in a deep skillet. Add orzo and toast for a minute.','Pour in the stock and simmer, stirring now and then, until the orzo is tender.','Fold in spinach, lemon zest and juice. Finish with feta and dill.'], notes:'Lovely with extra lemon at the table.', categories:['Weeknight'], source:'Fig sample kitchen', visibility:'public', isDemo:true, isMade:false, isSaved:true, isLoved:false },
  { id:'crispy-chicken', name:'Crispy chicken & herbs', image:stockImages.chicken, description:'Golden chicken, a tangle of soft herbs, and a sharp little pan sauce. The sort of dinner that makes a Tuesday feel generous.', prepMinutes:15, cookMinutes:30, servings:4, ingredients:['4 chicken thighs','1 tbsp Dijon mustard','1 lemon','2 tbsp olive oil','Parsley and chives','¾ cup chicken stock'], instructions:['Season chicken generously and sear skin-side down until deeply golden.','Turn, brush with mustard, then roast at 425°F until cooked through.','Deglaze the pan with stock and lemon. Spoon over chicken and scatter herbs.'], notes:'Try with crusty bread to catch the sauce.', categories:['Dinner party'], source:'Fig sample kitchen', visibility:'public', isDemo:true, isMade:false, isSaved:true, isLoved:true },
  { id:'green-goddess', name:'Green goddess crunch salad', image:stockImages.salad, description:'Cool cucumbers, crisp leaves, creamy avocado, and a vivid herb dressing. A fresh reset that still eats like a meal.', prepMinutes:20, cookMinutes:0, servings:2, ingredients:['1 little gem lettuce','1 cucumber','1 ripe avocado','½ cup Greek yogurt','Bunch of basil and chives','1 tbsp capers','1 lemon'], instructions:['Blend yogurt, herbs, capers, lemon and a splash of water until pourable.','Tear lettuce, slice cucumber and avocado, then pile into a wide bowl.','Dress generously and finish with cracked pepper.'], notes:'Dressing keeps for two days in the fridge.', categories:['Lunch'], source:'Fig sample kitchen', visibility:'public', isDemo:true, isMade:false, isSaved:false, isLoved:false },
  { id:'tomato-soup', name:'Slow tomato & butter bean soup', image:stockImages.soup, description:'Sweet tomatoes, creamy beans and a swirl of olive oil. A deeply comforting pot with very little hands-on time.', prepMinutes:12, cookMinutes:35, servings:4, ingredients:['1 onion, sliced','2 tins chopped tomatoes','1 tin butter beans','3 cups vegetable stock','2 tbsp olive oil','Basil leaves'], instructions:['Soften onion in olive oil over a low heat until sweet and golden.','Add tomatoes and stock; simmer gently for 25 minutes.','Stir through drained beans, warm for 5 minutes, and top with basil.'], notes:'Good with grilled cheese, naturally.', categories:['Comfort food'], source:'Fig sample kitchen', visibility:'private', isDemo:true, isMade:false, isSaved:true, isLoved:false },
  { id:'pear-tart', name:'Rustic pear & almond tart', image:stockImages.tart, description:'Thin, buttery pastry, ripe pears, and a soft almond filling. Made for the last cup of coffee and the last sliver of afternoon.', prepMinutes:25, cookMinutes:40, servings:8, ingredients:['1 sheet all-butter pastry','3 ripe pears','½ cup almond flour','⅓ cup sugar','1 egg','2 tbsp butter','1 tsp vanilla'], instructions:['Heat oven to 375°F. Stir almond flour, sugar, egg, melted butter and vanilla.','Spread almond mixture over pastry, leaving a border. Fan sliced pears on top.','Fold the edges in loosely and bake until crisp and golden, about 40 minutes.'], notes:'Serve just warm with crème fraîche.', categories:['Something sweet'], source:'Fig sample kitchen', visibility:'public', isDemo:true, isMade:false, isSaved:false, isLoved:false },
];
const defaultStore: Store = { recipes: starterRecipes, categories:[{id:'cat-weeknight',name:'Weeknight'},{id:'cat-dinner',name:'Dinner party'},{id:'cat-lunch',name:'Lunch'},{id:'cat-comfort',name:'Comfort food'},{id:'cat-sweet',name:'Something sweet'}], privacy:true };
const StoreContext = createContext<{store:Store; setStore:(next:Store)=>void} | null>(null);
function useStore() { const value = useContext(StoreContext); if (!value) throw new Error('Fig store missing'); return value; }
const navItems = [
  {label:'Home', href:'/', mark:'01'}, {label:'Discover', href:'/discover', mark:'02'},
  {label:'Recipe Box', href:'/recipe-box', mark:'03'}, {label:'At My Table', href:'/at-my-table', mark:'04'}, {label:'My Taste', href:'/my-taste', mark:'05'},
];
function IconButton({label, onClick, children, testid, className=''}:{label:string;onClick:()=>void;children:ReactNode;testid:string;className?:string}) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} data-testid={testid} className={`inline-flex items-center justify-center rounded-full transition hover:-translate-y-px ${className}`}>{children}</button>;
}
function FigMascot({onClick}:{onClick:()=>void}) {
  return <button type="button" onClick={onClick} data-testid="button-fig-mascot" aria-label="Ask Fig to help plan a meal" className="group inline-flex items-center gap-2.5 rounded-full border border-[#e2d9e8] bg-[#fffdf8] py-1.5 pl-1.5 pr-4 shadow-[0_5px_16px_rgba(66,46,88,.07)] transition hover:-translate-y-1 hover:border-[#b9a9c5]">
    <svg viewBox="0 0 48 48" role="img" aria-label="Fig mascot" className="h-11 w-11 transition-transform group-hover:rotate-[-5deg]">
      <path d="M22 11C17 6 17 3 18 2c4 1 7 4 7 8" fill="none" stroke="#6d945f" strokeWidth="2.7" strokeLinecap="round"/>
      <path d="M23 10c0-5 3-8 8-9 0 5-2 9-7 11" fill="#93ad77"/>
      <path d="M24 9C13 8 6 15 6 27c0 10 6 17 15 18 11 1 21-7 21-18 0-12-7-18-18-18Z" fill="#76528f"/>
      <path d="M11 26c1-7 5-11 11-12" fill="none" stroke="#a98cba" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="19" cy="27" rx="1.5" ry="2" fill="#fff9ed"/><ellipse cx="30" cy="27" rx="1.5" ry="2" fill="#fff9ed"/>
      <path d="M21 34c2.1 2 5.1 2 7.2-.1" fill="none" stroke="#f5e8d6" strokeWidth="1.7" strokeLinecap="round"/>
      <circle cx="14" cy="32" r="2.1" fill="#ba8499" opacity=".75"/><circle cx="35" cy="32" r="2.1" fill="#ba8499" opacity=".75"/>
    </svg>
    <span className="text-left"><span className="block text-[10px] font-bold uppercase tracking-[.14em] text-[#78936b]">Need an idea?</span><span className="serif block text-[15px] leading-tight text-[#573e76]">Ask Fig</span></span>
  </button>;
}
function RecipeCard({recipe, compact=false}:{recipe:Recipe;compact?:boolean}) {
  const {store,setStore}=useStore();
  const update=(patch:Partial<Recipe>)=>setStore({...store,recipes:store.recipes.map(r=>r.id===recipe.id?{...r,...patch}:r)});
  return <article data-testid={`card-recipe-${recipe.id}`} className={`soft-card group overflow-hidden rounded-[22px] ${compact?'':'h-full'}`}>
    <Link href={`/recipe/${recipe.id}`} className="block overflow-hidden">
      <div className={`relative overflow-hidden ${compact?'h-40':'h-52'}`}>
        <img className="photo-hover h-full w-full object-cover" src={recipe.image} alt={`${recipe.name} — demo recipe`} />
        {recipe.isDemo && <span className="absolute left-3 top-3 rounded-full bg-[#fbf8ef]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[.13em] text-[#573e76]">Fig sample</span>}
      </div>
    </Link>
    <div className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/recipe/${recipe.id}`} className="serif text-[21px] leading-[1.14] text-[#382c42] hover:text-[#694d83]" data-testid={`link-recipe-${recipe.id}`}>{recipe.name}</Link>
        <div className="flex shrink-0 gap-1.5">
          <IconButton label={recipe.isLoved?'Remove heart':'Love recipe'} onClick={()=>update({isLoved:!recipe.isLoved})} testid={`button-love-${recipe.id}`} className={`h-9 w-9 ${recipe.isLoved?'bg-[#f6e3e4] text-[#a94e5b]':'bg-[#f5f1e8] text-[#766c79]'}`}><Heart size={16} fill={recipe.isLoved?'currentColor':'none'} /></IconButton>
          <IconButton label={recipe.isSaved?'Remove from recipe box':'Save recipe'} onClick={()=>update({isSaved:!recipe.isSaved})} testid={`button-save-${recipe.id}`} className={`h-9 w-9 ${recipe.isSaved?'bg-[#e6efdf] text-[#47724e]':'bg-[#f5f1e8] text-[#766c79]'}`}><Bookmark size={16} fill={recipe.isSaved?'currentColor':'none'} /></IconButton>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#756d78]">{recipe.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-medium tracking-wide text-[#776f78]">
        <span className="inline-flex items-center gap-1"><Clock3 size={13}/>{recipe.prepMinutes+recipe.cookMinutes} min</span>
        <span>{recipe.servings} servings</span>
        {recipe.isMade&&<span className="rounded-full bg-[#e5efdf] px-2.5 py-1 text-[#436d4a]">Made by you</span>}
      </div>
    </div>
  </article>;
}
function Shell({children}:{children:ReactNode}) {
  const [location]=useLocation();
  const [menuOpen,setMenuOpen]=useState(false);
  const [settings,setSettings]=useState(false);
  const {store,setStore}=useStore();
  return <div className="fig-shell">
    <div className="grain" />
    <header className="sticky top-0 z-30 border-b border-[#e8e2d7] bg-[#f8f5ed]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3" data-testid="link-fig-home">
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#573e76] text-[#f9f5eb]"><Leaf size={20} strokeWidth={1.8}/></span>
          <span className="serif text-[27px] font-semibold tracking-[-.04em] text-[#49345f]">fig<span className="text-[#78a16b]">.</span></span>
        </Link>
        <nav className="nav-scroll hidden items-center gap-1 overflow-x-auto md:flex" aria-label="Main navigation">
          {navItems.map(item=><Link key={item.href} href={item.href} data-testid={`nav-${item.label.toLowerCase().replaceAll(' ','-')}`} className={`rounded-full px-4 py-2 text-[13px] transition ${location===item.href?'bg-[#ebe5ef] font-semibold text-[#573e76]':'text-[#746c76] hover:bg-[#f0ede5] hover:text-[#382c42]'}`}>{item.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] font-medium text-[#8e8790] sm:block">A little more at the table</span>
          <IconButton label="Prototype settings" onClick={()=>setSettings(!settings)} testid="button-settings" className="h-10 w-10 border border-[#e6dfd4] text-[#65556f]"><Settings2 size={18}/></IconButton>
          <IconButton label="Open navigation" onClick={()=>setMenuOpen(!menuOpen)} testid="button-menu" className="h-10 w-10 border border-[#e6dfd4] text-[#65556f] md:hidden"><Menu size={18}/></IconButton>
        </div>
      </div>
      {menuOpen&&<nav className="border-t border-[#e8e2d7] bg-[#f8f5ed] px-5 py-3 md:hidden">{navItems.map(item=><Link key={item.href} onClick={()=>setMenuOpen(false)} href={item.href} data-testid={`mobile-nav-${item.label.toLowerCase().replaceAll(' ','-')}`} className={`block rounded-xl px-4 py-3 text-sm ${location===item.href?'bg-[#ebe5ef] font-semibold text-[#573e76]':'text-[#625965]'}`}>{item.label}</Link>)}</nav>}
      {settings&&<div className="absolute right-5 top-[66px] z-50 w-[min(360px,calc(100vw-40px))] rounded-2xl border border-[#e5ded2] bg-[#fffdf8] p-5 shadow-[0_18px_50px_rgba(50,37,57,.14)]">
        <div className="flex items-center justify-between"><h3 className="serif text-xl">Prototype settings</h3><IconButton label="Close settings" onClick={()=>setSettings(false)} testid="button-close-settings" className="h-8 w-8 text-[#6e6570]"><X size={16}/></IconButton></div>
        <p className="mt-2 text-xs leading-relaxed text-[#77717a]">Your Fig collection is a local prototype, not a real account.</p>
        <div className="mt-4 flex items-center justify-between border-t border-[#eee9e0] pt-4">
          <div><p className="text-sm font-semibold">Default for future recipes</p><p className="mt-1 text-[11px] text-[#89818b]">Prototype preference only; each recipe has its own independent setting.</p></div>
          <button onClick={()=>setStore({...store,privacy:!store.privacy})} data-testid="toggle-privacy" aria-pressed={store.privacy} className={`relative h-7 w-12 rounded-full transition ${store.privacy?'bg-[#573e76]':'bg-[#d7d1c7]'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${store.privacy?'left-6':'left-1'}`}/></button>
        </div><p className="mt-2 text-right text-xs font-semibold text-[#573e76]">{store.privacy?'Private by default':'Public by default'}</p>
      </div>}
    </header>
    <main className="mx-auto max-w-[1440px] px-5 pb-24 pt-7 sm:px-8 lg:px-12 lg:pt-10">{children}</main>
    <footer className="mx-auto max-w-[1440px] border-t border-[#e8e2d7] px-5 py-6 text-center text-[11px] leading-relaxed text-[#89818a] sm:px-8 lg:px-12">
      Prototype note: recipes, saves, hearts, made status, categories and privacy preference live only in this browser. No real account or server.
    </footer>
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-[#e5ded2] bg-[#fbf8f1]/95 px-1 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-lg md:hidden">
      {navItems.map((item,i)=><Link key={item.href} href={item.href} data-testid={`bottom-nav-${item.label.toLowerCase().replaceAll(' ','-')}`} className={`flex min-w-0 flex-col items-center gap-1 px-1 pb-2 text-[9px] ${location===item.href?'font-bold text-[#573e76]':'text-[#847b86]'}`}><span className={`flex h-8 w-8 items-center justify-center rounded-xl ${location===item.href?'bg-[#ebe5ef]':'bg-transparent'}`}>{[<Sparkles size={17}/>,<Search size={17}/>,<Bookmark size={17}/>,<Users size={17}/>,<Leaf size={17}/>][i]}</span><span>{item.label}</span></Link>)}
    </nav>
  </div>;
}
function HomePage() {
  const {store}=useStore();
  const [openPlanner,setOpenPlanner]=useState(false);
  const [plannerStage,setPlannerStage]=useState(0);
  const [answers,setAnswers]=useState<PlannerAnswers>({craving:'',dinerIds:[],timeLimit:'',familiarity:''});
  const [offset,setOffset]=useState(0);
  const [finished,setFinished]=useState(false);
  const saved=store.recipes.filter(r=>r.isSaved);
  const recommendations=useMemo(()=>{
    const craving=answers.craving.trim().toLowerCase();
    const matchesCraving=(recipe:Recipe)=>{
      if(!craving||craving==='surprise me')return true;
      if(craving==='comfort food')return recipe.categories.includes('Comfort food');
      if(craving==='something fresh')return recipe.id==='green-goddess'||recipe.id==='lemon-orzo';
      if(craving==='something spicy')return /spicy|chili|chilli|jalapeño|jalapeno/i.test(`${recipe.name} ${recipe.description} ${recipe.ingredients.join(' ')}`);
      if(craving==='something sweet')return recipe.categories.includes('Something sweet');
      if(craving==='high protein')return recipe.id==='crispy-chicken';
      const words=craving.split(/[^a-z0-9]+/).filter(word=>word.length>2&&!['something','today','please','want','craving'].includes(word));
      const details=`${recipe.name} ${recipe.description} ${recipe.ingredients.join(' ')} ${recipe.categories.join(' ')}`.toLowerCase();
      return words.length>0&&words.every(word=>details.includes(word));
    };
    return store.recipes.filter(recipe=>recipe.isDemo&&recipe.isSaved&&matchesCraving(recipe)
      &&(!answers.timeLimit||(recipe.prepMinutes+recipe.cookMinutes<=Number(answers.timeLimit)))
      &&(answers.familiarity!=='Something new'||!recipe.isMade)
      &&(answers.familiarity!=="Something I’ve made before"||recipe.isMade)
    ).map((_,i,arr)=>arr[(i+offset)%arr.length]).slice(0,3);
  },[store.recipes,answers,offset]);
  const start=()=>{setAnswers({craving:'',dinerIds:[],timeLimit:'',familiarity:''});setPlannerStage(0);setFinished(false);setOpenPlanner(true);};
  const next=()=>{if(plannerStage<3)setPlannerStage(plannerStage+1);else setFinished(true);};
  const back=()=>{if(finished)setFinished(false);else setPlannerStage(Math.max(0,plannerStage-1));};
  const choice=(key:'craving'|'timeLimit'|'familiarity',value:string)=>setAnswers({...answers,[key]:value});
  const recommendationSignals=(recipe:Recipe)=>{
    const signals:string[]=[];
    if(answers.craving&&answers.craving.toLowerCase()!=='surprise me')signals.push(`Your selected craving: ${answers.craving}`);
    if(answers.timeLimit)signals.push(`Within your ${answers.timeLimit}-minute limit`);
    if(answers.familiarity==="Something I’ve made before")signals.push('Marked made by you');
    if(answers.familiarity==='Something new')signals.push('Not yet marked made');
    if(!signals.length)signals.push('Saved in your demo Recipe Box');
    return signals.join(' · ');
  };
  return <div className="page-enter">
    <section className="grid items-center gap-9 pb-12 pt-2 md:grid-cols-[1.05fr_.95fr] md:gap-12 md:pb-16">
      <div className="max-w-[590px]">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#dfe5d7] bg-[#edf2e7] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.17em] text-[#537650]"><span className="h-1.5 w-1.5 rounded-full bg-[#79a76c]"/>Your cooking, gathered</div>
        <h1 className="serif text-[clamp(3.2rem,7vw,6.2rem)] leading-[.98] tracking-[-.055em] text-[#49345f]">Good food<br/><em className="font-medium text-[#78996d]">finds its way</em><br/>to the table.</h1>
        <p className="mt-6 max-w-[430px] text-[15px] leading-[1.8] text-[#746a76]">A home for recipes you love, the people you cook for, and that lovely question: what should we make tonight?</p>
        <div className="mt-7 flex flex-wrap items-center gap-3"><button onClick={start} data-testid="button-plan-with-fig" className="btn-fig inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold shadow-[0_8px_18px_rgba(66,46,88,.15)]"><Sparkles size={17}/>Plan something with Fig<ArrowRight size={16}/></button><FigMascot onClick={start}/></div>
        <p className="mt-3 text-[11px] text-[#928994]">A gentle meal-planning conversation. No recipe guesses beyond your box.</p>
      </div>
      <div className="relative mx-auto w-full max-w-[570px]">
        <div className="relative aspect-[1.16/1] overflow-hidden rounded-[34px] bg-[#d6dbca]">
          <img src={stockImages.pasta} alt="Sample lemony orzo with greens" className="photo-hover h-full w-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#302540]/45 via-transparent to-transparent"/>
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-[#fffaf1]">
            <div><span className="text-[10px] font-bold uppercase tracking-[.16em] text-white/75">From your sample box</span><p className="serif mt-1 text-2xl">Lemony orzo, anyone?</p></div>
            <Link href="/recipe/lemon-orzo" aria-label="See lemony orzo recipe" data-testid="link-hero-recipe" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur"><ArrowDownRight size={20}/></Link>
          </div>
        </div>
        <div className="absolute -bottom-5 -left-3 rounded-2xl border border-[#e9e3d9] bg-[#fffdf8] px-4 py-3 shadow-lg sm:-left-7"><p className="serif text-lg text-[#573e76]">A table of your own</p><p className="mt-0.5 text-[10px] text-[#827a84]">Keep the good ones close.</p></div>
        <div className="absolute -right-2 top-5 rounded-full bg-[#e5efdd] px-4 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#456d4a] sm:-right-4">A little inspiration</div>
      </div>
    </section>
    <section className="mb-12 rounded-[26px] bg-[#ebe6ee] px-6 py-6 sm:px-8 sm:py-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d9cfe2] text-[#573e76]"><Users size={20}/></span><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#766481]">Around the table</p><h2 className="serif mt-1 text-[25px] leading-tight text-[#49345f]">See what your people are cooking.</h2><p className="mt-1 text-[13px] text-[#746a7a]">Friends’ cooking is a later-stage Fig feature. This preview uses clearly labeled sample activity.</p></div></div>
        <button onClick={()=>window.alert('Friend activity is an upcoming-stage preview. No invitations or real profiles are available yet.')} data-testid="button-friends-preview" className="shrink-0 rounded-full border border-[#cfc4d6] bg-[#f8f4fa] px-4 py-2.5 text-xs font-semibold text-[#604a73] transition hover:bg-white">Explore the preview <ArrowRight className="ml-2 inline" size={14}/></button>
      </div>
      <div className="mt-5 grid gap-2 border-t border-[#d9d1df] pt-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl bg-[#f5f1f6] p-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8cde2] text-[11px] font-bold text-[#604a73]">M</span><p className="text-xs text-[#685e6c]"><strong className="font-semibold text-[#49345f]">Mina · sample friend</strong><br/>made the lemony orzo with extra dill</p><span className="ml-auto rounded-full bg-[#e6efdf] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#50724c]">Demo</span></div>
        <div className="flex items-center gap-3 rounded-2xl bg-[#f5f1f6] p-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e7d7cb] text-[11px] font-bold text-[#875e4b]">J</span><p className="text-xs text-[#685e6c]"><strong className="font-semibold text-[#49345f]">Jules · sample friend</strong><br/>brought pear tart to Sunday lunch</p><span className="ml-auto rounded-full bg-[#e6efdf] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#50724c]">Demo</span></div>
        <p className="text-[10px] text-[#8a818e] sm:col-span-2">Names and activity are fictional demonstration content, not live friends or profiles.</p>
      </div>
    </section>
    <section className="pb-5">
      <div className="mb-5 flex items-end justify-between">
        <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#758c6a]">Popular in Fig</p><h2 className="serif mt-1 text-[32px] tracking-[-.03em] text-[#49345f]">A few to get you started</h2><p className="mt-1 text-[12px] text-[#8a818c]">Demonstration recipes only. Popularity is not real or measured.</p></div>
        <Link href="/recipe-box" data-testid="link-open-recipe-box" className="hidden items-center gap-2 pb-2 text-xs font-semibold text-[#573e76] sm:flex">Your Recipe Box <ArrowRight size={14}/></Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{store.recipes.filter(r=>r.isDemo).slice(0,3).map(r=><RecipeCard key={r.id} recipe={r}/>)}</div>
    </section>
    {saved.length===0&&<div className="mt-8 rounded-2xl border border-dashed border-[#d9d1c4] p-6 text-center text-sm text-[#766e78]">Your saved recipes will find a home here. Save one from the sample collection to begin.</div>}
    {openPlanner&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#241d2b]/45 p-3 backdrop-blur-[3px]" onClick={()=>setOpenPlanner(false)}>
      <section role="dialog" aria-modal="true" aria-labelledby="planner-title" onClick={e=>e.stopPropagation()} className="page-enter max-h-[92dvh] w-full max-w-[600px] overflow-auto rounded-[28px] border border-[#eee7db] bg-[#fbf8f0] p-5 shadow-2xl sm:p-8" data-testid="planner-dialog">
        <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#6c825d]"><Sparkles size={15}/> Fig meal planning <span className="text-[#b4acb2]">/</span> {finished?'Your shortlist':`Step ${plannerStage+1} of 4`}</div><IconButton label="Close meal planner" onClick={()=>setOpenPlanner(false)} testid="button-close-planner" className="h-9 w-9 bg-[#efeae1] text-[#6b626e]"><X size={17}/></IconButton></div>
        {!finished?<><h2 id="planner-title" className="serif mt-6 text-[clamp(2rem,6vw,3rem)] leading-tight text-[#49345f]">{['What are you craving today?','Who’s at your table today?','How much time do you have?','Feeling adventurous or sticking with a favorite?'][plannerStage]}</h2>
          <p className="mt-2 text-sm text-[#7c737e]">{['Choose a starting point or tell Fig in your own words.','Choose any or none. There are no saved diner profiles in Stage 1; these choices are a visual prototype only and do not affect recommendations.','We’ll keep every suggestion within your chosen time.','Suggestions stay grounded in your saved sample recipes, not inferred taste.'][plannerStage]}</p>
          {plannerStage===0&&<><label className="mt-5 flex items-center gap-2 rounded-2xl border border-[#e3dcd0] bg-white/80 px-4 py-3"><span className="serif text-xl text-[#91a880]">“</span><input value={answers.craving==='surprise me'?'':answers.craving} onChange={e=>choice('craving',e.target.value)} data-testid="input-planner-craving" placeholder="Type a craving…" className="w-full bg-transparent text-sm outline-none placeholder:text-[#a39aa3]"/></label><div className="mt-4 flex flex-wrap gap-2">{['Comfort food','Something fresh','Something spicy','Something sweet','High protein','Surprise me'].map((x,i)=><button key={x} onClick={()=>choice('craving',x==='Surprise me'?'surprise me':x)} data-testid={`choice-craving-${i}`} className={`rounded-full border px-3.5 py-2.5 text-xs font-semibold transition ${answers.craving.toLowerCase()===x.toLowerCase()?'border-[#79608e] bg-[#ebe5ef] text-[#573e76]':'border-[#e5ded2] bg-white/70 text-[#635968] hover:border-[#b8a8c4]'}`}>{x}</button>)}</div></>}
          {plannerStage===1&&<><div className="mt-5 space-y-3">{['Just me','A couple of us','Family & friends'].map((x,i)=><button key={x} onClick={()=>setAnswers({...answers,dinerIds:answers.dinerIds.includes(String(i))?answers.dinerIds.filter(v=>v!==String(i)):[...answers.dinerIds,String(i)]})} data-testid={`choice-diners-${i}`} className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-sm font-semibold ${answers.dinerIds.includes(String(i))?'border-[#78936c] bg-[#e8efdf] text-[#426c48]':'border-[#e5ded2] bg-white/70 text-[#635968]'}`}>{x}{answers.dinerIds.includes(String(i))&&<Check size={17}/>}</button>)}</div><p className="mt-3 text-[11px] text-[#8a818b]">No saved diner profiles exist yet. Continue with nobody selected if you prefer.</p></>}
          {plannerStage===2&&<div className="mt-6 grid grid-cols-2 gap-3">{['15','30','45','60',''].map((x,i)=><button key={x||'no-limit'} onClick={()=>choice('timeLimit',x)} data-testid={`choice-time-${i}`} className={`rounded-2xl border p-4 text-left text-sm font-semibold ${answers.timeLimit===x?'border-[#79608e] bg-[#ebe5ef] text-[#573e76]':'border-[#e5ded2] bg-white/70 text-[#635968]'}`}>{x?`${x} minutes`:'No time limit'}</button>)}</div>}
          {plannerStage===3&&<div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">{['Something new','Something I’ve made before','No preference'].map((x,i)=><button key={x} onClick={()=>choice('familiarity',x==='No preference'?'':x)} data-testid={`choice-familiarity-${i}`} className={`rounded-2xl border p-4 text-left text-sm font-semibold ${answers.familiarity===x||(!answers.familiarity&&x==='No preference')?'border-[#79608e] bg-[#ebe5ef] text-[#573e76]':'border-[#e5ded2] bg-white/70 text-[#635968]'}`}>{x}</button>)}</div>}
          <div className="mt-8 flex justify-between"><button onClick={back} disabled={plannerStage===0} data-testid="button-planner-back" className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-[#746b77] disabled:opacity-35"><ArrowLeft size={16}/>Back</button><button onClick={next} data-testid="button-planner-next" className="btn-fig inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">{plannerStage===3?'Find my recipes':'Continue'}<ArrowRight size={15}/></button></div>
        </>:<><h2 id="planner-title" className="serif mt-6 text-[clamp(2rem,6vw,3rem)] leading-tight text-[#49345f]">A few good possibilities.</h2><p className="mt-2 text-sm text-[#7c737e]">From your saved demo recipes only. Change your answers or try another set.</p>
          {recommendations.length?<div className="mt-6 grid gap-3">{recommendations.map(r=><Link key={r.id} href={`/recipe/${r.id}`} onClick={()=>setOpenPlanner(false)} data-testid={`recommendation-${r.id}`} className="flex items-center gap-4 rounded-2xl border border-[#e7e0d5] bg-white/80 p-3 transition hover:border-[#bdadc8]"><img src={r.image} alt="" className="h-16 w-20 rounded-xl object-cover"/><div className="min-w-0 flex-1"><span className="text-[9px] font-bold uppercase tracking-[.14em] text-[#78936b]">Saved demo recipe</span><p className="serif mt-0.5 text-lg text-[#49345f]">{r.name}</p><p className="text-[11px] text-[#857b86]">{r.prepMinutes+r.cookMinutes} minutes · {r.servings} servings</p><p className="mt-1 text-[10px] leading-relaxed text-[#6f8065]">{recommendationSignals(r)}</p></div><ArrowRight size={16} className="mr-1 text-[#806990]"/></Link>)}</div>:<div className="mt-6 rounded-2xl bg-[#f0ebe2] p-5"><p className="text-sm font-semibold text-[#594d61]">{store.recipes.some(r=>r.isDemo&&r.isSaved)?'No saved sample recipes match all of those choices.':'Your Recipe Box has no saved sample recipes yet.'}</p><p className="mt-1 text-xs leading-relaxed text-[#716875]">{store.recipes.some(r=>r.isDemo&&r.isSaved)?'Fig won’t swap in recipes that miss your craving or time limit. Change your answers, or browse the upcoming Discover preview.':'Save a sample recipe first, then Fig can choose only from those recipes.'}</p><Link href="/discover" onClick={()=>setOpenPlanner(false)} data-testid="link-planner-discover" className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#cfc4d6] bg-[#faf7fb] px-4 py-2 text-xs font-semibold text-[#604a73]">Go to Discover <ArrowRight size={14}/></Link></div>}
          <div className="mt-7 flex flex-wrap justify-between gap-2"><button onClick={back} data-testid="button-change-answers" className="inline-flex items-center gap-2 rounded-full border border-[#ded6ca] px-4 py-2.5 text-sm font-semibold text-[#635969]"><ArrowLeft size={15}/>Change answers</button><button onClick={()=>setOffset((offset+1)%Math.max(store.recipes.length,1))} data-testid="button-another-set" className="btn-fig inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">Another set <ArrowRight size={15}/></button></div>
        </>}
      </section>
    </div>}
  </div>;
}
function RecipeBoxPage() {
  const {store,setStore}=useStore();
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('All recipes');
  const [dialog,setDialog]=useState<{mode:'create'|'rename'|'delete';id?:string}|null>(null);
  const [name,setName]=useState('');
  const [showSaved,setShowSaved]=useState(false);
  const [madeFilter,setMadeFilter]=useState(false);
  const recipes=store.recipes.filter(r=>r.isSaved&&(!showSaved||r.isLoved)&&(!madeFilter||r.isMade)&&
    (category==='All recipes'||r.categories.includes(category))&&`${r.name} ${r.description} ${r.ingredients.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  const submitCategory=()=>{const value=name.trim();if(!value)return;if(dialog?.mode==='create'){setStore({...store,categories:[...store.categories,{id:`cat-${Date.now()}`,name:value}]});setCategory(value);}else if(dialog?.mode==='rename'&&dialog.id){const old=store.categories.find(c=>c.id===dialog.id)?.name;if(old)setStore({...store,categories:store.categories.map(c=>c.id===dialog.id?{...c,name:value}:c),recipes:store.recipes.map(r=>({...r,categories:r.categories.map(v=>v===old?value:v)}))});setCategory(value);}setDialog(null);setName('');};
  const deleteCategory=(id:string)=>{const old=store.categories.find(c=>c.id===id)?.name;if(!old)return;setStore({...store,categories:store.categories.filter(c=>c.id!==id),recipes:store.recipes.map(r=>({...r,categories:r.categories.filter(c=>c!==old)}))});if(category===old)setCategory('All recipes');setDialog(null);};
  return <div className="page-enter">
    <header className="mb-8 flex flex-col justify-between gap-5 border-b border-[#e5ded2] pb-7 sm:flex-row sm:items-end">
      <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#7b946e]">Your personal collection</p><h1 className="serif mt-2 text-[clamp(2.5rem,6vw,4rem)] leading-none tracking-[-.04em] text-[#49345f]">Recipe Box<span className="text-[#8dab79]">.</span></h1><p className="mt-3 max-w-lg text-sm leading-relaxed text-[#7a717c]">The keepers, the someday recipes, and the ones you make by heart.</p></div>
      <div className="flex flex-wrap items-center gap-2"><button onClick={()=>window.alert('Recipe import is not implemented in this prototype.')} data-testid="button-import-preview" className="rounded-full border border-[#ded7cb] px-4 py-2.5 text-xs font-semibold text-[#746b77]">Import recipe · coming later</button><span className="rounded-full bg-[#ece7df] px-3 py-2 text-xs font-medium text-[#726977]">{store.recipes.filter(r=>r.isSaved).length} saved</span></div>
    </header>
    <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-start">
      <aside className="w-full shrink-0 xl:w-[240px]">
        <div className="rounded-[22px] bg-[#eee9e1] p-4">
          <div className="mb-3 flex items-center justify-between px-1"><span className="text-[10px] font-bold uppercase tracking-[.15em] text-[#867d86]">Your shelves</span><IconButton label="Create category" onClick={()=>{setName('');setDialog({mode:'create'});}} testid="button-create-category" className="h-8 w-8 bg-[#fffdf8] text-[#573e76]"><Plus size={16}/></IconButton></div>
          <div className="space-y-1"><button onClick={()=>setCategory('All recipes')} data-testid="filter-all-recipes" className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm ${category==='All recipes'?'bg-[#fffdf8] font-semibold text-[#573e76]':'text-[#726a75] hover:bg-[#f8f5ef]'}`}>All recipes<span>{store.recipes.filter(r=>r.isSaved).length}</span></button>
          {store.categories.map(c=><div key={c.id} className={`group flex items-center rounded-xl ${category===c.name?'bg-[#fffdf8]':'hover:bg-[#f8f5ef]'}`}><button onClick={()=>setCategory(c.name)} data-testid={`filter-category-${c.id}`} className={`flex min-w-0 flex-1 items-center justify-between px-3 py-2.5 text-left text-sm ${category===c.name?'font-semibold text-[#573e76]':'text-[#726a75]'}`}><span className="truncate">{c.name}</span><span>{store.recipes.filter(r=>r.isSaved&&r.categories.includes(c.name)).length}</span></button><div className="mr-1 flex gap-0.5 opacity-70 transition group-hover:opacity-100"><IconButton label={`Rename ${c.name}`} onClick={()=>{setName(c.name);setDialog({mode:'rename',id:c.id});}} testid={`button-rename-category-${c.id}`} className="h-7 w-7 text-[#817684]"><Settings2 size={13}/></IconButton><IconButton label={`Delete ${c.name}`} onClick={()=>setDialog({mode:'delete',id:c.id})} testid={`button-delete-category-${c.id}`} className="h-7 w-7 text-[#a66060]"><X size={14}/></IconButton></div></div>)}</div>
          <div className="mt-4 border-t border-[#ddd6ca] pt-3"><button onClick={()=>setShowSaved(!showSaved)} data-testid="filter-loved-recipes" className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs ${showSaved?'bg-[#f7e7e7] font-semibold text-[#a34e5b]':'text-[#7a707b]'}`}><Heart size={14} fill={showSaved?'currentColor':'none'}/>Loved by you</button><button onClick={()=>setMadeFilter(!madeFilter)} data-testid="filter-made-recipes" className={`mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs ${madeFilter?'bg-[#e5efdf] font-semibold text-[#436d4a]':'text-[#7a707b]'}`}><Check size={14}/>Made by you</button></div>
        </div>
        <div className="mt-3 rounded-2xl border border-dashed border-[#d9d1c4] p-4 text-[11px] leading-relaxed text-[#867d86]">Demo recipes use real stock food photography. Save, love, and mark made to shape your personal box.</div>
      </aside>
      <section className="min-w-0 flex-1">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="serif text-2xl text-[#49345f]" data-testid="text-active-category">{category}</h2>
          <label className="flex w-full items-center gap-2 rounded-full border border-[#e4ddd1] bg-[#fffdf8] px-4 py-2.5 sm:max-w-[290px]"><Search size={16} className="text-[#8a818a]"/><input value={query} onChange={e=>setQuery(e.target.value)} data-testid="input-search-recipes" placeholder="Find a recipe…" className="w-full bg-transparent text-sm outline-none placeholder:text-[#a49ba3]"/></label>
        </div>
        {recipes.length?<div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{recipes.map(r=><div key={r.id} className="relative"><RecipeCard recipe={r} compact/><div className="flex flex-wrap gap-1.5 px-3 pt-2">{r.categories.map(cat=><button key={cat} onClick={()=>setCategory(cat)} data-testid={`tag-${r.id}-${cat.replaceAll(' ','-')}`} className="rounded-full bg-[#edf0e8] px-2.5 py-1 text-[10px] font-medium text-[#597250]">{cat}</button>)}</div><button onClick={()=>{const chosen=window.prompt('Add this recipe to which category?',store.categories.map(c=>c.name).join(', '));if(chosen&&store.categories.some(c=>c.name.toLowerCase()===chosen.trim().toLowerCase()))setStore({...store,recipes:store.recipes.map(x=>x.id===r.id?{...x,categories:Array.from(new Set([...x.categories,store.categories.find(c=>c.name.toLowerCase()===chosen.trim().toLowerCase())!.name]))}:x)});}} data-testid={`button-organize-${r.id}`} className="absolute right-3 top-[176px] rounded-full bg-[#fffdf8]/95 px-3 py-1.5 text-[10px] font-semibold text-[#604976] shadow">Organize</button></div>)}</div>
          :<div className="soft-card rounded-[26px] px-6 py-14 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#edf2e7] text-[#5b8055]"><Bookmark size={20}/></span><h3 className="serif mt-4 text-2xl text-[#49345f]">{query?'No recipes found':'This shelf is waiting for its first recipe'}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#7b727d]">{query?'Try another search or clear your filters.':'Save a sample recipe from Home to start collecting your keepers. Your box only shows recipes you have saved.'}</p>{query&&<button onClick={()=>{setQuery('');setCategory('All recipes');}} data-testid="button-clear-search" className="mt-4 rounded-full bg-[#573e76] px-4 py-2 text-xs font-semibold text-white">Clear filters</button>}</div>}
      </section>
    </div>
    {dialog&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#241d2b]/40 p-4" onClick={()=>setDialog(null)}><section role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()} className="w-full max-w-[400px] rounded-[24px] bg-[#fffdf8] p-6 shadow-2xl">{dialog.mode==='delete'?<><h3 className="serif text-2xl text-[#49345f]">Remove this shelf?</h3><p className="mt-2 text-sm leading-relaxed text-[#7b727d]">Recipes will stay in your box, but they’ll no longer have this category.</p><div className="mt-6 flex justify-end gap-2"><button onClick={()=>setDialog(null)} data-testid="button-cancel-delete-category" className="rounded-full border border-[#e1d9cc] px-4 py-2 text-sm">Keep it</button><button onClick={()=>dialog.id&&deleteCategory(dialog.id)} data-testid="button-confirm-delete-category" className="rounded-full bg-[#a54f53] px-4 py-2 text-sm font-semibold text-white">Remove shelf</button></div></>:<><h3 className="serif text-2xl text-[#49345f]">{dialog.mode==='create'?'A new little shelf':'Give this shelf a new name'}</h3><label className="mt-5 block text-xs font-semibold text-[#716778]">Category name<input autoFocus value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submitCategory()} data-testid="input-category-name" className="mt-2 w-full rounded-xl border border-[#ded7cb] bg-[#fbf8f0] px-4 py-3 text-sm outline-none focus:border-[#806993]" placeholder="e.g. Sunday lunch"/></label><div className="mt-5 flex justify-end gap-2"><button onClick={()=>setDialog(null)} data-testid="button-cancel-category" className="rounded-full border border-[#e1d9cc] px-4 py-2 text-sm">Cancel</button><button onClick={submitCategory} data-testid="button-save-category" className="btn-fig rounded-full px-5 py-2 text-sm font-semibold">{dialog.mode==='create'?'Create shelf':'Save name'}</button></div></>}</section></div>}
  </div>;
}
function RecipePage({id}:{id:string}) {
  const {store,setStore}=useStore();
  const recipe=store.recipes.find(r=>r.id===id);
  if(!recipe)return <section className="soft-card rounded-3xl p-10 text-center"><h1 className="serif text-3xl">We can’t find that recipe.</h1><Link href="/recipe-box" className="mt-4 inline-block text-sm font-semibold text-[#573e76]">Back to your Recipe Box</Link></section>;
  return <RecipeDetail recipe={recipe} />;
}
function RecipeDetail({recipe}:{recipe:Recipe}) {
  const {store,setStore}=useStore();
  const [note,setNote]=useState(recipe.notes);
  const id=recipe.id;
  const update=(patch:Partial<Recipe>)=>setStore({...store,recipes:store.recipes.map(r=>r.id===id?{...r,...patch}:r)});
  return <article className="page-enter">
    <Link href="/recipe-box" data-testid="link-back-to-box" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#786e7b]"><ArrowLeft size={15}/>Your Recipe Box</Link>
    <div className="grid gap-8 lg:grid-cols-[1fr_.86fr] lg:gap-12">
      <div><div className="relative overflow-hidden rounded-[30px]"><img src={recipe.image} alt={`${recipe.name} — demonstration recipe`} className="max-h-[620px] min-h-[300px] w-full object-cover"/><span className="absolute left-4 top-4 rounded-full bg-[#fbf8ef]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#573e76]">Demonstration recipe</span></div><p className="mt-3 text-[11px] text-[#928992]">Photography is real stock imagery for this clearly labeled sample recipe.</p></div>
      <div className="lg:pt-4"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#7b946e]">A Fig sample · {recipe.source}</p><h1 className="serif mt-3 text-[clamp(2.8rem,6vw,5rem)] leading-[.99] tracking-[-.045em] text-[#49345f]" data-testid="text-recipe-name">{recipe.name}</h1><p className="mt-5 text-[15px] leading-[1.8] text-[#736a77]">{recipe.description}</p>
        <div className="mt-6 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#eee9e1] px-3 py-2 text-xs font-semibold text-[#695f6d]"><Clock3 size={14}/>{recipe.prepMinutes+recipe.cookMinutes} min total</span><span className="inline-flex items-center gap-1.5 rounded-full bg-[#e9efe3] px-3 py-2 text-xs font-semibold text-[#52704f]"><Users size={14}/>{recipe.servings} servings</span><span className="rounded-full bg-[#eee9e1] px-3 py-2 text-xs text-[#695f6d]">Prep {recipe.prepMinutes}m · Cook {recipe.cookMinutes}m</span></div>
        <div className="mt-6 flex flex-wrap gap-2"><button onClick={()=>update({isSaved:!recipe.isSaved})} data-testid="button-recipe-save" className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${recipe.isSaved?'bg-[#e5efdf] text-[#426d4a]':'btn-fig'}`}><Bookmark size={16} fill={recipe.isSaved?'currentColor':'none'}/>{recipe.isSaved?'In your Recipe Box':'Save to Recipe Box'}</button><button onClick={()=>update({isLoved:!recipe.isLoved})} data-testid="button-recipe-love" className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold ${recipe.isLoved?'border-[#edcccf] bg-[#f7e8e8] text-[#a34e5b]':'border-[#e2dbd0] text-[#746b78]'}`}><Heart size={16} fill={recipe.isLoved?'currentColor':'none'}/>{recipe.isLoved?'Loved':'Love'}</button><button onClick={()=>update({isMade:!recipe.isMade})} data-testid="button-mark-made" className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold ${recipe.isMade?'border-[#cadcc2] bg-[#e7efdf] text-[#426d4a]':'border-[#e2dbd0] text-[#746b78]'}`}><Check size={16}/>{recipe.isMade?'Made':'Mark as made'}</button></div>
        <section className="mt-9 border-t border-[#e5ded2] pt-6"><h2 className="serif text-2xl text-[#49345f]">Ingredients</h2><ul className="mt-4 space-y-3">{recipe.ingredients.map((ingredient,i)=><li key={ingredient} className="flex items-start gap-3 text-sm text-[#655c69]" data-testid={`ingredient-${i}`}><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#84a274]"/>{ingredient}</li>)}</ul></section>
      </div>
    </div>
    <div className="mt-12 grid gap-8 border-t border-[#e5ded2] pt-8 md:grid-cols-[1.1fr_.9fr]">
      <section><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#7b946e]">Put it together</p><h2 className="serif mt-2 text-3xl text-[#49345f]">The method</h2><ol className="mt-5 space-y-5">{recipe.instructions.map((instruction,i)=><li key={instruction} className="flex gap-4" data-testid={`instruction-${i}`}><span className="serif flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ebe5ef] text-lg text-[#604778]">{String(i+1).padStart(2,'0')}</span><p className="pt-1 text-sm leading-[1.8] text-[#655c69]">{instruction}</p></li>)}</ol></section>
      <section className="rounded-[24px] bg-[#e9efe3] p-6 sm:p-7"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4e2cb] text-[#52704f]"><ChefHat size={19}/></span><h2 className="serif mt-4 text-2xl text-[#425c42]">A note for next time</h2><p className="mt-2 text-sm leading-relaxed text-[#697969]">{recipe.notes||'Keep a note about what you would change or who you would cook this for.'}</p><textarea value={note} onChange={e=>setNote(e.target.value)} onBlur={()=>update({notes:note})} data-testid="input-recipe-note" placeholder="Add your own cooking note…" className="mt-4 min-h-[100px] w-full resize-y rounded-2xl border border-[#d3dfcb] bg-[#f5f7f0] p-4 text-sm text-[#526450] outline-none placeholder:text-[#899586] focus:border-[#8ba17f]"/></section>
    </div>
    <section className="mt-9 rounded-[24px] border border-[#e4ddd1] bg-[#fffdf8] p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#7b946e]">Organize this recipe</p><h2 className="serif mt-1 text-2xl text-[#49345f]">Your categories</h2><p className="mt-1 text-xs leading-relaxed text-[#7d747f]">Add it to as many shelves as you like. Tap again to remove; duplicate categories are prevented.</p></div><Link href="/recipe-box" data-testid="link-manage-categories" className="text-xs font-semibold text-[#604a73]">Manage category names <ArrowRight className="ml-1 inline" size={13}/></Link></div>
      {store.categories.length?<div className="mt-4 flex flex-wrap gap-2">{store.categories.map(cat=>{const active=recipe.categories.includes(cat.name);return <button key={cat.id} type="button" aria-pressed={active} onClick={()=>update({categories:active?recipe.categories.filter(name=>name!==cat.name):Array.from(new Set([...recipe.categories,cat.name]))})} data-testid={`toggle-recipe-category-${cat.id}`} className={`rounded-full border px-4 py-2.5 text-xs font-semibold transition ${active?'border-[#b8cba9] bg-[#eaf1e4] text-[#4b7149]':'border-[#e5ded2] bg-[#fbf8f0] text-[#746b77] hover:border-[#b8a8c4]'}`}>{active?'In shelf · ': '+ '}{cat.name}</button>;})}</div>:<p className="mt-4 text-sm text-[#7d747f]">Create a category in your Recipe Box, then return here to organize this recipe.</p>}
    </section>
    <section className="mt-4 rounded-[24px] border border-[#e4ddd1] bg-[#fffdf8] p-6" data-testid="recipe-visibility-setting">
      <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#7b946e]">This recipe · local demo setting</p><h2 className="serif mt-1 text-2xl text-[#49345f]">Private or public?</h2>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#756d78]">This per-recipe label is saved only in this browser. “Public” does not publish or share anything; privacy is not enforced. It is separate from the default preference in settings.</p>
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" aria-pressed={recipe.visibility==='private'} onClick={()=>update({visibility:'private'})} data-testid="button-visibility-private" className={`rounded-full border px-5 py-2.5 text-xs font-semibold ${recipe.visibility==='private'?'border-[#a990bd] bg-[#ebe5ef] text-[#573e76]':'border-[#e5ded2] text-[#746b77]'}`}>Private</button><button type="button" aria-pressed={recipe.visibility==='public'} onClick={()=>update({visibility:'public'})} data-testid="button-visibility-public" className={`rounded-full border px-5 py-2.5 text-xs font-semibold ${recipe.visibility==='public'?'border-[#b8cba9] bg-[#eaf1e4] text-[#4b7149]':'border-[#e5ded2] text-[#746b77]'}`}>Public</button></div>
      <p className="mt-3 text-[11px] font-semibold text-[#706678]">Current local label: {recipe.visibility==='private'?'Private':'Public'} · not enforced and not shared</p>
    </section>
  </article>;
}
function PreviewPage({title,eyebrow,description}:{title:string;eyebrow:string;description:string}) {
  return <div className="page-enter"><div className="relative overflow-hidden rounded-[30px] bg-[#ebe6ee] px-6 py-10 sm:px-12 sm:py-14"><div className="absolute -right-12 -top-16 h-64 w-64 rounded-full border-[38px] border-[#dcd3e3] opacity-70"/><div className="absolute -right-3 top-20 h-40 w-40 rounded-full border border-[#b7a8c4] opacity-60"/><div className="relative max-w-[700px]"><span className="inline-flex items-center gap-2 rounded-full border border-[#d0c5d8] bg-[#f5f0f8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#644e77]"><span className="h-1.5 w-1.5 rounded-full bg-[#94ad7e]"/>{eyebrow} · Upcoming stage</span><h1 className="serif mt-6 text-[clamp(3rem,7vw,5.8rem)] leading-[.96] tracking-[-.05em] text-[#49345f]">{title}</h1><p className="mt-5 max-w-[560px] text-[15px] leading-[1.8] text-[#756a7b]">{description}</p><p className="mt-4 max-w-[550px] text-xs leading-relaxed text-[#857b88]">This is an explicitly labeled preview. There are no live profiles, invitations, inferred preferences, AI, or real social activity behind this screen.</p></div></div>
    <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_.8fr]"><div className="soft-card rounded-[24px] p-6 sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#7c936d]">What Fig is growing into</p><h2 className="serif mt-3 text-3xl text-[#49345f]">{eyebrow==='Discover'?'A good idea, at just the right moment.':'The little things you remember about a meal.'}</h2><p className="mt-3 max-w-xl text-sm leading-[1.8] text-[#7a717d]">{description}</p><div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#f1eee7] p-4"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0ead8] text-[#628157]"><Sparkles size={17}/></span><p className="text-xs leading-relaxed text-[#766d78]">{eyebrow==='Discover'?'Sample content below is for visual exploration only; no live discovery feed exists.':'Taste reflections are a design preview only and are not backed by a model or collected profile.'}</p></div></div>
    <div className="rounded-[24px] bg-[#e7eee1] p-6 sm:p-7"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#61805a]">A note about this stage</p><h3 className="serif mt-3 text-2xl text-[#425a43]">Not quite live, on purpose.</h3><p className="mt-3 text-sm leading-[1.8] text-[#69776a]">Fig is starting with your Recipe Box and a thoughtful way to choose dinner. The social and taste features will come later, when there’s something real to connect.</p><Link href="/recipe-box" data-testid="link-preview-recipe-box" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#52724d] px-4 py-2.5 text-xs font-semibold text-[#f8f5ec]">Explore your recipes <ArrowRight size={14}/></Link></div></div>
    {eyebrow==='Discover'&&<section className="mt-9"><div className="mb-4"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#7b946e]">Sample inspiration · not a live feed</p><h2 className="serif mt-1 text-3xl text-[#49345f]">A few from the Fig kitchen</h2></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{starterRecipes.slice(0,3).map(r=><RecipeCard key={r.id} recipe={r} compact/>)}</div></section>}
  </div>;
}
function NotFound() { return <div className="py-24 text-center"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#7d926d]">A little detour</p><h1 className="serif mt-3 text-5xl text-[#49345f]">This page wandered off.</h1><Link href="/" className="mt-6 inline-flex rounded-full bg-[#573e76] px-5 py-3 text-sm font-semibold text-white">Back to Home</Link></div>; }
function RoutedPages() {
  return <Switch>
    <Route path="/" component={HomePage}/>
    <Route path="/discover" component={()=> <PreviewPage title="Find your next favorite." eyebrow="Discover" description="A considered little world of dishes, ideas, and seasonal inspiration—shaped by the people and flavors you love."/>}/>
    <Route path="/recipe-box" component={RecipeBoxPage}/>
    <Route path="/at-my-table" component={()=> <PreviewPage title="Good things are better shared." eyebrow="At My Table" description="A future home for meals with friends, invitations, and the stories around a shared table."/>}/>
    <Route path="/my-taste" component={()=> <PreviewPage title="A taste that feels like you." eyebrow="My Taste" description="A future reflection on the flavors, textures, and dishes you come back to. This preview does not infer or model your taste."/>}/>
    <Route path="/recipe/:id">{params=><RecipePage id={params.id}/>}</Route>
    <Route component={NotFound}/>
  </Switch>;
}
function App() {
  const [store,setStoreState]=useState<Store>(()=>{try{
    const saved=localStorage.getItem(KEY);
    if(saved){
      const parsed=JSON.parse(saved) as Store;
      const storedRecipes=parsed.recipes||[];
      const merged: Recipe[]=defaultStore.recipes.map(seed=>{
        const previous=storedRecipes.find(recipe=>recipe.id===seed.id);
        return {...seed,...previous,visibility:(previous?.visibility==='private'?'private':'public') as Recipe['visibility']};
      }).concat(storedRecipes.filter(recipe=>!defaultStore.recipes.some(seed=>seed.id===recipe.id)).map(recipe=>({...recipe,visibility:(recipe.visibility==='private'?'private':'public') as Recipe['visibility']})));
      return {...defaultStore,...parsed,recipes:merged};
    }
  }catch{}return defaultStore;});
  const setStore=(next:Store)=>setStoreState(next);
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(store));}catch{}},[store]);
  return <StoreContext.Provider value={{store,setStore}}><WouterRouter><Shell><RoutedPages/></Shell></WouterRouter></StoreContext.Provider>;
}
export default App;
