import { ArrowRight, CheckCircle, Globe, Users, Zap, Eye, ClipboardList, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import PublicLayout from '../../layouts/public/PublicLayout'

const benefits = [
  { icon: Users, title: 'Plus de choix', description: 'Comparez les offres de plusieurs vendeurs professionnels.' },
  { icon: Zap, title: 'Plus de rapidité', description: 'Passez vos commandes depuis votre téléphone sans perdre du temps à rechercher manuellement un fournisseur.' },
  { icon: Eye, title: 'Plus de visibilité pour les vendeurs', description: 'Présentez vos offres à une communauté croissante de professionnels.' },
  { icon: ClipboardList, title: 'Plus de traçabilité', description: 'Retrouvez vos commandes et vos transactions dans votre compte.' },
  { icon: Target, title: 'Une plateforme pensée pour les professionnels', description: 'Cabunets est spécialisée dans les échanges B2B liés aux unités télécoms.' },
]
const steps = ['Comparer les offres', 'Choisir un vendeur', 'Commander', 'Payer', 'Recevoir les unités', 'Suivre la transaction']
const audiences = ['Grossistes', 'Vendeurs', 'Distributeurs', 'Revendeurs', 'Détaillants']
const problems = [
  'Difficulté à trouver rapidement un vendeur disponible.',
  'Manque de visibilité sur les différents prix et offres.',
  'Retards dans le traitement des commandes.',
  'Difficulté pour les vendeurs à développer leur clientèle au-delà de leur réseau habituel.',
  'Manque de suivi et de traçabilité des transactions.',
]

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <header className="bg-primary px-4 py-16 text-white sm:py-20">
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-white/80">Un service de Cabukaka SARLU</p>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">À propos de <span className="text-yellow-300">Cabunets</span></h1>
            <p className="mx-auto max-w-4xl text-xl font-semibold md:text-2xl">La plateforme B2B qui connecte vendeurs et revendeurs d’unités télécoms</p>
            <p className="mx-auto mt-5 max-w-3xl text-lg text-white/90">Comparez les offres, passez vos commandes et développez votre activité depuis une seule plateforme.</p>
          </div>
        </header>
        <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 sm:py-16">
          <section aria-labelledby="about-identity" className="mx-auto max-w-4xl">
            <h2 id="about-identity" className="mb-6 text-3xl font-bold text-gray-900">Qui sommes-nous ?</h2>
            <div className="space-y-4 text-lg leading-relaxed text-gray-700">
              <p>Cabunets est une plateforme numérique B2B conçue pour mettre en relation les vendeurs professionnels, grossistes, distributeurs et revendeurs d’unités télécoms dans un environnement simple, rapide et organisé.</p>
              <p>Notre objectif est de moderniser la distribution des unités télécoms en permettant aux professionnels de comparer les offres, commander, vendre et suivre leurs transactions depuis une seule plateforme.</p>
            </div>
          </section>
          <div className="grid gap-6 lg:grid-cols-2">
            <section aria-labelledby="about-mission" className="rounded-2xl border bg-white p-6 sm:p-8">
              <h2 id="about-mission" className="mb-5 text-2xl font-bold text-primary">Notre mission</h2>
              <div className="space-y-4 leading-relaxed text-gray-700">
                <p>Notre mission est de simplifier, sécuriser et digitaliser les transactions d’unités télécoms entre professionnels.</p>
                <p>Cabunets permet aux revendeurs de trouver plus facilement des vendeurs, de comparer les offres disponibles et de passer leurs commandes sans dépendre uniquement des appels, WhatsApp ou des négociations manuelles.</p>
                <p>Pour les vendeurs, Cabunets constitue un canal numérique permettant de présenter leurs offres et d’atteindre davantage de clients professionnels.</p>
              </div>
            </section>
            <section aria-labelledby="about-vision" className="rounded-2xl border bg-white p-6 sm:p-8">
              <h2 id="about-vision" className="mb-5 text-2xl font-bold text-primary">Notre vision</h2>
              <div className="space-y-4 leading-relaxed text-gray-700">
                <p>Notre ambition est de faire de Cabunets une infrastructure numérique de référence pour la distribution des produits et services télécoms en République Démocratique du Congo, avant d’étendre progressivement le service à d’autres marchés d’Afrique centrale et de l’Est.</p>
                <p>Nous voulons construire un écosystème dans lequel les professionnels du secteur télécom peuvent acheter, vendre, payer et développer leurs activités plus efficacement grâce au numérique.</p>
              </div>
            </section>
          </div>
          <section aria-labelledby="about-problem" className="mx-auto max-w-4xl">
            <h2 id="about-problem" className="mb-6 text-3xl font-bold text-gray-900">Quel problème Cabunets résout-il ?</h2>
            <p className="mb-6 text-lg leading-relaxed text-gray-700">Le marché des unités télécoms repose encore largement sur les appels téléphoniques, WhatsApp, les déplacements physiques et les relations personnelles entre vendeurs et revendeurs.</p>
            <ul className="space-y-3">{problems.map(problem => <li key={problem} className="flex items-start gap-3 text-gray-700"><CheckCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span>{problem}</span></li>)}</ul>
            <p className="mt-6 text-lg leading-relaxed text-gray-700">Cabunets rassemble progressivement ces opérations dans une plateforme unique afin de rendre les échanges plus simples, plus rapides et mieux organisés.</p>
          </section>
          <section aria-labelledby="about-process">
            <h2 id="about-process" className="mb-6 text-center text-3xl font-bold text-gray-900">Comment fonctionne Cabunets ?</h2>
            <p className="mx-auto mb-8 max-w-4xl text-center text-lg leading-relaxed text-gray-700">Un vendeur professionnel peut publier ses offres et ses prix sur Cabunets. Le revendeur peut ensuite consulter les offres, choisir un vendeur, passer sa commande, effectuer le paiement et suivre la transaction jusqu’à la livraison.</p>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{steps.map((step, index) => <li key={step} className="flex items-center gap-4 rounded-xl border bg-white p-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">{index + 1}</span><span className="font-semibold text-gray-900">{step}</span></li>)}</ol>
            <p className="mx-auto mt-6 max-w-4xl text-center leading-relaxed text-gray-600">Cabunets facilite ainsi la rencontre entre l’offre et la demande tout en apportant davantage de visibilité, d’organisation et de confiance aux transactions.</p>
          </section>
          <section aria-labelledby="about-audience" className="rounded-2xl bg-primary/5 p-6 text-center sm:p-10">
            <h2 id="about-audience" className="mb-5 text-3xl font-bold text-gray-900">À qui s’adresse Cabunets ?</h2>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-700">Cabunets est spécialement conçu pour les professionnels qui participent à la chaîne de distribution des services télécoms :</p>
            <ul className="flex flex-wrap justify-center gap-3">{audiences.map(audience => <li key={audience} className="rounded-full border border-primary/20 bg-white px-5 py-3 font-semibold text-primary">{audience}</li>)}</ul>
          </section>
          <section aria-labelledby="about-benefits">
            <h2 id="about-benefits" className="mb-8 text-center text-3xl font-bold text-gray-900">Pourquoi utiliser Cabunets ?</h2>
            <div className="grid gap-6 md:grid-cols-2">{benefits.map(({ icon: Icon, title, description }) => <article key={title} className="rounded-xl border bg-white p-6 sm:p-8"><Icon aria-hidden="true" className="mb-4 h-8 w-8 text-primary" /><h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3><p className="leading-relaxed text-gray-600">{description}</p></article>)}</div>
          </section>
          <section aria-labelledby="about-company" className="rounded-2xl bg-primary p-6 text-white sm:p-10">
            <Globe aria-hidden="true" className="mb-5 h-9 w-9 text-yellow-300" />
            <h2 id="about-company" className="mb-5 text-3xl font-bold">Cabunets, un service de Cabukaka SARLU</h2>
            <p className="max-w-4xl text-lg leading-relaxed text-white/90">Cabunets fait partie des services numériques développés par Cabukaka SARLU. À travers Cabunets, Cabukaka poursuit son ambition de créer des solutions numériques adaptées aux besoins des entreprises, commerçants et professionnels africains.</p>
          </section>
          <section aria-labelledby="about-commitment" className="mx-auto max-w-4xl text-center">
            <h2 id="about-commitment" className="mb-5 text-3xl font-bold text-gray-900">Notre engagement</h2>
            <p className="mb-6 text-lg text-gray-700">Nous voulons construire Cabunets autour de quatre principes :</p>
            <ul className="mb-6 flex flex-wrap justify-center gap-3">{['Simplicité', 'Rapidité', 'Confiance', 'Innovation'].map(value => <li key={value} className="rounded-lg bg-primary/10 px-5 py-3 font-bold text-primary">{value}</li>)}</ul>
            <p className="text-lg leading-relaxed text-gray-700">Notre priorité est de faciliter le travail quotidien des vendeurs et des revendeurs tout en construisant progressivement un écosystème numérique capable de soutenir leur croissance.</p>
          </section>
          <section aria-labelledby="about-join" className="rounded-2xl bg-gray-900 px-6 py-10 text-center text-white sm:p-12">
            <h2 id="about-join" className="mb-5 text-3xl font-bold">Rejoignez Cabunets</h2>
            <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-gray-300">Achetez ou vendez vos unités télécoms plus simplement et développez votre activité grâce à un réseau de professionnels connecté.</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3 font-bold text-white transition hover:bg-primary/90">Créer un compte<ArrowRight aria-hidden="true" className="h-5 w-5" /></Link>
              <Link to="/offres" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/50 px-7 py-3 font-bold transition hover:bg-white/10">Découvrir les offres<ArrowRight aria-hidden="true" className="h-5 w-5" /></Link>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}
