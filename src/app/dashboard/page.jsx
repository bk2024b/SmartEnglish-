import SignOutButton from "../components/SignOutButton";

export default function Dashboard({ user, progress, xp, weekBadge, avatarUrl }) {
    return (
        <main className="min-h-screen bg-gray-800 text-white flex flex-col justify-between relative p-4">
            {/* En-tête */}
            <header className="flex justify-between items-center">
                <div>
                    <p className="text-sm">{user.email}</p>
                    <p className="text-lg font-bold">{progress.completed}/{progress.total} jours</p>
                </div>
                <div className="bg-yellow-400 text-black px-3 py-1 rounded-full font-bold">
                    {xp} XP
                </div>
            </header>

            {/* Contenu : Affichage de l'avatar */}
            <section className="flex justify-center items-center mt-8">
                <img src={avatarUrl} alt="Avatar de l'apprenant" className="w-40 h-40 rounded-full border-4 border-yellow-400" />
            </section>

            {/* Pied de page : Menu de navigation */}
            <footer className="flex justify-around items-center py-4 bg-gray-900 rounded-t-3xl relative">
                <button className="text-center">
                    <span className="block">📋</span>
                    Tâches
                </button>

                <div className="relative">
                    <button className="text-center">
                        <span className="block">🛒</span>
                        Boutique
                    </button>
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs">
                        Semaine {weekBadge}
                    </span>
                </div>

                <button className="text-center">
                    <span className="block">🏆</span>
                    Activités
                </button>
            </footer>

            {/* Bouton de déconnexion */}
            <div className="absolute bottom-4 right-4">
                <SignOutButton />
            </div>
        </main>
    );
}
