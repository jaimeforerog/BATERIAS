import { useState } from 'react';

export default function SamuelPage() {
    // 1. EL SUELO (La memoria de nuestro mundo)
    // Ahora guardamos EMOJIS, no colores. Empezamos con '⬜' (Vacío)
    const [blocks, setBlocks] = useState(Array(100).fill('⬜'));

    // 2. EL PICO (La herramienta seleccionada)
    const [selectedMaterial, setSelectedMaterial] = useState('🌿'); // Empezamos con pasto

    // Materiales de construcción
    const materials = [
        { name: 'Pasto', icon: '🌿' },
        { name: 'Tierra', icon: '🟫' },
        { name: 'Agua', icon: '💧' },
        { name: 'Piedra', icon: '🌑' },
        { name: 'Oro', icon: '🟡' },
        { name: 'Lava', icon: '🌋' },
        { name: 'Slime', icon: '🟢' },
        { name: 'Robot', icon: '🤖' },
        { name: 'Zombie', icon: '🧟' },     // Nuevo: ¡ZOMBIE!
        { name: 'Creeper', icon: '👾' },    // Cambiamos a Alien (se ve más peligroso)
        { name: 'TNT', icon: '🧨' },
        { name: 'Fuego', icon: '🔥' },
        { name: 'Hacha', icon: '🪓' },      // Nuevo: ¡Hacha!
        { name: 'Borrar', icon: '⬜' }
    ];

    const handleBlockClick = (index: number) => {
        const newBlocks = [...blocks];

        // Lógica de EXPLOSIÓN (TNT y Creeper):
        // ¡Los primos se portan igual! Ambos explotan con fuego.
        const esExplosivo = newBlocks[index] === '🧨' || newBlocks[index] === '👾';

        if (selectedMaterial === '🔥' && esExplosivo) {
            alert("¡BOOOOM! (Cuidado con el Creeper) 💥");

            // La explosión deja todo blanco/vacío
            newBlocks[index] = '⬜';     // Centro
            if (index > 0) newBlocks[index - 1] = '⬜'; // Izquierda
            if (index < 99) newBlocks[index + 1] = '⬜'; // Derecha
            if (index >= 10) newBlocks[index - 10] = '⬜'; // Arriba
            if (index < 90) newBlocks[index + 10] = '⬜'; // Abajo

            setBlocks(newBlocks);
            return;
        }

        // Lógica del HACHA:
        // Si usas el Hacha, ¡rompes el bloque! (lo vuelves blanco)
        if (selectedMaterial === '🪓') {
            newBlocks[index] = '⬜';
            setBlocks(newBlocks);
            return;
        }

        // Comportamiento normal: Poner el EMOJI
        newBlocks[index] = selectedMaterial;
        setBlocks(newBlocks);
    };

    const [showDiploma, setShowDiploma] = useState(false);

    if (showDiploma) {
        return (
            <div className="min-h-screen bg-yellow-100 flex flex-col items-center justify-center p-8 border-8 border-double border-yellow-600">
                <div className="bg-white p-12 rounded-xl shadow-2xl text-center max-w-2xl border-4 border-slate-800">
                    <h1 className="text-6xl mb-4">🎓 DIPLOMA 🎓</h1>
                    <p className="text-2xl text-slate-600 mb-8">Certifica que</p>
                    <h2 className="text-5xl font-black text-blue-600 mb-8 font-serif decoration-wavy underline">
                        SAMUEL FORERO
                    </h2>
                    <p className="text-xl text-slate-700 mb-4">
                        Ha completado exitosamente su primera clase de:
                    </p>
                    <h3 className="text-3xl font-bold text-purple-600 mb-8">
                        CREACIÓN DE MUNDOS VIRTUALES 🌍
                    </h3>
                    <div className="flex justify-center gap-4 text-4xl mb-8">
                        <span>🤖</span><span>🧟</span><span>👾</span><span>🧨</span>
                    </div>
                    <p className="text-sm text-slate-500 italic">
                        Firmado: Antigravity (Tu amigo Robot) 🤖
                    </p>
                    <button
                        onClick={() => setShowDiploma(false)}
                        className="mt-8 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-bold"
                    >
                        Volver a jugar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sky-200 flex flex-col items-center p-8">
            <h1 className="text-4xl font-bold mb-4 text-slate-800 bg-white/80 px-8 py-2 rounded-full">
                🌍 Mini-Mindstorm de Samuel 🧊
            </h1>

            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setShowDiploma(true)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-full font-bold shadow-md flex items-center gap-2"
                >
                    🎓 Ver mi Diploma
                </button>
            </div>

            <p className="mb-6 text-slate-700 font-medium bg-white/50 px-4 py-1 rounded">
                Selecciona un material y construye tu mundo
            </p>

            {/* BARRA DE HERRAMIENTAS */}
            <div className="flex gap-4 mb-8 bg-white p-4 rounded-xl shadow-lg flex-wrap justify-center max-w-4xl">
                {materials.map((mat) => (
                    <button
                        key={mat.name}
                        onClick={() => setSelectedMaterial(mat.icon)}
                        className={`
                            flex flex-col items-center gap-2 p-3 rounded-lg transition-all transform hover:scale-110
                            ${selectedMaterial === mat.icon ? 'bg-yellow-100 ring-4 ring-yellow-400' : 'hover:bg-slate-100'}
                        `}
                    >
                        <span className="text-4xl">{mat.icon}</span>
                        <span className="font-bold text-sm text-slate-600">{mat.name}</span>
                    </button>
                ))}
            </div>

            {/* EL MUNDO (La cuadrícula) */}
            <div className="grid grid-cols-10 gap-1 bg-slate-800 p-4 rounded-lg shadow-2xl">
                {blocks.map((icon, index) => (
                    <button
                        key={index}
                        onClick={() => handleBlockClick(index)}
                        className="w-12 h-12 flex items-center justify-center text-3xl bg-white/10 hover:bg-white/30 rounded-sm transition-colors cursor-pointer select-none"
                    >
                        {icon}
                    </button>
                ))}
            </div>

            <div className="mt-8 text-center bg-white/80 p-4 rounded-xl max-w-lg">
                <p className="text-lg font-bold text-slate-800">
                    💡 Lección de hoy: MATRICES (Arrays)
                </p>
                <p className="text-slate-600">
                    Tu mundo no es un solo número, ¡es una <strong>lista</strong> de 100 bloques!
                    La computadora recuerda el color de cada uno de ellos.
                </p>
            </div>
        </div>
    );
}
